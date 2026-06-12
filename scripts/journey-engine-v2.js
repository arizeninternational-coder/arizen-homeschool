#!/usr/bin/env node
/**
 * ============================================================================
 * GRADE 2 JOURNEY GENERATION SYSTEM v2
 * ============================================================================
 * 
 * Architecture:
 * 1. Lesson Blueprint Layer — Extract structured data from curriculum fields
 * 2. Shared Journey Engine — 10-step structure, tone, validation rules
 * 3. Subject-Specific Adapters — English adapter (starting point)
 * 4. Validation Layer — Quality gates before saving
 * 
 * Principles:
 * - Use curriculum fields, not title matching
 * - Every journey teaches the specific lesson
 * - Similar skills under different themes must differ
 * - No generic filler, no title-copying, no answer leaks
 * - Child-friendly language for Grade 2
 */

const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const t = line.trim();
  if (!t || t.startsWith('#')) return;
  const i = t.indexOf('=');
  if (i === -1) return;
  envVars[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^['"]|['"]$/g, '');
});
const { createClient } = require('@supabase/supabase-js');

// ═══════════════════════════════════════════════════════════════════════════
// LOCALIZATION MAP
// ═══════════════════════════════════════════════════════════════════════════

const JOURNEY_LABELS = {
  en: {
    welcome: 'Welcome!',
    startMission: "Let's Start!",
    ready: "I'm Ready",
    thinkFirst: 'Think First!',
    learn: 'Learn It',
    connect: 'Real Life Connection',
    example: 'Watch and Learn',
    practice: 'Your Turn!',
    quickCheck: 'Quick Check!',
    checkAnswer: 'Check Answer',
    reflect: 'Think About Your Learning',
    continueFinish: 'Continue',
    youDidIt: 'You did it!',
    greatWork: 'Great work!',
    backToQuest: 'Back to Quest',
    beginJourney: 'Begin Lesson',
    whatLearned: 'What did you learn?',
    saveWork: 'Save My Work',
  },
  sw: {
    welcome: 'Karibu!',
    startMission: 'Tuanze!',
    ready: 'Niko tayari',
    thinkFirst: 'Fikiria Kwanza!',
    learn: 'Jifunze',
    connect: 'Uhusiano na Maisha Halisi',
    example: 'Tazama na Ujifunze',
    practice: 'Zoezi Lako!',
    quickCheck: 'Ukaguzi wa Haraka',
    checkAnswer: 'Angalia Jibu',
    reflect: 'Fifikri Kuhusu Kujifunza',
    continueFinish: 'Endelea',
    youDidIt: 'Umefanya vizuri!',
    greatWork: 'Kazi nzuri!',
    backToQuest: 'Rudi kwenye Quest',
    beginJourney: 'Anza Somo',
    whatLearned: 'Ulijifunza nini?',
    saveWork: 'Hifadhi Kazi Yangu',
  },
};

function getLabel(lang, key) {
  return JOURNEY_LABELS[lang]?.[key] || JOURNEY_LABELS.en[key] || key;
}

// ═══════════════════════════════════════════════════════════════════════════
// LANGUAGE DETECTION
// ═══════════════════════════════════════════════════════════════════════════

function detectLanguage(contentBlocks) {
  try {
    const meta = typeof contentBlocks === 'string' ? JSON.parse(contentBlocks) : (contentBlocks || {});
    const subj = (meta.subject || meta.strand || '').toLowerCase();
    if (subj.includes('kiswahili') || subj.includes('kusoma') || subj.includes('kuandika') || subj.includes('kusikiliza') || subj.includes('kuzungumza') || subj.includes('msamiati') || subj.includes('sauti') || subj.includes('sarufi') || subj.includes('tathmini')) return 'sw';
    return 'en';
  } catch { return 'en'; }
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 1: LESSON BLUEPRINT LAYER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Extract a structured blueprint from curriculum fields.
 * This is the foundation — every journey is built from this blueprint.
 */
function buildLessonBlueprint(lesson, meta) {
  const title = lesson.title || '';
  const learningOutcome = meta.learningOutcome || '';
  const specificLO = meta.specificLearningOutcome || '';
  const keyInquiry = meta.keyInquiryQuestion || '';
  const suggestedExp = meta.suggestedLearningExperience || '';
  const activityInst = meta.activityInstructions || '';
  const strand = meta.strand || '';
  const subStrand = meta.subStrand || '';
  const subject = meta.subject || '';
  const term = meta.term || '';
  const week = meta.week || '';

  // Derive child-friendly title from original title
  const childFriendlyTitle = deriveChildFriendlyTitle(title, strand, subStrand);

  // Extract lesson goal from learning outcome (simplified for Grade 2)
  const lessonGoal = deriveLessonGoal(learningOutcome, specificLO, keyInquiry);

  // Extract key vocabulary from title and learning outcome
  const keyVocabulary = extractKeyVocabulary(title, learningOutcome, specificLO);

  // Derive concept to teach
  const conceptToTeach = deriveConcept(title, learningOutcome, specificLO, strand, subStrand);

  // Derive misconception to avoid
  const misconceptionToAvoid = deriveMisconception(strand, subStrand, conceptToTeach);

  // Derive real-life connection
  const realLifeConnection = deriveRealLifeConnection(title, strand, subStrand, keyInquiry);

  // Derive guided example
  const guidedExample = deriveGuidedExample(title, strand, subStrand, suggestedExp, activityInst);

  // Derive practice tasks
  const guidedPractice = deriveGuidedPractice(title, strand, subStrand, suggestedExp, activityInst, 'guided');
  const independentPractice = deriveGuidedPractice(title, strand, subStrand, suggestedExp, activityInst, 'independent');

  // Derive Quick Check
  const quickCheck = deriveQuickCheck(title, learningOutcome, specificLO, keyInquiry, strand, subStrand, conceptToTeach);

  // Derive reflection prompt
  const reflectionPrompt = deriveReflectionPrompt(title, learningOutcome, keyInquiry, conceptToTeach);

  // Determine interaction type
  const interactionType = determineInteractionType(strand, subStrand);

  return {
    originalTitle: title,
    childFriendlyTitle,
    lessonGoal,
    keyQuestion: keyInquiry,
    keyVocabulary,
    conceptToTeach,
    misconceptionToAvoid,
    realLifeConnection,
    guidedExample,
    guidedPractice,
    independentPractice,
    quickCheck,
    reflectionPrompt,
    interactionType,
    strand,
    subStrand,
    subject,
    term,
    week,
    lang: detectLanguage(meta),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// BLUEPRINT HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function deriveChildFriendlyTitle(title, strand, subStrand) {
  // Clean up the title to make it child-friendly
  let clean = title;
  
  // Remove common curriculum prefixes
  clean = clean.replace(/^(Naming|Identifying|Describing|Classifying|Measuring|Writing|Reading|Listening|Speaking)\s+(of|for|about|in|on|with|to|from)\s+/i, '');
  clean = clean.replace(/^(The|A|An)\s+/i, '');
  
  // If title is very long, extract the core topic
  if (clean.length > 50) {
    // Take the part after the colon if present
    const colonIdx = clean.indexOf(':');
    if (colonIdx > 0 && colonIdx < 30) {
      clean = clean.substring(colonIdx + 1).trim();
    }
  }
  
  // Capitalize first letter
  clean = clean.charAt(0).toUpperCase() + clean.slice(1);
  
  // If still too long or empty, use original
  if (clean.length < 3 || clean.length > 60) {
    clean = title.replace(/^\w+\s+\w+\s+/, ''); // Remove first two words
  }
  
  return clean || title;
}

function deriveLessonGoal(learningOutcome, specificLO, keyInquiry) {
  // Use specific LO if available, otherwise simplify the learning outcome
  if (specificLO && specificLO.length > 10 && specificLO.length < 200) {
    return simplifyForGrade2(specificLO);
  }
  
  // Simplify learning outcome
  let goal = learningOutcome
    .replace(/by the end of the lesson, the learner should be able to:?\s*/i, '')
    .replace(/by the end of the lesson, the learner should be able to\s*/i, '')
    .replace(/by the end of the lesson\s*/i, '')
    .replace(/the learner will be able to\s*/i, '')
    .trim();
  
  // If goal is still complex, extract the first clear action
  if (goal.length > 150) {
    const sentences = goal.split(/[.;]/);
    goal = sentences[0]?.trim() || goal.substring(0, 150);
  }
  
  return simplifyForGrade2(goal);
}

function simplifyForGrade2(text) {
  if (!text) return 'learn something new';
  
  // Remove overly complex language
  let simplified = text
    .replace(/\bappreciate\b/gi, 'learn about')
    .replace(/\bdemonstrate\b/gi, 'show')
    .replace(/\brecognize\b/gi, 'know')
    .replace(/\bdescribe\b/gi, 'tell about')
    .replace(/\bdistinguish\b/gi, 'tell the difference between')
    .replace(/\bconstruct\b/gi, 'make')
    .replace(/\bmanipulate\b/gi, 'use')
    .replace(/\bapply\b/gi, 'use')
    .replace(/\banalyze\b/gi, 'look at')
    .replace(/\bevaluate\b/gi, 'think about')
    .replace(/\bsynthesis\b/gi, 'put together')
    .replace(/\bcomprehension\b/gi, 'understanding')
    .replace(/\bperformance\b/gi, 'doing')
    .replace(/\bachievement\b/gi, 'learning');
  
  // Remove leading verbs that are too formal
  simplified = simplified.replace(/^(To\s+)?(Identify|Recognize|Describe|Explain|Demonstrate|Construct|Manipulate|Apply|Analyze|Evaluate|Create|Compare|Classify|Measure|Read|Write|Listen|Speak)\s+/i, '');
  
  simplified = simplified.charAt(0).toUpperCase() + simplified.slice(1);
  
  return simplified || text;
}

function extractKeyVocabulary(title, learningOutcome, specificLO) {
  const vocab = new Set();
  const text = `${title} ${learningOutcome} ${specificLO}`.toLowerCase();
  
  // Common Grade 2 English vocabulary patterns
  const patterns = [
    /\b(\w+tion)\b/g,  // nouns ending in -tion
    /\b(\w+ment)\b/g,  // nouns ending in -ment
    /\b(\w+ness)\b/g,  // nouns ending in -ness
    /\b(\w+ful)\b/g,   // adjectives ending in -ful
    /\b(\w+less)\b/g,  // adjectives ending in -less
  ];
  
  patterns.forEach(p => {
    const matches = text.match(p);
    if (matches) matches.forEach(m => vocab.add(m));
  });
  
  return [...vocab].slice(0, 5);
}

function deriveConcept(title, learningOutcome, specificLO, strand, subStrand) {
  const text = `${title} ${strand} ${subStrand}`.toLowerCase();
  
  // Extract the main concept from the strand/sub-strand
  if (text.includes('reading') || text.includes('read')) return 'reading comprehension';
  if (text.includes('writing') || text.includes('write')) return 'writing skills';
  if (text.includes('listening') || text.includes('listen')) return 'listening skills';
  if (text.includes('speaking') || text.includes('speak')) return 'speaking skills';
  if (text.includes('vocabulary') || text.includes('word')) return 'vocabulary';
  if (text.includes('spelling') || text.includes('spell')) return 'spelling';
  if (text.includes('grammar') || text.includes('sentence')) return 'grammar';
  if (text.includes('punctuation') || text.includes('capital') || text.includes('full stop')) return 'punctuation';
  if (text.includes('handwriting') || text.includes('letter')) return 'letter formation';
  if (text.includes('comprehension') || text.includes('understand')) return 'comprehension';
  if (text.includes('pronunciation') || text.includes('sound')) return 'pronunciation';
  
  return 'language skills';
}

function deriveMisconception(strand, subStrand, concept) {
  const misconceptions = {
    'reading comprehension': 'thinking that reading is only about saying words, not understanding them',
    'writing skills': 'believing that writing does not need planning or structure',
    'listening skills': 'thinking you must understand every single word when listening',
    'vocabulary': 'assuming all long words are difficult',
    'spelling': 'thinking spelling is only about memorizing letters',
    'grammar': 'believing there is only one correct way to say something',
    'punctuation': 'thinking capital letters are only for names',
  };
  
  return misconceptions[concept] || 'thinking that learning is about memorizing, not understanding';
}

function deriveRealLifeConnection(title, strand, subStrand, keyInquiry) {
  const text = `${title} ${strand} ${subStrand}`.toLowerCase();
  
  // Theme-specific real-life connections
  if (text.includes('accident')) return 'at home, on the way to school, or while playing';
  if (text.includes('school')) return 'in the classroom, on the playground, or in the school library';
  if (text.includes('home') || text.includes('house') || text.includes('room')) return 'at home with your family';
  if (text.includes('transport') || text.includes('travel') || text.includes('road')) return 'on your way to school or the market';
  if (text.includes('food') || text.includes('meal') || text.includes('breakfast') || text.includes('taste')) return 'at meal times with your family';
  if (text.includes('weather') || text.includes('rain') || text.includes('sun')) return 'when you wake up and get dressed, or when you play outside';
  if (text.includes('animal') || text.includes('pet') || text.includes('bird')) return 'at home, on the farm, or at the zoo';
  if (text.includes('market') || text.includes('shop') || text.includes('buy') || text.includes('sell')) return 'when you go shopping with your family';
  if (text.includes('time') || text.includes('clock') || text.includes('hour')) return 'when you wake up, eat breakfast, go to school, and go to bed';
  
  return 'in your daily life at home and school';
}

function deriveGuidedExample(title, strand, subStrand, suggestedExp, activityInst) {
  const text = `${title} ${strand} ${subStrand}`.toLowerCase();
  const theme = extractTheme(title);
  
  // Theme-specific examples
  if (text.includes('accident')) return `For example: "Yesterday, Tom was running in the classroom and fell. He cuts his knee. His teacher helps him." This is an accident that happened at school.`;
  if (text.includes('school')) return `For example: "In the classroom, we have desks, chairs, a chalkboard, and books. Sarah reads a book at her desk." This is something that happens at school.`;
  if (text.includes('home') || text.includes('house')) return `For example: "In the kitchen, mama cooks food. In the bedroom, we sleep. In the living room, we watch television." These are rooms in a house.`;
  if (text.includes('transport')) return `For example: "A matatu carries many people. A bicycle has two wheels. A plane flies in the sky." These are different types of transport.`;
  if (text.includes('food') || text.includes('meal') || text.includes('breakfast')) return `For example: "For breakfast, we can eat porridge, bread with butter, and drink milk or tea. These are healthy breakfast foods."`;
  if (text.includes('reading') || text.includes('read')) return `For example, when we read a story about a boy who goes to the market, we learn what happens to him. We can tell the story in our own words.`;
  if (text.includes('writing') || text.includes('write')) return `For example, when we write about our family, we start each sentence with a capital letter and end with a full stop. "My family is big. I have two brothers."`;
  if (text.includes('listening')) return `For example, when your teacher reads a story, you listen carefully. Then you can answer questions about the story.`;
  if (text.includes('speaking')) return `For example, when you greet your teacher in the morning, you say "Good morning, Teacher!" This is how we speak politely.`;
  
  return suggestedExp ? simplifyForGrade2(suggestedExp).substring(0, 200) : `Let me show you how this works with an example from ${theme || 'everyday life'}.`;
}

function deriveGuidedPractice(title, strand, subStrand, suggestedExp, activityInst, type) {
  const text = `${title} ${strand} ${subStrand}`.toLowerCase();
  const theme = extractTheme(title);
  
  if (type === 'guided') {
    if (text.includes('reading')) return `Let's read together: Read the short passage about ${theme || 'a boy and his dog'}. What is the main idea?`;
    if (text.includes('writing')) return `Let's write together: Write one sentence about ${theme || 'your favourite animal'}. Start with a capital letter.`;
    if (text.includes('listening')) return `Listen carefully: I will read a short story. After, tell me what happened first.`;
    if (text.includes('speaking')) return `Let's practice: Tell your partner about ${theme || 'your weekend'}. Use complete sentences.`;
    if (text.includes('spelling')) return `Let's spell together: Sound out each letter. B-R-E-A-K-F-A-S-T. Now you try.`;
    if (text.includes('vocabulary')) return `Let's learn new words: Can you use this word in a sentence?`;
    return activityInst ? simplifyForGrade2(activityInst).substring(0, 200) : `Practice with your partner.`;
  }
  
  // Independent practice
  if (text.includes('reading')) return `Your turn: Read a short passage about ${theme || 'animals'} and tell someone the main idea.`;
  if (text.includes('writing')) return `Your turn: Write 3 sentences about ${theme || 'your school'}. Start each with a capital letter.`;
  if (text.includes('listening')) return `Your turn: Listen to someone read. Tell them the main idea in one sentence.`;
  if (text.includes('speaking')) return `Your turn: Tell a family member about ${theme || 'what you learned today'}.`;
  if (text.includes('spelling')) return `Your turn: Write these 5 words correctly: ${theme ? theme + ', ' : ''}friend, school, house, water, mother.`;
  if (text.includes('vocabulary')) return `Your turn: Use each new word in a sentence. Teach a family member what the words mean.`;
  
  return `Your turn: Complete the exercise about ${theme || 'this lesson'} in your textbook.`;
}

function deriveQuickCheck(title, learningOutcome, specificLO, keyInquiry, strand, subStrand, concept) {
  const text = `${title} ${strand} ${subStrand}`.toLowerCase();
  const theme = extractTheme(title);
  
  // Generate concept-specific Quick Check questions
  if (text.includes('reading') || text.includes('comprehension')) {
    return {
      question: `What is the main idea of a story about ${theme || 'a boy who helps his mother'}?`,
      options: [
        `The boy's name is John`,
        `The boy helps his mother at home — that is what the story is mostly about`,
        `The story has 5 pages`,
        `The boy likes to play football`
      ],
      correctIndex: 1,
      explanation: `The main idea is what the whole story is mostly about — not just one detail! In this story, the boy helping his mother is the main idea.`,
    };
  }
  
  if (text.includes('writing') || text.includes('sentence') || text.includes('capital')) {
    return {
      question: `Which sentence is written correctly?`,
      options: [
        `the boy went to school.`,
        `The boy went to school`,
        `The boy went to school.`,
        `the boy went to school`
      ],
      correctIndex: 2,
      explanation: `A correct sentence starts with a capital letter AND ends with a full stop. "The boy went to school." is correct!`,
    };
  }
  
  if (text.includes('spelling')) {
    return {
      question: `Which word is spelled correctly?`,
      options: [
        'brekfast',
        'breakfast',
        'breafast',
        'breakfst'
      ],
      correctIndex: 1,
      explanation: `"Breakfast" is spelled B-R-E-A-K-F-A-S-T. It is the first meal of the day!`,
    };
  }
  
  if (text.includes('listening')) {
    return {
      question: `What do good listeners do?`,
      options: [
        `Talk while others are speaking`,
        `Look around the room`,
        `Pay attention and think about what they hear`,
        `Interrupt with questions`
      ],
      correctIndex: 2,
      explanation: `Good listeners pay attention and think about what they hear. This helps them understand the main idea!`,
    };
  }
  
  if (text.includes('speaking') || text.includes('greeting') || text.includes('conversation')) {
    return {
      question: `How should you greet your teacher in the morning?`,
      options: [
        `'Hey teacher!'`,
        `'Good morning, Teacher!'`,
        `'Morning!'`,
        `'Hello there!'`
      ],
      correctIndex: 1,
      explanation: `We greet teachers politely: "Good morning, Teacher!" shows respect and good manners.`,
    };
  }
  
  if (text.includes('punctuation') || text.includes('full stop')) {
    return {
      question: `Where do we put a full stop?`,
      options: [
        `At the beginning of a sentence`,
        `After every word`,
        `At the end of a sentence`,
        `Only after long words`
      ],
      correctIndex: 2,
      explanation: `A full stop (.) goes at the END of a sentence. For example: "I like reading." The full stop comes after the last word.`,
    };
  }
  
  if (text.includes('vocabulary') || text.includes('word meaning')) {
    return {
      question: `What does it good vocabulary help us do?`,
      options: [
        `Run faster`,
        `Express our thoughts clearly in speaking and writing`,
        `Remember phone numbers`,
        `Count money`
      ],
      correctIndex: 1,
      explanation: `Good vocabulary helps us express our thoughts clearly when we speak and write. The more words we know, the better we can share our ideas!`,
    };
  }
  
  // Generic fallback using key inquiry question
  if (keyInquiry && keyInquiry.length > 10) {
    return {
      question: keyInquiry.replace(/[?!.]+$/, '') + '?',
      options: [
        'I am not sure yet',
        'I learned something new about ' + (concept || 'this topic'),
        'I already knew everything',
        'I was not paying attention'
      ],
      correctIndex: 1,
      explanation: `Great! You learned something new about ${concept || 'this topic'} today.`,
    };
  }
  
  // Ultimate fallback
  return {
    question: `What did you learn about ${concept || 'this lesson'} today?`,
    options: [
      'Nothing new',
      'I learned something new',
      'I already knew everything',
      'I was not listening'
    ],
    correctIndex: 1,
    explanation: `Wonderful! You learned something new about ${concept || 'this topic'} today!`,
  };
}

function deriveReflectionPrompt(title, learningOutcome, keyInquiry, concept) {
  return `What did you learn about ${concept || 'this topic'} today? Can you explain it to someone at home?`;
}

function determineInteractionType(strand, subStrand) {
  const text = `${strand} ${subStrand}`.toLowerCase();
  if (text.includes('reading')) return 'comprehension';
  if (text.includes('writing')) return 'writing';
  if (text.includes('listening')) return 'listening';
  if (text.includes('speaking')) return 'speaking';
  if (text.includes('spelling')) return 'spelling';
  if (text.includes('vocabulary')) return 'vocabulary';
  if (text.includes('grammar') || text.includes('sentence')) return 'grammar';
  return 'general';
}

function extractTheme(title) {
  // Extract theme from title patterns like "School: Reading Short Texts" → "school"
  const colonIdx = title.indexOf(':');
  if (colonIdx > 0 && colonIdx < 30) {
    return title.substring(0, colonIdx).trim().toLowerCase();
  }
  
  // Check for common themes
  const themes = ['school', 'home', 'transport', 'accident', 'food', 'garden', 'farm', 'shopping', 'time', 'animal', 'weather', 'water', 'plant', 'community', 'family'];
  const lowerTitle = title.toLowerCase();
  for (const t of themes) {
    if (lowerTitle.includes(t)) return t;
  }
  
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 2: SHARED JOURNEY ENGINE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Build a 10-step journey from a blueprint.
 * This ensures consistent structure, tone, and quality across all subjects.
 */
function buildJourneyFromBlueprint(bp) {
  const lang = bp.lang;
  const title = bp.childFriendlyTitle || bp.originalTitle;
  const theme = extractTheme(bp.originalTitle);
  
  // Welcome — warm, specific, no generic greeting
  const welcome = {
    id: 'welcome',
    stepType: 'welcome',
    title: getLabel(lang, 'welcome'),
    studentText: lang === 'sw'
      ? `Habari, rafiki! Leo tutajifunza kuhusu ${bp.conceptToTeach}. Tayari?` 
      : `Hello, friend! Today we are going to learn about ${bp.conceptToTeach}. Are you ready?`,
    owlText: buildOwlWelcomeText(bp, title, theme, lang),
    visualType: 'owl_teacher',
    interaction: { type: 'none' },
    media: {},
  };
  
  // Mission — clear goal from learning outcome, NOT "explore [title] together"
  const mission = {
    id: 'mission',
    stepType: 'mission',
    title: getLabel(lang, 'startMission'),
    studentText: bp.lessonGoal,
    owlText: buildOwlMissionText(bp, lang),
    visualType: 'owl_teacher',
    interaction: { type: 'none' },
    media: {},
  };
  
  // Think First — activate prior knowledge using key inquiry question
  const thinkFirst = {
    id: 'think_first',
    stepType: 'think_first',
    title: getLabel(lang, 'thinkFirst'),
    studentText: bp.keyQuestion ? `Before we start, think about this: ${bp.keyQuestion}` : `What do you already know about ${title}? Take a moment to think about it.`,
    owlText: lang === 'sw' ? 'Tafadhali fikiria kwanza kile unachojua.' : 'Take a moment to think about what you already know.',
    visualType: 'owl_teacher',
    interaction: {
      type: 'open_response',
      prompt: bp.keyQuestion || `What do you know about ${title}?`,
      placeholder: lang === 'sw' ? 'Andika mawako hapa...' : 'Share your thoughts...',
    },
    media: {},
  };
  
  // Learn — teach the concept with theme-specific example
  const learn = {
    id: 'learn',
    stepType: 'learn',
    title: getLabel(lang, 'learn'),
    studentText: bp.conceptToTeach + (bp.guidedExample ? '\n\n' + bp.guidedExample : ''),
    owlText: buildOwlLearnText(bp, lang),
    visualType: 'owl_teacher',
    interaction: { type: 'none' },
    media: {},
  };
  
  // Connect — real-life connection specific to theme
  const connect = {
    id: 'connect',
    stepType: 'connect',
    title: getLabel(lang, 'connect'),
    studentText: bp.realLifeConnection ? `Where do you see ${bp.conceptToTeach} ${bp.realLifeConnection}? Think about your own life.` : `Where do you see ${bp.conceptToTeach} in your daily life? At home? At school? In your community?`,
    owlText: lang === 'sw' ? 'Tunatumia hii kila siku!' : 'We use this every day!',
    visualType: 'owl_teacher',
    interaction: { type: 'none' },
    media: {},
  };
  
  // Example — guided example specific to theme
  const example = {
    id: 'example',
    stepType: 'example',
    title: getLabel(lang, 'example'),
    studentText: bp.guidedExample || `Let me show you how ${bp.conceptToTeach} works with an example about ${theme || 'everyday life'}.`,
    owlText: lang === 'sw' ? 'Angalia mfano hivi, kisha wewe utajaribu!' : 'Watch this example carefully, then you will try!',
    visualType: 'owl_teacher',
    interaction: { type: 'none' },
    media: {},
  };
  
  // Practice — specific practice task from activity instructions
  const practice = {
    id: 'practice',
    stepType: 'practice',
    title: getLabel(lang, 'practice'),
    studentText: bp.independentPractice || `Practice what you learned about ${bp.conceptToTeach}.`,
    owlText: lang === 'sw' ? 'Unafanya vizuri! Endelea kufanya mazoezi.' : 'You are doing great! Keep practicing.',
    visualType: 'owl_teacher',
    interaction: { type: 'none' },
    media: {},
  };
  
  // Quick Check — test the actual lesson concept
  const qc = bp.quickCheck;
  const quickCheck = {
    id: 'quick_check',
    stepType: 'quick_check',
    title: getLabel(lang, 'quickCheck'),
    studentText: qc.question,
    owlText: getLabel(lang, 'checkAnswer'),
    visualType: 'owl_teacher',
    interaction: {
      type: 'multiple_choice',
      question: qc.question,
      options: qc.options,
      correctIndex: qc.correctIndex,
      explanation: qc.explanation,
    },
    media: {},
  };
  
  // Reflect — match the lesson
  const reflect = {
    id: 'reflect',
    stepType: 'reflect',
    title: getLabel(lang, 'reflect'),
    studentText: bp.reflectionPrompt,
    owlText: lang === 'sw' ? 'Umezidi leo!' : 'You worked hard today!',
    visualType: 'owl_teacher',
    interaction: {
      type: 'open_response',
      prompt: bp.reflectionPrompt,
      placeholder: lang === 'sw' ? 'Andika ulichojifunza...' : 'Write what you learned...',
    },
    media: {},
  };
  
  // Complete — celebrate completion
  const complete = {
    id: 'complete',
    stepType: 'complete',
    title: getLabel(lang, 'youDidIt'),
    studentText: lang === 'sw'
      ? `Hongera! 🎉 Umefunza kuhusu ${bp.conceptToTeach} leo. Endelea na kazi nzuri!`
      : `Congratulations! 🎉 You learned about ${bp.conceptToTeach} today. Keep up the great work!`,
    owlText: lang === 'sw' ? 'Hongera, rafiki! Nilijivuna na wewe!' : `Well done, friend! I am so proud of you!`,
    visualType: 'owl_teacher',
    interaction: { type: 'none' },
    media: {},
  };
  
  return [welcome, mission, thinkFirst, learn, connect, example, practice, quickCheck, reflect, complete];
}

// ═══════════════════════════════════════════════════════════════════════════
// OWL TEXT BUILDERS
// ═══════════════════════════════════════════════════════════════════════════

function buildOwlWelcomeText(bp, title, theme, lang) {
  if (lang === 'sw') return `Habari, rafiki! Leo tutajifunza kuhusu ${bp.conceptToTeach}. Tayari?`;
  return `Hello, friend! Today we are going to learn about ${bp.conceptToTeach}. Are you ready?`;
}

function buildOwlMissionText(bp, lang) {
  if (lang === 'sw') return `Lengo letu ni kujifunza kuhusu ${bp.conceptToTeach} pamoja.`;
  return `Our mission is to learn about ${bp.conceptToTeach} together.`;
}

function buildOwlLearnText(bp, lang) {
  if (lang === 'sw') return `Hapa unapaswa kujua. sikiliza kwa makini!`;
  return `Here is what you need to know. Listen carefully!`;
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 3: VALIDATION LAYER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Validate a generated journey before saving.
 * Returns { valid: boolean, errors: string[] }
 */
function validateJourney(journey, blueprint) {
  const errors = [];
  
  // Check journey has 10 steps
  if (!Array.isArray(journey) || journey.length !== 10) {
    errors.push(`Journey must have 10 steps, got ${journey?.length || 0}`);
    return { valid: false, errors };
  }
  
  const requiredStepTypes = ['welcome', 'mission', 'think_first', 'learn', 'connect', 'example', 'practice', 'quick_check', 'reflect', 'complete'];
  
  for (let i = 0; i < 10; i++) {
    const step = journey[i];
    const expectedType = requiredStepTypes[i];
    
    if (step.stepType !== expectedType) {
      errors.push(`Step ${i}: expected ${expectedType}, got ${step.stepType}`);
    }
    
    if (!step.studentText || step.studentText.trim().length < 10) {
      errors.push(`Step ${i} (${step.stepType}): studentText too short or missing`);
    }
    
    if (!step.owlText || step.owlText.trim().length < 5) {
      errors.push(`Step ${i} (${step.stepType}): owlText too short or missing`);
    }
  }
  
  // Check mission doesn't use generic "explore [title] together"
  const missionStep = journey[1];
  if (missionStep && missionStep.studentText) {
    if (/explore\s+.*\s+together/i.test(missionStep.studentText)) {
      errors.push('Mission uses generic "explore together" phrase');
    }
    if (missionStep.studentText.includes(blueprint.originalTitle) && missionStep.studentText.length < 100) {
      errors.push('Mission just copies the title without meaningful content');
    }
  }
  
  // Check think_first doesn't just repeat the title
  const thinkStep = journey[2];
  if (thinkStep && thinkStep.studentText) {
    if (thinkStep.studentText.includes(blueprint.originalTitle) && !thinkStep.studentText.includes('?')) {
      errors.push('Think First just copies the title without a real question');
    }
  }
  
  // Check Quick Check has proper MCQ structure
  const qcStep = journey[7];
  if (qcStep) {
    const interaction = qcStep.interaction;
    if (!interaction || interaction.type !== 'multiple_choice') {
      errors.push('Quick Check must be multiple choice');
    } else if (!interaction.options || interaction.options.length < 3) {
      errors.push('Quick Check must have at least 3 options');
    } else if (interaction.correctIndex === undefined || interaction.correctIndex < 0 || interaction.correctIndex >= interaction.options.length) {
      errors.push('Quick Check must have a valid correctIndex');
    } else {
      // Check for malformed options (e.g., "A. AB. BC. C")
      const malformed = interaction.options.some(opt => /^\s*[A-D]\.\s+[A-D]\./.test(opt));
      if (malformed) {
        errors.push('Quick Check options are malformed (e.g., "A. AB. B")');
      }
    }
  }
  
  // Check for answer leaks
  const setupSteps = journey.slice(0, 6); // welcome, mission, think_first, learn, connect, example
  for (const step of setupSteps) {
    if (step.studentText && /the answer is|the correct answer|answer:\s/i.test(step.studentText)) {
      errors.push(`Answer leak in ${step.stepType}: "${step.studentText.substring(0, 100)}"`);
    }
  }
  
  // Check learn step has substantive content
  const learnStep = journey[3];
  if (learnStep) {
    const learnText = learnStep.studentText || '';
    if (learnText.length < 80) {
      errors.push('Learn step content too short (should be substantive, >80 chars)');
    }
    // Check it's not just "Today we will learn about [title]"
    const title = blueprint.originalTitle.toLowerCase();
    const learnLower = learnText.toLowerCase();
    if (learnLower.includes(title) && learnLower.length < 150) {
      errors.push('Learn step just repeats the title without teaching content');
    }
  }
  
  // Check practice is theme-specific, not generic
  const practiceStep = journey[6];
  if (practiceStep) {
    const practiceText = practiceStep.studentText || '';
    // Should not be just "Practice: Try [topic] at home"
    if (/^practice:?\s*try\s+/i.test(practiceText) && practiceText.length < 100) {
      errors.push('Practice step is too generic');
    }
  }
  
  return { valid: errors.length === 0, errors };
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════

module.exports = {
  JOURNEY_LABELS,
  getLabel,
  detectLanguage,
  buildLessonBlueprint,
  buildJourneyFromBlueprint,
  validateJourney,
  // Helpers (exported for testing)
  deriveChildFriendlyTitle,
  deriveLessonGoal,
  simplifyForGrade2,
  extractTheme,
  extractKeyVocabulary,
  deriveConcept,
  deriveMisconception,
  deriveRealLifeConnection,
  deriveGuidedExample,
  deriveGuidedPractice,
  deriveQuickCheck,
  deriveReflectionPrompt,
  determineInteractionType,
};
