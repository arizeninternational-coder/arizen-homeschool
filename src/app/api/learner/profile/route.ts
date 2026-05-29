// GET /api/learner/profile — Get current learner's full profile
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { withAuth } from "@/lib/api-guard";
export const dynamic = "force-dynamic";

export const GET = withAuth(async (req, user) => {
  try {
    if (!user.learnerProfileId) {
      return NextResponse.json({ profile: null });
    }

    const { data: profile, error } = await supabase
      .from("LearnerProfile")
      .select(`
        id, displayName, grade, totalXp, currentStreak, bestStreak, avatarUrl,
        user:User(id, name, email)
      `)
      .eq("id", user.learnerProfileId)
      .single();

    if (error || !profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const [{ data: badges }, { data: completedProgress }] = await Promise.all([
      supabase.from("Badge").select("id", { count: "exact", head: true }).eq("learnerId", profile.id),
      supabase.from("Progress").select("id", { count: "exact", head: true }).eq("learnerId", profile.id).not("completedAt", "is", null),
    ]);

    return NextResponse.json({
      profile: {
        id: profile.id,
        displayName: profile.displayName,
        grade: profile.grade,
        totalXp: profile.totalXp,
        currentStreak: profile.currentStreak,
        bestStreak: profile.bestStreak,
        completedItems: completedProgress?.length || 0,
        badgesCount: badges?.length || 0,
        xpEventsCount: 0,
      },
    });
  } catch (err) {
    console.error("GET learner profile error:", err);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
});
