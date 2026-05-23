import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET || "arizen-dev-secret-change-in-production";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret });
    if (!token?.guildId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const learners = await prisma.learnerProfile.findMany({
      where: { guildId: token.guildId as string },
      select: { id: true, displayName: true, grade: true, totalXp: true, currentStreak: true, avatarUrl: true },
      orderBy: { grade: "asc" },
    });

    return NextResponse.json({ learners });
  } catch (err) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
