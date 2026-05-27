-- Create ParentChild table for parent-child user linking
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS "ParentChild" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "parentId" UUID NOT NULL REFERENCES "User"(id),
  "childUserId" UUID NOT NULL REFERENCES "User"(id),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE("parentId", "childUserId")
);

CREATE INDEX IF NOT EXISTS "ParentChild_parentId_idx" ON "ParentChild"("parentId");
CREATE INDEX IF NOT EXISTS "ParentChild_childUserId_idx" ON "ParentChild"("childUserId");
