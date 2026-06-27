// POST /api/admin/lessons/[id]/illustrations/upload
// Admin-only: Upload an image for a specific journey step to Supabase Storage
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/api-guard";
export const dynamic = "force-dynamic";

const BUCKET_NAME = "lesson-illustrations";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"];

function getExtensionFromType(contentType: string): string {
  const map: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/webp": "webp",
    "image/svg+xml": "svg",
  };
  return map[contentType] || "bin";
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
    const { stepIndex, imageData, fileName, contentType } = body;

    // Validate inputs
    if (stepIndex === undefined || !imageData) {
      return NextResponse.json(
        { error: "stepIndex and imageData (base64) are required" },
        { status: 400 }
      );
    }

    // Validate file type
    if (contentType && !ALLOWED_TYPES.includes(contentType)) {
      return NextResponse.json(
        { error: `Invalid file type: ${contentType}. Allowed: ${ALLOWED_TYPES.join(", ")}` },
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

    const journey = meta.studentJourneyDraft?.length
      ? meta.studentJourneyDraft
      : meta.studentJourney || [];
    const step = journey[stepIndex];

    if (!step) {
      return NextResponse.json(
        { error: `Step at index ${stepIndex} not found` },
        { status: 404 }
      );
    }

    // Upload to Supabase Storage
    const ext = getExtensionFromType(contentType || "image/png");
    const timestamp = Date.now();
    const safeFileName = (fileName || "illustration").replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `lessons/${lessonId}/steps/${step.stepKey || stepIndex}-${timestamp}-${safeFileName}.${ext}`;

    // Try uploading — if bucket doesn't exist, attempt to create it (requires service role)
    let uploadErr = (await supabase.storage.from(BUCKET_NAME).upload(path, buffer, {
      contentType: contentType || "image/png",
      upsert: false,
    })).error;

    // If first upload fails (bucket missing), try creating bucket (no-op if exists)
    if (uploadErr) {
      await supabase.storage.createBucket(BUCKET_NAME, { public: true });
      const retry = await supabase.storage.from(BUCKET_NAME).upload(path, buffer, {
        contentType: contentType || "image/png",
        upsert: false,
      });
      uploadErr = retry.error;
    }

    if (uploadErr) {
      console.error("[UPLOAD_ILLUSTRATION] Storage error:", uploadErr);
      return NextResponse.json(
        { error: `Upload failed: ${uploadErr.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(path);

    const publicUrl = urlData?.publicUrl;

    if (!publicUrl) {
      return NextResponse.json(
        { error: "Upload succeeded but could not get public URL" },
        { status: 500 }
      );
    }

    // Update journey step with the new image
    if (!step.media) step.media = {};
    if (!step.media.illustration) step.media.illustration = {};

    // Keep previous URL for history
    const previousUrl = step.media.illustration.approvedUrl || null;
    
    step.media.illustration = {
      ...step.media.illustration,
      uploadedUrl: publicUrl,
      approvedUrl: publicUrl, // Auto-approve admin uploads
      approvedByAdmin: true,
      status: "APPROVED",
      uploadedAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
      errorMessage: null,
      mode: "uploaded",
    };

    // Update the journey in contentBlocks
    const newMeta = { ...meta };
    if (meta.studentJourneyDraft?.length) {
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
        { error: "Failed to save image reference. Try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Image uploaded and approved. Visible to students immediately.",
      stepIndex,
      publicUrl,
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

    // Fetch lesson
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

    const journey = meta.studentJourneyDraft?.length
      ? meta.studentJourneyDraft
      : meta.studentJourney || [];
    const step = journey[stepIndex];

    if (!step) {
      return NextResponse.json({ error: `Step at index ${stepIndex} not found` }, { status: 404 });
    }

    // Remove illustration from step
    if (step.media?.illustration) {
      const oldUrl = step.media.illustration.approvedUrl || step.media.illustration.uploadedUrl;
      
      // Try to delete from storage if it's a storage URL
      if (oldUrl && oldUrl.includes(BUCKET_NAME)) {
        const path = oldUrl.split(`${BUCKET_NAME}/`)[1];
        if (path) {
          supabase.storage.from(BUCKET_NAME).remove([path]).catch(() => {
            // Non-blocking: don't fail if delete doesn't work
          });
        }
      }

      step.media.illustration = {
        mode: "none",
        uploadedUrl: null,
        approvedUrl: null,
        approvedByAdmin: false,
        status: "MISSING",
        uploadedAt: null,
        approvedAt: null,
        errorMessage: null,
      };
    }

    // Update the journey
    const newMeta = { ...meta };
    if (meta.studentJourneyDraft?.length) {
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
