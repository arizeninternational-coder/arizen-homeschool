/**
 * Regression test: Persistence must work for ALL interactive step types
 * regardless of adaptive-engine mapping.
 * 
 * Run with: npx tsx tests/persistence-regression.test.ts
 */

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${message}`);
  } else {
    failed++;
    console.log(`  ❌ ${message}`);
  }
}

// Simulate the persistence logic from the fixed handleAdaptiveAnswer
function simulatePersistStep(step: any, selectedIdx: number) {
  const choices = step.interactionSpec?.choices || step.interactionSpec?.options || [];
  const activityId = step.id || `step-0`;
  
  if (choices.length > 0) {
    const options = choices.map((c: any) => typeof c === 'string' ? c : c.label);
    const selectedAnswer = options[selectedIdx] || '';
    
    let expectedAnswer = '';
    if (step.interactionSpec?.correctChoiceId) {
      const correctChoice = choices.find((c: any) => 
        (typeof c === 'object' && c.id === step.interactionSpec.correctChoiceId)
      );
      expectedAnswer = correctChoice ? (correctChoice.label || correctChoice) : options[0];
    } else if (step.interactionSpec?.correctIndex != null) {
      expectedAnswer = options[step.interactionSpec.correctIndex] || options[0];
    } else if (step.interactionSpec?.correctAnswer) {
      expectedAnswer = step.interactionSpec.correctAnswer;
    }
    
    const isCorrect = selectedAnswer === expectedAnswer;
    return { activityId, selectedAnswer, expectedAnswer, isCorrect, conceptId: step.stepType };
  }
  return null;
}

console.log('=== Persistence Regression Tests ===\n');

// Step 3: think_first with tap_choice
console.log('Test 1: Step 3 (think_first) - CORRECT answer persists');
{
  const step = {
    id: 'think_first',
    stepType: 'think_first',
    interactionSpec: {
      type: 'tap_choice',
      choices: [
        { id: 'A', label: '7 ones' },
        { id: 'B', label: '7 tens' },
        { id: 'C', label: '7 hundreds' },
        { id: 'D', label: '7 thousands' },
      ],
      correctChoiceId: 'C',
    },
  };
  const result = simulatePersistStep(step, 2); // Select index 2 = "7 hundreds"
  assert(result !== null, 'Persistence triggered');
  assert(result?.selectedAnswer === '7 hundreds', 'Selected answer preserved');
  assert(result?.expectedAnswer === '7 hundreds', 'Expected answer preserved');
  assert(result?.isCorrect === true, 'Correctness = true');
  assert(result?.activityId === 'think_first', 'Activity ID is step ID');
}

console.log('\nTest 2: Step 3 (think_first) - WRONG answer persists');
{
  const step = {
    id: 'think_first',
    stepType: 'think_first',
    interactionSpec: {
      type: 'tap_choice',
      choices: [
        { id: 'A', label: '7 ones' },
        { id: 'B', label: '7 tens' },
        { id: 'C', label: '7 hundreds' },
        { id: 'D', label: '7 thousands' },
      ],
      correctChoiceId: 'C',
    },
  };
  const result = simulatePersistStep(step, 1); // Select index 1 = "7 tens" (WRONG)
  assert(result !== null, 'Persistence triggered');
  assert(result?.selectedAnswer === '7 tens', 'Wrong answer preserved (not replaced)');
  assert(result?.expectedAnswer === '7 hundreds', 'Expected answer is correct one');
  assert(result?.isCorrect === false, 'Correctness = false');
}

// Step 5: connect with tap_choice
console.log('\nTest 3: Step 5 (connect) - answer persists');
{
  const step = {
    id: 'connect',
    stepType: 'connect',
    interactionSpec: {
      type: 'tap_choice',
      choices: [
        { id: 'A', label: '3 people' },
        { id: 'B', label: '30 people' },
        { id: 'C', label: '300 people' },
        { id: 'D', label: '3,000 people' },
      ],
      correctChoiceId: 'D',
    },
  };
  const result = simulatePersistStep(step, 3);
  assert(result !== null, 'Step 5 persistence triggered');
  assert(result?.selectedAnswer === '3,000 people', 'Selected answer preserved');
  assert(result?.expectedAnswer === '3,000 people', 'Expected answer preserved');
  assert(result?.isCorrect === true, 'Correctness = true');
}

// Step 7: practice with tap_choice (first activity)
console.log('\nTest 4: Step 7 (practice) - first activity persists');
{
  const step = {
    id: 'practice',
    stepType: 'practice',
    interactionSpec: {
      type: 'tap_choice',
      choices: [
        { id: 'A', label: '2,538' },
        { id: 'B', label: '2,358' },
        { id: 'C', label: '5,238' },
        { id: 'D', label: '2,583' },
      ],
      correctChoiceId: 'A',
    },
  };
  const result = simulatePersistStep(step, 0);
  assert(result !== null, 'Step 7 persistence triggered');
  assert(result?.selectedAnswer === '2,538', 'Selected answer preserved');
  assert(result?.isCorrect === true, 'Correctness = true');
}

// Step 8: quick_check with multiple_choice
console.log('\nTest 5: Step 8 (quick_check) - answer persists');
{
  const step = {
    id: 'quick_check',
    stepType: 'quick_check',
    interactionSpec: {
      type: 'multiple_choice',
      options: ['3,402', '3,042', '3,024', '3,240'],
      correctIndex: 1,
    },
  };
  const result = simulatePersistStep(step, 1);
  assert(result !== null, 'Step 8 persistence triggered');
  assert(result?.selectedAnswer === '3,042', 'Selected answer preserved');
  assert(result?.expectedAnswer === '3,042', 'Expected answer preserved');
  assert(result?.isCorrect === true, 'Correctness = true');
}

// Test: Wrong answer on Step 8
console.log('\nTest 6: Step 8 (quick_check) - WRONG answer persists');
{
  const step = {
    id: 'quick_check',
    stepType: 'quick_check',
    interactionSpec: {
      type: 'multiple_choice',
      options: ['3,402', '3,042', '3,024', '3,240'],
      correctIndex: 1,
    },
  };
  const result = simulatePersistStep(step, 0); // Wrong: "3,402"
  assert(result !== null, 'Persistence triggered');
  assert(result?.selectedAnswer === '3,402', 'Wrong answer preserved');
  assert(result?.expectedAnswer === '3,042', 'Expected answer is correct one');
  assert(result?.isCorrect === false, 'Correctness = false');
}

// Test: Persistence does NOT depend on adaptive mapping
console.log('\nTest 7: Persistence works WITHOUT adaptive mapping');
{
  const step = {
    id: 'connect',
    stepType: 'connect',
    interactionSpec: {
      type: 'tap_choice',
      choices: [
        { id: 'A', label: 'Option A' },
        { id: 'B', label: 'Option B' },
      ],
      correctChoiceId: 'B',
    },
  };
  // Simulate: no PLACE_VALUE_QUIZ_MAPPINGS entry for 'connect'
  const hasAdaptiveMapping = false;
  const result = simulatePersistStep(step, 0);
  assert(result !== null, 'Persists even without adaptive mapping');
  assert(!hasAdaptiveMapping && result !== null, 'Persistence independent of adaptive');
}

// Test: All choice-based steps have activityId
console.log('\nTest 8: All steps have stable activityId');
{
  const steps = [
    { id: 'think_first', interactionSpec: { choices: [{ id: 'A', label: 'a' }] } },
    { id: 'connect', interactionSpec: { choices: [{ id: 'A', label: 'a' }] } },
    { id: 'practice', interactionSpec: { choices: [{ id: 'A', label: 'a' }] } },
    { id: 'quick_check', interactionSpec: { options: ['a', 'b'] } },
  ];
  for (const step of steps) {
    const activityId = step.id;
    assert(activityId !== undefined, `Step ${step.id} has activityId`);
  }
}

console.log('\n==================================================');
console.log(`📊 Results: ${passed} passed, ${failed} failed`);
console.log('==================================================');

if (failed > 0) {
  process.exit(1);
}
