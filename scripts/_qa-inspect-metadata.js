#!/usr/bin/env node
/**
 * Read-only: Inspect aiMetadata structure for Math lessons
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

async function main() {
  // Fetch a few isAvailable=false lessons and inspect their contentBlocks structure
  const { data, error } = await db.from('Lesson')
    .select('id, title, contentBlocks')
    .eq('isAvailable', false)
    .limit(5);

  if (error) { console.error('ERROR:', error.message); return; }

  for (const l of data || []) {
    let cb = {};
    try { cb = JSON.parse(l.contentBlocks || '{}'); } catch(e) {}
    console.log(`\n${l.title}`);
    console.log(`  contentBlocks keys: ${Object.keys(cb).join(', ')}`);
    console.log(`  aiMetadata: ${JSON.stringify(cb.aiMetadata)}`);
    console.log(`  has studentJourneyDraft: ${!!cb.studentJourneyDraft}`);
    console.log(`  draft length: ${cb.studentJourneyDraft?.length || 0}`);
    console.log(`  isAvailable in contentBlocks: ${cb.isAvailable}`);
  }

  // Also try to find any lesson with 'g2-math' in contentBlocks
  const { data: data2 } = await db.from('Lesson')
    .select('id, title, contentBlocks')
    .limit(200);

  let mathCount = 0;
  for (const l of data2 || []) {
    try {
      const cb = JSON.parse(l.contentBlocks || '{}');
      const meta = JSON.stringify(cb.aiMetadata || {});
      if (meta.includes('g2-math') || meta.includes('math-hq')) {
        mathCount++;
        if (mathCount <= 3) {
          console.log(`\nFOUND MATH: ${l.title}`);
          console.log(`  aiMetadata: ${meta}`);
          console.log(`  draft steps: ${cb.studentJourneyDraft?.length || 0}`);
        }
      }
    } catch(e) {}
  }
  console.log(`\nTotal with g2-math in aiMetadata: ${mathCount}`);
}

main().catch(e => console.error('ERROR:', e.message));
