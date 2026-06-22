#!/usr/bin/env node
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
const db = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function main() {
  // Get all Grade 2 quests for English theme
  const { data: engTheme } = await db.from('Theme').select('id, title').eq('grade', 2).ilike('title', '%English%').neq('title', 'English Language Activities');
  const elaTheme = await db.from('Theme').select('id, title').eq('grade', 2).ilike('title', '%English Language Activities%');
  const mathTheme = await db.from('Theme').select('id, title').eq('grade', 2).ilike('title', '%Mathematics%');

  console.log('English theme:', engTheme?.data?.[0]?.title, engTheme?.data?.[0]?.id);
  console.log('ELA theme:', elaTheme?.data?.[0]?.title, elaTheme?.data?.[0]?.id);
  console.log('Math theme:', mathTheme?.data?.[0]?.id);

  // Get quests for each theme
  for (const themeData of [
    { name: 'English', theme: engTheme?.data?.[0] },
    { name: 'ELA', theme: elaTheme?.data?.[0] },
    { name: 'Math', theme: mathTheme?.data?.[0] },
  ]) {
    if (!themeData.theme) { console.log(`\n!!! NO ${themeData.name} THEME FOUND !!!`); continue; }
    const { data: quests } = await db.from('Quest').select('id, title').eq('themeId', themeData.theme.id);
    const questIds = quests?.map(q => q.id) || [];
    console.log(`\n=== ${themeData.name.toUpperCase()} (${themeData.theme.title}) ===`);
    console.log(`Quests: ${quests?.length || 0}`);
    quests?.forEach(q => console.log(`  [${q.id}] ${q.title}`));

    if (questIds.length === 0) { console.log('No quests found!'); continue; }

    // Get lessons via questId
    const { data: lessons } = await db.from('Lesson').select('id, title, contentBlocks, questId, orderIndex').in('questId', questIds).order('orderIndex');
    console.log(`Lessons: ${lessons?.length || 0}`);

    let withJourney = 0, withDraft = 0, available = 0, unavailable = 0, cleared = 0, empty = 0;
    const samples = [];
    for (const l of lessons || []) {
      try {
        const cb = JSON.parse(l.contentBlocks || '{}');
        if (cb.aiMetadata?.cleared) cleared++;
        if (cb.studentJourney && Array.isArray(cb.studentJourney) && cb.studentJourney.length > 0) withJourney++;
        if (cb.studentJourneyDraft && Array.isArray(cb.studentJourneyDraft) && cb.studentJourneyDraft.length > 0) withDraft++;
        if (cb.isAvailable === false) unavailable++; else available++;
        if (!cb.studentJourney?.length && !cb.studentJourneyDraft?.length) empty++;
        if (samples.length < 6) samples.push({
          title: l.title.substring(0, 55),
          questId: l.questId?.substring(0, 8),
          cleared: !!cb.aiMetadata?.cleared,
          j: cb.studentJourney?.length || 0,
          d: cb.studentJourneyDraft?.length || 0,
          avail: cb.isAvailable,
        });
      } catch(e) { empty++; }
    }
    console.log(`With published journey: ${withJourney} | With draft: ${withDraft}`);
    console.log(`Available: ${available} | Unavailable: ${unavailable} | Cleared: ${cleared} | Empty: ${empty}`);
    console.log('Samples:');
    samples.forEach(s => console.log(`  ${s.title} | q=${s.questId} | clr=${s.cleared} | j=${s.j} d=${s.d} | avail=${s.avail}`));

    // Also check: lessons that have NO questId at all (orphaned)
    if (themeData.name === 'Math') {
      const { data: orphanLessons } = await db.from('Lesson').select('id, title, questId').is('questId', null);
      if (orphanLessons?.length) {
        console.log(`\nOrphan lessons (no questId): ${orphanLessons.length}`);
        orphanLessons.slice(0, 5).forEach(l => console.log(`  ${l.title}`));
      }
    }
  }
}

main().catch(e => console.error('ERROR:', e.message));
