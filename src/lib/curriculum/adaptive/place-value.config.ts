/**
 * Place Value & Number Reading — adaptive lesson configuration.
 *
 * This config captures the behaviour of the working Place Value adaptive loop
 * exactly as it exists today, expressed as data:
 *
 *  concepts        ← PLACE_VALUE_CONCEPTS + PLACE_VALUE_CONCEPTS_SPEC
 *  misconceptions  ← PLACE_VALUE_MISCONCEPTIONS (same ids/labels/indicators)
 *  activities      ← STEP_CONCEPT_MAPPINGS (same activity ids, concepts,
 *                    expected answers and misconception checks)
 *  mastery         ← the progression the orchestrator already enforced
 *
 * `remediationStrategy: 'lesson-generators'` keeps the existing
 * misconception-specific Place Value remediation generators
 * (adaptive-journey.ts) in charge of remediation content, so nothing that works
 * today is rewritten.
 */

import type { AdaptiveLessonConfig } from './types';

export const PLACE_VALUE_ADAPTIVE_CONFIG: AdaptiveLessonConfig = {
  lessonSlug: 'place-value-number-reading',
  lessonTitle: 'Place Value and Number Reading',
  // The database stores this lesson under the shorter slug, and the seeded
  // curriculum source uses the longer one. Both must resolve here.
  slugAliases: ['place-value'],
  curriculumKey: 'g4-math-place-value',
  grade: 4,
  strand: 'Numbers',
  subStrand: '1.1 Whole Numbers: Place value and total value of digits up to tens of thousands',
  slos: [
    'ARIZEN-INT-1.1-a: use place value and total value of digits up to tens of thousands in daily life situations',
    'ARIZEN-INT-1.1-b: read and write numbers up to 10,000 in symbols in real life situations',
    'ARIZEN-INT-1.1-c: read and write numbers up to 1,000 in words in day to day activities',
  ],
  objectives: [
    'Read numbers up to tens of thousands',
    'Identify the place value of any digit',
    'Write numbers in expanded form',
    'Compare and order big numbers',
  ],
  concepts: [
    {
      id: 'read-numbers',
      label: 'Read whole numbers',
      prerequisites: [],
      allowedRepresentations: ['place_value_chart', 'number_line', 'counters'],
      masteryThreshold: 0.7,
    },
    {
      id: 'digit-position',
      label: 'Identify digit position',
      prerequisites: ['read-numbers'],
      allowedRepresentations: ['place_value_chart', 'counters'],
      masteryThreshold: 0.7,
    },
    {
      id: 'digit-value',
      label: 'Identify digit value',
      prerequisites: ['read-numbers', 'digit-position'],
      allowedRepresentations: ['place_value_chart', 'number_line', 'counters'],
      masteryThreshold: 0.75,
    },
    {
      id: 'expanded-form',
      label: 'Expanded form',
      prerequisites: ['read-numbers', 'digit-position', 'digit-value'],
      allowedRepresentations: ['place_value_chart', 'counters', 'step_reveal'],
      masteryThreshold: 0.75,
    },
    {
      id: 'compare-order',
      label: 'Compare/order numbers',
      prerequisites: ['read-numbers', 'digit-position', 'digit-value', 'expanded-form'],
      allowedRepresentations: ['number_line', 'digit_comparison', 'counters'],
      masteryThreshold: 0.8,
    },
  ],
  misconceptions: [
    {
      id: 'digit-not-value',
      label: 'Confuses digit with digit value',
      description: 'Student thinks the digit IS the value, ignoring place position',
      indicators: ['7 instead of 700', '5 instead of 5000', 'reports digit face value'],
      remediation: {
        title: 'Digit vs. Value',
        explanation:
          'A digit is just a symbol — a single number. Its VALUE depends on the PLACE it sits in. ' +
          'In this number, the digit you picked is in a column that decides what it is worth. ' +
          'Count the columns from the right: ones, tens, hundreds, thousands.',
        owlText: 'Count the columns from the right — the column tells you the value!',
        hint: 'Look at the place value chart and count from the ones place on the right.',
      },
    },
    {
      id: 'position-confusion',
      label: 'Confuses place positions',
      description: 'Student mixes up hundreds/tens/ones or thousands/hundreds',
      indicators: ['700 instead of 70', '70 instead of 700', 'reverses adjacent places'],
      remediation: {
        title: 'Find the Right Place',
        explanation:
          'You picked the right digit but the wrong PLACE. In a number, each column has its own job. ' +
          'Read left to right: the first digit is the largest place, and each place to the right is ' +
          'one tenth of the one before it.',
        owlText: 'Read left to right: the first digit is the largest place, the last digit is ones.',
        hint: 'Count from the ones place (rightmost) upward.',
      },
    },
    {
      id: 'expanded-form-skip',
      label: 'Skips zero places in expanded form',
      description: 'Student omits places with zero value in expanded form',
      indicators: ['4000+200+9 for 4209', 'omits zero terms'],
      remediation: {
        title: "Don't Skip a Place",
        explanation:
          'Every place value column counts — even when it holds a ZERO. A 0 in a column still holds ' +
          'that place open. Make sure every column has a term in the expanded form.',
        owlText: 'Even zeros count! A 0 in a column means that place contributes 0 to the total.',
        hint: 'Every digit has a place — include them all.',
      },
    },
    {
      id: 'left-right-reverse',
      label: 'Reads place positions right-to-left',
      description: 'Student reverses the direction of place value positions',
      indicators: ['ones reported as thousands', 'reversed positions'],
      remediation: {
        title: 'Read Left to Right',
        explanation:
          'When building or reading a number, read LEFT to RIGHT. The first digit is the largest place, ' +
          'then hundreds, then tens, then ones. You may have swapped the order.',
        owlText: 'Left to right — thousands, hundreds, tens, ones. Never skip a column.',
        hint: 'Thousands first, then hundreds, tens, ones.',
      },
    },
    {
      id: 'comparison-reverse',
      label: 'Confuses greater-than/less-than direction',
      description: 'Student picks the smaller number when asked which is larger',
      indicators: ['chooses smaller when asked for larger', 'reverses comparison'],
      remediation: {
        title: 'Which Is Larger?',
        explanation:
          'When comparing, look at the LARGEST place first. Both numbers start the same in the ' +
          'largest place — then look at the NEXT digit. The first digit that differs decides which ' +
          'number is larger.',
        owlText: 'The number with the larger digit in the FIRST differing place is the larger number.',
        hint: 'Compare from the leftmost digit first.',
      },
    },
    {
      id: 'comparison-equal',
      label: 'Treats numbers with different digits as equal',
      description: 'Student ignores digit differences and assumes numbers are equal',
      indicators: ['says equal when digits differ', 'ignores place differences'],
      remediation: {
        title: 'Not the Same Number',
        explanation:
          'Equal means EVERY digit matches. These numbers look similar but are NOT equal — compare ' +
          'digit by digit from the left and find where they differ.',
        owlText: 'Equal = identical in every place. Compare digit by digit from the left.',
        hint: 'Compare left to right — find the first difference.',
      },
    },
    {
      id: 'read-numbers',
      label: 'Misreads a whole number',
      description:
        'Student swaps digit positions or assigns wrong place value when reading a number aloud',
      indicators: ['reads digits in wrong order', 'misplaces a digit', 'ignores zero as placeholder'],
      remediation: {
        title: 'Reading Numbers Carefully',
        explanation:
          'Read a big number in GROUPS. First read the thousands group, then the rest. Read each group ' +
          'separately, then say them together.',
        owlText: 'Comma = group separator. Read the left group (thousands), then the right group.',
        hint: 'Read in groups: thousands, then the rest.',
      },
    },
  ],
  activities: [
    {
      activityId: 'think_first',
      conceptId: 'digit-value',
      expectedAnswer: '7 hundreds',
      detectMisconception: (selected, expected) => {
        const sel = selected.toLowerCase();
        const exp = expected.toLowerCase();
        if (sel.includes('ones') && !exp.includes('ones')) return 'digit-not-value';
        if (sel.includes('7') && !sel.includes('hundreds') && !sel.includes('tens') && !sel.includes('thousands')) {
          return 'digit-not-value';
        }
        const places = ['ones', 'tens', 'hundreds', 'thousands'];
        const selPlace = places.find((p) => sel.includes(p));
        const expPlace = places.find((p) => exp.includes(p));
        if (selPlace && expPlace && selPlace !== expPlace) return 'position-confusion';
        return null;
      },
    },
    {
      activityId: 'connect',
      conceptId: 'digit-value',
      expectedAnswer: '3,000 people',
      detectMisconception: (selected, expected) => {
        const sel = selected.toLowerCase();
        const exp = expected.toLowerCase();
        if (sel.includes('3 people') || sel.includes('30 people') || sel.includes('300 people')) {
          return 'digit-not-value';
        }
        const places = ['ones', 'tens', 'hundreds', 'thousands'];
        const selPlace = places.find((p) => sel.includes(p));
        const expPlace = places.find((p) => exp.includes(p));
        if (selPlace && expPlace && selPlace !== expPlace) return 'position-confusion';
        return null;
      },
    },
    {
      activityId: 'p1',
      conceptId: 'expanded-form',
      expectedAnswer: '2,538',
      detectMisconception: (selected) => {
        const sel = selected.toLowerCase();
        if (sel.includes('5,238')) return 'position-confusion';
        if (sel.includes('2,358') || sel.includes('2,583')) return 'left-right-reverse';
        return null;
      },
    },
    {
      activityId: 'p2',
      conceptId: 'expanded-form',
      expectedAnswer: '1,547',
      detectMisconception: (selected) => {
        const sel = selected.toLowerCase();
        if (sel.includes('1,247')) return 'expanded-form-skip';
        if (sel.includes('1,347')) return 'expanded-form-skip';
        return null;
      },
    },
    {
      activityId: 'p3',
      conceptId: 'compare-order',
      expectedAnswer: '5,621',
      detectMisconception: (selected) => {
        const sel = selected.toLowerCase();
        if (sel.includes('5,261')) return 'comparison-reverse';
        if (sel.includes('equal')) return 'comparison-equal';
        return null;
      },
    },
    {
      activityId: 'quick_check',
      conceptId: 'read-numbers',
      expectedAnswer: '3,042',
      detectMisconception: (selected, expected) =>
        selected.toLowerCase() !== expected.toLowerCase() ? 'read-numbers' : null,
    },
  ],
  mastery: {
    requiredConcepts: ['digit-value', 'expanded-form', 'compare-order', 'read-numbers'],
    minCorrectPerConcept: 1,
    minAccuracy: 0.5,
    requireEvidenceForAll: true,
  },
  celebration: {
    headline: "You're a Place Value Pro!",
    praise:
      'You can now read big numbers, explain what each digit means, and write numbers in expanded form.',
    badge: 'Place Value Pro Badge',
    recap: [
      'Read 4,729 aloud: four thousand, seven hundred twenty-nine',
      'Tell what each digit means in a 4-digit number',
      'Write 4,729 in expanded form: 4,000 + 700 + 20 + 9',
      'Compare numbers using place value',
    ],
  },
  journeyBuilder: 'bespoke',
  remediationStrategy: 'lesson-generators',
};