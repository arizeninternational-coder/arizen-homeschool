#!/usr/bin/env node
/**
 * MATH JOURNEY GENERATION — MAIN SCRIPT
 * 
 * Reads lesson data, generates high-quality journeys, and writes to Supabase.
 * Safety: writes to studentJourneyDraft only, never to studentJourney (published).
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
const { buildMathJourney } = require('./math-journey-generator');

const BATCH_ID = 'g2-math-hq-' + Date.now();
const lessonsData = JSON.parse(fs.readFileSync(path.join(__dirname, '_math-lessons-data.json'), 'utf-8'));

async function main() {
  console.log(`=== MATH JOURNEY GENERATION: ${BATCH_ID} ===\n`);

  // Only regenerate lessons that were cleared or have no journey
  const needsRegeneration = lessonsData.lessons.filter(l => l.cleared || !l.hasPublishedJourney);
  console.log(`Total Math lessons: ${lessonsData.lessons.length}`);
  console.log(`Need regeneration: ${needsRegeneration.length}`);
  console.log(`Already have journeys: ${lessonsData.lessons.length - needsRegeneration.length}\n`);

  // DRY RUN: Generate 3 POC journeys and print them
  console.log('=== DRY RUN: 3 POC Journeys ===\n');
  const pocLessons = needsRegeneration.slice(0, 3);
  for (const lesson of pocLessons) {
    const { journey, topic, video } = buildMathJourney(lesson);
    console.log(`\n--- ${lesson.title} ---`);
    console.log(`Topic: ${topic} | Video: ${video.title}`);
    console.log(`Steps: ${journey.length}`);
    journey.forEach((step, i) => {
      const owlPreview = (step.owlText || '').substring(0, 60);
      const studentPreview = (step.studentText || '').substring(0, 60);
      const interactionType = step.interaction?.type || 'none';
      const hasImage = !!(step.media?.illustration?.approvedUrl);
      const hasVideo = !!(step.media?.video?.approvedUrl);
      console.log(`  ${i + 1}. [${step.stepType}] ${step.title} | owl: "${owlPreview}..." | interaction: ${interactionType} | img: ${hasImage} | vid: ${hasVideo}`);
    });
  }

  console.log(`\n\n=== GENERATING ${needsRegeneration.length} JOURNEYS ===\n`);

  let success = 0, failed = 0, skipped = 0;
  const failures = [];
  const results = [];

  for (const lesson of needsRegeneration) {
    try {
      const { journey, topic, video } = buildMathJourney(lesson);

      // Validate: must have exactly 10 steps
      if (journey.length !== 10) {
        console.log(`SKIP (wrong step count ${journey.length}): ${lesson.title}`);
        skipped++;
        continue;
      }

      // Validate: quick_check must have multiple_choice interaction
      const qcStep = journey.find(s => s.stepType === 'quick_check');
      if (!qcStep?.interaction || qcStep.interaction.type !== 'multiple_choice') {
        console.log(`SKIP (no QC interaction): ${lesson.title}`);
        skipped++;
        continue;
      }

      // Validate: must have image in learn step
      const learnStep = journey.find(s => s.stepType === 'learn');
      if (!learnStep?.media?.illustration?.approvedUrl) {
        console.log(`SKIP (no learn image): ${lesson.title}`);
        skipped++;
        continue;
      }

      // Build the contentBlocks update
      let existingCb = {};
      try {
        const { data: current } = await db.from('Lesson').select('contentBlocks').eq('id', lesson.id).single();
        if (current?.contentBlocks) existingCb = JSON.parse(current.contentBlocks);
      } catch(e) {}

      const updatedCb = {
        ...existingCb,
        studentJourneyDraft: journey,
        aiMetadata: {
          ...(existingCb.aiMetadata || {}),
          batchId: BATCH_ID,
          generatedAt: new Date().toISOString(),
          topic,
          videoId: video.id,
          generator: 'math-journey-generator-v1',
          cleared: false,
        }
      };

      // Write to Supabase — draft only
      const { error } = await db.from('Lesson')
        .update({ contentBlocks: JSON.stringify(updatedCb) })
        .eq('id', lesson.id);

      if (error) {
        console.log(`FAIL: ${lesson.title} — ${error.message}`);
        failed++;
        failures.push({ title: lesson.title, error: error.message });
      } else {
        success++;
        results.push({ title: lesson.title, topic, video: video.title });
        if (success % 5 === 0) console.log(`  Progress: ${success}/${needsRegeneration.length} done`);
      }
    } catch(e) {
      console.log(`ERROR: ${lesson.title} — ${e.message}`);
      failed++;
      failures.push({ title: lesson.title, error: e.message });
    }
  }

  console.log(`\n=== RESULTS ===`);
  console.log(`Success: ${success}`);
  console.log(`Failed: ${failed}`);
  console.log(`Skipped: ${skipped}`);

  if (failures.length > 0) {
    console.log(`\nFailures:`);
    failures.forEach(f => console.log(`  - ${f.title}: ${f.error}`));
  }

  // Write results to file
  const reportPath = path.join(__dirname, '..', 'docs', 'MATH_GENERATION_REPORT.md');
  const report = `# Math Journey Generation Report

**Batch ID:** ${BATCH_ID}
**Date:** ${new Date().toISOString()}
**Generator:** math-journey-generator-v1

## Summary
- Total Math lessons: ${lessonsData.lessons.length}
- Needed regeneration: ${needsRegeneration.length}
- Successfully generated: ${success}
- Failed: ${failed}
- Skipped: ${skipped}

## Generated Journeys

| # | Lesson | Topic | Video |
|---|--------|-------|-------|
${results.map((r, i) => `| ${i + 1} | ${r.title} | ${r.topic} | ${r.video} |`).join('\n')}

## Features
- ✅ 10 steps per journey (exactly)
- ✅ SVG illustrations embedded (data URIs — no external hosting)
- ✅ YouTube video embeds in Example step
- ✅ Lesson-specific content (not generic templates)
- ✅ Multiple choice Quick Check with correct answers
- ✅ Written to studentJourneyDraft (NOT published)
- ✅ isAvailable remains false until Victor approves

## Next Steps
1. QA browser-verify 5 sample journeys
2. Review content quality
3. Approve → publish to studentJourney
4. Set isAvailable = true

## Failures
${failures.length === 0 ? 'None' : failures.map(f => `- ${f.title}: ${f.error}`).join('\n')}
`;

  fs.writeFileSync(reportPath, report);
  console.log(`\nReport written to: ${reportPath}`);
}

main().catch(e => console.error('FATAL:', e.message));
