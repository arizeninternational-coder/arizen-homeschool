#!/usr/bin/env node
/**
 * CRITICAL FIX: Populate ThemeSubject table and fix theme/quest status
 * 
 * ROOT CAUSE: ThemeSubject table has 0 records, causing:
 * - My Subjects page to show no subjects
 * - Quests page to show no quests
 * - Student dashboard to show no lessons
 * 
 * Also fixes:
 * - Theme status (must be PUBLISHED for students to see)
 * - Quest status (must be PUBLISHED for students to see)
 */
const fs = require('fs');
const env = {};
fs.readFileSync('.env','utf-8').split('\n').forEach(l => { const t=l.trim(); if(!t||t.startsWith('#'))return; const i=t.indexOf('='); if(i===-1)return; env[t.slice(0,i).trim()]=t.slice(i+1).trim().replace(/^['\"]|['\"]$/g,''); });
const { createClient } = require('@supabase/supabase-js');
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Map themes to their canonical CBC subject names
const THEME_SUBJECT_MAP = {
  'g2-english': ['English'],
  'g2-kiswahili': ['Kiswahili'],
  'g2-mathematics': ['Mathematics'],
  'g2-environmental': ['Environmental Activities'],
  'g2-hygiene-nutrition': ['Hygiene and Nutrition'],
  'g2-movement': ['Movement and Creative Activities'],
  'g2-english-language-activities': ['English Language Activities'],
  'g2-cre': ['Christian Religious Education'],
  'g2-literacy': ['Literacy'],
  'g2-digital-literacy': ['Digital Literacy'],
  'g2-story-time-2': ['English'],
  'g2-weather-watchers-2': ['Environmental Activities'],
  'g2-my-healthy-body-2': ['Hygiene and Nutrition'],
  'g2-moving-grooving-2': ['Movement and Creative Activities'],
  'g2-numbers-everyday-2': ['Mathematics'],
  'g2-measuring-world-2': ['Mathematics'],
  'g2-shape-detectives-2': ['Mathematics'],
};

async function main() {
  console.log('=== CRITICAL FIX: ThemeSubject + Theme/Quest Status ===\n');
  
  // Step 1: Get all Grade 2 themes
  const { data: themes } = await db.from('Theme').select('id, title, slug, status').eq('grade', 2);
  if (!themes?.length) { console.log('No Grade 2 themes found'); return; }
  
  console.log('Found ' + themes.length + ' Grade 2 themes');
  
  // Step 2: Set all Grade 2 themes to PUBLISHED
  let themesPublished = 0;
  for (const theme of themes) {
    if (theme.status !== 'PUBLISHED') {
      const { error } = await db.from('Theme').update({ status: 'PUBLISHED' }).eq('id', theme.id);
      if (!error) themesPublished++;
    }
  }
  console.log('Step 1: Published ' + themesPublished + ' themes');
  
  // Step 3: Populate ThemeSubject
  let subjectsCreated = 0;
  for (const theme of themes) {
    const subjects = THEME_SUBJECT_MAP[theme.slug];
    if (!subjects) {
      console.log('  WARNING: No subject mapping for theme: ' + theme.slug);
      continue;
    }
    
    for (const subject of subjects) {
      // Check if already exists
      const { data: existing } = await db.from('ThemeSubject')
        .select('id')
        .eq('themeId', theme.id)
        .eq('subject', subject)
        .maybeSingle();
      
      if (!existing) {
        const { error } = await db.from('ThemeSubject').insert({ themeId: theme.id, subject });
        if (!error) subjectsCreated++;
      }
    }
  }
  console.log('Step 2: Created ' + subjectsCreated + ' ThemeSubject records');
  
  // Step 4: Set all Grade 2 quests to PUBLISHED
  const { data: quests } = await db.from('Quest').select('id, status').in('themeId', themes.map(t=>t.id));
  let questsPublished = 0;
  for (const quest of quests || []) {
    if (quest.status !== 'PUBLISHED') {
      const { error } = await db.from('Quest').update({ status: 'PUBLISHED' }).eq('id', quest.id);
      if (!error) questsPublished++;
    }
  }
  console.log('Step 3: Published ' + questsPublished + ' quests');
  
  // Step 5: Verify
  const { data: tsCount } = await db.from('ThemeSubject').select('id');
  console.log('\n=== VERIFICATION ===');
  console.log('ThemeSubject records: ' + (tsCount?.length || 0));
  
  const { data: publishedThemes } = await db.from('Theme').select('id').eq('grade', 2).eq('status', 'PUBLISHED');
  console.log('Published themes: ' + (publishedThemes?.length || 0));
  
  const { data: publishedQuests } = await db.from('Quest').select('id').in('themeId', themes.map(t=>t.id)).eq('status', 'PUBLISHED');
  console.log('Published quests: ' + (publishedQuests?.length || 0));
}
main().catch(e => console.error(e));
