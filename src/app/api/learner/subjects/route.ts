// GET /api/learner/subjects — Get subjects for the current learner's grade
// Uses ThemeSubject table as the canonical source of subject names
// Only counts PUBLISHED lessons for lesson counts
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

    // Fetch themes for this grade (any status — so subjects show even without published content)
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

    // Fetch canonical subject mappings from ThemeSubject
    const { data: themeSubjects } = await supabase
      .from("ThemeSubject")
      .select("themeId, subject")
      .in("themeId", themeIds);

    // Fetch PUBLISHED quests for these themes
    const { data: quests } = await supabase
      .from("Quest")
      .select("id, themeId")
      .in("themeId", themeIds)
      .eq("status", "PUBLISHED");

    const questIds = (quests || []).map(q => q.id);

    // Fetch PUBLISHED lessons for these quests
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

    const questsByTheme = new Map<string, string[]>();
    for (const q of (quests || [])) {
      if (!questsByTheme.has(q.themeId)) questsByTheme.set(q.themeId, []);
      questsByTheme.get(q.themeId)!.push(q.id);
    }

    // Build subject list from canonical ThemeSubject data only
    const subjectMap = new Map<string, any>();

    for (const theme of themes) {
      // Use ONLY the canonical subject from ThemeSubject — never parse from title
      const themeSubjectsList = subjectsByTheme.get(theme.id) || [];

      for (const subjectName of themeSubjectsList) {
        const gradeNum = theme.grade || 0;
        const mapKey = `${gradeNum}-${subjectName}`;

        // Count published lessons for this theme
        const themeQuests = questsByTheme.get(theme.id) || [];
        const publishedLessonCount = themeQuests.reduce(
          (sum, qId) => sum + (lessonsByQuest.get(qId) || 0), 0
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
    }

    // If no ThemeSubject records exist yet, return empty rather than parsing titles
    // This prevents broken subject names from appearing
    const subjects = Array.from(subjectMap.values());

    return NextResponse.json({
      subjects,
      grade: learnerGrade,
    });
  } catch (err: any) {
    console.error("[LEARNER_SUBJECTS] Error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch subjects" }, { status: 500 });
  }
}
