// GET /api/learner/leaderboard — Get leaderboard with rankings
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { withAuth } from "@/lib/api-guard";
export const dynamic = "force-dynamic";

export const GET = withAuth(async (req, user) => {
  try {
    const { searchParams } = new URL(req.url);
    const sortBy = searchParams.get("sort") || "xp"; // xp, streak, badges, lessons, reflections, coins, quests

    // Get all learner profiles with their wallets (for coins)
    const { data: learners, error } = await supabase
      .from("LearnerProfile")
      .select("id, displayName, grade, totalXp, currentStreak, bestStreak, lastActivityDate, avatarUrl")
      .order("totalXp", { ascending: false })
      .limit(50);

    if (error) throw error;

    // Get wallet balances for coins
    const learnerIds = (learners || []).map((l: any) => l.id);
    const { data: wallets } = await supabase
      .from("StudentWallet")
      .select("studentId, balance")
      .in("studentId", learnerIds);

    const walletMap = new Map((wallets || []).map((w: any) => [w.studentId, w.balance || 0]));

    // Get badge counts per learner
    const { data: badgeCounts } = await supabase
      .from("Badge")
      .select("learnerId")
      .in("learnerId", learnerIds);

    const badgeMap = new Map<string, number>();
    (badgeCounts || []).forEach((b: any) => {
      badgeMap.set(b.learnerId, (badgeMap.get(b.learnerId) || 0) + 1);
    });

    // Get lesson completion counts
    const { data: lessonCounts } = await supabase
      .from("Progress")
      .select("learnerId")
      .in("learnerId", learnerIds)
      .not("completedAt", "is", null);

    const lessonMap = new Map<string, number>();
    (lessonCounts || []).forEach((p: any) => {
      lessonMap.set(p.learnerId, (lessonMap.get(p.learnerId) || 0) + 1);
    });

    // Build leaderboard entries
    let entries = (learners || []).map((l: any) => ({
      id: l.id,
      name: l.displayName || "Learner",
      grade: l.grade,
      xp: l.totalXp || 0,
      streak: l.currentStreak || 0,
      bestStreak: l.bestStreak || 0,
      badges: badgeMap.get(l.id) || 0,
      lessonsCompleted: lessonMap.get(l.id) || 0,
      coins: walletMap.get(l.id) || 0,
      lastActive: l.lastActivityDate,
      isCurrentUser: l.id === user.learnerProfileId,
    }));

    // Sort by requested field
    const sortMap: Record<string, (a: any, b: any) => number> = {
      xp: (a, b) => b.xp - a.xp,
      streak: (a, b) => b.streak - a.streak,
      badges: (a, b) => b.badges - a.badges,
      lessons: (a, b) => b.lessonsCompleted - a.lessonsCompleted,
      coins: (a, b) => b.coins - a.coins,
    };

    entries = entries.sort(sortMap[sortBy] || sortMap.xp);

    // Add ranks
    entries = entries.map((e, i) => ({ ...e, rank: i + 1 }));

    return NextResponse.json({ entries, sortBy, total: entries.length });
  } catch (err: any) {
    console.error("[LEADERBOARD] Error:", err);
    return NextResponse.json({ entries: [] });
  }
});
