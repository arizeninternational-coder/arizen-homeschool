/**
 * AdaptiveOrchestrator — The Learning Engine ("Brain")
 *
 * This is the central authority for adaptive pedagogical decisions in the
 * AI-native architecture. It is a plain server-side TypeScript class,
 * dependency-injected with an AIProvider.
 *
 * Authority chain (the AI NEVER bypasses any step):
 *
 *   Learner evidence
 *     → AdaptiveOrchestrator (deterministic state update)
 *     → AIProvider.diagnoseMisconception()     [AI interprets the response]
 *     → AIProvider.selectNextAction()          [AI proposes an action]
 *     → ActionValidator.validate()             [application validates against curriculum]
 *     → Validated PedagogicalAction / Deterministic fallback
 *
 * The orchestrator depends on the AIProvider interface, NOT on any concrete
 * provider (Ollama, Gemini, mock, etc.). Provider selection is environment-driven.
 *
 * Per the architectural rules:
 *   AI does NOT own curriculum progression.
 *   Curriculum constraints + learner state + evidence → orchestrator →
 *   AI proposes → validator decides → final action.
 */

import type {
  AIProvider,
  AIContext,
  PedagogicalAction,
} from '../ai/AIProvider';
import type {
  LearningState,
  Evidence,
  MasteryLevel,
} from '../curriculum/adaptive-engine';
import type { CurriculumConstraints } from './curriculum-constraints';
import {
  recordEvidence,
} from '../curriculum/adaptive-engine';
import {
  getCurriculumConstraints,
} from './curriculum-constraints';
import {
  buildTutoringRequest,
  buildFallbackTurn,
  resolveTransferActivity,
} from './tutor';
import {
  ActionValidator,
  type ValidationResult,
  extractConceptMastery,
} from './action-validator';

// ── Input / Output Types ───────────────────────────────────────────────────

export interface OrchestratorInput {
  /** The current learner state (hydrated from storage). */
  learnerState: LearningState;
  /** The latest evidence from a student response. */
  evidence: Evidence;
  /** Context for the AI provider (question, options, answers, etc.). */
  context: AIContext;
  /** Which curriculum unit this decision is for. Defaults to Grade 4 Place Value. */
  curriculumKey?: string;
  /**
   * The active lesson's adaptive configuration. Required for AI tutoring: it
   * supplies the SLO, concept/misconception scope, transfer questions and
   * remediation policy. The orchestrator is lesson-agnostic — it never names a
   * lesson itself.
   */
  lessonConfig?: import('../curriculum/adaptive/types').AdaptiveLessonConfig | null;
  /** Prior tutoring turns in this remediation conversation. */
  previousTutorTurns?: import('../ai/AIProvider').TutoringTurnRecord[];
  /**
   * True when this response answered a transfer question correctly, i.e. the
   * learner has recovered understanding through remediation.
   */
  recovered?: boolean;
  /** Activity id the learner was answering (original or transfer). */
  tutorActivityId?: string;
  /**
   * The misconception id the APPLICATION's deterministic detector produced.
   * Authoritative for tutoring; the AI's own diagnosis is advisory.
   */
  diagnosedMisconceptionId?: string | null;
  /** Human-readable misconception label, for the tutor's explanation. */
  diagnosedMisconceptionLabel?: string;
}

export interface OrchestratorDecision {
  /** The AI-authored tutoring turn, when remediation occurred. */
  tutoringTurn?: import('../ai/AIProvider').TutoringTurn | null;
  /** The request that produced the turn — carries the question the app asks. */
  tutoringRequest?: import('../ai/AIProvider').TutoringRequest | null;
  /** The final, validated action to render. */
  finalAction: PedagogicalAction;
  /** The AI's original proposal (before validation), or null if AI was bypassed. */
  aiProposal: PedagogicalAction | null;
  /** The result of ActionValidator.validate() on the AI's proposal. */
  validationResult: ValidationResult;
  /** Whether a deterministic fallback was used instead of the AI proposal. */
  usedFallback: boolean;
  /** Why the final action was chosen (audit trail). */
  reasoning: string;
  /** The learner state after evidence has been recorded. */
  updatedState: LearningState;
}

// ── The Orchestrator ─────────────────────────────────────────────────────────
//
// Mastery declaration is always deterministic. The AI can propose a
// 'check_mastery' or 'move_forward' action, but the actual mastery
// determination (level === 'proficient' AND confidence >= threshold)
// is computed here, not by the AI.

function isConceptMastered(
  concept: { level: MasteryLevel; confidence: number },
  masteryThreshold: number
): boolean {
  if (concept.level !== 'proficient') return false;
  return concept.confidence >= masteryThreshold;
}

export class AdaptiveOrchestrator {
  private aiProvider: AIProvider;

  constructor(aiProvider: AIProvider) {
    this.aiProvider = aiProvider;
  }

  /**
   * Process a student response and produce the next pedagogical action.
   *
   * This is the single entry point for the adaptive loop. It is the ONLY
   * place where the AIProvider is called — all other logic is deterministic.
   */
  async decide(input: OrchestratorInput): Promise<OrchestratorDecision> {
    const { learnerState, evidence, context, curriculumKey = 'g4-math-place-value' } = input;
    const constraints = getCurriculumConstraints(curriculumKey);
    const validator = new ActionValidator(constraints);

    // ── Step 1: Deterministically update learner state ────────────────────
    // This uses the existing recordEvidence() from the adaptive engine.
    // Mastery level progression, attempt counting, etc. are deterministic.
    const updatedState = recordEvidence(learnerState, evidence);
    const conceptMastery = extractConceptMastery(updatedState);
    const mastery = conceptMastery[evidence.conceptId];
    const conceptSpec = constraints.concepts.find(
      (c) => c.id === evidence.conceptId
    );
    const masteryThreshold = conceptSpec?.masteryThreshold ?? 0.75;

    // ── Step 2: Short-circuit — if mastered with strong evidence, move forward ─
    // The AI is never asked to "declare mastery." That is always a
    // deterministic application-side decision.
    if (
      evidence.correct &&
      mastery &&
      isConceptMastered(mastery, masteryThreshold)
    ) {
      const nextConcept = this.findNextConcept(constraints, evidence.conceptId);
      const action: PedagogicalAction = nextConcept
        ? {
            actionType: 'move_forward',
            conceptId: evidence.conceptId,
            nextConceptId: nextConcept,
            reason: `Learner has demonstrated proficient mastery of "${evidence.conceptId}" (confidence: ${mastery.confidence.toFixed(2)} >= ${masteryThreshold}).`,
            confidence: 1.0,
          }
        : {
            actionType: 'check_mastery',
            conceptId: evidence.conceptId,
            threshold: masteryThreshold,
            reason: `Learner has demonstrated proficient mastery of "${evidence.conceptId}". Verifying before completion.`,
            confidence: 1.0,
          };

      return {
        finalAction: action,
        aiProposal: null, // AI was NOT consulted for mastery declaration
        validationResult: { valid: true, action },
        usedFallback: false,
        reasoning:
          `Learner mastered "${evidence.conceptId}" deterministically — ` +
          `AI was not asked to declare mastery.`,
        updatedState,
      };
    }

    // ── Step 3: Ask the AI to analyze evidence and propose an action ────────
    // The AI interprets — it does NOT own the decision.
    const evidenceForAI = this.gatherEvidenceForConcept(updatedState, evidence.conceptId);
    const aiContext: AIContext = {
      ...context,
      allowedRepresentations: Array.from(constraints.allowedRepresentations),
      allowedActionTypes: Array.from(constraints.allowedActionTypes),
      conceptChain: constraints.concepts.map((c) => c.id),
      // Misconception scope comes from the ACTIVE LESSON's config, so no
      // provider ever validates against a hardcoded lesson's list.
      allowedMisconceptionIds: input.lessonConfig
        ? input.lessonConfig.misconceptions.map((m) => m.id)
        : [],
    };

    const misconceptionAnalysis = await this.aiProvider.analyzeLearnerEvidence(
      evidence.conceptId,
      evidenceForAI,
      aiContext
    );

    const aiProposal = await this.aiProvider.selectNextAction(
      evidence.conceptId,
      evidenceForAI,
      aiContext,
      misconceptionAnalysis  // the diagnosis MATERIALLY influences the AI's action proposal
    );

    // ── Step 4: Validate the AI proposal against curriculum constraints ────
    const validationResult = validator.validate(aiProposal, updatedState);

    // ── Step 5: AI tutoring turn for a remediation action ────────────────────
    // Deterministic code has already decided the escalation stage and which
    // transfer question (if any) applies. The AI writes only the teaching
    // language; its turn is validated before it can reach the learner.
    const effectiveAction: PedagogicalAction = validationResult.valid
      ? validationResult.action
      : validationResult.fallback;

    // The tutor engages whenever the learner is WRONG on a mapped activity —
    // regardless of which action the AI proposed. Whether to teach is
    // deterministic (an incorrect answer on a scored activity); the AI's chosen
    // action only influences the scaffold, it must not gate the tutor.
    let tutoringTurn: import('../ai/AIProvider').TutoringTurn | null = null;
    let tutoringRequest: import('../ai/AIProvider').TutoringRequest | null = null;
    if (input.lessonConfig && !evidence.correct) {
      const tutoring = await this.buildTutoringTurn(input, effectiveAction, updatedState, evidence);
      tutoringTurn = tutoring.turn;
      tutoringRequest = tutoring.request;
    }

    // ── Step 5b: Assemble the final decision ────────────────────────────────
    if (validationResult.valid) {
      return {
        finalAction: validationResult.action,
        tutoringTurn,
        tutoringRequest,
        aiProposal,
        validationResult,
        usedFallback: false,
        reasoning: `AI proposed "${aiProposal.actionType}" for concept "${aiProposal.conceptId}" ` +
          `and the ActionValidator accepted it. Misconception: ${misconceptionAnalysis.misconceptionId || 'none'} ` +
          `(${misconceptionAnalysis.confidence.toFixed(2)} confidence).` +
          (tutoringTurn
            ? ` Tutor stage: ${tutoringTurn.stage}${tutoringTurn.degradedReason ? ' (degraded)' : ''}.`
            : ''),
        updatedState,
      };
    }

    // ── Step 6: AI proposal was rejected — use deterministic fallback ────────
    return {
      finalAction: validationResult.fallback,
      tutoringTurn,
      tutoringRequest,
      aiProposal,
      validationResult,
      usedFallback: true,
      reasoning:
        `AI proposed "${aiProposal.actionType}" for concept "${aiProposal.conceptId}" ` +
        `but the ActionValidator REJECTED it: ${validationResult.reason}. ` +
        `Using deterministic fallback: "${validationResult.fallback.actionType}".`,
      updatedState,
    };
  }

  // ── AI tutoring ───────────────────────────────────────────────────────────

  /**
   * Ask the AI tutor for the next turn, then validate it.
   *
   * If the provider is unavailable, fails, or produces a turn that would reveal
   * the answer / break the stage contract, we fall back to a deterministic
   * scaffold that is explicitly marked `degradedReason` — the client surfaces
   * that, so a fallback is never presented as AI tutoring.
   */
  private async buildTutoringTurn(
    input: OrchestratorInput,
    action: PedagogicalAction,
    state: LearningState,
    evidence: Evidence,
  ): Promise<{
    turn: import('../ai/AIProvider').TutoringTurn;
    request: import('../ai/AIProvider').TutoringRequest;
  }> {
    const config = input.lessonConfig!;
    const constraints = getCurriculumConstraints(input.curriculumKey || config.curriculumKey);
    const validator = new ActionValidator(constraints);

    // Declared first so every return path below can attach the request.
    const request = buildTutoringRequest({
      config,
      activityId: input.tutorActivityId || action.conceptId,
      options: input.context.options,
      prompt: input.context.prompt,
      learnerAnswer: input.context.selectedAnswer || '',
      correct: false,
      // The APPLICATION's deterministic detector is authoritative for the
      // misconception; the AI's own diagnosis is advisory and may differ.
      // Priority: the app's deterministic diagnosis → the action the AI
      // proposed → the misconception already attached to this evidence. The
      // application always wins; the AI's own guess is only a fallback.
      misconceptionId:
        input.diagnosedMisconceptionId ||
        (action.actionType === 'remediate' ? action.misconceptionId : null) ||
        evidence.misconceptionId ||
        null,
      misconceptionLabel:
        input.diagnosedMisconceptionLabel ||
        (config.misconceptions.find(
          (m) =>
            m.id ===
            (input.diagnosedMisconceptionId ||
              (action.actionType === 'remediate' ? action.misconceptionId : null) ||
              evidence.misconceptionId),
        )?.label),
      previousTurns: input.previousTutorTurns || [],
      attemptNumber: input.context.attemptNumber ?? 1,
      recovered: input.recovered,
    });

    if (request.activityId === request.conceptId) {
      // No matching activity: fall back to the first activity of the concept so
      // the tutor still has a real question to re-ask.
      const first = config.activities.find((a) => a.conceptId === action.conceptId);
      if (first) {
        request.activityId = first.activityId;
        request.prompt = first.prompt || request.prompt;
        request.options = first.choices || request.options;
      }
    }
    if (!request.correctAnswer) {
      const spec = config.activities.find((a) => a.activityId === request.activityId);
      request.correctAnswer = spec?.correctAnswer || '';
    }
    if (request.transfer && !request.transfer.correctAnswer) {
      const transferSpec = resolveTransferActivity(config, request.activityId);
      if (transferSpec) {
        request.transfer = {
          prompt: transferSpec.prompt,
          options: transferSpec.choices,
          correctAnswer: transferSpec.correctAnswer,
        };
      }
    }

    const buildFallback = (reason: string) => ({
      request,
      turn: buildFallbackTurn({
        config,
        stage: request.stage,
        prompt: request.prompt,
        learnerAnswer: request.learnerAnswer,
        misconceptionLabel: request.misconceptionLabel,
        transfer: request.transfer,
        reason,
      }),
    });

    // Is the provider actually able to serve this?
    if (typeof this.aiProvider.isAvailable === 'function') {
      const availability = await this.aiProvider.isAvailable();
      if (!availability.available) {
        return buildFallback(
          `AI provider unavailable: ${availability.reason || 'not configured'}`,
        );
      }
    }

    let turn: import('../ai/AIProvider').TutoringTurn | null = null;
    try {
      turn = await this.aiProvider.generateTutoringTurn(request);
    } catch (error) {
      return buildFallback(
        `AI tutor call failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    const rejection = validator.validateTutoringTurn(turn, request, {
      misconceptionIds: config.misconceptions.map((m) => m.id),
    });
    if (rejection) {
      return buildFallback(`AI tutor turn rejected: ${rejection}`);
    }

    return { turn: turn!, request };
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  /**
   * Gather all evidence for a given concept from the learner state's
   * attempt history and concept state.
   */
  private gatherEvidenceForConcept(
    state: LearningState,
    conceptId: string
  ): Evidence[] {
    const concept = state.concepts[conceptId];
    if (!concept) return [];

    // Combine the concept's evidence history with the global attempts
    // filtered to this concept.
    const history = concept.history || [];
    const attempts = (state.attempts || [])
      .filter((a) => a.conceptId === conceptId)
      .map((a) => ({
        conceptId: a.conceptId,
        correct: a.correct,
        timestamp: a.timestamp,
        activityId: a.activityId,
        answer: a.selectedAnswer,
        expectedAnswer: a.expectedAnswer,
        misconceptionId: a.misconceptionId || undefined,
        attemptNumber: a.attemptNumber,
        remediationShown: a.remediationShown,
      }));

    // Deduplicate: records from history and attempts can represent the
    // same learner interaction (recordEvidence writes to BOTH arrays).
    // Use a composite identity key so only genuine duplicates are collapsed.
    // Field normalisation matches recordEvidence's defaults (|| '' for strings,
    // || 1 for attemptNumber) so the same interaction has the same key
    // whether it comes from concept.history or from state.attempts.
    const seen = new Set<string>();
    const combined: Evidence[] = [];
    for (const record of [...history, ...attempts]) {
      const key = [
        record.timestamp,
        record.conceptId,
        String(record.correct),
        record.answer || '',
        record.expectedAnswer || '',
        record.activityId || '',
        record.attemptNumber || 1,
      ].join('|');
      if (!seen.has(key)) {
        seen.add(key);
        combined.push(record);
      }
    }
    return combined;
  }

  /**
   * Find the next concept in the prerequisite chain for the given concept.
   * Returns the first concept in the spec that has the given concept as a
   * direct prerequisite. If none exists, returns null.
   */
  private findNextConcept(
    constraints: CurriculumConstraints,
    conceptId: string
  ): string | null {
    for (const spec of constraints.concepts) {
      if (spec.prerequisites.includes(conceptId)) {
        return spec.id;
      }
    }
    return null;
  }
}
