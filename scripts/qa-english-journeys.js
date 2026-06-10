#!/usr/bin/env node
/**
 * QA Scanner for Grade 2 English Language Activities journeys.
 * Checks all 35 English lesson journeys against quality rules.
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

const REQUIRED_STEP_TYPES = ['welcome', 'mission', 'think_first', 'learn', 'connect', 'example', 'practice', 'quick_check', 'reflect', 'complete'];
const ANSWER_LEAK_PATTERNS = [
  /the answer is\s+\d+/i, /correct answer is/i, /answer is\s+\$\{/, /you can do this!.*answer/i, /good thinking.*answer/i,
];
const MAX_OWL_LENGTH = 300;

async function main() {
  // Fetch all lessons
  let all = [];
  let offset = 0;
  while (true) {
    const { data } = await db.from('Lesson').select('id,title,slug,contentBlocks').range(offset, offset + 199);
    if (!data || data.length === 0) break;
    all = all.concat(data);
    offset += 200;
    if (data.length < 200) break;
  }

  const english = all.filter(l => {
    try { const cb = typeof l.contentBlocks === 'string' ? JSON.parse(l.contentBlocks) : l.contentBlocks; return cb?.subject === 'English Language Activities'; } catch { return false; }
  });

  console.log(`\n═══════════════════════════════════════════════════`);
  console.log(`  QA SCANNER — Grade 2 English Language Activities`);
  console.log(`  Lessons scanned: ${english.length}`);
  console.log(`═══════════════════════════════════════════════════\n`);

  let totalIssues = 0;
  let critical = 0, high = 0, medium = 0, low = 0;
  const clean = [];
  const issues = [];

  for (const l of english) {
    const cb = JSON.parse(l.contentBlocks);
    const journey = cb.studentJourneyDraft || [];
    const lessonIssues = [];

    // 1. Step count
    if (journey.length !== 10) {
      lessonIssues.push({ severity: 'HIGH', msg: `Expected 10 steps, found ${journey.length}` });
    }

    // 2. Step types
    const actualTypes = journey.map(s => s.stepType);
    for (let i = 0; i < REQUIRED_STEP_TYPES.length; i++) {
      if (actualTypes[i] !== REQUIRED_STEP_TYPES[i]) {
        lessonIssues.push({ severity: 'HIGH', msg: `Step ${i}: expected ${REQUIRED_STEP_TYPES[i]}, got ${actualTypes[i] || 'missing'}` });
      }
    }

    // 3. Quick Check interaction
    const qcStep = journey.find(s => s.stepType === 'quick_check');
    if (!qcStep) {
      lessonIssues.push({ severity: 'CRITICAL', msg: 'Missing quick_check step' });
    } else if (!qcStep.interaction || qcStep.interaction.type === 'none') {
      lessonIssues.push({ severity: 'CRITICAL', msg: 'Quick Check has no interaction' });
    } else if (qcStep.interaction.type === 'multiple_choice') {
      if (!qcStep.interaction.options || qcStep.interaction.options.length < 2) {
        lessonIssues.push({ severity: 'HIGH', msg: 'Quick Check MCQ has fewer than 2 options' });
      }
      if (qcStep.interaction.correctIndex === undefined) {
        lessonIssues.push({ severity: 'HIGH', msg: 'Quick Check MCQ missing correctIndex' });
      }
      // Check for fallback question
      if (qcStep.interaction.question?.includes('What is one important thing you learned in')) {
        lessonIssues.push({ severity: 'MEDIUM', msg: 'Quick Check uses generic fallback question' });
      }
    }

    // 4. Answer leaks
    for (const step of journey) {
      const texts = [step.owlText, step.studentText].filter(Boolean);
      for (const text of texts) {
        for (const pattern of ANSWER_LEAK_PATTERNS) {
          if (pattern.test(text)) {
            lessonIssues.push({ severity: 'CRITICAL', msg: `Answer leak in ${step.stepType}: "${text.substring(0, 80)}..."` });
          }
        }
      }
    }

    // 5. Owl text length
    for (const step of journey) {
      if (step.owlText && step.owlText.length > MAX_OWL_LENGTH) {
        lessonIssues.push({ severity: 'LOW', msg: `${step.stepType} owlText too long (${step.owlText.length} chars)` });
      }
    }

    // 6. Empty content
    for (const step of journey) {
      if (!step.title) lessonIssues.push({ severity: 'MEDIUM', msg: `${step.stepType} missing title` });
      if (!step.studentText) lessonIssues.push({ severity: 'HIGH', msg: `${step.stepType} missing studentText` });
      if (!step.owlText) lessonIssues.push({ severity: 'MEDIUM', msg: `${step.stepType} missing owlText` });
    }

    // 7. think_first should have interaction
    const tfStep = journey.find(s => s.stepType === 'think_first');
    if (tfStep && (!tfStep.interaction || tfStep.interaction.type === 'none')) {
      lessonIssues.push({ severity: 'LOW', msg: 'think_first has no interaction' });
    }

    if (lessonIssues.length === 0) {
      clean.push(l.title);
    } else {
      issues.push({ title: l.title, slug: l.slug, items: lessonIssues });
      for (const i of lessonIssues) {
        totalIssues++;
        if (i.severity === 'CRITICAL') critical++;
        else if (i.severity === 'HIGH') high++;
        else if (i.severity === 'MEDIUM') medium++;
        else low++;
      }
    }
  }

  // ── Report ──
  console.log(`Total issues: ${totalIssues}`);
  console.log(`  CRITICAL: ${critical}  |  HIGH: ${high}  |  MEDIUM: ${medium}  |  LOW: ${low}`);
  console.log(``);

  if (issues.length > 0) {
    console.log('── Issues by Lesson ──');
    for (const { title, items } of issues) {
      console.log(`\n  ${title}:`);
      for (const i of items) {
        console.log(`    [${i.severity}] ${i.msg}`);
      }
    }
  }

  console.log(`\n── Clean Lessons (${clean.length}/${english.length}) ──`);
  clean.forEach(t => console.log(`  ✅ ${t}`));

  console.log(`\n${critical === 0 && high === 0 ? '✅ PASS' : '❌ FAIL'} — ${clean.length}/${english.length} lessons clean`);

  process.exit(critical > 0 || high > 0 ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(1); });
