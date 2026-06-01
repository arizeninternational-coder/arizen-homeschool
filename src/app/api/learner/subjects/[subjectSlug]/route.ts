// GET /api/learner/subjects/[subjectSlug] — Get modules and lessons for a subject
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { withAuth } from "@/lib/api-guard";
export const dynamic = "force-dynamic";

export const GET = withAuth(async (req, user, { params }: { params: { subjectSlug: string } }) => {
  try {
    const { subjectSlug } = params;

    // Get themes (modules) for this subject
    const { data: themes, error } = await supabase
      .from("Theme")
      .select("*")
      .eq("slug", subjectSlug)
      .or("status.eq.PUBLISHED,status.eq.DRAFT")
      .order("title", { ascending: true });

    if (error) throw error;

    if (!themes || themes.length === 0) {
      return NextResponse.json({ subject: { slug: subjectSlug, name: subjectSlug.replace(/-/g, " ") }, modules: [] });
    }

    // Get quests for each theme
    const themeIds = themes.map((t: any) => t.id);
    const { data: quests } = await supabase
      .from("Quest")
      .select("id, themeId, title, slug, description, status, xpReward")
      .in("themeId", themeIds)
      .order("orderIndex", { ascending: true });

    // Get lessons for each quest
    const questIds = (quests || []).map((q: any) => q.id);
    const { data: allLessons } = await supabase
      .from("Lesson")
      .select("id, questId, title, slug, description, status, xpReward, orderIndex")
      .in("questId", questIds)
      .eq("status", "PUBLISHED")
      .order("orderIndex", { ascending: true });

    // If no quests, try getting lessons directly from a theme-based approach
    let lessons = allLessons || [];
    if (lessons.length === 0) {
      const { data: directLessons } = await supabase
        .from("Lesson")
        .select("*")
        .eq("status", "PUBLISHED")
        .order("orderIndex", { ascending: true })
        .limit(50);
      lessons = directLessons || [];
    }

    // Build modules array
    const modules = themes.map((theme: any) => {
      const themeQuests = (quests || []).filter((q: any) => q.themeId === theme.id);
      const themeLessons = themeQuests.flatMap((q: any) =>
        lessons.filter((l: any) => l.questId === q.id)
      );

      return {
        id: theme.id,
        title: theme.title,
        slug: theme.slug,
        description: theme.description,
        status: theme.status,
        lessonCount: themeLessons.length,
        lessons: themeLessons.map((l: any) => ({
          id: l.id,
          title: l.title,
          slug: l.slug,
          description: l.description,
          status: l.status,
          xpReward: typeof l.xpReward === "number" ? l.xpReward : (JSON.parse(l.xpReward || '{"base":10}').base || 10),
          completed: false, // TODO: check completion tracking
          orderIndex: l.orderIndex || 1,
        })),
      };
    });

    return NextResponse.json({
      subject: {
        slug: subjectSlug,
        name: themes[0]?.title || subjectSlug.replace(/-/g, " "),
      },
      modules,
    });
  } catch (err: any) {
    console.error("[SUBJECT_DETAIL] Error:", err);
    return NextResponse.json({ subject: { slug: params.subjectSlug }, modules: [] });
  }
});
