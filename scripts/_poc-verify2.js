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
  const { data, error } = await db.from('Lesson').select('contentBlocks').eq('id', '0767b9f0-4a75-4a27-b2a2-fa9833c8dae8').single();
  if (error) { console.error('ERROR:', error.message); process.exit(1); }

  const cb = JSON.parse(data.contentBlocks);
  
  console.log('studentJourneyDraft type:', typeof cb.studentJourneyDraft);
  console.log('studentJourneyDraft is array:', Array.isArray(cb.studentJourneyDraft));
  console.log('studentJourneyDraft length:', cb.studentJourneyDraft?.length);
  
  if (cb.studentJourneyDraft && Array.isArray(cb.studentJourneyDraft)) {
    console.log('\n=== DRAFT JOURNEY STEPS ===');
    cb.studentJourneyDraft.forEach((step, i) => {
      console.log(`Step ${i+1} (${step.stepType}): "${step.title}"`);
      if (step.studentText) console.log(`  studentText: "${step.studentText.substring(0, 80)}"`);
      if (step.owlText) console.log(`  owlText: "${step.owlText.substring(0, 80)}"`);
      if (step.interaction?.question) {
        console.log(`  Q: ${step.interaction.question}`);
        console.log(`  Options: ${step.interaction.options?.join(', ')}`);
        console.log(`  Correct: ${step.interaction.correctAnswer} (index ${step.interaction.correctIndex})`);
      }
      if (step.media) {
        console.log(`  Media: type=${step.media.type}, fallbackType=${step.media.fallbackType || 'none'}`);
        if (step.media.altText) console.log(`  Alt: "${step.media.altText.substring(0, 60)}"`);
      }
    });

    // Full validation
    console.log('\n=== FULL VALIDATION ===');
    const steps = cb.studentJourneyDraft;
    let errors = 0;

    if (steps.length !== 10) { console.log('❌ Expected 10 steps, got', steps.length); errors++; }
    else { console.log('✅ 10 steps'); }

    const stepTypes = steps.map(s => s.stepType);
    const expected = ['welcome','mission','think_first','learn','real_life','example','practice','quick_check','reflect','complete'];
    if (JSON.stringify(stepTypes) !== JSON.stringify(expected)) { console.log('❌ Step order:', stepTypes); errors++; }
    else { console.log('✅ Correct step order'); }

    const step7 = steps.find(s => s.stepType === 'practice');
    const step8 = steps.find(s => s.stepType === 'quick_check');
    if (step7?.interaction?.question === step8?.interaction?.question) { console.log('❌ Step 7 = Step 8'); errors++; }
    else { console.log('✅ Step 7 differs from Step 8'); }

    const fullText = JSON.stringify(steps).toLowerCase();
    if (fullText.includes('1/3') || fullText.includes('thirds')) { console.log('❌ Thirds found'); errors++; }
    else { console.log('✅ No thirds'); }

    if (fullText.includes('youtube') || fullText.includes('video')) { console.log('⚠️ Video refs found'); }
    else { console.log('✅ No video dependency'); }

    const qc = step8?.interaction || {};
    if (qc.correctAnswer !== '1/2' && qc.correctAnswer !== 'one half') { console.log('❌ QC answer:', qc.correctAnswer); errors++; }
    else { console.log('✅ QC correct answer: 1/2'); }

    const missingFallback = steps.filter(s => !s.media?.fallbackType && !s.media?.altText);
    if (missingFallback.length > 0) { console.log('⚠️ Steps missing fallback:', missingFallback.map(s=>s.stepType).join(', ')); }
    else { console.log('✅ All steps have fallback'); }

    if (fullText.includes('coming soon') || fullText.includes('placeholder')) { console.log('❌ Placeholder text found'); errors++; }
    else { console.log('✅ No placeholder text'); }

    // Check media approval status
    const draftMedia = steps.filter(s => s.media?.approvalStatus === 'draft');
    console.log(`📝 Media approval: ${draftMedia.length} steps have draft media (expected: all, since this is POC)`);

    console.log('\nTotal errors:', errors);
    console.log(errors === 0 ? '✅ ALL VALIDATION PASSED' : '❌ VALIDATION FAILED');
  } else {
    console.log('studentJourneyDraft is not an array. Value:', cb.studentJourneyDraft);
    // Check if it's the old format
    console.log('Keys in contentBlocks:', Object.keys(cb).join(', '));
  }
}
main().catch(e => console.error('FATAL:', e.message));
