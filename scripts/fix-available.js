#!/usr/bin/env node
/** Fix isAvailable=false for all Grade 2 English theme lessons */
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
  const { data: themes } = await db.from('Theme').select('id').eq('slug', 'g2-english');
  if (!themes || !themes.length) { console.error('Theme not found'); process.exit(1); }
  const { data: quests } = await db.from('Quest').select('id').eq('themeId', themes[0].id);
  if (!quests || !quests.length) { console.error('No quests'); process.exit(1); }

  // Get all lesson IDs
  let allIds = [], off = 0;
  while (true) {
    const { data } = await db.from('Lesson').select('id, isAvailable').in('questId', quests.map(q => q.id)).range(off, off + 199);
    if (!data || !data.length) break;
    allIds = allIds.concat(data); off += 200;
    if (data.length < 200) break;
  }

  const toFix = allIds.filter(l => l.isAvailable === true).map(l => l.id);
  console.log('Lessons with isAvailable=true:', toFix.length);

  // Batch update
  const { error } = await db.from('Lesson').update({ isAvailable: false }).in('id', toFix);
  if (error) console.error('Error:', error.message);
  else console.log('Fixed: set isAvailable=false for', toFix.length, 'lessons');
}
main().catch(e => { console.error(e); process.exit(1); });
