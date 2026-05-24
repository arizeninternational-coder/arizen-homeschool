// GET /api/learner/progress — Get all progress

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET || "arizen-dev-secret-change-in-production";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret });
    if (!token?.learnerProfileId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const progress = await prisma.progress.findMany({
      where: { learnerId: token.learnerProfileId as string },
      include: {
        lesson: { select: { title: true, slug: true } },
        quest: { select: { title: true, slug: true } },
      },
      orderBy: { lastAccessed: "desc" },
      take: 100,
    });

    return NextResponse.json({ progress });
  } catch (err) {
    console.error("GET progress error:", err);
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 });
  }
}
