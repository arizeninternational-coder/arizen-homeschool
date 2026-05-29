import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/api-guard";
export const dynamic = "force-dynamic";

const RULES = [
  { action: "complete_lesson", coins: 10, xp: 50, description: "Completing a lesson" },
  { action: "complete_reflection", coins: 5, xp: 30, description: "Completing a reflection" },
  { action: "complete_quest", coins: 30, xp: 150, description: "Completing a quest" },
  { action: "complete_theme", coins: 50, xp: 300, description: "Completing a theme" },
  { action: "three_day_streak", coins: 15, xp: 0, description: "3-day streak bonus" },
  { action: "seven_day_streak", coins: 40, xp: 0, description: "7-day streak bonus" },
  { action: "parent_approved_activity", coins: 20, xp: 0, description: "Parent-approved activity" },
];

const ITEMS = [
  { name: "Math Wizard Hat", description: "A magical hat for math wizards", category: "HATS", price: 50, rarity: "RARE", emoji: "🎩", unlockType: "LESSON_COUNT", unlockRequirement: 5, unlockDescription: "Complete 5 math lessons" },
  { name: "Explorer Telescope", description: "See the stars up close", category: "LEARNING_TOOLS", price: 80, rarity: "RARE", emoji: "🔭", unlockType: "LESSON_COUNT", unlockRequirement: 3, unlockDescription: "Complete 3 science lessons" },
  { name: "Scientist Goggles", description: "For serious experiments", category: "GLASSES", price: 60, rarity: "RARE", emoji: "🥽", unlockType: "LESSON_COUNT", unlockRequirement: 3, unlockDescription: "Complete 3 science lessons" },
  { name: "Storyteller Cape", description: "A cape for great storytellers", category: "CLOTHING", price: 70, rarity: "EPIC", emoji: "🧥", unlockType: "LESSON_COUNT", unlockRequirement: 5, unlockDescription: "Complete 5 reading lessons" },
  { name: "Artist Brush", description: "Paint your imagination", category: "LEARNING_TOOLS", price: 40, rarity: "COMMON", emoji: "🖌️", unlockType: "ALWAYS_AVAILABLE", unlockRequirement: 0 },
  { name: "Nature Guardian Backpack", description: "Carry your nature finds", category: "ACCESSORIES", price: 55, rarity: "RARE", emoji: "🎒", unlockType: "LESSON_COUNT", unlockRequirement: 3, unlockDescription: "Complete 3 environmental lessons" },
  { name: "Reading Champion Glasses", description: "See stories more clearly", category: "GLASSES", price: 45, rarity: "COMMON", emoji: "👓", unlockType: "LESSON_COUNT", unlockRequirement: 3, unlockDescription: "Complete 3 reading lessons" },
  { name: "Safari Explorer Hat", description: "Ready for adventure", category: "HATS", price: 35, rarity: "COMMON", emoji: "🧢", unlockType: "ALWAYS_AVAILABLE", unlockRequirement: 0 },
  { name: "Space Background", description: "Explore the cosmos", category: "BACKGROUNDS", price: 100, rarity: "EPIC", emoji: "🚀", unlockType: "XP_THRESHOLD", unlockRequirement: 500, unlockDescription: "Earn 500 XP" },
  { name: "Library Background", description: "A cozy reading nook", category: "BACKGROUNDS", price: 80, rarity: "RARE", emoji: "📚", unlockType: "LESSON_COUNT", unlockRequirement: 10, unlockDescription: "Complete 10 reading lessons" },
  { name: "Forest Background", description: "A peaceful forest scene", category: "BACKGROUNDS", price: 80, rarity: "RARE", emoji: "🌲", unlockType: "LESSON_COUNT", unlockRequirement: 5, unlockDescription: "Complete 5 environmental lessons" },
  { name: "Science Lab Background", description: "Your personal lab", category: "BACKGROUNDS", price: 120, rarity: "EPIC", emoji: "🔬", unlockType: "LESSON_COUNT", unlockRequirement: 10, unlockDescription: "Complete 10 science lessons" },
  { name: "Robot Companion", description: "A friendly robot friend", category: "PETS", price: 150, rarity: "LEGENDARY", emoji: "🤖", unlockType: "LESSON_COUNT", unlockRequirement: 20, unlockDescription: "Complete 20 lessons" },
  { name: "Rabbit Companion", description: "A fluffy bunny friend", category: "PETS", price: 90, rarity: "RARE", emoji: "🐰", unlockType: "LESSON_COUNT", unlockRequirement: 10, unlockDescription: "Complete 10 lessons" },
  { name: "Soccer Boots", description: "Ready for the pitch", category: "SHOES", price: 30, rarity: "COMMON", emoji: "👟", unlockType: "ALWAYS_AVAILABLE", unlockRequirement: 0 },
  { name: "Creative Crown", description: "A crown for creative minds", category: "HATS", price: 200, rarity: "LEGENDARY", emoji: "👑", unlockType: "LESSON_COUNT", unlockRequirement: 50, unlockDescription: "Complete 50 lessons" },
  { name: "Kindness Hoodie", description: "Wear your kindness", category: "CLOTHING", price: 45, rarity: "COMMON", emoji: "🧤", unlockType: "ALWAYS_AVAILABLE", unlockRequirement: 0 },
  { name: "Star Backpack", description: "Carry your spark", category: "ACCESSORIES", price: 50, rarity: "RARE", emoji: "⭐", unlockType: "QUEST_COUNT", unlockRequirement: 5, unlockDescription: "Complete 5 quests" },
  { name: "Globe Explorer Tool", description: "Explore the world", category: "LEARNING_TOOLS", price: 65, rarity: "RARE", emoji: "🌍", unlockType: "LESSON_COUNT", unlockRequirement: 5, unlockDescription: "Complete 5 geography lessons" },
  { name: "Music Maker Headphones", description: "Tune into creativity", category: "ACCESSORIES", price: 55, rarity: "RARE", emoji: "🎧", unlockType: "LESSON_COUNT", unlockRequirement: 5, unlockDescription: "Complete 5 creative arts lessons" },
];

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;
  const res = { rulesCreated: 0, rulesSkipped: 0, itemsCreated: 0, itemsSkipped: 0 };

  for (const r of RULES) {
    const { data: ex } = await supabase.from("RewardRule").select("id").eq("action", r.action).single();
    if (ex) { res.rulesSkipped++; } else { await supabase.from("RewardRule").insert(r); res.rulesCreated++; }
  }
  for (const it of ITEMS) {
    const { data: ex } = await supabase.from("AvatarItem").select("id").eq("name", it.name).single();
    if (ex) { res.itemsSkipped++; } else { await supabase.from("AvatarItem").insert(it); res.itemsCreated++; }
  }

  return NextResponse.json({ success: true, message: `Seeded ${res.rulesCreated} rules, ${res.itemsCreated} items. Skipped ${res.rulesSkipped + res.itemsSkipped} existing.`, results: res });
}
