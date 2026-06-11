#!/usr/bin/env node
const fs = require('fs');
const env = {};
fs.readFileSync('.env','utf-8').split('\n').forEach(l => { const t=l.trim(); if(!t||t.startsWith('#'))return; const i=t.indexOf('='); if(i===-1)return; env[t.slice(0,i).trim()]=t.slice(i+1).trim().replace(/^['"]|['"]$/g,''); });
const { createClient } = require('@supabase/supabase-js');
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const BAD_PATTERNS = [
  'this is a fun quiz',
  'well done, friend',
  'pay attention, then it is your turn',
  'let me show you an example. watch carefully',
  'practice: try what you learned today',
  'what do you already know about',
  'record your measurements',
  'write down 3 things that can be measured',
  'classroom door',
  'thing 1',
  'illustration coming soon',
  'congratulations! you learned about',
  'congratulations! you practiced',
  'let us think: what do you know?',
  'here is what you need to know. good readers think',
  'remember: these words receive the action',
  'the trick: after listening, ask yourself',
  'we use this every day!',
  'watch and listen carefully. then it is your turn!',
  'when we use all our skills together',
  'where do you see ',
  'you are doing great! keep practicing',
  'you are getting it! the object pronoun',
  'you can do it! have a go',
  'you worked hard today! you can now',
  'you worked hard today! you now know',
  'your mission is to become better readers',
  'your mission is to become great at',
  'your mission is to master',
  'your mission is to practice all our english skills',
];

function needsRepair(journey) {
  if (!journey || !journey.length) return false;
  const allText = journey.map(s => (s.studentText||'') + ' ' + (s.owlText||'') + ' ' + ((s.interaction||{}).options||[]).join(' ')).join(' ').toLowerCase();
  return BAD_PATTERNS.some(p => allText.includes(p));
}

function buildJourney(title, strand, subStrand, subject) {
  let topic = title.split(':').pop().trim();
  if (!topic || topic.length < 3) topic = title;
  topic = topic.replace(/[?.!]+$/, '').trim();
  const t = title.toLowerCase();
  const subj = (subject || '').toLowerCase();
  const s = (strand || '').toLowerCase();

  const isMath = subj.includes('math') || s.includes('number') || s.includes('measurement') || s.includes('fraction') || s.includes('addition') || s.includes('subtraction') || s.includes('multiplication') || s.includes('division') || s.includes('place value');
  const isEnglish = subj.includes('english') || s.includes('reading') || s.includes('writing') || s.includes('listening') || s.includes('speaking') || s.includes('phonics') || s.includes('vocabulary') || s.includes('grammar') || s.includes('comprehension') || s.includes('fluency') || s.includes('spelling');
  const isKiswahili = subj.includes('kiswahili') || s.includes('kusoma') || s.includes('kuandika') || s.includes('kusikiliza') || s.includes('kuzungumza') || s.includes('msamiati') || s.includes('sauti') || s.includes('herufi');
  const isHygiene = subj.includes('hygiene') || s.includes('health') || s.includes('personal') || s.includes('food') || s.includes('nutrition') || s.includes('safety');
  const isEnvironmental = subj.includes('environment') || s.includes('weather') || s.includes('water') || s.includes('soil') || s.includes('plant') || s.includes('animal') || s.includes('conservation') || s.includes('waste');
  const isMovement = subj.includes('movement') || s.includes('movement') || s.includes('physical') || s.includes('dance') || s.includes('game') || s.includes('swimming') || s.includes('gymnastics') || s.includes('athletic');

  let learnContent = 'Today we will learn about ' + topic + '. We will explore this topic step by step with examples and practice.';
  let practiceContent = 'Practice: Complete the exercises related to ' + topic + '. Ask a family member to help you review.';
  let qcQuestion = 'What did you learn about ' + topic + ' today?';
  let qcOptions = ['Nothing new', 'I learned something new', 'I already knew everything', 'I was not paying attention'];
  let qcCorrect = 1;
  let qcExplanation = 'Great! You learned something new about ' + topic + ' today!';

  if (isMath) {
    if (t.includes('addition')) {
      learnContent = 'Today we will learn about addition. Addition means putting numbers together to make a bigger number. For example: 2 + 3 = 5.';
      practiceContent = 'Practice: Solve these addition problems: 3 + 2 = ?  4 + 1 = ?  2 + 2 = ?';
      qcQuestion = 'What is 3 + 2?'; qcOptions = ['4','5','6','3']; qcCorrect = 1; qcExplanation = 'Correct! 3 + 2 = 5.';
    } else if (t.includes('subtraction')) {
      learnContent = 'Today we will learn about subtraction. Subtraction means taking away from a number. For example: 5 - 2 = 3.';
      practiceContent = 'Practice: Solve these subtraction problems: 5 - 2 = ?  4 - 1 = ?  6 - 3 = ?';
      qcQuestion = 'What is 5 - 2?'; qcOptions = ['2','4','3','5']; qcCorrect = 2; qcExplanation = 'Correct! 5 - 2 = 3.';
    } else if (t.includes('fraction') || t.includes('half') || t.includes('quarter')) {
      learnContent = 'Today we will learn about fractions. A fraction is a part of a whole. A half (1/2) means one part out of two equal parts.';
      practiceContent = 'Practice: Draw a circle and shade half of it. Then draw a rectangle and shade a quarter of it.';
      qcQuestion = 'What does a half (1/2) mean?'; qcOptions = ['One part out of four','One part out of two','Two parts out of one','The whole thing']; qcCorrect = 1; qcExplanation = 'Correct! A half means one part out of two equal parts.';
    } else if (t.includes('measurement') || t.includes('metre') || t.includes('kilogram')) {
      learnContent = 'Today we will learn about measurement. We use metres (m) to measure length and kilograms (kg) to measure mass.';
      practiceContent = 'Practice: Find 3 things at home that you can measure with a metre ruler.';
      qcQuestion = 'What do we use to measure length?'; qcOptions = ['Kilograms','Metres','Litres','Cups']; qcCorrect = 1; qcExplanation = 'Correct! We use metres to measure length.';
    }
  } else if (isEnglish) {
    if (t.includes('reading') || t.includes('read')) {
      learnContent = 'Today we will practice reading. Reading helps us understand stories and learn new words. When we read, we look at the words carefully and think about what they mean.';
      practiceContent = 'Practice: Read a short passage from your textbook. After reading, tell someone what it was about.';
      qcQuestion = 'What do good readers do?'; qcOptions = ['Only look at pictures','Read carefully and think about the meaning','Skip hard words','Read as fast as possible']; qcCorrect = 1; qcExplanation = 'Correct! Good readers read carefully and think about the meaning.';
    } else if (t.includes('writing') || t.includes('write')) {
      learnContent = 'Today we will practice writing. Writing helps us share our thoughts. We start sentences with a capital letter and end with a full stop.';
      practiceContent = 'Practice: Write 5 sentences about your favourite animal. Start each with a capital letter and end with a full stop.';
      qcQuestion = 'What do we need at the start of a sentence?'; qcOptions = ['A small letter','A capital letter','A picture','A number']; qcCorrect = 1; qcExplanation = 'Correct! We start a sentence with a capital letter.';
    } else if (t.includes('listening') || t.includes('listen')) {
      learnContent = 'Today we will practice listening. Good listeners pay attention, think about what they hear, and ask questions when they do not understand.';
      practiceContent = 'Practice: Listen to someone read a story aloud. After, tell them the main idea of the story.';
      qcQuestion = 'What do good listeners do?'; qcOptions = ['Talk while others speak','Pay attention and think about what they hear','Look away','Interrupt']; qcCorrect = 1; qcExplanation = 'Correct! Good listeners pay attention and think about what they hear.';
    } else if (t.includes('speaking') || t.includes('speak') || t.includes('greeting') || t.includes('conversation')) {
      learnContent = 'Today we will practice speaking. Good speakers use clear words, speak at the right volume, and take turns in conversations.';
      practiceContent = 'Practice: Have a conversation with a family member about your day. Use clear words and take turns speaking.';
      qcQuestion = 'What do good speakers do?'; qcOptions = ['Shout loudly','Use clear words and take turns','Talk over others','Stay silent']; qcCorrect = 1; qcExplanation = 'Correct! Good speakers use clear words and take turns.';
    }
  } else if (isKiswahili) {
    learnContent = 'Leo tutajifunza kuhusu ' + topic + '. Tutachunguza mifano na kufanya mazoezi pamoja.';
    practiceContent = 'Zoezi: Kamilisha mazoezi yanayohusiana na ' + topic + ' katika kitabuchako.';
    qcQuestion = 'Ulijifunza nini kuhusu ' + topic + ' leo?';
    qcOptions = ['Sikujifunza kitu','Nilijifunza kitu kipya','Nilijua yote','Sikusikiliza']; qcCorrect = 1;
    qcExplanation = 'Vizuri! Ulijifunza kitu kipya kuhusu ' + topic + ' leo!';
  } else if (isHygiene) {
    if (t.includes('breakfast')) {
      learnContent = 'Today we will learn about breakfast. Breakfast is the first meal of the day. It gives us energy to learn, play, and grow. A healthy breakfast includes foods like porridge, bread, eggs, milk, and fruits.';
      practiceContent = 'Practice: Draw a picture of a healthy breakfast with at least 3 different foods. Show your drawing to a family member.';
      qcQuestion = 'Why is breakfast important?'; qcOptions = ['It is not important','It gives us energy to learn and play','It makes us sleepy','We should skip breakfast']; qcCorrect = 1; qcExplanation = 'Correct! Breakfast gives us energy to learn, play, and grow.';
    } else if (t.includes('hygiene') || t.includes('clean') || t.includes('wash')) {
      learnContent = 'Today we will learn about personal hygiene. Personal hygiene means keeping our body clean to stay healthy. This includes washing hands with soap, brushing teeth twice a day, and bathing regularly.';
      practiceContent = 'Practice: Make a list of 5 things you do every day to keep clean. Practice washing your hands properly.';
      qcQuestion = 'Why is personal hygiene important?'; qcOptions = ['It is not important','It helps prevent diseases and keeps us healthy','It makes us tired','Only adults need hygiene']; qcCorrect = 1; qcExplanation = 'Correct! Good hygiene helps prevent diseases and keeps us healthy.';
    } else if (t.includes('food') || t.includes('nutrition') || t.includes('eat') || t.includes('meal') || t.includes('taste')) {
      learnContent = 'Today we will learn about ' + topic + '. Good nutrition helps our bodies grow strong and stay healthy. We should eat a variety of foods.';
      practiceContent = 'Practice: Write down everything you ate yesterday. Circle the healthy foods. Ask a family member to help you plan a healthy meal.';
      qcQuestion = 'Why should we eat a variety of foods?'; qcOptions = ['We should not','Different foods give our bodies different nutrients we need','Only one type of food is enough','Variety is not important']; qcCorrect = 1; qcExplanation = 'Correct! Different foods give our bodies different nutrients we need.';
    } else if (t.includes('safety') || t.includes('danger') || t.includes('accident') || t.includes('safe')) {
      learnContent = 'Today we will learn about ' + topic + '. Staying safe means being aware of dangers and knowing how to protect ourselves.';
      practiceContent = 'Practice: Walk around your home and school. Identify 3 potential dangers and tell a family member or teacher.';
      qcQuestion = 'What should you do when you see a danger?'; qcOptions = ['Ignore it','Tell a trusted adult immediately','Touch it to see what happens','Keep it a secret']; qcCorrect = 1; qcExplanation = 'Correct! When you see a danger, tell a trusted adult immediately.';
    }
  } else if (isEnvironmental) {
    if (t.includes('weather')) {
      learnContent = 'Today we will learn about weather. Weather is what is happening in the sky and air around us. It can be sunny, cloudy, rainy, or windy.';
      practiceContent = 'Practice: Look outside and describe today\'s weather. Draw a picture of the weather.';
      qcQuestion = 'What is weather?'; qcOptions = ['What is happening in the sky and air around us','Only rain','Only sunshine','Something that only happens at night']; qcCorrect = 0; qcExplanation = 'Correct! Weather is what is happening in the sky and air around us.';
    } else if (t.includes('water')) {
      learnContent = 'Today we will learn about water. Water is essential for all living things. We must use water wisely and keep it clean.';
      practiceContent = 'Practice: List 5 ways you use water at home. Think about how you can save water.';
      qcQuestion = 'Why is water important?'; qcOptions = ['It is not important','It is essential for all living things','Only animals need water','We have unlimited water']; qcCorrect = 1; qcExplanation = 'Correct! Water is essential for all living things.';
    } else if (t.includes('plant') || t.includes('tree') || t.includes('leaf') || t.includes('root') || t.includes('seed')) {
      learnContent = 'Today we will learn about plants. Plants are living things that need water, sunlight, and soil to grow. Plants have roots, stems, and leaves.';
      practiceContent = 'Practice: Observe a plant near your home. Draw the plant and label its parts.';
      qcQuestion = 'What do plants need to grow?'; qcOptions = ['Only water','Water, sunlight, and soil','Only darkness','Nothing']; qcCorrect = 1; qcExplanation = 'Correct! Plants need water, sunlight, and soil to grow.';
    } else if (t.includes('animal')) {
      learnContent = 'Today we will learn about animals. Animals are living things that need food, water, and shelter. We should be kind to all animals.';
      practiceContent = 'Practice: Observe an animal near your home. Draw the animal and write 3 things you noticed.';
      qcQuestion = 'What do all animals need?'; qcOptions = ['Only food','Food, water, and shelter','Only water','Nothing']; qcCorrect = 1; qcExplanation = 'Correct! All animals need food, water, and shelter.';
    } else if (t.includes('waste') || t.includes('litter') || t.includes('pollution') || t.includes('clean')) {
      learnContent = 'Today we will learn about keeping our environment clean. Waste and litter can make our environment dirty and unhealthy.';
      practiceContent = 'Practice: Walk around your school or home. Pick up any litter you find and put it in the bin.';
      qcQuestion = 'What should we do with waste?'; qcOptions = ['Throw it anywhere','Put it in the right place like a bin','Burn it','Leave it on the ground']; qcCorrect = 1; qcExplanation = 'Correct! We should put waste in the right place like a bin.';
    }
  } else if (isMovement) {
    if (t.includes('jump') || t.includes('hop') || t.includes('leap')) {
      learnContent = 'Today we will learn about jumping and hopping. These are locomotor skills that help us move our bodies.';
      practiceContent = 'Practice: Practice jumping forward 5 times. Then practice hopping on one foot 5 times on each foot.';
      qcQuestion = 'What is the difference between jumping and hopping?'; qcOptions = ['There is no difference','Jumping uses both feet, hopping uses one foot','Hopping uses both feet, jumping uses one foot','They are the same']; qcCorrect = 1; qcExplanation = 'Correct! Jumping uses both feet, hopping uses one foot.';
    } else if (t.includes('throw') || t.includes('catch') || t.includes('kick') || t.includes('pass') || t.includes('dribble')) {
      learnContent = 'Today we will learn about ball skills. Throwing, catching, kicking, and passing are important movement skills.';
      practiceContent = 'Practice: Practice throwing and catching a ball with a partner. Try kicking a ball to a target.';
      qcQuestion = 'Why are ball skills important?'; qcOptions = ['They are not important','They help us play games and work together','Only professional athletes need them','They are only for boys']; qcCorrect = 1; qcExplanation = 'Correct! Ball skills help us play games and work together.';
    } else if (t.includes('dance') || t.includes('sing') || t.includes('music') || t.includes('rhythm') || t.includes('beat')) {
      learnContent = 'Today we will learn about ' + topic + '. Music and movement help us express ourselves, stay active, and have fun.';
      practiceContent = 'Practice: Listen to a song and move your body to the beat. Try creating your own dance moves.';
      qcQuestion = 'How can we express ourselves through music and movement?'; qcOptions = ['We cannot','By moving our bodies to rhythms and creating dance moves','By sitting still','By only listening']; qcCorrect = 1; qcExplanation = 'Correct! We can express ourselves by moving our bodies to rhythms.';
    } else if (t.includes('swim') || t.includes('float') || t.includes('glide') || t.includes('water safety')) {
      learnContent = 'Today we will learn about ' + topic + '. Water safety is very important. We should always swim with adult supervision.';
      practiceContent = 'Practice: Practice floating on your back with adult supervision. Review water safety rules.';
      qcQuestion = 'What is the most important water safety rule?'; qcOptions = ['Swim alone','Always swim with adult supervision','Run near the pool','Hold your breath underwater']; qcCorrect = 1; qcExplanation = 'Correct! Always swim with adult supervision.';
    } else if (t.includes('balance') || t.includes('roll') || t.includes('gymnastic') || t.includes('forward roll')) {
      learnContent = 'Today we will learn about ' + topic + '. Gymnastics skills help us develop balance, strength, and coordination.';
      practiceContent = 'Practice: Practice the skills we learned today on a soft surface with adult guidance.';
      qcQuestion = 'Why should we practice gymnastics on soft surfaces?'; qcOptions = ['It is not important','To stay safe and prevent injuries','Because hard surfaces are better','Only professionals need soft surfaces']; qcCorrect = 1; qcExplanation = 'Correct! We practice on soft surfaces to stay safe.';
    } else {
      learnContent = 'Today we will learn about ' + topic + '. Physical activity helps us grow strong, stay healthy, and have fun.';
      practiceContent = 'Practice: Try the movement activity we learned today. Show a family member.';
      qcQuestion = 'Why is physical activity important?'; qcOptions = ['It is not important','It helps us grow strong and stay healthy','It makes us tired','Only adults need exercise']; qcCorrect = 1; qcExplanation = 'Correct! Physical activity helps us grow strong and stay healthy.';
    }
  }

  return [
    { id: 'welcome', stepType: 'welcome', title: 'Welcome!', studentText: 'Hello, friend! \uD83C\uDF1F Today we are going to learn about ' + topic + '. Are you ready?', owlText: 'Hello! I am OWL. Today we will learn about ' + topic + '. Let us get started!', visualType: 'owl_teacher', interaction: { type: 'none' }, media: {} },
    { id: 'mission', stepType: 'mission', title: 'Our Mission', studentText: 'By the end of this lesson, you will understand ' + topic + ' and be able to use what you learned!', owlText: 'Our mission is to learn about ' + topic + ' together.', visualType: 'owl_teacher', interaction: { type: 'none' }, media: {} },
    { id: 'think_first', stepType: 'think_first', title: 'Think First!', studentText: 'What do you already know about ' + topic + '? Take a moment to think about it.', owlText: 'Let us think: what do you already know?', visualType: 'owl_teacher', interaction: { type: 'open_response', prompt: 'What do you know about ' + topic + '?', placeholder: 'Share your thoughts...' }, media: {} },
    { id: 'learn', stepType: 'learn', title: 'Learn It', studentText: learnContent, owlText: 'Here is what you need to know. Listen carefully!', visualType: 'owl_teacher', interaction: { type: 'none' }, media: {} },
    { id: 'connect', stepType: 'connect', title: 'Connect to Real Life', studentText: 'Where do you see ' + topic + ' in your daily life? At home? At school? In your community?', owlText: 'We use this every day!', visualType: 'owl_teacher', interaction: { type: 'none' }, media: {} },
    { id: 'example', stepType: 'example', title: 'Let Us Try Together', studentText: 'Let me show you an example. Watch carefully, then you will try!', owlText: 'Pay attention, then it is your turn!', visualType: 'owl_teacher', interaction: { type: 'none' }, media: {} },
    { id: 'practice', stepType: 'practice', title: 'Your Turn!', studentText: practiceContent, owlText: 'You are doing great! Keep practicing.', visualType: 'owl_teacher', interaction: { type: 'none' }, media: {} },
    { id: 'quick_check', stepType: 'quick_check', title: 'Quick Check!', studentText: qcQuestion, owlText: 'This is a fun quiz! Pick the best answer.', visualType: 'owl_teacher', interaction: { type: 'multiple_choice', question: qcQuestion, options: qcOptions, correctIndex: qcCorrect, explanation: qcExplanation }, media: {} },
    { id: 'reflect', stepType: 'reflect', title: 'Think About Your Learning', studentText: 'What did you learn about ' + topic + '? Write your answer below.', owlText: 'You worked hard today!', visualType: 'owl_teacher', interaction: { type: 'open_response', prompt: 'What did you learn about ' + topic + '?', placeholder: 'Write what you learned...' }, media: {} },
    { id: 'complete', stepType: 'complete', title: 'Well Done!', studentText: 'Congratulations! \uD83C\uDF89 You learned about ' + topic + ' today. Keep up the great work!', owlText: 'Well done, friend! I am proud of you!', visualType: 'owl_teacher', interaction: { type: 'none' }, media: {} },
  ];
}

async function delay(ms) {
  return new Promise(function(resolve) { setTimeout(resolve, ms); });
}

async function updateLesson(lesson, upd, retries) {
  for (var i = 0; i < retries; i++) {
    try {
      var { error } = await db.from('Lesson')
        .update({ contentBlocks: JSON.stringify(upd) })
        .eq('id', lesson.id);
      if (!error) return true;
      if (i < retries - 1) await delay(1000 * (i + 1));
    } catch(e) {
      if (i < retries - 1) await delay(1000 * (i + 1));
    }
  }
  return false;
}

async function main() {
  console.log('=== GRADE 2 FULL REPAIR (with retry) ===\n');

  var { data: themes } = await db.from('Theme').select('id').eq('grade', 2);
  var { data: quests } = await db.from('Quest').select('id, themeId').in('themeId', themes?.map(function(t){return t.id;})||[]);
  var { data: lessons } = await db.from('Lesson').select('id, title, slug, contentBlocks').in('questId', quests?.map(function(q){return q.id;})||[]);

  console.log('Total lessons: ' + (lessons?.length || 0));

  var repaired = 0, skipped = 0, errors = 0;

  for (var i = 0; i < (lessons||[]).length; i++) {
    var lesson = lessons[i];
    var meta = {};
    try { meta = JSON.parse(lesson.contentBlocks || '{}'); } catch(e) {}
    var journey = meta.studentJourneyDraft || meta.studentJourney || [];

    if (!needsRepair(journey)) { skipped++; continue; }

    var newJourney = buildJourney(lesson.title, meta.strand || '', meta.subStrand || '', meta.subject || '');
    var upd = Object.assign({}, meta, {
      studentJourneyDraft: newJourney,
      studentJourney: newJourney,
      aiMetadata: Object.assign({}, meta.aiMetadata || {}, { repairedAt: new Date().toISOString(), repairReason: 'full-cleanup-v3' })
    });

    var ok = await updateLesson(lesson, upd, 3);
    if (ok) {
      repaired++;
      if (repaired % 100 === 0) console.log('  Progress: ' + repaired + ' repaired...');
    } else {
      errors++;
    }

    // Small delay to avoid rate limiting
    if (i % 10 === 0) await delay(100);
  }

  console.log('\n=== RESULTS ===');
  console.log('Repaired: ' + repaired);
  console.log('Skipped (clean): ' + skipped);
  console.log('Errors: ' + errors);
}
main().catch(function(e) { console.error(e); process.exit(1); });
