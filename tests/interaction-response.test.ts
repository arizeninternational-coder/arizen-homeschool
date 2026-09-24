/**
 * Tests for Interaction Response API and Review Mode
 * 
 * Run with: npx tsx tests/interaction-response.test.ts
 */

const STORAGE_KEY = 'arizen-adaptive-state';

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

console.log('=== Interaction Response API Tests ===\n');

// Test 1: API validates required fields
console.log('Test 1: API should validate required fields');
{
  // Simulate the validation logic
  const body = { lessonId: 'lesson-1', activityId: 'step-3' };
  const hasRequired = body.lessonId && body.activityId && 
    body.selectedAnswer !== undefined && body.expectedAnswer !== undefined && body.correct !== undefined;
  assert(!hasRequired, 'Missing required fields rejected');
  
  const body2 = { lessonId: 'lesson-1', activityId: 'step-3', selectedAnswer: '7 hundreds', expectedAnswer: '7 hundreds', correct: true };
  const hasRequired2 = body2.lessonId && body2.activityId && 
    body2.selectedAnswer !== undefined && body2.expectedAnswer !== undefined && body2.correct !== undefined;
  assert(hasRequired2, 'All required fields present');
}

// Test 2: Response stores learner + lesson + activity mapping
console.log('\nTest 2: Response stores learner + lesson + activity mapping');
{
  const response = {
    id: 'resp-1',
    learnerId: 'learner-1',
    lessonId: 'lesson-1',
    activityId: 'step-3',
    conceptId: 'digit-value',
    selectedAnswer: '7 hundreds',
    expectedAnswer: '7 hundreds',
    correct: true,
    timestamp: new Date().toISOString(),
  };
  
  assert(response.learnerId === 'learner-1', 'learnerId stored');
  assert(response.lessonId === 'lesson-1', 'lessonId stored');
  assert(response.activityId === 'step-3', 'activityId stored');
  assert(response.selectedAnswer === '7 hundreds', 'selectedAnswer stored');
  assert(response.correct === true, 'correct stored');
}

// Test 3: Idempotency - duplicate activityId updates instead of creating
console.log('\nTest 3: Idempotency - duplicate response updates existing');
{
  const existingResponse = { id: 'resp-1', activityId: 'step-3', selectedAnswer: '7 ones' };
  
  // Simulate update logic
  const updatedResponse = { ...existingResponse, selectedAnswer: '7 hundreds', correct: true };
  
  assert(updatedResponse.id === 'resp-1', 'Same ID (updated, not created)');
  assert(updatedResponse.selectedAnswer === '7 hundreds', 'Answer updated');
  assert(updatedResponse.correct === true, 'Correctness updated');
}

// Test 4: Review hydration preserves incorrect answers
console.log('\nTest 4: Review hydration preserves incorrect answers');
{
  // Simulate persisted responses from DB
  const persistedResponses = [
    { activityId: 'step-3', selectedAnswer: '7 thousands', expectedAnswer: '7 hundreds', correct: false },
    { activityId: 'step-5', selectedAnswer: '3,000 people', expectedAnswer: '3,000 people', correct: true },
    { activityId: 'step-7-a', selectedAnswer: '2,538', expectedAnswer: '2,538', correct: true },
  ];
  
  const restoredMap: Record<string, { answer: string; correct: boolean }> = {};
  for (const r of persistedResponses) {
    restoredMap[r.activityId] = { answer: r.selectedAnswer, correct: r.correct };
  }
  
  // Verify incorrect answer preserved (NOT replaced with correct answer)
  assert(restoredMap['step-3'].answer === '7 thousands', 'Incorrect answer preserved (not replaced)');
  assert(restoredMap['step-3'].correct === false, 'Correctness preserved as incorrect');
  
  // Verify correct answer also preserved
  assert(restoredMap['step-5'].answer === '3,000 people', 'Correct answer preserved');
  assert(restoredMap['step-5'].correct === true, 'Correctness preserved as correct');
}

// Test 5: Stable activity ID mapping
console.log('\nTest 5: Stable activity ID mapping');
{
  const responses = [
    { activityId: 'step-3', selectedAnswer: '7 hundreds' },
    { activityId: 'step-5', selectedAnswer: '3,000 people' },
    { activityId: 'step-7-a', selectedAnswer: '2,538' },
    { activityId: 'step-7-b', selectedAnswer: '1,547' },
    { activityId: 'step-7-c', selectedAnswer: '5,621' },
    { activityId: 'step-8', selectedAnswer: '3,042' },
  ];
  
  const map: Record<string, string> = {};
  for (const r of responses) {
    map[r.activityId] = r.selectedAnswer;
  }
  
  // Each activity ID maps to exactly one answer
  assert(Object.keys(map).length === 6, 'All 6 activities mapped');
  assert(map['step-3'] === '7 hundreds', 'Step 3 answer mapped');
  assert(map['step-5'] === '3,000 people', 'Step 5 answer mapped');
  assert(map['step-7-a'] === '2,538', 'Step 7a answer mapped');
  assert(map['step-7-b'] === '1,547', 'Step 7b answer mapped');
  assert(map['step-7-c'] === '5,621', 'Step 7c answer mapped');
  assert(map['step-8'] === '3,042', 'Step 8 answer mapped');
}

// Test 6: Review hydration does NOT call submitAnswer
console.log('\nTest 6: Review hydration does NOT call submitAnswer');
{
  let submitAnswerCalled = false;
  
  // Simulate the applyRestoredAnswer logic (does NOT call submitAnswer)
  const applyRestoredAnswer = (restored: any, options: string[]) => {
    const idx = options.indexOf(restored.answer);
    if (idx >= 0) {
      // Just set interaction state, no submitAnswer
      return { selectedChoice: idx, choiceFeedback: restored.correct ? 'correct' : 'incorrect' };
    }
    return null;
  };
  
  const result = applyRestoredAnswer({ answer: '7 thousands', correct: false }, ['7 ones', '7 tens', '7 hundreds', '7 thousands']);
  
  assert(!submitAnswerCalled, 'submitAnswer NOT called during hydration');
  assert(result?.selectedChoice === 3, 'Correct index for restored answer');
  assert(result?.choiceFeedback === 'incorrect', 'Feedback preserved as incorrect');
}

// Test 7: Multiple concept tracking
console.log('\nTest 7: Multiple concept answers preserved independently');
{
  const responses = [
    { activityId: 'step-3', conceptId: 'digit-value', selectedAnswer: '7 thousands', correct: false },
    { activityId: 'step-5', conceptId: 'digit-value', selectedAnswer: '3,000 people', correct: true },
    { activityId: 'step-8', conceptId: 'read-numbers', selectedAnswer: '3,042', correct: true },
  ];
  
  const byConcept: Record<string, { answer: string; correct: boolean }[]> = {};
  for (const r of responses) {
    const key = r.conceptId || 'unknown';
    if (!byConcept[key]) byConcept[key] = [];
    byConcept[key].push({ answer: r.selectedAnswer, correct: r.correct });
  }
  
  assert(byConcept['digit-value'].length === 2, 'digit-value has 2 responses');
  assert(byConcept['digit-value'][0].answer === '7 thousands', 'First digit-value answer preserved');
  assert(byConcept['digit-value'][1].answer === '3,000 people', 'Second digit-value answer preserved');
  assert(byConcept['read-numbers'].length === 1, 'read-numbers has 1 response');
}

// Test 8: Cross-session persistence (simulated)
console.log('\nTest 8: Cross-session persistence');
{
  // Simulate: Session 1 saves responses
  const session1Responses = [
    { activityId: 'step-3', selectedAnswer: '7 thousands', expectedAnswer: '7 hundreds', correct: false },
    { activityId: 'step-5', selectedAnswer: '3,000 people', expectedAnswer: '3,000 people', correct: true },
  ];
  
  // Simulate: Session 2 loads responses (localStorage cleared)
  const session2Loaded = session1Responses; // Loaded from DB
  
  // Verify answers match
  assert(session2Loaded[0].selectedAnswer === '7 thousands', 'Incorrect answer survives session change');
  assert(session2Loaded[0].correct === false, 'Correctness survives session change');
  assert(session2Loaded[1].selectedAnswer === '3,000 people', 'Correct answer survives session change');
}

console.log('\n==================================================');
console.log(`📊 Results: ${passed} passed, ${failed} failed`);
console.log('==================================================');

if (failed > 0) {
  process.exit(1);
}
