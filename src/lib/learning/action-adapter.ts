/**
 * Action Adapter — Translates a validated PedagogicalAction into a JourneyStep that
 * the existing InteractiveStepRenderer can display.
 *
 * Boundary: AIProvider → AdaptiveOrchestrator → ActionValidator → PedagogicalAction
 *        → (adapter) → ExtendedJourneyStep → InteractiveStepRenderer.
 *
 * The adapter NEVER invents content. It maps fields already carried by the
 * PedagogicalAction union, or delegates to the existing remediation generator.
 */

import type { ExtendedJourneyStep } from "@/components/interactive";
import type { PedagogicalAction } from "@/lib/ai/AIProvider";
import { generateRemediationStep } from "@/lib/curriculum/adaptive-journey";
import type { Evidence } from "@/lib/curriculum/adaptive-engine";

export interface ActionAdapterContext {
  evidence: Evidence;
  aiContext: {
    conceptId: string;
    selectedAnswer?: string;
    expectedAnswer?: string;
    options: string[];
    prompt: string;
    attemptNumber?: number;
  };
  conceptChain: string[];
}

/**
 * Determine whether the learner may advance to the next journey step
 * using the legacy stepIndex+1 mechanism.
 *
 * For Place Value adaptive lessons, advancement must yield to the orchestrator's
 * decision — the learner must NOT advance while an adaptive API call is pending
 * or while a remediation overlay is active.
 *
 * ADVANCE REQUIRES A CORRECT ANSWER, NOT MERELY A SUBMISSION.
 *
 * `choiceSubmitted` is set the instant the learner clicks any option, before
 * correctness is known. Gating on submission alone allowed this sequence:
 *
 *   wrong answer -> choiceSubmitted: true -> canAdvance: true -> Next -> next step
 *
 * which let a learner bypass required remediation entirely. The renderers now
 * also record `choiceCorrect`, and this boundary requires BOTH flags: a
 * submitted-but-incorrect answer keeps Next blocked so the remediation loop can
 * run to completion.
 *
 * Returns false when:
 *  - activeRemediation is set (remediation overlay active)
 *  - adaptivePending is true (API call in-flight)
 *  - A multi_activity step has not been fully completed
 *  - A tap_choice / multiple_choice / adaptive-evaluation step has no submitted
 *    answer, or the submitted answer was incorrect
 */
export function canComputeAdvance(params: {
  activeRemediation: unknown;
  adaptivePending: boolean;
  step: unknown;
  interaction: Record<string, unknown>;
}): boolean {
  if (params.activeRemediation) return false;
  if (params.adaptivePending) return false;
  const step = params.step as { interactionSpec?: { type?: string } } | null;
  if (!step) return true;
  const itype = step.interactionSpec?.type;
  if (itype === "multi_activity") {
    return params.interaction.multiActivityComplete === true;
  }
  if (itype === "tap_choice" || itype === "multiple_choice" || itype === "adaptive-evaluation") {
    // A submission alone is NOT enough — the learner must have been correct.
    if (params.interaction.choiceSubmitted !== true) return false;
    return params.interaction.choiceCorrect === true;
  }
  return true;
}

function safeOptions(ctx: ActionAdapterContext): string[] {
  return (ctx.aiContext.options && ctx.aiContext.options.length > 0)
    ? ctx.aiContext.options : [];
}

function optsToChoices(opts: string[]): { id: string; label: string }[] {
  return opts.map((opt, i) => ({ id: String(i), label: opt }));
}

/** Map a validated PedagogicalAction to a renderable ExtendedJourneyStep. */
export function pedagogicalActionToJourneyStep(
  action: PedagogicalAction,
  ctx: ActionAdapterContext,
): ExtendedJourneyStep {
  const { evidence, aiContext } = ctx;
  const conceptId = action.conceptId || evidence.conceptId;
  const now = Date.now();

  switch (action.actionType) {

    case "remediate": {
      const remediation = generateRemediationStep(
        action.misconceptionId,
        conceptId,
        {
          prompt: aiContext.prompt,
          options: safeOptions(ctx),
          expectedAnswer: aiContext.expectedAnswer || "",
          selectedAnswer: aiContext.selectedAnswer || "",
          activityId: evidence.activityId,
          attemptNumber: action.escalated ? 2 : 1,
        }
      );
      if (remediation) return remediation as unknown as ExtendedJourneyStep;
      // Fallback if generateRemediationStep returns null
      return {
        id: `remediation-fallback-${conceptId}-${now}`,
        stepType: "learn",
        title: "Let us Look Closer",
        studentText: `Let us review ${conceptId}.`,
        visualSpec: { type: "place_value_chart" } as any,
        interactionSpec: { type: "tap_continue" },
        owlText: "Let us take another careful look at this.",
      };
    }

    case "explain":
      return {
        id: `explain-${conceptId}-${now}`,
        stepType: "learn",
        title: "Explanation",
        studentText: action.content,
        interactionSpec: { type: "tap_continue" },
        owlText: action.reason || "Let me explain this step by step.",
      };

    case "change_representation": {
      const rep = action.representation || "place_value_chart";
      return {
        id: `representation-${conceptId}-${now}`,
        stepType: "learn",
        title: "Let us look at it differently",
        studentText: `Let us look at ${conceptId} in a new way to help you understand.`,
        visualSpec: { type: rep } as any,
        interactionSpec: { type: "tap_continue" },
        owlText: "Different representations can reveal patterns that words alone hide.",
      };
    }

    case "targeted_practice":
    case "increase_difficulty": {
      const question = action.actionType === "targeted_practice"
        ? action.prompt
        : (aiContext.prompt || `Let us practise ${conceptId}.`);
      const opts = action.actionType === "targeted_practice"
        ? (action.options || safeOptions(ctx))
        : safeOptions(ctx);
      // For targeted_practice, correctIndex tells us which option is correct
      const correctIdx = action.actionType === "targeted_practice"
        ? action.correctIndex
        : (opts.indexOf(aiContext.expectedAnswer || ""));
      return {
        id: `practice-${conceptId}-${now}`,
        stepType: "practice",
        title: action.actionType === "increase_difficulty"
          ? "One step further"
          : "Let us practise this",
        studentText: question,
        interactionSpec: {
          type: "tap_choice",
          prompt: question,
          choices: optsToChoices(opts),
          correctChoiceId: correctIdx >= 0 ? String(correctIdx) : undefined,
          conceptId,
        } as any,
        feedbackSpec: {
          correct: "Yes! You have got it.",
          incorrect: "Not quite — think about the place value of each digit.",
        },
        owlText: action.reason || "You have got this! Take your time.",
      };
    }

    case "check_mastery": {
      const opts = safeOptions(ctx);
      const expected = aiContext.expectedAnswer || "";
      const correctIdx = opts.indexOf(expected);
      return {
        id: `check-mastery-${conceptId}-${now}`,
        stepType: "quick_check",
        title: "Quick Check",
        studentText: action.reason || `Let us check your understanding of ${conceptId}.`,
        interactionSpec: {
          type: "tap_choice",
          prompt: aiContext.prompt || `${conceptId} mastery check`,
          choices: optsToChoices(opts),
          correctChoiceId: correctIdx >= 0 ? String(correctIdx) : undefined,
          conceptId,
        } as any,
        feedbackSpec: {
          correct: "Well done — you have mastered this concept!",
          incorrect: "Let me help you think through this.",
        },
        owlText: "A quick check to see how confident you are with this idea.",
      };
    }

    case "move_forward":
      return {
        id: `move-forward-${conceptId}-${now}`,
        stepType: "complete",
        title: "Well done!",
        studentText: action.reason ||
          `You have demonstrated a solid understanding of ${conceptId}. Let us move on!`,
        interactionSpec: { type: "tap_continue" },
        owlText: action.reason || "You have grown so much — let us take on the next challenge!",
        rewardText: `to ${action.nextConceptId || "the next concept"}`,
      };

    case "ask":
      return {
        id: `ask-${conceptId}-${now}`,
        stepType: "think_first",
        title: "Think about this",
        studentText: action.prompt || "What do you think?",
        owlText: action.reason || "Here is a hint to guide your thinking.",
        interactionSpec: { type: "tap_continue" },
        feedbackSpec: { hint: action.reason || "Think carefully." },
      };

    case "provide_hint":
      return {
        id: `hint-${conceptId}-${now}`,
        stepType: "think_first",
        title: "A hint for you",
        studentText: action.hint || "Here is a hint to help you.",
        owlText: action.hint || "Think about it — you have got this!",
        interactionSpec: { type: "tap_continue" },
      };

    case "provide_example":
      return {
        id: `example-${conceptId}-${now}`,
        stepType: "example",
        title: "Example",
        studentText: action.example || `Here is an example of ${conceptId}.`,
        interactionSpec: { type: "tap_continue" },
        owlText: action.example || "Let us work through an example together.",
      };

    case "demonstrate":
      return {
        id: `demo-${conceptId}-${now}`,
        stepType: "learn",
        title: "Let us see it",
        studentText: action.reason || `Here is a demonstration of ${conceptId}.`,
        visualSpec: { type: action.representation || "place_value_chart" } as any,
        interactionSpec: { type: "tap_continue" },
        owlText: action.reason || "Watch carefully as we work through this.",
      };

    case "revisit_prerequisite": {
      const prereqId = action.prerequisiteConceptId || conceptId;
      return {
        id: `prereq-${prereqId}-${now}`,
        stepType: "learn",
        title: "Let us review first",
        studentText: action.reason || `Before we continue, let us review ${prereqId}.`,
        interactionSpec: { type: "tap_continue" },
        owlText: action.reason || "Going back to the basics will strengthen your understanding.",
      };
    }

    default: {
      // Exhaustiveness check — if a new actionType is added to PedagogicalActionKind,
      // TypeScript will flag this as missing a case.
      const _exhaustive: never = action;
      return {
        id: `action-${conceptId}-${now}`,
        stepType: "learn",
        title: "Learning Moment",
        studentText: (_exhaustive as any).reason || `Let us review ${conceptId}.`,
        owlText: "Every step forward is progress.",
        interactionSpec: { type: "tap_continue" },
      };
    }
  }
}