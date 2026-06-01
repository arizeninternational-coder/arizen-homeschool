-- ============================================================
-- SEED ALL 9 CBC GRADES WITH SUBJECTS (Themes)
-- Fixed: "guildId" quoted, durationWeeks provided
-- Run this in Supabase SQL Editor
-- ============================================================

-- Create Guild if it doesn't exist
INSERT INTO "Guild" (id, name, slug)
VALUES ('a0000000-0000-0000-0000-000000000001', 'Arizen International', 'arizen-international')
ON CONFLICT DO NOTHING;

-- Ensure Theme slug is unique
-- ALTER TABLE "Theme" ADD CONSTRAINT IF NOT EXISTS theme_slug_key UNIQUE (slug);

-- ============================================================
-- HELPER: All inserts use durationWeeks=4 (1 month default)
-- Grade 1: 9 subjects
-- ============================================================

-- GRADE 1 (9 subjects)
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 1 Mathematics', 'g1-mathematics', 'Grade 1 Mathematics curriculum', 4, 1, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 1 English', 'g1-english', 'Grade 1 English curriculum', 4, 1, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 1 Kiswahili', 'g1-kiswahili', 'Grade 1 Kiswahili curriculum', 4, 1, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 1 Environmental Activities', 'g1-environmental', 'Grade 1 Environmental Activities', 4, 1, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 1 Hygiene and Nutrition', 'g1-hygiene-nutrition', 'Grade 1 Hygiene and Nutrition', 4, 1, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 1 CRE', 'g1-cre', 'Grade 1 Christian Religious Education', 4, 1, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 1 Movement and Creative Activities', 'g1-movement-creative', 'Grade 1 Movement and Creative Activities', 4, 1, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 1 Literacy', 'g1-literacy', 'Grade 1 Literacy Activities', 4, 1, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 1 Digital Literacy', 'g1-digital-literacy', 'Grade 1 Digital Literacy', 4, 1, 'DRAFT') ON CONFLICT (slug) DO NOTHING;

-- GRADE 2 (9 subjects)
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 2 Mathematics', 'g2-mathematics', 'Grade 2 Mathematics curriculum', 4, 2, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 2 English', 'g2-english', 'Grade 2 English curriculum', 4, 2, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 2 Kiswahili', 'g2-kiswahili', 'Grade 2 Kiswahili curriculum', 4, 2, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 2 Environmental Activities', 'g2-environmental', 'Grade 2 Environmental Activities', 4, 2, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 2 Hygiene and Nutrition', 'g2-hygiene-nutrition', 'Grade 2 Hygiene and Nutrition', 4, 2, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 2 CRE', 'g2-cre', 'Grade 2 Christian Religious Education', 4, 2, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 2 Movement and Creative Activities', 'g2-movement-creative', 'Grade 2 Movement and Creative Activities', 4, 2, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 2 Literacy', 'g2-literacy', 'Grade 2 Literacy Activities', 4, 2, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 2 Digital Literacy', 'g2-digital-literacy', 'Grade 2 Digital Literacy', 4, 2, 'DRAFT') ON CONFLICT (slug) DO NOTHING;

-- GRADE 3 (11 subjects)
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 3 Mathematics', 'g3-mathematics', 'Grade 3 Mathematics curriculum', 4, 3, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 3 English', 'g3-english', 'Grade 3 English curriculum', 4, 3, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 3 Kiswahili', 'g3-kiswahili', 'Grade 3 Kiswahili curriculum', 4, 3, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 3 Science and Technology', 'g3-science-tech', 'Grade 3 Science and Technology', 4, 3, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 3 Social Studies', 'g3-social-studies', 'Grade 3 Social Studies', 4, 3, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 3 CRE', 'g3-cre', 'Grade 3 Christian Religious Education', 4, 3, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 3 Movement and Creative Activities', 'g3-movement-creative', 'Grade 3 Movement and Creative Activities', 4, 3, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 3 Agriculture', 'g3-agriculture', 'Grade 3 Agriculture', 4, 3, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 3 Art and Craft', 'g3-art-craft', 'Grade 3 Art and Craft', 4, 3, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 3 Music', 'g3-music', 'Grade 3 Music', 4, 3, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 3 Physical Education', 'g3-physical-ed', 'Grade 3 Physical Education', 4, 3, 'DRAFT') ON CONFLICT (slug) DO NOTHING;

-- GRADE 4 (11 subjects)
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 4 Mathematics', 'g4-mathematics', 'Grade 4 Mathematics curriculum', 4, 4, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 4 English', 'g4-english', 'Grade 4 English curriculum', 4, 4, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 4 Kiswahili', 'g4-kiswahili', 'Grade 4 Kiswahili curriculum', 4, 4, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 4 Science and Technology', 'g4-science-tech', 'Grade 4 Science and Technology', 4, 4, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 4 Social Studies', 'g4-social-studies', 'Grade 4 Social Studies', 4, 4, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 4 CRE', 'g4-cre', 'Grade 4 Christian Religious Education', 4, 4, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 4 Agriculture', 'g4-agriculture', 'Grade 4 Agriculture', 4, 4, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 4 Art and Craft', 'g4-art-craft', 'Grade 4 Art and Craft', 4, 4, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 4 Music', 'g4-music', 'Grade 4 Music', 4, 4, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 4 HPE', 'g4-hpe', 'Grade 4 Health and Physical Education', 4, 4, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 4 Digital Literacy', 'g4-digital-literacy', 'Grade 4 Digital Literacy', 4, 4, 'DRAFT') ON CONFLICT (slug) DO NOTHING;

-- GRADE 5 (11 subjects)
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 5 Mathematics', 'g5-mathematics', 'Grade 5 Mathematics curriculum', 4, 5, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 5 English', 'g5-english', 'Grade 5 English curriculum', 4, 5, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 5 Kiswahili', 'g5-kiswahili', 'Grade 5 Kiswahili curriculum', 4, 5, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 5 Science and Technology', 'g5-science-tech', 'Grade 5 Science and Technology', 4, 5, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 5 Social Studies', 'g5-social-studies', 'Grade 5 Social Studies', 4, 5, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 5 CRE', 'g5-cre', 'Grade 5 Christian Religious Education', 4, 5, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 5 Agriculture', 'g5-agriculture', 'Grade 5 Agriculture', 4, 5, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 5 Art and Craft', 'g5-art-craft', 'Grade 5 Art and Craft', 4, 5, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 5 Music', 'g5-music', 'Grade 5 Music', 4, 5, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 5 HPE', 'g5-hpe', 'Grade 5 Health and Physical Education', 4, 5, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 5 Digital Literacy', 'g5-digital-literacy', 'Grade 5 Digital Literacy', 4, 5, 'DRAFT') ON CONFLICT (slug) DO NOTHING;

-- GRADE 6 (11 subjects)
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 6 Mathematics', 'g6-mathematics', 'Grade 6 Mathematics curriculum', 4, 6, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 6 English', 'g6-english', 'Grade 6 English curriculum', 4, 6, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 6 Kiswahili', 'g6-kiswahili', 'Grade 6 Kiswahili curriculum', 4, 6, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 6 Science and Technology', 'g6-science-tech', 'Grade 6 Science and Technology', 4, 6, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 6 Social Studies', 'g6-social-studies', 'Grade 6 Social Studies', 4, 6, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 6 CRE', 'g6-cre', 'Grade 6 Christian Religious Education', 4, 6, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 6 Agriculture', 'g6-agriculture', 'Grade 6 Agriculture', 4, 6, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 6 Art and Craft', 'g6-art-craft', 'Grade 6 Art and Craft', 4, 6, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 6 Music', 'g6-music', 'Grade 6 Music', 4, 6, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 6 HPE', 'g6-hpe', 'Grade 6 Health and Physical Education', 4, 6, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 6 Digital Literacy', 'g6-digital-literacy', 'Grade 6 Digital Literacy', 4, 6, 'DRAFT') ON CONFLICT (slug) DO NOTHING;

-- GRADE 7 (12 subjects)
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 7 Mathematics', 'g7-mathematics', 'Grade 7 Mathematics curriculum', 4, 7, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 7 English', 'g7-english', 'Grade 7 English curriculum', 4, 7, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 7 Kiswahili', 'g7-kiswahili', 'Grade 7 Kiswahili curriculum', 4, 7, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 7 Science', 'g7-science', 'Grade 7 Science', 4, 7, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 7 Social Studies', 'g7-social-studies', 'Grade 7 Social Studies', 4, 7, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 7 CRE', 'g7-cre', 'Grade 7 Christian Religious Education', 4, 7, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 7 Agriculture', 'g7-agriculture', 'Grade 7 Agriculture', 4, 7, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 7 Art and Craft', 'g7-art-craft', 'Grade 7 Art and Craft', 4, 7, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 7 Music', 'g7-music', 'Grade 7 Music', 4, 7, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 7 HPE', 'g7-hpe', 'Grade 7 Health and Physical Education', 4, 7, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 7 Pre-Technical Studies', 'g7-pre-technical', 'Grade 7 Pre-Technical Studies', 4, 7, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 7 Digital Literacy', 'g7-digital-literacy', 'Grade 7 Digital Literacy', 4, 7, 'DRAFT') ON CONFLICT (slug) DO NOTHING;

-- GRADE 8 (12 subjects)
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 8 Mathematics', 'g8-mathematics', 'Grade 8 Mathematics curriculum', 4, 8, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 8 English', 'g8-english', 'Grade 8 English curriculum', 4, 8, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 8 Kiswahili', 'g8-kiswahili', 'Grade 8 Kiswahili curriculum', 4, 8, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 8 Science', 'g8-science', 'Grade 8 Science', 4, 8, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 8 Social Studies', 'g8-social-studies', 'Grade 8 Social Studies', 4, 8, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 8 CRE', 'g8-cre', 'Grade 8 Christian Religious Education', 4, 8, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 8 Agriculture', 'g8-agriculture', 'Grade 8 Agriculture', 4, 8, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 8 Art and Craft', 'g8-art-craft', 'Grade 8 Art and Craft', 4, 8, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 8 Music', 'g8-music', 'Grade 8 Music', 4, 8, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 8 HPE', 'g8-hpe', 'Grade 8 Health and Physical Education', 4, 8, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 8 Pre-Technical Studies', 'g8-pre-technical', 'Grade 8 Pre-Technical Studies', 4, 8, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 8 Digital Literacy', 'g8-digital-literacy', 'Grade 8 Digital Literacy', 4, 8, 'DRAFT') ON CONFLICT (slug) DO NOTHING;

-- GRADE 9 (12 subjects)
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 9 Mathematics', 'g9-mathematics', 'Grade 9 Mathematics curriculum', 4, 9, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 9 English', 'g9-english', 'Grade 9 English curriculum', 4, 9, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 9 Kiswahili', 'g9-kiswahili', 'Grade 9 Kiswahili curriculum', 4, 9, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 9 Science', 'g9-science', 'Grade 9 Science', 4, 9, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 9 Social Studies', 'g9-social-studies', 'Grade 9 Social Studies', 4, 9, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 9 CRE', 'g9-cre', 'Grade 9 Christian Religious Education', 4, 9, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 9 Agriculture', 'g9-agriculture', 'Grade 9 Agriculture', 4, 9, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 9 Art and Craft', 'g9-art-craft', 'Grade 9 Art and Craft', 4, 9, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 9 Music', 'g9-music', 'Grade 9 Music', 4, 9, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 9 HPE', 'g9-hpe', 'Grade 9 Health and Physical Education', 4, 9, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 9 Pre-Technical Studies', 'g9-pre-technical', 'Grade 9 Pre-Technical Studies', 4, 9, 'DRAFT') ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Theme" ("guildId", title, slug, description, "durationWeeks", grade, status) VALUES ('a0000000-0000-0000-0000-000000000001', 'Grade 9 Digital Literacy', 'g9-digital-literacy', 'Grade 9 Digital Literacy', 4, 9, 'DRAFT') ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- VERIFY: Count subjects per grade
-- ============================================================
SELECT grade, COUNT(*) as subject_count
FROM "Theme"
GROUP BY grade
ORDER BY grade;
