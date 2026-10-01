/**
 * Lesson 2 — Ordering & Rounding (KICD Grade 4, SLO 1.1-d and 1.1-e).
 *
 *   ARIZEN-INT-1.1-d: order numbers up to 1,000 in different situations
 *   ARIZEN-INT-1.1-e: round off numbers up to 1,000 to the nearest ten in
 *                     different situations
 *
 * All activities, validators and misconception detectors are deterministic
 * application code. The questions mirror the quiz content in
 * src/data/grade4-math.ts (lesson "Ordering and Rounding").
 */

import type { AdaptiveLessonConfig } from './types';

const E = 0.9;

/** Deterministic: parse the comma-separated list a learner chose. */
function parseOrderedList(answer: string): number[] {
  return answer
    .split(',')
    .map((part) => Number(part.replace(/[^0-9]/g, '')))
    .filter((n) => !Number.isNaN(n));
}

export const ORDERING_ROUNDING_CONFIG: AdaptiveLessonConfig = {
  lessonSlug: 'ordering-rounding',
  lessonTitle: 'Ordering and Rounding',
  slugAliases: ['ordering-and-rounding'],
  curriculumKey: 'g4-math-ordering-rounding',
  grade: 4,
  strand: 'Numbers',
  subStrand: '1.1 Whole Numbers: Ordering and rounding off numbers up to 1,000',
  slos: [
    'ARIZEN-INT-1.1-d: order numbers up to 1,000 in different situations',
    'ARIZEN-INT-1.1-e: round off numbers up to 1,000 to the nearest ten in different situations',
  ],
  objectives: [
    'Order numbers up to 1,000 from smallest to largest',
    'Order numbers from largest to smallest',
    'Round numbers up to 1,000 to the nearest ten',
    'Use rounding to estimate in real-life situations',
  ],
  concepts: [
    {
      id: 'order-numbers',
      label: 'Order numbers by comparing place values',
      prerequisites: [],
      allowedRepresentations: ['number_line', 'digit_comparison'],
      masteryThreshold: E,
    },
    {
      id: 'order-direction',
      label: 'Order in the direction the question asks for',
      prerequisites: ['order-numbers'],
      allowedRepresentations: ['number_line'],
      masteryThreshold: E,
    },
    {
      id: 'round-to-ten',
      label: 'Round off to the nearest ten',
      prerequisites: ['order-numbers'],
      allowedRepresentations: ['number_line', 'place_value_chart'],
      masteryThreshold: E,
    },
  ],
  misconceptions: [
    {
      id: 'ordering-by-ones-digit',
      label: 'Orders by the ones digit only',
      description: 'Compares only the last digit and ignores the hundreds and tens places',
      indicators: ['orders 298 first because it ends in 8', 'sorts by last digit'],
      remediation: {
        title: 'Start With the Biggest Place',
        explanation:
          'When you order numbers you must start at the BIGGEST place — the hundreds — not the ones. ' +
          'Two numbers are compared from the left: the first place where the digits differ decides. ' +
          'Work left to right through the hundreds, then the tens, then the ones.',
        owlText: 'Biggest place first! The hundreds decide before the ones ever matter.',
        hint: 'Compare the hundreds digit first, then the tens, then the ones.',
        incorrectFeedback:
          'Look at the hundreds column of each number before you look at anything else.',
      },
    },
    {
      id: 'ordering-direction-reversed',
      label: 'Orders in the opposite direction',
      description: 'Gives smallest-to-largest when the question asked for largest-to-smallest, or the reverse',
      indicators: ['descending question answered ascending', 'reverse sequence given'],
      remediation: {
        title: 'Which Direction Did We Want?',
        explanation:
          'Ordering has two directions. If the question asks for the LARGEST first, the biggest number ' +
          'must come first — like lining up from the front of a queue to the back. If it asks for the ' +
          'SMALLEST first, the smallest number comes first.',
        owlText: 'Read the instruction word: "smallest to largest" or "largest to smallest".',
        hint: 'Check the direction the question asked for before you write your answer.',
      },
    },
    {
      id: 'rounding-always-up',
      label: 'Always rounds up',
      description: 'Adds one to the tens digit regardless of the ones digit',
      indicators: ['462 rounded to 470', 'rounds up even when ones digit is below 5'],
      remediation: {
        title: 'Look at the Ones Digit',
        explanation:
          'Rounding to the nearest ten depends ONLY on the ones digit. ' +
          'If the ones digit is 0, 1, 2, 3 or 4, keep the tens digit and make the ones 0 — we round DOWN. ' +
          'If the ones digit is 5, 6, 7, 8 or 9, add one to the tens digit and make the ones 0 — we round UP. ' +
          'Half the numbers round down.',
        owlText: 'Ones digit 0–4 → round down. Ones digit 5–9 → round up.',
        hint: 'The ones digit decides: 0–4 rounds down, 5–9 rounds up.',
        incorrectFeedback: 'Look only at the ones digit, then decide down or up.',
      },
    },
    {
      id: 'rounding-keeps-ones',
      label: 'Keeps the ones digit when rounding',
      description: 'Produces the original number or one that still has a ones digit',
      indicators: ['384 stays 384', 'rounded number still ends in a non-zero digit'],
      remediation: {
        title: 'Rounding Ends in Zero',
        explanation:
          'A number rounded to the nearest ten always ENDS IN ZERO. After rounding, the ones place is ' +
          'emptied and filled with 0. Round the number first, then check that your answer ends in 0.',
        owlText: 'Nearest ten means the answer ends in 0. Always.',
        hint: 'After rounding to the nearest ten, your answer must end in 0.',
      },
    },
  ],
  activities: [
    {
      activityId: 'think_first',
      conceptId: 'order-numbers',
      slo: 'ARIZEN-INT-1.1-d',
      prompt: 'Order these numbers from SMALLEST to LARGEST: 345, 521, 298, 476',
      choices: [
        '298, 345, 476, 521',
        '345, 298, 476, 521',
        '521, 476, 345, 298',
        '298, 476, 345, 521',
      ],
      correctAnswer: '298, 345, 476, 521',
      explanation:
        'Compare the hundreds digit: 298 has 2 hundreds, 345 has 3, 476 has 4, 521 has 5. So the order is 298, 345, 476, 521.',
      hint: 'Compare the hundreds digit of each number first.',
      detectMisconception: (selected) => {
        const chosen = parseOrderedList(selected);
        const correct = [298, 345, 476, 521];
        if (chosen.length !== correct.length) return 'ordering-by-ones-digit';
        // A reversed correct set means the direction was flipped.
        if (chosen.join(',') === [...correct].reverse().join(',')) return 'ordering-direction-reversed';
        // Same set but out of order → check whether the ones digit drove the sort.
        if (new Set(chosen).size === new Set(correct).size && correct.every((n) => chosen.includes(n))) {
          const byOnes = [...correct].sort((a, b) => (a % 10) - (b % 10));
          if (chosen.join(',') === byOnes.join(',')) return 'ordering-by-ones-digit';
          return 'ordering-direction-reversed';
        }
        return 'ordering-by-ones-digit';
      },
    },
    {
      activityId: 'connect',
      conceptId: 'round-to-ten',
      slo: 'ARIZEN-INT-1.1-e',
      prompt: 'A shop has 462 oranges. About how many oranges is that, rounded to the nearest ten?',
      choices: ['460', '470', '462', '400'],
      correctAnswer: '460',
      explanation:
        '462 has ones digit 2. Since 2 is less than 5 we round DOWN: keep the tens digit 6 and make the ones 0 → 460.',
      hint: 'The ones digit of 462 is 2. Is that more or less than 5?',
      detectMisconception: (selected) => {
        const sel = selected.replace(/[^0-9]/g, '');
        if (sel === '470') return 'rounding-always-up';
        if (sel === '462') return 'rounding-keeps-ones';
        if (sel === '400') return 'rounding-always-up';
        return 'rounding-keeps-ones';
      },
    },
    {
      activityId: 'p1',
      conceptId: 'round-to-ten',
      slo: 'ARIZEN-INT-1.1-e',
      prompt: 'Round 384 to the nearest ten.',
      choices: ['380', '390', '384', '385'],
      correctAnswer: '380',
      explanation: '384 has ones digit 4. Since 4 is less than 5 we round DOWN → 380.',
      hint: 'Ones digit 4 is less than 5, so round down.',
      detectMisconception: (selected) => {
        const sel = selected.replace(/[^0-9]/g, '');
        if (sel === '390' || sel === '385') return 'rounding-always-up';
        if (sel === '384') return 'rounding-keeps-ones';
        return 'rounding-keeps-ones';
      },
    },
    {
      activityId: 'p2',
      conceptId: 'order-direction',
      slo: 'ARIZEN-INT-1.1-d',
      prompt: 'Order these numbers from LARGEST to SMALLEST: 528, 316, 804, 199',
      choices: ['804, 528, 316, 199', '199, 316, 528, 804', '804, 316, 528, 199', '528, 804, 316, 199'],
      correctAnswer: '804, 528, 316, 199',
      explanation:
        'Compare hundreds digits: 804 (8), 528 (5), 316 (3), 199 (1). Largest first gives 804, 528, 316, 199.',
      hint: 'The question asked for LARGEST first. Compare the hundreds digits.',
      detectMisconception: (selected) => {
        const chosen = parseOrderedList(selected);
        if (chosen.join(',') === '199,316,528,804') return 'ordering-direction-reversed';
        return 'ordering-direction-reversed';
      },
    },
    {
      activityId: 'p3',
      conceptId: 'round-to-ten',
      slo: 'ARIZEN-INT-1.1-e',
      prompt: 'Round 855 to the nearest ten.',
      choices: ['860', '850', '855', '865'],
      correctAnswer: '860',
      explanation: '855 has ones digit 5. Since 5 or more we round UP: 85 becomes 86 → 860.',
      hint: 'Ones digit 5 is 5 or more, so round up.',
      detectMisconception: (selected) => {
        const sel = selected.replace(/[^0-9]/g, '');
        if (sel === '850' || sel === '855') return 'rounding-keeps-ones';
        if (sel === '865') return 'rounding-keeps-ones';
        return 'rounding-always-up';
      },
    },
    {
      activityId: 'quick_check',
      conceptId: 'round-to-ten',
      slo: 'ARIZEN-INT-1.1-e',
      prompt: 'A school has 4,237 learners. About how many learners is that, to the nearest ten?',
      choices: ['4,240', '4,230', '4,237', '4,200'],
      correctAnswer: '4,240',
      explanation:
        '4,237 has ones digit 7. Since 7 is 5 or more we round UP: 4,230 becomes 4,240. Rounding is how we estimate a crowd quickly.',
      hint: 'Ones digit 7 is 5 or more, so round up.',
      detectMisconception: (selected) => {
        const sel = selected.replace(/[^0-9]/g, '');
        if (sel === '4230' || sel === '4200') return 'rounding-keeps-ones';
        if (sel === '4237') return 'rounding-keeps-ones';
        return 'rounding-always-up';
      },
    },
  ],
  mastery: {
    requiredConcepts: ['order-numbers', 'round-to-ten'],
    minCorrectPerConcept: 1,
    minAccuracy: 0.6,
    requireEvidenceForAll: true,
  },
  celebration: {
    headline: 'You are a Number Ordering Pro!',
    praise:
      'You can order numbers up to 1,000 in any direction and round them to the nearest ten to estimate quickly.',
    badge: 'Ordering & Rounding Pro Badge',
    recap: [
      'Order 298, 345, 476, 521 by comparing hundreds digits',
      'Round 384 down to 380 and 855 up to 860',
      'Use the ones digit to decide round up or round down',
      'Estimate a crowd with rounding to the nearest ten',
    ],
  },
  journeyBuilder: 'generated',
  remediationStrategy: 'config-driven',
};