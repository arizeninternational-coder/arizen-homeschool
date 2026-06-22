#!/usr/bin/env node
/**
 * STEP 3: Validate the 10 weak-QC fixes
 * Read-only. Confirms each lesson now has a proper Math-specific Quick Check.
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

const WEAK_QC_IDS = [
  '0767b9f0-4a75-4a27-b2a2-fa9833c8dae8',
  '159f92b9-69c7-45ea-8376-2b15af491360',
  '9b887eb8-0a48-4f37-9689-b53113904728',
  '60441bd5-774f-4135-9871-666fc481b13b',
  'b163de06-c0e5-4a42-8bce-ba7dcab330a9',
  'dbadac3a-b59b-4f76-bebf-efda6fb3e261',
  'b546d836-3292-48a1-b445-134e85b30e20',
  '17d7857a-a622-4b09-8524-db7be78977f8',
  'b0c38507-b852-4a4c-8767-c0234ef9b89c',
];

async function main() {
  console.log('=== STEP 3: VALIDATE 9 FIXED LESSONS ===\n');

  const { data: lessons, error } = await db.from('Lesson')
    .select('id, title, contentBlocks')
    .in('id', WEAK_QC_IDS);

  if (error) { console.error('ERROR:', error.message); return; }

  let allPass = true;
  for (const lesson of lessons || []) {
    let cb = {};
    try { cb = JSON.parse(lesson.contentBlocks || '{}'); } catch(e) {}

    const draft = cb.studentJourneyDraft;
    const qcStep = draft?.find(s => s.stepType === 'quick_check');
    const qc = qcStep?.interaction || {};

    const isAvailable = cb.isAvailable;
    const oldJourneyLen = cb.studentJourney?.length || 0;
    const draftLen = draft?.length || 0;

    // Check for old bad patterns
    const q = (qc.question || '').toLowerCase();
    const hasNegativeSubtraction = /12\s*-\s*17/.test(q);
    const hasGenericAddition = /12\s*\+\s*13/.test(q);
    const hasPlaceValue = /what does the 6 represent/.test(q);
    const hasTime = /short hand.*long hand|what time/.test(q);
    const hasCounting = /what number comes after 49/.test(q);
    const isFractions = lesson.title.toLowerCase().includes('fraction') || lesson.title.toLowerCase().includes('half') || lesson.title.toLowerCase().includes('quarter');
    const isSubtraction = lesson.title.toLowerCase().includes('subtract');
    const isMultiplication = lesson.title.toLowerCase().includes('multiplication');

    let issues = [];
    if (hasNegativeSubtraction) issues.push('NEGATIVE_SUBTRACTION');
    if (hasGenericAddition && isFractions) issues.push('GENERIC_ADDITION_ON_FRACTIONS');
    if (hasPlaceValue && isFractions) issues.push('PLACE_VALUE_ON_FRACTIONS');
    if (hasTime && isFractions) issues.push('TIME_ON_FRACTIONS');
    if (hasCounting && isMultiplication) issues.push('COUNTING_ON_MULTIPLICATION');
    if (isAvailable !== false) issues.push('IS_AVAILABLE_NOT_FALSE');
    if (oldJourneyLen > 0) issues.push('OLD_JOURNEY_NOT_EMPTY');
    if (draftLen !== 10) issues.push(`DRAFT_STEPS=${draftLen}`);

    const status = issues.length === 0 ? '✅ PASS' : '❌ FAIL';
    if (issues.length > 0) allPass = false;

    console.log(`${status}: ${lesson.title}`);
    console.log(`   QC: "${qc.question}"`);
    console.log(`   Options: ${JSON.stringify(qc.options)}`);
    console.log(`   Correct: ${qc.correctIndex}`);
    console.log(`   isAvailable: ${isAvailable} | draftSteps: ${draftLen} | oldJourney: ${oldJourneyLen}`);
    if (issues.length > 0) console.log(`   ISSUES: ${issues.join(', ')}`);
    console.log();
  }

  console.log(`\n=== OVERALL: ${allPass ? 'ALL PASS ✓' : 'SOME FAILED ✗'} ===`);
}

main().catch(e => console.error('ERROR:', e.message));
