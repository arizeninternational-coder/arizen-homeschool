#!/usr/bin/env node
/** READ-ONLY: Debug generator fetch - check if limit/RLS affects results */
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
  // Test 1: fetch with limit(200) like the generator does
  const { data: batch1 } = await db.from('Lesson').select('id,title,slug,contentBlocks').limit(200);
  console.log('First 200 lessons fetched:', batch1.length);
  
  // Count English in first 200
  let englishIn200 = 0;
  for (const l of batch1) {
    try {
      const cb = typeof l.contentBlocks === 'string' ? JSON.parse(l.contentBlocks) : l.contentBlocks;
      if (cb?.subject === 'English Language Activities') englishIn200++;
    } catch { /* skip */ }
  }
  console.log('English lessons in first 200:', englishIn200);
  
  // Test 2: fetch all with range
  let all = [];
  let offset = 0;
  while (true) {
    const { data } = await db.from('Lesson').select('id,title,slug,contentBlocks').range(offset, offset + 199);
    if (!data || data.length === 0) break;
    all = all.concat(data);
    offset += 200;
    if (data.length < 200) break;
  }
  console.log('Total lessons fetched with range:', all.length);
  
  let englishTotal = 0;
  for (const l of all) {
    try {
      const cb = typeof l.contentBlocks === 'string' ? JSON.parse(l.contentBlocks) : l.contentBlocks;
      if (cb?.subject === 'English Language Activities') englishTotal++;
    } catch { /* skip */ }
  }
  console.log('English lessons total:', englishTotal);
  
  // Test 3: fetch by specific slug
  const { data: specific } = await db.from('Lesson').select('id,title').eq('slug', 'following-simple-instructions');
  console.log('Specific slug fetch:', specific?.length || 0);
  
  // Test 4: check if status filter matters
  const { data: draftLessons } = await db.from('Lesson').select('id,title,status').eq('status', 'DRAFT').limit(10);
  console.log('DRAFT lessons (first 10):', draftLessons?.length || 0);
  if (draftLessons?.length > 0) {
    console.log('  Sample:', draftLessons[0].title, draftLessons[0].status);
  }
}
main().catch(e => { console.error(e); process.exit(1); });
