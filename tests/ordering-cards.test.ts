/**
 * Ordering-question parsing — the contract that lets number cards replace the
 * four pre-sorted multiple-choice strings without changing scoring.
 *
 * The critical assertion is section 3: the card UI's computed answer must be
 * exactly the string the curriculum config already calls `correctAnswer`.
 * If that drifts, a learner who orders the cards perfectly would be marked
 * wrong, which is worse than not having the feature.
 *
 * Run: npx tsx tests/ordering-cards.test.ts
 */
import { parseOrderingQuestion, formatOrder, isCorrectOrder } from '../src/lib/curriculum/order-question';
import { ORDERING_ROUNDING_CONFIG } from '../src/lib/curriculum/adaptive/ordering-rounding.config';
import { PLACE_VALUE_ADAPTIVE_CONFIG } from '../src/lib/curriculum/adaptive/place-value.config';
import { getAllAdaptiveLessonConfigs } from '../src/lib/curriculum/adaptive/registry';

let pass = 0;
let fail = 0;
const check = (name: string, cond: boolean, detail?: string) => {
  if (cond) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name}${detail ? ' — ' + detail : ''}`); }
};

console.log('── 1. the prompt from the live Grade 4 lesson ──');
const live = parseOrderingQuestion('Order these numbers from SMALLEST to LARGEST: 345, 521, 298, 476');
check('recognised', live !== null);
check('found four numbers', live?.numbers.length === 4, String(live?.numbers.length));
check('kept the prompt order (not pre-sorted)', live?.numbers.join(',') === '345,521,298,476', live?.numbers.join(','));
check('direction is ascending', live?.direction === 'asc');
check('answer is the sorted string', live?.answer === '298, 345, 476, 521', live?.answer);

console.log('\n── 2. direction and shape handling ──');
const desc = parseOrderingQuestion('Order these numbers from LARGEST to SMALLEST: 12, 340, 56');
check('descending direction detected', desc?.direction === 'desc');
check('descending answer is reversed-sorted', desc?.answer === '340, 56, 12', desc?.answer);

const lower = parseOrderingQuestion('order these numbers from smallest to largest: 9, 4, 7');
check('case-insensitive', lower?.answer === '4, 7, 9', lower?.answer);

check('rejects a rounding question', parseOrderingQuestion('Round 728 to the nearest ten.') === null);
check('rejects when direction words are missing', parseOrderingQuestion('Order these numbers: 4, 9, 2') === null);
check('rejects a single number', parseOrderingQuestion('Order these from smallest to largest: 5') === null);
check('rejects null/empty', parseOrderingQuestion(null) === null && parseOrderingQuestion('') === null);
check('rejects an all-identical set', parseOrderingQuestion('Order these from smallest to largest: 7, 7, 7') === null);

console.log('\n── 3. computed answer matches the curriculum config exactly ──');
let compared = 0;
for (const cfg of getAllAdaptiveLessonConfigs()) {
  for (const activity of cfg.activities || []) {
    const prompt = (activity as any).prompt as string | undefined;
    const expected = (activity as any).correctAnswer as string | undefined;
    const parsed = parseOrderingQuestion(prompt);
    if (!parsed) continue;
    compared++;
    check(
      `${cfg.lessonSlug} / ${(activity as any).activityId}: card answer === correctAnswer`,
      expected ? isCorrectOrder(parsed.answer, expected) : false,
      `card="${parsed.answer}" config="${expected}"`
    );
    // And the four existing options must still contain the correct answer, so a
    // learner who arrives at the right order maps onto an existing choice index.
    const choices: string[] = (activity as any).choices || [];
    if (choices.length) {
      check(
        `${cfg.lessonSlug} / ${(activity as any).activityId}: correct answer is among the choices`,
        choices.some((c) => isCorrectOrder(c, expected || '')),
        choices.join(' | ')
      );
    }
  }
}
check('at least one adaptive ordering activity exists', compared > 0, String(compared));

console.log('\n── 4. helpers ──');
check('formatOrder joins with ", "', formatOrder([1, 2, 3]) === '1, 2, 3');
check('isCorrectOrder tolerates spacing', isCorrectOrder('298,345,476,521', '298, 345, 476, 521'));
check('isCorrectOrder rejects a wrong order', !isCorrectOrder('345, 298, 476, 521', '298, 345, 476, 521'));

console.log('\n── 5. non-ordering lessons are untouched ──');
const pvOrdering = (PLACE_VALUE_ADAPTIVE_CONFIG.activities || []).filter(
  (a: any) => parseOrderingQuestion(a.prompt) !== null
);
check('place-value config has no ordering prompts (falls back to MC)', pvOrdering.length === 0, String(pvOrdering.length));
check('ordering-rounding config is registered', ORDERING_ROUNDING_CONFIG.lessonSlug.length > 0);

console.log('\n' + '='.repeat(32));
console.log(`PASS: ${pass}   FAIL: ${fail}   TOTAL: ${pass + fail}`);
if (fail > 0) {
  console.log('ordering contract broken — cards would mis-score learners.');
  process.exit(1);
}
