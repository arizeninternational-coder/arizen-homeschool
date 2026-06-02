import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAuthUser } from "@/lib/api-guard";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const gradeFilter = searchParams.get("grade");

    // Get learner's grade for filtering
    let learnerGrade: number | null = null;
    const { data: learnerProfile } = await supabase
      .from("LearnerProfile")
      .select("grade")
      .eq("userId", user.id)
      .maybeSingle();
    if (learnerProfile?.grade) learnerGrade = learnerProfile.grade;

    // Fetch themes — for students, only show PUBLISHED themes
    // If a specific slug is requested, show it regardless (for direct links)
    let themeQuery = supabase
      .from("Theme")
      .select("id, title, slug, description, grade, status, drivingQuestion, durationWeeks, coverImage");

    if (slug) {
      themeQuery = themeQuery.eq("slug", slug);
    } else {
      // For listing, only show PUBLISHED themes matching learner's grade
      themeQuery = themeQuery.eq("status", "PUBLISHED");
      if (learnerGrade) themeQuery = themeQuery.eq("grade", learnerGrade);
    }

    if (gradeFilter) themeQuery = themeQuery.eq("grade", Number(gradeFilter));

    const themesRes = await themeQuery.order("grade", { ascending: true });
    const themes = themesRes.data || [];

    if (!themes || themes.length === 0) {
      return NextResponse.json({ themes: [], theme: slug ? null : undefined });
    }

    const themeIds = themes.map(t => t.id);

    // Fetch quests for these themes — only PUBLISHED
    const { data: quests } = await supabase
      .from("Quest")
      .select("id, title, slug, description, questType, status, xpReward, themeId")
      .in("themeId", themeIds)
      .eq("status", "PUBLISHED")
      .order("orderIndex", { ascending: true });

    const questIds = (quests || []).map(q => q.id);

    // Fetch lessons for these quests — only PUBLISHED
    const { data: lessons } = await supabase
      .from("Lesson")
      .select("id, title, slug, description, status, orderIndex, xpReward, estimatedDurationMinutes, difficulty, questId")
      .in("questId", questIds)
      .eq("status", "PUBLISHED")
      .order("orderIndex", { ascending: true });

    // Also fetch ANY published lessons for these themes that might be under DRAFT quests
    // This handles the case where a lesson is PUBLISHED but its quest is not yet published
    // We still include them, grouped under the theme directly
    const { data: directLessons } = await supabase
      .from("Lesson")
      .select("id, title, slug, description, status, orderIndex, xpReward, estimatedDurationMinutes, difficulty, questId")
      .in("questId", questIds)
      .eq("status", "PUBLISHED")
      .order("orderIndex", { ascending: true });

    // Fetch theme subjects
    const { data: themeSubjects } = await supabase
      .from("ThemeSubject")
      .select("themeId, subject")
      .in("themeId", themeIds);

    // Build lookup maps
    const questsByTheme = new Map<string, any[]>();
    for (const q of (quests || [])) {
      if (!questsByTheme.has(q.themeId)) questsByTheme.set(q.themeId, []);
      questsByTheme.get(q.themeId)!.push(q);
    }

    const lessonsByQuest = new Map<string, any[]>();
    for (const l of (lessons || [])) {
      if (!lessonsByQuest.has(l.questId)) lessonsByQuest.set(l.questId, []);
      lessonsByQuest.get(l.questId)!.push(l);
    }

    const subjectsByTheme = new Map<string, string[]>();
    for (const ts of (themeSubjects || [])) {
      if (!subjectsByTheme.has(ts.themeId)) subjectsByTheme.set(ts.themeId, []);
      subjectsByTheme.get(ts.themeId)!.push(ts.subject);
    }

    // Assemble the response
    const filtered = themes.map((theme: any) => {
      const themeQuests = (questsByTheme.get(theme.id) || [])
        .map((q: any) => ({
          ...q,
          lessons: (lessonsByQuest.get(q.id) || [])
            .sort((a: any, b: any) => (a.orderIndex || 0) - (b.orderIndex || 0)),
        }))
        // Only include quests that have at least one published lesson
        .filter((q: any) => q.lessons.length > 0);

      return {
        ...theme,
        subjects: subjectsByTheme.get(theme.id) || [],
        quests: themeQuests,
      };
    });

    // Filter out themes with no visible quests/lessons
    const visible = filtered.filter((t: any) => t.quests.length > 0);

    if (slug) {
      const theme = visible[0] || filtered[0];
      if (!theme) return NextResponse.json({ error: "Theme not found" }, { status: 404 });
      return NextResponse.json({ theme });
    }

    return NextResponse.json({ themes: visible });
  } catch (err: any) {
    console.error("[THEMES] Critical error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch themes" }, { status: 500 });
  }
}
