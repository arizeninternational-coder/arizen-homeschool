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
  // Get Math theme and quests
  const { data: mathTheme } = await db.from('Theme').select('id, title').eq('grade', 2).ilike('title', '%Mathematics%');
  const mathThemeId = mathTheme?.[0]?.id;
  if (!mathThemeId) { console.log('NO MATH THEME'); return; }

  const { data: quests } = await db.from('Quest').select('id, title').eq('themeId', mathThemeId).order('title');
  const questIds = quests?.map(q => q.id) || [];

  // Get ALL Math lessons with their full contentBlocks
  const { data: lessons } = await db.from('Lesson')
    .select('id, title, contentBlocks, questId, orderIndex')
    .in('questId', questIds)
    .order('orderIndex');

  // Export all lesson data to a JSON file for the generation script
  const output = {
    themeId: mathThemeId,
    quests: quests,
    lessons: (lessons || []).map(l => {
      let cb = {};
      try { cb = JSON.parse(l.contentBlocks || '{}'); } catch(e) {}
      return {
        id: l.id,
        title: l.title,
        questId: l.questId,
        orderIndex: l.orderIndex,
        // Curriculum fields
        subject: cb.subject || cb.strand || '',
        strand: cb.strand || cb.subject || '',
        specificLearningOutcome: cb.specificLearningOutcome || cb.learningOutcome || cb.keyInquiryQuestion || '',
        keyInquiryQuestion: cb.keyInquiryQuestion || '',
        learningOutcome: cb.learningOutcome || cb.specificLearningOutcome || '',
        materials: cb.materials || [],
        // Current journey state
        hasPublishedJourney: !!(cb.studentJourney?.length > 0),
        hasDraftJourney: !!(cb.studentJourneyDraft?.length > 0),
        isAvailable: cb.isAvailable,
        cleared: cb.aiMetadata?.cleared || false,
      };
    })
  };

  // Count stats
  const needsRegeneration = output.lessons.filter(l => l.cleared || !l.hasPublishedJourney);
  console.log(`Total Math lessons: ${output.lessons.length}`);
  console.log(`Already have journeys: ${output.lessons.filter(l => l.hasPublishedJourney).length}`);
  console.log(`Need regeneration: ${needsRegeneration.length}`);
  console.log(`Cleared: ${output.lessons.filter(l => l.cleared).length}`);

  // Write to file
  const outPath = path.join(__dirname, '..', 'scripts', '_math-lessons-data.json');
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`\nWritten to: ${outPath}`);

  // Also get English lessons
  const { data: engTheme } = await db.from('Theme').select('id').eq('grade', 2).eq('slug', 'g2-english');
  if (engTheme?.[0]?.id) {
    const { data: engQuests } = await db.from('Quest').select('id').eq('themeId', engTheme[0].id);
    const engQuestIds = engQuests?.map(q => q.id) || [];
    const { data: engLessons } = await db.from('Lesson')
      .select('id, title, contentBlocks, questId')
      .in('questId', engQuestIds)
      .order('orderIndex');
    
    const engOut = {
      themeId: engTheme[0].id,
      lessons: (engLessons || []).map(l => {
        let cb = {};
        try { cb = JSON.parse(l.contentBlocks || '{}'); } catch(e) {}
        return {
          id: l.id,
          title: l.title,
          questId: l.questId,
          specificLearningOutcome: cb.specificLearningOutcome || cb.learningOutcome || '',
          keyInquiryQuestion: cb.keyInquiryQuestion || '',
          learningOutcome: cb.learningOutcome || '',
          hasPublishedJourney: !!(cb.studentJourney?.length > 0),
          isAvailable: cb.isAvailable,
        };
      })
    };
    
    const engOutPath = path.join(__dirname, '..', 'scripts', '_english-lessons-data.json');
    fs.writeFileSync(engOutPath, JSON.stringify(engOut, null, 2));
    console.log(`\nEnglish lessons: ${engOut.lessons.length}`);
    console.log(`Written to: ${engOutPath}`);
    
    // Print 5 samples
    engOut.lessons.slice(0, 5).forEach(l => {
      console.log(`  - ${l.title.substring(0, 60)} | j=${l.hasPublishedJourney} | outcome: ${(l.specificLearningOutcome || '').substring(0, 40)}`);
    });
  }

  // Print 8 Math samples
  output.lessons.slice(0, 8).forEach(l => {
    console.log(`  - ${l.title.substring(0, 55)} | j=${l.hasPublishedJourney} | cleared=${l.cleared} | outcome: ${(l.specificLearningOutcome || '').substring(0, 40)}`);
  });
}

main().catch(e => console.error('ERROR:', e.message));
