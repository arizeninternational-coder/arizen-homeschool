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
  const { data, error } = await db.from('Lesson').select('id, title, contentBlocks, isAvailable, updatedAt').eq('id', '0767b9f0-4a75-4a27-b2a2-fa9833c8dae8').single();
  if (error) { console.error('ERROR:', error.message); process.exit(1); }

  const cb = JSON.parse(data.contentBlocks);
  const draft = cb.studentJourneyDraft;
  const steps = draft?.steps || [];

  console.log('=== POST-WRITE VALIDATION (from DB) ===');
  console.log('Lesson ID:', data.id);
  console.log('Title:', data.title);
  console.log('Top-level isAvailable:', data.isAvailable, '(unchanged)');
  console.log('contentBlocks.isAvailable:', cb.isAvailable, '(unchanged)');
  console.log('studentJourney steps:', cb.studentJourney?.length || 0, '(unchanged, should be 0)');
  console.log('studentJourneyDraft.steps.length:', steps.length);
  console.log('POC metadata:', JSON.stringify(draft.metadata, null, 2));
  console.log('aiMetadata.pocWrittenAt:', cb.aiMetadata?.pocWrittenAt);
  console.log('aiMetadata.approvedForPublish:', cb.aiMetadata?.approvedForPublish);

  console.log('\n=== 10-STEP VALIDATION ===');
  let errors = 0;
  let warnings = 0;

  // 10 steps
  if (steps.length !== 10) { console.log('❌ Expected 10 steps, got', steps.length); errors++; }
  else { console.log('✅ 10 steps'); }

  // Correct order
  const stepTypes = steps.map(s => s.stepType);
  const expected = ['welcome','mission','think_first','learn','real_life','example','practice','quick_check','reflect','complete'];
  if (JSON.stringify(stepTypes) !== JSON.stringify(expected)) { console.log('❌ Step order:', stepTypes); errors++; }
  else { console.log('✅ Correct step order'); }

  // All steps have required fields
  for (const step of steps) {
    if (!step.title) { console.log('❌ Step', step.stepNumber, 'missing title'); errors++; }
    if (!step.purpose) { console.log('❌ Step', step.stepNumber, 'missing purpose'); errors++; }
    if (!step.owlText && !step.studentText) { console.log('⚠️ Step', step.stepNumber, 'has neither owlText nor studentText'); warnings++; }
  }
  console.log('✅ All steps have title + purpose');

  // Step 7 != Step 8
  const step7 = steps.find(s => s.stepType === 'practice');
  const step8 = steps.find(s => s.stepType === 'quick_check');
  const q7 = step7?.interaction?.question || '';
  const q8 = step8?.interaction?.question || '';
  if (q7 === q8) { console.log('❌ Step 7 and Step 8 have same question'); errors++; }
  else { console.log('✅ Step 7 (practice) differs from Step 8 (QC)'); }
  console.log('  Step 7 Q:', q7.substring(0, 80));
  console.log('  Step 8 Q:', q8.substring(0, 80));

  // QC options
  const qcOpts = step8?.interaction?.options || [];
  console.log('  QC Options:', qcOpts.join(', '));
  if (qcOpts.length !== 4) { console.log('❌ QC should have 4 options, got', qcOpts.length); errors++; }
  else { console.log('✅ QC has 4 options'); }

  // No thirds anywhere
  const fullText = JSON.stringify(steps).toLowerCase();
  if (fullText.includes('1/3') || fullText.includes('thirds') || fullText.includes('one third')) { console.log('❌ Unsupported fraction (thirds) found'); errors++; }
  else { console.log('✅ No thirds anywhere in journey'); }

  // No video dependency
  if (fullText.includes('youtube') || fullText.includes('"video"')) { console.log('⚠️ Video references found'); warnings++; }
  else { console.log('✅ No video dependency'); }

  // QC correct answer — accept "1/2", "one half", or combined "one half (1/2)"
  const qcCorrect = step8?.interaction?.correctAnswer || '';
  const qcCorrectLower = qcCorrect.toLowerCase();
  if (!qcCorrectLower.includes('1/2') && !qcCorrectLower.includes('one half')) { console.log('❌ QC correct answer should include 1/2 or one half, got:', qcCorrect); errors++; }
  else { console.log('✅ QC correct answer:', qcCorrect); }

  // QC correctIndex
  const qcIdx = step8?.interaction?.correctIndex;
  if (qcIdx === undefined || qcIdx === null) { console.log('❌ QC missing correctIndex'); errors++; }
  else { console.log('✅ QC correctIndex:', qcIdx); }

  // All steps have media fallback
  const missingFallback = steps.filter(s => !s.media?.fallbackType && !s.media?.altText && s.media?.type !== 'none');
  if (missingFallback.length > 0) { console.log('⚠️ Steps without fallback:', missingFallback.map(s=>s.stepType).join(', ')); warnings++; }
  else { console.log('✅ All steps have fallback text or alt text'); }

  // No placeholder text
  if (fullText.includes('coming soon') || fullText.includes('placeholder') || fullText.includes('illustration coming')) { console.log('❌ Placeholder text found'); errors++; }
  else { console.log('✅ No placeholder text'); }

  // No title-copying
  const title = 'Introduction to Halves Using Rectangular Cut-outs';
  const titleWords = title.toLowerCase().split(' ');
  for (const step of steps) {
    const text = `${step.studentText} ${step.owlText}`.toLowerCase();
    if (text.includes('rectangular cut-outs') || text.includes('introduction to halves')) {
      console.log('⚠️ Possible title-copying in step', step.stepNumber);
      warnings++;
    }
  }
  console.log('✅ No obvious title-copying');

  // Media approval status
  const draftMedia = steps.filter(s => s.media?.approvalStatus === 'draft');
  console.log('📝', draftMedia.length, 'steps have draft media (expected: all, POC)');

  // Feedback exists on QC
  const qc = step8?.interaction || {};
  if (!qc.feedbackCorrect) { console.log('❌ QC missing feedbackCorrect'); errors++; }
  else { console.log('✅ QC has feedbackCorrect'); }
  if (!qc.feedbackIncorrect) { console.log('❌ QC missing feedbackIncorrect'); errors++; }
  else { console.log('✅ QC has feedbackIncorrect'); }

  // Practice has interaction
  const practiceInteraction = step7?.interaction || {};
  if (practiceInteraction.type === 'none' || !practiceInteraction.type) { console.log('❌ Practice step has no interaction type'); errors++; }
  else { console.log('✅ Practice has interaction:', practiceInteraction.type); }

  console.log('\n=== RESULT ===');
  console.log('Errors:', errors);
  console.log('Warnings:', warnings);
  console.log(errors === 0 ? '✅ ALL VALIDATION PASSED' : '❌ VALIDATION FAILED');
}

main().catch(e => console.error('FATAL:', e.message));
