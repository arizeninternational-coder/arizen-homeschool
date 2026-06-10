#!/usr/bin/env node
/**
 * FIX: Set all KICD English lessons to DRAFT + isAvailable=false.
 * These were imported with PUBLISHED status by the old script.
 * Lessons should NOT be visible to students until journeys are approved.
 *
 * ONLY touches lessons with subject='English Language Activities' that have NO approved journey.
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
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
  envVars[key] = val;
});
const { createClient } = require('@supabase/supabase-js');
const db = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function main() {
  // Fetch all lessons
  let allLessons = [];
  let offset = 0;
  while (true) {
    const { data } = await db.from('Lesson').select('id,title,slug,status,isAvailable,contentBlocks').range(offset, offset + 199);
    if (!data || data.length === 0) break;
    allLessons = allLessons.concat(data);
    offset += 200;
    if (data.length < 200) break;
  }

  // Filter to KICD English lessons (subject=English Language Activities, no approved journey)
  const toFix = [];
  for (const l of allLessons) {
    try {
      const cb = typeof l.contentBlocks === 'string' ? JSON.parse(l.contentBlocks) : l.contentBlocks;
      if (cb?.subject !== 'English Language Activities') continue;
      const hasApproved = Array.isArray(cb?.studentJourney) && cb.studentJourney.length > 0;
      if (hasApproved) continue; // Don't touch lessons with approved journeys
      if (l.status !== 'DRAFT' || l.isAvailable !== false) {
        toFix.push(l);
      }
    } catch { /* skip */ }
  }

  console.log(`Found ${toFix.length} English lessons needing status fix (PUBLISHED→DRAFT, isAvailable→false)`);

  let fixed = 0, errors = 0;
  for (const l of toFix) {
    const { error } = await db.from('Lesson').update({ status: 'DRAFT', isAvailable: false }).eq('id', l.id);
    if (error) {
      console.error(`  ERROR: ${l.title} — ${error.message}`);
      errors++;
    } else {
      console.log(`  FIXED: ${l.title} → DRAFT + isAvailable=false`);
      fixed++;
    }
  }

  console.log(`\nFixed: ${fixed}, Errors: ${errors}`);
}

main().catch(e => { console.error(e); process.exit(1); });
