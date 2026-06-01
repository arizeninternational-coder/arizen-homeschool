// GET /api/learner/lessons/[lessonSlug] — Get lesson details
// POST /api/learner/lessons/[lessonSlug]/complete — Mark lesson as complete
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { withAuth } from "@/lib/api-guard";
export const dynamic = "force-dynamic";

async function getLesson(slug: string) {
  const { data, error } = await supabase
    .from("Lesson")
    .select("*, Quest(id, title, slug, themeId, Theme(id, title, slug))")
    .eq("slug", slug)
    .single();
  if (error) return null;
  return data;
}

export const GET = withAuth(async (req, user, { params }: { params: { lessonSlug: string } }) => {
  try {
    const lesson = await getLesson(params.lessonSlug);
    if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

    // Check if already completed
    const { data: completion } = await supabase
      .from("LessonCompletion")
      .select("id")
      .eq("learnerId", user.learnerProfileId)
      .eq("lessonId", lesson.id)
      .single();

    return NextResponse.json({
      lesson: {
        id: lesson.id,
        title: lesson.title,
        slug: lesson.slug,
        description: lesson.description,
        contentBlocks: lesson.contentBlocks,
        xpReward: typeof lesson.xpReward === "number" ? lesson.xpReward : (JSON.parse(lesson.xpReward || '{"base":10}').base || 10),
        status: lesson.status,
        completed: !!completion,
        questTitle: (lesson as any).Quest?.title,
        themeTitle: (lesson as any).Quest?.Theme?.title,
      },
    });
  } catch (err: any) {
    console.error("[LESSON] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
});
