#!/usr/bin/env node
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
  // Get all lessons and find our Math ones by batchId
  const { data: allLessons } = await db.from('Lesson')
    .select('id, title, contentBlocks, questId')
    .limit(1000);

  const mathHQ = [];
  for (const l of allLessons || []) {
    try {
      const cb = JSON.parse(l.contentBlocks || '{}');
      if (cb.aiMetadata?.batchId?.includes('g2-math-hq')) {
        mathHQ.push({ id: l.id, title: l.title, journey: cb.studentJourneyDraft, meta: cb.aiMetadata, cb });
      }
    } catch(e) {}
  }

  console.log(`Found ${mathHQ.length} Math HQ journeys\n`);

  // QA 5 samples
  let pass = 0, fail = 0;
  for (const s of mathHQ.slice(0, 5)) {
    console.log(`=== ${s.title} ===`);
    const j = s.journey;
    let issues = [];

    if (!j || j.length === 0) { issues.push('No journey data'); }
    else {
      if (j.length !== 10) issues.push(`Step count: ${j.length} (expected 10)`);

      const required = ['welcome','mission','think_first','learn','connect','example','practice','quick_check','reflect','complete'];
      required.forEach((type, i) => {
        if (j[i]?.stepType !== type) issues.push(`Step ${i+1}: expected ${type}, got ${j[i]?.stepType}`);
      });

      // Check learn step has image
      const learnStep = j.find(s => s.stepType === 'learn');
      if (!learnStep?.media?.illustration?.approvedUrl) issues.push('No illustration in Learn step');

      // Check example step has video
      const exampleStep = j.find(s => s.stepType === 'example');
      if (!exampleStep?.media?.video?.approvedUrl) issues.push('No video in Example step');

      // Check quick check
      const qcStep = j.find(s => s.stepType === 'quick_check');
      if (!qcStep?.interaction || qcStep.interaction.type !== 'multiple_choice') issues.push('QC not multiple_choice');
      else {
        if (!qcStep.interaction.options || qcStep.interaction.options.length < 3) issues.push('QC has < 3 options');
        if (qcStep.interaction.correctIndex === undefined) issues.push('QC missing correctIndex');
      }

      // Check owl text not too long
      j.forEach((step, i) => {
        if (step.owlText && step.owlText.length > 200) issues.push(`Step ${i+1} owl text too long (${step.owlText.length})`);
      });

      // Check learn step has real content
      if (!learnStep?.studentText || learnStep.studentText.length < 50) issues.push('Learn step content too short');
    }

    if (issues.length === 0) {
      console.log('  ✅ PASS\n');
      pass++;
    } else {
      console.log('  ❌ FAIL:');
      issues.forEach(i => console.log(`    - ${i}`));
      console.log();
      fail++;
    }
  }

  console.log(`QA: ${pass} pass, ${fail} fail`);

  // Print full detail of first journey
  if (mathHQ.length > 0) {
    console.log(`\n\n=== FULL JOURNEY DETAIL: ${mathHQ[0].title} ===`);
    const j = mathHQ[0].journey;
    j.forEach((step, i) => {
      console.log(`\n--- Step ${i + 1}: [${step.stepType}] ${step.title} ---`);
      if (step.owlText) console.log(`Owl: "${step.owlText}"`);
      if (step.studentText) console.log(`Student: "${step.studentText.substring(0, 200)}${step.studentText.length > 200 ? '...' : ''}"`);
      if (step.interaction?.type !== 'none') {
        console.log(`Interaction: ${step.interaction.type}`);
        if (step.interaction.question) console.log(`  Question: "${step.interaction.question}"`);
        if (step.interaction.options) console.log(`  Options: ${JSON.stringify(step.interaction.options)}`);
        if (step.interaction.correctIndex !== undefined) console.log(`  Correct: ${step.interaction.correctIndex}`);
      }
      if (step.media?.illustration?.approvedUrl) {
        const url = step.media.illustration.approvedUrl;
        console.log(`Image: ${url.startsWith('data:') ? 'SVG data URI (' + url.length + ' chars)' : url}`);
      }
      if (step.media?.video?.approvedUrl) console.log(`Video: ${step.media.video.approvedUrl}`);
    });
  }
}

main().catch(e => console.error('ERROR:', e.message));
