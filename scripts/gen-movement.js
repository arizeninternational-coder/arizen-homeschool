#!/usr/bin/env node
/**
 * Grade 2 Movement Journey Generator — ALL 240 lessons
 */
const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const t = line.trim();
  if (!t || t.startsWith('#')) return;
  const eqIdx = t.indexOf('=');
  if (eqIdx === -1) return;
  envVars[t.slice(0, eqIdx).trim()] = t.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
});
const { createClient } = require('@supabase/supabase-js');
const db = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const BATCH_ID = 'g2-movement-v1';

function step(type, title, student, owl, extra) {
  return { id: type, stepType: type, title, studentText: student, owlText: owl, visualType: 'owl_teacher', interaction: { type: 'none' }, media: {}, ...extra };
}
function mcq(q, opts, correct, expl) { return { type: 'multiple_choice', question: q, options: opts, correctIndex: correct, explanation: expl }; }
function openResp(p) { return { type: 'open_response', prompt: p, placeholder: 'Write your answer here...' }; }

function buildJourney(title, strand, subStrand, questTitle) {
  const t = (title || '').toLowerCase();
  const s = (strand || '').toLowerCase();
  const ss = (subStrand || '').toLowerCase();

  const j = (wS, wO, mS, mO, tfS, tfO, lS, lO, cS, cO, eS, eO, pS, pO, qc, rS, rO, coS, coO) => [
    step('welcome', 'Welcome!', wS, wO),
    step('mission', 'Our Mission', mS, mO),
    step('think_first', 'Think First!', tfS, tfO, { interaction: openResp(tfS.substring(0, 80)) }),
    step('learn', 'Learn It', lS, lO),
    step('connect', 'Connect to Real Life', cS, cO),
    step('example', 'Let Us Try Together', eS, eO),
    step('practice', 'Your Turn!', pS, pO),
    step('quick_check', 'Quick Check!', qc.q, qc.o, { interaction: mcq(qc.question, qc.options, qc.correct, qc.explanation) }),
    step('reflect', 'Think About Your Learning', rS, rO, { interaction: openResp(rS.substring(0, 80)) }),
    step('complete', 'Well Done!', coS, coO),
  ];

  // === LOCOMOTOR SKILLS ===
  if (s.includes('locomotor') || s.includes('movement') || t.includes('walk') || t.includes('run') || t.includes('jump') || t.includes('skip') || t.includes('gallop') || t.includes('hop') || t.includes('leap') || t.includes('slide') || t.includes('crawl')) {
    return j(
      'Hello, friend! 🏃 Today we are going to practice ' + title.toLowerCase() + '. Moving our bodies is fun and keeps us healthy!',
      'Hello! I am OWL. Today we will practice movement skills together.',
      'By the end of this lesson, you will be able to ' + title.toLowerCase() + ' with good form and confidence!',
      'Our mission is to become movement experts!',
      'Can you show me how you ' + title.toLowerCase().replace('practicing ', '').replace('learning ', '') + '? What do you already know about this movement?',
      'Let us think: what do you know about this movement?',
      'Today we will learn the correct way to ' + title.toLowerCase().replace('practicing ', '').replace('learning ', '') + '. We will practice step by step. Remember: start slowly, focus on your form, and have fun!',
      'Remember: good form is important. Start slow, then go faster when you are ready.',
      'At home, you can practice this movement in the yard or at the park. Show your family what you learned!',
      'Movement is important for our health and fitness!',
      'Let me show you how it is done. Watch carefully!',
      'Watch, then you will try!',
      'Practice: Try the movement 5 times. Focus on doing it correctly.',
      'Excellent work! You are getting better!',
      { q: 'What is important when learning a new movement?', o: 'This is a fun quiz!', question: 'What is important when learning a new movement?', options: ['Going as fast as possible', 'Starting slowly and focusing on form', 'Not practicing', 'Only watching'], correct: 1, explanation: 'Correct! Start slowly and focus on doing the movement correctly!' },
      'What did you learn about movement today?',
      'You worked hard today!',
      'Congratulations! 🎉 You learned a new movement skill!',
      'Well done, friend!'
    );
  }

  // === BALL HANDLING ===
  if (s.includes('ball') || s.includes('object') || s.includes('handling') || t.includes('throw') || t.includes('catch') || t.includes('kick') || t.includes('roll') || t.includes('bounce') || t.includes('dribble') || t.includes('pass')) {
    return j(
      'Hello, friend! ⚽ Today we are going to practice ' + title.toLowerCase() + '. Ball skills are fun and help us play together!',
      'Hello! I am OWL. Today we will practice ball skills together.',
      'By the end of this lesson, you will be able to ' + title.toLowerCase() + ' with confidence!',
      'Our mission is to become ball skills champions!',
      'What ball games do you like to play? Can you throw? Catch? Kick?',
      'Let us think: what ball skills do you already know?',
      'Today we will learn how to ' + title.toLowerCase().replace('practicing ', '').replace('learning ', '') + ' correctly. We will practice step by step. Remember: keep your eyes on the ball, use the right technique, and have fun!',
      'Remember: eyes on the ball, good technique, practice makes perfect!',
      'At home, you can practice with a ball in the yard. Play with your friends and family!',
      'Ball skills help us play many different games!',
      'Let me show you how it is done. Watch carefully!',
      'Watch, then you will try!',
      'Practice: Try the skill 10 times. Focus on doing it correctly.',
      'Excellent work! You are a ball skills champion!',
      { q: 'What is important when catching a ball?', o: 'This is a fun quiz!', question: 'What is important when catching?', options: ['Closing your eyes', 'Keeping your eyes on the ball', 'Turning away', 'Standing still'], correct: 1, explanation: 'Correct! Keep your eyes on the ball when catching!' },
      'What did you learn about ball skills today?',
      'You worked hard today!',
      'Congratulations! 🎉 You learned a new ball skill!',
      'Well done, friend!'
    );
  }

  // === GYMNASTICS / RHYTHMIC ===
  if (s.includes('gymnastic') || s.includes('rhythmic') || s.includes('roll') || s.includes('balance') || s.includes('stretch') || s.includes('tumble') || s.includes('flip') || s.includes('cartwheel') || s.includes('handstand')) {
    return j(
      'Hello, friend! 🤸 Today we are going to practice ' + title.toLowerCase() + '. Gymnastics helps us become strong and flexible!',
      'Hello! I am OWL. Today we will practice gymnastics together.',
      'By the end of this lesson, you will be able to ' + title.toLowerCase() + ' safely and confidently!',
      'Our mission is to become gymnastics stars!',
      'Have you ever done a somersault? A cartwheel? What gymnastics moves do you know?',
      'Let us think: what gymnastics moves have you tried?',
      'Today we will learn ' + title.toLowerCase().replace('practicing ', '').replace('learning ', '') + '. We will practice on soft surfaces. Remember: warm up first, follow safety rules, and ask for help if you need it!',
      'Remember: safety first! Warm up, use soft surfaces, and ask for help.',
      'At home, you can practice on a soft mat or grass. Always have a grown-up nearby!',
      'Gymnastics makes us strong, flexible, and coordinated!',
      'Let me show you how it is done. Watch carefully!',
      'Watch, then you will try!',
      'Practice: Try the movement 5 times with proper form.',
      'Excellent work! You are a gymnastics star!',
      { q: 'What is important in gymnastics?', o: 'This is a fun quiz!', question: 'What is important in gymnastics?', options: ['Going as fast as possible', 'Safety, warm-up, and proper form', 'Not warming up', 'Doing difficult moves only'], correct: 1, explanation: 'Correct! Safety, warm-up, and proper form are most important!' },
      'What did you learn about gymnastics today?',
      'You worked hard today!',
      'Congratulations! 🎉 You learned a gymnastics skill!',
      'Well done, friend!'
    );
  }

  // === GAMES / SPORTS ===
  if (s.includes('game') || s.includes('sport') || s.includes('play') || s.includes('team') || s.includes('cooperat') || s.includes('chase') || s.includes('tag') || s.includes('relay') || s.includes('race')) {
    return j(
      'Hello, friend! 🎮 Today we are going to learn about ' + title.toLowerCase() + '. Playing games is fun and helps us work together!',
      'Hello! I am OWL. Today we will learn about games and sports.',
      'By the end of this lesson, you will understand the rules and be able to play ' + title.toLowerCase() + ' correctly!',
      'Our mission is to become great players!',
      'What games do you like to play? What are the rules? Why are rules important?',
      'Let us think: what games do you know? What are their rules?',
      'Today we will learn ' + title.toLowerCase().replace('learning about ', '').replace('playing ', '') + '. Every game has rules. Rules make the game fair and fun for everyone. We must follow the rules, play fair, and be good sports!',
      'Remember: follow the rules, play fair, be a good sport — win or lose!',
      'At home, you can play games with your family. Teach them the rules you learned!',
      'Games help us exercise, have fun, and learn to work together!',
      'Let me show you how to play. Watch carefully!',
      'Watch, then you will try!',
      'Practice: Play the game with a partner or group. Follow all the rules.',
      'Excellent work! You are a great player!',
      { q: 'Why are rules important in games?', o: 'This is a fun quiz!', question: 'Why are rules important?', options: ['They are not important', 'They make the game fair and fun for everyone', 'They make the game boring', 'Only adults need rules'], correct: 1, explanation: 'Correct! Rules make the game fair and fun for everyone!' },
      'What did you learn about games today?',
      'You worked hard today!',
      'Congratulations! 🎉 You learned about games!',
      'Well done, friend!'
    );
  }

  // === GENERIC MOVEMENT ===
  return j(
    'Hello, friend! 🏃 Today we are going to learn about ' + title.toLowerCase() + '. Physical activity keeps us healthy and strong!',
    'Hello! I am OWL. Today we will learn about movement and physical activity.',
    'By the end of this lesson, you will understand ' + title.toLowerCase() + ' and be able to practice it!',
    'Our mission is to become fitness champions!',
    'What do you already know about ' + title.toLowerCase() + '?',
    'Let us think: what do you know?',
    'Today we will learn about ' + title.toLowerCase() + '. Physical activity is important for our health. It makes our hearts strong, our muscles powerful, and our bodies flexible. We should be active every day!',
    'Remember: be active every day! Exercise makes us healthy and happy.',
    'At home, you can be active by playing outside, helping with chores, dancing, or playing sports.',
    'Physical activity is important for everyone!',
    'Let me show you an example. Watch carefully!',
    'Pay attention, then it is your turn!',
    'Practice: Try what you learned today.',
    'Great work!',
    { q: 'Why is physical activity important?', o: 'This is a fun quiz!', question: 'Why is physical activity important?', options: ['It is not important', 'It keeps us healthy, strong, and happy', 'It makes us tired', 'Only adults need exercise'], correct: 1, explanation: 'Correct! Physical activity keeps us healthy, strong, and happy!' },
    'What did you learn about movement today?',
    'You worked hard today!',
    'Congratulations! 🎉 You learned about physical activity!',
    'Well done, friend!'
  );
}

async function main() {
  const { data: theme } = await db.from('Theme').select('id').eq('slug', 'g2-movement').single();
  if (!theme) { console.error('Theme not found'); process.exit(1); }
  const { data: quests } = await db.from('Quest').select('id').eq('themeId', theme.id);
  if (!quests?.length) { console.error('No quests'); process.exit(1); }

  let all = [], off = 0;
  while (true) {
    const { data, error } = await db.from('Lesson').select('id, title, contentBlocks').in('questId', quests.map(q=>q.id)).order('orderIndex').range(off, off+199);
    if (error) { console.error(error); process.exit(1); }
    if (!data?.length) break;
    all = all.concat(data); off += 200;
    if (data.length < 200) break;
  }

  console.log('Generating journeys for ' + all.length + ' Movement lessons...\n');

  let saved = 0, errors = 0;
  for (const l of all) {
    let meta = {};
    try { meta = JSON.parse(l.contentBlocks || '{}'); } catch {}
    const strand = meta.strand || '';
    const subStrand = meta.subStrand || '';
    const questTitle = meta.questTitle || '';
    const journey = buildJourney(l.title, strand, subStrand, questTitle);

    const upd = { ...meta, studentJourneyDraft: journey, aiMetadata: { batchId: BATCH_ID, generatedAt: new Date().toISOString(), generator: 'movement-v1' } };
    const { error: e2 } = await db.from('Lesson').update({ contentBlocks: JSON.stringify(upd) }).eq('id', l.id);
    if (e2) { console.error('  ERROR [' + l.title.substring(0,40) + ']: ' + e2.message); errors++; }
    else { saved++; }
  }

  console.log('\nSAVED: ' + saved + ' | ERRORS: ' + errors);
}
main().catch(e => { console.error(e); process.exit(1); });
