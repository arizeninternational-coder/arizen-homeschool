#!/usr/bin/env node
/**
 * Fix 3 wrong multiplication QC answers in Math draft journeys.
 * Only touches studentJourneyDraft.quick_check.correctIndex + options.
 * Does NOT publish. Does NOT set isAvailable=true.
 *
 * Issues:
 *   "Multiplying by 3 and 4" (938a3ed5): QC "What is 4 × 4?" → correctIndex points to "15", should be "16"
 *   "Multiplying by 5 and 10" (2afb0a5b): QC "What is 6 × 10?" → correctIndex points to "55", should be "60"
 *   "Writing Multiplication Sentences" (cff3b7c1): QC "What is 4 × 2?" → correctIndex points to "9", should be "8"
 *
 * Fix strategy: replace the options array so the correct answer is at the right index.
 */
const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const t = line.trim();
  if (!t || t.startsWith('#')) return;
  const i = t.indexOf('=');
  if (i === -1) return;
  envVars[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^['"]|['"]$/g, '');
});
const { createClient } = require('@supabase/supabase-js');
const db = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const FIX_IDS = [
  '938a3ed5-06ab-430b-a345-b933cce98a68',  // Multiplying by 3 and 4
  '2afb0a5b-88e3-4c8e-9ccb-844064b1bd3f',  // Multiplying by 5 and 10
  'cff3b7c1-2468-454d-b2da-fe35d49e2456',  // Writing Multiplication Sentences
];

const QC_CORRECTIONS = {
  '938a3ed5-06ab-430b-a345-b933cce98a68': {
    question: 'What is 4 × 4?',
    correctAnswer: '16',
    options: ['16', '15', '14', '12'],  // 16 at index 0
    correctIndex: 0,
  },
  '2afb0a5b-88e3-4c8e-9ccb-844064b1bd3f': {
    question: 'What is 6 × 10?',
    correctAnswer: '60',
    options: ['60', '55', '50', '65'],  // 60 at index 0
    correctIndex: 0,
  },
  'cff3b7c1-2468-454d-b2da-fe35d49e2456': {
    question: 'What is 4 × 2?',
    correctAnswer: '8',
    options: ['8', '9', '6', '10'],  // 8 at index 0
    correctIndex: 0,
  },
};

async function main() {
  console.log('=== FIX 3 MULTIPLICATION QC ANSWERS ===\n');

  // Fetch the 3 lessons
  const { data: lessons, error } = await db.from('Lesson')
    .select('id, title, contentBlocks')
    .in('id', FIX_IDS);

  if (error) { console.error('FETCH ERROR:', error.message); process.exit(1); }
  if (!lessons || lessons.length !== FIX_IDS.length) {
    console.error(`ERROR: Expected ${FIX_IDS.length}, got ${lessons?.length || 0}`);
    process.exit(1);
  }

  const results = [];

  for (const lesson of lessons) {
    const correction = QC_CORRECTIONS[lesson.id];
    if (!correction) { console.error(`No correction for ${lesson.id}`); process.exit(1); }

    let cb = {};
    try { cb = JSON.parse(lesson.contentBlocks || '{}'); } catch(e) {}

    // Safety: verify g2-math-hq batch
    const batchId = cb.aiMetadata?.batchId || '';
    if (!batchId.includes('g2-math-hq')) {
      console.error(`SAFETY: ${lesson.title} not g2-math-hq (batchId: ${batchId})`);
      process.exit(1);
    }
    if (cb.isAvailable !== false) {
      console.error(`SAFETY: ${lesson.title} isAvailable=${cb.isAvailable}`);
      process.exit(1);
    }

    const draft = cb.studentJourneyDraft;
    if (!draft || !Array.isArray(draft)) {
      console.error(`SAFETY: ${lesson.title} has no draft`);
      process.exit(1);
    }

    const qcIdx = draft.findIndex(s => s.stepType === 'quick_check');
    if (qcIdx === -1) {
      console.error(`SAFETY: ${lesson.title} has no quick_check`);
      process.exit(1);
    }

    const oldQC = draft[qcIdx].interaction || {};
    console.log(`${lesson.title}`);
    console.log(`  OLD: "${oldQC.question}" → [${oldQC.correctIndex}] ${oldQC.options?.[oldQC.correctIndex]}`);
    console.log(`  NEW: "${correction.question}" → [${correction.correctIndex}] ${correction.correctAnswer}`);

    // Replace only the interaction in the quick_check step
    draft[qcIdx] = {
      ...draft[qcIdx],
      interaction: {
        ...oldQC,
        type: 'multiple_choice',
        question: correction.question,
        options: correction.options,
        correctIndex: correction.correctIndex,
        feedback: `The answer is ${correction.correctAnswer}.`,
      },
    };

    // Write back
    const { error: updateErr } = await db.from('Lesson')
      .update({ contentBlocks: JSON.stringify(cb) })
      .eq('id', lesson.id);

    if (updateErr) {
      console.error(`WRITE ERROR: ${updateErr.message}`);
      process.exit(1);
    }

    results.push({
      id: lesson.id,
      title: lesson.title,
      oldAnswer: oldQC.options?.[oldQC.correctIndex],
      newAnswer: correction.correctAnswer,
    });
    console.log(`  ✅ Fixed\n`);
  }

  console.log('=== RESULTS ===');
  results.forEach(r => console.log(`  ${r.title}: ${r.oldAnswer} → ${r.newAnswer}`));
  console.log(`\nAll 3 Math lessons fixed. Only studentJourneyDraft.quick_check updated.`);
  console.log(`isAvailable=false. studentJourney unchanged. No other lessons touched.`);
}

main().catch(e => console.error('FATAL:', e.message));
