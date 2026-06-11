#!/usr/bin/env node
const fs = require('fs');
const env = {};
fs.readFileSync('.env','utf-8').split('\n').forEach(l => { const t=l.trim(); if(!t||t.startsWith('#'))return; const i=t.indexOf('='); if(i===-1)return; env[t.slice(0,i).trim()]=t.slice(i+1).trim().replace(/^['"]|['"]$/g,''); });
const { createClient } = require('@supabase/supabase-js');
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const BAD_PATTERNS = [
  'record your measurements',
  'write down 3 things that can be measured',
  'classroom door',
  'thing 1',
  'illustration coming soon',
  'pay attention, then it is your turn',
  'let me show you an example. watch carefully',
  'this is a fun quiz',
  'well done, friend',
  'practice: try what you learned today',
  // Note: 'what do you already know about' is now used correctly in think_first steps
];

async function main() {
  console.log('=== GRADE 2 REGRESSION AUDIT ===\n');

  // Get all Grade 2 lessons
  const { data: themes } = await db.from('Theme').select('id, title').eq('grade', 2);
  const themeIds = themes?.map(t => t.id) || [];
  const { data: quests } = await db.from('Quest').select('id, themeId').in('themeId', themeIds);
  const questIds = quests?.map(q => q.id) || [];
  const { data: lessons } = await db.from('Lesson').select('id, title, slug, contentBlocks').in('questId', questIds);

  console.log('Total Grade 2 lessons: ' + (lessons?.length || 0));

  let totalChecked = 0;
  let totalBad = 0;
  const badLessons = [];
  const sampleGood = [];

  for (const lesson of lessons || []) {
    let meta = {};
    try { meta = JSON.parse(lesson.contentBlocks || '{}'); } catch(e) {}
    const journey = meta.studentJourneyDraft || meta.studentJourney || [];
    if (!journey.length) continue;

    totalChecked++;
    const allText = journey.map(s => (s.studentText||'') + ' ' + (s.owlText||'') + ' ' + ((s.interaction||{}).options||[]).join(' ')).join(' ').toLowerCase();

    const foundBad = BAD_PATTERNS.filter(p => allText.includes(p));
    if (foundBad.length > 0) {
      totalBad++;
      badLessons.push({ id: lesson.id, title: lesson.title, patterns: foundBad, strand: meta.strand || '?' });
    } else if (sampleGood.length < 30) {
      sampleGood.push({ id: lesson.id, title: lesson.title, strand: meta.strand || '?' });
    }
  }

  console.log('\n--- Results ---');
  console.log('Journeys checked: ' + totalChecked);
  console.log('Still contaminated: ' + totalBad);
  console.log('Clean sample: ' + sampleGood.length);

  if (totalBad > 0) {
    console.log('\n--- Still Contaminated ---');
    badLessons.forEach(l => {
      console.log('  ✗ [' + l.id.substring(0,8) + '] ' + l.title + ' [' + l.strand + ']');
      console.log('    ' + l.patterns.join(', '));
    });
  }

  console.log('\n--- Sample Clean Lessons ---');
  sampleGood.forEach(l => {
    console.log('  ✓ [' + l.id.substring(0,8) + '] ' + l.title + ' [' + l.strand + ']');
  });

  // Check specific subjects
  console.log('\n--- By Subject ---');
  const bySubject = {};
  for (const lesson of lessons || []) {
    let meta = {};
    try { meta = JSON.parse(lesson.contentBlocks || '{}'); } catch(e) {}
    const s = meta.subject || meta.strand || 'unknown';
    if (!bySubject[s]) bySubject[s] = { total: 0, bad: 0 };
    bySubject[s].total++;
    const journey = meta.studentJourneyDraft || meta.studentJourney || [];
    const allText = journey.map(st => (st.studentText||'') + ' ' + (st.owlText||'')).join(' ').toLowerCase();
    const hasBad = BAD_PATTERNS.some(p => allText.includes(p));
    if (hasBad) bySubject[s].bad++;
  }
  Object.entries(bySubject).sort().forEach(function(entry) {
    const s = entry[0]; var d = entry[1];
    console.log('  ' + s + ': ' + d.total + ' lessons, ' + d.bad + ' contaminated');
  });
}
main().catch(function(e) { console.error(e); process.exit(1); });
