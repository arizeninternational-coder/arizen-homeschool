#!/usr/bin/env node
/** Inspect the 11-step lesson */
const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) return;
  const key = trimmed.slice(0, eqIdx).trim();
  let val = trimmed.slice(eqIdx + 1).trim();
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
  envVars[key] = val;
});
const { createClient } = require('@supabase/supabase-js');
const db = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function main() {
  const { data } = await db.from('Lesson').select('id, title, contentBlocks').ilike('title', '%past continuous%');
  if (!data || !data.length) { console.log('Not found'); return; }
  for (const l of data) {
    const cb = JSON.parse(l.contentBlocks);
    const draft = cb.studentJourneyDraft || [];
    console.log(l.title + ' — ' + draft.length + ' steps:');
    draft.forEach((s, i) => console.log('  ' + i + ': ' + s.stepType + ' — ' + s.title));
  }
}
main().catch(e => { console.error(e); process.exit(1); });
