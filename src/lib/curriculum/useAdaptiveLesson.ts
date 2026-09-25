'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { LearningState, Misconception } from './adaptive-engine';
import type { JourneyStep } from './grade4-journeys';
import {
  createInitialLearningState,
  evaluateAnswer,
  detectMisconception,
  recordEvidence,
  selectNextActivity,
  PLACE_VALUE_CONCEPTS,
} from './adaptive-engine';
import { generateRemediationStep, type RemediationContext } from './adaptive-journey';

const STORAGE_KEY = 'arizen-adaptive-state';

export interface AdaptiveAnswerResult {
  correct: boolean;
  selectedAnswer: string;
  expectedAnswer: string;
  misconceptionId: string | null;
  misconception: Misconception | null;
  feedbackMessage: string;
  remediationStep: JourneyStep | null;
  shouldRemediate: boolean;
  attemptNumber: number;
  remediationContext?: RemediationContext;
}

export interface UseAdaptiveLessonReturn {
  learningState: LearningState | null;
  initLearningState: (studentId: string, lessonId: string) => void;
  submitAnswer: (
    conceptId: string,
    selectedAnswer: string,
    expectedAnswer: string,
    options: string[],
    remediationContext?: RemediationContext,
  ) => AdaptiveAnswerResult;
  recordRecovery: (conceptId: string) => void;
  clearState: () => void;
}

/**
 * useAdaptiveLesson — client-side hook for the Place Value adaptive pilot.
 *
 * Survives React rerenders via useState + useRef.
 * Persists to localStorage for cross-session review (pilot scope).
 *
 * Key fix: submitAnswer now accepts `selectedAnswer` (string) and
 * `expectedAnswer` (string) directly instead of relying on index math,
 * which broke for MultiActivity sub-steps p1/p2/p3 where the selected
 * index could be -1.
 */
export function useAdaptiveLesson(): UseAdaptiveLessonReturn {
  const [learningState, setLearningState] = useState<LearningState | null>(null);
  const stateRef = useRef<LearningState | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setLearningState(parsed);
        stateRef.current = parsed;
      }
    } catch {}
  }, []);

  // Persist on change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (learningState) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(learningState));
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(learningState));
      } catch {}
      stateRef.current = learningState;
    }
  }, [learningState]);

  const initLearningState = useCallback((studentId: string, lessonId: string) => {
    const conceptIds = PLACE_VALUE_CONCEPTS.map(c => c.id);
    const newState = createInitialLearningState(studentId, lessonId, conceptIds);
    setLearningState(newState);
    stateRef.current = newState;
  }, []);

  const submitAnswer = useCallback((
    conceptId: string,
    selectedAnswer: string,
    expectedAnswer: string,
    options: string[],
    remediationContext?: RemediationContext,
  ): AdaptiveAnswerResult => {
    let currentState = stateRef.current;
    if (!currentState) {
      const conceptIds = PLACE_VALUE_CONCEPTS.map(c => c.id);
      currentState = createInitialLearningState('unknown', 'unknown', conceptIds);
      stateRef.current = currentState;
    }

    // Determine correctness from the actual answer strings (not index math)
    const selectedNorm = selectedAnswer.trim();
    const expectedNorm = expectedAnswer.trim();
    const correct = selectedNorm === expectedNorm;

    // Detect misconception using conceptId + answer strings
    const misconception = detectMisconception(conceptId, selectedAnswer, expectedAnswer, {
      options,
      prompt: remediationContext?.prompt,
    });

    // Compute attempt number for this activity
    const prevAttempts = currentState.attempts?.filter(a => a.activityId === (remediationContext?.activityId || conceptId)) || [];
    const attemptNumber = prevAttempts.length + 1;

    // --- Wrong answer: detect misconception, generate remediation, then record once ---
    if (!correct) {
      const shouldRemediate = (currentState.remediationCount || 0) < 3;
      let remediationStep: JourneyStep | null = null;

      if (shouldRemediate) {
        remediationStep = generateRemediationStep(
          misconception ? misconception.id : "__default__",
          conceptId,
          {
            ...(remediationContext || {}) as RemediationContext,
            attemptNumber,
            selectedAnswer,
            expectedAnswer,
            options,
          },
        );
      }

      const remediationId = remediationStep?.id || null;

      // Build evidence ONCE with remediationShown, then record ONCE
      const evidence = {
        conceptId,
        correct,
        timestamp: Date.now(),
        activityId: remediationContext?.activityId || `${conceptId}-live`,
        answer: selectedAnswer,
        expectedAnswer: expectedAnswer,
        misconceptionId: misconception?.id || null,
        attemptNumber,
        remediationShown: remediationId,
      };

      // Increment remediationCount when a remediation step is actually generated
      const stateAfterEvidence = recordEvidence(currentState, evidence);
      const updatedState = remediationStep
        ? { ...stateAfterEvidence, remediationCount: (currentState.remediationCount || 0) + 1 }
        : stateAfterEvidence;
      setLearningState(updatedState);
      stateRef.current = updatedState;

      return {
        correct: false,
        selectedAnswer,
        expectedAnswer,
        misconceptionId: misconception?.id || null,
        misconception,
        feedbackMessage: misconception
          ? `I see a common idea here: ${misconception.label}. Let me help you with this.`
          : "Not quite. Let me show you another way.",
        remediationStep,
        shouldRemediate,
        attemptNumber,
        remediationContext: {
          ...(remediationContext || {}) as RemediationContext,
          attemptNumber,
        },
      };
    }

    // --- Correct answer: record and return ---
    const evidence = {
      conceptId,
      correct,
      timestamp: Date.now(),
      activityId: remediationContext?.activityId || `${conceptId}-live`,
      answer: selectedAnswer,
      expectedAnswer: expectedAnswer,
      misconceptionId: null,
      attemptNumber,
      remediationShown: null,
    };

    const updatedState = recordEvidence(currentState, evidence);
    setLearningState(updatedState);
    stateRef.current = updatedState;

    // Decrement remediationCount on successful recovery
    if ((currentState.remediationCount || 0) > 0) {
      setLearningState((prev) => ({
        ...prev,
        remediationCount: Math.max(0, (prev.remediationCount || 0) - 1),
      }));
      if (stateRef.current) {
        stateRef.current = { ...stateRef.current, remediationCount: Math.max(0, (stateRef.current.remediationCount || 0) - 1) };
      }
    }

    return {
      correct: true,
      selectedAnswer,
      expectedAnswer,
      misconceptionId: null,
      misconception: null,
      feedbackMessage: "Excellent! You got it right.",
      remediationStep: null,
      shouldRemediate: false,
      attemptNumber,
      remediationContext: {
        ...(remediationContext || {}) as RemediationContext,
        attemptNumber,
      },
    };
  }, []);

  const recordRecovery = useCallback((conceptId: string) => {
    setLearningState(prev => {
      if (!prev) return prev;
      return { ...prev, remediationCount: Math.max(0, (prev.remediationCount || 0) - 1) };
    });
  }, []);

  const clearState = useCallback(() => {
    setLearningState(null);
    stateRef.current = null;
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {}
    }
  }, []);

  return {
    learningState,
    initLearningState,
    submitAnswer,
    recordRecovery,
    clearState,
  };
}