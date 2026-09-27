/**
 * ActionValidator — The Curriculum Safety Boundary
 *
 * This is the critical boundary between what the AI can *propose* and what
 * the application is allowed to *deliver*. The orchestrator ALWAYS runs the
 * AI's proposed action through this validator before returning it.
 *
 * If the AI proposes an action that violates curriculum constraints,
 * prerequisites, or safety rules, the validator rejects it and recommends
 * a deterministic fallback action.
 *
 * Authority chain:
 *   AIProvider.propose()  →  ActionValidator.validate()  →  final action
 *
 * The AI can NEVER bypass this validation. Ever.
 */

import type {
  PedagogicalAction,
  PedagogicalActionKind,
} from '../ai/AIProvider';
import type {
  LearningState,
  ConceptState,
  MasteryLevel,
} from '../curriculum/adaptive-engine';
import type { CurriculumConstraints } from './curriculum-constraints';
import {
  isInScope,
  getPrerequisites,
  isKnownMisconception,
  arePrerequisitesSatisfied,
} from './curriculum-constraints';

// ── Validation Result ───────────────────────────────────────────────────────

export type ValidationResult =
  | { valid: true; action: PedagogicalAction }
  | {
      valid: false;
      action: PedagogicalAction;
      reason: string;
      fallback: PedagogicalAction;
    };

// ── Learner concept state summary ───────────────────────────────────────────

export interface ConceptMasterySnapshot {
  level: MasteryLevel;
  confidence: number;
  attempts: number;
  correctAttempts: number;
  misconceptionId: string | null;
}

/**
 * Extract a per-concept mastery snapshot from the learner state.
 * This is what the validator inspects to enforce progression rules.
 */
export function extractConceptMastery(
  state: LearningState
): Record<string, ConceptMasterySnapshot> {
  const snapshot: Record<string, ConceptMasterySnapshot> = {};
  for (const [conceptId, concept] of Object.entries(state.concepts)) {
    snapshot[conceptId] = {
      level: concept.level,
      confidence: computeConfidence(concept),
      attempts: concept.attempts,
      correctAttempts: concept.correctAttempts,
      misconceptionId: concept.lastEvidence?.misconceptionId || null,
    };
  }
  return snapshot;
}

/**
 * Compute a 0–1 confidence score from a ConceptState.
 *
 * Uses the existing mastery progression (emerging → developing → proficient)
 * combined with the correct-attempt ratio. This is a deterministic formula,
 * not an AI judgment.
 */
function computeConfidence(concept: ConceptState): number {
  if (concept.level === 'not_assessed') return 0;
  const ratio = concept.attempts > 0 ? concept.correctAttempts / concept.attempts : 0;
  const levelBase =
    concept.level === 'emerging' ? 0.3
    : concept.level === 'developing' ? 0.5
    : concept.level === 'proficient' ? 0.8
    : 0;
  // Blend level-based base with observed accuracy ratio.
  return Math.min(1, Math.max(levelBase, ratio));
}

// ── The Validator ────────────────────────────────────────────────────────────

export class ActionValidator {
  private constraints: CurriculumConstraints;

  constructor(constraints: CurriculumConstraints) {
    this.constraints = constraints;
  }

  /**
   * Validate a proposed PedagogicalAction against curriculum constraints
   * and the learner's current mastery state.
   *
   * Returns:
   *   valid     → the action passes all checks, return it as-is.
   *   invalid   → the action was rejected; a deterministic fallback is provided.
   */
  validate(
    action: PedagogicalAction,
    state: LearningState
  ): ValidationResult {
    const conceptMastery = extractConceptMastery(state);
    const reason = this.checkAll(action, state, conceptMastery);

    if (reason === null) {
      return { valid: true, action };
    }

    // The action was rejected — compute a deterministic fallback.
    return {
      valid: false,
      action,
      reason,
      fallback: this.computeFallback(action, state, conceptMastery),
    };
  }

  // ── Individual checks ─────────────────────────────────────────────────────

  /**
   * Run all validation checks. Returns null if the action is valid,
   * or a human-readable reason string if it is rejected.
   */
  private checkAll(
    action: PedagogicalAction,
    state: LearningState,
    conceptMastery: Record<string, ConceptMasterySnapshot>
  ): string | null {
    // 1. Concept must be in scope
    if (!isInScope(this.constraints, action.conceptId)) {
      return `Concept "${action.conceptId}" is outside the current curriculum scope.`;
    }

    // 2. Action type must be permitted
    if (!this.constraints.allowedActionTypes.has(action.actionType)) {
      return `Action type "${action.actionType}" is not in the permitted action set.`;
    }

    // 3. Confidence must be a valid number in [0, 1]
    if (typeof action.confidence !== 'number' || action.confidence < 0 || action.confidence > 1) {
      return `Action confidence ${action.confidence} is out of range [0, 1].`;
    }

    // Type-specific checks (discriminated union on actionType)
    switch (action.actionType) {
      case 'remediate':
        return this.checkRemediate(action, conceptMastery);

      case 'move_forward':
        return this.checkMoveForward(action, state, conceptMastery);

      case 'revisit_prerequisite':
        return this.checkRevisitPrerequisite(action);

      case 'increase_difficulty':
      case 'targeted_practice':
        return this.checkDifficulty(action);

      case 'change_representation':
        return this.checkRepresentation(action);

      case 'check_mastery':
        return this.checkMasteryThreshold(action);

      case 'explain':
      case 'demonstrate':
      case 'ask':
      case 'provide_hint':
      case 'provide_example':
        // These have no additional constraints beyond the base checks.
        // 'demonstrate' and 'change_representation' carry a representation field.
        if ('representation' in action && action.representation) {
          return this.checkRepresentationField(action.representation);
        }
        return null;
    }
  }

  /** Validate 'remediate' actions: misconception must be known. */
  private checkRemediate(
    action: Extract<PedagogicalAction, { actionType: 'remediate' }>,
    conceptMastery: Record<string, ConceptMasterySnapshot>
  ): string | null {
    if (!isKnownMisconception(action.misconceptionId)) {
      return `Misconception "${action.misconceptionId}" is not a recognized misconception.`;
    }
    if (conceptMastery[action.conceptId]?.level === 'proficient' && conceptMastery[action.conceptId]?.confidence >= 0.8) {
      return `Cannot remediate "${action.conceptId}" — the learner already shows proficient mastery with high confidence.`;
    }
    return null;
  }

  /** Validate 'move_forward': the next concept must be in scope and
      prerequisites of the target must be satisfied (only 'proficient' level
      satisfies a prerequisite — this is the canonical check via
      arePrerequisitesSatisfied). */
  private checkMoveForward(
    action: Extract<PedagogicalAction, { actionType: 'move_forward' }>,
    state: LearningState,
    conceptMastery: Record<string, ConceptMasterySnapshot>
  ): string | null {
    if (!isInScope(this.constraints, action.nextConceptId)) {
      return `Target concept "${action.nextConceptId}" is outside curriculum scope.`;
    }

    // Delegate prerequisite satisfaction to the canonical function.
    // Only 'proficient' level satisfies a prerequisite — 'emerging' and
    // 'developing' are NOT sufficient (one failed attempt must not unlock).
    if (!arePrerequisitesSatisfied(this.constraints, action.nextConceptId, conceptMastery)) {
      const unsatisfied = getPrerequisites(this.constraints, action.nextConceptId).find(
        (prereq) => {
          const m = conceptMastery[prereq];
          return !m || m.level !== 'proficient';
        }
      );
      return `Cannot move to "${action.nextConceptId}" — prerequisite "${unsatisfied}" is not at proficient mastery.`;
    }

    // The current concept must not be at 'not_assessed' (can't move forward
    // from something the learner hasn't started).
    if (conceptMastery[action.conceptId]?.level === 'not_assessed') {
      return `Cannot move forward from "${action.conceptId}" — the learner has not engaged with it yet.`;
    }

    return null;
  }

  /** Validate 'revisit_prerequisite': the prerequisite must actually be a
      declared prerequisite of the target concept. */
  private checkRevisitPrerequisite(
    action: Extract<PedagogicalAction, { actionType: 'revisit_prerequisite' }>
  ): string | null {
    const actualPrereqs = getPrerequisites(this.constraints, action.targetConceptId);
    if (!actualPrereqs.includes(action.prerequisiteConceptId)) {
      return `"${action.prerequisiteConceptId}" is not a declared prerequisite of "${action.targetConceptId}".`;
    }
    if (!isInScope(this.constraints, action.prerequisiteConceptId)) {
      return `Prerequisite concept "${action.prerequisiteConceptId}" is outside curriculum scope.`;
    }
    return null;
  }

  /** Validate difficulty is within the permitted range. */
  private checkDifficulty(
    action: Extract<PedagogicalAction, { actionType: 'increase_difficulty' | 'targeted_practice' }>
  ): string | null {
    const diff = (action as { difficulty?: number }).difficulty;
    if (diff !== undefined) {
      if (typeof diff !== 'number' || diff < this.constraints.minDifficulty || diff > this.constraints.maxDifficulty) {
        return `Difficulty ${diff} is outside the permitted range [${this.constraints.minDifficulty}, ${this.constraints.maxDifficulty}].`;
      }
    }
    return null;
  }

  /** Validate that a representation is in the allowed set. */
  private checkRepresentation(
    action: Extract<PedagogicalAction, { actionType: 'change_representation' }>
  ): string | null {
    return this.checkRepresentationField(action.representation);
  }

  private checkRepresentationField(rep: string): string | null {
    if (!this.constraints.allowedRepresentations.has(rep)) {
      return `Representation "${rep}" is not an approved representation for this curriculum.`;
    }
    return null;
  }

  /** Validate check_mastery threshold is reasonable. */
  private checkMasteryThreshold(
    action: Extract<PedagogicalAction, { actionType: 'check_mastery' }>
  ): string | null {
    const threshold = action.threshold;
    if (typeof threshold !== 'number' || threshold < 0 || threshold > 1) {
      return `Mastery threshold ${threshold} must be in range [0, 1].`;
    }
    // The threshold must not be lower than the concept's mastery threshold.
    const spec = this.constraints.concepts.find((c) => c.id === action.conceptId);
    if (spec && threshold < spec.masteryThreshold) {
      return `Mastery threshold ${threshold} is below the curriculum minimum ${spec.masteryThreshold} for "${action.conceptId}".`;
    }
    return null;
  }

  // ── Deterministic Fallbacks ───────────────────────────────────────────────

  /**
   * Compute a deterministic fallback action when an AI proposal is rejected.
   *
   * The fallback strategy depends on the learner's current state:
   *   - If struggling (wrong answer, existing remediation): provide targeted practice
   *   - If not yet assessed: provide an explanation
   *   - If showing proficiency: provide a check_mastery action
   */
  private computeFallback(
    rejectedAction: PedagogicalAction,
    state: LearningState,
    conceptMastery: Record<string, ConceptMasterySnapshot>
  ): PedagogicalAction {
    const conceptId = rejectedAction.conceptId;
    const mastery = conceptMastery[conceptId];
    const difficulty = Math.min(state.difficultyLevel, this.constraints.maxDifficulty);

    // If the learner hasn't started this concept, explain it first.
    if (!mastery || mastery.level === 'not_assessed') {
      return {
        actionType: 'explain',
        conceptId,
        reason: 'Fallback: learner has not yet engaged with this concept. Providing an explanation.',
        confidence: 1.0,
        content: 'Let\'s review this topic together.',
      };
    }

    // If the learner has shown some struggle (attempts but low accuracy),
    // provide targeted practice at a lower difficulty.
    if (mastery.attempts > 0 && mastery.correctAttempts / mastery.attempts < 0.5) {
      return {
        actionType: 'targeted_practice',
        conceptId,
        difficulty: Math.max(this.constraints.minDifficulty, difficulty - 1),
        reason: 'Fallback: learner is struggling. Providing easier targeted practice.',
        confidence: 1.0,
        prompt: `Let's practice this concept with simpler numbers.`,
        options: ['Option A', 'Option B', 'Option C'],
        correctIndex: 0,
      };
    }

    // If the learner is proficient but the AI proposed something out of scope,
    // just check mastery.
    if (mastery.level === 'proficient') {
      return {
        actionType: 'check_mastery',
        conceptId,
        threshold: 0.8,
        reason: 'Fallback: learner appears proficient. Checking mastery before moving forward.',
        confidence: 1.0,
      };
    }

    // Default: provide a hint.
    return {
      actionType: 'provide_hint',
      conceptId,
      strength: 'mild',
      reason: 'Fallback: default to providing a hint.',
      confidence: 1.0,
      hint: 'Think about the question carefully.',
    };
  }
}
