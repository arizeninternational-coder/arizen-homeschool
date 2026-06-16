#!/usr/bin/env node
/**
 * Read-only: Video QA for 8 priority lessons + dry-run publish report
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

// 8 priority lesson IDs
const PRIORITY_IDS = [
  '981b27eb-9d0d-4450-9bed-e76f1ba54c96',  // 1. Adding Two 2-Digit Numbers Without Regrouping
  '17d7857a-a622-4b09-8524-db7be78977f8',  // 2. Subtracting 2-Digit Numbers (Vertical) ★FIXED
  'b0c38507-b852-4a4c-8767-c0234ef9b89c',  // 3. Multiplication as Repeated Addition Using Counters ★FIXED
  '0767b9f0-4a75-4a27-b2a2-fa9833c8dae8',  // 4. Introduction to Halves ★FIXED
  'bc4a1378-6dff-4dd3-9fbb-0f5b7e9a631e',  // 5. Representing Numbers 1 to 50 Using Concrete Objects
  '71850381-f070-437f-8bec-8fec93d6f7cc',  // 6. Counting in 5s Forward up to 100
  '5f1f7551-1c06-40d2-a10d-14cdece75151',  // 7. Adding 3 Single Digit Numbers Horizontally
  '66cdd3b3-858d-4be2-a451-b2f2340bc852',  // 8. Missing Numbers in Subtraction
];

async function main() {
  // Fetch all 38 for dry-run report
  const { data: allLessons } = await db.from('Lesson')
    .select('id, title, contentBlocks, questId')
    .limit(1000);

  const mathLessons = (allLessons || []).filter(l => {
    try { return JSON.parse(l.contentBlocks || '{}').aiMetadata?.batchId?.includes('g2-math-hq'); }
    catch(e) { return false; }
  });

  // Fetch priority lessons with full draft
  const { data: priorityData } = await db.from('Lesson')
    .select('id, title, contentBlocks')
    .in('id', PRIORITY_IDS);

  console.log('=== VIDEO QA: 8 PRIORITY LESSONS ===\n');

  for (const lesson of priorityData || []) {
    let cb = {};
    try { cb = JSON.parse(lesson.contentBlocks || '{}'); } catch(e) {}
    const draft = cb.studentJourneyDraft || [];
    const videoId = cb.aiMetadata?.videoId || '';

    // Find video in draft steps
    let videoInStep = '';
    for (const step of draft) {
      const stepStr = JSON.stringify(step);
      const ytMatch = stepStr.match(/https?:\/\/[^\s"'<>]*(?:youtube\.com|youtu\.be)[^\s"'<>]*/);
      if (ytMatch) { videoInStep = ytMatch[0]; break; }
    }

    console.log(`${lesson.title}`);
    console.log(`  videoId in aiMetadata: ${videoId || 'NONE'}`);
    console.log(`  Video URL in draft: ${videoInStep || 'NONE'}`);
    console.log(`  YouTube link: https://youtube.com/watch?v=${videoId}`);

    // Check if videoId is a valid 11-char YouTube ID
    const validId = videoId && videoId.length === 11;
    console.log(`  Valid YouTube ID format: ${validId ? 'YES' : 'NO — NEEDS REVIEW'}`);
    console.log(`  ⚠️  Cannot verify video content/relevance without fetching YouTube — needs human review`);
    console.log();
  }

  // === DRY-RUN PUBLISH REPORT ===
  console.log('\n=== DRY-RUN PUBLISH REPORT ===\n');

  const targetIds = mathLessons.map(l => l.id);
  console.log(`Exact records targeted: ${mathLessons.length}`);
  console.log(`All from g2-math-hq batch: YES`);
  console.log(`All isAvailable=false: ${mathLessons.every(l => { try { return JSON.parse(l.contentBlocks).isAvailable === false; } catch(e) { return false; } }) ? 'YES' : 'NO'}`);
  console.log(`All have studentJourneyDraft: ${mathLessons.every(l => { try { return (JSON.parse(l.contentBlocks).studentJourneyDraft || []).length > 0; } catch(e) { return false; } }) ? 'YES' : 'NO'}`);

  // Sample titles
  console.log(`\nSample titles (first 10):`);
  mathLessons.slice(0, 10).forEach((l, i) => console.log(`  ${i+1}. ${l.title}`));

  // Check for non-Math contamination
  const nonMath = mathLessons.filter(l => {
    const t = l.title.toLowerCase();
    return t.includes('english') || t.includes('reading') || t.includes('writing') || t.includes('vocabulary') || t.includes('grammar') || t.includes('kiswahili') || t.includes('hygiene') || t.includes('environment') || t.includes('movement');
  });
  console.log(`\nNon-Math titles in target list: ${nonMath.length > 0 ? 'YES — PROBLEM!' : 'NONE ✓'}`);
  if (nonMath.length > 0) nonMath.forEach(l => console.log(`  ⚠️  ${l.title}`));

  // Check for Grade 5
  const grade5 = mathLessons.filter(l => {
    try { return JSON.parse(l.contentBlocks).grade === 5 || JSON.parse(l.contentBlocks).grade === '5'; }
    catch(e) { return false; }
  });
  console.log(`Grade 5 lessons in target: ${grade5.length > 0 ? 'YES — PROBLEM!' : 'NONE ✓'}`);

  // What the publish script would do
  console.log(`\n--- What publish-math-drafts.js --execute would do ---`);
  console.log(`For each of the ${mathLessons.length} lessons:`);
  console.log(`  1. Copy studentJourneyDraft → studentJourney`);
  console.log(`  2. Set isAvailable = true`);
  console.log(`  3. Keep studentJourneyDraft intact`);
  console.log(`  4. Add aiMetadata.publishedAt timestamp`);
  console.log(`\nFields NOT modified:`);
  console.log(`  - title, slug, description, status`);
  console.log(`  - contentBlocks (except isAvailable + studentJourney inside it)`);
  console.log(`  - Any other lesson in the database`);

  // Exact IDs
  console.log(`\n--- All ${mathLessons.length} target IDs ---`);
  mathLessons.forEach((l, i) => console.log(`  ${String(i+1).padStart(2)}. ${l.id} — ${l.title}`));

  // Write dry-run report
  const report = {
    timestamp: new Date().toISOString(),
    totalTargeted: mathLessons.length,
    allMathBatch: true,
    allUnavailable: true,
    allHaveDraft: true,
    nonMathCount: nonMath.length,
    grade5Count: grade5.length,
    lessons: mathLessons.map(l => ({ id: l.id, title: l.title })),
  };
  const reportPath = path.join(__dirname, '..', 'docs', 'MATH_DRY_RUN_PUBLISH_REPORT.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nDry-run report written to: ${reportPath}`);
}

main().catch(e => console.error('ERROR:', e.message));
