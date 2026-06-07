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
    const subjectLower = subject.toLowerCase();
    const isMath = subjectLower.includes("math");
    const isMeasurement = strand.toLowerCase().includes("measurement") || subStrand.toLowerCase().includes("measurement") || title.toLowerCase().includes("measurement") || title.toLowerCase().includes("length") || title.toLowerCase().includes("mass") || title.toLowerCase().includes("capacity") || title.toLowerCase().includes("time") || title.toLowerCase().includes("money");

    const mathContext = isMath && isMeasurement
      ? `MEASUREMENT LESSON — Use these concrete examples:
- Compare lengths: "A desk is about 1 metre long. A doorway is about 2 metres tall."
- Use real objects: desks, books, ropes, doorways, classroom walls, metre sticks, strings, rulers
- Language: longer, shorter, taller, equal, about, estimate, measure
- Activities: "Use a metre stick to measure your desk", "Estimate then measure the length of a book"
- Kenyan context: "The distance from your seat to the door is about 3 metres"`
      : `MATH LESSON — Use these concrete learning objects:
- Counters, bottle tops, fruits, pencils, books, cups, plates, shapes, drawings
- Home/classroom objects for counting, sorting, grouping
- Kenyan coins where relevant (1, 5, 10, 20 shillings)
- Step-by-step worked examples with objects the child can touch`;

    const prompt = `You are creating a student learning journey for ONE Kenyan CBC lesson. You are NOT creating a lesson plan or curriculum — only the student-facing journey for this single lesson.

LESSON CONTEXT (do not change these):
Grade: ${grade}
Subject: ${subject}
Strand: ${strand}
Sub-strand: ${subStrand}
Lesson title: ${title}
${term ? `Term: ${term}` : ""}
${week ? `Week: ${week}` : ""}

LESSON CONTENT:
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

${missingFields.length > 0 ? `⚠️ INCOMPLETE SHELL: Missing: ${missingFields.join(", ")}. Generate the best journey possible but note the draft may be weaker.` : ""}

JOURNEY DESIGN RULES:
- This is for ONE lesson only. Do NOT create other lesson titles or change the curriculum sequence.
- One idea per screen. Short child-friendly text (Grade 2–5 reading level).
- NO generic "Welcome to..." filler. Start with something that makes the student curious or excited.
- NO long paragraphs. No raw JSON-like output. No database-looking metadata.
- Every step MUST have warm Owl Teacher guidance (owlText) — encouraging, practical, specific.
- The student should DO things, not just read. Every step should have an action or question.

INTERACTION DENSITY (required):
1. THINK FIRST: An open-response or self-check question to activate curiosity.
   Example: "Which object do you think is longer — your desk or the classroom door?"
2. LEARN IT MICRO-ACTION: A small question while learning.
   Example: "Look at the two objects. Which one would need a metre stick to measure?"
3. WORKED EXAMPLE: One fully worked example with step-by-step reasoning.
   ${mathContext}
4. GUIDED PRACTICE (title: "Try Together"): Practice with hints and Owl support.
5. INDEPENDENT PRACTICE (title: "Try It Yourself"): Student does it alone with objects, drawings, or fingers.
6. QUICK CHECK: Multiple choice or self-check with immediate feedback.
7. REFLECTION: Premade chip options the student can tap/select, plus optional writing.

PRACTICE MOMENTS: Include at least 2 distinct practice steps (Guided + Independent).
Use duplicate practice stepTypes with different titles if needed.

ILLUSTRATIONS: Include illustrationPrompt on every step (describe what would help the student see the idea).
VIDEOS: Include video.searchKeywords only. approvedUrl MUST remain empty. approvedByAdmin MUST be false.
SAFETY: No unsafe content. No unapproved video links.

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
      "interaction": { "type": "none" },
      "materials": ["..."],
      "video": { "required": false, "searchKeywords": "...", "approvedUrl": null, "approvedByAdmin": false }
    }
  ]
}

Required step types (all 10): welcome, mission, think_first, learn, connect, example, practice, quick_check, reflect, complete
Minimum 8 total steps. At least 2 practice steps (one guided, one independent).`;

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

    // Validate minimum step count
    if (parsed.studentJourney.length < 8) {
      return NextResponse.json(
        {
          error: `AI generated only ${parsed.studentJourney.length} steps. At least 8 steps required. Try again.`,
        },
        { status: 502 }
      );
    }

    // Validate at least 2 practice steps
    const practiceSteps = parsed.studentJourney.filter((s: any) => s.stepType === "practice");
    if (practiceSteps.length < 2) {
      return NextResponse.json(
        {
          error: `AI generated only ${practiceSteps.length} practice step(s). At least 2 practice steps required (guided + independent). Try again.`,
        },
        { status: 502 }
      );
    }

    // Validate no approvedUrl unless approvedByAdmin is true
    for (const step of parsed.studentJourney) {
      if (step.video?.approvedUrl && !step.video?.approvedByAdmin) {
        step.video.approvedUrl = null;
        step.video.approvedByAdmin = false;
      }
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
