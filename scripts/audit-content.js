#!/usr/bin/env node
const fs = require('fs');
const env = {};
fs.readFileSync('.env','utf-8').split('\n').forEach(l => { const t=l.trim(); if(!t||t.startsWith('#'))return; const i=t.indexOf('='); if(i===-1)return; env[t.slice(0,i).trim()]=t.slice(i+1).trim().replace(/^['\"]|['\"]$/g,''); });
const { createClient } = require('@supabase/supabase-js');
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const GENERIC_PHRASES = [
  'we will work together',
  'try your best',
  'pay close attention',
  'have fun',
  'let us begin',
  'let us think together',
  'there is no wrong answer',
  'you are doing great',
  'keep practising',
  'i am proud of you',
  'practice makes perfect',
  'words and sounds',
  'integrated review',
  'formative assessment',
  'today we will learn about',
  'what do you already know about',
  'think about what you learned',
];

async function auditContent(slug, sampleSize) {
  const { data: theme } = await db.from('Theme').select('id').eq('slug', slug).single();
  const { data: quests } = await db.from('Quest').select('id').eq('themeId', theme.id);
  let all = [], off = 0;
  while (true) {
    const { data } = await db.from('Lesson').select('id, title, contentBlocks').in('questId', quests.map(q=>q.id)).range(off, off+199);
    if (!data?.length) break;
    all = all.concat(data); off += 200;
    if (data.length < 200) break;
  }
  
  // Sample more thoroughly
  const samples = [];
  for (let i = 0; i < all.length; i += Math.max(1, Math.floor(all.length / sampleSize))) {
    samples.push(all[i]);
  }
  
  console.log('\n=== ' + slug + ' content audit (' + samples.length + ' samples) ===');
  
  let issues = 0;
  for (const l of samples) {
    let meta = {};
    try { meta = JSON.parse(l.contentBlocks || '{}'); } catch {}
    const draft = meta.studentJourneyDraft || [];
    const li = [];
    
    // Check for generic phrases
    const allText = draft.map(s => String(s.studentText||'') + ' ' + String(s.owlText||'')).join(' ').toLowerCase();
    for (const phrase of GENERIC_PHRASES) {
      if (allText.includes(phrase)) {
        li.push('GENERIC: "' + phrase + '"');
      }
    }
    
    // Check mission specificity
    const mission = draft.find(s => s.stepType === 'mission');
    if (mission) {
      const mt = String(mission.studentText||'');
      // Mission should reference the lesson topic
      const titleWords = l.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      const missionLower = mt.toLowerCase();
      const hasTopicReference = titleWords.some(w => missionLower.includes(w));
      if (!hasTopicReference && mt.length < 50) {
        li.push('MISSION NOT SPECIFIC TO TITLE');
      }
    }
    
    // Check for answer leaks
    for (const step of draft) {
      if (step.stepType === 'quick_check') continue;
      const text = String(step.studentText||'') + ' ' + String(step.owlText||'');
      if (/the answer is/i.test(text) || /correct answer is/i.test(text) || /jibu ni/i.test(text)) {
        li.push('ANSWER LEAK in ' + step.stepType + ': ' + text.substring(0, 80));
      }
    }
    
    // Check learn step is substantive
    const learn = draft.find(s => s.stepType === 'learn');
    if (learn && String(learn.studentText||'').length < 80) {
      li.push('LEARN STEP TOO SHORT: ' + String(learn.studentText||'').length + ' chars');
    }
    
    // Check for repeated content across steps
    const stepTexts = draft.map(s => String(s.studentText||'').toLowerCase().trim());
    for (let i = 0; i < stepTexts.length; i++) {
      for (let j = i + 1; j < stepTexts.length; j++) {
        if (stepTexts[i] === stepTexts[j] && stepTexts[i].length > 20) {
          li.push('DUPLICATE: step ' + i + ' and step ' + j + ' have identical content');
        }
      }
    }
    
    if (li.length > 0) {
      issues++;
      console.log('\n  ✗ ' + l.title.substring(0, 70));
      li.forEach(i => console.log('    - ' + i));
    }
  }
  
  if (issues === 0) {
    console.log('  ✅ No content issues found in ' + samples.length + ' samples');
  }
  return issues;
}

async function main() {
  let total = 0;
  total += await auditContent('g2-english', 15);
  total += await auditContent('g2-english-language-activities', 10);
  total += await auditContent('g2-kiswahili', 15);
  total += await auditContent('g2-environmental', 15);
  total += await auditContent('g2-hygiene-nutrition', 10);
  total += await auditContent('g2-movement', 15);
  console.log('\n=== TOTAL CONTENT ISSUES: ' + total + ' ===');
}
main().catch(e => console.error(e));
