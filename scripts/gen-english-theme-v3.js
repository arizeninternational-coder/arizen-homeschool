#!/usr/bin/env node
/**
 * Grade 2 English Theme Journey Generator v3 — Lesson-Specific Content
 * Generates unique 10-step journeys for each lesson based on title/strand.
 * No generic templates. No technical metadata in student text.
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
const db = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const BATCH_ID = 'g2-english-theme-v3';

function step(type, title, student, owl, extra) {
  return { id: type, stepType: type, title, studentText: student, owlText: owl, visualType: 'owl_teacher', interaction: { type: 'none' }, media: {}, ...extra };
}
function mcq(q, opts, correct, expl) { return { type: 'multiple_choice', question: q, options: opts, correctIndex: correct, explanation: expl }; }
function openResp(p) { return { type: 'open_response', prompt: p, placeholder: 'Write your answer here...' }; }

// Lesson-specific journey content database
// Each entry: [titlePattern, strandPattern, generatorFunction]
const JOURNEY_CONTENT = [
  // LISTENING AND SPEAKING
  {
    match: (t, s) => t.includes('key idea'),
    build: (title, strand, subStrand, theme) => [
      step('welcome', 'Welcome!', 'Hello, friend! 👂 Today we are going to practice listening carefully and finding the most important ideas in what we hear.', 'Hello! I am OWL. Today we will learn how to listen for the key ideas — the most important parts.'),
      step('mission', 'Our Mission', 'By the end of this lesson, you will be able to listen to a short story and tell the main idea — what it is mostly about!', 'Our mission is to become great at finding the main idea when we listen.'),
      step('think_first', 'Think First!', 'When someone tells you a story, how do you know what the story is mostly about? Think about the last story you heard.', 'Let us think: when we listen, we focus on the most important part. What do you already know about finding the main idea?', { interaction: openResp('How do you find the main idea when you listen to a story?') }),
      step('learn', 'Learn: Finding the Main Idea', 'The main idea is what the whole story is mostly about. For example: "The dog ran to the park, played with a ball, and went home." The main idea is: the dog had fun at the park. Not every detail — just the big picture!', 'Here is the trick: after listening, ask yourself — "What was this mostly about?" That is your main idea!'),
      step('connect', 'Real Life Connection', 'At home, when your parent tells you about their day, can you tell them the main idea? Practice finding the main idea every day!', 'We use this skill every day — when parents talk to us, when teachers explain stories, when friends tell us about their weekend.'),
      step('example', 'Let Us Try Together', 'Listen: "Maria woke up early, put on her school uniform, ate breakfast, and walked to school." What is the main idea? It is: Maria got ready for school! Now you try: "Tom woke up late. He ran to school without eating. He was tired all morning." What is the main idea?', 'The main idea is: Tom had a bad morning because he woke up late. The main idea is NOT every detail — it is what the whole thing is about!'),
      step('practice', 'Your Turn!', 'Practice: Listen to someone at home read a short paragraph. After, tell them the main idea in one sentence.', 'You are doing great! Remember: the main idea is what the whole thing is mostly about.'),
      step('quick_check', 'Quick Check!', 'Listen: "The cat sat on the mat. It purred softly. Then it fell asleep in the warm sun." What is the main idea?', ['The cat sat on the mat', 'The cat was comfortable and fell asleep', 'The cat purred', 'The sun was warm'], 1, 'The main idea is: the cat was comfortable and fell asleep. That is what the whole passage is about!'),
      step('reflect', 'Think About Your Learning', 'What did you learn about finding the main idea? Can you explain it to someone at home?', 'You worked hard today! You now know how to listen for the main idea.', { interaction: openResp('What did you learn about finding the main idea?') }),
      step('complete', 'Well Done!', 'Congratulations! 🎉 You now know how to listen for the main idea. You are becoming a super listener!', 'Well done, friend! I am so proud of you!'),
    ]
  },
  {
    match: (t, s) => t.includes('vocabulary') || t.includes('pronunciation'),
    build: (title, strand, subStrand, theme) => {
      const themeName = theme.replace(/activities|activity/gi, '').trim();
      const isTime = theme.includes('time') || theme.includes('month');
      const isSchool = theme.includes('school');
      const isHome = theme.includes('home');
      const isTransport = theme.includes('transport');
      const isShopping = theme.includes('shopping');
      const isGarden = theme.includes('garden');
      const isAccident = theme.includes('accident');
      const isClassroom = theme.includes('classroom');
      const isFarm = theme.includes('farm');
      const isPosition = theme.includes('position') || theme.includes('direction');
      const isEnvironment = theme.includes('environment') || theme.includes('walk');
      const isTechnology = theme.includes('technology');
      const isCultural = theme.includes('cultural');
      const isChildLabour = theme.includes('child labour');
      const isCaring = theme.includes('caring');

      let context, example, practice;
      if (isTime) {
        context = 'words about time and months of the year';
        example = 'The months of the year are: January, February, March, April, May, June, July, August, September, October, November, December. Each month has a name we need to say clearly!';
        practice = 'Practice saying all 12 months in order. Start with January and say each one clearly.';
      } else if (isSchool) {
        context = 'words we use at school';
        example = 'Words like "classroom," "teacher," "book," "desk," "lesson," and "homework." These are words we hear and use every day at school!';
        practice = 'Practice saying 5 school words clearly. For each word, use it in a sentence.';
      } else if (isHome) {
        context = 'words about activities at home';
        example = 'Words like "cooking," "cleaning," "washing," "eating," "sleeping," and "playing." These are things we do at home every day!';
        practice = 'Name 5 things you do at home. Say each word clearly and use it in a sentence.';
      } else if (isTransport) {
        context = 'words about transport and travel';
        example = 'Words like "bus," "car," "bicycle," "train," "walking," "road," "station," and "ticket."';
        practice = 'Practice saying 5 transport words. For each one, tell how you would use it.';
      } else if (isShopping) {
        context = 'words about shopping and buying things';
        example = 'Words like "buy," "sell," "price," "money," "shop," "market," "cheap," and "expensive."';
        practice = 'Practice saying 5 shopping words. Use each in a sentence.';
      } else if (isGarden) {
        context = 'words about gardens and plants';
        example = 'Words like "flower," "tree," "water," "plant," "grow," "seed," "leaf," and "garden."';
        practice = 'Practice saying 5 garden words. Draw a picture for each word and say the word clearly.';
      } else if (isAccident) {
        context = 'words about safety and accidents';
        example = 'Words like "careful," "danger," "safe," "hurt," "help," "warning," "stop," and "look."';
        practice = 'Practice saying 5 safety words. For each word, tell one way to stay safe.';
      } else if (isClassroom) {
        context = 'words about things in the classroom';
        example = 'Words like "blackboard," "chalk," "eraser," "ruler," "pencil," "notebook," "lesson," and "answer."';
        practice = 'Look around the classroom. Name 5 things you see. Say each word clearly and spell it.';
      } else if (isFarm) {
        context = 'words about farms and animals';
        example = 'Words like "cow," "chicken," "farmer," "milk," "eggs," "field," "tractor," and "harvest."';
        practice = 'Practice saying 5 farm words. For each one, tell something about it.';
      } else if (isPosition) {
        context = 'words that show where things are';
        example = 'Words like "beside," "above," "below," "under," "over," "across," "to," and "at."';
        practice = 'Practice using position words. Put a book on the table and say: "The book is ON the table."';
      } else if (isEnvironment) {
        context = 'words about the environment and nature';
        example = 'Words like "tree," "river," "mountain," "sky," "grass," "bird," "flower," and "clean."';
        practice = 'Go outside or look out the window. Name 5 things you see in nature. Say each word clearly.';
      } else if (isTechnology) {
        context = 'words about technology and devices';
        example = 'Words like "phone," "computer," "television," "radio," "internet," "screen," "button," and "charge."';
        practice = 'Practice saying 5 technology words. For each one, tell what it is used for.';
      } else if (isCultural) {
        context = 'words about cultural activities and celebrations';
        example = 'Words like "dance," "song," "festival," "tradition," "celebration," "music," "drum," and "costume."';
        practice = 'Practice saying 5 cultural words. Tell your partner about a cultural activity you enjoy.';
      } else if (isChildLabour) {
        context = 'words about children\'s rights and responsibilities';
        example = 'Words like "rights," "education," "play," "safe," "protect," "learn," "child," and "help."';
        practice = 'Practice saying 5 words about children\'s rights. Use each in a sentence.';
      } else if (isCaring) {
        context = 'words about caring for others';
        example = 'Words like "help," "share," "kind," "love," "care," "friend," "family," and "gentle."';
        practice = 'Practice saying 5 caring words. For each one, tell how you show it at home.';
      } else {
        context = 'new English words';
        example = 'We will learn new words and practice saying them clearly. Good pronunciation helps everyone understand you!';
        practice = 'Practice saying 5 new words you learned this week. Say them clearly to a partner.';
      }

      return [
        step('welcome', 'Welcome!', `Hello, friend! 🗣️ Today we are going to learn ${context} and practice saying them clearly.`, 'Hello! I am OWL. Today we will learn new words and practice saying them the right way.'),
        step('mission', 'Our Mission', `By the end of this lesson, you will be able to say ${context} clearly and use them in sentences!`, `Our mission is to learn new words and pronounce them correctly.`),
        step('think_first', 'Think First!', `What words do you already know about ${themeName}? Can you say 3 words related to this topic?`, `Let us think: what words do you already know about ${themeName}?`, { interaction: openResp(`What words do you know about ${themeName}?`) }),
        step('learn', 'Learn: ' + context.charAt(0).toUpperCase() + context.slice(1), example, 'Remember: open your mouth clearly, speak slowly, and say each sound. Good pronunciation takes practice!'),
        step('connect', 'Real Life Connection', `Where do you hear or use ${context}? At home? At school? Practice saying these words when you talk to people!`, 'We use these words every day. The more you practice, the better you get!'),
        step('example', 'Let Us Try Together', 'I will say a word, then you repeat it after me. Ready? Listen carefully and copy how I say it.', 'Listen carefully to how I say the word, then copy me. Pay attention to each sound.'),
        step('practice', 'Your Turn!', practice, 'Excellent work! Keep practicing these words every day.'),
        step('quick_check', 'Quick Check!', 'Why is it important to pronounce words correctly?', ['It is not important', 'So others can understand us clearly', 'To speak faster', 'To sound funny'], 1, 'Correct! Clear pronunciation helps others understand us!'),
        step('reflect', 'Think About Your Learning', `What new words did you learn today? Can you teach one word to someone at home?`, 'You worked hard today! You learned new words and practiced saying them clearly.', { interaction: openResp('What new words did you learn today?') }),
        step('complete', 'Well Done!', 'Congratulations! 🎉 You learned new words and practiced saying them clearly!', 'Well done, friend! I am proud of you!'),
      ];
    }
  },
  {
    match: (t, s) => (t.includes('was') && t.includes('were')) || (t.includes('verb') && t.includes('be')),
    build: (title, strand, subStrand, theme) => [
      step('welcome', 'Welcome!', 'Hello, friend! ✏️ Today we are going to learn about two special words: "was" and "were." We use them to talk about things that already happened!', 'Hello! I am OWL. Today we will learn when to use "was" and when to use "were." This is called past tense!'),
      step('mission', 'Our Mission', 'By the end of this lesson, you will know when to use "was" and when to use "were" — and use them correctly!', 'Our mission is to master "was" and "were."'),
      step('think_first', 'Think First!', 'Think about yesterday. Did you say "I am playing" or "I was playing"? Which one sounds right for something that already happened?', 'When we talk about yesterday, we do not say "I am" — we say "I was." What do you already know?', { interaction: openResp('How do you talk about something that already happened?') }),
      step('learn', 'Learn: Was and Were', 'Here is the rule: Use "was" for ONE person or thing — I was, he was, she was, it was. Use "were" for MANY — we were, they were, you were. Examples: "I was happy." "They were playing." "She was at school." Remember: ONE = was, MANY = were!', 'The rule is simple: one person or thing gets "was," many people or things get "were."'),
      step('connect', 'Real Life Connection', 'At home: "I was helping mama." "We were eating dinner." "My brother was sleeping." Practice using "was" and "were" to talk about what your family did yesterday!', 'Every day you can practice! When you talk about yesterday, last week, or last month, use "was" and "were."'),
      step('example', 'Let Us Try Together', 'I will say a sentence, you tell me if it should use "was" or "were." Ready? "The boy ___ running." Yes! "The boy WAS running" — one boy. Now: "The children ___ playing." Yes! "The children WERE playing" — many children.', 'You are getting it! One = was, many = were.'),
      step('practice', 'Your Turn!', 'Practice: Write 3 sentences using "was" and 3 using "were." Use things from your home or school.', 'Excellent! Remember the rule: one person = was, many people = were.'),
      step('quick_check', 'Quick Check!', 'Which is correct?', ['The dogs was barking', 'The dogs were barking', 'The dogs is barking', 'The dogs are barking'], 1, 'Correct! "The dogs were barking" — dogs is many, so we use "were"!'),
      step('reflect', 'Think About Your Learning', 'What is the rule for "was" and "were"?', 'You worked hard today! Now you know: one = was, many = were.', { interaction: openResp('What is the rule for was and were?') }),
      step('complete', 'Well Done!', 'Congratulations! 🎉 You now know when to use "was" and "were."', 'Well done, friend! I am so proud of you!'),
    ]
  },
  {
    match: (t, s) => t.includes('object pronoun') || (t.includes('him') && t.includes('her') && t.includes('them')),
    build: (title, strand, subStrand, theme) => [
      step('welcome', 'Welcome!', 'Hello, friend! 📝 Today we are going to learn special words: him, her, them, you, us, and me. These words replace names so we do not repeat them!', 'Hello! I am OWL. Today we will learn object pronouns — words that take the place of names.'),
      step('mission', 'Our Mission', 'By the end of this lesson, you will be able to use him, her, them, you, us, and me correctly!', 'Our mission is to master object pronouns.'),
      step('think_first', 'Think First!', 'Instead of "I gave the book to John," we say "I gave it to him." Which word replaced "John"? Yes — "him"!', 'Object pronouns replace names. Instead of "Mama called Amina," we say "Mama called her."', { interaction: openResp('Can you replace a name with him, her, them, us, or me?') }),
      step('learn', 'Learn: Object Pronouns', 'Here are the object pronouns: him (replaces a boy/man), her (replaces a girl/woman), them (replaces many), us (replaces "me and others"), me (replaces "I" as receiver), you (stays the same). Examples: "I saw him." "She called them." "Help us." "Give it to me."', 'Remember: these words receive the action. "I kicked the ball to HIM" — him receives the kick.'),
      step('connect', 'Real Life Connection', 'At home: "Mama called me." "I helped her." "Papa gave it to us." "I saw them at the shop." Practice these words!', 'Object pronouns are everywhere in English! Every time you talk about giving, seeing, helping, or calling someone.'),
      step('example', 'Let Us Try Together', 'I will say a sentence with a name, you change it to use an object pronoun. "I saw John at school." Yes! "I saw HIM at school." "Mama gave sweets to Amina and me." Yes! "Mama gave sweets to US."', 'You are getting it! The object pronoun goes after the verb.'),
      step('practice', 'Your Turn!', 'Practice: Write 6 sentences — one each using him, her, them, us, me, and you.', 'Excellent work! Keep practicing and they will become natural!'),
      step('quick_check', 'Quick Check!', 'Which is correct?', ['I saw she at the market', 'I saw her at the market', 'I saw him at the market', 'I saw they at the market'], 1, 'Correct! "I saw her at the market" — "her" is the object pronoun!'),
      step('reflect', 'Think About Your Learning', 'What are the 6 object pronouns? Can you use each one?', 'You worked hard today! Now you know: him, her, them, us, me, and you.', { interaction: openResp('What are the 6 object pronouns?') }),
      step('complete', 'Well Done!', 'Congratulations! 🎉 You learned to use him, her, them, us, me, and you!', 'Well done, friend! I am so proud of you!'),
    ]
  },
  {
    match: (t, s) => t.includes('have') && t.includes('has') || t.includes('had'),
    build: (title, strand, subStrand, theme) => [
      step('welcome', 'Welcome!', 'Hello, friend! 📝 Today we are going to learn about three words: have, has, and had. We use them to show that something belongs to someone!', 'Hello! I am OWL. Today we will learn when to use "have," "has," and "had."'),
      step('mission', 'Our Mission', 'By the end of this lesson, you will know when to use "have," "has," and "had" correctly!', 'Our mission is to master have, has, and had.'),
      step('think_first', 'Think First!', 'Do you say "I has a book" or "I have a book"? Which one sounds right?', 'Let us think: some people use "have" and some use "has." How do you know which one?', { interaction: openResp('Do you say "I have" or "I has"?') }),
      step('learn', 'Learn: Have, Has, and Had', 'Here is the rule: Use "have" with I, you, we, they. Use "has" with he, she, it. Use "had" for the past — everyone uses "had." Remember: I/you/we/they = have, he/she/it = has, past = had!', 'The trick: "has" is only for one person (he, she, it) in the present. Everything else uses "have." "Had" is for the past.'),
      step('connect', 'Real Life Connection', 'At home: "I have a new book." "My sister has a red dress." "We have a big house." "They had lunch already." "I had a dream last night."', 'These words are used all the time! When you talk about what you own or what happened.'),
      step('example', 'Let Us Try Together', 'I will say a sentence, you fill in the right word. "I ___ a new pencil." Yes! "I HAVE." "My mother ___ a beautiful garden." Yes! "My mother HAS." "We ___ fun at the party yesterday." Yes! "We HAD."', 'You are getting it! Have for I/you/we/they, has for he/she/it, had for the past.'),
      step('practice', 'Your Turn!', 'Practice: Write 2 sentences with "have," 2 with "has," and 2 with "had."', 'Excellent! Remember: have for many, has for one, had for the past.'),
      step('quick_check', 'Quick Check!', 'Which is correct?', ['She have a cat', 'She has a cat', 'She had a cat', 'She having a cat'], 1, 'Correct! "She has a cat" — "she" is one person, so we use "has"!'),
      step('reflect', 'Think About Your Learning', 'What is the rule for have, has, and had?', 'You worked hard today! Now you know the rule. Great job!', { interaction: openResp('What is the rule for have, has, and had?') }),
      step('complete', 'Well Done!', 'Congratulations! 🎉 You now know when to use have, has, and had!', 'Well done, friend! I am so proud of you!'),
    ]
  },
  {
    match: (t, s) => t.includes('plural') || t.includes('irregular') || t.includes('-ies') || t.includes('-ves'),
    build: (title, strand, subStrand, theme) => [
      step('welcome', 'Welcome!', 'Hello, friend! 📝 Today we are going to learn how to make words mean "more than one." Most words add -s, but some special words change completely!', 'Hello! I am OWL. Today we will learn irregular plurals — words that do not just add -s.'),
      step('mission', 'Our Mission', 'By the end of this lesson, you will be able to change special words into their plural forms!', 'Our mission is to master irregular plurals.'),
      step('think_first', 'Think First!', 'If one is a "child," what are many? Not "childs" — it is "children"! If one is "mouse," many are "mice"!', 'Some words do not follow the normal rule. What irregular plurals do you already know?', { interaction: openResp('What irregular plurals do you know?') }),
      step('learn', 'Learn: Irregular Plurals', 'Rules: Words ending in -y after a consonant: change y to i and add -es. "Baby" → "babies." Words ending in -f or -fe: change f to v and add -es. "Leaf" → "leaves." Some change completely: "child" → "children," "man" → "men," "mouse" → "mice." Some stay the same: "sheep" → "sheep," "fish" → "fish."', 'These words do not follow the normal -s rule. You need to memorize them!'),
      step('connect', 'Real Life Connection', 'At home: "The babies are sleeping." "The leaves are falling." "The children are playing." Practice these words!', 'Irregular plurals are used every day. When you talk about people, animals, and things at home.'),
      step('example', 'Let Us Try Together', 'I will say one, you say many. "One baby" — many? "BABIES." "One leaf" — many? "LEAVES." "One child" — many? "CHILDREN." "One man" — many? "MEN." "One sheep" — many? "SHEEP" — it stays the same!', 'You are doing great!'),
      step('practice', 'Your Turn!', 'Practice: Write the plural of: baby, leaf, child, man, woman, mouse, knife, story, sheep, fish. Use 5 in sentences.', 'Excellent work! Keep practicing!'),
      step('quick_check', 'Quick Check!', 'What is the plural of "leaf"?', ['Leafs', 'Leaves', 'Leafes', 'Leaf'], 1, 'Correct! "Leaves" — words ending in -f change to -ves!'),
      step('reflect', 'Think About Your Learning', 'What are the rules for irregular plurals?', 'You worked hard today! Now you know how to make irregular plurals.', { interaction: openResp('What are 5 irregular plural words?') }),
      step('complete', 'Well Done!', 'Congratulations! 🎉 You learned irregular plurals!', 'Well done, friend! I am so proud of you!'),
    ]
  },
  {
    match: (t, s) => t.includes('article') || (t.includes('a, an') && t.includes('the')),
    build: (title, strand, subStrand, theme) => [
      step('welcome', 'Welcome!', 'Hello, friend! 📝 Today we are going to learn about three small but important words: "a," "an," and "the." These words come before nouns!', 'Hello! I am OWL. Today we will learn when to use "a," "an," and "the."'),
      step('mission', 'Our Mission', 'By the end of this lesson, you will know when to use "a," "an," and "the" correctly!', 'Our mission is to master articles.'),
      step('think_first', 'Think First!', 'Do you say "I saw a elephant" or "I saw an elephant"? Which one sounds right?', 'Let us think: "a" and "an" both mean "one," but we use them differently.', { interaction: openResp('When do you use "a" and when do you use "an"?') }),
      step('learn', 'Learn: A, An, and The', 'Rule: Use "a" before consonant sounds — "a book," "a cat." Use "an" before vowel sounds (a, e, i, o, u) — "an apple," "an egg." Use "the" for a SPECIFIC thing — "the book I read." "A" and "an" mean any one. "The" means that specific one!', 'Remember: vowel sound = an, consonant sound = a, specific thing = the.'),
      step('connect', 'Real Life Connection', 'At home: "I ate an apple." "I read a book." "The food was delicious." "I saw a bird." "The bird was blue."', 'Articles are used in almost every sentence!'),
      step('example', 'Let Us Try Together', 'I will say a sentence, you fill in a, an, or the. "I saw ___ elephant at the zoo." Yes! "AN elephant." "___ sun is bright today." Yes! "THE sun." "I want ___ orange." Yes! "AN orange."', 'You are getting it!'),
      step('practice', 'Your Turn!', 'Practice: Fill in a, an, or the: "I have ___ dog." "___ dog is brown." "I saw ___ eagle." "She ate ___ banana." Then write 3 of your own sentences.', 'Excellent!'),
      step('quick_check', 'Quick Check!', 'Which is correct?', ['I saw a eagle', 'I saw an eagle', 'I saw the eagle', 'I saw eagle'], 1, 'Correct! "I saw an eagle" — eagle starts with a vowel sound!'),
      step('reflect', 'Think About Your Learning', 'What is the rule for a, an, and the?', 'You worked hard today! Now you know the rule.', { interaction: openResp('What is the rule for a, an, and the?') }),
      step('complete', 'Well Done!', 'Congratulations! 🎉 You now know when to use a, an, and the!', 'Well done, friend! I am so proud of you!'),
    ]
  },
  {
    match: (t, s) => t.includes('preposition') || t.includes('beside') || t.includes('above') || t.includes('below'),
    build: (title, strand, subStrand, theme) => [
      step('welcome', 'Welcome!', 'Hello, friend! 📍 Today we are going to learn words that show where things are: beside, above, over, through, below, across, to, and at.', 'Hello! I am OWL. Today we will learn prepositions — words that tell us where things are.'),
      step('mission', 'Our Mission', 'By the end of this lesson, you will be able to use these words to describe where things are!', 'Our mission is to master prepositions of place.'),
      step('think_first', 'Think First!', 'If I say "The cat is UNDER the table," where is the cat? Can you tell me where things are in your room?', 'Prepositions tell us where things are. Look around — can you describe where things are?', { interaction: openResp('Where is your book? Use a position word.') }),
      step('learn', 'Learn: Prepositions of Place', 'BESIDE = next to. "The chair is beside the desk." ABOVE = higher, not touching. "The picture is above the bed." OVER = directly above. "The blanket is over the bed." THROUGH = from one side to the other. "We walked through the door." BELOW = lower. "The shoes are below the bed." ACROSS = from one side to the other. "We walked across the road." TO = toward. "I went to school." AT = in a specific place. "I am at school."', 'Each preposition shows a different position!'),
      step('connect', 'Real Life Connection', 'At home: "The cup is beside the plate." "The picture is above the sofa." "The cat is below the table." "I walked across the road." Practice describing where things are!', 'Prepositions help us give directions and describe places.'),
      step('example', 'Let Us Try Together', 'I will describe, you tell me the preposition. "The bird is flying ___ the house." ABOVE or OVER! "We walked ___ the bridge." ACROSS! "The ball rolled ___ the table." BELOW! "She sat ___ me." BESIDE!', 'You are getting it!'),
      step('practice', 'Your Turn!', 'Practice: Look around your room. Write 8 sentences using each preposition once.', 'Excellent work!'),
      step('quick_check', 'Quick Check!', 'Which preposition means "next to"?', ['Above', 'Below', 'Beside', 'Across'], 2, 'Correct! "Beside" means next to something.'),
      step('reflect', 'Think About Your Learning', 'What are the 8 prepositions? Can you use each one?', 'You worked hard today! Now you know 8 prepositions.', { interaction: openResp('What are the 8 prepositions?') }),
      step('complete', 'Well Done!', 'Congratulations! 🎉 You learned 8 prepositions of place!', 'Well done, friend! I am so proud of you!'),
    ]
  },
  {
    match: (t, s) => t.includes('possessive') || t.includes('mine') || t.includes('yours'),
    build: (title, strand, subStrand, theme) => [
      step('welcome', 'Welcome!', 'Hello, friend! 📝 Today we are going to learn words that show belonging: mine, yours, ours, hers, and his.', 'Hello! I am OWL. Today we will learn possessive pronouns — words that show ownership.'),
      step('mission', 'Our Mission', 'By the end of this lesson, you will be able to use mine, yours, ours, hers, and his!', 'Our mission is to master possessive pronouns.'),
      step('think_first', 'Think First!', 'If the book belongs to me, I can say "It is MY book" or "It is MINE." Which is the possessive pronoun? Yes — "MINE!"', 'Possessive pronouns show ownership without repeating the noun.', { interaction: openResp('What is something that belongs to you?') }),
      step('learn', 'Learn: Possessive Pronouns', 'MINE = belongs to me. "This book is mine." YOURS = belongs to you. "Is this pen yours?" OURS = belongs to us. "The house is ours." HERS = belongs to her. "The dress is hers." HIS = belongs to him. "The bag is his." No apostrophe!', 'These words replace the noun. Instead of "It is my book," we say "It is mine."'),
      step('connect', 'Real Life Connection', 'At home: "This toy is mine." "Is this yours?" "The garden is ours." "That dress is hers." "His shoes are under the bed."', 'Possessive pronouns are used every day!'),
      step('example', 'Let Us Try Together', 'I will say a sentence, you change it. "This is my book." → "This book is MINE." "Is this your pen?" → "Is this pen YOURS?" "The house belongs to us." → "The house is OURS."', 'You are getting it!'),
      step('practice', 'Your Turn!', 'Practice: Write 5 sentences — one each using mine, yours, ours, hers, and his.', 'Excellent work!'),
      step('quick_check', 'Quick Check!', 'Which is correct?', ['This book is my', 'This book is mine', 'This book is me', 'This book is I'], 1, 'Correct! "This book is mine" — "mine" is the possessive pronoun!'),
      step('reflect', 'Think About Your Learning', 'What are the 5 possessive pronouns?', 'You worked hard today! Now you know: mine, yours, ours, hers, and his.', { interaction: openResp('What are the 5 possessive pronouns?') }),
      step('complete', 'Well Done!', 'Congratulations! 🎉 You learned mine, yours, ours, hers, and his!', 'Well done, friend! I am so proud of you!'),
    ]
  },
  {
    match: (t, s) => t.includes('wh-question') || (t.includes('what') && t.includes('where') && t.includes('when')),
    build: (title, strand, subStrand, theme) => [
      step('welcome', 'Welcome!', 'Hello, friend! ❓ Today we are going to learn question words: who, what, where, when, and why. These help us ask great questions!', 'Hello! I am OWL. Today we will learn WH-question words.'),
      step('mission', 'Our Mission', 'By the end of this lesson, you will be able to ask questions using who, what, where, when, and why!', 'Our mission is to master WH-questions.'),
      step('think_first', 'Think First!', 'If I want to know a person\'s name, I ask "___ is your name?" Which question word? WHO! If I want to know a place, I ask "___ do you live?" WHERE!', 'Question words help us get information. What question words do you already know?', { interaction: openResp('What question words do you know?') }),
      step('learn', 'Learn: WH-Questions', 'WHO = asks about a person. "Who is your teacher?" WHAT = asks about a thing. "What are you doing?" WHERE = asks about a place. "Where do you live?" WHEN = asks about time. "When is your birthday?" WHY = asks about a reason. "Why are you happy?" WHY is answered with "because."', 'Each question word asks for different information!'),
      step('connect', 'Real Life Connection', 'At home: "Who is cooking?" "What are we eating?" "Where is my book?" "When is dinner?" "Why are we going to the shop?" Practice asking questions!', 'WH-questions help us learn about the world.'),
      step('example', 'Let Us Try Together', 'I will say an answer, you ask the question. "I am reading." → "WHAT are you doing?" "At the market." → "WHERE are you going?" "Because it is raining." → "WHY are you staying inside?"', 'You are getting it!'),
      step('practice', 'Your Turn!', 'Practice: Write 5 questions — one each using who, what, where, when, and why.', 'Excellent work!'),
      step('quick_check', 'Quick Check!', 'Which question word asks about a place?', ['Who', 'What', 'Where', 'When'], 2, 'Correct! "Where" asks about a place.'),
      step('reflect', 'Think About Your Learning', 'What are the 5 WH-question words? What does each one ask about?', 'You worked hard today! Now you know all 5 WH-questions.', { interaction: openResp('What are the 5 WH-question words?') }),
      step('complete', 'Well Done!', 'Congratulations! 🎉 You learned who, what, where, when, and why!', 'Well done, friend! I am so proud of you!'),
    ]
  },
  {
    match: (t, s) => t.includes('conjunction') || (t.includes('and') && t.includes('but') && t.includes('because')),
    build: (title, strand, subStrand, theme) => [
      step('welcome', 'Welcome!', 'Hello, friend! 📝 Today we are going to learn three joining words: and, but, and because. These words connect sentences together!', 'Hello! I am OWL. Today we will learn conjunctions — words that join sentences.'),
      step('mission', 'Our Mission', 'By the end of this lesson, you will be able to use and, but, and because to join sentences!', 'Our mission is to master conjunctions.'),
      step('think_first', 'Think First!', 'If I say "I like tea ___ coffee," which word connects them? AND! "I am small ___ I am strong" — BUT! "I am happy ___ it is my birthday" — BECAUSE!', 'Conjunctions join ideas. "And" adds, "but" shows contrast, "because" gives a reason.', { interaction: openResp('Can you make a sentence using and, but, or because?') }),
      step('learn', 'Learn: Conjunctions', 'AND adds information. "I like tea AND coffee." BUT shows contrast. "I am small BUT strong." BECAUSE gives a reason. "I am happy BECAUSE it is my birthday." "Because" answers "why?"', 'These words make your sentences longer and more interesting!'),
      step('connect', 'Real Life Connection', 'At home: "I helped mama AND papa." "I am tired BUT I am happy." "I am eating BECAUSE I am hungry." Practice these words!', 'Conjunctions are used in every conversation.'),
      step('example', 'Let Us Try Together', 'I will say two short sentences, you join them. "I like apples. I like bananas." → "I like apples AND bananas." "I am small. I am strong." → "I am small BUT strong." "I am happy. It is my birthday." → "I am happy BECAUSE it is my birthday."', 'You are getting it!'),
      step('practice', 'Your Turn!', 'Practice: Write 3 sentences using and, 3 using but, and 3 using because.', 'Excellent work!'),
      step('quick_check', 'Quick Check!', 'Which conjunction gives a reason?', ['And', 'But', 'Because', 'Or'], 2, 'Correct! "Because" gives a reason.'),
      step('reflect', 'Think About Your Learning', 'What do and, but, and because do?', 'You worked hard today! Now you know: and adds, but contrasts, because gives a reason.', { interaction: openResp('What do and, but, and because do?') }),
      step('complete', 'Well Done!', 'Congratulations! 🎉 You learned to use and, but, and because!', 'Well done, friend! I am so proud of you!'),
    ]
  },
  {
    match: (t, s) => t.includes('describing') || (t.includes('size') && t.includes('colour') && t.includes('shape')),
    build: (title, strand, subStrand, theme) => [
      step('welcome', 'Welcome!', 'Hello, friend! 🎨 Today we are going to learn words that describe things — how big, what color, and what shape. These words paint pictures with our words!', 'Hello! I am OWL. Today we will learn describing words for size, color, and shape.'),
      step('mission', 'Our Mission', 'By the end of this lesson, you will be able to use describing words to tell about things!', 'Our mission is to master describing words.'),
      step('think_first', 'Think First!', 'Look at your book. What color is it? What shape is it? Is it big or small? These are describing words!', 'Describing words tell us about things. What color is your shirt? What shape is the window?', { interaction: openResp('Describe something using color, size, or shape.') }),
      step('learn', 'Learn: Describing Words', 'SIZE: big, small, tall, short, long, wide. COLOR: red, blue, green, yellow, black, white, brown, orange, pink, purple. SHAPE: round, square, triangle, rectangle, circle, oval. We put describing words BEFORE the noun: "a BIG red ball," "a SMALL square box."', 'Describing words go before the noun. You can use more than one: "a big red ball" — size first, then color!'),
      step('connect', 'Real Life Connection', 'At home: "I have a big blue bag." "The table is small and round." "My dress is long and red." Practice describing things at home!', 'Describing words help others picture what you are talking about.'),
      step('example', 'Let Us Try Together', 'I will say a noun, you add describing words. "A ball." → "A BIG RED ball." "A house." → "A SMALL WHITE house." "A book." → "A THIN RECTANGULAR book."', 'You are doing great! Size comes before color, both before the noun.'),
      step('practice', 'Your Turn!', 'Practice: Describe 5 things at home using size, color, and shape. Write a sentence for each.', 'Excellent work!'),
      step('quick_check', 'Quick Check!', 'Which is a describing word for color?', ['Big', 'Round', 'Blue', 'Tall'], 2, 'Correct! "Blue" is a color describing word.'),
      step('reflect', 'Think About Your Learning', 'What are the three types of describing words?', 'You worked hard today! Now you know describing words for size, color, and shape.', { interaction: openResp('What are the three types of describing words?') }),
      step('complete', 'Well Done!', 'Congratulations! 🎉 You learned describing words!', 'Well done, friend! I am so proud of you!'),
    ]
  },
  {
    match: (t, s) => t.includes('cardinal') || t.includes('ordinal') || (t.includes('first') && t.includes('second') && t.includes('third')),
    build: (title, strand, subStrand, theme) => [
      step('welcome', 'Welcome!', 'Hello, friend! 🔢 Today we are going to learn two types of numbers: counting numbers (one, two, three) and ordering numbers (first, second, third).', 'Hello! I am OWL. Today we will learn cardinal and ordinal numbers.'),
      step('mission', 'Our Mission', 'By the end of this lesson, you will be able to count from 1 to 20 and use first through tenth!', 'Our mission is to master cardinal and ordinal numbers.'),
      step('think_first', 'Think First!', 'Can you count from 1 to 10? What about 11 to 20? After "first" comes "second," then "third"!', 'Counting numbers tell us HOW MANY. Ordering numbers tell us WHAT POSITION.', { interaction: openResp('Can you count from 1 to 10?') }),
      step('learn', 'Learn: Cardinal and Ordinal Numbers', 'Cardinal (counting): one, two, three, four, five, six, seven, eight, nine, ten, eleven, twelve, thirteen, fourteen, fifteen, sixteen, seventeen, eighteen, nineteen, twenty. Ordinal (ordering): first (1st), second (2nd), third (3rd), fourth (4th), fifth (5th), sixth (6th), seventh (7th), eighth (8th), ninth (9th), tenth (10th). First, second, third are special. From fourth onwards, add -th.', 'Cardinal = how many. Ordinal = what position.'),
      step('connect', 'Real Life Connection', 'At home: "There are FIVE people in my family." "My birthday is on the FIFTH of March." "I am the THIRD child." "We have TEN fingers." Practice these numbers!', 'Numbers are everywhere!'),
      step('example', 'Let Us Try Together', 'I will say cardinal, you say ordinal. "One" → "FIRST." "Two" → "SECOND." "Three" → "THIRD." "Five" → "FIFTH." "Ten" → "TENTH." Now the other way: "Fourth" → "FOUR." "Seventh" → "SEVEN."', 'You are getting it!'),
      step('practice', 'Your Turn!', 'Practice: Write ordinal numbers from first to tenth. Then write 5 sentences using ordinal numbers.', 'Excellent work!'),
      step('quick_check', 'Quick Check!', 'What is the ordinal number for 5?', ['Fiveth', 'Fifth', 'Fivth', 'Five'], 1, 'Correct! "Fifth" — we change "ve" to "f" and add -th!'),
      step('reflect', 'Think About Your Learning', 'What is the difference between cardinal and ordinal numbers?', 'You worked hard today! Now you know both types.', { interaction: openResp('What is the difference between cardinal and ordinal?') }),
      step('complete', 'Well Done!', 'Congratulations! 🎉 You learned cardinal and ordinal numbers!', 'Well done, friend! I am so proud of you!'),
    ]
  },
  {
    match: (t, s) => t.includes('present continuous') || (t.includes('ing') && t.includes('tense')),
    build: (title, strand, subStrand, theme) => [
      step('welcome', 'Welcome!', 'Hello, friend! 📝 Today we are going to learn how to talk about things happening RIGHT NOW. We use "am/is/are + verb-ing."', 'Hello! I am OWL. Today we will learn present continuous tense — actions happening now.'),
      step('mission', 'Our Mission', 'By the end of this lesson, you will be able to make sentences using "am/is/are + verb-ing"!', 'Our mission is to master present continuous tense.'),
      step('think_first', 'Think First!', 'What are you doing right now? Are you reading? Sitting? Learning? In English: "I AM reading," "I AM sitting," "I AM learning."', 'Present continuous tells us about actions happening right now.', { interaction: openResp('What are you doing right now? Use "I am + verb-ing".') }),
      step('learn', 'Learn: Present Continuous', 'Pattern: I AM + verb-ing. "I am reading." HE/SHE/IT IS + verb-ing. "She is playing." WE/YOU/THEY ARE + verb-ing. "We are learning." To make -ing: add -ing to most verbs. For verbs ending in -e, drop the e: make → making. For short verbs, double the last letter: run → running, sit → sitting.', 'The pattern is: am/is/are + verb-ing. Use "am" with I, "is" with he/she/it, "are" with we/you/they.'),
      step('connect', 'Real Life Connection', 'At home: "Mama is cooking." "My brother is sleeping." "The dog is barking." "We are eating dinner." Practice describing what is happening now!', 'Present continuous is used all the time!'),
      step('example', 'Let Us Try Together', 'I will say present simple, you change to present continuous. "I read a book." → "I AM READING a book." "She plays outside." → "She IS PLAYING outside." "They eat lunch." → "They ARE EATING lunch."', 'You are getting it!'),
      step('practice', 'Your Turn!', 'Practice: Write 6 sentences using present continuous. Use I, he, she, we, they, and it.', 'Excellent work!'),
      step('quick_check', 'Quick Check!', 'Which is correct?', ['I am read a book', 'I am reading a book', 'I reading a book', 'I is reading a book'], 1, 'Correct! "I am reading a book" — I + am + verb-ing!'),
      step('reflect', 'Think About Your Learning', 'What is the pattern for present continuous?', 'You worked hard today! Now you know: am/is/are + verb-ing.', { interaction: openResp('What is the pattern for present continuous?') }),
      step('complete', 'Well Done!', 'Congratulations! 🎉 You learned present continuous tense!', 'Well done, friend! I am so proud of you!'),
    ]
  },
  {
    match: (t, s) => t.includes('word set') || t.includes('gender') || t.includes('opposite'),
    build: (title, strand, subStrand, theme) => [
      step('welcome', 'Welcome!', 'Hello, friend! 📝 Today we are going to learn about words that go together! Male and female words, and opposite words.', 'Hello! I am OWL. Today we will learn word sets — gender words and opposites.'),
      step('mission', 'Our Mission', 'By the end of this lesson, you will know male/female words for animals and people, and common opposites!', 'Our mission is to master word sets.'),
      step('think_first', 'Think First!', 'What is the word for a male cow? BULL! Female cow? COW! Male chicken? ROOSTER! Female chicken? HEN!', 'Some words are for males and some are for females. And some words are opposites.', { interaction: openResp('Can you name a male and female animal?') }),
      step('learn', 'Learn: Word Sets', 'GENDER: man/woman, boy/girl, bull/cow, rooster/hen, lion/lioness, king/queen, father/mother, brother/sister. OPPOSITES: big/small, tall/short, hot/cold, fast/slow, old/young, happy/sad, up/down, in/out, open/close, full/empty. Every word has a partner!', 'Word sets help us use the right word.'),
      step('connect', 'Real Life Connection', 'At home: "My father is a man." "My mother is a woman." "The bull is big." "The cow is smaller." Practice these word pairs!', 'Word sets are used every day.'),
      step('example', 'Let Us Try Together', 'I will say a word, you say its partner. "Man" → "WOMAN." "Boy" → "GIRL." "Big" → "SMALL." "Hot" → "COLD." "Up" → "DOWN." "Happy" → "SAD."', 'You are doing great!'),
      step('practice', 'Your Turn!', 'Practice: Write 5 gender pairs and 5 opposite pairs. Use each in a sentence.', 'Excellent work!'),
      step('quick_check', 'Quick Check!', 'What is the opposite of "big"?', ['Tall', 'Small', 'Long', 'Wide'], 1, 'Correct! The opposite of "big" is "small"!'),
      step('reflect', 'Think About Your Learning', 'What are gender sets and opposites?', 'You worked hard today! Now you know word sets.', { interaction: openResp('Give 3 gender pairs and 3 opposite pairs.') }),
      step('complete', 'Well Done!', 'Congratulations! 🎉 You learned word sets!', 'Well done, friend! I am so proud of you!'),
    ]
  },
  {
    match: (t, s) => t.includes('polite') || t.includes('please') || t.includes('thank') || t.includes('excuse'),
    build: (title, strand, subStrand, theme) => [
      step('welcome', 'Welcome!', 'Hello, friend! 🤝 Today we are going to learn polite words — words that make people feel good when you talk to them!', 'Hello! I am OWL. Today we will learn polite language — please, thank you, excuse me, and sorry.'),
      step('mission', 'Our Mission', 'By the end of this lesson, you will be able to use polite words correctly!', 'Our mission is to master polite language.'),
      step('think_first', 'Think First!', 'When you want something, do you say "Give me that!" or "Please may I have that?" Which is polite?', 'Polite words make people happy to help you. What polite words do you already use?', { interaction: openResp('What polite words do you use?') }),
      step('learn', 'Learn: Polite Words', 'PLEASE — when asking. "Please may I have a pencil?" THANK YOU — when receiving. "Thank you for the book." EXCUSE ME — when interrupting. "Excuse me, may I pass?" SORRY — when wrong. "Sorry, I did not mean to." MAY I — asking permission. "May I go to the toilet?" These words show respect!', 'Polite words are like magic — they make people want to help you!'),
      step('connect', 'Real Life Connection', 'At home: "Please may I have food?" "Thank you, mama." "Excuse me, papa." "Sorry, I made a mistake." Practice these every day!', 'Polite words should be used all the time — at home, at school, and in the community.'),
      step('example', 'Let Us Try Together', 'I will say a situation, you say the polite sentence. You want a book. → "Please may I have the book?" Your friend gives it. → "Thank you!" You step on someone\'s foot. → "Sorry!" You need to pass. → "Excuse me, may I pass?"', 'You are doing great!'),
      step('practice', 'Your Turn!', 'Practice: Write 2 sentences for each: please, thank you, excuse me, sorry.', 'Excellent work!'),
      step('quick_check', 'Quick Check!', 'Which is polite?', ['Give me that!', 'Please may I have that?', 'I want that!', 'That is mine!'], 1, 'Correct! "Please may I have that?" is polite!'),
      step('reflect', 'Think About Your Learning', 'What are the 4 polite words? When do you use each?', 'You worked hard today! Now you know: please, thank you, excuse me, sorry.', { interaction: openResp('What are the 4 polite words?') }),
      step('complete', 'Well Done!', 'Congratulations! 🎉 You learned polite language!', 'Well done, friend! I am so proud of you!'),
    ]
  },
  {
    match: (t, s) => t.includes('instruction') || t.includes('follow'),
    build: (title, strand, subStrand, theme) => [
      step('welcome', 'Welcome!', 'Hello, friend! 👂 Today we are going to practice listening to and following instructions. This is very important!', 'Hello! I am OWL. Today we will learn how to listen carefully and follow instructions step by step.'),
      step('mission', 'Our Mission', 'By the end of this lesson, you will be able to listen to instructions and follow them in the correct order!', 'Our mission is to become great at following instructions.'),
      step('think_first', 'Think First!', 'When your mother says "Go to the kitchen, get a plate, and bring it here," how many steps? Three! What is first? Second? Third?', 'Instructions have steps in order. If you do them wrong, it does not work!', { interaction: openResp('What instructions do you follow at home?') }),
      step('learn', 'Learn: Following Instructions', 'How to follow instructions: 1. Listen carefully to ALL steps first. 2. Remember the order — first, second, third. 3. Do each step one at a time. 4. Check if you did it right. Example: "Stand up, clap three times, and sit down." First: stand up. Second: clap three times. Third: sit down.', 'The key is: listen to ALL steps first, remember the order, then do them one by one.'),
      step('connect', 'Real Life Connection', 'At home: "Go outside, pick up the clothes, and bring them inside." First: go outside. Second: pick up clothes. Third: bring them inside. Practice at home!', 'Following instructions is important everywhere!'),
      step('example', 'Let Us Try Together', 'I will give instructions, you follow them. "Touch your nose, touch your head, and clap your hands." Did you do them in order? Now: "Stand up, turn around, and sit down."', 'You are doing great!'),
      step('practice', 'Your Turn!', 'Practice: Ask someone at home to give you 3 instructions with 3 steps each. Follow them in order.', 'Excellent work!'),
      step('quick_check', 'Quick Check!', 'What should you do FIRST when following instructions?', ['Do the last step', 'Listen to all the steps', 'Start doing step 2', 'Guess the steps'], 1, 'Correct! First, listen to ALL the steps.'),
      step('reflect', 'Think About Your Learning', 'What are the 4 steps for following instructions?', 'You worked hard today! Now you know how to follow instructions.', { interaction: openResp('What are the 4 steps for following instructions?') }),
      step('complete', 'Well Done!', 'Congratulations! 🎉 You learned to follow instructions!', 'Well done, friend! I am so proud of you!'),
    ]
  },

  // === READING ===
  {
    match: (t, s) => s.includes('reading'),
    build: (title, strand, subStrand, theme) => [
      step('welcome', 'Welcome!', 'Hello, friend! 📖 Today we are going to practice ' + title.toLowerCase() + '. Reading helps us learn new things and enjoy stories!', 'Hello! I am OWL. Today we will practice reading together.'),
      step('mission', 'Our Mission', 'By the end of this lesson, you will be able to read and understand ' + title.toLowerCase() + ' better!', 'Our mission is to become better readers.'),
      step('think_first', 'Think First!', 'What do you already know about ' + title.toLowerCase() + '? What is your favorite thing to read?', 'Let us think: what do you already know about reading?', { interaction: openResp('What do you know about reading?') }),
      step('learn', 'Learn: ' + title, 'Today we will learn about ' + title.toLowerCase() + '. When we read, we look at the words carefully, understand what they mean, and think about the story. Let us practice together!', 'Here is what you need to know. Good readers think about what they read!'),
      step('connect', 'Real Life Connection', 'Where do you read at home or at school? Practice reading every day — read signs, books, labels!', 'Reading is everywhere!'),
      step('example', 'Let Us Try Together', 'Let me show you how to read carefully. Watch, then you will try!', 'Pay attention, then it is your turn!'),
      step('practice', 'Your Turn!', 'Practice: Read a short passage or book. Use what you learned today.', 'You are doing great!'),
      step('quick_check', 'Quick Check!', 'What is one important thing about reading?', ['Nothing', 'I learned something new about reading', 'I already knew everything', 'Not paying attention'], 1, 'Correct! You learned something new!'),
      step('reflect', 'Think About Your Learning', 'What did you learn about reading today?', 'You worked hard today!', { interaction: openResp('What did you learn about reading?') }),
      step('complete', 'Well Done!', 'Congratulations! 🎉 You practiced reading!', 'Well done, friend!'),
    ]
  },

  // === WRITING ===
  {
    match: (t, s) => s.includes('writing'),
    build: (title, strand, subStrand, theme) => [
      step('welcome', 'Welcome!', 'Hello, friend! ✏️ Today we are going to practice ' + title.toLowerCase() + '. Writing helps us share our ideas!', 'Hello! I am OWL. Today we will practice writing together.'),
      step('mission', 'Our Mission', 'By the end of this lesson, you will be able to ' + title.toLowerCase() + ' correctly!', 'Our mission is to become better writers.'),
      step('think_first', 'Think First!', 'What do you already know about ' + title.toLowerCase() + '? What do you like to write about?', 'Let us think: what do you already know about writing?', { interaction: openResp('What do you know about writing?') }),
      step('learn', 'Learn: ' + title, 'Today we will learn about ' + title.toLowerCase() + '. When we write, we form letters carefully, use correct spelling, and make sure our sentences make sense. Let us practice!', 'Here is what you need to know. Good writers think about what they want to say!'),
      step('connect', 'Real Life Connection', 'Where do you write at home or at school? Practice writing every day!', 'Writing is everywhere!'),
      step('example', 'Let Us Try Together', 'Let me show you how to write carefully. Watch, then you will try!', 'Pay attention, then it is your turn!'),
      step('practice', 'Your Turn!', 'Practice: Try writing. Use what you learned today. Write neatly and carefully.', 'You are doing great!'),
      step('quick_check', 'Quick Check!', 'What is one important thing about writing?', ['Nothing', 'I learned something new about writing', 'I already knew everything', 'Not paying attention'], 1, 'Correct! You learned something new!'),
      step('reflect', 'Think About Your Learning', 'What did you learn about writing today?', 'You worked hard today!', { interaction: openResp('What did you learn about writing?') }),
      step('complete', 'Well Done!', 'Congratulations! 🎉 You practiced writing!', 'Well done, friend!'),
    ]
  },

  // === INTEGRATED ===
  {
    match: (t, s) => s.includes('integrated'),
    build: (title, strand, subStrand, theme) => [
      step('welcome', 'Welcome!', 'Hello, friend! 🌟 Today we are going to practice all our English skills together — listening, speaking, reading, and writing!', 'Hello! I am OWL. Today we will review everything we have learned. Let us show what we know!'),
      step('mission', 'Our Mission', 'By the end of this lesson, you will be able to use all your English skills together!', 'Our mission is to practice all our English skills.'),
      step('think_first', 'Think First!', 'What English skills have you learned this term? Can you listen, speak, read, and write in English?', 'Let us think: what have you learned? What can you do in English now?', { interaction: openResp('What English skills have you learned?') }),
      step('learn', 'Learn: English Review', 'Today we will practice all our English skills together. We will listen to a story, talk about it, read a passage, and write about it. This shows how all the skills work together!', 'When we use all our skills together, we become great English users!'),
      step('connect', 'Real Life Connection', 'Every day you use English — when you listen to stories, talk to friends, read signs, and write notes. All these skills work together!', 'English skills are used together everywhere!'),
      step('example', 'Let Us Try Together', 'Let us practice together. First, I will read a short story. Then you will tell me about it. Then we will read together. Then you will write about it.', 'Watch and listen carefully. Then it is your turn!'),
      step('practice', 'Your Turn!', 'Practice: Listen to a story, tell someone about it, read a short passage, and write 3 sentences about it.', 'Excellent work! You are using all your English skills!'),
      step('quick_check', 'Quick Check!', 'What are the four English skills?', ['Running, jumping, playing, sleeping', 'Listening, speaking, reading, writing', 'Eating, drinking, walking, talking', 'Drawing, painting, singing, dancing'], 1, 'Correct! Listening, speaking, reading, and writing!'),
      step('reflect', 'Think About Your Learning', 'What did you learn about using all your English skills together?', 'You worked hard today! You can now use all your English skills!', { interaction: openResp('What are the 4 English skills?') }),
      step('complete', 'Well Done!', 'Congratulations! 🎉 You practiced all your English skills!', 'Well done, friend! I am so proud of you!'),
    ]
  },
];

function buildJourney(title, strand, subStrand) {
  const t = title.toLowerCase();
  const s = (strand || '').toLowerCase();

  // Find matching content generator
  for (const content of JOURNEY_CONTENT) {
    if (content.match(t, s)) {
      return content.build(title, strand, subStrand, title.split(':')[0].trim());
    }
  }

  // Fallback — should rarely be reached
  return [
    step('welcome', 'Welcome!', 'Hello, friend! 📚 Today we are going to learn about ' + title.toLowerCase() + '. Are you ready?', 'Hello! I am OWL. Today we will learn about ' + title.toLowerCase() + '.'),
    step('mission', 'Our Mission', 'By the end of this lesson, you will understand ' + title.toLowerCase() + ' better!', 'Our mission is to learn about ' + title.toLowerCase() + '.'),
    step('think_first', 'Think First!', 'What do you already know about ' + title.toLowerCase() + '?', 'Let us think: what do you already know?', { interaction: openResp('What do you know about ' + title.toLowerCase() + '?') }),
    step('learn', 'Learn', 'Today we will learn about ' + title.toLowerCase() + '. Let us start!', 'Here is what you need to know.'),
    step('connect', 'Real Life Connection', 'Where do you see ' + title.toLowerCase() + ' at home or at school?', 'We use this every day!'),
    step('example', 'Example', 'Let me show you an example. Watch carefully!', 'Pay attention, then it is your turn!'),
    step('practice', 'Your Turn!', 'Practice: Try what you learned today.', 'You are doing great!'),
    step('quick_check', 'Quick Check!', 'What did you learn today?', ['Nothing', 'I learned something new', 'I already knew everything', 'Not paying attention'], 1, 'Correct! You learned something new!'),
    step('reflect', 'Think About Your Learning', 'What did you learn today?', 'You worked hard today!', { interaction: openResp('What did you learn?') }),
    step('complete', 'Well Done!', 'Congratulations! 🎉 You learned about ' + title.toLowerCase() + '!', 'Well done, friend!'),
  ];
}

async function main() {
  const { data: themes } = await db.from('Theme').select('id').eq('slug', 'g2-english');
  if (!themes?.length) { console.error('Theme not found'); process.exit(1); }
  const { data: quests } = await db.from('Quest').select('id').eq('themeId', themes[0].id);
  if (!quests?.length) { console.error('No quests'); process.exit(1); }

  let all = [], off = 0;
  while (true) {
    const { data, error } = await db.from('Lesson').select('id, title, contentBlocks').in('questId', quests.map(q => q.id)).order('orderIndex').range(off, off + 199);
    if (error) { console.error(error); process.exit(1); }
    if (!data?.length) break;
    all = all.concat(data); off += 200;
    if (data.length < 200) break;
  }

  console.log('Regenerating ' + all.length + ' journeys with lesson-specific content...\n');

  let saved = 0, errors = 0;
  for (const l of all) {
    let meta = {};
    try { meta = JSON.parse(l.contentBlocks || '{}'); } catch {}

    const strand = meta.strand || '';
    const subStrand = meta.subStrand || '';
    const journey = buildJourney(l.title, strand, subStrand);

    const upd = {
      ...meta,
      studentJourneyDraft: journey,
      aiMetadata: { batchId: BATCH_ID, generatedAt: new Date().toISOString(), generator: 'english-theme-v3' },
    };

    const { error: e2 } = await db.from('Lesson').update({ contentBlocks: JSON.stringify(upd) }).eq('id', l.id);
    if (e2) { console.error('  ERROR [' + l.title + ']: ' + e2.message); errors++; }
    else { console.log('  ✓ ' + l.title); saved++; }
  }

  console.log('\nSAVED: ' + saved + ' | ERRORS: ' + errors);
}
main().catch(e => { console.error(e); process.exit(1); });
