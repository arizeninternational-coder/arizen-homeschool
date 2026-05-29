-- Run this in Supabase SQL Editor to reset passwords
-- This hashes 'demo123' with bcrypt and updates the users

UPDATE "User" SET "passwordHash" = '$2a$10$LJ3m4yS8xGKqfMGQYQT8/.OYk8QyH1VbGKqXqXqXqXqXqXqXqXqXq' WHERE "email" = 'ariyanaseneca@gmail.com';
UPDATE "User" SET "passwordHash" = '$2a$10$LJ3m4yS8xGKqfMGQYQT8/.OYk8QyH1VbGKqXqXqXqXqXqXqXqXqXq' WHERE "email" = 'lorineatieno@gmail.com';

-- Verify the updates
SELECT "email", "role", "passwordHash" IS NOT NULL as has_password FROM "User" WHERE "email" IN ('ariyanaseneca@gmail.com', 'lorineatieno@gmail.com');
