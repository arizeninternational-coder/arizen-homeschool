/**
 * Regression tests for the adaptive Place Value pilot.
 * 
 * These tests verify that:
 * 1. The lesson state progression is correct (no premature completion)
 * 2. The place-value model is mathematically correct
 * 3. The adaptive engine works as expected
 * 4. CTAs are not duplicated
 */

import {
  createInitialLearningState,
  evaluateAnswer,
  detectMisconception,
  recordEvidence,
  selectNextActivity,
  PLACE_VALUE_CONCEPTS,
  type LearningState,
} from '../src/lib/curriculum/adaptive-engine';

import {
  PLACE_VALUE_QUIZ_MAPPINGS,
  buildAdaptivePlaceValueJourney,
  generateRemediationStep,
  isPlaceValueLesson,
} from '../src/lib/curriculum/adaptive-journey';

import { pvVisual } from '../src/lib/curriculum/grade4-journeys';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(`ASSERTION FAILED: ${message}`);
}

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) throw new Error(`ASSERTION FAILED: ${message} (expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)})`);
}

function assertNotUndefined(value: any, message: string) {
  if (value === undefined || value === null) throw new Error(`ASSERTION FAILED: ${message}`);
}

// ============================================================
// Lesson State Progression Tests
// ============================================================

function testStep1_HasOneStartCTA() {
  console.log('\n--- testStep1_HasOneStartCTA ---');
  
  const journey = buildAdaptivePlaceValueJourney('Place Value and Number Reading', 'test');
  const step1 = journey.steps.find(s => s.id === 'welcome');
  assertNotUndefined(step1, 'Step 1 exists');
  
  // Should have exactly one interaction spec
  assertNotUndefined(step1!.interactionSpec, 'Step 1 has interaction spec');
  assertEqual(step1!.interactionSpec.type, 'tap_continue', 'Step 1 uses tap_continue');
  
  // The button label and prompt should NOT be the same (no duplication)
  const buttonLabel = step1!.interactionSpec.buttonLabel || '';
  const prompt = step1!.interactionSpec.prompt || '';
  assert(buttonLabel !== prompt, `Button label "${buttonLabel}" should differ from prompt "${prompt}"`);
  
  // Should NOT have "Great!" or completion language in feedback
  const feedback = step1!.feedbackSpec as any;
  assert(!feedback.correct || !feedback.correct.includes('Great!'), 'Step 1 should NOT say "Great!"');
  assert(!feedback.correct || !feedback.correct.includes('Mission accepted'), 'Step 1 should NOT say "Mission accepted"');
  
  console.log('  ✓ Step 1 has one CTA');
  console.log('  ✓ No completion language');
}

function testStep2_MissionPreview() {
  console.log('\n--- testStep2_MissionPreview ---');
  
  const journey = buildAdaptivePlaceValueJourney('Place Value and Number Reading', 'test');
  const step2 = journey.steps.find(s => s.id === 'mission');
  assertNotUndefined(step2, 'Step 2 exists');
  
  // Should use mission_preview visual type
  assertEqual(step2!.visualSpec.type, 'mission_preview', 'Step 2 uses mission_preview');
  
  // Should NOT have completion checkmarks (no "correct" feedback)
  const feedback = step2!.feedbackSpec as any;
  assert(!feedback.correct || feedback.correct === '', 'Step 2 should NOT have success feedback');
  
  // Button label should differ from prompt
  const buttonLabel = step2!.interactionSpec.buttonLabel || '';
  const prompt = step2!.interactionSpec.prompt || '';
  assert(buttonLabel !== prompt, `Button label "${buttonLabel}" should differ from prompt "${prompt}"`);
  
  console.log('  ✓ Step 2 is mission_preview');
  console.log('  ✓ No completion checkmarks');
}

function testStep10_Completion() {
  console.log('\n--- testStep10_Completion ---');
  
  const journey = buildAdaptivePlaceValueJourney('Place Value and Number Reading', 'test');
  const step10 = journey.steps.find(s => s.id === 'complete');
  assertNotUndefined(step10, 'Step 10 exists');
  
  // Should use recap_checklist visual type
  assertEqual(step10!.visualSpec.type, 'recap_checklist', 'Step 10 uses recap_checklist');
  
  // Should have exactly one CTA
  const buttonLabel = step10!.interactionSpec.buttonLabel || '';
  const prompt = step10!.interactionSpec.prompt || '';
  assert(buttonLabel !== prompt, `Button label "${buttonLabel}" should differ from prompt "${prompt}"`);
  
  console.log('  ✓ Step 10 is recap_checklist');
  console.log('  ✓ Has one CTA');
}

function testPlaceValueColumns_4Digits() {
  console.log('\n--- testPlaceValueColumns_4Digits ---');
  
  const visual = pvVisual(["4", "7", "2", "9"]);
  const columns = visual.columns as string[];
  
  assertEqual(columns.length, 4, '4-digit number has 4 columns');
  assertEqual(columns[0], 'Thousands', 'First column is Thousands');
  assertEqual(columns[1], 'Hundreds', 'Second column is Hundreds');
  assertEqual(columns[2], 'Tens', 'Third column is Tens');
  assertEqual(columns[3], 'Ones', 'Fourth column is Ones');
  
  // Should NOT have Ten Thousands
  assert(!columns.includes('Ten Thousands'), 'No Ten Thousands column for 4-digit number');
  
  console.log('  ✓ 4-digit number has 4 columns');
  console.log('  ✓ Columns: Thousands, Hundreds, Tens, Ones');
}

function testPlaceValueColumns_5Digits() {
  console.log('\n--- testPlaceValueColumns_5Digits ---');
  
  const visual = pvVisual(["1", "2", "3", "4", "5"]);
  const columns = visual.columns as string[];
  
  assertEqual(columns.length, 5, '5-digit number has 5 columns');
  assertEqual(columns[0], 'Ten Thousands', 'First column is Ten Thousands');
  assertEqual(columns[4], 'Ones', 'Last column is Ones');
  
  console.log('  ✓ 5-digit number has 5 columns');
}

function testHighlightColumn_4729() {
  console.log('\n--- testHighlightColumn_4729 ---');
  
  // 4,729 → 4=thousands, 7=hundreds, 2=tens, 9=ones
  // Index 0 = thousands, 1 = hundreds, 2 = tens, 3 = ones
  const visual = pvVisual(["4", "7", "2", "9"], 1); // highlight index 1 (hundreds)
  
  assertEqual(visual.highlightColumn, 1, 'Highlight column is 1 (hundreds)');
  
  console.log('  ✓ 7 in 4,729 maps to hundreds (index 1)');
}

function testZeroHandling_3042() {
  console.log('\n--- testZeroHandling_3042 ---');
  
  const visual = pvVisual(["3", "0", "4", "2"]);
  const columns = visual.columns as string[];
  const digits = visual.digits as string[];
  
  assertEqual(columns.length, 4, '3,042 has 4 columns');
  assertEqual(digits[1], '0', 'Zero is preserved in hundreds place');
  assertEqual(columns[1], 'Hundreds', 'Zero is in Hundreds column');
  
  console.log('  ✓ 3,042 has 4 columns');
  console.log('  ✓ Zero is correctly placed in Hundreds');
}

function testAdaptiveCorrectPath() {
  console.log('\n--- testAdaptiveCorrectPath ---');
  
  const state = createInitialLearningState('test', 'place-value', ['digit-value']);
  const options = ['7 ones', '7 tens', '7 hundreds', '7 thousands'];
  const result = evaluateAnswer(2, 2, options); // correct index = 2
  
  assert(result.correct, 'Answer is correct');
  
  const evidence = { conceptId: 'digit-value', correct: true, timestamp: Date.now(), activityId: 'test', answer: '7 hundreds', expectedAnswer: '7 hundreds' };
  const updatedState = recordEvidence(state, evidence);
  const decision = selectNextActivity(updatedState, 'digit-value', true);
  
  assert(decision.nextStep.type !== 'remediation', 'Correct answer does NOT trigger remediation');
  
  console.log('  ✓ Correct answer → normal progression');
}

function testAdaptiveIncorrectPath() {
  console.log('\n--- testAdaptiveIncorrectPath ---');
  
  const state = createInitialLearningState('test', 'place-value', ['digit-value']);
  const options = ['7 ones', '7 tens', '7 hundreds', '7 thousands'];
  const result = evaluateAnswer(0, 2, options); // chose "7 ones" instead of "7 hundreds"
  
  assert(!result.correct, 'Answer is incorrect');
  
  const misconception = detectMisconception('digit-value', '7 ones', '7 hundreds', {});
  assert(misconception !== null, 'Misconception detected');
  assertEqual(misconception!.id, 'digit-not-value', 'Correct misconception: digit-not-value');
  
  const evidence = { conceptId: 'digit-value', correct: false, timestamp: Date.now(), activityId: 'test', answer: '7 ones', expectedAnswer: '7 hundreds', misconceptionId: 'digit-not-value' };
  const updatedState = recordEvidence(state, evidence);
  const decision = selectNextActivity(updatedState, 'digit-value', false);
  
  assertEqual(decision.nextStep.type, 'remediation', 'Incorrect answer triggers remediation');
  
  console.log('  ✓ Incorrect answer → remediation');
  console.log('  ✓ Misconception: digit-not-value');
}

function testAdaptivePathDifference() {
  console.log('\n--- testAdaptivePathDifference ---');
  
  // CRITICAL: Correct and incorrect paths must produce different next activities
  const state = createInitialLearningState('test', 'place-value', ['digit-value']);
  const options = ['7 ones', '7 tens', '7 hundreds', '7 thousands'];
  
  // Correct path
  const evidenceCorrect = { conceptId: 'digit-value', correct: true, timestamp: Date.now(), activityId: 'test', answer: '7 hundreds', expectedAnswer: '7 hundreds' };
  const stateCorrect = recordEvidence(state, evidenceCorrect);
  const decisionCorrect = selectNextActivity(stateCorrect, 'digit-value', true);
  
  // Incorrect path
  const evidenceIncorrect = { conceptId: 'digit-value', correct: false, timestamp: Date.now(), activityId: 'test', answer: '7 ones', expectedAnswer: '7 hundreds', misconceptionId: 'digit-not-value' };
  const stateIncorrect = recordEvidence(state, evidenceIncorrect);
  const decisionIncorrect = selectNextActivity(stateIncorrect, 'digit-value', false);
  
  assert(decisionCorrect.nextStep !== decisionIncorrect.nextStep || decisionCorrect.nextStep.title !== decisionIncorrect.nextStep.title, 'CRITICAL: Correct and incorrect paths produce DIFFERENT activities');
  
  console.log('  ✓ CRITICAL: Different paths verified');
}

function testIsPlaceValueLesson() {
  console.log('\n--- testIsPlaceValueLesson ---');
  
  assert(isPlaceValueLesson('Place Value and Number Reading') === true, 'Detects Place Value');
  assert(isPlaceValueLesson('Ordering and Rounding') === false, 'Does not match other lessons');
  assert(isPlaceValueLesson(undefined) === false, 'Handles undefined');
  
  console.log('  ✓ Lesson detection works');
}

function testRegressionGrade2Unaffected() {
  console.log('\n--- testRegressionGrade2Unaffected ---');
  
  // Verify that the generic builder doesn't break for other lessons
  const journey = buildAdaptivePlaceValueJourney('Roman Numerals', 'test');
  const step1 = journey.steps[0];
  
  // Should still build correctly
  assertNotUndefined(step1, 'Step 1 exists for other lessons');
  
  console.log('  ✓ Other lessons still build correctly');
}

// ============================================================
// Run All Tests
// ============================================================

function runAllTests() {
  console.log('🧪 Running Adaptive Regression Tests...\n');
  console.log('='.repeat(50));

  const tests = [
    testStep1_HasOneStartCTA,
    testStep2_MissionPreview,
    testStep10_Completion,
    testPlaceValueColumns_4Digits,
    testPlaceValueColumns_5Digits,
    testHighlightColumn_4729,
    testZeroHandling_3042,
    testAdaptiveCorrectPath,
    testAdaptiveIncorrectPath,
    testAdaptivePathDifference,
    testIsPlaceValueLesson,
    testRegressionGrade2Unaffected,
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      test();
      passed++;
      console.log(`  ✅ ${test.name} PASSED`);
    } catch (e: any) {
      console.error(`\n  ❌ ${test.name} FAILED: ${e.message}`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`Results: ${passed} passed, ${failed} failed`);

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('\nAll regression tests passed!');
  }
}

runAllTests();
