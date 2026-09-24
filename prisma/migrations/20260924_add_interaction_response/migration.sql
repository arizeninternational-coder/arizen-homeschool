-- Migration: add_interaction_response
-- Created: 2026-09-24
-- Purpose: Persist learner interaction responses for Review Mode
-- Safe to re-run multiple times

-- 1. Create table if not exists
CREATE TABLE IF NOT EXISTS "InteractionResponse" (
    id TEXT NOT NULL DEFAULT gen_random_uuid(),
    "learnerId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "conceptId" TEXT,
    "selectedAnswer" TEXT NOT NULL,
    "expectedAnswer" TEXT NOT NULL,
    correct BOOLEAN NOT NULL DEFAULT false,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InteractionResponse_pkey" PRIMARY KEY (id)
);

-- 2. Unique constraint (safe re-run with DO block)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'InteractionResponse_unique'
    ) THEN
        ALTER TABLE "InteractionResponse"
            ADD CONSTRAINT "InteractionResponse_unique" UNIQUE ("learnerId", "lessonId", "activityId");
    END IF;
END$$;

-- 3. Indexes (IF NOT EXISTS is safe)
CREATE INDEX IF NOT EXISTS "InteractionResponse_learnerId_idx" ON "InteractionResponse"("learnerId");
CREATE INDEX IF NOT EXISTS "InteractionResponse_lessonId_idx" ON "InteractionResponse"("lessonId");
CREATE INDEX IF NOT EXISTS "InteractionResponse_learnerId_lessonId_idx" ON "InteractionResponse"("learnerId", "lessonId");

-- 4. Foreign key to LearnerProfile (safe re-run)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'InteractionResponse_learnerId_fkey'
    ) THEN
        ALTER TABLE "InteractionResponse"
            ADD CONSTRAINT "InteractionResponse_learnerId_fkey"
            FOREIGN KEY ("learnerId") REFERENCES "LearnerProfile"(id) ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END$$;

-- 5. Foreign key to Lesson (safe re-run)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'InteractionResponse_lessonId_fkey'
    ) THEN
        ALTER TABLE "InteractionResponse"
            ADD CONSTRAINT "InteractionResponse_lessonId_fkey"
            FOREIGN KEY ("lessonId") REFERENCES "Lesson"(id) ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END$$;
