#!/usr/bin/env node
/**
 * Fix all 90 Grade 2 English theme-based journeys:
 * Remove technical metadata (strand codes, sub-strand titles) from student-facing text.
 * Replace with warm, simple, age-appropriate language derived from lesson title only.
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
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
  envVars[key] = val;
});
const { createClient } = require('@supabase/supabase-js');
const db = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY);

function step(type, title, student, owl, extra) {
  return { id: type, stepType: type, title, studentText: student, owlText: owl, visualType: 'owl_teacher', interaction: { type: 'none' }, media: {}, ...extra };
}
function mcq(q, opts, correct, expl) { return { type: 'multiple_choice', question: q, options: opts, correctIndex: correct, explanation: expl }; }
function openResp(p) { return { type: 'open_response', prompt: p, placeholder: 'Type your answer here...' }; }

// Map lesson titles to child-friendly descriptions — NO technical metadata
function getFriendlyContext(title) {
  const t = title.toLowerCase();
  
  // Listening and Speaking
  if (t.includes('key idea') || t.includes('listening for')) {
    return { focus: 'listening carefully and understanding what we hear', skill: 'listening', emoji: '👂' };
  }
  if (t.includes('vocabulary') || t.includes('pronunciation')) {
    return { focus: 'learning new words and saying them correctly', skill: 'words and sounds', emoji: '🗣️' };
  }
  if (t.includes('verb') || t.includes('was') || t.includes('were') || t.includes('grammar')) {
    return { focus: 'learning how to use words correctly in sentences', skill: 'building sentences', emoji: '✏️' };
  }
  if (t.includes('polite') || t.includes('please') || t.includes('thank')) {
    return { focus: 'using kind and polite words', skill: 'being polite', emoji: '🤝' };
  }
  if (t.includes('instruction') || t.includes('follow')) {
    return { focus: 'listening to and following instructions', skill: 'following directions', emoji: '👂' };
  }
  if (t.includes('conversation') || t.includes('question')) {
    return { focus: 'asking and answering questions', skill: 'conversation', emoji: '💬' };
  }
  if (t.includes('object pronoun') || t.includes('him') || t.includes('her')) {
    return { focus: 'learning special words like him, her, them, and us', skill: 'using words correctly', emoji: '📝' };
  }
  if (t.includes('continuous') || t.includes('past tense') || t.includes('was') && t.includes('ing')) {
    return { focus: 'talking about things that were happening', skill: 'telling stories about the past', emoji: '📖' };
  }
  if (t.includes('have') || t.includes('has') || t.includes('had')) {
    return { focus: 'learning to use have, has, and had', skill: 'using words correctly', emoji: '📝' };
  }
  if (t.includes('plural') || t.includes('irregular') || t.includes('-ies') || t.includes('-ves')) {
    return { focus: 'learning how to make words mean more than one', skill: 'making plurals', emoji: '📝' };
  }
  if (t.includes('article') || t.includes('a, an') || t.includes('the')) {
    return { focus: 'learning to use a, an, and the correctly', skill: 'using small words', emoji: '📝' };
  }
  if (t.includes('preposition') || t.includes('beside') || t.includes('above') || t.includes('under')) {
    return { focus: 'learning words that show where things are', skill: 'words for places', emoji: '📍' };
  }
  if (t.includes('possessive') || t.includes('mine') || t.includes('yours')) {
    return { focus: 'learning words that show belonging', skill: 'showing what belongs to us', emoji: '📝' };
  }
  if (t.includes('wh-question') || t.includes('what') || t.includes('where') || t.includes('when')) {
    return { focus: 'learning to ask good questions with who, what, where, when, and why', skill: 'asking questions', emoji: '❓' };
  }
  if (t.includes('conjunction') || t.includes('and, but') || t.includes('because')) {
    return { focus: 'learning to join words together with and, but, and because', skill: 'joining words', emoji: '📝' };
  }
  if (t.includes('describing') || t.includes('size') || t.includes('colour') || t.includes('shape')) {
    return { focus: 'learning words that describe things — how big, what color, what shape', skill: 'describing things', emoji: '🎨' };
  }
  if (t.includes('cardinal') || t.includes('ordinal') || t.includes('number')) {
    return { focus: 'learning about numbers — first, second, third, and counting', skill: 'numbers', emoji: '🔢' };
  }
  if (t.includes('word set') || t.includes('gender') || t.includes('opposite')) {
    return { focus: 'learning about words that go together and words that are opposites', skill: 'matching words', emoji: '📝' };
  }
  if (t.includes('present continuous') || t.includes('ing') && t.includes('tense')) {
    return { focus: 'talking about things happening right now', skill: 'telling what is happening', emoji: '📝' };
  }
  
  // Reading
  if (t.includes('reading') || t.includes('read')) {
    if (t.includes('fluency') || t.includes('read aloud')) {
      return { focus: 'reading smoothly and clearly', skill: 'reading aloud', emoji: '📖' };
    }
    if (t.includes('comprehension') || t.includes('understand') || t.includes('detail')) {
      return { focus: 'understanding what we read', skill: 'understanding stories', emoji: '📖' };
    }
    if (t.includes('silent')) {
      return { focus: 'reading quietly in our heads', skill: 'silent reading', emoji: '📖' };
    }
    if (t.includes('phonics') || t.includes('blend') || t.includes('sound')) {
      return { focus: 'sounding out words and putting sounds together', skill: 'sounding out words', emoji: '🔤' };
    }
    if (t.includes('sight word') || t.includes('high-frequency')) {
      return { focus: 'learning words we see very often', skill: 'quick words', emoji: '👀' };
    }
    return { focus: 'reading and understanding stories', skill: 'reading', emoji: '📖' };
  }
  
  // Writing
  if (t.includes('writing') || t.includes('write') || t.includes('handwriting')) {
    if (t.includes('handwriting') || t.includes('letter formation') || t.includes('spacing') || t.includes('punctuation')) {
      return { focus: 'writing letters and words neatly', skill: 'neat writing', emoji: '✏️' };
    }
    if (t.includes('sentence') || t.includes('compose') || t.includes('composition')) {
      return { focus: 'writing our own sentences', skill: 'writing sentences', emoji: '✏️' };
    }
    if (t.includes('spelling') || t.includes('spell')) {
      return { focus: 'learning to spell words correctly', skill: 'spelling', emoji: '📝' };
    }
    if (t.includes('creative') || t.includes('story') || t.includes('narrative')) {
      return { focus: 'writing our own creative stories', skill: 'story writing', emoji: '📝' };
    }
    if (t.includes('guided') || t.includes('complete') || t.includes('fill')) {
      return { focus: 'completing sentences and filling in missing words', skill: 'finishing sentences', emoji: '✏️' };
    }
    return { focus: 'writing words and sentences', skill: 'writing', emoji: '✏️' };
  }
  
  // Integrated
  if (t.includes('integrated') || t.includes('review') || t.includes('assessment')) {
    return { focus: 'practicing all our English skills together', skill: 'English practice', emoji: '🌟' };
  }
  
  // Default
  return { focus: 'learning new things in English', skill: 'English', emoji: '📚' };
}

function buildJourney(title) {
  const ctx = getFriendlyContext(title);
  const emoji = ctx.emoji;
  const focus = ctx.focus;
  const skill = ctx.skill;
  
  const isRead = title.toLowerCase().includes('reading') || title.toLowerCase().includes('read') || title.toLowerCase().includes('phonics') || title.toLowerCase().includes('sight word') || title.toLowerCase().includes('fluency');
  const isWrite = title.toLowerCase().includes('writing') || title.toLowerCase().includes('write') || title.toLowerCase().includes('handwriting') || title.toLowerCase().includes('spelling') || title.toLowerCase().includes('sentence');
  
  const welcomeStudent = `Hello, friend! ${emoji} Today we will ${focus}. Are you ready to learn and have fun?`;
  const welcomeOwl = `Hello! I am OWL. Today we will practice ${skill} together. Let us begin!`;
  
  const qc = buildQC(title);
  const practice = buildPractice(title);
  
  return [
    step('welcome', `Welcome to ${title}!`, welcomeStudent, welcomeOwl),
    step('mission', `Our Mission`, `Your mission today is to ${focus}. We will work together and try our best!`, `Our mission is to become great at ${skill}. Pay close attention and have fun!`),
    step('think_first', 'What Do You Know?', `Before we start, think about this: What do you already know about ${skill}? Take a moment to think about it.`, `Let us think together. What do you already know about ${skill}? There is no wrong answer!`, { interaction: openResp(`What do you know about ${skill}?`) }),
    step('learn', "Let's Learn Together", `Today we will learn about ${skill}. ${focus.charAt(0).toUpperCase() + focus.slice(1)}. Let us start!`, `Here is something important: when we practice ${skill}, we get better every day. Try your best!`),
    step('connect', 'Connect to Real Life', `Think about when you use ${skill} at home or at school. How can you practice more?`, `Good thinking. We use English every day — when we talk, read, and write. Practice makes perfect!`),
    step('example', "Let's Try an Example", `Let me show you an example. Watch carefully, then you will try it yourself!`, `Pay attention to this example. I will show you how it is done, then it is your turn!`),
    step('practice', 'Your Turn', practice, `You are doing great! Keep practising — the more you try, the better you get.`),
    step('quick_check', 'Quick Check!', `Let us see how much you remember!`, `This is a fun quiz! Read each question carefully and pick the best answer.`, { interaction: mcq(qc.question, qc.options, qc.correctIndex, qc.explanation) }),
    step('reflect', 'Think About Your Learning', `What did you learn about ${skill} today? Write your answer.`, `You worked hard today! Think about what you learned. What was your favourite part?`, { interaction: openResp(`What did you learn about ${skill} today?`) }),
    step('complete', 'Well Done!', `Congratulations! You completed today's lesson. You are becoming great at ${skill}!`, `Well done, friend! You worked hard and learned new things. I am proud of you!`),
  ];
}

function buildQC(title) {
  const t = title.toLowerCase();
  const q = (question, options, correct, explanation) => ({ question, options, correctIndex: correct, explanation });
  
  if (t.includes('key idea') || t.includes('listening for')) return q('What is most important when listening?', ['Look around the room', 'Focus on what the speaker is saying', 'Think about something else', 'Talk to a friend'], 1, 'We focus on the speaker to understand key ideas!');
  if (t.includes('vocabulary') || t.includes('pronunciation')) return q('Why is it important to pronounce words correctly?', ['It is not important', 'So others can understand us clearly', 'To speak faster', 'To sound funny'], 1, 'Correct pronunciation helps others understand us!');
  if (t.includes('verb') || t.includes('was') || t.includes('were')) return q('Which sentence is correct?', ['She were happy', 'She was happy', 'She be happy', 'She is were happy'], 1, 'We use "was" with one person and "were" with many!');
  if (t.includes('polite') || t.includes('please')) return q('Which is a polite thing to say?', ['Give me that!', 'Please may I have that?', 'I want it now!', 'Hurry up!'], 1, 'Using "please" and "may I" shows good manners!');
  if (t.includes('instruction')) return q('When someone gives you instructions, what should you do first?', ['Start doing the last thing', 'Listen carefully to all the instructions', 'Close your eyes', 'Sing a song'], 1, 'Listen carefully to all the instructions first!');
  if (t.includes('conversation') || t.includes('wh-question')) return q('What are good words to ask questions?', ['Run, jump, play', 'Who, what, where, when, why', 'Red, blue, green', 'Big, small, tall'], 1, 'Who, what, where, when, and why help us ask good questions!');
  if (t.includes('object pronoun') || t.includes('him') || t.includes('her')) return q('Which word can replace "the boy" in a sentence?', ['Him', 'The', 'Is', 'Run'], 1, 'We use "him" to replace "the boy" in a sentence!');
  if (t.includes('continuous') || t.includes('past tense')) return q('Which sentence uses past continuous correctly?', ['She was walking to school', 'She walk to school', 'She walking to school', 'She is walk'], 1, 'Past continuous uses "was/were" + verb-ing!');
  if (t.includes('have') || t.includes('has') || t.includes('had')) return q('Which is correct?', ['I has a book', 'I have a book', 'I having a book', 'I is have a book'], 1, 'We say "I have" — "have" goes with I, you, we, they!');
  if (t.includes('plural') || t.includes('irregular')) return q('What is the plural of "baby"?', ['Babys', 'Babies', 'Babyes', 'Babys'], 1, 'When a word ends in consonant + y, we change y to i and add -es: babies!');
  if (t.includes('article') || t.includes('a, an')) return q('Which is correct?', ['I saw an cat', 'I saw a cat', 'I saw cat', 'I saw the a cat'], 1, 'We use "a" before consonant sounds and "an" before vowel sounds!');
  if (t.includes('preposition') || t.includes('beside') || t.includes('above')) return q('Where is the cat if it is "under" the table?', ['On top of the table', 'Below the table', 'Next to the table', 'Above the table'], 1, '"Under" means below something!');
  if (t.includes('possessive') || t.includes('mine')) return q('Which word shows something belongs to me?', ['Your', 'Mine', 'Him', 'Them'], 1, '"Mine" shows something belongs to me!');
  if (t.includes('conjunction') || t.includes('because')) return q('Which word can join two sentences together?', ['Run', 'Because', 'Blue', 'Jump'], 1, '"Because" joins sentences and tells us why!');
  if (t.includes('describing') || t.includes('size') || t.includes('colour')) return q('Which word describes how big something is?', ['Run', 'Big', 'Jump', 'Blue'], 1, '"Big" describes the size of something!');
  if (t.includes('cardinal') || t.includes('ordinal') || t.includes('number')) return q('What comes after "first"?', ['Third', 'Second', 'Fourth', 'Fifth'], 1, 'The order is: first, second, third, fourth, fifth!');
  if (t.includes('word set') || t.includes('opposite')) return q('What is the opposite of "big"?', ['Tall', 'Small', 'Long', 'Wide'], 1, 'The opposite of "big" is "small"!');
  if (t.includes('reading') || t.includes('read')) {
    if (t.includes('fluency')) return q('What does it mean to read with fluency?', ['Reading as fast as possible', 'Reading smoothly with expression', 'Reading silently', 'Reading backwards'], 1, 'Fluency means reading smoothly at a good pace with expression!');
    if (t.includes('comprehension')) return q('What does it mean to comprehend what you read?', ['To read very fast', 'To understand the meaning of the text', 'To memorize every word', 'To skip the hard parts'], 1, 'Comprehension means understanding what we read!');
    if (t.includes('silent')) return q('What is important when reading silently?', ['Reading out loud', 'Staying focused on the text', 'Moving around', 'Talking to a friend'], 1, 'When reading silently, we stay focused on the text!');
    if (t.includes('phonics') || t.includes('blend')) return q('What does it mean to blend sounds?', ['To separate sounds', 'To push sounds together to make a word', 'To write letters', 'To erase words'], 1, 'Blending pushes sounds together: c-a-t = "cat"!');
    if (t.includes('sight word')) return q('What are sight words?', ['Words that are very long', 'Common words we recognize quickly', 'Words in another language', 'Words we never see'], 1, 'Sight words are common words we recognize quickly!');
    return q('What is one important thing you learned about reading today?', ['Nothing', 'I learned something new about reading', 'I already knew everything', 'I was not paying attention'], 1, 'Every reading lesson makes us better readers!');
  }
  if (t.includes('writing') || t.includes('write')) {
    if (t.includes('handwriting') || t.includes('letter')) return q('What makes good handwriting?', ['Writing as fast as possible', 'Forming letters carefully with proper spacing', 'Using only capital letters', 'Writing very small'], 1, 'Careful letter formation with proper spacing makes writing easy to read!');
    if (t.includes('sentence')) return q('What makes a good sentence?', ['Just one word', 'Words that make sense, starting with a capital and ending with a full stop', 'Only pictures', 'A very long word'], 1, 'A good sentence has words that make sense, starts with a capital, and ends with a full stop!');
    if (t.includes('spelling')) return q('How can sounds help you spell a word?', ['They cannot help', 'Listen for each sound and write the letter', 'Just guess', 'Copy from a friend'], 1, 'Listen for each sound and write the letter: d-o-g = dog!');
    if (t.includes('creative') || t.includes('story')) return q('What makes a good creative story?', ['Copying from a book', 'Using imagination with a beginning, middle, and end', 'Writing only one sentence', 'Using only facts'], 1, 'Creative stories use imagination with a clear beginning, middle, and end!');
    return q('What is one important thing you learned about writing today?', ['Nothing', 'I learned something new about writing', 'I already knew everything', 'I was not paying attention'], 1, 'Every writing lesson makes us better writers!');
  }
  if (t.includes('integrated') || t.includes('review')) return q('What is the best way to show what you learned in English?', ['Keep it to yourself', 'Practice listening, speaking, reading, and writing', 'Only do one skill', 'Do not try'], 1, 'Practice all your English skills: listening, speaking, reading, and writing!');
  
  return q('What is one important thing you learned today?', ['Nothing', 'I learned something new', 'I already knew everything', 'I was not paying attention'], 1, 'Every lesson teaches us something new!');
}

function buildPractice(title) {
  const t = title.toLowerCase();
  if (t.includes('key idea') || t.includes('listening for')) return 'Practice: Listen to someone read a short passage. Tell them the main idea.';
  if (t.includes('vocabulary') || t.includes('pronunciation')) return 'Practice: Say these words out loud 5 times each. Ask someone to help.';
  if (t.includes('verb') || t.includes('grammar') || t.includes('was') || t.includes('were')) return 'Practice: Write 5 sentences using "was" or "were" correctly.';
  if (t.includes('polite')) return 'Practice: Role-play asking for something politely. Use "please" and "thank you".';
  if (t.includes('instruction')) return 'Practice: Ask someone to give 3 instructions. Follow them in order!';
  if (t.includes('conversation') || t.includes('wh-question')) return 'Practice: Have a conversation with a partner. Use who, what, where, when, and why questions!';
  if (t.includes('object pronoun')) return 'Practice: Write 5 sentences using him, her, them, you, us, or me.';
  if (t.includes('continuous') || t.includes('past tense')) return 'Practice: Write 5 sentences about what you were doing yesterday. Use "was" + verb-ing.';
  if (t.includes('have') || t.includes('has')) return 'Practice: Write 5 sentences using have, has, or had correctly.';
  if (t.includes('plural') || t.includes('irregular')) return 'Practice: Write the plural of these words: baby, box, child, leaf, mouse.';
  if (t.includes('article')) return 'Practice: Fill in the blanks with "a" or "an": ___ cat, ___ apple, ___ book, ___ egg.';
  if (t.includes('preposition')) return 'Practice: Draw a picture and label where things are: on, under, beside, above.';
  if (t.includes('possessive')) return 'Practice: Write 5 sentences using mine, yours, his, hers, ours, or theirs.';
  if (t.includes('conjunction')) return 'Practice: Join these sentences with "and", "but", or "because".';
  if (t.includes('describing')) return 'Practice: Describe your favorite toy. Tell its size, color, and shape.';
  if (t.includes('number') || t.includes('ordinal')) return 'Practice: Write the ordinal numbers from first to tenth.';
  if (t.includes('word set') || t.includes('opposite')) return 'Practice: Match these opposites: big-?, hot-?, up-?, happy-?.';
  if (t.includes('reading')) {
    if (t.includes('fluency')) return 'Practice: Read a short passage aloud 3 times. Try to read more smoothly each time.';
    if (t.includes('comprehension')) return 'Practice: Read a short passage. Answer: Who? What? Where? When?';
    if (t.includes('silent')) return 'Practice: Read silently for 10 minutes. Write down 3 things you learned.';
    if (t.includes('phonics')) return 'Practice: Sound out these words: cat, dog, sun, big, red.';
    if (t.includes('sight word')) return 'Practice: Write each sight word 3 times. Use each in a sentence.';
    return 'Practice: Read a passage carefully. Retell it in your own words.';
  }
  if (t.includes('writing')) {
    if (t.includes('handwriting')) return 'Practice: Copy a sentence neatly. Focus on letter size and spacing.';
    if (t.includes('sentence')) return 'Practice: Write 5 sentences about your favorite animal.';
    if (t.includes('spelling')) return 'Practice: Sound out and write: cat, dog, sun, big, red.';
    if (t.includes('creative')) return 'Practice: Write a short story with a beginning, middle, and end.';
    return 'Practice: Write 5 sentences about today. Use capitals and full stops.';
  }
  if (t.includes('integrated')) return 'Practice: Listen to a story, retell it, read a passage, write 3 sentences.';
  return 'Practice: Review what you learned today and try again.';
}

async function main() {
  const { data: themes } = await db.from('Theme').select('id').eq('slug', 'g2-english');
  if (!themes || !themes.length) { console.error('Theme not found'); process.exit(1); }
  const { data: quests } = await db.from('Quest').select('id').eq('themeId', themes[0].id);
  if (!quests || !quests.length) { console.error('No quests'); process.exit(1); }

  let all = [], off = 0;
  while (true) {
    const { data, error } = await db.from('Lesson').select('id, title, contentBlocks').in('questId', quests.map(q => q.id)).order('orderIndex').range(off, off + 199);
    if (error) { console.error(error); process.exit(1); }
    if (!data || !data.length) break;
    all = all.concat(data); off += 200;
    if (data.length < 200) break;
  }

  console.log('Fixing ' + all.length + ' English theme-based journeys...\n');

  let fixed = 0, skipped = 0;
  for (const l of all) {
    let meta = {};
    try { meta = JSON.parse(l.contentBlocks || '{}'); } catch {}

    // Check if current draft has technical language
    const currentDraft = meta.studentJourneyDraft || [];
    let needsFix = false;
    if (currentDraft.length > 0) {
      const firstStep = currentDraft[0];
      const text = (firstStep.studentText || '') + ' ' + (firstStep.owlText || '');
      // Check for technical metadata patterns
      if (/\d+\.\d+/.test(text) || // strand codes like 1.0, 2.3
          /strand/i.test(text) ||
          /sub.?strand/i.test(text) ||
          /listening and speaking/i.test(text) ||
          /integrated english/i.test(text)) {
        needsFix = true;
      }
    }

    if (!needsFix && currentDraft.length === 10) {
      skipped++;
      continue;
    }

    // Regenerate with clean text
    const journey = buildJourney(l.title);
    const upd = {
      ...meta,
      studentJourneyDraft: journey,
      aiMetadata: {
        ...(meta.aiMetadata || {}),
        batchId: 'grade-2-english-theme-fix-v2',
        generatedAt: new Date().toISOString(),
        generator: 'english-theme-v2-clean',
      },
    };

    const { error: e2 } = await db.from('Lesson').update({ contentBlocks: JSON.stringify(upd) }).eq('id', l.id);
    if (e2) { console.error('  ERROR [' + l.title + ']: ' + e2.message); }
    else { console.log('  ✓ ' + l.title); fixed++; }
  }

  console.log('\nFixed: ' + fixed + ' | Skipped (already clean): ' + skipped);
}
main().catch(e => { console.error(e); process.exit(1); });
