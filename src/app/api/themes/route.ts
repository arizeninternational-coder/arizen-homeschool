// ── Themes ───────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET || "arizen-dev-secret-change-in-production";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function respondError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

// GET /api/themes — List all published themes for the guild
// GET /api/themes?slug=xxx — Get single theme with quests and lessons
export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret });
    if (!token?.guildId) return respondError("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    // Single theme by slug
    if (slug) {
      const theme = await prisma.theme.findFirst({
        where: {
          slug,
          guildId: token.guildId as string,
          status: "PUBLISHED",
        },
        include: {
          themeSubjects: true,
          quests: {
            where: { status: "PUBLISHED" },
            orderBy: { orderIndex: "asc" },
            include: {
              _count: { select: { lessons: true } },
              lessons: {
                where: { status: "PUBLISHED" },
                orderBy: { orderIndex: "asc" },
                select: { id: true, title: true, slug: true, orderIndex: true },
              },
              sideQuests: {
                where: { status: "PUBLISHED" },
                select: { id: true, title: true, sideQuestType: true },
              },
            },
          },
        },
      });

      if (!theme) return respondError("Theme not found", 404);

      // Get learner progress for this theme
      const learnerProfileId = token.learnerProfileId as string | null;
      const progressMap: Record<string, { mastery: number; completedAt: string | null }> = {};

      if (learnerProfileId) {
        const records = await prisma.progress.findMany({
          where: {
            learnerId: learnerProfileId,
            OR: [
              { quest: { themeId: theme.id } },
              { lesson: { quest: { themeId: theme.id } } },
            ],
          },
        });
        for (const r of records) {
          const key = r.questId || r.lessonId;
          if (key) progressMap[key] = { mastery: r.masteryPercent, completedAt: r.completedAt?.toISOString() || null };
        }
      }

      return json({
        theme: {
          ...theme,
          subjects: theme.themeSubjects.map((s) => s.subject),
          quests: theme.quests.map((q) => ({
            ...q,
            lessons: q.lessons,
            sideQuests: q.sideQuests,
            progress: progressMap[q.id]?.mastery || 0,
            isCompleted: !!progressMap[q.id]?.completedAt,
          })),
        },
      });
    }

    // List all themes
    const { searchParams: sp } = new URL(req.url);
    const grade = sp.get("grade");

    const themes = await prisma.theme.findMany({
      where: {
        guildId: token.guildId as string,
        status: "PUBLISHED",
        ...(grade ? { grade: parseInt(grade) } : {}),
      },
      include: {
        themeSubjects: true,
        _count: { select: { quests: { where: { status: "PUBLISHED" } } } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get learner progress
    const learnerProfileId = token.learnerProfileId as string | null;
    const progressRecords = learnerProfileId
      ? await prisma.progress.findMany({
          where: { learnerId: learnerProfileId },
          include: { quest: { select: { themeId: true } } },
        })
      : [];

    const themeProgressMap: Record<string, { total: number; completed: number }> = {};
    for (const p of progressRecords) {
      const themeId = p.quest?.themeId;
      if (themeId) {
        if (!themeProgressMap[themeId]) themeProgressMap[themeId] = { total: 0, completed: 0 };
        themeProgressMap[themeId].total++;
        if (p.completedAt) themeProgressMap[themeId].completed++;
      }
    }

    return json({
      themes: themes.map((t) => {
        const progress = themeProgressMap[t.id];
        return {
          id: t.id,
          title: t.title,
          slug: t.slug,
          description: t.description,
          drivingQuestion: t.drivingQuestion,
          durationWeeks: t.durationWeeks,
          grade: t.grade,
          subjects: t.themeSubjects.map((s) => s.subject),
          questsCount: t._count.quests,
          progress: progress ? Math.round((progress.completed / progress.total) * 100) : 0,
        };
      }),
    });
  } catch (err) {
    console.error("GET /api/themes error:", err);
    return respondError("Failed to fetch themes", 500);
  }
}
