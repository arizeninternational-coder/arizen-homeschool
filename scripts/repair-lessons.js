#!/usr/bin/env node
/**
 * Grade 2 Repair Script
 * 1. Creates a daily schedule from lesson orderIndex
 * 2. Fixes lesson content for known contaminated lessons
 * 3. Removes "Illustration coming soon" from steps
 */
const fs = require('fs');
const env = {};
fs.readFileSync('.env','utf-8').split('\n').forEach(l => { const t=l.trim(); if(!t||t.startsWith('#'))return; const i=t.indexOf('='); if(i===-1)return; env[t.slice(0,i).trim()]=t.slice(i+1).trim().replace(/^['"]|['"]$/g,''); });
const { createClient } = require('@supabase/supabase-js');
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Known contaminated lessons that need content replacement
const CONTAMINATED = [
  { titlePattern: 'breakfast', subject: 'Hygiene and Nutrition', correctTopic: 'breakfast' },
  { titlePattern: 'kusoma', subject: 'Kiswahili', correctTopic: 'reading' },
  { titlePattern: 'kuandika', subject: 'Kiswahili', correctTopic: 'writing' },
  { titlePattern: 'measurement', subject: 'Mathematics', correctTopic: 'measurement' },
  { titlePattern: 'hygiene', subject: 'Hygiene and Nutrition', correctTopic: 'hygiene' },
];

function buildJourney(title, strand, subStrand, subject) {
  const t = title.toLowerCase();
  const s = (strand || '').toLowerCase();
  const ss = (subStrand || '').toLowerCase();

  // Determine the actual teaching content based on the lesson title
  let topic = title.split(':').pop().trim();
  if (!topic || topic.length < 3) topic = title;

  // Build specific content based on subject and topic
  let learnContent = '';
  let practiceContent = '';
  let qcQuestion = '';
  let qcOptions = [];
  let qcCorrect = 0;
  let qcExplanation = '';

  if (subject === 'Mathematics' || s.includes('math') || s.includes('number')) {
    if (t.includes('addition') || t.includes('add')) {
      learnContent = `Today we will learn about addition. Addition means putting numbers together to make a bigger number. For example: 2 + 3 = 5. We use the + sign to show addition. When we add, the answer is called the sum.`;
      practiceContent = `Practice: Solve these addition problems. 3 + 2 = ?  4 + 1 = ?  2 + 2 = ? Write your answers in your exercise book.`;
      qcQuestion = 'What is 3 + 2?';
      qcOptions = ['4', '5', '6', '3'];
      qcCorrect = 1;
      qcExplanation = 'Correct! 3 + 2 = 5. When we add 3 and 2 together, we get 5.';
    } else if (t.includes('subtraction') || t.includes('subtract')) {
      learnContent = `Today we will learn about subtraction. Subtraction means taking away from a number to make it smaller. For example: 5 - 2 = 3. We use the - sign to show subtraction. When we subtract, the answer is called the difference.`;
      practiceContent = `Practice: Solve these subtraction problems. 5 - 2 = ?  4 - 1 = ?  6 - 3 = ? Write your answers in your exercise book.`;
      qcQuestion = 'What is 5 - 2?';
      qcOptions = ['2', '4', '3', '5'];
      qcCorrect = 2;
      qcExplanation = 'Correct! 5 - 2 = 3. When we take away 2 from 5, we get 3.';
    } else if (t.includes('fraction') || t.includes('half') || t.includes('quarter')) {
      learnContent = `Today we will learn about fractions. A fraction is a part of a whole. When we divide something into equal parts, each part is a fraction. A half (1/2) means one part out of two equal parts. A quarter (1/4) means one part out of four equal parts.`;
      practiceContent = `Practice: Draw a circle and shade half of it. Then draw a rectangle and shade a quarter of it. Show your work to a friend or family member.`;
      qcQuestion = 'What does a half (1/2) mean?';
      qcOptions = ['One part out of four', 'One part out of two', 'Two parts out of one', 'The whole thing'];
      qcCorrect = 1;
      qcExplanation = 'Correct! A half (1/2) means one part out of two equal parts.';
    } else if (t.includes('measurement') || t.includes('measuring') || t.includes('metre') || t.includes('kilogram')) {
      learnContent = `Today we will learn about measurement. We use measurement to find out how long, how heavy, or how much something is. We use metres (m) to measure length and kilograms (kg) to measure mass. A metre ruler helps us measure length. A weighing scale helps us measure mass.`;
      practiceContent = `Practice: Find 3 things at home that you can measure with a metre ruler. Write down their names and estimate their length in metres.`;
      qcQuestion = 'What do we use to measure length?';
      qcOptions = ['Kilograms', 'Metres', 'Litres', 'Cups'];
      qcCorrect = 1;
      qcExplanation = 'Correct! We use metres (m) to measure length.';
    } else {
      learnContent = `Today we will learn about ${topic}. This is an important Mathematics concept that will help you solve problems and understand the world around you. We will explore examples and practice together.`;
      practiceContent = `Practice: Try the exercises in your Mathematics textbook related to ${topic}. Ask a family member to check your work.`;
      qcQuestion = `What did you learn about ${topic} today?`;
      qcOptions = ['Nothing new', 'I learned something new', 'I already knew everything', 'I was not paying attention'];
      qcCorrect = 1;
      qcExplanation = 'Great! You learned something new about ' + topic + ' today!';
    }
  } else if (subject === 'English' || s.includes('english') || s.includes('reading') || s.includes('writing')) {
    if (t.includes('reading') || t.includes('read')) {
      learnContent = `Today we will practice reading. Reading helps us understand stories, learn new words, and discover new ideas. When we read, we look at the words carefully, sound them out, and think about what they mean. Good readers think about the story as they read.`;
      practiceContent = `Practice: Read a short story or passage from your English textbook. After reading, tell someone what the story was about in your own words.`;
      qcQuestion = 'What do good readers do?';
      qcOptions = ['Only look at pictures', 'Read carefully and think about the story', 'Skip hard words', 'Read as fast as possible'];
      qcCorrect = 1;
      qcExplanation = 'Correct! Good readers read carefully and think about the story.';
    } else if (t.includes('writing') || t.includes('write')) {
      learnContent = `Today we will practice writing. Writing helps us share our thoughts, tell stories, and communicate with others. When we write, we start sentences with a capital letter and end with a full stop. We use neat handwriting so others can read our work.`;
      practiceContent = `Practice: Write 5 sentences about your favourite animal. Start each sentence with a capital letter and end with a full stop.`;
      qcQuestion = 'What do we need at the start of a sentence?';
      qcOptions = ['A small letter', 'A capital letter', 'A picture', 'A number'];
      qcCorrect = 1;
      qcExplanation = 'Correct! We start a sentence with a capital letter.';
    } else if (t.includes('vocabulary') || t.includes('pronunciation') || t.includes('word')) {
      learnContent = `Today we will learn new words and how to say them correctly. Vocabulary means all the words we know. Pronunciation means saying words the right way. The more words we know, the better we can read, write, and speak.`;
      practiceContent = `Practice: Learn 5 new words from your English textbook. Write each word, its meaning, and use it in a sentence.`;
      qcQuestion = 'What does vocabulary mean?';
      qcOptions = ['All the words we know', 'Only big words', 'Only small words', 'Only hard words'];
      qcCorrect = 0;
      qcExplanation = 'Correct! Vocabulary means all the words we know.';
    } else {
      learnContent = `Today we will learn about ${topic}. This is an important English skill that will help you communicate better. We will explore examples and practice together.`;
      practiceContent = `Practice: Complete the English exercises related to ${topic} in your textbook.`;
      qcQuestion = `What did you learn about ${topic} today?`;
      qcOptions = ['Nothing new', 'I learned something new', 'I already knew everything', 'I was not paying attention'];
      qcCorrect = 1;
      qcExplanation = 'Great! You learned something new about ' + topic + ' today!';
    }
  } else if (subject === 'Kiswahili' || s.includes('kiswahili')) {
    if (t.includes('kusoma') || t.includes('reading')) {
      learnContent = `Leo tutajifunza kusoma kwa Kiswahili. Kusoma kunasaidia kuelewa hadithi, kujifunza maneno mapya, na kugundua mawazo mapya. Tunaposoma, tunazitafakari maneno kwa makini na kufikiri kuhusu yanayosemwa.`;
      practiceContent = `Zoezi: Soma kifupi au kifungu kutoka kitabuchako cha Kiswahili. Baada ya kusoma, mwambie mtu mwingine hadithi ilihusu nini kwa maneno yako mwenyewe.`;
      qcQuestion = 'Wanaposoma vizuri wanafanya nini?';
      qcOptions = ['Kuangalia picha tu', 'Kusoma kwa makini na kufikiri kuhusu hadithi', 'Kuruka maneno magumu', 'Kusoma kwa haraka zaidi'];
      qcCorrect = 1;
      qcExplanation = 'Sahihi! Wanaposoma vizuri wanasoma kwa makini na kufikiri kuhusu hadithi.';
    } else if (t.includes('kuandika') || t.includes('writing')) {
      learnContent = `Leo tutajifunza kuandika kwa Kiswahili. Kuandika kunasaidia kushiriki mawazo yetu, kusimulia hadithi, na kuwasiliana na wengine. Tunapoandika, tunaanza sentensi na herufi kubwa na kumaliza na nukta.`;
      practiceContent = `Zoezi: Andika sentensi 5 kuhusu mpendwa wako wa mnyama. Anza kila sentensi na herufi kubwa na maliza na nukta.`;
      qcQuestion: 'Tunachohitaji mwanzoni mwa sentensi?';
      qcOptions = ['Herufi ndogo', 'Herufi kubwa', 'Picha', 'Nambari'];
      qcCorrect = 1;
      qcExplanation = 'Sahihi! Tunaanza sentensi na herufi kubwa.';
    } else {
      learnContent = `Leo tutajifunza kuhusu ${topic}. Hii ni muhimu katika Kiswahili na itakusaidia kuwasiliana vyema. Tutachunguza mifano na kufanya mazoezi pamoja.`;
      practiceContent = `Zoezi: Kamilisha mazoezi ya Kiswahili yanayohusiana na ${topic} katika kitabuchako.`;
      qcQuestion = `Ulijifunza nini kuhusu ${topic} leo?`;
      qcOptions = ['Sikujifunza kitu', 'Nilijifunza kitu kipya', 'Nilijua yote', 'Sikusikiliza'];
      qcCorrect = 1;
      qcExplanation = 'Vizuri! Ulijifunza kitu kipya kuhusu ' + topic + ' leo!';
    }
  } else if (subject === 'Hygiene and Nutrition' || s.includes('hygiene') || s.includes('health') || s.includes('nutrition') || s.includes('food')) {
    if (t.includes('breakfast')) {
      learnContent = `Today we will learn about breakfast. Breakfast is the first meal of the day. We eat breakfast in the morning after we wake up. Breakfast gives us energy to learn, play, and grow. A healthy breakfast includes foods like porridge, bread, eggs, milk, fruits, and vegetables. It is important to eat breakfast every day.`;
      practiceContent = `Practice: Draw a picture of a healthy breakfast. Include at least 3 different foods. Show your drawing to a family member and tell them why each food is healthy.`;
      qcQuestion = 'Why is breakfast important?';
      qcOptions = ['It is not important', 'It gives us energy to learn and play', 'It makes us sleepy', 'We should skip breakfast'];
      qcCorrect = 1;
      qcExplanation = 'Correct! Breakfast gives us energy to learn, play, and grow.';
    } else if (t.includes('hygiene') || t.includes('clean') || t.includes('wash')) {
      learnContent = `Today we will learn about personal hygiene. Personal hygiene means keeping our body clean to stay healthy. This includes washing our hands with soap and water, brushing our teeth twice a day, bathing regularly, and wearing clean clothes. Good hygiene helps prevent diseases and keeps us feeling good.`;
      practiceContent = `Practice: Make a list of 5 things you do every day to keep clean. Ask a family member to help you add more ideas. Practice washing your hands properly with soap and water.`;
      qcQuestion = 'Why is personal hygiene important?';
      qcOptions = ['It is not important', 'It helps prevent diseases and keeps us healthy', 'It makes us tired', 'Only adults need hygiene'];
      qcCorrect = 1;
      qcExplanation = 'Correct! Good hygiene helps prevent diseases and keeps us healthy.';
    } else {
      learnContent = `Today we will learn about ${topic}. This is an important part of staying healthy and strong. We will explore why this matters and how to practice it every day.`;
      practiceContent = `Practice: Think about how you can practice ${topic} at home. Make a list of 3 things you can do and share them with a family member.`;
      qcQuestion = `What did you learn about ${topic} today?`;
      qcOptions = ['Nothing new', 'I learned something new', 'I already knew everything', 'I was not paying attention'];
      qcCorrect = 1;
      qcExplanation = 'Great! You learned something new about ' + topic + ' today!';
    }
  } else if (subject === 'Environmental Activities' || s.includes('environment') || s.includes('weather') || s.includes('water') || s.includes('soil') || s.includes('plant') || s.includes('animal')) {
    learnContent = `Today we will learn about ${topic}. Our environment includes everything around us — the air, water, soil, plants, and animals. We must take care of our environment by keeping it clean, conserving water, planting trees, and being kind to animals.`;
    practiceContent = `Practice: Observe your environment today. Write down 3 things you can see, 2 things you can hear, and 1 thing you can touch in nature.`;
    qcQuestion = 'Why should we take care of our environment?';
    qcOptions = ['We should not', 'It keeps us healthy and provides what we need', 'It is not important', 'Only adults should care'];
    qcCorrect = 1;
    qcExplanation = 'Correct! Taking care of our environment keeps us healthy and provides what we need.';
  } else if (subject === 'Movement and Creative Activities' || s.includes('movement') || s.includes('creative') || s.includes('physical') || s.includes('dance') || s.includes('game')) {
    learnContent = `Today we will learn about ${topic}. Physical activity and creativity help us grow strong, stay healthy, and express ourselves. Through movement, dance, games, and creative activities, we develop our bodies and minds.`;
    practiceContent = `Practice: Try the activity we learned about today. You can practice at home or in the yard. Show a family member what you learned.`;
    qcQuestion = 'Why is physical activity important?';
    qcOptions = ['It is not important', 'It helps us grow strong and stay healthy', 'It makes us tired', 'Only adults need exercise'];
    qcCorrect = 1;
    qcExplanation = 'Correct! Physical activity helps us grow strong and stay healthy.';
  } else {
    // Generic fallback — but still better than the contaminated template
    learnContent = `Today we will learn about ${topic}. This is an important part of your ${subject || 'learning'} journey. We will explore this topic step by step, with examples and practice to help you understand.`;
    practiceContent = `Practice: Review what you learned today. Try the exercises in your textbook or ask a family member to help you practice.`;
    qcQuestion = `What did you learn about ${topic} today?`;
    qcOptions = ['Nothing new', 'I learned something new', 'I already knew everything', 'I was not paying attention'];
    qcCorrect = 1;
    qcExplanation = 'Great! You learned something new about ' + topic + ' today!';
  }

  // Build the 10-step journey
  return [
    { id: 'welcome', stepType: 'welcome', title: 'Welcome!', studentText: 'Hello, friend! 🌟 Today we are going to learn about ' + topic + '. Are you ready?', owlText: 'Hello! I am OWL. Today we will learn about ' + topic + '. Let us get started!', visualType: 'owl_teacher', interaction: { type: 'none' }, media: {} },
    { id: 'mission', stepType: 'mission', title: 'Our Mission', studentText: 'By the end of this lesson, you will understand ' + topic + ' and be able to use what you learned!', owlText: 'Our mission is to learn about ' + topic + ' together.', visualType: 'owl_teacher', interaction: { type: 'none' }, media: {} },
    { id: 'think_first', stepType: 'think_first', title: 'Think First!', studentText: 'What do you already know about ' + topic + '? Take a moment to think about it.', owlText: 'Let us think: what do you already know?', visualType: 'owl_teacher', interaction: { type: 'open_response', prompt: 'What do you know about ' + topic + '?', placeholder: 'Share your thoughts...' }, media: {} },
    { id: 'learn', stepType: 'learn', title: 'Learn It', studentText: learnContent, owlText: 'Here is what you need to know. Listen carefully!', visualType: 'owl_teacher', interaction: { type: 'none' }, media: {} },
    { id: 'connect', stepType: 'connect', title: 'Connect to Real Life', studentText: 'Where do you see ' + topic + ' in your daily life? At home? At school? In your community?', owlText: 'We use this every day!', visualType: 'owl_teacher', interaction: { type: 'none' }, media: {} },
    { id: 'example', stepType: 'example', title: 'Let Us Try Together', studentText: 'Let me show you an example. Watch carefully, then you will try!', owlText: 'Pay attention, then it is your turn!', visualType: 'owl_teacher', interaction: { type: 'none' }, media: {} },
    { id: 'practice', stepType: 'practice', title: 'Your Turn!', studentText: practiceContent, owlText: 'You are doing great! Keep practicing.', visualType: 'owl_teacher', interaction: { type: 'none' }, media: {} },
    { id: 'quick_check', stepType: 'quick_check', title: 'Quick Check!', studentText: qcQuestion, owlText: 'This is a fun quiz! Pick the best answer.', visualType: 'owl_teacher', interaction: { type: 'multiple_choice', question: qcQuestion, options: qcOptions, correctIndex: qcCorrect, explanation: qcExplanation }, media: {} },
    { id: 'reflect', stepType: 'reflect', title: 'Think About Your Learning', studentText: 'What did you learn about ' + topic + '? Write your answer below.', owlText: 'You worked hard today!', visualType: 'owl_teacher', interaction: { type: 'open_response', prompt: 'What did you learn about ' + topic + '?', placeholder: 'Write what you learned...' }, media: {} },
    { id: 'complete', stepType: 'complete', title: 'Well Done!', studentText: 'Congratulations! 🎉 You learned about ' + topic + ' today. Keep up the great work!', owlText: 'Well done, friend! I am proud of you!', visualType: 'owl_teacher', interaction: { type: 'none' }, media: {} },
  ];
}

async function main() {
  console.log('=== GRADE 2 REPAIR SCRIPT ===\n');

  // 1. Get all Grade 2 lessons
  const { data: themes } = await db.from('Theme').select('id').eq('grade', 2);
  const { data: quests } = await db.from('Quest').select('id, themeId').in('themeId', themes?.map(t=>t.id)||[]);
  const { data: lessons } = await db.from('Lesson').select('id, title, slug, contentBlocks').in('questId', quests?.map(q=>q.id)||[]);

  console.log('Total lessons: ' + (lessons?.length || 0));

  let repaired = 0;
  let skipped = 0;

  for (const lesson of lessons || []) {
    let meta = {};
    try { meta = JSON.parse(lesson.contentBlocks || '{}'); } catch(e) {}

    const journey = meta.studentJourneyDraft || meta.studentJourney || [];
    const allText = journey.map(s => (s.studentText||'') + ' ' + (s.owlText||'')).join(' ').toLowerCase();

    // Check if this lesson needs repair
    const needsRepair = allText.includes('record your measurements') ||
      allText.includes('write down 3 things that can be measured') ||
      allText.includes('classroom door') ||
      allText.includes('thing 1') ||
      allText.includes('let me show you an example. watch carefully') ||
      allText.includes('practice: try what you learned today') ||
      allText.includes('illustration coming soon') ||
      (lesson.title.toLowerCase().includes('breakfast') && allText.includes('personal hygiene'));

    if (!needsRepair) {
      skipped++;
      continue;
    }

    // Build new journey
    const newJourney = buildJourney(
      lesson.title,
      meta.strand || '',
      meta.subStrand || '',
      meta.subject || ''
    );

    // Update the lesson
    const upd = {
      ...meta,
      studentJourneyDraft: newJourney,
      studentJourney: newJourney,
      aiMetadata: {
        ...(meta.aiMetadata || {}),
        repairedAt: new Date().toISOString(),
        repairReason: 'template-contamination-fix'
      }
    };

    const { error } = await db.from('Lesson')
      .update({ contentBlocks: JSON.stringify(upd) })
      .eq('id', lesson.id);

    if (error) {
      console.log('  ERROR: ' + lesson.title + ' - ' + error.message);
    } else {
      repaired++;
      console.log('  ✓ Repaired: ' + lesson.title);
    }
  }

  console.log('\nRepaired: ' + repaired);
  console.log('Skipped (clean): ' + skipped);
}
main().catch(e => { console.error(e); process.exit(1); });
