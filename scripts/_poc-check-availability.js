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
const db = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function main() {
  // Check both the column and the contentBlocks field
  const { data, error } = await db.from('Lesson')
    .select('id, title, "isAvailable", contentBlocks')
    .eq('id', '0767b9f0-4a75-4a27-b2a2-fa9833c8dae8')
    .single();
  if (error) { console.error('ERROR:', error.message); process.exit(1); }

  let cb = {};
  try { cb = JSON.parse(data.contentBlocks || '{}'); } catch(e) {}

  console.log('Top-level isAvailable:', data.isAvailable);
  console.log('contentBlocks.isAvailable:', cb.isAvailable);
  console.log('contentBlocks.studentJourney length:', cb.studentJourney?.length);
  console.log('contentBlocks.studentJourneyDraft length:', cb.studentJourneyDraft?.length);
  
  // Check a few other Fractions lessons to understand the pattern
  const { data: others } = await db.from('Lesson')
    .select('id, title, "isAvailable"')
    .eq('contentBlocks->>subStrand', '1.3 Fractions')
    .limit(5);
  
  console.log('\n=== Other Fractions lessons ===');
  for (const l of others || []) {
    console.log(`${l.title}: isAvailable=${l.isAvailable}`);
  }
}
main().catch(e => console.error('FATAL:', e.message));
