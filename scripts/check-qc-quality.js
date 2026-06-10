#!/usr/bin/env node
/** READ-ONLY: Check which lessons got fallback Quick Check questions */
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

async function main() {
  let all = [];
  let offset = 0;
  while (true) {
    const { data } = await db.from('Lesson').select('id,title,slug,contentBlocks').range(offset, offset + 199);
    if (!data || data.length === 0) break;
    all = all.concat(data);
    offset += 200;
    if (data.length < 200) break;
  }

  const english = all.filter(l => {
    try { const cb = typeof l.contentBlocks === 'string' ? JSON.parse(l.contentBlocks) : l.contentBlocks; return cb?.subject === 'English Language Activities'; } catch { return false; }
  });

  const fallbackQ = 'What is one important thing you learned in';
  let fallbackCount = 0;
  
  for (const l of english) {
    const cb = JSON.parse(l.contentBlocks);
    const qc = cb.studentJourneyDraft?.find(s => s.stepType === 'quick_check');
    if (qc?.interaction?.question?.includes(fallbackQ)) {
      fallbackCount++;
      console.log(`FALLBACK: ${l.title} (strand: ${cb.strand}, slo: ${cb.specificLearningOutcome?.substring(0, 80)})`);
    }
  }
  
  console.log(`\\nTotal fallback questions: ${fallbackCount} / ${english.length}`);
  
  // Also check for any answer leaks
  console.log('\\n── Answer Leak Check ──');
  let leakCount = 0;
  for (const l of english) {
    const cb = JSON.parse(l.contentBlocks);
    const journey = cb.studentJourneyDraft || [];
    for (const step of journey) {
      const text = (step.owlText || '') + ' ' + (step.studentText || '');
      if (/the answer is \d/i.test(text) || /answer is \d+/.test(text)) {
        console.log(`  LEAK: ${l.title} step ${step.id}: "${text.substring(0, 100)}"`);
        leakCount++;
      }
    }
  }
  console.log(`Answer leaks found: ${leakCount}`);
}
main().catch(e => { console.error(e); process.exit(1); });
