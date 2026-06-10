#!/usr/bin/env node
/**
 * RECONCILIATION: Find all admin-visible Grade 2 English Language Activities shells
 * Uses the same query pattern as /api/admin/lessons
 */
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
  // EXACT same query as /api/admin/lessons API
  const { data: allLessons, error } = await db
    .from('Lesson')
    .select(`
      id,
      title,
      slug,
      description,
      status,
      orderIndex,
      createdAt,
      contentBlocks,
      quest:Quest(
        id,
        title,
        theme:Theme(
          id,
          title,
          grade
        )
      )
    `)
    .order('createdAt', { ascending: false })
    .limit(200);

  if (error) { console.error('Error:', error); process.exit(1); }

  console.log('Total lessons from API query:', allLessons.length);

  // Filter to Grade 2 (same as admin page: quest.theme.grade === 2)
  const grade2 = allLessons.filter(l => l.quest?.theme?.grade === 2);
  console.log('Grade 2 lessons:', grade2.length);

  // Filter to English Language Activities
  const englishG2 = grade2.filter(l => {
    try {
      const cb = typeof l.contentBlocks === 'string' ? JSON.parse(l.contentBlocks) : l.contentBlocks;
      return cb?.subject === 'English Language Activities';
    } catch { return false; }
  });

  console.log('Grade 2 English Language Activities:', englishG2.length);

  // Check journey status
  let withDraft = 0, withApproved = 0, withNone = 0;
  const statusCounts = {};
  let availableTrue = 0, availableFalse = 0;

  for (const l of englishG2) {
    statusCounts[l.status] = (statusCounts[l.status] || 0) + 1;
    if (l.isAvailable === true) availableTrue++;
    else availableFalse++;

    try {
      const cb = typeof l.contentBlocks === 'string' ? JSON.parse(l.contentBlocks) : l.contentBlocks;
      const hasDraft = Array.isArray(cb?.studentJourneyDraft) && cb.studentJourneyDraft.length > 0;
      const hasApproved = Array.isArray(cb?.studentJourney) && cb.studentJourney.length > 0;
      if (hasApproved) withApproved++;
      else if (hasDraft) withDraft++;
      else withNone++;
    } catch { withNone++; }
  }

  console.log('\n=== Status Breakdown ===');
  for (const [s, c] of Object.entries(statusCounts)) console.log(`  ${s}: ${c}`);
  console.log(`\nWith approved journey: ${withApproved}`);
  console.log(`With draft journey: ${withDraft}`);
  console.log(`With no journey: ${withNone}`);
  console.log(`isAvailable=true: ${availableTrue}`);
  console.log(`isAvailable=false: ${availableFalse}`);

  // List all 90 with details
  console.log('\n=== All Grade 2 English Language Activities ===');
  for (const l of englishG2.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))) {
    let journeyStatus = 'NONE';
    let term = '', week = '', strand = '';
    try {
      const cb = typeof l.contentBlocks === 'string' ? JSON.parse(l.contentBlocks) : l.contentBlocks;
      const hasDraft = Array.isArray(cb?.studentJourneyDraft) && cb.studentJourneyDraft.length > 0;
      const hasApproved = Array.isArray(cb?.studentJourney) && cb.studentJourney.length > 0;
      journeyStatus = hasApproved ? 'APPROVED' : hasDraft ? 'DRAFT' : 'NONE';
      term = cb?.term || '';
      week = cb?.week || '';
      strand = cb?.strand || '';
    } catch { /* skip */ }
    console.log(`  [${l.status}] [${journeyStatus}] [avail=${l.isAvailable}] ord=${l.orderIndex} | ${l.title} | ${term} | ${strand}`);
  }

  // Check for the 48 I generated vs the 90 total
  const withDraftIds = englishG2.filter(l => {
    try {
      const cb = typeof l.contentBlocks === 'string' ? JSON.parse(l.contentBlocks) : l.contentBlocks;
      return Array.isArray(cb?.studentJourneyDraft) && cb.studentJourneyDraft.length > 0;
    } catch { return false; }
  }).map(l => l.id);

  const withoutDraftIds = englishG2.filter(l => {
    try {
      const cb = typeof l.contentBlocks === 'string' ? JSON.parse(l.contentBlocks) : l.contentBlocks;
      const hasDraft = Array.isArray(cb?.studentJourneyDraft) && cb.studentJourneyDraft.length > 0;
      const hasApproved = Array.isArray(cb?.studentJourney) && cb.studentJourney.length > 0;
      return !hasDraft && !hasApproved;
    } catch { return true; }
  });

  console.log(`\n=== Without journey draft: ${withoutDraftIds.length} ===`);
  for (const l of withoutDraftIds) {
    let term = '', strand = '';
    try {
      const cb = JSON.parse(l.contentBlocks);
      term = cb?.term || '';
      strand = cb?.strand || '';
    } catch { /* skip */ }
    console.log(`  [${l.status}] ord=${l.orderIndex} | ${l.title} | ${term} | ${strand}`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
