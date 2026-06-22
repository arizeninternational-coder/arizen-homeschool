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
  // Get the actual English theme
  const { data: engTheme } = await db.from('Theme').select('id, title').eq('grade', 2).ilike('title', '%Grade 2 English%');
  // Try exact match
  const { data: engTheme2 } = await db.from('Theme').select('id, title').eq('grade', 2).eq('slug', 'g2-english');
  console.log('English theme (ilike):', JSON.stringify(engTheme?.data?.[0]));
  console.log('English theme (slug):', JSON.stringify(engTheme2?.data?.[0]));

  const themeId = engTheme2?.data?.[0]?.id || engTheme?.data?.[0]?.id;
  if (!themeId) { console.log('NO ENGLISH THEME FOUND'); return; }

  const { data: quests } = await db.from('Quest').select('id, title').eq('themeId', themeId);
  const questIds = quests?.map(q => q.id) || [];
  console.log(`\nEnglish quests: ${quests?.length || 0}`);
  quests?.forEach(q => console.log(`  [${q.id}] ${q.title}`));

  if (questIds.length === 0) { console.log('No quests!'); return; }

  const { data: lessons } = await db.from('Lesson').select('id, title, contentBlocks, questId, orderIndex').in('questId', questIds).order('orderIndex');
  console.log(`\nEnglish lessons: ${lessons?.length || 0}`);

  let withJourney = 0, withDraft = 0, available = 0, unavailable = 0, empty = 0;
  const samples = [];
  for (const l of lessons || []) {
    try {
      const cb = JSON.parse(l.contentBlocks || '{}');
      if (cb.studentJourney && Array.isArray(cb.studentJourney) && cb.studentJourney.length > 0) withJourney++;
      if (cb.studentJourneyDraft && Array.isArray(cb.studentJourneyDraft) && cb.studentJourneyDraft.length > 0) withDraft++;
      if (cb.isAvailable === false) unavailable++; else available++;
      if (!cb.studentJourney?.length && !cb.studentJourneyDraft?.length) empty++;
      if (samples.length < 8) samples.push({
        title: l.title.substring(0, 55),
        j: cb.studentJourney?.length || 0,
        d: cb.studentJourneyDraft?.length || 0,
        avail: cb.isAvailable,
      });
    } catch(e) { empty++; }
  }
  console.log(`With published journey: ${withJourney} | With draft: ${withDraft}`);
  console.log(`Available: ${available} | Unavailable: ${unavailable} | Empty: ${empty}`);
  console.log('Samples:');
  samples.forEach(s => console.log(`  ${s.title} | j=${s.j} d=${s.d} avail=${s.avail}`));
}

main().catch(e => console.error('ERROR:', e.message));
