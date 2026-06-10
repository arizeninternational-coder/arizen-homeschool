#!/usr/bin/env node
/** READ-ONLY: Verify English lesson state after import */
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
  const { data: lessons } = await db.from('Lesson').select('id,title,slug,status,isAvailable,contentBlocks').limit(200);
  const english = lessons.filter(l => {
    try { const cb = typeof l.contentBlocks === 'string' ? JSON.parse(l.contentBlocks) : l.contentBlocks; return cb?.subject === 'English Language Activities'; } catch { return false; }
  });

  console.log(`Total English lessons: ${english.length}`);
  
  const statusCounts = {};
  let available = 0, unavailable = 0;
  let withApproved = 0, withDraft = 0, withNone = 0;
  
  for (const l of english) {
    statusCounts[l.status] = (statusCounts[l.status] || 0) + 1;
    if (l.isAvailable === true) available++; else unavailable++;
    try {
      const cb = typeof l.contentBlocks === 'string' ? JSON.parse(l.contentBlocks) : l.contentBlocks;
      const hasApproved = Array.isArray(cb?.studentJourney) && cb.studentJourney.length > 0;
      const hasDraft = Array.isArray(cb?.studentJourneyDraft) && cb.studentJourneyDraft.length > 0;
      if (hasApproved) withApproved++; else if (hasDraft) withDraft++; else withNone++;
    } catch { withNone++; }
  }
  
  console.log('Status breakdown:', statusCounts);
  console.log(`Available: ${available}, Not available: ${unavailable}`);
  console.log(`With approved journey: ${withApproved}`);
  console.log(`With draft journey: ${withDraft}`);
  console.log(`With no journey: ${withNone}`);
  
  // Show first 5 lessons
  console.log('\nFirst 5 lessons:');
  english.slice(0, 5).forEach(l => {
    const cb = typeof l.contentBlocks === 'string' ? JSON.parse(l.contentBlocks) : l.contentBlocks;
    const hasDraft = Array.isArray(cb?.studentJourneyDraft) && cb.studentJourneyDraft.length > 0;
    console.log(`  [${l.status}] avail=${l.isAvailable} draft=${hasDraft} | ${l.title}`);
  });
}
main().catch(e => { console.error(e); process.exit(1); });
