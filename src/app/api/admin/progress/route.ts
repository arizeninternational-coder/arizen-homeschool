// GET /api/admin/progress — Aggregate progress stats for admin dashboard
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/api-guard";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;

    // Total completed lessons (all learners)
    const { count: totalCompleted } = await supabase
      .from("Progress")
      .select("id", { count: "exact", head: true })
      .not("completedAt", "is", null);

    // Active learners (completed at least one lesson)
    const { data: activeLearners } = await supabase
      .from("Progress")
      .select("learnerId", { count: "exact", head: true })
      .not("completedAt", "is", null);

    // Learners active today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: activeToday } = await supabase
      .from("Progress")
      .select("learnerId", { count: "exact", head: true })
      .gte("lastAccessed", today.toISOString());

    // Total XP awarded
    const { data: xpSum } = await supabase
      .from("XpRecord")
      .select("amount");
    const totalXp = (xpSum || []).reduce((sum, r) => sum + (r.amount || 0), 0);

    // Total coins earned
    const { data: coinSum } = await supabase
      .from("CoinTransaction")
      .select("amount")
      .eq("type", "EARNED");
    const totalCoins = (coinSum || []).reduce((sum, r) => sum + (r.amount || 0), 0);

    // Top learners by XP
    const { data: topLearners } = await supabase
      .from("LearnerProfile")
      .select("id, displayName, totalXp, currentStreak")
      .order("totalXp", { ascending: false })
      .limit(10);

    return NextResponse.json({
      totalCompletedLessons: totalCompleted || 0,
      activeLearners: activeLearners || 0,
      activeToday: activeToday || 0,
      totalXpAwarded: totalXp,
      totalCoinsAwarded: totalCoins,
      topLearners: topLearners || [],
    });
  } catch (err: any) {
    console.error("[ADMIN_PROGRESS] Error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch progress stats" }, { status: 500 });
  }
}
