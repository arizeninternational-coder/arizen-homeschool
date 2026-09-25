-- Migration: 20260925_add_remediation_evidence_fields
-- Add misconceptionId, attemptNumber, remediationShown to InteractionResponse
-- Change unique constraint to include attemptNumber so multiple attempts are preserved

-- Add new columns (safe if they already exist from the Prisma model)
ALTER TABLE "InteractionResponse"
  ADD COLUMN IF NOT EXISTS "misconceptionId" TEXT,
  ADD COLUMN IF NOT EXISTS "attemptNumber" INTEGER,
  ADD COLUMN IF NOT EXISTS "remediationShown" TEXT;

-- Migrate existing rows: set attemptNumber = 1 for rows without it
UPDATE "InteractionResponse"
  SET "attemptNumber" = 1
  WHERE "attemptNumber" IS NULL;

-- Drop the old unique constraint that prevented storing retry attempts
ALTER TABLE "InteractionResponse"
  DROP CONSTRAINT IF EXISTS "InteractionResponse_unique";

-- New unique constraint includes attemptNumber so each attempt is preserved
ALTER TABLE "InteractionResponse"
  ADD CONSTRAINT "InteractionResponse_unique"
  UNIQUE ("learnerId", "lessonId", "activityId", "attemptNumber");

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS "InteractionResponse_misconceptionId_idx"
  ON "InteractionResponse"("misconceptionId");
CREATE INDEX IF NOT EXISTS "InteractionResponse_attemptNumber_idx"
  ON "InteractionResponse"("attemptNumber");
