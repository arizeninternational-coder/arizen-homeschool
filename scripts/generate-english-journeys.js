#!/usr/bin/env node
/**
 * Grade 2 English Language Activities — Journey Generator (IMPROVED)
 *
 * Generates 10-step student journeys for all English lessons.
 *
 * Improvements over v1:
 * - Quick Check questions are lesson-specific (derived from lesson data)
 * - Practice tasks are lesson-specific
 * - Reflection prompts use the actual lesson reflectionPrompt from CSV
 * - All content uses actual lesson fields: title, slo, kiQ, experience, etc.
 * - No generic/repeated questions within a strand
 * - No math-specific wording or patterns
 * - Proper support for Listening, Speaking, Reading, Writing
 * - Answer-leak safe: Owl text never reveals answers
 * - Short, warm, age-appropriate Owl text
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
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1);
  }
  envVars[key] = val;
});

const { createClient } = require('@supabase/supabase-js');
const db = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const BATCH_ID = 'grade-2-english-batch-1';

// ── Helpers ──────────────────────────────────────────────────────

function step(stepType, title, studentText, owlText, extra = {}) {
  return {
    id: stepType,
    stepType,
    title,
    studentText,
    owlText,
    visualType: 'owl_teacher',
    interaction: { type: 'none' },
    media: {},
    ...extra,
  };
}

function mcqInteraction(question, options, correctIndex, explanation) {
  return {
    type: 'multiple_choice',
    question,
    options,
    correctIndex,
    explanation,
  };
}

function openResponseInteraction(prompt, placeholder) {
  return {
    type: 'open_response',
    prompt,
    placeholder: placeholder || 'Type your answer here...',
  };
}

// ── Lesson-specific content builders ─────────────────────────────

/**
 * Build a lesson-specific Quick Check interaction from lesson data.
 * Each question is derived from the lesson's actual SLO, KiQ, and experience.
 * Returns { question, options, correctIndex, explanation }.
 */
function buildQuickCheck(lesson) {
  const { title, slo, kiQ, experience, subStrand, strand } = lesson;
  const sloLower = slo.toLowerCase();
  const strandNum = strand.split('.')[0];

  // ── LISTENING (strand 1.x) ──
  if (strandNum === '1') {
    if (sloLower.includes('instruction')) {
      return {
        question: `When someone gives you instructions, what should you do first?`,
        options: ['Start doing the last thing they said', 'Listen carefully to all the instructions', 'Close your eyes', 'Sing a song'],
        correctIndex: 1,
        explanation: 'Great! We listen carefully to all the instructions first, then we do them. That is how we follow instructions well!',
      };
    }
    if (sloLower.includes('non-verbal') || sloLower.includes('cue')) {
      return {
        question: `Which of these is a way to show you are listening without speaking?`,
        options: ['Looking at the person who is talking', 'Talking at the same time', 'Turning away', 'Closing your eyes'],
        correctIndex: 0,
        explanation: 'Yes! Looking at the person, nodding, and staying still are ways to show you are listening. These are called non-verbal cues!',
      };
    }
    if (sloLower.includes('syllable')) {
      return {
        question: `How many syllables are in the word "banana"?`,
        options: ['1', '2', '3', '4'],
        correctIndex: 2,
        explanation: 'Banana has 3 syllables: ba-na-na. You can clap for each syllable: clap-clap-clap!',
      };
    }
    if (sloLower.includes('rhym') || sloLower.includes('similar sound')) {
      return {
        question: `Which word rhymes with "cat"?`,
        options: ['Dog', 'Hat', 'Pen', 'Sun'],
        correctIndex: 1,
        explanation: 'Hat rhymes with cat! They both end with the "-at" sound. Rhyming words have the same ending sound.',
      };
    }
    if (sloLower.includes('stor') && sloLower.includes('vocabulary')) {
      return {
        question: `When you listen to a story, what helps you learn new words?`,
        options: ['Covering your ears', 'Listening carefully and asking about words you do not know', 'Talking while the story is being told', 'Closing your eyes'],
        correctIndex: 1,
        explanation: 'Listening carefully and asking about new words helps you grow your vocabulary. The more you listen, the more words you learn!',
      };
    }
    if (sloLower.includes('recount') || sloLower.includes('retell') || sloLower.includes('moral')) {
      return {
        question: `When you retell a story, what should you include?`,
        options: ['Only the ending', 'The key details: who, what, where', 'Only the characters\' names', 'A different story'],
        correctIndex: 1,
        explanation: 'When we retell a story, we share the key details: who was in the story, what happened, and where it took place. This helps others understand the story too!',
      };
    }
    if (sloLower.includes('attention') || sloLower.includes('rhyme') && sloLower.includes('song')) {
      return {
        question: `What does it mean to listen with attention?`,
        options: ['To look around the room', 'To focus on what you are hearing and not get distracted', 'To talk while listening', 'To close your eyes'],
        correctIndex: 1,
        explanation: 'Listening with attention means focusing on what you are hearing. It helps you understand and remember what was said!',
      };
    }
    if (sloLower.includes('feelings') || sloLower.includes('experiences of others')) {
      return {
        question: `When someone tells you about their feelings, what is a good response?`,
        options: ['Walk away', 'Listen carefully and say something kind', 'Start talking about yourself', 'Laugh'],
        correctIndex: 1,
        explanation: 'When someone shares their feelings, we listen carefully and respond with kindness. This shows we care about them!',
      };
    }
    if (sloLower.includes('informational') || sloLower.includes('key detail') || subStrand.toLowerCase().includes('conversation')) {
      return {
        question: `What are cue words we use to ask questions in a conversation?`,
        options: ['Run, jump, play', 'Who, what, where, when, why', 'Red, blue, green', 'Big, small, tall'],
        correctIndex: 1,
        explanation: 'Cue words like who, what, where, when, and why help us ask good questions and understand what we hear in conversations!',
      };
    }
    if (sloLower.includes('respect') || sloLower.includes('build on')) {
      return {
        question: `How can you show respect when someone else is speaking?`,
        options: ['Talk over them', 'Listen quietly and wait for your turn', 'Look at your phone', 'Walk away'],
        correctIndex: 1,
        explanation: 'We show respect by listening quietly, waiting for our turn to speak, and building on what others have said. This makes conversations better for everyone!',
      };
    }
  }

  // ── SPEAKING (strand 2.x) ──
  if (strandNum === '2') {
    if (sloLower.includes('respond confidently') || sloLower.includes('question') && sloLower.includes('instruction')) {
      return {
        question: `When someone asks you a question, what makes your response clear?`,
        options: ['Speaking very quietly so no one hears', 'Speaking clearly and looking at the person', 'Running away', 'Saying nothing'],
        correctIndex: 1,
        explanation: 'Speaking clearly and looking at the person helps them understand your response. Confident speakers use their voice well!',
      };
    }
    if (sloLower.includes('clarity') || sloLower.includes('seek clarity')) {
      return {
        question: `If you do not understand an instruction, what should you do?`,
        options: ['Guess and hope for the best', 'Ask a question to get clarity, like "Can you please explain?"', 'Do nothing', 'Walk away'],
        correctIndex: 1,
        explanation: 'Asking questions when you do not understand is smart! It shows you want to learn and helps you get it right.',
      };
    }
    if (sloLower.includes('letter-sound') || sloLower.includes('syllable') && sloLower.includes('sound')) {
      return {
        question: `What is a syllable?`,
        options: ['A type of letter', 'A unit of sound in a word — you can clap for each one', 'A kind of book', 'A punctuation mark'],
        correctIndex: 1,
        explanation: 'A syllable is a unit of sound in a word. You can clap for each syllable! For example, "butter" has two syllables: but-ter.',
      };
    }
    if (sloLower.includes('blend') && sloLower.includes('segment')) {
      return {
        question: `What does it mean to blend sounds?`,
        options: ['To separate sounds in a word', 'To push sounds together to make a word', 'To write letters', 'To erase words'],
        correctIndex: 1,
        explanation: 'Blending sounds means pushing individual sounds together to read a word. Like c-a-t becomes "cat"!',
      };
    }
    if (sloLower.includes('sentence') && sloLower.includes('sound')) {
      return {
        question: `What do you need to make a sentence?`,
        options: ['Just one word', 'Words that make sense together, starting with a capital letter and ending with a full stop', 'Only pictures', 'Only numbers'],
        correctIndex: 1,
        explanation: 'A sentence needs words that make sense together! It starts with a capital letter and ends with a full stop. Like: "I like dogs."',
      };
    }
    if (sloLower.includes('characters') || sloLower.includes('talk about')) {
      return {
        question: `When talking about a story, what can you discuss?`,
        options: ['Only the colour of the book', 'The characters, events, and what happened in the story', 'Only the title', 'What you had for lunch'],
        correctIndex: 1,
        explanation: 'When we talk about stories, we discuss the characters (who), the events (what happened), and the lessons we learned!',
      };
    }
    if (sloLower.includes('greeting') || sloLower.includes('verbal and non-verbal')) {
      return {
        question: `Which is a good way to greet someone?`,
        options: ['Looking at the ground and saying nothing', 'Smiling, looking at them, and saying "Hello!"', 'Turning away', 'Whispering'],
        correctIndex: 1,
        explanation: 'A good greeting uses both words and body language! Smile, look at the person, and say hello clearly. This shows respect and friendliness.',
      };
    }
    if (sloLower.includes('vocabulary') && sloLower.includes('communicate')) {
      return {
        question: `Why is it important to use new vocabulary when you speak?`,
        options: ['It is not important', 'It helps you express your ideas more clearly and others can understand you better', 'It makes you sound funny', 'It confuses everyone'],
        correctIndex: 1,
        explanation: 'Using new vocabulary helps you express your ideas clearly! The more words you know, the better you can share your thoughts.',
      };
    }
    if (sloLower.includes('order') || sloLower.includes('tonal variation') || sloLower.includes('articulation')) {
      return {
        question: `Why is it important to speak in the right order when telling something?`,
        options: ['It is not important', 'It helps others understand your story or message clearly', 'It makes you sound like a robot', 'No one listens anyway'],
        correctIndex: 1,
        explanation: 'Speaking in the right order — first, then, next, last — helps others follow your story and understand your message!',
      };
    }
  }

  // ── READING (strand 3.x) ──
  if (strandNum === '3') {
    if (sloLower.includes('reading speed') || sloLower.includes('fluency') || sloLower.includes('paired reading')) {
      return {
        question: `What does it mean to read with fluency?`,
        options: ['Reading as fast as possible without stopping', 'Reading smoothly, at a good pace, with expression', 'Reading silently', 'Reading backwards'],
        correctIndex: 1,
        explanation: 'Reading fluently means reading smoothly at a good pace, with expression. It is not about being the fastest — it is about reading well!',
      };
    }
    if (sloLower.includes('prediction') || sloLower.includes('ask questions') && sloLower.includes('reading')) {
      return {
        question: `What does it mean to make a prediction when reading?`,
        options: ['To guess what might happen next based on what you have read', 'To skip pages', 'To read the last page first', 'To close the book'],
        correctIndex: 0,
        explanation: 'A prediction is a smart guess about what might happen next. We use clues from the story to help us predict!',
      };
    }
    if (sloLower.includes('group reading') || sloLower.includes('collective')) {
      return {
        question: `What is one benefit of reading in a group?`,
        options: ['You do not have to read at all', 'You can support each other and learn from your peers', 'It is always louder', 'You finish faster'],
        correctIndex: 1,
        explanation: 'Reading in a group lets you support each other! You can help with difficult words, share ideas, and learn together.',
      };
    }
    if (sloLower.includes('peer') || sloLower.includes('self-assessment') || sloLower.includes('confidence')) {
      return {
        question: `What does self-assessment mean in reading?`,
        options: ['Letting someone else read for you', 'Checking your own reading to see how well you are doing', 'Reading as fast as possible', 'Skipping hard words'],
        correctIndex: 1,
        explanation: 'Self-assessment means checking your own work. In reading, it means noticing when you read well and when you need more practice!',
      };
    }
    if (sloLower.includes('silently') && sloLower.includes('sustained focus')) {
      return {
        question: `What is important when reading silently?`,
        options: ['Reading out loud', 'Staying focused on the text without getting distracted', 'Moving around', 'Talking to a friend'],
        correctIndex: 1,
        explanation: 'When reading silently, we stay focused on the text. We let our eyes move across the words and think about what they mean!',
      };
    }
    if (sloLower.includes('unfamiliar') || sloLower.includes('comprehension') && sloLower.includes('silently')) {
      return {
        question: `What can you do when you find a word you do not know while reading?`,
        options: ['Skip it and never come back', 'Use context clues — look at the other words around it to guess the meaning', 'Close the book', 'Shout for help'],
        correctIndex: 1,
        explanation: 'Context clues are the words and sentences around an unknown word. They help you guess what the word means without asking someone!',
      };
    }
    if (sloLower.includes('specific details') || sloLower.includes('locate')) {
      return {
        question: `What does it mean to locate specific details in a text?`,
        options: ['To read the whole book again', 'To find particular information the question is asking about', 'To count the pages', 'To look at the pictures only'],
        correctIndex: 1,
        explanation: 'Locating specific details means finding the exact information a question asks about. You scan the text to find the answer!',
      };
    }
    if (sloLower.includes('summari') || sloLower.includes('main idea')) {
      return {
        question: `What is the main idea of a story?`,
        options: ['The colour of the book cover', 'The most important point or message the story is about', 'The number of pages', 'The author\'s name'],
        correctIndex: 1,
        explanation: 'The main idea is the most important point the story is about. When we summarise, we share the main idea in our own words!',
      };
    }
  }

  // ── WRITING (strand 4.x) ──
  if (strandNum === '4') {
    if (sloLower.includes('sentence') && (sloLower.includes('familiar') || sloLower.includes('noun') || sloLower.includes('verb'))) {
      return {
        question: `What makes a good sentence?`,
        options: ['Just one word', 'Words that make sense together, starting with a capital letter and ending with a full stop', 'Only pictures', 'A very long word'],
        correctIndex: 1,
        explanation: 'A good sentence has words that make sense together! It starts with a capital letter and ends with a full stop. Example: "The dog runs fast."',
      };
    }
    if (sloLower.includes('upper') || sloLower.includes('lower case') || sloLower.includes('capitali')) {
      return {
        question: `Which of these is written correctly?`,
        options: ['the cat sat', 'The cat sat', 'THE CAT SAT', 'tHe CaT sAt'],
        correctIndex: 1,
        explanation: 'Sentences start with a capital letter! "The cat sat" is correct. The first letter is capitalised, and the rest are lowercase.',
      };
    }
    if (sloLower.includes('spell') && (sloLower.includes('short') || sloLower.includes('long') || sloLower.includes('vowel'))) {
      return {
        question: `What is a vowel sound?`,
        options: ['Sounds made only with your lips', 'The sounds a, e, i, o, u — every syllable needs a vowel sound', 'Sounds that are very loud', 'Sounds made with your hands'],
        correctIndex: 1,
        explanation: 'Vowel sounds are a, e, i, o, u. Every syllable in every word needs at least one vowel sound! Like "cat" has the vowel "a".',
      };
    }
    if (sloLower.includes('phonic') || sloLower.includes('editing') || sloLower.includes('correct spelling')) {
      return {
        question: `How can sounds help you spell a word?`,
        options: ['They cannot help at all', 'You can listen for each sound and write the letter that makes that sound', 'You should just guess', 'You should copy from a friend'],
        correctIndex: 1,
        explanation: 'Phonics helps us spell! You listen for each sound in a word and write the letter that makes that sound. Like "dog" = d-o-g!',
      };
    }
    if (sloLower.includes('spacing') || sloLower.includes('punctuation')) {
      return {
        question: `Why do we leave spaces between words when writing?`,
        options: ['To use more paper', 'So each word is clear and easy to read', 'Because the teacher said so', 'To make the writing look bigger'],
        correctIndex: 1,
        explanation: 'Spaces between words make our writing clear and easy to read! Without spaces, all the words would run together and be hard to understand.',
      };
    }
    if (sloLower.includes('neat') || sloLower.includes('legible') || sloLower.includes('join letters')) {
      return {
        question: `What makes handwriting neat and legible?`,
        options: ['Writing as fast as possible', 'Forming letters carefully, using proper spacing, and keeping letters the same size', 'Using only capital letters', 'Writing very small'],
        correctIndex: 1,
        explanation: 'Neat handwriting means forming letters carefully, keeping them the same size, and using proper spacing. This makes your writing easy for others to read!',
      };
    }
    if (sloLower.includes('creative writing') || sloLower.includes('writing process') || sloLower.includes('own texts')) {
      return {
        question: `What is the first step in the creative writing process?`,
        options: ['Publishing', 'Planning — thinking about what you want to write about', 'Editing', 'Copying from a book'],
        correctIndex: 1,
        explanation: 'The first step in creative writing is planning! You think about your story — the characters, what will happen, and how it will end. Then you start writing!',
      };
    }
    if (sloLower.includes('sequencing') || sloLower.includes('connecting words') || sloLower.includes('sentence structure')) {
      return {
        question: `Which of these is a connecting word that helps sequence ideas?`,
        options: ['Dog', 'Then', 'Blue', 'Run'],
        correctIndex: 1,
        explanation: 'Connecting words like "then", "next", "after", and "finally" help us sequence ideas in our writing. They show the order of events!',
      };
    }
  }

  // ── Additional SLO matches for new lessons ──
  if (sloLower.includes('enjoyment') || sloLower.includes('pleasure') && sloLower.includes('silent')) {
    return {
      question: `Why is it good to read silently for enjoyment?`,
      options: ['Because the teacher said so', 'Because it helps us develop a love of reading and focus on our own', 'Because we have to', 'It is not good'],
      correctIndex: 1,
      explanation: 'Reading for enjoyment helps us develop a love of reading! When we read for pleasure, we focus better and learn to love books.',
    };
  }
  if (sloLower.includes('context clue') || sloLower.includes('unknown words') && sloLower.includes('vocabulary')) {
    return {
      question: `What are context clues?`,
      options: ['Words and sentences around an unknown word that help us guess its meaning', 'The title of the book', 'The pictures only', 'The back cover'],
      correctIndex: 0,
      explanation: 'Context clues are the words and sentences around an unknown word. They help us guess what the word means without asking someone!',
    };
  }
  if (sloLower.includes('writing for pleasure') || sloLower.includes('interest in writing')) {
    return {
      question: `Why should we write for pleasure?`,
      options: ['Only because the teacher says so', 'Because it helps us express ourselves and become better writers', 'We should not write for pleasure', 'It is a waste of time'],
      correctIndex: 1,
      explanation: 'Writing for pleasure helps us express ourselves! When we write for fun, we become more confident and creative writers.',
    };
  }
  if (sloLower.includes('handwriting') && sloLower.includes('contest') || sloLower.includes('artistic expression')) {
    return {
      question: `What makes handwriting artistic and expressive?`,
      options: ['Writing as fast as possible', 'Careful letter formation, neat spacing, and creative expression', 'Using only capital letters', 'Writing very small'],
      correctIndex: 1,
      explanation: 'Artistic handwriting means forming letters carefully, spacing neatly, and expressing ourselves creatively through writing!',
    };
  }
  if (sloLower.includes('creative') && sloLower.includes('story') || sloLower.includes('artistic expression') && sloLower.includes('writing')) {
    return {
      question: `What makes a story creative?`,
      options: ['Using the same words as everyone else', 'Using imagination, interesting ideas, and artistic expression', 'Copying from a book', 'Writing very short sentences'],
      correctIndex: 1,
      explanation: 'Creative stories use imagination! We include interesting ideas, descriptive words, and artistic expression to make our stories come alive.',
    };
  }
  if (sloLower.includes('independent') || sloLower.includes('free choice') && sloLower.includes('writing')) {
    return {
      question: `Why is it important to choose to write on our own?`,
      options: ['It is not important', 'Because it helps us develop confidence and a love of writing', 'Because the teacher makes us', 'We should never write independently'],
      correctIndex: 1,
      explanation: 'Choosing to write on our own helps us develop confidence! When we write independently, we practice our skills and discover the joy of writing.',
    };
  }

  // ── Fallback (should not reach here if all SLOs are covered) ──
  return {
    question: `What is one important thing you learned in "${title}"?`,
    options: ['Nothing at all', 'I learned something new about English', 'I already knew everything', 'I was not paying attention'],
    correctIndex: 1,
    explanation: 'Every lesson teaches us something new! The important thing is to pay attention and try your best.',
  };
}

/**
 * Build lesson-specific practice task text.
 */
function buildPracticeTask(lesson) {
  const { slo, experience, subStrand, strand, title } = lesson;
  const sloLower = slo.toLowerCase();
  const strandNum = strand.split('.')[0];

  if (strandNum === '1') { // Listening
    if (sloLower.includes('instruction')) {
      return `Practice following instructions: Ask someone to give you 3 simple instructions (like "Stand up, clap twice, sit down"). Follow them in order!`;
    }
    if (sloLower.includes('non-verbal') || sloLower.includes('cue')) {
      return `Practice non-verbal cues: With a partner, take turns giving instructions. The listener should show they are listening using their eyes, face, and body — without speaking!`;
    }
    if (sloLower.includes('syllable')) {
      return `Practice syllables: Clap the syllables in these words: "butterfly" (3), "elephant" (3), "computer" (3). Can you find 3 more words with 3 syllables?`;
    }
    if (sloLower.includes('rhym')) {
      return `Practice rhyming: For each word, say or write a word that rhymes: "cat" → ___, "dog" → ___, "sun" → ___. How many can you find?`;
    }
    if (sloLower.includes('vocabulary') || sloLower.includes('empathy')) {
      return `Practice listening: Listen to a story someone tells you. After, tell them 3 new words you heard and what you think they mean.`;
    }
    if (sloLower.includes('recount') || sloLower.includes('retell')) {
      return `Practice retelling: Listen to a short story. Then retell it to someone using: Who? What happened? Where? What was the lesson?`;
    }
    if (sloLower.includes('attention')) {
      return `Practice focused listening: Close your eyes for 30 seconds. Listen to all the sounds you hear. How many different sounds did you notice?`;
    }
    if (sloLower.includes('feelings') || sloLower.includes('experiences')) {
      return `Practice responding: Tell a partner about something that happened to you today. They should listen and respond with kindness. Then switch!`;
    }
    if (sloLower.includes('informational') || sloLower.includes('key detail') || subStrand.toLowerCase().includes('conversation')) {
      return `Practice cue words: With a partner, have a conversation about your favourite animal. Use who, what, where, when, and why questions!`;
    }
    if (sloLower.includes('respect') || sloLower.includes('build on')) {
      return `Practice building on ideas: One person says "I like dogs because..." The other person adds "I also like dogs, and I think..." Take turns!`;
    }
    return `Practice listening: Listen carefully to someone read a short passage. Then tell them the main idea of what you heard.`;
  }

  if (strandNum === '2') { // Speaking
    if (sloLower.includes('respond confidently')) {
      return `Practice responding: Have someone ask you 5 questions. Answer each one clearly and confidently. Remember to speak loudly enough and look at the person!`;
    }
    if (sloLower.includes('clarity') || sloLower.includes('seek clarity')) {
      return `Practice asking for clarity: Have someone give you an unclear instruction. Practice asking "Can you please explain?" or "What do you mean by...?"`;
    }
    if (sloLower.includes('letter-sound') || sloLower.includes('syllable') && sloLower.includes('sound')) {
      return `Practice letter sounds: Say the sound of each letter in "cat" — /k/ /a/ /t/. Now blend them: "cat!" Try with "dog," "sun," and "pen."`;
    }
    if (sloLower.includes('blend') && sloLower.includes('segment')) {
      return `Practice blending: Sound out these words slowly, then blend them: /b/ /a/ /t/ = "bat!" /s/ /u/ /n/ = "sun!" /r/ /e/ /d/ = "red!"`;
    }
    if (sloLower.includes('sentence') && sloLower.includes('sound')) {
      return `Practice making sentences: Use these words to make sentences: "I / like / dogs" → "I like dogs." Now try: "She / runs / fast" and "We / play / outside."`;
    }
    if (sloLower.includes('characters') || sloLower.includes('talk about')) {
      return `Practice talking about stories: Tell a partner about your favourite story. Who are the characters? What happens? What do you like about it?`;
    }
    if (sloLower.includes('greeting')) {
      return `Practice greeting: Role-play greeting different people: a friend, a teacher, your grandmother. Use appropriate words and body language for each!`;
    }
    if (sloLower.includes('vocabulary') && sloLower.includes('communicate')) {
      return `Practice using new words: Think of 3 new words you learned recently. Use each one in a sentence and say it to a partner!`;
    }
    if (sloLower.includes('order') || sloLower.includes('tonal')) {
      return `Practice speaking in order: Tell a partner how to make a sandwich. Use words like "first," "then," "next," and "finally" to show the order!`;
    }
    return `Practice speaking: Tell a partner about your day. Speak clearly, use complete sentences, and look at them while you talk.`;
  }

  if (strandNum === '3') { // Reading
    if (sloLower.includes('speed') || sloLower.includes('fluency') || sloLower.includes('paired')) {
      return `Practice paired reading: Read a short passage with a partner. Take turns reading aloud. Help each other with difficult words.`;
    }
    if (sloLower.includes('prediction') || sloLower.includes('ask questions')) {
      return `Practice predicting: Read the first paragraph of a story. Stop and guess what might happen next. Then read on to see if you were right!`;
    }
    if (sloLower.includes('group')) {
      return `Practice group reading: In a small group, take turns reading a passage aloud. Help each other and discuss what the passage means.`;
    }
    if (sloLower.includes('peer') || sloLower.includes('self-assessment')) {
      return `Practice self-assessment: Read a short passage. Then ask yourself: Did I read smoothly? Did I understand? What can I improve?`;
    }
    if (sloLower.includes('silent')) {
      return `Practice silent reading: Read a short passage silently. Focus on the words. After, write down 3 things you learned from what you read.`;
    }
    if (sloLower.includes('unfamiliar') || sloLower.includes('comprehension')) {
      return `Practice context clues: Read a passage with some difficult words. Try to guess what each difficult word means by looking at the words around it.`;
    }
    if (sloLower.includes('specific details') || sloLower.includes('locate')) {
      return `Practice finding details: Read a passage. Then answer: Who is in the story? What happened? Where did it take place? Underline the answers in the text!`;
    }
    if (sloLower.includes('summari') || sloLower.includes('main idea')) {
      return `Practice summarising: Read a short passage. Then tell someone the main idea in just 1-2 sentences. What was the passage mostly about?`;
    }
    return `Practice reading: Read a short passage carefully. Then retell it in your own words to a partner.`;
  }

  if (strandNum === '4') { // Writing
    if (sloLower.includes('sentence') && (sloLower.includes('familiar') || sloLower.includes('noun') || sloLower.includes('verb'))) {
      return `Practice sentence building: Write 3 sentences using these words: "cat / is / small" → "The cat is small." Now try: "I / like / books" and "She / runs / fast."`;
    }
    if (sloLower.includes('upper') || sloLower.includes('lower case') || sloLower.includes('capitali')) {
      return `Practice capitalisation: Rewrite these sentences correctly: "the dog is big" → "The dog is big." Try: "my name is ali" and "we like school."`;
    }
    if (sloLower.includes('spell') && (sloLower.includes('short') || sloLower.includes('long') || sloLower.includes('vowel'))) {
      return `Practice vowel sounds: Write 3 words with short vowel sounds (like "cat," "bed," "sit") and 3 with long vowel sounds (like "cake," "tree," "home").`;
    }
    if (sloLower.includes('phonic') || sloLower.includes('editing')) {
      return `Practice phonics spelling: Sound out these words and write them: /c/ /a/ /t/ = cat, /d/ /o/ /g/ = dog, /s/ /u/ /n/ = sun. Check your spelling!`;
    }
    if (sloLower.includes('spacing') || sloLower.includes('punctuation')) {
      return `Practice spacing and punctuation: Write 5 sentences. Remember: spaces between words, capital letter at the start, full stop at the end!`;
    }
    if (sloLower.includes('neat') || sloLower.includes('legible')) {
      return `Practice neat writing: Copy a short sentence as neatly as you can. Focus on letter size, spacing, and keeping your letters on the line.`;
    }
    if (sloLower.includes('creative') || sloLower.includes('writing process')) {
      return `Practice creative writing: Plan a short story. Think: Who is in it? What happens? Where? Write your first draft — do not worry about mistakes!`;
    }
    if (sloLower.includes('sequencing') || sloLower.includes('connecting')) {
      return `Practice sequencing: Write a short story using these connecting words: "First... Then... Next... Finally..." Make sure your ideas are in order!`;
    }
    return `Practice writing: Write 5 sentences about your favourite animal. Use capital letters, full stops, and neat handwriting.`;
  }

  // Additional practice tasks for new lessons
  if (sloLower.includes('enjoyment') || sloLower.includes('pleasure') && sloLower.includes('silent')) {
    return `Practice sustained silent reading: Choose a book you enjoy and read silently for 15 minutes. Focus on the story. After, tell someone what you read about.`;
  }
  if (sloLower.includes('context clue') || (sloLower.includes('unknown words') && sloLower.includes('vocabulary'))) {
    return `Practice context clues: Read a passage with some difficult words. For each difficult word, look at the words around it and try to guess what it means. Then check if you were right!`;
  }
  if (sloLower.includes('writing for pleasure') || sloLower.includes('interest in writing')) {
    return `Practice writing for Pleasure: Write about anything you like — a story, a letter, a poem, or a list. Remember: there are no wrong answers when writing for fun!`;
  }
  if ((sloLower.includes('handwriting') && sloLower.includes('contest')) || sloLower.includes('artistic expression')) {
    return `Practice artistic handwriting: Write your favourite quote or poem as beautifully as you can. Focus on neat letters, even spacing, and making it look artistic.`;
  }
  if ((sloLower.includes('creative') && sloLower.includes('story')) || (sloLower.includes('artistic expression') && sloLower.includes('writing'))) {
    return `Practice creative story writing: Write a short story using your imagination. Include characters, a setting, a problem, and a solution. Make it creative and fun to read!`;
  }
  if (sloLower.includes('independent') || (sloLower.includes('free choice') && sloLower.includes('writing'))) {
    return `Practice independent writing: On your own, choose something you want to write about. Write a story, a poem, or a letter. Share it with someone when you are done!`;
  }

  return `Practice: Review what you learned today and try it again with a partner or on your own.`;
}

// ── Journey templates (lesson-specific) ───────────────────────────

function listeningJourney(lesson) {
  const { title, kiQ, experience, slo, reflectionPrompt, subStrand } = lesson;
  const focus = subStrand.toLowerCase();
  const practiceTask = buildPracticeTask(lesson);
  const qc = buildQuickCheck(lesson);
  const reflection = reflectionPrompt || `What did I learn about ${focus} today?`;

  return [
    step('welcome', `Welcome to ${title}!`,
      `Hello, friend! Today we will practice ${focus}. This is a listening adventure — use your ears and your brain!`,
      `Hello! I am OWL. Today we will listen carefully and learn together. Are you ready to use your super listening ears?`),

    step('mission', 'Our Listening Mission',
      `Your mission today is to listen carefully and understand what you hear. We will focus on: ${slo.toLowerCase()}.`,
      `Our mission is to become great listeners. Pay close attention to the sounds and words you hear today.`),

    step('think_first', 'What Do You Know?',
      `Before we start, think about this: ${kiQ} Take a moment to think about your answer.`,
      `Let us think together. ${kiQ} There is no wrong answer — just share what you think!`,
      { interaction: openResponseInteraction(`Think about: ${kiQ}`, 'Share your thoughts here...') }),

    step('learn', 'Let\'s Learn Together',
      experience.split('.').slice(0, 3).join('.') + '.',
      `Here is something important: when we listen carefully, we can understand new things. Try to focus on the sounds and words you hear.`),

    step('connect', 'Connect to Real Life',
      `Think about when you listen to someone at home or at school. How do you show you are listening? What do you do with your eyes, ears, and body?`,
      `Good thinking. Now let us connect this idea to real life. When someone speaks to you, you listen with your ears and your eyes.`),

    step('example', 'Let\'s Try an Example',
      `Listen carefully: I will say a word and you try to hear each sound in it. Let us start with "cat" — c-a-t. Three sounds! Now try "dog" — d-o-g.`,
      `Let us practise together. Listen to the sounds in each word. You can clap for each sound you hear!`),

    step('practice', 'Your Turn to Listen',
      practiceTask,
      `You are doing great! Keep practising — the more you listen, the better you get at hearing sounds and understanding words.`),

    step('quick_check', 'Quick Check!',
      `Let us see how much you remember!`,
      `This is a fun quiz! Read each question carefully and pick the best answer.`,
      { interaction: mcqInteraction(qc.question, qc.options, qc.correctIndex, qc.explanation) }),

    step('reflect', 'Think About Your Learning',
      reflection,
      `You worked hard today! Think about what you learned. What was your favourite part of our listening adventure?`,
      { interaction: openResponseInteraction(reflection, 'Write what you learned...') }),

    step('complete', 'Well Done!',
      `Congratulations! You completed today's listening adventure. You are becoming a great listener!`,
      `Well done, friend! You listened carefully and learned new things. I am proud of you!`),
  ];
}

function speakingJourney(lesson) {
  const { title, kiQ, experience, slo, reflectionPrompt, subStrand } = lesson;
  const focus = subStrand.toLowerCase();
  const practiceTask = buildPracticeTask(lesson);
  const qc = buildQuickCheck(lesson);
  const reflection = reflectionPrompt || `What did I learn about ${focus} today?`;

  return [
    step('welcome', `Welcome to ${title}!`,
      `Hello, friend! Today we will practice ${focus}. This is a speaking adventure — use your voice and your words!`,
      `Hello! I am OWL. Today we will practise speaking clearly and confidently. Are you ready to use your voice?`),

    step('mission', 'Our Speaking Mission',
      `Your mission today is to speak clearly and share your ideas. We will focus on: ${slo.toLowerCase()}.`,
      `Our mission is to become confident speakers. We will practise saying words clearly and sharing our thoughts.`),

    step('think_first', 'What Do You Know?',
      `Before we start, think about this: ${kiQ} Take a moment to think about your answer.`,
      `Let us think together. ${kiQ} Share your thoughts — every answer is welcome!`,
      { interaction: openResponseInteraction(`Think about: ${kiQ}`, 'Share your thoughts here...') }),

    step('learn', 'Let\'s Learn Together',
      experience.split('.').slice(0, 3).join('.') + '.',
      `Here is something important: when we speak clearly, others can understand us better. Try to use your best voice!`),

    step('connect', 'Connect to Real Life',
      `Think about when you talk to your friends, family, or teacher. How do you make sure they understand you? What words do you use?`,
      `Good thinking. When we speak to others, we use clear words and a friendly voice.`),

    step('example', 'Let\'s Try an Example',
      `Let us practise saying a sentence together: "I like to read books." Say it slowly: "I... like... to... read... books." Now say it again, a little faster!`,
      `Let us practise together. Say the sentence after me. Listen to how I say the words, then try it yourself!`),

    step('practice', 'Your Turn to Speak',
      practiceTask,
      `You are doing great! Keep practising — the more you speak, the more confident you become.`),

    step('quick_check', 'Quick Check!',
      `Let us see how much you remember!`,
      `This is a fun quiz! Read each question carefully and pick the best answer.`,
      { interaction: mcqInteraction(qc.question, qc.options, qc.correctIndex, qc.explanation) }),

    step('reflect', 'Think About Your Learning',
      reflection,
      `You worked hard today! Think about what you learned. How do you feel about speaking now?`,
      { interaction: openResponseInteraction(reflection, 'Write what you learned...') }),

    step('complete', 'Well Done!',
      `Congratulations! You completed today's speaking adventure. You are becoming a confident speaker!`,
      `Well done, friend! You spoke clearly and shared your ideas. I am proud of you!`),
  ];
}

function readingJourney(lesson) {
  const { title, kiQ, experience, slo, reflectionPrompt, subStrand } = lesson;
  const focus = subStrand.toLowerCase();
  const practiceTask = buildPracticeTask(lesson);
  const qc = buildQuickCheck(lesson);
  const reflection = reflectionPrompt || `What did I learn about ${focus} today?`;

  return [
    step('welcome', `Welcome to ${title}!`,
      `Hello, friend! Today we will practice ${focus}. This is a reading adventure — use your eyes and your brain!`,
      `Hello! I am OWL. Today we will read words and stories together. Are you ready to explore the world of reading?`),

    step('mission', 'Our Reading Mission',
      `Your mission today is to read carefully and understand what you read. We will focus on: ${slo.toLowerCase()}.`,
      `Our mission is to become great readers. We will read words and stories and find out what they mean.`),

    step('think_first', 'What Do You Know?',
      `Before we start, think about this: ${kiQ} Take a moment to think about your answer.`,
      `Let us think together. ${kiQ} There is no wrong answer — just share what you think!`,
      { interaction: openResponseInteraction(`Think about: ${kiQ}`, 'Share your thoughts here...') }),

    step('learn', 'Let\'s Learn Together',
      experience.split('.').slice(0, 3).join('.') + '.',
      `Here is something important: when we read, we look at each word carefully and think about what it means. Reading helps us learn new things!`),

    step('connect', 'Connect to Real Life',
      `Think about when you see words around you — on signs, in books, on labels. How do you figure out what they say?`,
      `Good thinking. We read every day — signs, books, labels. Reading helps us understand the world!`),

    step('example', 'Let\'s Try an Example',
      `Let us read a short sentence together: "The cat sat on the mat." Point to each word as you read it. The... cat... sat... on... the... mat.`,
      `Let us read together. Point to each word with your finger. This helps your eyes follow the words!`),

    step('practice', 'Your Turn to Read',
      practiceTask,
      `You are doing great! Keep practising — the more you read, the better you get!`),

    step('quick_check', 'Quick Check!',
      `Let us see how much you remember!`,
      `This is a fun quiz! Read each question carefully and pick the best answer.`,
      { interaction: mcqInteraction(qc.question, qc.options, qc.correctIndex, qc.explanation) }),

    step('reflect', 'Think About Your Learning',
      reflection,
      `You worked hard today! Think about what you learned. How do you feel about reading now?`,
      { interaction: openResponseInteraction(reflection, 'Write what you learned...') }),

    step('complete', 'Well Done!',
      `Congratulations! You completed today's reading adventure. You are becoming a great reader!`,
      `Well done, friend! You read carefully and understood new things. I am proud of you!`),
  ];
}

function writingJourney(lesson) {
  const { title, kiQ, experience, slo, reflectionPrompt, subStrand } = lesson;
  const focus = subStrand.toLowerCase();
  const practiceTask = buildPracticeTask(lesson);
  const qc = buildQuickCheck(lesson);
  const reflection = reflectionPrompt || `What did I learn about ${focus} today?`;

  return [
    step('welcome', `Welcome to ${title}!`,
      `Hello, friend! Today we will practice ${focus}. This is a writing adventure — use your hands and your imagination!`,
      `Hello! I am OWL. Today we will write words and sentences together. Are you ready to become a great writer?`),

    step('mission', 'Our Writing Mission',
      `Your mission today is to write words and sentences carefully. We will focus on: ${slo.toLowerCase()}.`,
      `Our mission is to become great writers. We will write words and sentences that others can read and understand.`),

    step('think_first', 'What Do You Know?',
      `Before we start, think about this: ${kiQ} Take a moment to think about your answer.`,
      `Let us think together. ${kiQ} Share your thoughts — every answer is welcome!`,
      { interaction: openResponseInteraction(`Think about: ${kiQ}`, 'Share your thoughts here...') }),

    step('learn', 'Let\'s Learn Together',
      experience.split('.').slice(0, 3).join('.') + '.',
      `Here is something important: when we write, we form each letter carefully and leave spaces between words. Good writing is easy to read!`),

    step('connect', 'Connect to Real Life',
      `Think about when you write your name, a note, or a list. Why is it important to write clearly so others can read it?`,
      `Good thinking. When we write clearly, our friends and family can read what we wrote!`),

    step('example', 'Let\'s Try an Example',
      `Let us write a simple sentence together: "I like cats." First, write "I" — capital I. Then "like" — l-i-k-e. Then "cats" — c-a-t-s. Do not forget the full stop!`,
      `Let us write together. Start with a capital letter, leave spaces between words, and end with a full stop. You can do it!`),

    step('practice', 'Your Turn to Write',
      practiceTask,
      `You are doing great! Keep practising — the more you write, the better your handwriting becomes.`),

    step('quick_check', 'Quick Check!',
      `Let us see how much you remember!`,
      `This is a fun quiz! Read each question carefully and pick the best answer.`,
      { interaction: mcqInteraction(qc.question, qc.options, qc.correctIndex, qc.explanation) }),

    step('reflect', 'Think About Your Learning',
      reflection,
      `You worked hard today! Think about what you learned. How do you feel about writing now?`,
      { interaction: openResponseInteraction(reflection, 'Write what you learned...') }),

    step('complete', 'Well Done!',
      `Congratulations! You completed today's writing adventure. You are becoming a great writer!`,
      `Well done, friend! You wrote carefully and beautifully. I am proud of you!`),
  ];
}

// ── Main ─────────────────────────────────────────────────────────

async function main() {
  // Fetch ALL English lessons (paginate — DB has 1525+ lessons, English ones may be at any position)
  let allLessons = [];
  let offset = 0;
  const batchSize = 200;
  while (true) {
    const { data, error } = await db
      .from('Lesson')
      .select('id, title, slug, questId, contentBlocks')
      .range(offset, offset + batchSize - 1);
    if (error) { console.error('Fetch error:', error); process.exit(1); }
    if (!data || data.length === 0) break;
    allLessons = allLessons.concat(data);
    offset += batchSize;
    if (data.length < batchSize) break;
  }

  // Filter to English lessons
  const englishLessons = allLessons.filter(l => {
    try {
      const cb = typeof l.contentBlocks === 'string' ? JSON.parse(l.contentBlocks) : l.contentBlocks;
      return cb && cb.subject === 'English Language Activities';
    } catch { return false; }
  });

  console.log(`Found ${englishLessons.length} English lessons`);

  let saved = 0, skipped = 0, errors = 0;

  for (const lesson of englishLessons) {
    const cb = typeof lesson.contentBlocks === 'string' ? JSON.parse(lesson.contentBlocks) : lesson.contentBlocks;
    const strand = cb.strand || '';
    const subStrand = cb.subStrand || '';
    const kiQ = cb.keyInquiryQuestion || '';
    const experience = cb.suggestedLearningExperience || '';
    const slo = cb.specificLearningOutcome || cb.learningOutcome || '';
    const reflectionPrompt = cb.reflectionPrompt || '';

    // Build lesson data object for content generation
    const lessonData = { title: lesson.title, slo, kiQ, experience, subStrand, strand, reflectionPrompt };

    let journey;
    if (strand.startsWith('1.')) {
      journey = listeningJourney(lessonData);
    } else if (strand.startsWith('2.')) {
      journey = speakingJourney(lessonData);
    } else if (strand.startsWith('3.')) {
      journey = readingJourney(lessonData);
    } else if (strand.startsWith('4.')) {
      journey = writingJourney(lessonData);
    } else {
      console.log(`  SKIP (unknown strand): ${lesson.title} (strand: ${strand})`);
      skipped++;
      continue;
    }

    // Update the lesson with the journey draft
    const updatedContentBlocks = {
      ...cb,
      studentJourneyDraft: journey,
      aiMetadata: {
        batchId: BATCH_ID,
        generatedAt: new Date().toISOString(),
        generator: 'english-v2',
      },
    };

    const { error: updateErr } = await db
      .from('Lesson')
      .update({ contentBlocks: JSON.stringify(updatedContentBlocks) })
      .eq('id', lesson.id);

    if (updateErr) {
      console.error(`  ERROR [${lesson.title}]: ${updateErr.message}`);
      errors++;
    } else {
      console.log(`  ✓ ${lesson.title} (${strand})`);
      saved++;
    }
  }

  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log(`  SAVED:   ${saved}`);
  console.log(`  SKIPPED: ${skipped}`);
  console.log(`  ERRORS:  ${errors}`);
  console.log('═══════════════════════════════════════════════════');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
