// POST /api/admin/lessons/[id]/illustrations/upload
// Admin-only: Upload an image for a specific journey step to Supabase Storage
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/api-guard";
import { ensureBucketExists } from "@/lib/storage-setup";
export const dynamic = "force-dynamic";

const BUCKET_NAME = "lesson-illustrations";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

function safeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const lessonId = params.id;

  try {
    const body = await req.json();
    const { stepIndex, imageData, fileName, contentType, approve } = body;

    if (stepIndex === undefined || !imageData) {
      return NextResponse.json(
        { error: "stepIndex and imageData (base64) are required" },
        { status: 400 }
      );
    }

    // Validate file type
    if (contentType && !ALLOWED_TYPES[contentType]) {
      return NextResponse.json(
        { error: `Invalid file type: ${contentType}. Allowed: ${Object.keys(ALLOWED_TYPES).join(", ")}` },
        { status: 400 }
      );
    }

    // Decode base64 and validate size
    const base64Data = imageData.replace(/^data:.*?;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    if (buffer.length > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large (${(buffer.length / 1024 / 1024).toFixed(1)} MB). Maximum: 5 MB` },
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

    // Determine which journey array to update
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

    // Ensure bucket exists (uses service role key)
    const bucketStatus = await ensureBucketExists();
    if (!bucketStatus.ready) {
      return NextResponse.json(
        { error: `Storage bucket "${BUCKET_NAME}" does not exist. ${bucketStatus.error}` },
        { status: 500 }
      );
    }

    // Upload to Supabase Storage
    const ext = ALLOWED_TYPES[contentType] || "png";
    const timestamp = Date.now();
    const safeName = safeFilename(fileName || "illustration");
    const path = `lessons/${lessonId}/steps/${step.stepKey || stepIndex}/uploads/${timestamp}-${safeName}`;

    const { error: uploadErr } = await supabase.storage.from(BUCKET_NAME).upload(path, buffer, {
      contentType: contentType || "image/png",
      upsert: false,
    });

    if (uploadErr) {
      console.error("[UPLOAD_ILLUSTRATION] Storage error:", uploadErr);
      return NextResponse.json(
        { error: `Upload failed: ${uploadErr.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
    const publicUrl = urlData?.publicUrl;

    if (!publicUrl) {
      return NextResponse.json(
        { error: "Upload succeeded but could not get public URL" },
        { status: 500 }
      );
    }

    // Update journey step with new image model
    if (!step.mediaSpec) step.mediaSpec = {};
    if (!step.mediaSpec.illustration) step.mediaSpec.illustration = {};

    step.mediaSpec.illustration = {
      ...step.mediaSpec.illustration,
      uploadedUrl: publicUrl,
      approvedUrl: approve ? publicUrl : step.mediaSpec.illustration.approvedUrl,
      source: "uploaded",
      status: approve ? "approved" : (step.mediaSpec.illustration.status || "generated"),
      uploadedAt: new Date().toISOString(),
      approvedAt: approve ? new Date().toISOString() : step.mediaSpec.illustration.approvedAt,
      mode: "uploaded",
      reviewStatus: approve ? "approved" : step.mediaSpec.illustration.reviewStatus,
    };

    // Save back to contentBlocks
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
        { error: "Failed to save image reference. Try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: approve ? "Image uploaded and approved." : "Image uploaded. Approve to make it student-visible.",
      stepIndex,
      publicUrl,
      illustration: step.mediaSpec.illustration,
    });
  } catch (err: any) {
    console.error("[UPLOAD_ILLUSTRATION] Critical error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to upload image" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/lessons/[id]/illustrations/upload
// Admin-only: Remove illustration from a journey step
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const lessonId = params.id;

  try {
    const body = await req.json().catch(() => ({}));
    const { stepIndex } = body;

    if (stepIndex === undefined) {
      return NextResponse.json({ error: "stepIndex is required" }, { status: 400 });
    }

    const { data: lesson, error: fetchErr } = await supabase
      .from("Lesson")
      .select("id, contentBlocks")
      .eq("id", lessonId)
      .single();

    if (fetchErr || !lesson) {
      return NextResponse.json({ error: fetchErr?.message || "Lesson not found" }, { status: 404 });
    }

    let meta: any = {};
    try { meta = JSON.parse(lesson.contentBlocks || "{}"); } catch {}

    const hasDraft = Array.isArray(meta.studentJourneyDraft) && meta.studentJourneyDraft.length > 0;
    const journeyKey = hasDraft ? "studentJourneyDraft" : "studentJourney";
    const journey = meta[journeyKey] || [];
    const step = journey[stepIndex];

    if (!step) {
      return NextResponse.json({ error: `Step at index ${stepIndex} not found` }, { status: 404 });
    }

    // Try to delete from storage if it's a storage URL
    if (step.mediaSpec?.illustration?.uploadedUrl) {
      const oldUrl = step.mediaSpec.illustration.uploadedUrl;
      if (oldUrl.includes(BUCKET_NAME)) {
        const filePath = oldUrl.split(`${BUCKET_NAME}/`)[1];
        if (filePath) {
          supabase.storage.from(BUCKET_NAME).remove([filePath]).catch(() => {});
        }
      }
    }

    // Reset illustration
    step.mediaSpec.illustration = {
      caption: step.mediaSpec.illustration?.caption || "",
      prompt: step.mediaSpec.illustration?.prompt || "",
      approvedUrl: null,
      generatedUrl: null,
      uploadedUrl: null,
      source: "fallback",
      status: "none",
      mode: "none",
      reviewStatus: "needs_review",
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
      return NextResponse.json({ error: "Failed to save changes" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Illustration removed",
      stepIndex,
    });
  } catch (err: any) {
    console.error("[DELETE_ILLUSTRATION] Critical error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to remove illustration" },
      { status: 500 }
    );
  }
}
