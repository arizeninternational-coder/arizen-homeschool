/**
 * Lesson 4 — Number Patterns (KICD Grade 4, SLO 1.1-i).
 *
 *   ARIZEN-INT-1.1-i: make patterns involving even and odd numbers in real life
 *                      situations
 *
 * Questions mirror the quiz content in src/data/grade4-math.ts (lesson
 * "Number Patterns").
 */

import type { AdaptiveLessonConfig } from './types';

const E = 0.9;

function toInt(answer: string): number {
  const m = answer.replace(/[^0-9-]/g, '');
  return m ? parseInt(m, 10) : Number.NaN;
}

export const NUMBER_PATTERNS_CONFIG: AdaptiveLessonConfig = {
  lessonSlug: 'number-patterns',
  lessonTitle: 'Number Patterns',
  slugAliases: ['patterns'],
  curriculumKey: 'g4-math-number-patterns',
  grade: 4,
  strand: 'Numbers',
  subStrand: '1.1 Whole Numbers: Making patterns involving even and odd numbers',
  slos: ['ARIZEN-INT-1.1-i: make patterns involving even and odd numbers in real life situations'],
  objectives: [
    'Spot the rule in a number pattern',
    'Give the next numbers in a pattern',
    'Recognise patterns made from even and odd numbers',
    'Create your own number pattern and describe its rule',
  ],
  concepts: [
    {
      id: 'identify-pattern-rule',
      label: 'Identify the rule in a number pattern',
      prerequisites: [],
      allowedRepresentations: ['number_line', 'step_reveal'],
      masteryThreshold: E,
    },
    {
      id: 'extend-number-pattern',
      label: 'Extend a number pattern',
      prerequisites: ['identify-pattern-rule'],
      allowedRepresentations: ['number_line'],
      masteryThreshold: E,
    },
    {
      id: 'even-odd-patterns',
      label: 'Recognise even and odd number patterns',
      prerequisites: ['identify-pattern-rule'],
      allowedRepresentations: ['number_line', 'counters'],
      masteryThreshold: E,
    },
  ],
  misconceptions: [
    {
      id: 'wrong-step-size',
      label: 'Uses the wrong step size',
      description: 'Adds or multiplies by the wrong amount instead of the pattern’s rule',
      indicators: ['24 → 26 in the multiples-of-6 pattern', 'doubles in an add-4 pattern'],
      remediation: {
        title: 'What Changes Each Time?',
        explanation:
          'A pattern has a RULE, and the rule tells you exactly what changes from one number to the next. ' +
          'Take two numbers you are sure about and subtract them. In 6, 12, 18, 24 the step is 6 every ' +
          'time, so after 24 the next number is 24 + 6. Use your own pattern’s step — not a step you ' +
          'remember from another pattern.',
        owlText: 'Check the step by subtracting two numbers you already know.',
        hint: 'Subtract one known number from the next to find the step size.',
        incorrectFeedback: 'Find the step size from two numbers you already know, then use only that step.',
      },
    },
    {
      id: 'continues-instead-of-predicting',
      label: 'Keeps counting on from the wrong number',
      description: 'Adds the correct step but from the wrong last number, or skips a term',
      indicators: ['24 → 32 in the multiples-of-6 pattern', 'skips a term in the sequence'],
      remediation: {
        title: 'Start From the LAST Number',
        explanation:
          'The next number is made by adding the step to the LAST number you were given — not to an ' +
          'earlier one. Write the pattern again, circle the final number, and add the step to exactly ' +
          'that number. Then check that the answer continues the pattern.',
        owlText: 'Take the last number given and add the step to it. Only that one.',
        hint: 'Start from the final number shown and add one step.',
      },
    },
    {
      id: 'parity-ignored',
      label: 'Ignores whether the numbers are even or odd',
      description: 'Gives the next number without noticing the pattern’s even/odd structure',
      indicators: ['odd number given for an all-even pattern', 'odd number given for an all-odd pattern'],
      remediation: {
        title: 'Even or Odd? Check the Last Digit',
        explanation:
          'Every pattern in this lesson is built from even numbers or from odd numbers, so the answer ' +
          'must match. An EVEN number ends in 0, 2, 4, 6 or 8; an ODD number ends in 1, 3, 5, 7 or 9. ' +
          'Counting in twos always keeps you in the same group — if your answer jumps into the other ' +
          'group, your step is wrong.',
        owlText: 'Counting in twos never leaves the even group or the odd group.',
        hint: 'Check that your answer ends in the same kind of digit as the pattern.',
        incorrectFeedback: 'Does your answer end in an even or an odd digit, like the rest of the pattern?',
      },
    },
    {
      id: 'rule-not-stated',
      label: 'Cannot state the rule',
      description: 'Finds a next number but cannot describe the pattern’s rule',
      indicators: ['correct number, no rule given', 'rule described as "it goes up"'],
      remediation: {
        title: 'Say the Rule in Words',
        explanation:
          'A rule must say WHAT you do and HOW MUCH. "Add 6 each time" is a rule — "it goes up" is not. ' +
          'Complete this sentence: "Each number is the number before it plus ____." Once the blank is ' +
          'filled, you can use the rule for any number in the pattern.',
        owlText: 'A rule needs the amount: "add ____ each time".',
        hint: 'Finish the sentence: "Each number is the number before it plus ..."',
      },
    },
  ],
  activities: [
    {
      activityId: 'think_first',
      conceptId: 'identify-pattern-rule',
      slo: 'ARIZEN-INT-1.1-i',
      prompt: 'What number comes next in this pattern: 6, 12, 18, 24, __?',
      choices: ['28', '30', '32', '26'],
      correctAnswer: '30',
      explanation:
        'This pattern adds 6 each time — the multiples of 6. 24 + 6 = 30, and 30 is also even, like the rest.',
      hint: 'Find the step: 6 to 12 is +6. What is 24 + 6?',
      detectMisconception: (selected) => {
        const n = toInt(selected);
        if (n === 30) return null;
        if (n === 32 || n === 28) return 'wrong-step-size';
        if (n === 26) return 'continues-instead-of-predicting';
        return 'wrong-step-size';
      },
    },
    {
      activityId: 'connect',
      conceptId: 'even-odd-patterns',
      slo: 'ARIZEN-INT-1.1-i',
      prompt:
        'A bus leaves the stage at 6:00, 6:10, 6:20, 6:30 … What is the next departure time?',
      choices: ['6:32', '6:40', '6:35', '6:50'],
      correctAnswer: '6:40',
      explanation:
        'The pattern adds 10 minutes each time, so after 6:30 the next is 6:40. The rule is "add 10 minutes each time".',
      hint: 'The bus goes every 10 minutes. What is 10 minutes after 6:30?',
      detectMisconception: (selected) => {
        const s = selected.replace(/[^0-9:]/g, '');
        if (s.endsWith('40')) return null;
        if (s.endsWith('32') || s.endsWith('35')) return 'wrong-step-size';
        return 'continues-instead-of-predicting';
      },
    },
    {
      activityId: 'p1',
      conceptId: 'extend-number-pattern',
      slo: 'ARIZEN-INT-1.1-i',
      prompt: 'What comes next in this pattern: 1, 3, 5, 7, __?',
      choices: ['8', '9', '10', '11'],
      correctAnswer: '9',
      explanation:
        'The pattern counts in twos from 1, which are all ODD numbers: 1, 3, 5, 7, 9. The rule is "add 2 each time".',
      hint: 'These are odd numbers counting by twos. What odd number comes after 7?',
      detectMisconception: (selected) => {
        const n = toInt(selected);
        if (n === 9) return null;
        if (n === 8 || n === 10) return 'parity-ignored';
        if (n === 11) return 'wrong-step-size';
        return 'wrong-step-size';
      },
    },
    {
      activityId: 'p2',
      conceptId: 'identify-pattern-rule',
      slo: 'ARIZEN-INT-1.1-i',
      prompt: 'What comes next in this pattern: 2, 4, 8, 16, __?',
      choices: ['32', '18', '64', '20'],
      correctAnswer: '32',
      explanation:
        'The pattern DOUBLES each time — the rule is "multiply by 2". 16 × 2 = 32, and 32 is even like all the terms before it.',
      hint: 'Each number is double the one before. What is double 16?',
      detectMisconception: (selected) => {
        const n = toInt(selected);
        if (n === 32) return null;
        if (n === 18 || n === 20) return 'wrong-step-size';
        return 'wrong-step-size';
      },
    },
    {
      activityId: 'p3',
      conceptId: 'extend-number-pattern',
      slo: 'ARIZEN-INT-1.1-i',
      prompt: 'What comes next in this pattern: 4, 8, 12, 16, __?',
      choices: ['20', '18', '24', '32'],
      correctAnswer: '20',
      explanation:
        'The pattern adds 4 each time — the multiples of 4. 16 + 4 = 20, which is even, like every other term.',
      hint: 'These are the multiples of 4. What is 16 + 4?',
      detectMisconception: (selected) => {
        const n = toInt(selected);
        if (n === 20) return null;
        if (n === 18) return 'wrong-step-size';
        if (n === 24 || n === 32) return 'wrong-step-size';
        return 'continues-instead-of-predicting';
      },
    },
    {
      activityId: 'quick_check',
      conceptId: 'identify-pattern-rule',
      slo: 'ARIZEN-INT-1.1-i',
      prompt: 'Which rule describes this pattern: 5, 10, 15, 20, … ?',
      choices: [
        'Add 5 each time',
        'Add 10 each time',
        'Double each time',
        'Add 2 each time',
      ],
      correctAnswer: 'Add 5 each time',
      explanation:
        'From 5 to 10 is +5, from 10 to 15 is +5, from 15 to 20 is +5 — so the rule is "add 5 each time".',
      hint: 'Subtract one number from the next. The rule is the same every time.',
      detectMisconception: (selected) => {
        const s = selected.toLowerCase();
        if (s.includes('add 5')) return null;
        if (s.includes('double')) return 'wrong-step-size';
        return 'rule-not-stated';
      },
    },
  ],
  mastery: {
    requiredConcepts: ['identify-pattern-rule', 'extend-number-pattern'],
    minCorrectPerConcept: 1,
    minAccuracy: 0.6,
    requireEvidenceForAll: true,
  },
  celebration: {
    headline: 'You are a Pattern Detective!',
    praise:
      'You can spot the rule in a number pattern, predict what comes next, and build patterns from even and odd numbers.',
    badge: 'Pattern Detective Badge',
    recap: [
      'Find the step size in any number pattern',
      'Continue 6, 12, 18, 24 with 30',
      'Keep even patterns even and odd patterns odd',
      'Describe a pattern rule using "add __ each time"',
    ],
  },
  journeyBuilder: 'generated',
  remediationStrategy: 'config-driven',
};