/**
 * useAdaptiveDecision — Client hook that calls the server-side adaptive-decision
 * API and returns the orchestrator-driven activity.
 *
 * This hook is the client-side boundary for the adaptive loop. It replaces
 * the old direct call to adaptive.submitAnswer for Place Value lessons.
 *
 * The student page calls submitAdaptiveAnswer() which:
 *   1. POSTs the student response to /api/learner/adaptive-decision
 *   2. The server runs the full AdaptiveOrchestrator pipeline
 *   3. Returns a JourneyStep + PedagogicalAction
 *
 * The student page then renders the JourneyStep. The orchestrator, not the
 * step index, determines what the student sees next.
 *
 * No provider-specific logic here — the hook never knows whether the server
 * is using MockAIProvider or OllamaProvider.
 */

import { useState, useCallback } from "react";
import type { JourneyStep } from "@/lib/curriculum/lesson-journey";
import type { PedagogicalAction } from "@/lib/ai/AIProvider";
import type { LearningState } from "@/lib/curriculum/adaptive-engine";
import { canComputeAdvance } from "@/lib/learning/action-adapter";

export interface AdaptiveDecisionResult {
  finalAction: PedagogicalAction;
  step: JourneyStep | null;
  reasoning: string;
  usedFallback: boolean;
  updatedState: LearningState;
  conceptMastery: Record<string, unknown>;
  /** True when the lesson is registered with the adaptive architecture. */
  isAdaptive: boolean;
}

export interface SubmitAdaptiveAnswerParams {
  lessonId: string;
  lessonTitle: string;
  /** Curriculum slug — the authoritative key for adaptive lesson lookup. */
  lessonSlug?: string;
  activityId: string;
  conceptId?: string;
  selectedAnswer: string;
  expectedAnswer: string;
  options: string[];
  correct: boolean;
  prompt: string;
  attemptNumber?: number;
  remediationContext?: Record<string, unknown>;
}

export function useAdaptiveDecision() {
  const [decision, setDecision] = useState<AdaptiveDecisionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitAdaptiveAnswer = useCallback(async (
    params: SubmitAdaptiveAnswerParams
  ): Promise<AdaptiveDecisionResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/learner/adaptive-decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to get adaptive decision");
      }

      const data = await res.json();
      const result: AdaptiveDecisionResult = {
        finalAction: data.finalAction,
        step: data.step || null,
        reasoning: data.reasoning || "",
        usedFallback: data.usedFallback || false,
        updatedState: data.updatedState,
        conceptMastery: data.conceptMastery || {},
        isAdaptive: data.isAdaptive ?? false,
      };

      setDecision(result);
      return result;
    } catch (err: any) {
      console.error("[useAdaptiveDecision] Error:", err?.message || err);
      setError(err?.message || "Failed to get adaptive decision");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearDecision = useCallback(() => {
    setDecision(null);
  }, []);

  return {
    decision,
    submitAdaptiveAnswer,
    loading,
    error,
    clearDecision,
  };
}

export { canComputeAdvance };
