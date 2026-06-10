#!/usr/bin/env node
/** Spot-check a few journeys for child-friendly text */
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
  const k = t.slice(0, i).trim();
  let v = t.slice(i + 1).trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
  envVars[k] = v;
});
const { createClient } = require('@supabase/supabase-js');
const db = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function main() {
  const titles = [
    'School: Listening for Key Ideas',
    'Transport: Object pronouns: him, her, them, you, us, me',
    'Accidents: Past continuous tense',
    'Classroom: Cardinal and ordinal numbers',
    'The Garden: Present continuous tense',
  ];

  for (const title of titles) {
    const { data } = await db.from('Lesson').select('title, contentBlocks').ilike('title', '%' + title.split(':')[0] + '%').limit(1);
    if (!data || !data.length) { console.log('Not found:', title); continue; }
    const l = data[0];
    const cb = JSON.parse(l.contentBlocks);
    const draft = cb.studentJourneyDraft || [];
    console.log('\n=== ' + l.title + ' ===');
    if (draft[0]) console.log('Welcome student:', draft[0].studentText);
    if (draft[0]) console.log('Welcome owl:', draft[0].owlText);
    if (draft[2]) console.log('Think first student:', draft[2].studentText);
    if (draft[7]) {
      console.log('QC question:', draft[7].interaction?.question);
    }
  }
}
main().catch(e => { console.error(e); process.exit(1); });
