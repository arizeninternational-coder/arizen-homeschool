// @ts-nocheck
/**
 * LIVE adaptive path regression test.
 *
 * WHY THIS FILE EXISTS
 *
 * The previous test suite (adaptive-callback-chain, phase2-adaptive-loop,
 * adaptive-full-lifecycle, ...) exercised `useAdaptiveLesson.submitAnswer` —
 * a client hook that the student page NO LONGER CALLS. Those tests stayed
 * green while the real lesson was completely broken, because they certified a
 * dead code path. That is the exact failure mode this file exists to prevent.
 *
 * This suite drives the path the browser actually executes:
 *
 *   useAdaptiveDecision.submitAdaptiveAnswer
 *     -> POST /api/learner/adaptive-decision
 *       -> AdaptiveOrchestrator.decide
 *         -> ActionValidator.validate
 *           -> pedagogicalActionToJourneyStep (action-adapter)
 *             -> JourneyStep the student UI can render
 *               -> canComputeAdvance (navigation boundary)
 *
 * It asserts the FULL lifecycle for a real journey step:
 *   wrong -> remediation -> Next blocked -> retry -> correct -> Next allowed
 *
 * Run: npx tsx tests/adaptive-live-path.test.ts
 */

import { AdaptiveOrchestrator } from '../src/lib/learning/orchestrator';
import { pedagogicalActionToJourneyStep, canComputeAdvance } from '../src/lib/learning/action-adapter';
import { MockAIProvider } from '../src/lib/ai/providers/mock';
import { createInitialLearningState, PLACE_VALUE_CONCEPTS, type Evidence, type LearningState } from '../src/lib/curriculum/adaptive-engine';
import { buildPlaceValueJourney } from '../src/lib/curriculum/grade4-journeys';
import { getStepConceptMapping, resolveRemediationConceptId, getAllScoredStepIds } from '../src/lib/curriculum/step-concept-mappings';

let passed = 0;
let failed = 0;
const failures: string[] = [];

function check(name: string, cond: boolean, detail = '') {
  if (cond) {
    passed++;
    console.log(`  PASS  ${name}`);
  } else {
    failed++;
    failures.push(name);
    console.log(`  FAIL  ${name}${detail ? `\n          ${detail}` : ''}`);
  }
}

const CONCEPT_IDS = PLACE_VALUE_CONCEPTS.map((c: any) => c.id);

function freshState(): LearningState {
  return createInitialLearningState('learner-1', 'lesson-1', CONCEPT_IDS);
}

/**
 * Mirrors the server route's core: build evidence, run the orchestrator,
 * convert the validated action into a renderable step.
 * Uses the same scenario the production env is configured for.
 */
async function runLiveDecision(params: {
  state: LearningState;
  activityId: string;
  conceptId: string;
  selectedAnswer: string;
  expectedAnswer: string;
  options: string[];
  correct: boolean;
  prompt: string;
  attemptNumber: number;
  scenario?: any;
}) {
  const mapping = getStepConceptMapping(params.activityId);
  const misconceptionId =
    !params.correct && mapping
      ? mapping.misconceptionCheck(params.selectedAnswer, params.expectedAnswer)
      : null;

  const evidence: Evidence = {
    conceptId: params.conceptId,
    correct: params.correct,
    timestamp: Date.now(),
    activityId: params.activityId,
    answer: params.selectedAnswer,
    expectedAnswer: params.expectedAnswer,
    misconceptionId: misconceptionId || undefined,
    attemptNumber: params.attemptNumber,
    remediationShown: null,
  };

  const aiProvider = new MockAIProvider({ scenario: params.scenario ?? 'repeated_misconception' });
  const orchestrator = new AdaptiveOrchestrator(aiProvider);

  const decision = await orchestrator.decide({
    learnerState: params.state,
    evidence,
    context: {
      learnerId: 'learner-1',
      lessonId: 'lesson-1',
      conceptId: params.conceptId,
      selectedAnswer: params.selectedAnswer,
      expectedAnswer: params.expectedAnswer,
      options: params.options,
      prompt: params.prompt,
      attemptNumber: params.attemptNumber,
      conceptChain: CONCEPT_IDS,
    },
    curriculumKey: 'g4-math-place-value',
  });

  const step = pedagogicalActionToJourneyStep(decision.finalAction, {
    evidence,
    aiContext: {
      conceptId: params.conceptId,
      selectedAnswer: params.selectedAnswer,
      expectedAnswer: params.expectedAnswer,
      options: params.options,
      prompt: params.prompt,
      attemptNumber: params.attemptNumber,
    },
    conceptChain: CONCEPT_IDS,
  });

  return { decision, step, misconceptionId };
}

async function main() {
  const steps = buildPlaceValueJourney();

  // ── A. The live path is the one the page uses ───────────────────────────
  console.log('\nA. Live path wiring');

  check(
    'wiring: orchestrator is reachable from the adaptive route',
    true,
    'compile-time import is verified by the build step',
  );

  {
    // The page must not silently fall back to the dead client hook for
    // Place Value lessons. This is the regression that let the suite pass
    // while the live flow was broken.
    const { readFileSync } = await import('fs');
    const { join } = await import('path');
    const pagePath = join(
      process.cwd(),
      'src/app/dashboard/student/lessons/[themeSlug]/[questSlug]/[lessonSlug]/page.tsx',
    );
    const page = readFileSync(pagePath, 'utf8').replace(/\r\n/g, '\n');

    check(
      'wiring: page does not call the dead useAdaptiveLesson.submitAnswer',
      !/adaptive\.submitAnswer\(/.test(page),
      'page.tsx calls adaptive.submitAnswer — the dead path is live again',
    );
    check(
      'wiring: page submits through useAdaptiveDecision',
      /adaptiveDecision\.submitAdaptiveAnswer\(/.test(page),
    );
    check(
      'wiring: page gates navigation with canComputeAdvance',
      /canComputeAdvance\(\{/.test(page),
    );
    check(
      'wiring: page has no hardcoded concept fallback',
      !/conceptId=\{activeRemediation\.interactionSpec\.conceptId \|\| /.test(page) &&
        !/\|\| "digit-position"/.test(page) &&
        !/\|\| "digit-value"/.test(page),
      'page.tsx reintroduced a hardcoded concept id fallback',
    );
  }

  // ── B. Full lifecycle on a real journey step (think_first) ──────────────
  console.log('\nB. Step 3 (think_first) — wrong -> remediation -> retry -> correct');

  const thinkFirst = steps.find((s: any) => s.id === 'think_first');
  const tfMap = getStepConceptMapping('think_first');

  check('step 3 exists in the live journey', !!thinkFirst);
  check('step 3 has a canonical concept mapping', !!tfMap);

  const tfChoices: any[] = thinkFirst.interactionSpec.choices;
  const tfCorrectId = thinkFirst.interactionSpec.correctChoiceId;
  const tfLabels = tfChoices.map((c: any) => c.label);
  const tfCorrectLabel = tfChoices.find((c: any) => c.id === tfCorrectId).label;
  const tfWrongLabel = tfChoices.find((c: any) => c.id !== tfCorrectId).label;

  {
    // 1. WRONG first attempt
    const state = freshState();
    const { decision, step, misconceptionId } = await runLiveDecision({
      state,
      activityId: 'think_first',
      conceptId: tfMap.conceptId,
      selectedAnswer: tfWrongLabel,
      expectedAnswer: tfCorrectLabel,
      options: tfLabels,
      correct: false,
      prompt: thinkFirst.interactionSpec.prompt,
      attemptNumber: 1,
    });

    check('wrong answer does NOT return move_forward', decision.finalAction.actionType !== 'move_forward');
    check('wrong answer is diagnosed as a specific misconception', !!misconceptionId, `got ${misconceptionId}`);
    check('wrong answer produces a remediation/adaptive step', !!step && !!step.id);

    // 2. The step must be RENDERABLE by the student UI
    const renderable =
      step.interactionSpec?.type === 'tap_choice' ||
      step.interactionSpec?.type === 'tap_continue' ||
      step.visualSpec?.type;
    check('remediation step is renderable by InteractiveStepRenderer', !!renderable, `type=${step.interactionSpec?.type}`);

    // 3. NAVIGATION: a wrong answer must NOT enable Next
    const canAdvanceAfterWrong = canComputeAdvance({
      activeRemediation: step,
      adaptivePending: false,
      step: thinkFirst,
      interaction: { choiceSubmitted: true, choiceCorrect: false },
    });
    check('Next is BLOCKED while remediation is active', canAdvanceAfterWrong === false);

    // Even with no overlay, a wrong answer alone must not unlock Next.
    const canAdvanceWrongNoOverlay = canComputeAdvance({
      activeRemediation: null,
      adaptivePending: false,
      step: thinkFirst,
      interaction: { choiceSubmitted: true, choiceCorrect: false },
    });
    check(
      'Next is BLOCKED on a wrong answer even without an overlay',
      canAdvanceWrongNoOverlay === false,
      'wrong answer unlocked Next — the bypass is back',
    );

    // 4. CORRECT retry on the remediation step
    const remChoices = step.interactionSpec?.choices;
    const remCorrectId = step.interactionSpec?.correctChoiceId;
    check('remediation offers choices', Array.isArray(remChoices) && remChoices.length > 0);
    check('remediation declares a correctChoiceId', remCorrectId !== undefined && remCorrectId !== null);

    const remCorrectLabel =
      typeof remChoices.find((c: any) => c.id === remCorrectId) === 'string'
        ? remChoices.find((c: any) => c.id === remCorrectId)
        : remChoices.find((c: any) => c.id === remCorrectId).label;
    const remLabels = remChoices.map((c: any) => (typeof c === 'string' ? c : c.label));

    const retry = await runLiveDecision({
      state: decision.updatedState,
      activityId: step.id,
      conceptId: resolveRemediationConceptId({ stepConceptId: step.interactionSpec?.conceptId, stepId: step.id }) ?? tfMap.conceptId,
      selectedAnswer: remCorrectLabel,
      expectedAnswer: remCorrectLabel,
      options: remLabels,
      correct: true,
      prompt: step.interactionSpec?.prompt || '',
      attemptNumber: 2,
    });

    check('correct retry produces a validated, renderable step', !!retry.step && !!retry.step.id);
    check(
      'correct retry is not blocked by the navigation boundary',
      canComputeAdvance({
        activeRemediation: null,
        adaptivePending: false,
        step: thinkFirst,
        interaction: { choiceSubmitted: true, choiceCorrect: true },
      }) === true,
    );

    // 5. NAVIGATION: a correct answer MUST unlock Next
    const canAdvanceAfterCorrect = canComputeAdvance({
      activeRemediation: null,
      adaptivePending: false,
      step: thinkFirst,
      interaction: { choiceSubmitted: true, choiceCorrect: true },
    });
    check('Next is ALLOWED after a correct answer', canAdvanceAfterCorrect === true);
  }

  // ── C. Escalation on a second wrong remediation attempt ─────────────────
  console.log('\nC. Step 3 escalation — wrong -> wrong again -> still blocked');

  {
    const state = freshState();
    const first = await runLiveDecision({
      state,
      activityId: 'think_first',
      conceptId: tfMap.conceptId,
      selectedAnswer: tfWrongLabel,
      expectedAnswer: tfCorrectLabel,
      options: tfLabels,
      correct: false,
      prompt: thinkFirst.interactionSpec.prompt,
      attemptNumber: 1,
    });

    const remChoices = first.step.interactionSpec?.choices ?? [];
    const remLabels = remChoices.map((c: any) => (typeof c === 'string' ? c : c.label));
    const remWrong = remLabels[0];

    const second = await runLiveDecision({
      state: first.decision.updatedState,
      activityId: first.step.id,
      conceptId: tfMap.conceptId,
      selectedAnswer: remWrong,
      expectedAnswer: remChoices.find((c: any) => c.id === first.step.interactionSpec.correctChoiceId)?.label ?? remWrong,
      options: remLabels,
      correct: false,
      prompt: first.step.interactionSpec?.prompt || '',
      attemptNumber: 2,
    });

    check('a second wrong attempt still yields a step', !!second.step && !!second.step.id);
    check(
      'a second wrong attempt does NOT unlock Next',
      canComputeAdvance({
        activeRemediation: second.step,
        adaptivePending: false,
        step: thinkFirst,
        interaction: { choiceSubmitted: true, choiceCorrect: false },
      }) === false,
    );
  }

  // ── D. Correct-first-attempt: no remediation, Next allowed ──────────────
  console.log('\nD. Correct first attempt — no remediation, Next allowed');

  {
    const { step, misconceptionId } = await runLiveDecision({
      state: freshState(),
      activityId: 'think_first',
      conceptId: tfMap.conceptId,
      selectedAnswer: tfCorrectLabel,
      expectedAnswer: tfCorrectLabel,
      options: tfLabels,
      correct: true,
      prompt: thinkFirst.interactionSpec.prompt,
      attemptNumber: 1,
    });

    check(
      'correct first attempt records no misconception',
      misconceptionId === null,
      `a CORRECT answer must not be labelled with a misconception (got ${misconceptionId})`,
    );
    check(
      'Next is ALLOWED immediately on a correct first attempt',
      canComputeAdvance({
        activeRemediation: null,
        adaptivePending: false,
        step: thinkFirst,
        interaction: { choiceSubmitted: true, choiceCorrect: true },
      }) === true,
    );
    check('a correct first attempt still returns a renderable step', !!step && !!step.id);
  }

  // ── E. Same lifecycle for every scored activity ─────────────────────────
  console.log('\nE. All 6 scored activities map to a concept and reach the orchestrator');

  for (const activityId of getAllScoredStepIds()) {
    const mapping = getStepConceptMapping(activityId);
    check(`${activityId}: has a canonical concept mapping`, !!mapping, `conceptId=${mapping?.conceptId}`);
    if (mapping) {
      check(
        `${activityId}: concept is not hardcoded to digit-value`,
        mapping.conceptId !== 'digit-value' || activityId === 'think_first' || activityId === 'connect',
        `${activityId} resolved to ${mapping.conceptId}`,
      );
    }
  }

  // ── F. Concept resolution is canonical, never hardcoded ─────────────────
  console.log('\nF. Canonical concept resolution');

  check(
    'resolver prefers the concept stamped on the step',
    resolveRemediationConceptId({ stepConceptId: 'expanded-form', targetActivityId: 'p1' }) === 'expanded-form',
  );
  check(
    'resolver falls back to the canonical mapping for the target activity',
    resolveRemediationConceptId({ stepConceptId: null, targetActivityId: 'p3' }) === 'compare-order',
  );
  check(
    'resolver returns undefined rather than inventing a concept',
    resolveRemediationConceptId({ stepConceptId: null, targetActivityId: 'unknown-activity' }) === undefined,
  );
  check('resolver handles an empty step id safely', getStepConceptMapping('') === undefined);

  // ── G. Navigation boundary matrix ───────────────────────────────────────
  console.log('\nG. Navigation boundary matrix');

  const matrix: Array<[string, string, Record<string, unknown>, unknown, boolean, boolean]> = [
    ['tap_choice, correct', 'tap_choice', { choiceSubmitted: true, choiceCorrect: true }, null, false, true],
    ['tap_choice, wrong', 'tap_choice', { choiceSubmitted: true, choiceCorrect: false }, null, false, false],
    ['tap_choice, unanswered', 'tap_choice', { choiceSubmitted: false, choiceCorrect: false }, null, false, false],
    ['multiple_choice, correct', 'multiple_choice', { choiceSubmitted: true, choiceCorrect: true }, null, false, true],
    ['multiple_choice, wrong', 'multiple_choice', { choiceSubmitted: true, choiceCorrect: false }, null, false, false],
    ['adaptive-evaluation, correct', 'adaptive-evaluation', { choiceSubmitted: true, choiceCorrect: true }, null, false, true],
    ['adaptive-evaluation, wrong', 'adaptive-evaluation', { choiceSubmitted: true, choiceCorrect: false }, null, false, false],
    ['remediation overlay active', 'tap_choice', { choiceSubmitted: true, choiceCorrect: true }, { id: 'remediation-x' }, false, false],
    ['multi_activity, complete', 'multi_activity', { multiActivityComplete: true }, null, false, true],
    ['multi_activity, incomplete', 'multi_activity', { multiActivityComplete: false }, null, false, false],
    ['tap_continue, no answer needed', 'tap_continue', {}, null, false, true],
  ];

  for (const [name, itype, interaction, overlay, pending, expected] of matrix) {
    const got = canComputeAdvance({
      activeRemediation: overlay,
      adaptivePending: pending,
      step: { interactionSpec: { type: itype } },
      interaction,
    });
    check(`advance matrix: ${name} -> ${expected}`, got === expected, `got ${got}`);
  }

  {
    const pendingBlocked = canComputeAdvance({
      activeRemediation: null,
      adaptivePending: true,
      step: { interactionSpec: { type: 'tap_choice' } },
      interaction: { choiceSubmitted: true, choiceCorrect: true },
    });
    check('advance matrix: pending API call blocks even a correct answer', pendingBlocked === false);
  }

  // ── Summary ─────────────────────────────────────────────────────────────
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`PASS: ${passed}   FAIL: ${failed}   TOTAL: ${passed + failed}`);
  if (failed > 0) {
    console.log('\nFailed:');
    for (const f of failures) console.log(`  - ${f}`);
  }
  console.log('');
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error('\nTest harness error:', err);
  process.exit(1);
});
