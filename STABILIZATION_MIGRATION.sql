-- ============================================================
-- Arizen Stabilization: Messaging + Support + Lesson Envs
-- Run this ENTIRE script in Supabase SQL Editor:
-- https://hgufndnqbvcukbxmwtvo.supabase.co → SQL Editor → New Query
-- Safe to run multiple times (idempotent)
-- ============================================================

-- 1. Support requests table
CREATE TABLE IF NOT EXISTS "support_requests" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID REFERENCES "User"("id") ON DELETE SET NULL,
  "userEmail" VARCHAR(255),
  "userName" VARCHAR(255),
  "category" VARCHAR(50) NOT NULL DEFAULT 'Other',
  "subject" VARCHAR(300) NOT NULL,
  "message" TEXT NOT NULL,
  "status" VARCHAR(20) NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "support_requests_userId_idx" ON "support_requests"("userId");
CREATE INDEX IF NOT EXISTS "support_requests_status_idx" ON "support_requests"("status");
CREATE INDEX IF NOT EXISTS "support_requests_createdAt_idx" ON "support_requests"("createdAt");

-- 2. Add isAvailable toggle to Lesson table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Lesson' AND column_name = 'isAvailable'
  ) THEN
    ALTER TABLE "Lesson" ADD COLUMN "isAvailable" BOOLEAN NOT NULL DEFAULT TRUE;
  END IF;
END $$;

-- 3. Add archivedAt timestamp to Lesson table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Lesson' AND column_name = 'archivedAt'
  ) THEN
    ALTER TABLE "Lesson" ADD COLUMN "archivedAt" TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- 4. Add lastEditedAt timestamp to Lesson table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Lesson' AND column_name = 'lastEditedAt'
  ) THEN
    ALTER TABLE "Lesson" ADD COLUMN "lastEditedAt" TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- 5. Ensure Conversation table exists
CREATE TABLE IF NOT EXISTS "Conversation" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" VARCHAR(200),
  "isGroup" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdBy" UUID REFERENCES "User"("id"),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Ensure ConversationParticipant table exists
CREATE TABLE IF NOT EXISTS "ConversationParticipant" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "conversationId" UUID NOT NULL REFERENCES "Conversation"("id") ON DELETE CASCADE,
  "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "role" VARCHAR(20) NOT NULL DEFAULT 'member',
  "joinedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE("conversationId", "userId")
);

CREATE INDEX IF NOT EXISTS "ConversationParticipant_conversationId_idx" ON "ConversationParticipant"("conversationId");
CREATE INDEX IF NOT EXISTS "ConversationParticipant_userId_idx" ON "ConversationParticipant"("userId");

-- 7. Ensure Message table exists
CREATE TABLE IF NOT EXISTS "Message" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "conversationId" UUID NOT NULL REFERENCES "Conversation"("id") ON DELETE CASCADE,
  "senderId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "body" TEXT NOT NULL,
  "messageType" VARCHAR(20) NOT NULL DEFAULT 'text',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "readAt" TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS "Message_conversationId_idx" ON "Message"("conversationId");
CREATE INDEX IF NOT EXISTS "Message_senderId_idx" ON "Message"("senderId");
CREATE INDEX IF NOT EXISTS "Message_createdAt_idx" ON "Message"("createdAt");

-- ✅ Done! Tables/columns ensured:
--    support_requests (new table)
--    Lesson.isAvailable (new column, defaults TRUE)
--    Lesson.archivedAt (new column)
--    Lesson.lastEditedAt (new column)
--    Conversation (ensured)
--    ConversationParticipant (ensured)
--    Message (ensured)
