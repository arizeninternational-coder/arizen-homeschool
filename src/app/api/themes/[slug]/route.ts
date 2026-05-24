// @ts-nocheck
// ── Themes by slug ──────────────────────────────────────────

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

// GET /api/themes/[slug] — Get single theme with quests and lessons
export async function GET(req: NextRequest, props: any) {
  try {
    const token = await getToken({ req, secret });
    if (!token?.guildId) return respondError("Unauthorized", 401);
    const slug = props.params.slug as string;

    const theme = await prisma.theme.findFirst({
      where: {
        slug,
        guildId: token.guildId as string,
        status: "PUBLISHED",
      },
      include: {
        themeSubjects: true,
        quests: {
          where: { status: "PUBLISHED" },
          orderBy: { orderIndex: "asc" },
          include: {
            _count: { select: { lessons: true } },
            lessons: {
              where: { status: "PUBLISHED" },
              orderBy: { orderIndex: "asc" },
              select: { id: true, title: true, slug: true, orderIndex: true },
            },
            sideQuests: {
              where: { status: "PUBLISHED" },
              select: { id: true, title: true, sideQuestType: true },
            },
          },
        },
      },
    });

    if (!theme) return respondError("Theme not found", 404);

    return json({
      theme: {
        ...theme,
        subjects: theme.themeSubjects.map((s) => s.subject),
        quests: theme.quests.map((q) => ({
          ...q,
          lessons: q.lessons,
          sideQuests: q.sideQuests,
        })),
      },
    });
  } catch (err) {
    console.error("GET theme error:", err);
    return respondError("Failed to fetch theme", 500);
  }
}
