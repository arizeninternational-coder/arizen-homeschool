#!/usr/bin/env node
/** READ-ONLY: Inspect a sample journey to verify quality */
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
  // Get a sample lesson with journey
  const { data } = await db.from('Lesson').select('id,title,slug,contentBlocks').eq('slug', 'following-simple-instructions').single();
  const cb = JSON.parse(data.contentBlocks);
  const journey = cb.studentJourneyDraft;
  
  console.log('Lesson:', data.title);
  console.log('Strand:', cb.strand);
  console.log('SLO:', cb.specificLearningOutcome);
  console.log('Steps:', journey.length);
  console.log('');
  
  for (const step of journey) {
    console.log(`── Step ${step.id} (${step.stepType}) ──`);
    console.log(`  Title: ${step.title}`);
    console.log(`  Student: ${step.studentText.substring(0, 120)}...`);
    console.log(`  Owl: ${step.owlText.substring(0, 100)}...`);
    if (step.interaction && step.interaction.type !== 'none') {
      console.log(`  Interaction: ${step.interaction.type}`);
      if (step.interaction.question) console.log(`  Q: ${step.interaction.question}`);
      if (step.interaction.options) console.log(`  Options: ${JSON.stringify(step.interaction.options)}`);
      if (step.interaction.correctIndex !== undefined) console.log(`  Correct: ${step.interaction.correctIndex}`);
    }
    console.log('');
  }
  
  // Check another lesson for Quick Check variety
  const { data: data2 } = await db.from('Lesson').select('id,title,slug,contentBlocks').eq('slug', 'syllables-in-words').single();
  const cb2 = JSON.parse(data2.contentBlocks);
  const qc2 = cb2.studentJourneyDraft.find(s => s.stepType === 'quick_check');
  console.log('── Syllables in Words Quick Check ──');
  console.log('Q:', qc2.interaction.question);
  console.log('Options:', JSON.stringify(qc2.interaction.options));
  
  const { data: data3 } = await db.from('Lesson').select('id,title,slug,contentBlocks').eq('slug', 'spelling-new-words').single();
  const cb3 = JSON.parse(data3.contentBlocks);
  const qc3 = cb3.studentJourneyDraft.find(s => s.stepType === 'quick_check');
  console.log('\\n── Spelling New Words Quick Check ──');
  console.log('Q:', qc3.interaction.question);
  console.log('Options:', JSON.stringify(qc3.interaction.options));
}
main().catch(e => { console.error(e); process.exit(1); });
