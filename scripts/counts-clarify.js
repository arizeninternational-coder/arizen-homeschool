#!/usr/bin/env node
const fs = require('fs');
const env = {};
fs.readFileSync('.env','utf-8').split('\n').forEach(l => { const t=l.trim(); if(!t||t.startsWith('#'))return; const i=t.indexOf('='); if(i===-1)return; env[t.slice(0,i).trim()]=t.slice(i+1).trim().replace(/^['"]|['"]$/g,''); });
const { createClient } = require('@supabase/supabase-js');
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function main() {
  // Get all Grade 2 themes
  const { data: g2Themes } = await db.from('Theme').select('id, title, slug').eq('grade', 2);
  console.log('Grade 2 themes:', g2Themes?.length);
  g2Themes?.forEach(t => console.log(`  - ${t.title} (${t.slug})`));

  // Get all quests under Grade 2 themes
  const themeIds = g2Themes?.map(t => t.id) || [];
  const { data: g2Quests } = await db.from('Quest').select('id, title, themeId').in('themeId', themeIds);
  console.log('\nGrade 2 quests:', g2Quests?.length);

  // Get all lessons under Grade 2 quests
  const questIds = g2Quests?.map(q => q.id) || [];
  const { data: g2Lessons } = await db.from('Lesson').select('id, title, status, contentBlocks, questId').in('questId', questIds);
  console.log('Grade 2 lessons:', g2Lessons?.length);

  // Count by status
  const byStatus = {};
  for (const l of g2Lessons || []) {
    byStatus[l.status] = (byStatus[l.status] || 0) + 1;
  }
  console.log('\nBy status:', byStatus);

  // Count with/without journeys
  let withJ = 0, withoutJ = 0;
  for (const l of g2Lessons || []) {
    let meta = {};
    try { meta = JSON.parse(l.contentBlocks || '{}'); } catch(e) {}
    if (Array.isArray(meta.studentJourneyDraft) && meta.studentJourneyDraft.length > 0) withJ++;
    else withoutJ++;
  }
  console.log(`With journey: ${withJ} | Without: ${withoutJ}`);

  // Count by theme
  const byTheme = {};
  for (const l of g2Lessons || []) {
    const quest = g2Quests?.find(q => q.id === l.questId);
    const theme = g2Themes?.find(t => t.id === quest?.themeId);
    const themeName = theme?.title || 'unknown';
    if (!byTheme[themeName]) byTheme[themeName] = { total: 0, withJ: 0, withoutJ: 0 };
    byTheme[themeName].total++;
    let meta = {};
    try { meta = JSON.parse(l.contentBlocks || '{}'); } catch(e) {}
    if (Array.isArray(meta.studentJourneyDraft) && meta.studentJourneyDraft.length > 0) byTheme[themeName].withJ++;
    else byTheme[themeName].withoutJ++;
  }

  console.log('\n=== BY THEME ===');
  let grandTotal = 0, grandWith = 0, grandWithout = 0;
  for (const [theme, data] of Object.entries(byTheme).sort((a,b) => b[1].total - a[1].total)) {
    console.log(`${theme}: ${data.total} total | ${data.withJ} with journey | ${data.withoutJ} without`);
    grandTotal += data.total; grandWith += data.withJ; grandWithout += data.withoutJ;
  }
  console.log(`\nGRAND TOTAL: ${grandTotal} lessons | ${grandWith} with journeys | ${grandWithout} without`);

  // Now count ALL lessons in the database (not filtered by grade 2 themes)
  const { count: allLessonCount } = await db.from('Lesson').select('id', { count: 'exact', head: true });
  console.log('\n=== ALL LESSONS IN DATABASE ===');
  console.log('Total lessons (all grades):', allLessonCount);

  // Count lessons with grade in contentBlocks
  const { data: sampleLessons } = await db.from('Lesson').select('id, contentBlocks').limit(1000);
  let grade2ByContent = 0, grade5ByContent = 0, otherGrade = 0, noGrade = 0;
  for (const l of sampleLessons || []) {
    let meta = {};
    try { meta = JSON.parse(l.contentBlocks || '{}'); } catch(e) {}
    if (meta.grade === 2 || meta.grade === 'Grade 2') grade2ByContent++;
    else if (meta.grade === 5 || meta.grade === 'Grade 5') grade5ByContent++;
    else if (meta.grade) otherGrade++;
    else noGrade++;
  }
  console.log('\nBy contentBlocks.grade field (sample):');
  console.log(`  Grade 2: ${grade2ByContent}`);
  console.log(`  Grade 5: ${grade5ByContent}`);
  console.log(`  Other grade: ${otherGrade}`);
  console.log(`  No grade field: ${noGrade}`);
}
main().catch(e => console.error(e));
