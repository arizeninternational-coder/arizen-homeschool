#!/usr/bin/env node
/** READ-ONLY: Find English lessons by checking contentBlocks structure */
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
  // Fetch lessons in batches to find English ones
  let allLessons = [];
  let offset = 0;
  const batchSize = 200;
  
  while (true) {
    const { data } = await db.from('Lesson').select('id,title,slug,status,isAvailable,contentBlocks').range(offset, offset + batchSize - 1);
    if (!data || data.length === 0) break;
    allLessons = allLessons.concat(data);
    offset += batchSize;
    if (data.length < batchSize) break;
  }
  
  console.log(`Total lessons fetched: ${allLessons.length}`);
  
  // Find English lessons
  const english = [];
  const sampleCB = [];
  for (const l of allLessons) {
    try {
      const cb = typeof l.contentBlocks === 'string' ? JSON.parse(l.contentBlocks) : l.contentBlocks;
      if (cb && (cb.subject === 'English Language Activities' || cb.subject === 'English' || cb.strand?.includes('Listening') || cb.strand?.includes('Speaking') || cb.strand?.includes('Reading') || cb.strand?.includes('Writing'))) {
        english.push({ ...l, _cb: cb });
      }
      // Collect samples of contentBlocks structure
      if (sampleCB.length < 3 && cb && Object.keys(cb).length > 0) {
        sampleCB.push({ title: l.title, keys: Object.keys(cb), subject: cb.subject, strand: cb.strand });
      }
    } catch { /* skip */ }
  }
  
  console.log(`\nEnglish lessons found: ${english.length}`);
  english.forEach(l => {
    const cb = l._cb;
    const hasApproved = Array.isArray(cb?.studentJourney) && cb.studentJourney.length > 0;
    const hasDraft = Array.isArray(cb?.studentJourneyDraft) && cb.studentJourneyDraft.length > 0;
    console.log(`  [${l.status}] avail=${l.isAvailable} approved=${hasApproved} draft=${hasDraft} | ${l.title} | strand=${cb.strand}`);
  });
  
  console.log('\nSample contentBlocks structures:');
  sampleCB.forEach(s => console.log(`  ${s.title}: keys=[${s.keys.join(', ')}] subject=${s.subject} strand=${s.strand}`));
}
main().catch(e => { console.error(e); process.exit(1); });
