// POST /api/admin/lessons/[id]/illustrations/approve
// Admin-only: Approve an image (generated or uploaded) for student view
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/api-guard";
export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const lessonId = params.id;

  try {
    const body = await req.json();
    const { stepIndex, imageUrl, source } = body;

    if (stepIndex === undefined || !imageUrl) {
      return NextResponse.json(
        { error: "stepIndex and imageUrl are required" },
        { status: 400 }
      );
    }

    // Fetch lesson
    const { data: lesson, error: fetchErr } = await supabase
      .from("Lesson")
      .select("id, contentBlocks")
      .eq("id", lessonId)
      .single();

    if (fetchErr || !lesson) {
      return NextResponse.json(
        { error: fetchErr?.message || "Lesson not found" },
        { status: 404 }
      );
    }

    let meta: any = {};
    try { meta = JSON.parse(lesson.contentBlocks || "{}"); } catch {}

    const hasDraft = Array.isArray(meta.studentJourneyDraft) && meta.studentJourneyDraft.length > 0;
    const journeyKey = hasDraft ? "studentJourneyDraft" : "studentJourney";
    const journey = meta[journeyKey] || [];
    const step = journey[stepIndex];

    if (!step) {
      return NextResponse.json(
        { error: `Step at index ${stepIndex} not found` },
        { status: 404 }
      );
    }

    // Update illustration with approved URL
    if (!step.mediaSpec) step.mediaSpec = {};
    if (!step.mediaSpec.illustration) step.mediaSpec.illustration = {};

    step.mediaSpec.illustration = {
      ...step.mediaSpec.illustration,
      approvedUrl: imageUrl,
      source: source || step.mediaSpec.illustration.source,
      status: "approved",
      approvedAt: new Date().toISOString(),
      mode: source || step.mediaSpec.illustration.mode,
      reviewStatus: "approved",
    };

    const newMeta = { ...meta, [journeyKey]: journey };

    const { error: updateErr } = await supabase
      .from("Lesson")
      .update({
        contentBlocks: JSON.stringify(newMeta),
        updatedAt: new Date().toISOString(),
      })
      .eq("id", lessonId);

    if (updateErr) {
      return NextResponse.json(
        { error: "Failed to save approval." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Image approved and is now visible to students.",
      stepIndex,
      illustration: step.mediaSpec.illustration,
    });
  } catch (err: any) {
    console.error("[APPROVE_ILLUSTRATION] Critical error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to approve image" },
      { status: 500 }
    );
  }
}
