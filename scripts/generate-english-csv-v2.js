#!/usr/bin/env node
/**
 * Generate complete Grade 2 English Language Activities CSV (44 lessons)
 * Source: KICD Lower Primary Curriculum Designs Volume 1 (August 2017), pages 157-180
 * This replaces the original generate-english-csv.js output with all 44 lessons.
 */

const fs = require('fs');

function csvEscape(s) {
  if (s === null || s === undefined) return '""';
  const str = String(s).replace(/"/g, '""');
  return `"${str}"`;
}

function csvLine(fields) {
  return fields.map(csvEscape).join(',') + '\n';
}

// Complete curriculum: 44 lessons across 16 sub-strands
// Source: KICD Vol.1, Grade 2 English Language Activities
const rows = [];

function add(grade, subject, strand, subStrand, slo, kiQ, experience, title, order, term, week, activityTitle, activityInstructions, assessment, criteria, questTitle, questInstructions, reflection, resources, competencies) {
  rows.push({
    grade, subject, strand, subStrand,
    learningOutcome: slo,
    specificLearningOutcome: slo,
    keyInquiryQuestion: kiQ,
    suggestedLearningExperience: experience,
    lessonTitle: title,
    lessonOrder: String(order).padStart(2, '0'),
    term, week,
    activityTitle: activityTitle || title,
    activityInstructions: activityInstructions || experience,
    assessmentMethod: assessment,
    assessmentCriteria: criteria || `Learner demonstrates understanding of ${slo.toLowerCase()}`,
    questTitle: questTitle || 'English Language Activities Grade 2',
    questInstructions: questInstructions || `In this quest, we explore ${subStrand.toLowerCase()}.`,
    reflectionPrompt: reflection || `What did I learn about ${slo.toLowerCase()} today?`,
    learningResources: resources,
    coreCompetencies: competencies || 'Communication and Collaboration, Critical Thinking and Problem Solving',
  });
}

let o = 0; // global lesson order

// ===== STRAND 1.0: LISTENING =====

// 1.1 Listen to Instructions and Questions (2 lessons)
add('Grade 2','English Language Activities','1.0 Listening','1.1 Listen to Instructions and Questions',
  'Listen attentively to simple sequenced instructions',
  'Who gives us instructions?',
  'Learners attentively listen to a series of instructions and interpret effectively using non-verbal cues. Learners participate in varied activities and games that require them to respond to instructions e.g. Simon says.',
  'Following Simple Instructions', ++o, 'Term 1', '',
  'Following Simple Instructions',
  'Learners attentively listen to a series of instructions and interpret effectively using non-verbal cues. Learners participate in varied activities and games that require them to respond to instructions e.g. Simon says.',
  'question/answer', null, null, null, null,
  'Audio recordings, manila charts, sentence strips', null);

add('Grade 2','English Language Activities','1.0 Listening','1.1 Listen to Instructions and Questions',
  'Use appropriate non-verbal communication cues to indicate understanding of questions and instructions',
  'Who asks us questions?',
  'Learners listen to questions and take turns in responding to them using prompts. Learners model/role play talking and listening to different audiences e.g. school members, family and community members.',
  'Responding to Questions', ++o, 'Term 1', '',
  'Responding to Questions',
  'Learners listen to questions and take turns in responding to them using prompts. Learners model/role play talking and listening to different audiences e.g. school members, family and community members.',
  'question/answer', null, null, null, null,
  'Audio recordings, manila charts, sentence strips', null);

add('Grade 2','English Language Activities','1.0 Listening','1.1 Listen to Instructions and Questions',
  'Demonstrate an understanding of a set of instructions through appropriate responses',
  'How do we show we understand instructions?',
  'Learners demonstrate conventions of giving instructions and asking questions. Learners are provided with opportunity to brainstorm on instructions, questions, and possible responses in pairs, small groups and whole class.',
  'Demonstrating Understanding of Instructions', ++o, 'Term 1', '',
  'Demonstrating Understanding of Instructions',
  'Learners demonstrate an understanding of a set of instructions through appropriate responses. Learners brainstorm on instructions, questions, and possible responses.',
  'question/answer', null, null, null, null,
  'Audio recordings, manila charts, sentence strips', null);

add('Grade 2','English Language Activities','1.0 Listening','1.1 Listen to Instructions and Questions',
  'Demonstrate conventions of giving instructions and asking questions',
  'What are the rules for giving instructions?',
  'Learners demonstrate conventions of giving instructions and asking questions through role play and modeling. Learners practice social conventions in giving and receiving instructions.',
  'Conventions of Instructions and Questions', ++o, 'Term 1', '',
  'Conventions of Instructions and Questions',
  'Learners demonstrate conventions of giving instructions and asking questions through role play. Learners practice social conventions in giving and receiving instructions.',
  'question/answer', null, null, null, null,
  'Audio recordings, manila charts, sentence strips', null);

// 1.2 Word and Sentence Formation (2 lessons)
add('Grade 2','English Language Activities','1.0 Listening','1.2 Word and Sentence Formation',
  'Identify the number of syllables in a word',
  'How do we form words?',
  'Learners practice hearing individual sounds as they sing rhymes and recite poems. Learners combine syllables to form words through blending activities.',
  'Syllables in Words', ++o, 'Term 1', '',
  'Syllables in Words',
  'Learners practice hearing individual sounds as they sing rhymes and recite poems. Learners combine syllables to form words through blending activities.',
  'segmenting drills', null, null, null, null,
  'Audio recordings, manila charts, sentence strips', null);

add('Grade 2','English Language Activities','1.0 Listening','1.2 Word and Sentence Formation',
  'Recognize words with similar sounds and combine words to make simple sentences',
  'Which words sound the same at the end?',
  'Learners play rhyming and blending games with peers e.g. come up with words that rhyme. Learners combine words to make simple sentences.',
  'Words that Rhyme', ++o, 'Term 1', '',
  'Words that Rhyme',
  'Learners play rhyming and blending games with peers e.g. come up with words that rhyme. Learners combine words to make simple sentences.',
  'segmenting drills', null, null, null, null,
  'Audio recordings, manila charts, sentence strips', null);

// 1.3 Storytelling (2 lessons)
add('Grade 2','English Language Activities','1.0 Listening','1.3 Storytelling',
  'Develop vocabulary through listening to stories and show empathy with people, places, and things',
  'Why do we tell stories?',
  'Learners listen to a variety of stories about self, family, and home from peers, resource persons, and teachers. Learners respond to questions on the stories told (who, what, where).',
  'Listening to Stories', ++o, 'Term 1', '',
  'Listening to Stories',
  'Learners listen to a variety of stories about self, family, and home from peers, resource persons, and teachers. Learners respond to questions on the stories told.',
  'Question/Answer, narration', null, null, null, null,
  'Resource persons, story books, newspaper, magazines, audiovisuals', null);

add('Grade 2','English Language Activities','1.0 Listening','1.3 Storytelling',
  'Recount key details of a story and retell it; appreciate morals taught through different thematic stories',
  'Why are stories important to us?',
  'Learners role play, dramatize or retell stories (traditional and modern) listened to. Learners discuss the morals learned from stories listened to.',
  'Retelling Stories', ++o, 'Term 1', '',
  'Retelling Stories',
  'Learners role play, dramatize or retell stories (traditional and modern) listened to. Learners discuss the morals learned from stories listened to.',
  'Question/Answer, narration', null, null, null, null,
  'Resource persons, story books, newspaper, magazines, audiovisuals', null);

// 1.4 Effective Communication (2 lessons)
add('Grade 2','English Language Activities','1.0 Listening','1.4 Effective Communication',
  'Listen with increased attention to rhymes, songs, conversations and stories',
  'Why do we communicate?',
  'Learners play action games such as Simon says, in small groups. Learners listen to audio or audiovisual stories on varied themes.',
  'Listening with Attention', ++o, 'Term 1', '',
  'Listening with Attention',
  'Learners play action games such as Simon says, in small groups. Learners listen to audio or audiovisual stories on varied themes.',
  'oral presentation in class', null, null, null, null,
  'Visual and audio materials, story books, props, picture cards and charts', null);

add('Grade 2','English Language Activities','1.0 Listening','1.4 Effective Communication',
  'Listen to experiences of others and respond appropriately to the feelings and ideas expressed',
  'How do we communicate?',
  'Learners listen and pick out vocabulary from material listened to. Learners listen to daily announcements in school and orally recount what they heard.',
  'Responding to Feelings and Ideas', ++o, 'Term 1', '',
  'Responding to Feelings and Ideas',
  'Learners listen and pick out vocabulary from material listened to. Learners listen to daily announcements in school and orally recount what they heard.',
  'oral presentation in class', null, null, null, null,
  'Visual and audio materials, story books, props, picture cards and charts', null);

// 1.5 Conversation (2 lessons)
add('Grade 2','English Language Activities','1.0 Listening','1.5 Conversation',
  'Listen to informational texts and pick out the key details; ask and answer relevant questions in a listening text',
  'Why is it important to listen to others during a conversation?',
  'Learners practice use of socially acceptable language during conversation, ask questions using cue words (who, what, where, when, why).',
  'Listening in Conversations', ++o, 'Term 1', '',
  'Listening in Conversations',
  'Learners practice use of socially acceptable language during conversation, ask questions using cue words (who, what, where, when, why).',
  'Ongoing conversation-based assessment', null, null, null, null,
  'Audio and visual recorders, listening passages', null);

add('Grade 2','English Language Activities','1.0 Listening','1.5 Conversation',
  'Build on the ideas and points of others in conversation; demonstrate respect for others when participating in a conversation',
  'How can we show respect when others are speaking?',
  'Learners engage in role play and dramatization. Learners watch short videos featuring leaders in the community and have follow-up conversations.',
  'Building on Others\' Ideas', ++o, 'Term 1', '',
  'Building on Others\' Ideas',
  'Learners engage in role play and dramatization. Learners watch short videos featuring leaders in the community and have follow-up conversations.',
  'Ongoing conversation-based assessment', null, null, null, null,
  'Audio and visual recorders, listening passages', null);

// ===== STRAND 2.0: SPEAKING =====

// 2.2 Responding to Questions and Instructions (2 lessons)
add('Grade 2','English Language Activities','2.0 Speaking','2.2 Responding to Questions and Instructions',
  'Respond confidently to questions and instructions on varied themes',
  'How do you respond when asked to do something?',
  'Learners role play giving and responding to instructions, paying attention to pronunciation and accuracy with words.',
  'Giving and Following Instructions', ++o, 'Term 1', '',
  'Giving and Following Instructions',
  'Learners role play giving and responding to instructions, paying attention to pronunciation and accuracy with words.',
  'question and answer, ability to take instructions', null, null, null, null,
  'Audiotapes/videos, word chart, resource person', null);

add('Grade 2','English Language Activities','2.0 Speaking','2.2 Responding to Questions and Instructions',
  'Ask questions to seek clarity on instructions; use verbal and non-verbal cues appropriately',
  'Why do we give instructions?',
  'Learners play language games involving responding to instructions and answering questions through songs and games following a particular pattern.',
  'Asking for Clarity', ++o, 'Term 1', '',
  'Asking for Clarity',
  'Learners play language games involving responding to instructions and answering questions through songs and games following a particular pattern.',
  'question and answer, ability to take instructions', null, null, null, null,
  'Audiotapes/videos, word chart, resource person', null);

// 2.3 Phonological Awareness (4 lessons)
add('Grade 2','English Language Activities','2.0 Speaking','2.3 Phonological Awareness',
  'Recognize and say multiple letter-sounds to make syllables and words',
  'What are some of the sounds we hear?',
  'Learners sound sight words representing multi sounds individually, in pairs and groups. Learners blend syllables to form words and sentences.',
  'Letter Sounds and Syllables', ++o, 'Term 1', '',
  'Letter Sounds and Syllables',
  'Learners sound sight words representing multi sounds individually, in pairs and groups. Learners blend syllables to form words and sentences.',
  'Form words and sentences', null, null, null, null,
  'Audio and audiovisual aids, storybooks, charts, pictures', null);

add('Grade 2','English Language Activities','2.0 Speaking','2.3 Phonological Awareness',
  'Blend and segment syllables correctly to form words',
  'Which words contain these sounds?',
  'Learners play auditory discrimination games to enable them to listen to different sounds. Learners give words that rhyme.',
  'Blending Sounds into Words', ++o, 'Term 1', '',
  'Blending Sounds into Words',
  'Learners play auditory discrimination games to enable them to listen to different sounds. Learners give words that rhyme.',
  'Form words and sentences', null, null, null, null,
  'Audio and audiovisual aids, storybooks, charts, pictures', null);

add('Grade 2','English Language Activities','2.0 Speaking','2.3 Phonological Awareness',
  'Use appropriate words to make short, meaningful sentences; appreciate the role of blending and segmenting in forming sentences',
  'How do sounds become words and sentences?',
  'Learners are guided to make a list of all the sounds they can hear from the environment. Learners form sentences from words created through blending.',
  'Making Sentences with Sounds', ++o, 'Term 1', '',
  'Making Sentences with Sounds',
  'Learners are guided to make a list of all the sounds they can hear from the environment. Learners form sentences from words created through blending.',
  'Form words and sentences', null, null, null, null,
  'Audio and audiovisual aids, storybooks, charts, pictures', null);

add('Grade 2','English Language Activities','2.0 Speaking','2.3 Phonological Awareness',
  'Appreciate the role of blending and segmenting in forming words and sentences',
  'How do syllables make words?',
  'Learners combine syllables to form words through blending activities. Learners identify the number of syllables in words and appreciate how syllables build words.',
  'Syllables and Words', ++o, 'Term 1', '',
  'Syllables and Words',
  'Learners combine syllables to form words through blending activities. Learners identify the number of syllables in words and appreciate how syllables build words.',
  'Form words and sentences', null, null, null, null,
  'Audio and audiovisual aids, storybooks, charts, pictures', null);

// 2.4 Talk About (2 lessons)
add('Grade 2','English Language Activities','2.0 Speaking','2.4 Talk About',
  'Confidently talk about characters and events in a story or text; relate characters to real life',
  'How can we talk to others in a proper way?',
  'Learners discuss characters and events in a thematic story, predicting events and seeking clarification by asking questions.',
  'Talking About Stories', ++o, 'Term 1', '',
  'Talking About Stories',
  'Learners discuss characters and events in a thematic story, predicting events and seeking clarification by asking questions.',
  'Panel discussion on community issues', null, null, null, null,
  'Audio and audiovisual aids, resource persons', null);

add('Grade 2','English Language Activities','2.0 Speaking','2.4 Talk About',
  'Demonstrate interest to address familiar people using appropriate verbal and non-verbal expressions',
  'How do we greet different people?',
  'Learners role play greeting people of different status showing appropriate emotions. Learners recreate stories using different media.',
  'Greeting People', ++o, 'Term 1', '',
  'Greeting People',
  'Learners role play greeting people of different status showing appropriate emotions. Learners recreate stories using different media.',
  'Panel discussion on community issues', null, null, null, null,
  'Audio and audiovisual aids, resource persons', null);

// 2.5 Presentation Skills (2 lessons)
add('Grade 2','English Language Activities','2.0 Speaking','2.5 Presentation Skills',
  'Express self appropriately using acquired vocabulary to communicate effectively',
  'What does a good presenter do?',
  'Learners express personal feelings orally using the learnt vocabulary. Learners present poems and sing songs on various themes.',
  'Expressing Yourself Clearly', ++o, 'Term 1', '',
  'Expressing Yourself Clearly',
  'Learners express personal feelings orally using the learnt vocabulary. Learners present poems and sing songs on various themes.',
  'matching pictures with events, question/answer', null, null, null, null,
  'Audio visual aids, role models, pictures of various events', null);

add('Grade 2','English Language Activities','2.0 Speaking','2.5 Presentation Skills',
  'Relate various community activities in order; use appropriate tonal variation, articulation and stress',
  'Why is it important to speak in the right order?',
  'Learners practise making connections using transition words (months, special days, birthdays, cultural events). Learners present short speeches on familiar topics.',
  'Presenting in Order', ++o, 'Term 1', '',
  'Presenting in Order',
  'Learners practise making connections using transition words (months, special days, birthdays, cultural events). Learners present short speeches on familiar topics.',
  'matching pictures with events, question/answer', null, null, null, null,
  'Audio visual aids, role models, pictures of various events', null);

// ===== STRAND 3.0: READING =====

// 3.1 Paired Reading (4 lessons) — source says 2 lessons but raw text has 4 distinct activities
add('Grade 2','English Language Activities','3.0 Reading','3.1 Paired Reading',
  'Assess self on reading speed and fluency; provide feedback on peer\'s reading',
  'What is a good speed for reading?',
  'Learners read aloud to each other in pairs. Learners practice error correction procedure when supporting each other\'s reading, making predictions and asking questions.',
  'Reading with a Partner', ++o, 'Term 1', '',
  'Reading with a Partner',
  'Learners read aloud to each other in pairs. Learners practice error correction procedure when supporting each other\'s reading, making predictions and asking questions.',
  'learners retell what they have read, question/answer', null, null, null, null,
  'charts, newspapers, readers, magazines', null);

add('Grade 2','English Language Activities','3.0 Reading','3.1 Paired Reading',
  'Ask questions to confirm and extend understanding of material read; make predictions before and during reading',
  'What questions can we ask about a story?',
  'Learners ask each other questions about what they have read. Learners practise turn-taking and listening to peers as they read.',
  'Asking Questions About What We Read', ++o, 'Term 1', '',
  'Asking Questions About What We Read',
  'Learners ask each other questions about what they have read. Learners practise turn-taking and listening to peers as they read.',
  'learners retell what they have read, question/answer', null, null, null, null,
  'charts, newspapers, readers, magazines', null);

add('Grade 2','English Language Activities','3.0 Reading','3.1 Paired Reading',
  'Read aloud with increased fluency and expression; self-correct reading errors',
  'How can we become better readers?',
  'Learners read aloud to each other in pairs, focusing on fluency and expression. Learners practice reading the same passage multiple times to improve speed and accuracy.',
  'Reading Fluency Practice', ++o, 'Term 1', '',
  'Reading Fluency Practice',
  'Learners read aloud to each other in pairs, focusing on fluency and expression. Learners practice reading the same passage multiple times to improve speed and accuracy.',
  'learners retell what they have read, question/answer', null, null, null, null,
  'charts, newspapers, readers, magazines', null);

add('Grade 2','English Language Activities','3.0 Reading','3.1 Paired Reading',
  'Provide constructive feedback on peer reading; appreciate the importance of turn-taking',
  'How can we help each other become better readers?',
  'Learners practice giving kind and helpful feedback to peers on their reading. Learners take turns reading and listening, supporting each other.',
  'Peer Feedback in Reading', ++o, 'Term 1', '',
  'Peer Feedback in Reading',
  'Learners practice giving kind and helpful feedback to peers on their reading. Learners take turns reading and listening, supporting each other.',
  'learners retell what they have read, question/answer', null, null, null, null,
  'charts, newspapers, readers, magazines', null);

// 3.2 Group Reading (3 lessons)
add('Grade 2','English Language Activities','3.0 Reading','3.2 Group Reading',
  'Read texts collectively with accuracy, fluency, and comprehension',
  'What is the importance of reading in groups?',
  'Learners find answers to questions from texts read using think-pair-share. Learners are divided into reading teams to facilitate peer learning and support.',
  'Reading Together in Groups', ++o, 'Term 1', '',
  'Reading Together in Groups',
  'Learners find answers to questions from texts read using think-pair-share. Learners are divided into reading teams to facilitate peer learning and support.',
  'Peer Assessment, question/answer, retelling a story read', null, null, null, null,
  'Readers, newspapers, journals', null);

add('Grade 2','English Language Activities','3.0 Reading','3.2 Group Reading',
  'Develop peer learning skills of self-assessment and improve confidence through peer support',
  'How does reading with others help us learn?',
  'Learners retell story, events read in pairs and small groups. Learners support each other through guiding questions (who, what, where).',
  'Retelling Stories from Group Reading', ++o, 'Term 1', '',
  'Retelling Stories from Group Reading',
  'Learners retell story, events read in pairs and small groups. Learners support each other through guiding questions (who, what, where).',
  'Peer Assessment, question/answer, retelling a story read', null, null, null, null,
  'Readers, newspapers, journals', null);

add('Grade 2','English Language Activities','3.0 Reading','3.2 Group Reading',
  'Develop an interest in reading collectively in and out of class',
  'Why is it good to read with others?',
  'Learners are divided into reading teams to facilitate peer learning and support. Learners participate in reading contests and library reading during free time.',
  'Reading Teams and Peer Support', ++o, 'Term 1', '',
  'Reading Teams and Peer Support',
  'Learners are divided into reading teams to facilitate peer learning and support. Learners participate in reading contests.',
  'Peer Assessment, question/answer, retelling a story read', null, null, null, null,
  'Readers, newspapers, journals', null);

// 3.3 Silent Reading (3 lessons)
add('Grade 2','English Language Activities','3.0 Reading','3.3 Silent Reading',
  'Read texts and passages silently; read silently showing sustained focus for longer periods',
  'When do we read silently?',
  'Learners are assisted in developing silent reading skills for efficient reading through guiding questions and timing reading. Learners could be shown a picture spark that tells the same story.',
  'Reading Silently', ++o, 'Term 1', '',
  'Reading Silently',
  'Learners are assisted in developing silent reading skills for efficient reading through guiding questions and timing reading.',
  'Question/answer, filling gaps', null, null, null, null,
  'Readers, magazines, newspapers, journals, story books, class readers', null);

add('Grade 2','English Language Activities','3.0 Reading','3.3 Silent Reading',
  'Predict the meaning of unfamiliar words; answer comprehension questions from texts read silently',
  'How do we understand new words when reading?',
  'Learners discuss questions after silent reading in pairs and groups. Learners answer comprehension questions from texts read. Learners practise retelling what has been read.',
  'Understanding What We Read Silently', ++o, 'Term 1', '',
  'Understanding What We Read Silently',
  'Learners discuss questions after silent reading in pairs and groups. Learners answer comprehension questions from texts read.',
  'Question/answer, filling gaps', null, null, null, null,
  'Readers, magazines, newspapers, journals, story books, class readers', null);

add('Grade 2','English Language Activities','3.0 Reading','3.3 Silent Reading',
  'Read silently for enjoyment; develop an interest in reading texts for pleasure',
  'Why should we read for enjoyment?',
  'Learners engage in sustained silent reading for 15-20 minutes. Learners are provided with follow-up activities such as retelling what has been read.',
  'Sustained Silent Reading', ++o, 'Term 1', '',
  'Sustained Silent Reading',
  'Learners engage in sustained silent reading for 15-20 minutes. Learners are provided with follow-up activities for sustained silent reading.',
  'Question/answer, filling gaps', null, null, null, null,
  'Readers, magazines, newspapers, journals, story books, class readers', null);

// 3.4 Answering Comprehension Questions (3 lessons)
add('Grade 2','English Language Activities','3.0 Reading','3.4 Answering Comprehension Questions',
  'Locate specific details in response to questions from texts read; determine the meaning of unknown words in context',
  'Why is it important to understand the meaning of what you read?',
  'Learners respond to comprehension questions from texts on varied themes. Learners use context clues to determine word meanings.',
  'Finding Details in Texts', ++o, 'Term 1', '',
  'Finding Details in Texts',
  'Learners respond to comprehension questions from texts on varied themes. Learners use context clues to determine word meanings.',
  'Question/answer, filling in blanks', null, null, null, null,
  'Readers, newspapers, magazines, journals', null);

add('Grade 2','English Language Activities','3.0 Reading','3.4 Answering Comprehension Questions',
  'Summarise texts read by identifying main ideas',
  'What is the main idea of a story?',
  'Learners relate personal experiences to a story read. Learners are guided to summarise texts by retelling or identifying the main ideas.',
  'Summarising What We Read', ++o, 'Term 1', '',
  'Summarising What We Read',
  'Learners relate personal experiences to a story read. Learners are guided to summarise texts by retelling or identifying the main ideas.',
  'Question/answer, filling in blanks', null, null, null, null,
  'Readers, newspapers, magazines, journals', null);

add('Grade 2','English Language Activities','3.0 Reading','3.4 Answering Comprehension Questions',
  'Use context clues to determine the meaning of unknown words; develop vocabulary through reading',
  'How can we figure out what a new word means?',
  'Learners use context clues to determine word meanings while reading. Learners practice identifying the meaning of unknown words by looking at the words and sentences around them.',
  'Word Meanings in Context', ++o, 'Term 1', '',
  'Word Meanings in Context',
  'Learners use context clues to determine word meanings while reading. Learners practice identifying the meaning of unknown words by looking at the words and sentences around them.',
  'Question/answer, filling in blanks', null, null, null, null,
  'Readers, newspapers, magazines, journals', null);

// ===== STRAND 4.0: WRITING =====

// 4.1 Word and Sentence Formation (3 lessons)
add('Grade 2','English Language Activities','4.0 Writing','4.1 Word and Sentence Formation',
  'Use familiar words and phrases to write simple sentences; use the correct noun and verb form',
  'How do we form a sentence?',
  'Learners are guided to build simple sentence structures through identification of keywords. Learners identify nouns and verbs in a sentence (subject/verb agreement).',
  'Building Sentences from Words', ++o, 'Term 1', '',
  'Building Sentences from Words',
  'Learners are guided to build simple sentence structures through identification of keywords. Learners identify nouns and verbs in a sentence.',
  'Write a short paragraph on a given thematic topic', null, null, null, null,
  'Tape recorder, flash cards, sentence strips, books, pencils', null);

add('Grade 2','English Language Activities','4.0 Writing','4.1 Word and Sentence Formation',
  'Identify and write upper and lower case letters in words and sentences correctly',
  'Why does word order matter in a sentence?',
  'Learners re-organize jumbled words to form logical sentences. Learners practise punctuation and capitalisation in sentences.',
  'Rearranging Words into Sentences', ++o, 'Term 1', '',
  'Rearranging Words into Sentences',
  'Learners re-organize jumbled words to form logical sentences. Learners practise punctuation and capitalisation in sentences.',
  'Write a short paragraph on a given thematic topic', null, null, null, null,
  'Tape recorder, flash cards, sentence strips, books, pencils', null);

add('Grade 2','English Language Activities','4.0 Writing','4.1 Word and Sentence Formation',
  'Develop an interest in writing for pleasure',
  'Why is writing fun?',
  'Learners written work is displayed to indicate writing progress. Learners are guided to use writing and other forms of representing for a variety of functions.',
  'Writing for Pleasure', ++o, 'Term 1', '',
  'Writing for Pleasure',
  'Learners written work is displayed to indicate writing progress. Learners use writing to ask questions, express feelings, and share opinions.',
  'Write a short paragraph on a given thematic topic', null, null, null, null,
  'Tape recorder, flash cards, sentence strips, books, pencils', null);

// 4.2 Spelling Instruction (3 lessons)
add('Grade 2','English Language Activities','4.0 Writing','4.2 Spelling Instruction',
  'Write an increasing number of words and spell them correctly; spell words with short and long vowel sounds',
  'Why is it important to spell words correctly?',
  'Learners write newly learned words on a word tree. Learners are guided on the use of spelling strategies including knowledge of letter-sound correspondences and common letter patterns.',
  'Spelling New Words', ++o, 'Term 1', '',
  'Spelling New Words',
  'Learners write newly learned words on a word tree. Learners are guided on the use of spelling strategies including knowledge of letter-sound correspondences.',
  'learners participate in spelling challenge, dictation', null, null, null, null,
  'Flash cards, word trees, writing materials, stencil', null);

add('Grade 2','English Language Activities','4.0 Writing','4.2 Spelling Instruction',
  'Use phonic knowledge to spell and write familiar and unfamiliar words; use editing strategies to correct spelling',
  'How can sounds help us spell words?',
  'Learners practise spelling sight words. Learners identify spelling errors in own writing or unknown texts and provide correct spelling.',
  'Using Phonics to Spell', ++o, 'Term 1', '',
  'Using Phonics to Spell',
  'Learners practise spelling sight words. Learners identify spelling errors in own writing or unknown texts and provide correct spelling.',
  'learners participate in spelling challenge, dictation', null, null, null, null,
  'Flash cards, word trees, writing materials, stencil', null);

add('Grade 2','English Language Activities','4.0 Writing','4.2 Spelling Instruction',
  'Use simple editing strategies to correct spelling in simple sentences; appreciate the importance of correct spelling',
  'How can we fix spelling mistakes?',
  'Learners identify spelling errors in own writing or unknown texts and provide correct spelling (spacing, punctuation, and spelling). Learners participate in spelling challenge contests.',
  'Editing and Correcting Spelling', ++o, 'Term 1', '',
  'Editing and Correcting Spelling',
  'Learners identify spelling errors in own writing or unknown texts and provide correct spelling. Learners participate in spelling challenge contests.',
  'learners participate in spelling challenge, dictation', null, null, null, null,
  'Flash cards, word trees, writing materials, stencil', null);

// 4.3 Handwriting (3 lessons)
add('Grade 2','English Language Activities','4.0 Writing','4.3 Handwriting',
  'Use conventional spacing between words; use basic punctuation appropriately',
  'Why should I write well?',
  'Learners use a variety of handwriting activities to practice letter patterns, word patterns, and sentence patterns. Learners practise capital and small letters, commas and full stop.',
  'Spacing and Punctuation', ++o, 'Term 1', '',
  'Spacing and Punctuation',
  'Learners use a variety of handwriting activities to practice letter patterns, word patterns, and sentence patterns.',
  'Teacher provides written text modelling good handwriting for learners to copy', null, null, null, null,
  'Books, pencils, crayons, word puzzles, story books', null);

add('Grade 2','English Language Activities','4.0 Writing','4.3 Handwriting',
  'Join letters to form meaningful words; use capitalization appropriately; appreciate clear and legible handwriting',
  'Why is neat handwriting important?',
  'Learners observe and practise handwriting as displayed. Learners write dictated sentences, paying attention to the spacing, punctuation and legibility.',
  'Clear and Neat Writing', ++o, 'Term 1', '',
  'Clear and Neat Writing',
  'Learners observe and practise handwriting as displayed. Learners write dictated sentences, paying attention to the spacing, punctuation and legibility.',
  'Teacher provides written text modelling good handwriting for learners to copy', null, null, null, null,
  'Books, pencils, crayons, word puzzles, story books', null);

add('Grade 2','English Language Activities','4.0 Writing','4.3 Handwriting',
  'Develop an interest in writing for pleasure; exhibit artistic expression through writing',
  'How can we make our writing beautiful?',
  'Learners participate in writing contests in class and at school. Learners engage in a variety of handwriting activities to improve their writing.',
  'Handwriting Practice and Contests', ++o, 'Term 1', '',
  'Handwriting Practice and Contests',
  'Learners participate in writing contests in class and at school. Learners engage in a variety of handwriting activities to improve their writing.',
  'Teacher provides written text modelling good handwriting for learners to copy', null, null, null, null,
  'Books, pencils, crayons, word puzzles, story books', null);

// 4.4 Creative Writing (4 lessons)
add('Grade 2','English Language Activities','4.0 Writing','4.4 Creative Writing',
  'Apply knowledge of creative writing process to write own texts',
  'How do we organize ideas to make a story interesting?',
  'Learners are guided on the writing process through picture stories in scrapbooks/journals (planning, drafting, editing, proofreading, publishing).',
  'Writing Our Own Stories', ++o, 'Term 1', '',
  'Writing Our Own Stories',
  'Learners are guided on the writing process through picture stories in scrapbooks/journals (planning, drafting, editing, proofreading, publishing).',
  'Learners write a story based on a given picture story', null, null, null, null,
  'Newspaper cutting, story maps, print materials, books, glue, scissors', null);

add('Grade 2','English Language Activities','4.0 Writing','4.4 Creative Writing',
  'Write clearly with variety in sentence structure; use appropriate connecting words to sequence sentences',
  'How do we connect ideas in a story?',
  'Learners practise sequencing sentences to form creative texts in pairs and groups. Learners give feedback on their classmate\'s writing.',
  'Sequencing and Connecting Ideas', ++o, 'Term 1', '',
  'Sequencing and Connecting Ideas',
  'Learners practise sequencing sentences to form creative texts in pairs and groups. Learners give feedback on their classmate\'s writing.',
  'Learners write a story based on a given picture story', null, null, null, null,
  'Newspaper cutting, story maps, print materials, books, glue, scissors', null);

add('Grade 2','English Language Activities','4.0 Writing','4.4 Creative Writing',
  'Exhibit artistic expression through writing',
  'How can we make our stories creative?',
  'Learners are provided with pictures as a trigger to creative writing. Learners imagination is stimulated through games such as story train and picture spark.',
  'Creative Story Writing', ++o, 'Term 1', '',
  'Creative Story Writing',
  'Learners are provided with pictures as a trigger to creative writing. Learners imagination is stimulated through games such as story train and picture spark.',
  'Learners write a story based on a given picture story', null, null, null, null,
  'Newspaper cutting, story maps, print materials, books, glue, scissors', null);

add('Grade 2','English Language Activities','4.0 Writing','4.4 Creative Writing',
  'Choose to write independently during free choice activities',
  'Why should we write for fun?',
  'Learners choose to write independently during free choice activities such as story train and picture spark. Learners share writing with peers.',
  'Independent Creative Writing', ++o, 'Term 1', '',
  'Independent Creative Writing',
  'Learners choose to write independently during free choice activities. Learners share writing with peers and participate in creative writing competitions.',
  'Learners write a story based on a given picture story', null, null, null, null,
  'Newspaper cutting, story maps, print materials, books, glue, scissors', null);

// ===== Generate CSV =====
const header = [
  'grade', 'subject', 'strand', 'subStrand', 'learningOutcome',
  'specificLearningOutcome', 'keyInquiryQuestion', 'suggestedLearningExperience',
  'lessonTitle', 'lessonOrder', 'term', 'week',
  'activityTitle', 'activityInstructions', 'assessmentMethod', 'assessmentCriteria',
  'questTitle', 'questInstructions', 'reflectionPrompt',
  'learningResources', 'coreCompetencies',
].join(',') + '\n';

const body = rows.map(r => [
  r.grade, r.subject, r.strand, r.subStrand, r.learningOutcome,
  r.specificLearningOutcome, r.keyInquiryQuestion, r.suggestedLearningExperience,
  r.lessonTitle, r.lessonOrder, r.term, r.week,
  r.activityTitle, r.activityInstructions, r.assessmentMethod, r.assessmentCriteria,
  r.questTitle, r.questInstructions, r.reflectionPrompt,
  r.learningResources, r.coreCompetencies,
].map(csvEscape).join(',') + '\n').join('');

const csv = header + body;
fs.writeFileSync('curriculum-shells/grade-2/english-language-activities-import.csv', csv, 'utf-8');

console.log(`Generated ${rows.length} lesson shells`);
console.log(`Saved to curriculum-shells/grade-2/english-language-activities-import.csv`);

// Count by sub-strand
const subStrandCounts = {};
for (const r of rows) {
  subStrandCounts[r.subStrand] = (subStrandCounts[r.subStrand] || 0) + 1;
}
console.log('\nLessons by sub-strand:');
for (const [ss, count] of Object.entries(subStrandCounts).sort()) {
  console.log(`  ${count} | ${ss}`);
}
