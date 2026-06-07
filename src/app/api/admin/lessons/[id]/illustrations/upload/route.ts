// POST /api/admin/lessons/[id]/illustrations/upload
// Admin-only: Upload an image for a specific journey step
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
    const { stepIndex, imageUrl, imageData } = body;

    if (stepIndex === undefined || (!imageUrl && !imageData)) {
      return NextResponse.json(
        { error: "stepIndex and imageUrl (or imageData) are required" },
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

    const journey = meta.studentJourney || meta.studentJourneyDraft || [];
    const step = journey[stepIndex];

    if (!step) {
      return NextResponse.json(
        { error: `Step at index ${stepIndex} not found` },
        { status: 404 }
      );
    }

    // In a real implementation, imageData would be uploaded to Supabase Storage
    // For now, we store the URL directly
    const uploadedUrl = imageUrl || `uploaded://${Date.now()}/${stepIndex}`;

    if (!step.media) step.media = {};
    if (!step.media.illustration) step.media.illustration = {};

    step.media.illustration = {
      ...step.media.illustration,
      uploadedUrl: uploadedUrl,
      approvedUrl: null,
      approvedByAdmin: false,
      status: "UPLOADED",
      uploadedAt: new Date().toISOString(),
      errorMessage: null,
    };

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
        { error: "Failed to save uploaded image. Try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Image uploaded. Approve to make it student-visible.",
      stepIndex,
      illustration: step.media.illustration,
    });
  } catch (err: any) {
    console.error("[UPLOAD_ILLUSTRATION] Critical error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to upload image" },
      { status: 500 }
    );
  }
}
