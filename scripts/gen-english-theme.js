#!/usr/bin/env node
/**
 * Generate journeys for Grade 2 English (theme-based) lessons — 90 lessons.
 * Theme: g2-english, subject: 'English'
 * Strands: Listening and Speaking, Reading, Writing, Integrated English Practice
 */
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
const BATCH_ID = 'grade-2-english-theme-batch-1';

function step(type, title, student, owl, extra) {
  return { id: type, stepType: type, title, studentText: student, owlText: owl, visualType: 'owl_teacher', interaction: { type: 'none' }, media: {}, ...extra };
}
function mcq(q, opts, correct, expl) { return { type: 'multiple_choice', question: q, options: opts, correctIndex: correct, explanation: expl }; }
function openResp(prompt) { return { type: 'open_response', prompt, placeholder: 'Type your answer here...' }; }

function buildQC(title, strand) {
  const t = title.toLowerCase(), s = strand.toLowerCase();
  const q = (question, options, correct, explanation) => ({ question, options, correctIndex: correct, explanation });
  if (s.includes('listening') || s.includes('speaking')) {
    if (t.includes('key idea')) return q('What is most important when listening?', ['Look around', 'Focus on the speaker', 'Think of something else', 'Talk to a friend'], 1, 'We focus on the speaker to understand key ideas!');
    if (t.includes('vocabulary') || t.includes('pronunciation')) return q('Why pronounce correctly?', ['Not important', 'So others understand us', 'To speak faster', 'To sound funny'], 1, 'Correct pronunciation helps others understand us!');
    if (t.includes('verb') || t.includes('was') || t.includes('were')) return q('Which is correct?', ['She were happy', 'She was happy', 'She be happy', 'She is were'], 1, 'Use "was" with one person, "were" with many!');
    if (t.includes('polite') || t.includes('please')) return q('Which is polite?', ['Give me that!', 'Please may I have that?', 'I want it now!', 'Hurry up!'], 1, 'Using "please" shows good manners!');
    if (t.includes('instruction')) return q('When given instructions, first?', ['Start doing last thing', 'Listen carefully', 'Close eyes', 'Sing'], 1, 'Listen carefully to all instructions first!');
    if (t.includes('conversation')) return q('Good question words?', ['Run jump play', 'Who what where when why', 'Red blue green', 'Big small tall'], 1, 'Who, what, where, when, why help us ask good questions!');
    return q('What did you learn about ' + t + '?', ['Nothing', 'Something new about listening/speaking', 'Already knew everything', 'Not paying attention'], 1, 'Every lesson teaches us something new!');
  }
  if (s.includes('reading')) {
    if (t.includes('fluency')) return q('What is reading fluency?', ['Reading fastest', 'Reading smoothly with expression', 'Reading silently', 'Reading backwards'], 1, 'Fluency means reading smoothly at a good pace with expression!');
    if (t.includes('comprehension') || t.includes('detail')) return q('What is comprehension?', ['Reading fast', 'Understanding the text', 'Memorizing words', 'Skipping hard parts'], 1, 'Comprehension means understanding what we read!');
    if (t.includes('character') || t.includes('event') || t.includes('story')) return q('When reading a story, pay attention to?', ['Only pictures', 'Characters events setting', 'Only title', 'Page count'], 1, 'We pay attention to characters, events, and setting!');
    if (t.includes('silent')) return q('Important when reading silently?', ['Read aloud', 'Stay focused on text', 'Move around', 'Talk to friend'], 1, 'Stay focused on the text without getting distracted!');
    if (t.includes('phonics') || t.includes('blend') || t.includes('sound')) return q('What is blending sounds?', ['Separate sounds', 'Push sounds together to make words', 'Write letters', 'Erase words'], 1, 'Blending pushes sounds together: c-a-t = "cat"!');
    if (t.includes('sight word')) return q('What are sight words?', ['Very long words', 'Common words we recognize quickly', 'Foreign words', 'Words we never see'], 1, 'Sight words are common words we recognize quickly!');
    return q('What did you learn about reading?', ['Nothing', 'Something new about reading', 'Already knew everything', 'Not paying attention'], 1, 'Every reading lesson makes us better readers!');
  }
  if (s.includes('writing')) {
    if (t.includes('handwriting') || t.includes('letter') || t.includes('formation')) return q('What makes good handwriting?', ['Writing fastest', 'Careful letters with proper spacing', 'Only capitals', 'Writing tiny'], 1, 'Careful letter formation with proper spacing makes writing easy to read!');
    if (t.includes('sentence') || t.includes('compose')) return q('What makes a good sentence?', ['One word', 'Words that make sense, capital letter, full stop', 'Only pictures', 'Very long word'], 1, 'A good sentence has words that make sense, starts with a capital, and ends with a full stop!');
    if (t.includes('spelling') || t.includes('spell')) return q('How do sounds help spelling?', ['They do not help', 'Listen for each sound and write the letter', 'Just guess', 'Copy from friend'], 1, 'Listen for each sound and write the letter: d-o-g = dog!');
    if (t.includes('creative') || t.includes('narrative')) return q('What makes a creative story?', ['Copying a book', 'Imagination with beginning middle end', 'One sentence', 'Only facts'], 1, 'Creative stories use imagination with a clear beginning, middle, and end!');
    return q('What did you learn about writing?', ['Nothing', 'Something new about writing', 'Already knew everything', 'Not paying attention'], 1, 'Every writing lesson makes us better writers!');
  }
  if (s.includes('integrated') || s.includes('review') || s.includes('assessment')) {
    return q('Best way to show what you learned?', ['Keep it to yourself', 'Practice listening speaking reading writing', 'Only one skill', 'Do not try'], 1, 'Practice all English skills: listening, speaking, reading, and writing!');
  }
  return q('What did you learn in "' + title + '"?', ['Nothing', 'Something new about English', 'Already knew everything', 'Not paying attention'], 1, 'Every lesson teaches us something new!');
}

function buildPractice(title, strand) {
  const t = title.toLowerCase(), s = strand.toLowerCase();
  if (s.includes('listening') || s.includes('speaking')) {
    if (t.includes('key idea')) return 'Practice: Listen to someone read a short passage. Tell them the main idea.';
    if (t.includes('vocabulary') || t.includes('pronunciation')) return 'Practice: Say these words out loud 5 times each. Ask someone to help.';
    if (t.includes('verb') || t.includes('grammar')) return 'Practice: Write 5 sentences using "was" or "were" correctly.';
    if (t.includes('polite')) return 'Practice: Role-play asking for something politely. Use "please" and "thank you".';
    if (t.includes('instruction')) return 'Practice: Ask someone to give 3 instructions. Follow them in order!';
    return 'Practice: Tell a partner about your day. Speak clearly and look at them.';
  }
  if (s.includes('reading')) {
    if (t.includes('fluency')) return 'Practice: Read a passage aloud 3 times. Try to read more smoothly each time.';
    if (t.includes('comprehension')) return 'Practice: Read a passage. Answer: Who? What? Where? When?';
    if (t.includes('silent')) return 'Practice: Read silently for 10 minutes. Write down 3 things you learned.';
    if (t.includes('phonics')) return 'Practice: Sound out words: /c/ /a/ /t/ = cat! Try with dog, sun, pen.';
    if (t.includes('sight word')) return 'Practice: Write each sight word 3 times. Use each in a sentence.';
    return 'Practice: Read a passage carefully. Retell it in your own words.';
  }
  if (s.includes('writing')) {
    if (t.includes('handwriting')) return 'Practice: Copy a sentence neatly. Focus on letter size and spacing.';
    if (t.includes('sentence')) return 'Practice: Write 5 sentences about your favourite animal.';
    if (t.includes('spelling')) return 'Practice: Sound out and write: cat, dog, sun, big, red.';
    if (t.includes('creative')) return 'Practice: Write a short story with a beginning, middle, and end.';
    return 'Practice: Write 5 sentences about today. Use capitals and full stops.';
  }
  if (s.includes('integrated')) return 'Practice: Listen to a story, retell it, read a passage, write 3 sentences.';
  return 'Practice: Review what you learned today and try again.';
}

function buildJourney(lesson) {
  const { title, strand, subStrand, kiQ, experience, reflectionPrompt } = lesson;
  const s = (strand || '').toLowerCase();
  const focus = (subStrand || strand || 'English').toLowerCase();
  const qc = buildQC(title, strand);
  const practice = buildPractice(title, strand);
  const refl = reflectionPrompt || 'What did I learn about ' + focus + ' today?';
  const isRead = s.includes('reading'), isWrite = s.includes('writing');
  const welcome = isRead ? 'reading adventure — use your eyes and your brain!' : isWrite ? 'writing adventure — use your hands and your imagination!' : 'English adventure — use your ears, voice, and brain!';
  const owl = isRead ? 'Today we will read words and stories together.' : isWrite ? 'Today we will write words and sentences together.' : 'Today we will practice English together.';
  return [
    step('welcome', 'Welcome to ' + title + '!', 'Hello, friend! Today we will practice ' + focus + '. This is a ' + welcome, 'Hello! I am OWL. ' + owl + ' Are you ready?'),
    step('mission', 'Our ' + (isRead ? 'Reading' : isWrite ? 'Writing' : 'English') + ' Mission', 'Your mission today is to practice ' + focus + '. We will work together!', 'Our mission is to become great at ' + focus + '. Try your best!'),
    step('think_first', 'What Do You Know?', 'Before we start, think about this: ' + (kiQ || 'What do you know about ' + focus + '?'), 'Let us think together. ' + (kiQ || 'What do you know about ' + focus + '?'), { interaction: openResp(kiQ || 'What do you know about ' + focus) }),
    step('learn', "Let's Learn Together", (experience || 'Today we will practice ' + focus + '.').split('.').slice(0, 3).join('.') + '.', 'When we practice ' + focus + ', we get better every day. Try your best!'),
    step('connect', 'Connect to Real Life', 'Think about when you use ' + focus + ' at home or school. How can you practice more?', 'We use English every day. Practice makes perfect!'),
    step('example', "Let's Try an Example", 'Let me show you an example. Watch carefully, then you will try!', 'Pay attention to this example. Then it is your turn!'),
    step('practice', 'Your Turn', practice, 'You are doing great! Keep practising!'),
    step('quick_check', 'Quick Check!', 'Let us see how much you remember!', 'This is a fun quiz! Pick the best answer.', { interaction: mcq(qc.question, qc.options, qc.correctIndex, qc.explanation) }),
    step('reflect', 'Think About Your Learning', refl, 'You worked hard today! What was your favourite part?', { interaction: openResp(refl) }),
    step('complete', 'Well Done!', 'Congratulations! You completed today\'s ' + focus + ' lesson!', 'Well done, friend! I am proud of you!'),
  ];
}

async function main() {
  const { data: themes } = await db.from('Theme').select('id').eq('slug', 'g2-english');
  if (!themes || !themes.length) { console.error('Theme not found'); process.exit(1); }
  const { data: quests } = await db.from('Quest').select('id, title').eq('themeId', themes[0].id);
  if (!quests || !quests.length) { console.error('No quests'); process.exit(1); }

  let all = [], off = 0;
  while (true) {
    const { data, error } = await db.from('Lesson').select('*').in('questId', quests.map(q => q.id)).order('orderIndex').range(off, off + 199);
    if (error) { console.error(error); process.exit(1); }
    if (!data || !data.length) break;
    all = all.concat(data); off += 200;
    if (data.length < 200) break;
  }
  console.log('Found ' + all.length + ' Grade 2 English (theme) lessons');

  let saved = 0, skipped = 0, errs = 0;
  for (const l of all) {
    let meta = {};
    try { meta = JSON.parse(l.contentBlocks || '{}'); } catch {}
    if (Array.isArray(meta.studentJourneyDraft) && meta.studentJourneyDraft.length > 0) { skipped++; continue; }
    const journey = buildJourney({ title: l.title, strand: meta.strand || '', subStrand: meta.subStrand || '', kiQ: meta.keyInquiryQuestion || '', experience: meta.suggestedLearningExperience || '', reflectionPrompt: meta.reflectionPrompt || '' });
    const upd = { ...meta, studentJourneyDraft: journey, aiMetadata: { batchId: BATCH_ID, generatedAt: new Date().toISOString(), generator: 'english-theme-v1' } };
    const { error: e2 } = await db.from('Lesson').update({ contentBlocks: JSON.stringify(upd) }).eq('id', l.id);
    if (e2) { console.error('  ERROR [' + l.title + ']: ' + e2.message); errs++; }
    else { console.log('  ✓ ' + l.title + ' (' + meta.strand + ')'); saved++; }
  }
  console.log('\nSAVED: ' + saved + ' | SKIPPED: ' + skipped + ' | ERRORS: ' + errs);
}
main().catch(e => { console.error(e); process.exit(1); });
