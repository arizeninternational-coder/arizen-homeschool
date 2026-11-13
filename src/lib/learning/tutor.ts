/**
 * The remediation state machine.
 *
 * Deterministic application code owns:
 *   - which escalation STAGE a remediation conversation is in
 *   - which transfer question (if any) is asked
 *   - attempt counting and the recovered-understanding record
 *
 * The AI tutor owns only the LANGUAGE for the current stage. This separation is
 * what keeps correctness, validation and mastery out of the model's hands while
 * still letting the model teach.
 *
 * Lesson-agnostic: everything is derived from the lesson's AdaptiveLessonConfig.
 */

import type {
  AdaptiveLessonConfig,
  TransferActivitySpec,
} from '../curriculum/adaptive/types';
import type {
  RemediationStage,
  TutoringTurn,
  TutoringTurnRecord,
} from '../ai/AIProvider';
import { resolveActivityFromJourney } from '../curriculum/adaptive/resolve-activity';
import { validateActivity } from '../curriculum/adaptive/engine';

// ── Policy resolution ───────────────────────────────────────────────────────

export interface ResolvedRemediationPolicy {
  explanationThreshold: number;
  maxTurns: number;
  preferredRepresentations: string[];
}

export function resolveRemediationPolicy(
  config: AdaptiveLessonConfig,
): ResolvedRemediationPolicy {
  return {
    explanationThreshold: config.remediation?.explanationThreshold ?? 3,
    maxTurns: config.remediation?.maxTurns ?? 4,
    preferredRepresentations:
      config.remediation?.preferredRepresentations ??
      config.concepts.flatMap((c) => c.allowedRepresentations ?? []),
  };
}

// ── Stage selection ─────────────────────────────────────────────────────────

/**
 * Decide the escalation stage from the conversation so far.
 *
 * Purely deterministic:
 *   - no prior tutor turns  -> scaffold
 *   - one prior turn       -> deeper_scaffold
 *   - threshold reached    -> explain_then_transfer
 *
 * The same misconception persisting is what drives escalation; simply writing
 * more text is not a strategy.
 */
export function resolveRemediationStage(params: {
  attemptNumber: number;
  previousTurns: TutoringTurnRecord[];
  policy: ResolvedRemediationPolicy;
  /** True when the learner just answered the transfer question correctly. */
  recovered?: boolean;
}): RemediationStage {
  if (params.recovered) return 'recovered';

  const turnsBeforeExplanation = params.previousTurns.length;
  if (turnsBeforeExplanation + 1 >= params.policy.explanationThreshold) {
    return 'explain_then_transfer';
  }
  if (turnsBeforeExplanation >= 1) return 'deeper_scaffold';
  return 'scaffold';
}

/** True when this stage must carry a worked explanation. */
export function stageRequiresExplanation(stage: RemediationStage): boolean {
  return stage === 'explain_then_transfer';
}

/** True when this stage asks the curriculum transfer question. */
export function stageUsesTransfer(stage: RemediationStage): boolean {
  return stage === 'explain_then_transfer';
}

// ── Transfer question resolution ─────────────────────────────────────────────

/**
 * Resolve the transfer question for an activity, deterministically.
 * Returns null when the lesson declares none for that activity — in which case
 * recovery is measured on the original activity instead.
 */
export function resolveTransferActivity(
  config: AdaptiveLessonConfig,
  activityId: string,
): TransferActivitySpec | null {
  const activity = config.activities.find((a) => a.activityId === activityId);
  if (!activity) return null;
  const transfer = activity.transfer;
  if (!transfer) return null;
  if (!transfer.choices || transfer.choices.length < 2) return null;
  if (!transfer.correctAnswer) return null;
  if (!transfer.choices.includes(transfer.correctAnswer)) return null;
  return transfer;
}

/**
 * Deterministically score a learner's answer to a transfer question.
 * The AI never decides this.
 */
export function validateTransferAnswer(
  transfer: TransferActivitySpec,
  selected: string,
): boolean {
  if (transfer.validate) return transfer.validate(selected, transfer.correctAnswer);
  const norm = (v: string) => String(v).trim().toLowerCase().replace(/[,\s]/g, '');
  return norm(selected) === norm(transfer.correctAnswer);
}

// ── Recovered understanding ─────────────────────────────────────────────────

/**
 * Evidence for a learner who got a transfer question right after remediation.
 *
 * Recorded as a distinct concept event so mastery can credit RECOVERED
 * understanding differently from an unaided first-attempt success, while still
 * being counted by the deterministic mastery rules.
 */
export interface RecoveredEvidence {
  conceptId: string;
  activityId: string;
  transferActivityId: string;
  correct: true;
  /** How many remediation turns preceded the recovery. */
  turnsToRecover: number;
  misconceptionAddressed: string | null;
  timestamp: number;
}

export function buildRecoveredEvidence(params: {
  config: AdaptiveLessonConfig;
  activityId: string;
  transferActivityId: string;
  previousTurns: TutoringTurnRecord[];
  misconceptionId: string | null;
}): RecoveredEvidence | null {
  const activity = params.config.activities.find((a) => a.activityId === params.activityId);
  if (!activity) return null;
  return {
    conceptId: activity.conceptId,
    activityId: params.activityId,
    transferActivityId: params.transferActivityId,
    correct: true,
    turnsToRecover: params.previousTurns.length,
    misconceptionAddressed: params.misconceptionId,
    timestamp: Date.now(),
  };
}

// ── Answer-leak guard ───────────────────────────────────────────────────────

/**
 * Deterministic check that tutor prose does not reveal the answer to the
 * learner's OWN question.
 *
 * A model can leak an answer even when instructed not to, so this is enforced in
 * application code rather than trusted to the prompt. Short answers ("3", "No")
 * are exempt: they appear inside ordinary words and would cause false rejects.
 */
export function proseLeaksAnswer(
  prose: string,
  answer: string,
  opts: { minLength?: number } = {},
): boolean {
  const min = opts.minLength ?? 4;
  const a = String(answer || '').trim();
  if (a.length < min) return false;

  const escaped = a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Standalone occurrence, not a substring of a longer number/word.
  const standalone = new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}([^\\p{L}\\p{N}]|$)`, 'iu');
  return standalone.test(prose);
}

/**
 * Fields of a tutoring turn that must never state the learner's answer.
 * A turn that names the answer in any of these is rejected.
 */
export function tutoringTurnLeaksAnswer(
  turn: Partial<TutoringTurn>,
  correctAnswer: string,
): string | null {
  const fields: Array<[string, string | undefined]> = [
    ['acknowledgement', turn.acknowledgement],
    ['misconceptionExplanation', turn.misconceptionExplanation],
    ['thinkingQuestion', turn.thinkingQuestion],
    ['inviteRetry', turn.inviteRetry],
    ['scaffold.content', turn.scaffold?.content],
  ];
  for (const [name, value] of fields) {
    if (value && proseLeaksAnswer(value, correctAnswer)) {
      return `${name} reveals the answer "${correctAnswer}"`;
    }
  }
  return null;
}

// ── Deterministic fallback turn ─────────────────────────────────────────────

/**
 * A safe turn used when the AI is unavailable or its output is rejected.
 *
 * This is NOT presented as AI tutoring: it carries `degradedReason`, and the
 * client surfaces that state. It exists so the learner is never left without a
 * retry opportunity when the model is down.
 */
export function buildFallbackTurn(params: {
  config: AdaptiveLessonConfig;
  stage: RemediationStage;
  prompt: string;
  learnerAnswer: string;
  misconceptionLabel?: string;
  transfer?: { prompt: string; options: string[]; correctAnswer: string };
  reason: string;
}): TutoringTurn {
  const { stage, misconceptionLabel } = params;
  const misconception = misconceptionLabel
    ? `This looks like "${misconceptionLabel}".`
    : 'That answer does not fit yet.';

  if (stage === 'explain_then_transfer') {
    return {
      acknowledgement: `You have tried this ${'more than once'}, and that is good practice.`,
      misconceptionExplanation: `${misconception} Here is the full method, worked through.`,
      scaffold: {
        kind: 'worked_example',
        content:
          'Work from the largest place first and check each column in turn. ' +
          'Write each column down one at a time before combining them.',
      },
      thinkingQuestion: `Try the closely related question below. It uses exactly the same idea.`,
      inviteRetry: 'Go on — answer the new question and show me what you notice.',
      workedExample:
        'Take the number apart one place at a time. Name each place, say what the digit there is worth, ' +
        'then add the parts back together to check your total matches the original number.',
      stage,
      transfer: params.transfer,
      degradedReason: params.reason,
    };
  }

  if (stage === 'deeper_scaffold') {
    return {
      acknowledgement: 'You are still thinking about this one — that is useful.',
      misconceptionExplanation: `${misconception} Let us look at it a different way.`,
      scaffold: {
        kind: 'representation',
        content:
          'Break the question into its parts. Name each part in words before you do any arithmetic, ' +
          'then handle one part at a time.',
      },
      thinkingQuestion: `Which single part of the question should you deal with first?`,
      inviteRetry: 'Have another go using that part.',
      stage,
      degradedReason: params.reason,
    };
  }

  return {
    acknowledgement: 'Thank you for trying.',
    misconceptionExplanation: `${misconception} Let us look at the question again together.`,
    scaffold: {
      kind: 'hint',
      content: 'Read the question one piece at a time, and decide what each piece is asking you to do.',
    },
    thinkingQuestion: `Before you choose, what is the question really asking you to work out?`,
    inviteRetry: 'Try once more — you have everything you need.',
    stage,
    degradedReason: params.reason,
  };
}

// ── History helpers ─────────────────────────────────────────────────────────

/** Append a completed turn to the conversation history. */
export function appendTurn(
  history: TutoringTurnRecord[],
  turn: { stage: RemediationStage; learnerAnswer: string; correct: boolean; summary?: string },
): TutoringTurnRecord[] {
  return [...history, { ...turn }];
}

/** Scaffolds already delivered, so the tutor escalates rather than repeats. */
export function scaffoldsUsed(history: TutoringTurnRecord[]): string[] {
  return history.map((t) => t.summary || t.stage).filter(Boolean);
}

/**
 * Build the full tutoring request from lesson config + conversation state.
 * The AI receives curriculum, activity, response, diagnosis and history.
 */
export function buildTutoringRequest(params: {
  config: AdaptiveLessonConfig;
  activityId: string;
  options: string[];
  prompt: string;
  learnerAnswer: string;
  correct: boolean;
  misconceptionId: string | null;
  misconceptionLabel?: string;
  previousTurns: TutoringTurnRecord[];
  attemptNumber: number;
  /** True when the learner just answered a transfer question correctly. */
  recovered?: boolean;
}): import('../ai/AIProvider').TutoringRequest {
  const { config } = params;
  const policy = resolveRemediationPolicy(config);
  const stage = resolveRemediationStage({
    attemptNumber: params.attemptNumber,
    previousTurns: params.previousTurns,
    policy,
    recovered: params.recovered,
  });

  const activity = config.activities.find((a) => a.activityId === params.activityId);
  const transferSpec = stageUsesTransfer(stage)
    ? resolveTransferActivity(config, params.activityId)
    : null;

  return {
    slo: activity?.slo,
    lessonTitle: config.lessonTitle,
    allowedConceptIds: config.concepts.map((c) => c.id),
    allowedMisconceptionIds: config.misconceptions.map((m) => m.id),
    allowedRepresentations: policy.preferredRepresentations,

    activityId: params.activityId,
    conceptId: activity?.conceptId ?? '',
    prompt: params.prompt,
    options: params.options,
    correctAnswer: activity?.correctAnswer ?? '',

    learnerAnswer: params.learnerAnswer,
    correct: params.correct,
    misconceptionId: params.misconceptionId,
    misconceptionLabel: params.misconceptionLabel,

    attemptNumber: params.attemptNumber,
    previousTurns: params.previousTurns,
    previousScaffolds: scaffoldsUsed(params.previousTurns),
    stage,
    explanationThreshold: policy.explanationThreshold,

    transfer: transferSpec
      ? {
          prompt: transferSpec.prompt,
          options: transferSpec.choices,
          correctAnswer: transferSpec.correctAnswer,
        }
      : undefined,
  };
}

/** Which question the learner must answer on this turn. */
export function turnQuestion(
  turn: TutoringTurn,
  request: import('../ai/AIProvider').TutoringRequest,
): { prompt: string; options: string[]; correctAnswer: string; isTransfer: boolean } {
  if (turn.transfer) {
    return { ...turn.transfer, isTransfer: true };
  }
  return {
    prompt: request.prompt,
    options: request.options,
    correctAnswer: request.correctAnswer,
    isTransfer: false,
  };
}
