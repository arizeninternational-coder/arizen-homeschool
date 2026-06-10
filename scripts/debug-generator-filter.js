#!/usr/bin/env node
/** READ-ONLY: Debug why generator finds 0 lessons */
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
  // Get a known English lesson
  const { data } = await db.from('Lesson').select('id,title,slug,contentBlocks').eq('slug', 'following-simple-instructions').single();
  
  if (!data) { console.log('Lesson not found!'); return; }
  
  console.log('Lesson:', data.title);
  console.log('contentBlocks type:', typeof data.contentBlocks);
  
  let cb = data.contentBlocks;
  if (typeof cb === 'string') {
    console.log('Parsing string contentBlocks...');
    cb = JSON.parse(cb);
  }
  
  console.log('Parsed contentBlocks keys:', Object.keys(cb));
  console.log('subject:', JSON.stringify(cb.subject));
  console.log('subject === "English Language Activities":', cb.subject === 'English Language Activities');
  console.log('subject == "English Language Activities":', cb.subject == 'English Language Activities');
  console.log('subject type:', typeof cb.subject);
  console.log('subject length:', cb.subject?.length);
  console.log('subject char codes:', cb.subject ? [...cb.subject].map(c => c.charCodeAt(0)) : 'N/A');
  
  // Check if there are extra characters
  if (cb.subject) {
    console.log('subject trimmed:', JSON.stringify(cb.subject.trim()));
    console.log('subject trimmed === "English Language Activities":', cb.subject.trim() === 'English Language Activities');
  }
}
main().catch(e => { console.error(e); process.exit(1); });
