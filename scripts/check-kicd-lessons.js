#!/usr/bin/env node
/** READ-ONLY: Check contentBlocks of the 35 KICD English lessons */
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

async function main() {
  // Get the 35 KICD lessons by slug pattern
  const kicdSlugs = [
    'following-simple-instructions', 'responding-to-questions', 'syllables-in-words', 'words-that-rhyme',
    'listening-to-stories', 'retelling-stories', 'listening-with-attention', 'responding-to-feelings-and-ideas',
    'listening-in-conversations', 'building-on-others-ideas', 'giving-and-following-instructions', 'asking-for-clarity',
    'letter-sounds-and-syllables', 'blending-sounds-into-words', 'making-sentences-with-sounds',
    'talking-about-stories', 'greeting-people', 'expressing-yourself-clearly', 'presenting-in-order',
    'reading-with-a-partner', 'asking-questions-about-what-we-read', 'reading-together-in-groups',
    'retelling-stories-from-group-reading', 'reading-silently', 'understanding-what-we-read-silently',
    'finding-details-in-texts', 'summarising-what-we-read', 'building-sentences-from-words',
    'rearranging-words-into-sentences', 'spelling-new-words', 'using-phonics-to-spell',
    'spacing-and-punctuation', 'clear-and-neat-writing', 'writing-our-own-stories', 'sequencing-and-connecting-ideas'
  ];
  
  const { data: lessons } = await db.from('Lesson').select('id,title,slug,status,isAvailable,contentBlocks').in('slug', kicdSlugs);
  
  console.log(`Found ${lessons.length} KICD English lessons`);
  
  for (const l of lessons) {
    const cb = typeof l.contentBlocks === 'string' ? JSON.parse(l.contentBlocks) : l.contentBlocks;
    console.log(`\n${l.title} (${l.slug})`);
    console.log(`  status=${l.status} isAvailable=${l.isAvailable}`);
    console.log(`  contentBlocks keys: ${Object.keys(cb).join(', ')}`);
    console.log(`  subject=${cb.subject} strand=${cb.strand} subStrand=${cb.subStrand}`);
    console.log(`  has studentJourney=${Array.isArray(cb?.studentJourney) && cb.studentJourney.length > 0}`);
    console.log(`  has studentJourneyDraft=${Array.isArray(cb?.studentJourneyDraft) && cb.studentJourneyDraft.length > 0}`);
    if (cb.studentJourneyDraft) console.log(`  draft steps: ${cb.studentJourneyDraft.length}`);
  }
}
main().catch(e => { console.error(e); process.exit(1); });
