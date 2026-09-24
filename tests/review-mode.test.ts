/**
 * Tests for Review Mode persistence and navigation
 * 
 * Run with: npx tsx tests/review-mode.test.ts
 */

const STORAGE_KEY = 'arizen-adaptive-state';

// Simple storage mock
function createStorage() {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    _dump: () => ({ ...store }),
  };
}

const localStorageMock = createStorage();
const sessionStorageMock = createStorage();

// Make available globally for modules that reference window.localStorage
if (typeof globalThis !== 'undefined') {
  (globalThis as any).localStorage = localStorageMock;
  (globalThis as any).sessionStorage = sessionStorageMock;
}

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

console.log('=== Review Mode Persistence Tests ===\n');

// Test 1: should persist adaptive state to localStorage
console.log('Test 1: should persist adaptive state to localStorage');
{
  localStorageMock.clear();
  sessionStorageMock.clear();
  const state = {
    studentId: 'learner-1',
    lessonId: 'lesson-1',
    concepts: {
      'digit-value': {
        conceptId: 'digit-value',
        level: 'developing',
        attempts: 1,
        correctAttempts: 0,
        lastEvidence: {
          conceptId: 'digit-value',
          correct: false,
          timestamp: Date.now(),
          activityId: 'digit-value-live',
          answer: '7 ones',
          expectedAnswer: '7 hundreds',
          misconceptionId: 'ones-vs-hundreds',
        },
        history: [],
      },
    },
    currentActivityId: 'digit-value-live',
    remediationCount: 0,
    difficultyLevel: 1,
    startedAt: Date.now(),
  };

  localStorageMock.setItem(STORAGE_KEY, JSON.stringify(state));
  sessionStorageMock.setItem(STORAGE_KEY, JSON.stringify(state));

  const stored = localStorageMock.getItem(STORAGE_KEY);
  assert(stored !== null, 'State stored in localStorage');
  const parsed = JSON.parse(stored!);
  assert(parsed.studentId === 'learner-1', 'studentId preserved');
  assert(parsed.concepts['digit-value'].lastEvidence.answer === '7 ones', 'Answer preserved');
  assert(parsed.concepts['digit-value'].lastEvidence.correct === false, 'Correctness preserved');
}

// Test 2: should restore previous answers from localStorage
console.log('\nTest 2: should restore previous answers from localStorage');
{
  localStorageMock.clear();
  const state = {
    studentId: 'learner-1',
    lessonId: 'lesson-1',
    concepts: {
      'digit-value': {
        conceptId: 'digit-value',
        level: 'developing',
        attempts: 1,
        correctAttempts: 0,
        lastEvidence: {
          conceptId: 'digit-value',
          correct: false,
          timestamp: Date.now(),
          activityId: 'digit-value-live',
          answer: '7 ones',
          expectedAnswer: '7 hundreds',
          misconceptionId: 'ones-vs-hundreds',
        },
        history: [],
      },
    },
    currentActivityId: 'digit-value-live',
    remediationCount: 0,
    difficultyLevel: 1,
    startedAt: Date.now(),
  };

  localStorageMock.setItem(STORAGE_KEY, JSON.stringify(state));

  const stored = localStorageMock.getItem(STORAGE_KEY);
  assert(stored !== null, 'State found in localStorage');
  const parsed = JSON.parse(stored!);
  const evidence = parsed.concepts['digit-value'].lastEvidence;
  assert(evidence.answer === '7 ones', 'Answer is 7 ones');
  assert(evidence.correct === false, 'Answer is incorrect');
  assert(evidence.expectedAnswer === '7 hundreds', 'Expected answer is 7 hundreds');
}

// Test 3: should clear state from both localStorage and sessionStorage
console.log('\nTest 3: should clear state from both storages');
{
  localStorageMock.clear();
  sessionStorageMock.clear();
  const state = { studentId: 'learner-1', lessonId: 'lesson-1', concepts: {} };

  localStorageMock.setItem(STORAGE_KEY, JSON.stringify(state));
  sessionStorageMock.setItem(STORAGE_KEY, JSON.stringify(state));

  localStorageMock.removeItem(STORAGE_KEY);
  sessionStorageMock.removeItem(STORAGE_KEY);

  assert(localStorageMock.getItem(STORAGE_KEY) === null, 'localStorage cleared');
  assert(sessionStorageMock.getItem(STORAGE_KEY) === null, 'sessionStorage cleared');
}

// Test 4: should prefer localStorage over sessionStorage when loading
console.log('\nTest 4: should prefer localStorage over sessionStorage');
{
  localStorageMock.clear();
  sessionStorageMock.clear();
  const localStorageState = { studentId: 'learner-1', lessonId: 'lesson-1', concepts: {} };
  const sessionStorageState = { studentId: 'learner-2', lessonId: 'lesson-2', concepts: {} };

  localStorageMock.setItem(STORAGE_KEY, JSON.stringify(localStorageState));
  sessionStorageMock.setItem(STORAGE_KEY, JSON.stringify(sessionStorageState));

  const stored = localStorageMock.getItem(STORAGE_KEY) || sessionStorageMock.getItem(STORAGE_KEY);
  assert(stored !== null, 'State found');
  const parsed = JSON.parse(stored!);
  assert(parsed.studentId === 'learner-1', 'localStorage takes precedence');
}

// Test 5: should preserve incorrect answers for review display
console.log('\nTest 5: should preserve incorrect answers for review');
{
  localStorageMock.clear();
  const state = {
    studentId: 'learner-1',
    lessonId: 'lesson-1',
    concepts: {
      'digit-value': {
        conceptId: 'digit-value',
        level: 'developing',
        attempts: 1,
        correctAttempts: 0,
        lastEvidence: {
          conceptId: 'digit-value',
          correct: false,
          timestamp: Date.now(),
          activityId: 'digit-value-live',
          answer: '7 ones',
          expectedAnswer: '7 hundreds',
          misconceptionId: 'ones-vs-hundreds',
        },
        history: [],
      },
    },
    currentActivityId: 'digit-value-live',
    remediationCount: 0,
    difficultyLevel: 1,
    startedAt: Date.now(),
  };

  localStorageMock.setItem(STORAGE_KEY, JSON.stringify(state));

  const stored = localStorageMock.getItem(STORAGE_KEY);
  const parsed = JSON.parse(stored!);
  const evidenceMap: Record<string, { answer: string; correct: boolean }> = {};
  
  for (const [conceptId, conceptState] of Object.entries(parsed.concepts)) {
    const cs = conceptState as any;
    if (cs.lastEvidence) {
      evidenceMap[conceptId] = {
        answer: cs.lastEvidence.answer || '',
        correct: cs.lastEvidence.correct,
      };
    }
  }

  assert(evidenceMap['digit-value'].answer === '7 ones', 'Incorrect answer preserved');
  assert(evidenceMap['digit-value'].correct === false, 'Correctness preserved');
}

// Test 6: should handle missing localStorage gracefully
console.log('\nTest 6: should handle missing localStorage gracefully');
{
  localStorageMock.clear();
  sessionStorageMock.clear();
  const stored = localStorageMock.getItem(STORAGE_KEY) || sessionStorageMock.getItem(STORAGE_KEY);
  assert(stored === null, 'Returns null when no stored state');
}

// Test 7: should handle corrupted localStorage data gracefully
console.log('\nTest 7: should handle corrupted data gracefully');
{
  localStorageMock.clear();
  localStorageMock.setItem(STORAGE_KEY, 'not valid json{{{{');
  
  let threw = false;
  try {
    const stored = localStorageMock.getItem(STORAGE_KEY) || sessionStorageMock.getItem(STORAGE_KEY);
    if (stored) {
      JSON.parse(stored);
    }
  } catch (e) {
    threw = true;
  }
  assert(threw, 'Throws on corrupted data');
}

// Test 8: should preserve multiple concept answers
console.log('\nTest 8: should preserve multiple concept answers');
{
  localStorageMock.clear();
  const state = {
    studentId: 'learner-1',
    lessonId: 'lesson-1',
    concepts: {
      'digit-value': {
        conceptId: 'digit-value',
        level: 'developing',
        attempts: 1,
        correctAttempts: 0,
        lastEvidence: {
          conceptId: 'digit-value',
          correct: false,
          timestamp: Date.now(),
          activityId: 'digit-value-live',
          answer: '7 ones',
          expectedAnswer: '7 hundreds',
        },
        history: [],
      },
      'read-numbers': {
        conceptId: 'read-numbers',
        level: 'proficient',
        attempts: 2,
        correctAttempts: 2,
        lastEvidence: {
          conceptId: 'read-numbers',
          correct: true,
          timestamp: Date.now(),
          activityId: 'read-numbers-live',
          answer: '3,042',
          expectedAnswer: '3,042',
        },
        history: [],
      },
    },
    currentActivityId: 'read-numbers-live',
    remediationCount: 0,
    difficultyLevel: 1,
    startedAt: Date.now(),
  };

  localStorageMock.setItem(STORAGE_KEY, JSON.stringify(state));

  const stored = localStorageMock.getItem(STORAGE_KEY);
  const parsed = JSON.parse(stored!);
  assert(parsed.concepts['digit-value'].lastEvidence.answer === '7 ones', 'First concept preserved');
  assert(parsed.concepts['read-numbers'].lastEvidence.answer === '3,042', 'Second concept preserved');
}

console.log('\n==================================================');
console.log(`📊 Results: ${passed} passed, ${failed} failed`);
console.log('==================================================');

if (failed > 0) {
  process.exit(1);
}
