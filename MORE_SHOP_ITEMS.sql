-- Additional shop items (run in Supabase SQL Editor)
-- Safe to run multiple times (uses ON CONFLICT)

INSERT INTO "AvatarItem" (name, description, category, price, rarity, emoji, "unlockType", "unlockRequirement", "unlockDescription") VALUES
  ('Pet Cat', 'A cuddly cat friend', 'PETS', 80, 'RARE', '🐱', 'LESSON_COUNT', 10, 'Complete 10 lessons'),
  ('Pet Chihuahua', 'A tiny loyal companion', 'PETS', 100, 'EPIC', '🐕', 'LESSON_COUNT', 15, 'Complete 15 lessons'),
  ('Pet Dog', 'A friendly dog buddy', 'PETS', 120, 'EPIC', '🐶', 'LESSON_COUNT', 20, 'Complete 20 lessons'),
  ('Cool Sneakers', 'Stylish kicks for learning', 'SHOES', 45, 'COMMON', '👟', 'ALWAYS_AVAILABLE', 0, NULL),
  ('Running Shoes', 'Speed up your learning', 'SHOES', 55, 'RARE', '🏃', 'LESSON_COUNT', 5, 'Complete 5 lessons'),
  ('Backpack', 'Carry your supplies', 'ACCESSORIES', 35, 'COMMON', '🎒', 'ALWAYS_AVAILABLE', 0, NULL),
  ('Cool Hat', 'Look sharp while learning', 'HATS', 30, 'COMMON', '🧢', 'ALWAYS_AVAILABLE', 0, NULL),
  ('Sunglasses', 'Too cool for school', 'GLASSES', 40, 'COMMON', '🕶️', 'ALWAYS_AVAILABLE', 0, NULL),
  ('Graphic T-Shirt', 'Express yourself', 'CLOTHING', 25, 'COMMON', '👕', 'ALWAYS_AVAILABLE', 0, NULL),
  ('Denim Jacket', 'Stay warm and stylish', 'CLOTHING', 60, 'RARE', '🧥', 'LESSON_COUNT', 8, 'Complete 8 lessons'),
  ('Comfy Shorts', 'Perfect for learning', 'CLOTHING', 20, 'COMMON', '🩳', 'ALWAYS_AVAILABLE', 0, NULL),
  ('Trousers', 'Classic learning outfit', 'CLOTHING', 30, 'COMMON', '👖', 'ALWAYS_AVAILABLE', 0, NULL),
  ('Skirt', 'Twirl into learning', 'CLOTHING', 28, 'COMMON', '👗', 'ALWAYS_AVAILABLE', 0, NULL),
  ('Magic Book', 'A book of wonders', 'LEARNING_TOOLS', 70, 'RARE', '📖', 'LESSON_COUNT', 10, 'Complete 10 lessons'),
  ('Water Bottle', 'Stay hydrated', 'ACCESSORIES', 15, 'COMMON', '🧴', 'ALWAYS_AVAILABLE', 0, NULL),
  ('Super Cape', 'Feel like a hero', 'SPECIAL', 250, 'LEGENDARY', '🦸', 'LESSON_COUNT', 50, 'Complete 50 lessons'),
  ('Star Badge', 'You are a star', 'SPECIAL', 180, 'LEGENDARY', '🌟', 'QUEST_COUNT', 10, 'Complete 10 quests'),
  ('Magic Wand', 'Wave it and learn', 'LEARNING_TOOLS', 90, 'EPIC', '🪄', 'LESSON_COUNT', 15, 'Complete 15 lessons')
ON CONFLICT DO NOTHING;
