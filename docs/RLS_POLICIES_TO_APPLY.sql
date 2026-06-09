-- ============================================================
-- RLS POLICIES — Messaging & Support Tables
-- Run this in Supabase SQL Editor
-- This fixes: "new row violates row level security policy"
-- ============================================================

-- 1. Conversation table
ALTER TABLE "Conversation" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own conversations" ON "Conversation";
CREATE POLICY "Users view own conversations"
  ON "Conversation" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "ConversationParticipant" cp
      WHERE cp."conversationId" = "Conversation".id
        AND cp."userId" = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Authenticated users create conversations" ON "Conversation";
CREATE POLICY "Authenticated users create conversations"
  ON "Conversation" FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Participants update conversations" ON "Conversation";
CREATE POLICY "Participants update conversations"
  ON "Conversation" FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "ConversationParticipant" cp
      WHERE cp."conversationId" = "Conversation".id
        AND cp."userId" = auth.uid()
    )
  );

-- 2. ConversationParticipant table
ALTER TABLE "ConversationParticipant" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view participants in own conversations" ON "ConversationParticipant";
CREATE POLICY "Users view participants in own conversations"
  ON "ConversationParticipant" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "ConversationParticipant" cp2
      WHERE cp2."conversationId" = "ConversationParticipant"."conversationId"
        AND cp2."userId" = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Participants add to conversation" ON "ConversationParticipant";
CREATE POLICY "Participants add to conversation"
  ON "ConversationParticipant" FOR INSERT
  WITH CHECK (
    -- User must already be a participant in this conversation
    EXISTS (
      SELECT 1 FROM "ConversationParticipant" cp
      WHERE cp."conversationId" = "ConversationParticipant"."conversationId"
        AND cp."userId" = auth.uid()
    )
  );

-- 3. Message table
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view messages in own conversations" ON "Message";
CREATE POLICY "Users view messages in own conversations"
  ON "Message" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "ConversationParticipant" cp
      WHERE cp."conversationId" = "Message"."conversationId"
        AND cp."userId" = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Participants send messages" ON "Message";
CREATE POLICY "Participants send messages"
  ON "Message" FOR INSERT
  WITH CHECK (
    "senderId" = auth.uid()
    AND EXISTS (
      SELECT 1 FROM "ConversationParticipant" cp
      WHERE cp."conversationId" = "Message"."conversationId"
        AND cp."userId" = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users update own messages" ON "Message";
CREATE POLICY "Users update own messages"
  ON "Message" FOR UPDATE
  USING ("senderId" = auth.uid());

-- 4. support_requests table
ALTER TABLE "support_requests" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own support requests" ON "support_requests";
CREATE POLICY "Users view own support requests"
  ON "support_requests" FOR SELECT
  USING ("userId" = auth.uid());

DROP POLICY IF EXISTS "Users create support requests" ON "support_requests";
CREATE POLICY "Users create support requests"
  ON "support_requests" FOR INSERT
  WITH CHECK ("userId" = auth.uid());

DROP POLICY IF EXISTS "Users update own support requests" ON "support_requests";
CREATE POLICY "Users update own support requests"
  ON "support_requests" FOR UPDATE
  USING ("userId" = auth.uid());

-- 5. Recommended indexes for performance
CREATE INDEX IF NOT EXISTS "idx_cp_conv_user" ON "ConversationParticipant"("conversationId", "userId");
CREATE INDEX IF NOT EXISTS "idx_msg_conv" ON "Message"("conversationId");
CREATE INDEX IF NOT EXISTS "idx_support_user" ON "support_requests"("userId");
