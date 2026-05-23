import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/db/prisma";

const secret = process.env.NEXTAUTH_SECRET || "arizen-dev-secret-change-in-production";

// ── Helpers ──────────────────────────────────────────────────

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

async function getAuthenticatedUser(req: NextRequest) {
  const token = await getToken({ req, secret });
  if (!token?.sub) return null;

  const user = await prisma.user.findUnique({
    where: { id: token.sub },
    include: { learnerProfile: true, guild: true },
  });

  return user;
}

// ── Session endpoint ─────────────────────────────────────────

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return error("Unauthorized", 401);

  return json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      guildId: user.guildId,
      guildSlug: user.guild.slug,
      guildName: user.guild.name,
      learnerProfile: user.learnerProfile
        ? {
            id: user.learnerProfile.id,
            displayName: user.learnerProfile.displayName,
            grade: user.learnerProfile.grade,
            totalXp: user.learnerProfile.totalXp,
            currentStreak: user.learnerProfile.currentStreak,
            bestStreak: user.learnerProfile.bestStreak,
          }
        : null,
    },
  });
}
