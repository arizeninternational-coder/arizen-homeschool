'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import type { LearningState, AdaptiveStep } from './adaptive-engine';
import type { JourneyStep } from './grade4-journeys';
import {
  createInitialLearningState,
  evaluateAnswer,
  detectMisconception,
  recordEvidence,
  selectNextActivity,
  PLACE_VALUE_CONCEPTS,
} from './adaptive-engine';
import { generateRemediationStep } from './adaptive-journey';

interface AdaptiveContextType {
  state: LearningState | null;
  initState: (studentId: string, lessonId: string) => void;
  evaluateAndDecide: (
    conceptId: string,
    selectedIndex: number,
    expectedIndex: number,
    options: string[],
  ) => {
    correct: boolean;
    misconceptionId: string | null;
    remediationStep: JourneyStep | null;
    shouldRemediate: boolean;
    feedbackMessage: string;
  };
  recordRecovery: (conceptId: string) => void;
  clearState: () => void;
}

const AdaptiveContext = createContext<AdaptiveContextType | null>(null);

const STORAGE_KEY = 'arizen-adaptive-state';

export function AdaptiveProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<LearningState | null>(null);
  const stateRef = useRef<LearningState | null>(null);

  // Load from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setState(parsed);
        stateRef.current = parsed;
      }
    } catch {}
  }, []);

  // Persist to sessionStorage on state change
  useEffect(() => {
    if (state) {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {}
      stateRef.current = state;
    }
  }, [state]);

  const initState = useCallback((studentId: string, lessonId: string) => {
    const conceptIds = PLACE_VALUE_CONCEPTS.map(c => c.id);
    const newState = createInitialLearningState(studentId, lessonId, conceptIds);
    setState(newState);
    stateRef.current = newState;
  }, []);

  const evaluateAndDecide = useCallback((
    conceptId: string,
    selectedIndex: number,
    expectedIndex: number,
    options: string[],
  ) => {
    if (!state) {
      return {
        correct: selectedIndex === expectedIndex,
        misconceptionId: null,
        remediationStep: null,
        shouldRemediate: false,
        feedbackMessage: selectedIndex === expectedIndex ? 'Correct!' : 'Keep trying.',
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

    const updatedState = recordEvidence(state, evidence);
    setState(updatedState);

    if (result.correct) {
      return {
        correct: true,
        misconceptionId: null,
        remediationStep: null,
        shouldRemediate: false,
        feedbackMessage: 'Excellent! You got it right.',
      };
    }

    // Wrong answer: decide on remediation
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
  }, [state]);

  const recordRecovery = useCallback((conceptId: string) => {
    if (!state) return;
    // Reset remediation count for this concept on successful recovery
    const updated = {
      ...state,
      remediationCount: Math.max(0, state.remediationCount - 1),
    };
    setState(updated);
  }, [state]);

  const clearState = useCallback(() => {
    setState(null);
    stateRef.current = null;
    try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  return (
    <AdaptiveContext.Provider value={{ state, initState, evaluateAndDecide, recordRecovery, clearState }}>
      {children}
    </AdaptiveContext.Provider>
  );
}

export function useAdaptive() {
  const ctx = useContext(AdaptiveContext);
  if (!ctx) throw new Error('useAdaptive must be used within AdaptiveProvider');
  return ctx;
}
