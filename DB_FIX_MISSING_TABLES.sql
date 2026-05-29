-- ParentChild table creation (PascalCase quoted identifiers for Supabase)
-- Run this in Supabase SQL Editor if "parent_child" or "ParentChild" table doesn't exist

CREATE TABLE IF NOT EXISTS "ParentChild" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "parentId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "childUserId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT "ParentChild_parentId_childUserId_key" UNIQUE ("parentId", "childUserId")
);

CREATE INDEX IF NOT EXISTS "ParentChild_parentId_idx" ON "ParentChild"("parentId");
CREATE INDEX IF NOT EXISTS "ParentChild_childUserId_idx" ON "ParentChild"("childUserId");

-- Also ensure EmotionalCheckin table exists (may have been missed in earlier migration)
CREATE TABLE IF NOT EXISTS "EmotionalCheckin" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "learnerId" UUID NOT NULL REFERENCES "LearnerProfile"("id") ON DELETE CASCADE,
  "emotion" VARCHAR(20) NOT NULL,
  "emotionLabel" VARCHAR(50) NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "EmotionalCheckin_learnerId_idx" ON "EmotionalCheckin"("learnerId");
CREATE INDEX IF NOT EXISTS "EmotionalCheckin_createdAt_idx" ON "EmotionalCheckin"("createdAt");

-- Homework/Assignment table for parent-assigned work
CREATE TABLE IF NOT EXISTS "Homework" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "parentId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "learnerId" UUID NOT NULL REFERENCES "LearnerProfile"("id") ON DELETE CASCADE,
  "title" VARCHAR(200) NOT NULL,
  "subject" VARCHAR(100),
  "focusArea" VARCHAR(200),
  "instructions" TEXT,
  "linkedLessonId" UUID,
  "dueDate" TIMESTAMP WITH TIME ZONE,
  "completedAt" TIMESTAMP WITH TIME ZONE,
  "status" VARCHAR(20) DEFAULT 'assigned',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "Homework_parentId_idx" ON "Homework"("parentId");
CREATE INDEX IF NOT EXISTS "Homework_learnerId_idx" ON "Homework"("learnerId");
