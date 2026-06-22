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
// Use service role key for admin reads, fall back to anon
const db = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function main() {
  // Get all Grade 2 themes
  const { data: allThemes } = await db.from('Theme').select('id, title, slug').eq('grade', 2).order('title');
  console.log('=== ALL GRADE 2 THEMES ===');
  allThemes?.forEach(t => console.log(`  [${t.id}] ${t.title} (${t.slug})`));

  // Find English and ELA themes
  const engThemeIds = allThemes?.filter(t => /english/i.test(t.title)).map(t => t.id) || [];
  console.log('\nEnglish theme IDs:', engThemeIds);

  // Count English lessons with journeys
  if (engThemeIds.length > 0) {
    const { data: engLessons } = await db.from('Lesson').select('id, title, contentBlocks, questId').in('themeId', engThemeIds).order('title');
    let engWithJourney = 0, engWithDraft = 0, engAvailable = 0, engUnavailable = 0;
    const engSamples = [];
    for (const l of engLessons || []) {
      try {
        const cb = JSON.parse(l.contentBlocks || '{}');
        if (cb.studentJourney && Array.isArray(cb.studentJourney) && cb.studentJourney.length > 0) engWithJourney++;
        if (cb.studentJourneyDraft && Array.isArray(cb.studentJourneyDraft) && cb.studentJourneyDraft.length > 0) engWithDraft++;
        if (cb.isAvailable === false) engUnavailable++; else engAvailable++;
        if (engSamples.length < 5) engSamples.push({ title: l.title.substring(0, 60), hasJourney: !!(cb.studentJourney?.length), hasDraft: !!(cb.studentJourneyDraft?.length), available: cb.isAvailable });
      } catch(e) {}
    }
    console.log(`\n=== ENGLISH LESSONS (${engLessons?.length || 0} total) ===`);
    console.log(`With published journey: ${engWithJourney}`);
    console.log(`With draft journey: ${engWithDraft}`);
    console.log(`Available: ${engAvailable} | Unavailable: ${engUnavailable}`);
    console.log('Samples:');
    engSamples.forEach(s => console.log(`  ${s.title} | journey=${s.hasJourney} draft=${s.hasDraft} avail=${s.available}`));
  }

  // Find Math theme
  const mathTheme = allThemes?.find(t => /math/i.test(t.title));
  if (mathTheme) {
    console.log(`\n=== MATH THEME: ${mathTheme.title} [${mathTheme.id}] ===`);
    const { data: mathLessons } = await db.from('Lesson').select('id, title, contentBlocks, questId').eq('themeId', mathTheme.id).order('title');
    let mathWithJourney = 0, mathWithDraft = 0, mathAvailable = 0, mathCleared = 0, mathEmpty = 0;
    const mathSamples = [];
    for (const l of mathLessons || []) {
      try {
        const cb = JSON.parse(l.contentBlocks || '{}');
        if (cb.aiMetadata?.cleared) mathCleared++;
        if (cb.studentJourney && Array.isArray(cb.studentJourney) && cb.studentJourney.length > 0) mathWithJourney++;
        if (cb.studentJourneyDraft && Array.isArray(cb.studentJourneyDraft) && cb.studentJourneyDraft.length > 0) mathWithDraft++;
        if (cb.isAvailable === false) mathEmpty++; else mathAvailable++;
        if (mathSamples.length < 8) mathSamples.push({ title: l.title.substring(0, 60), cleared: !!cb.aiMetadata?.cleared, hasJourney: !!(cb.studentJourney?.length), hasDraft: !!(cb.studentJourneyDraft?.length), available: cb.isAvailable });
      } catch(e) {}
    }
    console.log(`Total: ${mathLessons?.length || 0}`);
    console.log(`With published journey: ${mathWithJourney}`);
    console.log(`With draft journey: ${mathWithDraft}`);
    console.log(`Available: ${mathAvailable} | Cleared: ${mathCleared}`);
    console.log('Samples:');
    mathSamples.forEach(s => console.log(`  ${s.title} | cleared=${s.cleared} journey=${s.hasJourney} draft=${s.hasDraft} avail=${s.available}`));

    // Check quests for Math
    const { data: mathQuests } = await db.from('Quest').select('id, title').eq('themeId', mathTheme.id).order('title');
    console.log(`\nMath quests: ${mathQuests?.length || 0}`);
    mathQuests?.slice(0, 10).forEach(q => console.log(`  [${q.id}] ${q.title}`));
  } else {
    console.log('\n!!! NO MATH THEME FOUND !!!');
  }
}

main().catch(e => console.error('ERROR:', e.message));
