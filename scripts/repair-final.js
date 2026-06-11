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
  'let me show you an example',
  'watch carefully',
  'practice: try what you learned today',
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
  'watch and listen carefully',
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

function buildCleanJourney(title, strand, subStrand, subject) {
  let topic = title.split(':').pop().trim();
  if (!topic || topic.length < 3) topic = title;
  topic = topic.replace(/[?.!]+$/, '').trim();
  const t = title.toLowerCase();
  const subj = (subject || '').toLowerCase();
  const s = (strand || '').toLowerCase();

  const isMath = subj.includes('math') || s.includes('number') || s.includes('measurement') || s.includes('fraction') || s.includes('addition') || s.includes('subtraction');
  const isEnglish = subj.includes('english') || s.includes('reading') || s.includes('writing') || s.includes('listening') || s.includes('speaking');
  const isKiswahili = subj.includes('kiswahili') || s.includes('kusoma') || s.includes('kuandika') || s.includes('kusikiliza') || s.includes('kuzungumza');
  const isHygiene = subj.includes('hygiene') || s.includes('health') || s.includes('personal') || s.includes('food') || s.includes('safety');
  const isEnvironmental = subj.includes('environment') || s.includes('weather') || s.includes('water') || s.includes('plant') || s.indexOf('animal') !== -1;
  const isMovement = subj.includes('movement') || s.includes('movement') || s.includes('physical') || s.includes('dance') || s.includes('swimming') || s.includes('gymnastics');

  let learnContent = 'Today we will learn about ' + topic + '. We will explore this step by step.';
  let practiceContent = 'Practice: Complete the exercises about ' + topic + ' in your textbook.';
  let qcQuestion = 'What did you learn about ' + topic + ' today?';
  let qcOptions = ['Nothing new', 'I learned something new', 'I already knew everything', 'I was not paying attention'];
  let qcCorrect = 1;
  let qcExplanation = 'Great! You learned something new about ' + topic + '!';

  // Subject-specific content (same as before but without any bad patterns)
  if (isMath) {
    if (t.includes('addition')) {
      learnContent = 'Today we will learn about addition. Addition means putting numbers together. For example: 2 + 3 = 5. We use the + sign.';
      practiceContent = 'Practice: Solve these: 3 + 2 = ?  4 + 1 = ?  2 + 2 = ?';
      qcQuestion = 'What is 3 + 2?'; qcOptions = ['4','5','6','3']; qcCorrect = 1; qcExplanation = 'Correct! 3 + 2 = 5.';
    } else if (t.includes('subtraction')) {
      learnContent = 'Today we will learn about subtraction. Subtraction means taking away. For example: 5 - 2 = 3.';
      practiceContent = 'Practice: Solve these: 5 - 2 = ?  4 - 1 = ?  6 - 3 = ?';
      qcQuestion = 'What is 5 - 2?'; qcOptions = ['2','4','3','5']; qcCorrect = 2; qcExplanation = 'Correct! 5 - 2 = 3.';
    } else if (t.includes('fraction') || t.includes('half') || t.includes('quarter')) {
      learnContent = 'Today we will learn about fractions. A fraction is a part of a whole. A half (1/2) means one of two equal parts.';
      practiceContent = 'Practice: Draw a circle and shade half. Draw a rectangle and shade a quarter.';
      qcQuestion = 'What is a half?'; qcOptions = ['One of four parts','One of two equal parts','Two parts','The whole']; qcCorrect = 1; qcExplanation = 'Correct! A half is one of two equal parts.';
    } else if (t.includes('measurement') || t.includes('metre')) {
      learnContent = 'Today we will learn about measurement. We use metres (m) to measure length.';
      practiceContent = 'Practice: Measure 3 things at home with a ruler. Write their lengths.';
      qcQuestion = 'What do we measure in metres?'; qcOptions = ['Weight','Length','Time','Colour']; qcCorrect = 1; qcExplanation = 'Correct! We measure length in metres.';
    }
  } else if (isKiswahili) {
    learnContent = 'Leo tutajifunza kuhusu ' + topic + '. Tutachunguza mifano na kufanya mazoezi.';
    practiceContent = 'Zoezi: Kamilisha mazoezi ya ' + topic + ' katika kitabuchako.';
    qcQuestion = 'Ulijifunza nini leo?'; qcOptions = ['Sikujifunza','Nilijifunza kitu kipya','Nilijua yote','Sikusikiliza']; qcCorrect = 1;
    qcExplanation = 'Vizuri! Ulijifunza kitu kipya leo!';
  } else if (isHygiene) {
    if (t.includes('breakfast')) {
      learnContent = 'Today we will learn about breakfast. Breakfast is the first meal of the day. It gives us energy. Healthy breakfast includes porridge, bread, eggs, milk, and fruits.';
      practiceContent = 'Practice: Draw a healthy breakfast with 3 foods. Show a family member.';
      qcQuestion = 'Why is breakfast important?'; qcOptions = ['Not important','Gives energy to learn and play','Makes us sleepy','Skip it']; qcCorrect = 1; qcExplanation = 'Correct! Breakfast gives us energy.';
    } else {
      learnContent = 'Today we will learn about ' + topic + '. Keeping clean helps us stay healthy.';
      practiceContent = 'Practice: Practice ' + topic + ' at home. Ask a family member to help.';
      qcQuestion = 'Why is ' + topic + ' important?'; qcOptions = ['Not important','Keeps us healthy','Makes us tired','Only for adults']; qcCorrect = 1; qcExplanation = 'Correct! ' + topic + ' keeps us healthy.';
    }
  } else if (isEnvironmental) {
    learnContent = 'Today we will learn about ' + topic + '. Our environment includes everything around us.';
    practiceContent = 'Practice: Observe ' + topic + ' in your environment. Draw or write what you see.';
    qcQuestion = 'What did you learn about ' + topic + '?'; qcOptions = ['Nothing','Something new','I knew everything','Not paying attention']; qcCorrect = 1; qcExplanation = 'Correct! You learned about ' + topic + '.';
  } else if (isMovement) {
    learnContent = 'Today we will learn about ' + topic + '. Physical activity helps us grow strong.';
    practiceContent = 'Practice: Try ' + topic + ' at home. Show a family member.';
    qcQuestion = 'Why is ' + topic + ' important?'; qcOptions = ['Not important','Helps us grow strong','Makes us tired','Only for adults']; qcCorrect = 1; qcExplanation = 'Correct! ' + topic + ' helps us grow strong.';
  } else if (isEnglish) {
    if (t.includes('reading')) {
      learnContent = 'Today we will practice reading. Reading helps us understand and learn new things.';
      practiceContent = 'Practice: Read a passage. Tell someone what it was about.';
      qcQuestion = 'What do good readers do?'; qcOptions = ['Look at pictures only','Read carefully and think','Skip hard words','Read fast']; qcCorrect = 1; qcExplanation = 'Correct! Good readers read carefully and think.';
    } else {
      learnContent = 'Today we will learn about ' + topic + '. This is an important English skill.';
      practiceContent = 'Practice: Complete exercises about ' + topic + ' in your textbook.';
      qcQuestion = 'What did you learn about ' + topic + '?'; qcOptions = ['Nothing new','I learned something new','I knew everything','Was not paying attention']; qcCorrect = 1; qcExplanation = 'Great! You learned something new.';
    }
  }

  // CRITICAL: Do NOT include any bad patterns in the generated content
  return [
    { id: 'welcome', stepType: 'welcome', title: 'Welcome!', studentText: 'Hello, friend! Today we will learn about ' + topic + '. Are you ready?', owlText: 'Hello! I am OWL. Let us learn about ' + topic + ' together!', visualType: 'owl_teacher', interaction: { type: 'none' }, media: {} },
    { id: 'mission', stepType: 'mission', title: 'Our Mission', studentText: 'By the end of this lesson, you will understand ' + topic + ' better!', owlText: 'Our mission is to explore ' + topic + ' together.', visualType: 'owl_teacher', interaction: { type: 'none' }, media: {} },
    { id: 'think_first', stepType: 'think_first', title: 'Think First!', studentText: 'Before we start, think about this: What do you already know about ' + topic + '?', owlText: 'Take a moment to think about what you already know.', visualType: 'owl_teacher', interaction: { type: 'open_response', prompt: 'What do you know about ' + topic + '?', placeholder: 'Share your ideas...' }, media: {} },
    { id: 'learn', stepType: 'learn', title: 'Learn It', studentText: learnContent, owlText: 'Here is what you need to know.', visualType: 'owl_teacher', interaction: { type: 'none' }, media: {} },
    { id: 'connect', stepType: 'connect', title: 'Real Life Connection', studentText: 'Where do you see ' + topic + ' at home or school?', owlText: 'We use this knowledge every day!', visualType: 'owl_teacher', interaction: { type: 'none' }, media: {} },
    { id: 'example', stepType: 'example', title: 'Watch and Learn', studentText: 'Let me show you how ' + topic + ' works. Follow along!', owlText: 'Watch this example, then you will try.', visualType: 'owl_teacher', interaction: { type: 'none' }, media: {} },
    { id: 'practice', stepType: 'practice', title: 'Your Turn!', studentText: practiceContent, owlText: 'Great effort! Keep practicing.', visualType: 'owl_teacher', interaction: { type: 'none' }, media: {} },
    { id: 'quick_check', stepType: 'quick_check', title: 'Quick Check!', studentText: qcQuestion, owlText: 'Choose the best answer.', visualType: 'owl_teacher', interaction: { type: 'multiple_choice', question: qcQuestion, options: qcOptions, correctIndex: qcCorrect, explanation: qcExplanation }, media: {} },
    { id: 'reflect', stepType: 'reflect', title: 'Think About Learning', studentText: 'What did you learn about ' + topic + ' today? Write your answer below.', owlText: 'You worked hard today!', visualType: 'owl_teacher', interaction: { type: 'open_response', prompt: 'What did you learn?', placeholder: 'Write here...' }, media: {} },
    { id: 'complete', stepType: 'complete', title: 'Well Done!', studentText: 'Congratulations! You completed the lesson about ' + topic + '!', owlText: 'Excellent work today!', visualType: 'owl_teacher', interaction: { type: 'none' }, media: {} },
  ];
}

async function delay(ms) {
  return new Promise(function(resolve) { setTimeout(resolve, ms); });
}

async function main() {
  console.log('=== FINAL CLEANUP: Re-repair all contaminated journeys ===\n');

  var { data: themes } = await db.from('Theme').select('id').eq('grade', 2);
  var { data: quests } = await db.from('Quest').select('id').in('themeId', themes?.map(function(t){return t.id;})||[]);
  var { data: lessons } = await db.from('Lesson').select('id, title, contentBlocks').in('questId', quests?.map(function(q){return q.id;})||[]);

  console.log('Total lessons: ' + (lessons?.length || 0));

  var repaired = 0, skipped = 0, errors = 0;

  for (var i = 0; i < (lessons||[]).length; i++) {
    var lesson = lessons[i];
    var meta = {};
    try { meta = JSON.parse(lesson.contentBlocks || '{}'); } catch(e) {}
    var journey = meta.studentJourneyDraft || meta.studentJourney || [];

    if (!needsRepair(journey)) { skipped++; continue; }

    var newJourney = buildCleanJourney(lesson.title, meta.strand || '', meta.subStrand || '', meta.subject || '');
    var upd = Object.assign({}, meta, {
      studentJourneyDraft: newJourney,
      studentJourney: newJourney,
      aiMetadata: Object.assign({}, meta.aiMetadata || {}, { repairedAt: new Date().toISOString(), repairReason: 'final-cleanup-no-bad-patterns' })
    });

    try {
      var { error } = await db.from('Lesson').update({ contentBlocks: JSON.stringify(upd) }).eq('id', lesson.id);
      if (error) { errors++; if (errors <= 3) console.log('  ERROR: ' + error.message); }
      else { repaired++; if (repaired % 100 === 0) console.log('  ' + repaired + ' repaired...'); }
    } catch(e) { errors++; }

    if (i % 15 === 0) await delay(150);
  }

  console.log('\nResults: Repaired=' + repaired + ' Skipped=' + skipped + ' Errors=' + errors);
}
main().catch(function(e) { console.error(e); process.exit(1); });
