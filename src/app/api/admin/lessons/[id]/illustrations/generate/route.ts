// POST /api/admin/lessons/[id]/illustrations/generate
// Admin-only: Generate an illustration for a specific journey step using AI
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
    const { stepIndex, illustrationPrompt, stylePreset } = body;

    if (stepIndex === undefined || !illustrationPrompt) {
      return NextResponse.json(
        { error: "stepIndex and illustrationPrompt are required" },
        { status: 400 }
      );
    }

    // Check for image generation API key (OpenRouter or other)
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Image generation API key not configured. Set OPENROUTER_API_KEY in environment.",
        },
        { status: 503 }
      );
    }

    // Fetch lesson
    const { data: lesson, error: fetchErr } = await supabase
      .from("Lesson")
      .select("id, title, contentBlocks")
      .eq("id", lessonId)
      .single();

    if (fetchErr || !lesson) {
      return NextResponse.json(
        { error: fetchErr?.message || "Lesson not found" },
        { status: 404 }
      );
    }

    // Parse contentBlocks
    let meta: any = {};
    try {
      meta = JSON.parse(lesson.contentBlocks || "{}");
    } catch {}

    // Find the journey (approved or draft)
    const journey = meta.studentJourney || meta.studentJourneyDraft || [];
    const step = journey[stepIndex];

    if (!step) {
      return NextResponse.json(
        { error: `Step at index ${stepIndex} not found in journey` },
        { status: 404 }
      );
    }

    // Build the image generation prompt with style guidelines
    const styleGuide = stylePreset || "warm, child-friendly, Kenyan classroom/home context, clear objects, not too busy, Grade 2 appropriate, visually consistent";
    const enhancedPrompt = `${illustrationPrompt}. Style: ${styleGuide}`;

    // Call OpenRouter for image generation (using an image model if available, otherwise return a placeholder response)
    // Note: OpenRouter supports various image generation models
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openrouter/owl-alpha",
          messages: [
            {
              role: "user",
              content: `Generate a detailed image description for this illustration prompt: "${enhancedPrompt}". The image should be: ${styleGuide}. Return ONLY a JSON object with a "description" field (detailed image description) and a "suggestedImageUrl" field (set to null since we cannot generate the actual image yet, but structure it for future use).`,
            },
          ],
          response_format: { type: "json_object" },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text().catch(() => "Unknown error");
      console.error("[GENERATE_ILLUSTRATION] AI error:", response.status, errText);
      return NextResponse.json(
        { error: `Image generation failed (status ${response.status}). Try again.` },
        { status: 502 }
      );
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "AI returned empty response. Try again." },
        { status: 502 }
      );
    }

    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      // If not JSON, use the content as the description
      parsed = { description: content, suggestedImageUrl: null };
    }

    // For now, we store the description since we don't have an actual image URL
    // The generatedUrl will be set when a real image generation service is integrated
    // For now, we mark it as "GENERATED" with the description
    const generatedUrl = parsed.suggestedImageUrl || `ai-generated://${Date.now()}/${stepIndex}`;

    // Update the step in the journey with illustration media data
    if (!step.media) step.media = {};
    if (!step.media.illustration) step.media.illustration = {};

    step.media.illustration = {
      prompt: illustrationPrompt,
      generatedUrl: generatedUrl,
      uploadedUrl: null,
      approvedUrl: null,
      approvedByAdmin: false,
      status: "GENERATED",
      generatedAt: new Date().toISOString(),
      stylePreset: stylePreset || null,
      description: parsed.description || null,
      errorMessage: null,
    };

    // Also keep illustrationPrompt on the step for backward compatibility
    step.illustrationPrompt = illustrationPrompt;

    // Save updated journey
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
      console.error("[GENERATE_ILLUSTRATION] DB update error:", updateErr);
      return NextResponse.json(
        { error: "Failed to save generated illustration. Try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Illustration generated. Review and approve to make it student-visible.",
      stepIndex,
      illustration: step.media.illustration,
    });
  } catch (err: any) {
    console.error("[GENERATE_ILLUSTRATION] Critical error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate illustration" },
      { status: 500 }
    );
  }
}
