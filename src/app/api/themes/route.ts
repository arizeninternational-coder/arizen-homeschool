// GET /api/themes — List themes or get single theme with quests/lessons
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabase } from "@/lib/supabase";

const secret = process.env.NEXTAUTH_SECRET || "arizen-dev-secret-change-in-production";

function respondError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret });
    if (!token?.guildId) return respondError("Unauthorized", 401);
    const guildId = token.guildId as string;

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const grade = searchParams.get("grade");

    // Single theme by slug
    if (slug) {
      const { data: theme, error: themeErr } = await supabase
        .from("Theme")
        .select(`
          id, title, slug, description, coverImage, durationWeeks, drivingQuestion, grade,
          themeSubjects:ThemeSubject(subject),
          quests:Quest(
            id, title, slug, description, questType, orderIndex, coverImage, xpReward, status,
            lessons:Lesson(
              id, title, slug, description, orderIndex, status
            )
          )
        `)
        .eq("guildId", guildId)
        .eq("slug", slug)
        .eq("status", "PUBLISHED")
        .single();

      if (themeErr || !theme) return respondError("Theme not found", 404);

      // Get learner progress
      const learnerProfileId = token.learnerProfileId as string | null;
      let progressMap: Record<string, { mastery: number; completedAt: string | null }> = {};

      if (learnerProfileId) {
        const questIds = (theme.quests || []).map((q: any) => q.id);
        const lessonIds = (theme.quests || []).flatMap((q: any) => q.lessons?.map((l: any) => l.id) || []);

        const [questProgress, lessonProgress] = await Promise.all([
          questIds.length > 0
            ? supabase.from("Progress").select("questId, masteryPercent, completedAt").eq("learnerId", learnerProfileId).in("questId", questIds)
            : Promise.resolve({ data: [], error: null }),
          lessonIds.length > 0
            ? supabase.from("Progress").select("lessonId, masteryPercent, completedAt").eq("learnerId", learnerProfileId).in("lessonId", lessonIds)
            : Promise.resolve({ data: [], error: null }),
        ]);

        for (const r of questProgress.data || []) {
          if (r.questId) progressMap[r.questId] = { mastery: r.masteryPercent, completedAt: r.completedAt };
        }
        for (const r of lessonProgress.data || []) {
          if (r.lessonId) progressMap[r.lessonId] = { mastery: r.masteryPercent, completedAt: r.completedAt };
        }
      }

      return NextResponse.json({
        theme: {
          ...theme,
          subjects: (theme.themeSubjects || []).map((s: any) => s.subject),
          quests: (theme.quests || [])
            .filter((q: any) => q.status === "PUBLISHED")
            .map((q: any) => ({
              ...q,
              lessons: (q.lessons || []).filter((l: any) => l.status === "PUBLISHED").map((l: any) => ({
                ...l,
                progress: progressMap[l.id]?.mastery || 0,
                isCompleted: !!progressMap[l.id]?.completedAt,
              })),
              progress: progressMap[q.id]?.mastery || 0,
              isCompleted: !!progressMap[q.id]?.completedAt,
            })),
        },
      });
    }

    // List themes
    let query = supabase
      .from("Theme")
      .select("id, title, slug, description, coverImage, durationWeeks, drivingQuestion, grade, createdAt, themeSubjects:ThemeSubject(subject)")
      .eq("guildId", guildId)
      .eq("status", "PUBLISHED")
      .orderBy("createdAt", { ascending: false });

    if (grade) query = query.eq("grade", parseInt(grade));

    const { data: themes, error } = await query;
    if (error) return respondError("Failed to fetch themes", 500);

    return NextResponse.json({
      themes: (themes || []).map((t: any) => ({
        id: t.id,
        title: t.title,
        slug: t.slug,
        description: t.description,
        drivingQuestion: t.drivingQuestion,
        durationWeeks: t.durationWeeks,
        grade: t.grade,
        subjects: (t.themeSubjects || []).map((s: any) => s.subject),
        questsCount: t._count?.quests || 0,
        progress: 0,
      })),
    });
  } catch (err: any) {
    console.error("GET /api/themes error:", err);
    return respondError("Failed to fetch themes", 500);
  }
}
