#!/usr/bin/env node
/** Fix the 11-step lesson by regenerating it with correct 10 steps */
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

function step(type, title, student, owl, extra) {
  return { id: type, stepType: type, title, studentText: student, owlText: owl, visualType: 'owl_teacher', interaction: { type: 'none' }, media: {}, ...extra };
}
function mcq(q, opts, correct, expl) { return { type: 'multiple_choice', question: q, options: opts, correctIndex: correct, explanation: expl }; }
function openResp(p) { return { type: 'open_response', prompt: p, placeholder: 'Type your answer here...' }; }

async function main() {
  const { data: lessons } = await db.from('Lesson').select('id, title, contentBlocks').ilike('title', '%past continuous%');
  if (!lessons || !lessons.length) { console.log('Not found'); return; }

  for (const l of lessons) {
    let meta = {};
    try { meta = JSON.parse(l.contentBlocks); } catch {}
    const journey = meta.studentJourneyDraft || [];
    if (journey.length === 10) { console.log('Already 10 steps, skipping'); continue; }

    // Regenerate with correct 10 steps
    const title = l.title;
    const qc = {
      question: 'Which sentence uses past continuous correctly?',
      options: ['She was walking to school', 'She walk to school', 'She walking to school', 'She is walk to school'],
      correctIndex: 0,
      explanation: 'Past continuous uses "was/were" + verb-ing. "She was walking" is correct!',
    };
    const fixed = [
      step('welcome', 'Welcome to ' + title + '!', 'Hello, friend! Today we will practice past continuous tense. This is a grammar adventure!', 'Hello! I am OWL. Today we will learn about past continuous tense. Are you ready?'),
      step('mission', 'Our Grammar Mission', 'Your mission today is to use past continuous tense correctly. We will learn to talk about things that were happening!', 'Our mission is to master past continuous tense. Pay close attention!'),
      step('think_first', 'What Do You Know?', 'Before we start, think about this: What were you doing yesterday at lunchtime? Take a moment to think.', 'Let us think together. What were you doing yesterday at lunchtime?', { interaction: openResp('What were you doing yesterday at lunchtime?') }),
      step('learn', "Let's Learn Together", 'Past continuous tense describes actions that were happening at a specific time. We use "was/were" + verb-ing.', 'Here is something important: past continuous uses "was/were" + verb-ing. Like "She was walking to school."'),
      step('connect', 'Connect to Real Life', 'Think about when you use past continuous. "I was playing when..." "She was cooking while..." When do we use this tense?', 'We use past continuous to talk about actions that were happening at a specific time in the past.'),
      step('example', "Let's Try an Example", 'Let me show you: "The boy was running when he fell." The running was happening when something else occurred. Now you try!', 'Watch this example carefully. The past continuous action (running) was interrupted by another action (fell).'),
      step('practice', 'Your Turn', 'Practice: Write 5 sentences using past continuous tense. Use "was" or "were" + verb-ing. Example: "I was reading when the phone rang."', 'You are doing great! Keep practising — the more you write, the better you get.'),
      step('quick_check', 'Quick Check!', 'Let us see how much you remember!', 'This is a fun quiz! Pick the best answer.', { interaction: mcq(qc.question, qc.options, qc.correctIndex, qc.explanation) }),
      step('reflect', 'Think About Your Learning', 'What did you learn about past continuous tense today? Write your answer.', 'You worked hard today! Think about what you learned.', { interaction: openResp('What did you learn about past continuous tense?') }),
      step('complete', 'Well Done!', 'Congratulations! You completed today\'s past continuous tense lesson. You are becoming great at grammar!', 'Well done, friend! I am proud of you!'),
    ];

    const upd = { ...meta, studentJourneyDraft: fixed, aiMetadata: { batchId: 'grade-2-english-theme-fix', generatedAt: new Date().toISOString(), generator: 'english-theme-v1-fix' } };
    const { error } = await db.from('Lesson').update({ contentBlocks: JSON.stringify(upd) }).eq('id', l.id);
    if (error) console.error('Error:', error.message);
    else console.log('Fixed: ' + title + ' — now ' + fixed.length + ' steps');
  }
}
main().catch(e => { console.error(e); process.exit(1); });
