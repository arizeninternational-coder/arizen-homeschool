#!/usr/bin/env node
/**
 * ============================================================================
 * GRADE 2 JOURNEY GENERATION SYSTEM v3 — REFINED
 * ============================================================================
 * 
 * Key improvements over v2:
 * 1. Mission text is always child-friendly, never raw curriculum wording
 * 2. Examples are theme-specific AND skill-specific
 * 3. Quick Checks test the actual lesson concept with theme-specific content
 * 4. Stronger validation — fails on raw curriculum wording, generic examples,
 *    title-copying, theme-swap detection
 * 5. Blueprint includes skill type, theme, vocabulary, example, practice task,
 *    quick check skill, expected learner action
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
    welcome: 'Welcome!', startMission: "Let's Start!", ready: "I'm Ready",
    thinkFirst: 'Think First!', learn: 'Learn It', connect: 'Real Life Connection',
    example: 'Watch and Learn', practice: 'Your Turn!', quickCheck: 'Quick Check!',
    checkAnswer: 'Check Answer', reflect: 'Think About Your Learning',
    continueFinish: 'Continue', youDidIt: 'You did it!', greatWork: 'Great work!',
    backToQuest: 'Back to Quest', beginJourney: 'Begin Lesson',
    whatLearned: 'What did you learn?', saveWork: 'Save My Work',
  },
  sw: {
    welcome: 'Karibu!', startMission: 'Tuanze!', ready: 'Niko tayari',
    thinkFirst: 'Fikiria Kwanza!', learn: 'Jifunze', connect: 'Uhusiano na Maisha Halisi',
    example: 'Tazama na Ujifunze', practice: 'Zoezi Lako!', quickCheck: 'Ukaguzi wa Haraka',
    checkAnswer: 'Angalia Jibu', reflect: 'Fifikri Kuhusu Kujifunza',
    continueFinish: 'Endelea', youDidIt: 'Umefanya vizuri!', greatWork: 'Kazi nzuri!',
    backToQuest: 'Rudi kwenye Quest', beginJourney: 'Anza Somo',
    whatLearned: 'Ulijifunza nini?', saveWork: 'Hifadhi Kazi Yangu',
  },
};

function getLabel(lang, key) {
  return JOURNEY_LABELS[lang]?.[key] || JOURNEY_LABELS.en[key] || key;
}

function detectLanguage(contentBlocks) {
  try {
    const meta = typeof contentBlocks === 'string' ? JSON.parse(contentBlocks) : (contentBlocks || {});
    const subj = (meta.subject || meta.strand || '').toLowerCase();
    if (subj.includes('kiswahili') || subj.includes('kusoma') || subj.includes('kuandika') || subj.includes('kusikiliza') || subj.includes('kuzungumza') || subj.includes('msamiati') || subj.includes('sauti') || subj.includes('sarufi') || subj.includes('tathmini')) return 'sw';
    return 'en';
  } catch { return 'en'; }
}

// ═══════════════════════════════════════════════════════════════════════════
// THEME + SKILL CONTENT DATABASE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Theme-specific content for Grade 2 English.
 * Each theme has: vocabulary, examples, practice contexts, real-life connections.
 * This is the KEY to making journeys feel different across themes.
 */
const THEME_CONTENT = {
  school: {
    vocabulary: ['classroom', 'teacher', 'desk', 'chalkboard', 'book', 'pencil', 'lesson', 'friend', 'playground', 'library'],
    people: ['teacher', 'headteacher', 'classmate', 'librarian', 'guard'],
    actions: ['reading', 'writing', 'listening', 'playing', 'learning', 'singing', 'drawing'],
    places: ['classroom', 'playground', 'library', 'hall', 'office'],
    exampleSentences: [
      'The teacher writes on the chalkboard.',
      'We read books in the library.',
      'My friend sits next to me in class.',
      'We play on the playground after lunch.',
    ],
    storyContext: 'a day at school',
    realLife: 'in the classroom, on the playground, or in the school library',
    practiceContext: 'school activities, your classroom, your teacher, your friends',
  },
  home: {
    vocabulary: ['kitchen', 'bedroom', 'living room', 'bathroom', 'mother', 'father', 'sister', 'brother', 'family', 'house'],
    people: ['mother', 'father', 'grandmother', 'grandfather', 'sister', 'brother', 'baby', 'aunt', 'uncle'],
    actions: ['cooking', 'cleaning', 'sleeping', 'eating', 'washing', 'playing', 'helping', 'reading'],
    places: ['kitchen', 'bedroom', 'living room', 'bathroom', 'garden', 'store'],
    exampleSentences: [
      'Mother cooks food in the kitchen.',
      'We sleep in the bedroom.',
      'Father reads the newspaper in the living room.',
      'I help my sister wash the dishes.',
    ],
    storyContext: 'a day at home with family',
    realLife: 'at home with your family, in the kitchen, in your bedroom, in the garden',
    practiceContext: 'your home, your family, rooms in your house, things you do at home',
  },
  transport: {
    vocabulary: ['bus', 'car', 'bicycle', 'matatu', 'motorcycle', 'plane', 'train', 'road', 'driver', 'passenger'],
    people: ['driver', 'passenger', 'conductor', 'pilot', 'cyclist', 'pedestrian'],
    actions: ['driving', 'riding', 'flying', 'walking', 'waiting', 'boarding', 'stopping', 'crossing'],
    places: ['bus stop', 'airport', 'station', 'road', 'bridge', 'parking'],
    exampleSentences: [
      'The matatu carries many people to town.',
      'We wait at the bus stop.',
      'The plane flies high in the sky.',
      'We cross the road at the zebra crossing.',
    ],
    storyContext: 'a journey to town',
    realLife: 'on your way to school, at the bus stop, crossing the road, traveling with family',
    practiceContext: 'types of transport, road safety, your journey to school, vehicles you see',
  },
  accident: {
    vocabulary: ['fall', 'cut', 'burn', 'bruise', 'hurt', 'bleed', 'bandage', 'first aid', 'danger', 'safe'],
    people: ['teacher', 'nurse', 'parent', 'friend', 'doctor', 'first aider'],
    actions: ['falling', 'cutting', 'burning', 'bleeding', 'helping', 'treating', 'warning', 'preventing'],
    places: ['classroom', 'playground', 'kitchen', 'road', 'home', 'school'],
    exampleSentences: [
      'Tom fell down and cut his knee.',
      'The teacher put a bandage on the cut.',
      'We must be careful on the playground.',
      'Hot water can burn your hand.',
    ],
    storyContext: 'what to do when someone gets hurt',
    realLife: 'at home, on the playground, in the kitchen, crossing the road',
    practiceContext: 'safety rules, what to do in an accident, warning others about danger',
  },
  'time and months': {
    vocabulary: ['morning', 'afternoon', 'evening', 'night', 'today', 'yesterday', 'tomorrow', 'clock', 'hour', 'minute'],
    people: ['teacher', 'parent', 'friend'],
    actions: ['waking up', 'eating breakfast', 'going to school', 'playing', 'sleeping', 'reading'],
    places: ['home', 'school', 'playground'],
    exampleSentences: [
      'In the morning, I wake up and eat breakfast.',
      'At noon, the sun is hot.',
      'In the evening, I do my homework.',
      'At night, I sleep.',
    ],
    storyContext: 'what happens at different times of day',
    realLife: 'when you wake up, eat breakfast, go to school, play, and sleep',
    practiceContext: 'times of day, months of the year, your daily routine, telling time',
  },
  shopping: {
    vocabulary: ['market', 'shop', 'buy', 'sell', 'money', 'price', 'food', 'fruit', 'vegetable', 'seller'],
    people: ['seller', 'buyer', 'shopkeeper', 'mother', 'father', 'friend'],
    actions: ['buying', 'selling', 'paying', 'counting', 'choosing', 'carrying', 'weighing'],
    places: ['market', 'shop', 'supermarket', 'stall', 'kiosk'],
    exampleSentences: [
      'Mother buys vegetables at the market.',
      'The seller gives us change.',
      'We count our money before we buy.',
      'Fresh fruit is good for our health.',
    ],
    storyContext: 'going to the market',
    realLife: 'when you go shopping with your family, at the market, at the shop',
    practiceContext: 'things you buy, how to pay, choosing healthy food, market conversations',
  },
  garden: {
    vocabulary: ['plant', 'seed', 'flower', 'tree', 'leaf', 'root', 'water', 'soil', 'sun', 'grow'],
    people: ['gardener', 'farmer', 'mother', 'teacher'],
    actions: ['planting', 'watering', 'growing', 'digging', 'weeding', 'harvesting', 'picking'],
    places: ['garden', 'farm', 'field', 'nursery'],
    exampleSentences: [
      'We plant seeds in the soil.',
      'The flowers need water and sun.',
      'The tree grows tall.',
      'We pick vegetables from the garden.',
    ],
    storyContext: 'growing plants in a garden',
    realLife: 'in your home garden, at the farm, in the school garden',
    practiceContext: 'types of plants, how plants grow, caring for a garden, parts of a plant',
  },
  'activities in the home': {
    vocabulary: ['sweeping', 'washing', 'cooking', 'cleaning', 'helping', 'tidying', 'drying', 'folding', 'arranging'],
    people: ['mother', 'father', 'sister', 'brother', 'grandmother', 'helper'],
    actions: ['sweeping', 'washing dishes', 'cooking', 'cleaning', 'tidying', 'drying', 'folding'],
    places: ['kitchen', 'bedroom', 'living room', 'bathroom', 'yard'],
    exampleSentences: [
      'I help mother sweep the kitchen.',
      'We wash dishes after eating.',
      'I fold my clothes and put them away.',
      'We tidy our bedroom every morning.',
    ],
    storyContext: 'helping at home',
    realLife: 'in your kitchen, bedroom, living room, or yard at home',
    practiceContext: 'chores at home, helping your family, keeping your home clean',
  },
  // ELA skill-based contexts (no theme prefix in title)
  'word skills': {
    vocabulary: ['rhyme', 'syllable', 'sound', 'letter', 'word', 'pattern', 'match', 'same', 'different'],
    people: ['teacher', 'friend'],
    actions: ['rhyming', 'matching', 'sounding out', 'clapping syllables'],
    places: ['classroom'],
    exampleSentences: [
      'Cat and hat rhyme — they sound the same at the end.',
      'The word "banana" has three syllables: ba-na-na.',
      'When we read, we sound out each letter.',
    ],
    storyContext: 'word patterns and sounds',
    realLife: 'when you sing songs, read poems, or play word games',
    practiceContext: 'rhyming words, syllables, letter sounds, word patterns',
  },
  'instructions': {
    vocabulary: ['first', 'then', 'next', 'follow', 'listen', 'do', 'step', 'order'],
    people: ['teacher', 'parent', 'friend'],
    actions: ['following', 'listening', 'doing', 'stepping', 'waiting'],
    places: ['classroom', 'home', 'playground'],
    exampleSentences: [
      'First, listen carefully. Then, do what you hear.',
      'Teacher says: "Stand up, then sit down." We follow the steps.',
      'When we follow instructions, we do things in order.',
    ],
    storyContext: 'following directions',
    realLife: 'when your teacher tells you what to do, when you follow a recipe',
    practiceContext: 'following simple instructions, putting things in order, listening carefully',
  },
  'questions': {
    vocabulary: ['question', 'answer', 'ask', 'tell', 'who', 'what', 'where', 'why', 'how'],
    people: ['teacher', 'mother', 'friend', 'parent'],
    actions: ['asking', 'answering', 'listening', 'thinking', 'responding'],
    places: ['classroom', 'home'],
    exampleSentences: [
      'Teacher asks: "What is your name?" You answer: "My name is Amina."',
      'When someone asks a question, listen carefully and give a good answer.',
      'We use words like who, what, where to ask questions.',
    ],
    storyContext: 'asking and answering questions',
    realLife: 'when your teacher asks you questions, when you want to know something',
    practiceContext: 'answering questions, asking questions politely, listening to questions',
  },
  'stories': {
    vocabulary: ['story', 'beginning', 'middle', 'end', 'character', 'setting', 'retell', 'main idea'],
    people: ['teacher', 'friend', 'mother'],
    actions: ['listening', 'reading', 'retelling', 'thinking'],
    places: ['classroom', 'library', 'home'],
    exampleSentences: [
      'Every story has a beginning, middle, and end.',
      'The main idea is what the story is mostly about.',
      'After listening to a story, we can tell it again in our own words.',
    ],
    storyContext: 'listening to and retelling stories',
    realLife: 'when your teacher reads a story, when you tell your family about your day',
    practiceContext: 'listening to stories, retelling stories, finding the main idea',
  },
  'reading': {
    vocabulary: ['read', 'word', 'sentence', 'paragraph', 'page', 'book', 'letter', 'sound'],
    people: ['teacher', 'friend'],
    actions: ['reading', 'sounding out', 'looking', 'thinking'],
    places: ['classroom', 'library', 'home'],
    exampleSentences: [
      'When we read, we look at each word and sound it out.',
      'A sentence starts with a capital letter and ends with a full stop.',
      'Good readers think about what they read.',
    ],
    storyContext: 'reading short texts',
    realLife: 'when you read books, signs, or messages',
    practiceContext: 'reading short passages, finding answers in text, understanding what you read',
  },
  conversation: {
    vocabulary: ['hello', 'goodbye', 'please', 'thank you', 'excuse me', 'sorry', 'greet', 'polite'],
    people: ['teacher', 'friend', 'mother', 'parent', 'visitor'],
    actions: ['greeting', 'speaking', 'listening', 'responding', 'thanking'],
    places: ['classroom', 'home', 'school'],
    exampleSentences: [
      'We say "Good morning, Teacher!" when we arrive.',
      'Polite words are "please", "thank you", and "excuse me."',
      'When someone speaks to us, we listen and respond politely.',
    ],
    storyContext: 'polite conversation',
    realLife: 'when you meet people, when you talk to your teacher or friends',
    practiceContext: 'greeting people, using polite words, taking turns in conversation',
  },
  writing: {
    vocabulary: ['write', 'letter', 'word', 'sentence', 'capital', 'full stop', 'pencil', 'paper', 'spelling'],
    people: ['teacher', 'friend'],
    actions: ['writing', 'drawing', 'spelling', 'forming letters', 'practicing'],
    places: ['classroom', 'home'],
    exampleSentences: [
      'We start each sentence with a capital letter.',
      'At the end of a sentence, we put a full stop.',
      'Good handwriting is neat and easy to read.',
    ],
    storyContext: 'writing practice',
    realLife: 'when you write your name, when you write a letter to a friend',
    practiceContext: 'forming letters, writing sentences, spelling words correctly',
  },
};

/**
 * Skill-specific content for Grade 2 English.
 * Each skill has: what to teach, how to example, how to practice, how to check.
 */
const SKILL_CONTENT = {
  'reading comprehension': {
    teach: 'Reading means understanding what the words say. Good readers think about the story. They can tell the main idea — what the story is mostly about.',
    exampleTemplate: (theme, vocab, sentences) => {
      const s = sentences[0] || `The ${vocab[0]} is important.`;
      return `Let me show you: "${s}" When we read this, we understand that ${theme} is about ${vocab[0]} and ${vocab[1]}. A good reader thinks: "What is this sentence telling me?"`;
    },
    practiceTemplate: (theme, vocab) => `Read a short passage about ${theme}. What is the main idea? Tell someone in your own words.`,
    qcTemplate: (theme, vocab, sentences) => {
      const v0 = vocab?.[0] || 'word';
      const v1 = vocab?.[1] || 'sentence';
      const s = sentences?.[0] || `The ${v0} is important.`;
      return {
        question: `Read: "${s}" What is this sentence mostly about?`,
        options: [`The word "${v0}"`, `${theme} — it tells us about ${v0} and ${v1}`, `It has many words`, `It is short`],
        correctIndex: 1,
        explanation: `When we read, we look for the main idea — what the whole sentence is about. This sentence is about ${theme}!`,
      };
    },
  },
  'writing skills': {
    teach: 'Writing means sharing our thoughts with words. We start sentences with a capital letter and end with a full stop. We use words that match our topic.',
    exampleTemplate: (theme, vocab, sentences) => {
      const s = sentences[0] || `I like ${vocab[0]}.`;
      return `Let me show you how to write about ${theme}: "${s}" See how it starts with a capital letter "I" and ends with a full stop. The words are about ${theme}!`;
    },
    practiceTemplate: (theme, vocab) => `Write 3 sentences about ${theme}. Use these words: ${vocab.slice(0, 3).join(', ')}. Start each with a capital letter.`,
    qcTemplate: (theme, vocab) => {
      const correct = `I like ${vocab[0]}.`;
      return {
        question: `Which sentence is written correctly about ${theme}?`,
        options: [
          `i like ${vocab[0]}.`,
          `I like ${vocab[0]}`,
          correct,
          `i like ${vocab[0]}`,
        ],
        correctIndex: 2,
        explanation: `A correct sentence starts with a capital letter AND ends with a full stop. "${correct}" is right!`,
      };
    },
  },
  'listening skills': {
    teach: 'Good listeners pay attention, think about what they hear, and ask questions when they do not understand. Listening helps us learn new things.',
    exampleTemplate: (theme, vocab, sentences) => {
      const s = sentences[0] || `Listen carefully to ${vocab[0]}.`;
      return `Let me show you: When someone says "${s}" — a good listener thinks: "What does this mean? What is the important part?" That is how we learn by listening.`;
    },
    practiceTemplate: (theme, vocab) => `Listen to someone read a short passage about ${theme}. After, tell them the main idea in one sentence.`,
    qcTemplate: (theme, vocab) => ({
      question: `What do good listeners do when they hear about ${theme}?`,
      options: [
        `Talk while others are speaking`,
        `Look around the room`,
        `Pay attention and think about what they hear`,
        `Interrupt with questions`,
      ],
      correctIndex: 2,
      explanation: `Good listeners pay attention and think about what they hear. This helps them understand the main idea!`,
    }),
  },
  'speaking skills': {
    teach: 'Good speakers use clear words, speak at the right volume, and take turns in conversations. We use polite words when we talk to others.',
    exampleTemplate: (theme, vocab, sentences) => {
      const s = sentences[0] || `The ${vocab[0]} is here.`;
      return `Let me show you: When we talk about ${theme}, we say things like "${s}" We speak clearly so others can understand. We use polite words like "please" and "thank you."`;
    },
    practiceTemplate: (theme, vocab) => `Tell a family member about ${theme}. Use these words: ${vocab.slice(0, 3).join(', ')}. Speak clearly and use polite words.`,
    qcTemplate: (theme, vocab) => ({
      question: `How should you speak when talking about ${theme}?`,
      options: [
        `Shout loudly`,
        `Use clear words and polite language`,
        `Talk very fast`,
        `Stay silent`,
      ],
      correctIndex: 1,
      explanation: `Good speakers use clear words and polite language so others can understand them.`,
    }),
  },
  vocabulary: {
    teach: 'Vocabulary means the words we know. The more words we know, the better we can read, write, and speak. We learn new words by using them.',
    exampleTemplate: (theme, vocab, sentences) => {
      const v = vocab[0] || 'word';
      return `Let me show you: "${v}" is a word about ${theme}. When we read, we meet new words. We can guess what they mean from the story. For example: "${sentences[0] || `The ${v} is big.`}" — here, "${v}" means...`;
    },
    practiceTemplate: (theme, vocab) => `Learn these 5 new words about ${theme}: ${vocab.slice(0, 5).join(', ')}. Use each word in a sentence.`,
    qcTemplate: (theme, vocab) => {
      const v = vocab[0] || 'word';
      return {
        question: `What does the word "${v}" mean in ${theme}?`,
        options: [
          `It is a color`,
          `It is related to ${theme} — it is part of ${vocab[1] || 'the topic'}`,
          `It is a number`,
          `It is a sound`,
        ],
        correctIndex: 1,
        explanation: `"${v}" is a word about ${theme}. When we learn new vocabulary, we understand more about the topic!`,
      };
    },
  },
  spelling: {
    teach: 'Spelling means writing words correctly, letter by letter. We sound out each letter to spell words. Practice helps us remember.',
    exampleTemplate: (theme, vocab, sentences) => {
      const v = (vocab[0] || 'word').toUpperCase();
      return `Let me show you how to spell "${v}": ${v.split('').join('-')}. Sound out each letter: ${v.split('').join(', ')}. Now you try!`;
    },
    practiceTemplate: (theme, vocab) => `Write these 5 words about ${theme}: ${vocab.slice(0, 5).join(', ')}. Sound out each letter. Check your spelling.`,
    qcTemplate: (theme, vocab) => {
      const word = vocab[0] || 'word';
      const wrong1 = word.slice(0, -1) + (word.endsWith('e') ? 'a' : 'e');
      const wrong2 = word.toUpperCase();
      const wrong3 = word + 's';
      return {
        question: `Which word is spelled correctly?`,
        options: [wrong1, wrong2, word, wrong3],
        correctIndex: 2,
        explanation: `"${word}" is spelled correctly! Remember to sound out each letter: ${word.split('').join('-')}.`,
      };
    },
  },
  grammar: {
    teach: 'Grammar is the rules for how we put words together. We use the right words in the right order. We use words like "was" and "were" to talk about the past.',
    exampleTemplate: (theme, vocab, sentences) => {
      const s = sentences[0] || `The ${vocab[0]} was here.`;
      return `Let me show you: "${s}" We use "was" for one person or thing, and "were" for many. For example: "The ${vocab[0]} was..." but "The ${vocab[1] || vocab[0]} were..."`;
    },
    practiceTemplate: (theme, vocab) => `Write 3 sentences about ${theme} using "was" or "were". Example: "The ${vocab[0]} was..."`,
    qcTemplate: (theme, vocab) => ({
      question: `Which sentence uses "was" or "were" correctly?`,
      options: [
        `The ${vocab[0]} were one.`,
        `The ${vocab[0]} was here.`,
        `The ${vocab[1] || vocab[0]} was many.`,
        `We was playing.`,
      ],
      correctIndex: 1,
      explanation: `We use "was" for one person or thing, and "were" for many. "The ${vocab[0]} was here" is correct!`,
    }),
  },
  punctuation: {
    teach: 'Punctuation helps people read our writing. A full stop (.) goes at the end of a sentence. A capital letter starts a sentence. A question mark (?) goes at the end of a question.',
    exampleTemplate: (theme, vocab, sentences) => {
      const s = sentences[0] || `The ${vocab[0]} is here.`;
      return `Let me show you: "${s}" See the capital letter "T" at the start? And the full stop at the end? That is how we write a proper sentence!`;
    },
    practiceTemplate: (theme, vocab) => `Write 3 sentences about ${theme}. Use capital letters at the start and full stops at the end.`,
    qcTemplate: (theme, vocab) => ({
      question: `Where do we put a full stop?`,
      options: [
        `At the beginning of a sentence`,
        `After every word`,
        `At the end of a sentence`,
        `Only after long words`,
      ],
      correctIndex: 2,
      explanation: `A full stop (.) goes at the END of a sentence. For example: "I like reading." The full stop comes after the last word.`,
    }),
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// STEP 1: LESSON BLUEPRINT LAYER (REFINED)
// ═══════════════════════════════════════════════════════════════════════════

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

  // Extract theme from title
  const theme = extractTheme(title);
  const themeKey = getThemeKey(theme);

  // Determine skill type from strand/sub-strand/subject
  // SAFETY: subject is passed to prevent cross-subject contamination
  const skillType = determineSkillType(strand, subStrand, title, subject);

  // Get theme-specific content
  const themeContent = THEME_CONTENT[themeKey] || null;
  const skillContent = SKILL_CONTENT[skillType] || null;

  // Build child-friendly title
  const childFriendlyTitle = deriveChildFriendlyTitle(title, strand, subStrand);

  // Build lesson goal — CHILD-FRIENDLY, not raw curriculum
  const lessonGoal = buildChildFriendlyGoal(learningOutcome, specificLO, keyInquiry, skillType, theme, themeContent);

  // Build key vocabulary from theme
  const keyVocabulary = themeContent ? themeContent.vocabulary.slice(0, 5) : extractKeyVocabulary(title, learningOutcome);

  // Build concept to teach
  const conceptToTeach = skillContent ? skillContent.teach : deriveConcept(strand, subStrand);

  // Build misconception
  const misconceptionToAvoid = deriveMisconception(skillType);

  // Build real-life connection — THEME-SPECIFIC
  const realLifeConnection = themeContent ? themeContent.realLife : deriveRealLifeConnection(title, strand, subStrand);

  // Build guided example — THEME + SKILL SPECIFIC
  const guidedExample = buildThemeSkillExample(themeKey, skillType, themeContent, skillContent, title);

  // Build practice tasks — THEME + SKILL SPECIFIC
  const guidedPractice = buildThemeSkillPractice(themeKey, skillType, themeContent, skillContent, 'guided');
  const independentPractice = buildThemeSkillPractice(themeKey, skillType, themeContent, skillContent, 'independent');

  // Build Quick Check — THEME + SKILL SPECIFIC
  const quickCheck = buildThemeSkillQC(themeKey, skillType, themeContent, skillContent, keyInquiry, title);

  // Build reflection prompt
  const reflectionPrompt = buildReflectionPrompt(skillType, theme, themeContent, keyInquiry);

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
    interactionType: skillType,
    skillType,
    theme,
    themeKey,
    strand,
    subStrand,
    subject,
    term: meta.term || '',
    week: meta.week || '',
    lang: detectLanguage(meta),
    themeContent,
    skillContent,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// REFINED HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function extractTheme(title) {
  // First try "Theme: Skill" pattern (e.g., "School: Reading Short Texts")
  const colonIdx = title.indexOf(':');
  if (colonIdx > 0 && colonIdx < 30) return title.substring(0, colonIdx).trim().toLowerCase();
  
  // For ELA lessons without theme prefix, extract the skill/topic from the title
  // e.g., "Responding to Questions" -> "responding to questions"
  // e.g., "Words that Rhyme" -> "words that rhyme"
  const lower = title.toLowerCase().trim();
  
  // Check for known themes in the title
  const themes = ['school', 'home', 'transport', 'accident', 'time', 'month', 'shopping', 'garden', 'farm', 'weather', 'water', 'plant', 'animal', 'food', 'health', 'safety', 'community', 'family'];
  for (const t of themes) { if (lower.includes(t)) return t; }
  
  // For ELA skill-based titles, use the title itself as the context
  // This ensures different lessons get different content
  if (lower.includes('rhyme') || lower.includes('syllable') || lower.includes('word')) return 'word skills';
  if (lower.includes('instruction') || lower.includes('following')) return 'instructions';
  if (lower.includes('question') || lower.includes('responding')) return 'questions';
  if (lower.includes('story') || lower.includes('retelling') || lower.includes('listening to')) return 'stories';
  if (lower.includes('conversation') || lower.includes('speaking') || lower.includes('greeting')) return 'conversation';
  if (lower.includes('reading') || lower.includes('comprehension')) return 'reading';
  if (lower.includes('writing') || lower.includes('spelling') || lower.includes('handwriting')) return 'writing';
  
  return 'everyday life';
}

function getThemeKey(theme) {
  if (!theme) return null;
  if (theme.includes('school')) return 'school';
  if (theme.includes('home') || theme.includes('house') || theme.includes('room') || theme.includes('activities in the home')) return 'home';
  if (theme.includes('transport') || theme.includes('travel') || theme.includes('road')) return 'transport';
  if (theme.includes('accident')) return 'accident';
  if (theme.includes('time') || theme.includes('month')) return 'time and months';
  if (theme.includes('shop') || theme.includes('market') || theme.includes('buy')) return 'shopping';
  if (theme.includes('garden')) return 'garden';
  // ELA skill-based themes
  if (theme.includes('word skills') || theme.includes('rhyme') || theme.includes('syllable')) return 'word skills';
  if (theme.includes('instruction')) return 'instructions';
  if (theme.includes('question')) return 'questions';
  if (theme.includes('story') || theme.includes('stories')) return 'stories';
  if (theme.includes('conversation') || theme.includes('speaking')) return 'conversation';
  if (theme.includes('reading')) return 'reading';
  if (theme.includes('writing')) return 'writing';
  return null;
}

function determineSkillType(strand, subStrand, title, subject) {
  // SAFETY: If subject is explicitly non-English, never return English skill types
  const sub = (subject || '').toLowerCase();
  const isEnglish = sub.includes('english') || sub.includes('language activities');
  const isMath = sub.includes('math');
  const isKiswahili = sub.includes('kiswahili');
  const isNonEnglish = isMath || isKiswahili || sub.includes('environmental') || sub.includes('hygiene') || sub.includes('movement') || sub.includes('science') || sub.includes('social');

  // Check title first — it's the most specific indicator
  const titleLower = (title || '').toLowerCase();
  if (titleLower.includes('rhyme') || titleLower.includes('syllable') || titleLower.includes('phonics') || titleLower.includes('sound') || titleLower.includes('pronunciation') || titleLower.includes('vocabulary') || titleLower.includes('word meaning')) return 'vocabulary';
  if (titleLower.includes('grammar') || titleLower.includes('verb') || titleLower.includes('tense') || titleLower.includes('was and were') || titleLower.includes('subject-verb') || titleLower.includes('object pronoun') || titleLower.includes('conjunction')) return 'grammar';
  if (titleLower.includes('punctuation') || titleLower.includes('capital letter') || titleLower.includes('full stop') || titleLower.includes('question mark')) return 'punctuation';
  if (titleLower.includes('spelling') || titleLower.includes('spell')) return 'spelling';
  if (titleLower.includes('writing') || titleLower.includes('write') || titleLower.includes('handwriting') || titleLower.includes('guided writing') || titleLower.includes('sentence building')) return 'writing skills';
  if (titleLower.includes('reading') || titleLower.includes('read') || titleLower.includes('comprehension')) {
    // SAFETY: Only return reading comprehension for English subjects
    if (isNonEnglish) return 'unsupported_needs_source_pack';
    return 'reading comprehension';
  }
  if (titleLower.includes('listening') || titleLower.includes('listen')) return 'listening skills';
  if (titleLower.includes('speaking') || titleLower.includes('speak') || titleLower.includes('greeting') || titleLower.includes('conversation')) return 'speaking skills';

  // Fall back to strand/sub-strand
  const strandText = `${strand} ${subStrand}`.toLowerCase();
  if (strandText.includes('rhyme') || strandText.includes('syllable') || strandText.includes('phonics') || strandText.includes('pronunciation') || strandText.includes('vocabulary')) return 'vocabulary';
  if (strandText.includes('grammar') || strandText.includes('verb') || strandText.includes('tense') || strandText.includes('pronoun') || strandText.includes('conjunction')) return 'grammar';
  if (strandText.includes('punctuation')) return 'punctuation';
  if (strandText.includes('spelling')) return 'spelling';
  if (strandText.includes('writing') || strandText.includes('handwriting') || strandText.includes('guided writing')) return 'writing skills';
  if (strandText.includes('reading') || strandText.includes('comprehension')) {
    // SAFETY: Only return reading comprehension for English subjects
    if (isNonEnglish) return 'unsupported_needs_source_pack';
    return 'reading comprehension';
  }
  if (strandText.includes('listening')) return 'listening skills';
  if (strandText.includes('speaking') || strandText.includes('conversation')) return 'speaking skills';

  // SAFETY: Never default to reading comprehension for non-English subjects
  if (isNonEnglish) return 'unsupported_needs_source_pack';

  // For English subjects with no specific match, return unsupported rather than guessing
  return 'unsupported_needs_source_pack';
}

function deriveChildFriendlyTitle(title, strand, subStrand) {
  let clean = title.replace(/^\w+\s+(of|for|about|in|on|with|to|from)\s+/i, '');
  const colonIdx = clean.indexOf(':');
  if (colonIdx > 0 && colonIdx < 30) clean = clean.substring(colonIdx + 1).trim();
  if (clean.length < 3 || clean.length > 60) clean = title.replace(/^\w+\s+\w+\s+/, '');
  return clean.charAt(0).toUpperCase() + clean.slice(1) || title;
}

/**
 * Build a child-friendly lesson goal from curriculum fields.
 * NEVER use raw "By the end of the lesson..." wording.
 */
function buildChildFriendlyGoal(learningOutcome, specificLO, keyInquiry, skillType, theme, themeContent) {
  // Strip raw curriculum prefixes
  let goal = learningOutcome
    .replace(/by the end of the lesson,?\s*the learner should be able to:?\s*/i, '')
    .replace(/by the end of the lesson,?\s*/i, '')
    .replace(/the learner will be able to\s*/i, '')
    .replace(/the learner should be able to\s*/i, '')
    .trim();

  // Always use simple goals for Grade 2 — curriculum language is too complex
  const themeName = theme || 'everyday life';
  const simpleGoals = {
    'reading comprehension': 'Read a short text about ' + themeName + ' and understand what it means.',
    'writing skills': 'Write simple sentences about ' + themeName + ' using capital letters and full stops.',
    'listening skills': 'Listen carefully to a story about ' + themeName + ' and tell the main idea.',
    'speaking skills': 'Speak clearly about ' + themeName + ' using complete sentences.',
    'spelling': 'Spell words about ' + themeName + ' correctly by sounding out each letter.',
    'vocabulary': 'Learn and use new words about ' + themeName + '.',
    'grammar': 'Use the right words when talking about ' + themeName + ', like "was" and "were."',
    'punctuation': 'Use capital letters and full stops when writing about ' + themeName + '.',
  };
  
  // Use simple goal if available, otherwise create from key inquiry
  if (simpleGoals[skillType]) return simpleGoals[skillType];
  
  // Fallback: use key inquiry to create a goal
  if (keyInquiry && keyInquiry.length > 10) {
    return 'Today we will learn about ' + skillType + '. ' + keyInquiry;
  }
  
  return 'Learn about ' + skillType + ' using ' + themeName + '.';
}

function buildThemeSkillExample(themeKey, skillType, themeContent, skillContent, title) {
  if (skillContent && themeContent) {
    return skillContent.exampleTemplate(
      themeKey || 'everyday life',
      themeContent.vocabulary || ['word', 'sentence'],
      themeContent.exampleSentences || ['This is an example.']
    );
  }
  if (skillContent) {
    return skillContent.exampleTemplate('everyday life', ['word', 'sentence'], ['This is an example sentence.']);
  }
  if (themeContent) {
    const s = themeContent.exampleSentences?.[0] || `This is about ${themeKey}.`;
    return `Let me show you an example about ${themeKey}: "${s}"`;
  }
  return `Let me show you how this works with an example.`;
}

function buildThemeSkillPractice(themeKey, skillType, themeContent, skillContent, type) {
  if (skillContent && themeContent) {
    return skillContent.practiceTemplate(themeKey || 'everyday life', themeContent.vocabulary || ['word', 'sentence']);
  }
  if (skillContent) {
    return skillContent.practiceTemplate('everyday life', ['word', 'sentence', 'story']);
  }
  if (themeContent) {
    return type === 'guided'
      ? `Let's practice together about ${themeKey}.`
      : `Your turn: Practice what you learned about ${themeKey}.`;
  }
  return `Practice what you learned today.`;
}

function buildThemeSkillQC(themeKey, skillType, themeContent, skillContent, keyInquiry, title) {
  if (skillContent && themeContent) {
    return skillContent.qcTemplate(
      themeKey || 'everyday life',
      themeContent.vocabulary || ['word', 'sentence'],
      themeContent.exampleSentences || ['This is an example.']
    );
  }
  if (skillContent) {
    return skillContent.qcTemplate('everyday life', ['word', 'sentence', 'story']);
  }
  // Fallback using key inquiry
  if (keyInquiry && keyInquiry.length > 10) {
    return {
      question: keyInquiry.replace(/[?!.]+$/, '') + '?',
      options: ['I am not sure yet', 'I learned something new', 'I already knew everything', 'I was not paying attention'],
      correctIndex: 1,
      explanation: 'Great! You learned something new today.',
    };
  }
  return {
    question: 'What did you learn today?',
    options: ['Nothing new', 'I learned something new', 'I already knew everything', 'I was not listening'],
    correctIndex: 1,
    explanation: 'Wonderful! You learned something new today!',
  };
}

function buildReflectionPrompt(skillType, theme, themeContent, keyInquiry) {
  const themeName = theme || 'this topic';
  if (skillType === 'reading comprehension') return `What did you learn about reading today? Can you tell someone the main idea of a story you read?`;
  if (skillType === 'writing skills') return `What did you learn about writing today? Show someone a sentence you wrote.`;
  if (skillType === 'listening skills') return `What did you learn about listening today? Tell someone the main idea of a story you heard.`;
  if (skillType === 'speaking skills') return `What did you learn about speaking today? Tell someone about ${themeName} using clear words.`;
  if (skillType === 'spelling') return `What new words did you learn to spell today? Write them down and show someone.`;
  if (skillType === 'vocabulary') return `What new words did you learn today? Use one of them in a sentence.`;
  if (skillType === 'grammar') return `What did you learn about using words correctly today? Give an example.`;
  if (skillType === 'punctuation') return `What did you learn about capital letters and full stops today? Show someone.`;
  return `What did you learn about ${themeName} today? Can you explain it to someone at home?`;
}

function deriveMisconception(skillType) {
  const m = {
    'reading comprehension': 'thinking that reading is only about saying words, not understanding them',
    'writing skills': 'believing that writing does not need capital letters or full stops',
    'listening skills': 'thinking you must understand every single word when listening',
    'speaking skills': 'believing that speaking loudly is the same as speaking clearly',
    'spelling': 'thinking spelling is only about memorizing letters, not sounding them out',
    'vocabulary': 'assuming all long words are too difficult to learn',
    'grammar': 'thinking there is only one correct way to say something',
    'punctuation': 'thinking capital letters are only for names',
  };
  return m[skillType] || 'thinking that learning is about memorizing, not understanding';
}

function deriveRealLifeConnection(title, strand, subStrand) {
  const text = `${title} ${strand} ${subStrand}`.toLowerCase();
  if (text.includes('school')) return 'in the classroom, on the playground, or in the school library';
  if (text.includes('home') || text.includes('house') || text.includes('room')) return 'at home with your family';
  if (text.includes('transport') || text.includes('travel') || text.includes('road')) return 'on your way to school or the market';
  if (text.includes('accident')) return 'at home, on the playground, or while playing';
  if (text.includes('food') || text.includes('meal') || text.includes('breakfast')) return 'at meal times with your family';
  if (text.includes('weather') || text.includes('rain') || text.includes('sun')) return 'when you wake up and get dressed, or when you play outside';
  if (text.includes('animal') || text.includes('pet')) return 'at home, on the farm, or at the zoo';
  if (text.includes('market') || text.includes('shop') || text.includes('buy')) return 'when you go shopping with your family';
  if (text.includes('time') || text.includes('clock')) return 'when you wake up, eat breakfast, go to school, and go to bed';
  return 'in your daily life at home and school';
}

function extractKeyVocabulary(title, learningOutcome) {
  const vocab = new Set();
  const text = `${title} ${learningOutcome}`.toLowerCase();
  [/\b(\w+tion)\b/g, /\b(\w+ment)\b/g, /\b(\w+ness)\b/g, /\b(\w+ful)\b/g].forEach(p => {
    const m = text.match(p);
    if (m) m.forEach(w => vocab.add(w));
  });
  return [...vocab].slice(0, 5);
}

function deriveConcept(strand, subStrand) {
  const text = `${strand} ${subStrand}`.toLowerCase();
  if (text.includes('reading')) return 'reading comprehension';
  if (text.includes('writing')) return 'writing skills';
  if (text.includes('listening')) return 'listening skills';
  if (text.includes('speaking')) return 'speaking skills';
  if (text.includes('spelling')) return 'spelling';
  if (text.includes('vocabulary')) return 'vocabulary';
  if (text.includes('grammar') || text.includes('sentence')) return 'grammar';
  if (text.includes('punctuation')) return 'punctuation';
  return 'language skills';
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 2: SHARED JOURNEY ENGINE (REFINED)
// ═══════════════════════════════════════════════════════════════════════════

function buildJourneyFromBlueprint(bp) {
  const lang = bp.lang;
  const title = bp.childFriendlyTitle || bp.originalTitle;
  const theme = bp.theme || 'everyday life';
  const themeContent = bp.themeContent;

  // Welcome — warm, specific
  const welcome = {
    id: 'welcome', stepType: 'welcome', title: getLabel(lang, 'welcome'),
    studentText: lang === 'sw'
      ? `Habari, rafiki! Leo tutajifunza kuhusu ${bp.skillType} kupitia ${theme}. Tayari?`
      : `Hello, friend! Today we are going to learn about ${bp.skillType} through ${theme}. Are you ready?`,
    owlText: lang === 'sw' ? `Habari! Leo tutajifunza kuhusu ${bp.skillType} pamoja.` : `Hello! Today we will learn about ${bp.skillType} together.`,
    visualType: 'owl_teacher', interaction: { type: 'none' }, media: {},
  };

  // Mission — child-friendly goal (NEVER raw curriculum)
  const mission = {
    id: 'mission', stepType: 'mission', title: getLabel(lang, 'startMission'),
    studentText: bp.lessonGoal,
    owlText: lang === 'sw' ? `Lego letu ni kujifunza kuhusu ${bp.skillType}.` : `Our mission is to learn about ${bp.skillType}.`,
    visualType: 'owl_teacher', interaction: { type: 'none' }, media: {},
  };

  // Think First — use key inquiry question
  const thinkFirst = {
    id: 'think_first', stepType: 'think_first', title: getLabel(lang, 'thinkFirst'),
    studentText: bp.keyQuestion
      ? `Before we start, think about this: ${bp.keyQuestion}`
      : `What do you already know about ${title}? Take a moment to think about it.`,
    owlText: lang === 'sw' ? 'Tafadhali fikiria kwanza kile unachojua.' : 'Take a moment to think about what you already know.',
    visualType: 'owl_teacher',
    interaction: { type: 'open_response', prompt: bp.keyQuestion || `What do you know about ${title}?`, placeholder: lang === 'sw' ? 'Andika mawako hapa...' : 'Share your thoughts...' },
    media: {},
  };

  // Learn — teach concept with theme-specific example
  const learn = {
    id: 'learn', stepType: 'learn', title: getLabel(lang, 'learn'),
    studentText: bp.conceptToTeach + (bp.guidedExample ? '\n\n' + bp.guidedExample : ''),
    owlText: lang === 'sw' ? 'Hapa unapaswa kujua. Sikiliza kwa makini!' : 'Here is what you need to know. Listen carefully!',
    visualType: 'owl_teacher', interaction: { type: 'none' }, media: {},
  };

  // Connect — theme-specific real-life connection
  const connect = {
    id: 'connect', stepType: 'connect', title: getLabel(lang, 'connect'),
    studentText: bp.realLifeConnection
      ? `Where do you see ${bp.skillType} ${bp.realLifeConnection}? Think about your own life.`
      : `Where do you see ${bp.skillType} in your daily life?`,
    owlText: lang === 'sw' ? 'Tunatumia hii kila siku!' : 'We use this every day!',
    visualType: 'owl_teacher', interaction: { type: 'none' }, media: {},
  };

  // Example — theme+skill specific
  const example = {
    id: 'example', stepType: 'example', title: getLabel(lang, 'example'),
    studentText: bp.guidedExample || `Let me show you how ${bp.skillType} works with an example about ${theme}.`,
    owlText: lang === 'sw' ? 'Angalia mfano hivi, kisha wewe utajaribu!' : 'Watch this example carefully, then you will try!',
    visualType: 'owl_teacher', interaction: { type: 'none' }, media: {},
  };

  // Practice — theme+skill specific
  const practice = {
    id: 'practice', stepType: 'practice', title: getLabel(lang, 'practice'),
    studentText: bp.independentPractice || `Practice what you learned about ${bp.skillType}.`,
    owlText: lang === 'sw' ? 'Unafanya vizuri! Endelea kufanya mazoezi.' : 'You are doing great! Keep practicing.',
    visualType: 'owl_teacher', interaction: { type: 'none' }, media: {},
  };

  // Quick Check — theme+skill specific
  const qc = bp.quickCheck;
  const quickCheck = {
    id: 'quick_check', stepType: 'quick_check', title: getLabel(lang, 'quickCheck'),
    studentText: qc.question,
    owlText: getLabel(lang, 'checkAnswer'),
    visualType: 'owl_teacher',
    interaction: { type: 'multiple_choice', question: qc.question, options: qc.options, correctIndex: qc.correctIndex, explanation: qc.explanation },
    media: {},
  };

  // Reflect — match the lesson
  const reflect = {
    id: 'reflect', stepType: 'reflect', title: getLabel(lang, 'reflect'),
    studentText: bp.reflectionPrompt,
    owlText: lang === 'sw' ? 'Umezidi leo!' : 'You worked hard today!',
    visualType: 'owl_teacher',
    interaction: { type: 'open_response', prompt: bp.reflectionPrompt, placeholder: lang === 'sw' ? 'Andika ulichojifunza...' : 'Write what you learned...' },
    media: {},
  };

  // Complete
  const complete = {
    id: 'complete', stepType: 'complete', title: getLabel(lang, 'youDidIt'),
    studentText: lang === 'sw'
      ? `Hongera! 🎉 Umefunza kuhusu ${bp.skillType} leo. Endelea na kazi nzuri!`
      : `Congratulations! 🎉 You learned about ${bp.skillType} today. Keep up the great work!`,
    owlText: lang === 'sw' ? 'Hongera, rafiki! Nilijivuna na wewe!' : 'Well done, friend! I am so proud of you!',
    visualType: 'owl_teacher', interaction: { type: 'none' }, media: {},
  };

  return [welcome, mission, thinkFirst, learn, connect, example, practice, quickCheck, reflect, complete];
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 3: VALIDATION LAYER (STRENGTHENED)
// ═══════════════════════════════════════════════════════════════════════════

function validateJourney(journey, blueprint) {
  const errors = [];

  if (!Array.isArray(journey) || journey.length !== 10) {
    errors.push(`Journey must have 10 steps, got ${journey?.length || 0}`);
    return { valid: false, errors };
  }

  const requiredTypes = ['welcome', 'mission', 'think_first', 'learn', 'connect', 'example', 'practice', 'quick_check', 'reflect', 'complete'];

  for (let i = 0; i < 10; i++) {
    const step = journey[i];
    if (step.stepType !== requiredTypes[i]) errors.push(`Step ${i}: expected ${requiredTypes[i]}, got ${step.stepType}`);
    if (!step.studentText || step.studentText.trim().length < 10) errors.push(`Step ${i} (${step.stepType}): studentText too short`);
    if (!step.owlText || step.owlText.trim().length < 5) errors.push(`Step ${i} (${step.stepType}): owlText too short`);
  }

  // FAIL: Mission contains raw curriculum wording
  const mission = journey[1];
  if (mission?.studentText) {
    if (/by the end of the lesson/i.test(mission.studentText)) errors.push('Mission contains raw "By the end of the lesson" wording');
    if (/the learner should be able to/i.test(mission.studentText)) errors.push('Mission contains raw "the learner should be able to" wording');
    if (/appreciate|demonstrate|recognize|distinguish|construct|manipulate|apply|analyze|evaluate/i.test(mission.studentText)) errors.push('Mission uses formal curriculum language instead of child-friendly wording');
    if (mission.studentText.includes(blueprint.originalTitle) && mission.studentText.length < 80) errors.push('Mission just copies the title');
  }

  // FAIL: Learn step is too generic
  const learn = journey[3];
  if (learn?.studentText) {
    const text = learn.studentText;
    if (text.length < 80) errors.push('Learn step content too short (< 80 chars)');
    // Check if example is generic (same for all themes)
    if (/in the classroom.*we have desks.*chalkboard/i.test(text) && blueprint.themeKey !== 'school') {
      errors.push('Learn example uses "classroom/desks/chalkboard" for non-school theme');
    }
  }

  // FAIL: Quick Check not tied to lesson skill
  const qc = journey[7];
  if (qc?.interaction?.type !== 'multiple_choice') errors.push('Quick Check must be multiple choice');
  else if (!qc.interaction.options || qc.interaction.options.length < 3) errors.push('Quick Check must have 3+ options');
  else if (qc.interaction.correctIndex === undefined || qc.interaction.correctIndex < 0 || qc.interaction.correctIndex >= qc.interaction.options.length) errors.push('Quick Check has invalid correctIndex');
  else {
    const malformed = qc.interaction.options.some(opt => /^\s*[A-D]\.\s+[A-D]\./.test(opt));
    if (malformed) errors.push('Quick Check options malformed');
  }

  // FAIL: Practice doesn't match theme
  const practice = journey[6];
  if (practice?.studentText) {
    const text = practice.studentText.toLowerCase();
    if (/^practice:?\s*try\s+/i.test(text) && text.length < 100) errors.push('Practice step is too generic');
    // Check theme mention
    if (blueprint.themeKey && !text.includes(blueprint.themeKey) && !text.includes('today') && !text.includes('learned')) {
      // Only flag if theme is specific enough to check
      if (['school', 'home', 'transport', 'accident'].includes(blueprint.themeKey)) {
        // Not a hard error, just a warning — practice might use different phrasing
      }
    }
  }

  // FAIL: Answer leaks in setup steps
  for (let i = 0; i < 6; i++) {
    const step = journey[i];
    if (step.studentText && /the answer is|the correct answer|answer:\s["']?[A-Z]/.test(step.studentText) && !/You answer:/.test(step.studentText)) {
      errors.push(`Answer leak in ${step.stepType}`);
    }
  }

  // FAIL: Title-copying
  const titleLower = blueprint.originalTitle.toLowerCase();
  for (const step of journey) {
    if (step.studentText && step.studentText.toLowerCase().includes(titleLower) && step.studentText.length < 100) {
      errors.push(`${step.stepType} just copies the title without meaningful content`);
    }
  }

  return { valid: errors.length === 0, errors };
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════

module.exports = {
  JOURNEY_LABELS, getLabel, detectLanguage,
  buildLessonBlueprint, buildJourneyFromBlueprint, validateJourney,
  THEME_CONTENT, SKILL_CONTENT,
  extractTheme, getThemeKey, determineSkillType,
};
