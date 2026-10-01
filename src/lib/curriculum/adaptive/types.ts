/**
 * Adaptive lesson configuration — the per-lesson data contract.
 *
 * A lesson declares WHAT it teaches (curriculum objectives, concepts) and WHAT
 * evidence it produces (activities, validators, misconceptions). The adaptive
 * engine decides HOW the learner gets there.
 *
 * Nothing in this file contains mathematical answers or lesson-specific UI
 * copy baked into shared components: every lesson supplies its own data, and
 * the shared engine builds steps from that data.
 */

export interface AdaptiveConceptSpec {
  id: string;
  label: string;
  /** Concepts that must be proficient before this one is taught. */
  prerequisites: string[];
  /** Representations the curriculum permits for this concept. */
  allowedRepresentations?: string[];
  /** Confidence (0–1) needed to consider this concept mastered. */
  masteryThreshold: number;
}

export interface LessonMisconception {
  id: string;
  label: string;
  description: string;
  /** Observable wrong-answer patterns that suggest this misconception. */
  indicators: string[];
  /**
   * Remediation template. Tokens are substituted with the ACTUAL question the
   * learner was asked — no answer is hardcoded into shared UI.
   * Supported tokens: {prompt} {selected} {expected} {attempt} {concept}
   */
  remediation: RemediationTemplate;
  /**
   * Optional deterministic detector. Receives the learner's answer, the expected
   * answer and the question context; returns true when this misconception applies.
   */
  detect?: (
    selected: string,
    expected: string,
    ctx: MisconceptionContext,
  ) => boolean;
}

export interface MisconceptionContext {
  prompt: string;
  choices: string[];
  activityId: string;
  attemptNumber: number;
}

export interface RemediationTemplate {
  title: string;
  /** Explanation of the misconception, addressed to the learner. */
  explanation: string;
  /** Owl guidance shown with the explanation. */
  owlText?: string;
  /** Hint shown on the scaffolded retry of the same activity. */
  hint: string;
  /** Feedback when the learner answers the scaffolded retry correctly. */
  correctFeedback?: string;
  /** Feedback when the learner answers the scaffolded retry incorrectly. */
  incorrectFeedback?: string;
  /**
   * Optional visual for the remediation step. Derived from lesson data (never
   * from shared defaults) — e.g. a place value chart or number line.
   */
  visual?: Record<string, unknown>;
}

export interface AdaptiveActivitySpec {
  /** Stable, globally unique activity id (journey step id or sub-activity id). */
  activityId: string;
  conceptId: string;
  /** Index of the quiz block in the lesson's contentBlocks this activity binds to. */
  sourceQuizIndex?: number;
  /** Direct specification for activities not sourced from a quiz block. */
  prompt?: string;
  /** Lesson-declared correct answer, used when no runtime options are given. */
  expectedAnswer?: string;
  choices?: string[];
  correctAnswer?: string;
  /** Student-facing explanation used for correct feedback. */
  explanation?: string;
  hint?: string;
  /**
   * Deterministic validation. Defaults to exact match against `correctAnswer`
   * (case/whitespace normalised). Never delegates to an LLM.
   */
  validate?: (selected: string, expected: string, ctx: MisconceptionContext) => boolean;
  /**
   * Deterministic misconception detection for this activity. Returns a
   * misconception id from the owning lesson config, or null.
   */
  detectMisconception?: (
    selected: string,
    expected: string,
    ctx: MisconceptionContext,
  ) => string | null;
  /** SLO this activity provides evidence for. */
  slo?: string;
}

export interface AdaptiveMasteryCriteria {
  /** Concepts that must be mastered for the lesson to complete. */
  requiredConcepts: string[];
  /** Correct responses required per required concept. Default 1. */
  minCorrectPerConcept?: number;
  /** Minimum accuracy across required activities (0–1). Default 0.6. */
  minAccuracy?: number;
  /** When true, every required concept needs evidence (not just correct evidence). */
  requireEvidenceForAll?: boolean;
}

export interface AdaptiveCelebration {
  /** Short headline for the completion screen, derived from this lesson. */
  headline: string;
  /** Sentence shown under the score. */
  praise: string;
  /** Badge/reward name, if the lesson awards one. */
  badge?: string;
  /** Recap checklist items shown at the end of the journey. */
  recap: string[];
}

/**
 * Which journey builder renders the lesson.
 * - `bespoke`  — the lesson supplies its own step list (the Place Value pilot).
 * - `generated` — the shared builder derives the journey from lesson data.
 */
export type JourneyBuilderKind = 'bespoke' | 'generated';

export interface AdaptiveLessonConfig {
  lessonSlug: string;
  lessonTitle: string;
  /**
   * Alternative slugs this lesson is stored under. Curriculum source data and
   * the database do not always agree on a slug (e.g. `factors-multiples` in the
   * DB vs `factors-multiples-even-odd` in source), and a lesson must resolve to
   * its config in both. This is a data-level alias, not a title match.
   */
  slugAliases?: string[];
  /** Key into the curriculum-constraints registry. */
  curriculumKey: string;
  grade: number;
  strand: string;
  subStrand: string;
  /** Specific Learning Outcomes from the source curriculum. */
  slos: string[];
  /** Learner-facing objectives ("By the end of this lesson, you'll be able to…"). */
  objectives: string[];
  concepts: AdaptiveConceptSpec[];
  misconceptions: LessonMisconception[];
  activities: AdaptiveActivitySpec[];
  mastery: AdaptiveMasteryCriteria;
  celebration: AdaptiveCelebration;
  journeyBuilder: JourneyBuilderKind;
  /**
   * Remediation strategy for this lesson.
   * - `config-driven`  — build the remediation step from this config's templates.
   * - `lesson-generators` — reuse the lesson's own registered generator registry
   *   (the Place Value remediation generators, preserved verbatim).
   */
  remediationStrategy: 'config-driven' | 'lesson-generators';
}