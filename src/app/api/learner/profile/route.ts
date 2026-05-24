// GET /api/learner/profile — Get current learner's full profile

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET || "arizen-dev-secret-change-in-production";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret });
    if (!token?.learnerProfileId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    return NextResponse.json({
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
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}
