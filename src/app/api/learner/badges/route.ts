// GET /api/learner/badges — Get badges

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET || "arizen-dev-secret-change-in-production";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret });
    if (!token?.learnerProfileId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const badges = await prisma.badge.findMany({
      where: { learnerId: token.learnerProfileId as string },
      orderBy: { awardedAt: "desc" },
    });

    return NextResponse.json({ badges });
  } catch (err) {
    console.error("GET badges error:", err);
    return NextResponse.json({ error: "Failed to fetch badges" }, { status: 500 });
  }
}
