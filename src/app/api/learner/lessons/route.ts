// GET /api/learner/lessons — List published lessons for the current learner
// Returns lessons with normalized reward values, subject info, and progress
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAuthUser } from "@/lib/api-guard";
export const dynamic = "force-dynamic";

function normalizeReward(reward: any): number {
  if (reward === null || reward === undefined) return 0;
  if (typeof reward === "number") return reward;
  if (typeof reward === "object") {
    if (reward.base !== undefined) return Number(reward.base) || 0;
    if (reward.amount !== undefined) return Number(reward.amount) || 0;
    return 0;
  }
  if (typeof reward === "string") {
    try {
      const parsed = JSON.parse(reward);
      if (typeof parsed === "number") return parsed;
      if (parsed?.base !== undefined) return Number(parsed.base) || 0;
      if (parsed?.amount !== undefined) return Number(parsed.amount) || 0;
    } catch { return 0; }
  }
  return 0;
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get learner profile
    const { data: profile } = await supabase
      .from("LearnerProfile")
      .select("id, grade")
      .eq("userId", user.id)
      .maybeSingle();

    const grade = profile?.grade;

    // Fetch published lessons with quest, theme, and themeSubject data
    const { data: lessons, error } = await supabase
      .from("Lesson")
      .select(`
        id,
        title,
        slug,
        description,
        status,
        orderIndex,
        xpReward,
        estimatedDurationMinutes,
        createdAt,
        quest:Quest(
          id,
          title,
          slug,
          theme:Theme(
            id,
            title,
            slug,
            grade
          )
        )
      `)
      .eq("status", "PUBLISHED")
      .order("orderIndex", { ascending: true })
      .limit(1000);

    if (error) {
      console.error("[LEARNER_LESSONS] Error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let filtered = lessons || [];

    // Filter by grade if available
    if (grade) {
      filtered = filtered.filter((l: any) => !l.quest?.theme?.grade || l.quest.theme.grade === grade);
    }

    // Get theme IDs for subject lookup
    const themeIds = [...new Set(filtered.map((l: any) => l.quest?.theme?.id).filter(Boolean))];

    // Fetch theme subjects for these themes
    const { data: themeSubjects } = await supabase
      .from("ThemeSubject")
      .select("themeId, subject")
      .in("themeId", themeIds);

    const subjectsByTheme = new Map<string, string[]>();
    for (const ts of (themeSubjects || [])) {
      if (!subjectsByTheme.has(ts.themeId)) subjectsByTheme.set(ts.themeId, []);
      subjectsByTheme.get(ts.themeId)!.push(ts.subject);
    }

    // Fetch progress for each lesson
    if (profile?.id && filtered.length > 0) {
      const lessonIds = filtered.map((l: any) => l.id);
      const { data: progress } = await supabase
        .from("Progress")
        .select("lessonId, completedAt, masteryPercent")
        .eq("learnerId", profile.id)
        .in("lessonId", lessonIds);

      const progressMap = new Map((progress || []).map((p: any) => [p.lessonId, p]));

      filtered = filtered.map((l: any) => {
        const themeId = l.quest?.theme?.id;
        const subjects = themeId ? (subjectsByTheme.get(themeId) || []) : [];
        return {
          ...l,
          xpReward: normalizeReward(l.xpReward),
          subjects,
          subject: subjects[0] || null,
          progress: progressMap.get(l.id) || null,
        };
      });
    } else {
      filtered = filtered.map((l: any) => {
        const themeId = l.quest?.theme?.id;
        const subjects = themeId ? (subjectsByTheme.get(themeId) || []) : [];
        return {
          ...l,
          xpReward: normalizeReward(l.xpReward),
          subjects,
          subject: subjects[0] || null,
          progress: null,
        };
      });
    }

    return NextResponse.json({ lessons: filtered });
  } catch (err: any) {
    console.error("[LEARNER_LESSONS] Critical error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch lessons" }, { status: 500 });
  }
}
