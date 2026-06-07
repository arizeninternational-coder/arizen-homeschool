// POST /api/admin/lessons/[id]/illustrations/approve
// Admin-only: Approve an illustration for student visibility
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
    const { stepIndex, action } = body; // action: "approve" | "reject" | "remove"

    if (stepIndex === undefined || !action) {
      return NextResponse.json(
        { error: "stepIndex and action are required" },
        { status: 400 }
      );
    }

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

    const journey = meta.studentJourney || meta.studentJourneyDraft || [];
    const step = journey[stepIndex];

    if (!step) {
      return NextResponse.json(
        { error: `Step at index ${stepIndex} not found` },
        { status: 404 }
      );
    }

    if (!step.media) step.media = {};
    if (!step.media.illustration) step.media.illustration = {};

    const ill = step.media.illustration;

    if (action === "approve") {
      // Copy generatedUrl or uploadedUrl into approvedUrl
      const sourceUrl = ill.generatedUrl || ill.uploadedUrl;
      if (!sourceUrl) {
        return NextResponse.json(
          { error: "No generated or uploaded image to approve" },
          { status: 400 }
        );
      }
      ill.approvedUrl = sourceUrl;
      ill.approvedByAdmin = true;
      ill.status = "APPROVED";
      ill.approvedAt = new Date().toISOString();
    } else if (action === "reject") {
      ill.approvedUrl = null;
      ill.approvedByAdmin = false;
      ill.status = "GENERATED"; // Keep generated, just not approved
    } else if (action === "remove") {
      step.media.illustration = {
        prompt: ill.prompt || step.illustrationPrompt || "",
        generatedUrl: null,
        uploadedUrl: null,
        approvedUrl: null,
        approvedByAdmin: false,
        status: "MISSING",
        errorMessage: null,
      };
    }

    const newMeta = { ...meta };
    if (meta.studentJourneyDraft) {
      newMeta.studentJourneyDraft = journey;
    } else {
      newMeta.studentJourney = journey;
    }

    const { error: updateErr } = await supabase
      .from("Lesson")
      .update({
        contentBlocks: JSON.stringify(newMeta),
        updatedAt: new Date().toISOString(),
      })
      .eq("id", lessonId);

    if (updateErr) {
      return NextResponse.json(
        { error: "Failed to update illustration. Try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: action === "approve" ? "Illustration approved and now visible to students." :
                action === "reject" ? "Illustration rejected." : "Illustration removed.",
      stepIndex,
      illustration: step.media.illustration,
    });
  } catch (err: any) {
    console.error("[APPROVE_ILLUSTRATION] Critical error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process illustration" },
      { status: 500 }
    );
  }
}
