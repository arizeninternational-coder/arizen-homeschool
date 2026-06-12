#!/usr/bin/env node
/**
 * PHASE 8d: Regenerate all 48 English Language Activities journeys
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
const engine = require('./journey-engine-v3.js');

const BATCH_ID = 'g2-ela-v3-' + Date.now();

async function main() {
  console.log(`=== PHASE 8d: Regenerate ELA (${BATCH_ID}) ===\n`);

  // Get all 48 ELA lessons
  const { data: lessons } = await db.from('Lesson')
    .select('id, title, contentBlocks, orderIndex')
    .ilike('title', '%')  // All lessons under ELA quests
    .order('orderIndex');

  // Filter to only ELA lessons (those with specific ELA-style titles)
  const elaLessons = lessons?.filter(l => {
    const t = l.title.toLowerCase();
    return !t.includes(':');  // ELA lessons don't have "Theme: Skill" pattern
  }) || [];

  console.log(`Total ELA lessons: ${elaLessons.length}\n`);

  let regenerated = 0, skipped = 0, failed = 0;
  const failures = [];

  for (const lesson of elaLessons) {
    let meta = {};
    try { meta = JSON.parse(lesson.contentBlocks || '{}'); } catch(e) {}

    const bp = engine.buildLessonBlueprint(lesson, meta);
    const journey = engine.buildJourneyFromBlueprint(bp);
    const validation = engine.validateJourney(journey, bp);

    if (!validation.valid) {
      failed++;
      failures.push({ title: lesson.title, errors: validation.errors });
      console.log(`  ❌ FAIL: ${lesson.title} — ${validation.errors.join('; ')}`);
      continue;
    }

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
}

main().catch(e => console.error(e));
