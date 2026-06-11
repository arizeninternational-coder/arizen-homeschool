#!/usr/bin/env node
const fs = require('fs');
const env = {};
fs.readFileSync('.env','utf-8').split('\n').forEach(l => { const t=l.trim(); if(!t||t.startsWith('#'))return; const i=t.indexOf('='); if(i===-1)return; env[t.slice(0,i).trim()]=t.slice(i+1).trim().replace(/^['\"]|['\"]$/g,''); });
const { createClient } = require('@supabase/supabase-js');
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function main() {
  // Check specific lessons that had issues
  const { data: lessons } = await db.from('Lesson')
    .select('title, contentBlocks')
    .ilike('title', '%Reading Short Texts%')
    .limit(5);
  
  if (lessons?.length) {
    console.log('=== Reading Short Texts journeys ===');
    for (const l of lessons) {
      const cb = JSON.parse(l.contentBlocks || '{}');
      const draft = cb.studentJourneyDraft || [];
      console.log('\n' + l.title);
      const tf = draft.find(s => s.stepType === 'think_first');
      if (tf) console.log('  think_first: ' + String(tf.studentText||'').substring(0, 100));
      const learn = draft.find(s => s.stepType === 'learn');
      if (learn) console.log('  learn: ' + String(learn.studentText||'').substring(0, 100));
    }
  }
  
  // Check a Kiswahili journey
  const { data: kLessons } = await db.from('Lesson')
    .select('title, contentBlocks')
    .ilike('title', '%Kusikiliza%')
    .limit(3);
  
  if (kLessons?.length) {
    console.log('\n=== Kiswahili journeys ===');
    for (const l of kLessons) {
      const cb = JSON.parse(l.contentBlocks || '{}');
      const draft = cb.studentJourneyDraft || [];
      console.log('\n' + l.title);
      draft.forEach((s, i) => {
        console.log('  ' + i + ' (' + s.stepType + '): ' + String(s.studentText||'').substring(0, 80));
      });
    }
  }
}
main().catch(e => console.error(e));
