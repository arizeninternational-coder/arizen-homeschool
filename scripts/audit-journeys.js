#!/usr/bin/env node
const fs = require('fs');
const env = {};
fs.readFileSync('.env','utf-8').split('\n').forEach(l => { const t=l.trim(); if(!t||t.startsWith('#'))return; const i=t.indexOf('='); if(i===-1)return; env[t.slice(0,i).trim()]=t.slice(i+1).trim().replace(/^['\"]|['\"]$/g,''); });
const { createClient } = require('@supabase/supabase-js');
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function auditJourney(slug, sampleSize) {
  const { data: theme } = await db.from('Theme').select('id').eq('slug', slug).single();
  const { data: quests } = await db.from('Quest').select('id').eq('themeId', theme.id);
  let all = [], off = 0;
  while (true) {
    const { data } = await db.from('Lesson').select('id, title, contentBlocks').in('questId', quests.map(q=>q.id)).range(off, off+199);
    if (!data?.length) break;
    all = all.concat(data); off += 200;
    if (data.length < 200) break;
  }
  
  // Sample lessons
  const samples = [];
  for (let i = 0; i < all.length; i += Math.max(1, Math.floor(all.length / sampleSize))) {
    samples.push(all[i]);
  }
  
  console.log('\n=== ' + slug + ' (' + all.length + ' lessons, sampling ' + samples.length + ') ===');
  
  let issues = 0;
  for (const l of samples) {
    let meta = {};
    try { meta = JSON.parse(l.contentBlocks || '{}'); } catch {}
    const draft = meta.studentJourneyDraft || [];
    const li = [];
    
    // Check step count
    if (draft.length !== 10) li.push('STEPS: ' + draft.length + ' (expected 10)');
    
    // Check step types
    const types = draft.map(s => s.stepType);
    const expected = ['welcome','mission','think_first','learn','connect','example','practice','quick_check','reflect','complete'];
    for (let i = 0; i < Math.max(types.length, expected.length); i++) {
      if (types[i] !== expected[i]) li.push('STEP ' + i + ': got ' + (types[i]||'missing') + ', expected ' + expected[i]);
    }
    
    // Check QC interaction
    const qc = draft.find(s => s.stepType === 'quick_check');
    if (!qc) li.push('NO QC');
    else if (!qc.interaction || qc.interaction.type !== 'multiple_choice') li.push('QC NO MCQ');
    else if (!qc.interaction.options || qc.interaction.options.length < 2) li.push('QC OPTIONS < 2');
    
    // Check for empty content
    for (const step of draft) {
      if (!step.studentText || step.studentText.trim().length < 10) li.push(step.stepType + ': empty/short studentText');
      if (!step.owlText || String(step.owlText).trim().length < 10) li.push(step.stepType + ': empty/short owlText');
    }
    
    // Check for repeated greetings
    const greetings = draft.filter(s => {
      const t = String(s.studentText||'').toLowerCase();
      return t.includes('hello') || t.includes('habari') || t.includes('karibu');
    }).length;
    if (greetings > 1) li.push('REPEATED GREETINGS: ' + greetings);
    
    // Check mission specificity
    const mission = draft.find(s => s.stepType === 'mission');
    if (mission) {
      const mt = String(mission.studentText||'').toLowerCase();
      if (mt.includes('we will work together') || mt.includes('try your best') || mt.includes('pay close attention')) {
        li.push('GENERIC MISSION');
      }
    }
    
    // Check for answer leaks in non-QC steps
    for (const step of draft) {
      if (step.stepType === 'quick_check') continue;
      const text = String(step.studentText||'') + ' ' + String(step.owlText||'');
      if (/the answer is/i.test(text) || /correct answer is/i.test(text)) {
        li.push('ANSWER LEAK in ' + step.stepType);
      }
    }
    
    if (li.length > 0) {
      issues++;
      console.log('\n  ✗ ' + l.title.substring(0, 60));
      li.forEach(i => console.log('    - ' + i));
    }
  }
  
  if (issues === 0) {
    console.log('  ✅ All ' + samples.length + ' sampled journeys pass structure checks');
  } else {
    console.log('  ✗ ' + issues + '/' + samples.length + ' journeys have issues');
  }
}

async function main() {
  await auditJourney('g2-english', 10);
  await auditJourney('g2-english-language-activities', 5);
  await auditJourney('g2-kiswahili', 10);
  await auditJourney('g2-environmental', 10);
  await auditJourney('g2-hygiene-nutrition', 5);
  await auditJourney('g2-movement', 10);
}
main().catch(e => console.error(e));
