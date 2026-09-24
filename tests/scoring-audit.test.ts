/**
 * Scoring Audit Test for Grade 4 Place Value Lesson
 * 
 * This test documents exactly which activities are scored and verifies
 * the scoring calculation is correct.
 * 
 * Lesson structure:
 * - Step 1 (welcome): tap_continue → NOT scored
 * - Step 2 (mission): tap_continue → NOT scored
 * - Step 3 (think_first): tap_choice with correctChoiceId → SCORED
 * - Step 4 (learn): step_reveal → NOT scored
 * - Step 5 (connect): tap_choice with correctChoiceId → SCORED
 * - Step 6 (example): step_reveal → NOT scored
 * - Step 7 (practice): multi_activity → 3 sub-activities, ALL SCORED
 *   - p1: tap_choice with correctChoiceId
 *   - p2: multiple_choice with correctIndex
 *   - p3: tap_choice with correctChoiceId
 * - Step 8 (quick_check): multiple_choice with correctIndex → SCORED
 * - Step 9 (reflect): reflection_chips → NOT scored
 * - Step 10 (complete): tap_continue → NOT scored
 * 
 * Expected: 6 scored activities (think_first, connect, p1, p2, p3, quick_check)
 * 
 * Run with: npx tsx tests/scoring-audit.test.ts
 */

import { getScoredActivities, calculateLessonScore } from '../src/lib/curriculum/scoring-config';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) { passed++; console.log(`  ✅ ${message}`); }
  else { failed++; console.log(`  ❌ ${message}`); }
}

console.log('=== Scoring Audit: Grade 4 Place Value ===\n');

// Simulate the journey steps
const journeySteps = [
  { id: 'welcome', stepType: 'welcome', interactionSpec: { type: 'tap_continue' } },
  { id: 'mission', stepType: 'mission', interactionSpec: { type: 'tap_continue' } },
  { id: 'think_first', stepType: 'think_first', interactionSpec: { type: 'tap_choice', correctChoiceId: 'C', choices: [{id:'A',label:'7 ones'},{id:'B',label:'7 tens'},{id:'C',label:'7 hundreds'},{id:'D',label:'7 thousands'}] } },
  { id: 'learn', stepType: 'learn', interactionSpec: { type: 'step_reveal' } },
  { id: 'connect', stepType: 'connect', interactionSpec: { type: 'tap_choice', correctChoiceId: 'D', choices: [{id:'A',label:'3 people'},{id:'B',label:'30 people'},{id:'C',label:'300 people'},{id:'D',label:'3,000 people'}] } },
  { id: 'example', stepType: 'example', interactionSpec: { type: 'step_reveal' } },
  { id: 'practice', stepType: 'practice', interactionSpec: { type: 'multi_activity', activities: [
    { id: 'p1', type: 'tap_choice', correctChoiceId: 'A', choices: [{id:'A',label:'2,538'},{id:'B',label:'2,358'},{id:'C',label:'5,238'},{id:'D',label:'2,583'}] },
    { id: 'p2', type: 'multiple_choice', correctIndex: 1, options: ['1,247','1,547','1,347','1,537'] },
    { id: 'p3', type: 'tap_choice', correctChoiceId: 'A', choices: [{id:'A',label:'5,621'},{id:'B',label:'5,261'},{id:'C',label:'They are equal'}] },
  ]}},
  { id: 'quick_check', stepType: 'quick_check', interactionSpec: { type: 'multiple_choice', correctIndex: 1, options: ['3,402','3,042','3,024','3,240'] } },
  { id: 'reflect', stepType: 'reflect', interactionSpec: { type: 'reflection_chips' } },
  { id: 'complete', stepType: 'complete', interactionSpec: { type: 'tap_continue' } },
];

const scoredActivities = getScoredActivities(journeySteps);

console.log('Scored activities found:', scoredActivities.length);
for (const a of scoredActivities) {
  console.log(`  - ${a.activityId} (${a.stepType}): correct="${a.correctAnswer}"`);
}

assert(scoredActivities.length === 6, `Expected 6 scored activities, got ${scoredActivities.length}`);
assert(scoredActivities.find(a => a.activityId === 'think_first') !== undefined, 'think_first is scored');
assert(scoredActivities.find(a => a.activityId === 'connect') !== undefined, 'connect is scored');
assert(scoredActivities.find(a => a.activityId === 'p1') !== undefined, 'practice p1 is scored');
assert(scoredActivities.find(a => a.activityId === 'p2') !== undefined, 'practice p2 is scored');
assert(scoredActivities.find(a => a.activityId === 'p3') !== undefined, 'practice p3 is scored');
assert(scoredActivities.find(a => a.activityId === 'quick_check') !== undefined, 'quick_check is scored');

// Verify non-scored activities are excluded
assert(scoredActivities.find(a => a.activityId === 'welcome') === undefined, 'welcome NOT scored');
assert(scoredActivities.find(a => a.activityId === 'mission') === undefined, 'mission NOT scored');
assert(scoredActivities.find(a => a.activityId === 'learn') === undefined, 'learn NOT scored');
assert(scoredActivities.find(a => a.activityId === 'example') === undefined, 'example NOT scored');
assert(scoredActivities.find(a => a.activityId === 'reflect') === undefined, 'reflect NOT scored');
assert(scoredActivities.find(a => a.activityId === 'complete') === undefined, 'complete NOT scored');

// Test score calculation with all correct
console.log('\n=== Score Calculation Tests ===');
const allCorrect = [
  { activityId: 'think_first', selectedAnswer: '7 hundreds', correct: true },
  { activityId: 'connect', selectedAnswer: '3,000 people', correct: true },
  { activityId: 'p1', selectedAnswer: '2,538', correct: true },
  { activityId: 'p2', selectedAnswer: '1,547', correct: true },
  { activityId: 'p3', selectedAnswer: '5,621', correct: true },
  { activityId: 'quick_check', selectedAnswer: '3,042', correct: true },
];
const scoreAllCorrect = calculateLessonScore(allCorrect, scoredActivities);
assert(scoreAllCorrect.correct === 6, `All correct: 6/6 (got ${scoreAllCorrect.correct}/${scoreAllCorrect.total})`);
assert(scoreAllCorrect.percentage === 100, `All correct: 100% (got ${scoreAllCorrect.percentage}%)`);

// Test score calculation with 1 wrong (the original 1/3 bug would have been because only 3 items were counted)
const oneWrong = [
  { activityId: 'think_first', selectedAnswer: '7 tens', correct: false },  // WRONG
  { activityId: 'connect', selectedAnswer: '3,000 people', correct: true },
  { activityId: 'p1', selectedAnswer: '2,538', correct: true },
  { activityId: 'p2', selectedAnswer: '1,547', correct: true },
  { activityId: 'p3', selectedAnswer: '5,621', correct: true },
  { activityId: 'quick_check', selectedAnswer: '3,042', correct: true },
];
const scoreOneWrong = calculateLessonScore(oneWrong, scoredActivities);
assert(scoreOneWrong.correct === 5, `One wrong: 5/6 (got ${scoreOneWrong.correct}/${scoreOneWrong.total})`);
assert(scoreOneWrong.percentage === 83, `One wrong: 83% (got ${scoreOneWrong.percentage}%)`);

// Test partial completion
const partial = [
  { activityId: 'think_first', selectedAnswer: '7 hundreds', correct: true },
  { activityId: 'connect', selectedAnswer: '30 people', correct: false },
];
const scorePartial = calculateLessonScore(partial, scoredActivities);
assert(scorePartial.total === 6, `Partial: denominator is 6 (got ${scorePartial.total})`);
assert(scorePartial.correct === 1, `Partial: 1 correct (got ${scorePartial.correct})`);

console.log('\n==================================================');
console.log(`📊 Results: ${passed} passed, ${failed} failed`);
console.log('==================================================');

if (failed > 0) process.exit(1);
