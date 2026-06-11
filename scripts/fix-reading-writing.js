#!/usr/bin/env node
const fs = require('fs');
const env = {};
fs.readFileSync('.env','utf-8').split('\n').forEach(l => { const t=l.trim(); if(!t||t.startsWith('#'))return; const i=t.indexOf('='); if(i===-1)return; env[t.slice(0,i).trim()]=t.slice(i+1).trim().replace(/^['\"]|['\"]$/g,''); });
const { createClient } = require('@supabase/supabase-js');
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

function extractTheme(title) {
  return title.split(':')[0].trim().toLowerCase();
}

function buildReadingJourney(title) {
  const theme = extractTheme(title);
  const themeDesc = getThemeDescription(theme);
  
  return [
    { id: 'welcome', stepType: 'welcome', title: 'Karibu!', studentText: `Hello, friend! 📖 Today we are going to practice reading about ${theme}. We will read carefully and understand what we read!`, owlText: `Hello! I am OWL. Today we will practice reading about ${theme}.`, visualType: 'owl_teacher', interaction: { type: 'none' }, media: {} },
    { id: 'mission', stepType: 'mission', title: 'Our Mission', studentText: `By the end of this lesson, you will be able to read and understand a short passage about ${theme}!`, owlText: `Our mission is to become better readers about ${theme}.`, visualType: 'owl_teacher', interaction: { type: 'none' }, media: {} },
    { id: 'think_first', stepType: 'think_first', title: 'Think First!', studentText: `What do you already know about ${theme}? Think about what you have seen, heard, or read before.`, owlText: `Let us think: what do you already know about ${theme}?`, visualType: 'owl_teacher', interaction: { type: 'open_response', prompt: `What do you know about ${theme}?`, placeholder: 'Share your thoughts...' }, media: {} },
    { id: 'learn', stepType: 'learn', title: 'Learn: Reading About ' + themeDesc, studentText: `When we read about ${theme}, we look at the words carefully and think about what they mean. We ask: What is this passage about? What are the key details? Let us practice reading a short passage together.`, owlText: `Remember: read carefully, think about the meaning, and look for key details.`, visualType: 'owl_teacher', interaction: { type: 'none' }, media: {} },
    { id: 'connect', stepType: 'connect', title: 'Real Life Connection', studentText: `Where do you read about ${theme} in real life? In books? On signs? At home? Practice reading about ${theme} every day!`, owlText: `We read about ${theme} in many places — books, signs, labels, and more.`, visualType: 'owl_teacher', interaction: { type: 'none' }, media: {} },
    { id: 'example', stepType: 'example', title: 'Let Us Try Together', studentText: `I will read a short passage about ${theme}. Listen carefully, then you will answer questions about it.`, owlText: `Listen carefully to the passage. Then you will show what you understood.`, visualType: 'owl_teacher', interaction: { type: 'none' }, media: {} },
    { id: 'practice', stepType: 'practice', title: 'Your Turn!', studentText: `Practice: Read a short passage about ${theme}. Then answer 3 questions about what you read.`, owlText: `You are doing great! Keep practicing your reading skills.`, visualType: 'owl_teacher', interaction: { type: 'none' }, media: {} },
    { id: 'quick_check', stepType: 'quick_check', title: 'Quick Check!', studentText: `What is the most important thing when reading about ${theme}?`, owlText: `This is a fun quiz! Pick the best answer.`, visualType: 'owl_teacher', interaction: { type: 'multiple_choice', question: 'What is most important when reading?', options: ['Reading as fast as possible', 'Understanding what you read', 'Skipping hard words', 'Reading silently only'], correctIndex: 1, explanation: 'Correct! Understanding what you read is the most important part!' }, media: {} },
    { id: 'reflect', stepType: 'reflect', title: 'Think About Your Learning', studentText: `What did you learn about reading ${theme} today? Write your answer below.`, owlText: `You worked hard today! You are becoming a better reader.`, visualType: 'owl_teacher', interaction: { type: 'open_response', prompt: 'What did you learn about reading today?', placeholder: 'Write what you learned...' }, media: {} },
    { id: 'complete', stepType: 'complete', title: 'Well Done!', studentText: `Congratulations! 🎉 You practiced reading about ${theme}. You are becoming a great reader!`, owlText: `Well done, friend! I am proud of you!`, visualType: 'owl_teacher', interaction: { type: 'none' }, media: {} },
  ];
}

function buildWritingJourney(title) {
  const theme = extractTheme(title);
  
  return [
    { id: 'welcome', stepType: 'welcome', title: 'Karibu!', studentText: `Hello, friend! ✏️ Today we are going to practice writing about ${theme}. We will write clearly and carefully!`, owlText: `Hello! I am OWL. Today we will practice writing about ${theme}.`, visualType: 'owl_teacher', interaction: { type: 'none' }, media: {} },
    { id: 'mission', stepType: 'mission', title: 'Our Mission', studentText: `By the end of this lesson, you will be able to write sentences about ${theme} correctly!`, owlText: `Our mission is to become better writers about ${theme}.`, visualType: 'owl_teacher', interaction: { type: 'none' }, media: {} },
    { id: 'think_first', stepType: 'think_first', title: 'Think First!', studentText: `What do you already know about ${theme}? What words can you use to write about it?`, owlText: `Let us think: what words and ideas do you have about ${theme}?`, visualType: 'owl_teacher', interaction: { type: 'open_response', prompt: `What words do you know about ${theme}?`, placeholder: 'Share your ideas...' }, media: {} },
    { id: 'learn', stepType: 'learn', title: 'Learn: Writing About ' + theme, studentText: `When we write about ${theme}, we use clear sentences. We start with a capital letter and end with a full stop. We use words that describe ${theme} accurately. Let us practice together!`, owlText: `Remember: capital letter at the start, full stop at the end, use descriptive words.`, visualType: 'owl_teacher', interaction: { type: 'none' }, media: {} },
    { id: 'connect', stepType: 'connect', title: 'Real Life Connection', studentText: `Where do you write about ${theme} in real life? In school? At home? Practice writing about ${theme} every day!`, owlText: `We write about ${theme} in many places — school, home, and the community.`, visualType: 'owl_teacher', interaction: { type: 'none' }, media: {} },
    { id: 'example', stepType: 'example', title: 'Let Us Try Together', studentText: `I will write a sentence about ${theme}. Watch carefully, then you will write your own sentence.`, owlText: `Watch how I form the sentence. Then it is your turn!`, visualType: 'owl_teacher', interaction: { type: 'none' }, media: {} },
    { id: 'practice', stepType: 'practice', title: 'Your Turn!', studentText: `Practice: Write 3 sentences about ${theme}. Use capital letters and full stops correctly.`, owlText: `You are doing great! Keep practicing your writing skills.`, visualType: 'owl_teacher', interaction: { type: 'none' }, media: {} },
    { id: 'quick_check', stepType: 'quick_check', title: 'Quick Check!', studentText: `What do we need at the start of a sentence?`, owlText: `This is a fun quiz! Pick the best answer.`, visualType: 'owl_teacher', interaction: { type: 'multiple_choice', question: 'What do we need at the start of a sentence?', options: ['A small letter', 'A capital letter', 'A picture', 'A number'], correctIndex: 1, explanation: 'Correct! We start a sentence with a capital letter!' }, media: {} },
    { id: 'reflect', stepType: 'reflect', title: 'Think About Your Learning', studentText: `What did you learn about writing today? Write your answer below.`, owlText: `You worked hard today! You are becoming a better writer.`, visualType: 'owl_teacher', interaction: { type: 'open_response', prompt: 'What did you learn about writing today?', placeholder: 'Write what you learned...' }, media: {} },
    { id: 'complete', stepType: 'complete', title: 'Well Done!', studentText: `Congratulations! 🎉 You practiced writing about ${theme}. You are becoming a great writer!`, owlText: `Well done, friend! I am proud of you!`, visualType: 'owl_teacher', interaction: { type: 'none' }, media: {} },
  ];
}

function getThemeDescription(theme) {
  const descriptions = {
    'school': 'school life and learning',
    'transport': 'transport and travel',
    'accidents': 'safety and accidents',
    'the garden': 'gardens and plants',
    'the farm': 'farms and animals',
    'shopping': 'shopping and buying',
    'positions and directions': 'positions and directions',
    'environment - taking a walk': 'the environment and nature',
    'technology': 'technology and devices',
    'cultural activities': 'cultural activities and celebrations',
    'child labour': 'children\'s rights',
    'caring for others': 'caring for others',
    'time and months of the year': 'time and months',
  };
  return descriptions[theme] || theme;
}

async function main() {
  // Get all English theme lessons with Reading or Writing strands that have generic content
  const { data: theme } = await db.from('Theme').select('id').eq('slug', 'g2-english').single();
  const { data: quests } = await db.from('Quest').select('id').eq('themeId', theme.id);
  
  let all = [], off = 0;
  while (true) {
    const { data } = await db.from('Lesson').select('id, title, contentBlocks').in('questId', quests.map(q=>q.id)).range(off, off+199);
    if (!data?.length) break;
    all = all.concat(data); off += 200;
    if (data.length < 200) break;
  }
  
  let fixed = 0;
  
  for (const l of all) {
    let meta = {};
    try { meta = JSON.parse(l.contentBlocks || '{}'); } catch {}
    const draft = meta.studentJourneyDraft || [];
    if (!draft.length) continue;
    
    // Check if this is a Reading or Writing journey with generic content
    const strand = (meta.strand || '').toLowerCase();
    const allText = draft.map(s => String(s.studentText||'') + ' ' + String(s.owlText||'')).join(' ').toLowerCase();
    
    const isReading = strand.includes('reading');
    const isWriting = strand.includes('writing');
    const hasGenericContent = allText.includes('today we will learn about') || 
                              allText.includes('what do you already know about reading') ||
                              allText.includes('what do you already know about writing') ||
                              (allText.includes('reading') && allText.includes('writing') && draft.length === 10 && 
                               String(draft[2].studentText||'').toLowerCase().includes('what do you already know about'));
    
    if (!isReading && !isWriting) continue;
    if (!hasGenericContent) continue;
    
    // Rebuild the journey with specific content
    const newJourney = isReading ? buildReadingJourney(l.title) : buildWritingJourney(l.title);
    
    const upd = { ...meta, studentJourneyDraft: newJourney, aiMetadata: { ...(meta.aiMetadata||{}), batchId: 'fix-reading-writing-v1', generatedAt: new Date().toISOString() } };
    const { error } = await db.from('Lesson').update({ contentBlocks: JSON.stringify(upd) }).eq('id', l.id);
    if (error) console.error('ERROR:', l.title.substring(0,40), error.message);
    else { fixed++; console.log('✓ Fixed: ' + l.title.substring(0, 60)); }
  }
  
  console.log('\nTotal fixed: ' + fixed + ' Reading/Writing journeys');
}
main().catch(e => console.error(e));
