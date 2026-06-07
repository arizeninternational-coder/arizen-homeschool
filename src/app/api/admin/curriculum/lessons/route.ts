// GET /api/admin/curriculum/lessons — List imported lessons for a grade+subject
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/api-guard";
export const dynamic = "force-dynamic";

const SUBJECT_NAME_MAP: Record<string, string> = {
  mathematics: "Mathematics",
  english: "English",
  kiswahili: "Kiswahili",
  science: "Science",
  "social-studies": "Social Studies",
  environmental: "Environmental",
  movement: "Movement",
  hygiene: "Hygiene & Nutrition",
  "hygiene-nutrition": "Hygiene & Nutrition",
  agriculture: "Agriculture",
  "creative-arts": "Creative Arts",
  "religious-education": "IRE / CRE",
  business: "Business Studies",
  computing: "Computing",
  literacy: "Literacy",
  "movement-creative": "Movement & Creative",
  ire: "IRE",
  hpe: "HPE",
  "pre-technical": "Pre-Technical Studies",
  "science-tech": "Science & Technology",
};

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60).replace(/-+$/, "");
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const gradeId = Number(searchParams.get("gradeId"));
    const subjectSlug = searchParams.get("subjectSlug");

    if (!gradeId || !subjectSlug) {
      return NextResponse.json({ error: "gradeId and subjectSlug are required" }, { status: 400 });
    }

    const subjectName = SUBJECT_NAME_MAP[subjectSlug.toLowerCase()] || subjectSlug;
    const themeSlug = `g${gradeId}-${slugify(subjectName)}`;

    // Fix: use exact match on slug + grade instead of loose ilike
    const { data: themes } = await supabase
      .from("Theme")
      .select("id, title, slug")
      .eq("grade", gradeId)
      .eq("slug", themeSlug)
      .limit(1);

    if (!themes || themes.length === 0) {
      return NextResponse.json({ lessons: [], theme: null });
    }

    const theme = themes[0];

    // Get all quests for this theme
    const { data: quests } = await supabase
      .from("Quest")
      .select("id, title")
      .eq("themeId", theme.id);

    if (!quests || quests.length === 0) {
      return NextResponse.json({ lessons: [], theme });
    }

    const questIds = quests.map(q => q.id);
    const questMap = new Map(quests.map(q => [q.id, q.title]));

    // Get all lessons for these quests
    const { data: lessons } = await supabase
      .from("Lesson")
      .select("*")
      .in("questId", questIds)
      .order("orderIndex", { ascending: true });

    if (!lessons || lessons.length === 0) {
      return NextResponse.json({ lessons: [], theme });
    }

    // Parse contentBlocks and enrich
    const { checkLessonReadiness } = await import("@/lib/curriculum/lesson-journey");
    const enriched = lessons.map(lesson => {
      let meta: any = {};
      try { meta = JSON.parse(lesson.contentBlocks || "{}"); } catch {}

      // Calculate readiness
      let readiness: any = null;
      try {
        const r = checkLessonReadiness(meta);
        readiness = {
          score: r.score,
          isReady: r.isReady,
          missingSteps: r.missingSteps,
          hasApprovedJourney: r.hasApprovedJourney || false,
          hasDraftJourney: r.hasDraftJourney || false,
          draftReviewStatus: r.draftReviewStatus || null,
        };
      } catch {}

      // Extract generation status for quick reference
      const aiMeta = meta.aiMetadata || {};
      const generationStatus = aiMeta.reviewStatus
        ? (aiMeta.reviewStatus === "NEEDS_REVIEW" ? "Draft generated" :
           aiMeta.reviewStatus === "APPROVED" ? "Approved" :
           aiMeta.reviewStatus === "REJECTED" ? "Rejected" : "Not generated")
        : (Array.isArray(meta.studentJourneyDraft) && meta.studentJourneyDraft.length > 0)
          ? "Draft generated"
          : "Not generated";

      return {
        id: lesson.id,
        title: lesson.title,
        slug: lesson.slug,
        description: lesson.description,
        status: lesson.status,
        orderIndex: lesson.orderIndex,
        xpReward: lesson.xpReward,
        difficulty: lesson.difficulty,
        estimatedDurationMinutes: lesson.estimatedDurationMinutes,
        createdAt: lesson.createdAt,
        questTitle: questMap.get(lesson.questId) || "",
        // Enriched fields from contentBlocks
        strand: meta.strand || "",
        subStrand: meta.subStrand || "",
        learningOutcome: meta.learningOutcome || "",
        term: meta.term || "",
        week: meta.week || "",
        activityTitle: meta.activityTitle || "",
        activityInstructions: meta.activityInstructions || "",
        questInstructions: meta.questInstructions || "",
        reflectionPrompt: meta.reflectionPrompt || "",
        rewardCoins: meta.rewardCoins || 10,
        rewardStars: meta.rewardStars || 0,
        readiness,
        generationStatus,
      };
    });

    return NextResponse.json({ lessons: enriched, theme });
  } catch (err: any) {
    console.error("[CURRICULUM_LESSONS] Error:", err);
    return NextResponse.json({ error: err.message || "Failed to load lessons" }, { status: 500 });
  }
}
