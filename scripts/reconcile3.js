#!/usr/bin/env node
/**
 * Find the exact theme slug used for Grade 2 English on the subject curriculum page
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

async function main() {
  // Find all Grade 2 themes
  const { data: themes } = await db.from('Theme').select('id, title, slug, grade').eq('grade', 2);
  console.log('Grade 2 themes:');
  for (const t of themes) {
    console.log(`  slug="${t.slug}" title="${t.title}" id=${t.id}`);
  }

  // The subject curriculum page uses subjectSlug "english" which maps to "English"
  // theme slug = g2-english
  const targetSlug = 'g2-english';
  const targetTheme = themes.find(t => t.slug === targetSlug);
  console.log(`\nTarget theme (${targetSlug}):`, targetTheme ? 'FOUND' : 'NOT FOUND');

  if (targetTheme) {
    // Get quests for this theme
    const { data: quests } = await db.from('Quest').select('id, title, themeId').eq('themeId', targetTheme.id);
    console.log(`Quests for theme: ${quests.length}`);
    
    if (quests.length > 0) {
      const questIds = quests.map(q => q.id);
      const { data: lessons } = await db.from('Lesson').select('id, title, slug, status, orderIndex, contentBlocks').in('questId', questIds).order('orderIndex');
      console.log(`Lessons: ${lessons.length}`);
      
      // Check subject field
      const subjectCounts = {};
      for (const l of lessons) {
        try {
          const cb = JSON.parse(l.contentBlocks);
          const subj = cb?.subject || 'unknown';
          subjectCounts[subj] = (subjectCounts[subj] || 0) + 1;
        } catch { subjectCounts['parse_error'] = (subjectCounts['parse_error'] || 0) + 1; }
      }
      console.log('Subject breakdown:', subjectCounts);
      
      // List first 10 lessons
      console.log('\nFirst 10 lessons:');
      for (const l of lessons.slice(0, 10)) {
        let subject = '', strand = '', term = '';
        try {
          const cb = JSON.parse(l.contentBlocks);
          subject = cb?.subject || '';
          strand = cb?.strand || '';
          term = cb?.term || '';
        } catch { /* skip */ }
        console.log(`  [${l.status}] ord=${l.orderIndex} | ${l.title} | ${subject} | ${strand} | ${term}`);
      }
    }
  }

  // Also check: what does the seed-curriculum create for English?
  // The seed uses subject "English Language Activities" with strands like "Listening and Speaking"
  // The theme slug would be: g2-english-language-activities
  const englishLATheme = themes.find(t => t.slug.includes('english'));
  console.log(`\nEnglish-related themes:`);
  for (const t of themes) {
    if (t.slug.toLowerCase().includes('english')) {
      console.log(`  slug="${t.slug}" title="${t.title}"`);
      
      const { data: quests } = await db.from('Quest').select('id, title').eq('themeId', t.id);
      if (quests.length > 0) {
        const qIds = quests.map(q => q.id);
        const { data: lessons } = await db.from('Lesson').select('id, title, orderIndex').in('questId', qIds).order('orderIndex');
        console.log(`    Lessons: ${lessons.length}`);
      }
    }
  }
}

main().catch(e => { console.error(e); process.exit(1); });
