#!/usr/bin/env node
/**
 * PHASE 5: English Proof of Concept
 * Create 3 journeys from real Grade 2 English lessons to test the new engine.
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
const engine = require('./journey-engine-v2');

async function main() {
  console.log('=== PHASE 5: ENGLISH PROOF OF CONCEPT ===\n');

  // Get the Grade 2 English theme
  const { data: englishTheme } = await db.from('Theme').select('id, title').eq('grade', 2).ilike('title', '%Grade 2 English%').single();
  if (!englishTheme) { console.log('ERROR: Grade 2 English theme not found'); return; }
  
  console.log(`Theme: ${englishTheme.title} (${englishTheme.id})`);

  // Get quests under this theme
  const { data: quests } = await db.from('Quest').select('id, title').eq('themeId', englishTheme.id);
  console.log(`Quests: ${quests?.length || 0}`);

  // Get all lessons under this theme
  const { data: allLessons } = await db.from('Lesson').select('id, title, contentBlocks').in('questId', quests?.map(q => q.id) || []).order('orderIndex');
  console.log(`Total lessons: ${allLessons?.length || 0}`);

  // Pick 3 representative lessons:
  // 1. Reading/comprehension
  // 2. Grammar/sentence building
  // 3. Spelling/handwriting/writing
  
  const candidates = {
    reading: allLessons?.filter(l => {
      let meta = {}; try { meta = JSON.parse(l.contentBlocks || '{}'); } catch(e) {}
      const strand = (meta.strand || '').toLowerCase();
      return strand.includes('reading') || strand.includes('comprehension');
    }) || [],
    grammar: allLessons?.filter(l => {
      let meta = {}; try { meta = JSON.parse(l.contentBlocks || '{}'); } catch(e) {}
      const strand = (meta.strand || '').toLowerCase();
      const title = l.title.toLowerCase();
      return strand.includes('writing') || title.includes('sentence') || title.includes('grammar') || title.includes('verb');
    }) || [],
    spelling: allLessons?.filter(l => {
      let meta = {}; try { meta = JSON.parse(l.contentBlocks || '{}'); } catch(e) {}
      const strand = (meta.strand || '').toLowerCase();
      const title = l.title.toLowerCase();
      return strand.includes('writing') || title.includes('spelling') || title.includes('handwriting') || title.includes('vocabulary') || title.includes('letter sound');
    }) || [],
  };

  const selected = [
    candidates.reading[0],
    candidates.grammar.find(l => l.title.includes('Sentence') || l.title.includes('Grammar')) || candidates.grammar[0],
    candidates.spelling.find(l => l.title.includes('Spelling') || l.title.includes('Vocabulary')) || candidates.spelling[0],
  ].filter(Boolean);

  console.log(`\nSelected ${selected.length} lessons for proof-of-concept:`);

  for (const lesson of selected) {
    let meta = {};
    try { meta = JSON.parse(lesson.contentBlocks || '{}'); } catch(e) {}

    console.log('\n' + '='.repeat(70));
    console.log(`LESSON: ${lesson.title}`);
    console.log('='.repeat(70));
    
    // Show available curriculum fields
    console.log('\n--- CURRICULUM FIELDS ---');
    console.log(`Subject: ${meta.subject || 'N/A'}`);
    console.log(`Strand: ${meta.strand || 'N/A'}`);
    console.log(`Sub-strand: ${meta.subStrand || 'N/A'}`);
    console.log(`Learning Outcome: ${(meta.learningOutcome || 'N/A').substring(0, 150)}`);
    console.log(`Specific LO: ${(meta.specificLearningOutcome || 'N/A').substring(0, 150)}`);
    console.log(`Key Inquiry: ${(meta.keyInquiryQuestion || 'N/A').substring(0, 150)}`);
    console.log(`Suggested Experience: ${(meta.suggestedLearningExperience || 'N/A').substring(0, 200)}`);
    console.log(`Activity Instructions: ${(meta.activityInstructions || 'N/A').substring(0, 200)}`);
    console.log(`Term: ${meta.term || 'N/A'} | Week: ${meta.week || 'N/A'}`);

    // Build blueprint
    const blueprint = engine.buildLessonBlueprint(lesson, meta);
    
    console.log('\n--- GENERATED BLUEPRINT ---');
    console.log(`Original Title: ${blueprint.originalTitle}`);
    console.log(`Child-Friendly Title: ${blueprint.childFriendlyTitle}`);
    console.log(`Lesson Goal: ${blueprint.lessonGoal.substring(0, 150)}`);
    console.log(`Key Question: ${blueprint.keyQuestion.substring(0, 100)}`);
    console.log(`Key Vocabulary: ${blueprint.keyVocabulary.join(', ') || 'N/A'}`);
    console.log(`Concept: ${blueprint.conceptToTeach}`);
    console.log(`Misconception: ${blueprint.misconceptionToAvoid}`);
    console.log(`Real-Life Connection: ${blueprint.realLifeConnection}`);
    console.log(`Interaction Type: ${blueprint.interactionType}`);
    console.log(`Language: ${blueprint.lang}`);

    // Build journey
    const journey = engine.buildJourneyFromBlueprint(blueprint);

    console.log('\n--- 10-STEP JOURNEY ---');
    journey.forEach((step, i) => {
      console.log(`\nStep ${i + 1}: ${step.stepType} (${step.title})`);
      console.log(`  Student: ${step.studentText.substring(0, 200)}${step.studentText.length > 200 ? '...' : ''}`);
      console.log(`  OWL: ${step.owlText.substring(0, 150)}`);
      if (step.interaction?.type === 'multiple_choice') {
        console.log(`  Q: ${step.interaction.question}`);
        console.log(`  Options: ${step.interaction.options?.join(' | ')}`);
        console.log(`  Correct: ${step.interaction.correctIndex} | Explanation: ${step.interaction.explanation?.substring(0, 100)}`);
      }
      if (step.interaction?.type === 'open_response') {
        console.log(`  Prompt: ${step.interaction.prompt}`);
      }
    });

    // Validate
    const validation = engine.validateJourney(journey, blueprint);
    console.log(`\n--- VALIDATION ---`);
    console.log(`Valid: ${validation.valid}`);
    if (validation.errors.length > 0) {
      validation.errors.forEach(e => console.log(`  ERROR: ${e}`));
    } else {
      console.log('All checks passed!');
    }

    // Compare with old journey
    const oldJourney = meta.studentJourneyDraft || meta.studentJourney || [];
    if (oldJourney.length > 0) {
      console.log('\n--- OLD JOURNEY COMPARISON ---');
      const missionStep = oldJourney[1];
      if (missionStep) {
        console.log(`OLD Mission: ${missionStep.studentText?.substring(0, 150)}`);
        const isGeneric = /explore\s+.*\s+together/i.test(missionStep.studentText || '');
        console.log(`Is generic: ${isGeneric}`);
      }
      const learnStep = oldJourney[3];
      if (learnStep) {
        console.log(`OLD Learn: ${learnStep.studentText?.substring(0, 150)}`);
        const copiesTitle = (learnStep.studentText || '').includes(lesson.title);
        console.log(`Copies title: ${copiesTitle}`);
      }
    }
  }
}

main().catch(e => console.error(e));
