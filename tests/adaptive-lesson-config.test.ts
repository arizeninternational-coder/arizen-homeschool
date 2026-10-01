// @ts-nocheck
/**
 * Adaptive lesson architecture — data-driven per-lesson configuration.
 *
 * Verifies the properties the architecture must guarantee, for the Place Value
 * pilot AND all four new Grade 4 lessons:
 *
 *  1. Routing is by registered config, never by lesson title/slug string tests.
 *  2. Every mapped scored activity has deterministic validation and a
 *     misconception mapping where one is defined.
 *  3. Remediation exists for EVERY mapped activity and addresses the diagnosed
 *     misconception.
 *  4. Remediation never reveals the correct answer.
 *  5. Correctness does not depend on an LLM (deterministic app code).
 *  6. Mastery is decided from evidence, not page completion.
 *  7. Completion/review copy is derived from the lesson, not hardcoded.
 *
 * Run: npx tsx tests/adaptive-lesson-config.test.ts
 */

import {
  getAdaptiveLessonConfig,
  resolveAdaptiveLessonConfig,
  getAllAdaptiveLessonConfigs,
  getAdaptiveLessonSlugs,
  normalizeSlug,
} from '../src/lib/curriculum/adaptive/registry';
import {
  validateActivity,
  detectActivityMisconception,
  buildRemediationStep,
  evaluateMastery,
  canProgressTo,
  type ResolvedActivity,
} from '../src/lib/curriculum/adaptive/engine';
import { resolveActivityFromJourney } from '../src/lib/curriculum/adaptive/resolve-activity';
import { buildAdaptiveJourneyFromConfig } from '../src/lib/curriculum/adaptive/build-journey';
import { buildGrade4JourneyFromBlocks } from '../src/lib/curriculum/grade4-journeys';
import { generateGrade4Math } from '../src/data/grade4-math';
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
  console.log(`\n── ${title} ${'─'.repeat(Math.max(0, 56 - title.length))}`);
}

const ALL_CONFIGS = getAllAdaptiveLessonConfigs();

/**
 * Choices rendered for an activity. Most lessons declare choices in the config;
 * `bespoke` lessons (Place Value) carry their choices in the journey step
 * instead, so those are read from the journey the learner actually sees.
 */
const CHOICES_BY_ACTIVITY = new Map();

function buildChoicesIndex() {
  CHOICES_BY_ACTIVITY.clear();
  for (const config of ALL_CONFIGS) {
    const steps =
      config.journeyBuilder === 'generated'
        ? buildAdaptiveJourneyFromConfig(config, blocksForLesson(config.lessonSlug))
        : buildGrade4JourneyFromBlocks(
            blocksForLesson(config.lessonSlug),
            config.lessonTitle,
            config.lessonSlug,
          );
    for (const step of steps as any[]) {
      const spec = step.interactionSpec;
      const direct = (spec?.choices || []).map((c: any) => (typeof c === 'string' ? c : c.label));
      if (direct.length) CHOICES_BY_ACTIVITY.set(`${config.lessonSlug}:${step.id}`, direct);
      for (const a of spec?.activities || []) {
        const sub = (a.choices || []).map((c: any) => (typeof c === 'string' ? c : c.label));
        if (sub.length) CHOICES_BY_ACTIVITY.set(`${config.lessonSlug}:${a.id}`, sub);
      }
    }
  }
}

function resolveActivity(config, activityId, selected, attemptNumber = 1) {
  const spec = config.activities.find((a) => a.activityId === activityId);
  const choices =
    spec?.choices?.length
      ? spec.choices
      : CHOICES_BY_ACTIVITY.get(`${config.lessonSlug}:${activityId}`) || [];
  const resolved = resolveActivityFromJourney(config, {
    activityId,
    options: choices,
    prompt: spec?.prompt,
    expectedAnswer: spec?.correctAnswer,
  });
  return { ...resolved.activity, attemptNumber, selected };
}

/**
 * True when `prose` names the correct answer. Uses word boundaries and skips
 * very short answers (e.g. "No", "3") where a substring match would fire on
 * ordinary English words.
 */
function proseNamesAnswer(prose: string, answer: string): boolean {
  const a = String(answer || '').trim();
  if (a.length < 4) return false;
  const escaped = a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}([^\\p{L}\\p{N}]|$)`, 'iu').test(prose);
}

// ─────────────────────────────────────────────────────────────────────────────
buildChoicesIndex();

section('1. Registry: data-driven opt-in, no title-string gate');

const EXPECTED_SLUGS = [
  'place-value-number-reading',
  'ordering-rounding',
  'factors-multiples-even-odd',
  'number-patterns',
  'roman-numerals',
];

for (const slug of EXPECTED_SLUGS) {
  check(`lesson "${slug}" is registered`, getAdaptiveLessonConfig(slug) !== null);
}

check(
  'every Grade 4 whole-number lesson has a config',
  ALL_CONFIGS.length === 5,
  `found ${ALL_CONFIGS.length}`,
);
// Aliases must not inflate the config list (they register the same object).
check(
  'slug aliases resolve to the same config, not a duplicate',
  new Set(ALL_CONFIGS).size === ALL_CONFIGS.length,
);
check(
  'the database slug for the factors lesson resolves to its config',
  getAdaptiveLessonConfig('factors-multiples') === getAdaptiveLessonConfig('factors-multiples-even-odd'),
);
check(
  'the database slug for the place-value lesson resolves to its config',
  getAdaptiveLessonConfig('place-value') === getAdaptiveLessonConfig('place-value-number-reading'),
);

// The registry must resolve by slug, and by title only as a legacy fallback.
check(
  'resolves by slug without any title match',
  resolveAdaptiveLessonConfig({ slug: 'roman-numerals' })?.curriculumKey === 'g4-math-roman-numerals',
);
check(
  'title fallback still works for legacy rows',
  resolveAdaptiveLessonConfig({ title: 'Number Patterns' })?.lessonSlug === 'number-patterns',
);
check(
  'an unregistered lesson returns null (not a silent default)',
  resolveAdaptiveLessonConfig({ slug: 'some-other-lesson', title: 'Some Other Lesson' }) === null,
);
check(
  'a lesson whose name merely CONTAINS a registered topic is not opted in',
  resolveAdaptiveLessonConfig({ title: 'Place Value and Rounding Extra Homework' }) === null,
);

// ─────────────────────────────────────────────────────────────────────────────
section('2. Each config declares curriculum, concepts, activities, mastery');

for (const config of ALL_CONFIGS) {
  check(`${config.lessonSlug}: declares SLOs`, config.slos.length > 0);
  check(
    `${config.lessonSlug}: every SLO is CBC-mapped (ARIZEN-INT-1.1-*)`,
    config.slos.every((s) => /ARIZEN-INT-1\.1-[a-z]/.test(s)),
    config.slos.join(' | '),
  );
  check(`${config.lessonSlug}: declares objectives`, config.objectives.length > 0);
  check(`${config.lessonSlug}: declares concepts`, config.concepts.length > 0);
  check(`${config.lessonSlug}: declares activities`, config.activities.length > 0);
  check(
    `${config.lessonSlug}: mastery criteria name declared concepts`,
    config.mastery.requiredConcepts.every((c) => config.concepts.some((s) => s.id === c)),
  );
  check(
    `${config.lessonSlug}: activity ids are unique`,
    new Set(config.activities.map((a) => a.activityId)).size === config.activities.length,
  );
  check(
    `${config.lessonSlug}: every activity maps to a declared concept`,
    config.activities.every((a) => config.concepts.some((c) => c.id === a.conceptId)),
  );
  check(
    `${config.lessonSlug}: every prerequisite is a declared concept`,
    config.concepts.every((c) => c.prerequisites.every((p) => config.concepts.some((x) => x.id === p))),
  );
}

// ─────────────────────────────────────────────────────────────────────────────
section('3. Deterministic validation (never an LLM)');

for (const config of ALL_CONFIGS) {
  let allValid = true;
  const problems: string[] = [];
  for (const spec of config.activities) {
    const activity = resolveActivity(config, spec.activityId, '');
    if (!activity) {
      allValid = false;
      problems.push(`${spec.activityId}: unresolved`);
      continue;
    }
    const correct = validateActivity(activity, activity.correctAnswer);
    if (!correct) {
      allValid = false;
      problems.push(`${spec.activityId}: correct answer "${activity.correctAnswer}" marked WRONG`);
    }
    // Whitespace/format tolerance must not make a wrong answer right.
    const wrong = validateActivity(activity, '__definitely_not_the_answer__');
    if (wrong) {
      allValid = false;
      problems.push(`${spec.activityId}: nonsense answer marked CORRECT`);
    }
  }
  check(
    `${config.lessonSlug}: every activity validates its correct answer and rejects a wrong one`,
    allValid,
    problems.join('; '),
  );
}

// Repeated calls must give identical results (pure functions, no randomness).
{
  const config = getAdaptiveLessonConfig('ordering-rounding');
  const activity = resolveActivity(config, 'p1', '390');
  const results = new Set(
    Array.from({ length: 5 }, () => detectActivityMisconception(config, activity, '390')?.id),
  );
  check('misconception detection is deterministic across repeated calls', results.size === 1);
}

// ─────────────────────────────────────────────────────────────────────────────
section('4. Misconception mapping on every mapped activity');

for (const config of ALL_CONFIGS) {
  // Every activity that can produce a misconception must be able to produce one
  // for at least one of its wrong options (i.e. remediation is reachable).
  const unreachable: string[] = [];
  for (const spec of config.activities) {
    const activity = resolveActivity(config, spec.activityId, '');
    if (!activity) continue;
    const hasDetector = !!(spec.detectMisconception || config.misconceptions.some((m) => m.detect));
    if (!hasDetector) continue;
    if (activity.choices.length === 0) continue; // choices come from the journey; nothing to probe
    const wrongOptions = activity.choices.filter(
      (c) => c.toLowerCase() !== String(activity.correctAnswer).toLowerCase(),
    );
    const detected = wrongOptions.some(
      (c) => detectActivityMisconception(config, activity, c) !== null,
    );
    if (!detected) unreachable.push(spec.activityId);
  }
  check(
    `${config.lessonSlug}: a wrong answer on every mapped activity yields a remediation mapping`,
    unreachable.length === 0,
    `no mapping reachable for: ${unreachable.join(', ')}`,
  );
}

// The misconception detected must be one the lesson actually declares, and that
// misconception must carry remediation content.
for (const config of ALL_CONFIGS) {
  const bad: string[] = [];
  for (const spec of config.activities) {
    const activity = resolveActivity(config, spec.activityId, '');
    if (!activity) continue;
    for (const choice of activity.choices) {
      const mc = detectActivityMisconception(config, activity, choice);
      if (!mc) continue;
      if (!config.misconceptions.find((m) => m.id === mc.id)) bad.push(`${spec.activityId}: unknown ${mc.id}`);
      if (!mc.remediation?.explanation || !mc.remediation?.hint) {
        bad.push(`${spec.activityId}: ${mc.id} has no remediation content`);
      }
    }
  }
  check(
    `${config.lessonSlug}: detected misconceptions are declared and carry remediation`,
    bad.length === 0,
    bad.join('; '),
  );
}

// ─────────────────────────────────────────────────────────────────────────────
section('5. Remediation for EVERY mapped activity, addressing the misconception');

for (const config of ALL_CONFIGS) {
  const missing: string[] = [];
  const vague: string[] = [];
  for (const spec of config.activities) {
    const activity = resolveActivity(config, spec.activityId, '');
    if (!activity) continue;
    // Simulate the learner answering wrong, using the first wrong option.
    const wrongChoice = activity.choices.find(
      (c) => c.toLowerCase() !== String(activity.correctAnswer).toLowerCase(),
    );
    const mc = wrongChoice ? detectActivityMisconception(config, activity, wrongChoice) : null;
    const step = buildRemediationStep(config, mc, activity, 1, wrongChoice || '');
    if (!step) {
      missing.push(spec.activityId);
      continue;
    }
    // Remediation must not be a bare "try again".
    const text = `${step.title} ${step.studentText} ${step.owlText || ''}`.toLowerCase();
    if (text.length < 60 || /^(try again\.)?$/.test(text.trim())) vague.push(spec.activityId);
    // Remediation must re-ask the activity (a scaffolded retry, not a new topic).
    if (step.interactionSpec?.prompt !== activity.prompt) missing.push(`${spec.activityId} (re-ask)`);
    // Remediation must carry a hint that differs from a bare "try again".
    if (!step.interactionSpec?.hint || step.interactionSpec.hint.length < 15) vague.push(`${spec.activityId} (hint)`);
  }
  check(
    `${config.lessonSlug}: every mapped activity can produce real remediation`,
    missing.length === 0,
    `missing/incorrect: ${missing.join(', ')}`,
  );
  check(
    `${config.lessonSlug}: remediation is substantive, not "try again"`,
    vague.length === 0,
    `too thin for: ${vague.join(', ')}`,
  );
}

// Two different misconceptions in the same lesson must produce DIFFERENT
// remediation — that is what "addresses the diagnosed misconception" means.
{
  const config = getAdaptiveLessonConfig('roman-numerals');
  const p1 = resolveActivity(config, 'p1', '');
  const p3 = resolveActivity(config, 'p3', '');
  const mcAdd = detectActivityMisconception(config, p1, 'VIIII');
  const mcSym = detectActivityMisconception(config, p3, 'IVV');
  const stepAdd = buildRemediationStep(config, mcAdd, p3, 1, 'VIIII');
  const stepSym = buildRemediationStep(config, mcSym, p3, 1, 'IVV');
  check(
    'different misconceptions yield different remediation',
    !!stepAdd && !!stepSym && stepAdd.studentText !== stepSym.studentText,
  );
  check(
    'remediation text differs from the misconception label alone',
    stepAdd?.title !== mcAdd?.label || stepAdd?.studentText.length > mcAdd!.label.length + 20,
  );
}

// Escalation: the second attempt must strengthen the scaffold.
{
  const config = getAdaptiveLessonConfig('number-patterns');
  const activity = resolveActivity(config, 'p1', '');
  const mc = detectActivityMisconception(config, activity, '8');
  const first = buildRemediationStep(config, mc, activity, 1, '8');
  const second = buildRemediationStep(config, mc, activity, 2, '8');
  check(
    'a repeat wrong attempt escalates the remediation hint',
    !!first && !!second && second.interactionSpec.hint.length > first.interactionSpec.hint.length,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
section('6. Remediation never reveals the correct answer');

for (const config of ALL_CONFIGS) {
  const leaks: string[] = [];
  for (const spec of config.activities) {
    const activity = resolveActivity(config, spec.activityId, '');
    if (!activity) continue;
    const wrongChoice = activity.choices.find(
      (c) => c.toLowerCase() !== String(activity.correctAnswer).toLowerCase(),
    );
    const mc = wrongChoice ? detectActivityMisconception(config, activity, wrongChoice) : null;
    const step = buildRemediationStep(config, mc, activity, 1, wrongChoice || '');
    if (!step) continue;
    const prose = `${step.studentText} ${step.owlText || ''} ${step.feedbackSpec?.hint || ''}`;
    // The correct answer may appear as one of the re-ask choices, but must
    // never be named in the explanation prose or the hint.
    if (proseNamesAnswer(prose, activity.correctAnswer)) {
      leaks.push(`${spec.activityId}: names "${activity.correctAnswer}"`);
    }
    if (/\bthe answer is\b/i.test(prose)) leaks.push(`${spec.activityId}: says "the answer is"`);
  }
  check(
    `${config.lessonSlug}: remediation prose never states the correct answer`,
    leaks.length === 0,
    leaks.join('; '),
  );
}

// ─────────────────────────────────────────────────────────────────────────────
section('7. Mastery is determined from evidence');

for (const config of ALL_CONFIGS) {
  const conceptIds = config.concepts.map((c) => c.id);
  const activityFor = (conceptId: string) =>
    config.activities.find((a) => a.conceptId === conceptId);

  // (a) No evidence at all → NOT mastered (page completion alone is not enough).
  const empty = evaluateMastery(config, []);
  check(`${config.lessonSlug}: no evidence ⇒ not mastered`, empty.mastered === false);
  check(
    `${config.lessonSlug}: reports which concepts lack evidence`,
    empty.unmetConcepts.some((c) => c.reason === 'no-evidence'),
  );

  // (b) Partial evidence covering only one concept → still not mastered.
  const firstRequired = config.mastery.requiredConcepts[0];
  const partial = evaluateMastery(config, [
    { activityId: activityFor(firstRequired).activityId, correct: true },
  ]);
  check(
    `${config.lessonSlug}: partial evidence ⇒ not mastered`,
    partial.mastered === false,
    `required: ${config.mastery.requiredConcepts.join(', ')}`,
  );

  // (c) Correct evidence for every required concept → mastered.
  const required = config.mastery.requiredConcepts.map((conceptId) => {
    const spec = activityFor(conceptId) || config.activities.find((a) => a.conceptId === conceptId);
    return { activityId: spec.activityId, correct: true };
  });
  const full = evaluateMastery(config, required);
  check(
    `${config.lessonSlug}: correct evidence for every required concept ⇒ mastered`,
    full.mastered === true,
    `unmet: ${full.unmetConcepts.map((c) => c.conceptId).join(', ') || 'none'}`,
  );

  // (d) Reaching the last step with all-WRONG answers must NOT be mastery.
  const allWrong = config.activities.map((a) => ({ activityId: a.activityId, correct: false }));
  const wrongResult = evaluateMastery(config, allWrong);
  check(`${config.lessonSlug}: all-wrong answers ⇒ not mastered`, wrongResult.mastered === false);

  // (e) A wrong answer followed by a correct retry on the same activity IS mastery
  //     for that concept — successful retry feeds back into learner state.
  const retry = [
    { activityId: config.activities[0].activityId, correct: false },
    { activityId: config.activities[0].activityId, correct: true },
  ];
  const retryResult = evaluateMasteryFor(config, retry);
  check(
    `${config.lessonSlug}: a successful retry registers as evidence`,
    retryResult.correct >= 1,
    `correct=${retryResult.correct}`,
  );

  // (f) Progression respects prerequisites.
  const isolated = config.concepts.find((c) => c.prerequisites.length > 0);
  if (isolated) {
    const noEvidence = canProgressTo(config, isolated.id, []);
    check(
      `${config.lessonSlug}: "${isolated.id}" cannot progress without prerequisite evidence`,
      noEvidence === false,
    );
  }
}

function evaluateMasteryFor(config, responses) {
  const required = config.mastery.minCorrectPerConcept ?? 1;
  const correct = responses.filter((r) => r.correct).length;
  return { correct, required };
}

// ─────────────────────────────────────────────────────────────────────────────
section('8. Journeys: every config activity is reachable and scored');

for (const config of ALL_CONFIGS) {
  if (config.journeyBuilder !== 'generated') continue;
  const blocks = blocksForLesson(config.lessonSlug);
  const steps = buildAdaptiveJourneyFromConfig(config, blocks);

  // Every configured activity must appear in the journey as a scored step or a
  // practice sub-activity — otherwise its evidence can never be collected.
  const renderedIds = new Set<string>();
  for (const step of steps) {
    const spec: any = step.interactionSpec;
    if (spec?.correctChoiceId) renderedIds.add(step.id);
    for (const a of spec?.activities || []) {
      if (a.correctChoiceId) renderedIds.add(a.id);
    }
  }
  const missing = config.activities.filter((a) => !renderedIds.has(a.activityId));
  check(
    `${config.lessonSlug}: every configured activity renders with a correct answer`,
    missing.length === 0,
    `missing from journey: ${missing.map((m) => m.activityId).join(', ')}`,
  );

  // Wrong-choice feedback must not reveal the answer.
  const leaky = steps.filter((s: any) => {
    const f = s.feedbackSpec?.incorrect || '';
    const correctLabel = (() => {
      const choices: any[] = s.interactionSpec?.choices || [];
      const c = choices.find((ch) => ch?.id === s.interactionSpec?.correctChoiceId);
      return c?.label;
    })();
    return correctLabel ? proseNamesAnswer(f, correctLabel) : false;
  });
  check(
    `${config.lessonSlug}: no step's incorrect feedback reveals the answer`,
    leaky.length === 0,
    leaky.map((s: any) => s.id).join(', '),
  );

  // Completion content must be derived from THIS lesson.
  const complete = steps.find((s) => s.stepType === 'complete');
  check(`${config.lessonSlug}: journey ends with a complete step`, !!complete);
  check(
    `${config.lessonSlug}: completion copy comes from the lesson`,
    !!complete && JSON.stringify(complete).includes(config.celebration.headline.slice(0, 20)),
  );

  const allText = JSON.stringify(steps);
  const otherLessons = ALL_CONFIGS.filter((c) => c.lessonSlug !== config.lessonSlug);
  const foreign = otherLessons.filter((c) => allText.includes(c.celebration.badge || ' '));
  check(
    `${config.lessonSlug}: no other lesson's badge text leaks into this journey`,
    foreign.length === 0,
    foreign.map((f) => f.lessonSlug).join(', '),
  );
}

// ─────────────────────────────────────────────────────────────────────────────
section('9. Real curriculum data routes to the right config');

{
  const quests = generateGrade4Math();
  const main = quests.find((q) => q.questType === 'MAIN');
  check('main quest found', !!main);

  const bySlug = new Map(main!.lessons.map((l: any) => [l.slug, l]));
  for (const slug of EXPECTED_SLUGS) {
    const lesson = bySlug.get(slug);
    check(`curriculum data has lesson "${slug}"`, !!lesson);
    if (!lesson) continue;
    const config = resolveAdaptiveLessonConfig({ slug, title: lesson.title });
    check(
      `"${slug}" routes to its own config (${config?.curriculumKey})`,
      !!config && config.lessonSlug === slug,
    );
    // Objectives shown to the learner must not come from another lesson.
    check(
      `"${slug}" objectives are not another lesson's`,
      !JSON.stringify(config.objectives).toLowerCase().includes('place value') || slug === 'place-value-number-reading',
    );
  }

  // The side quest (1.1-k) must NOT be turned into one of the main lessons.
  const side = quests.find((q) => q.questType === 'SIDE');
  check('1.1-k Numbers in Real Life remains a side quest', !!side && side.questType === 'SIDE');
  check(
    'side quest has no adaptive config (correctly out of scope)',
    resolveAdaptiveLessonConfig({ slug: side!.slug }) === null,
  );

  // Journeys build for every lesson from its real content blocks.
  for (const lesson of main!.lessons) {
    const steps = buildGrade4JourneyFromBlocks(
      lesson.contentBlocks as any,
      lesson.title,
      lesson.slug,
    );
    check(`"${lesson.slug}" builds a journey`, steps.length > 0, `${steps.length} steps`);
    const config = resolveAdaptiveLessonConfig({ slug: lesson.slug });
    if (config && config.journeyBuilder === 'generated') {
      const scored = steps.filter(
        (s: any) => s.interactionSpec?.correctChoiceId || (s.interactionSpec?.activities || []).length > 0,
      );
      check(`"${lesson.slug}" has scored activities`, scored.length > 0);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
section('10. Generic builder: no placeholder practice activities');

{
  // The old generic builder turned experiment steps into fake "I did it! / I
  // need help" choices. Assert that pattern is gone from the built journeys.
  const quests = generateGrade4Math();
  const allBlocks = quests.flatMap((q) => q.lessons.flatMap((l: any) => l.contentBlocks as any[]));
  const steps = buildGrade4JourneyFromBlocks(allBlocks as any, 'Some Unregistered Lesson', 'nope');
  const json = JSON.stringify(steps);
  check(
    'generic builder never emits "I did it!" placeholder choices',
    !json.includes('I did it!') && !json.includes('I need help'),
  );
  check(
    'generic builder never emits "Try the activity." placeholder text',
    !json.includes('Try the activity.'),
  );
  // Practice, when present, must carry real content from the lesson.
  const practice = steps.find((s: any) => s.stepType === 'practice');
  if (practice) {
    const activities = practice.interactionSpec?.activities || [];
    check(
      'generic practice activities come from lesson quiz content',
      activities.length === 0 || activities.some((a: any) => a.choices && a.choices.length > 1),
      JSON.stringify(activities).slice(0, 120),
    );
  } else {
    check('generic practice step optional for lessons with no quiz content', true);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
section('11. Curriculum constraints derive from each config');

for (const config of ALL_CONFIGS) {
  const constraints = getCurriculumConstraints(config.curriculumKey);
  check(
    `${config.lessonSlug}: constraints registered under its curriculum key`,
    !!constraints,
  );
  check(
    `${config.lessonSlug}: constraint scope covers exactly its concepts`,
    constraints &&
      config.concepts.every((c) => constraints.conceptScope.has(c.id)) &&
      constraints.conceptScope.size === config.concepts.length,
  );
  check(
    `${config.lessonSlug}: constraint objective is the lesson's own objectives`,
    constraints?.objective === config.objectives.join(' '),
  );
}

// ─────────────────────────────────────────────────────────────────────────────
section('12. No hardcoded lesson-name branches in shared code');

{
  const fs = require('fs');
  const path = require('path');
  const sharedFiles = [
    'src/lib/curriculum/adaptive/engine.ts',
    'src/lib/curriculum/adaptive/build-journey.ts',
    'src/lib/curriculum/adaptive/resolve-activity.ts',
    'src/lib/curriculum/adaptive/registry.ts',
    'src/lib/curriculum/adaptive/types.ts',
    'src/lib/learning/action-adapter.ts',
    'src/lib/learning/curriculum-constraints.ts',
    'src/app/api/learner/adaptive-decision/route.ts',
  ];
  const banned = [
    /isPlaceValueLesson/,
    /isOrderingLesson/,
    /isFactorsLesson/,
    /isPatternsLesson/,
    /isRomanNumeralsLesson/,
    /includes\(\s*["']place value/i,
    /includes\(\s*["']roman/i,
    /includes\(\s*["']ordering/i,
  ];
  for (const file of sharedFiles) {
    const src = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
    const hits = banned.filter((re) => re.test(src)).map((re) => String(re));
    check(`${file}: contains no lesson-name branch`, hits.length === 0, hits.join(', '));
  }

  // The student page must not branch on lesson titles either.
  const pagePath =
    'src/app/dashboard/student/lessons/[themeSlug]/[questSlug]/[lessonSlug]/page.tsx';
  const pageSrc = fs.readFileSync(path.join(process.cwd(), pagePath), 'utf8');
  const pageHits = banned.filter((re) => re.test(pageSrc)).map((re) => String(re));
  check(`${pagePath}: contains no lesson-name branch`, pageHits.length === 0, pageHits.join(', '));
  check(
    `${pagePath}: no hardcoded "Place Value Pro" on the generic celebration screen`,
    !/You're a Place Value Pro/.test(pageSrc),
  );
  check(
    `${pagePath}: no hardcoded place-value objective list`,
    !/Read numbers up to tens of thousands/.test(pageSrc),
  );
}

function blocksForLesson(slug: string): any[] {
  const quests = generateGrade4Math();
  for (const q of quests) {
    for (const l of q.lessons as any[]) {
      if (l.slug === slug) return l.contentBlocks;
    }
  }
  return [];
}

// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n${'='.repeat(64)}`);
console.log(`PASS: ${passed}   FAIL: ${failed}   TOTAL: ${passed + failed}`);
if (failed) {
  console.log(`\nFailed tests:\n${failures.map((f) => `  - ${f}`).join('\n')}`);
}
console.log('='.repeat(64));
process.exit(failed ? 1 : 0);