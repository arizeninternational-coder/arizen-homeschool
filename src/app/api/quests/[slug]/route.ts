// GET /api/quests/[slug] — Get quest with lessons and progress
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { withAuth } from "@/lib/api-guard";

function respondError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export const GET = withAuth(async (req, user, url) => {
  try {
    const guildId = user.guildId || user.guildSlug;
    if (!guildId) return respondError("No guild assigned", 400);

    const slug = url.searchParams.get("slug");
    if (!slug) return respondError("Slug required", 400);

    const { data: quest, error } = await supabase
      .from("Quest")
      .select("id, title, slug, description, questType, orderIndex, coverImage, xpReward")
      .eq("slug", slug)
      .eq("status", "PUBLISHED")
      .single();

    if (error || !quest) return respondError("Quest not found", 404);

    // Get lessons
    const { data: lessons } = await supabase
      .from("Lesson")
      .select("id, title, slug, description, orderIndex, xpReward")
      .eq("questId", quest.id)
      .eq("status", "PUBLISHED")
      .orderBy("orderIndex");

    // Get progress
    const learnerProfileId = user.learnerProfileId;
    let progressMap: Record<string, { mastery: number; completedAt: string | null }> = {};
    if (learnerProfileId) {
      const allIds = [quest.id, ...(lessons || []).map((l: any) => l.id)];
      const { data: progressRecords } = await supabase
        .from("Progress")
        .select("questId, lessonId, masteryPercent, completedAt")
        .eq("learnerId", learnerProfileId)
        .in("questId", allIds);
      const { data: lessonProgress } = await supabase
        .from("Progress")
        .select("lessonId, masteryPercent, completedAt")
        .eq("learnerId", learnerProfileId)
        .in("lessonId", (lessons || []).map((l: any) => l.id));

      for (const r of progressRecords || []) {
        const key = r.questId || r.lessonId;
        if (key) progressMap[key] = { mastery: r.masteryPercent, completedAt: r.completedAt };
      }
      for (const r of lessonProgress || []) {
        if (r.lessonId) progressMap[r.lessonId] = { mastery: r.masteryPercent, completedAt: r.completedAt };
      }
    }

    return NextResponse.json({
      quest: {
        ...quest,
        lessons: (lessons || []).map((l: any) => ({
          ...l,
          progress: progressMap[l.id]?.mastery || 0,
          isCompleted: !!progressMap[l.id]?.completedAt,
        })),
        progress: progressMap[quest.id]?.mastery || 0,
        isCompleted: !!progressMap[quest.id]?.completedAt,
      },
    });
  } catch (err: any) {
    console.error("GET quest error:", err);
    return respondError("Failed to fetch quest", 500);
  }
});
