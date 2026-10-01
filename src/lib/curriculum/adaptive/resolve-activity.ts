/**
 * Resolve an activity the learner just answered into a ResolvedActivity.
 *
 * The learner-facing question comes from the journey step being rendered (the
 * options the UI actually showed); the concept, validator and misconception
 * detectors come from the lesson's AdaptiveLessonConfig. Correctness is
 * therefore decided by deterministic application code on the server, not by
 * anything the client asserts and never by an LLM.
 */

import type { AdaptiveLessonConfig } from './types';
import type { ResolvedActivity } from './engine';
import {
  buildRemediationStep,
  detectActivityMisconception,
  validateActivity,
} from './engine';

export interface RuntimeActivityInput {
  activityId: string;
  /** Options the UI actually presented. */
  options: string[];
  /** The prompt the UI actually presented. */
  prompt?: string;
  /** The correct answer the journey step declares, if any. */
  expectedAnswer?: string;
  /** Step-declared correctChoiceId / correctIndex (used to derive expected). */
  correctChoiceId?: string;
  correctIndex?: number;
}

export interface ResolveActivityResult {
  activity: ResolvedActivity | null;
  /** True when the activity is declared by the lesson config. */
  declared: boolean;
}

function findExpected(input: RuntimeActivityInput, choices: string[]): string {
  if (input.expectedAnswer) return input.expectedAnswer;
  if (input.correctChoiceId != null) {
    const byId = choices.find(
      (c, i) => String.fromCharCode(65 + i) === input.correctChoiceId || String(i) === input.correctChoiceId,
    );
    if (byId) return byId;
  }
  if (input.correctIndex != null && choices[input.correctIndex] !== undefined) {
    return choices[input.correctIndex];
  }
  return '';
}

/**
 * Resolve the activity for a lesson.
 *
 * The config spec supplies concept, validator, misconception detectors and the
 * lesson's expected answer. Runtime choices/prompt take precedence when the
 * journey renders a different wording of the same activity.
 */
export function resolveActivityFromJourney(
  config: AdaptiveLessonConfig,
  input: RuntimeActivityInput,
): ResolveActivityResult {
  const spec = config.activities.find((a) => a.activityId === input.activityId);
  if (!spec) return { activity: null, declared: false };

  const choices = input.options.length > 0 ? input.options : spec.choices || [];
  const correctAnswer =
    findExpected(input, choices) || spec.correctAnswer || '';

  const activity: ResolvedActivity = {
    activityId: spec.activityId,
    conceptId: spec.conceptId,
    prompt: input.prompt || spec.prompt || '',
    choices,
    correctAnswer,
    explanation: spec.explanation || '',
    hint: spec.hint || '',
    slo: spec.slo,
    spec,
  };

  return { activity, declared: true };
}

/**
 * Resolve the concept for an activity id declared by the lesson config.
 * Returns undefined when the activity is not part of this lesson's config —
 * deliberately never a hardcoded fallback concept.
 */
export function resolveConfigConceptId(
  config: AdaptiveLessonConfig,
  activityId: string,
): string | undefined {
  return config.activities.find((a) => a.activityId === activityId)?.conceptId;
}

export { buildRemediationStep, detectActivityMisconception, validateActivity };