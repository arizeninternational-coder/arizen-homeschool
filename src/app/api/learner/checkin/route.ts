// POST /api/learner/checkin - Save or update today's emotional check-in
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAuthUser } from "@/lib/api-guard";
export const dynamic = "force-dynamic";

const VALID_EMOTIONS = ["HAPPY", "CALM", "CURIOUS", "OKAY", "WORRIED", "TIRED", "FRUSTRATED"];

const EMOTION_LABELS: Record<string, string> = {
  HAPPY: "Happy",
  CALM: "Calm",
  CURIOUS: "Curious",
  OKAY: "Okay",
  WORRIED: "Worried",
  TIRED: "Tired",
  FRUSTRATED: "Frustrated",
};

export async function POST(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authUser.learnerProfileId) return NextResponse.json({ error: "Learner profile required" }, { status: 403 });

  try {
    const body = await req.json();
    const { emotion, note } = body;

    if (!emotion || !VALID_EMOTIONS.includes(emotion)) {
      return NextResponse.json({ error: "Valid emotion required" }, { status: 400 });
    }

    const learnerId = authUser.learnerProfileId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check for existing check-in today
    const { data: existing } = await supabase
      .from("EmotionalCheckin")
      .select("id")
      .eq("learnerId", learnerId)
      .gte("createdAt", today.toISOString())
      .lt("createdAt", tomorrow.toISOString())
      .single();

    if (existing) {
      // Update existing
      const { data: updated, error } = await supabase
        .from("EmotionalCheckin")
        .update({ emotion, emotionLabel: EMOTION_LABELS[emotion], note: note || null, updatedAt: new Date().toISOString() })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ checkin: updated, updated: true });
    }

    // Create new
    const { data: created, error } = await supabase
      .from("EmotionalCheckin")
      .insert({
        learnerId,
        emotion,
        emotionLabel: EMOTION_LABELS[emotion],
        note: note || null,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ checkin: created, updated: false }, { status: 201 });
  } catch (err: any) {
    console.error("[CHECKIN] Error:", err);
    return NextResponse.json({ error: err.message || "Failed to save check-in" }, { status: 500 });
  }
}

// GET /api/learner/checkin - Get today's check-in for current learner
export async function GET(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authUser.learnerProfileId) return NextResponse.json({ checkin: null });

  try {
    const learnerId = authUser.learnerProfileId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data } = await supabase
      .from("EmotionalCheckin")
      .select("*")
      .eq("learnerId", learnerId)
      .gte("createdAt", today.toISOString())
      .lt("createdAt", tomorrow.toISOString())
      .single();

    return NextResponse.json({ checkin: data || null });
  } catch (err: any) {
    return NextResponse.json({ checkin: null });
  }
}
