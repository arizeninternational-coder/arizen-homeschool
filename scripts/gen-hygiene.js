#!/usr/bin/env node
/**
 * Grade 2 Hygiene & Nutrition Journey Generator — ALL 66 lessons
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
const BATCH_ID = 'g2-hygiene-v1';

function step(type, title, student, owl, extra) {
  return { id: type, stepType: type, title, studentText: student, owlText: owl, visualType: 'owl_teacher', interaction: { type: 'none' }, media: {}, ...extra };
}
function mcq(q, opts, correct, expl) { return { type: 'multiple_choice', question: q, options: opts, correctIndex: correct, explanation: expl }; }
function openResp(p) { return { type: 'open_response', prompt: p, placeholder: 'Write your answer here...' }; }

function buildJourney(title, strand, subStrand, questTitle) {
  const t = (title || '').toLowerCase();
  const s = (strand || '').toLowerCase();
  const ss = (subStrand || '').toLowerCase();
  const q = (questTitle || '').toLowerCase();

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

  // === PERSONAL HYGIENE ===
  if (s.includes('hygiene') || s.includes('health') || s.includes('personal') || t.includes('hand') || t.includes('teeth') || t.includes('bath') || t.includes('clean') || t.includes('wash') || t.includes('brush') || t.includes('nail') || t.includes('hair') || t.includes('body')) {
    if (t.includes('hand') || t.includes('wash')) {
      return j(
        'Hello, friend! 🧼 Today we are going to learn about washing our hands. Clean hands keep us healthy!',
        'Hello! I am OWL. Today we will learn why and how to wash our hands properly.',
        'By the end of this lesson, you will know when and how to wash your hands correctly!',
        'Our mission is to become hand-washing champions!',
        'When do you wash your hands? Before eating? After using the toilet? Why is it important?',
        'Let us think: when do you wash your hands? Why?',
        'We wash our hands to remove germs that can make us sick. We should wash hands before eating, after using the toilet, after playing outside, and after touching animals. Use soap and clean water. Rub your hands together for at least 20 seconds — that is about the time it takes to sing "Happy Birthday" twice!',
        'Remember: soap and water, rub for 20 seconds, rinse well, and dry with a clean towel.',
        'At home, you can help your family remember to wash hands before meals. Teach your younger siblings too!',
        'Hand washing is one of the best ways to prevent diseases!',
        'Let me show you the steps. Watch carefully: Wet hands, apply soap, rub palms together, rub between fingers, rub backs of hands, rinse, and dry.',
        'Watch carefully, then you will try!',
        'Practice: Wash your hands following all the steps. Ask someone to check if you did it correctly.',
        'Excellent work! You are a hand-washing champion!',
        { q: 'When should you wash your hands?', o: 'This is a fun quiz!', question: 'When should you wash your hands?', options: ['Only before eating', 'Before eating, after toilet, after playing', 'Only after playing', 'Never'], correct: 1, explanation: 'Correct! We wash hands before eating, after using the toilet, after playing, and after touching animals!' },
        'What did you learn about washing hands?',
        'You worked hard today!',
        'Congratulations! 🎉 You learned to wash hands properly!',
        'Well done, friend!'
      );
    }
    if (t.includes('teeth') || t.includes('brush') || t.includes('dental') || t.includes('cavity')) {
      return j(
        'Hello, friend! 🦷 Today we are going to learn about taking care of our teeth. Healthy teeth help us eat, speak, and smile!',
        'Hello! I am OWL. Today we will learn how to keep our teeth healthy.',
        'By the end of this lesson, you will know how to take care of your teeth properly!',
        'Our mission is to become dental health champions!',
        'How do you take care of your teeth? How many times a day do you brush?',
        'Let us think: how do you care for your teeth?',
        'We should brush our teeth at least twice a day — in the morning and before bed. Use a toothbrush and toothpaste. Brush all surfaces of your teeth — front, back, and top. Brush for at least 2 minutes. Do not eat too many sweets because they cause cavities. Visit the dentist regularly.',
        'Remember: brush twice a day, use toothpaste, avoid too many sweets, and visit the dentist.',
        'At home, you can brush your teeth in the morning and before bed. Ask a grown-up to help you if you are young.',
        'Dental health is important for overall health!',
        'Let me show you how to brush properly. Watch carefully!',
        'Watch, then you will try!',
        'Practice: Brush your teeth following all the steps. Ask someone to check.',
        'Excellent work!',
        { q: 'How many times a day should you brush your teeth?', o: 'This is a fun quiz!', question: 'How many times should you brush?', options: ['Once a week', 'Once a day', 'Twice a day', 'Never'], correct: 2, explanation: 'Correct! We brush at least twice a day — morning and before bed!' },
        'What did you learn about dental health?',
        'You worked hard today!',
        'Congratulations! 🎉 You learned about dental health!',
        'Well done, friend!'
      );
    }
    // Generic hygiene
    return j(
      'Hello, friend! 🧼 Today we are going to learn about ' + title.toLowerCase() + '. Personal hygiene keeps us healthy!',
      'Hello! I am OWL. Today we will learn about personal hygiene.',
      'By the end of this lesson, you will understand ' + title.toLowerCase() + ' and how to practice it!',
      'Our mission is to become hygiene champions!',
      'What do you already know about ' + title.toLowerCase() + '?',
      'Let us think: what do you know?',
      'Personal hygiene means keeping our body clean to stay healthy. This includes washing hands, brushing teeth, bathing regularly, wearing clean clothes, and keeping our nails clean. Good hygiene prevents diseases and helps us feel good.',
      'Remember: good hygiene keeps us healthy. Practice it every day!',
      'At home, you can practice good hygiene by washing hands, brushing teeth, and bathing regularly.',
      'Hygiene is important for everyone!',
      'Let me show you an example. Watch carefully!',
      'Pay attention, then it is your turn!',
      'Practice: Try what you learned today.',
      'Great work!',
      { q: 'Why is personal hygiene important?', o: 'This is a fun quiz!', question: 'Why is hygiene important?', options: ['It is not important', 'It keeps us healthy and prevents diseases', 'It makes us tired', 'Only adults need hygiene'], correct: 1, explanation: 'Correct! Good hygiene keeps us healthy and prevents diseases!' },
      'What did you learn about hygiene today?',
      'You worked hard today!',
      'Congratulations! 🎉 You learned about personal hygiene!',
      'Well done, friend!'
    );
  }

  // === NUTRITION / FOOD ===
  if (s.includes('nutrition') || s.includes('food') || s.includes('diet') || s.includes('meal') || s.includes('eat') || s.includes('healthy') || s.includes('fruit') || s.includes('vegetable') || s.includes('water') || s.includes('breakfast') || t.includes('food') || t.includes('fruit') || t.includes('vegetable') || t.includes('meal') || t.includes('eat') || t.includes('healthy') || t.includes('nutrition') || t.includes('diet')) {
    return j(
      'Hello, friend! 🍎 Today we are going to learn about ' + title.toLowerCase() + '. Good food gives us energy to learn and play!',
      'Hello! I am OWL. Today we will learn about nutrition and healthy eating.',
      'By the end of this lesson, you will understand ' + title.toLowerCase() + ' and make healthy food choices!',
      'Our mission is to become nutrition experts!',
      'What is your favorite food? Is it healthy? What foods do you eat every day?',
      'Let us think: what foods do you eat? Are they healthy?',
      'Our body needs different types of food to stay healthy. We need carbohydrates (ugali, rice, bread) for energy, proteins (beans, meat, eggs) for growth, vitamins and minerals (fruits, vegetables) for protection, and water for hydration. We should eat a balanced diet — not too much of one type of food.',
      'Remember: eat a balanced diet with foods from all groups. Drink plenty of water. Eat fruits and vegetables every day.',
      'At home, you can help choose healthy foods for meals. Eat fruits and vegetables with every meal.',
      'Good nutrition helps us grow, learn, and stay healthy!',
      'Let me show you a balanced plate. Watch carefully!',
      'Pay attention, then it is your turn!',
      'Practice: Draw a balanced meal with foods from each group. Label each food.',
      'Excellent work! You are a nutrition expert!',
      { q: 'Why do we need to eat a balanced diet?', o: 'This is a fun quiz!', question: 'Why eat a balanced diet?', options: ['To eat only one type of food', 'To get all nutrients our body needs', 'To eat only sweets', 'We do not need a balanced diet'], correct: 1, explanation: 'Correct! A balanced diet gives us all the nutrients our body needs to grow and stay healthy!' },
      'What did you learn about nutrition today?',
      'You worked hard today!',
      'Congratulations! 🎉 You learned about nutrition!',
      'Well done, friend!'
    );
  }

  // === MEDICINE SAFETY ===
  if (s.includes('medicine') || s.includes('drug') || s.includes('safety') || t.includes('medicine') || t.includes('drug') || t.includes('pill') || t.includes('doctor') || t.includes('hospital')) {
    return j(
      'Hello, friend! 💊 Today we are going to learn about medicine safety. Medicines help us when we are sick, but we must use them correctly!',
      'Hello! I am OWL. Today we will learn about medicine safety.',
      'By the end of this lesson, you will know how to use medicines safely!',
      'Our mission is to become medicine safety experts!',
      'Have you ever taken medicine? Who gave it to you? Why is it important to take medicine from a trusted adult?',
      'Let us think: when have you taken medicine? Who gave it to you?',
      'Medicines help us when we are sick, but they can be dangerous if not used correctly. Only take medicine from a parent, guardian, or doctor. Never take medicine from strangers. Follow the instructions carefully. Do not take too much or too little. Keep medicines out of reach of young children.',
      'Remember: only take medicine from trusted adults. Follow instructions. Keep medicines safe.',
      'At home, you can help keep medicines out of reach of younger siblings. Always ask a grown-up before taking any medicine.',
      'Medicine safety is very important for everyone!',
      'Let me show you how to be safe with medicines. Watch carefully!',
      'Pay attention, then it is your turn!',
      'Practice: Tell a family member 3 rules for medicine safety.',
      'Excellent work! You are a medicine safety expert!',
      { q: 'Who should give you medicine?', o: 'This is a fun quiz!', question: 'Who should give you medicine?', options: ['Anyone', 'Only parents, guardians, or doctors', 'Strangers', 'Friends'], correct: 1, explanation: 'Correct! Only take medicine from parents, guardians, or doctors!' },
      'What did you learn about medicine safety?',
      'You worked hard today!',
      'Congratulations! 🎉 You learned about medicine safety!',
      'Well done, friend!'
    );
  }

  // === GENERIC ===
  return j(
    'Hello, friend! 🌟 Today we are going to learn about ' + title.toLowerCase() + '. This is important for our health and well-being!',
    'Hello! I am OWL. Today we will learn about health and nutrition.',
    'By the end of this lesson, you will understand ' + title.toLowerCase() + ' better!',
    'Our mission is to become health champions!',
    'What do you already know about ' + title.toLowerCase() + '?',
    'Let us think: what do you know?',
    'Today we will learn about ' + title.toLowerCase() + '. Health and nutrition are important for our growth and well-being. We must take care of our bodies by eating well, staying clean, exercising, and staying safe.',
    'Remember: taking care of our health is important every day!',
    'At home, you can practice what you learned today. Help your family stay healthy!',
    'Health is everyone\'s responsibility!',
    'Let me show you an example. Watch carefully!',
    'Pay attention, then it is your turn!',
    'Practice: Try what you learned today.',
    'Great work!',
    { q: 'What is one important thing about health?', o: 'This is a fun quiz!', question: 'What is important for health?', options: ['Nothing', 'Eating well, staying clean, exercising, and staying safe', 'Only eating sweets', 'Never washing hands'], correct: 1, explanation: 'Correct! Eating well, staying clean, exercising, and staying safe are all important for health!' },
    'What did you learn about health today?',
    'You worked hard today!',
    'Congratulations! 🎉 You learned about health!',
    'Well done, friend!'
  );
}

async function main() {
  const { data: theme } = await db.from('Theme').select('id').eq('slug', 'g2-hygiene-nutrition').single();
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

  console.log('Generating journeys for ' + all.length + ' Hygiene & Nutrition lessons...\n');

  let saved = 0, errors = 0;
  for (const l of all) {
    let meta = {};
    try { meta = JSON.parse(l.contentBlocks || '{}'); } catch {}
    const strand = meta.strand || '';
    const subStrand = meta.subStrand || '';
    const questTitle = meta.questTitle || '';
    const journey = buildJourney(l.title, strand, subStrand, questTitle);

    const upd = { ...meta, studentJourneyDraft: journey, aiMetadata: { batchId: BATCH_ID, generatedAt: new Date().toISOString(), generator: 'hygiene-v1' } };
    const { error: e2 } = await db.from('Lesson').update({ contentBlocks: JSON.stringify(upd) }).eq('id', l.id);
    if (e2) { console.error('  ERROR [' + l.title.substring(0,40) + ']: ' + e2.message); errors++; }
    else { saved++; }
  }

  console.log('\nSAVED: ' + saved + ' | ERRORS: ' + errors);
}
main().catch(e => { console.error(e); process.exit(1); });
