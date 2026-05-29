-- ============================================================
-- MISSING TABLE: ParentChild (parent-student linking)
-- Run this in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS "ParentChild" (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "parentId"      UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "childUserId"   UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE("parentId", "childUserId")
);

CREATE INDEX IF NOT EXISTS idx_parent_child_parent ON "ParentChild"("parentId");
CREATE INDEX IF NOT EXISTS idx_parent_child_child ON "ParentChild"("childUserId");
