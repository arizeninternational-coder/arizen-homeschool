#!/usr/bin/env node
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
const db = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function main() {
  // Check storage buckets
  const { data: buckets, error: bucketError } = await db.storage.listBuckets();
  console.log('=== STORAGE BUCKETS ===');
  if (bucketError) console.log('Error:', bucketError.message);
  buckets?.forEach(b => console.log(`  [${b.id}] ${b.name} | public: ${b.public} | size: ${b.allowedMimeType}`));

  // Check if lesson-media bucket exists and what's in it
  const mediaBucket = buckets?.find(b => b.name === 'lesson-media' || b.name === 'media' || b.name === 'illustrations' || b.name === 'images');
  if (mediaBucket) {
    console.log(`\n=== CONTENTS OF "${mediaBucket.name}" ===`);
    const { data: files, error: listError } = await db.storage.from(mediaBucket.name).list('', { limit: 20 });
    if (listError) console.log('List error:', listError.message);
    files?.slice(0, 10).forEach(f => console.log(`  ${f.name} (${f.metadata?.size || '?'} bytes)`));
    if (files && files.length > 10) console.log(`  ... and ${files.length - 10} more`);
  }

  // Also check existing journey data for any image URLs already stored
  const { data: sampleJourneys } = await db.from('Lesson')
    .select('id, title, contentBlocks')
    .not('contentBlocks', 'is', null)
    .limit(5);
  
  console.log('\n=== SAMPLE CONTENTBLOCKS STRUCTURE ===');
  for (const l of sampleJourneys || []) {
    try {
      const cb = JSON.parse(l.contentBlocks || '{}');
      const journey = cb.studentJourney || [];
      if (journey.length > 0) {
        const step = journey[0];
        console.log(`\n"${l.title}":`);
        console.log('  Step 0 keys:', Object.keys(step));
        if (step.media) console.log('  step.media:', JSON.stringify(step.media).substring(0, 200));
        if (step.illustrationPrompt) console.log('  illustrationPrompt:', step.illustrationPrompt.substring(0, 80));
        // Check for any image URLs
        const text = JSON.stringify(step);
        const urlMatch = text.match(/https?:\/\/[^\s"']+\.(?:png|jpg|jpeg|gif|webp|svg)[^\s"']*/gi);
        if (urlMatch) console.log('  Image URLs found:', urlMatch);
      }
    } catch(e) {}
  }

  // Count lessons that have any images in their journeys
  const { data: allWithJourneys } = await db.from('Lesson')
    .select('id, title, contentBlocks')
    .not('studentJourney', 'is', null)
    .limit(500);
  
  let withImages = 0, total = 0;
  for (const l of allWithJourneys || []) {
    try {
      const cb = JSON.parse(l.contentBlocks || '{}');
      const journey = cb.studentJourney || [];
      if (journey.length > 0) {
        total++;
        const text = JSON.stringify(journey);
        if (text.includes('http') && (text.includes('.png') || text.includes('.jpg') || text.includes('.webp') || text.includes('supabase'))) {
          withImages++;
        }
      }
    } catch(e) {}
  }
  console.log(`\nLessons with journeys: ${total}`);
  console.log(`Lessons with image URLs in journeys: ${withImages}`);

  // Also get English theme lessons count
  const engThemeId = 'fcc3f282-50ad-47f4-8a40-9f9ea20a126b';
  const { data: engQuests } = await db.from('Quest').select('id').eq('themeId', engThemeId);
  const engQuestIds = engQuests?.map(q => q.id) || [];
  if (engQuestIds.length > 0) {
    const { data: engLessons } = await db.from('Lesson').select('id, title, contentBlocks, questId').in('questId', engQuestIds).order('orderIndex');
    let engWithJourney = 0, engWithImages = 0;
    for (const l of engLessons || []) {
      try {
        const cb = JSON.parse(l.contentBlocks || '{}');
        if (cb.studentJourney?.length > 0) {
          engWithJourney++;
          const text = JSON.stringify(cb.studentJourney);
          if (text.includes('http') && (text.includes('.png') || text.includes('.jpg') || text.includes('.webp'))) engWithImages++;
        }
      } catch(e) {}
    }
    console.log(`\nEnglish lessons: ${engLessons?.length || 0} | with journey: ${engWithJourney} | with images: ${engWithImages}`);
  }
}

main().catch(e => console.error('ERROR:', e.message));
