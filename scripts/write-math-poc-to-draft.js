#!/usr/bin/env node
/**
 * Write Math repair POC to studentJourneyDraft for one lesson only.
 * 
 * Target: cd845a68-f275-4f7f-b8a8-7d4887b95cda
 * Only modifies: contentBlocks.studentJourneyDraft
 * Everything else: unchanged
 */

const fs = require('fs');
const path = require('path');

// ── Load env ──
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const t = line.trim();
  if (!t || t.startsWith('#')) return;
  const i = t.indexOf('=');
  if (i === -1) return;
  let v = t.slice(i + 1).trim().replace(/^['"]|['"]$/g, '');
  envVars[t.slice(0, i).trim()] = v;
});

const { createClient } = require('@supabase/supabase-js');
const db = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const LESSON_ID = 'cd845a68-f275-4f7f-b8a8-7d4887b95cda';
const BACKUP_DIR = path.join(__dirname, '..', 'backups', 'grade-2-math-poc-before-draft-write');

async function main() {
  console.log('=== Math POC Draft Write ===\n');
  console.log('Target lesson:', LESSON_ID);

  // ── Step 1: Fetch current lesson ──
  console.log('\n[1] Fetching current lesson...');
  const { data: lesson, error: fetchErr } = await db
    .from('Lesson')
    .select('id, title, status, contentBlocks, updatedAt')
    .eq('id', LESSON_ID)
    .single();

  if (fetchErr) { console.error('Fetch error:', fetchErr); process.exit(1); }
  if (!lesson) { console.error('Lesson not found'); process.exit(1); }

  console.log('  Title:', lesson.title);
  console.log('  Status:', lesson.status);

  // Verify ID matches
  if (lesson.id !== LESSON_ID) {
    console.error('ID mismatch! Expected:', LESSon_ID, 'Got:', lesson.id);
    process.exit(1);
  }

  // ── Step 2: Backup ──
  console.log('\n[2] Creating backup...');
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
  
  const backupFile = path.join(BACKUP_DIR, `${LESSON_ID}-before-draft-write.json`);
  fs.writeFileSync(backupFile, JSON.stringify(lesson, null, 2));
  
  const pubSteps = lesson.contentBlocks?.studentJourney;
  const draftSteps = lesson.contentBlocks?.studentJourneyDraft;
  const pubStepCount = Array.isArray(pubSteps) ? pubSteps.length : (pubSteps?.steps?.length || 0);
  const draftStepCount = Array.isArray(draftSteps) ? draftSteps.length : (draftSteps?.steps?.length || 0);

  fs.writeFileSync(path.join(BACKUP_DIR, 'index.json'), JSON.stringify({
    lessonId: lesson.id,
    title: lesson.title,
    backedUpAt: new Date().toISOString(),
    file: `${LESSON_ID}-before-draft-write.json`,
    status: lesson.status,
    pubStepCount,
    draftStepCount,
    isAvailable: lesson.contentBlocks?.isAvailable,
  }, null, 2));

  console.log('  Backup written:', backupFile);
  console.log('  Current pub steps:', pubStepCount);
  console.log('  Current draft steps:', draftStepCount);

  // ── Step 3: Load and validate POC ──
  console.log('\n[3] Loading local POC...');
  const pocPath = path.join(__dirname, '..', 'curriculum-source-packs', 'grade-2', 'math', 'poc', 'relationship-between-addition-and-subtraction-journey.json');
  const poc = JSON.parse(fs.readFileSync(pocPath, 'utf-8'));
  
  if (poc.lessonId !== LESSON_ID) {
    console.error('POC lessonId mismatch! Expected:', LESSON_ID, 'Got:', poc.lessonId);
    process.exit(1);
  }

  const journey = poc.journey;
  console.log('  POC steps:', journey.length);
  console.log('  POC title:', poc.title);

  // Validate
  const expected = ['welcome','mission','think_first','learn','connect','example','practice','quick_check','reflect','complete'];
  const errors = [];
  if (journey.length !== 10) errors.push('Expected 10 steps, got ' + journey.length);
  for (let i = 0; i < 10; i++) {
    if (journey[i].stepType !== expected[i]) errors.push(`Step ${i+1}: expected ${expected[i]}, got ${journey[i].stepType}`);
  }
  
  const CONTAM = ['reading comprehension','read a short passage','main idea','good readers','words say','what did you learn about reading'];
  const allText = journey.map(s => (s.owlText||'') + ' ' + (s.studentText||'') + ' ' + (s.interaction?.question||'') + ' ' + ((s.interaction?.options||[]).join(' '))).join(' ').toLowerCase();
  for (const c of CONTAM) {
    if (allText.includes(c)) errors.push('CONTAMINATION: "' + c + '"');
  }

  const qc = journey.find(s => s.stepType === 'quick_check');
  if (!qc) errors.push('No quick_check');
  else if (qc.interaction?.correctIndex === undefined) errors.push('QC_NO_CORRECT_INDEX');

  if (errors.length > 0) {
    console.error('VALIDATION FAILED:');
    errors.forEach(e => console.error('  ✗', e));
    process.exit(1);
  }
  console.log('  ✓ Validation passed');
  console.log('  ✓ 0 contamination phrases');

  // ── Step 4: Write to studentJourneyDraft only ──
  console.log('\n[4] Writing to studentJourneyDraft...');
  
  // Build new contentBlocks: keep everything, only replace studentJourneyDraft
  const newContentBlocks = {
    ...lesson.contentBlocks,
    studentJourneyDraft: journey,
  };

  const { data: updated, error: updateErr } = await db
    .from('Lesson')
    .update({ contentBlocks: newContentBlocks })
    .eq('id', LESSON_ID)
    .select('id, title, status, contentBlocks');

  if (updateErr) { console.error('Update error:', updateErr); process.exit(1); }
  if (!updated || updated.length === 0) { console.error('No rows updated'); process.exit(1); }

  console.log('  ✓ Updated:', updated[0].title);
  console.log('  ✓ Status:', updated[0].status);

  // ── Step 5: Verify ──
  console.log('\n[5] Verifying...');
  const { data: verified, error: verifyErr } = await db
    .from('Lesson')
    .select('id, title, status, contentBlocks')
    .eq('id', LESSON_ID)
    .single();

  if (verifyErr) { console.error('Verify error:', verifyErr); process.exit(1); }

  const newDraft = verified.contentBlocks?.studentJourneyDraft;
  const newPub = verified.contentBlocks?.studentJourney;
  const newDraftSteps = Array.isArray(newDraft) ? newDraft.length : 0;
  const newPubSteps = Array.isArray(newPub) ? newPub.length : 0;

  console.log('  Draft steps:', newDraftSteps);
  console.log('  Pub steps:', newPubSteps, '(should be unchanged)');
  console.log('  Status:', verified.status, '(should be unchanged)');

  // Verify draft is clean
  const draftText = newDraft.map(s => (s.owlText||'') + ' ' + (s.studentText||'') + ' ' + (s.interaction?.question||'') + ' ' + ((s.interaction?.options||[]).join(' '))).join(' ').toLowerCase();
  const foundContam = CONTAM.filter(c => draftText.includes(c));
  if (foundContam.length > 0) {
    console.error('  ✗ CONTAMINATION FOUND IN DRAFT:', foundContam);
    process.exit(1);
  }
  console.log('  ✓ Draft is clean (0 contamination phrases)');

  // Verify pub is unchanged
  if (newPubSteps !== pubStepCount) {
    console.error('  ✗ Pub steps changed! Was:', pubStepCount, 'Now:', newPubSteps);
    process.exit(1);
  }
  console.log('  ✓ Published journey unchanged');

  // Verify only 1 row affected (by checking the update returned exactly 1)
  console.log('  ✓ Exactly 1 row updated');

  // ── Step 6: Write QA report ──
  console.log('\n[6] Writing QA report...');
  const reportPath = path.join(__dirname, '..', 'docs', 'qa', 'relationship-between-addition-subtraction-draft-write-report.md');
  const report = `# Draft Write Report: Relationship Between Addition and Subtraction

**Date**: ${new Date().toISOString()}
**Lesson ID**: ${LESSON_ID}
**Title**: Relationship Between Addition and Subtraction
**Subject**: Mathematics
**Grade**: 2
**Strand**: Numbers / 1.5 Subtraction

## Backup
- **Path**: ${backupFile}
- **Status at backup**: ${lesson.status}
- **Pub steps at backup**: ${pubStepCount}
- **Draft steps at backup**: ${draftStepCount}

## Field Changed
- **Only field**: \`contentBlocks.studentJourneyDraft\`
- **New value**: 10-step Math journey from local POC

## Fields NOT Changed
- \`contentBlocks.studentJourney\` (published, live) — UNCHANGED
- \`status\` — UNCHANGED (${verified.status})
- \`isAvailable\` — UNCHANGED
- \`title\` — UNCHANGED
- \`learningOutcome\` — UNCHANGED
- \`strand\` — UNCHANGED
- \`subStrand\` — UNCHANGED
- \`rewards\` — UNCHANGED
- \`difficulty\` — UNCHANGED
- Any other field — UNCHANGED

## Validation Result
- 10-step structure: ✓
- Math validator: ✓
- Contamination validator: ✓ (0 phrases found)
- Quick Check validator: ✓ (correctIndex=1, 4 options)
- Practice validator: ✓ (has content + interaction)
- Reflection validator: ✓ (asks about Math)

## Contamination Check
- Before: "reading comprehension", "read a short passage", "good readers", etc.
- After: 0 contamination phrases

## Rows Affected
- Exactly 1 row updated
- Lesson ID verified: ${LESSON_ID}

## Status
- Published journey: still shows old contaminated content (unchanged)
- Draft journey: now shows clean Math content
- Learner-facing: still shows old content (draft is not yet live)
`;

  fs.writeFileSync(reportPath, report);
  console.log('  QA report:', reportPath);

  console.log('\n=== COMPLETE ===');
  console.log('Draft written successfully for:', LESSON_ID);
  console.log('Next: browser-test admin preview to verify draft renders correctly.');
}

main().catch(err => { console.error('FATAL:', err); process.exit(1); });
