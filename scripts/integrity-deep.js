#!/usr/bin/env node
const fs = require('fs');
const env = {};
fs.readFileSync('.env','utf-8').split('\n').forEach(l => { const t=l.trim(); if(!t||t.startsWith('#'))return; const i=t.indexOf('='); if(i===-1)return; env[t.slice(0,i).trim()]=t.slice(i+1).trim().replace(/^['"]|['"]$/g,''); });
const { createClient } = require('@supabase/supabase-js');
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function main() {
  console.log('=== INTEGRITY DEEP DIVE ===\n');

  const { data: themes } = await db.from('Theme').select('id, title, slug').eq('grade', 2);
  const { data: quests } = await db.from('Quest').select('id, title, themeId').in('themeId', themes?.map(t=>t.id)||[]);
  const { data: lessons } = await db.from('Lesson').select('*').in('questId', quests?.map(q=>q.id)||[]);

  // 1. English duplication check
  console.log('=== 1. ENGLISH DUPLICATION ===\n');
  const englishLessons = lessons?.filter(l => {
    let meta = {};
    try { meta = JSON.parse(l.contentBlocks || '{}'); } catch(e) {}
    return (meta.subject || '').toLowerCase().includes('english') || (meta.strand || '').toLowerCase().includes('english');
  }) || [];

  const englishA = englishLessons.filter(l => {
    let meta = {};
    try { meta = JSON.parse(l.contentBlocks || '{}'); } catch(e) {}
    return (meta.subject || '') === 'English';
  });
  const englishB = englishLessons.filter(l => {
    let meta = {};
    try { meta = JSON.parse(l.contentBlocks || '{}'); } catch(e) {}
    return (meta.subject || '') === 'English Language Activities';
  });

  console.log('English (subject=English): ' + englishA.length);
  console.log('English Language Activities: ' + englishB.length);

  // Compare titles
  console.log('\nEnglish titles (first 10):');
  englishA.slice(0, 10).forEach(l => console.log('  - ' + l.title.substring(0, 80)));
  console.log('\nEnglish Language Activities titles (first 10):');
  englishB.slice(0, 10).forEach(l => console.log('  - ' + l.title.substring(0, 80)));

  // Check if they share themes
  const englishAThemes = new Set(englishA.map(l => { try { return JSON.parse(l.contentBlocks||'{}').themeId || 'N/A'; } catch(e) { return 'N/A'; } }));
  const englishBThemes = new Set(englishB.map(l => { try { return JSON.parse(l.contentBlocks||'{}').themeId || 'N/A'; } catch(e) { return 'N/A'; } }));
  console.log('\nEnglish themes: ' + [...englishAThemes].join(', '));
  console.log('ELA themes: ' + [...englishBThemes].join(', '));

  // 2. Other/Unknown lessons
  console.log('\n=== 2. OTHER/UNKNOWN LESSONS ===\n');
  const unknownLessons = lessons?.filter(l => {
    let meta = {};
    try { meta = JSON.parse(l.contentBlocks || '{}'); } catch(e) {}
    return !meta.strand && !meta.subject;
  }) || [];

  unknownLessons.forEach(l => {
    let meta = {};
    try { meta = JSON.parse(l.contentBlocks || '{}'); } catch(e) {}
    console.log('ID: ' + l.id);
    console.log('Title: ' + l.title);
    console.log('Status: ' + l.status);
    console.log('Subject: ' + (meta.subject || 'N/A'));
    console.log('Strand: ' + (meta.strand || 'N/A'));
    console.log('Sub-strand: ' + (meta.subStrand || 'N/A'));
    console.log('Learning Outcome: ' + (meta.learningOutcome || 'N/A')?.substring(0, 100));
    console.log('Key Inquiry: ' + (meta.keyInquiryQuestion || 'N/A')?.substring(0, 100));
    console.log('Suggested Experience: ' + (meta.suggestedLearningExperience || 'N/A')?.substring(0, 100));
    console.log('---');
  });

  // 3. Published Math lessons without journeys
  console.log('\n=== 3. PUBLISHED MATH LESSONS WITHOUT JOURNEYS ===\n');
  const mathNoJourney = lessons?.filter(l => {
    let meta = {};
    try { meta = JSON.parse(l.contentBlocks || '{}'); } catch(e) {}
    const isMath = (meta.subject || '').toLowerCase().includes('math') || (meta.strand || '').toLowerCase().includes('number');
    const hasJourney = Array.isArray(meta.studentJourneyDraft) && meta.studentJourneyDraft.length > 0;
    return isMath && l.status === 'PUBLISHED' && !hasJourney;
  }) || [];

  mathNoJourney.forEach(l => {
    let meta = {};
    try { meta = JSON.parse(l.contentBlocks || '{}'); } catch(e) {}
    console.log('ID: ' + l.id);
    console.log('Title: ' + l.title);
    console.log('Strand: ' + (meta.strand || 'N/A'));
    console.log('Sub-strand: ' + (meta.subStrand || 'N/A'));
    console.log('Learning Outcome: ' + (meta.learningOutcome || 'N/A')?.substring(0, 100));
    console.log('---');
  });

  // 4. Check for "Record your measurements" in journey JSON
  console.log('\n=== 4. "RECORD YOUR MEASUREMENTS" SOURCE CHECK ===\n');
  let foundMeasurement = 0;
  for (const l of lessons || []) {
    let meta = {};
    try { meta = JSON.parse(l.contentBlocks || '{}'); } catch(e) {}
    const journey = meta.studentJourneyDraft || meta.studentJourney || [];
    const allText = journey.map(s => JSON.stringify(s)).join(' ').toLowerCase();
    if (allText.includes('record your measurements')) {
      foundMeasurement++;
      if (foundMeasurement <= 3) {
        console.log('FOUND in: ' + l.title + ' [' + (meta.strand || '?') + ']');
        console.log('ID: ' + l.id);
        // Show which step
        journey.forEach((step, i) => {
          const stepText = JSON.stringify(step).toLowerCase();
          if (stepText.includes('record your measurements')) {
            console.log('  Step ' + i + ' (' + step.stepType + '):');
            console.log('    ' + JSON.stringify(step).substring(0, 200));
          }
        });
      }
    }
  }
  console.log('Total lessons with "record your measurements": ' + foundMeasurement);
}
main().catch(e => console.error(e));
