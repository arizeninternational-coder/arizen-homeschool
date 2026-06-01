-- Check Theme table structure and find the Guild id
SELECT id FROM "Guild" WHERE slug = 'arizen-initative';
SELECT id FROM "Guild";
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'Theme'
ORDER BY ordinal_position;
