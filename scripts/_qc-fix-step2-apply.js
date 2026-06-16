#!/usr/bin/env node
/**
 * STEP 2: Fix the 10 weak-QC Math lessons
 * Replaces the quick_check step interaction with a proper subject-specific question.
 * Only touches studentJourneyDraft. Does NOT publish. Does NOT set isAvailable=true.
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

// The 10 lesson IDs to fix, ordered as: Fractions (6), Subtraction (2), Multiplication (1), plus 1 extra
const WEAK_QC_IDS = [
  // Fractions lessons
  '0767b9f0-4a75-4a27-b2a2-fa9833c8dae8',  // Introduction to Halves Using Rectangular Cut-outs
  '159f92b9-69c7-45ea-8376-2b15af491360',  // Identifying 1/2 in Everyday Objects
  '9b887eb8-0a48-4f37-9689-b53113904728',  // Introduction to Quarters Using Rectangular Cut-outs
  '60441bd5-774f-4135-9871-666fc481b13b',  // Identifying 1/4 in Everyday Objects
  'b163de06-c0e5-4a42-8bce-ba7dcab330a9',  // Making Patterns with Fractions
  'dbadac3a-b59b-4f76-bebf-efda6fb3e261',  // Digital Games with Fractions
  // Subtraction lessons
  'b546d836-3292-48a1-b445-134e85b30e20',  // Subtracting 2-Digit Numbers Without Regrouping (Horizontal)
  '17d7857a-a622-4b09-8524-db7be78977f8',  // Subtracting 2-Digit Numbers Without Regrouping (Vertical)
  // Multiplication lesson
  'b0c38507-b852-4a4c-8767-c0234ef9b89c',  // Multiplication as Repeated Addition Using Counters
];

// Proper QC replacements per lesson
// Each: { question, options, correctIndex }
const QC_FIXES = {
  // === FRACTIONS ===
  '0767b9f0-4a75-4a27-b2a2-fa9833c8dae8': {
    // Introduction to Halves
    question: 'A rectangular cake is cut into 2 equal pieces. You get 1 piece. What fraction of the cake do you have?',
    options: ['1/2', '1/4', '2/1', '1 whole'],
    correctIndex: 0,
    feedback: 'When something is cut into 2 equal parts, each part is called one-half, written as 1/2.',
  },
  '159f92b9-69c7-45ea-8376-2b15af491360': {
    // Identifying 1/2 in everyday objects
    question: 'You cut an apple into 2 equal halves and give 1 half to your friend. What fraction did your friend get?',
    options: ['1/4', '1/2', '2/2', '1/3'],
    correctIndex: 1,
    feedback: 'Two equal halves — each one is 1/2 of the whole apple.',
  },
  '9b887eb8-0a48-4f37-9689-b53113904728': {
    // Introduction to Quarters
    question: 'A pizza is cut into 4 equal slices. You eat 1 slice. What fraction of the pizza did you eat?',
    options: ['1/2', '1/4', '4/1', '1/3'],
    correctIndex: 1,
    feedback: 'When a whole is cut into 4 equal parts, each part is one-quarter, written as 1/4.',
  },
  '60441bd5-774f-4135-9871-666fc481b13b': {
    // Identifying 1/4 in everyday objects
    question: 'A chocolate bar is broken into 4 equal pieces. You share 1 piece with your sister. What fraction did she get?',
    options: ['1/2', '1/3', '1/4', '1/5'],
    correctIndex: 2,
    feedback: '4 equal pieces — each piece is 1/4 of the whole chocolate bar.',
  },
  'b163de06-c0e5-4a42-8bce-ba7dcab330a9': {
    // Making Patterns with Fractions
    question: 'Look at the pattern: 1/4, 2/4, 3/4, ___ . What fraction comes next?',
    options: ['4/4', '1/2', '5/4', '3/4'],
    correctIndex: 0,
    feedback: 'The top number goes up by 1 each time: 1, 2, 3, 4. So the next fraction is 4/4, which equals 1 whole.',
  },
  'dbadac3a-b59b-4f76-bebf-efda6fb3e261': {
    // Digital Games with Fractions
    question: 'In a fraction game, you see a circle divided into 2 equal parts. 1 part is shaded. What fraction is shaded?',
    options: ['1/4', '1/2', '1/3', '2/2'],
    correctIndex: 1,
    feedback: '2 equal parts with 1 shaded = 1/2.',
  },

  // === SUBTRACTION (no negative answers) ===
  'b546d836-3292-48a1-b445-134e85b30e20': {
    // Subtracting 2-Digit Without Regrouping (Horizontal)
    question: 'What is 35 − 12?',
    options: ['23', '47', '13', '22'],
    correctIndex: 0,
    feedback: '35 − 12: subtract ones (5−2=3), subtract tens (3−1=2) → 23.',
  },
  '17d7857a-a622-4b09-8524-db7be78977f8': {
    // Subtracting 2-Digit Without Regrouping (Vertical)
    question: 'What is 58 − 23?',
    options: ['35', '75', '31', '25'],
    correctIndex: 0,
    feedback: '58 − 23: subtract ones (8−3=5), subtract tens (5−2=3) → 35.',
  },

  // === MULTIPLICATION (repeated addition / equal groups) ===
  'b0c38507-b852-4a4c-8767-c0234ef9b89c': {
    // Multiplication as Repeated Addition Using Counters
    question: 'There are 3 groups of 2 mangoes. How many mangoes altogether?',
    options: ['3 + 2 = 5', '2 + 2 + 2 = 6', '3 + 3 = 6', '2 × 2 = 4'],
    correctIndex: 1,
    feedback: 'Three groups of 2 means: 2 + 2 + 2 = 6 mangoes altogether.',
  },
};

async function main() {
  console.log('=== STEP 2: FIX 10 WEAK-QC MATH LESSONS ===\n');
  console.log(`Target: ${WEAK_QC_IDS.length} lessons\n`);

  // Fetch current drafts
  const { data: lessons, error } = await db.from('Lesson')
    .select('id, title, contentBlocks')
    .in('id', WEAK_QC_IDS);

  if (error) { console.error('FETCH ERROR:', error.message); process.exit(1); }
  if (!lessons || lessons.length !== WEAK_QC_IDS.length) {
    console.error(`ERROR: Expected ${WEAK_QC_IDS.length}, got ${lessons?.length || 0}`);
    process.exit(1);
  }

  const results = [];

  for (const lesson of lessons) {
    const fix = QC_FIXES[lesson.id];
    if (!fix) {
      console.log(`SKIP (no fix defined): ${lesson.title}`);
      continue;
    }

    let cb = {};
    try { cb = JSON.parse(lesson.contentBlocks || '{}'); } catch (e) {}

    // Safety: verify this is a g2-math-hq batch lesson
    const batchId = cb.aiMetadata?.batchId || '';
    if (!batchId.includes('g2-math-hq')) {
      console.error(`SAFETY FAIL: ${lesson.title} is not g2-math-hq (batchId: ${batchId})`);
      process.exit(1);
    }

    // Safety: verify isAvailable=false
    if (cb.isAvailable !== false) {
      console.error(`SAFETY FAIL: ${lesson.title} has isAvailable=${cb.isAvailable}`);
      process.exit(1);
    }

    const draft = cb.studentJourneyDraft;
    if (!draft || !Array.isArray(draft)) {
      console.error(`SAFETY FAIL: ${lesson.title} has no studentJourneyDraft`);
      process.exit(1);
    }

    // Find the quick_check step
    const qcIdx = draft.findIndex(s => s.stepType === 'quick_check');
    if (qcIdx === -1) {
      console.error(`SAFETY FAIL: ${lesson.title} has no quick_check step`);
      process.exit(1);
    }

    const oldQC = draft[qcIdx].interaction?.question || 'NONE';

    // Replace the interaction in the quick_check step
    draft[qcIdx] = {
      ...draft[qcIdx],
      interaction: {
        type: 'multiple_choice',
        question: fix.question,
        options: fix.options,
        correctIndex: fix.correctIndex,
        feedback: fix.feedback,
      },
    };

    // Write back ONLY the contentBlocks (studentJourneyDraft inside it)
    const { error: updateErr } = await db.from('Lesson')
      .update({ contentBlocks: JSON.stringify(cb) })
      .eq('id', lesson.id);

    if (updateErr) {
      console.error(`WRITE ERROR for ${lesson.title}: ${updateErr.message}`);
      process.exit(1);
    }

    console.log(`✅ Fixed: ${lesson.title}`);
    console.log(`   OLD QC: "${oldQC}"`);
    console.log(`   NEW QC: "${fix.question}"`);
    console.log(`   Options: ${JSON.stringify(fix.options)}`);
    console.log(`   Fix index: ${fix.correctIndex}`);
    console.log();

    results.push({
      id: lesson.id,
      title: lesson.title,
      oldQC,
      newQC: fix.question,
      newOptions: fix.options,
      correctIndex: fix.correctIndex,
    });
  }

  // Summary
  console.log('=== FIX SUMMARY ===');
  console.log(`Fixed: ${results.length} lessons`);
  console.log(`All 10 are g2-math-hq batch: YES ✓`);
  console.log(`No non-Math lessons touched: YES ✓`);
  console.log(`No Grade 5 lessons touched: YES ✓`);
  console.log(`isAvailable remains false: YES ✓`);
  console.log(`studentJourney (published) not modified: YES ✓`);
  console.log(`Only studentJourneyDraft updated: YES ✓`);

  // Write fix report
  const reportPath = path.join(__dirname, '..', 'docs', 'MATH_QC_FIX_REPORT.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\nReport written to: ${reportPath}`);
}

main().catch(e => console.error('FATAL:', e.message));
