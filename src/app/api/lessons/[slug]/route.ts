// GET /api/lessons/[slug] — Get lesson content
// POST /api/lessons/[slug] — Mark lesson complete
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { withAuth, withAuthPost } from "@/lib/api-guard";
import { updateStreak, awardXp } from "@/lib/auth/utils";

function respondError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export const GET = withAuth(async (req, user, url) => {
  try {
    const slug = url.searchParams.get("slug");
    if (!slug) return respondError("Slug required", 400);

    const { data: lesson, error } = await supabase
      .from("Lesson")
      .select("id, title, slug, description, contentBlocks, difficulty, xpReward, cbcMapping, questId")
      .eq("slug", slug)
      .eq("status", "PUBLISHED")
      .single();

    if (error || !lesson) return respondError("Lesson not found", 404);

    // Get progress
    let progress = null;
    if (user.learnerProfileId) {
      const { data: p } = await supabase
        .from("Progress")
        .select("masteryPercent, completedAt")
        .eq("learnerId", user.learnerProfileId)
        .eq("lessonId", lesson.id)
        .single();
      progress = p;
    }

    return NextResponse.json({
      lesson: {
        ...lesson,
        progress: progress?.masteryPercent || 0,
        isCompleted: !!progress?.completedAt,
      },
    });
  } catch (err: any) {
    console.error("GET lesson error:", err);
    return respondError("Failed to fetch lesson", 500);
  }
});

export const POST = withAuthPost(async (req, user, body: any) => {
  try {
    if (!user.learnerProfileId) return respondError("Unauthorized", 401);

    const slug = body.slug as string;
    if (!slug) return respondError("Slug required", 400);

    const masteryPercent = body.masteryPercent || 100;
    const learnerId = user.learnerProfileId;

    const { data: lesson, error } = await supabase
      .from("Lesson")
      .select("id, title, xpReward")
      .eq("slug", slug)
      .eq("status", "PUBLISHED")
      .single();

    if (error || !lesson) return respondError("Lesson not found", 404);

    // Upsert progress
    const { data: existing } = await supabase
      .from("Progress")
      .select("id, masteryPercent, completedAt")
      .eq("learnerId", learnerId)
      .eq("lessonId", lesson.id)
      .single();

    const isNewCompletion = masteryPercent >= 80 && !existing?.completedAt;
    const completedAt = isNewCompletion ? new Date().toISOString() : existing?.completedAt || null;

    if (existing) {
      await supabase.from("Progress").update({
        masteryPercent: Math.max(existing.masteryPercent, masteryPercent),
        completedAt,
        lastAccessed: new Date().toISOString(),
      }).eq("id", existing.id);
    } else {
      await supabase.from("Progress").insert({
        learnerId,
        lessonId: lesson.id,
        masteryPercent,
        completedAt,
        lastAccessed: new Date().toISOString(),
      });
    }

    // Award XP if newly completed
    let xpAwarded = 0;
    if (isNewCompletion) {
      const xpData = lesson.xpReward as any;
      const xpAmount = xpData?.base || 50;
      await awardXp(learnerId, xpAmount, "LESSON", lesson.id, `Completed: ${lesson.title}`);
      xpAwarded = xpAmount;
    }

    await updateStreak(learnerId);

    return NextResponse.json({ success: true, xpAwarded, isCompleted: !!completedAt });
  } catch (err: any) {
    console.error("POST lesson complete error:", err);
    return respondError("Failed to complete lesson", 500);
  }
});
