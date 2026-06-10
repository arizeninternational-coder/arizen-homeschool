#!/usr/bin/env node
/** READ-ONLY: Final count of all English lessons in DB */
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
  let all = [];
  let offset = 0;
  while (true) {
    const { data } = await db.from('Lesson').select('id,title,slug,status,isAvailable,contentBlocks').range(offset, offset + 199);
    if (!data || data.length === 0) break;
    all = all.concat(data);
    offset += 200;
    if (data.length < 200) break;
  }

  // Filter to English Language Activities (KICD CBC)
  const kicdEnglish = [];
  const otherEnglish = [];
  
  for (const l of all) {
    try {
      const cb = typeof l.contentBlocks === 'string' ? JSON.parse(l.contentBlocks) : l.contentBlocks;
      if (cb?.subject === 'English Language Activities') {
        kicdEnglish.push(l);
      } else if (cb?.subject?.toLowerCase().includes('english') || 
                 (cb?.strand && ['Listening','Speaking','Reading','Writing'].some(s => cb.strand.includes(s)))) {
        otherEnglish.push(l);
      }
    } catch { /* skip */ }
  }

  console.log('=== Database English Lessons ===');
  console.log('KICD CBC English Language Activities (subject):', kicdEnglish.length);
  console.log('Other English-related (strand-based):', otherEnglish.length);
  
  // Status breakdown for KICD
  const statusCounts = {};
  let withApproved = 0, withDraft = 0, withNone = 0;
  for (const l of kicdEnglish) {
    statusCounts[l.status] = (statusCounts[l.status] || 0) + 1;
    try {
      const cb = JSON.parse(l.contentBlocks);
      const hasApproved = Array.isArray(cb?.studentJourney) && cb.studentJourney.length > 0;
      const hasDraft = Array.isArray(cb?.studentJourneyDraft) && cb.studentJourneyDraft.length > 0;
      if (hasApproved) withApproved++;
      else if (hasDraft) withDraft++;
      else withNone++;
    } catch { withNone++; }
  }
  
  console.log('\nKICD English status breakdown:', statusCounts);
  console.log('With approved journey:', withApproved);
  console.log('With draft journey:', withDraft);
  console.log('With no journey:', withNone);
  
  // Show the other English lessons
  if (otherEnglish.length > 0) {
    console.log('\n=== Other English-related lessons (first 10) ===');
    otherEnglish.slice(0, 10).forEach(l => {
      try {
        const cb = JSON.parse(l.contentBlocks);
        console.log(`  [${l.status}] ${l.title} | subject=${cb?.subject} | strand=${cb?.strand}`);
      } catch { console.log(`  [${l.status}] ${l.title} | (no contentBlocks)`); }
    });
    if (otherEnglish.length > 10) console.log(`  ... and ${otherEnglish.length - 10} more`);
  }
}
main().catch(e => { console.error(e); process.exit(1); });
