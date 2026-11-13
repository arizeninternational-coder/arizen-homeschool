/**
 * AIProvider — Provider-Agnostic Interface for the Arizen Learning Engine
 *
 * This interface defines the contract between the AdaptiveOrchestrator and any
 * AI model provider (Ollama, Gemini, OpenAI, a mock, etc.).
 *
 * The learning engine MUST NOT know which provider is in use. It only knows
 * the shape of the data coming back. Every method returns structured,
 * schema-validated data — never raw LLM text and never UI components.
 *
 * Provider selection is handled by the factory in:
 *   src/lib/ai/providers/index.ts  (createAIProvider)
 *
 * Configuration is environment-driven:
 *   AI_PROVIDER=mock | ollama | gemini | openai | anthropic
 *   AI_MODEL=<provider-specific model identifier>
 *   AI_BASE_URL=<optional base URL, e.g. http://localhost:11434>
 */

// ── Types reused from the existing adaptive engine ───────────────────────────
// We reuse the existing Evidence type rather than duplicating it.
import type { Evidence } from '../curriculum/adaptive-engine';

export type { ConceptId } from '../curriculum/adaptive-engine';

/**
 * Concept IDs available in the Grade 4 Place Value curriculum.
 * @deprecated Lesson-agnostic: the AI now receives the active lesson's concept
 * ids in the request. This type is retained only for existing type references.
 */
export type PlaceValueConceptId =
  | 'read-numbers'
  | 'digit-position'
  | 'digit-value'
  | 'expanded-form'
  | 'compare-order';

// ── Pedagogical Action Model ─────────────────────────────────────────────────

/**
 * A single, validated pedagogical decision produced by the orchestrator.
 *
 * This is pure DATA — no React components, no UI strings beyond what the
 * application needs to validate and route to the appropriate renderer.
 *
 * Every action carries enough context for ActionValidator to verify:
 *   - actionType     → is it in the permitted set?
 *   - conceptId      → is it a known, in-scope concept?
 *   - reason         → audit trail
 *   - difficulty     → within permitted range?
 *   - representation → is it an approved representation?
 *   - prerequisiteOf / targetConcept → prerequisite relationships
 */

export type PedagogicalActionKind =
  | 'explain'
  | 'demonstrate'
  | 'ask'
  | 'provide_hint'
  | 'provide_example'
  | 'remediate'
  | 'targeted_practice'
  | 'increase_difficulty'
  | 'revisit_prerequisite'
  | 'change_representation'
  | 'check_mastery'
  | 'move_forward';

export interface BasePedagogicalAction {
  /** What kind of pedagogical move to make. */
  actionType: PedagogicalActionKind;
  /** The concept this action targets. Must be a known concept ID. */
  conceptId: string;
  /** Human-readable reason for the decision (for audit/debug). */
  reason: string;
  /** Confidence in the decision, 0–1. */
  confidence: number;
}

export interface ExplainAction extends BasePedagogicalAction {
  actionType: 'explain';
  /** The explanation text. */
  content: string;
}

export interface DemonstrateAction extends BasePedagogicalAction {
  actionType: 'demonstrate';
  /** Representation type for the demonstration. */
  representation: string;
  /** Structured visual data the renderer can use. */
  visualSpec?: Record<string, unknown>;
}

export interface AskAction extends BasePedagogicalAction {
  actionType: 'ask';
  /** The question prompt. */
  prompt: string;
  /** Answer options the student can choose from. */
  options: string[];
}

export interface ProvideHintAction extends BasePedagogicalAction {
  actionType: 'provide_hint';
  /** Hint text. */
  hint: string;
  /** Scaffolding strength: mild = gentle nudge, strong = direct guidance. */
  strength: 'mild' | 'strong';
}

export interface ProvideExampleAction extends BasePedagogicalAction {
  actionType: 'provide_example';
  /** Step-by-step work through of an example. */
  example: string;
}

export interface RemediateAction extends BasePedagogicalAction {
  actionType: 'remediate';
  /** The specific misconception being addressed. */
  misconceptionId: string;
  /** Representation for the remediation (e.g., "place_value_chart"). */
  representation: string;
  /** Interactive scaffolding for the remediation. */
  visualSpec?: Record<string, unknown>;
  interactionSpec?: Record<string, unknown>;
  /** Whether this is an escalated (stronger) intervention. */
  escalated: boolean;
}

export interface TargetedPracticeAction extends BasePedagogicalAction {
  actionType: 'targeted_practice';
  /** Practice question prompt. */
  prompt: string;
  /** Answer choices. */
  options: string[];
  /** Index of the correct answer. */
  correctIndex: number;
  /** Difficulty level (0–5). */
  difficulty: number;
}

export interface IncreaseDifficultyAction extends BasePedagogicalAction {
  actionType: 'increase_difficulty';
  /** The concept to practice at higher difficulty. */
  conceptId: string;
}

export interface RevisitPrerequisiteAction extends BasePedagogicalAction {
  actionType: 'revisit_prerequisite';
  /** The prerequisite concept to review. */
  prerequisiteConceptId: string;
  /** The concept that depends on the prerequisite. */
  targetConceptId: string;
}

export interface ChangeRepresentationAction extends BasePedagogicalAction {
  actionType: 'change_representation';
  /** The new representation to use. */
  representation: string;
}

export interface CheckMasteryAction extends BasePedagogicalAction {
  actionType: 'check_mastery';
  /** Mastery threshold (0–1) the learner must exceed. */
  threshold: number;
}

export interface MoveForwardAction extends BasePedagogicalAction {
  actionType: 'move_forward';
  /** The next concept to begin working on. */
  nextConceptId: string;
}

export type PedagogicalAction =
  | ExplainAction
  | DemonstrateAction
  | AskAction
  | ProvideHintAction
  | ProvideExampleAction
  | RemediateAction
  | TargetedPracticeAction
  | IncreaseDifficultyAction
  | RevisitPrerequisiteAction
  | ChangeRepresentationAction
  | CheckMasteryAction
  | MoveForwardAction;

// ── AI Tutoring Model ────────────────────────────────────────────────────────

/**
 * The pedagogical stage of a remediation conversation.
 *
 * Escalation is decided by DETERMINISTIC application code from attempt count
 * and remediation history — never by the AI, and never by the length of text.
 */
export type RemediationStage =
  /** First failure: expose the misconception, hint, invite another attempt. */
  | 'scaffold'
  /** Same misconception again: deeper scaffold, concrete representation. */
  | 'deeper_scaffold'
  /** Threshold reached: clear worked explanation, then a transfer question. */
  | 'explain_then_transfer'
  /** Transfer question answered correctly: understanding recovered. */
  | 'recovered';

/** One previously delivered tutoring turn, replayed to the AI for continuity. */
export interface TutoringTurnRecord {
  stage: RemediationStage;
  /** What the learner answered on that turn. */
  learnerAnswer: string;
  correct: boolean;
  /** Short note on what the tutor did (scaffold type, example used, etc). */
  summary?: string;
}

/**
 * Everything the AI tutor needs to produce the next turn.
 *
 * The application owns correctness, validation, attempt counting and mastery.
 * The AI receives this context and decides HOW to teach.
 */
export interface TutoringRequest {
  // ── Curriculum (WHAT) ──
  /** The SLO / curriculum objective this activity serves. */
  slo?: string;
  lessonTitle?: string;
  /** Concept ids valid for the active lesson (never a hardcoded list). */
  allowedConceptIds: string[];
  /** Misconception ids valid for the active lesson. */
  allowedMisconceptionIds: string[];
  /** Representations the lesson permits. */
  allowedRepresentations: string[];

  // ── The activity (deterministic; already validated) ──
  activityId: string;
  conceptId: string;
  prompt: string;
  options: string[];
  correctAnswer: string;

  // ── The learner's response (deterministic) ──
  learnerAnswer: string;
  correct: boolean;
  misconceptionId: string | null;
  misconceptionLabel?: string;

  // ── History and state ──
  attemptNumber: number;
  previousTurns: TutoringTurnRecord[];
  /** Scaffolds already used, so the tutor does not repeat itself. */
  previousScaffolds: string[];
  stage: RemediationStage;
  /** Attempt number at which a worked explanation is due. */
  explanationThreshold: number;

  // ── Transfer question (curriculum data, not AI-generated) ──
  /** Present only when stage === 'explain_then_transfer'. */
  transfer?: {
    prompt: string;
    options: string[];
    correctAnswer: string;
  };
}

/**
 * A single AI-authored tutoring turn — the language the learner actually reads.
 *
 * `transfer` is echoed back from the request (it is curriculum data). The AI
 * authors the teaching around it, never the answer.
 */
export interface TutoringTurn {
  /** Short acknowledgement of what the learner did. */
  acknowledgement: string;
  /** Age-appropriate exposure of the misconception. Must not state the answer. */
  misconceptionExplanation: string;
  /** The scaffold used: a hint, a representation, a worked example, etc. */
  scaffold: {
    kind: 'hint' | 'thinking_question' | 'representation' | 'worked_example';
    /** The scaffold's teaching content. */
    content: string;
  };
  /** A focused question that makes the learner reason, not guess. */
  thinkingQuestion: string;
  /** Explicit invitation to try again. */
  inviteRetry: string;
  stage: RemediationStage;
  /**
   * Worked example. Required when stage === 'explain_then_transfer'.
   * This IS allowed to show the method, including the answer to a SIMILAR
   * example — never the answer to the learner's own question.
   */
  workedExample?: string;
  /** Echoed from the request so the client knows which question to ask. */
  transfer?: { prompt: string; options: string[]; correctAnswer: string };
  /** Non-empty when the turn came from a deterministic fallback, not the AI. */
  degradedReason?: string;
}

// ── Analysis / Diagnosis Result ──────────────────────────────────────────────

export interface MisconceptionAnalysis {
  /** The identified misconception ID, or null if none detected. */
  misconceptionId: string | null;
  confidence: number;
  /** Human-readable explanation of the analysis. */
  explanation: string;
  /** Strength of the evidence. */
  evidenceStrength: 'strong' | 'weak';
}

// ── Context ──────────────────────────────────────────────────────────────────

/** Context passed to AIProvider methods. */
export interface AIContext {
  learnerId: string;
  lessonId: string;
  conceptId: string;
  selectedAnswer: string;
  expectedAnswer: string;
  options: string[];
  prompt: string;
  attemptNumber?: number;
  /** Representations the AI is permitted to propose (from curriculum constraints). */
  allowedRepresentations?: string[];
  /** Pedagogical action types the AI is permitted to propose. */
  allowedActionTypes?: PedagogicalActionKind[];
  /** The concept prerequisite chain (for AI planning). */
  conceptChain?: string[];
  /**
   * Misconception ids the active lesson declares. Providers MUST scope any
   * misconception validation to this list — never to a hardcoded lesson.
   */
  allowedMisconceptionIds?: string[];
}

// ── The Interface ─────────────────────────────────────────────────────────────

export interface AIProvider {
  /**
   * Analyze accumulated learner evidence to diagnose a misconception.
   * The AI interprets the response — the application decides what to DO about it.
   */
  analyzeLearnerEvidence(
    conceptId: string,
    evidence: Evidence[],
    context: AIContext
  ): Promise<MisconceptionAnalysis>;

  /**
   * Diagnose a specific response for a misconception.
   * Replaces the rule-based detectMisconception() with AI interpretation.
   */
  diagnoseMisconception(context: AIContext): Promise<MisconceptionAnalysis>;

  /**
   * Propose the next pedagogical action based on evidence, state, and
   * curriculum constraints. The AI proposes — the ActionValidator decides.
   *
   * The diagnosis from analyzeLearnerEvidence() is passed in so the AI can
   * make an informed proposal that accounts for its own diagnostic conclusion.
   * The diagnosis must materially influence the action — it is NOT metadata.
   */
  selectNextAction(
    conceptId: string,
    evidence: Evidence[],
    context: AIContext,
    diagnosis: MisconceptionAnalysis | null
  ): Promise<PedagogicalAction>;

  /**
   * Generate an explanation for a concept. Only called when the orchestrator
   * determines an 'explain' action is needed.
   */
  generateExplanation(
    conceptId: string,
    context: AIContext
  ): Promise<string>;

  /**
   * Generate a practice activity for a concept at a given difficulty.
   * Only called when the orchestrator determines a 'targeted_practice'
   * action is needed.
   */
  generateActivity(
    conceptId: string,
    difficulty: number,
    context: AIContext
  ): Promise<{ question: string; options: string[]; correctIndex: number }>;

  /**
   * Generate the next tutoring turn for a learner who has answered incorrectly.
   *
   * This is the AI's core teaching responsibility. The application has already
   * decided the escalation stage and validated correctness; the AI decides HOW
   * to respond at that stage.
   */
  generateTutoringTurn(request: TutoringRequest): Promise<TutoringTurn>;

  /**
   * Whether this provider can actually serve a request right now.
   * An unavailable provider must report false rather than throwing, so the
   * application can degrade deterministically instead of 500-ing.
   */
  isAvailable?(): Promise<{ available: boolean; reason?: string; model?: string }>;
}

/** Fields the AI must never be shown. Guarded by the validator, not the prompt. */
export const NEVER_SHOW_TO_LEARNER = [
  'the expected answer for the learner\'s own question',
] as const;
