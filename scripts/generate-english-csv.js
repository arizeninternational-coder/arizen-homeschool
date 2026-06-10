/**
 * Grade 2 English Language Activities — Curriculum Shell Generator
 * Source: KICD Lower Primary Curriculum Designs Volume One (August 2017)
 * Pages 157-180
 * 
 * Generates CSV shells for import via /api/admin/curriculum/upload
 */

const fs = require('fs');

// CSV escape helper
function csvEscape(s) {
  if (s === null || s === undefined) return '""';
  const str = String(s).replace(/"/g, '""');
  return `"${str}"`;
}

function csvLine(fields) {
  return fields.map(csvEscape).join(',') + '\n';
}

// Curriculum structure from KICD Volume 1, Grade 2 English
const curriculum = [
  // ===== STRAND 1.0: LISTENING =====
  {
    strand: '1.0 Listening',
    subStrand: '1.1 Listen to Instructions and Questions',
    lessons: [
      {
        title: 'Following Simple Instructions',
        slo: 'Listen attentively to simple sequenced instructions',
        kiQ: 'Who gives us instructions?',
        experience: 'Learners attentively listen to a series of instructions and interpret effectively using non-verbal cues. Learners participate in varied activities and games that require them to respond to instructions e.g. Simon says.',
        assessment: 'question/answer',
        resources: 'Audio recordings, manila charts, sentence strips',
      },
      {
        title: 'Responding to Questions',
        slo: 'Use appropriate non-verbal communication cues to indicate understanding of questions and instructions',
        kiQ: 'Who asks us questions?',
        experience: 'Learners listen to questions and take turns in responding to them using prompts. Learners model/role play talking and listening to different audiences e.g. school members, family and community members.',
        assessment: 'question/answer',
        resources: 'Audio recordings, manila charts, sentence strips',
      },
    ],
  },
  {
    strand: '1.0 Listening',
    subStrand: '1.2 Word and Sentence Formation',
    lessons: [
      {
        title: 'Syllables in Words',
        slo: 'Identify the number of syllables in a word',
        kiQ: 'How do we form words?',
        experience: 'Learners practice hearing individual sounds as they sing rhymes and recite poems. Learners combine syllables to form words through blending activities.',
        assessment: 'segmenting drills',
        resources: 'Audio recordings, manila charts, sentence strips',
      },
      {
        title: 'Words that Rhyme',
        slo: 'Recognize words with similar sounds and combine words to make simple sentences',
        kiQ: 'Which words sound the same at the end?',
        experience: 'Learners play rhyming and blending games with peers e.g. come up with words that rhyme. Learners combine words to make simple sentences.',
        assessment: 'segmenting drills',
        resources: 'Audio recordings, manila charts, sentence strips',
      },
    ],
  },
  {
    strand: '1.0 Listening',
    subStrand: '1.3 Storytelling',
    lessons: [
      {
        title: 'Listening to Stories',
        slo: 'Develop vocabulary through listening to stories and show empathy with people, places, and things',
        kiQ: 'Why do we tell stories?',
        experience: 'Learners listen to a variety of stories about self, family, and home from peers, resource persons, and teachers. Learners respond to questions on the stories told (who, what, where).',
        assessment: 'Question/Answer, narration',
        resources: 'Resource persons, story books, newspaper, magazines, audiovisuals',
      },
      {
        title: 'Retelling Stories',
        slo: 'Recount key details of a story and retell it; appreciate morals taught through different thematic stories',
        kiQ: 'Why are stories important to us?',
        experience: 'Learners role play, dramatize or retell stories (traditional and modern) listened to. Learners discuss the morals learned from stories listened to.',
        assessment: 'Question/Answer, narration',
        resources: 'Resource persons, story books, newspaper, magazines, audiovisuals',
      },
    ],
  },
  {
    strand: '1.0 Listening',
    subStrand: '1.4 Effective Communication',
    lessons: [
      {
        title: 'Listening with Attention',
        slo: 'Listen with increased attention to rhymes, songs, conversations and stories',
        kiQ: 'Why do we communicate?',
        experience: 'Learners play action games such as Simon says, in small groups. Learners listen to audio or audiovisual stories on varied themes.',
        assessment: 'oral presentation in class',
        resources: 'Visual and audio materials, story books, props, picture cards and charts',
      },
      {
        title: 'Responding to Feelings and Ideas',
        slo: 'Listen to experiences of others and respond appropriately to the feelings and ideas expressed',
        kiQ: 'How do we communicate?',
        experience: 'Learners listen and pick out vocabulary from material listened to. Learners listen to daily announcements in school and orally recount what they heard.',
        assessment: 'oral presentation in class',
        resources: 'Visual and audio materials, story books, props, picture cards and charts',
      },
    ],
  },
  {
    strand: '1.0 Listening',
    subStrand: '1.5 Conversation',
    lessons: [
      {
        title: 'Listening in Conversations',
        slo: 'Listen to informational texts and pick out the key details; ask and answer relevant questions in a listening text',
        kiQ: 'Why is it important to listen to others during a conversation?',
        experience: 'Learners practice use of socially acceptable language during conversation, ask questions using cue words (who, what, where, when, why).',
        assessment: 'Ongoing conversation-based assessment',
        resources: 'Audio and visual recorders, listening passages',
      },
      {
        title: 'Building on Others\' Ideas',
        slo: 'Build on the ideas and points of others in conversation; demonstrate respect for others when participating in a conversation',
        kiQ: 'How can we show respect when others are speaking?',
        experience: 'Learners engage in role play and dramatization. Learners watch short videos featuring leaders in the community and have follow-up conversations.',
        assessment: 'Ongoing conversation-based assessment',
        resources: 'Audio and visual recorders, listening passages',
      },
    ],
  },

  // ===== STRAND 2.0: SPEAKING =====
  {
    strand: '2.0 Speaking',
    subStrand: '2.2 Responding to Questions and Instructions',
    lessons: [
      {
        title: 'Giving and Following Instructions',
        slo: 'Respond confidently to questions and instructions on varied themes',
        kiQ: 'How do you respond when asked to do something?',
        experience: 'Learners role play giving and responding to instructions, paying attention to pronunciation and accuracy with words.',
        assessment: 'question and answer, ability to take instructions',
        resources: 'Audiotapes/videos, word chart, resource person',
      },
      {
        title: 'Asking for Clarity',
        slo: 'Ask questions to seek clarity on instructions; use verbal and non-verbal cues appropriately',
        kiQ: 'Why do we give instructions?',
        experience: 'Learners play language games involving responding to instructions and answering questions through songs and games following a particular pattern.',
        assessment: 'question and answer, ability to take instructions',
        resources: 'Audiotapes/videos, word chart, resource person',
      },
    ],
  },
  {
    strand: '2.0 Speaking',
    subStrand: '2.3 Phonological Awareness',
    lessons: [
      {
        title: 'Letter Sounds and Syllables',
        slo: 'Recognize and say multiple letter-sounds to make syllables and words',
        kiQ: 'What are some of the sounds we hear?',
        experience: 'Learners sound sight words representing multi sounds individually, in pairs and groups. Learners blend syllables to form words and sentences.',
        assessment: 'Form words and sentences',
        resources: 'Audio and audiovisual aids, storybooks, charts, pictures',
      },
      {
        title: 'Blending Sounds into Words',
        slo: 'Blend and segment syllables correctly to form words',
        kiQ: 'Which words contain these sounds?',
        experience: 'Learners play auditory discrimination games to enable them to listen to different sounds. Learners give words that rhyme.',
        assessment: 'Form words and sentences',
        resources: 'Audio and audiovisual aids, storybooks, charts, pictures',
      },
      {
        title: 'Making Sentences with Sounds',
        slo: 'Use appropriate words to make short, meaningful sentences; appreciate the role of blending and segmenting in forming sentences',
        kiQ: 'How do sounds become words and sentences?',
        experience: 'Learners are guided to make a list of all the sounds they can hear from the environment. Learners form sentences from words created through blending.',
        assessment: 'Form words and sentences',
        resources: 'Audio and audiovisual aids, storybooks, charts, pictures',
      },
    ],
  },
  {
    strand: '2.0 Speaking',
    subStrand: '2.4 Talk About',
    lessons: [
      {
        title: 'Talking About Stories',
        slo: 'Confidently talk about characters and events in a story or text; relate characters to real life',
        kiQ: 'How can we talk to others in a proper way?',
        experience: 'Learners discuss characters and events in a thematic story, predicting events and seeking clarification by asking questions.',
        assessment: 'Panel discussion on community issues',
        resources: 'Audio and audiovisual aids, resource persons',
      },
      {
        title: 'Greeting People',
        slo: 'Demonstrate interest to address familiar people using appropriate verbal and non-verbal expressions',
        kiQ: 'How do we greet different people?',
        experience: 'Learners role play greeting people of different status showing appropriate emotions. Learners recreate stories using different media.',
        assessment: 'Panel discussion on community issues',
        resources: 'Audio and audiovisual aids, resource persons',
      },
    ],
  },
  {
    strand: '2.0 Speaking',
    subStrand: '2.5 Presentation Skills',
    lessons: [
      {
        title: 'Expressing Yourself Clearly',
        slo: 'Express self appropriately using acquired vocabulary to communicate effectively',
        kiQ: 'What does a good presenter do?',
        experience: 'Learners express personal feelings orally using the learnt vocabulary. Learners present poems and sing songs on various themes.',
        assessment: 'matching pictures with events, question/answer',
        resources: 'Audio visual aids, role models, pictures of various events',
      },
      {
        title: 'Presenting in Order',
        slo: 'Relate various community activities in order; use appropriate tonal variation, articulation and stress',
        kiQ: 'Why is it important to speak in the right order?',
        experience: 'Learners practise making connections using transition words (months, special days, birthdays, cultural events). Learners present short speeches on familiar topics.',
        assessment: 'matching pictures with events, question/answer',
        resources: 'Audio visual aids, role models, pictures of various events',
      },
    ],
  },

  // ===== STRAND 3.0: READING =====
  {
    strand: '3.0 Reading',
    subStrand: '3.1 Paired Reading',
    lessons: [
      {
        title: 'Reading with a Partner',
        slo: 'Assess self on reading speed and fluency; provide feedback on peer\'s reading',
        kiQ: 'What is a good speed for reading?',
        experience: 'Learners read aloud to each other in pairs. Learners practice error correction procedure when supporting each other\'s reading, making predictions and asking questions.',
        assessment: 'learners retell what they have read, question/answer',
        resources: 'charts, newspapers, readers, magazines',
      },
      {
        title: 'Asking Questions About What We Read',
        slo: 'Ask questions to confirm and extend understanding of material read; make predictions before and during reading',
        kiQ: 'What questions can we ask about a story?',
        experience: 'Learners ask each other questions about what they have read. Learners practise turn-taking and listening to peers as they read.',
        assessment: 'learners retell what they have read, question/answer',
        resources: 'charts, newspapers, readers, magazines',
      },
    ],
  },
  {
    strand: '3.0 Reading',
    subStrand: '3.2 Group Reading',
    lessons: [
      {
        title: 'Reading Together in Groups',
        slo: 'Read texts collectively with accuracy, fluency, and comprehension',
        kiQ: 'What is the importance of reading in groups?',
        experience: 'Learners find answers to questions from texts read using think-pair-share. Learners are divided into reading teams to facilitate peer learning and support.',
        assessment: 'Peer Assessment, question/answer, retelling a story read',
        resources: 'Readers, newspapers, journals',
      },
      {
        title: 'Retelling Stories from Group Reading',
        slo: 'Develop peer learning skills of self-assessment and improve confidence through peer support',
        kiQ: 'How does reading with others help us learn?',
        experience: 'Learners retell story, events read in pairs and small groups. Learners support each other through guiding questions (who, what, where).',
        assessment: 'Peer Assessment, question/answer, retelling a story read',
        resources: 'Readers, newspapers, journals',
      },
    ],
  },
  {
    strand: '3.0 Reading',
    subStrand: '3.3 Silent Reading',
    lessons: [
      {
        title: 'Reading Silently',
        slo: 'Read texts and passages silently; read silently showing sustained focus for longer periods',
        kiQ: 'When do we read silently?',
        experience: 'Learners are assisted in developing silent reading skills for efficient reading through guiding questions and timing reading. Learners could be shown a picture spark that tells the same story.',
        assessment: 'Question/answer, filling gaps',
        resources: 'Readers, magazines, newspapers, journals, story books, class readers',
      },
      {
        title: 'Understanding What We Read Silently',
        slo: 'Predict the meaning of unfamiliar words; answer comprehension questions from texts read silently',
        kiQ: 'How do we understand new words when reading?',
        experience: 'Learners discuss questions after silent reading in pairs and groups. Learners answer comprehension questions from texts read. Learners practise retelling what has been read.',
        assessment: 'Question/answer, filling gaps',
        resources: 'Readers, magazines, newspapers, journals, story books, class readers',
      },
    ],
  },
  {
    strand: '3.0 Reading',
    subStrand: '3.4 Answering Comprehension Questions',
    lessons: [
      {
        title: 'Finding Details in Texts',
        slo: 'Locate specific details in response to questions from texts read; determine the meaning of unknown words in context',
        kiQ: 'Why is it important to understand the meaning of what you read?',
        experience: 'Learners respond to comprehension questions from texts on varied themes. Learners use context clues to determine word meanings.',
        assessment: 'Question/answer, filling in blanks',
        resources: 'Readers, newspapers, magazines, journals',
      },
      {
        title: 'Summarising What We Read',
        slo: 'Summarise texts read by identifying main ideas',
        kiQ: 'What is the main idea of a story?',
        experience: 'Learners relate personal experiences to a story read. Learners are guided to summarise texts by retelling or identifying the main ideas.',
        assessment: 'Question/answer, filling in blanks',
        resources: 'Readers, newspapers, magazines, journals',
      },
    ],
  },

  // ===== STRAND 4.0: WRITING =====
  {
    strand: '4.0 Writing',
    subStrand: '4.1 Word and Sentence Formation',
    lessons: [
      {
        title: 'Building Sentences from Words',
        slo: 'Use familiar words and phrases to write simple sentences; use the correct noun and verb form',
        kiQ: 'How do we form a sentence?',
        experience: 'Learners are guided to build simple sentence structures through identification of keywords. Learners identify nouns and verbs in a sentence (subject/verb agreement).',
        assessment: 'Write a short paragraph on a given thematic topic',
        resources: 'Tape recorder, flash cards, sentence strips, books, pencils',
      },
      {
        title: 'Rearranging Words into Sentences',
        slo: 'Identify and write upper and lower case letters in words and sentences correctly',
        kiQ: 'Why does word order matter in a sentence?',
        experience: 'Learners re-organize jumbled words to form logical sentences. Learners practise punctuation and capitalisation in sentences.',
        assessment: 'Write a short paragraph on a given thematic topic',
        resources: 'Tape recorder, flash cards, sentence strips, books, pencils',
      },
    ],
  },
  {
    strand: '4.0 Writing',
    subStrand: '4.2 Spelling Instruction',
    lessons: [
      {
        title: 'Spelling New Words',
        slo: 'Write an increasing number of words and spell them correctly; spell words with short and long vowel sounds',
        kiQ: 'Why is it important to spell words correctly?',
        experience: 'Learners write newly learned words on a word tree. Learners are guided on the use of spelling strategies including knowledge of letter-sound correspondences and common letter patterns.',
        assessment: 'learners participate in spelling challenge, dictation',
        resources: 'Flash cards, word trees, writing materials, stencil',
      },
      {
        title: 'Using Phonics to Spell',
        slo: 'Use phonic knowledge to spell and write familiar and unfamiliar words; use editing strategies to correct spelling',
        kiQ: 'How can sounds help us spell words?',
        experience: 'Learners practise spelling sight words. Learners identify spelling errors in own writing or unknown texts and provide correct spelling. Learners participate in spelling challenge contests.',
        assessment: 'learners participate in spelling challenge, dictation',
        resources: 'Flash cards, word trees, writing materials, stencil',
      },
    ],
  },
  {
    strand: '4.0 Writing',
    subStrand: '4.3 Handwriting',
    lessons: [
      {
        title: 'Spacing and Punctuation',
        slo: 'Use conventional spacing between words; use basic punctuation appropriately',
        kiQ: 'Why should I write well?',
        experience: 'Learners use a variety of handwriting activities to practice letter patterns, word patterns, and sentence patterns. Learners practise capital and small letters, commas and full stop.',
        assessment: 'Teacher provides written text modelling good handwriting for learners to copy',
        resources: 'Books, pencils, crayons, word puzzles, story books',
      },
      {
        title: 'Clear and Neat Writing',
        slo: 'Join letters to form meaningful words; use capitalization appropriately; appreciate clear and legible handwriting',
        kiQ: 'Why is neat handwriting important?',
        experience: 'Learners observe and practise handwriting as displayed. Learners write dictated sentences, paying attention to the spacing, punctuation and legibility. Learners participate in writing contests.',
        assessment: 'Teacher provides written text modelling good handwriting for learners to copy',
        resources: 'Books, pencils, crayons, word puzzles, story books',
      },
    ],
  },
  {
    strand: '4.0 Writing',
    subStrand: '4.4 Creative Writing',
    lessons: [
      {
        title: 'Writing Our Own Stories',
        slo: 'Apply knowledge of creative writing process to write own texts',
        kiQ: 'How do we organize ideas to make a story interesting?',
        experience: 'Learners are guided on the writing process through picture stories in scrapbooks/journals (planning, drafting, editing, proofreading, publishing). Learners are provided with pictures as a trigger for creative writing.',
        assessment: 'Learners write a story based on a given picture story',
        resources: 'Newspaper cutting, story maps, print materials, books, glue, scissors',
      },
      {
        title: 'Sequencing and Connecting Ideas',
        slo: 'Write clearly with variety in sentence structure; use appropriate connecting words to sequence sentences',
        kiQ: 'How do we connect ideas in a story?',
        experience: 'Learners practise sequencing sentences to form creative texts in pairs and groups. Learners give feedback on their classmate\'s writing.',
        assessment: 'Learners write a story based on a given picture story',
        resources: 'Newspaper cutting, story maps, print materials, books, glue, scissors',
      },
    ],
  },
];

// Flatten into rows
const rows = [];
let globalLessonOrder = 0;
const questTitle = 'English Language Activities Grade 2';

for (const strandData of curriculum) {
  for (const lesson of strandData.lessons) {
    globalLessonOrder++;
    const lessonOrder = String(globalLessonOrder).padStart(2, '0');
    rows.push({
      grade: 'Grade 2',
      subject: 'English Language Activities',
      strand: strandData.strand,
      subStrand: strandData.subStrand,
      learningOutcome: lesson.slo,
      specificLearningOutcome: lesson.slo,
      keyInquiryQuestion: lesson.kiQ,
      suggestedLearningExperience: lesson.experience,
      lessonTitle: lesson.title,
      lessonOrder: lessonOrder,
      term: 'Term 1',
      week: '',
      activityTitle: lesson.title,
      activityInstructions: lesson.experience,
      assessmentMethod: lesson.assessment,
      assessmentCriteria: `Learner demonstrates understanding of ${lesson.slo.toLowerCase()}`,
      questTitle: questTitle,
      questInstructions: `In this quest, we explore ${strandData.subStrand.toLowerCase()}.`,
      reflectionPrompt: `What did I learn about ${lesson.slo.toLowerCase()} today?`,
      learningResources: lesson.resources,
      coreCompetencies: 'Communication and Collaboration, Critical Thinking and Problem Solving',
    });
  }
}

// CSV Header
const header = [
  'grade', 'subject', 'strand', 'subStrand', 'learningOutcome',
  'specificLearningOutcome', 'keyInquiryQuestion', 'suggestedLearningExperience',
  'lessonTitle', 'lessonOrder', 'term', 'week',
  'activityTitle', 'activityInstructions', 'assessmentMethod', 'assessmentCriteria',
  'questTitle', 'questInstructions', 'reflectionPrompt',
  'learningResources', 'coreCompetencies',
].join(',') + '\n';

// CSV Body
const body = rows.map(r => {
  return [
    r.grade, r.subject, r.strand, r.subStrand, r.learningOutcome,
    r.specificLearningOutcome, r.keyInquiryQuestion, r.suggestedLearningExperience,
    r.lessonTitle, r.lessonOrder, r.term, r.week,
    r.activityTitle, r.activityInstructions, r.assessmentMethod, r.assessmentCriteria,
    r.questTitle, r.questInstructions, r.reflectionPrompt,
    r.learningResources, r.coreCompetencies,
  ].map(csvEscape).join(',') + '\n';
}).join('');

const csv = header + body;
const outPath = 'curriculum-shells/grade-2/english-language-activities-import.csv';
fs.mkdirSync('curriculum-shells/grade-2', { recursive: true });
fs.writeFileSync(outPath, csv, 'utf-8');

console.log(`Generated ${rows.length} lesson shells`);
console.log(`Saved to ${outPath}`);
console.log(`Strands: ${curriculum.length}`);
console.log(`Subject: English Language Activities`);
