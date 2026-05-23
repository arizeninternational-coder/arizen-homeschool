// ── Learner Profile & Gamification ────────────────────────────

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

// GET /api/learner/profile — Get current learner's full profile
export async function GET_profile(req: NextRequest) {
  try {
    const token = await getToken({ req, secret });
    if (!token?.learnerProfileId) return respondError("Unauthorized", 401);

    const learnerId = token.learnerProfileId as string;

    const profile = await prisma.learnerProfile.findUnique({
      where: { id: learnerId },
      include: {
        user: { select: { name: true, email: true, image: true } },
        _count: {
          select: {
            progress: { where: { completedAt: { not: null } } },
            badges: true,
            xpRecords: true,
          },
        },
      },
    });

    if (!profile) return respondError("Profile not found", 404);

    return json({
      profile: {
        id: profile.id,
        displayName: profile.displayName,
        grade: profile.grade,
        totalXp: profile.totalXp,
        currentStreak: profile.currentStreak,
        bestStreak: profile.bestStreak,
        completedItems: profile._count.progress,
        badgesCount: profile._count.badges,
        xpEventsCount: profile._count.xpRecords,
      },
    });
  } catch (err) {
    console.error("GET learner profile error:", err);
    return respondError("Failed to fetch profile", 500);
  }
}

// GET /api/learner/xp — Get XP history
export async function GET_xp(req: NextRequest) {
  try {
    const token = await getToken({ req, secret });
    if (!token?.learnerProfileId) return respondError("Unauthorized", 401);

    const xpRecords = await prisma.xpRecord.findMany({
      where: { learnerId: token.learnerProfileId as string },
      orderBy: { awardedAt: "desc" },
      take: 50,
    });

    return json({ xpRecords });
  } catch (err) {
    console.error("GET xp error:", err);
    return respondError("Failed to fetch XP records", 500);
  }
}

// GET /api/learner/badges — Get badges
export async function GET_badges(req: NextRequest) {
  try {
    const token = await getToken({ req, secret });
    if (!token?.learnerProfileId) return respondError("Unauthorized", 401);

    const badges = await prisma.badge.findMany({
      where: { learnerId: token.learnerProfileId as string },
      orderBy: { awardedAt: "desc" },
    });

    return json({ badges });
  } catch (err) {
    console.error("GET badges error:", err);
    return respondError("Failed to fetch badges", 500);
  }
}

// GET /api/learner/progress — Get all progress
export async function GET_progress(req: NextRequest) {
  try {
    const token = await getToken({ req, secret });
    if (!token?.learnerProfileId) return respondError("Unauthorized", 401);

    const progress = await prisma.progress.findMany({
      where: { learnerId: token.learnerProfileId as string },
      include: {
        lesson: { select: { title: true, slug: true } },
        quest: { select: { title: true, slug: true } },
      },
      orderBy: { lastAccessed: "desc" },
      take: 100,
    });

    return json({ progress });
  } catch (err) {
    console.error("GET progress error:", err);
    return respondError("Failed to fetch progress", 500);
  }
}
