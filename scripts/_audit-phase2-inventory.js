#!/usr/bin/env node
/**
 * PHASE 2: Grade 2 Math database inventory — READ ONLY
 * Fetches ALL Grade 2 Math lessons with full contentBlocks fields.
 * No writes. No changes.
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
  console.log('=== PHASE 2: GRADE 2 MATH DATABASE INVENTORY ===\n');

  // Fetch ALL lessons — we'll filter in JS
  const { data: allLessons, error } = await db.from('Lesson')
    .select('id, title, slug, contentBlocks, questId, updatedAt, createdAt')
    .limit(1000);

  if (error) { console.error('FATAL:', error.message); process.exit(1); }

  // Parse and filter to Grade 2 Math
  const math2Lessons = [];
  const allParsed = [];

  for (const lesson of allLessons || []) {
    let cb = {};
    try { cb = JSON.parse(lesson.contentBlocks || '{}'); } catch(e) { continue; }

    const grade = cb.grade;
    const subject = cb.subject || '';

    // Filter: Grade 2 Mathematics
    const isGrade2 = grade === 2 || grade === '2' || grade === 'Grade 2';
    const isMath = subject.toLowerCase().includes('math') ||
                   subject.toLowerCase().includes('mathematical');

    if (isGrade2 && isMath) {
      const draft = cb.studentJourneyDraft || [];
      const published = cb.studentJourney || [];
      const meta = cb.aiMetadata || {};

      math2Lessons.push({
        id: lesson.id,
        title: lesson.title,
        slug: lesson.slug || '',
        questId: lesson.questId,
        strand: cb.strand || '',
        subStrand: cb.subStrand || '',
        learningOutcome: (cb.learningOutcome || '').substring(0, 200),
        specificLearningOutcome: (cb.specificLearningOutcome || '').substring(0, 200),
        keyInquiryQuestion: (cb.keyInquiryQuestion || '').substring(0, 200),
        suggestedLearningExperience: (cb.suggestedLearningExperience || '').substring(0, 300),
        activityInstructions: (cb.activityInstructions || '').substring(0, 300),
        status: cb.status || '',
        isAvailable: cb.isAvailable,
        draftSteps: draft.length,
        publishedSteps: published.length,
        batchId: meta.batchId || '',
        generatedAt: meta.generatedAt || '',
        publishedAt: meta.publishedAt || '',
        repairedAt: meta.repairedAt || '',
        generator: meta.generator || '',
        engineVersion: meta.engineVersion || '',
        videoId: meta.videoId || '',
        isRecoveryBatch: (meta.batchId || '').includes('g2-math-hq'),
        isOldV2: !meta.batchId && published.length > 0,
        updatedAt: lesson.updatedAt,
        createdAt: lesson.createdAt,
      });
    }
  }

  // Sort by strand then title
  math2Lessons.sort((a, b) => a.strand.localeCompare(b.strand) || a.title.localeCompare(b.title));

  console.log(`Total Grade 2 Math lessons: ${math2Lessons.length}`);
  console.log(`Recovery batch (g2-math-hq): ${math2Lessons.filter(l => l.isRecoveryBatch).length}`);
  console.log(`Old v2 (no batchId, has published): ${math2Lessons.filter(l => l.isOldV2).length}`);
  console.log(`Published (isAvailable=true): ${math2Lessons.filter(l => l.isAvailable === true).length}`);
  console.log(`Unavailable (isAvailable=false): ${math2Lessons.filter(l => l.isAvailable === false).length}`);
  console.log(`Has draft (draftSteps>0): ${math2Lessons.filter(l => l.draftSteps > 0).length}`);
  console.log(`Has published (publishedSteps>0): ${math2Lessons.filter(l => l.publishedSteps > 0).length}`);

  // Strand breakdown
  const strands = {};
  for (const l of math2Lessons) {
    const s = l.strand || 'Unknown';
    if (!strands[s]) strands[s] = 0;
    strands[s]++;
  }
  console.log('\nStrand breakdown:');
  for (const [s, c] of Object.entries(strands).sort()) {
    console.log(`  ${s}: ${c}`);
  }

  // Write CSV
  const csvDir = path.join(__dirname, '..', 'docs', 'audits');
  fs.mkdirSync(csvDir, { recursive: true });

  const csvHeaders = [
    'id','title','slug','strand','subStrand','learningOutcome','specificLearningOutcome',
    'keyInquiryQuestion','suggestedLearningExperience','activityInstructions',
    'status','isAvailable','draftSteps','publishedSteps','batchId','generatedAt',
    'publishedAt','generator','videoId','isRecoveryBatch','isOldV2','updatedAt'
  ];

  const csvRows = [csvHeaders.join(',')];
  for (const l of math2Lessons) {
    const row = csvHeaders.map(h => {
      const val = l[h] ?? '';
      return '"' + String(val).replace(/"/g, '""').replace(/\n/g, ' ') + '"';
    });
    csvRows.push(row.join(','));
  }
  fs.writeFileSync(path.join(csvDir, 'grade-2-math-full-inventory.csv'), csvRows.join('\n'));

  // Write JSON for further processing
  fs.writeFileSync(path.join(csvDir, 'grade-2-math-full-inventory.json'), JSON.stringify(math2Lessons, null, 2));

  // Write summary markdown
  let md = '# Grade 2 Mathematics — Full Database Inventory\n\n';
  md += `**Generated:** ${new Date().toISOString()}\n`;
  md += `**Database:** Supabase (production — hgufndnqbvcukbxmwtvo.supabase.co)\n`;
  md += `**Total Grade 2 Math lessons:** ${math2Lessons.length}\n\n`;
  md += `## Summary\n\n`;
  md += `| Metric | Count |\n|--------|-------|\n`;
  md += `| Total Grade 2 Math lessons | ${math2Lessons.length} |\n`;
  md += `| Recovery batch (g2-math-hq) | ${math2Lessons.filter(l => l.isRecoveryBatch).length} |\n`;
  md += `| Old v2 (published, no batchId) | ${math2Lessons.filter(l => l.isOldV2).length} |\n`;
  md += `| isAvailable=true | ${math2Lessons.filter(l => l.isAvailable === true).length} |\n`;
  md += `| isAvailable=false | ${math2Lessons.filter(l => l.isAvailable === false).length} |\n`;
  md += `| Has draft steps | ${math2Lessons.filter(l => l.draftSteps > 0).length} |\n`;
  md += `| Has published steps | ${math2Lessons.filter(l => l.publishedSteps > 0).length} |\n\n`;

  md += `## Strand Breakdown\n\n`;
  for (const [s, c] of Object.entries(strands).sort()) {
    md += `### ${s} (${c} lessons)\n\n`;
    for (const l of math2Lessons.filter(x => (x.strand || 'Unknown') === s)) {
      const avail = l.isAvailable === true ? '✅ Available' : l.isAvailable === false ? '❌ Hidden' : '—';
      const batch = l.isRecoveryBatch ? ' [RECOVERY]' : l.isOldV2 ? ' [OLD-v2]' : '';
      md += `- **${l.title}**${batch} — ${avail} — Draft: ${l.draftSteps} steps, Published: ${l.publishedSteps} steps\n`;
      if (l.learningOutcome) md += `  - Outcome: ${l.learningOutcome.substring(0, 120)}\n`;
    }
    md += '\n';
  }

  fs.writeFileSync(path.join(csvDir, 'grade-2-math-summary.md'), md);

  console.log(`\nFiles written:`);
  console.log(`  ${csvDir}/grade-2-math-full-inventory.csv`);
  console.log(`  ${csvDir}/grade-2-math-full-inventory.json`);
  console.log(`  ${csvDir}/grade-2-math-summary.md`);
}

main().catch(e => console.error('FATAL:', e.message));
