/**
 * Server-side Adaptive Decision API for the Place Value pilot.
 *
 * Integration point between the student page and the AdaptiveOrchestrator.
 * The browser NEVER talks to the AI provider directly — all AI calls
 * happen here, server-side.
 *
 * Flow:
 *   Browser POST /api/learner/adaptive-decision
 *     -> load LearningState (reconstructed from InteractionResponse rows)
 *     -> create Evidence from student response
 *     -> AdaptiveOrchestrator.decide()  [uses createAIProvider() factory]
 *     -> ActionValidator.validate()    [deterministic, always enforced]
 *     -> action-adapter converts PedagogicalAction -> JourneyStep
 *     -> return { finalAction, step, reasoning, updatedState }
 *
 * Provider abstraction: createAIProvider() reads AI_PROVIDER env var.
 * The student page never knows whether it is using MockAIProvider or
 * OllamaProvider — provider selection stays entirely behind the factory.
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-guard";
import { createAIProvider } from "@/lib/ai/providers";
import { AdaptiveOrchestrator } from "@/lib/learning/orchestrator";
import { loadLearningState, saveLearningStateSnapshot } from "@/lib/learning/state-persistence";
import { pedagogicalActionToJourneyStep } from "@/lib/learning/action-adapter";
import { PLACE_VALUE_CONCEPTS, type Evidence, type LearningState } from "@/lib/curriculum/adaptive-engine";
import type { AIContext, PedagogicalAction } from "@/lib/ai/AIProvider";
import { getStepConceptMapping } from "@/lib/curriculum/step-concept-mappings";
import { supabase } from "@/lib/supabase";

interface AdaptiveDecisionRequest {
  lessonId: string;
  lessonTitle: string;
  activityId: string;
  conceptId?: string;
  selectedAnswer: string;
  expectedAnswer: string;
  options: string[];
  correct: boolean;
  prompt: string;
  attemptNumber?: number;
  remediationContext?: Record<string, unknown>;
}

interface AdaptiveDecisionResponse {
  finalAction: PedagogicalAction;
  step: any;
  reasoning: string;
  usedFallback: boolean;
  updatedState: LearningState;
  conceptMastery: Record<string, unknown>;
  isPlaceValue: boolean;
}

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!user.learnerProfileId) {
      return NextResponse.json({ error: "Learner profile required" }, { status: 403 });
    }

    const body = await req.json() as AdaptiveDecisionRequest;
    const {
      lessonId, lessonTitle, activityId, conceptId,
      selectedAnswer, expectedAnswer, options, correct, prompt,
      attemptNumber, remediationContext,
    } = body;

    // Only Place Value lessons route through the orchestrator.
    const isPlaceValue = lessonTitle
      ? lessonTitle.toLowerCase().includes("place value") ||
        lessonTitle.toLowerCase().includes("place-value")
      : true;

    if (!isPlaceValue) {
      return NextResponse.json(
        { error: "Adaptive decision API is only for Place Value lessons." },
        { status: 400 }
      );
    }

    const conceptIds = PLACE_VALUE_CONCEPTS.map((c) => c.id);

    // ── 1. Load learner state from persisted InteractionResponse rows ──
    // The state is reconstructed by replaying every prior response through
    // recordEvidence(). The current response is NOT yet persisted, so the
    // state reflects the learner's situation before this answer.
    let learningState = await loadLearningState(
      user.learnerProfileId,
      lessonId,
      conceptIds
    );

    // ── 1b. Compute attempt number from persisted state ──
    // The server is the source of truth for attemptNumber — the client's value
    // is treated as a hint. This prevents duplicate (learnerId, lessonId,
    // activityId, attemptNumber) tuples from violating the UNIQUE constraint.
    const existingAttemptsForActivity = learningState.attempts.filter(
      (a) => a.activityId === activityId
    ).length;
    const attemptNumberToUse = existingAttemptsForActivity + 1;

    // ── 2. Resolve concept + step mapping ──
    const stepMapping = getStepConceptMapping(activityId);
    const effectiveConceptId = conceptId || stepMapping?.conceptId || "digit-position";
    const effectiveExpected = expectedAnswer || stepMapping?.expectedAnswer || "";
    const effectivePrompt = (remediationContext?.prompt as string) || prompt || "";

    // Determine misconception via existing rule-based detection (for evidence).
    let misconceptionId: string | null = null;
    if (!correct && stepMapping) {
      const mc = stepMapping.misconceptionCheck(selectedAnswer, effectiveExpected);
      misconceptionId = mc || null;
    }

    // ── 3. Build Evidence from the student response ──
    const evidence: Evidence = {
      conceptId: effectiveConceptId,
      correct,
      timestamp: Date.now(),
      activityId,
      answer: selectedAnswer,
      expectedAnswer: effectiveExpected,
      misconceptionId: misconceptionId || undefined,
      attemptNumber: attemptNumberToUse,
      remediationShown: remediationContext?.attemptNumber
        ? `__remediation_attempt_${remediationContext.attemptNumber}`
        : null,
    };

    // ── 4. Build AIContext (carries question/options/answers for the AI) ──
    const aiContext: AIContext = {
      learnerId: user.learnerProfileId,
      lessonId,
      conceptId: effectiveConceptId,
      selectedAnswer,
      expectedAnswer: effectiveExpected,
      options: options || [],
      prompt: effectivePrompt,
      attemptNumber: attemptNumberToUse,
      conceptChain: conceptIds,
    };

    // ── 5. Create orchestrator with AI provider from factory ──
    // Provider selection is behind createAIProvider() — no branching in page.
    // Default: MockAIProvider (AI_PROVIDER=mock). Swappable to OllamaProvider.
    const aiProvider = createAIProvider();
    const orchestrator = new AdaptiveOrchestrator(aiProvider);

    // ── 6. Decide: evidence → diagnosis → action proposal → validation ──
    const decision = await orchestrator.decide({
      learnerState: learningState,
      evidence,
      context: aiContext,
      curriculumKey: "g4-math-place-value",
    });

    // ── 7. Persist the response (so the next call reconstructs correct state) ──
    const { error: persistError } = await supabase
      .from("InteractionResponse")
      .insert({
        learnerId: user.learnerProfileId,
        lessonId,
        activityId,
        conceptId: effectiveConceptId || null,
        selectedAnswer: String(selectedAnswer),
        expectedAnswer: String(effectiveExpected),
        correct,
        misconceptionId: misconceptionId || null,
        attemptNumber: attemptNumberToUse,
        remediationShown: remediationContext?.attemptNumber
          ? `__remediation_attempt_${remediationContext.attemptNumber}`
          : null,
      })
      .single();

    if (persistError) {
      console.error("[adaptive-decision] Failed to persist response:", persistError);
      return NextResponse.json(
        { error: "Failed to persist learner evidence" },
        { status: 500 }
      );
    }

    // ── 8. Save state snapshot (non-blocking bookkeeping) ──
    saveLearningStateSnapshot(
      user.learnerProfileId,
      lessonId,
      decision.updatedState
    ).catch(() => {});

    // ── 9. Convert PedagogicalAction -> JourneyStep ──
    const step = pedagogicalActionToJourneyStep(decision.finalAction, {
      evidence,
      aiContext: {
        conceptId: effectiveConceptId,
        selectedAnswer,
        expectedAnswer: effectiveExpected,
        options: options || [],
        prompt: effectivePrompt,
        attemptNumber: attemptNumberToUse,
      },
      conceptChain: conceptIds,
    });

    // ── 10. Extract mastery snapshot for the client ──
    const conceptMastery: Record<string, unknown> = {};
    for (const [id, concept] of Object.entries(decision.updatedState.concepts)) {
      conceptMastery[id] = {
        level: concept.level,
        attempts: concept.attempts,
        correctAttempts: concept.correctAttempts,
      };
    }

    const response: AdaptiveDecisionResponse = {
      finalAction: decision.finalAction,
      step,
      reasoning: decision.reasoning,
      usedFallback: decision.usedFallback,
      updatedState: decision.updatedState,
      conceptMastery,
      isPlaceValue,
    };

    return NextResponse.json(response);
  } catch (err: any) {
    console.error("[adaptive-decision] Error:", err?.message || err);
    return NextResponse.json(
      { error: err?.message || "Failed to make adaptive decision" },
      { status: 500 }
    );
  }
}
