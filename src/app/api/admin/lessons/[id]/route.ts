// GET /api/admin/lessons/[id] — Get single lesson detail (ADMIN only)
// PATCH /api/admin/lessons/[id] — Update lesson (ADMIN only)
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/api-guard";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { data: lesson, error } = await supabase
      .from("Lesson")
      .select(`
        id,
        title,
        slug,
        description,
        status,
        orderIndex,
        xpReward,
        contentBlocks,
        difficulty,
        estimatedDurationMinutes,
        createdAt,
        updatedAt,
        quest:Quest(
          id,
          title,
          theme:Theme(
            id,
            title,
            grade
          )
        )
      `)
      .eq("id", params.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
      }
      console.error("[ADMIN_LESSON_DETAIL] Error:", error.message);
      // If column doesn't exist, try with minimal columns
      if (error.message?.includes("does not exist")) {
        const { data: minimal, error: err2 } = await supabase
          .from("Lesson")
          .select("id, title, slug, description, status, orderIndex, xpReward, contentBlocks, difficulty, estimatedDurationMinutes, createdAt, updatedAt")
          .eq("id", params.id)
          .single();
        if (err2) return NextResponse.json({ error: err2.message }, { status: 500 });
        return NextResponse.json({ lesson: minimal });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Parse contentBlocks to extract CSV-imported fields for editing
    let meta: any = {};
    try { meta = JSON.parse(lesson.contentBlocks || "{}"); } catch {}
    const enriched = {
      ...lesson,
      strand: meta.strand || "",
      subStrand: meta.subStrand || "",
      learningOutcome: meta.learningOutcome || "",
      term: meta.term || "",
      week: meta.week || "",
      activityTitle: meta.activityTitle || "",
      activityInstructions: meta.activityInstructions || "",
      questTitle: meta.questTitle || "",
      questInstructions: meta.questInstructions || "",
      reflectionPrompt: meta.reflectionPrompt || "",
      rewardCoins: meta.rewardCoins || 10,
      rewardStars: meta.rewardStars || 0,
    };

    return NextResponse.json({ lesson: enriched });
  } catch (err: any) {
    console.error("[ADMIN_LESSON_DETAIL] Critical error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch lesson" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const {
      title, description, status, orderIndex, xpReward,
      estimatedDurationMinutes, difficulty,
      strand, subStrand, learningOutcome, term, week,
      activityTitle, activityInstructions,
      questTitle, questInstructions,
      reflectionPrompt, rewardCoins, rewardStars,
    } = body;

    // Build update object with only provided fields
    const updateFields: any = {};
    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (status !== undefined) updateFields.status = status;
    if (orderIndex !== undefined) updateFields.orderIndex = orderIndex;
    if (xpReward !== undefined) updateFields.xpReward = typeof xpReward === "string" ? xpReward : JSON.stringify({ base: xpReward });
    if (estimatedDurationMinutes !== undefined) updateFields.estimatedDurationMinutes = estimatedDurationMinutes;
    if (difficulty !== undefined) updateFields.difficulty = typeof difficulty === "string" ? difficulty : JSON.stringify({ level: difficulty || "medium", complexityScore: difficulty === "hard" ? 3 : difficulty === "easy" ? 1 : 2 });

    // Merge contentBlocks metadata
    const { data: existing } = await supabase
      .from("Lesson")
      .select("contentBlocks")
      .eq("id", params.id)
      .single();

    let existingMeta: any = {};
    try { existingMeta = JSON.parse(existing?.contentBlocks || "{}"); } catch {}

    const newMeta = {
      ...existingMeta,
      ...(strand !== undefined ? { strand } : {}),
      ...(subStrand !== undefined ? { subStrand } : {}),
      ...(learningOutcome !== undefined ? { learningOutcome } : {}),
      ...(term !== undefined ? { term } : {}),
      ...(week !== undefined ? { week } : {}),
      ...(activityTitle !== undefined ? { activityTitle } : {}),
      ...(activityInstructions !== undefined ? { activityInstructions } : {}),
      ...(questTitle !== undefined ? { questTitle } : {}),
      ...(questInstructions !== undefined ? { questInstructions } : {}),
      ...(reflectionPrompt !== undefined ? { reflectionPrompt } : {}),
      ...(rewardCoins !== undefined ? { rewardCoins } : {}),
      ...(rewardStars !== undefined ? { rewardStars } : {}),
    };
    updateFields.contentBlocks = JSON.stringify(newMeta);
    updateFields.updatedAt = new Date().toISOString();

    const { data: updated, error } = await supabase
      .from("Lesson")
      .update(updateFields)
      .eq("id", params.id)
      .select("id, title, slug, description, status, orderIndex, xpReward, contentBlocks, difficulty, estimatedDurationMinutes, createdAt, updatedAt")
      .single();

    if (error) {
      console.error("[ADMIN_LESSON_UPDATE] Error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ lesson: updated, success: true });
  } catch (err: any) {
    console.error("[ADMIN_LESSON_UPDATE] Critical error:", err);
    return NextResponse.json({ error: err.message || "Failed to update lesson" }, { status: 500 });
  }
}
