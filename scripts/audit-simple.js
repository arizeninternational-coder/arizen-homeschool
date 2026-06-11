#!/usr/bin/env node
const fs = require('fs');
const env = {};
fs.readFileSync('.env','utf-8').split('\n').forEach(l => { const t=l.trim(); if(!t||t.startsWith('#'))return; const i=t.indexOf('='); if(i===-1)return; env[t.slice(0,i).trim()]=t.slice(i+1).trim().replace(/^['"]|['"]$/g,''); });
const { createClient } = require('@supabase/supabase-js');
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function main() {
  // Get a sample of Grade 2 lessons
  const { data: lessons } = await db.from('Lesson')
    .select('id, title, slug, contentBlocks')
    .limit(20);

  console.log('Sample lessons: ' + (lessons?.length || 0));

  let contaminated = 0;
  let illustrationCount = 0;

  for (const lesson of lessons || []) {
    let meta = {};
    try { meta = JSON.parse(lesson.contentBlocks || '{}'); } catch(e) {}
    const journey = meta.studentJourneyDraft || meta.studentJourney || [];
    const allText = journey.map(s => (s.studentText||'') + ' ' + (s.owlText||'')).join(' ').toLowerCase();

    const bad = allText.includes('record your measurements') || allText.includes('write down 3 things') || allText.includes('classroom door') || allText.includes('illustration coming soon');
    if (bad) {
      contaminated++;
      console.log('  CONTAMINATED: ' + lesson.title);
      // Show which patterns
      if (allText.includes('record your measurements')) console.log('    -> measurement leak');
      if (allText.includes('illustration coming soon')) console.log('    -> illustration placeholder');
    }

    for (const step of journey) {
      if ((step.studentText||'').includes('Illustration coming soon') || (step.owlText||'').includes('Illustration coming soon')) {
        illustrationCount++;
      }
    }
  }

  console.log('\nContaminated: ' + contaminated + '/' + (lessons?.length || 0));
  console.log('Illustration coming soon: ' + illustrationCount);

  // Check specific breakfast lesson
  const { data: breakfast } = await db.from('Lesson')
    .select('title, contentBlocks')
    .ilike('title', '%breakfast%')
    .limit(1);

  if (breakfast && breakfast.length) {
    const b = breakfast[0];
    console.log('\n=== Breakfast lesson ===');
    let meta = {};
    try { meta = JSON.parse(b.contentBlocks || '{}'); } catch(e) {}
    const j = meta.studentJourneyDraft || meta.studentJourney || [];
    console.log('Strand: ' + (meta.strand || '?'));
    console.log('Steps: ' + j.length);
    j.forEach((step, i) => {
      console.log('  ' + i + ' (' + step.stepType + '): ' + (step.studentText||'').substring(0, 100));
    });
  }
}
main().catch(e => { console.error(e); process.exit(1); });
