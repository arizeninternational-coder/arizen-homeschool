#!/usr/bin/env node
const fs = require('fs');
const env = {};
fs.readFileSync('.env','utf-8').split('\n').forEach(l => { const t=l.trim(); if(!t||t.startsWith('#'))return; const i=t.indexOf('='); if(i===-1)return; env[t.slice(0,i).trim()]=t.slice(i+1).trim().replace(/^['\"]|['\"]$/g,''); });
const { createClient } = require('@supabase/supabase-js');
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function qaSubject(slug) {
  const { data: theme } = await db.from('Theme').select('id').eq('slug', slug).single();
  if (!theme) { console.log(slug + ': theme not found'); return; }
  const { data: quests } = await db.from('Quest').select('id').eq('themeId', theme.id);
  let all = [], off = 0;
  while (true) {
    const { data } = await db.from('Lesson').select('id, title, contentBlocks').in('questId', quests.map(q=>q.id)).range(off, off+199);
    if (!data?.length) break;
    all = all.concat(data); off += 200;
    if (data.length < 200) break;
  }
  let pass = 0, fail = 0;
  const failures = [];
  for (const l of all) {
    let meta = {};
    try { meta = JSON.parse(l.contentBlocks || '{}'); } catch {}
    const draft = meta.studentJourneyDraft || [];
    const issues = [];
    if (draft.length !== 10) issues.push('steps:' + draft.length);
    const qc = draft.find(s => s.stepType === 'quick_check');
    if (!qc) issues.push('no QC');
    else if (!qc.interaction || qc.interaction.type !== 'multiple_choice') issues.push('QC no MCQ');
    else if (!qc.interaction.options || qc.interaction.options.length < 2) issues.push('QC options<2');
    if (issues.length === 0) pass++;
    else { fail++; failures.push(l.title.substring(0,50) + ': ' + issues.join(', ')); }
  }
  console.log(slug + ': ' + pass + '/' + all.length + ' pass, ' + fail + ' fail');
  if (failures.length) failures.forEach(f => console.log('  ✗ ' + f));
}
async function main() {
  await qaSubject('g2-kiswahili');
  await qaSubject('g2-environmental');
}
main().catch(e => console.error(e));
