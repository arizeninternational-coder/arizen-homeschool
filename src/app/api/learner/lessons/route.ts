// GET /api/learner/lessons — List published lessons for the current learner
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAuthUser } from "@/lib/api-guard";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get learner profile to find grade
    const { data: profile } = await supabase
      .from("LearnerProfile")
      .select("id, grade, userId")
      .eq("userId", user.id)
      .single();

    const grade = profile?.grade;

    // Fetch published lessons, optionally filtered by grade
    let query = supabase
      .from("Lesson")
      .select(`
        id,
        title,
        slug,
        description,
        status,
        orderIndex,
        xpReward,
        createdAt,
        quest:Quest(
          id,
          title,
          theme:Theme(
            id,
            title,
            grade
          )
        )
      `)
      .eq("status", "PUBLISHED")
      .order("orderIndex", { ascending: true })
      .limit(200);

    const { data: lessons, error } = await query;

    if (error) {
      console.error("[LEARNER_LESSONS] Error:", error.message);
      // Fallback: try without quest relation
      const { data: simple, error: err2 } = await supabase
        .from("Lesson")
        .select("id, title, slug, description, status, orderIndex, xpReward, createdAt")
        .eq("status", "PUBLISHED")
        .order("orderIndex", { ascending: true })
        .limit(200);
      if (err2) return NextResponse.json({ error: err2.message }, { status: 500 });
      return NextResponse.json({ lessons: simple || [] });
    }

    // Filter by grade if theme has grade info
    let filtered = lessons || [];
    if (grade) {
      filtered = filtered.filter((l: any) => !l.quest?.theme?.grade || l.quest.theme.grade === grade);
    }

    // Fetch progress for each lesson
    if (profile?.id && filtered.length > 0) {
      const lessonIds = filtered.map((l: any) => l.id);
      const { data: progress } = await supabase
        .from("LessonProgress")
        .select("lessonId, status, completedAt")
        .eq("learnerProfileId", profile.id)
        .in("lessonId", lessonIds);

      const progressMap = new Map((progress || []).map((p: any) => [p.lessonId, p]));
      filtered = filtered.map((l: any) => ({
        ...l,
        progress: progressMap.get(l.id) || null,
      }));
    }

    return NextResponse.json({ lessons: filtered });
  } catch (err: any) {
    console.error("[LEARNER_LESSONS] Critical error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch lessons" }, { status: 500 });
  }
}
