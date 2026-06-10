#!/usr/bin/env node
/** READ-ONLY: Debug - check what subjects exist in DB */
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
  // Check total lessons
  const { data: all, error } = await db.from('Lesson').select('id,title,slug,status,isAvailable').limit(5);
  if (error) { console.error('Error:', error); process.exit(1); }
  console.log('Total lessons returned:', all.length);
  console.log('First 5:');
  all.forEach(l => console.log(`  [${l.status}] ${l.title} (${l.slug})`));
  
  // Check if contentBlocks has subject
  const { data: withCB } = await db.from('Lesson').select('id,title,contentBlocks').limit(3);
  if (withCB && withCB.length > 0) {
    console.log('\ncontentBlocks samples:');
    withCB.forEach(l => {
      try {
        const cb = typeof l.contentBlocks === 'string' ? JSON.parse(l.contentBlocks) : l.contentBlocks;
        console.log(`  ${l.title}: subject=${cb?.subject}, strand=${cb?.strand}`);
      } catch { console.log(`  ${l.title}: parse error`); }
    });
  }
  
  // Count total
  const { count } = await db.from('Lesson').select('*', { count: 'exact', head: true });
  console.log(`\nTotal lesson count: ${count}`);
}
main().catch(e => { console.error(e); process.exit(1); });
