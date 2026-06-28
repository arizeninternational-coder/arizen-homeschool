// POST /api/admin/lessons/[id]/illustrations/generate
// Admin-only: Generate an AI image for a journey step
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/api-guard";
import { ensureBucketExists } from "@/lib/storage-setup";
export const dynamic = "force-dynamic";

const BUCKET_NAME = "lesson-illustrations";
const STATIC_FALLBACK_URL = "/images/lessons/amina-holding-chapati.svg";

const DEFAULT_WELCOME_PROMPT = "Simple flat educational illustration for a Grade 2 math lesson. Show Amina standing on the left and her brother on the right, with one round chapati clearly visible between them. Both children are smiling. Warm simple background. No text, no labels, no fractions, no cutting. Clean child-friendly style.";

/**
 * Generate an image using OpenAI DALL-E (if OPENAI_API_KEY is set).
 * Returns null if no AI provider is configured.
 */
async function generateImage(prompt: string): Promise<{ url: string; base64: string } | null> {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) return null;

  try {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${openaiKey}` },
      body: JSON.stringify({ model: "dall-e-3", prompt, n: 1, size: "1024x1024", response_format: "b64_json" }),
    });
    if (res.ok) {
      const data = await res.json();
      const b64 = data.data[0].b64_json;
      return { base64: b64, url: `data:image/png;base64,${b64}` };
    }
    console.error("[AI_GENERATE] OpenAI error:", await res.text());
  } catch (err) {
    console.error("[AI_GENERATE] OpenAI fetch error:", err);
  }
  return null;
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
    const { stepIndex, prompt: customPrompt, approve } = body;

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

    // Determine prompt
    const prompt = customPrompt || step.mediaSpec?.illustration?.prompt || step.illustrationPrompt || DEFAULT_WELCOME_PROMPT;

    // Generate image
    const result = await generateImage(prompt);

    let generatedUrl: string | null = null;

    if (result) {
      // Ensure bucket exists before upload
      const bucketStatus = await ensureBucketExists();
      if (!bucketStatus.ready) {
        return NextResponse.json({ error: bucketStatus.error }, { status: 500 });
      }

      // Upload generated image to Supabase Storage
      const timestamp = Date.now();
      const path = `lessons/${lessonId}/steps/${step.stepKey || stepIndex}/generated/${timestamp}.png`;
      const buffer = Buffer.from(result.base64, "base64");

      const { error: uploadErr } = await supabase.storage.from(BUCKET_NAME).upload(path, buffer, {
        contentType: "image/png",
        upsert: false,
      });

      if (!uploadErr) {
        const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
        generatedUrl = urlData?.publicUrl || null;
      }
    }

    // If AI generation failed, fall back to static SVG illustration
    const finalUrl = generatedUrl || STATIC_FALLBACK_URL;
    const usedFallback = !generatedUrl;

    // Update journey step
    if (!step.mediaSpec) step.mediaSpec = {};
    if (!step.mediaSpec.illustration) step.mediaSpec.illustration = {};

    step.mediaSpec.illustration = {
      ...step.mediaSpec.illustration,
      prompt,
      generatedUrl: generatedUrl,
      approvedUrl: approve ? finalUrl : step.mediaSpec.illustration.approvedUrl,
      source: generatedUrl ? "generated" : "static",
      status: approve ? "approved" : (generatedUrl ? "generated" : step.mediaSpec.illustration.status),
      generatedAt: new Date().toISOString(),
      approvedAt: approve ? new Date().toISOString() : step.mediaSpec.illustration.approvedAt,
      mode: generatedUrl ? "generated" : step.mediaSpec.illustration.mode,
      reviewStatus: approve ? "approved" : "needs_review",
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
        { error: "Failed to save generated image reference." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: generatedUrl
        ? (approve ? "Image generated and approved." : "Image generated. Preview and approve.")
        : "AI provider not configured. Using static illustration as fallback.",
      stepIndex,
      generatedUrl: finalUrl,
      illustration: step.mediaSpec.illustration,
      usedFallback,
    });
  } catch (err: any) {
    console.error("[AI_GENERATE] Critical error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate image" },
      { status: 500 }
    );
  }
}
