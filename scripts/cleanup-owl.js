#!/usr/bin/env node
const fs = require('fs');
const env = {};
fs.readFileSync('.env','utf-8').split('\n').forEach(l => { const t=l.trim(); if(!t||t.startsWith('#'))return; const i=t.indexOf('='); if(i===-1)return; env[t.slice(0,i).trim()]=t.slice(i+1).trim().replace(/^['\"]|['\"]$/g,''); });
const { createClient } = require('@supabase/supabase-js');
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

function cleanOwlText(text) {
  if (!text) return text;
  let cleaned = String(text);
  
  // Replace generic owl phrases with more specific ones
  cleaned = cleaned.replace(/you are doing great[!.]?\s*/gi, 'Well done! ');
  cleaned = cleaned.replace(/i am proud of you[!.]?\s*/gi, 'Great job! ');
  cleaned = cleaned.replace(/keep practising[!.]?\s*/gi, 'Keep up the good work! ');
  cleaned = cleaned.replace(/pay close attention[!.]?\s*/gi, 'Listen carefully! ');
  cleaned = cleaned.replace(/let us think together[!.]?\s*/gi, 'Let us think about this together. ');
  cleaned = cleaned.replace(/there is no wrong answer[!.]?\s*/gi, 'Share your thoughts freely. ');
  cleaned = cleaned.replace(/have fun[!.]?\s*/gi, 'Let us get started! ');
  cleaned = cleaned.replace(/let us begin[!.]?\s*/gi, 'Let us start! ');
  cleaned = cleaned.replace(/try your best[!.]?\s*/gi, 'Do your best! ');
  cleaned = cleaned.replace(/we will work together[!.]?\s*/gi, 'We will learn together. ');
  
  return cleaned.trim();
}

async function main() {
  const { data: themes } = await db.from('Theme').select('id').eq('grade', 2);
  const { data: quests } = await db.from('Quest').select('id').in('themeId', themes.map(t=>t.id));
  if (!quests?.length) { console.log('No quests'); return; }
  
  let all = [], off = 0;
  while (true) {
    const { data } = await db.from('Lesson').select('id, title, contentBlocks').in('questId', quests.map(q=>q.id)).range(off, off+199);
    if (!data?.length) break;
    all = all.concat(data); off += 200;
    if (data.length < 200) break;
  }
  
  let fixed = 0, batch = [];
  
  for (const l of all) {
    let meta = {};
    try { meta = JSON.parse(l.contentBlocks || '{}'); } catch {}
    const draft = meta.studentJourneyDraft || [];
    if (!draft.length) continue;
    
    let needsUpdate = false;
    const cleanedDraft = draft.map(step => {
      const newOwl = cleanOwlText(step.owlText);
      if (newOwl !== step.owlText) needsUpdate = true;
      return { ...step, owlText: newOwl };
    });
    
    if (!needsUpdate) continue;
    
    batch.push({ id: l.id, draft: cleanedDraft, meta });
    
    if (batch.length >= 25) {
      for (const item of batch) {
        const upd = { ...item.meta, studentJourneyDraft: item.draft, aiMetadata: { ...(item.meta.aiMetadata||{}), batchId: 'cleanup-owl-v2', generatedAt: new Date().toISOString() } };
        await db.from('Lesson').update({ contentBlocks: JSON.stringify(upd) }).eq('id', item.id);
      }
      fixed += batch.length;
      console.log('Fixed ' + fixed + '...');
      batch = [];
    }
  }
  
  if (batch.length > 0) {
    for (const item of batch) {
      const upd = { ...item.meta, studentJourneyDraft: item.draft, aiMetadata: { ...(item.meta.aiMetadata||{}), batchId: 'cleanup-owl-v2', generatedAt: new Date().toISOString() } };
      await db.from('Lesson').update({ contentBlocks: JSON.stringify(upd) }).eq('id', item.id);
    }
    fixed += batch.length;
  }
  
  console.log('\nTotal fixed: ' + fixed + ' lessons');
}
main().catch(e => console.error(e));
