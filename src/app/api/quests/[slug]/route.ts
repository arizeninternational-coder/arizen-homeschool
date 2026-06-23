// GET /api/quests/[slug] — Get quest with lessons and progress
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { withAuth } from "@/lib/api-guard";
export const dynamic = "force-dynamic";

function respondError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export const GET = withAuth(async (req, user, url) => {
  try {

    const slug = url.searchParams.get("slug");
    if (!slug) return respondError("Slug required", 400);

    // Find the quest by slug (any status — students see quests with published lessons)
    const { data: quest, error: questError } = await supabase
      .from("Quest")
      .select("id, title, slug, description, questType, orderIndex, coverImage, xpReward")
      .eq("slug", slug)
      .maybeSingle();

    if (questError) {
      console.error("[QUEST_API] DB error:", questError.message);
      return respondError("Database error: " + questError.message, 500);
    }

    if (!quest) {
      return respondError("Quest not found", 404);
    }

    const activeQuest = quest;

    // Get lessons with contentBlocks for visibility filtering
    let lessons: any[] = [];
    try {
      const q = supabase
        .from("Lesson")
        .select("id, title, slug, description, orderIndex, xpReward, contentBlocks")
        .eq("questId", activeQuest.id)
        .eq("status", "PUBLISHED");
      const { data: lessonData, error: lessonError } = await q;
      if (lessonError) {
        console.error("[QUEST_API] Lessons error:", lessonError.message);
      } else if (lessonData) {
        // Filter to only student-visible lessons
        lessons = lessonData.filter((l: any) => {
          let cb = l.contentBlocks;
          if (typeof cb === "string") { try { cb = JSON.parse(cb); } catch { return false; } }
          if (!cb || typeof cb !== "object") return false;
          const aiMeta = cb.aiMetadata || {};
          if (aiMeta.studentVisible !== true) return false;
          const journey = cb.studentJourney || [];
          if (!Array.isArray(journey) || journey.length !== 10) return false;
          // Check no reading comprehension contamination for non-English lessons
          const isEnglish = l.slug?.startsWith("g2-english") || cb.subject === "English";
          const allText = journey.map((s: any) => `${s.studentText || ""} ${s.owlText || ""}`).join(" ").toLowerCase();
          if (!isEnglish && allText.includes("reading comprehension")) return false;
          return true;
        });
        lessons.sort((a: any, b: any) => (a.orderIndex || 0) - (b.orderIndex || 0));
      }
    } catch (e: any) {
      console.error("[QUEST_API] Lessons catch:", e.message);
    }

    // Get progress
    const learnerProfileId = user.learnerProfileId;
    let progressMap: Record<string, { mastery: number; completedAt: string | null }> = {};
    if (learnerProfileId && lessons.length > 0) {
      try {
        const lessonIds = lessons.map((l: any) => l.id);
        const { data: progressRecords } = await supabase
          .from("Progress")
          .select("lessonId, masteryPercent, completedAt")
          .eq("learnerId", learnerProfileId)
          .in("lessonId", lessonIds);

        for (const r of progressRecords || []) {
          if (r.lessonId) progressMap[r.lessonId] = { mastery: r.masteryPercent, completedAt: r.completedAt };
        }
      } catch (e: any) {
        console.error("[QUEST_API] Progress error:", e.message);
      }
    }

    return NextResponse.json({
      quest: {
        ...activeQuest,
        lessons: (lessons || []).map((l: any) => ({
          ...l,
          progress: progressMap[l.id]?.mastery || 0,
          isCompleted: !!progressMap[l.id]?.completedAt,
        })),
        progress: progressMap[activeQuest.id]?.mastery || 0,
        isCompleted: !!progressMap[activeQuest.id]?.completedAt,
      },
    });
  } catch (err: any) {
    console.error("GET quest error:", err);
    return respondError("Failed to fetch quest: " + (err?.message || String(err)), 500);
  }
});
