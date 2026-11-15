/**
 * A correct answer must never produce remediation.
 *
 * Regression for a defect seen in the live Grade 4 lesson: the learner ordered
 * 345, 521, 298, 476 correctly, and the orchestrator returned
 *
 *   actionType: "remediate"
 *   misconceptionId: "position-confusion"
 *   reason: 'AI diagnosed "position-confusion" (0.90 confidence, strong evidence)'
 *
 * The mastery short-circuit only fires when mastery is already above threshold,
 * so a first correct answer fell through to the AI, which — asked to diagnose —
 * invented a misconception. Because remediation blocks the advance control, the
 * child was dead-ended behind a mistake they had not made.
 *
 * Correctness is deterministic evidence. The model must only be consulted when
 * the learner is actually wrong.
 *
 * Run: npx tsx tests/correct-answer-never-remediates.test.ts
 */
import { AdaptiveOrchestrator } from '../src/lib/learning/orchestrator';
import { MockAIProvider } from '../src/lib/ai/providers/mock';
import { createInitialLearningState } from '../src/lib/curriculum/adaptive-engine';
import { ORDERING_ROUNDING_CONFIG } from '../src/lib/curriculum/adaptive/ordering-rounding.config';
import { getCurriculumConstraints } from '../src/lib/learning/curriculum-constraints';

let pass = 0;
let fail = 0;
const check = (name: string, cond: boolean, detail?: string) => {
  if (cond) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name}${detail ? ' — ' + detail : ''}`); }
};

const curriculumKey = (ORDERING_ROUNDING_CONFIG as any).curriculumKey || 'g4-math-place-value';
const constraints = getCurriculumConstraints(curriculumKey);
const conceptId = 'order-numbers';

const context = {
  learnerId: 'test-learner',
  lessonId: 'test-lesson',
  conceptId,
  selectedAnswer: '298, 345, 476, 521',
  expectedAnswer: '298, 345, 476, 521',
  options: ['298, 345, 476, 521', '345, 298, 476, 521', '521, 476, 345, 298', '298, 476, 345, 521'],
  prompt: 'Order these numbers from SMALLEST to LARGEST: 345, 521, 298, 476',
  attemptNumber: 1,
  conceptChain: [conceptId],
} as any;

const evidenceFor = (correct: boolean) => ({
  conceptId,
  correct,
  timestamp: Date.now(),
  activityId: 'think_first',
  answer: correct ? '298, 345, 476, 521' : '521, 476, 345, 298',
  expectedAnswer: '298, 345, 476, 521',
  misconceptionId: correct ? undefined : 'ordering-direction-reversed',
  attemptNumber: 1,
  remediationShown: null,
});

(async () => {
  console.log('── setup ──');
  check('ordering-rounding curriculum key resolves', constraints.concepts.some((c) => c.id === conceptId), curriculumKey);
  check('ordering lesson is registered', !!ORDERING_ROUNDING_CONFIG.lessonSlug);

  console.log('\n── 1. correct answer, AI primed to invent a misconception ──');
  // 'repeated_misconception' is the mock scenario that proposes remediation.
  const orchestrator = new AdaptiveOrchestrator(new MockAIProvider('repeated_misconception'));
  const decision = await orchestrator.decide({
    learnerState: createInitialLearningState('test-learner', 'test-lesson', constraints.concepts.map((c) => c.id)),
    evidence: evidenceFor(true),
    context,
    curriculumKey,
  } as any);

  const action = (decision as any).finalAction;
  check('action is NOT remediate', action.actionType !== 'remediate', action.actionType);
  check('action is move_forward', action.actionType === 'move_forward', action.actionType);
  check('AI was not consulted', (decision as any).aiProposal === null);
  check('no misconception attached', !action.misconceptionId, String(action.misconceptionId));
  check('reason explains the correct answer', /correct/i.test(action.reason || ''), action.reason);

  console.log('\n── 2. a wrong answer still reaches the AI ──');
  const orch2 = new AdaptiveOrchestrator(new MockAIProvider('repeated_misconception'));
  const wrong = await orch2.decide({
    learnerState: createInitialLearningState('test-learner', 'test-lesson', constraints.concepts.map((c) => c.id)),
    evidence: evidenceFor(false),
    context: { ...context, selectedAnswer: '521, 476, 345, 298', expectedAnswer: '298, 345, 476, 521' },
    curriculumKey,
  } as any);
  const wrongAction = (wrong as any).finalAction;
  check('wrong answer does not move forward silently', wrongAction.actionType !== 'move_forward' || (wrong as any).aiProposal !== null, wrongAction.actionType);
  check('wrong answer produces some pedagogical action', typeof wrongAction.actionType === 'string', String(wrongAction));

  console.log('\n── 3. repeated correct answers keep advancing ──');
  let state = createInitialLearningState('test-learner', 'test-lesson', constraints.concepts.map((c) => c.id));
  let allAdvance = true;
  for (let i = 0; i < 3; i++) {
    const d = await new AdaptiveOrchestrator(new MockAIProvider('repeated_misconception')).decide({
      learnerState: state,
      evidence: { ...evidenceFor(true), attemptNumber: i + 1 },
      context,
      curriculumKey,
    } as any);
    if ((d as any).finalAction.actionType === 'remediate') allAdvance = false;
    state = (d as any).learnerState || state;
  }
  check('three consecutive correct answers never remediate', allAdvance);

  console.log('\n── 4. trailing punctuation does not change correctness ──');
  const { validateActivity } = require('../src/lib/curriculum/adaptive/engine');
  const activity = {
    activityId: 'think_first',
    prompt: context.prompt,
    choices: context.options,
    correctAnswer: '298, 345, 476, 521',
    spec: {},
  } as any;
  check('period appended by the UI still scores correct', validateActivity(activity, '298, 345, 476, 521.'), '298, 345, 476, 521.');
  check('clean answer scores correct', validateActivity(activity, '298, 345, 476, 521'));
  check('wrong order still scores wrong', !validateActivity(activity, '345, 298, 476, 521'));
  check('decimal answers keep their point', validateActivity({ ...activity, correctAnswer: '3.5' }, '3.5'));

  console.log('\n' + '='.repeat(32));
  console.log(`PASS: ${pass}   FAIL: ${fail}   TOTAL: ${pass + fail}`);
  if (fail > 0) {
    console.log('correct answers can still be sent to remediation.');
    process.exit(1);
  }
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
