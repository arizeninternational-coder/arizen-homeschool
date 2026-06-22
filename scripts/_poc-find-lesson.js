#!/usr/bin/env node
/**
 * Look up the proof-of-concept lesson in the database.
 * Find "Introduction to Halves Using Rectangular Cut-outs"
 * or a safer alternative from the 7 correctly mapped Fractions lessons.
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
  // Look for the specific lesson
  const { data: lessons, error } = await db.from('Lesson')
    .select('id, title, contentBlocks')
    .ilike('title', '%halves%')
    .limit(10);

  if (error) { console.error('ERROR:', error.message); return; }

  console.log('=== Lessons with "halves" in title ===\n');
  for (const l of lessons || []) {
    let cb = {};
    try { cb = JSON.parse(l.contentBlocks || '{}'); } catch(e) {}
    console.log(`ID: ${l.id}`);
    console.log(`Title: ${l.title}`);
    console.log(`Strand: ${cb.strand}`);
    console.log(`Sub-strand: ${cb.subStrand}`);
    console.log(`isAvailable: ${cb.isAvailable}`);
    console.log(`Draft steps: ${(cb.studentJourneyDraft || []).length}`);
    console.log(`Published steps: ${(cb.studentJourney || []).length}`);
    console.log(`Batch ID: ${cb.aiMetadata?.batchId || 'none'}`);
    console.log(`Generator: ${cb.aiMetadata?.generator || 'none'}`);
    console.log(`Learning outcome: ${(cb.learningOutcome || '').substring(0, 150)}`);
    console.log(`Key inquiry: ${(cb.keyInquiryQuestion || '').substring(0, 150)}`);
    console.log(`Activity: ${(cb.activityInstructions || '').substring(0, 150)}`);
    console.log('---');
  }

  // Also show all 7 correctly mapped Fractions lessons
  const { data: allLessons } = await db.from('Lesson')
    .select('id, title, contentBlocks')
    .limit(1000);

  const fractions = (allLessons || []).filter(l => {
    try {
      const cb = JSON.parse(l.contentBlocks || '{}');
      return cb.subStrand === '1.3 Fractions' || cb.strand === '1.3 Fractions';
    } catch(e) { return false; }
  });

  console.log('\n=== All DB lessons with strand/subStrand = 1.3 Fractions ===\n');
  for (const l of fractions) {
    let cb = {};
    try { cb = JSON.parse(l.contentBlocks || '{}'); } catch(e) {}
    console.log(`ID: ${l.id}`);
    console.log(`Title: ${l.title}`);
    console.log(`Strand: ${cb.strand}`);
    console.log(`Sub-strand: ${cb.subStrand}`);
    console.log(`isAvailable: ${cb.isAvailable}`);
    console.log(`Draft steps: ${(cb.studentJourneyDraft || []).length}`);
    console.log(`Published steps: ${(cb.studentJourney || []).length}`);
    console.log('---');
  }
}

main().catch(e => console.error('ERROR:', e.message));
