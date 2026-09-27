/**
 * MockAIProvider — A Deterministic Test Double for the AIProvider Interface
 *
 * This provider implements AIProvider exactly but returns deterministic,
 * scenario-configurable responses. It is the ONLY provider used in tests so
 * that adaptive decision-making can be verified with zero API cost and zero
 * network dependency.
 *
 * Design: The scenario configures ONLY what analyzeLearnerEvidence()
 * returns (the diagnosis). The selectNextAction() method is driven by the
 * diagnosis parameter it receives — the same evidence + different diagnoses
 * MUST produce different actions. The scenario is NOT a shortcut that
 * bypasses the diagnosis parameter.
 *
 * Exception: the 'out_of_scope' scenario deliberately returns an invalid
 * action to test the validator's safety boundary — this is a controlled test
 * fixture, not normal AI behavior.
 */

import type {
  AIProvider,
  AIContext,
  MisconceptionAnalysis,
  PedagogicalAction,
  PedagogicalActionKind,
} from '../AIProvider';
import type { Evidence } from '../../curriculum/adaptive-engine';

// ── Scenarios ────────────────────────────────────────────────────────────────

export type MockScenario =
  | 'mastery'
  | 'repeated_misconception'
  | 'failure_after_remediation'
  | 'rapid_mastery'
  | 'correct_with_misconception'
  | 'out_of_scope';

// ── Options ──────────────────────────────────────────────────────────────────

export interface MockAIProviderOptions {
  /** The test scenario this provider should simulate. */
  scenario: MockScenario;
  /** For scenarios that produce a diagnosis: which misconception to emit. */
  misconceptionId?: string;
  /** Override the next concept for 'move_forward' actions. */
  nextConceptId?: string;
}

// ── Concept chain (mirrors the curriculum prerequisite order) ──────────────────

const CONCEPT_CHAIN: string[] = [
  'read-numbers',
  'digit-position',
  'digit-value',
  'expanded-form',
  'compare-order',
];

function nextInChain(conceptId: string): string | null {
  const idx = CONCEPT_CHAIN.indexOf(conceptId);
  if (idx === -1 || idx === CONCEPT_CHAIN.length - 1) return null;
  return CONCEPT_CHAIN[idx + 1];
}

// ── Misconception → representation mapping ─────────────────────────────────────

/**
 * Maps each known misconception to the most appropriate visual representation
 * for targeted remediation. This mirrors the remediation activities defined in
 * adaptive-engine.ts (PLACE_VALUE_MISCONCEPTIONS.remediationActivities).
 */
const REPRESENTATION_FOR_MISCONCEPTION: Record<string, string> = {
  'digit-not-value': 'place_value_chart',
  'position-confusion': 'place_value_chart',
  'expanded-form-skip': 'step_reveal',
  'left-right-reverse': 'digit_comparison',
  'comparison-reverse': 'grouped_objects',
  'comparison-equal': 'digit_comparison',
  'read-numbers': 'place_value_chart',
};

/**
 * Broad conceptual failures (e.g. misreading whole numbers) warrant a
 * fresh explanation rather than targeted remediation of a specific sub-skill.
 */
const BROAD_MISCONCEPTIONS: Set<string> = new Set(['read-numbers']);

// ── Helper: inspect evidence for test signals ────────────────────────────────

interface EvidenceSummary {
  totalAttempts: number;
  allCorrect: boolean;
  latestCorrect: boolean;
  remediationSeen: boolean;
  remediationSuccess: boolean;
}

function summarizeEvidence(evidence: Evidence[]): EvidenceSummary {
  if (evidence.length === 0) {
    return {
      totalAttempts: 0,
      allCorrect: false,
      latestCorrect: true,
      remediationSeen: false,
      remediationSuccess: false,
    };
  }

  const totalAttempts = evidence.length;
  const allCorrect = evidence.every((e) => e.correct);
  const latestCorrect = evidence[evidence.length - 1].correct;
  const remediationSeen = evidence.some(
    (e) => e.remediationShown && e.remediationShown.length > 0
  );
  const remediationSuccess = evidence.some(
    (e) => e.correct && e.remediationShown && e.remediationShown.length > 0
  );

  return {
    totalAttempts,
    allCorrect,
    latestCorrect,
    remediationSeen,
    remediationSuccess,
  };
}

// ── The Mock Provider ──────────────────────────────────────────────────────────

export class MockAIProvider implements AIProvider {
  private readonly scenario: MockScenario;
  private readonly misconceptionId: string | null;
  private readonly nextConceptId: string | null;

  constructor(options: MockAIProviderOptions | MockScenario) {
    if (typeof options === 'string') {
      this.scenario = options;
      this.misconceptionId = null;
      this.nextConceptId = null;
    } else {
      this.scenario = options.scenario;
      this.misconceptionId = options.misconceptionId ?? null;
      this.nextConceptId = options.nextConceptId ?? null;
    }
  }

  // ── Public accessors for tests ────────────────────────────────────────────

  getScenario(): MockScenario {
    return this.scenario;
  }

  /** How many times each provider method was called (for test assertions). */
  callCount: { diagnose: number; select: number; analyze: number } = {
    diagnose: 0,
    select: 0,
    analyze: 0,
  };

  // ─── AIProvider implementation ──────────────────────────────────────────

  async analyzeLearnerEvidence(
    conceptId: string,
    evidence: Evidence[],
    _context: AIContext
  ): Promise<MisconceptionAnalysis> {
    this.callCount.analyze++;

    const summary = summarizeEvidence(evidence);

    switch (this.scenario) {
      case 'mastery':
      case 'rapid_mastery':
        // The learner demonstrates strong performance with no identified
        // misconception. The diagnosis is null, and selectNextAction will
        // use evidence patterns to determine the action.
        return {
          misconceptionId: null,
          confidence: 0.95,
          explanation:
            'Learner demonstrates strong, consistent mastery with no identified misconceptions.',
          evidenceStrength: 'strong',
        };

      case 'repeated_misconception':
        // Diagnosis: a specific place-value confusion pattern.
        // selectNextAction will propose targeted remediation.
        return {
          misconceptionId: this.misconceptionId ?? 'position-confusion',
          confidence: 0.9,
          explanation:
            `Learner consistently selects digit value instead of digit position. ` +
            `Strong pattern of place-value confusion. ` +
            `(evidence: ${summary.totalAttempts} attempts, ${summary.allCorrect ? 'all correct' : 'some incorrect'})`,
          evidenceStrength: 'strong',
        };

      case 'failure_after_remediation':
        // Diagnosis: the same misconception persists even after remediation.
        // selectNextAction will escalate to a different representation.
        return {
          misconceptionId: this.misconceptionId ?? 'expanded-form-skip',
          confidence: 0.85,
          explanation:
            `Remediation was shown but learner still struggles with the same concept. ` +
            `Needs a different representation or scaffold. ` +
            `(remediation seen: ${summary.remediationSeen}, success: ${summary.remediationSuccess})`,
          evidenceStrength: 'weak',
        };

      case 'correct_with_misconception':
        // Diagnosis: answer is correct but evidence pattern suggests a possible
        // misconception. selectNextAction will propose targeted remediation.
        return {
          misconceptionId: this.misconceptionId ?? 'expanded-form-skip',
          confidence: 0.7,
          explanation:
            `Answer is correct but evidence pattern suggests a possible misconception. ` +
            `Weak confidence — recommend targeted diagnostic check rather than declaring mastery.`,
          evidenceStrength: 'weak',
        };

      case 'out_of_scope':
        // No clear misconception detected — but selectNextAction will still
        // propose an out-of-scope action to test the validator's safety.
        return {
          misconceptionId: null,
          confidence: 0.5,
          explanation: 'No clear misconception detected.',
          evidenceStrength: 'weak',
        };
    }
  }

  async diagnoseMisconception(context: AIContext): Promise<MisconceptionAnalysis> {
    this.callCount.diagnose++;
    // Delegate to analyzeLearnerEvidence with synthetic evidence.
    const evidence: Evidence[] = [
      {
        conceptId: context.conceptId,
        correct: context.selectedAnswer === context.expectedAnswer,
        timestamp: Date.now(),
        activityId: context.lessonId,
        answer: context.selectedAnswer,
        expectedAnswer: context.expectedAnswer,
      },
    ];
    return this.analyzeLearnerEvidence(context.conceptId, evidence, context);
  }

  async selectNextAction(
    conceptId: string,
    evidence: Evidence[],
    context: AIContext,
    diagnosis: MisconceptionAnalysis | null
  ): Promise<PedagogicalAction> {
    this.callCount.select++;

    const summary = summarizeEvidence(evidence);
    const nextConcept = this.nextConceptId ?? nextInChain(conceptId) ?? conceptId;

    // ── Out-of-scope test fixture ────────────────────────────────────────
    // This scenario deliberately bypasses diagnosis to return an action
    // that violates curriculum constraints. It exists ONLY to verify that
    // the ActionValidator catches out-of-scope proposals. This is a controlled
    // test of the safety boundary, not normal AI behavior.
    if (this.scenario === 'out_of_scope') {
      return {
        actionType: 'move_forward',
        conceptId: context.conceptId,
        nextConceptId: 'calculus', // ← unknown concept — OUT OF SCOPE
        reason: 'AI proposes moving to calculus (deliberately out of scope, tests validator).',
        confidence: 0.8,
      };
    }

    // ── Mastery scenario: simulate demonstrated mastery ─────────────────────
    // When the learner answers correctly under the 'mastery' scenario, the
    // mock short-circuits to move_forward — modelling a learner who has
    // already satisfied prior prerequisite concepts (which would normally
    // have been mastered in earlier steps/journeys). This enables browser
    // verification of the move_forward progression path from a clean session.
    if (this.scenario === 'mastery' && summary.latestCorrect) {
      return {
        actionType: 'move_forward',
        conceptId: context.conceptId,
        nextConceptId: nextConcept,
        reason:
          `Learner demonstrates mastery of ${context.conceptId} (mastery scenario). ` +
          `Advancing to ${nextConcept}.`,
        confidence: 0.95,
      };
    }

    // ════════════════════════════════════════════════════════════════════════
    // DIAGNOSIS-DRIVEN ACTION SELECTION
    //
    // The diagnosis from analyzeLearnerEvidence() MATERIALLY drives the
    // action selection below. The same evidence with different diagnoses
    // produces different actions — removing the diagnosis parameter would
    // break this differentiation.
    // ════════════════════════════════════════════════════════════════════════

    if (diagnosis?.misconceptionId) {
      const mc = diagnosis.misconceptionId;

      // ── Broad conceptual failure → explain ─────────────────────────────
      // A broad misconception like 'read-numbers' (misreading whole numbers)
      // indicates a fundamental gap that needs a fresh explanation, not
      // targeted remediation of a specific sub-skill.
      if (BROAD_MISCONCEPTIONS.has(mc)) {
        return {
          actionType: 'explain',
          conceptId: context.conceptId,
          content:
            `Let's review ${context.conceptId} from the basics. ` +
            `We'll look at each digit and where it sits in the number.`,
          reason:
            `AI diagnosed "${mc}" (broad conceptual failure, ${diagnosis.confidence.toFixed(2)} confidence). ` +
            `Proposing a fresh explanation rather than targeted remediation.`,
          confidence: diagnosis.confidence,
        };
      }

      // ── Prior remediation was ineffective → escalate ──────────────────
      // If the learner has already been remediated for this concept and is
      // still failing, escalate to a different representation.
      if (summary.remediationSeen && !summary.remediationSuccess) {
        return {
          actionType: 'change_representation',
          conceptId: context.conceptId,
          representation: 'number_line',
          reason:
            `AI diagnosed "${mc}" but prior remediation with place_value_chart was ineffective ` +
            `(${summary.totalAttempts} attempts since remediation). Escalating to number_line representation.`,
          confidence: diagnosis.confidence,
        };
      }

      // ── Specific technical misconception → targeted remediation ─────────
      // A specific, narrow misconception (e.g. position-confusion,
      // digit-not-value, comparison-reverse) benefits from targeted
      // remediation with the appropriate visual representation.
      const representation = REPRESENTATION_FOR_MISCONCEPTION[mc] ?? 'place_value_chart';
      return {
        actionType: 'remediate',
        conceptId: context.conceptId,
        misconceptionId: mc,
        representation,
        escalated: summary.totalAttempts >= 3,
        reason:
          `AI diagnosed "${mc}" (${diagnosis.confidence.toFixed(2)} confidence, ` +
          `${diagnosis.evidenceStrength} evidence). Proposing targeted remediation with ${representation}.`,
        confidence: diagnosis.confidence,
      };
    }

    // ── No misconception diagnosed ───────────────────────────────────────

    // Use attempt number from context to distinguish rapid vs. consistent mastery.
    const attemptNum = context.attemptNumber ?? summary.totalAttempts;

    if (attemptNum >= 2 && summary.allCorrect) {
      // Consistent correct responses across multiple attempts → advance.
      const next = nextConcept;
      return {
        actionType: 'move_forward',
        conceptId: context.conceptId,
        nextConceptId: next,
        reason:
          `AI sees no misconceptions and ${attemptNum} consecutive correct responses ` +
          `(all correct). Advancing to ${next}.`,
        confidence: 0.95,
      };
    }

    if (attemptNum <= 1 && summary.latestCorrect) {
      // Correct on first attempt — verify mastery before proceeding.
      return {
        actionType: 'check_mastery',
        conceptId: context.conceptId,
        threshold: 0.8,
        reason:
          `Learner answered correctly on attempt ${attemptNum}. ` +
          `Verifying mastery before progressing to next concept.`,
        confidence: 0.9,
      };
    }

    // No misconception, but learner is inconsistent — ask a clarifying question.
    return {
      actionType: 'ask',
      conceptId: context.conceptId,
      prompt: `Let's check understanding of ${conceptId}. ${context.prompt}`,
      options: context.options,
      reason: 'AI sees no major misconception but learner is inconsistent. Asking for clarification.',
      confidence: 0.5,
    };
  }

  async generateExplanation(
    conceptId: string,
    _context: AIContext
  ): Promise<string> {
    return `Explanation for ${conceptId} (mock provider, scenario: ${this.scenario}).`;
  }

  async generateActivity(
    conceptId: string,
    difficulty: number,
    _context: AIContext
  ): Promise<{ question: string; options: string[]; correctIndex: number }> {
    return {
      question: `Mock practice question for ${conceptId} at difficulty ${difficulty}.`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctIndex: 0,
    };
  }
}