-- CHECK THEME TABLE SCHEMA
-- Run this in Supabase SQL Editor to see actual column names

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'Theme'
ORDER BY ordinal_position;
