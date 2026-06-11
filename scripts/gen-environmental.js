#!/usr/bin/env node
/**
 * Grade 2 Environmental Activities Journey Generator — ALL 150 lessons
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
const BATCH_ID = 'g2-environmental-v1';

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

  // Helper for 10-step journey
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

  // === WEATHER ===
  if (q.includes('weather') || t.includes('weather') || t.includes('weather symbol')) {
    if (t.includes('describ') || t.includes('observe')) {
      return j(
        'Hello, friend! 🌤️ Today we are going to learn about describing weather. We will look at the sky and talk about what we see!',
        'Hello! I am OWL. Today we will learn to describe weather at different times of day.',
        'By the end of this lesson, you will be able to describe the weather at different times of the day!',
        'Our mission is to become weather observers!',
        'What is the weather like right now? Is it sunny? Cloudy? Rainy? How do you know?',
        'Let us think: what weather have you seen today?',
        'Weather changes throughout the day. In the morning it might be sunny, in the afternoon cloudy, and in the evening cool. We describe weather using words like sunny, cloudy, rainy, windy, hot, and cold.',
        'Remember: weather changes. We observe and describe what we see.',
        'At home, you can look outside and describe the weather to your family. What is the weather like in the morning? Afternoon? Evening?',
        'We use weather words every day — when we choose clothes, plan activities, and talk to others.',
        'I will describe the weather. You tell me the weather word. "The sun is shining brightly." What is the weather? Sunny! Now you try!',
        'Listen to the weather description and say the weather word. Well done!',
        'Practice: Describe the weather at three different times today. Morning, afternoon, and evening.',
        'Great work! Keep observing the weather every day.',
        { q: 'What is the weather called when the sun is shining?', o: 'This is a fun quiz! Pick the best answer.', question: 'What is the weather when the sun is shining?', options: ['Rainy', 'Sunny', 'Cloudy', 'Windy'], correct: 1, explanation: 'Correct! When the sun is shining, we say it is sunny!' },
        'What did you learn about describing weather?',
        'You worked hard today! You can now describe weather like a pro!',
        'Congratulations! 🎉 You learned to describe weather!',
        'Well done, friend! I am proud of you!'
      );
    }
    if (t.includes('symbol') || t.includes('draw')) {
      return j(
        'Hello, friend! 🎨 Today we are going to learn about weather symbols. We will draw and interpret symbols that show different types of weather!',
        'Hello! I am OWL. Today we will learn weather symbols — pictures that show the weather.',
        'By the end of this lesson, you will be able to draw and interpret weather symbols correctly!',
        'Our mission is to become weather symbol experts!',
        'Have you seen pictures that show weather? Like a sun for sunny or clouds for cloudy? What symbols do you know?',
        'Let us think: what weather symbols have you seen before?',
        'Weather symbols are simple pictures that show the weather. A sun means sunny. A cloud means cloudy. Raindrops mean rainy. A wind symbol means windy. We use these symbols in weather forecasts!',
        'Remember: each symbol represents a type of weather. They help us understand the weather quickly.',
        'At home, you can draw weather symbols to show what the weather is like each day. Make a weather chart!',
        'Weather symbols are used everywhere — on TV, in newspapers, and on weather apps.',
        'I will show you a symbol, you tell me the weather. A sun! What is the weather? Sunny! Now you try!',
        'Look at the symbol and say the weather. Well done!',
        'Practice: Draw 5 weather symbols — sunny, cloudy, rainy, windy, and cold. Label each one.',
        'Excellent work! You can now draw and read weather symbols!',
        { q: 'What does a sun symbol mean?', o: 'This is a fun quiz! Pick the best answer.', question: 'What does a sun symbol mean?', options: ['Rainy', 'Cloudy', 'Sunny', 'Windy'], correct: 2, explanation: 'Correct! A sun symbol means sunny weather!' },
        'What did you learn about weather symbols?',
        'You worked hard today!',
        'Congratulations! 🎉 You learned weather symbols!',
        'Well done, friend!'
      );
    }
    // Generic weather
    return j(
      'Hello, friend! 🌤️ Today we are going to learn about ' + title.toLowerCase() + '. Weather is all around us!',
      'Hello! I am OWL. Today we will learn about weather.',
      'By the end of this lesson, you will understand ' + title.toLowerCase() + ' better!',
      'Our mission is to learn about weather.',
      'What do you already know about ' + title.toLowerCase() + '?',
      'Let us think: what do you know?',
      'Today we will learn about ' + title.toLowerCase() + '. Weather affects our daily lives — what we wear, what we do, and how we plan our day.',
      'Remember: weather is important. We observe it every day.',
      'At home, you can observe the weather and talk about it with your family.',
      'We use weather knowledge every day!',
      'Let me show you an example. Watch carefully!',
      'Pay attention, then it is your turn!',
      'Practice: Try what you learned today.',
      'Great work!',
      { q: 'What is one important thing about weather?', o: 'This is a fun quiz!', question: 'What is important about weather?', options: ['Nothing', 'It affects our daily lives', 'It is always the same', 'We cannot observe it'], correct: 1, explanation: 'Correct! Weather affects what we wear, do, and plan every day!' },
      'What did you learn about weather today?',
      'You worked hard today!',
      'Congratulations! 🎉 You learned about weather!',
      'Well done, friend!'
    );
  }

  // === WATER ===
  if (q.includes('water') || t.includes('water')) {
    return j(
      'Hello, friend! 💧 Today we are going to learn about water. Water is essential for all living things!',
      'Hello! I am OWL. Today we will learn about water and why it is important.',
      'By the end of this lesson, you will understand why water is important and how to use it wisely!',
      'Our mission is to become water conservation champions!',
      'Where do you see water at home? At school? In the community? How do you use water?',
      'Let us think: how do you use water every day?',
      'Water is essential for life. We use water for drinking, cooking, cleaning, washing, and growing plants. Water comes from rain, rivers, lakes, and wells. We must use water wisely and not waste it.',
      'Remember: water is precious. We should not waste it. Turn off taps, fix leaks, and use only what we need.',
      'At home, you can help save water by turning off the tap when brushing your teeth and using a cup instead of running water.',
      'Water conservation is important for everyone!',
      'I will show you ways to save water. Watch carefully!',
      'Pay attention, then it is your turn!',
      'Practice: List 5 ways you can save water at home and at school.',
      'Excellent work! You are a water conservation champion!',
      { q: 'Why is water important?', o: 'This is a fun quiz!', question: 'Why is water important?', options: ['It is not important', 'It is essential for all living things', 'We do not need water', 'Water is only for playing'], correct: 1, explanation: 'Correct! Water is essential for all living things — for drinking, cooking, cleaning, and growing!' },
      'What did you learn about water today?',
      'You worked hard today!',
      'Congratulations! 🎉 You learned about water!',
      'Well done, friend!'
    );
  }

  // === SOIL ===
  if (q.includes('soil') || t.includes('soil') || t.includes('earth')) {
    return j(
      'Hello, friend! 🌍 Today we are going to learn about soil. Soil is the ground beneath our feet, and it is very important!',
      'Hello! I am OWL. Today we will learn about soil and why it matters.',
      'By the end of this lesson, you will understand what soil is and why it is important for plants and animals!',
      'Our mission is to become soil scientists!',
      'Have you ever looked at the ground? What did you see? Soil comes in different colors — brown, black, red. What color is the soil near your home?',
      'Let us think: what do you know about soil?',
      'Soil is the top layer of the earth. It is made of tiny pieces of rock, dead plants, and living organisms. Soil is important because plants grow in it, animals live in it, and it helps clean water. There are different types of soil — sandy, clay, and loam.',
      'Remember: soil is alive! It has tiny organisms that help plants grow. We must protect soil by not littering and by planting trees.',
      'At home, you can observe soil in the garden. What color is it? Is it wet or dry? What grows in it?',
      'Soil is everywhere and it is very important for life!',
      'I will show you different types of soil. Look carefully!',
      'Pay attention, then it is your turn!',
      'Practice: Collect soil from 3 different places. Describe the color and texture of each.',
      'Excellent work! You are a soil scientist!',
      { q: 'Why is soil important?', o: 'This is a fun quiz!', question: 'Why is soil important?', options: ['It is not important', 'Plants grow in it and animals live in it', 'It is only for playing', 'Soil is the same everywhere'], correct: 1, explanation: 'Correct! Soil is important because plants grow in it and animals live in it!' },
      'What did you learn about soil today?',
      'You worked hard today!',
      'Congratulations! 🎉 You learned about soil!',
      'Well done, friend!'
    );
  }

  // === PLANTS ===
  if (q.includes('plant') || t.includes('plant') || t.includes('grow') || t.includes('seed') || t.includes('tree') || t.includes('flower') || t.includes('leaf') || t.includes('root') || t.includes('garden') || t.includes('crop') || t.includes('harvest') || t.includes('farm')) {
    return j(
      'Hello, friend! 🌱 Today we are going to learn about ' + title.toLowerCase() + '. Plants are living things that grow all around us!',
      'Hello! I am OWL. Today we will learn about plants.',
      'By the end of this lesson, you will understand ' + title.toLowerCase() + ' better!',
      'Our mission is to become plant experts!',
      'What plants do you see at home? At school? What do plants need to grow?',
      'Let us think: what do you know about plants?',
      'Plants are living things. They need water, sunlight, air, and soil to grow. Plants have roots (underground), stems, leaves, and flowers. Plants give us food, oxygen, and shade. We should take care of plants by watering them and not destroying them.',
      'Remember: plants are living things. They need care to grow well.',
      'At home, you can help take care of plants. Water them, give them sunlight, and do not pick leaves unnecessarily.',
      'Plants are everywhere and they are very important for life!',
      'I will show you parts of a plant. Watch carefully!',
      'Pay attention, then it is your turn!',
      'Practice: Draw a plant and label its parts — roots, stem, leaves, and flowers.',
      'Excellent work! You are a plant expert!',
      { q: 'What do plants need to grow?', o: 'This is a fun quiz!', question: 'What do plants need to grow?', options: ['Only water', 'Water, sunlight, air, and soil', 'Only soil', 'Only sunlight'], correct: 1, explanation: 'Correct! Plants need water, sunlight, air, and soil to grow!' },
      'What did you learn about plants today?',
      'You worked hard today!',
      'Congratulations! 🎉 You learned about plants!',
      'Well done, friend!'
    );
  }

  // === ANIMALS ===
  if (q.includes('animal') || t.includes('animal') || t.includes('pet') || t.includes('domestic') || t.includes('wild') || t.includes('bird') || t.includes('fish') || t.includes('insect') || t.includes('mammal') || t.includes('reptile')) {
    return j(
      'Hello, friend! 🐾 Today we are going to learn about ' + title.toLowerCase() + '. Animals are living things that share our world!',
      'Hello! I am OWL. Today we will learn about animals.',
      'By the end of this lesson, you will understand ' + title.toLowerCase() + ' better!',
      'Our mission is to become animal experts!',
      'What animals do you see at home? At school? In your community? What do you know about them?',
      'Let us think: what animals do you know?',
      'Animals are living things. They need food, water, and shelter to survive. There are different types of animals — domestic animals (pets and farm animals) and wild animals. Animals can be mammals, birds, fish, reptiles, and insects. We should be kind to animals and take care of them.',
      'Remember: animals are living things. They feel pain and need care. We should be kind to all animals.',
      'At home, you can take care of pets by feeding them, giving them water, and being gentle with them.',
      'Animals are everywhere and they are important for our ecosystem!',
      'I will show you different types of animals. Watch carefully!',
      'Pay attention, then it is your turn!',
      'Practice: Draw 3 animals and tell whether they are domestic or wild. What do they eat?',
      'Excellent work! You are an animal expert!',
      { q: 'What do all animals need to survive?', o: 'This is a fun quiz!', question: 'What do all animals need?', options: ['Only food', 'Food, water, and shelter', 'Only water', 'Only shelter'], correct: 1, explanation: 'Correct! All animals need food, water, and shelter to survive!' },
      'What did you learn about animals today?',
      'You worked hard today!',
      'Congratulations! 🎉 You learned about animals!',
      'Well done, friend!'
    );
  }

  // === GENERIC ENVIRONMENT ===
  return j(
    'Hello, friend! 🌍 Today we are going to learn about ' + title.toLowerCase() + '. Our environment is all around us!',
    'Hello! I am OWL. Today we will learn about our environment.',
    'By the end of this lesson, you will understand ' + title.toLowerCase() + ' better!',
    'Our mission is to become environmental champions!',
    'What do you already know about ' + title.toLowerCase() + '?',
    'Let us think: what do you know?',
    'Today we will learn about ' + title.toLowerCase() + '. Our environment includes everything around us — air, water, soil, plants, and animals. We must take care of our environment by keeping it clean, conserving water, planting trees, and not littering.',
    'Remember: our environment is important. We must protect it for ourselves and future generations.',
    'At home, you can help protect the environment by not littering, saving water, and taking care of plants.',
    'Environmental protection is everyone\'s responsibility!',
    'Let me show you an example. Watch carefully!',
    'Pay attention, then it is your turn!',
    'Practice: Try what you learned today.',
    'Great work!',
    { q: 'What is one important thing about the environment?', o: 'This is a fun quiz!', question: 'What is important about the environment?', options: ['Nothing', 'We must protect it for ourselves and future generations', 'It is not important', 'Only adults should protect it'], correct: 1, explanation: 'Correct! We must protect the environment for ourselves and future generations!' },
    'What did you learn about the environment today?',
    'You worked hard today!',
    'Congratulations! 🎉 You learned about the environment!',
    'Well done, friend!'
  );
}

async function main() {
  const { data: theme } = await db.from('Theme').select('id').eq('slug', 'g2-environmental').single();
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

  console.log('Generating journeys for ' + all.length + ' Environmental lessons...\n');

  let saved = 0, errors = 0;
  for (const l of all) {
    let meta = {};
    try { meta = JSON.parse(l.contentBlocks || '{}'); } catch {}
    const strand = meta.strand || '';
    const subStrand = meta.subStrand || '';
    const questTitle = meta.questTitle || '';
    const journey = buildJourney(l.title, strand, subStrand, questTitle);

    const upd = { ...meta, studentJourneyDraft: journey, aiMetadata: { batchId: BATCH_ID, generatedAt: new Date().toISOString(), generator: 'environmental-v1' } };
    const { error: e2 } = await db.from('Lesson').update({ contentBlocks: JSON.stringify(upd) }).eq('id', l.id);
    if (e2) { console.error('  ERROR [' + l.title.substring(0,40) + ']: ' + e2.message); errors++; }
    else { saved++; }
  }

  console.log('\nSAVED: ' + saved + ' | ERRORS: ' + errors);
}
main().catch(e => { console.error(e); process.exit(1); });
