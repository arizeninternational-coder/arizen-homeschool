/**
 * Lesson 5 — Roman Numerals (KICD Grade 4, SLO 1.1-j).
 *
 *   ARIZEN-INT-1.1-j: represent Hindu Arabic numerals using Roman numerals up
 *                      to 'X' in different situations
 *
 * Questions mirror the quiz content in src/data/grade4-math.ts (lesson
 * "Roman Numerals").
 */

import type { AdaptiveLessonConfig } from './types';

const E = 0.9;

/**
 * Deterministic Roman numeral rules (the application code is the authority,
 * never an LLM):
 *   I = 1, V = 5, X = 10
 *   a smaller numeral BEFORE a bigger one is subtracted
 *   a smaller numeral AFTER a bigger one is added
 *   never more than three of the same numeral in a row
 */
export function romanToArabic(roman: string): number | null {
  const SYMBOLS: Record<string, number> = { I: 1, V: 5, X: 10 };
  const s = String(roman || '').trim().toUpperCase();
  if (!s || !/^[IVX]+$/.test(s)) return null;
  let total = 0;
  for (let i = 0; i < s.length; i++) {
    const current = SYMBOLS[s[i]];
    const next = i + 1 < s.length ? SYMBOLS[s[i + 1]] : 0;
    total += next > current ? -current : current;
  }
  return total;
}

export function arabicToRoman(n: number): string | null {
  if (!Number.isInteger(n) || n < 1 || n > 10) return null;
  const ONES = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  return ONES[n];
}

function isRomanNumeral(answer: string): boolean {
  return /^[IVXivx]+$/.test(answer.trim());
}

export const ROMAN_NUMERALS_CONFIG: AdaptiveLessonConfig = {
  lessonSlug: 'roman-numerals',
  lessonTitle: 'Roman Numerals',
  slugAliases: ['roman-numeral'],
  curriculumKey: 'g4-math-roman-numerals',
  grade: 4,
  strand: 'Numbers',
  subStrand: '1.1 Whole Numbers: Representing Hindu Arabic numerals using Roman numerals up to X',
  slos: [
    "ARIZEN-INT-1.1-j: represent Hindu Arabic numerals using Roman numerals up to 'X' in different situations",
  ],
  objectives: [
    'Know that I = 1, V = 5 and X = 10',
    'Write a number up to X in Roman numerals',
    'Read a Roman numeral up to X back into digits',
    'Use the subtraction and no-repeating rules correctly',
  ],
  concepts: [
    {
      id: 'roman-symbol-values',
      label: 'Know the Roman symbol values I, V and X',
      prerequisites: [],
      allowedRepresentations: ['recap_checklist'],
      masteryThreshold: E,
    },
    {
      id: 'roman-write',
      label: 'Write a number up to X in Roman numerals',
      prerequisites: ['roman-symbol-values'],
      allowedRepresentations: [],
      masteryThreshold: E,
    },
    {
      id: 'roman-read',
      label: 'Read a Roman numeral up to X into digits',
      prerequisites: ['roman-symbol-values'],
      allowedRepresentations: ['step_reveal'],
      masteryThreshold: E,
    },
    {
      id: 'roman-subtraction-rule',
      label: 'Apply the subtraction and no-repeating rules',
      prerequisites: ['roman-symbol-values'],
      allowedRepresentations: [],
      masteryThreshold: E,
    },
  ],
  misconceptions: [
    {
      id: 'additive-only',
      label: 'Writes Roman numerals by adding only',
      description: 'Never uses subtraction, so writes IIII for 4 and VIIII for 9',
      indicators: ['IIII given for 4', 'VIIII given for 9', 'no IV or IX produced'],
      remediation: {
        title: 'Small Before Big Means Subtract',
        explanation:
          'Roman numerals are not always just added together. When a SMALLER letter comes BEFORE a ' +
          'BIGGER one, you SUBTRACT: IV means 5 − 1 = 4, and IX means 10 − 1 = 9. That is also why we ' +
          'never write IIII for 4 — the rule allows at most three of the same letter in a row.',
        owlText: 'Smaller before bigger = subtract. IV = 5 − 1 = 4.',
        hint: 'Look for a small letter sitting immediately before a bigger one — that pair is subtracted.',
        incorrectFeedback: 'Is there a smaller letter before a bigger one? That pair is subtracted.',
      },
    },
    {
      id: 'symbol-confusion',
      label: 'Confuses the Roman symbol values',
      description: 'Mixes up the values of I, V and X when converting',
      indicators: ['X treated as 5', 'V treated as 10', 'symbol values swapped'],
      remediation: {
        title: 'I = 1, V = 5, X = 10',
        explanation:
          'Learn these three by heart: I is worth 1, V is worth 5, and X is worth 10. X is formed by ' +
          'two crossing V shapes. Once you know those three values, any Roman numeral up to X can be ' +
          'worked out letter by letter.',
        owlText: 'I = 1, V = 5, X = 10. Say it three times before you start.',
        hint: 'Write out I = 1, V = 5, X = 10 and use those values for every letter.',
      },
    },
    {
      id: 'reading-order-ignored',
      label: 'Reads a Roman numeral without checking letter order',
      description: 'Adds every letter without noticing that one is subtracted',
      indicators: ['IX read as 11', 'IV read as 6'],
      remediation: {
        title: 'Read Left to Right, Watch the Order',
        explanation:
          'Read the numeral from left to right and check each pair of neighbours. If the left letter is ' +
          'SMALLER than the letter beside it, that one is subtracted. In IX, I is smaller than the X ' +
          'that follows, so 10 − 1 = 9.',
        owlText: 'Smaller letter before a bigger one? Subtract it.',
        hint: 'Check each letter against the one immediately after it before you add anything.',
        incorrectFeedback: 'Compare each letter with the letter right after it before adding.',
      },
    },
    {
      id: 'too-many-repeats',
      label: 'Repeats a symbol too many times',
      description: 'Uses more than three of the same letter, or drops a needed letter',
      indicators: ['XXXX', 'IIIII', 'VV given for 10'],
      remediation: {
        title: 'Three Is the Maximum',
        explanation:
          'Never use more than three of the same letter in a row: 3 is III, never IIII. When you would ' +
          'need a fourth I, use the subtraction pair IV instead. And when the number reaches 10, write X ' +
          '— do not build it out of V symbols.',
        owlText: 'Three of the same letter is the limit. Four becomes IV.',
        hint: 'Count the letters you used. More than three of a kind needs the subtraction pair.',
      },
    },
  ],
  activities: [
    {
      activityId: 'think_first',
      conceptId: 'roman-write',
      slo: 'ARIZEN-INT-1.1-j',
      prompt: 'What is the Roman numeral for 4?',
      choices: ['IIII', 'IV', 'VI', 'IX'],
      correctAnswer: 'IV',
      explanation:
        '4 = IV, which is 5 − 1. We never write IIII because the rules allow at most three of the same letter.',
      hint: '4 is one less than 5. A small letter before V means subtract.',
      detectMisconception: (selected) => {
        const s = selected.trim().toUpperCase();
        if (s === 'IV') return null;
        if (s === 'IIII') return 'additive-only';
        if (s === 'VI') return 'additive-only';
        if (s === 'IX') return 'symbol-confusion';
        return 'additive-only';
      },
    },
    {
      activityId: 'connect',
      conceptId: 'roman-read',
      slo: 'ARIZEN-INT-1.1-j',
      prompt: 'A chapter in your book is numbered VII. Which chapter is it?',
      choices: ['7', '5', '12', '9'],
      correctAnswer: '7',
      explanation:
        'VII = V + I + I = 5 + 1 + 1 = 7. Both I letters come AFTER the V, so they are added.',
      hint: 'V = 5 and each I adds 1. How many I letters can you see?',
      detectMisconception: (selected) => {
        const s = selected.replace(/[^0-9]/g, '');
        if (s === '7') return null;
        if (s === '12') return 'reading-order-ignored';
        if (s === '5') return 'symbol-confusion';
        if (s === '9') return 'symbol-confusion';
        return 'symbol-confusion';
      },
    },
    {
      activityId: 'p1',
      conceptId: 'roman-read',
      slo: 'ARIZEN-INT-1.1-j',
      prompt: 'What number is IX?',
      choices: ['4', '5', '8', '9'],
      correctAnswer: '9',
      explanation:
        'In IX the I is smaller than the X that follows, so it is subtracted: 10 − 1 = 9.',
      hint: 'The I comes before the X. Does that add or subtract?',
      detectMisconception: (selected) => {
        const s = selected.replace(/[^0-9]/g, '');
        if (s === '9') return null;
        if (s === '4') return 'reading-order-ignored';
        if (s === '5' || s === '8') return 'symbol-confusion';
        return 'reading-order-ignored';
      },
    },
    {
      activityId: 'p2',
      conceptId: 'roman-write',
      slo: 'ARIZEN-INT-1.1-j',
      prompt: 'Write 7 in Roman numerals.',
      choices: ['VII', 'IV', 'IIIIII', 'X'],
      correctAnswer: 'VII',
      explanation:
        '7 = 5 + 1 + 1, which is V followed by two I letters: VII. Each I comes AFTER the V, so they add.',
      hint: '7 is five plus two ones. V then II.',
      validate: (selected) => {
        const v = romanToArabic(selected);
        return v === 7;
      },
      detectMisconception: (selected) => {
        const s = selected.trim().toUpperCase();
        const v = romanToArabic(s);
        if (v === 7) return null;
        if (v === 4) return 'reading-order-ignored';
        if (s === 'IIIIII') return 'too-many-repeats';
        if (s === 'X') return 'symbol-confusion';
        if (!isRomanNumeral(s)) return 'symbol-confusion';
        return 'too-many-repeats';
      },
    },
    {
      activityId: 'p3',
      conceptId: 'roman-subtraction-rule',
      slo: 'ARIZEN-INT-1.1-j',
      prompt: 'What is the Roman numeral for 9?',
      choices: ['IX', 'VIIII', 'VIV', 'X'],
      correctAnswer: 'IX',
      explanation:
        '9 = 10 − 1, which is written IX. VIIII is wrong because the rules allow at most three of the same letter in a row.',
      hint: '9 is one less than 10. A small letter before X means subtract.',
      detectMisconception: (selected) => {
        const s = selected.trim().toUpperCase();
        if (s === 'IX') return null;
        if (s === 'VIIII') return 'additive-only';
        if (s === 'VIV') return 'additive-only';
        if (s === 'X') return 'symbol-confusion';
        return 'additive-only';
      },
    },
    {
      activityId: 'quick_check',
      conceptId: 'roman-symbol-values',
      slo: 'ARIZEN-INT-1.1-j',
      prompt: 'Which Roman numeral equals 6?',
      choices: ['VI', 'IV', 'IX', 'IIII'],
      correctAnswer: 'VI',
      explanation:
        'VI = 5 + 1 = 6. The I comes AFTER the V here, so the letters are added rather than subtracted.',
      hint: '6 is five plus one. V first, then I.',
      detectMisconception: (selected) => {
        const v = romanToArabic(selected.trim());
        if (v === 6) return null;
        if (v === 4 || v === 9) return 'reading-order-ignored';
        if (v !== null) return 'additive-only';
        return 'symbol-confusion';
      },
    },
  ],
  mastery: {
    requiredConcepts: ['roman-symbol-values', 'roman-write', 'roman-read'],
    minCorrectPerConcept: 1,
    minAccuracy: 0.6,
    requireEvidenceForAll: true,
  },
  celebration: {
    headline: 'You are a Roman Numeral Expert!',
    praise:
      'You can write numbers up to X in Roman numerals and read them back, using the subtraction rule correctly.',
    badge: 'Roman Numeral Expert Badge',
    recap: [
      'Know that I = 1, V = 5 and X = 10',
      'Write 4 as IV using the subtraction rule',
      'Read IX as 9 by spotting the subtraction',
      'Never use more than three of the same letter',
    ],
  },
  journeyBuilder: 'generated',
  remediationStrategy: 'config-driven',
};