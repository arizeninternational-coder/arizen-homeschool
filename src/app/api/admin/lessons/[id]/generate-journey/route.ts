// POST /api/admin/lessons/[id]/generate-journey
// Admin-only: Generate a student journey draft using AI
// Saves to contentBlocks.studentJourneyDraft, NOT to studentJourney
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

  // Check for OpenRouter API key
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "OpenRouter API key not configured. Set OPENROUTER_API_KEY in environment.",
      },
      { status: 503 }
    );
  }

  try {
    // Fetch lesson with all contentBlocks metadata
    const { data: lesson, error: fetchErr } = await supabase
      .from("Lesson")
      .select(
        `
        id, title, slug, contentBlocks, xpReward,
        quest:Quest(
          id, title,
          theme:Theme(id, title, grade)
        )
      `
      )
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

    const grade = lesson.quest?.theme?.grade || meta.grade || 0;
    const subject = meta.subject || "";
    const strand = meta.strand || "";
    const subStrand = meta.subStrand || "";
    const title = lesson.title || "Lesson";
    const learningOutcome =
      meta.specificLearningOutcome ||
      meta.learningOutcome ||
      "";
    const keyInquiryQuestion = meta.keyInquiryQuestion || "";
    const suggestedLearningExperience =
      meta.suggestedLearningExperience || "";
    const activityInstructions = meta.activityInstructions || "";
    const assessmentMethod = meta.assessmentMethod || "";
    const assessmentCriteria = meta.assessmentCriteria || "";
    const values = meta.values || "";
    const coreCompetencies = meta.coreCompetencies || "";
    const learningResources = meta.learningResources || "";
    const reflectionPrompt = meta.reflectionPrompt || "";
    const term = meta.term || "";
    const week = meta.week || "";

    // Check for minimum recommended fields before generation
    const missingFields: string[] = [];
    if (!learningOutcome) missingFields.push("learning outcome");
    if (!keyInquiryQuestion) missingFields.push("key inquiry question");
    if (!suggestedLearningExperience && !activityInstructions) missingFields.push("learning experience / activity instructions");
    if (!assessmentCriteria && !assessmentMethod) missingFields.push("assessment criteria / method");
    if (!reflectionPrompt) missingFields.push("reflection prompt");

    const hasMinimumFields = missingFields.length <= 2; // Allow up to 2 missing fields

    // Build the AI prompt
    const prompt = `You are creating a student learning journey for a Kenyan CBC lesson.

Grade: ${grade}
Subject: ${subject}
Strand: ${strand}
Sub-strand: ${subStrand}
Lesson title: ${title}
${term ? `Term: ${term}` : ""}
${week ? `Week: ${week}` : ""}

Learning outcome: ${learningOutcome || "(not provided)"}
Key inquiry question: ${keyInquiryQuestion || "(not provided)"}
Suggested learning experience: ${suggestedLearningExperience || "(not provided)"}
Activity instructions: ${activityInstructions || "(not provided)"}
Assessment method: ${assessmentMethod || "(not provided)"}
Assessment criteria: ${assessmentCriteria || "(not provided)"}
Values: ${values || ""}
Core competencies: ${coreCompetencies || ""}
Learning resources: ${learningResources || ""}
Reflection prompt: ${reflectionPrompt || "(not provided)"}

${missingFields.length > 0 ? `WARNING: The following fields are missing: ${missingFields.join(", ")}. Create the best journey possible with available content, but note that the lesson shell is incomplete.` : ""}

Create a child-friendly student journey with these rules:
- One idea per step
- Short child-friendly text (Grade 2 to Grade 5 level)
- Use simple, concrete examples
- For math: use counters, fruits, bottle tops, books, plates, cups, drawings, or home objects
- Include warm Owl Teacher guidance in every step
- Include one worked example with step-by-step reasoning
- Include multiple learner practice moments:
  * Think First: an open-response or self-check question to activate curiosity
  * Guided Practice: a practice task with hints and Owl Teacher support
  * Independent Practice: a task the student does on their own with objects, drawings, or fingers
- Include one quick check to verify understanding
- Include reflection options (premade chips the student can select)
- Do NOT include unsafe content
- Do NOT include unapproved video links
- Create illustration prompts (not images)
- Video search keywords are allowed, but approvedUrl must remain empty
- No long paragraphs — keep each step focused and brief

Return ONLY valid JSON in this exact shape:
{
  "studentJourney": [
    {
      "id": "welcome",
      "stepType": "welcome",
      "title": "...",
      "studentText": "...",
      "owlText": "...",
      "visualType": "owl_teacher",
      "illustrationPrompt": "...",
      "interaction": { "type": "none" }
    }
  ]
}

Required step types (all 10): welcome, mission, think_first, learn, connect, example, practice, quick_check, reflect, complete`;

    // Call OpenRouter
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
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text().catch(() => "Unknown error");
      console.error("[GENERATE_JOURNEY] OpenRouter error:", response.status, errText);
      return NextResponse.json(
        { error: `AI generation failed (status ${response.status}). Try again.` },
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

    // Parse and validate JSON
    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      console.error("[GENERATE_JOURNEY] Invalid JSON from AI:", content.slice(0, 200));
      return NextResponse.json(
        { error: "AI returned invalid JSON. Try again." },
        { status: 502 }
      );
    }

    if (!parsed.studentJourney || !Array.isArray(parsed.studentJourney)) {
      return NextResponse.json(
        { error: "AI response missing studentJourney array. Try again." },
        { status: 502 }
      );
    }

    // Validate required step types
    const requiredTypes = [
      "welcome", "mission", "think_first", "learn", "connect",
      "example", "practice", "quick_check", "reflect", "complete",
    ];
    const presentTypes = parsed.studentJourney.map((s: any) => s.stepType);
    const missingTypes = requiredTypes.filter((t) => !presentTypes.includes(t));

    if (missingTypes.length > 0) {
      return NextResponse.json(
        {
          error: `AI response missing required step types: ${missingTypes.join(", ")}. Try again.`,
        },
        { status: 502 }
      );
    }

    // Build new contentBlocks with draft journey
    let existingMeta: any = {};
    try {
      existingMeta = JSON.parse(lesson.contentBlocks || "{}");
    } catch {}

    const newMeta = {
      ...existingMeta,
      studentJourneyDraft: parsed.studentJourney,
      aiMetadata: {
        model: "openrouter/owl-alpha",
        promptVersion: "lesson-journey-v1",
        generatedAt: new Date().toISOString(),
        reviewStatus: "NEEDS_REVIEW",
      },
    };

    // Save to database
    const { error: updateErr } = await supabase
      .from("Lesson")
      .update({
        contentBlocks: JSON.stringify(newMeta),
        updatedAt: new Date().toISOString(),
      })
      .eq("id", lessonId);

    if (updateErr) {
      console.error("[GENERATE_JOURNEY] DB update error:", updateErr);
      return NextResponse.json(
        { error: "Failed to save generated journey. Try again." },
        { status: 500 }
      );
    }

    // Calculate new readiness
    let readiness: any = null;
    try {
      const { checkLessonReadiness } = await import("@/lib/curriculum/lesson-journey");
      readiness = checkLessonReadiness(newMeta);
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Journey draft generated. Review before approving.",
      studentJourneyDraft: parsed.studentJourney,
      aiMetadata: newMeta.aiMetadata,
      readiness,
      warnings: missingFields.length > 0 ? [`Missing fields: ${missingFields.join(", ")}. Draft may be weaker than expected.`] : [],
    });
  } catch (err: any) {
    console.error("[GENERATE_JOURNEY] Critical error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate journey" },
      { status: 500 }
    );
  }
}
