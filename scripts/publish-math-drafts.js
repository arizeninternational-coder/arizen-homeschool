#!/usr/bin/env node
/**
 * MATH DRAFT PUBLISH SCRIPT — DRY RUN
 * 
 * Publishes the 38 recovered Math drafts to studentJourney.
 * Sets isAvailable=true.
 * 
 * SAFETY: Only targets the exact 38 Math lesson IDs from the g2-math-hq batch.
 * No other lessons are touched.
 * 
 * Run with: node scripts/publish-math-drafts.js
 * Add --execute flag to actually publish (default is dry-run).
 */

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
  envVars[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^['"]|['"]$/g, '');
});
const { createClient } = require('@supabase/supabase-js');
const db = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// EXACT 38 Math lesson IDs from the g2-math-hq regeneration batch
const TARGET_IDS = [
  '78a3a720-af76-4c2e-8729-c5ef1421eded',
  '981b27eb-9d0d-4450-9bed-e76f1ba54c96',
  '5cea9ba8-0047-466b-a4eb-6c1e80b3c92a',
  'bc4a1378-6dff-4dd3-9fbb-0f5b7e9a631e',
  'd7cdedaa-4fc1-42fa-8f28-7aef3761a645',
  'a97ab36c-9ad2-428d-832f-e688bea73382',
  '04a80f76-bf67-4c8c-b3f0-183a3b205e16',
  '7e886e8a-9486-430f-b035-12909bd581a6',
  '239becec-4f84-4e38-8169-a0bc72730d5f',
  '853782ed-f7d2-4536-9665-cab6f525dbff',
  '74590ca5-c695-4bf2-a990-6be39c08285b',
  '71850381-f070-437f-8bec-8fec93d6f7cc',
  '22d83674-88b9-4431-ac3c-264ba5115764',
  '8019d7fd-a1a2-417d-9822-d70a676847d0',
  '957cb5fc-4055-47ea-844f-e83d520c34cc',
  '4b04cd35-ffa5-4ec2-8524-97bebd39238e',
  '0767b9f0-4a75-4a27-b2a2-fa9833c8dae8',
  '159f92b9-69c7-45ea-8376-2b15af491360',
  '9b887eb8-0a48-4f37-9689-b53113904728',
  '60441bd5-774f-4135-9871-666fc481b13b',
  'b163de06-c0e5-4a42-8bce-ba7dcab330a9',
  'dbadac3a-b59b-4f76-bebf-efda6fb3e261',
  '2f528f6b-b4c9-4120-a18e-9d86ea949d3e',
  '4fa40ac0-f60d-4f98-9d23-f85566b28af6',
  '5f1f7551-1c06-40d2-a10d-14cdece75151',
  '70fdce2b-3284-4c89-8497-036aee7d9207',
  'f58faf50-97f7-4340-b17f-9eff6f08e38d',
  'b546d836-3292-48a1-b445-134e85b30e20',
  '17d7857a-a622-4b09-8524-db7be78977f8',
  '11d88b45-b1a6-4143-9c04-42e88e57d080',
  'bec50c90-2129-4275-8cdb-abb06296e4cf',
  'e20dbfd4-eba4-402d-8743-8e24e00475a2',
  '66cdd3b3-858d-4be2-a451-b2f2340bc852',
  'b0c38507-b852-4a4c-8767-c0234ef9b89c',
  'f3e92483-c349-4553-ba43-fd277cf2be73',
  'cff3b7c1-2468-454d-b2da-fe35d49e2456',
  '938a3ed5-06ab-430b-a345-b933cce98a68',
  '2afb0a5b-88e3-4c8e-9ccb-844064b1bd3f',
];

const DRY_RUN = !process.argv.includes('--execute');

async function main() {
  console.log(`=== MATH DRAFT PUBLISH (${DRY_RUN ? 'DRY RUN' : 'LIVE'}) ===\n`);
  console.log(`Target: ${TARGET_IDS.length} Math lessons\n`);

  // Fetch current state
  const { data: lessons } = await db.from('Lesson')
    .select('id, title, contentBlocks')
    .in('id', TARGET_IDS);

  if (!lessons || lessons.length !== TARGET_IDS.length) {
    console.log(`ERROR: Expected ${TARGET_IDS.length} lessons, found ${lessons?.length || 0}`);
    process.exit(1);
  }

  let ready = 0, skip = 0;

  for (const l of lessons) {
    let cb = {};
    try { cb = JSON.parse(l.contentBlocks || '{}'); } catch(e) {}

    const draft = cb.studentJourneyDraft;
    const hasDraft = draft && Array.isArray(draft) && draft.length === 10;
    const isMath = cb.aiMetadata?.batchId?.includes('g2-math-hq');

    if (!hasDraft) {
      console.log(`SKIP (no valid draft): ${l.title}`);
      skip++;
      continue;
    }
    if (!isMath) {
      console.log(`SKIP (not Math batch): ${l.title}`);
      skip++;
      continue;
    }

    ready++;

    if (DRY_RUN) {
      console.log(`[DRY-RUN] Would publish: ${l.title}`);
      console.log(`  - Copy draft (${draft.length} steps) → studentJourney`);
      console.log(`  - Set isAvailable = true`);
      console.log(`  - Keep draft intact`);
    } else {
      // LIVE PUBLISH
      const updatedCb = {
        ...cb,
        studentJourney: draft,
        isAvailable: true,
        aiMetadata: {
          ...cb.aiMetadata,
          publishedAt: new Date().toISOString(),
          publishedFromDraft: true,
        }
      };

      const { error } = await db.from('Lesson')
        .update({ contentBlocks: JSON.stringify(updatedCb) })
        .eq('id', l.id);

      if (error) {
        console.log(`FAIL: ${l.title} — ${error.message}`);
      } else {
        console.log(`PUBLISHED: ${l.title}`);
      }
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Ready: ${ready} | Skipped: ${skip}`);
  if (DRY_RUN) {
    console.log(`\nThis was a DRY RUN. No changes were made.`);
    console.log(`Run with --execute to publish.`);
  }
}

main().catch(e => console.error('FATAL:', e.message));
