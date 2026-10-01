/**
 * Lesson 3 — Factors, Multiples, Even & Odd Numbers (KICD Grade 4, SLO 1.1-f/g/h).
 *
 *   ARIZEN-INT-1.1-f: identify factors of numbers up to 50 in different contexts
 *   ARIZEN-INT-1.1-g: identify multiples of numbers up to 100 in different situations
 *   ARIZEN-INT-1.1-h: use even and odd numbers up to 100 in different situations
 *
 * Questions mirror the quiz content in src/data/grade4-math.ts (lesson
 * "Factors, Multiples and Even/Odd Numbers").
 */

import type { AdaptiveLessonConfig } from './types';

const E = 0.9;

function toInt(answer: string): number {
  const m = answer.replace(/[^0-9-]/g, '');
  return m ? parseInt(m, 10) : Number.NaN;
}

/** Deterministic: is `n` an exact multiple of `k`? */
export function isMultipleOf(n: number, k: number): boolean {
  return k !== 0 && n % k === 0;
}

export const FACTORS_MULTIPLES_CONFIG: AdaptiveLessonConfig = {
  lessonSlug: 'factors-multiples-even-odd',
  lessonTitle: 'Factors, Multiples and Even/Odd Numbers',
  // The database stores this lesson as `factors-multiples`; the curriculum
  // source uses the longer form. Both resolve to this config.
  slugAliases: ['factors-multiples'],
  curriculumKey: 'g4-math-factors-multiples',
  grade: 4,
  strand: 'Numbers',
  subStrand: '1.1 Whole Numbers: Factors, multiples, and even/odd numbers up to 1,000',
  slos: [
    'ARIZEN-INT-1.1-f: identify factors of numbers up to 50 in different contexts',
    'ARIZEN-INT-1.1-g: identify multiples of numbers up to 100 in different situations',
    'ARIZEN-INT-1.1-h: use even and odd numbers up to 100 in different situations',
  ],
  objectives: [
    'Identify the factors of a number',
    'List the first multiples of a number',
    'Recognise even and odd numbers',
    'Use factors, multiples and parity in real-life situations',
  ],
  concepts: [
    {
      id: 'identify-factors',
      label: 'Identify factors of a number',
      prerequisites: [],
      allowedRepresentations: ['grouped_objects', 'counters'],
      masteryThreshold: E,
    },
    {
      id: 'identify-multiples',
      label: 'Identify multiples of a number',
      prerequisites: ['identify-factors'],
      allowedRepresentations: ['number_line'],
      masteryThreshold: E,
    },
    {
      id: 'even-and-odd',
      label: 'Use even and odd numbers',
      prerequisites: [],
      allowedRepresentations: ['grouped_objects', 'counters'],
      masteryThreshold: E,
    },
  ],
  misconceptions: [
    {
      id: 'factor-multiple-confusion',
      label: 'Confuses factors with multiples',
      description: 'Treats the multiples of a number as its factors, or vice versa',
      indicators: ['lists multiples when asked for factors', 'calls 5, 10, 15 factors of 15'],
      remediation: {
        title: 'Factors or Multiples?',
        explanation:
          'FACTORS go INSIDE the number: they are the numbers that divide it exactly. ' +
          'The factors of 15 are the numbers it can be split into — 1, 3, 5 and 15. ' +
          'MULTIPLES are made BY the number: keep adding the number to itself — 5, 10, 15, 20. ' +
          'Ask yourself: am I splitting the number up, or building it up?',
        owlText: 'Factors split a number up. Multiples build a number up.',
        hint: 'Factors divide exactly into the number. Multiples are made by counting in that number.',
        incorrectFeedback: 'Are you splitting the number up (factors) or building it up (multiples)?',
      },
    },
    {
      id: 'incomplete-factor-list',
      label: 'Incomplete factor list',
      description: 'Misses 1, misses the number itself, or omits one of a factor pair',
      indicators: ['factors of 18 given as 2, 3, 6', 'factors of 18 missing 9 or 18'],
      remediation: {
        title: 'Every Number Has Two Factors',
        explanation:
          'Every number has at least two factors: 1 and the number itself. When you test a factor, you ' +
          'must also count its partner. If 2 divides 18, then 9 does too. Work through 1, 2, 3 and up, ' +
          'writing each partner as you go, so no pair gets missed.',
        owlText: '1 and the number itself are always factors. Then remember every partner.',
        hint: 'Check 1 and the number itself first, then add every matching pair.',
      },
    },
    {
      id: 'remainder-ignored',
      label: 'Ignores the remainder when checking multiples',
      description: 'Treats a number as a multiple even when the division leaves something over',
      indicators: ['50 treated as a multiple of 6', 'calls 45 a multiple of 7'],
      remediation: {
        title: 'Check for a Remainder',
        explanation:
          'A number is a multiple ONLY when it divides exactly, with NOTHING left over. ' +
          'Divide 50 by 6: you get 8 with 2 left over, so 50 is NOT a multiple of 6. ' +
          'Divide 48 by 6: you get exactly 8, nothing left over, so 48 IS a multiple of 6.',
        owlText: 'No remainder means it is a multiple. Any leftover means it is not.',
        hint: 'Divide the number by the one you are testing and check that nothing is left over.',
        incorrectFeedback: 'Do the division and look for a remainder before you decide.',
      },
    },
    {
      id: 'odd-even-confusion',
      label: 'Confuses even and odd numbers',
      description: 'Chooses the wrong parity, or judges the whole number instead of the ones digit',
      indicators: ['calls 97 even', 'rules out 24 because it has an odd digit inside it'],
      remediation: {
        title: 'Only the Last Digit Matters',
        explanation:
          'You do not need to test every digit. Look ONLY at the ONES digit: if it ends in 0, 2, 4, 6 ' +
          'or 8 the number is EVEN; if it ends in 1, 3, 5, 7 or 9 it is ODD. 97 ends in 7, so it is odd. ' +
          '24 ends in 4, so it is even — the 2 inside it does not matter.',
        owlText: 'Look at just the last digit: 0, 2, 4, 6, 8 = even. 1, 3, 5, 7, 9 = odd.',
        hint: 'Check the ones digit only. What digit does the number end in?',
      },
    },
    {
      id: 'incomplete-multiple-sequence',
      label: 'Incomplete or skipped multiple sequence',
      description: 'Misses a multiple, starts at the wrong number, or repeats one',
      indicators: ['first five multiples of 6 given as 6, 12, 24, 30, 36', 'sequence starts at 12'],
      remediation: {
        title: 'Count in Multiples',
        explanation:
          'Multiples of a number start with the number itself and keep adding the same number. ' +
          'Count in sixes from the very start: the first multiple is 6, not 12. Count them one at a ' +
          'time and check you have not skipped any.',
        owlText: 'Start with the number itself, then add the same number each time.',
        hint: 'Start with the number itself and count up in equal steps, counting each one.',
      },
    },
  ],
  activities: [
    {
      activityId: 'think_first',
      conceptId: 'identify-factors',
      slo: 'ARIZEN-INT-1.1-f',
      prompt: 'Which of these is a FACTOR of 24?',
      choices: ['7', '9', '8', '13'],
      correctAnswer: '8',
      explanation: '8 × 3 = 24, so 8 divides 24 exactly and is a factor of 24.',
      hint: 'Test each number: does it divide 24 with nothing left over?',
      detectMisconception: (selected) => {
        const n = toInt(selected);
        return isMultipleOf(24, n) && n !== 8 ? 'incomplete-factor-list' : 'factor-multiple-confusion';
      },
    },
    {
      activityId: 'connect',
      conceptId: 'even-and-odd',
      slo: 'ARIZEN-INT-1.1-h',
      prompt:
        'A farmer has 18 chairs and wants to put them in equal rows with none left over. Which number of rows works?',
      choices: ['3', '5', '7', '9'],
      correctAnswer: '3',
      explanation:
        'Rows must be factors of 18. 18 ÷ 3 = 6 rows of 3 chairs with nothing left over, so 3 works.',
      hint: 'The number of rows must divide 18 exactly — look for a factor of 18.',
      validate: (selected) => {
        const rows = toInt(selected);
        return !Number.isNaN(rows) && isMultipleOf(18, rows);
      },
      detectMisconception: (selected) => {
        const rows = toInt(selected);
        if (rows === 3) return null;
        if (rows === 5 || rows === 7) return 'factor-multiple-confusion';
        return 'incomplete-factor-list';
      },
    },
    {
      activityId: 'p1',
      conceptId: 'even-and-odd',
      slo: 'ARIZEN-INT-1.1-h',
      prompt: 'Which number is ODD?',
      choices: ['42', '68', '97', '24'],
      correctAnswer: '97',
      explanation: '97 ends in 7. Digits 1, 3, 5, 7 and 9 at the end make a number odd.',
      hint: 'Look at the ones digit of each number. Which one ends in 1, 3, 5, 7 or 9?',
      detectMisconception: (selected) => {
        const n = toInt(selected);
        if (Number.isNaN(n)) return 'odd-even-confusion';
        if (n % 2 === 1) return null;
        return 'odd-even-confusion';
      },
    },
    {
      activityId: 'p2',
      conceptId: 'identify-factors',
      slo: 'ARIZEN-INT-1.1-f',
      prompt: 'What are the factors of 18?',
      choices: [
        '1, 2, 3, 6, 9, 18',
        '1, 2, 6, 9',
        '2, 3, 6, 9',
        '1, 3, 6, 18',
      ],
      correctAnswer: '1, 2, 3, 6, 9, 18',
      explanation:
        '18 ÷ 1, 2, 3, 6, 9 and 18 all give whole numbers with nothing left over, so these are all the factors of 18.',
      hint: 'Start with 1, then 2, then 3 — and remember each partner (2 pairs with 9, 3 pairs with 6).',
      detectMisconception: (selected) => {
        const parts = selected.split(',').map((p) => toInt(p)).filter((n) => !Number.isNaN(n));
        const correct = [1, 2, 3, 6, 9, 18];
        if (parts.length === 0) return 'factor-multiple-confusion';
        const hasOne = parts.includes(1);
        const hasSelf = parts.includes(18);
        if (parts.every((n) => isMultipleOf(18, n))) {
          if (!hasOne || !hasSelf || parts.length < correct.length) return 'incomplete-factor-list';
          return 'incomplete-factor-list';
        }
        return 'factor-multiple-confusion';
      },
    },
    {
      activityId: 'p3',
      conceptId: 'identify-multiples',
      slo: 'ARIZEN-INT-1.1-g',
      prompt: 'What are the first 5 multiples of 6?',
      choices: [
        '6, 12, 18, 24, 30',
        '6, 12, 18, 24, 36',
        '12, 18, 24, 30, 36',
        '6, 18, 24, 30, 36',
      ],
      correctAnswer: '6, 12, 18, 24, 30',
      explanation:
        'Count in sixes from the start: 6 × 1 = 6, 6 × 2 = 12, 6 × 3 = 18, 6 × 4 = 24, 6 × 5 = 30.',
      hint: 'Start at 6 and add 6 each time: 6, 12, 18 …',
      detectMisconception: (selected) => {
        const parts = selected.split(',').map((p) => toInt(p)).filter((n) => !Number.isNaN(n));
        if (parts.length === 0) return 'incomplete-multiple-sequence';
        if (parts[0] !== 6) return 'incomplete-multiple-sequence';
        const allMultiples = parts.every((n) => isMultipleOf(n, 6));
        if (!allMultiples) return 'remainder-ignored';
        return 'incomplete-multiple-sequence';
      },
    },
    {
      activityId: 'quick_check',
      conceptId: 'identify-multiples',
      slo: 'ARIZEN-INT-1.1-g',
      prompt: 'A bus arrives every 15 minutes. Will a bus arrive exactly 50 minutes past the hour?',
      choices: ['Yes', 'No'],
      correctAnswer: 'No',
      explanation:
        '50 ÷ 15 = 3 with 2 minutes left over, so 50 is NOT a multiple of 15. No bus arrives then.',
      hint: 'Divide 50 by 15 and check whether anything is left over.',
      detectMisconception: (selected) =>
        selected.toLowerCase().includes('yes') ? 'remainder-ignored' : null,
    },
  ],
  mastery: {
    requiredConcepts: ['identify-factors', 'identify-multiples', 'even-and-odd'],
    minCorrectPerConcept: 1,
    minAccuracy: 0.6,
    requireEvidenceForAll: true,
  },
  celebration: {
    headline: 'You are a Factors and Multiples Pro!',
    praise:
      'You can find the factors of a number, count out its multiples, and spot even and odd numbers anywhere.',
    badge: 'Factors & Multiples Pro Badge',
    recap: [
      'Find the factors of 18: 1, 2, 3, 6, 9, 18',
      'Count the first five multiples of 6',
      'Use only the ones digit to name a number even or odd',
      'Check for a remainder before calling something a multiple',
    ],
  },
  journeyBuilder: 'generated',
  remediationStrategy: 'config-driven',
};