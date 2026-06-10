#!/usr/bin/env node
/** Verify admin page field alignment for Grade 2 English (theme) lessons */
const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) return;
  const key = trimmed.slice(0, eqIdx).trim();
  let val = trimmed.slice(eqIdx + 1).trim();
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
  envVars[key] = val;
});
const { createClient } = require('@supabase/supabase-js');
const db = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function main() {
  // Simulate the exact admin curriculum lessons API query
  const { data: themes } = await db.from('Theme').select('id, title, slug').eq('slug', 'g2-english');
  if (!themes || !themes.length) { console.error('Theme not found'); process.exit(1); }
  const theme = themes[0];

  const { data: quests } = await db.from('Quest').select('id, title').eq('themeId', theme.id);
  if (!quests || !quests.length) { console.error('No quests'); process.exit(1); }

  let all = [], off = 0;
  while (true) {
    const { data } = await db.from('Lesson').select('*').in('questId', quests.map(q => q.id)).order('orderIndex').range(off, off + 199);
    if (!data || !data.length) break;
    all = all.concat(data); off += 200;
    if (data.length < 200) break;
  }

  // Check field alignment — same logic as the admin API route
  let withDraft = 0, withApproved = 0, withNone = 0;
  let genDraft = 0, genNotGenerated = 0;
  const statusCounts = {};
  let availTrue = 0, availFalse = 0;

  for (const l of all) {
    let meta = {};
    try { meta = JSON.parse(l.contentBlocks || '{}'); } catch {}

    const hasDraft = Array.isArray(meta.studentJourneyDraft) && meta.studentJourneyDraft.length > 0;
    const hasApproved = Array.isArray(meta.studentJourney) && meta.studentJourney.length > 0;
    if (hasApproved) withApproved++;
    else if (hasDraft) withDraft++;
    else withNone++;

    // Same logic as admin API route lines 110-117
    const aiMeta = meta.aiMetadata || {};
    const genStatus = aiMeta.reviewStatus
      ? (aiMeta.reviewStatus === 'NEEDS_REVIEW' ? 'Draft generated' : aiMeta.reviewStatus === 'APPROVED' ? 'Approved' : aiMeta.reviewStatus === 'REJECTED' ? 'Rejected' : 'Not generated')
      : (Array.isArray(meta.studentJourneyDraft) && meta.studentJourneyDraft.length > 0) ? 'Draft generated' : 'Not generated';
    if (genStatus === 'Draft generated') genDraft++;
    else genNotGenerated++;

    statusCounts[l.status] = (statusCounts[l.status] || 0) + 1;
    if (l.isAvailable === true) availTrue++;
    else availFalse++;
  }

  console.log('=== Admin Field Alignment Check ===');
  console.log('Total lessons:', all.length);
  console.log('Status breakdown:', statusCounts);
  console.log('isAvailable=true:', availTrue, '| isAvailable=false:', availFalse);
  console.log('With draft journey:', withDraft);
  console.log('With approved journey:', withApproved);
  console.log('With no journey:', withNone);
  console.log('generationStatus=Draft generated:', genDraft);
  console.log('generationStatus=Not generated:', genNotGenerated);

  // Check a sample lesson for exact field match
  const sample = all[0];
  const sampleMeta = JSON.parse(sample.contentBlocks || '{}');
  console.log('\n=== Sample Lesson Fields ===');
  console.log('Title:', sample.title);
  console.log('strand:', sampleMeta.strand);
  console.log('subStrand:', sampleMeta.subStrand);
  console.log('term:', sampleMeta.term);
  console.log('week:', sampleMeta.week);
  console.log('lessonOrder:', sampleMeta.lessonOrder);
  console.log('studentJourneyDraft steps:', (sampleMeta.studentJourneyDraft || []).length);
  console.log('aiMetadata:', JSON.stringify(sampleMeta.aiMetadata));

  // Check the hasDraftJourney flag (same as admin API readiness check)
  const { checkLessonReadiness } = await import('@/lib/curriculum/lesson-journey');
  const readiness = checkLessonReadiness(sampleMeta);
  console.log('\nReadiness check:');
  console.log('  hasDraftJourney:', readiness.hasDraftJourney);
  console.log('  hasApprovedJourney:', readiness.hasApprovedJourney);
  console.log('  score:', readiness.score);
}
main().catch(e => { console.error(e); process.exit(1); });
