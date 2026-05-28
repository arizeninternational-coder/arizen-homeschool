-- Migration: Add Spark Coins reward system, avatar system, and shop system
-- Created: 2026-05-28
-- Tables: student_wallet, coin_transaction, student_avatar, avatar_item, student_inventory, reward_rule, coin_award_tracking

-- ── Create ENUM types ──────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE wallet_transaction_type AS ENUM ('EARNED', 'SPENT', 'BONUS', 'ADJUSTMENT');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE wallet_transaction_source AS ENUM ('LESSON', 'QUEST', 'REFLECTION', 'THEME', 'STREAK', 'SHOP_PURCHASE', 'PARENT_REWARD', 'BONUS', 'ADJUSTMENT');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE avatar_item_category AS ENUM ('BASE_AVATAR', 'HAIR', 'CLOTHING', 'HATS', 'SHOES', 'GLASSES', 'ACCESSORIES', 'LEARNING_TOOLS', 'BACKGROUNDS', 'PETS');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE avatar_item_rarity AS ENUM ('COMMON', 'RARE', 'EPIC', 'LEGENDARY');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE avatar_unlock_type AS ENUM ('ALWAYS_AVAILABLE', 'COINS_ONLY', 'LESSON_COUNT', 'QUEST_COUNT', 'STREAK_DAYS', 'XP_THRESHOLD', 'BADGE_COUNT');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── student_wallet ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS student_wallet (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id      UUID NOT NULL REFERENCES learner_profile(id) ON DELETE CASCADE,
  balance         INTEGER NOT NULL DEFAULT 0,
  lifetime_earned INTEGER NOT NULL DEFAULT 0,
  lifetime_spent  INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (learner_id)
);

CREATE INDEX IF NOT EXISTS idx_student_wallet_learner_id ON student_wallet(learner_id);

-- ── coin_transaction ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS coin_transaction (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id      UUID NOT NULL REFERENCES student_wallet(learner_id) ON DELETE CASCADE,
  amount          INTEGER NOT NULL,
  type            wallet_transaction_type NOT NULL,
  source          wallet_transaction_source NOT NULL,
  source_id       UUID,
  description     TEXT,
  balance_after   INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coin_transaction_learner_id ON coin_transaction(learner_id);
CREATE INDEX IF NOT EXISTS idx_coin_transaction_created_at ON coin_transaction(created_at);

-- ── student_avatar ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS student_avatar (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id            UUID NOT NULL REFERENCES learner_profile(id) ON DELETE CASCADE,
  base_avatar           VARCHAR(255) NOT NULL DEFAULT 'default',
  skin_tone             VARCHAR(50) NOT NULL DEFAULT 'medium',
  hair_style            VARCHAR(50) NOT NULL DEFAULT 'short',
  hair_color            VARCHAR(50) NOT NULL DEFAULT 'brown',
  face_expression       VARCHAR(50) NOT NULL DEFAULT 'smile',
  equipped_hat_id       UUID,
  equipped_top_id       UUID,
  equipped_bottom_id    UUID,
  equipped_shoes_id     UUID,
  equipped_glasses_id   UUID,
  equipped_accessory_id UUID,
  equipped_tool_id      UUID,
  equipped_pet_id       UUID,
  equipped_background_id UUID,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (learner_id)
);

CREATE INDEX IF NOT EXISTS idx_student_avatar_learner_id ON student_avatar(learner_id);

-- ── avatar_item ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS avatar_item (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  VARCHAR(255) NOT NULL,
  description           TEXT,
  category              avatar_item_category NOT NULL,
  price                 INTEGER NOT NULL DEFAULT 0,
  rarity                avatar_item_rarity NOT NULL DEFAULT 'COMMON',
  emoji                 VARCHAR(10) NOT NULL DEFAULT '🎁',
  icon_url              TEXT,
  layer_image_url       TEXT,
  preview_image_url     TEXT,
  is_active             BOOLEAN NOT NULL DEFAULT TRUE,
  unlock_type           avatar_unlock_type NOT NULL DEFAULT 'ALWAYS_AVAILABLE',
  unlock_requirement    INTEGER NOT NULL DEFAULT 0,
  unlock_description    TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── student_inventory ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS student_inventory (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id      UUID NOT NULL,
  avatar_item_id  UUID NOT NULL REFERENCES avatar_item(id) ON DELETE CASCADE,
  equipped        BOOLEAN NOT NULL DEFAULT FALSE,
  purchased_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (learner_id, avatar_item_id)
);

CREATE INDEX IF NOT EXISTS idx_student_inventory_learner_id ON student_inventory(learner_id);

-- ── reward_rule ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS reward_rule (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action          VARCHAR(100) NOT NULL,
  coins           INTEGER NOT NULL DEFAULT 0,
  xp              INTEGER NOT NULL DEFAULT 0,
  daily_limit     INTEGER NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  description     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (action)
);

-- ── coin_award_tracking ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS coin_award_tracking (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id      UUID NOT NULL,
  source_type     VARCHAR(100) NOT NULL,
  source_id       UUID NOT NULL,
  awarded_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (learner_id, source_type, source_id)
);

CREATE INDEX IF NOT EXISTS idx_coin_award_tracking_learner_id ON coin_award_tracking(learner_id);
