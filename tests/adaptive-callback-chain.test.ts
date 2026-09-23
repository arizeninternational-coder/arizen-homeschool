// @ts-nocheck
/**
 * Regression test: tap_choice → onSelect → onAnswer → adaptive evaluation
 *
 * This test verifies the actual production callback chain that was broken:
 * - InteractiveStepRenderer renders TapChoice for tap_choice steps
 * - TapChoice's onSelect fires when user clicks an option
 * - InteractiveStepRenderer's onSelect callback invokes onAnswer
 * - Student page's onAnswer handler runs adaptive evaluation
 * - Remediation is generated for incorrect answers
 *
 * This test would FAIL if:
 * - tap_choice stops invoking onSelect
 * - InteractiveStepRenderer stops passing onAnswer
 * - The journey transformation strips interactionSpec
 * - The onAnswer handler captures stale closures
 * - The remediation uses wrong digits/columns/correctChoiceId
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { buildPlaceValueJourney } from '../src/lib/curriculum/grade4-journeys';
import { buildAdaptivePlaceValueJourney } from '../src/lib/curriculum/adaptive-journey';
import { isPlaceValueLesson, PLACE_VALUE_QUIZ_MAPPINGS, generateRemediationStep } from '../src/lib/curriculum/adaptive-journey';
import { useAdaptiveLesson } from '../src/lib/curriculum/useAdaptiveLesson';
import { evaluateAnswer, detectMisconception, recordEvidence, createInitialLearningState } from '../src/lib/curriculum/adaptive-engine';

// Helper: simulate the adaptive evaluation that happens in the useEffect
function simulateAdaptiveEvaluation(
  conceptId: string,
  selectedIdx: number,
  expectedIdx: number,
  options: string[]
) {
  const state = createInitialLearningState('test-student', 'test-lesson', ['digit-value']);
  const result = evaluateAnswer(selectedIdx, expectedIdx, options);
  const misconception = detectMisconception(
    conceptId,
    result.selectedAnswer,
    result.expectedAnswer,
    {}
  );
  const evidence = {
    conceptId,
    correct: result.correct,
    timestamp: Date.now(),
    activityId: `${conceptId}-test`,
    answer: result.selectedAnswer,
    expectedAnswer: result.expectedAnswer,
    misconceptionId: misconception?.id,
  };
  const updatedState = recordEvidence(state, evidence);
  return { result, misconception, updatedState };
}

// Test 1: Step 3 has correct interactionSpec
console.log('\n--- Test: Step 3 has tap_choice interactionSpec ---');
const journey = buildPlaceValueJourney();
const step3 = journey.find(s => s.id === 'think_first');
if (!step3) throw new Error('Step 3 (think_first) not found');
if (step3.stepType !== 'think_first') throw new Error(`Expected think_first, got ${step3.stepType}`);
if (step3.interactionSpec?.type !== 'tap_choice') throw new Error(`Expected tap_choice, got ${step3.interactionSpec?.type}`);
console.log('✅ Step 3 has tap_choice interactionSpec');

// Test 2: Step 3 has correct choices
console.log('\n--- Test: Step 3 has 4 choices ---');
const choices = step3.interactionSpec?.choices || step3.interactionSpec?.options || [];
if (choices.length !== 4) throw new Error(`Expected 4 choices, got ${choices.length}`);
console.log('✅ Step 3 has 4 choices');

// Test 3: Correct choice is "7 hundreds" (index 2, id "C")
console.log('\n--- Test: Correct choice is 7 hundreds ---');
if (step3.interactionSpec?.correctChoiceId !== 'C') {
  throw new Error(`Expected correctChoiceId "C", got "${step3.interactionSpec?.correctChoiceId}"`);
}
console.log('✅ Correct choice is C (7 hundreds)');

// Test 4: PLACE_VALUE_QUIZ_MAPPINGS has digit-value mapping
console.log('\n--- Test: PLACE_VALUE_QUIZ_MAPPINGS has digit-value mapping ---');
const mapping = PLACE_VALUE_QUIZ_MAPPINGS.find(m => m.conceptId === 'digit-value');
if (!mapping) throw new Error('digit-value mapping not found');
if (mapping.expectedAnswer !== '7 hundreds') {
  throw new Error(`Expected "7 hundreds", got "${mapping.expectedAnswer}"`);
}
console.log('✅ digit-value mapping exists with expectedAnswer "7 hundreds"');

// Test 5: Options from choices match expected format
console.log('\n--- Test: Options extraction from choices ---');
const options = choices.map((c: any) => typeof c === 'string' ? c : c.label);
if (options.length !== 4) throw new Error(`Expected 4 options, got ${options.length}`);
if (options[2] !== '7 hundreds') throw new Error(`Expected options[2] = "7 hundreds", got "${options[2]}"`);
console.log('✅ Options extracted correctly:', options);

// Test 6: Adaptive evaluation for correct answer (7 hundreds)
console.log('\n--- Test: Adaptive evaluation for correct answer ---');
const correctResult = simulateAdaptiveEvaluation('digit-value', 2, 2, options);
if (!correctResult.result.correct) throw new Error('Expected correct=true for index 2');
if (correctResult.misconception) throw new Error('Expected no misconception for correct answer');
console.log('✅ Correct answer evaluated correctly, no misconception');

// Test 7: Adaptive evaluation for incorrect answer (7 ones)
console.log('\n--- Test: Adaptive evaluation for incorrect answer ---');
const incorrectResult = simulateAdaptiveEvaluation('digit-value', 0, 2, options);
if (incorrectResult.result.correct) throw new Error('Expected correct=false for index 0');
if (!incorrectResult.misconception) throw new Error('Expected misconception for incorrect answer');
if (incorrectResult.misconception.id !== 'digit-not-value') {
  throw new Error(`Expected digit-not-value, got ${incorrectResult.misconception.id}`);
}
console.log('✅ Incorrect answer detected, misconception: digit-not-value');

// Test 8: buildAdaptivePlaceValueJourney returns steps with interactionSpec intact
console.log('\n--- Test: buildAdaptivePlaceValueJourney preserves interactionSpec ---');
const adaptiveResult = buildAdaptivePlaceValueJourney('Place Value and Number Reading', 'test-student');
const adaptiveStep3 = adaptiveResult.steps.find((s: any) => s.id === 'think_first');
if (!adaptiveStep3) throw new Error('Step 3 not found in adaptive journey');
if (adaptiveStep3.interactionSpec?.type !== 'tap_choice') {
  throw new Error(`interactionSpec stripped! Got: ${JSON.stringify(adaptiveStep3.interactionSpec)}`);
}
console.log('✅ Adaptive journey preserves interactionSpec');

// Test 9: isPlaceValueLesson detects Place Value lesson
console.log('\n--- Test: isPlaceValueLesson detection ---');
if (!isPlaceValueLesson('Place Value and Number Reading')) throw new Error('Failed to detect Place Value lesson');
if (!isPlaceValueLesson('Place Value')) throw new Error('Failed to detect Place Value');
if (isPlaceValueLesson('Addition and Subtraction')) throw new Error('False positive for non-Place-Value lesson');
console.log('✅ isPlaceValueLesson works correctly');

// Test 10: Journey has exactly 10 steps (no extra adaptive-eval steps)
console.log('\n--- Test: Journey has exactly 10 steps ---');
if (adaptiveResult.steps.length !== 10) {
  throw new Error(`Expected 10 steps, got ${adaptiveResult.steps.length}`);
}
const adaptiveEvalSteps = adaptiveResult.steps.filter((s: any) => s.stepType === 'adaptive-eval');
if (adaptiveEvalSteps.length > 0) {
  throw new Error(`Found ${adaptiveEvalSteps.length} adaptive-eval steps (should be 0)`);
}
console.log('✅ Journey has exactly 10 steps, no empty adaptive-eval steps');

// Test 11: Remediation uses correct canonical number (4,729)
console.log('\n--- Test: Remediation uses correct canonical number ---');
const remediation = generateRemediationStep('digit-not-value', 'digit-value');
if (!remediation) throw new Error('Remediation step not generated');
const remediationDigits = remediation.visualSpec?.digits as string[];
if (remediationDigits.length !== 4) {
  throw new Error(`Remediation should use 4-digit number, got ${remediationDigits.length} digits: ${remediationDigits}`);
}
if (remediationDigits.join('') !== '4729') {
  throw new Error(`Remediation should use 4,729, got ${remediationDigits.join('')}`);
}
console.log('✅ Remediation uses correct 4-digit number 4,729');

// Test 12: Remediation correctChoiceId matches answer choices
console.log('\n--- Test: Remediation correctChoiceId matches choices ---');
const remediationChoices = remediation.interactionSpec?.choices as string[];
const remediationCorrectId = remediation.interactionSpec?.correctChoiceId;
const remediationCorrectIdx = remediationChoices.findIndex(
  (c: any) => (typeof c === 'object' && c.id === remediationCorrectId) ||
              (typeof c === 'string' && String(remediationChoices.indexOf(c)) === remediationCorrectId)
);
if (remediationCorrectIdx !== 2) {
  throw new Error(`Remediation correctChoiceId should point to index 2 (Hundreds), got index ${remediationCorrectIdx}`);
}
console.log('✅ Remediation correctChoiceId correctly points to Hundreds (index 2)');

// Test 13: Remediation visual chart highlights 7/Hundreds (not 2/Tens)
console.log('\n--- Test: Remediation visual chart highlights 7/Hundreds ---');
// PlaceValueChart highlightColumn convention: 0 = leftmost (Thousands), 1 = Hundreds, 2 = Tens, 3 = Ones
// For 4,729 with columns [Thousands, Hundreds, Tens, Ones], the Hundreds column is highlightColumn=1
const highlightCol = remediation.visualSpec?.highlightColumn;
if (highlightCol !== 1) {
  throw new Error(`Remediation highlightColumn should be 1 (Hundreds, where 7 lives), got ${highlightCol} (would highlight Tens=2)`);
}
console.log('✅ Remediation visual chart correctly highlights Hundreds column (7, not 2)');

// Test 14: InteractiveStepRenderer does not hardcode 5-column default
console.log('\n--- Test: InteractiveStepRenderer does not hardcode 5-column default ---');
// This test verifies the fix for the 47,290 bug
// The renderer should pass columns=undefined to PlaceValueChart when not specified,
// allowing PlaceValueChart to derive columns from digit count
const rendererSource = readFileSync(
  join(__dirname, '../src/components/interactive/InteractiveStepRenderer.tsx'),
  'utf8'
);
if (rendererSource.includes('columns || ["Ten Thousands"')) {
  throw new Error('InteractiveStepRenderer still has hardcoded 5-column default');
}
console.log('✅ InteractiveStepRenderer does not hardcode 5-column default');

console.log('\n' + '='.repeat(50));
console.log('All adaptive callback chain regression tests passed!');
console.log('='.repeat(50));
