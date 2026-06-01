-- Test 1: Does Guild table exist and have data?
SELECT * FROM "Guild";

-- Test 2: What columns does Theme actually have?
SELECT column_name FROM information_schema.columns WHERE table_name = 'Theme' ORDER BY ordinal_position;

-- Test 3: Try a simple insert with explicit UUID
INSERT INTO "Theme" (guildId, title, slug, description, grade, status)
VALUES (
  (SELECT id FROM "Guild" LIMIT 1),
  'Test Subject',
  'test-subject',
  'Test',
  1,
  'DRAFT'
) ON CONFLICT (slug) DO NOTHING;
