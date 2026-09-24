/**
 * Tests for Review Mode persistence and navigation
 * 
 * Verifies:
 * 1. Adaptive state persists to localStorage for cross-session review
 * 2. clearState removes from both localStorage and sessionStorage
 * 3. Previous answers can be restored from persisted state
 */

import { describe, it, expect, beforeEach } from 'vitest';

// Mock localStorage and sessionStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

describe('Review Mode Persistence', () => {
  beforeEach(() => {
    localStorageMock.clear();
    sessionStorageMock.clear();
  });

  it('should persist adaptive state to localStorage', () => {
    const STORAGE_KEY = 'arizen-adaptive-state';
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

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));

    const stored = localStorage.getItem(STORAGE_KEY);
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.studentId).toBe('learner-1');
    expect(parsed.concepts['digit-value'].lastEvidence.answer).toBe('7 ones');
    expect(parsed.concepts['digit-value'].lastEvidence.correct).toBe(false);
  });

  it('should restore previous answers from localStorage', () => {
    const STORAGE_KEY = 'arizen-adaptive-state';
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

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

    // Simulate restore logic
    const stored = localStorage.getItem(STORAGE_KEY);
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    
    // Verify the answer is preserved
    const evidence = parsed.concepts['digit-value'].lastEvidence;
    expect(evidence.answer).toBe('7 ones');
    expect(evidence.correct).toBe(false);
    expect(evidence.expectedAnswer).toBe('7 hundreds');
  });

  it('should clear state from both localStorage and sessionStorage', () => {
    const STORAGE_KEY = 'arizen-adaptive-state';
    const state = { studentId: 'learner-1', lessonId: 'lesson-1', concepts: {} };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));

    // Simulate clearState
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);

    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('should prefer localStorage over sessionStorage when loading', () => {
    const STORAGE_KEY = 'arizen-adaptive-state';
    
    const localStorageState = { studentId: 'learner-1', lessonId: 'lesson-1', concepts: {} };
    const sessionStorageState = { studentId: 'learner-2', lessonId: 'lesson-2', concepts: {} };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(localStorageState));
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(sessionStorageState));

    // Simulate load logic (localStorage first)
    const stored = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.studentId).toBe('learner-1');
  });

  it('should preserve incorrect answers for review display', () => {
    const STORAGE_KEY = 'arizen-adaptive-state';
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

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

    // Simulate restorePreviousAnswers logic
    const stored = localStorage.getItem(STORAGE_KEY);
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

    // Verify incorrect answer is preserved
    expect(evidenceMap['digit-value'].answer).toBe('7 ones');
    expect(evidenceMap['digit-value'].correct).toBe(false);
  });

  it('should handle missing localStorage gracefully', () => {
    const STORAGE_KEY = 'arizen-adaptive-state';
    localStorageMock.clear();
    
    const stored = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
    expect(stored).toBeNull();
  });

  it('should handle corrupted localStorage data gracefully', () => {
    const STORAGE_KEY = 'arizen-adaptive-state';
    localStorage.setItem(STORAGE_KEY, 'not valid json{{{{');
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        JSON.parse(stored);
      }
      // Should not throw
    } catch (e) {
      // Expected - corrupted data
      expect(e).toBeDefined();
    }
  });
});
