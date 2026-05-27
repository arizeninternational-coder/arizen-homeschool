// GET /api/guilds — List published themes for the user's guild
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabase } from "@/lib/supabase";
const secret = process.env.NEXTAUTH_SECRET || "arizen-dev-secret-change-in-production";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret });
    if (!token?.guildId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const guildId = token.guildId as string;

    const { data: themes, error } = await supabase
      .from("Theme")
      .select(`
        id, title, slug, description, drivingQuestion, durationWeeks, grade,
        themeSubjects:ThemeSubject(subject),
        quests:Quest(id, title, slug, questType, orderIndex, xpReward, status)
      `)
      .eq("guildId", guildId)
      .eq("status", "PUBLISHED")
      .orderBy("createdAt", { ascending: false });

    if (error) return NextResponse.json({ error: "Failed to fetch themes" }, { status: 500 });

    // Get progress for learner
    const learnerProfileId = token.learnerProfileId as string | null;
    let progressMap: Record<string, number> = {};
    if (learnerProfileId) {
      const { data: progressRecords } = await supabase
        .from("Progress")
        .select("lessonId, questId, masteryPercent")
        .eq("learnerId", learnerProfileId);
      for (const p of progressRecords || []) {
        const key = p.lessonId || p.questId;
        if (key) progressMap[key] = p.masteryPercent;
      }
    }

    return NextResponse.json({
      themes: (themes || []).map((t: any) => ({
        ...t,
        subjects: (t.themeSubjects || []).map((s: any) => s.subject),
        quests: (t.quests || []).map((q: any) => ({
          ...q,
          progress: progressMap[q.id] || 0,
        })),
      })),
    });
  } catch (err) {
    console.error("GET /api/guilds error:", err);
    return NextResponse.json({ error: "Failed to fetch themes" }, { status: 500 });
  }
}
