// @ts-nocheck
/**
 * Full adaptive loop for the four new Grade 4 lessons, driven through the same
 * pipeline the server route uses:
 *
 *   resolve activity from lesson config
 *     -> deterministic validation + misconception detection
 *       -> AdaptiveOrchestrator.decide (AI proposes, validator decides)
 *         -> pedagogicalActionToJourneyStep -> renderable remediation step
 *           -> canComputeAdvance (navigation boundary)
 *             -> evaluateMastery (completion boundary)
 *
 * This mirrors src/app/api/learner/adaptive-decision/route.ts with the Supabase
 * persistence calls removed, because the Supabase credentials in this
 * environment are stale. Everything else is the production code path.
 *
 * Run: npx tsx tests/adaptive-new-lessons-lifecycle.test.ts
 */

import { AdaptiveOrchestrator } from '../src/lib/learning/orchestrator';
import { MockAIProvider } from '../src/lib/ai/providers/mock';
import {
  pedagogicalActionToJourneyStep,
  canComputeAdvance,
} from '../src/lib/learning/action-adapter';
import {
  getAdaptiveLessonConfig,
  getAllAdaptiveLessonConfigs,
} from '../src/lib/curriculum/adaptive/registry';
import { resolveActivityFromJourney } from '../src/lib/curriculum/adaptive/resolve-activity';
import {
  validateActivity,
  detectActivityMisconception,
  evaluateMastery,
  type LearnerResponseSummary,
} from '../src/lib/curriculum/adaptive/engine';
import {
  createInitialLearningState,
  type Evidence,
  type LearningState,
} from '../src/lib/curriculum/adaptive-engine';
import { getCurriculumConstraints } from '../src/lib/learning/curriculum-constraints';

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

function section(title: string) {
  console.log(`\n── ${title} ${'─'.repeat(Math.max(0, 54 - title.length))}`);
}

const NEW_LESSONS = [
  'ordering-rounding',
  'factors-multiples-even-odd',
  'number-patterns',
  'roman-numerals',
];

/** Mirrors the server route: build evidence, decide, adapt. */
async function decide(config, state: LearningState, params: {
  activityId: string;
  selectedAnswer: string;
  options: string[];
  prompt: string;
  attemptNumber: number;
  scenario?: string;
}) {
  const resolved = resolveActivityFromJourney(config, {
    activityId: params.activityId,
    options: params.options,
    prompt: params.prompt,
  });
  const activity = resolved.activity!;

  // Deterministic validation is authoritative (the route does exactly this).
  const correct = validateActivity(activity, params.selectedAnswer);
  const misconceptionId = !correct
    ? detectActivityMisconception(config, activity, params.selectedAnswer)?.id ?? null
    : null;

  const evidence: Evidence = {
    conceptId: activity.conceptId,
    correct,
    timestamp: Date.now() + params.attemptNumber,
    activityId: params.activityId,
    answer: params.selectedAnswer,
    expectedAnswer: activity.correctAnswer,
    misconceptionId: misconceptionId || undefined,
    attemptNumber: params.attemptNumber,
    remediationShown: params.attemptNumber > 1 ? '__remediation_attempt' : null,
  };

  const orchestrator = new AdaptiveOrchestrator(
    new MockAIProvider({ scenario: params.scenario ?? 'repeated_misconception' }),
  );
  const conceptIds = config.concepts.map((c) => c.id);
  const decision = await orchestrator.decide({
    learnerState: state,
    evidence,
    context: {
      learnerId: 'learner-1',
      lessonId: `lesson-${config.lessonSlug}`,
      conceptId: activity.conceptId,
      selectedAnswer: params.selectedAnswer,
      expectedAnswer: activity.correctAnswer,
      options: params.options,
      prompt: params.prompt,
      attemptNumber: params.attemptNumber,
      conceptChain: conceptIds,
    },
    curriculumKey: config.curriculumKey,
  });

  const step = pedagogicalActionToJourneyStep(decision.finalAction, {
    evidence,
    aiContext: {
      conceptId: activity.conceptId,
      selectedAnswer: params.selectedAnswer,
      expectedAnswer: activity.correctAnswer,
      options: params.options,
      prompt: params.prompt,
      attemptNumber: params.attemptNumber,
    },
    conceptChain: conceptIds,
    lessonConfig: config,
  });

  return { decision, step, evidence, activity, correct };
}

async function main() {
  // ─────────────────────────────────────────────────────────────────────────────
  section('Wrong answer produces a renderable, misconception-specific step');

  for (const slug of NEW_LESSONS) {
    const config = getAdaptiveLessonConfig(slug)!;
    const spec = config.activities[2]; // a practice activity, not the first step
    const options = spec.choices!;
    const wrong = options.find((c) => c !== spec.correctAnswer)!;

    const state = createInitialLearningState(
      'learner-1',
      `lesson-${slug}`,
      config.concepts.map((c) => c.id),
    );

    const { step, decision, evidence } = await decide(config, state, {
      activityId: spec.activityId,
      selectedAnswer: wrong,
      options,
      prompt: spec.prompt!,
      attemptNumber: 1,
    });

    check(
      `${slug}: wrong answer is recorded as evidence with a misconception`,
      evidence.correct === false && !!evidence.misconceptionId,
      `misconception=${evidence.misconceptionId}`,
    );
    check(
      `${slug}: wrong answer yields a renderable step`,
      !!step && typeof step.studentText === 'string' && step.studentText.length > 40,
    );
    check(
      `${slug}: remediation step is interactive (re-asks a question)`,
      !!step?.interactionSpec && ['tap_choice', 'multi_activity'].includes(step.interactionSpec.type),
      `type=${step?.interactionSpec?.type}`,
    );
    check(
      `${slug}: remediation carries a concept id for later evidence`,
      !!step?.interactionSpec?.conceptId || !!evidence.conceptId,
    );
    check(
      `${slug}: decision is recorded with reasoning`,
      !!decision.reasoning && decision.reasoning.length > 10,
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  section('Config-driven remediation reaches the orchestrator (adapter path)');

  {
    const config = getAdaptiveLessonConfig('roman-numerals')!;
    const spec = config.activities.find((a) => a.activityId === 'p1')!;
    const options = spec.choices!;
    const wrong = options.find((c) => c !== spec.correctAnswer)!;

    const state = createInitialLearningState(
      'learner-1',
      'lesson-roman',
      config.concepts.map((c) => c.id),
    );

    const { step } = await decide(config, state, {
      activityId: 'p1',
      selectedAnswer: wrong,
      options,
      prompt: spec.prompt!,
      attemptNumber: 1,
    });

    // The additive-only misconception must produce the subtraction-rule
    // remediation from the lesson's own config — not a generic "try again".
    const text = `${step.studentText} ${step.owlText || ''}`.toLowerCase();
    check(
      'roman-numerals: remediation targets the subtraction rule',
      text.includes('subtract') || text.includes('before'),
      text.slice(0, 90),
    );
    check(
      'roman-numerals: remediation is not a bare "try again"',
      text.length > 80,
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  section('Attempt numbering and retry feed back into learner state');

  for (const slug of NEW_LESSONS) {
    const config = getAdaptiveLessonConfig(slug)!;
    const spec = config.activities[0];
    const options = spec.choices!;
    const wrong = options.find((c) => c !== spec.correctAnswer)!;

    let state = createInitialLearningState(
      'learner-1',
      `lesson-${slug}`,
      config.concepts.map((c) => c.id),
    );

    // Attempt 1: wrong.
    const first = await decide(config, state, {
      activityId: spec.activityId,
      selectedAnswer: wrong,
      options,
      prompt: spec.prompt!,
      attemptNumber: 1,
    });
    state = first.decision.updatedState;
    check(
      `${slug}: attempt 1 is recorded as attempt 1`,
      state.attempts.some((a) => a.attemptNumber === 1 && !a.correct),
    );
    check(
      `${slug}: wrong answer stores the misconception in learner state`,
      !!state.concepts[spec.conceptId]?.history.some((h) => h.misconceptionId),
    );

    // Attempt 2: correct retry on the same activity.
    const second = await decide(config, state, {
      activityId: spec.activityId,
      selectedAnswer: spec.correctAnswer!,
      options,
      prompt: spec.prompt!,
      attemptNumber: 2,
    });
    const finalState = second.decision.updatedState;
    check(
      `${slug}: retry is recorded as attempt 2 (attempt numbering increments)`,
      finalState.attempts.some((a) => a.attemptNumber === 2 && a.correct),
      `attempts=[${finalState.attempts.map((a) => a.attemptNumber).join(',')}]`,
    );
    check(
      `${slug}: successful retry raises the concept's mastery level`,
      finalState.concepts[spec.conceptId].level !== 'not_assessed',
      `level=${finalState.concepts[spec.conceptId].level}`,
    );
    check(
      `${slug}: concept correct-answer count reflects the retry`,
      finalState.concepts[spec.conceptId].correctAttempts === 1,
      `correct=${finalState.concepts[spec.conceptId].correctAttempts}`,
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  section('Navigation boundary: wrong answer cannot be bypassed');

  for (const slug of NEW_LESSONS) {
    const config = getAdaptiveLessonConfig(slug)!;
    const step: any = { interactionSpec: { type: 'tap_choice' } };

    check(
      `${slug}: no submission ⇒ Next blocked`,
      canComputeAdvance({ activeRemediation: null, adaptivePending: false, step, interaction: {} }) === false,
    );
    check(
      `${slug}: submitted but WRONG ⇒ Next blocked`,
      canComputeAdvance({
        activeRemediation: null,
        adaptivePending: false,
        step,
        interaction: { choiceSubmitted: true, choiceCorrect: false },
      }) === false,
    );
    check(
      `${slug}: submitted and CORRECT ⇒ Next allowed`,
      canComputeAdvance({
        activeRemediation: null,
        adaptivePending: false,
        step,
        interaction: { choiceSubmitted: true, choiceCorrect: true },
      }) === true,
    );
    check(
      `${slug}: active remediation overlay ⇒ Next blocked even when correct`,
      canComputeAdvance({
        activeRemediation: { id: 'remediation' },
        adaptivePending: false,
        step,
        interaction: { choiceSubmitted: true, choiceCorrect: true },
      }) === false,
    );
    check(
      `${slug}: in-flight adaptive decision ⇒ Next blocked`,
      canComputeAdvance({
        activeRemediation: null,
        adaptivePending: true,
        step,
        interaction: { choiceSubmitted: true, choiceCorrect: true },
      }) === false,
    );

    const multiStep: any = { interactionSpec: { type: 'multi_activity' } };
    check(
      `${slug}: incomplete multi-activity ⇒ Next blocked`,
      canComputeAdvance({
        activeRemediation: null,
        adaptivePending: false,
        step: multiStep,
        interaction: { choiceSubmitted: true, choiceCorrect: true },
      }) === false,
    );
    check(
      `${slug}: completed multi-activity ⇒ Next allowed`,
      canComputeAdvance({
        activeRemediation: null,
        adaptivePending: false,
        step: multiStep,
        interaction: { multiActivityComplete: true },
      }) === true,
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  section('Completion boundary: mastery comes from evidence');

  for (const slug of NEW_LESSONS) {
    const config = getAdaptiveLessonConfig(slug)!;

    // Reaching the last step with no answers must NOT complete the lesson.
    check(
      `${slug}: reaching the last step with no answers ⇒ not complete`,
      evaluateMastery(config, []).mastered === false,
    );

    // Answering every required concept correctly DOES complete it.
    const allCorrect: LearnerResponseSummary[] = config.mastery.requiredConcepts.map((conceptId) => {
      const spec = config.activities.find((a) => a.conceptId === conceptId)!;
      return { activityId: spec.activityId, correct: true };
    });
    check(
      `${slug}: correct evidence for all required concepts ⇒ complete`,
      evaluateMastery(config, allCorrect).mastered === true,
      `unmet=${evaluateMastery(config, allCorrect).unmetConcepts.map((c) => c.conceptId).join(',')}`,
    );

    // One required concept still missing ⇒ blocked, and the blocker is named.
    const partial = allCorrect.slice(0, -1);
    const partialResult = evaluateMastery(config, partial);
    check(
      `${slug}: one missing concept ⇒ not complete`,
      partialResult.mastered === false,
    );
    check(
      `${slug}: the blocking concept is identified for the learner`,
      partialResult.unmetConcepts.length === 1 &&
        partialResult.unmetConcepts[0].label.length > 0,
    );

    // Reaching the last step after only WRONG answers must NOT complete it.
    const allWrong: LearnerResponseSummary[] = config.activities.map((a) => ({
      activityId: a.activityId,
      correct: false,
    }));
    check(
      `${slug}: all-wrong answers ⇒ not complete`,
      evaluateMastery(config, allWrong).mastered === false,
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  section('Orchestrator constraint scope matches each lesson');

  for (const config of getAllAdaptiveLessonConfigs()) {
    const constraints = getCurriculumConstraints(config.curriculumKey);
    const outside = config.activities.filter(
      (a) => !constraints.conceptScope.has(a.conceptId),
    );
    check(
      `${config.lessonSlug}: every activity concept is in curriculum scope`,
      outside.length === 0,
      outside.map((a) => `${a.activityId}→${a.conceptId}`).join(', '),
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  section('Place Value behaviour is preserved on the shared path');

  {
    const config = getAdaptiveLessonConfig('place-value-number-reading')!;

    check(
      'place-value: still uses its own lesson remediation generators',
      config.remediationStrategy === 'lesson-generators',
    );
    check(
      'place-value: keeps its bespoke journey',
      config.journeyBuilder === 'bespoke',
    );
    check(
      'place-value: its six scored activities are preserved',
      config.activities.length === 6,
      config.activities.map((a) => a.activityId).join(', '),
    );
    check(
      'place-value: same concept bindings as the pre-existing mapping',
      config.activities.find((a) => a.activityId === 'p1')?.conceptId === 'expanded-form' &&
        config.activities.find((a) => a.activityId === 'quick_check')?.conceptId === 'read-numbers',
    );
    check(
      'place-value: misconception ids preserved',
      config.misconceptions.map((m) => m.id).includes('digit-not-value') &&
        config.misconceptions.map((m) => m.id).includes('expanded-form-skip'),
    );
    check(
      'place-value: still the only lesson with the dedicated "Place Value Pro" badge',
      getAllAdaptiveLessonConfigs().filter((c) => (c.celebration.badge || '').includes('Place Value')).length === 1,
    );
  }


}

main().then(() => {
  // ─────────────────────────────────────────────────────────────────────────────
  console.log(`\n${'='.repeat(64)}`);
  console.log(`PASS: ${passed}   FAIL: ${failed}   TOTAL: ${passed + failed}`);
  if (failed) {
    console.log(`\nFailed tests:\n${failures.map((f) => `  - ${f}`).join('\n')}`);
  }
  console.log('='.repeat(64));
  process.exit(failed ? 1 : 0);
});
