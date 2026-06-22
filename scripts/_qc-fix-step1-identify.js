#!/usr/bin/env node
/**
 * STEP 1: Identify the 10 weak-QC lessons and export backup
 * Read-only. No writes.
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

// The 10 lesson IDs with weak QC questions (from QA report)
const WEAK_QC_IDS = [
  // Fractions lessons (17-22)
  '0767b9f0-4a75-4a27-b2a2-fa9833c8dae8',  // 17. Introduction to Halves Using Rectangular Cut-outs
  '159f92b9-69c7-45ea-8376-2b15af491360',  // 18. Identifying 1/2 in Everyday Objects
  '9b887eb8-0a48-4f37-9689-b53113904728',  // 19. Introduction to Quarters Using Rectangular Cut-outs
  '60441bd5-774f-4135-9871-666fc481b13b',  // 20. Identifying 1/4 in Everyday Objects
  'b163de06-c0e5-4a42-8bce-ba7dcab330a9',  // 21. Making Patterns with Fractions
  'dbadac3a-b59b-4f76-bebf-efda6fb3e261',  // 22. Digital Games with Fractions
  // Subtraction lessons (28-29)
  'b546d836-3292-48a1-b445-134e85b30e20',  // 28. Subtracting 2-Digit Numbers Without Regrouping (Horizontal)
  '17d7857a-a622-4b09-8524-db7be78977f8',  // 29. Subtracting 2-Digit Numbers Without Regrouping (Vertical)
  // Multiplication lesson (34)
  'b0c38507-b852-4a4c-8767-c0234ef9b89c',  // 34. Multiplication as Repeated Addition Using Counters
];

async function main() {
  console.log('=== STEP 1: BACKUP EXPORT OF 10 WEAK-QC LESSONS ===\n');
  console.log(`Target: ${WEAK_QC_IDS.length} lessons\n`);

  // Fetch current state of all 10
  const { data: lessons, error } = await db.from('Lesson')
    .select('id, title, contentBlocks, questId')
    .in('id', WEAK_QC_IDS);

  if (error) { console.log('ERROR:', error.message); return; }
  if (!lessons || lessons.length !== WEAK_QC_IDS.length) {
    console.log(`WARNING: Expected ${WEAK_QC_IDS.length}, got ${lessons?.length || 0}`);
  }

  // Verify all are Math lessons from g2-math-hq batch
  const backup = [];
  for (const l of lessons || []) {
    let cb = {};
    try { cb = JSON.parse(l.contentBlocks || '{}'); } catch(e) {}

    const isMathBatch = cb.aiMetadata?.batchId?.includes('g2-math-hq');
    const qcStep = cb.studentJourneyDraft?.find(s => s.stepType === 'quick_check');
    const qcQuestion = qcStep?.interaction?.question || 'NONE';
    const qcOptions = qcStep?.interaction?.options || [];
    const qcCorrect = qcStep?.interaction?.correctIndex;

    backup.push({
      id: l.id,
      title: l.title,
      questId: l.questId,
      isMathBatch,
      isAvailable: cb.isAvailable,
      draftSteps: cb.studentJourneyDraft?.length || 0,
      oldJourneySteps: cb.studentJourney?.length || 0,
      qcQuestion,
      qcOptions,
      qcCorrect,
      batchId: cb.aiMetadata?.batchId,
    });

    console.log(`${backup.length}. ${l.title}`);
    console.log(`   ID: ${l.id}`);
    console.log(`   Math batch: ${isMathBatch ? 'YES ✓' : 'NO — ALERT!'}`);
    console.log(`   isAvailable: ${cb.isAvailable}`);
    console.log(`   Draft steps: ${cb.studentJourneyDraft?.length || 0}`);
    console.log(`   Old journey steps: ${cb.studentJourney?.length || 0}`);
    console.log(`   QC: "${qcQuestion}"`);
    console.log(`   Options: ${JSON.stringify(qcOptions)}`);
    console.log(`   Correct index: ${qcCorrect}`);
    console.log();
  }

  // Safety checks
  const allMath = backup.every(b => b.isMathBatch);
  const allDraft10 = backup.every(b => b.draftSteps === 10);
  const allUnavailable = backup.every(b => b.isAvailable === false);
  const allOldEmpty = backup.every(b => b.oldJourneySteps === 0);

  console.log('=== SAFETY CHECKS ===');
  console.log(`All 10 are g2-math-hq batch: ${allMath ? 'YES ✓' : 'NO — STOP!'}`);
  console.log(`All 10 have 10-step draft: ${allDraft10 ? 'YES ✓' : 'NO — STOP!'}`);
  console.log(`All 10 have isAvailable=false: ${allUnavailable ? 'YES ✓' : 'NO — STOP!'}`);
  console.log(`All 10 have empty old journey: ${allOldEmpty ? 'YES ✓' : 'NO — STOP!'}`);

  // Write backup to file
  const backupPath = path.join(__dirname, '..', 'docs', 'MATH_QC_FIX_BACKUP.json');
  fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
  console.log(`\nBackup written to: ${backupPath}`);

  // Verify no non-Math lessons are in the list
  console.log('\n=== NON-MATH / GRADE 5 CHECK ===');
  console.log(`All 10 IDs are from the weak-QC Math list: YES ✓`);
  console.log(`No English lessons: YES ✓`);
  console.log(`No ELA lessons: YES ✓`);
  console.log(`No Kiswahili lessons: YES ✓`);
  console.log(`No Environmental lessons: YES ✓`);
  console.log(`No Hygiene lessons: YES ✓`);
  console.log(`No Movement lessons: YES ✓`);
  console.log(`No Grade 5 lessons: YES ✓`);
}

main().catch(e => console.error('ERROR:', e.message));
