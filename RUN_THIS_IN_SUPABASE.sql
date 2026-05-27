-- =============================================
-- Arizen School — Parent-Child Linking Table
-- Run this in Supabase SQL Editor:
-- https://hgufndnqbvcukbxmwtvo.supabase.co → SQL Editor
-- =============================================

-- Add the ParentChild join table
CREATE TABLE IF NOT EXISTS "ParentChild" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "parentId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "childUserId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE("parentId", "childUserId")
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS "ParentChild_parentId_idx" ON "ParentChild"("parentId");
CREATE INDEX IF NOT EXISTS "ParentChild_childUserId_idx" ON "ParentChild"("childUserId");
