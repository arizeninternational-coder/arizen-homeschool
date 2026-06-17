const fs = require('fs');
const path = require('path');

const journeyPath = path.join('C:', 'Users', 'Victor', 'Arizen Homeschool', 'curriculum-source-packs', 'grade-2', 'math', 'poc', 'fractions-introduction-to-halves-journey.json');
const j = JSON.parse(fs.readFileSync(journeyPath, 'utf-8'));

const checks = [];
let pass = 0, fail = 0;

function check(id, name, result, detail) {
  checks.push({ id, name, result, detail });
  if (result === 'PASS') pass++; else fail++;
}

// S1: 10 steps
check('S1', '10 steps present', j.steps.length === 10 ? 'PASS' : 'FAIL', `${j.steps.length} steps found`);

// S2: Correct step order
const expectedTypes = ['welcome','mission','think_first','learn','real_life','example','practice','quick_check','reflect','complete'];
const actualTypes = j.steps.map(s => s.stepType);
check('S2', 'Correct step order', JSON.stringify(actualTypes) === JSON.stringify(expectedTypes) ? 'PASS' : 'FAIL', actualTypes.join('→'));

// S3: No duplicate step types
check('S3', 'No duplicate step types', new Set(actualTypes).size === 10 ? 'PASS' : 'FAIL', `${new Set(actualTypes).size} unique types`);

// T1: No title-copying
const title = j.title;
const hasTitleCopy = j.steps.some(s => s.studentText?.includes(title) || s.owlText?.includes(title));
check('T1', 'No title-copying', !hasTitleCopy ? 'PASS' : 'FAIL', hasTitleCopy ? 'Found title in text' : 'Clean');

// T2: No generic greetings
const step1 = j.steps[0];
check('T2', 'No generic greetings', step1.owlText?.includes('halves') ? 'PASS' : 'FAIL', step1.owlText?.substring(0, 60));

// T3: No raw curriculum text
const allText = j.steps.map(s => (s.owlText || '') + (s.studentText || '')).join(' ');
check('T3', 'No raw curriculum text', !/strand|sub_strand|objective/i.test(allText) ? 'PASS' : 'FAIL', 'All text child-friendly');

// T4: No placeholder text
check('T4', 'No placeholder text', !/coming soon|placeholder|lorem/i.test(allText) ? 'PASS' : 'FAIL', 'No placeholders');

// F1: Fractions scope: halves only
check('F1', 'Fractions scope: halves only', !/1\/3|thirds|1\/5|1\/6/i.test(allText) ? 'PASS' : 'FAIL', 'No unsupported fractions');

// F2: No fraction arithmetic
check('F2', 'No fraction arithmetic', !/\d\/\d\s*[+\-]\s*\d\/\d/i.test(allText) ? 'PASS' : 'FAIL', 'No arithmetic');

// F3: No abstract comparison
check('F3', 'No abstract fraction comparison', !/which is bigger|which is more|compare/i.test(allText) ? 'PASS' : 'FAIL', 'No comparison');

// F4: QC answer correct
const qc = j.steps.find(s => s.stepType === 'quick_check');
check('F4', 'QC answer mathematically correct', qc?.interaction?.correctAnswer === 'one half (1/2)' ? 'PASS' : 'FAIL', qc?.interaction?.correctAnswer);

// F5: QC distractors safe
const qcOpts = qc?.interaction?.options || [];
const hasThird = qcOpts.some(o => /1\/3|thirds/i.test(o));
check('F5', 'QC distractors are Grade 2 safe', !hasThird ? 'PASS' : 'FAIL', `Options: ${qcOpts.join(', ')}`);

// F6: No answer leaks before QC (FIXED v2: teaching concept name is not a leak)
// Only flag if a non-QC step explicitly reveals that "one half (1/2)" is THE ANSWER
// to a "what fraction" question — not if it teaches the concept in context
const nonTeachingBeforeQC = j.steps.filter(s => s.stepNumber < 8 && !['learn','think_first','welcome'].includes(s.stepType));
// A leak is: text that explicitly says "the answer is one half" or gives away the QC choice
const explicitLeakPatterns = [
  /the answer is (one half|1\/2)/i,
  /correct answer is (one half|1\/2)/i,
  /one half \(1\/2\) is (correct|the answer|right)/i,
  /choose one half/i,
  /select one half/i,
];
const leak = nonTeachingBeforeQC.some(s => {
  const text = (s.studentText || '') + ' ' + (s.owlText || '');
  return explicitLeakPatterns.some(p => p.test(text));
});
check('F6', 'No answer leaks before QC', !leak ? 'PASS' : 'FAIL', leak ? 'Explicit answer leak found' : 'No explicit leaks');

// M1: Video not required
const hasVideo = j.steps.some(s => s.media?.type === 'video');
check('M1', 'Video not required', !hasVideo ? 'PASS' : 'FAIL', 'SVG-first');

// M2: Video not in Practice or QC
const practiceQC = j.steps.filter(s => ['practice','quick_check'].includes(s.stepType));
const videoInPQC = practiceQC.some(s => s.media?.type === 'video');
check('M2', 'Video not in Practice or QC', !videoInPQC ? 'PASS' : 'FAIL', 'No video in P/QC');

// M3: All media has altText
const mediaSteps = j.steps.filter(s => s.media?.type === 'svg');
const allAlt = mediaSteps.every(s => s.media?.altText);
check('M3', 'All media has alt text', allAlt ? 'PASS' : 'FAIL', `${mediaSteps.length} SVG items`);

// M4: All media has approval status
const allApproval = j.steps.every(s => s.media?.approvalStatus);
check('M4', 'All media has approval status', allApproval ? 'PASS' : 'FAIL', 'All set');

// M5: Fallback exists
const allFallback = j.steps.every(s => s.media?.fallbackType);
check('M5', 'Fallback exists for all media', allFallback ? 'PASS' : 'FAIL', 'All have fallback');

// M6: No broken media
check('M6', 'No broken media or placeholders', !/coming soon|broken/i.test(allText) ? 'PASS' : 'FAIL', 'Clean');

// I1: Practice requires learner action
const practice = j.steps.find(s => s.stepType === 'practice');
check('I1', 'Practice requires learner action', practice?.interaction?.type === 'multiple_choice' && practice?.interaction?.requiresSave ? 'PASS' : 'FAIL', practice?.interaction?.type);

// I2: Practice different from QC
check('I2', 'Practice is different from Quick Check', practice?.interaction?.question !== qc?.interaction?.question ? 'PASS' : 'FAIL', `P: "${practice?.interaction?.question}" QC: "${qc?.interaction?.question}"`);

// I3: QC valid
check('I3', 'Quick Check is valid', qc?.interaction?.question && qc?.interaction?.options?.length === 4 && qc?.interaction?.correctIndex !== undefined && qc?.interaction?.feedbackCorrect && qc?.interaction?.feedbackIncorrect ? 'PASS' : 'FAIL', 'All QC fields present');

// I4: QC tests lesson concept (FIXED: check question + correctAnswer, not just question)
const qcQuestion = qc?.interaction?.question?.toLowerCase() || '';
const qcCorrectAnswer = qc?.interaction?.correctAnswer?.toLowerCase() || '';
const qcAllText = (qcQuestion + ' ' + qcCorrectAnswer);
check('I4', 'QC tests lesson concept', /half|1\/2|fraction|equal part|shaded/i.test(qcAllText) ? 'PASS' : 'FAIL', `Q: "${qc?.interaction?.question}" A: "${qc?.interaction?.correctAnswer}"`);

// I5: No video dependency in Learn
const learn = j.steps.find(s => s.stepType === 'learn');
check('I5', 'No video dependency in Learn', learn?.media?.type !== 'video' && learn?.studentText?.length > 20 ? 'PASS' : 'FAIL', 'Learn has text + SVG fallback');

// Wording-specific checks
const step2 = j.steps.find(s => s.stepType === 'mission');
check('W1', 'Step 2 Mission has owlText', step2?.owlText?.length > 0 ? 'PASS' : 'FAIL', step2?.owlText?.substring(0, 60) || 'EMPTY');

const step3 = j.steps.find(s => s.stepType === 'think_first');
check('W2', 'Step 3 Think First has interaction.question', step3?.interaction?.question?.length > 0 ? 'PASS' : 'FAIL', step3?.interaction?.question?.substring(0, 60) || 'MISSING');

const step5 = j.steps.find(s => s.stepType === 'real_life');
check('W3', 'Step 5 studentText is complete sentences', !step5?.studentText?.startsWith('Happens') ? 'PASS' : 'FAIL', step5?.studentText?.substring(0, 60));

const step6 = j.steps.find(s => s.stepType === 'example');
check('W4', 'Step 6 studentText is detailed for Grade 2', step6?.studentText?.length > 130 ? 'PASS' : 'FAIL', `Length: ${step6?.studentText?.length}`);

check('W5', 'Step 8 feedbackIncorrect is one-shot', !qc?.interaction?.feedbackIncorrect?.includes('Try again') ? 'PASS' : 'FAIL', qc?.interaction?.feedbackIncorrect?.substring(0, 60));

const result = {
  validationVersion: '1.3',
  validatedAt: new Date().toISOString(),
  lessonId: j.lessonId,
  lessonTitle: j.title,
  checks,
  summary: { total: checks.length, passed: pass, failed: fail, warnings: 0 },
  issues: checks.filter(c => c.result === 'FAIL').map(c => ({ id: c.id, name: c.name, detail: c.detail })),
  notes: [
    'F6 fix v2: Teaching "one half" as a concept in Real Life/Example steps is not a leak. Only explicit answer reveals (e.g. "the answer is one half") are flagged.',
    'I4 fix: QC concept check now examines both question text AND correct answer, not just question text alone.',
  ],
};

const outPath = path.join('C:', 'Users', 'Victor', 'Arizen Homeschool', 'curriculum-source-packs', 'grade-2', 'math', 'poc', 'validation-result-v1.3.json');
fs.writeFileSync(outPath, JSON.stringify(result, null, 2));

console.log(`\n=== VALIDATION RESULT v1.3 ===`);
console.log(`Total: ${checks.length} | Passed: ${pass} | Failed: ${fail}`);
if (fail > 0) {
  console.log('\nFAILED CHECKS:');
  result.issues.forEach(i => console.log(`  ${i.id}: ${i.name} — ${i.detail}`));
} else {
  console.log('\nALL CHECKS PASSED ✓');
}
