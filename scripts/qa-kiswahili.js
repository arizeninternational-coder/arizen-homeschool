#!/usr/bin/env node
const fs = require('fs');
const env = {};
fs.readFileSync('.env','utf-8').split('\n').forEach(l => { const t=l.trim(); if(!t||t.startsWith('#'))return; const i=t.indexOf('='); if(i===-1)return; env[t.slice(0,i).trim()]=t.slice(i+1).trim().replace(/^['\"]|['\"]$/g,''); });
const { createClient } = require('@supabase/supabase-js');
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const REQUIRED = ['welcome','mission','think_first','learn','connect','example','practice','quick_check','reflect','complete'];
const LEAKS = [/jibu ni/i, /sahihi ni/i];

async function main() {
  const { data: theme } = await db.from('Theme').select('id').eq('slug', 'g2-kiswahili').single();
  const { data: quests } = await db.from('Quest').select('id').eq('themeId', theme.id);
  let all = [], off = 0;
  while (true) {
    const { data } = await db.from('Lesson').select('id, title, contentBlocks').in('questId', quests.map(q=>q.id)).order('orderIndex').range(off, off+199);
    if (!data?.length) break;
    all = all.concat(data); off += 200;
    if (data.length < 200) break;
  }

  let total = 0, crit = 0, high = 0, med = 0, low = 0;
  const clean = [], issues = [];

  for (const l of all) {
    let meta = {};
    try { meta = JSON.parse(l.contentBlocks || '{}'); } catch {}
    const journey = meta.studentJourneyDraft || [];
    const li = [];

    if (journey.length !== 10) li.push({s:'HIGH', m:'Steps: ' + journey.length});
    const types = journey.map(s => s.stepType);
    for (let i = 0; i < REQUIRED.length; i++) {
      if (types[i] !== REQUIRED[i]) li.push({s:'HIGH', m:'Step ' + i + ': expected ' + REQUIRED[i] + ', got ' + (types[i] || 'missing')});
    }
    const qc = journey.find(s => s.stepType === 'quick_check');
    if (!qc) li.push({s:'CRITICAL', m:'Missing quick_check'});
    else if (!qc.interaction || qc.interaction.type === 'none') li.push({s:'CRITICAL', m:'QC has no interaction'});
    else if (qc.interaction.type === 'multiple_choice') {
      if (!qc.interaction.options || qc.interaction.options.length < 2) li.push({s:'HIGH', m:'QC options < 2'});
      if (qc.interaction.correctIndex === undefined) li.push({s:'HIGH', m:'QC no correctIndex'});
    }
    for (const step of journey) {
      const texts = [step.owlText, step.studentText].filter(Boolean);
      for (const t of texts) for (const p of LEAKS) if (p.test(t)) li.push({s:'CRITICAL', m:'Answer leak in ' + step.stepType + ': ' + t.substring(0,80)});
    }

    if (!li.length) clean.push(l.title);
    else { issues.push({title: l.title, items: li}); for (const i of li) { total++; if (i.s==='CRITICAL') crit++; else if (i.s==='HIGH') high++; else if (i.s==='MEDIUM') med++; else low++; }
    }
  }

  console.log('QA SCANNER — Grade 2 Kiswahili');
  console.log('Lessons scanned: ' + all.length);
  console.log('Total issues: ' + total + ' | CRITICAL: ' + crit + ' | HIGH: ' + high + ' | MEDIUM: ' + med + ' | LOW: ' + low);
  if (issues.length) { console.log('\n--- Issues ---'); for (const {title, items} of issues) { console.log('\n  ' + title + ':'); for (const i of items) console.log('    [' + i.s + '] ' + i.m); } }
  console.log('\nClean: ' + clean.length + '/' + all.length);
  console.log(crit === 0 && high === 0 ? '✅ PASS' : '❌ FAIL');
  process.exit(crit > 0 || high > 0 ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });
