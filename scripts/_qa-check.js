#!/usr/bin/env node
/**
 * QA CHECK: Read back generated Math journeys and verify quality
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
  // Get 5 sample Math journeys that were just generated
  const { data: lessons } = await db.from('Lesson')
    .select('id, title, contentBlocks')
    .eq('themeId', 'e985a712-6097-4901-88a6-bf414a7bf207')
    .limit(200);

  const samples = [];
  for (const l of lessons || []) {
    try {
      const cb = JSON.parse(l.contentBlocks || '{}');
      if (cb.aiMetadata?.batchId?.includes('g2-math-hq')) {
        samples.push({ id: l.id, title: l.title, journey: cb.studentJourneyDraft, meta: cb.aiMetadata });
      }
    } catch(e) {}
  }

  console.log(`Found ${samples.length} generated Math journeys\n`);

  // QA each sample
  let pass = 0, fail = 0;
  for (const s of samples.slice(0, 5)) {
    console.log(`=== ${s.title} ===`);
    const j = s.journey;
    let issues = [];

    // Check step count
    if (j.length !== 10) issues.push(`Wrong step count: ${j.length}`);

    // Check each step
    const required = ['welcome','mission','think_first','learn','connect','example','practice','quick_check','reflect','complete'];
    required.forEach((type, i) => {
      if (j[i]?.stepType !== type) issues.push(`Step ${i+1}: expected ${type}, got ${j[i]?.stepType}`);
    });

    // Check images
    const learnStep = j.find(s => s.stepType === 'learn');
    if (!learnStep?.media?.illustration?.approvedUrl) issues.push('No illustration in Learn step');
    else if (learnStep.media.illustration.approvedUrl.includes('data:image')) issues.push('Image is data URI (SVG) ✓');

    // Check video
    const exampleStep = j.find(s => s.stepType === 'example');
    if (!exampleStep?.media?.video?.approvedUrl) issues.push('No video in Example step');
    else console.log(`  Video: ${exampleStep.media.video.approvedUrl}`);

    // Check quick check
    const qcStep = j.find(s => s.stepType === 'quick_check');
    if (!qcStep?.interaction || qcStep.interaction.type !== 'multiple_choice') issues.push('QC not multiple_choice');
    else if (!qcStep.interaction.options || qcStep.interaction.options.length < 3) issues.push('QC has < 3 options');
    else if (qcStep.interaction.correctIndex === undefined) issues.push('QC missing correctIndex');

    // Check owl text length
    j.forEach((step, i) => {
      if (step.owlText && step.owlText.length > 200) issues.push(`Step ${i+1} owl text too long (${step.owlText.length} chars)`);
    });

    // Check student text in learn step
    if (!learnStep?.studentText || learnStep.studentText.length < 50) issues.push('Learn step student text too short');

    if (issues.length === 0) {
      console.log('  ✅ PASS');
      pass++;
    } else {
      console.log('  ❌ FAIL:');
      issues.forEach(i => console.log(`    - ${i}`));
      fail++;
    }
    console.log();
  }

  console.log(`\n=== QA SUMMARY ===`);
  console.log(`Pass: ${pass} | Fail: ${fail}`);

  // Also print full detail of first journey
  if (samples.length > 0) {
    console.log(`\n=== FULL JOURNEY: ${samples[0].title} ===`);
    samples[0].journey.forEach((step, i) => {
      console.log(`\nStep ${i + 1}: [${step.stepType}] ${step.title}`);
      if (step.owlText) console.log(`  Owl: "${step.owlText.substring(0, 100)}${step.owlText.length > 100 ? '...' : ''}"`);
      if (step.studentText) console.log(`  Student: "${step.studentText.substring(0, 120)}${step.studentText.length > 120 ? '...' : ''}"`);
      if (step.interaction?.type !== 'none') console.log(`  Interaction: ${step.interaction?.type} | q: "${(step.interaction?.question || step.interaction?.prompt || '').substring(0, 60)}"`);
      if (step.media?.illustration?.approvedUrl) console.log(`  Image: ${step.media.illustration.approvedUrl.substring(0, 60)}...`);
      if (step.media?.video?.approvedUrl) console.log(`  Video: ${step.media.video.approvedUrl}`);
    });
  }
}

main().catch(e => console.error('ERROR:', e.message));
