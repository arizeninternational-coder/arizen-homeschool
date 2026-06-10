#!/usr/bin/env node
/**
 * READ-ONLY: Count Grade 2 English Language Activities coverage in DB.
 * No writes. No modifications. Pure inspection.
 */
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
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1);
  }
  envVars[key] = val;
});

const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function supa(method, path, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  try { return { status: res.status, data: JSON.parse(text) }; }
  catch { return { status: res.status, data: text }; }
}

async function main() {
  // 1. Fetch ALL lessons with contentBlocks
  const { status, data: lessons } = await supa('GET', 'Lesson?select=id,title,slug,status,isAvailable,contentBlocks,questId&limit=200');
  if (status >= 400) {
    console.error('ERROR fetching lessons:', status, JSON.stringify(lessons).substring(0, 500));
    process.exit(1);
  }

  // Filter to English Language Activities
  const englishLessons = [];
  for (const l of lessons) {
    try {
      const cb = typeof l.contentBlocks === 'string' ? JSON.parse(l.contentBlocks) : l.contentBlocks;
      if (cb && cb.subject === 'English Language Activities') {
        englishLessons.push({ ...l, _cb: cb });
      }
    } catch { /* skip */ }
  }

  // 2. Journey analysis
  let withApproved = 0;
  let withDraftOnly = 0;
  let withNoJourney = 0;

  for (const l of englishLessons) {
    const cb = l._cb;
    const hasApproved = Array.isArray(cb?.studentJourney) && cb.studentJourney.length > 0;
    const hasDraft = Array.isArray(cb?.studentJourneyDraft) && cb.studentJourneyDraft.length > 0;
    if (hasApproved) withApproved++;
    else if (hasDraft) withDraftOnly++;
    else withNoJourney++;
  }

  // 3. Status breakdown
  const statusCounts = {};
  for (const l of englishLessons) {
    statusCounts[l.status] = (statusCounts[l.status] || 0) + 1;
  }

  // 4. Availability
  const availableCount = englishLessons.filter(l => l.isAvailable === true).length;
  const unavailableCount = englishLessons.filter(l => l.isAvailable !== true).length;

  // 5. CSV comparison
  const csvPath = path.join(__dirname, '..', 'curriculum-shells', 'grade-2', 'english-language-activities-import.csv');
  let csvTitles = new Set();
  if (fs.existsSync(csvPath)) {
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n').filter(l => l.trim());
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const titleIdx = headers.indexOf('lessonTitle');
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
      if (cols[titleIdx]) csvTitles.add(cols[titleIdx]);
    }
  }

  const dbTitles = new Set(englishLessons.map(l => l.title));
  const inCsvNotInDb = [...csvTitles].filter(t => !dbTitles.has(t));
  const inDbNotInCsv = [...dbTitles].filter(t => !csvTitles.has(t));

  // ── Report ──
  console.log('═══════════════════════════════════════════════════');
  console.log('Grade 2 English Language Activities — DB Coverage');
  console.log('═══════════════════════════════════════════════════');
  console.log('');
  console.log(`1. Total English lesson shells in DB:    ${englishLessons.length}`);
  console.log(`2. With approved studentJourney:         ${withApproved}`);
  console.log(`3. With studentJourneyDraft only:        ${withDraftOnly}`);
  console.log(`4. With no journey at all:               ${withNoJourney}`);
  console.log('');
  console.log('5. Status breakdown:');
  for (const [s, c] of Object.entries(statusCounts)) {
    console.log(`   ${s}: ${c}`);
  }
  console.log('');
  console.log(`6. Available to students (isAvailable=true):   ${availableCount}`);
  console.log(`   Not available (isAvailable=false/null):    ${unavailableCount}`);
  console.log('');
  console.log(`7. CSV lessons NOT in DB: ${inCsvNotInDb.length}`);
  inCsvNotInDb.forEach(t => console.log(`   - ${t}`));
  console.log('');
  console.log(`8. DB lessons NOT in CSV: ${inDbNotInCsv.length}`);
  inDbNotInCsv.forEach(t => console.log(`   - ${t}`));
  console.log('');

  // Detailed lesson list
  console.log('── Detailed English Lessons ──');
  for (const l of englishLessons.sort((a, b) => a.title.localeCompare(b.title))) {
    const cb = l._cb;
    const hasApproved = Array.isArray(cb?.studentJourney) && cb.studentJourney.length > 0;
    const hasDraft = Array.isArray(cb?.studentJourneyDraft) && cb.studentJourneyDraft.length > 0;
    const journeyStatus = hasApproved ? 'APPROVED' : hasDraft ? 'DRAFT' : 'NONE';
    const strand = cb.strand || '?';
    console.log(`  [${l.status}] [${journeyStatus}] [avail=${l.isAvailable}] ${l.title} (strand: ${strand})`);
  }
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
