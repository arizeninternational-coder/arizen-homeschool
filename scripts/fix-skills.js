#!/usr/bin/env node
/**
 * Re-generate specific English lessons with the fixed skill detection.
 * Only affects lessons where skill type was misclassified.
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

const BATCH_ID = 'g2-english-v3-fix-' + Date.now();

async function main() {
  console.log('=== Re-generating misclassified English lessons ===\n');

  // Find all Grade 2 English lessons
  const { data: lessons } = await db.from('Lesson')
    .select('id, title, contentBlocks, orderIndex')
    .ilike('title', 'School:%')  // Focus on School theme for now
    .order('orderIndex');

  let fixed = 0, skipped = 0;

  for (const lesson of lessons || []) {
    let meta = {};
    try { meta = JSON.parse(lesson.contentBlocks || '{}'); } catch(e) {}

    const oldJourney = meta.studentJourney || meta.studentJourneyDraft || [];
    if (oldJourney.length === 0) { skipped++; continue; }

    // Check if the skill type in the old journey matches what we'd generate now
    const bp = engine.buildLessonBlueprint(lesson, meta);
    const newJourney = engine.buildJourneyFromBlueprint(bp);
    const validation = engine.validateJourney(newJourney, bp);

    // Check if the mission text changed (indicates skill type change)
    const oldMission = oldJourney[1]?.studentText || '';
    const newMission = newJourney[1]?.studentText || '';

    if (oldMission === newMission) {
      skipped++;
      continue;
    }

    console.log('FIXING: ' + lesson.title);
    console.log('  Old mission: ' + oldMission.substring(0, 80));
    console.log('  New mission: ' + newMission.substring(0, 80));
    console.log('  Skill: ' + bp.skillType);
    console.log('  Valid: ' + validation.valid);

    if (!validation.valid) {
      console.log('  ERRORS: ' + validation.errors.join('; '));
      skipped++;
      continue;
    }

    // Save the fixed journey
    const updatedMeta = {
      ...meta,
      studentJourneyDraft: newJourney,
      studentJourney: newJourney,
      aiMetadata: {
        ...(meta.aiMetadata || {}),
        batchId: BATCH_ID,
        generatedAt: new Date().toISOString(),
        engineVersion: 'v3-fix',
        validated: true,
      },
    };

    const { error } = await db.from('Lesson')
      .update({ contentBlocks: JSON.stringify(updatedMeta) })
      .eq('id', lesson.id);

    if (error) {
      console.log('  DB ERROR: ' + error.message);
    } else {
      fixed++;
      console.log('  SAVED');
    }
  }

  console.log('\n=== RESULTS ===');
  console.log('Fixed: ' + fixed);
  console.log('Skipped: ' + skipped);
}

main().catch(e => console.error(e));
