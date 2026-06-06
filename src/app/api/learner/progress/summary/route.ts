// GET /api/learner/progress/summary — Get aggregated progress stats for student dashboard
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAuthUser } from "@/lib/api-guard";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!user.learnerProfileId) {
      return NextResponse.json({
        lessonsCompleted: 0,
        totalLessons: 0,
        coins: 0,
        xp: 0,
        streak: 0,
        bestStreak: 0,
        avatarLevel: 1,
        nextLevelXp: 100,
        recentActivity: [],
      });
    }

    const learnerId = user.learnerProfileId;

    // Get learner profile for XP and streak
    const { data: profile } = await supabase
      .from("LearnerProfile")
      .select("totalXp, currentStreak, bestStreak, displayName, grade")
      .eq("id", learnerId)
      .maybeSingle();

    // Get wallet balance
    const { data: wallet } = await supabase
      .from("StudentWallet")
      .select("balance")
      .eq("learnerId", learnerId)
      .maybeSingle();

    // Count completed lessons
    const { count: completedCount } = await supabase
      .from("Progress")
      .select("id", { count: "exact", head: true })
      .eq("learnerId", learnerId)
      .not("completedAt", "is", null);

    // Count total published lessons for this grade
    const learnerGrade = profile?.grade || null;
    let totalLessons = 0;
    if (learnerGrade) {
      const { count } = await supabase
        .from("Lesson")
        .select("id", { count: "exact", head: true })
        .eq("status", "PUBLISHED");
      totalLessons = count || 0;
    }

    // Get recent activity (last 5 progress records)
    const { data: recentProgress } = await supabase
      .from("Progress")
      .select("id, lessonId, completedAt, lastAccessed, masteryPercent")
      .eq("learnerId", learnerId)
      .order("lastAccessed", { ascending: false })
      .limit(5);

    // Get lesson titles for recent activity
    const lessonIds = (recentProgress || []).map(p => p.lessonId).filter(Boolean);
    const lessonTitles: Record<string, string> = {};
    if (lessonIds.length > 0) {
      const { data: lessons } = await supabase
        .from("Lesson")
        .select("id, title")
        .in("id", lessonIds);
      for (const l of (lessons || [])) {
        lessonTitles[l.id] = l.title;
      }
    }

    const recentActivity = (recentProgress || []).map(p => ({
      lessonId: p.lessonId,
      lessonTitle: lessonTitles[p.lessonId] || "Lesson",
      completedAt: p.completedAt,
      lastAccessed: p.lastAccessed,
      masteryPercent: p.masteryPercent,
    }));

    // Calculate avatar level (every 100 XP = 1 level)
    const totalXp = profile?.totalXp || 0;
    const avatarLevel = Math.floor(totalXp / 100) + 1;
    const nextLevelXp = avatarLevel * 100;

    // Count earned badges
    const { count: badgeCount } = await supabase
      .from("Badge")
      .select("id", { count: "exact", head: true })
      .eq("learnerId", learnerId);

    return NextResponse.json({
      lessonsCompleted: completedCount || 0,
      totalLessons,
      coins: wallet?.balance || 0,
      xp: totalXp,
      streak: profile?.currentStreak || 0,
      bestStreak: profile?.bestStreak || 0,
      avatarLevel,
      nextLevelXp,
      recentActivity,
      displayName: profile?.displayName || "Learner",
      grade: learnerGrade,
      badges: badgeCount || 0,
    });
  } catch (err: any) {
    console.error("[PROGRESS_SUMMARY] Error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch progress summary" }, { status: 500 });
  }
}
