-- =============================================================
-- Arizen Homeschool — Curriculum Seed Script
-- Run this ENTIRE script in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/hgufndnqbvcukbxmwtvo/sql
-- =============================================================
-- 
-- This creates the full curriculum hierarchy:
--   Grade → Subject → Strand → SubStrand → Theme → Quest → Lesson
--
-- All content is DRAFT status. Safe to run multiple times.
-- =============================================================

-- Ensure guild exists
INSERT INTO "Guild" (id, name, slug, description)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Arizen International',
  'arizen-international',
  'Arizen Homeschool Hub — CBC-aligned, gamified learning.'
)
ON CONFLICT (slug) DO NOTHING;

-- =============================================================
-- GRADE 2 SUBJECTS
-- =============================================================

INSERT INTO "Subject" (name, slug, grade) VALUES
  ('Mathematical Activities', 'g2-mathematical-activities', 2),
  ('English Language Activities', 'g2-english-activities', 2),
  ('Kiswahili Language Activities', 'g2-kiswahili-activities', 2),
  ('Environmental Activities', 'g2-environmental-activities', 2),
  ('Hygiene and Nutrition Activities', 'g2-hygiene-nutrition', 2),
  ('Movement Activities', 'g2-movement-activities', 2)
ON CONFLICT (slug) DO NOTHING;

-- =============================================================
-- GRADE 5 SUBJECTS
-- =============================================================

INSERT INTO "Subject" (name, slug, grade) VALUES
  ('Mathematics', 'g5-mathematics', 5),
  ('English', 'g5-english', 5),
  ('Kiswahili', 'g5-kiswahili', 5),
  ('Science and Technology', 'g5-science-technology', 5),
  ('Agriculture and Nutrition', 'g5-agriculture-nutrition', 5),
  ('Social Studies', 'g5-social-studies', 5),
  ('Creative Arts', 'g5-creative-arts', 5)
ON CONFLICT (slug) DO NOTHING;

-- =============================================================
-- GRADE 2: Mathematical Activities — Numbers strands
-- =============================================================

INSERT INTO "SubStrand" (name, slug, "strandName") VALUES
  ('Number Concept', 'g2-math-num-concept', 'Numbers'),
  ('Place Value', 'g2-math-num-place-value', 'Numbers'),
  ('Reading and Writing Numbers', 'g2-math-num-reading-writing', 'Numbers'),
  ('Number Patterns', 'g2-math-num-patterns', 'Numbers'),
  ('Addition', 'g2-math-num-addition', 'Numbers'),
  ('Subtraction', 'g2-math-num-subtraction', 'Numbers'),
  ('Multiplication', 'g2-math-num-multiplication', 'Numbers'),
  ('Fractions', 'g2-math-num-fractions', 'Numbers'),
  ('Length', 'g2-math-meas-length', 'Measurement'),
  ('Mass', 'g2-math-meas-mass', 'Measurement'),
  ('Capacity', 'g2-math-meas-capacity', 'Measurement'),
  ('Time', 'g2-math-meas-time', 'Measurement'),
  ('Money', 'g2-math-meas-money', 'Measurement'),
  ('Shapes', 'g2-math-geo-shapes', 'Geometry')
ON CONFLICT (slug) DO NOTHING;

-- =============================================================
-- GRADE 2: English Language Activities
-- =============================================================

INSERT INTO "SubStrand" (name, slug, "strandName") VALUES
  ('Pronunciation', 'g2-eng-ls-pronunciation', 'Listening and Speaking'),
  ('Listening Comprehension', 'g2-eng-ls-comprehension', 'Listening and Speaking'),
  ('Polite Language', 'g2-eng-ls-polite', 'Listening and Speaking'),
  ('Phonics', 'g2-eng-read-phonics', 'Reading'),
  ('Sight Words', 'g2-eng-read-sight-words', 'Reading'),
  ('Fluency', 'g2-eng-read-fluency', 'Reading'),
  ('Comprehension', 'g2-eng-read-comprehension', 'Reading'),
  ('Nouns', 'g2-eng-grammar-nouns', 'Language Structures and Grammar'),
  ('Pronouns and Tense', 'g2-eng-grammar-pronouns', 'Language Structures and Grammar'),
  ('Handwriting', 'g2-eng-write-handwriting', 'Writing'),
  ('Guided Writing', 'g2-eng-write-guided', 'Writing')
ON CONFLICT (slug) DO NOTHING;

-- =============================================================
-- GRADE 2: Kiswahili Language Activities
-- =============================================================

INSERT INTO "SubStrand" (name, slug, "strandName") VALUES
  ('Matamshi', 'g2-kis-ls-matamshi', 'Kusikiliza na Kuzungumza'),
  ('Maamkizi na Adabu', 'g2-kis-ls-adabu', 'Kusikiliza na Kuzungumza'),
  ('Kusoma Silabi na Maneno', 'g2-kis-read-silabi', 'Kusoma'),
  ('Ufahamu', 'g2-kis-read-ufahamu', 'Kusoma'),
  ('Ngeli', 'g2-kis-grammar-ngeli', 'Sarufi'),
  ('Viashiria na Vishirikishi', 'g2-kis-grammar-viashiria', 'Sarufi'),
  ('Wakati', 'g2-kis-grammar-wakati', 'Sarufi'),
  ('Kinyume na Herufi', 'g2-kis-grammar-kinyume', 'Sarufi'),
  ('Mwandiko', 'g2-kis-write-mwandiko', 'Kuandika'),
  ('Insha', 'g2-kis-write-insha', 'Kuandika')
ON CONFLICT (slug) DO NOTHING;

-- =============================================================
-- GRADE 2: Environmental Activities
-- =============================================================

INSERT INTO "SubStrand" (name, slug, "strandName") VALUES
  ('Weather Conditions', 'g2-env-weather-conditions', 'Weather and the Environment'),
  ('Weather Symbols', 'g2-env-weather-symbols', 'Weather and the Environment'),
  ('Effects of Weather', 'g2-env-weather-effects', 'Weather and the Environment'),
  ('Physical Features', 'g2-env-natural-features', 'Natural Environment and Physical Features'),
  ('Plants', 'g2-env-natural-plants', 'Natural Environment and Physical Features'),
  ('Animals', 'g2-env-natural-animals', 'Natural Environment and Physical Features'),
  ('School Community', 'g2-env-social-school', 'Social Environment and Resources'),
  ('Local Market', 'g2-env-social-market', 'Social Environment and Resources'),
  ('National Flag', 'g2-env-social-flag', 'Social Environment and Resources'),
  ('Child Rights', 'g2-env-social-rights', 'Social Environment and Resources')
ON CONFLICT (slug) DO NOTHING;

-- =============================================================
-- GRADE 2: Hygiene and Nutrition Activities
-- =============================================================

INSERT INTO "SubStrand" (name, slug, "strandName") VALUES
  ('Care of Body Parts', 'g2-hyg-health-body', 'Health Practices and Personal Hygiene'),
  ('Personal Items', 'g2-hyg-health-items', 'Health Practices and Personal Hygiene'),
  ('Cleaning', 'g2-hyg-health-cleaning', 'Health Practices and Personal Hygiene'),
  ('Daily Meals', 'g2-hyg-food-meals', 'Food and Nutrition'),
  ('Good Eating Habits', 'g2-hyg-food-habits', 'Food and Nutrition'),
  ('Food Safety', 'g2-hyg-food-safety', 'Food and Nutrition'),
  ('Common Illnesses', 'g2-hyg-med-illnesses', 'Medicine Safety and Common Illnesses'),
  ('Safe Use of Medicine', 'g2-hyg-med-safety', 'Medicine Safety and Common Illnesses')
ON CONFLICT (slug) DO NOTHING;

-- =============================================================
-- GRADE 2: Movement Activities
-- =============================================================

INSERT INTO "SubStrand" (name, slug, "strandName") VALUES
  ('Locomotor Movements', 'g2-mov-locomotor-movements', 'Locomotor and Non-Locomotor Skills'),
  ('Non-Locomotor Movements', 'g2-mov-non-locomotor', 'Locomotor and Non-Locomotor Skills'),
  ('Handling Objects', 'g2-mov-ball-handling', 'Ball Properties and Games'),
  ('Chasing Games', 'g2-mov-ball-chasing', 'Ball Properties and Games'),
  ('Simple Gymnastics', 'g2-mov-rhythmic-gymnastics', 'Rhythmic Movements and Gymnastics'),
  ('Rhythmic Movements', 'g2-mov-rhythmic-movements', 'Rhythmic Movements and Gymnastics')
ON CONFLICT (slug) DO NOTHING;

-- =============================================================
-- GRADE 5: Mathematics
-- =============================================================

INSERT INTO "SubStrand" (name, slug, "strandName") VALUES
  ('Whole Numbers', 'g5-math-num-whole', 'Numbers'),
  ('Divisibility Tests', 'g5-math-num-divisibility', 'Numbers'),
  ('Factors and Multiples', 'g5-math-num-factors', 'Numbers'),
  ('Fractions', 'g5-math-num-fractions', 'Numbers'),
  ('Decimals', 'g5-math-num-decimals', 'Numbers'),
  ('Percentages', 'g5-math-num-percentages', 'Numbers'),
  ('Length', 'g5-math-meas-length', 'Measurement'),
  ('Area', 'g5-math-meas-area', 'Measurement'),
  ('Volume and Capacity', 'g5-math-meas-volume', 'Measurement'),
  ('Mass', 'g5-math-meas-mass', 'Measurement'),
  ('Time', 'g5-math-meas-time', 'Measurement'),
  ('Money', 'g5-math-meas-money', 'Measurement'),
  ('Angles', 'g5-math-geo-angles', 'Geometry and Algebra'),
  ('Algebraic Expressions', 'g5-math-geo-algebra', 'Geometry and Algebra')
ON CONFLICT (slug) DO NOTHING;

-- =============================================================
-- GRADE 5: English
-- =============================================================

INSERT INTO "SubStrand" (name, slug, "strandName") VALUES
  ('Active Listening', 'g5-eng-ls-active', 'Listening and Speaking'),
  ('Intensive Reading', 'g5-eng-read-intensive', 'Reading'),
  ('Extensive Reading', 'g5-eng-read-extensive', 'Reading'),
  ('Nouns and Pronouns', 'g5-eng-grammar-nouns', 'Language Structures and Grammar'),
  ('Tenses and Adverbs', 'g5-eng-grammar-tenses', 'Language Structures and Grammar'),
  ('Functional Writing', 'g5-eng-write-functional', 'Writing'),
  ('Creative Composition', 'g5-eng-write-creative', 'Writing')
ON CONFLICT (slug) DO NOTHING;

-- =============================================================
-- GRADE 5: Kiswahili
-- =============================================================

INSERT INTO "SubStrand" (name, slug, "strandName") VALUES
  ('Kusikiliza kwa Makini', 'g5-kis-ls-active', 'Kusikiliza na Kuzungumza'),
  ('Methali na Vitendawili', 'g5-kis-ls-methali', 'Kusikiliza na Kuzungumza'),
  ('Kusoma kwa Sauti na Ufasaha', 'g5-kis-read-sauti', 'Kusoma'),
  ('Kusoma kwa Kina', 'g5-kis-read-kina', 'Kusoma'),
  ('Ngeli', 'g5-kis-grammar-ngeli', 'Sarufi'),
  ('Viwakilishi na Viunganishi', 'g5-kis-grammar-viwakilishi', 'Sarufi'),
  ('Wakati na Hali', 'g5-kis-grammar-wakati', 'Sarufi'),
  ('Herufi na Alama', 'g5-kis-grammar-herufi', 'Sarufi'),
  ('Kuandika Barua na Tawasifu', 'g5-kis-write-barua', 'Kuandika'),
  ('Insha', 'g5-kis-write-insha', 'Kuandika')
ON CONFLICT (slug) DO NOTHING;

-- =============================================================
-- GRADE 5: Science and Technology
-- =============================================================

INSERT INTO "SubStrand" (name, slug, "strandName") VALUES
  ('Plants', 'g5-sci-living-plants', 'Living Things'),
  ('Fungi', 'g5-sci-living-fungi', 'Living Things'),
  ('Animals', 'g5-sci-living-animals', 'Living Things'),
  ('Human Body Systems', 'g5-sci-living-body', 'Living Things'),
  ('Pollution', 'g5-sci-env-pollution', 'Environment'),
  ('Waste Management', 'g5-sci-env-waste', 'Environment'),
  ('Properties of Matter', 'g5-sci-matter-properties', 'Matter and Force'),
  ('Force and Energy', 'g5-sci-matter-force', 'Matter and Force'),
  ('Computer Basics', 'g5-sci-digital-computer', 'Digital Technology')
ON CONFLICT (slug) DO NOTHING;

-- =============================================================
-- GRADE 5: Agriculture and Nutrition
-- =============================================================

INSERT INTO "SubStrand" (name, slug, "strandName") VALUES
  ('Soil Conservation', 'g5-agri-cons-soil', 'Conservation of Resources'),
  ('Soil Improvement', 'g5-agri-cons-improvement', 'Conservation of Resources'),
  ('Water Conservation', 'g5-agri-cons-water', 'Conservation of Resources'),
  ('Growing Crops', 'g5-agri-prod-crops', 'Food Production Processes'),
  ('Domestic Animals', 'g5-agri-prod-animals', 'Food Production Processes'),
  ('Preservation', 'g5-agri-prod-preservation', 'Food Production Processes'),
  ('Food Nutrients', 'g5-agri-hygiene-nutrients', 'Hygiene and Food Preparation'),
  ('Cooking Techniques', 'g5-agri-hygiene-cooking', 'Hygiene and Food Preparation')
ON CONFLICT (slug) DO NOTHING;

-- =============================================================
-- GRADE 5: Social Studies
-- =============================================================

INSERT INTO "SubStrand" (name, slug, "strandName") VALUES
  ('Maps', 'g5-soc-phys-maps', 'Physical Environment'),
  ('Position and Size of Kenya', 'g5-soc-phys-position', 'Physical Environment'),
  ('Physical Features', 'g5-soc-phys-features', 'Physical Environment'),
  ('Weather and Climate', 'g5-soc-phys-weather', 'Physical Environment'),
  ('Language Groups', 'g5-soc-cult-language', 'People and Culture'),
  ('Traditional Education', 'g5-soc-cult-traditional', 'People and Culture'),
  ('School Administration', 'g5-soc-gov-school', 'Governance and Citizenship'),
  ('Built Environments', 'g5-soc-gov-built', 'Governance and Citizenship')
ON CONFLICT (slug) DO NOTHING;

-- =============================================================
-- GRADE 5: Creative Arts
-- =============================================================

INSERT INTO "SubStrand" (name, slug, "strandName") VALUES
  ('Visual Arts', 'g5-art-create-visual', 'Creating and Execution'),
  ('Music Composition', 'g5-art-create-music', 'Creating and Execution'),
  ('Physical Sports Performance', 'g5-art-create-sports', 'Creating and Execution'),
  ('Performing Arts', 'g5-art-perf-performing', 'Performance and Display'),
  ('Athletics', 'g5-art-perf-athletics', 'Performance and Display'),
  ('Critique', 'g5-art-app-critique', 'Appreciation')
ON CONFLICT (slug) DO NOTHING;

-- =============================================================
-- CREATE THEMES, QUESTS, LESSONS
-- =============================================================
-- We create one Theme + Quest + Lesson per SubStrand
-- Each gets a descriptive title based on the sub-strand name

DO $$
DECLARE
  g_id UUID;
  ss RECORD;
  theme_id UUID;
  quest_id UUID;
  theme_slug TEXT;
  quest_slug TEXT;
  lesson_slug TEXT;
  content_json JSONB;
BEGIN
  SELECT id INTO g_id FROM "Guild" WHERE slug = 'arizen-international';

  -- Loop through all sub-strands
  FOR ss IN SELECT * FROM "SubStrand" ORDER BY slug LOOP
    theme_slug := 'theme-' || ss.slug;
    quest_slug := 'quest-' || ss.slug;
    lesson_slug := 'lesson-' || ss.slug;

    -- Create Theme
    INSERT INTO "Theme" (guild_id, title, slug, description, grade, status)
    SELECT g_id, ss.name || ' Theme', theme_slug, 'Draft theme for ' || ss.name, 
           CASE WHEN ss.slug LIKE 'g2-%' THEN 2 ELSE 5 END, 'DRAFT'
    ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO theme_id;

    -- If theme already existed, get its ID
    IF theme_id IS NULL THEN
      SELECT id INTO theme_id FROM "Theme" WHERE slug = theme_slug;
    END IF;

    -- Create Quest
    INSERT INTO "Quest" (theme_id, title, slug, description, quest_type, order_index, xp_reward, status)
    VALUES (theme_id, ss.name || ' Quest', quest_slug, 'Draft quest for ' || ss.name, 'MAIN', 1, '{"base": 50}', 'DRAFT')
    ON CONFLICT (slug) DO NOTHING
    RETURNing id INTO quest_id;

    IF quest_id IS NULL THEN
      SELECT id INTO quest_id FROM "Quest" WHERE slug = quest_slug;
    END IF;

    -- Create Lesson with full content blocks
    content_json := jsonb_build_object(
      'grade', CASE WHEN ss.slug LIKE 'g2-%' THEN 2 ELSE 5 END,
      'subject', ss."strandName",
      'strand', (SELECT s.name FROM "Strand" s WHERE s.name = ss."strandName" LIMIT 1),
      'subStrand', ss.name,
      'theme', ss.name,
      'learningOutcomes', 'To be populated with CBC/CBE-aligned learning outcomes.',
      'parentGuide', 'Draft placeholder. Parent guidance will be added after curriculum review.',
      'learnerActivity', 'Draft placeholder. Learner activity will be added after curriculum review.',
      'assessment', 'Draft placeholder. Assessment task will be added after curriculum review.',
      'materials', 'Locally available materials to be added.',
      'competencies', '["Communication and Collaboration", "Critical Thinking and Problem Solving"]',
      'values', '["Respect", "Responsibility"]',
      'status', 'draft',
      'version', 1
    );

    INSERT INTO "Lesson" (quest_id, title, slug, description, content_blocks, xp_reward, order_index, status)
    VALUES (quest_id, ss.name || ' Lesson', lesson_slug, 'To be populated with CBC/CBE-aligned learning outcomes.', content_json, '{"base": 50}', 1, 'DRAFT')
    ON CONFLICT (slug) DO NOTHING;

  END LOOP;

  RAISE NOTICE 'Curriculum seed complete!';
  RAISE NOTICE 'Grade 2 sub-strands: %', (SELECT count(*) FROM "SubStrand" WHERE slug LIKE 'g2-%');
  RAISE NOTICE 'Grade 5 sub-strands: %', (SELECT count(*) FROM "SubStrand" WHERE slug LIKE 'g5-%');
  RAISE NOTICE 'Total themes: %', (SELECT count(*) FROM "Theme");
  RAISE NOTICE 'Total quests: %', (SELECT count(*) FROM "Quest");
  RAISE NOTICE 'Total lessons: %', (SELECT count(*) FROM "Lesson");
END $$;

-- =============================================================
-- VERIFICATION QUERY (run separately to check results)
-- =============================================================
/*
SELECT 'Subjects' as entity, count(*)::text as count FROM "Subject"
UNION ALL SELECT 'Strands', count(*)::text FROM "Strand"
UNION ALL SELECT 'Sub-Strands', count(*)::text FROM "SubStrand"
UNION ALL SELECT 'Themes', count(*)::text FROM "Theme"
UNION ALL SELECT 'Quests', count(*)::text FROM "Quest"
UNION ALL SELECT 'Lessons', count(*)::text FROM "Lesson";
*/
