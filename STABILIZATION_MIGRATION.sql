-- ============================================================
-- Arizen Stabilization: Messaging + Support + Lesson Envs
-- Run this ENTIRE script in Supabase SQL Editor:
-- https://hgufndnqbvcukbxmwtvo.supabase.co → SQL Editor → New Query
-- Safe to run multiple times (idempotent)
-- ============================================================
--
-- IMPORTANT: As of June 8 2026, the following already exist in the DB:
--   - Conversation (table, empty, correct columns)
--   - ConversationParticipant (table, empty, correct columns)
--   - Message (table, empty, correct columns)
--   - support_requests (table, empty, correct columns)
--   - Lesson.isAvailable (column, exists)
--   - Lesson.archivedAt (column, exists)
--   - Lesson.lastEditedAt (column, exist)
--
-- This script uses CREATE TABLE IF NOT EXISTS and DO $$ ... END $$
-- blocks with information_schema checks, so it is SAFE to run again.
-- It will NOT delete, modify, or duplicate any existing data.
--
-- WHAT THIS SCRIPT DOES:
-- 1. Ensures support_requests table exists (with correct schema)
-- 2. Ensures Conversation table exists (with correct schema)
-- 3. Ensures ConversationParticipant table exists (with correct schema + unique constraint)
-- 4. Ensures Message table exists (with correct schema)
-- 5. Adds isAvailable/archivedAt/lastEditedAt columns to Lesson if missing
-- 6. Creates indexes for fast querying
-- ============================================================

-- 1. Support requests table
-- Already exists as of June 8 2026. This is a safety re-ensure.
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

-- 2. Ensure isAvailable, archivedAt, lastEditedAt columns on Lesson
-- All three already exist as of June 8 2026. These are safety re-ensures.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Lesson' AND column_name = 'isAvailable'
  ) THEN
    ALTER TABLE "Lesson" ADD COLUMN "isAvailable" BOOLEAN NOT NULL DEFAULT TRUE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Lesson' AND column_name = 'archivedAt'
  ) THEN
    ALTER TABLE "Lesson" ADD COLUMN "archivedAt" TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Lesson' AND column_name = 'lastEditedAt'
  ) THEN
    ALTER TABLE "Lesson" ADD COLUMN "lastEditedAt" TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- 3. Ensure Conversation table
-- Already exists as of June 8 2026.
CREATE TABLE IF NOT EXISTS "Conversation" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" VARCHAR(200),
  "isGroup" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdBy" UUID REFERENCES "User"("id"),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Ensure ConversationParticipant table
-- Already exists as of June 8 2026.
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

-- 5. Ensure Message table
-- Already exists as of June 8 2026.
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

-- ✅ Done.
-- This script is additive-only. No existing data is modified or deleted.
-- All CREATE TABLE IF NOT EXISTS guards prevent duplicate table creation.
-- All DO $$ IF NOT EXISTS guards prevent duplicate column creation.
-- All CREATE INDEX IF NOT EXISTS guards prevent duplicate index creation.
