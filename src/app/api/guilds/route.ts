// GET /api/guilds — List published themes for the user's guild
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { withAuth } from "@/lib/api-guard";
export const dynamic = "force-dynamic";

export const GET = withAuth(async (req, user) => {
  try {
    const guildId = user.guildId || user.guildSlug;
    if (!guildId) return NextResponse.json({ error: "No guild assigned" }, { status: 400 });

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
    let progressMap: Record<string, number> = {};
    if (user.learnerProfileId) {
      const { data: progressRecords } = await supabase
        .from("Progress")
        .select("lessonId, questId, masteryPercent")
        .eq("learnerId", user.learnerProfileId);
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
});
