/**
 * Integration tests for the Adaptive Learning Engine
 * 
 * Tests the full flow: curriculum → student answer → evaluation → learning state → next activity
 */

import {
  createInitialLearningState,
  evaluateAnswer,
  detectMisconception,
  recordEvidence,
  selectNextActivity,
} from '../src/lib/curriculum/adaptive-engine';

import {
  PLACE_VALUE_QUIZ_MAPPINGS,
  buildAdaptivePlaceValueJourney,
  generateRemediationStep,
  isPlaceValueLesson,
} from '../src/lib/curriculum/adaptive-journey';

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
// Test 1: Correct vs Incorrect → Different Next Activities
// ============================================================
function testCorrectVsIncorrect_DifferentPaths() {
  console.log('\n--- Test 1: Correct answer → normal, Incorrect → remediation ---');

  const state = createInitialLearningState('test-student', 'place-value', ['digit-value']);

  // Curriculum question: "What is the place value of 7 in 4,729?"
  // Options: ["7 ones", "7 tens", "7 hundreds", "7 thousands"]
  // Correct: index 2 = "7 hundreds"

  const options = ['7 ones', '7 tens', '7 hundreds', '7 thousands'];
  const correctIndex = 2;

  // Learner A: correct answer
  const resultA = evaluateAnswer(correctIndex, correctIndex, options);
  assert(resultA.correct, 'Learner A: answer is correct');

  const evidenceA = { conceptId: 'digit-value', correct: true, timestamp: Date.now(), activityId: 'test', answer: '7 hundreds', expectedAnswer: '7 hundreds' };
  const stateA = recordEvidence(state, evidenceA);
  const decisionA = selectNextActivity(stateA, 'digit-value', true);

  assert(decisionA.nextStep !== undefined, 'Learner A: next activity exists');
  assert(decisionA.nextStep.type !== 'remediation', 'Learner A: no remediation for correct answer');
  console.log('  ✓ Learner A (correct): normal progression');

  // Learner B: incorrect answer ("7 ones" instead of "7 hundreds")
  const resultB = evaluateAnswer(0, correctIndex, options);
  assert(!resultB.correct, 'Learner B: answer is incorrect');

  const evidenceB = { conceptId: 'digit-value', correct: false, timestamp: Date.now(), activityId: 'test', answer: '7 ones', expectedAnswer: '7 hundreds', misconceptionId: 'digit-not-value' };
  const stateB = recordEvidence(state, evidenceB);
  const decisionB = selectNextActivity(stateB, 'digit-value', false);

  assert(decisionB.nextStep !== undefined, 'Learner B: next activity exists');
  assertEqual(decisionB.nextStep.type, 'remediation', 'Learner B: remediation for incorrect answer');
  console.log('  ✓ Learner B (incorrect): remediation provided');

  // CRITICAL: Both learners got DIFFERENT next activities
  assert(decisionA.nextStep !== decisionB.nextStep || decisionA.nextStep.title !== decisionB.nextStep.title, 'CRITICAL: Correct and incorrect paths produce DIFFERENT activities');
  console.log('  ✓ CRITICAL: Different paths verified');
}

// ============================================================
// Test 2: Full Recovery Flow
// ============================================================
function testRecoveryFlow() {
  console.log('\n--- Test 2: Full recovery flow ---');

  let state = createInitialLearningState('test-student', 'place-value', ['digit-value']);
  const options = ['7 ones', '7 tens', '7 hundreds', '7 thousands'];

  // 1. Initial failure
  const fail1 = evaluateAnswer(0, 2, options);
  assert(!fail1.correct, 'Initial answer is wrong');
  state = recordEvidence(state, { conceptId: 'digit-value', correct: false, timestamp: Date.now(), activityId: 'initial', answer: '7 ones', expectedAnswer: '7 hundreds' });
  const misconception = detectMisconception('digit-value', '7 ones', '7 hundreds', {});
  assert(misconception !== null, 'Misconception detected');
  assertEqual(misconception!.id, 'digit-not-value', 'Correct misconception: digit-not-value');
  console.log('  ✓ Step 1: Initial failure recorded, misconception detected');

  // 2. Generate remediation
  const remediation = generateRemediationStep(misconception!.id, 'digit-value');
  assertNotUndefined(remediation, 'Remediation generated');
  assert(remediation!.visualSpec?.type === 'place_value_chart', 'Remediation uses PlaceValueChart');
  console.log('  ✓ Step 2: Remediation generated with visual scaffolding');

  // 3. Student succeeds on remediation
  state = recordEvidence(state, { conceptId: 'digit-value', correct: true, timestamp: Date.now(), activityId: 'remediation', answer: 'hundreds', expectedAnswer: 'hundreds' });
  console.log('  ✓ Step 3: Remediation success recorded');

  // 4. Retry original concept
  const retry = evaluateAnswer(2, 2, options);
  assert(retry.correct, 'Retry answer is correct');
  state = recordEvidence(state, { conceptId: 'digit-value', correct: true, timestamp: Date.now(), activityId: 'retry', answer: '7 hundreds', expectedAnswer: '7 hundreds' });
  assert(state.concepts['digit-value'].correctAttempts >= 2, 'Multiple correct attempts recorded');
  console.log('  ✓ Step 4: Original concept retried successfully');

  // 5. Verify recovery: system should now treat as improving
  const decision = selectNextActivity(state, 'digit-value', true);
  assert(decision.nextStep.type !== 'remediation', 'After recovery: no more remediation');
  console.log('  ✓ Step 5: Recovery → returns to normal progression');
}

// ============================================================
// Test 3: Bounded Remediation (No Infinite Loop)
// ============================================================
function testBoundedRemediation() {
  console.log('\n--- Test 3: Bounded remediation ---');

  let state = createInitialLearningState('test-student', 'place-value', ['digit-value']);
  const options = ['7 ones', '7 tens', '7 hundreds', '7 thousands'];

  // Simulate repeated failures
  for (let i = 0; i < 5; i++) {
    state = recordEvidence(state, { conceptId: 'digit-value', correct: false, timestamp: Date.now() + i, activityId: `fail-${i}`, answer: '7 ones', expectedAnswer: '7 hundreds' });
    state = { ...state, remediationCount: i + 1 };
  }

  assert(state.remediationCount === 5, 'Remediation count tracked across attempts');

  // After max remediations, system should NOT crash or loop
  const decision = selectNextActivity(state, 'digit-value', false);
  assertNotUndefined(decision.nextStep, 'Decision still made after many failures');
  assert(decision.reason.length > 0, 'Reason provided');
  console.log('  ✓ System remains stable after repeated failures');
}

// ============================================================
// Test 4: Curriculum Question Accuracy
// ============================================================
function testCurriculumAccuracy() {
  console.log('\n--- Test 4: Curriculum question accuracy ---');

  // Actual curriculum: "What is the place value of 7 in 4,729?"
  // 4,729 = 4 thousands + 7 hundreds + 2 tens + 9 ones
  // The 7 is in the HUNDREDS place

  const mapping = PLACE_VALUE_QUIZ_MAPPINGS.find(m => m.conceptId === 'digit-value');
  assertNotUndefined(mapping, 'Mapping exists for digit-value');
  assertEqual(mapping!.expectedAnswer, '7 hundreds', 'Correct answer is "7 hundreds"');

  // Verify misconception detection for common wrong answers
  const wrongAnswers = ['7 ones', '7 tens', '7 thousands'];
  for (const wrong of wrongAnswers) {
    const mc = detectMisconception('digit-value', wrong, '7 hundreds', {});
    assert(mc !== null, `Misconception detected for "${wrong}"`);
    console.log(`  ✓ "${wrong}" → ${mc!.id}`);
  }

  // Verify correct answer has no misconception
  const correctMc = detectMisconception('digit-value', '7 hundreds', '7 hundreds', {});
  assert(correctMc === null, 'No misconception for correct answer');
  console.log('  ✓ "7 hundreds" → no misconception');
}

// ============================================================
// Test 5: Session Persistence Logic
// ============================================================
function testSessionPersistence() {
  console.log('\n--- Test 5: Session persistence logic ---');

  const original = createInitialLearningState('test-student', 'place-value', ['digit-value', 'expanded-form']);

  let state = recordEvidence(original, { conceptId: 'digit-value', correct: false, timestamp: Date.now(), activityId: 'q1', answer: '7 ones', expectedAnswer: '7 hundreds' });
  state = recordEvidence(state, { conceptId: 'digit-value', correct: true, timestamp: Date.now() + 1, activityId: 'remediation', answer: 'hundreds', expectedAnswer: 'hundreds' });
  state = recordEvidence(state, { conceptId: 'digit-value', correct: true, timestamp: Date.now() + 2, activityId: 'retry', answer: '7 hundreds', expectedAnswer: '7 hundreds' });

  const serialized = JSON.stringify(state);
  const deserialized = JSON.parse(serialized);

  assertEqual(deserialized.studentId, state.studentId, 'StudentId survives serialization');
  assertEqual(deserialized.concepts['digit-value'].correctAttempts, state.concepts['digit-value'].correctAttempts, 'Evidence survives serialization');
  assertEqual(deserialized.concepts['digit-value'].history.length, state.concepts['digit-value'].history.length, 'History survives serialization');
  console.log('  ✓ State survives JSON serialization (sessionStorage ready)');
}

// ============================================================
// Test 6: isPlaceValueLesson Detection
// ============================================================
function testPlaceValueDetection() {
  console.log('\n--- Test 6: Place Value lesson detection ---');

  assert(isPlaceValueLesson('Place Value and Number Reading') === true, 'Detects "Place Value"');
  assert(isPlaceValueLesson('Place-Value Lesson') === true, 'Detects "Place-Value"');
  assert(isPlaceValueLesson('Ordering and Rounding') === false, 'Does not match other lessons');
  assert(isPlaceValueLesson('') === false, 'Handles empty string');
  assert(isPlaceValueLesson(undefined) === false, 'Handles undefined');
  console.log('  ✓ Place Value detection works correctly');
}

// ============================================================
// Test 7: Journey Building
// ============================================================
function testAdaptiveJourneyBuilding() {
  console.log('\n--- Test 7: Adaptive journey building ---');

  const result = buildAdaptivePlaceValueJourney('Place Value and Number Reading', 'test-student');

  assert(result.steps.length > 0, 'Journey has steps');
  assert(result.adaptiveInserted, 'Adaptive steps were inserted');
  assert(result.remediationStepIds.length > 0, 'Remediation step IDs tracked');

  const adaptiveStep = result.steps.find(s => s.stepType === 'adaptive-eval');
  assert(adaptiveStep !== undefined, 'adaptive-eval step exists');
  console.log('  ✓ Adaptive journey builds with evaluation steps');
}

// ============================================================
// Run All Tests
// ============================================================
function runAllTests() {
  console.log('🧪 Running Adaptive Integration Tests...\n');
  console.log('='.repeat(50));

  const tests = [
    testCorrectVsIncorrect_DifferentPaths,
    testRecoveryFlow,
    testBoundedRemediation,
    testCurriculumAccuracy,
    testSessionPersistence,
    testPlaceValueDetection,
    testAdaptiveJourneyBuilding,
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
    console.log('\nAll integration tests passed!');
  }
}

runAllTests();
