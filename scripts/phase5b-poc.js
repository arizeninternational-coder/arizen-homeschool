#!/usr/bin/env node
/**
 * PHASE 5b: Refined English Proof of Concept — 6 Journeys
 * Tests theme differentiation: same skill under different themes must differ.
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
const engine = require('./journey-engine-v3');

async function main() {
  console.log('=== PHASE 5b: REFINED ENGLISH PROOF OF CONCEPT (6 JOURNEYS) ===\n');

  const { data: englishTheme } = await db.from('Theme').select('id, title').eq('grade', 2).ilike('title', '%Grade 2 English%').single();
  if (!englishTheme) { console.log('ERROR: Theme not found'); return; }

  const { data: quests } = await db.from('Quest').select('id, title').eq('themeId', englishTheme.id);
  const { data: allLessons } = await db.from('Lesson').select('id, title, contentBlocks').in('questId', quests?.map(q => q.id) || []).order('orderIndex');

  // Select 6 lessons covering different themes and skills
  const findLesson = (titlePattern) => allLessons?.find(l => l.title.toLowerCase().includes(titlePattern.toLowerCase()));

  const selected = [
    // 1. School: Reading
    findLesson('School: Reading'),
    // 2. Transport: Reading
    findLesson('Transport: Reading'),
    // 3. School: Writing
    findLesson('School: Writing'),
    // 4. Transport: Writing
    findLesson('Transport: Writing'),
    // 5. Time and Months
    findLesson('Time and Months'),
    // 6. Accidents
    findLesson('Accidents'),
  ].filter(Boolean);

  console.log(`Selected ${selected.length} lessons:\n`);
  selected.forEach((l, i) => console.log(`  ${i+1}. ${l.title}`));

  const results = [];

  for (const lesson of selected) {
    let meta = {};
    try { meta = JSON.parse(lesson.contentBlocks || '{}'); } catch(e) {}

    console.log('\n' + '═'.repeat(70));
    console.log(`LESSON: ${lesson.title}`);
    console.log('═'.repeat(70));

    console.log(`\nStrand: ${meta.strand || 'N/A'}`);
    console.log(`Sub-strand: ${meta.subStrand || 'N/A'}`);
    console.log(`Key Inquiry: ${meta.keyInquiryQuestion || 'N/A'}`);

    const bp = engine.buildLessonBlueprint(lesson, meta);
    const journey = engine.buildJourneyFromBlueprint(bp);
    const validation = engine.validateJourney(journey, bp);

    console.log(`\n--- BLUEPRINT ---`);
    console.log(`Theme: ${bp.theme} (${bp.themeKey})`);
    console.log(`Skill: ${bp.skillType}`);
    console.log(`Goal: ${bp.lessonGoal.substring(0, 120)}`);
    console.log(`Vocab: ${bp.keyVocabulary.join(', ')}`);

    console.log(`\n--- JOURNEY ---`);
    journey.forEach((step, i) => {
      console.log(`\n${i+1}. [${step.stepType}] ${step.title}`);
      console.log(`   Student: ${step.studentText.substring(0, 150)}${step.studentText.length > 150 ? '...' : ''}`);
      if (step.interaction?.type === 'multiple_choice') {
        console.log(`   Q: ${step.interaction.question}`);
        console.log(`   Options: ${step.interaction.options?.join(' | ')}`);
        console.log(`   ✓ ${step.interaction.correctIndex}: ${step.interaction.explanation?.substring(0, 80)}`);
      }
    });

    console.log(`\n--- VALIDATION: ${validation.valid ? '✅ PASS' : '❌ FAIL'} ---`);
    validation.errors.forEach(e => console.log(`   ❌ ${e}`));

    // Compare with old journey
    const oldJourney = meta.studentJourneyDraft || meta.studentJourney || [];
    if (oldJourney.length > 0) {
      console.log(`\n--- OLD vs NEW ---`);
      console.log(`OLD Mission: ${oldJourney[1]?.studentText?.substring(0, 100)}`);
      console.log(`NEW Mission: ${journey[1].studentText.substring(0, 100)}`);
      console.log(`OLD Learn: ${oldJourney[3]?.studentText?.substring(0, 100)}`);
      console.log(`NEW Learn: ${journey[3].studentText.substring(0, 100)}`);
    }

    results.push({ lesson: lesson.title, valid: validation.valid, errors: validation.errors, bp, journey });
  }

  // Theme differentiation check
  console.log('\n\n' + '═'.repeat(70));
  console.log('THEME DIFFERENTIATION CHECK');
  console.log('═'.repeat(70));

  // Compare School:Writing vs Transport:Writing
  const schoolWriting = results.find(r => r.lesson.includes('School') && r.lesson.includes('Writing'));
  const transportWriting = results.find(r => r.lesson.includes('Transport') && r.lesson.includes('Writing'));

  if (schoolWriting && transportWriting) {
    console.log('\nSchool:Writing vs Transport:Writing');
    console.log(`School example: ${schoolWriting.journey[5].studentText.substring(0, 100)}`);
    console.log(`Transport example: ${transportWriting.journey[5].studentText.substring(0, 100)}`);
    const same = schoolWriting.journey[5].studentText === transportWriting.journey[5].studentText;
    console.log(`Examples are identical: ${same ? '❌ FAIL' : '✅ PASS'}`);

    console.log(`\nSchool practice: ${schoolWriting.journey[6].studentText.substring(0, 100)}`);
    console.log(`Transport practice: ${transportWriting.journey[6].studentText.substring(0, 100)}`);
    const samePractice = schoolWriting.journey[6].studentText === transportWriting.journey[6].studentText;
    console.log(`Practice is identical: ${samePractice ? '❌ FAIL' : '✅ PASS'}`);
  }

  // Compare School:Reading vs Transport:Reading
  const schoolReading = results.find(r => r.lesson.includes('School') && r.lesson.includes('Reading'));
  const transportReading = results.find(r => r.lesson.includes('Transport') && r.lesson.includes('Reading'));

  if (schoolReading && transportReading) {
    console.log('\nSchool:Reading vs Transport:Reading');
    console.log(`School example: ${schoolReading.journey[5].studentText.substring(0, 100)}`);
    console.log(`Transport example: ${transportReading.journey[5].studentText.substring(0, 100)}`);
    const same = schoolReading.journey[5].studentText === transportReading.journey[5].studentText;
    console.log(`Examples are identical: ${same ? '❌ FAIL' : '✅ PASS'}`);
  }

  // Summary
  console.log('\n\n' + '═'.repeat(70));
  console.log('SUMMARY');
  console.log('═'.repeat(70));
  const allValid = results.every(r => r.valid);
  console.log(`All 6 journeys valid: ${allValid ? '✅ YES' : '❌ NO'}`);
  results.forEach(r => {
    console.log(`  ${r.valid ? '✅' : '❌'} ${r.lesson}${r.errors.length > 0 ? ' — ' + r.errors.join('; ') : ''}`);
  });
}

main().catch(e => console.error(e));
