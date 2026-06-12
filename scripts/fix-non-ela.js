#!/usr/bin/env node
/**
 * Fix: Re-generate non-ELA lessons that were incorrectly regenerated.
 * Uses the v3 engine to generate correct content for each subject.
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

const BATCH_ID = 'g2-fix-non-ela-' + Date.now();

async function main() {
  console.log('=== Fixing non-ELA lessons incorrectly regenerated ===\n');

  // Get ELA quest IDs
  const { data: elaTheme } = await db.from('Theme').select('id').eq('grade', 2).ilike('title', '%English Language Activities%').single();
  const { data: elaQuests } = await db.from('Quest').select('id').eq('themeId', elaTheme?.id);
  const elaQuestIds = elaQuests?.map(q => q.id) || [];

  // Get all lessons with v3 ELA batch that are NOT ELA
  const { data: allLessons } = await db.from('Lesson').select('id, title, contentBlocks, questId').limit(2000);

  let fixed = 0, skipped = 0;

  for (const lesson of allLessons || []) {
    let meta = {};
    try { meta = JSON.parse(lesson.contentBlocks || '{}'); } catch(e) {}

    const batchId = meta.aiMetadata?.batchId || '';
    if (!batchId.includes('g2-ela-v3')) continue; // Not incorrectly regenerated
    if (elaQuestIds.includes(lesson.questId)) continue; // Skip actual ELA lessons

    // Re-generate with v3 engine (will use correct skill detection based on strand)
    const bp = engine.buildLessonBlueprint(lesson, meta);
    const journey = engine.buildJourneyFromBlueprint(bp);
    const validation = engine.validateJourney(journey, bp);

    if (!validation.valid) {
      skipped++;
      if (skipped <= 5) console.log('SKIP (invalid):', lesson.title, validation.errors.join('; '));
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
        engineVersion: 'v3-fix',
        validated: true,
      },
    };

    const { error } = await db.from('Lesson')
      .update({ contentBlocks: JSON.stringify(updatedMeta) })
      .eq('id', lesson.id);

    if (error) {
      console.log('ERROR:', lesson.title, error.message);
    } else {
      fixed++;
      if (fixed % 50 === 0) console.log('Fixed:', fixed);
    }
  }

  console.log(`\nFixed: ${fixed}, Skipped: ${skipped}`);
}

main().catch(e => console.error(e));
