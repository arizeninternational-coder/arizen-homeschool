#!/usr/bin/env node
const fs = require('fs');
const env = {};
fs.readFileSync('.env','utf-8').split('\n').forEach(l => { const t=l.trim(); if(!t||t.startsWith('#'))return; const i=t.indexOf('='); if(i===-1)return; env[t.slice(0,i).trim()]=t.slice(i+1).trim().replace(/^['"]|['"]$/g,''); });
const { createClient } = require('@supabase/supabase-js');
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function main() {
  const { data: allLessons } = await db.from('Lesson').select('id, title, slug, status, contentBlocks, orderIndex, questId').order('orderIndex');
  const { data: allThemes } = await db.from('Theme').select('id, title, slug, status').eq('grade', 2).order('title');
  const { data: allQuests } = await db.from('Quest').select('id, title, themeId').order('title');

  // Group lessons by theme
  const byTheme = {};
  for (const l of allLessons || []) {
    const quest = allQuests?.find(q => q.id === l.questId);
    const themeId = quest?.themeId;
    const theme = allThemes?.find(t => t.id === themeId);
    const themeName = theme?.title || 'unknown';
    if (!byTheme[themeName]) byTheme[themeName] = { quests: new Set(), lessons: 0, withJourney: 0, withoutJourney: 0 };
    byTheme[themeName].quests.add(quest?.title || 'unknown');
    let meta = {};
    try { meta = JSON.parse(l.contentBlocks || '{}'); } catch(e) {}
    const hasJourney = Array.isArray(meta.studentJourneyDraft) && meta.studentJourneyDraft.length > 0;
    byTheme[themeName].lessons++;
    if (hasJourney) byTheme[themeName].withJourney++;
    else byTheme[themeName].withoutJourney++;
  }

  console.log('=== GRADE 2 DATA INTEGRITY REPORT ===\n');
  console.log('Themes:', allThemes?.length);
  console.log('Quests:', allQuests?.length);
  console.log('Lessons:', allLessons?.length);
  
  console.log('\n=== BY THEME ===');
  let totalWith = 0, totalWithout = 0;
  for (const [theme, data] of Object.entries(byTheme).sort()) {
    console.log(`\n${theme}:`);
    console.log(`  Lessons: ${data.lessons} | With journey: ${data.withJourney} | Without: ${data.withoutJourney}`);
    console.log(`  Quests: ${[...data.quests].join(', ')}`);
    totalWith += data.withJourney;
    totalWithout += data.withoutJourney;
  }
  console.log(`\nTOTAL: ${totalWith} with journeys, ${totalWithout} without`);

  // English-specific analysis
  console.log('\n=== ENGLISH ANALYSIS ===');
  const englishLessons = allLessons?.filter(l => {
    let meta = {};
    try { meta = JSON.parse(l.contentBlocks || '{}'); } catch(e) {}
    const subj = (meta.subject || '').toLowerCase();
    const strand = (meta.strand || '').toLowerCase();
    return subj === 'english' || strand.includes('listening') || strand.includes('speaking') || strand.includes('reading') || strand.includes('writing');
  }) || [];

  console.log('Total English-related lessons:', englishLessons.length);

  // Group English by subject field
  const englishBySubject = {};
  for (const l of englishLessons) {
    let meta = {};
    try { meta = JSON.parse(l.contentBlocks || '{}'); } catch(e) {}
    const subj = meta.subject || 'unknown';
    if (!englishBySubject[subj]) englishBySubject[subj] = [];
    englishBySubject[subj].push({ title: l.title, strand: meta.strand, journey: Array.isArray(meta.studentJourneyDraft) && meta.studentJourneyDraft.length > 0 });
  }
  for (const [subj, lessons] of Object.entries(englishBySubject).sort()) {
    const withJ = lessons.filter(l => l.journey).length;
    console.log(`\n  Subject="${subj}": ${lessons.length} lessons (${withJ} with journeys)`);
    lessons.slice(0, 3).forEach(l => console.log(`    - ${l.title.substring(0, 60)} [${l.strand}]`));
  }

  // Field health for English
  console.log('\n=== ENGLISH FIELD HEALTH ===');
  const fields = ['learningOutcome','specificLearningOutcome','keyInquiryQuestion','suggestedLearningExperience','activityInstructions','strand','subStrand'];
  for (const f of fields) {
    let pop = 0, empty = 0, missing = 0;
    for (const l of englishLessons) {
      let meta = {};
      try { meta = JSON.parse(l.contentBlocks || '{}'); } catch(e) {}
      if (!(f in meta)) missing++;
      else if (!meta[f] || (typeof meta[f] === 'string' && meta[f].trim() === '')) empty++;
      else pop++;
    }
    console.log(`  ${f}: pop=${pop} empty=${empty} missing=${missing}`);
  }

  // Theme-based English (subject=English) vs ELA (subject=English Language Activities)
  const themeEnglish = englishLessons.filter(l => { try { return JSON.parse(l.contentBlocks||'{}').subject === 'english'; } catch(e) { return false; } });
  const elaEnglish = englishLessons.filter(l => { try { return JSON.parse(l.contentBlocks||'{}').subject === 'english language activities'; } catch(e) { return false; } });

  console.log(`\n=== ENGLISH VS ELA ===`);
  console.log(`English (subject='english'): ${themeEnglish.length} lessons`);
  console.log(`English Language Activities: ${elaEnglish.length} lessons`);

  // Check for overlap
  const themeTitles = new Set(themeEnglish.map(l => l.title));
  const elaTitles = new Set(elaEnglish.map(l => l.title));
  const overlap = [...themeTitles].filter(t => elaTitles.has(t));
  console.log(`Overlapping titles: ${overlap.length}`);
  if (overlap.length > 0) overlap.forEach(t => console.log(`  DUPLICATE: ${t}`));

  // Missing journeys breakdown
  console.log('\n=== 128 LESSONS WITHOUT JOURNEYS ===');
  const noJourney = allLessons?.filter(l => {
    let meta = {};
    try { meta = JSON.parse(l.contentBlocks || '{}'); } catch(e) {}
    return l.status === 'PUBLISHED' && (!Array.isArray(meta.studentJourneyDraft) || meta.studentJourneyDraft.length === 0);
  }) || [];
  
  const noJourneyByStrand = {};
  for (const l of noJourney) {
    let meta = {};
    try { meta = JSON.parse(l.contentBlocks || '{}'); } catch(e) {}
    const strand = meta.strand || meta.subject || 'unknown';
    if (!noJourneyByStrand[strand]) noJourneyByStrand[strand] = 0;
    noJourneyByStrand[strand]++;
  }
  for (const [strand, count] of Object.entries(noJourneyByStrand).sort((a,b) => b[1] - a[1])) {
    console.log(`  ${strand}: ${count}`);
  }

  // Sample records without journeys
  console.log('\n=== SAMPLE WITHOUT JOURNEYS ===');
  noJourney.slice(0, 5).forEach(l => {
    let meta = {};
    try { meta = JSON.parse(l.contentBlocks || '{}'); } catch(e) {}
    console.log(`  [${l.id.substring(0,8)}] "${l.title}" [${meta.strand||'?'}] status=${l.status}`);
  });

  // Check CSV comparison for ELA
  console.log('\n=== CSV COMPARISON (ELA) ===');
  try {
    const csv = fs.readFileSync('curriculum-shells/grade-2/english-language-activities-import.csv', 'utf-8');
    const lines = csv.split('\n').filter(l => l.trim());
    console.log(`CSV rows (incl header): ${lines.length}`);
    console.log(`CSV headers: ${lines[0]?.substring(0, 200)}`);
    if (lines.length > 1) console.log(`CSV sample: ${lines[1]?.substring(0, 200)}`);
  } catch(e) {
    console.log('Could not read CSV:', e.message);
  }
}
main().catch(e => console.error(e));
