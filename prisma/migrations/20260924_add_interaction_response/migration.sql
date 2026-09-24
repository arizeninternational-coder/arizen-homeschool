-- Migration: add_interaction_response
-- Created: 2026-09-24
-- Purpose: Persist learner interaction responses for Review Mode

CREATE TABLE IF NOT EXISTS "InteractionResponse" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "learnerId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "conceptId" TEXT,
    "selectedAnswer" TEXT NOT NULL,
    "expectedAnswer" TEXT NOT NULL,
    "correct" BOOLEAN NOT NULL DEFAULT false,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InteractionResponse_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "InteractionResponse_learnerId_idx" ON "InteractionResponse"("learnerId");
CREATE INDEX IF NOT EXISTS "InteractionResponse_lessonId_idx" ON "InteractionResponse"("lessonId");
CREATE INDEX IF NOT EXISTS "InteractionResponse_learnerId_lessonId_idx" ON "InteractionResponse"("learnerId", "lessonId");

ALTER TABLE "InteractionResponse" ADD CONSTRAINT "InteractionResponse_learnerId_fkey" 
    FOREIGN KEY ("learnerId") REFERENCES "LearnerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InteractionResponse" ADD CONSTRAINT "InteractionResponse_lessonId_fkey" 
    FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
