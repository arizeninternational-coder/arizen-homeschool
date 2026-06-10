#!/usr/bin/env node
/** QA Scanner for Grade 2 English (theme-based) — 90 lessons */
const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) return;
  const key = trimmed.slice(0, eqIdx).trim();
  let val = trimmed.slice(eqIdx + 1).trim();
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
  envVars[key] = val;
});
const { createClient } = require('@supabase/supabase-js');
const db = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const REQUIRED = ['welcome','mission','think_first','learn','connect','example','practice','quick_check','reflect','complete'];
const LEAKS = [/the answer is\s+\d+/i, /correct answer is/i];

async function main() {
  const { data: themes } = await db.from('Theme').select('id').eq('slug', 'g2-english');
  if (!themes || !themes.length) { console.error('Theme not found'); process.exit(1); }
  const { data: quests } = await db.from('Quest').select('id').eq('themeId', themes[0].id);
  if (!quests || !quests.length) { console.error('No quests'); process.exit(1); }

  let all = [], off = 0;
  while (true) {
    const { data } = await db.from('Lesson').select('*').in('questId', quests.map(q => q.id)).order('orderIndex').range(off, off + 199);
    if (!data || !data.length) break;
    all = all.concat(data); off += 200;
    if (data.length < 200) break;
  }

  console.log('QA SCANNER — Grade 2 English (theme-based)');
  console.log('Lessons scanned: ' + all.length + '\n');

  let total = 0, crit = 0, high = 0, med = 0, low = 0;
  const clean = [], issues = [];

  for (const l of all) {
    let meta = {};
    try { meta = JSON.parse(l.contentBlocks || '{}'); } catch {}
    const journey = meta.studentJourneyDraft || [];
    const li = [];

    if (journey.length !== 10) li.push({ s: 'HIGH', m: 'Expected 10 steps, got ' + journey.length });
    const types = journey.map(s => s.stepType);
    for (let i = 0; i < REQUIRED.length; i++) {
      if (types[i] !== REQUIRED[i]) li.push({ s: 'HIGH', m: 'Step ' + i + ': expected ' + REQUIRED[i] + ', got ' + (types[i] || 'missing') });
    }
    const qc = journey.find(s => s.stepType === 'quick_check');
    if (!qc) li.push({ s: 'CRITICAL', m: 'Missing quick_check' });
    else if (!qc.interaction || qc.interaction.type === 'none') li.push({ s: 'CRITICAL', m: 'Quick Check has no interaction' });
    else if (qc.interaction.type === 'multiple_choice') {
      if (!qc.interaction.options || qc.interaction.options.length < 2) li.push({ s: 'HIGH', m: 'MCQ has < 2 options' });
      if (qc.interaction.correctIndex === undefined) li.push({ s: 'HIGH', m: 'MCQ missing correctIndex' });
    }
    for (const step of journey) {
      const texts = [step.owlText, step.studentText].filter(Boolean);
      for (const t of texts) for (const p of LEAKS) if (p.test(t)) li.push({ s: 'CRITICAL', m: 'Answer leak in ' + step.stepType + ': ' + t.substring(0, 80) });
    }
    for (const step of journey) {
      if (!step.title) li.push({ s: 'MEDIUM', m: step.stepType + ' missing title' });
      if (!step.studentText) li.push({ s: 'HIGH', m: step.stepType + ' missing studentText' });
      if (!step.owlText) li.push({ s: 'MEDIUM', m: step.stepType + ' missing owlText' });
    }

    if (!li.length) clean.push(l.title);
    else { issues.push({ title: l.title, items: li }); for (const i of li) { total++; if (i.s === 'CRITICAL') crit++; else if (i.s === 'HIGH') high++; else if (i.s === 'MEDIUM') med++; else low++; }
    }
  }

  console.log('Total issues: ' + total + ' | CRITICAL: ' + crit + ' | HIGH: ' + high + ' | MEDIUM: ' + med + ' | LOW: ' + low);
  if (issues.length) { console.log('\n--- Issues ---'); for (const { title, items } of issues) { console.log('\n  ' + title + ':'); for (const i of items) console.log('    [' + i.s + '] ' + i.m); } }
  console.log('\nClean: ' + clean.length + '/' + all.length);
  console.log(crit === 0 && high === 0 ? '✅ PASS' : '❌ FAIL');
  process.exit(crit > 0 || high > 0 ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });
