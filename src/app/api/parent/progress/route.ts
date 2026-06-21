// GET /api/parent/progress — Get progress summaries for all linked children
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAuthUser } from "@/lib/api-guard";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get linked children
    const { data: links } = await supabase
      .from("ParentChild")
      .select("childUserId")
      .eq("parentId", user.id);

    if (!links || links.length === 0) {
      return NextResponse.json({ children: [] });
    }

    const childUserIds = links.map(l => l.childUserId);

    // Get learner profiles for children
    const { data: profiles } = await supabase
      .from("LearnerProfile")
      .select("id, userId, displayName, grade, totalXp, currentStreak, bestStreak")
      .in("userId", childUserIds);

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ children: [] });
    }

    const learnerIds = profiles.map(p => p.id);

    // Get wallets
    const { data: wallets } = await supabase
      .from("StudentWallet")
      .select("learnerId, balance")
      .in("learnerId", learnerIds);

    const walletMap = new Map((wallets || []).map(w => [w.learnerId, w.balance || 0]));

    // Count completed lessons per learner
    const { data: progressCounts } = await supabase
      .from("Progress")
      .select("learnerId", { count: "exact", head: true })
      .in("learnerId", learnerIds)
      .not("completedAt", "is", null);

    // Get per-learner completed counts
    const completedCounts: Record<string, number> = {};
    for (const learnerId of learnerIds) {
      const { count } = await supabase
        .from("Progress")
        .select("id", { count: "exact", head: true })
        .eq("learnerId", learnerId)
        .not("completedAt", "is", null);
      completedCounts[learnerId] = count || 0;
    }

    // Get recent activity per learner (with lesson titles)
    const children = [];
    for (const profile of profiles) {
      const { data: recent } = await supabase
        .from("Progress")
        .select(`
          lessonId,
          completedAt,
          lastAccessed,
          lesson:Lesson(title)
        `)
        .eq("learnerId", profile.id)
        .order("lastAccessed", { ascending: false })
        .limit(5);

      children.push({
        id: profile.userId,
        learnerProfileId: profile.id,
        name: profile.displayName || "Learner",
        grade: profile.grade,
        xp: profile.totalXp || 0,
        streak: profile.currentStreak || 0,
        bestStreak: profile.bestStreak || 0,
        coins: walletMap.get(profile.id) || 0,
        lessonsCompleted: completedCounts[profile.id] || 0,
        recentActivity: (recent || []).map((r: any) => ({
          lessonId: r.lessonId,
          lessonTitle: r.lesson?.title || "Lesson",
          completedAt: r.completedAt,
          lastAccessed: r.lastAccessed,
        })),
      });
    }

    return NextResponse.json({ children });
  } catch (err: any) {
    console.error("[PARENT_PROGRESS] Error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch children progress" }, { status: 500 });
  }
}
