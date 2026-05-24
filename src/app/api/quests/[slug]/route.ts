// ── Quests ───────────────────────────────────────────────────

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

// GET /api/quests?slug=xxx — Get quest with all lessons and progress
export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret });
    if (!token?.guildId) return respondError("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    if (!slug) return respondError("Slug required", 400);

    const quest = await prisma.quest.findFirst({
      where: {
        slug,
        theme: { guildId: token.guildId as string },
        status: "PUBLISHED",
      },
      include: {
        theme: { select: { id: true, title: true, slug: true, grade: true } },
        lessons: {
          where: { status: "PUBLISHED" },
          orderBy: { orderIndex: "asc" },
          include: {
            _count: { select: { activities: true } },
          },
        },
        sideQuests: {
          where: { status: "PUBLISHED" },
          select: { id: true, title: true, slug: true, sideQuestType: true, xpReward: true },
        },
        activities: {
          where: { status: "PUBLISHED" },
          select: { id: true, title: true, activityType: true, xpReward: true },
        },
      },
    });

    if (!quest) return respondError("Quest not found", 404);

    // Get progress
    const learnerProfileId = token.learnerProfileId as string | null;
    const progressMap: Record<string, { mastery: number; completedAt: string | null }> = {};

    if (learnerProfileId) {
      const records = await prisma.progress.findMany({
        where: {
          learnerId: learnerProfileId,
          OR: [
            { questId: quest.id },
            { lesson: { questId: quest.id } },
          ],
        },
      });
      for (const r of records) {
        const key = r.lessonId || r.questId;
        if (key) progressMap[key] = { mastery: r.masteryPercent, completedAt: r.completedAt?.toISOString() || null };
      }
    }

    return json({
      quest: {
        ...quest,
        progress: progressMap[quest.id]?.mastery || 0,
        isCompleted: !!progressMap[quest.id]?.completedAt,
        lessons: quest.lessons.map((l) => ({
          ...l,
          activitiesCount: l._count.activities,
          progress: progressMap[l.id]?.mastery || 0,
          isCompleted: !!progressMap[l.id]?.completedAt,
        })),
      },
    });
  } catch (err) {
    console.error("GET quest error:", err);
    return respondError("Failed to fetch quest", 500);
  }
}
