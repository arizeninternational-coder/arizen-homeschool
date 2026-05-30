-- SEED ALL 9 CBC GRADES WITH SUBJECTS
-- Run this in Supabase SQL Editor

-- Get or create guild
DO $$
DECLARE
  g_id uuid;
BEGIN
  SELECT id INTO g_id FROM "Guild" WHERE slug = 'arizen-international';
  IF g_id IS NULL THEN
    INSERT INTO "Guild" (name, slug, description)
    VALUES ('Arizen International', 'arizen-international', 'CBC-aligned learning.')
    RETURNING id INTO g_id;
  END IF;

  -- Insert grades 1-9 if they don't exist
  -- We use a themes table entry per grade+subject combination
  
  -- GRADE 1
  INSERT INTO "Theme" (guild_id, "order", title, slug, description, grade, status)
  SELECT g_id, 1, 'Grade 1 Mathematics', 'g1-mathematics', 'Grade 1 Mathematics curriculum', 1, 'DRAFT'
  WHERE NOT EXISTS (SELECT 1 FROM "Theme" WHERE slug = 'g1-mathematics');
  
  INSERT INTO "Theme" (guild_id, "order", title, slug, description, grade, status)
  SELECT g_id, 2, 'Grade 1 English', 'g1-english', 'Grade 1 English curriculum', 1, 'DRAFT'
  WHERE NOT EXISTS (SELECT 1 FROM "Theme" WHERE slug = 'g1-english');
  
  INSERT INTO "Theme" (guild_id, "order", title, slug, description, grade, status)
  SELECT g_id, 3, 'Grade 1 Kiswahili', 'g1-kiswahili', 'Grade 1 Kiswahili curriculum', 1, 'DRAFT'
  WHERE NOT EXISTS (SELECT 1 FROM "Theme" WHERE slug = 'g1-kiswahili');

  INSERT INTO "Theme" (guild_id, "order", title, slug, description, grade, status)
  SELECT g_id, 4, 'Grade 1 Environmental', 'g1-environmental', 'Grade 1 Environmental Activities', 1, 'DRAFT'
  WHERE NOT EXISTS (SELECT 1 FROM "Theme" WHERE slug = 'g1-environmental');

  INSERT INTO "Theme" (guild_id, "order", title, slug, description, grade, status)
  SELECT g_id, 5, 'Grade 1 Movement', 'g1-movement', 'Grade 1 Movement Activities', 1, 'DRAFT'
  WHERE NOT EXISTS (SELECT 1 FROM "Theme" WHERE slug = 'g1-movement');

  INSERT INTO "Theme" (guild_id, "order", title, slug, description, grade, status)
  SELECT g_id, 6, 'Grade 1 Hygiene', 'g1-hygiene', 'Grade 1 Hygiene and Nutrition', 1, 'DRAFT'
  WHERE NOT EXISTS (SELECT 1 FROM "Theme" WHERE slug = 'g1-hygiene');

  -- GRADE 2 (themes may already exist from seed)
  INSERT INTO "Theme" (guild_id, "order", title, slug, description, grade, status)
  SELECT g_id, 10, 'Grade 2 Mathematics', 'g2-mathematics', 'Grade 2 Mathematics curriculum', 2, 'DRAFT'
  WHERE NOT EXISTS (SELECT 1 FROM "Theme" WHERE slug = 'g2-mathematics');

  INSERT INTO "Theme" (guild_id, "order", title, slug, description, grade, status)
  SELECT g_id, 11, 'Grade 2 English', 'g2-english', 'Grade 2 English curriculum', 2, 'DRAFT'
  WHERE NOT EXISTS (SELECT 1 FROM "Theme" WHERE slug = 'g2-english');

  INSERT INTO "Theme" (guild_id, "order", title, slug, description, grade, status)
  SELECT g_id, 12, 'Grade 2 Kiswahili', 'g2-kiswahili', 'Grade 2 Kiswahili curriculum', 2, 'DRAFT'
  WHERE NOT EXISTS (SELECT 1 FROM "Theme" WHERE slug = 'g2-kiswahili');

  -- GRADE 3
  INSERT INTO "Theme" (guild_id, "order", title, slug, description, grade, status)
  SELECT g_id, 20, 'Grade 3 Mathematics', 'g3-mathematics', 'Grade 3 Mathematics curriculum', 3, 'DRAFT'
  WHERE NOT EXISTS (SELECT 1 FROM "Theme" WHERE slug = 'g3-mathematics');

  INSERT INTO "Theme" (guild_id, "order", title, slug, description, grade, status)
  SELECT g_id, 21, 'Grade 3 English', 'g3-english', 'Grade 3 English curriculum', 3, 'DRAFT'
  WHERE NOT EXISTS (SELECT 1 FROM "Theme" WHERE slug = 'g3-english');

  INSERT INTO "Theme" (guild_id, "order", title, slug, description, grade, status)
  SELECT g_id, 22, 'Grade 3 Science', 'g3-science', 'Grade 3 Science curriculum', 3, 'DRAFT'
  WHERE NOT EXISTS (SELECT 1 FROM "Theme" WHERE slug = 'g3-science');

  INSERT INTO "Theme" (guild_id, "order", title, slug, description, grade, status)
  SELECT g_id, 23, 'Grade 3 Social Studies', 'g3-social-studies', 'Grade 3 Social Studies', 3, 'DRAFT'
  WHERE NOT EXISTS (SELECT 1 FROM "Theme" WHERE slug = 'g3-social-studies');

  -- GRADE 4
  INSERT INTO "Theme" (guild_id, "order", title, slug, description, grade, status)
  SELECT g_id, 30, 'Grade 4 Mathematics', 'g4-mathematics', 'Grade 4 Mathematics curriculum', 4, 'DRAFT'
  WHERE NOT EXISTS (SELECT 1 FROM "Theme" WHERE slug = 'g4-mathematics');

  INSERT INTO "Theme" (guild_id, "order", title, slug, description, grade, status)
  SELECT g_id, 31, 'Grade 4 English', 'g4-english', 'Grade 4 English curriculum', 4, 'DRAFT'
  WHERE NOT EXISTS (SELECT 1 FROM "Theme" WHERE slug = 'g4-english');

  INSERT INTO "Theme" (guild_id, "order", title, slug, description, grade, status)
  SELECT g_id, 32, 'Grade 4 Science', 'g4-science', 'Grade 4 Science curriculum', 4, 'DRAFT'
  WHERE NOT EXISTS (SELECT 1 FROM "Theme" WHERE slug = 'g4-science');

  INSERT INTO "Theme" (guild_id, "order", title, slug, description, grade, status)
  SELECT g_id, 33, 'Grade 4 Social Studies', 'g4-social-studies', 'Grade 4 Social Studies', 4, 'DRAFT'
  WHERE NOT EXISTS (SELECT 1 FROM "Theme" WHERE slug = 'g4-social-studies');

  -- GRADE 5 (may already exist)
  INSERT INTO "Theme" (guild_id, "order", title, slug, description, grade, status)
  SELECT g_id, 40, 'Grade 5 Mathematics', 'g5-mathematics', 'Grade 5 Mathematics curriculum', 5, 'DRAFT'
  WHERE NOT EXISTS (SELECT 1 FROM "Theme" WHERE slug = 'g5-mathematics');

  INSERT INTO "Theme" (guild_id, "order", title, slug, description, grade, status)
  SELECT g_id, 41, 'Grade 5 English', 'g5-english', 'Grade 5 English curriculum', 5, 'DRAFT'
  WHERE NOT EXISTS (SELECT 1 FROM "Theme" WHERE slug = 'g5-english');

  INSERT INTO "Theme" (guild_id, "order", title, slug, description, grade, status)
  SELECT g_id, 42, 'Grade 5 Science', 'g5-science', 'Grade 5 Science and Technology', 5, 'DRAFT'
  WHERE NOT EXISTS (SELECT 1 FROM "Theme" WHERE slug = 'g5-science');

  INSERT INTO "Theme" (guild_id, "order", title, slug, description, grade, status)
  SELECT g_id, 43, 'Grade 5 Social Studies', 'g5-social-studies', 'Grade 5 Social Studies', 5, 'DRAFT'
  WHERE NOT EXISTS (SELECT 1 FROM "Theme" WHERE slug = 'g5-social-studies');

  -- GRADE 6
  INSERT INTO "Theme" (guild_id, "order", title, slug, description, grade, status)
  SELECT g_id, 50, 'Grade 6 Mathematics', 'g6-mathematics', 'Grade 6 Mathematics curriculum', 6, 'DRAFT'
  WHERE NOT EXISTS (SELECT 1 FROM "Theme" WHERE slug = 'g6-mathematics');

  INSERT INTO "Theme" (guild_id, "order", title, slug, description, grade, status)
  SELECT g_id, 51, 'Grade 6 English', 'g6-english', 'Grade 6 English curriculum', 6, 'DRAFT'
  WHERE NOT EXISTS (SELECT 1 FROM "Theme" WHERE slug = 'g6-english');

  INSERT INTO "Theme" (guild_id, "order", title, slug, description, grade, status)
  SELECT g_id, 52, 'Grade 6 Science', 'g6-science', 'Grade 6 Science curriculum', 6, 'DRAFT'
  WHERE NOT EXISTS (SELECT 1 FROM "Theme" WHERE slug = 'g6-science');

  INSERT INTO "Theme" (guild_id, "order", title, slug, description, grade, status)
  SELECT g_id, 53, 'Grade 6 Social Studies', 'g6-social-studies', 'Grade 6 Social Studies', 6, 'DRAFT'
  WHERE NOT EXISTS (SELECT 1 FROM "Theme" WHERE slug = 'g6-social-studies');

  -- GRADE 7
  INSERT INTO "Theme" (guild_id, "order", title, slug, description, grade, status)
  SELECT g_id, 60, 'Grade 7 Mathematics', 'g7-mathematics', 'Grade 7 Mathematics curriculum', 7, 'DRAFT'
  WHERE NOT EXISTS (SELECT 1 FROM "Theme" WHERE slug = 'g7-mathematics');

  INSERT INTO "Theme" (guild_id, "order", title, slug, description, grade, status)
  SELECT g_id, 61, 'Grade 7 English', 'g7-english', 'Grade 7 English curriculum', 7, 'DRAFT'
  WHERE NOT EXISTS (SELECT 1 FROM "Theme" WHERE slug = 'g7-english');

  INSERT INTO "Theme" (guild_id, "order", title, slug, description, grade, status)
  SELECT g_id, 62, 'Grade 7 Science', 'g7-science', 'Grade 7 Science curriculum', 7, 'DRAFT'
  WHERE NOT EXISTS (SELECT 1 FROM "Theme" WHERE slug = 'g7-science');

  INSERT INTO "Theme" (guild_id, "order", title, slug, description, grade, status)
  SELECT g_id, 63, 'Grade 7 Social Studies', 'g7-social-studies', 'Grade 7 Social Studies', 7, 'DRAFT'
  WHERE NOT EXISTS (SELECT 1 FROM "Theme" WHERE slug = 'g7-social-studies');

  -- GRADE 8
  INSERT INTO "Theme" (guild_id, "order", title, slug, description, grade, status)
  SELECT g_id, 70, 'Grade 8 Mathematics', 'g8-mathematics', 'Grade 8 Mathematics curriculum', 8, 'DRAFT'
  WHERE NOT EXISTS (SELECT 1 FROM "Theme" WHERE slug = 'g8-mathematics');

  INSERT INTO "Theme" (guild_id, "order", title, slug, description, grade, status)
  SELECT g_id, 71, 'Grade 8 English', 'g8-english', 'Grade 8 English curriculum', 8, 'DRAFT'
  WHERE NOT EXISTS (SELECT 1 FROM "Theme" WHERE slug = 'g8-english');

  INSERT INTO "Theme" (guild_id, "order", title, slug, description, grade, status)
  SELECT g_id, 72, 'Grade 8 Science', 'g8-science', 'Grade 8 Science curriculum', 8, 'DRAFT'
  WHERE NOT EXISTS (SELECT 1 FROM "Theme" WHERE slug = 'g8-science');

  INSERT INTO "Theme" (guild_id, "order", title, slug, description, grade, status)
  SELECT g_id, 73, 'Grade 8 Social Studies', 'g8-social-studies', 'Grade 8 Social Studies', 8, 'DRAFT'
  WHERE NOT EXISTS (SELECT 1 FROM "Theme" WHERE slug = 'g8-social-studies');

  -- GRADE 9
  INSERT INTO "Theme" (guild_id, "order", title, slug, description, grade, status)
  SELECT g_id, 80, 'Grade 9 Mathematics', 'g9-mathematics', 'Grade 9 Mathematics curriculum', 9, 'DRAFT'
  WHERE NOT EXISTS (SELECT 1 FROM "Theme" WHERE slug = 'g9-mathematics');

  INSERT INTO "Theme" (guild_id, "order", title, slug, description, grade, status)
  SELECT g_id, 81, 'Grade 9 English', 'g9-english', 'Grade 9 English curriculum', 9, 'DRAFT'
  WHERE NOT EXISTS (SELECT 1 FROM "Theme" WHERE slug = 'g9-english');

  INSERT INTO "Theme" (guild_id, "order", title, slug, description, grade, status)
  SELECT g_id, 82, 'Grade 9 Science', 'g9-science', 'Grade 9 Science curriculum', 9, 'DRAFT'
  WHERE NOT EXISTS (SELECT 1 FROM "Theme" WHERE slug = 'g9-science');

  INSERT INTO "Theme" (guild_id, "order", title, slug, description, grade, status)
  SELECT g_id, 83, 'Grade 9 Social Studies', 'g9-social-studies', 'Grade 9 Social Studies', 9, 'DRAFT'
  WHERE NOT EXISTS (SELECT 1 FROM "Theme" WHERE slug = 'g9-social-studies');

END $$;
