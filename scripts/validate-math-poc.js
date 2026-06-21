#!/usr/bin/env node
/**
 * Validate the local Math POC journey
 */

const fs = require('fs');
const path = require('path');

const poc = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'curriculum-source-packs', 'grade-2', 'math', 'poc', 'reading-numbers-1-to-50-symbols-journey.json'),
  'utf-8'
));

const journey = poc.journey;
const errors = [];
const warnings = [];

// ── 10-step structure check ──
const expectedSteps = ['welcome', 'mission', 'think_first', 'learn', 'connect', 'example', 'practice', 'quick_check', 'reflect', 'complete'];
if (journey.length !== 10) errors.push(`Expected 10 steps, got ${journey.length}`);
for (let i = 0; i < 10; i++) {
  if (journey[i].stepType !== expectedSteps[i]) errors.push(`Step ${i+1}: expected ${expectedSteps[i]}, got ${journey[i].stepType}`);
}

// ── Contamination check ──
const CONTAMINATION_PHRASES = [
  'reading comprehension', 'read a short passage', 'main idea', 'good readers',
  'sentence mostly about', 'words say', 'what did you learn about reading',
  'what do good readers do', 'read carefully and think about the meaning',
];

function getAllText(steps) {
  const texts = [];
  for (const step of steps) {
    if (step.owlText) texts.push(step.owlText.toLowerCase());
    if (step.studentText) texts.push(step.studentText.toLowerCase());
    if (step.interaction) {
      if (step.interaction.question) texts.push(step.interaction.question.toLowerCase());
      if (step.interaction.prompt) texts.push(step.interaction.prompt.toLowerCase());
      if (step.interaction.options) for (const opt of step.interaction.options) texts.push(String(opt).toLowerCase());
    }
  }
  return texts.join(' ');
}

const allText = getAllText(journey);
for (const phrase of CONTAMINATION_PHRASES) {
  if (allText.includes(phrase)) errors.push(`CONTAMINATION: "${phrase}" found in journey`);
}

// ── Math content check ──
const MATH_TERMS = ['number', 'count', 'symbol', 'match', 'how many'];
let mathTermsFound = 0;
for (const term of MATH_TERMS) {
  if (allText.includes(term)) mathTermsFound++;
}
if (mathTermsFound < 3) warnings.push(`Only ${mathTermsFound} Math terms found (expected 3+)`);

// ── Duplicate check ──
for (const step of journey) {
  const owl = (step.owlText || '').toLowerCase().trim();
  const student = (step.studentText || '').toLowerCase().trim();
  if (owl && student && owl === student && owl.length > 20) {
    errors.push(`DUPLICATE: step "${step.stepType}" owlText === studentText`);
  }
}

// ── Empty step check ──
for (const step of journey) {
  const hasOwl = step.owlText && step.owlText.trim().length > 0;
  const hasStudent = step.studentText && step.studentText.trim().length > 0;
  const hasInteraction = step.interaction && step.interaction.type && step.interaction.type !== 'none';
  if (!hasOwl && !hasStudent && !hasInteraction) {
    errors.push(`EMPTY: step "${step.stepType}" (${step.id}) has no content`);
  }
}

// ── Quick Check validation ──
const qcStep = journey.find(s => s.stepType === 'quick_check');
if (!qcStep) errors.push('No quick_check step found');
else {
  const ix = qcStep.interaction;
  if (!ix || ix.type !== 'multiple_choice') errors.push('Quick Check is not multiple_choice');
  else {
    if (ix.correctIndex === undefined || ix.correctIndex === null) errors.push('QC_NO_CORRECT_INDEX');
    if (!ix.options || ix.options.length < 2) errors.push('QC_TOO_FEW_OPTIONS');
    if (ix.correctIndex !== undefined && ix.options && qcStep.owlText) {
      const correctOpt = ix.options[ix.correctIndex];
      if (correctOpt && qcStep.owlText.toLowerCase().includes(String(correctOpt).toLowerCase())) {
        errors.push('QC_ANSWER_LEAK: owlText contains correct answer');
      }
    }
  }
}

// ── Practice validation ──
const practiceStep = journey.find(s => s.stepType === 'practice');
if (!practiceStep) errors.push('No practice step found');
else {
  const student = (practiceStep.studentText || '').toLowerCase().trim();
  const hasIx = practiceStep.interaction && practiceStep.interaction.type && practiceStep.interaction.type !== 'none';
  if ((!student || student.length < 10) && !hasIx) errors.push('WEAK_PRACTICE: no content and no interaction');
}

// ── Reflection validation ──
const reflectStep = journey.find(s => s.stepType === 'reflect');
if (!reflectStep) errors.push('No reflect step found');
else {
  const text = getAllText([reflectStep]);
  if (text.includes('reading') || text.includes('story') || text.includes('passage')) {
    errors.push('REFLECTION_MISMATCH: Math lesson reflection asks about reading');
  }
}

// ── Media check ──
let stepsWithVisual = 0;
for (const step of journey) {
  if (step.media && step.media.illustration) stepsWithVisual++;
}
if (stepsWithVisual < 2) warnings.push(`Only ${stepsWithVisual} steps have visual media (recommended: 2+ for Math)`);

// ── Generic phrase check ──
const GENERIC_PHRASES = [
  'here is what you need to know', 'this is an example sentence',
  'we use this every day', 'take a moment to think',
  "let's learn about this topic", 'this is important for your learning',
];
let genericCount = 0;
for (const phrase of GENERIC_PHRASES) {
  if (allText.includes(phrase.toLowerCase())) genericCount++;
}
if (genericCount > 2) warnings.push(`${genericCount} generic phrases found (max 2)`);

// ── Output ──
console.log('=== Math POC Validation: Reading Numbers 1 to 50 ===\n');
console.log(`Lesson: ${poc.title}`);
console.log(`Subject: ${poc.subject} | Strand: ${poc.strand} | Sub: ${poc.subStrand}`);
console.log(`Steps: ${journey.length} | Math terms: ${mathTermsFound} | Visual steps: ${stepsWithVisual}\n`);

if (errors.length > 0) {
  console.log('ERRORS:');
  errors.forEach(e => console.log(`  ✗ ${e}`));
}
if (warnings.length > 0) {
  console.log('WARNINGS:');
  warnings.forEach(w => console.log(`  ⚠ ${w}`));
}
if (errors.length === 0 && warnings.length === 0) {
  console.log('✓ ALL CHECKS PASSED');
} else if (errors.length === 0) {
  console.log(`\n✓ PASSED with ${warnings.length} warning(s)`);
} else {
  console.log(`\n✗ FAILED: ${errors.length} error(s), ${warnings.length} warning(s)`);
}

// Write validation report
const report = {
  lessonId: poc.lessonId,
  title: poc.title,
  subject: poc.subject,
  date: new Date().toISOString(),
  errors,
  warnings,
  passed: errors.length === 0,
  stepCount: journey.length,
  mathTermsFound,
  stepsWithVisual,
  genericPhrases: genericCount,
  contaminationPhrasesFound: CONTAMINATION_PHRASES.filter(p => allText.includes(p)),
};

fs.writeFileSync(
  path.join(__dirname, '..', 'curriculum-source-packs', 'grade-2', 'math', 'poc', 'reading-numbers-1-to-50-validation.json'),
  JSON.stringify(report, null, 2)
);

console.log('\nValidation report written.');
process.exit(errors.length > 0 ? 1 : 0);
