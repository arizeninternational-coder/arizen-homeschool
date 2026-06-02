// GET /api/learner/subjects — Get subjects for the current learner's grade
// Returns ALL themes for the learner's grade (regardless of publish status)
// but only counts PUBLISHED lessons — so students see their subjects even
// when no lessons are published yet
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAuthUser } from "@/lib/api-guard";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get learner profile
    const { data: profile } = await supabase
      .from("LearnerProfile")
      .select("id, grade")
      .eq("userId", user.id)
      .maybeSingle();

    const learnerGrade = profile?.grade || null;

    // Fetch ALL themes for this grade (regardless of status)
    let themeQuery = supabase
      .from("Theme")
      .select("id, title, slug, grade, status")
      .order("grade", { ascending: true });

    if (learnerGrade) themeQuery = themeQuery.eq("grade", learnerGrade);

    const { data: themes } = await themeQuery;

    if (!themes || themes.length === 0) {
      return NextResponse.json({ subjects: [], grade: learnerGrade });
    }

    const themeIds = themes.map(t => t.id);

    // Fetch theme subjects
    const { data: themeSubjects } = await supabase
      .from("ThemeSubject")
      .select("themeId, subject")
      .in("themeId", themeIds);

    // Fetch only PUBLISHED quests for these themes
    const { data: quests } = await supabase
      .from("Quest")
      .select("id, themeId")
      .in("themeId", themeIds)
      .eq("status", "PUBLISHED");

    const questIds = (quests || []).map(q => q.id);

    // Fetch only PUBLISHED lessons for these quests
    const { data: lessons } = await supabase
      .from("Lesson")
      .select("id, questId")
      .in("questId", questIds)
      .eq("status", "PUBLISHED");

    // Build lookup maps
    const subjectsByTheme = new Map<string, string[]>();
    for (const ts of (themeSubjects || [])) {
      if (!subjectsByTheme.has(ts.themeId)) subjectsByTheme.set(ts.themeId, []);
      subjectsByTheme.get(ts.themeId)!.push(ts.subject);
    }

    const lessonsByQuest = new Map<string, number>();
    for (const l of (lessons || [])) {
      lessonsByQuest.set(l.questId, (lessonsByQuest.get(l.questId) || 0) + 1);
    }

    const questsByTheme = new Map<string, any[]>();
    for (const q of (quests || [])) {
      if (!questsByTheme.has(q.themeId)) questsByTheme.set(q.themeId, []);
      questsByTheme.get(q.themeId)!.push(q);
    }

    // Build subject list from ALL themes (not just published)
    const subjectMap = new Map<string, any>();
    for (const theme of themes) {
      const themeSubjectsList = subjectsByTheme.get(theme.id) || [];
      let subjectName = themeSubjectsList[0] || "";

      // Fallback: parse from theme title
      if (!subjectName) {
        const parts = (theme.title || "").split(" ");
        if (parts.length >= 3) subjectName = parts.slice(2).join(" ");
        else if (parts.length === 2) subjectName = parts[1];
      }
      if (!subjectName) subjectName = theme.title || "Subject";

      const gradeNum = theme.grade || 0;
      const mapKey = `${gradeNum}-${subjectName}`;

      // Count only published lessons
      const themeQuests = questsByTheme.get(theme.id) || [];
      const publishedLessonCount = themeQuests.reduce(
        (sum, q) => sum + (lessonsByQuest.get(q.id) || 0), 0
      );

      if (!subjectMap.has(mapKey)) {
        subjectMap.set(mapKey, {
          id: `${subjectName.toLowerCase().replace(/\s+/g, "-")}-${gradeNum}`,
          name: subjectName,
          grade: gradeNum,
          themeSlug: theme.slug,
          themeId: theme.id,
          lessonCount: publishedLessonCount,
        });
      } else {
        subjectMap.get(mapKey)!.lessonCount += publishedLessonCount;
      }
    }

    return NextResponse.json({
      subjects: Array.from(subjectMap.values()),
      grade: learnerGrade,
    });
  } catch (err: any) {
    console.error("[LEARNER_SUBJECTS] Error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch subjects" }, { status: 500 });
  }
}
