// ── Lessons ──────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getToken } from "next-auth/jwt";
import { updateStreak, awardXp } from "@/lib/auth/utils";

const secret = process.env.NEXTAUTH_SECRET || "arizen-dev-secret-change-in-production";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function respondError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

// GET /api/lessons/[slug] — Get lesson with content blocks
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const token = await getToken({ req, secret });
    if (!token?.guildId) return respondError("Unauthorized", 401);
    const { slug } = await params;

    const lesson = await prisma.lesson.findFirst({
      where: {
        slug,
        quest: {
          theme: { guildId: token.guildId as string },
          status: "PUBLISHED",
        },
        status: "PUBLISHED",
      },
      include: {
        quest: {
          select: {
            id: true,
            title: true,
            slug: true,
            theme: { select: { id: true, title: true, slug: true } },
          },
        },
      },
    });

    if (!lesson) return respondError("Lesson not found", 404);

    // Get progress
    let progress = null;
    const learnerProfileId = token.learnerProfileId as string | null;
    if (learnerProfileId) {
      progress = await prisma.progress.findUnique({
        where: {
          // composite — find by learner + lesson
          learnerId_lessonId: undefined as any,
        },
      });
      // Actually use findFirst since there's no composite unique
      progress = await prisma.progress.findFirst({
        where: { learnerId: learnerProfileId, lessonId: lesson.id },
      });
    }

    return json({
      lesson: {
        ...lesson,
        contentBlocks: lesson.contentBlocks as any,
        difficulty: lesson.difficulty as any,
        xpReward: lesson.xpReward as any,
        cbcMapping: lesson.cbcMapping as any,
        progress: progress?.masteryPercent || 0,
        isCompleted: !!progress?.completedAt,
      },
    });
  } catch (err) {
    console.error("GET lesson error:", err);
    return respondError("Failed to fetch lesson", 500);
  }
}

// POST /api/lessons/[slug]/complete — Mark lesson complete, award XP
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const token = await getToken({ req, secret });
    if (!token?.learnerProfileId) return respondError("Unauthorized", 401);
    const { slug } = await params;
    const body = await req.json();
    const masteryPercent = body.masteryPercent || 100;

    const lesson = await prisma.lesson.findFirst({
      where: {
        slug,
        quest: {
          theme: { guildId: token.guildId as string },
          status: "PUBLISHED",
        },
        status: "PUBLISHED",
      },
    });

    if (!lesson) return respondError("Lesson not found", 404);

    const learnerId = token.learnerProfileId as string;

    // Upsert progress — find existing or create new
    const existing = await prisma.progress.findFirst({
      where: { learnerId, lessonId: lesson.id },
    });

    let saved;
    if (existing) {
      saved = await prisma.progress.update({
        where: { id: existing.id },
        data: {
          masteryPercent: Math.max(existing.masteryPercent, masteryPercent),
          completedAt: masteryPercent >= 80 ? new Date() : existing.completedAt,
          lastAccessed: new Date(),
        },
      });
    } else {
      saved = await prisma.progress.create({
        data: {
          learnerId,
          lessonId: lesson.id,
          masteryPercent,
          completedAt: masteryPercent >= 80 ? new Date() : null,
          lastAccessed: new Date(),
        },
      });
    }

    // Award XP if newly completed
    let xpAwarded = 0;
    if (masteryPercent >= 80 && !existing?.completedAt) {
      const xpData = lesson.xpReward as any;
      const xpAmount = xpData?.base || 50;
      await awardXp(learnerId, xpAmount, "LESSON", lesson.id, `Completed: ${lesson.title}`);
      xpAwarded = xpAmount;
    }

    // Update streak
    await updateStreak(learnerId);

    return json({
      success: true,
      progress: saved,
      xpAwarded,
      isCompleted: saved.completedAt !== null,
    });
  } catch (err) {
    console.error("POST lesson complete error:", err);
    return respondError("Failed to complete lesson", 500);
  }
}
