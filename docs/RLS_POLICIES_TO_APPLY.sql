-- ============================================================
-- RLS POLICIES — Messaging & Support Tables (FINAL REVISED)
-- Run this in Supabase SQL Editor
-- Fixes: "new row violates row level security policy"
--
-- ARCHITECTURE CONTEXT:
-- Arizen uses NextAuth (custom JWT in cookie), NOT Supabase Auth.
-- supabase.auth.uid() returns NULL for all Arizen users.
-- API routes use the Supabase anon key + extract user ID from JWT.
--
-- STRATEGY:
-- Since auth.uid() is NULL, we use a session variable approach:
-- 1. API calls set_app_user_id(uid) via rpc() before queries
-- 2. This function runs SECURITY DEFINER and sets a session variable
-- 3. RLS policies compare table columns to this session variable
-- 4. is_participant() is SECURITY DEFINER to avoid recursive RLS
--
-- CONVERSATION CREATION FLOW:
-- 1. API extracts user_id from NextAuth JWT
-- 2. API calls set_app_user_id(user_id) via rpc
-- 3. INSERT INTO Conversation (createdBy = user_id)
--    → Policy: createdBy must equal current_setting
-- 4. INSERT INTO ConversationParticipant rows
--    → First participant: allowed if user is conversation creator
--    → Subsequent: allowed if user is already a participant
-- 5. INSERT INTO Message (senderId = user_id)
--    → Policy: senderId must equal current_setting
-- ============================================================

-- ============================================================
-- STEP 1: Add missing columns (idempotent)
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Conversation' AND column_name = 'createdBy'
  ) THEN
    ALTER TABLE "Conversation" ADD COLUMN "createdBy" text;
  END IF;
END$$;

-- ============================================================
-- STEP 2: Helper functions
-- ============================================================

-- Function for API to set the current user ID
-- Call via: supabase.rpc('set_app_user_id', { uid: userId })
CREATE OR REPLACE FUNCTION public.set_app_user_id(uid text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM set_config('app.current_user_id', uid, false);
END;
$$;

-- Get current user ID from session variable
CREATE OR REPLACE FUNCTION public.app_user_id()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT current_setting('app.current_user_id', true);
$$;

-- Check if a user is a participant (SECURITY DEFINER = bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_participant(conv_id text, check_user_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM "ConversationParticipant" cp
    WHERE cp."conversationId" = conv_id
      AND cp."userId" = check_user_id
  );
$$;

-- ============================================================
-- STEP 3: Conversation table RLS
-- ============================================================

ALTER TABLE "Conversation" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own conversations" ON "Conversation";
CREATE POLICY "Users view own conversations"
  ON "Conversation" FOR SELECT
  USING (is_participant("Conversation".id, public.app_user_id()));

DROP POLICY IF EXISTS "Users create conversations" ON "Conversation";
CREATE POLICY "Users create conversations"
  ON "Conversation" FOR INSERT
  WITH CHECK ("createdBy" = public.app_user_id());

DROP POLICY IF EXISTS "Participants update conversations" ON "Conversation";
CREATE POLICY "Participants update conversations"
  ON "Conversation" FOR UPDATE
  USING (is_participant("Conversation".id, public.app_user_id()));

-- ============================================================
-- STEP 4: ConversationParticipant table RLS
-- ============================================================

ALTER TABLE "ConversationParticipant" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view participants" ON "ConversationParticipant";
CREATE POLICY "Users view participants"
  ON "ConversationParticipant" FOR SELECT
  USING (is_participant("ConversationParticipant"."conversationId", public.app_user_id()));

DROP POLICY IF EXISTS "Users add participants" ON "ConversationParticipant";
CREATE POLICY "Users add participants"
  ON "ConversationParticipant" FOR INSERT
  WITH CHECK (
    -- Either: user is already a participant
    is_participant("ConversationParticipant"."conversationId", public.app_user_id())
    OR
    -- Or: user is the conversation creator (allows first participant)
    EXISTS (
      SELECT 1 FROM "Conversation" c
      WHERE c.id = "ConversationParticipant"."conversationId"
        AND c."createdBy" = public.app_user_id()
    )
  );

-- ============================================================
-- STEP 5: Message table RLS
-- ============================================================

ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view messages" ON "Message";
CREATE POLICY "Users view messages"
  ON "Message" FOR SELECT
  USING (is_participant("Message"."conversationId", public.app_user_id()));

DROP POLICY IF EXISTS "Participants send messages" ON "Message";
CREATE POLICY "Participants send messages"
  ON "Message" FOR INSERT
  WITH CHECK (
    "senderId" = public.app_user_id()
    AND is_participant("Message"."conversationId", public.app_user_id())
  );

DROP POLICY IF EXISTS "Users update own messages" ON "Message";
CREATE POLICY "Users update own messages"
  ON "Message" FOR UPDATE
  USING ("senderId" = public.app_user_id());

-- ============================================================
-- STEP 6: support_requests table RLS
-- ============================================================

ALTER TABLE "support_requests" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own support requests" ON "support_requests";
CREATE POLICY "Users view own support requests"
  ON "support_requests" FOR SELECT
  USING ("userId" = public.app_user_id());

DROP POLICY IF EXISTS "Users create support requests" ON "support_requests";
CREATE POLICY "Users create support requests"
  ON "support_requests" FOR INSERT
  WITH CHECK ("userId" = public.app_user_id());

DROP POLICY IF EXISTS "Users update own support requests" ON "support_requests";
CREATE POLICY "Users update own support requests"
  ON "support_requests" FOR UPDATE
  USING ("userId" = public.app_user_id());

-- ============================================================
-- STEP 7: Performance indexes (idempotent)
-- ============================================================

CREATE INDEX IF NOT EXISTS "idx_cp_conv_user" ON "ConversationParticipant"("conversationId", "userId");
CREATE INDEX IF NOT EXISTS "idx_cp_user" ON "ConversationParticipant"("userId");
CREATE INDEX IF NOT EXISTS "idx_msg_conv" ON "Message"("conversationId");
CREATE INDEX IF NOT EXISTS "idx_msg_sender" ON "Message"("senderId");
CREATE INDEX IF NOT EXISTS "idx_support_user" ON "support_requests"("userId");
CREATE INDEX IF NOT EXISTS "idx_conv_created_by" ON "Conversation"("createdBy");

-- ============================================================
-- STEP 8: Grant execute on functions to anon role
-- ============================================================

GRANT EXECUTE ON FUNCTION public.set_app_user_id(text) TO anon;
GRANT EXECUTE ON FUNCTION public.app_user_id() TO anon;
GRANT EXECUTE ON FUNCTION public.is_participant(text, text) TO anon;
