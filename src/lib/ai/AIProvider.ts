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

/** Concept IDs available in the Grade 4 Place Value curriculum. */
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
}
