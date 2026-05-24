// GET /api/learner/xp — Get XP history

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET || "arizen-dev-secret-change-in-production";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret });
    if (!token?.learnerProfileId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const xpRecords = await prisma.xpRecord.findMany({
      where: { learnerId: token.learnerProfileId as string },
      orderBy: { awardedAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ xpRecords });
  } catch (err) {
    console.error("GET xp error:", err);
    return NextResponse.json({ error: "Failed to fetch XP records" }, { status: 500 });
  }
}
