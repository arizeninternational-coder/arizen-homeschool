#!/usr/bin/env node
/**
 * Read-only: Build video review table for all 38 Math lessons.
 * Groups by video ID to show reuse across lessons.
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

async function main() {
  const { data: allLessons } = await db.from('Lesson')
    .select('id, title, contentBlocks')
    .limit(1000);

  const mathLessons = (allLessons || []).filter(l => {
    try { return JSON.parse(l.contentBlocks || '{}').aiMetadata?.batchId?.includes('g2-math-hq'); }
    catch(e) { return false; }
  });

  // Collect video IDs per lesson
  const videoMap = {}; // videoId -> [{title, id, strand}]

  for (const lesson of mathLessons) {
    let cb = {};
    try { cb = JSON.parse(lesson.contentBlocks || '{}'); } catch(e) {}
    const videoId = cb.aiMetadata?.videoId || '';
    if (!videoId) continue;

    const tl = lesson.title.toLowerCase();
    let strand = 'Other';
    if (tl.includes('fraction') || tl.includes('half') || tl.includes('quarter')) strand = 'Fractions';
    else if (tl.includes('subtract')) strand = 'Subtraction';
    else if (tl.includes('add') || tl.includes('addition')) strand = 'Addition';
    else if (tl.includes('multiply') || tl.includes('multiplication') || tl.includes('repeated addition')) strand = 'Multiplication';
    else if (tl.includes('count') || tl.includes('number') || tl.includes('reading') || tl.includes('writing')) strand = 'Numbers';
    else if (tl.includes('measur') || tl.includes('length') || tl.includes('metre')) strand = 'Measurement';

    if (!videoMap[videoId]) videoMap[videoId] = [];
    videoMap[videoId].push({ title: lesson.title, id: lesson.id, strand });
  }

  console.log('=== VIDEO REVIEW TABLE ===\n');
  console.log(`Unique videos: ${Object.keys(videoMap).length}`);
  console.log(`Total lessons with videos: ${Object.values(videoMap).flat().length}\n`);

  for (const [videoId, lessons] of Object.entries(videoMap)) {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    const reused = lessons.length > 1;
    console.log(`Video ID: ${videoId}`);
    console.log(`URL: ${url}`);
    console.log(`Used in ${lessons.length} lesson(s):`);
    for (const l of lessons) {
      console.log(`  - [${l.strand}] ${l.title} (${l.id})`);
    }
    if (reused) {
      const strands = [...new Set(lessons.map(l => l.strand))];
      if (strands.length > 1) {
        console.log(`  ⚠️  REUSED ACROSS DIFFERENT STRANDS: ${strands.join(', ')}`);
      } else {
        console.log(`  ℹ️  Reused within same strand: ${strands[0]}`);
      }
    }
    console.log(`  ❓ Title/relevance: NEEDS HUMAN REVIEW (cannot auto-fetch YouTube)`);
    console.log();
  }

  // Write structured report
  const report = {
    generatedAt: new Date().toISOString(),
    uniqueVideos: Object.keys(videoMap).length,
    videos: Object.entries(videoMap).map(([videoId, lessons]) => ({
      videoId,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      lessonCount: lessons.length,
      lessons,
      reused: lessons.length > 1,
      strands: [...new Set(lessons.map(l => l.strand))],
      needsHumanReview: true,
    })),
  };

  const reportPath = path.join(__dirname, '..', 'docs', 'MATH_VIDEO_REVIEW.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`Written to: ${reportPath}`);
}

main().catch(e => console.error('ERROR:', e.message));
