// GET /api/learner/subjects — Get subjects for the current learner's grade
// Uses ThemeSubject table as the canonical source of subject names
// Falls back to CBC core subjects when no ThemeSubject records exist
// Only counts PUBLISHED lessons for lesson counts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAuthUser } from "@/lib/api-guard";
import { getCbcSubjectsForGrade } from "@/lib/cbc-subjects";
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
    // Also fetch themes that have studentVisible lessons regardless of grade
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

    // Build subject list from canonical ThemeSubject data, then fall back to CBC if empty
    const subjects = Array.from(subjectMap.values());

    if (subjects.length === 0 && learnerGrade) {
      const cbcSubjects = getCbcSubjectsForGrade(learnerGrade);

      // Count published lessons per theme for lesson counts
      const themeLessonCounts = new Map<string, number>();
      for (const theme of themes) {
        const themeQuests = questsByTheme.get(theme.id) || [];
        const count = themeQuests.reduce(
          (sum, qId) => sum + (lessonsByQuest.get(qId) || 0), 0
        );
        themeLessonCounts.set(theme.slug, count);
      }

      // Find the best-matching theme slug for each subject
      const themeSlugMap = new Map<string, string>();
      for (const cbcSub of cbcSubjects) {
        // Find a theme whose ThemeSubject matches this subject slug, or
        // match by slug prefix in theme slug
        let bestSlug = "";
        for (const ts of (themeSubjects || [])) {
          const tsData = subjectsByTheme.get(ts.themeId);
          if (tsData && tsData.some(s => s.toLowerCase().replace(/\s+/g, "-") === cbcSub.slug)) {
            const matchingTheme = themes.find(t => t.id === ts.themeId);
            if (matchingTheme) { bestSlug = matchingTheme.slug; break; }
          }
        }
        // If no ThemeSubject match, try matching subject slug to theme slug
        if (!bestSlug) {
          const matchingTheme = themes.find(t => t.slug.toLowerCase().includes(cbcSub.slug) || cbcSub.slug.includes(t.slug.toLowerCase()));
          if (matchingTheme) bestSlug = matchingTheme.slug;
          else if (themes.length > 0) bestSlug = themes[0].slug; // fallback to first theme
        }
        themeSlugMap.set(cbcSub.slug, bestSlug);
      }

      for (const cbcSub of cbcSubjects) {
        const themeSlug = themeSlugMap.get(cbcSub.slug) || "";
        const lessonCount = themeSlug ? (themeLessonCounts.get(themeSlug) || 0) : 0;
        subjects.push({
          id: `${cbcSub.slug}-${learnerGrade}`,
          name: cbcSub.name,
          grade: learnerGrade,
          themeSlug,
          themeId: themes.find(t => t.slug === themeSlug)?.id || "",
          lessonCount,
        });
      }
    }

    return NextResponse.json({
      subjects,
      grade: learnerGrade,
    });
  } catch (err: any) {
    console.error("[LEARNER_SUBJECTS] Error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch subjects" }, { status: 500 });
  }
}
