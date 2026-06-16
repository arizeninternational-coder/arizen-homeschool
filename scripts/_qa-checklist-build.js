#!/usr/bin/env node
/**
 * Read-only: Build full 38-lesson Math recovery QA checklist.
 * Filters by aiMetadata.batchId containing 'g2-math-hq' in JS.
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
  // Fetch all lessons with studentJourneyDraft
  const { data: allLessons, error } = await db.from('Lesson')
    .select('id, title, slug, contentBlocks, questId')
    .limit(1000);

  if (error) { console.error('ERROR:', error.message); return; }

  // Filter to g2-math-hq batch
  const mathLessons = (allLessons || []).filter(l => {
    try {
      const cb = JSON.parse(l.contentBlocks || '{}');
      return cb.aiMetadata?.batchId?.includes('g2-math-hq');
    } catch(e) { return false; }
  });

  console.log(`Math g2-math-hq batch lessons: ${mathLessons.length}\n`);

  const fixedIds = new Set([
    '0767b9f0-4a75-4a27-b2a2-fa9833c8dae8',
    '159f92b9-69c7-45ea-8376-2b15af491360',
    '9b887eb8-0a48-4f37-9689-b53113904728',
    '60441bd5-774f-4135-9871-666fc481b13b',
    'b163de06-c0e5-4a42-8bce-ba7dcab330a9',
    'dbadac3a-b59b-4f76-bebf-efda6fb3e261',
    'b546d836-3292-48a1-b445-134e85b30e20',
    '17d7857a-a622-4b09-8524-db7be78977f8',
    'b0c38507-b852-4a4c-8767-c0234ef9b89c',
  ]);

  const checklist = [];

  for (const lesson of mathLessons) {
    let cb = {};
    try { cb = JSON.parse(lesson.contentBlocks || '{}'); } catch(e) {}

    const draft = cb.studentJourneyDraft;
    if (!draft || !Array.isArray(draft)) continue;

    const qcStep = draft.find(s => s.stepType === 'quick_check');
    const qc = qcStep?.interaction || {};

    // Find SVG
    let hasSvg = false;
    for (const step of draft) {
      if (JSON.stringify(step).includes('data:image/svg')) { hasSvg = true; break; }
    }

    // Find YouTube
    let hasVideo = false;
    let videoUrl = '';
    let videoId = cb.aiMetadata?.videoId || '';
    for (const step of draft) {
      const stepStr = JSON.stringify(step);
      const ytMatch = stepStr.match(/https?:\/\/[^\s"'<>]*(?:youtube\.com|youtu\.be)[^\s"'<>]*/);
      if (ytMatch) { hasVideo = true; videoUrl = ytMatch[0]; break; }
    }
    if (!hasVideo && videoId) { hasVideo = true; videoUrl = `https://youtube.com/watch?v=${videoId}`; }

    // Strand from title
    const tl = lesson.title.toLowerCase();
    let strand = 'Other';
    if (tl.includes('fraction') || tl.includes('half') || tl.includes('quarter')) strand = 'Fractions';
    else if (tl.includes('subtract')) strand = 'Subtraction';
    else if (tl.includes('add') || tl.includes('addition')) strand = 'Addition';
    else if (tl.includes('multiply') || tl.includes('multiplication') || tl.includes('repeated addition')) strand = 'Multiplication';
    else if (tl.includes('count') || tl.includes('reading number') || tl.includes('writing number') || tl.includes('missing number') || tl.includes('pattern')) strand = 'Numbers';
    else if (tl.includes('measur') || tl.includes('length') || tl.includes('metre') || tl.includes('capacity')) strand = 'Measurement';
    else if (tl.includes('time') || tl.includes('clock')) strand = 'Time';
    else if (tl.includes('shape') || tl.includes('rectangle') || tl.includes('circle') || tl.includes('triangle') || tl.includes('square') || tl.includes('oval')) strand = 'Geometry';

    const correctAnswer = qc.options?.[qc.correctIndex] ?? 'N/A';

    checklist.push({
      id: lesson.id,
      title: lesson.title,
      slug: lesson.slug || '',
      questId: lesson.questId,
      strand,
      isAvailable: cb.isAvailable,
      draftSteps: draft.length,
      hasSvg,
      hasVideo,
      videoUrl,
      videoId,
      qcQuestion: qc.question || 'NONE',
      qcOptions: qc.options || [],
      qcCorrectIndex: qc.correctIndex,
      correctAnswer,
      wasFixed: fixedIds.has(lesson.id),
      adminPreviewRoute: `/dashboard/admin/lessons/${lesson.id}/student-view`,
      studentRoute: `/dashboard/student/lessons/g2-mathematics/${lesson.questId}/${lesson.slug || lesson.id}`,
    });
  }

  checklist.sort((a, b) => a.strand.localeCompare(b.strand) || a.title.localeCompare(b.title));

  // Write JSON
  const outPath = path.join(__dirname, '..', 'docs', 'MATH_38_QA_CHECKLIST.json');
  fs.writeFileSync(outPath, JSON.stringify(checklist, null, 2));

  // Print
  console.log('=== FULL 38-LESSON MATH RECOVERY QA CHECKLIST ===\n');
  let currentStrand = '';
  let idx = 0;
  for (const l of checklist) {
    idx++;
    if (l.strand !== currentStrand) {
      currentStrand = l.strand;
      console.log(`\n━━━ ${currentStrand} (${checklist.filter(x => x.strand === currentStrand).length} lessons) ━━━`);
    }
    const fixedMark = l.wasFixed ? ' ★FIXED-QC' : '';
    console.log(`${String(idx).padStart(2)}. [${l.hasSvg?'✓':'✗'}SVG ${l.hasVideo?'✓':'✗'}VID] ${l.title}${fixedMark}`);
    console.log(`    ID: ${l.id}`);
    console.log(`    Admin: ${l.adminPreviewRoute}`);
    console.log(`    QC: "${l.qcQuestion}" → ${l.correctAnswer}`);
    console.log(`    Steps: ${l.draftSteps} | Available: ${l.isAvailable}`);
  }

  console.log('\n=== SUMMARY ===');
  console.log(`Total: ${checklist.length}`);
  console.log(`SVG: ${checklist.filter(l=>l.hasSvg).length}/${checklist.length}`);
  console.log(`Video: ${checklist.filter(l=>l.hasVideo).length}/${checklist.length}`);
  console.log(`Fixed QC: ${checklist.filter(l=>l.wasFixed).length}`);
  console.log(`All unavailable: ${checklist.every(l=>l.isAvailable===false)?'YES':'NO'}`);
  console.log(`All 10 steps: ${checklist.every(l=>l.draftSteps===10)?'YES':'NO'}`);
  console.log(`Written to: ${outPath}`);
}

main().catch(e => console.error('ERROR:', e.message));
