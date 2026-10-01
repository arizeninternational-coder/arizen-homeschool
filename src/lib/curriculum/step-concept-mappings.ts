import type { AdaptiveLessonConfig } from './adaptive/types';

/**
 * Step-to-concept mappings for adaptive learning.
 * 
 * Each scored activity maps to a concept and misconception detection logic.
 * This extends the existing adaptive architecture to all 6 scored activities.
 */

export interface StepConceptMapping {
  stepId: string;           // Journey step ID (e.g., 'think_first', 'connect', 'p1', 'p2', 'p3', 'quick_check')
  conceptId: string;        // Concept being assessed
  expectedAnswer: string;   // The correct answer
  misconceptionCheck: (selected: string, expected: string) => string | null;
}

export const STEP_CONCEPT_MAPPINGS: StepConceptMapping[] = [
  {
    stepId: 'think_first',
    conceptId: 'digit-value',
    expectedAnswer: '7 hundreds',
    misconceptionCheck: (selected, expected) => {
      const sel = selected.toLowerCase();
      const exp = expected.toLowerCase();
      if (sel.includes('ones') && !exp.includes('ones')) return 'digit-not-value';
      if (sel.includes('7') && !sel.includes('hundreds') && !sel.includes('tens') && !sel.includes('thousands')) return 'digit-not-value';
      const places = ['ones', 'tens', 'hundreds', 'thousands'];
      const selPlace = places.find(p => sel.includes(p));
      const expPlace = places.find(p => exp.includes(p));
      if (selPlace && expPlace && selPlace !== expPlace) return 'position-confusion';
      return null;
    },
  },
  {
    stepId: 'connect',
    conceptId: 'digit-value',
    expectedAnswer: '3,000 people',
    misconceptionCheck: (selected, expected) => {
      const sel = selected.toLowerCase();
      const exp = expected.toLowerCase();
      if (sel.includes('3 people') || sel.includes('30 people') || sel.includes('300 people')) return 'digit-not-value';
      const places = ['ones', 'tens', 'hundreds', 'thousands'];
      const selPlace = places.find(p => sel.includes(p));
      const expPlace = places.find(p => exp.includes(p));
      if (selPlace && expPlace && selPlace !== expPlace) return 'position-confusion';
      return null;
    },
  },
  {
    stepId: 'p1',
    conceptId: 'expanded-form',
    expectedAnswer: '2,538',
    misconceptionCheck: (selected, expected) => {
      const sel = selected.toLowerCase();
      const exp = expected.toLowerCase();
      // Confused thousands with hundreds
      if (sel.includes('5,238')) return 'position-confusion';
      // Reversed digits
      if (sel.includes('2,358') || sel.includes('2,583')) return 'left-right-reverse';
      return null;
    },
  },
  {
    stepId: 'p2',
    conceptId: 'expanded-form',
    expectedAnswer: '1,547',
    misconceptionCheck: (selected, expected) => {
      const sel = selected.toLowerCase();
      const exp = expected.toLowerCase();
      // Added incorrectly (1,247 = forgot to add 300)
      if (sel.includes('1,247')) return 'expanded-form-skip';
      // Wrong addition (1,347)
      if (sel.includes('1,347')) return 'expanded-form-skip';
      return null;
    },
  },
  {
    stepId: 'p3',
    conceptId: 'compare-order',
    expectedAnswer: '5,621',
    misconceptionCheck: (selected, expected) => {
      const sel = selected.toLowerCase();
      // Chose the smaller number
      if (sel.includes('5,261')) return 'comparison-reverse';
      // Said they're equal
      if (sel.includes('equal')) return 'comparison-equal';
      return null;
    },
  },
  {
    stepId: 'quick_check',
    conceptId: 'read-numbers',
    expectedAnswer: '3,042',
    misconceptionCheck: (selected, expected) => {
      if (selected.toLowerCase() !== expected.toLowerCase()) return 'read-numbers';
      return null;
    },
  },
];

/**
 * Resolve the concept for an activity.
 *
 * When the lesson supplies its registered AdaptiveLessonConfig, the config is
 * authoritative (it declares every activity of that lesson). The legacy table
 * below remains only as the fallback for unregistered lessons, and it is the
 * Place Value mapping that predates the config layer.
 */
export function getStepConceptMapping(
  stepId: string,
  config?: AdaptiveLessonConfig | null,
): StepConceptMapping | undefined {
  if (!stepId) return undefined;

  if (config) {
    const activity = config.activities.find((a) => a.activityId === stepId);
    if (!activity) return undefined;
    return {
      stepId,
      conceptId: activity.conceptId,
      expectedAnswer: activity.correctAnswer || '',
      misconceptionCheck: (selected, expected) =>
        activity.detectMisconception?.(selected, expected, {
          prompt: activity.prompt || '',
          choices: activity.choices || [],
          activityId: stepId,
          attemptNumber: 1,
        }) || null,
    };
  }

  return STEP_CONCEPT_MAPPINGS.find(m => m.stepId === stepId);
}

export function getAllScoredStepIds(): string[] {
  return STEP_CONCEPT_MAPPINGS.map(m => m.stepId);
}

/**
 * Resolve the concept for a remediation step.
 *
 * Single source of truth for concept resolution. Callers must NOT hardcode
 * concept ids as a fallback — the taxonomy belongs to STEP_CONCEPT_MAPPINGS
 * and to the conceptId the orchestrator already stamped on the step.
 *
 * Resolution order:
 *  1. The conceptId carried by the step itself (set by the action adapter
 *     from the validated PedagogicalAction).
 *  2. The canonical mapping for the activity being remediated.
 *  3. undefined — deliberately NOT a hardcoded concept. Returning undefined
 *     lets the caller omit the field rather than mislabel the evidence.
 */
export function resolveRemediationConceptId(params: {
  stepConceptId?: string | null;
  targetActivityId?: string | null;
  stepId?: string | null;
  lessonConfig?: AdaptiveLessonConfig | null;
}): string | undefined {
  const explicit = params.stepConceptId?.trim();
  if (explicit) return explicit;

  for (const candidate of [params.targetActivityId, params.stepId]) {
    const mapped = candidate
      ? getStepConceptMapping(candidate, params.lessonConfig)?.conceptId
      : undefined;
    if (mapped) return mapped;
  }

  return undefined;
}
