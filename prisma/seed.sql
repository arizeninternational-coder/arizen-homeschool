-- ═══════════════════════════════════════════════════════════
-- Arizen Homeschool Hub — Database Schema
-- Run this SQL in Supabase: Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════

-- ── Enums ───────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE "QuestType" AS ENUM ('MAIN', 'SIDE', 'CHALLENGE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ActivityType" AS ENUM ('EXPERIMENT', 'PROJECT', 'BUILD', 'MODEL', 'COOKING', 'FIELDSTUDY', 'SURVEY');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "SideQuestType" AS ENUM ('EXPERIMENT', 'JOURNALING', 'REALWORLDTASK', 'DRAWING', 'BUILDING', 'INTERVIEW', 'FIELDTRIP', 'GAME', 'PUZZLE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "XpSourceType" AS ENUM ('LESSON', 'QUEST', 'SIDEQUEST', 'ACTIVITY', 'REFLECTION', 'STREAK', 'BONUS');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ContentType" AS ENUM ('THEME', 'QUEST', 'LESSON', 'ACTIVITY', 'SIDEQUEST');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'REVIEW', 'PUBLISHED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'TEACHER', 'PARENT', 'LEARNER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Core Entities ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Guild" (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  description   TEXT,
  logoUrl       TEXT,
  "createdAt"   TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "User" (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "guildId"     TEXT NOT NULL,
  name          TEXT,
  email         TEXT UNIQUE,
  "emailVerified" TIMESTAMP,
  "passwordHash" TEXT,
  image         TEXT,
  role          "UserRole" NOT NULL DEFAULT 'LEARNER',
  "createdAt"   TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "User_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"(id)
);

CREATE TABLE IF NOT EXISTS "LearnerProfile" (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"      TEXT NOT NULL UNIQUE,
  "guildId"     TEXT NOT NULL,
  grade         INTEGER NOT NULL,
  "dateOfBirth" TIMESTAMP,
  "displayName" TEXT NOT NULL,
  "avatarUrl"   TEXT,
  "totalXp"     INTEGER NOT NULL DEFAULT 0,
  "currentStreak" INTEGER NOT NULL DEFAULT 0,
  "bestStreak"  INTEGER NOT NULL DEFAULT 0,
  "lastActivityDate" TIMESTAMP,
  "createdAt"   TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "LearnerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id),
  CONSTRAINT "LearnerProfile_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"(id)
);

-- ── NextAuth Tables ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Account" (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"          TEXT NOT NULL,
  type              TEXT NOT NULL,
  provider          TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refresh_token"   TEXT,
  "access_token"    TEXT,
  "expires_at"      INTEGER,
  "token_type"      TEXT,
  scope             TEXT,
  "id_token"        TEXT,
  CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE,
  CONSTRAINT "Account_provider_providerAccountId_key" UNIQUE (provider, "providerAccountId")
);

CREATE TABLE IF NOT EXISTS "Session" (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "sessionToken" TEXT NOT NULL UNIQUE,
  "userId"     TEXT NOT NULL,
  expires      TIMESTAMP NOT NULL,
  CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "VerificationToken" (
  identifier TEXT NOT NULL,
  token      TEXT NOT NULL UNIQUE,
  expires    TIMESTAMP NOT NULL,
  CONSTRAINT "VerificationToken_identifier_token_key" UNIQUE (identifier, token)
);

-- ── Content Hierarchy ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Theme" (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "guildId"       TEXT NOT NULL,
  title           TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  description     TEXT,
  "coverImage"    TEXT,
  "durationWeeks" INTEGER NOT NULL,
  "drivingQuestion" TEXT,
  grade           INTEGER NOT NULL,
  status          "ContentStatus" NOT NULL DEFAULT 'DRAFT',
  "createdAt"     TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"     TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "Theme_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"(id)
);

CREATE TABLE IF NOT EXISTS "ThemeSubject" (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "themeId" TEXT NOT NULL,
  subject   TEXT NOT NULL,
  CONSTRAINT "ThemeSubject_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme"(id) ON DELETE CASCADE,
  CONSTRAINT "ThemeSubject_themeId_subject_key" UNIQUE ("themeId", subject)
);

CREATE TABLE IF NOT EXISTS "Quest" (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "themeId"       TEXT NOT NULL,
  title           TEXT NOT NULL,
  slug            TEXT NOT NULL,
  description     TEXT,
  "questType"     "QuestType" NOT NULL DEFAULT 'MAIN',
  "orderIndex"    INTEGER NOT NULL DEFAULT 0,
  "coverImage"    TEXT,
  "xpReward"      JSONB NOT NULL DEFAULT '{"base": 100}',
  "cbcMapping"    JSONB,
  "estimatedDurationMinutes" INTEGER,
  status          "ContentStatus" NOT NULL DEFAULT 'DRAFT',
  "createdAt"     TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"     TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "Quest_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme"(id),
  CONSTRAINT "Quest_themeId_slug_key" UNIQUE ("themeId", slug)
);

CREATE TABLE IF NOT EXISTS "Lesson" (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "questId"       TEXT NOT NULL,
  title           TEXT NOT NULL,
  slug            TEXT NOT NULL,
  description     TEXT,
  "contentBlocks" JSONB NOT NULL DEFAULT '[]',
  "cbcMapping"    JSONB,
  difficulty      JSONB NOT NULL DEFAULT '{"complexityScore": 2}',
  "xpReward"      JSONB NOT NULL DEFAULT '{"base": 50}',
  "estimatedDurationMinutes" INTEGER,
  "orderIndex"    INTEGER NOT NULL DEFAULT 0,
  status          "ContentStatus" NOT NULL DEFAULT 'DRAFT',
  "createdAt"     TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"     TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "Lesson_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest"(id),
  CONSTRAINT "Lesson_questId_slug_key" UNIQUE ("questId", slug)
);

CREATE TABLE IF NOT EXISTS "SideQuest" (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "questId"       TEXT,
  "themeId"       TEXT NOT NULL,
  title           TEXT NOT NULL,
  slug            TEXT NOT NULL,
  description     TEXT,
  "sideQuestType" "SideQuestType" NOT NULL DEFAULT 'JOURNALING',
  "activityBlocks" JSONB NOT NULL DEFAULT '[]',
  "cbcMapping"    JSONB,
  difficulty      JSONB NOT NULL DEFAULT '{"complexityScore": 2}',
  "xpReward"      JSONB NOT NULL DEFAULT '{"base": 75}',
  "estimatedDurationMinutes" INTEGER,
  status          "ContentStatus" NOT NULL DEFAULT 'DRAFT',
  "createdAt"     TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"     TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "SideQuest_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest"(id),
  CONSTRAINT "SideQuest_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme"(id),
  CONSTRAINT "SideQuest_themeId_slug_key" UNIQUE ("themeId", slug)
);

CREATE TABLE IF NOT EXISTS "Activity" (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "lessonId"      TEXT,
  "questId"       TEXT,
  "sideQuestId"   TEXT,
  "themeId"       TEXT NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  "activityType"  "ActivityType" NOT NULL DEFAULT 'EXPERIMENT',
  "materialsList" JSONB NOT NULL DEFAULT '[]',
  "toolsList"     JSONB NOT NULL DEFAULT '[]',
  "procedureSteps" JSONB NOT NULL DEFAULT '[]',
  "cbcMapping"    JSONB,
  difficulty      JSONB NOT NULL DEFAULT '{"complexityScore": 2}',
  "xpReward"      JSONB NOT NULL DEFAULT '{"base": 100}',
  "estimatedDurationMinutes" INTEGER,
  status          "ContentStatus" NOT NULL DEFAULT 'DRAFT',
  "createdAt"     TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"     TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "Activity_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"(id),
  CONSTRAINT "Activity_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest"(id),
  CONSTRAINT "Activity_sideQuestId_fkey" FOREIGN KEY ("sideQuestId") REFERENCES "SideQuest"(id),
  CONSTRAINT "Activity_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme"(id)
);

-- ── Progress & Gamification ─────────────────────────────────
CREATE TABLE IF NOT EXISTS "Progress" (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "learnerId"     TEXT NOT NULL,
  "lessonId"      TEXT,
  "questId"       TEXT,
  "sideQuestId"   TEXT,
  "activityId"    TEXT,
  "masteryPercent" INTEGER NOT NULL DEFAULT 0,
  "lastAccessed"  TIMESTAMP NOT NULL DEFAULT NOW(),
  "completedAt"   TIMESTAMP,
  "createdAt"     TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"     TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "Progress_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "LearnerProfile"(id),
  CONSTRAINT "Progress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"(id),
  CONSTRAINT "Progress_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest"(id),
  CONSTRAINT "Progress_sideQuestId_fkey" FOREIGN KEY ("sideQuestId") REFERENCES "SideQuest"(id),
  CONSTRAINT "Progress_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"(id)
);

CREATE INDEX IF NOT EXISTS "Progress_learnerId_idx" ON "Progress"("learnerId");
CREATE INDEX IF NOT EXISTS "Progress_lessonId_idx" ON "Progress"("lessonId");
CREATE INDEX IF NOT EXISTS "Progress_questId_idx" ON "Progress"("questId");

CREATE TABLE IF NOT EXISTS "XpRecord" (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "learnerId"     TEXT NOT NULL,
  "sourceType"    "XpSourceType" NOT NULL,
  "sourceId"      TEXT NOT NULL,
  amount          INTEGER NOT NULL,
  description     TEXT,
  "awardedAt"     TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "XpRecord_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "LearnerProfile"(id)
);

CREATE INDEX IF NOT EXISTS "XpRecord_learnerId_idx" ON "XpRecord"("learnerId");
CREATE INDEX IF NOT EXISTS "XpRecord_awardedAt_idx" ON "XpRecord"("awardedAt");

CREATE TABLE IF NOT EXISTS "Badge" (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "learnerId"     TEXT NOT NULL,
  "badgeType"     TEXT NOT NULL,
  name            TEXT NOT NULL,
  description     TEXT,
  "imageUrl"      TEXT,
  "awardedAt"     TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "Badge_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "LearnerProfile"(id),
  CONSTRAINT "Badge_learnerId_badgeType_key" UNIQUE ("learnerId", "badgeType")
);

CREATE INDEX IF NOT EXISTS "Badge_learnerId_idx" ON "Badge"("learnerId");

CREATE TABLE IF NOT EXISTS "Streak" (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "learnerId"     TEXT NOT NULL,
  "streakType"    TEXT NOT NULL DEFAULT 'daily_learning',
  "currentCount"  INTEGER NOT NULL DEFAULT 0,
  "lastDate"      TIMESTAMP NOT NULL DEFAULT NOW(),
  "bestCount"     INTEGER NOT NULL DEFAULT 0,
  "createdAt"     TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"     TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "Streak_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "LearnerProfile"(id),
  CONSTRAINT "Streak_learnerId_streakType_key" UNIQUE ("learnerId", "streakType")
);

-- ── Reflections / Journal ───────────────────────────────────
CREATE TABLE IF NOT EXISTS "Reflection" (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "learnerId"     TEXT NOT NULL,
  "userId"        TEXT NOT NULL,
  "lessonId"      TEXT,
  "questId"       TEXT,
  "sideQuestId"   TEXT,
  "themeId"       TEXT,
  "entryType"     TEXT NOT NULL DEFAULT 'reflection',
  prompt          TEXT,
  response        JSONB,
  "competencyEvidence" JSONB NOT NULL DEFAULT '[]',
  "valueEvidence" JSONB NOT NULL DEFAULT '[]',
  tags            JSONB NOT NULL DEFAULT '[]',
  "createdAt"     TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"     TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "Reflection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id)
);

CREATE INDEX IF NOT EXISTS "Reflection_learnerId_idx" ON "Reflection"("learnerId");
CREATE INDEX IF NOT EXISTS "Reflection_userId_idx" ON "Reflection"("userId");

-- ── CBC Reference Data ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS "CbcStrand" (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject         TEXT NOT NULL,
  name            TEXT NOT NULL,
  CONSTRAINT "CbcStrand_subject_name_key" UNIQUE (subject, name)
);

CREATE TABLE IF NOT EXISTS "CbcCompetency" (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL UNIQUE,
  description     TEXT
);

CREATE TABLE IF NOT EXISTS "CbcValue" (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL UNIQUE,
  description     TEXT
);

CREATE TABLE IF NOT EXISTS "CbcPci" (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL UNIQUE,
  description     TEXT
);

-- ═══════════════════════════════════════════════════════════
-- SEED DATA
-- ═══════════════════════════════════════════════════════════

-- Guild
INSERT INTO "Guild" (id, name, slug, description) VALUES
  ('g0000000-0000-0000-0000-000000000001', 'Arizen International', 'arizen-international', 'Arizen Homeschool Hub — CBC-aligned, gamified learning for Grades 1-8.')
ON CONFLICT (slug) DO NOTHING;

-- Users
INSERT INTO "User" (id, "guildId", name, email, "passwordHash", role) VALUES
  ('u0000001-0000-0000-0000-000000000001', 'g0000000-0000-0000-0000-000000000001', 'Victor Nyamu', 'victor@arizen.local', '$2a$10$jKHICZgTmooKWGzNy73/g.KXIzXnx8qVpnmxjXqMkdVwqYsCeUZLS', 'ADMIN'),
  ('u0000002-0000-0000-0000-000000000002', 'g0000000-0000-0000-0000-000000000001', 'Ariadne', 'ariadne@arizen.local', '$2a$10$jKHICZgTmooKWGzNy73/g.KXIzXnx8qVpnmxjXqMkdVwqYsCeUZLS', 'LEARNER'),
  ('u0000003-0000-0000-0000-000000000003', 'g0000000-0000-0000-0000-000000000001', 'Ariyana', 'ariyana@arizen.local', '$2a$10$jKHICZgTmooKWGzNy73/g.KXIzXnx8qVpnmxjXqMkdVwqYsCeUZLS', 'LEARNER')
ON CONFLICT (email) DO NOTHING;

-- Learner Profiles
INSERT INTO "LearnerProfile" (id, "userId", "guildId", grade, "displayName", "totalXp", "currentStreak", "bestStreak") VALUES
  ('lp000001-0000-0000-0000-000000000001', 'u0000002-0000-0000-0000-000000000002', 'g0000000-0000-0000-0000-000000000001', 5, 'Ariadne', 2450, 7, 14),
  ('lp000002-0000-0000-0000-000000000002', 'u0000003-0000-0000-0000-000000000003', 'g0000000-0000-0000-0000-000000000001', 2, 'Ariyana', 890, 3, 8)
ON CONFLICT ("userId") DO NOTHING;

-- CBC Reference Data
INSERT INTO "CbcStrand" (subject, name) VALUES
  ('Mathematics', 'Numbers'), ('Mathematics', 'Measurement'), ('Mathematics', 'Geometry'),
  ('English', 'Listening and Speaking'), ('English', 'Reading'), ('English', 'Language Structures and Grammar'), ('English', 'Writing'),
  ('Kiswahili', 'Kusikiliza na Kuzungumza'), ('Kiswahili', 'Kusoma'), ('Kiswahili', 'Sarufi'), ('Kiswahili', 'Kuandika'),
  ('Environmental Activities', 'Weather and the Environment'), ('Environmental Activities', 'Natural Environment & Physical Features'), ('Environmental Activities', 'Social Environment & Resources'),
  ('Hygiene and Nutrition', 'Health Practices and Personal Hygiene'), ('Hygiene and Nutrition', 'Food and Nutrition'), ('Hygiene and Nutrition', 'Medicine Safety & Common Illnesses'),
  ('Movement Activities', 'Locomotor and Non-Locomotor Skills'), ('Movement Activities', 'Ball Properties & Games'), ('Movement Activities', 'Rhythmic Movements and Gymnastics'),
  ('Science and Technology', 'Living Things'), ('Science and Technology', 'Environment'), ('Science and Technology', 'Matter & Force'), ('Science and Technology', 'Digital Technology'),
  ('Social Studies', 'Physical Environment'), ('Social Studies', 'People and Culture'), ('Social Studies', 'Governance and Citizenship'),
  ('Agriculture and Nutrition', 'Conservation of Resources'), ('Agriculture and Nutrition', 'Food Production Processes'), ('Agriculture and Nutrition', 'Hygiene and Food Preparation'),
  ('Creative Arts', 'Creating and Execution'), ('Creative Arts', 'Performance and Display'), ('Creative Arts', 'Appreciation')
ON CONFLICT (subject, name) DO NOTHING;

INSERT INTO "CbcCompetency" (name, description) VALUES
  ('critical_thinking', 'Analyze and evaluate information'), ('problem_solving', 'Find solutions to challenges'),
  ('creativity', 'Generate original ideas'), ('communication', 'Express ideas clearly'),
  ('collaboration', 'Work effectively with others'), ('citizenship', 'Contribute to community'),
  ('self_efficacy', 'Believe in own abilities'), ('digital_literacy', 'Use technology effectively'),
  ('learning_to_learn', 'Develop learning strategies')
ON CONFLICT (name) DO NOTHING;

INSERT INTO "CbcValue" (name, description) VALUES
  ('love', 'Care for others'), ('responsibility', 'Be accountable'), ('respect', 'Value others'),
  ('unity', 'Work together'), ('peace', 'Promote harmony'), ('patriotism', 'Love for country'),
  ('integrity', 'Be honest'), ('social_justice', 'Fairness for all')
ON CONFLICT (name) DO NOTHING;

INSERT INTO "CbcPci" (name, description) VALUES
  ('environmental_education', 'Protect the environment'), ('disaster_risk_reduction', 'Prepare for disasters'),
  ('financial_literacy', 'Manage money wisely'), ('gender_equality', 'Equal opportunities for all'),
  ('peace_education', 'Promote peace')
ON CONFLICT (name) DO NOTHING;

-- ═══════════════════════════════════════════════════════════
-- Themes (20 themes across Grade 2 & Grade 5)
-- ═══════════════════════════════════════════════════════════

-- Grade 2 Themes
INSERT INTO "Theme" (id, "guildId", title, slug, description, "drivingQuestion", "durationWeeks", grade, status) VALUES
  ('t000001-0000-0000-0000-000000000001', 'g0000000-0000-0000-0000-000000000001', 'Numbers in Everyday Life', 'g2-numbers-everyday-2', 'Counting, adding, and subtracting in daily situations', 'How do numbers help us every day?', 4, 2, 'PUBLISHED'),
  ('t000002-0000-0000-0000-000000000002', 'g0000000-0000-0000-0000-000000000001', 'Measuring Our World', 'g2-measuring-world-2', 'Length, weight, capacity, and time', 'Why do we measure things?', 3, 2, 'PUBLISHED'),
  ('t000003-0000-0000-0000-000000000003', 'g0000000-0000-0000-0000-000000000001', 'Shape Detectives', 'g2-shape-detectives-2', '2D and 3D shapes in the world around us', 'What shapes can we find?', 3, 2, 'PUBLISHED'),
  ('t000004-0000-0000-0000-000000000004', 'g0000000-0000-0000-0000-000000000001', 'Story Time Adventures', 'g2-story-time-2', 'Reading comprehension and storytelling', 'What makes a great story?', 4, 2, 'PUBLISHED'),
  ('t000005-0000-0000-0000-000000000005', 'g0000000-0000-0000-0000-000000000001', 'Weather Watchers', 'g2-weather-watchers-2', 'Observing and understanding weather patterns', 'Why does the weather change?', 3, 2, 'PUBLISHED'),
  ('t000006-0000-0000-0000-000000000006', 'g0000000-0000-0000-0000-000000000001', 'My Healthy Body', 'g2-my-healthy-body-2', 'Personal hygiene, nutrition, and safety', 'How do I keep my body healthy?', 3, 2, 'PUBLISHED'),
  ('t000007-0000-0000-0000-000000000007', 'g0000000-0000-0000-0000-000000000001', 'Moving and Grooving', 'g2-moving-grooving-2', 'Movement skills, games, and physical activity', 'How does movement help us learn?', 3, 2, 'PUBLISHED')
ON CONFLICT (slug) DO NOTHING;

-- Grade 5 Themes
INSERT INTO "Theme" (id, "guildId", title, slug, description, "drivingQuestion", "durationWeeks", grade, status) VALUES
  ('t000010-0000-0000-0000-000000000010', 'g0000000-0000-0000-0000-000000000001', 'Number Mastery', 'g5-numbers-mastery-5', 'Large numbers, factors, multiples, and number patterns', 'How can we count and work with very large numbers?', 4, 5, 'PUBLISHED'),
  ('t000011-0000-0000-0000-000000000011', 'g0000000-0000-0000-0000-000000000001', 'Fractions and Percentages', 'g5-fractions-decimals-5', 'Fractions, decimals, percentages and their relationships', 'How do we represent parts of a whole?', 4, 5, 'PUBLISHED'),
  ('t000012-0000-0000-0000-000000000012', 'g0000000-0000-0000-0000-000000000001', 'Living Things Lab', 'g5-living-things-5', 'Plants, animals, ecosystems, and interdependence', 'How do living things survive and grow?', 5, 5, 'PUBLISHED'),
  ('t000013-0000-0000-0000-000000000013', 'g0000000-0000-0000-0000-000000000001', 'Our Country Kenya', 'g5-our-country-kenya-5', 'Geography, history, and governance of Kenya', 'What makes Kenya special?', 4, 5, 'PUBLISHED'),
  ('t000014-0000-0000-0000-000000000014', 'g0000000-0000-0000-0000-000000000001', 'Digital Explorers', 'g5-digital-explorers-5', 'Computers, internet safety, and basic programming', 'How does technology change our lives?', 3, 5, 'PUBLISHED'),
  ('t000015-0000-0000-0000-000000000015', 'g0000000-0000-0000-0000-000000000001', 'Art Studio', 'g5-art-studio-5', 'Visual arts, music, and creative expression', 'How does art help us express ourselves?', 3, 5, 'PUBLISHED')
ON CONFLICT (slug) DO NOTHING;

-- ═══════════════════════════════════════════════════════════
-- Quests (sample quests with lessons for each theme)
-- ═══════════════════════════════════════════════════════════

-- Grade 2: Numbers in Everyday Life → 3 quests
INSERT INTO "Quest" (id, "themeId", title, slug, description, "questType", "orderIndex", "xpReward", status) VALUES
  ('q000001-0000-0000-0000-000000000001', 't000001-0000-0000-0000-000000000001', 'Counting to 100', 'counting-100-g2', 'Learn to count, read, and write numbers up to 100', 'MAIN', 1, '{"base": 80}', 'PUBLISHED'),
  ('q000002-0000-0000-0000-000000000002', 't000001-0000-0000-0000-000000000001', 'Addition Adventures', 'addition-adventures-g2', 'Adding numbers within 100 using real-life contexts', 'MAIN', 2, '{"base": 100}', 'PUBLISHED'),
  ('q000003-0000-0000-0000-000000000003', 't000001-0000-0000-0000-000000000001', 'Subtraction Safari', 'subtraction-safari-g2', 'Taking away and finding the difference', 'MAIN', 3, '{"base": 100}', 'PUBLISHED')
ON CONFLICT ("themeId", slug) DO NOTHING;

-- Grade 2: Story Time → 2 quests
INSERT INTO "Quest" (id, "themeId", title, slug, description, "questType", "orderIndex", "xpReward", status) VALUES
  ('q000010-0000-0000-0000-000000000010', 't000004-0000-0000-0000-000000000004', 'Favourite Stories', 'favourite-stories-g2', 'Read and retell stories with confidence', 'MAIN', 1, '{"base": 80}', 'PUBLISHED'),
  ('q000011-0000-0000-0000-000000000011', 't000004-0000-0000-0000-000000000004', 'My First Journal', 'my-first-journal-g2', 'Write simple sentences about daily life', 'MAIN', 2, '{"base": 90}', 'PUBLISHED')
ON CONFLICT ("themeId", slug) DO NOTHING;

-- Grade 2: Weather → 2 quests
INSERT INTO "Quest" (id, "themeId", title, slug, description, "questType", "orderIndex", "xpReward", status) VALUES
  ('q000020-0000-0000-0000-000000000020', 't000005-0000-0000-0000-000000000005', 'Types of Weather', 'types-weather-g2', 'Sunny, rainy, cloudy, windy — learn to describe the weather', 'MAIN', 1, '{"base": 70}', 'PUBLISHED'),
  ('q000021-0000-0000-0000-000000000021', 't000005-0000-0000-0000-000000000005', 'Weather and Us', 'weather-and-us-g2', 'How weather affects what we wear, eat, and do', 'MAIN', 2, '{"base": 75}', 'PUBLISHED')
ON CONFLICT ("themeId", slug) DO NOTHING;

-- Grade 2: Healthy Body → 2 quests
INSERT INTO "Quest" (id, "themeId", title, slug, description, "questType", "orderIndex", "xpReward", status) VALUES
  ('q000030-0000-0000-0000-000000000030', 't000006-0000-0000-0000-000000000006', 'Clean and Healthy', 'clean-healthy-g2', 'Handwashing, bathing, and dental care', 'MAIN', 1, '{"base": 70}', 'PUBLISHED'),
  ('q000031-0000-0000-0000-000000000031', 't000006-0000-0000-0000-000000000006', 'Food Heroes', 'food-heroes-g2', 'Healthy foods, fruits, vegetables, and balanced meals', 'MAIN', 2, '{"base": 75}', 'PUBLISHED')
ON CONFLICT ("themeId", slug) DO NOTHING;

-- Grade 5: Number Mastery → 3 quests
INSERT INTO "Quest" (id, "themeId", title, slug, description, "questType", "orderIndex", "xpReward", status) VALUES
  ('q000040-0000-0000-0000-000000000040', 't000010-0000-0000-0000-000000000010', 'Place Value Champions', 'place-value-champions-g5', 'Reading and writing numbers up to 1 million', 'MAIN', 1, '{"base": 120}', 'PUBLISHED'),
  ('q000041-0000-0000-0000-000000000041', 't000010-0000-0000-0000-000000000010', 'Factors and Multiples', 'factors-multiples-g5', 'HCF, LCM, and prime numbers', 'MAIN', 2, '{"base": 140}', 'PUBLISHED'),
  ('q000042-0000-0000-0000-000000000042', 't000010-0000-0000-0000-000000000010', 'Number Patterns', 'number-patterns-g5', 'Sequences, rules, and algebraic thinking', 'MAIN', 3, '{"base": 130}', 'PUBLISHED')
ON CONFLICT ("themeId", slug) DO NOTHING;

-- Grade 5: Fractions → 2 quests
INSERT INTO "Quest" (id, "themeId", title, slug, description, "questType", "orderIndex", "xpReward", status) VALUES
  ('q000050-0000-0000-0000-000000000050', 't000011-0000-0000-0000-000000000011', 'Fraction Fundamentals', 'fraction-fundamentals-g5', 'Understanding, comparing, and ordering fractions', 'MAIN', 1, '{"base": 130}', 'PUBLISHED'),
  ('q000051-0000-0000-0000-000000000051', 't000011-0000-0000-0000-000000000011', 'Decimals and Percentages', 'decimals-percentages-g5', 'Converting between fractions, decimals, and percentages', 'MAIN', 2, '{"base": 140}', 'PUBLISHED')
ON CONFLICT ("themeId", slug) DO NOTHING;

-- Grade 5: Living Things → 3 quests
INSERT INTO "Quest" (id, "themeId", title, slug, description, "questType", "orderIndex", "xpReward", status) VALUES
  ('q000060-0000-0000-0000-000000000060', 't000012-0000-0000-0000-000000000012', 'Plant Power', 'plant-power-g5', 'Parts of plants, photosynthesis, and plant life cycles', 'MAIN', 1, '{"base": 150}', 'PUBLISHED'),
  ('q000061-0000-0000-0000-000000000061', 't000012-0000-0000-0000-000000000012', 'Animal Kingdom', 'animal-kingdom-g5', 'Vertebrates, invertebrates, and classification', 'MAIN', 2, '{"base": 150}', 'PUBLISHED'),
  ('q000062-0000-0000-0000-000000000062', 't000012-0000-0000-0000-000000000012', 'Ecosystem Explorer', 'ecosystem-explorer-g5', 'Food chains, habitats, and environmental conservation', 'MAIN', 3, '{"base": 160}', 'PUBLISHED')
ON CONFLICT ("themeId", slug) DO NOTHING;

-- Grade 5: Kenya → 2 quests
INSERT INTO "Quest" (id, "themeId", title, slug, description, "questType", "orderIndex", "xpReward", status) VALUES
  ('q000070-0000-0000-0000-000000000070', 't000013-0000-0000-0000-000000000013', 'Kenya''s Geography', 'kenya-geography-g5', 'Counties, physical features, and natural resources', 'MAIN', 1, '{"base": 120}', 'PUBLISHED'),
  ('q000071-0000-0000-0000-000000000071', 't000013-0000-0000-0000-000000000013', 'Our Constitution', 'our-constitution-g5', 'Governance, rights, and responsibilities of citizens', 'MAIN', 2, '{"base": 130}', 'PUBLISHED')
ON CONFLICT ("themeId", slug) DO NOTHING;

-- ═══════════════════════════════════════════════════════════
-- Lessons (2-3 per quest with content blocks)
-- ═══════════════════════════════════════════════════════════

-- G2: Counting to 100 → 3 lessons
INSERT INTO "Lesson" (id, "questId", title, slug, description, "contentBlocks", "xpReward", "orderIndex", status) VALUES
  ('l000001-0000-0000-0000-000000000001', 'q000001-0000-0000-0000-000000000001', 'Counting by Ones', 'counting-ones-g2', 'Count from 1 to 100 by ones', '[{"id":"b1","type":"text","data":{"content":"Let''s count together! 1, 2, 3, 4, 5... Keep going! You can count all the way to 100. Try counting the chairs in your classroom!"}},{"id":"b2","type":"quiz","data":{"question":"What number comes after 49?","options":["48","50","51","47"],"correctIndex":1,"explanation":"After 49 comes 50. We add 1 to get the next number!"}}]', '{"base": 30}', 1, 'PUBLISHED'),
  ('l000002-0000-0000-0000-000000000002', 'q000001-0000-0000-0000-000000000001', 'Counting by Tens', 'counting-tens-g2', 'Count by 10s: 10, 20, 30... 100', '[{"id":"b3","type":"text","content":{"data":"Counting by 10s is like stacking groups of ten! 10, 20, 30, 40, 50, 60, 70, 80, 90, 100. That''s ten groups of ten!"}},{"id":"b4","type":"quiz","data":{"question":"How many tens make 100?","options":["5","10","20","100"],"correctIndex":1,"explanation":"Ten groups of ten equals 100!"}}]', '{"base": 30}', 2, 'PUBLISHED'),
  ('l000003-0000-0000-0000-000000000003', 'q000001-0000-0000-0000-000000000001', 'Reading and Writing Numbers', 'reading-writing-numbers-g2', 'Read and write number names up to 100', '[{"id":"b5","type":"text","data":{"content":"Numbers have names! 1 = one, 2 = two, 10 = ten, 25 = twenty-five, 100 = one hundred. Practice writing the names of numbers you see every day."}},{"id":"b6","type":"journal","data":{"prompt":"Write the number names for: 7, 15, 42, 89"}}]', '{"base": 25}', 3, 'PUBLISHED')
ON CONFLICT ("questId", slug) DO NOTHING;

-- G2: Addition Adventures → 2 lessons
INSERT INTO "Lesson" (id, "questId", title, slug, description, "contentBlocks", "xpReward", "orderIndex", status) VALUES
  ('l000004-0000-0000-0000-000000000004', 'q000002-0000-0000-0000-000000000002', 'Adding Within 20', 'adding-within-20-g2', 'Addition facts within 20 using objects and number lines', '[{"id":"b7","type":"text","data":{"content":"Addition means putting together! If you have 7 mangoes and get 5 more, you have 7 + 5 = 12 mangoes. Use your fingers or draw circles to help!"}},{"id":"b8","type":"quiz","data":{"question":"What is 8 + 6?","options":["12","13","14","15"],"correctIndex":2,"explanation":"8 + 6 = 14. Try: 8 + 2 = 10, then 10 + 4 = 14!"}}]', '{"base": 35}', 1, 'PUBLISHED'),
  ('l000005-0000-0000-0000-000000000005', 'q000002-0000-0000-0000-000000000002', 'Word Problems', 'word-problems-g2', 'Solve real-life addition problems', '[{"id":"b9","type":"text","data":{"content":"Word problems are stories with math! ''Sarah has 15 stickers. She gets 8 more. How many now?'' Look for ''more'', ''altogether'', ''in all'' — these tell you to add!"}},{"id":"b10","type":"experiment","data":{"title":"Market Math","materials":["play money or bottle caps","paper"],"steps":["Set up a pretend shop","Price items at 5, 10, 15","Buy 2 items and add the prices","Check your answer with a friend"]}}]', '{"base": 40}', 2, 'PUBLISHED')
ON CONFLICT ("questId", slug) DO NOTHING;

-- G5: Place Value → 3 lessons
INSERT INTO "Lesson" (id, "questId", title, slug, description, "contentBlocks", "xpReward", "orderIndex", status) VALUES
  ('l000010-0000-0000-0000-000000000010', 'q000040-0000-0000-0000-000000000040', 'Up to Hundred Thousands', 'hundred-thousands-g5', 'Read and write numbers up to 999,999', '[{"id":"b20","type":"text","data":{"content":"Place value tells us what each digit is worth. In 345,678: 3 is 300,000 (hundred thousands), 4 is 40,000 (ten thousands), 5 is 5,000 (thousands), 6 is 600 (hundreds), 7 is 70 (tens), 8 is 8 (ones)."}},{"id":"b21","type":"quiz","data":{"question":"What is the place value of 7 in 572,341?","options":["7","70","70,000","700"],"correctIndex":2,"explanation":"The 7 is in the ten-thousands place, so it represents 70,000."}}]', '{"base": 45}', 1, 'PUBLISHED'),
  ('l000011-0000-0000-0000-000000000011', 'q000040-0000-0000-0000-000000000040', 'Rounding Big Numbers', 'rounding-big-numbers-g5', 'Round numbers to nearest 10, 100, 1000, 10000', '[{"id":"b22","type":"text","data":{"content":"Rounding makes big numbers easier! To round to nearest 1000: look at the hundreds digit. If it''s 5 or more, round up. 45,678 → 46,000 (because 6 ≥ 5). 45,378 → 45,000 (because 3 < 5)."}},{"id":"b23","type":"quiz","data":{"question":"Round 73,456 to the nearest thousand.","options":["73,000","74,000","73,500","70,000"],"correctIndex":0,"explanation":"The hundreds digit is 4, which is less than 5, so we round down to 73,000."}}]', '{"base": 40}', 2, 'PUBLISHED'),
  ('l000012-0000-0000-0000-000000000012', 'q000040-0000-0000-0000-000000000040', 'Comparing and Ordering', 'comparing-ordering-g5', 'Compare and order numbers up to one million', '[{"id":"b24","type":"text","data":{"content":"To compare big numbers: start from the left (biggest place value). The number with the larger digit first is bigger. 542,310 > 498,765 because 5 hundred thousands > 4 hundred thousands."}},{"id":"b25","type":"journal","data":{"prompt":"Write 5 numbers between 100,000 and 999,999. Put them in order from smallest to largest."}}]', '{"base": 40}', 3, 'PUBLISHED')
ON CONFLICT ("questId", slug) DO NOTHING;

-- G5: Plant Power → 3 lessons
INSERT INTO "Lesson" (id, "questId", title, slug, description, "contentBlocks", "xpReward", "orderIndex", status) VALUES
  ('l000020-0000-0000-0000-000000000020', 'q000060-0000-0000-0000-000000000060', 'Parts of a Plant', 'parts-plant-g5', 'Roots, stem, leaves, flowers — what each part does', '[{"id":"b30","type":"text","data":{"content":"Every plant part has a job! Roots: absorb water and anchor the plant. Stem: transports water and supports the plant. Leaves: make food through photosynthesis. Flowers: help the plant reproduce."}},{"id":"b31","type":"quiz","data":{"question":"Which plant part makes food?","options":["Roots","Stem","Leaves","Flower"],"correctIndex":2,"explanation":"Leaves make food through photosynthesis using sunlight, water, and carbon dioxide."}}]', '"{\"base\": 50}"', 1, 'PUBLISHED'),
  ('l000021-0000-0000-0000-000000000021', 'q000060-0000-0000-0000-000000000060', 'Photosynthesis Lab', 'photosynthesis-lab-g5', 'How plants make their own food', '[{"id":"b32","type":"text","data":{"content":"Photosynthesis is how plants cook their own food! They use sunlight + water (from roots) + carbon dioxide (from air) → glucose (food) + oxygen (what we breathe!). This happens mainly in the green leaves."}},{"id":"b33","type":"experiment","data":{"title":"Leaf Light Experiment","materials":["potted plant","aluminum foil","paper clips"],"steps":["Cover one leaf with foil for 3 days","Leave other leaves uncovered","After 3 days, remove the foil","Compare the covered leaf to uncovered leaves","Why did the covered leaf change color?"],"explanation":"Without light, the leaf cannot make chlorophyll and turns pale. Plants need light to make food!"}}]', '"{\"base\": 60}"', 2, 'PUBLISHED'),
  ('l000022-0000-0000-0000-000000000022', 'q000060-0000-0000-0000-000000000060', 'Plant Life Cycles', 'plant-life-cycles-g5', 'From seed to adult plant — germination to reproduction', '[{"id":"b34","type":"text","data":{"content":"Plants have life cycles just like animals! Seed → germination (sprouting) → seedling → adult plant → flowers → fruits → seeds. The cycle repeats! Some plants complete this in weeks (beans), others take years (oak trees)."}},{"id":"b35","type":"journal","data":{"plant":"Plant a bean seed in a clear plastic cup with wet paper towel. Draw what you see each day for a week. Label the parts as they grow."}}]', '"{\"base\": 55}"', 3, 'PUBLISHED')
ON CONFLICT ("questId", slug) DO NOTHING;

-- ═══════════════════════════════════════════════════════════
-- Sample Progress & XP Records
-- ═══════════════════════════════════════════════════════════

-- Ariadne (Grade 5) — completed first quest
INSERT INTO "Progress" (id, "learnerId", "questId", "lessonId", "masteryPercent", "completedAt", "lastAccessed") VALUES
  ('p000001-0000-0000-0000-000000000001', 'lp000001-0000-0000-0000-000000000001', 'q000040-0000-0000-0000-000000000040', 'l000010-0000-0000-0000-000000000010', 100, NOW(), NOW()),
  ('p000002-0000-0000-0000-000000000002', 'lp000001-0000-0000-0000-000000000001', 'q000040-0000-0000-0000-000000000040', 'l000011-0000-0000-0000-000000000011', 100, NOW(), NOW()),
  ('p000003-0000-0000-0000-000000000003', 'lp000001-0000-0000-0000-000000000001', 'q000060-0000-0000-0000-000000000060', 'l000020-0000-0000-0000-000000000020', 80, NULL, NOW())
ON CONFLICT DO NOTHING;

-- Ariyana (Grade 2) — completed first quest
INSERT INTO "Progress" (id, "learnerId", "questId", "lessonId", "masteryPercent", "completedAt", "lastAccessed") VALUES
  ('p000010-0000-0000-0000-000000000010', 'lp000002-0000-0000-0000-000000000002', 'q000001-0000-0000-0000-000000000001', 'l000001-0000-0000-0000-000000000001', 100, NOW(), NOW()),
  ('p000011-0000-0000-0000-000000000011', 'lp000002-0000-0000-0000-000000000002', 'q000001-0000-0000-0000-000000000001', 'l000002-0000-0000-0000-000000000002', 90, NOW(), NOW()),
  ('p000012-0000-0000-0000-000000000012', 'lp000002-0000-0000-0000-000000000002', 'q000001-0000-0000-0000-000000000001', 'l000003-0000-0000-0000-000000000003', 60, NULL, NOW())
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════
-- RLS (Row Level Security) — optional but recommended
-- ═══════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE "Guild" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LearnerProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Theme" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Quest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Lesson" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Progress" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "XpRecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Badge" ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now — tighten in production)
DO $$ BEGIN
  CREATE POLICY "Allow all" ON "Guild" FOR ALL USING (true);
  CREATE POLICY "Allow all" ON "User" FOR ALL USING (true);
  CREATE POLICY "Allow all" ON "LearnerProfile" FOR ALL USING (true);
  CREATE POLICY "Allow all" ON "Theme" FOR ALL USING (true);
  CREATE POLICY "Allow all" ON "Quest" FOR ALL USING (true);
  CREATE POLICY "Allow all" ON "Lesson" FOR ALL USING (true);
  CREATE POLICY "Allow all" ON "Progress" FOR ALL USING (true);
  CREATE POLICY "Allow all" ON "XpRecord" FOR ALL USING (true);
  CREATE POLICY "Allow all" ON "Badge" FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ═══════════════════════════════════════════════════════════
-- ✅ DONE! Run SELECT to verify:
-- ═══════════════════════════════════════════════════════════
-- SELECT 'Guilds' as table_name, count(*) FROM "Guild"
-- UNION ALL SELECT 'Users', count(*) FROM "User"
-- UNION ALL SELECT 'LearnerProfiles', count(*) FROM "LearnerProfile"
-- UNION ALL SELECT 'Themes', count(*) FROM "Theme"
-- UNION ALL SELECT 'Quests', count(*) FROM "Quest"
-- UNION ALL SELECT 'Lessons', count(*) FROM "Lesson"
-- UNION ALL SELECT 'Progress', count(*) FROM "Progress";
