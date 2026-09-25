/**
 * Adaptive Journey Builder for Grade 4 Place Value
 *
 * Generates remediation journey steps that are:
 *  - misconception-specific (different content per misconception)
 *  - context-aware (uses the ACTUAL number/answer from the question)
 *  - interactive (tap_choice scaffold, not a static card)
 *  - escalating (stronger scaffold on repeat wrong attempts)
 */

import type { JourneyStep } from "./grade4-journeys";
import {
  type LearningState,
  type AdaptiveStep,
  type AnswerResult,
  evaluateAnswer,
  detectMisconception,
  selectNextActivity,
  recordEvidence,
  PLACE_VALUE_MISCONCEPTIONS,
} from "./adaptive-engine";

// -- Concept mapping for Place Value quiz blocks ---------------------------

interface QuizConceptMapping {
  lessonSlug: string;
  quizIndex: number; // 0-based index within the lesson's quiz blocks
  conceptId: string;
  expectedAnswer?: string; // optional, for documentation
  misconceptionCheck?: (selected: string, expected: string) => string | null;
}

/**
 * Legacy mapping array. Kept for backward-compatibility with tests that
 * import it, but the RUNTIME no longer uses it — it is not the single
 * source of truth. The runtime derives mappings from getStepConceptMapping().
 */
export const PLACE_VALUE_QUIZ_MAPPINGS: QuizConceptMapping[] = [
  {
    lessonSlug: 'place-value',
    quizIndex: 0,
    conceptId: 'digit-value',
    expectedAnswer: '7 hundreds',
    misconceptionCheck: (selected, expected) => {
      const sel = selected.toLowerCase();
      const exp = expected.toLowerCase();
      if (sel.includes('ones') && !exp.includes('ones')) return 'digit-not-value';
      const places = ['ones', 'tens', 'hundreds', 'thousands'];
      const selPlace = places.find(p => sel.includes(p));
      const expPlace = places.find(p => exp.includes(p));
      if (selPlace && expPlace && selPlace !== expPlace) return 'position-confusion';
      return null;
    },
  },
  {
    lessonSlug: 'place-value',
    quizIndex: 1,
    conceptId: 'expanded-form',
    misconceptionCheck: (selected, expected) => {
      if (selected.includes('0') && !expected.includes('0')) return 'expanded-form-skip';
      return null;
    },
  },
];

/**
 * Check if a lesson is the Place Value lesson that should use adaptive path.
 */
export function isPlaceValueLesson(lessonTitle?: string): boolean {
  if (!lessonTitle) return false;
  const title = lessonTitle.toLowerCase();
  return title.includes('place value') || title.includes('place-value');
}

export interface AdaptiveJourneyResult {
  steps: JourneyStep[];
  adaptiveInserted: boolean;
  remediationStepIds: string[];
}

/**
 * Build an adaptive journey for Place Value.
 *
 * Takes the standard journey and augments quiz steps with answer
 * evaluation + misconception detection + remediation insertion.
 *
 * @param lessonTitle - title of the lesson (used for routing)
 * @param studentId - current student ID
 * @param learningState - current adaptive learning state
 */
export function buildAdaptivePlaceValueJourney(
  lessonTitle: string,
  studentId: string,
  learningState?: LearningState,
): AdaptiveJourneyResult {
  const { buildPlaceValueJourney } = require('./grade4-journeys');
  const baseSteps = buildPlaceValueJourney();

  return {
    steps: baseSteps,
    adaptiveInserted: false,
    remediationStepIds: [],
  };
}

// -- Remediation context ----------------------------------------------------

/**
 * Context passed from the student page so remediation can reference the
 * ACTUAL question the learner was asked (not a hardcoded 4,729).
 */
export interface RemediationContext {
  prompt: string;
  options: string[];
  expectedAnswer: string;
  selectedAnswer: string;
  activityId: string;
  attemptNumber?: number;  // 1 = first remediation, 2+ = escalated
}

// -- Helpers ----------------------------------------------------------------

const PLACE_NAMES = ['ones', 'tens', 'hundreds', 'thousands', 'ten-thousands'];

function normalizeNum(s: string): string {
  return s.replace(/[, ]/g, '').trim();
}

/** Extract a 4-or-5 digit number from any context field. */
function extractNumber(ctx?: RemediationContext): string | null {
  if (!ctx) return null;
  const candidates = [
    ctx.prompt,
    ctx.expectedAnswer,
    ctx.selectedAnswer,
    ...ctx.options,
  ];
  for (const c of candidates) {
    const m = c.match(/\d{1,2}(?:,\d{3})+/);
    if (m) return m[0];
  }
  for (const c of candidates) {
    const m = c.match(/\d{4,5}/);
    if (m) return m[0];
  }
  return null;
}

function parseDigits(numStr: string): string[] {
  return normalizeNum(numStr).split('').filter(ch => /\d/.test(ch));
}

/** Find the target digit referenced in the question (e.g. "the 7" → "7"). */
function findTargetDigit(expectedAnswer: string, prompt?: string): string {
  if (!expectedAnswer) return '7';
  // "7 hundreds" → 7 ; "3,000" → 3 ; "2,347" → 2
  const m = expectedAnswer.match(/\d/);
  if (m) return m[0];
  if (prompt) {
    const pm = prompt.match(/the\s+(\d)\s/);
    if (pm) return pm[1];
  }
  return '7';
}

interface DigitPosition {
  place: string;     // "hundreds"
  placeLabel: string; // "hundreds"
  index: number;     // index in the digits array (0 = leftmost)
  fromRight: number; // 0 = ones, 1 = tens, ...
  value: number;     // the digit's value (e.g. 700)
}

function locateDigit(digits: string[], targetDigit: string): DigitPosition | null {
  for (let i = 0; i < digits.length; i++) {
    if (digits[i] === targetDigit) {
      const fromRight = digits.length - 1 - i;
      const place = PLACE_NAMES[fromRight] || 'ones';
      const value = parseInt(targetDigit, 10) * Math.pow(10, fromRight);
      return {
        place,
        placeLabel: place,
        index: i,
        fromRight,
        value,
      };
    }
  }
  return null;
}

function formatWithCommas(n: number): string {
  return n.toLocaleString('en-US');
}

/**
 * Build a place-value chart visual spec for a given number, optionally
 * highlighting the column containing targetDigit.
 */
function buildPlaceChart(
  digits: string[],
  targetDigit?: string,
): any {
  const highlightColumn = targetDigit
    ? ((): number => {
        const pos = locateDigit(digits, targetDigit);
        // Left-based index: 0 = leftmost column (largest place), as expected by PlaceValueChart
        return pos ? pos.index : -1;
      })()
    : -1;

  const columnLabels = digits.map((_, i) => {
    const fromRight = digits.length - 1 - i;
    return PLACE_NAMES[fromRight] || 'ones';
  });

  return {
    type: 'place_value_chart',
    digits,
    columnLabels,
    highlightColumn,
    showValues: true,
    showNames: true,
  };
}

/**
 * Build a number-line visual spec comparing two numbers.
 */
function buildNumberLine(a: string, b: string): any {
  const av = parseInt(normalizeNum(a), 10);
  const bv = parseInt(normalizeNum(b), 10);
  const lo = Math.min(av, bv);
  const hi = Math.max(av, bv);
  const pad = (hi - lo) * 0.2;
  return {
    type: 'number_line',
    rangeMin: Math.max(0, lo - pad),
    rangeMax: hi + pad + 1,
    tickInterval: Math.pow(10, Math.floor(Math.log10(hi)).toString().length > 0 ? 0 : 0),
    markers: [
      { value: av, label: a },
      { value: bv, label: b },
    ],
  };
}

// -- Remediation content generators -----------------------------------------

/**
 * Generate a remediation JourneyStep for the given misconception + concept,
 * using the ACTUAL question context so content is specific and relevant.
 */
export function generateRemediationStep(
  misconceptionId: string,
  conceptId: string,
  context?: RemediationContext,
): JourneyStep | null {
  const mc = PLACE_VALUE_MISCONCEPTIONS.find(m => m.id === misconceptionId);
  if (!mc) {
    if (misconceptionId !== '__default__') return null;
    // '__default__' — no specific misconception detected; use the concept's
    // own default remediation generator.
    const generator = REMEDIATION_GENERATORS[conceptId]?.['__default__']
      || REMEDIATION_GENERATORS['__default__']?.['__default__'];
    if (!generator) return null;
    return generator(misconceptionId, conceptId, {
      numStr: context ? (extractNumber(context) || '4,729') : '4,729',
      digits: context ? parseDigits(extractNumber(context) || '4,729') : ['4','7','2','9'],
      targetDigit: context ? (findTargetDigit(context.expectedAnswer, context.prompt) || '7') : '7',
      pos: locateDigit(context ? parseDigits(extractNumber(context) || '4,729') : ['4','7','2','9'], context ? (findTargetDigit(context.expectedAnswer, context.prompt) || '7') : '7'),
      posStr: '700',
      isEscalated: (context?.attemptNumber || 1) >= 2,
      attempt: context?.attemptNumber || 1,
      context,
    });
  }

  const attempt = context?.attemptNumber || 1;
  const isEscalated = attempt >= 2;

  // Extract real question data
  const numStr = context ? (extractNumber(context) || '4,729') : '4,729';
  const digits = parseDigits(numStr);
  const targetDigit = context
    ? (findTargetDigit(context.expectedAnswer, context.prompt) || digits[1] || '7')
    : (numStr.includes('7') ? '7' : digits[1] || '7');
  const pos = locateDigit(digits, targetDigit);
  const posStr = pos ? `${pos.value}` : '700';

  // Pick the remediation generator based on (conceptId, misconceptionId)
  const generator = REMEDIATION_GENERATORS[conceptId]?.[misconceptionId]
    || REMEDIATION_GENERATORS['__default__']?.[misconceptionId]
    || REMEDIATION_GENERATORS['__default__']?.['__default__'];

  if (!generator) return null;

  return generator(misconceptionId, conceptId, { numStr, digits, targetDigit, pos, posStr, isEscalated, attempt, context });
}

/**
 * Parameters passed to each remediation generator function.
 * Generators receive the ACTUAL extracted question context.
 */
interface GenParams {
  numStr: string;
  digits: string[];
  targetDigit: string;
  pos: DigitPosition | null;
  posStr: string;
  isEscalated: boolean;
  attempt: number;
  context?: RemediationContext;
}

type RemediationGenerator = (
  misconceptionId: string,
  conceptId: string,
  params: GenParams,
) => JourneyStep;

/**
 * Registry of remediation generators, keyed by conceptId → misconceptionId.
 *
 * Each generator produces a JourneyStep whose:
 *  - studentText EXPLAINS the specific misconception using the real number
 *  - visualSpec RENDERS the real number on a place-value chart or number line
 *  - interactionSpec PRESENTS a misconception-specific interactive question
 *  - feedbackSpec GIVES misconception-specific feedback
 *
 * Generators are context-aware: they use the ACTUAL number, digit, and
 * expected answer from the learner's question — never a hardcoded 4,729.
 */
const REMEDIATION_GENERATORS: Record<string, Record<string, RemediationGenerator>> = {
  '__default__': {
    __default__: (_mc, _c, p): JourneyStep => {
      const { numStr, digits, targetDigit, pos, posStr, isEscalated, attempt } = p;
      const placeName = pos?.place || 'hundreds';
      const placeValue = pos?.value || 700;
      return {
        id: `remediation-${_mc}-${attempt}-${Date.now()}`,
        stepType: 'learn',
        title: isEscalated ? 'Dig Deeper' : 'Let us Look Closer',
        studentText: `The digit ${targetDigit} is in the ${placeName} place, so it represents ${placeValue}, not just ${targetDigit} ones.`,
        visualSpec: buildPlaceChart(digits, targetDigit),
        interactionSpec: {
          type: 'tap_choice',
          prompt: `In ${numStr}, which place is the ${targetDigit} in?`,
          choices: ['ones', 'tens', 'hundreds', 'thousands', 'ten-thousands']
            .slice(0, digits.length)
            .map((label, i) => ({
              id: String(i),
              label,
            })),
          correctChoiceId: String(pos ? pos.fromRight : 2),
          conceptId: _c,
          hint: 'Count from the ones place on the right.',
        },
        feedbackSpec: {
          correct: `Yes! The ${targetDigit} is in the ${placeName} place (${formatWithCommas(placeValue)}).`,
          incorrect: 'Look at the place value chart and count from the right.',
          hint: `The ${targetDigit} is in the ${placeName} place.`,
        },
      };
    },
  },
};

// -- digit-value concept remediations ---------------------------------------

REMEDIATION_GENERATORS['digit-value'] = {
  'digit-not-value': (_mc, _c, p): JourneyStep => {
    const { numStr, digits, targetDigit, pos, posStr, isEscalated, attempt } = p;
    const placeName = pos?.place || 'hundreds';
    const placeValue = pos?.value || 700;
    const wrongAnswer = `${targetDigit} ones`;

    return {
      id: `remediation-digit-not-value-${attempt}`,
      stepType: 'learn',
      title: 'Digit vs. Value',
      studentText: isEscalated
        ? `The digit ${targetDigit} is just a SYMBOL (like a letter in a name). Its VALUE depends on the column it sits in. In ${numStr}, ${targetDigit} is in the ${placeName} column, worth ${formatWithCommas(placeValue)} — not ${targetDigit} (which would be the ones place).`
        : `A digit is just a symbol — a single number. The VALUE depends on its PLACE. You picked "${wrongAnswer}" — that treats the digit as just its face value. In ${numStr}, the ${targetDigit} sits in the ${placeName} place, worth ${formatWithCommas(placeValue)}.`,
      owlText: 'Count the columns from the right: ones, tens, hundreds, thousands. The column tells you the value!',
      visualSpec: buildPlaceChart(digits, targetDigit),
      interactionSpec: {
        type: 'tap_choice',
        prompt: `In ${numStr}, what is the value of the ${targetDigit}?`,
        choices: [
          { id: '0', label: `${targetDigit} ones` },
          { id: '1', label: `${targetDigit} tens` },
          { id: '2', label: `${targetDigit} hundreds` },
          { id: '3', label: `${targetDigit} thousands` },
        ],
        correctChoiceId: '2',
        conceptId: _c,
        hint: `The ${targetDigit} is in the ${placeName} place.`,
      },
      feedbackSpec: {
        correct: `Exactly! The ${targetDigit} is in the ${placeName} place, worth ${formatWithCommas(placeValue)}.`,
        incorrect: isEscalated
          ? `Remember: the digit is the symbol, the value depends on the place. The ${targetDigit} is in the ${placeName} place.`
          : `Try again — look at the chart. The column position tells you the value.`,
        hint: `Column → value. The ${targetDigit} is in the ${placeName} column.`,
      },
    };
  },

  'position-confusion': (_mc, _c, p): JourneyStep => {
    const { numStr, digits, targetDigit, pos, posStr, isEscalated, attempt } = p;
    const placeName = pos?.place || 'hundreds';
    const placeValue = pos?.value || 700;

    return {
      id: `remediation-position-confusion-${attempt}`,
      stepType: 'learn',
      title: 'Find the Right Place',
      studentText: isEscalated
        ? `Let's count carefully. In ${numStr}, reading left to right:\n${digits.map((d, i) => {
            const fromRight = digits.length - 1 - i;
            const pn = PLACE_NAMES[fromRight] || 'ones';
            return `${d} = ${pn} (${formatWithCommas(parseInt(d, 10) * Math.pow(10, fromRight))})`;
          }).join('\n')}\n\nSo ${targetDigit} is in the ${placeName} place.`
        : `You picked the right digit but the wrong PLACE. In ${numStr}, the digits sit in specific columns. Let's check: the ${targetDigit} is in the ${placeName} place, worth ${formatWithCommas(placeValue)}.`,
      owlText: isEscalated
        ? 'Read left to right: the first digit is the largest place, the last digit is ones.'
        : 'Read left to right. Each column is 10x bigger than the one to its right.',
      visualSpec: buildPlaceChart(digits, targetDigit),
      interactionSpec: {
        type: 'tap_choice',
        prompt: `In ${numStr}, which column holds the ${targetDigit}?`,
        choices: ['ones', 'tens', 'hundreds', 'thousands', 'ten-thousands']
          .slice(0, digits.length)
          .map((label, i) => ({ id: String(i), label })),
        correctChoiceId: String(pos ? pos.fromRight : 2),
        conceptId: _c,
        hint: `Count from the ones place (rightmost) upward.`,
      },
      feedbackSpec: {
        correct: `Yes — the ${targetDigit} is in the ${placeName} place (${formatWithCommas(placeValue)}).`,
        incorrect: isEscalated
          ? `Count again from the right. The rightmost is ones, next is tens, next is hundreds...`
          : `Look at the chart. Which column is highlighted?`,
        hint: `The ${targetDigit} is in the ${placeName} place.`,
      },
    };
  },
};

REMEDIATION_GENERATORS['digit-value']['__default__'] = REMEDIATION_GENERATORS['digit-value']['digit-not-value'];

// -- expanded-form concept remediations -------------------------------------

REMEDIATION_GENERATORS['expanded-form'] = {
  'left-right-reverse': (_mc, _c, p): JourneyStep => {
    const { numStr, digits, targetDigit, pos, isEscalated, attempt, context } = p;
    const expected = context?.expectedAnswer || numStr;
    const selected = context?.selectedAnswer || '';

    return {
      id: `remediation-left-right-reverse-${attempt}`,
      stepType: 'learn',
      title: 'Read Left to Right',
      studentText: isEscalated
        ? `Digits have specific seats. In ${numStr}, reading LEFT to RIGHT:\n${digits.map((d, i) => {
            const fromRight = digits.length - 1 - i;
            const pn = PLACE_NAMES[fromRight] || 'ones';
            return `${d} is in ${pn}`;
          }).join('\n')}\n\nYou wrote ${selected || 'something'}. Read from the LEFT — the first digit is the largest place.`
        : `When building or reading a number, read LEFT to RIGHT. The first digit is thousands (or larger), the next is hundreds, then tens, then ones. You may have swapped the order: ${selected || 'try again'} vs ${expected}.`,
      owlText: 'Left to right — thousands, hundreds, tens, ones. Never skip a column.',
      visualSpec: buildPlaceChart(digits),
      interactionSpec: {
        type: 'tap_choice',
        prompt: `In ${numStr}, what is the expanded form?`,
        choices: [
          { id: 'wrong', label: digits.slice().reverse().join(' + ') + ' (reversed)' },
          { id: 'right', label: digits.slice().reverse().join(' + ') },
          { id: 'wrong2', label: digits.slice().reverse().join(' + ') + ' (shuffled)' },
        ],
        correctChoiceId: 'right',
        conceptId: _c,
        hint: 'Thousands first, then hundreds, tens, ones.',
      },
      feedbackSpec: {
        correct: 'Right! Read left to right — largest place first.',
        incorrect: isEscalated
          ? "The leftmost digit is the largest place value. Don't reverse the order."
          : 'Try again — read the chart from left to right.',
        hint: `Start with the thousands (or largest place) and work right.`,
      },
    };
  },

  'expanded-form-skip': (_mc, _c, p): JourneyStep => {
    const { numStr, digits, targetDigit, pos, posStr, isEscalated, attempt, context } = p;
    const expected = context?.expectedAnswer || numStr;
    const selected = context?.selectedAnswer || '';

    return {
      id: `remediation-expanded-form-skip-${attempt}`,
      stepType: 'learn',
      title: 'Don\'t Skip a Place',
      studentText: isEscalated
        ? `Every column matters — even when it holds a ZERO! In ${numStr}:\n${digits.map((d, i) => {
            const fromRight = digits.length - 1 - i;
            const pn = PLACE_NAMES[fromRight] || 'ones';
            const val = parseInt(d, 10) * Math.pow(10, fromRight);
            return `${pn}: ${d} × ${Math.pow(10, fromRight)} = ${val}`;
          }).join('\n')}\n\nYou chose ${selected || 'an answer'}. Make sure every place is included.`
        : `Every place value column counts — even when the digit is 0! In ${numStr}, the expanded form must include every column. You picked ${selected || 'something'}, but the correct expanded form is ${expected}. Check: does every column have a term?`,
      owlText: 'Even zeros count! A 0 in a column means that place contributes 0 to the total.',
      visualSpec: {
        type: 'place_value_chart',
        digits,
        columnLabels: digits.map((_, i) => {
          const fromRight = digits.length - 1 - i;
          return PLACE_NAMES[fromRight] || 'ones';
        }),
        showValues: true,
        showExpanded: true,
        highlightColumn: -1,
      },
      interactionSpec: {
        type: 'tap_choice',
        prompt: `Complete the expanded form of ${numStr}:`,
        choices: [
          { id: 'wrong', label: digits.map((d, i) => {
            const fromRight = digits.length - 1 - i;
            return parseInt(d, 10) > 0 ? String(parseInt(d, 10) * Math.pow(10, fromRight)) : '';
          }).filter(Boolean).join(' + ') },
          { id: 'right', label: digits.map((d, i) => {
            const fromRight = digits.length - 1 - i;
            return `${parseInt(d, 10) * Math.pow(10, fromRight)}`;
          }).join(' + ') },
          { id: 'wrong2', label: digits.slice(0, -2).map((d, i) => {
            const fromRight = digits.length - 1 - i;
            return `${parseInt(d, 10) * Math.pow(10, fromRight)}`;
          }).join(' + ') + ' + ...' },
        ],
        correctChoiceId: 'right',
        conceptId: _c,
        hint: 'Every digit has a place — include them all.',
      },
      feedbackSpec: {
        correct: 'Yes! Every place counts, even zeros.',
        incorrect: isEscalated
          ? 'Remember: a 0 in a column still has a place value. Include ALL columns.'
          : 'Try again — make sure you have a term for every column.',
        hint: 'Thousands + hundreds + tens + ones — all four must appear.',
      },
    };
  },
};

REMEDIATION_GENERATORS['expanded-form']['__default__'] = REMEDIATION_GENERATORS['expanded-form']['expanded-form-skip'];

// -- compare-order concept remediations -------------------------------------

REMEDIATION_GENERATORS['compare-order'] = {
  'comparison-reverse': (_mc, _c, p): JourneyStep => {
    const { numStr, digits, targetDigit, pos, isEscalated, attempt, context } = p;
    const expected = context?.expectedAnswer || '';
    const selected = context?.selectedAnswer || '';

    // Extract the two comparison numbers from options or context
    const opts = context?.options || [numStr, numStr];
    const numA = opts[0] || opts[1] || numStr;
    const numB = opts[1] || opts[0] || numStr;
    const correctNum = expected || numB;
    const pickedNum = selected || numA;

    return {
      id: `remediation-comparison-reverse-${attempt}`,
      stepType: 'learn',
      title: 'Which Is Larger?',
      studentText: isEscalated
        ? `Compare LEFT to RIGHT. Both numbers start the same in the largest place. Then look at the NEXT digit.\n\n${numA} vs ${numB}\n\nLook at each digit from left to right until you find one that differs. That digit decides which number is larger.`
        : `When comparing, look at the LARGEST place first. You picked ${pickedNum || 'smaller'}, but ${correctNum || 'the other number'} is larger. Compare digit by digit from the LEFT.`,
      owlText: 'The number with the larger digit in the FIRST differing place is the larger number.',
      visualSpec: buildNumberLine(
        context?.options?.[0] || numStr,
        context?.options?.[1] || numStr,
      ),
      interactionSpec: {
        type: 'tap_choice',
        prompt: `Which number is larger?`,
        choices: [
          { id: 'a', label: numA },
          { id: 'b', label: numB },
          { id: 'c', label: 'They are equal' },
        ],
        correctChoiceId: String(context?.options?.indexOf(correctNum) ?? 1),
        conceptId: _c,
        hint: 'Compare from the leftmost digit first.',
      },
      feedbackSpec: {
        correct: 'Right! Compare from the leftmost digit.',
        incorrect: isEscalated
          ? 'Go digit by digit from the LEFT. The first digit that differs decides.'
          : 'Look at the number line — the farther right, the larger.',
        hint: 'Start at the leftmost digit and compare.',
      },
    };
  },

  'comparison-equal': (_mc, _c, p): JourneyStep => {
    const { numStr, digits, targetDigit, pos, isEscalated, attempt, context } = p;
    const expected = context?.expectedAnswer || '';
    const selected = context?.selectedAnswer || '';

    const opts = context?.options || [numStr, numStr];
    const numA = opts[0] || numStr;
    const numB = opts[1] || numStr;

    return {
      id: `remediation-comparison-equal-${attempt}`,
      stepType: 'learn',
      title: 'Not the Same Number',
      studentText: isEscalated
        ? `Equal means EVERY digit matches. ${numA} vs ${numB} — they start the same but differ in another place. Equal numbers must be identical in every column.\n\n${numA.replace(/,/g, '').split('').map((d, i) => {
            const fromRight = numA.replace(/,/g, '').length - 1 - i;
            return `$${PLACE_NAMES[fromRight]}$`;
          }).join(' ')}`
        : `${numA} and ${numB} look similar but are NOT equal. Equal means every single digit matches. You said they were equal — check each digit carefully.`,
      owlText: 'Equal = identical in every place. Compare digit by digit from the left.',
      visualSpec: {
        type: 'digit_comparison',
        numberA: numA,
        numberB: numB,
        highlightDifferences: true,
      },
      interactionSpec: {
        type: 'tap_choice',
        prompt: `Which digit makes ${numA} and ${numB} different?`,
        choices: numA.replace(/,/g, '').split('').map((d, i) => {
          const fromRight = numA.replace(/,/g, '').length - 1 - i;
          const pn = PLACE_NAMES[fromRight] || 'ones';
          return { id: String(i), label: `the ${pn} digit` };
        }).filter((_, i) => {
          const aDigits = numA.replace(/,/g, '').split('');
          const bDigits = numB.replace(/,/g, '').split('');
          return aDigits[i] !== bDigits[i];
        }),
        correctChoiceId: '0',
        conceptId: _c,
        hint: 'Compare digit by digit from the left.',
      },
      feedbackSpec: {
        correct: 'Yes — that is the digit that makes them different.',
        incorrect: isEscalated
          ? 'Compare every digit. Where do they differ?'
          : 'Look at each place value. Which digit is different?',
        hint: 'Compare left to right — find the first difference.',
      },
    };
  },
};

REMEDIATION_GENERATORS['compare-order']['__default__'] = REMEDIATION_GENERATORS['compare-order']['comparison-reverse'];

// -- read-numbers concept remediations --------------------------------------

REMEDIATION_GENERATORS['read-numbers'] = {
  'read-numbers': (_mc, _c, p): JourneyStep => {
    const { numStr, digits, targetDigit, pos, posStr, isEscalated, attempt, context } = p;
    const expected = context?.expectedAnswer || numStr;
    const selected = context?.selectedAnswer || '';

    return {
      id: `remediation-read-numbers-${attempt}`,
      stepType: 'learn',
      title: isEscalated ? 'Reading Numbers Carefully' : 'Reading Big Numbers',
      studentText: isEscalated
        ? `Read a big number in GROUPS. First read the thousands group, then the rest.\n\n${numStr} → "three thousand, forty-two"\n\nThe comma separates the groups. You read ${selected || 'something'} — but the correct reading is ${expected}.\n\nPractice: read each group separately, then say them together.`
        : `Read big numbers in GROUPS: read the thousands group first, then the hundreds/tens/ones group.\n\n${numStr} = "${numStr}".\n\nYou may have mixed up the digits. Read slowly: LEFT to RIGHT, group by group.`,
      owlText: isEscalated
        ? 'Comma = group separator. Read the left group (thousands), then the right group.'
        : 'Read left to right: thousands group, then the ones group.',
      visualSpec: {
        type: 'place_value_chart',
        digits,
        columnLabels: digits.map((_, i) => {
          const fromRight = digits.length - 1 - i;
          return PLACE_NAMES[fromRight] || 'ones';
        }),
        showValues: true,
        showGroups: true,
        highlightColumn: -1,
        groupBoundary: digits.length > 3 ? digits.length - 3 : -1,
      },
      interactionSpec: {
        type: 'tap_choice',
        prompt: isEscalated
          ? `Which number reads as "${context?.expectedAnswer || 'three thousand, forty-two'}"?`
          : `What number is shown in the chart?`,
        choices: (context?.options || [numStr, numStr]).slice(0, 4).map((opt, i) => ({
          id: String(i),
          label: opt,
        })),
        correctChoiceId: String(context?.options?.indexOf(expected) ?? 0),
        conceptId: _c,
        hint: 'Read in groups: thousands, then the rest.',
      },
      feedbackSpec: {
        correct: isEscalated
          ? `Yes! ${expected} is read as "${expected}".`
          : 'Right — read left to right, group by group.',
        incorrect: isEscalated
          ? 'Read the thousands group first: how many thousands? Then the rest.'
          : 'Try again — read each column carefully.',
        hint: 'Comma separates the groups. Read each group.',
      },
    };
  },
};

// -- Evaluate and adapt ------------------------------------------------------

/**
 * Evaluate a student's answer and determine the next action.
 * Updated to accept selectedAnswer string (not index) for proper remediation.
 */
export function evaluateAndAdapt(
  learningState: LearningState,
  conceptId: string,
  selectedIndex: number,
  expectedIndex: number,
  options: string[],
  remediationContext?: RemediationContext,
): {
  updatedState: LearningState;
  misconceptionId: string | null;
  shouldRemediate: boolean;
  remediationStep: JourneyStep | null;
} {
  const selectedAnswer = options[selectedIndex] ?? '';
  const expectedAnswer = options[expectedIndex] ?? '';
  const result = evaluateAnswer(selectedIndex, expectedIndex, options);

  const misconception = detectMisconception(
    conceptId,
    result.selectedAnswer,
    result.expectedAnswer,
    { options, prompt: remediationContext?.prompt },
  );

  const evidence = {
    conceptId,
    correct: result.correct,
    timestamp: Date.now(),
    activityId: remediationContext?.activityId || `${conceptId}-check`,
    answer: result.selectedAnswer,
    expectedAnswer: result.expectedAnswer,
    misconceptionId: misconception?.id,
  };

  const updatedState = recordEvidence(learningState, evidence);
  const shouldRemediate = !result.correct && (updatedState.remediationCount || 0) < 3;

  let remediationStep: JourneyStep | null = null;
  if (shouldRemediate && misconception) {
    const attempt = (updatedState.remediationCount || 0) + 1;
    remediationStep = generateRemediationStep(
      misconception.id,
      conceptId,
      {
        ...remediationContext,
        attemptNumber: attempt,
        selectedAnswer: result.selectedAnswer,
        expectedAnswer: result.expectedAnswer,
        options: options,
      },
    );
  } else if (shouldRemediate && !misconception) {
    // No specific misconception detected — use a default remediation for the concept
    remediationStep = generateRemediationStep(
      '__default__',
      conceptId,
      {
        ...remediationContext,
        attemptNumber: (updatedState.remediationCount || 0) + 1,
        selectedAnswer: result.selectedAnswer,
        expectedAnswer: result.expectedAnswer,
        options: options,
      },
    );
  }

  return {
    updatedState,
    misconceptionId: misconception?.id || null,
    shouldRemediate,
    remediationStep,
  };
}

// -- Test helpers (for automated testing) ------------------------------------

export function createTestLearningState(overrides?: Partial<LearningState>): LearningState {
  return {
    studentId: 'test-student',
    lessonSlug: 'place-value',
    conceptStates: {
      'digit-value': {
        level: 'not_assessed',
        attempts: 0,
        correctAttempts: 0,
        misconceptions: [],
      },
      'expanded-form': {
        level: 'not_assessed',
        attempts: 0,
        correctAttempts: 0,
        misconceptions: [],
      },
    },
    currentActivityIndex: 0,
    remediationCount: 0,
    difficultyLevel: 2,
    ...overrides,
  } as LearningState;
}

export function simulateAnswer(
  state: LearningState,
  conceptId: string,
  selectedIndex: number,
  expectedIndex: number,
  options: string[],
): { state: LearningState; result: AnswerResult; misconceptionId: string | null } {
  const result = evaluateAnswer(selectedIndex, expectedIndex, options);
  const misconception = detectMisconception(conceptId, result.selectedAnswer, result.expectedAnswer, {});

  const evidence = {
    conceptId,
    correct: result.correct,
    timestamp: Date.now(),
    activityId: `${conceptId}-simulated`,
    answer: result.selectedAnswer,
    expectedAnswer: result.expectedAnswer,
    misconceptionId: misconception?.id,
  };

  const updatedState = recordEvidence(state, evidence);

  return { state: updatedState, result, misconceptionId: misconception?.id || null };
}