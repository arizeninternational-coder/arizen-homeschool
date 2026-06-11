#!/usr/bin/env node
const fs = require('fs');
const env = {};
fs.readFileSync('.env','utf-8').split('\n').forEach(l => { const t=l.trim(); if(!t||t.startsWith('#'))return; const i=t.indexOf('='); if(i===-1)return; env[t.slice(0,i).trim()]=t.slice(i+1).trim().replace(/^['\"]|['\"]$/g,''); });
const { createClient } = require('@supabase/supabase-js');
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

function extractTopic(title) {
  const parts = title.split(':');
  if (parts.length >= 2) return parts.slice(1).join(':').trim().toLowerCase();
  return title.toLowerCase();
}

function cleanText(text, title, stepType) {
  if (!text) return text;
  let cleaned = text;
  const lower = cleaned.toLowerCase();
  const topic = extractTopic(title);
  
  // Remove "Today we will learn about [title]" pattern
  if (lower.includes('today we will learn about')) {
    if (stepType === 'think_first') {
      cleaned = `Before we start, think about this: What do you already know about ${topic}? Take a moment to think about it.`;
    } else if (stepType === 'learn') {
      cleaned = cleaned.replace(/today we will learn about [^.!?]+[.!?]?\s*/i, '');
      if (cleaned.length < 30) cleaned = `Let us explore ${topic} together!`;
    } else {
      cleaned = cleaned.replace(/today we will learn about [^.!?]+[.!?]?\s*/i, '');
    }
  }
  
  // Remove "What do you already know about [title]?" pattern
  if (lower.includes('what do you already know about')) {
    cleaned = cleaned.replace(/what do you already know about [^.!?]+[.!?]?\s*/i, `What do you already know about ${topic}?`);
  }
  
  // Remove generic owl phrases
  cleaned = cleaned.replace(/you are doing great[!.]?\s*/gi, 'Well done! ');
  cleaned = cleaned.replace(/i am proud of you[!.]?\s*/gi, 'Great job! ');
  cleaned = cleaned.replace(/have fun[!.]?\s*/gi, 'Let us get started! ');
  cleaned = cleaned.replace(/keep practising[!.]?\s*/gi, 'Keep up the good work! ');
  cleaned = cleaned.replace(/pay close attention[!.]?\s*/gi, 'Listen carefully! ');
  cleaned = cleaned.replace(/let us think together[!.]?\s*/gi, 'Let us think about this together. ');
  cleaned = cleaned.replace(/there is no wrong answer[!.]?\s*/gi, 'Share your thoughts freely. ');
  
  // Fix generic reflect
  if (lower.includes('think about what you learned') && stepType === 'reflect') {
    cleaned = `What new things did you learn about ${topic} today? Write your answer below.`;
  }
  
  return cleaned.trim();
}

async function main() {
  // Get all Grade 2 lessons with journeys
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
  
  console.log('Processing ' + all.length + ' lessons...');
  
  let totalFixed = 0, batch = [];
  
  for (const l of all) {
    let meta = {};
    try { meta = JSON.parse(l.contentBlocks || '{}'); } catch {}
    const draft = meta.studentJourneyDraft || [];
    if (!draft.length) continue;
    
    let needsUpdate = false;
    const cleanedDraft = draft.map(step => {
      const newStudent = cleanText(String(step.studentText || ''), l.title, step.stepType);
      const newOwl = cleanText(String(step.owlText || ''), l.title, step.stepType);
      if (newStudent !== step.studentText || newOwl !== step.owlText) needsUpdate = true;
      return { ...step, studentText: newStudent, owlText: newOwl };
    });
    
    if (!needsUpdate) continue;
    
    batch.push({ id: l.id, meta: meta, draft: cleanedDraft });
    
    // Process in batches of 20
    if (batch.length >= 20) {
      await processBatch(batch);
      totalFixed += batch.length;
      console.log('Fixed ' + totalFixed + ' so far...');
      batch = [];
    }
  }
  
  // Process remaining
  if (batch.length > 0) {
    await processBatch(batch);
    totalFixed += batch.length;
  }
  
  console.log('\nTotal fixed: ' + totalFixed + ' lessons');
}

async function processBatch(batch) {
  for (const item of batch) {
    const upd = { ...item.meta, studentJourneyDraft: item.draft, aiMetadata: { ...(item.meta.aiMetadata||{}), batchId: 'cleanup-v1', generatedAt: new Date().toISOString() } };
    await db.from('Lesson').update({ contentBlocks: JSON.stringify(upd) }).eq('id', item.id);
  }
}
main().catch(e => console.error(e));
