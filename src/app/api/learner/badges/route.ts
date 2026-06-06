// GET /api/learner/badges — Get learner badges (earned + available with progress)
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAuthUser } from "@/lib/api-guard";
export const dynamic = "force-dynamic";

// Badge definitions — single source of truth for badge rules
// These are NOT database templates; they're code-level definitions.
// The actual earned badges live in the Badge table (learner-owned records).
const BADGE_DEFINITIONS = [
  {
    type: "first_lesson",
    name: "First Lesson",
    description: "Complete your first lesson",
    icon: "🎯",
    color: "#6D28D9",
    category: "milestone",
    requirement: { type: "lessons", count: 1 },
  },
  {
    type: "five_lessons",
    name: "5 Lessons",
    description: "Complete 5 lessons",
    icon: "⭐",
    color: "#D97706",
    category: "milestone",
    requirement: { type: "lessons", count: 5 },
  },
  {
    type: "three_day_streak",
    name: "3-Day Streak",
    description: "Reach a 3-day learning streak",
    icon: "🔥",
    color: "#E11D48",
    category: "streak",
    requirement: { type: "streak", count: 3 },
  },
  {
    type: "hundred_xp",
    name: "100 XP",
    description: "Earn 100 XP",
    icon: "💎",
    color: "#2563EB",
    category: "xp",
    requirement: { type: "xp", count: 100 },
  },
];

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!user.learnerProfileId) {
      return NextResponse.json({
        badges: BADGE_DEFINITIONS.map((b) => ({ ...b, earned: false, progress: 0 })),
        earnedCount: 0,
        totalCount: BADGE_DEFINITIONS.length,
      });
    }

    const learnerId = user.learnerProfileId;

    // Fetch earned badges
    const { data: earnedBadges } = await supabase
      .from("Badge")
      .select("badgeType, name, description, awardedAt")
      .eq("learnerId", learnerId)
      .order("awardedAt", { ascending: false });

    const earnedTypes = new Set((earnedBadges || []).map((b: any) => b.badgeType));

    // Fetch current stats for progress calculation
    const [{ count: completedLessons }, { data: profile }] = await Promise.all([
      supabase
        .from("Progress")
        .select("id", { count: "exact", head: true })
        .eq("learnerId", learnerId)
        .not("completedAt", "is", null),
      supabase
        .from("LearnerProfile")
        .select("totalXp, currentStreak")
        .eq("id", learnerId)
        .maybeSingle(),
    ]);

    const lessonsDone = completedLessons || 0;
    const xpTotal = profile?.totalXp || 0;
    const streakDays = profile?.currentStreak || 0;

    // Build full badge list with earned status and progress
    const badges = BADGE_DEFINITIONS.map((def) => {
      const isEarned = earnedTypes.has(def.type);
      let progress = 0;
      const reqCount = def.requirement.count;
      switch (def.requirement.type) {
        case "lessons":
          progress = Math.min(lessonsDone, reqCount);
          break;
        case "streak":
          progress = Math.min(streakDays, reqCount);
          break;
        case "xp":
          progress = Math.min(xpTotal, reqCount);
          break;
      }
      const awardedAt =
        earnedBadges?.find((b: any) => b.badgeType === def.type)?.awardedAt || null;
      return {
        ...def,
        earned: isEarned,
        progress,
        total: reqCount,
        awardedAt,
      };
    });

    const earnedCount = badges.filter((b) => b.earned).length;

    return NextResponse.json({
      badges,
      earnedCount,
      totalCount: BADGE_DEFINITIONS.length,
      stats: { lessonsDone, xpTotal, streakDays },
    });
  } catch (err: any) {
    console.error("[BADGES] Error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch badges" }, { status: 500 });
  }
}
