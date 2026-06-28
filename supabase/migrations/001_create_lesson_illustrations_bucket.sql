-- Supabase Storage Setup for Lesson Illustrations
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql/new
--
-- This creates the lesson-illustrations bucket with:
-- - Public read access (for student-facing lesson rendering)
-- - 5 MB file size limit
-- - Restricted to image file types only

-- Create the bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lesson-illustrations',
  'lesson-illustrations',
  true,
  5242880, -- 5 MB
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Verify the bucket was created
SELECT id, name, public, file_size_limit FROM storage.buckets WHERE id = 'lesson-illustrations';
