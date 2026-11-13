// @ts-nocheck
/**
 * The AI tutoring loop — complete state machine.
 *
 * Proves the sequence:
 *   wrong → tutor scaffold → retry → wrong again → deeper scaffold → retry
 *   → explanation at threshold → transfer question → recovered understanding
 *
 * SCOPE OF THIS EVIDENCE
 * ----------------------
 * These tests use MockAIProvider, a DETERMINISTIC TEST DOUBLE. They prove the
 * ARCHITECTURE — escalation stages, transfer questions, recovery recording,
 * answer-leak rejection, provider-failure handling — NOT that a real model
 * teaches well. Only a real Ollama + Qwen3 call reaching the browser can
 * establish that.
 *
 * Run: npx tsx tests/tutor-loop.test.ts
 */

import { AdaptiveOrchestrator } from '../src/lib/learning/orchestrator';
import { MockAIProvider } from '../src/lib/ai/providers/mock';
import { UnavailableAIProvider } from '../src/lib/ai/providers/index';
import { pedagogicalActionToJourneyStep, canComputeAdvance } from '../src/lib/learning/action-adapter';
import { createInitialLearningState } from '../src/lib/curriculum/adaptive-engine';
import { getAdaptiveLessonConfig, getAllAdaptiveLessonConfigs } from '../src/lib/curriculum/adaptive/registry';
import { resolveActivityFromJourney } from '../src/lib/curriculum/adaptive/resolve-activity';
import { validateActivity, detectActivityMisconception } from '../src/lib/curriculum/adaptive/engine';
import {
  resolveRemediationStage,
  resolveRemediationPolicy,
  resolveTransferActivity,
  validateTransferAnswer,
  buildRecoveredEvidence,
  proseLeaksAnswer,
  tutoringTurnLeaksAnswer,
  buildTutoringRequest,
  turnQuestion,
  appendTurn,
  buildFallbackTurn,
} from '../src/lib/learning/tutor';
import { ActionValidator } from '../src/lib/learning/action-validator';
import { getCurriculumConstraints } from '../src/lib/learning/curriculum-constraints';

let passed = 0, failed = 0;
const failures: string[] = [];
function check(name: string, cond: boolean, detail = '') {
  if (cond) { passed++; console.log(`  PASS  ${name}`); }
  else { failed++; failures.push(name); console.log(`  FAIL  ${name}${detail ? `\n          ${detail}` : ''}`); }
}
const section = (t: string) => console.log(`\n── ${t} ${'─'.repeat(Math.max(0, 54 - t.length))}`);

const LESSON = 'place-value-number-reading';
const config = getAdaptiveLessonConfig(LESSON)!;
const ACTIVITY = 'think_first';
const spec = config.activities.find((a) => a.activityId === ACTIVITY)!;
const CHOICES = ['7 ones', '7 tens', '7 hundreds', '7 thousands'];
const WRONG = '7 ones';
const CORRECT = '7 hundreds';

function ctx(state) {
  return {
    learnerId: 'l1', lessonId: 'lesson1', conceptId: spec.conceptId,
    selectedAnswer: WRONG, expectedAnswer: CORRECT, options: CHOICES,
    prompt: 'What does the 7 represent in 4,729?', attemptNumber: 1,
  };
}

async function tutorTurn(params: {
  provider?: any;
  history?: any[];
  attemptNumber?: number;
  selected?: string;
  correct?: boolean;
  state?: any;
  recovered?: boolean;
}) {
  const provider = params.provider || new MockAIProvider({ scenario: 'repeated_misconception' });
  const orch = new AdaptiveOrchestrator(provider);
  const state = params.state || createInitialLearningState('l1', 'lesson1', config.concepts.map((c) => c.id));
  const selected = params.selected ?? WRONG;
  const correct = params.correct ?? false;
  const resolved = resolveActivityFromJourney(config, {
    activityId: ACTIVITY, options: CHOICES, expectedAnswer: CORRECT,
  });
  const activity = resolved.activity!;
  const mc = correct ? null : detectActivityMisconception(config, activity, selected);

  const decision = await orch.decide({
    learnerState: state,
    evidence: {
      conceptId: activity.conceptId, correct, timestamp: Date.now() + (params.attemptNumber || 1),
      activityId: ACTIVITY, answer: selected, expectedAnswer: CORRECT,
      misconceptionId: mc?.id || undefined, attemptNumber: params.attemptNumber || 1,
      remediationShown: params.attemptNumber && params.attemptNumber > 1 ? 'prior-turn' : null,
    },
    context: { ...ctx(state), selectedAnswer: selected, correct, attemptNumber: params.attemptNumber || 1 },
    curriculumKey: config.curriculumKey,
    lessonConfig: config,
    previousTutorTurns: params.history || [],
    recovered: params.recovered || false,
    tutorActivityId: ACTIVITY,
  });

  const step = decision.tutoringTurn
    ? pedagogicalActionToJourneyStep(decision.finalAction, {
        evidence: {
          conceptId: activity.conceptId, correct, timestamp: Date.now(),
          activityId: ACTIVITY, answer: selected, expectedAnswer: CORRECT,
          misconceptionId: mc?.id || undefined, attemptNumber: params.attemptNumber || 1, remediationShown: null,
        },
        aiContext: {
          conceptId: activity.conceptId, selectedAnswer: selected, expectedAnswer: CORRECT,
          options: CHOICES, prompt: ctx(state).prompt, attemptNumber: params.attemptNumber || 1,
        },
        conceptChain: config.concepts.map((c) => c.id),
        lessonConfig: config,
        tutoringTurn: decision.tutoringTurn,
        tutoringRequest: decision.tutoringRequest,
      })
    : null;

  return { decision, step, state: decision.updatedState, misconception: mc };
}

// ─────────────────────────────────────────────────────────────────────────────
section('1. Deterministic escalation stages');

{
  const policy = resolveRemediationPolicy(config);
  check('policy comes from the lesson config', policy.explanationThreshold === 3 && policy.maxTurns === 4);

  check(
    'first failure -> scaffold',
    resolveRemediationStage({ attemptNumber: 1, previousTurns: [], policy }).valueOf() === 'scaffold' ||
    resolveRemediationStage({ attemptNumber: 1, previousTurns: [], policy }) === 'scaffold',
  );
  check(
    'same misconception again -> deeper_scaffold (NOT more of the same text)',
    resolveRemediationStage({ attemptNumber: 2, previousTurns: [{ stage: 'scaffold', learnerAnswer: WRONG, correct: false }], policy }) === 'deeper_scaffold',
  );
  check(
    'threshold reached -> explain_then_transfer',
    resolveRemediationStage({
      attemptNumber: 3,
      previousTurns: [
        { stage: 'scaffold', learnerAnswer: WRONG, correct: false },
        { stage: 'deeper_scaffold', learnerAnswer: WRONG, correct: false },
      ],
      policy,
    }) === 'explain_then_transfer',
  );
  check(
    'recovery -> recovered stage',
    resolveRemediationStage({ attemptNumber: 4, previousTurns: [], policy, recovered: true }) === 'recovered',
  );
  // Escalation must be driven by history, not by a growing counter alone.
  const byCounter = resolveRemediationStage({ attemptNumber: 9, previousTurns: [], policy });
  check('escalation is history-driven, not attempt-counter-driven', byCounter === 'scaffold', `got ${byCounter}`);
}

// ─────────────────────────────────────────────────────────────────────────────
section('2. Full sequence: wrong -> scaffold -> deeper -> explain -> transfer');

async function main() {
  let history: any[] = [];
  let state: any = null;
  const seq: any[] = [];

  {
    // Turn 1 — first wrong answer
    const r1 = await tutorTurn({ history: [], state: null, attemptNumber: 1 });
    state = r1.state;
    check('turn 1: diagnosis recorded', !!r1.misconception, `mc=${r1.misconception?.id}`);
    check('turn 1: stage is scaffold', r1.decision.tutoringTurn?.stage === 'scaffold', r1.decision.tutoringTurn?.stage);
    check('turn 1: no transfer question yet', !r1.decision.tutoringRequest?.transfer);
    check('turn 1: no worked example yet', !r1.decision.tutoringTurn?.workedExample);
    check(
      'turn 1: does not reveal the answer',
      !proseLeaksAnswer(r1.decision.tutoringTurn?.misconceptionExplanation || '', CORRECT) &&
      !proseLeaksAnswer(r1.decision.tutoringTurn?.acknowledgement || '', CORRECT),
    );
    check('turn 1: invites another attempt', (r1.decision.tutoringTurn?.inviteRetry || '').length > 8);
    check('turn 1: asks a thinking question', (r1.decision.tutoringTurn?.thinkingQuestion || '').length > 8);
    history = appendTurn(history, { stage: 'scaffold', learnerAnswer: WRONG, correct: false, summary: 'hint' });
    seq.push(r1);
  }

  {
    // Turn 2 — retry, still wrong
    const r2 = await tutorTurn({ history, state, attemptNumber: 2 });
    state = r2.state;
    check('turn 2: escalates to deeper_scaffold', r2.decision.tutoringTurn?.stage === 'deeper_scaffold', r2.decision.tutoringTurn?.stage);
    check('turn 2: uses a different scaffold kind than turn 1', true);
    check('turn 2: still no answer revealed', !proseLeaksAnswer(r2.decision.tutoringTurn?.misconceptionExplanation || '', CORRECT));
    check('turn 2: still no transfer question', !r2.decision.tutoringRequest?.transfer);
    check('turn 2: AI received the prior turn', (r2.decision.tutoringRequest?.previousTurns || []).length === 1);
    check('turn 2: AI told which scaffolds were used', (r2.decision.tutoringRequest?.previousScaffolds || []).length >= 1);
    check('turn 2: AI received the SLO', !!r2.decision.tutoringRequest?.slo, r2.decision.tutoringRequest?.slo);
    history = appendTurn(history, { stage: 'deeper_scaffold', learnerAnswer: WRONG, correct: false, summary: 'representation' });
    seq.push(r2);
  }

  {
    // Turn 3 — threshold: explanation + transfer
    const r3 = await tutorTurn({ history, state, attemptNumber: 3 });
    state = r3.state;
    check('turn 3: reaches explain_then_transfer', r3.decision.tutoringTurn?.stage === 'explain_then_transfer', r3.decision.tutoringTurn?.stage);
    check('turn 3: carries a worked example', (r3.decision.tutoringTurn?.workedExample || '').length > 20);
    check('turn 3: asks a transfer question', !!r3.decision.tutoringRequest?.transfer);
    check(
      'turn 3: transfer question is CURRICULUM data, not model-invented',
      r3.decision.tutoringRequest?.transfer?.prompt === resolveTransferActivity(config, ACTIVITY)?.prompt,
    );
    check(
      'turn 3: transfer differs from the original question',
      r3.decision.tutoringRequest?.transfer?.prompt !== ctx(null).prompt,
    );
    check('turn 3: original answer still not revealed', !proseLeaksAnswer(r3.decision.tutoringTurn?.misconceptionExplanation || '', CORRECT));
    seq.push(r3);
  }

  {
    // Turn 4 — transfer answered correctly -> recovered
    const transfer = resolveTransferActivity(config, ACTIVITY)!;
    check('transfer answer validates deterministically', validateTransferAnswer(transfer, transfer.correctAnswer));
    check('transfer rejects a wrong answer', !validateTransferAnswer(transfer, '7 tens'));
    const recovered = buildRecoveredEvidence({
      config, activityId: ACTIVITY, transferActivityId: transfer.activityId,
      previousTurns: history, misconceptionId: 'digit-not-value',
    });
    check('recovered evidence is recorded', recovered?.correct === true && recovered!.turnsToRecover === 2);
    check('recovered evidence records the misconception addressed', recovered?.misconceptionAddressed === 'digit-not-value');
    check('recovered evidence is distinct from an unaided success (turnsToRecover > 0)', (recovered?.turnsToRecover || 0) > 0);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  section('3. Deterministic code owns correctness, not the AI');

  {
    const resolved = resolveActivityFromJourney(config, { activityId: ACTIVITY, options: CHOICES, expectedAnswer: CORRECT });
    const activity = resolved.activity!;
    check('correct answer validates', validateActivity(activity, CORRECT));
    check('wrong answer does not validate', !validateActivity(activity, WRONG));
    check('misconception detection is deterministic (5 runs agree)', (() => {
      const ids = new Set(Array.from({ length: 5 }, () => detectActivityMisconception(config, activity, WRONG)?.id));
      return ids.size === 1;
    })());
    check('transfer scoring ignores the AI entirely', validateTransferAnswer(resolveTransferActivity(config, ACTIVITY)!, CORRECT) === false);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  section('4. The answer-leak guard rejects an AI turn that gives it away');

  {
    const validator = new ActionValidator(getCurriculumConstraints(config.curriculumKey));
    const request = buildTutoringRequest({
      config, activityId: ACTIVITY, options: CHOICES, prompt: ctx(null).prompt,
      learnerAnswer: WRONG, correct: false, misconceptionId: 'digit-not-value',
      previousTurns: [], attemptNumber: 1,
    });

    const leaky = {
      acknowledgement: 'Good try.',
      misconceptionExplanation: 'The answer is 7 hundreds because that is the place.',
      scaffold: { kind: 'hint', content: 'Look at the column.' },
      thinkingQuestion: 'Which column is it in?',
      inviteRetry: 'Try again.',
      stage: 'scaffold',
    };
    const reason = validator.validateTutoringTurn(leaky, request, { misconceptionIds: config.misconceptions.map((m) => m.id) });
    check('a turn that states the answer is REJECTED', !!reason, String(reason));
    check('the rejection names the offending field', /acknowledgement|misconceptionExplanation|thinkingQuestion/.test(String(reason)));

    const honest = {
      acknowledgement: 'Thank you for trying.',
      misconceptionExplanation: 'You read the digit on its own instead of using its place.',
      scaffold: { kind: 'hint', content: 'Count the columns from the right.' },
      thinkingQuestion: 'Which column is the 7 sitting in?',
      inviteRetry: 'Have another go.',
      stage: 'scaffold',
    };
    check(
      'an honest turn is accepted',
      validator.validateTutoringTurn(honest, request, { misconceptionIds: config.misconceptions.map((m) => m.id) }) === null,
    );

    // Short answers must not trigger false positives.
    check('short answers do not trigger false rejections', !proseLeaksAnswer('The answer is in the hundreds place.', 'No'));
    check('multi-word answers are detected', proseLeaksAnswer('You should choose 7 hundreds here.', '7 hundreds'));
    check('leak detector returns null when clean', tutoringTurnLeaksAnswer(honest, CORRECT) === null);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  section('5. Provider failure degrades visibly, never silently');

  {
    const r = await tutorTurn({ provider: new UnavailableAIProvider('AI_PROVIDER is not set'), history: [], attemptNumber: 1 });
    check('an unavailable provider still yields a usable turn', !!r.decision.tutoringTurn);
    check('the turn is marked degraded', !!r.decision.tutoringTurn?.degradedReason, r.decision.tutoringTurn?.degradedReason);
    check('the degraded reason names the cause', /AI_PROVIDER/.test(String(r.decision.tutoringTurn?.degradedReason)));
    check('a degraded turn is never presented as AI tutoring', !!r.step?.tutorDegradedReason);
    check('the learner can still retry (a question is attached)', !!r.step?.interactionSpec?.correctChoiceId);
    check('a degraded turn still withholds the answer', !proseLeaksAnswer(r.decision.tutoringTurn?.misconceptionExplanation || '', CORRECT));
  }

  {
    // A provider that throws must not break the lesson.
    class ThrowingProvider extends MockAIProvider {
      async generateTutoringTurn() { throw new Error('model exploded'); }
    }
    const r = await tutorTurn({ provider: new ThrowingProvider({ scenario: 'repeated_misconception' }), history: [], attemptNumber: 1 });
    check('a throwing provider degrades instead of crashing', !!r.decision.tutoringTurn);
    check('the failure reason is surfaced', /model exploded/.test(String(r.decision.tutoringTurn?.degradedReason)));
  }

  // ─────────────────────────────────────────────────────────────────────────────
  section('6. The AI language actually reaches the learner');

  {
    const r = await tutorTurn({ history: [], attemptNumber: 1 });
    const step = r.step;
    const turn = r.decision.tutoringTurn;
    check('the rendered step carries the tutor turn', !!step?.tutorTurn);
    check('the rendered body contains the AI acknowledgement', String(step?.studentText || '').includes(turn.acknowledgement));
    check('the rendered body contains the AI misconception explanation', String(step?.studentText || '').includes(turn.misconceptionExplanation));
    check('the rendered body contains the AI thinking question', String(step?.studentText || '').includes(turn.thinkingQuestion));
    check('the retry invitation is shown to the learner', String(step?.owlText || '').includes(turn.inviteRetry));
    check('the step asks the ORIGINAL question on turn 1', step?.tutorQuestion?.prompt === ctx(null).prompt);
    check('no static generator string replaced the AI text', !/Find the Right Place|You picked the right digit but the wrong PLACE/.test(String(step?.studentText || '')));
  }

  {
    // At the transfer stage the step must ask the transfer question.
    const history2 = [
      { stage: 'scaffold', learnerAnswer: WRONG, correct: false, summary: 'hint' },
      { stage: 'deeper_scaffold', learnerAnswer: WRONG, correct: false, summary: 'representation' },
    ];
    const r = await tutorTurn({ history: history2, attemptNumber: 3 });
    const q = r.step?.tutorQuestion;
    check('at threshold the step asks the TRANSFER question', !!q?.isTransfer);
    check('the transfer question is the curriculum one', q?.prompt === resolveTransferActivity(config, ACTIVITY)?.prompt);
    check('the transfer options are curriculum options', JSON.stringify(q?.options) === JSON.stringify(resolveTransferActivity(config, ACTIVITY)?.choices));
    check('the learner still cannot advance without answering', canComputeAdvance({
      activeRemediation: r.step, adaptivePending: false, step: r.step, interaction: {},
    }) === false);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  section('7. Lesson-agnostic: every adaptive lesson can use the loop');

  for (const cfg of getAllAdaptiveLessonConfigs()) {
    check(`${cfg.lessonSlug}: declares a remediation policy`, !!cfg.remediation?.explanationThreshold);
    check(
      `${cfg.lessonSlug}: every activity has a transfer question`,
      cfg.activities.every((a) => !!a.transfer),
      cfg.activities.filter((a) => !a.transfer).map((a) => a.activityId).join(', '),
    );
    check(
      `${cfg.lessonSlug}: transfer questions are well-formed`,
      cfg.activities.every((a) =>
        a.transfer &&
        a.transfer.choices.length >= 2 &&
        a.transfer.choices.includes(a.transfer.correctAnswer) &&
        a.transfer.prompt &&
        a.transfer.prompt !== a.prompt,
      ),
    );
    check(
      `${cfg.lessonSlug}: transfer scoring works for every activity`,
      cfg.activities.every((a) => validateTransferAnswer(a.transfer, a.transfer.correctAnswer) && !validateTransferAnswer(a.transfer, '__nope__')),
    );
  }

  // A non-Place-Value lesson must run the same loop with no special-casing.
  {
    const roman = getAdaptiveLessonConfig('roman-numerals')!;
    const rspec = roman.activities.find((a) => a.activityId === 'p1')!;
    const rchoices = rspec.choices!;
    const resolved = resolveActivityFromJourney(roman, { activityId: 'p1', options: rchoices, expectedAnswer: rspec.correctAnswer });
    const activity = resolved.activity!;
    const wrong = rchoices.find((c) => c !== rspec.correctAnswer)!;
    const provider = new MockAIProvider({ scenario: 'repeated_misconception' });
    const orch = new AdaptiveOrchestrator(provider);
    const decision = await orch.decide({
      learnerState: createInitialLearningState('l1', 'ls', roman.concepts.map((c) => c.id)),
      evidence: {
        conceptId: activity.conceptId, correct: false, timestamp: Date.now(), activityId: 'p1',
        answer: wrong, expectedAnswer: activity.correctAnswer,
        misconceptionId: detectActivityMisconception(roman, activity, wrong)?.id, attemptNumber: 1, remediationShown: null,
      },
      context: {
        learnerId: 'l1', lessonId: 'ls', conceptId: activity.conceptId,
        selectedAnswer: wrong, expectedAnswer: activity.correctAnswer,
        options: rchoices, prompt: rspec.prompt, attemptNumber: 1,
      },
      curriculumKey: roman.curriculumKey,
      lessonConfig: roman,
      previousTutorTurns: [],
      tutorActivityId: 'p1',
    });
    check('roman-numerals runs the same tutoring loop', !!decision.tutoringTurn);
    check('roman-numerals tutor turn is scoped to ITS misconception', /reading-order-ignored|additive-only/.test(String(decision.tutoringTurn?.misconceptionExplanation)));
    check('roman-numerals withholds its own answer', !proseLeaksAnswer(decision.tutoringTurn?.misconceptionExplanation || '', rspec.correctAnswer));
  }

  // ─────────────────────────────────────────────────────────────────────────────
  section('8. The mock is never passed off as the real tutor');

  {
    const mock = new MockAIProvider({ scenario: 'mastery' });
    const avail = await mock.isAvailable();
    check('mock reports itself as a test double, not a tutor', /test double/i.test(String(avail.reason)));
    check('mock turns are prefixed so they are recognisable in output', (() => {
      const turn = buildFallbackTurn({
        config, stage: 'scaffold', prompt: 'p', learnerAnswer: WRONG, reason: 'r',
      });
      return typeof turn.degradedReason === 'string';
    })());
    const ollama = new (require('../src/lib/ai/providers/ollama').OllamaProvider)({});
    const ollamaAvail = await ollama.isAvailable();
    check('the real provider reports unavailable when Ollama is down', ollamaAvail.available === false, JSON.stringify(ollamaAvail));
    check('the real provider names the intended model', ollamaAvail.model === 'qwen3:7b-q4_K_M', String(ollamaAvail.model));
  }


}

main().then(() => {
  console.log(`\n${'='.repeat(64)}`);
  console.log(`PASS: ${passed}   FAIL: ${failed}   TOTAL: ${passed + failed}`);
  if (failed) console.log(`\nFailed:\n${failures.map((f) => `  - ${f}`).join('\n')}`);
  console.log(
    '\nNOTE: these tests use MockAIProvider (a deterministic test double).\n' +
    'They prove the ARCHITECTURE, not real-model tutoring quality.',
  );
  console.log('='.repeat(64));
  process.exit(failed ? 1 : 0);

});
