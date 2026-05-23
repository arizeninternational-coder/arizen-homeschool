// ── Guilds ───────────────────────────────────────────────────

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

// GET /api/guilds — List published themes for the user's guild
export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret });
    if (!token?.guildId) return respondError("Unauthorized", 401);

    const themes = await prisma.theme.findMany({
      where: {
        guildId: token.guildId as string,
        status: "PUBLISHED",
      },
      include: {
        themeSubjects: true,
        quests: {
          where: { status: "PUBLISHED" },
          orderBy: { orderIndex: "asc" },
          select: {
            id: true,
            title: true,
            slug: true,
            questType: true,
            orderIndex: true,
            xpReward: true,
            _count: { select: { lessons: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get learner progress if available
    const learnerProfileId = token.learnerProfileId as string | null;
    let progressMap: Record<string, number> = {};

    if (learnerProfileId) {
      const progressRecords = await prisma.progress.findMany({
        where: { learnerId: learnerProfileId },
        select: { lessonId: true, questId: true, masteryPercent: true, completedAt: true },
      });

      for (const p of progressRecords) {
        const key = p.lessonId || p.questId;
        if (key) progressMap[key] = p.masteryPercent;
      }
    }

    return json({
      themes: themes.map((t) => ({
        id: t.id,
        title: t.title,
        slug: t.slug,
        description: t.description,
        drivingQuestion: t.drivingQuestion,
        durationWeeks: t.durationWeeks,
        grade: t.grade,
        subjects: t.themeSubjects.map((s) => s.subject),
        quests: t.quests.map((q) => ({
          ...q,
          lessonsCount: q._count.lessons,
          progress: progressMap[q.id] || 0,
        })),
      })),
    });
  } catch (err) {
    console.error("GET /api/guilds error:", err);
    return respondError("Failed to fetch themes", 500);
  }
}
