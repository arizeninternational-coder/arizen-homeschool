// POST /api/xp/award — Award XP to learner
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { withAuthPost } from "@/lib/api-guard";
import { updateStreak, awardXp } from "@/lib/auth/utils";
export const dynamic = "force-dynamic";

export const POST = withAuthPost(async (req, user, body: any) => {
  try {
    if (!user.learnerProfileId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { amount, sourceType, sourceId, description } = body;
    const learnerId = user.learnerProfileId;

    if (!amount || amount <= 0) return NextResponse.json({ error: "Invalid XP amount" }, { status: 400 });

    // Award base XP
    await awardXp(learnerId, amount, sourceType || "BONUS", sourceId || "manual", description || `${sourceType} XP`);

    // Check streak bonus
    let streakBonus = 0;
    await updateStreak(learnerId);

    // Get updated profile for streak info
    const { data: profile } = await supabase
      .from("LearnerProfile")
      .select("currentStreak, totalXp")
      .eq("id", learnerId)
      .single();

    if (profile) {
      const streakBonuses: Record<number, number> = { 3: 25, 7: 75, 14: 200, 30: 500 };
      streakBonus = streakBonuses[profile.currentStreak] || 0;

      if (streakBonus > 0) {
        await awardXp(learnerId, streakBonus, "STREAK", `streak_${profile.currentStreak}`, `${profile.currentStreak}-day streak bonus!`);
      }
    }

    // Check for new badges
    const newBadges = await checkAndAwardBadges(learnerId);

    return NextResponse.json({
      success: true,
      xpAwarded: amount,
      streakBonus,
      totalXp: profile?.totalXp || 0,
      newBadges,
    });
  } catch (err: any) {
    console.error("XP award error:", err);
    return NextResponse.json({ error: "Failed to award XP" }, { status: 500 });
  }
});

async function checkAndAwardBadges(learnerId: string): Promise<any[]> {
  const { data: profile } = await supabase
    .from("LearnerProfile")
    .select("totalXp, currentStreak")
    .eq("id", learnerId)
    .single();

  if (!profile) return [];

  const [{ data: lessonCount }, { data: questCount }, { data: existingBadges }] = await Promise.all([
    supabase.from("Progress").select("id", { count: "exact", head: true }).eq("learnerId", learnerId).not("lessonId", "is", null).not("completedAt", "is", null),
    supabase.from("Progress").select("id", { count: "exact", head: true }).eq("learnerId", learnerId).not("questId", "is", null).not("completedAt", "is", null),
    supabase.from("Badge").select("badgeType").eq("learnerId", learnerId),
  ]);

  const existingTypes = new Set((existingBadges || []).map((b: any) => b.badgeType));
  const newBadges: any[] = [];
  const level = Math.floor(profile.totalXp / 500) + 1;

  const thresholds: Record<string, { name: string; check: () => boolean }> = {
    first_lesson: { name: "First Step", check: () => (lessonCount?.length || 0) >= 1 },
    ten_lessons: { name: "Quick Learner", check: () => (lessonCount?.length || 0) >= 10 },
    first_quest: { name: "Quest Complete!", check: () => (questCount?.length || 0) >= 1 },
    five_quests: { name: "Quest Master", check: () => (questCount?.length || 0) >= 5 },
    streak_3: { name: "Streak Starter", check: () => profile.currentStreak >= 3 },
    streak_7: { name: "Week Warrior", check: () => profile.currentStreak >= 7 },
    xp_1000: { name: "XP Champion", check: () => profile.totalXp >= 1000 },
    xp_5000: { name: "XP Legend", check: () => profile.totalXp >= 5000 },
    level_5: { name: "Rising Star", check: () => level >= 5 },
    level_10: { name: "Mastermind", check: () => level >= 10 },
  };

  for (const [type, badge] of Object.entries(thresholds)) {
    if (!existingTypes.has(type) && badge.check()) {
      const { data: created } = await supabase.from("Badge").insert({
        learnerId, badgeType: type, name: badge.name,
        description: `${badge.name} achievement`,
      }).select().single();
      if (created) newBadges.push(created);
    }
  }

  return newBadges;
}
