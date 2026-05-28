-- ============================================================
-- Arizen Homeschool: Spark Coins, Avatar & Shop System
-- Run this ENTIRE script in Supabase: SQL Editor -> New Query
-- Safe to run multiple times (idempotent)
-- ============================================================


-- ── Create ENUM types ────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE "WalletTransactionType" AS ENUM ('EARNED', 'SPENT', 'BONUS', 'ADJUSTMENT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "WalletTransactionSource" AS ENUM (
    'LESSON', 'QUEST', 'REFLECTION', 'THEME', 'STREAK',
    'SHOP_PURCHASE', 'PARENT_REWARD', 'BONUS', 'ADJUSTMENT'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "AvatarItemCategory" AS ENUM (
    'BASE_AVATAR', 'HAIR', 'CLOTHING', 'HATS', 'SHOES',
    'GLASSES', 'ACCESSORIES', 'LEARNING_TOOLS', 'BACKGROUNDS', 'PETS'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "AvatarItemRarity" AS ENUM ('COMMON', 'RARE', 'EPIC', 'LEGENDARY');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "AvatarUnlockType" AS ENUM (
    'ALWAYS_AVAILABLE', 'COINS_ONLY', 'LESSON_COUNT',
    'QUEST_COUNT', 'STREAK_DAYS', 'XP_THRESHOLD', 'BADGE_COUNT'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ── Student Wallet ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "StudentWallet" (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "learnerId"     UUID NOT NULL UNIQUE REFERENCES "LearnerProfile"(id) ON DELETE CASCADE,
  balance         INTEGER NOT NULL DEFAULT 0,
  "lifetimeEarned" INTEGER NOT NULL DEFAULT 0,
  "lifetimeSpent"  INTEGER NOT NULL DEFAULT 0,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_student_wallet_learner ON "StudentWallet"("learnerId");


-- ── Coin Transaction Ledger ──────────────────────────────────
CREATE TABLE IF NOT EXISTS "CoinTransaction" (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "learnerId"     UUID NOT NULL REFERENCES "StudentWallet"("learnerId") ON DELETE CASCADE,
  amount          INTEGER NOT NULL,
  type            "WalletTransactionType" NOT NULL DEFAULT 'EARNED',
  source          "WalletTransactionSource" NOT NULL DEFAULT 'BONUS',
  "sourceId"      VARCHAR(100),
  description     TEXT,
  "balanceAfter"  INTEGER NOT NULL DEFAULT 0,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coin_tx_learner ON "CoinTransaction"("learnerId");
CREATE INDEX IF NOT EXISTS idx_coin_tx_created ON "CoinTransaction"("createdAt");


-- ── Student Avatar ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "StudentAvatar" (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "learnerId"           UUID NOT NULL UNIQUE REFERENCES "LearnerProfile"(id) ON DELETE CASCADE,
  "baseAvatar"          VARCHAR(50) NOT NULL DEFAULT 'default',
  "skinTone"            VARCHAR(30) NOT NULL DEFAULT 'medium',
  "hairStyle"           VARCHAR(30) NOT NULL DEFAULT 'short',
  "hairColor"           VARCHAR(30) NOT NULL DEFAULT 'brown',
  "faceExpression"      VARCHAR(30) NOT NULL DEFAULT 'smile',
  "equippedHatId"       UUID,
  "equippedTopId"       UUID,
  "equippedBottomId"    UUID,
  "equippedShoesId"     UUID,
  "equippedGlassesId"   UUID,
  "equippedAccessoryId" UUID,
  "equippedToolId"      UUID,
  "equippedPetId"       UUID,
  "equippedBackgroundId" UUID,
  "updatedAt"           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_student_avatar_learner ON "StudentAvatar"("learnerId");


-- ── Avatar Shop Items ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "AvatarItem" (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  VARCHAR(100) NOT NULL,
  description           TEXT,
  category              "AvatarItemCategory" NOT NULL DEFAULT 'ACCESSORIES',
  price                 INTEGER NOT NULL DEFAULT 0,
  rarity                "AvatarItemRarity" NOT NULL DEFAULT 'COMMON',
  emoji                 VARCHAR(10) NOT NULL DEFAULT '🎁',
  "iconUrl"             TEXT,
  "layerImageUrl"       TEXT,
  "previewImageUrl"     TEXT,
  "isActive"            BOOLEAN NOT NULL DEFAULT TRUE,
  "unlockType"          "AvatarUnlockType" NOT NULL DEFAULT 'ALWAYS_AVAILABLE',
  "unlockRequirement"   INTEGER NOT NULL DEFAULT 0,
  "unlockDescription"   TEXT,
  "createdAt"           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ── Student Inventory ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "StudentInventory" (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "learnerId"     UUID NOT NULL,
  "avatarItemId"  UUID NOT NULL REFERENCES "AvatarItem"(id) ON DELETE CASCADE,
  equipped        BOOLEAN NOT NULL DEFAULT FALSE,
  "purchasedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE("learnerId", "avatarItemId")
);

CREATE INDEX IF NOT EXISTS idx_student_inventory_learner ON "StudentInventory"("learnerId");


-- ── Reward Rules ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "RewardRule" (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action          VARCHAR(60) NOT NULL UNIQUE,
  coins           INTEGER NOT NULL DEFAULT 0,
  xp              INTEGER NOT NULL DEFAULT 0,
  "dailyLimit"    INTEGER NOT NULL DEFAULT 0,
  "isActive"      BOOLEAN NOT NULL DEFAULT TRUE,
  description     TEXT,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ── Coin Award Tracking (prevents duplicate rewards) ─────────
CREATE TABLE IF NOT EXISTS "CoinAwardTracking" (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "learnerId"     VARCHAR(100) NOT NULL,
  "sourceType"    VARCHAR(60) NOT NULL,
  "sourceId"      VARCHAR(100) NOT NULL,
  "awardedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE("learnerId", "sourceType", "sourceId")
);

CREATE INDEX IF NOT EXISTS idx_coin_award_learner ON "CoinAwardTracking"("learnerId");


-- ── Seed Default Reward Rules ────────────────────────────────
INSERT INTO "RewardRule" (action, coins, xp, description) VALUES
  ('complete_lesson',          10,  50, 'Awarded for completing a lesson'),
  ('complete_reflection',       5,  30, 'Awarded for completing a reflection'),
  ('complete_quest',           30, 150, 'Awarded for completing a quest'),
  ('complete_theme',           50, 300, 'Awarded for completing a full theme'),
  ('three_day_streak',         15,   0, 'Bonus for 3-day learning streak'),
  ('seven_day_streak',         40,   0, 'Bonus for 7-day learning streak'),
  ('parent_approved_activity', 20,   0, 'Parent-approved offline activity')
ON CONFLICT (action) DO NOTHING;


-- ── Seed Default Avatar Shop Items (20 items) ────────────────
INSERT INTO "AvatarItem" (name, description, category, price, rarity, emoji, "unlockType", "unlockRequirement", "unlockDescription") VALUES
  ('Math Wizard Hat',            'A magical hat for math wizards',               'HATS',            50,  'RARE',      '🎩', 'LESSON_COUNT', 5,  'Complete 5 math lessons'),
  ('Explorer Telescope',         'See the stars up close',                       'LEARNING_TOOLS',  80,  'RARE',      '🔭', 'LESSON_COUNT', 3,  'Complete 3 science lessons'),
  ('Scientist Goggles',          'For serious experiments',                      'GLASSES',         60,  'RARE',      '🥽', 'LESSON_COUNT', 3,  'Complete 3 science lessons'),
  ('Storyteller Cape',           'A cape for great storytellers',                'CLOTHING',        70,  'EPIC',      '🧥', 'LESSON_COUNT', 5,  'Complete 5 reading lessons'),
  ('Artist Brush',               'Paint your imagination',                       'LEARNING_TOOLS',  40,  'COMMON',    '🖌️', 'ALWAYS_AVAILABLE', 0, NULL),
  ('Nature Guardian Backpack',   'Carry your nature finds',                      'ACCESSORIES',     55,  'RARE',      '🎒', 'LESSON_COUNT', 3,  'Complete 3 environmental lessons'),
  ('Reading Champion Glasses',   'See stories more clearly',                     'GLASSES',         45,  'COMMON',    '👓', 'LESSON_COUNT', 3,  'Complete 3 reading lessons'),
  ('Safari Explorer Hat',        'Ready for adventure',                          'HATS',            35,  'COMMON',    '🧢', 'ALWAYS_AVAILABLE', 0, NULL),
  ('Space Background',           'Explore the cosmos',                           'BACKGROUNDS',     100, 'EPIC',      '🚀', 'XP_THRESHOLD', 500, 'Earn 500 XP'),
  ('Library Background',         'A cozy reading nook',                          'BACKGROUNDS',     80,  'RARE',      '📚', 'LESSON_COUNT', 10, 'Complete 10 reading lessons'),
  ('Forest Background',          'A peaceful forest scene',                      'BACKGROUNDS',     80,  'RARE',      '🌲', 'LESSON_COUNT', 5,  'Complete 5 environmental lessons'),
  ('Science Lab Background',     'Your personal lab',                            'BACKGROUNDS',     120, 'EPIC',      '🔬', 'LESSON_COUNT', 10, 'Complete 10 science lessons'),
  ('Robot Companion',            'A friendly robot friend',                      'PETS',            150, 'LEGENDARY', '🤖', 'LESSON_COUNT', 20, 'Complete 20 lessons'),
  ('Rabbit Companion',           'A fluffy bunny friend',                        'PETS',            90,  'RARE',      '🐰', 'LESSON_COUNT', 10, 'Complete 10 lessons'),
  ('Soccer Boots',               'Ready for the pitch',                          'SHOES',           30,  'COMMON',    '👟', 'ALWAYS_AVAILABLE', 0, NULL),
  ('Creative Crown',             'A crown for creative minds',                   'HATS',            200, 'LEGENDARY', '👑', 'LESSON_COUNT', 50, 'Complete 50 lessons'),
  ('Kindness Hoodie',            'Wear your kindness',                           'CLOTHING',        45,  'COMMON',    '🧤', 'ALWAYS_AVAILABLE', 0, NULL),
  ('Star Backpack',              'Carry your spark',                             'ACCESSORIES',     50,  'RARE',      '⭐', 'QUEST_COUNT',   5,  'Complete 5 quests'),
  ('Globe Explorer Tool',        'Explore the world',                            'LEARNING_TOOLS',  65,  'RARE',      '🌍', 'LESSON_COUNT', 5,  'Complete 5 geography lessons'),
  ('Music Maker Headphones',     'Tune into creativity',                         'ACCESSORIES',     55,  'RARE',      '🎧', 'LESSON_COUNT', 5,  'Complete 5 creative arts lessons')
ON CONFLICT DO NOTHING;


-- ✅ Done! Tables created:
--    StudentWallet, CoinTransaction, StudentAvatar, AvatarItem,
--    StudentInventory, RewardRule, CoinAwardTracking
--    + 7 reward rules + 20 shop items seeded

-- ── Emotional Checkins (added Day 2) ─────────────────────────
CREATE TABLE IF NOT EXISTS "EmotionalCheckin" (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "learnerId"     UUID NOT NULL REFERENCES "LearnerProfile"(id) ON DELETE CASCADE,
  emotion         VARCHAR(20) NOT NULL,
  "emotionLabel"  VARCHAR(30) NOT NULL,
  note            TEXT,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_emotional_checkin_learner ON "EmotionalCheckin"("learnerId");
CREATE INDEX IF NOT EXISTS idx_emotional_checkin_created ON "EmotionalCheckin"("createdAt");
