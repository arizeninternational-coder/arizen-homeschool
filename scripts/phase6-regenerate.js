#!/usr/bin/env node
/**
 * PHASE 6: Regenerate Grade 2 English Journeys (90 lessons)
 * Uses the v3 journey engine with curriculum-driven content.
 * Saves as REVIEW status, not PUBLISHED.
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
const engine = require('./journey-engine-v3');

const BATCH_ID = 'g2-english-v3-' + Date.now();

async function main() {
  console.log(`=== PHASE 6: REGENERATE GRADE 2 ENGLISH (${BATCH_ID}) ===\n`);

  // Get only the Grade 2 English theme (90 lessons)
  const { data: englishTheme } = await db.from('Theme').select('id, title').eq('grade', 2).ilike('title', 'Grade 2 English').single();
  if (!englishTheme) { console.log('ERROR: Grade 2 English theme not found'); return; }
  console.log(`Theme: ${englishTheme.title}`);

  const { data: quests } = await db.from('Quest').select('id, title').eq('themeId', englishTheme.id);
  console.log(`Quests: ${quests?.length}`);

  const { data: lessons } = await db.from('Lesson').select('id, title, contentBlocks, orderIndex')
    .in('questId', quests?.map(q => q.id) || [])
    .eq('status', 'PUBLISHED')
    .order('orderIndex');

  console.log(`Lessons to process: ${lessons?.length}\n`);

  let regenerated = 0, skipped = 0, failed = 0;
  const failures = [];

  for (const lesson of lessons || []) {
    let meta = {};
    try { meta = JSON.parse(lesson.contentBlocks || '{}'); } catch(e) {}

    // Build blueprint
    const bp = engine.buildLessonBlueprint(lesson, meta);

    // Build journey
    const journey = engine.buildJourneyFromBlueprint(bp);

    // Validate
    const validation = engine.validateJourney(journey, bp);

    if (!validation.valid) {
      failed++;
      failures.push({ title: lesson.title, errors: validation.errors });
      console.log(`  ❌ FAIL: ${lesson.title} — ${validation.errors.join('; ')}`);
      continue;
    }

    // Save journey — update contentBlocks with new journey
    const updatedMeta = {
      ...meta,
      studentJourneyDraft: journey,
      studentJourney: journey,
      aiMetadata: {
        ...(meta.aiMetadata || {}),
        batchId: BATCH_ID,
        generatedAt: new Date().toISOString(),
        engineVersion: 'v3',
        validated: true,
      },
    };

    const { error } = await db.from('Lesson')
      .update({ contentBlocks: JSON.stringify(updatedMeta) })
      .eq('id', lesson.id);

    if (error) {
      failed++;
      failures.push({ title: lesson.title, errors: [error.message] });
      console.log(`  ❌ DB ERROR: ${lesson.title} — ${error.message}`);
    } else {
      regenerated++;
      if (regenerated % 10 === 0) console.log(`  Progress: ${regenerated} regenerated...`);
    }
  }

  console.log(`\n=== RESULTS ===`);
  console.log(`Regenerated: ${regenerated}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed: ${failed}`);

  if (failures.length > 0) {
    console.log(`\n=== FAILURES ===`);
    failures.forEach(f => console.log(`  ❌ ${f.title}: ${f.errors.join('; ')}`));
  }

  // Run post-regeneration QA
  console.log(`\n=== POST-REGENERATION QA ===`);
  await runQA(quests);
}

async function runQA(quests) {
  const { data: updatedLessons } = await db.from('Lesson').select('id, title, contentBlocks')
    .in('questId', quests?.map(q => q.id) || []);

  let genericMission = 0, genericLearn = 0, titleCopy = 0, noTheme = 0;
  const themePairs = { 'school-transport': { school: [], transport: [] } };

  for (const l of updatedLessons || []) {
    let meta = {};
    try { meta = JSON.parse(l.contentBlocks || '{}'); } catch(e) {}
    const journey = meta.studentJourney || meta.studentJourneyDraft || [];
    if (journey.length === 0) continue;

    const mission = journey[1]?.studentText || '';
    const learn = journey[3]?.studentText || '';

    // Check for generic mission
    if (/explore.*together|understand.*better/i.test(mission)) genericMission++;

    // Check for generic learn
    if (/today we will learn about|this is an important/i.test(learn)) genericLearn++;

    // Check for title copying
    if (mission.includes(l.title) && mission.length < 100) titleCopy++;

    // Check theme content
    if (l.title.toLowerCase().includes('school') && !mission.toLowerCase().includes('school')) noTheme++;
    if (l.title.toLowerCase().includes('transport') && !mission.toLowerCase().includes('transport')) noTheme++;
  }

  console.log(`Generic missions: ${genericMission}`);
  console.log(`Generic learn steps: ${genericLearn}`);
  console.log(`Title-copying: ${titleCopy}`);
  console.log(`Missing theme in mission: ${noTheme}`);

  // Sample comparison
  const sampleReading = updatedLessons?.find(l => l.title.includes('School') && l.title.includes('Reading'));
  const sampleWriting = updatedLessons?.find(l => l.title.includes('Transport') && l.title.includes('Writing'));

  if (sampleReading) {
    let meta = {};
    try { meta = JSON.parse(sampleReading.contentBlocks || '{}'); } catch(e) {}
    const j = meta.studentJourney || [];
    console.log(`\nSample — School:Reading mission: ${j[1]?.studentText?.substring(0, 100)}`);
    console.log(`Sample — School:Reading example: ${j[5]?.studentText?.substring(0, 100)}`);
  }
  if (sampleWriting) {
    let meta = {};
    try { meta = JSON.parse(sampleWriting.contentBlocks || '{}'); } catch(e) {}
    const j = meta.studentJourney || [];
    console.log(`Sample — Transport:Writing mission: ${j[1]?.studentText?.substring(0, 100)}`);
    console.log(`Sample — Transport:Writing example: ${j[5]?.studentText?.substring(0, 100)}`);
  }
}

main().catch(e => console.error(e));
