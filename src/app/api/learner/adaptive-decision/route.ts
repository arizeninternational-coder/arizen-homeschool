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
import { type Evidence, type LearningState } from "@/lib/curriculum/adaptive-engine";
import { resolveAdaptiveLessonConfig } from "@/lib/curriculum/adaptive/registry";
import {
  buildRemediationStep,
  detectActivityMisconception,
  validateActivity,
  type ResolvedActivity,
} from "@/lib/curriculum/adaptive/engine";
import { resolveActivityFromJourney } from "@/lib/curriculum/adaptive/resolve-activity";
import type { AIContext, PedagogicalAction } from "@/lib/ai/AIProvider";
import { supabase } from "@/lib/supabase";

interface AdaptiveDecisionRequest {
  lessonId: string;
  lessonTitle: string;
  /** Curriculum slug — the authoritative key for adaptive lesson lookup. */
  lessonSlug?: string;
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
  /** True when the lesson is registered with the adaptive architecture. */
  isAdaptive: boolean;
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
      lessonId, lessonTitle, lessonSlug, activityId, conceptId,
      selectedAnswer, expectedAnswer, options, correct, prompt,
      attemptNumber, remediationContext,
    } = body;

    // Routing is data-driven: the lesson's registered AdaptiveLessonConfig
    // decides whether (and how) the adaptive loop applies. No title matching.
    const config = resolveAdaptiveLessonConfig({ slug: lessonSlug, title: lessonTitle });

    if (!config) {
      return NextResponse.json(
        { error: "This lesson is not registered with the adaptive architecture." },
        { status: 400 }
      );
    }

    const conceptIds = config.concepts.map((c) => c.id);

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

    // ── 2. Resolve the activity from the lesson config ──
    // The config owns concept, validator and misconception detectors. Runtime
    // options/prompt come from the journey step the learner actually saw.
    const resolved = resolveActivityFromJourney(config, {
      activityId,
      options: options || [],
      prompt,
      expectedAnswer,
    });
    const stepMapping = resolved.declared
      ? {
          conceptId: resolved.activity!.conceptId,
          expectedAnswer: resolved.activity!.correctAnswer,
          misconceptionCheck: (sel: string, exp: string) =>
            resolved.activity!.spec.detectMisconception?.(sel, exp, {
              prompt: resolved.activity!.prompt,
              choices: resolved.activity!.choices,
              activityId,
              attemptNumber: 1,
            }) || null,
        }
      : undefined;

    const effectiveConceptId = conceptId || stepMapping?.conceptId;
    if (!effectiveConceptId) {
      return NextResponse.json(
        { error: `Activity "${activityId}" is not declared by this lesson's adaptive configuration.` },
        { status: 400 },
      );
    }
    const effectiveExpected = expectedAnswer || stepMapping?.expectedAnswer || "";
    const effectivePrompt = (remediationContext?.prompt as string) || prompt || "";

    // Deterministic validation is authoritative: the server decides correctness
    // from the lesson's own rules rather than trusting the client's `correct`.
    const serverCorrect = resolved.declared
      ? validateActivity(resolved.activity!, selectedAnswer)
      : correct;
    const wasCorrect = serverCorrect;

    // Determine misconception via the lesson's deterministic detectors.
    let misconceptionId: string | null = null;
    if (!wasCorrect && resolved.declared) {
      const mc = detectActivityMisconception(config, resolved.activity!, selectedAnswer);
      misconceptionId = mc?.id || null;
    } else if (!wasCorrect && stepMapping) {
      const mc = stepMapping.misconceptionCheck(selectedAnswer, effectiveExpected);
      misconceptionId = mc || null;
    }

    // ── 3. Build Evidence from the student response ──
    const evidence: Evidence = {
      conceptId: effectiveConceptId,
      correct: wasCorrect,
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
      curriculumKey: config.curriculumKey,
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
        correct: wasCorrect,
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
      lessonConfig: config,
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
      isAdaptive: true,
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
