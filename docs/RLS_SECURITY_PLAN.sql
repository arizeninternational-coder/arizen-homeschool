-- ============================================================
-- Arizen Homeschool — Row-Level Security (RLS) Policy Plan
-- ============================================================
-- Status: PLAN ONLY — Do NOT apply without explicit approval
-- Date: June 2026
-- Author: OWL (stabilization session)
--
-- Tables covered:
--   1. Conversation
--   2. ConversationParticipant
--   3. Message
--   4. support_requests
--
-- Principles:
--   - Users see only data they participate in or own
--   - Parents ↔ Children only (no cross-family access)
--   - Admins see all (for support/moderation)
--   - All policies use EXISTS subqueries (performant on Supabase)
-- ============================================================

-- ============================================================
-- 1. Conversation
-- ============================================================
-- Users should only see conversations they participate in.

ALTER TABLE "Conversation" ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view conversations they participate in
CREATE POLICY "Users view own conversations"
  ON "Conversation" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "ConversationParticipant" cp
      WHERE cp."conversationId" = "Conversation".id
        AND cp."userId" = auth.uid()
    )
    OR
    -- Admins can view all conversations
    EXISTS (
      SELECT 1 FROM "User" u
      WHERE u.id = auth.uid()
        AND u.role IN ('ADMIN', 'TEACHER')
    )
  );

-- Policy: Only authenticated users can create conversations
CREATE POLICY "Authenticated users create conversations"
  ON "Conversation" FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: Only conversation participants can update
CREATE POLICY "Participants update conversations"
  ON "Conversation" FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "ConversationParticipant" cp
      WHERE cp."conversationId" = "Conversation".id
        AND cp."userId" = auth.uid()
    )
  );


-- ============================================================
-- 2. ConversationParticipant
-- ============================================================
-- Users should only see participants in conversations they're in.
-- This prevents enumerating other users' conversations.

ALTER TABLE "ConversationParticipant" ENABLE ROW LEVEL SECURITY;

-- Policy: Users see participants in their conversations
CREATE POLICY "Users view participants in own conversations"
  ON "ConversationParticipant" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "ConversationParticipant" cp2
      WHERE cp2."conversationId" = "ConversationParticipant"."conversationId"
        AND cp2."userId" = auth.uid()
    )
  );

-- Policy: Users can add participants to conversations they're in
CREATE POLICY "Participants add to conversation"
  ON "ConversationParticipant" FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "ConversationParticipant" cp
      WHERE cp."conversationId" = "ConversationParticipant"."conversationId"
        AND cp."userId" = auth.uid()
    )
    -- Additional guard: parent can only add linked child
    OR
    (
      -- If the user is a parent, verify the participant is their linked child
      EXISTS (
        SELECT 1 FROM "ParentChild" pc
        WHERE pc."parentId" = auth.uid()
          AND pc."childUserId" = "ConversationParticipant"."userId"
      )
    )
    -- If the user is a learner, verify the participant is their linked parent
    OR
    (
      EXISTS (
        SELECT 1 FROM "ParentChild" pc
        WHERE pc."childUserId" = auth.uid()
          AND pc."parentId" = "ConversationParticipant"."userId"
      )
    )
  );


-- ============================================================
-- 3. Message
-- ============================================================
-- Users should only see messages in conversations they participate in.

ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;

-- Policy: Users view messages in their conversations
CREATE POLICY "Users view messages in own conversations"
  ON "Message" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "ConversationParticipant" cp
      WHERE cp."conversationId" = "Message"."conversationId"
        AND cp."userId" = auth.uid()
    )
    OR
    -- Admins can view all messages (for moderation)
    EXISTS (
      SELECT 1 FROM "User" u
      WHERE u.id = auth.uid()
        AND u.role IN ('ADMIN', 'TEACHER')
    )
  );

-- Policy: Users can send messages to conversations they're in
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

-- Policy: Users can only update their own messages (e.g., read receipt)
CREATE POLICY "Users update own messages"
  ON "Message" FOR UPDATE
  USING ("senderId" = auth.uid());


-- ============================================================
-- 4. support_requests
-- ============================================================
-- Support requests visible to creator and admins only.

ALTER TABLE "support_requests" ENABLE ROW LEVEL SECURITY;

-- Policy: Users view their own support requests
CREATE POLICY "Users view own support requests"
  ON "support_requests" FOR SELECT
  USING (
    "userId" = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM "User" u
      WHERE u.id = auth.uid()
        AND u.role IN ('ADMIN', 'TEACHER')
    )
  );

-- Policy: Users can create their own support requests
CREATE POLICY "Users create support requests"
  ON "support_requests" FOR INSERT
  WITH CHECK ("userId" = auth.uid());

-- Policy: Users can update their own requests (e.g., add info)
CREATE POLICY "Users update own support requests"
  ON "support_requests" FOR UPDATE
  USING ("userId" = auth.uid());

-- Policy: Admins can update any request (e.g., change status)
CREATE POLICY "Admins update any support request"
  ON "support_requests" FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "User" u
      WHERE u.id = auth.uid()
        AND u.role IN ('ADMIN', 'TEACHER')
    )
  );


-- ============================================================
-- NOTES
-- ============================================================
-- 1. auth.uid() is Supabase's built-in function that returns the
--    authenticated user's ID from the JWT token.
--
-- 2. These policies assume the tables exist with the columns
--    referenced above. If column names differ, adjust accordingly.
--
-- 3. Performance: EXISTS subqueries are generally efficient because
--    they short-circuit on first match. Ensure indexes exist on:
--    - ConversationParticipant(conversationId, userId)
--    - Message(conversationId)
--    - support_requests(userId)
--    - ParentChild(parentId, childUserId)
--
-- 4. To apply: Run this SQL in Supabase SQL Editor or via migration.
--    Test with: SET ROLE authenticated; SELECT ... FROM each_table;
--
-- 5. If RLS is already enabled, drop existing policies first:
--    DROP POLICY IF EXISTS "policy_name" ON table_name;
--
-- 6. Recommended additional indexes:
--    CREATE INDEX IF NOT EXISTS "idx_cp_conv_user" ON "ConversationParticipant"("conversationId", "userId");
--    CREATE INDEX IF NOT EXISTS "idx_msg_conv" ON "Message"("conversationId");
--    CREATE INDEX IF NOT EXISTS "idx_support_user" ON "support_requests"("userId");
--    CREATE INDEX IF NOT EXISTS "idx_pc_parent" ON "ParentChild"("parentId");
--    CREATE INDEX IF NOT EXISTS "idx_pc_child" ON "ParentChild"("childUserId");
