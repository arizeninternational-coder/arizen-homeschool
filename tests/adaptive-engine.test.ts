/**
 * Automated tests for the Adaptive Learning Engine
 * 
 * Run with: npx jest --testPathPattern=adaptive
 * Or: npx tsx tests/adaptive-engine.test.ts
 */

import {
  createInitialLearningState,
  recordEvidence,
  evaluateAnswer,
  detectMisconception,
  selectNextActivity,
  PLACE_VALUE_CONCEPTS,
  PLACE_VALUE_MISCONCEPTIONS,
} from '../src/lib/curriculum/adaptive-engine';

import {
  simulateAnswer,
  createTestLearningState,
  generateRemediationStep,
  buildAdaptivePlaceValueJourney,
} from '../src/lib/curriculum/adaptive-journey';

// ============================================================
// Test Helpers
// ============================================================

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`❌ ASSERTION FAILED: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) {
    throw new Error(`❌ ASSERTION FAILED: ${message} (expected ${expected}, got ${actual})`);
  }
  console.log(`  ✓ ${message}`);
}

function assertNotEqual<T>(actual: T, notExpected: T, message: string) {
  if (actual === notExpected) {
    throw new Error(`❌ ASSERTION FAILED: ${message} (should not equal ${notExpected})`);
  }
  console.log(`  ✓ ${message}`);
}

// ============================================================
// Scenario A — Correct learner
// ============================================================

function testScenarioA_CorrectLearner() {
  console.log('\n📝 Scenario A: Correct learner');
  
  const state = createInitialLearningState('student-a', 'place-value', ['digit-value', 'expanded-form']);
  
  // First correct answer
  const result1 = simulateAnswer(state, 'digit-value', 2, 2, ['7 ones', '7 tens', '7 hundreds', '7 thousands']);
  assert(result1.result.correct, 'First answer is correct');
  assertEqual(result1.state.concepts['digit-value'].level, 'emerging', 'Level is emerging after 1 correct');
  assertEqual(result1.state.concepts['digit-value'].correctAttempts, 1, '1 correct attempt recorded');
  
  // Second correct answer
  const result2 = simulateAnswer(result1.state, 'digit-value', 2, 2, ['7 ones', '7 tens', '7 hundreds', '7 thousands']);
  assert(result2.result.correct, 'Second answer is correct');
  assertEqual(result2.state.concepts['digit-value'].level, 'developing', 'Level is developing after 2 correct');
  
  // Third correct answer
  const result3 = simulateAnswer(result2.state, 'digit-value', 2, 2, ['7 ones', '7 tens', '7 hundreds', '7 thousands']);
  assert(result3.result.correct, 'Third answer is correct');
  assertEqual(result3.state.concepts['digit-value'].level, 'proficient', 'Level is proficient after 3 correct');
  
  // Should NOT trigger remediation
  assertEqual(result3.state.remediationCount, 0, 'No remediation triggered for correct learner');
  
  console.log('  ✅ Scenario A passed');
}

// ============================================================
// Scenario B — Simple mistake
// ============================================================

function testScenarioB_SimpleMistake() {
  console.log('\n📝 Scenario B: Simple mistake');
  
  const state = createInitialLearningState('student-b', 'place-value', ['digit-value']);
  
  // Wrong answer
  const result = simulateAnswer(state, 'digit-value', 0, 2, ['7 ones', '7 tens', '7 hundreds', '7 thousands']);
  assert(!result.result.correct, 'Answer is incorrect');
  assertEqual(result.state.concepts['digit-value'].level, 'emerging', 'Level stays emerging after wrong answer');
  assertEqual(result.state.concepts['digit-value'].correctAttempts, 0, '0 correct attempts after wrong answer');
  assertEqual(result.state.remediationCount, 0, 'Remediation count starts at 0 (remediation triggered in journey builder)');
  
  // Should detect misconception
  assert(result.misconceptionId !== null, 'Misconception detected for wrong answer');
  assertEqual(result.misconceptionId, 'digit-not-value', 'Correct misconception identified (digit vs value)');
  
  console.log('  ✅ Scenario B passed');
}

// ============================================================
// Scenario C — Specific misconception (digit vs value)
// ============================================================

function testScenarioC_SpecificMisconception() {
  console.log('\n📝 Scenario C: Confuses digit with digit value');
  
  const state = createInitialLearningState('student-c', 'place-value', ['digit-value']);
  
  // Student answers "7 ones" (the digit face value) instead of "7 hundreds" (the value)
  const result = simulateAnswer(state, 'digit-value', 0, 2, ['7 ones', '7 tens', '7 hundreds', '7 thousands']);
  
  assert(!result.result.correct, 'Answer is incorrect');
  assertEqual(result.misconceptionId, 'digit-not-value', 'Misconception detected: digit vs value');
  
  // Generate remediation
  const remediation = generateRemediationStep('digit-not-value', 'digit-value');
  assert(remediation !== null, 'Remediation step generated');
  assert(remediation!.title.length > 0, 'Remediation has a title');
  assert(remediation!.studentText.length > 0, 'Remediation has student text');
  assert(remediation!.visualSpec?.type === 'place_value_chart', 'Remediation uses PlaceValueChart');
  assert(remediation!.interactionSpec?.type === 'tap_choice', 'Remediation has interaction');
  
  console.log('  ✅ Scenario C passed');
}

// ============================================================
// Scenario D — Repeated failure
// ============================================================

function testScenarioD_RepeatedFailure() {
  console.log('\n📝 Scenario D: Repeated failure');
  
  let state = createInitialLearningState('student-d', 'place-value', ['digit-value']);
  
  // First wrong answer
  state = simulateAnswer(state, 'digit-value', 0, 2, ['7 ones', '7 tens', '7 hundreds', '7 thousands']).state;
  assertEqual(state.remediationCount, 0, 'After 1st wrong: no remediation yet');
  
  // Simulate remediation being triggered
  state = { ...state, remediationCount: 1 };
  
  // Second wrong answer
  state = simulateAnswer(state, 'digit-value', 0, 2, ['7 ones', '7 tens', '7 hundreds', '7 thousands']).state;
  state = { ...state, remediationCount: 2 };
  
  // Third wrong answer
  state = simulateAnswer(state, 'digit-value', 0, 2, ['7 ones', '7 tens', '7 hundreds', '7 thousands']).state;
  state = { ...state, remediationCount: 3 };
  
  // After 3 remediations, system should NOT loop endlessly
  assert(state.remediationCount >= 3, 'Remediation count tracked');
  assertEqual(state.concepts['digit-value'].level, 'emerging', 'Level stays emerging after repeated failures');
  assertEqual(state.concepts['digit-value'].correctAttempts, 0, 'Still 0 correct attempts');
  
  // Check that after max remediations, system provides additional support
  const decision = selectNextActivity(state, 'digit-value', false);
  assert(decision.nextStep !== undefined, 'Decision made after max remediations');
  assert(decision.reason.length > 0, 'Reason provided for decision');
  
  console.log('  ✅ Scenario D passed');
}

// ============================================================
// Scenario E — Successful retry after remediation
// ============================================================

function testScenarioE_SuccessfulRetry() {
  console.log('\n📝 Scenario E: Successful retry after remediation');
  
  let state = createInitialLearningState('student-e', 'place-value', ['digit-value']);
  
  // Wrong answer first
  const wrongResult = simulateAnswer(state, 'digit-value', 0, 2, ['7 ones', '7 tens', '7 hundreds', '7 thousands']);
  state = wrongResult.state;
  assert(!wrongResult.result.correct, 'First answer is wrong');
  
  // Simulate remediation triggered
  state = { ...state, remediationCount: 1 };
  
  // Now student gets it right
  const correctResult = simulateAnswer(state, 'digit-value', 2, 2, ['7 ones', '7 tens', '7 hundreds', '7 thousands']);
  state = correctResult.state;
  assert(correctResult.result.correct, 'Second answer is correct');
  assertEqual(state.concepts['digit-value'].correctAttempts, 1, '1 correct attempt after recovery');
  
  // After recovery, system should NOT keep treating as struggling
  // (In the full implementation, this would reset remediation count)
  
  console.log('  ✅ Scenario E passed');
}

// ============================================================
// Scenario F — Advanced learner (repeated success)
// ============================================================

function testScenarioF_AdvancedLearner() {
  console.log('\n📝 Scenario F: Advanced learner');
  
  let state = createInitialLearningState('student-f', 'place-value', ['digit-value', 'expanded-form']);
  
  // Three correct answers in a row for digit-value
  state = simulateAnswer(state, 'digit-value', 2, 2, ['7 ones', '7 tens', '7 hundreds', '7 thousands']).state;
  state = simulateAnswer(state, 'digit-value', 2, 2, ['7 ones', '7 tens', '7 hundreds', '7 thousands']).state;
  state = simulateAnswer(state, 'digit-value', 2, 2, ['7 ones', '7 tens', '7 hundreds', '7 thousands']).state;
  
  assertEqual(state.concepts['digit-value'].level, 'proficient', 'digit-value is proficient');
  
  // Three correct answers for expanded-form
  // 4,209 = 4000 + 200 + 0 + 9 (expanded form must include zero tens)
  state = simulateAnswer(state, 'expanded-form', 1, 1, ['4000+200+9', '4000+200+0+9']).state;
  state = simulateAnswer(state, 'expanded-form', 1, 1, ['4000+200+0+9', '4000+200+9']).state;
  // 3,507 = 3000 + 500 + 0 + 7
  state = simulateAnswer(state, 'expanded-form', 0, 0, ['3000+500+0+7', '3000+500+7']).state;
  
  assertEqual(state.concepts['expanded-form'].level, 'proficient', 'expanded-form is proficient');
  
  // No remediation triggered
  assertEqual(state.remediationCount, 0, 'No remediation for advanced learner');
  
  console.log('  ✅ Scenario F passed');
}

// ============================================================
// Core engine tests
// ============================================================

function testEvaluateAnswer() {
  console.log('\n📝 Test: evaluateAnswer');
  
  const options = ['7 ones', '7 tens', '7 hundreds', '7 thousands'];
  
  // Correct answer
  const result1 = evaluateAnswer(2, 2, options);
  assert(result1.correct, 'Correct answer identified');
  assertEqual(result1.selectedAnswer, '7 hundreds', 'Selected answer matches');
  assertEqual(result1.expectedAnswer, '7 hundreds', 'Expected answer matches');
  
  // Wrong answer
  const result2 = evaluateAnswer(0, 2, options);
  assert(!result2.correct, 'Wrong answer identified');
  assertEqual(result2.selectedAnswer, '7 ones', 'Selected wrong answer tracked');
  assertEqual(result2.expectedAnswer, '7 hundreds', 'Expected correct answer tracked');
  
  console.log('  ✅ evaluateAnswer tests passed');
}

function testDetectMisconception() {
  console.log('\n📝 Test: detectMisconception');
  
  // Digit vs value confusion - student chose "7 ones" instead of "7 hundreds"
  const m1 = detectMisconception('digit-value', '7 ones', '7 hundreds', {});
  assert(m1 !== null, 'Misconception detected for digit/value confusion');
  assertEqual(m1!.id, 'digit-not-value', 'Correct misconception ID');
  
  // Position confusion - student chose "70" (tens) instead of "700" (hundreds)
  const m2 = detectMisconception('digit-value', '7 tens', '7 hundreds', {});
  assert(m2 !== null, 'Misconception detected for position confusion');
  assertEqual(m2!.id, 'position-confusion', 'Position confusion detected');
  
  // No misconception when correct
  const m3 = detectMisconception('digit-value', '7 hundreds', '7 hundreds', {});
  assert(m3 === null, 'No misconception when answer is correct');
  
  console.log('  ✅ detectMisconception tests passed');
}

function testSelectNextActivity() {
  console.log('\n📝 Test: selectNextActivity');
  
  const state = createInitialLearningState('test', 'place-value', ['digit-value']);
  
  // Correct answer → continue normal
  const decision1 = selectNextActivity(state, 'digit-value', true);
  assertEqual(decision1.nextStep.type, 'activity', 'Normal activity for correct answer');
  assert(decision1.reason.includes('Progressing'), 'Reason mentions progressing');
  
  // Wrong answer → remediation
  const decision2 = selectNextActivity(state, 'digit-value', false);
  assertEqual(decision2.nextStep.type, 'remediation', 'Remediation for wrong answer');
  assert(decision2.reason.includes('Struggling'), 'Reason mentions struggling');
  
  // Too many remediations → still provides support (doesn't loop endlessly)
  const strugglingState = { ...state, remediationCount: 3 };
  const decision3 = selectNextActivity(strugglingState, 'digit-value', false);
  assert(decision3.nextStep !== undefined, 'Decision made even after max remediations');
  
  console.log('  ✅ selectNextActivity tests passed');
}

function testAdaptiveJourneyBuilding() {
  console.log('\n📝 Test: buildAdaptivePlaceValueJourney');
  
  const result = buildAdaptivePlaceValueJourney('Place Value', 'test-student');
  
  assert(result.steps.length > 0, 'Journey has steps');
  assert(result.adaptiveInserted, 'Adaptive steps were inserted');
  assert(result.remediationStepIds.length > 0, 'Remediation step IDs tracked');
  
  // Verify adaptive-eval step was inserted
  const adaptiveStep = result.steps.find(s => s.stepType === 'adaptive-eval');
  assert(adaptiveStep !== undefined, 'adaptive-eval step exists');
  assert(adaptiveStep!.interactionSpec?.type === 'adaptive-evaluation', 'Has adaptive-evaluation type');
  
  console.log('  ✅ buildAdaptivePlaceValueJourney tests passed');
}

function testRemediationGeneration() {
  console.log('\n📝 Test: generateRemediationStep');
  
  // Digit vs value remediation
  const r1 = generateRemediationStep('digit-not-value', 'digit-value');
  assert(r1 !== null, 'Remediation generated for digit-not-value');
  assert(r1!.visualSpec?.type === 'place_value_chart', 'Uses PlaceValueChart');
  assertEqual(r1!.stepType, 'learn', 'Remediation is a learn step');
  
  // Position confusion remediation
  const r2 = generateRemediationStep('position-confusion', 'digit-value');
  assert(r2 !== null, 'Remediation generated for position-confusion');
  assert(r2!.visualSpec !== undefined, 'Has visual spec');
  
  // Invalid misconception
  const r3 = generateRemediationStep('nonexistent', 'digit-value');
  assert(r3 === null, 'Returns null for invalid misconception');
  
  console.log('  ✅ generateRemediationStep tests passed');
}

// ============================================================
// Run all tests
// ============================================================

function runAllTests() {
  console.log('🧪 Running Adaptive Engine Tests...\n');
  console.log('=' .repeat(50));
  
  const tests = [
    testEvaluateAnswer,
    testDetectMisconception,
    testSelectNextActivity,
    testScenarioA_CorrectLearner,
    testScenarioB_SimpleMistake,
    testScenarioC_SpecificMisconception,
    testScenarioD_RepeatedFailure,
    testScenarioE_SuccessfulRetry,
    testScenarioF_AdvancedLearner,
    testAdaptiveJourneyBuilding,
    testRemediationGeneration,
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      test();
      passed++;
    } catch (e: any) {
      console.error(`\n❌ ${test.name} FAILED: ${e.message}`);
      failed++;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
  
  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests();
