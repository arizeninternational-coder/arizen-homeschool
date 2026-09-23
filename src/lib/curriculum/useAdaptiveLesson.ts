'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { LearningState } from './adaptive-engine';
import type { JourneyStep } from './grade4-journeys';
import {
  createInitialLearningState,
  evaluateAnswer,
  detectMisconception,
  recordEvidence,
  selectNextActivity,
  PLACE_VALUE_CONCEPTS,
} from './adaptive-engine';
import { generateRemediationStep, PLACE_VALUE_QUIZ_MAPPINGS } from './adaptive-journey';

const STORAGE_KEY = 'arizen-adaptive-state';

export interface AdaptiveAnswerResult {
  correct: boolean;
  misconceptionId: string | null;
  feedbackMessage: string;
  remediationStep: JourneyStep | null;
  shouldRemediate: boolean;
}

export interface UseAdaptiveLessonReturn {
  learningState: LearningState | null;
  initLearningState: (studentId: string, lessonId: string) => void;
  submitAnswer: (
    conceptId: string,
    selectedIndex: number,
    expectedIndex: number,
    options: string[],
  ) => AdaptiveAnswerResult;
  recordRecovery: (conceptId: string) => void;
  clearState: () => void;
}

/**
 * useAdaptiveLesson — client-side hook for the Place Value adaptive pilot.
 * 
 * Survives React rerenders via useState + useRef.
 * Persists to sessionStorage for navigation within lesson.
 * Does NOT persist across browser sessions (pilot scope).
 */
export function useAdaptiveLesson(): UseAdaptiveLessonReturn {
  const [learningState, setLearningState] = useState<LearningState | null>(null);
  const stateRef = useRef<LearningState | null>(null);

  // Load from sessionStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
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
    selectedIndex: number,
    expectedIndex: number,
    options: string[],
  ): AdaptiveAnswerResult => {
    const currentState = stateRef.current;
    if (!currentState) {
      const correct = selectedIndex === expectedIndex;
      return {
        correct,
        misconceptionId: null,
        feedbackMessage: correct ? 'Correct!' : 'Keep trying.',
        remediationStep: null,
        shouldRemediate: false,
      };
    }

    const result = evaluateAnswer(selectedIndex, expectedIndex, options);
    const misconception = detectMisconception(conceptId, result.selectedAnswer, result.expectedAnswer, {});

    const evidence = {
      conceptId,
      correct: result.correct,
      timestamp: Date.now(),
      activityId: `${conceptId}-live`,
      answer: result.selectedAnswer,
      expectedAnswer: result.expectedAnswer,
      misconceptionId: misconception?.id,
    };

    const updatedState = recordEvidence(currentState, evidence);
    setLearningState(updatedState);

    if (result.correct) {
      return {
        correct: true,
        misconceptionId: null,
        feedbackMessage: 'Excellent! You got it right.',
        remediationStep: null,
        shouldRemediate: false,
      };
    }

    // Wrong answer
    const decision = selectNextActivity(updatedState, conceptId, false);
    const shouldRemediate = updatedState.remediationCount < 3;

    let remediationStep: JourneyStep | null = null;
    if (shouldRemediate && misconception) {
      remediationStep = generateRemediationStep(misconception.id, conceptId);
    }

    return {
      correct: false,
      misconceptionId: misconception?.id || null,
      remediationStep,
      shouldRemediate,
      feedbackMessage: misconception
        ? `Evidence consistent with: ${misconception.label}. Let me help you with this.`
        : 'Not quite. Let me show you another way.',
    };
  }, []);

  const recordRecovery = useCallback((conceptId: string) => {
    setLearningState(prev => {
      if (!prev) return prev;
      return { ...prev, remediationCount: Math.max(0, prev.remediationCount - 1) };
    });
  }, []);

  const clearState = useCallback(() => {
    setLearningState(null);
    stateRef.current = null;
    if (typeof window !== 'undefined') {
      try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
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
