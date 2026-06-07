// GET /api/lessons/by-quest/[questSlug] — Get lessons by quest slug (for fallback quest view)
// This endpoint finds lessons even when the quest itself isn't PUBLISHED,
// so the student can still access lesson content.
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { withAuth } from "@/lib/api-guard";
export const dynamic = "force-dynamic";

function respondError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export const GET = withAuth(async (req, user, url) => {
  try {
    const slug = url.searchParams.get("slug");
    if (!slug) return respondError("Slug required", 400);

    // Find the quest by slug (any status — we need it for the lesson query)
    const { data: quest } = await supabase
      .from("Quest")
      .select("id, title, slug")
      .eq("slug", slug)
      .single();

    if (!quest) return respondError("Quest not found", 404);

    // Get lessons for this quest (PUBLISHED only)
    const { data: lessons } = await supabase
      .from("Lesson")
      .select("id, title, slug, description, orderIndex, xpReward, questId")
      .eq("questId", quest.id)
      .eq("status", "PUBLISHED")
      .orderBy("orderIndex");

    // Get progress for these lessons
    const learnerProfileId = user.learnerProfileId;
    let progressMap: Record<string, { mastery: number; completedAt: string | null }> = {};
    if (learnerProfileId && lessons && lessons.length > 0) {
      const lessonIds = lessons.map((l: any) => l.id);
      const { data: progressRecords } = await supabase
        .from("Progress")
        .select("lessonId, masteryPercent, completedAt")
        .eq("learnerId", learnerProfileId)
        .in("lessonId", lessonIds);
      for (const r of progressRecords || []) {
        if (r.lessonId) progressMap[r.lessonId] = { mastery: r.masteryPercent, completedAt: r.completedAt };
      }
    }

    return NextResponse.json({
      quest: {
        id: quest.id,
        title: quest.title,
        slug: quest.slug,
      },
      lessons: (lessons || []).map((l: any) => ({
        ...l,
        progress: progressMap[l.id]?.mastery || 0,
        isCompleted: !!progressMap[l.id]?.completedAt,
      })),
    });
  } catch (err: any) {
    console.error("GET lessons by quest error:", err);
    return respondError("Failed to fetch lessons", 500);
  }
});
