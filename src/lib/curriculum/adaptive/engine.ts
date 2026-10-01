/**
 * The shared adaptive lesson engine.
 *
 * Everything here is lesson-agnostic and deterministic. A lesson supplies data
 * (concepts, activities, misconceptions, mastery criteria) through its
 * AdaptiveLessonConfig; this module turns that data into:
 *
 *   activity resolution → deterministic validation → misconception detection
 *   → remediation steps → mastery/progression evaluation
 *
 * No mathematical answers, lesson titles or subject-specific strings appear in
 * this file.
 */

import type {
  AdaptiveActivitySpec,
  AdaptiveLessonConfig,
  LessonMisconception,
  MisconceptionContext,
  RemediationTemplate,
} from './types';
import type { JourneyStep } from '../grade4-journeys';

/** A resolved activity: config spec + the concrete question it asks. */
export interface ResolvedActivity {
  activityId: string;
  conceptId: string;
  prompt: string;
  choices: string[];
  correctAnswer: string;
  explanation: string;
  hint: string;
  slo?: string;
  spec: AdaptiveActivitySpec;
}

function normalise(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  return String(value).trim().toLowerCase().replace(/[, ]/g, '');
}

/**
 * Deterministic default validation: normalised exact match.
 * Lessons may supply a stricter `validate` on the activity spec, but
 * correctness never depends on an LLM.
 */
export function validateActivity(
  activity: ResolvedActivity,
  selected: string,
  ctx?: Partial<MisconceptionContext>,
): boolean {
  const context: MisconceptionContext = {
    prompt: activity.prompt,
    choices: activity.choices,
    activityId: activity.activityId,
    attemptNumber: ctx?.attemptNumber ?? 1,
  };
  if (activity.spec.validate) {
    return activity.spec.validate(selected, activity.correctAnswer, context);
  }
  return normalise(selected) === normalise(activity.correctAnswer);
}

/**
 * Resolve the misconception for a wrong answer, in priority order:
 *  1. the activity's own `detectMisconception` (most specific)
 *  2. a misconception whose `detect` predicate matches
 * Returns null when no misconception is defined for this activity.
 */
export function detectActivityMisconception(
  config: AdaptiveLessonConfig,
  activity: ResolvedActivity,
  selected: string,
  ctx?: Partial<MisconceptionContext>,
): LessonMisconception | null {
  const context: MisconceptionContext = {
    prompt: activity.prompt,
    choices: activity.choices,
    activityId: activity.activityId,
    attemptNumber: ctx?.attemptNumber ?? 1,
  };

  if (activity.spec.detectMisconception) {
    const id = activity.spec.detectMisconception(selected, activity.correctAnswer, context);
    if (id) return config.misconceptions.find((m) => m.id === id) || null;
  }

  return (
    config.misconceptions.find((m) => m.detect?.(selected, activity.correctAnswer, context)) || null
  );
}

/** Substitute {prompt} {selected} {expected} {attempt} {concept} tokens. */
function fillTemplate(template: string, tokens: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    tokens[key] !== undefined ? String(tokens[key]) : match,
  );
}

/**
 * Build a remediation JourneyStep for a diagnosed misconception.
 *
 * The step re-asks the SAME activity with a scaffolded hint — so remediation
 * exists for every mapped activity and addresses the diagnosed misconception
 * rather than saying "try again". The correct answer is never revealed.
 */
export function buildRemediationStep(
  config: AdaptiveLessonConfig,
  misconception: LessonMisconception | null,
  activity: ResolvedActivity,
  attemptNumber = 1,
  selectedAnswer = '',
): JourneyStep {
  const template: RemediationTemplate = misconception?.remediation || FALLBACK_REMEDIATION;
  const escalated = attemptNumber >= 2;
  const tokens = {
    prompt: activity.prompt,
    selected: selectedAnswer || 'your answer',
    expected: '', // deliberately never exposed to the learner
    attempt: attemptNumber,
    concept: activity.conceptId,
  };

  const hintText = escalated
    ? `${template.hint} Take it one step at a time.`
    : template.hint;

  const choices: any[] = activity.choices.map((label, i) => ({ id: String(i), label }));
  const correctIndex = activity.choices.findIndex(
    (c) => normalise(c) === normalise(activity.correctAnswer),
  );

  return {
    id: `remediation-${activity.activityId}-${misconception?.id || 'scaffold'}-${attemptNumber}`,
    stepType: 'learn',
    title: template.title,
    studentText: fillTemplate(template.explanation, tokens),
    owlText: template.owlText || 'Let us work through this together.',
    visualSpec: template.visual as JourneyStep['visualSpec'],
    interactionSpec: {
      type: 'tap_choice',
      prompt: activity.prompt,
      choices,
      // The learner must actively re-answer; the answer is not surfaced.
      correctChoiceId: correctIndex >= 0 ? String(correctIndex) : undefined,
      conceptId: activity.conceptId,
      hint: hintText,
    },
    feedbackSpec: {
      correct: escalated
        ? template.correctFeedback || 'Yes — you have got it now. On to the next one!'
        : template.correctFeedback || 'Correct! You worked it out.',
      incorrect: escalated
        ? template.incorrectFeedback ||
          'Still tricky — let us take an even smaller step and try that one.'
        : template.incorrectFeedback || 'Not quite. Re-read the hint and try once more.',
      hint: hintText,
    },
    successCriteria: 'Responds to the scaffolded retry.',
  };
}

const FALLBACK_REMEDIATION: RemediationTemplate = {
  title: 'Let Us Try That One More Time',
  explanation:
    'Let us take another look at this question together. Read it again slowly, one piece at a time.',
  owlText: 'You are closer than you think. Let us go again.',
  hint: 'Read the question carefully and check your answer against each part of it.',
  correctFeedback: 'Correct — you have got it!',
  incorrectFeedback: 'Keep going. Look carefully at each part of the question.',
};

// -- Mastery / progression -----------------------------------------------------

export interface LearnerResponseSummary {
  activityId: string;
  correct: boolean;
  misconceptionId?: string | null;
}

export interface MasteryEvaluation {
  mastered: boolean;
  /** Concepts that still need evidence or more correct responses. */
  unmetConcepts: Array<{
    conceptId: string;
    label: string;
    correct: number;
    required: number;
    reason: 'no-evidence' | 'not-enough-correct' | 'low-accuracy';
  }>;
  /** Correct / attempted across the lesson's required concepts. */
  accuracy: number;
  requiredConcepts: string[];
}

/**
 * Mastery is derived from EVIDENCE, never from page completion.
 *
 * A concept is mastered when it has at least `minCorrectPerConcept` correct
 * responses. Lesson accuracy is measured across all responses for the lesson's
 * required concepts and must meet `minAccuracy`.
 */
export function evaluateMastery(
  config: AdaptiveLessonConfig,
  responses: LearnerResponseSummary[],
): MasteryEvaluation {
  const minCorrect = config.mastery.minCorrectPerConcept ?? 1;
  const minAccuracy = config.mastery.minAccuracy ?? 0.6;

  const conceptOf = new Map<string, string>();
  for (const activity of config.activities) {
    conceptOf.set(activity.activityId, activity.conceptId);
  }

  const perConcept = new Map<string, { correct: number; attempts: number }>();
  const ensure = (conceptId: string) => {
    if (!perConcept.has(conceptId)) perConcept.set(conceptId, { correct: 0, attempts: 0 });
    return perConcept.get(conceptId)!;
  };
  for (const conceptId of config.mastery.requiredConcepts) ensure(conceptId);

  let scopedCorrect = 0;
  let scopedAttempts = 0;
  for (const response of responses) {
    const conceptId = conceptOf.get(response.activityId);
    if (!conceptId) continue;
    if (!config.mastery.requiredConcepts.includes(conceptId)) continue;
    const bucket = ensure(conceptId);
    bucket.attempts += 1;
    scopedAttempts += 1;
    if (response.correct) {
      bucket.correct += 1;
      scopedCorrect += 1;
    }
  }

  const unmetConcepts: MasteryEvaluation['unmetConcepts'] = [];
  for (const conceptId of config.mastery.requiredConcepts) {
    const spec = config.concepts.find((c) => c.id === conceptId);
    const bucket = perConcept.get(conceptId) || { correct: 0, attempts: 0 };
    if (bucket.correct < minCorrect) {
      unmetConcepts.push({
        conceptId,
        label: spec?.label || conceptId,
        correct: bucket.correct,
        required: minCorrect,
        reason: bucket.attempts === 0 ? 'no-evidence' : 'not-enough-correct',
      });
    }
  }

  const accuracy = scopedAttempts > 0 ? scopedCorrect / scopedAttempts : 0;
  const mastered =
    unmetConcepts.length === 0 &&
    (config.mastery.requireEvidenceForAll === false || scopedAttempts > 0) &&
    accuracy >= minAccuracy;

  return {
    mastered,
    unmetConcepts,
    accuracy,
    requiredConcepts: [...config.mastery.requiredConcepts],
  };
}

/**
 * Progression rule: can the learner move on from this activity?
 * A concept only advances once its prerequisites are mastered.
 */
export function canProgressTo(
  config: AdaptiveLessonConfig,
  conceptId: string,
  responses: LearnerResponseSummary[],
): boolean {
  const { mastered } = evaluateMasteryForConcept(config, conceptId, responses);
  if (!mastered) return false;
  const spec = config.concepts.find((c) => c.id === conceptId);
  if (!spec) return true;
  return spec.prerequisites.every((prereq) => {
    const prereqResult = evaluateMasteryForConcept(config, prereq, responses);
    return prereqResult.mastered;
  });
}

export function evaluateMasteryForConcept(
  config: AdaptiveLessonConfig,
  conceptId: string,
  responses: LearnerResponseSummary[],
): { mastered: boolean; correct: number; required: number } {
  const required = config.mastery.minCorrectPerConcept ?? 1;
  const conceptOf = new Map<string, string>();
  for (const activity of config.activities) conceptOf.set(activity.activityId, activity.conceptId);
  const correct = responses.filter(
    (r) => r.correct && conceptOf.get(r.activityId) === conceptId,
  ).length;
  return { mastered: correct >= required, correct, required };
}

/** All registered activity ids for a lesson, in declaration order. */
export function getActivityIds(config: AdaptiveLessonConfig): string[] {
  return config.activities.map((a) => a.activityId);
}