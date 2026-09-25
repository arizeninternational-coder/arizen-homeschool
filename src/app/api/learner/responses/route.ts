// POST /api/learner/responses — Save an interaction response
// GET  /api/learner/responses?lessonId=xxx — Load responses for review

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAuthUser } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!user.learnerProfileId) {
      return NextResponse.json({ error: "Learner profile required" }, { status: 403 });
    }

    const body = await req.json();
    const {
      lessonId,
      activityId,
      conceptId,
      selectedAnswer,
      expectedAnswer,
      correct,
      misconceptionId,
      attemptNumber,
      remediationShown,
    } = body;

    if (!lessonId || !activityId || selectedAnswer === undefined || expectedAnswer === undefined || correct === undefined) {
      return NextResponse.json(
        { error: "lessonId, activityId, selectedAnswer, expectedAnswer, correct required" },
        { status: 400 }
      );
    }

    // INSERT (not upsert) — preserve attempt history as distinct rows.
    // If the table still enforces the old unique(learnerId,lessonId,activityId)
    // constraint (pre-migration Supabase schema), fall back to upsert on conflict
    // so we never lose the learner's latest evidence.
    const insertData: Record<string, any> = {
      learnerId: user.learnerProfileId,
      lessonId,
      activityId,
      conceptId: conceptId || null,
      selectedAnswer: String(selectedAnswer),
      expectedAnswer: String(expectedAnswer),
      correct,
      ...(misconceptionId ? { misconceptionId } : { misconceptionId: null }),
      ...(attemptNumber != null ? { attemptNumber } : { attemptNumber: 1 }),
      ...(remediationShown != null ? { remediationShown } : { remediationShown: null }),
    };

    const { data, error } = await supabase
      .from("InteractionResponse")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      // Fallback: upsert if the insert violates the old unique constraint
      const { data: upsertData, error: upsertError } = await supabase
        .from("InteractionResponse")
        .upsert(insertData, {
          onConflict: "learnerId,lessonId,activityId",
          ignoreDuplicates: false,
        })
        .select()
        .single();

      if (upsertError) throw upsertError;
      return NextResponse.json({ success: true, response: upsertData, upserted: true });
    }

    return NextResponse.json({ success: true, response: data, upserted: false });
  } catch (err: any) {
    console.error("[RESPONSE_SAVE] Error:", err);
    return NextResponse.json({ error: err.message || "Failed to save response" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!user.learnerProfileId) {
      return NextResponse.json({ responses: [] });
    }

    const { searchParams } = new URL(req.url);
    const lessonId = searchParams.get("lessonId");

    let query = supabase
      .from("InteractionResponse")
      .select("id, lessonId, activityId, conceptId, selectedAnswer, expectedAnswer, correct, misconceptionId, attemptNumber, remediationShown, timestamp")
      .eq("learnerId", user.learnerProfileId)
      .order("timestamp", { ascending: true });

    if (lessonId) query = query.eq("lessonId", lessonId);

    const { data, error } = await query.limit(200);
    if (error) throw error;

    return NextResponse.json({ responses: data || [] });
  } catch (err: any) {
    console.error("[RESPONSE_LOAD] Error:", err);
    return NextResponse.json({ error: err.message || "Failed to load responses" }, { status: 500 });
  }
}
