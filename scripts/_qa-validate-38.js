#!/usr/bin/env node
/**
 * Read-only: Quick validate all 38 Math drafts after fixes.
 * Only checks critical fields. Minimal processing.
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

async function main() {
  // Fetch only what we need, filtered by lesson IDs we already know
  const IDS = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'docs', 'MATH_DRY_RUN_PUBLISH_REPORT.json'))).lessons.map(l => l.id);

  const { data, error } = await db.from('Lesson')
    .select('id, title, contentBlocks')
    .in('id', IDS);

  if (error) { console.error('ERROR:', error.message); return; }

  let issues = 0;
  const total = data?.length || 0;

  for (const lesson of data || []) {
    const cb = JSON.parse(lesson.contentBlocks || '{}');
    const draft = cb.studentJourneyDraft || [];
    const qc = draft.find(s => s.stepType === 'quick_check')?.interaction || {};
    const correctAns = qc.options?.[qc.correctIndex];
    const checks = [];

    if (cb.isAvailable !== false) checks.push('isAvailable!=false');
    if (draft.length !== 10) checks.push(`steps=${draft.length}`);
    if ((cb.studentJourney || []).length > 0) checks.push('publishedNotEmpty');
    if (!qc.question) checks.push('noQC');
    if (!correctAns) checks.push('noCorrectAnswer');

    // Multiplication specific
    const q = (qc.question || '').toLowerCase();
    if (q.includes('4 × 4') && correctAns !== '16') checks.push(`4×4=${correctAns}`);
    if (q.includes('6 × 10') && correctAns !== '60') checks.push(`6×10=${correctAns}`);
    if (q.includes('4 × 2') && correctAns !== '8') checks.push(`4×2=${correctAns}`);

    if (checks.length > 0) {
      issues++;
      console.log(`⚠️  ${lesson.title}: ${checks.join(', ')}`);
    }
  }

  console.log(`\nValidated: ${total} lessons, ${issues} with issues`);
  if (issues === 0) console.log('ALL 38 MATH DRAFTS CLEAN ✓');
}

main().catch(e => console.error('ERROR:', e.message));
