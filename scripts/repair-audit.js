#!/usr/bin/env node
const fs = require('fs');
const env = {};
fs.readFileSync('.env','utf-8').split('\n').forEach(l => { const t=l.trim(); if(!t||t.startsWith('#'))return; const i=t.indexOf('='); if(i===-1)return; env[t.slice(0,i).trim()]=t.slice(i+1).trim().replace(/^['"]|['"]$/g,''); });
const { createClient } = require('@supabase/supabase-js');
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const CONTAMINATION_PATTERNS = [
  'Record your measurements',
  'Write down 3 things that can be measured',
  'classroom door',
  'Thing 1',
  'Illustration coming soon',
  'Pay attention, then it is your turn',
  'Let me show you an example. Watch carefully',
  'This is a fun quiz',
  'Well done, friend',
  'Practice: Try what you learned today',
];

async function main() {
  console.log('=== GRADE 2 REPAIR AUDIT ===\n');

  const { data: themes } = await db.from('Theme').select('id, title, slug').eq('grade', 2);
  const { data: quests } = await db.from('Quest').select('id, title, themeId').in('themeId', themes?.map(t=>t.id)||[]);
  const { data: lessons } = await db.from('Lesson').select('id, title, slug, status, contentBlocks, orderIndex').in('questId', quests?.map(q=>q.id)||[]).order('orderIndex');

  console.log('Total Grade 2 lessons: ' + (lessons?.length || 0));

  let contaminatedCount = 0;
  const contaminatedLessons = [];
  let illustrationCount = 0;

  for (const lesson of lessons || []) {
    let meta = {};
    try { meta = JSON.parse(lesson.contentBlocks || '{}'); } catch(e) {}
    const journey = meta.studentJourneyDraft || meta.studentJourney || [];
    const allText = journey.map(function(s) { return [s.studentText||'', s.owlText||'', (s.interaction||{}).question||'', ((s.interaction||{}).options||[])].join(' '); }).join(' ').toLowerCase();

    const found = CONTAMINATION_PATTERNS.filter(function(p) { return allText.includes(p.toLowerCase()); });
    if (found.length > 0) {
      contaminatedCount++;
      contaminatedLessons.push({ title: lesson.title, slug: lesson.slug, patterns: found, strand: meta.strand || '?' });
    }

    for (const step of journey) {
      const text = (step.studentText||'') + ' ' + (step.owlText||'');
      if (text.includes('Illustration coming soon')) illustrationCount++;
    }
  }

  console.log('\nContaminated journeys: ' + contaminatedCount);
  for (var i = 0; i < Math.min(contaminatedLessons.length, 15); i++) {
    var l = contaminatedLessons[i];
    console.log('  ✗ ' + l.title + ' [' + l.strand + ']');
    console.log('    Patterns: ' + l.patterns.join(', '));
  }
  console.log('\n"Illustration coming soon" occurrences: ' + illustrationCount);

  // Check specific lessons
  var breakfast = lessons?.find(function(l) { return l.title.toLowerCase().includes('breakfast'); });
  if (breakfast) {
    console.log('\n=== "What Is Breakfast?" ===');
    var bm = {};
    try { bm = JSON.parse(breakfast.contentBlocks || '{}'); } catch(e) {}
    var bj = bm.studentJourneyDraft || bm.studentJourney || [];
    console.log('Strand: ' + (bm.strand || '?'));
    bj.forEach(function(step, idx) {
      console.log('  ' + idx + ' (' + step.stepType + '): ' + (step.studentText||'').substring(0, 80));
    });
  }

  // Check Kiswahili lessons
  var kiswahili = lessons?.filter(function(l) {
    var m = {};
    try { m = JSON.parse(l.contentBlocks || '{}'); } catch(e) {}
    return (m.strand||'').toLowerCase().includes('kiswahili') || (m.subject||'').toLowerCase().includes('kiswahili');
  }) || [];
  console.log('\nKiswahili lessons: ' + kiswahili.length);
  kiswahili.slice(0, 5).forEach(function(l) {
    var m = {};
    try { m = JSON.parse(l.contentBlocks || '{}'); } catch(e) {}
    var j = m.studentJourneyDraft || m.studentJourney || [];
    var txt = j.map(function(s) { return (s.studentText||'') + ' ' + (s.owlText||''); }).join(' ').toLowerCase();
    var bad = txt.includes('record your measurements') || txt.includes('write down 3 things') || txt.includes('classroom door');
    console.log('  ' + l.title + ': ' + (bad ? 'CONTAMINATED' : 'clean'));
  });

  // Check progress table
  var { data: prog } = await db.from('Progress').select('*').limit(3);
  console.log('\nProgress records: ' + (prog?.length || 0));
  if (prog && prog.length) console.log('Fields: ' + Object.keys(prog[0]).join(', '));
}
main().catch(function(e) { console.error(e); process.exit(1); });
