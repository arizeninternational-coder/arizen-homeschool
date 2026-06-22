#!/usr/bin/env node
const fs = require('fs');
const env = {};
fs.readFileSync('.env','utf-8').split('\n').forEach(l => { const t=l.trim(); if(!t||t.startsWith('#'))return; const i=t.indexOf('='); if(i===-1)return; env[t.slice(0,i).trim()]=t.slice(i+1).trim().replace(/^['"]|['"]$/g,''); });
const { createClient } = require('@supabase/supabase-js');
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function main() {
  console.log('=== GRADE 2 LESSON SHELL INTEGRITY AUDIT ===\n');

  // Get all Grade 2 themes and their subjects
  const { data: themes } = await db.from('Theme').select('id, title, slug').eq('grade', 2);
  const { data: quests } = await db.from('Quest').select('id, title, themeId').in('themeId', themes?.map(t=>t.id)||[]);
  const { data: lessons } = await db.from('Lesson').select('*').in('questId', quests?.map(q=>q.id)||[]);

  console.log('Total lessons: ' + (lessons?.length || 0));

  // A. Counts by subject
  const bySubject = {};
  for (const l of lessons || []) {
    let meta = {};
    try { meta = JSON.parse(l.contentBlocks || '{}'); } catch(e) {}
    const subject = meta.strand || meta.subject || 'unknown';
    if (!bySubject[subject]) bySubject[subject] = { total: 0, withJourney: 0, withoutJourney: 0, draft: 0, review: 0, published: 0, titles: [] };
    bySubject[subject].total++;
    const hasJourney = Array.isArray(meta.studentJourneyDraft) && meta.studentJourneyDraft.length > 0;
    if (hasJourney) bySubject[subject].withJourney++;
    else bySubject[subject].withoutJourney++;
    bySubject[subject][l.status.toLowerCase()] = (bySubject[subject][l.status.toLowerCase()] || 0) + 1;
    bySubject[subject].titles.push(l.title);
  }

  console.log('\\n=== A. COUNTS BY SUBJECT ===');
  for (const [subj, data] of Object.entries(bySubject).sort()) {
    console.log('\\n' + subj + ':');
    console.log('  Total: ' + data.total + ' | With journey: ' + data.withJourney + ' | Without: ' + data.withoutJourney);
    console.log('  DRAFT: ' + (data.draft||0) + ' | REVIEW: ' + (data.review||0) + ' | PUBLISHED: ' + (data.published||0));
    // Check for duplicate titles
    const dupes = data.titles.filter((t, i) => data.titles.indexOf(t) !== i);
    if (dupes.length > 0) console.log('  DUPLICATE TITLES: ' + dupes.join(', '));
    // Show sample titles
    console.log('  Sample titles:');
    data.titles.slice(0, 3).forEach(t => console.log('    - ' + t.substring(0, 80)));
  }

  // B. Required field health
  console.log('\\n=== B. REQUIRED FIELD HEALTH ===');
  const fields = ['learningOutcome', 'specificLearningOutcome', 'keyInquiryQuestion', 'suggestedLearningExperience', 'activityInstructions', 'strand', 'subStrand'];
  for (const field of fields) {
    let missing = 0, empty = 0, populated = 0;
    for (const l of lessons || []) {
      let meta = {};
      try { meta = JSON.parse(l.contentBlocks || '{}'); } catch(e) {}
      if (!(field in meta)) missing++;
      else if (!meta[field] || (typeof meta[field] === 'string' && meta[field].trim() === '')) empty++;
      else populated++;
    }
    console.log('  ' + field + ': populated=' + populated + ' empty=' + empty + ' missing=' + missing);
  }

  // C. Shell quality check — titles that look like raw objectives
  console.log('\\n=== C. SHELL QUALITY CHECK ===');
  const suspiciousTitles = [];
  for (const l of lessons || []) {
    const t = l.title || '';
    // Titles that are very long, have multiple concepts, or look like objectives
    if (t.length > 60 || t.includes(' and ') || t.includes(':') || /^(Naming|Identifying|Describing|Classifying|Measuring|Writing|Reading|Listening|Speaking)\s/i.test(t)) {
      suspiciousTitles.push({ title: t, id: l.id });
    }
  }
  console.log('Suspicious titles (raw objectives, not child-friendly): ' + suspiciousTitles.length);
  suspiciousTitles.slice(0, 10).forEach(s => console.log('  - [' + s.id.substring(0,8) + '] ' + s.title.substring(0, 100)));

  // D. Contamination check — Math content in non-Math lessons
  console.log('\\n=== D. CONTAMINATION CHECK ===');
  let mathContamination = 0;
  let englishInKiswahili = 0;
  const contaminatedSamples = [];

  for (const l of lessons || []) {
    let meta = {};
    try { meta = JSON.parse(l.contentBlocks || '{}'); } catch(e) {}
    const journey = meta.studentJourneyDraft || meta.studentJourney || [];
    const allText = journey.map(s => JSON.stringify(s)).join(' ').toLowerCase();
    const subject = (meta.strand || meta.subject || '').toLowerCase();

    const hasMathContent = allText.includes('record your measurements') || allText.includes('write down 3 things that can be measured') || allText.includes('metres') || allText.includes('kilogram');
    const isNonMath = !subject.includes('math') && !subject.includes('number') && !subject.includes('measurement') && !subject.includes('fraction');

    if (hasMathContent && isNonMath) {
      mathContamination++;
      if (contaminatedSamples.length < 5) contaminatedSamples.push({ title: l.title, subject: meta.strand, id: l.id });
    }

    const isKiswahili = subject.includes('kiswahili');
    const hasEnglishLabels = allText.includes('quick check') || allText.includes('reflection time') || allText.includes('begin 10-step') || allText.includes('back to quest');
    if (isKiswahili && hasEnglishLabels) {
      englishInKiswahili++;
    }
  }
  console.log('Non-Math lessons with Math content: ' + mathContamination);
  contaminatedSamples.forEach(s => console.log('  - [' + s.id.substring(0,8) + '] ' + s.title + ' [' + s.subject + ']'));
  console.log('Kiswahili lessons with English UI labels: ' + englishInKiswahili);

  // E. Export 5 representative lessons from each subject
  console.log('\\n=== E. SAMPLE LESSON RECORDS ===');
  const subjects = Object.keys(bySubject).sort();
  for (const subj of subjects) {
    const subjectLessons = lessons?.filter(l => {
      let meta = {};
      try { meta = JSON.parse(l.contentBlocks || '{}'); } catch(e) {}
      return (meta.strand || meta.subject || 'unknown') === subj;
    }) || [];

    console.log('\\n--- ' + subj + ' (showing up to 5) ---');
    for (const l of subjectLessons.slice(0, 5)) {
      let meta = {};
      try { meta = JSON.parse(l.contentBlocks || '{}'); } catch(e) {}
      console.log('\\n  Lesson: ' + l.title);
      console.log('  ID: ' + l.id);
      console.log('  Status: ' + l.status);
      console.log('  Strand: ' + (meta.strand || 'N/A'));
      console.log('  Sub-strand: ' + (meta.subStrand || 'N/A'));
      console.log('  Subject: ' + (meta.subject || 'N/A'));
      console.log('  Term: ' + (meta.term || 'N/A'));
      console.log('  Week: ' + (meta.week || 'N/A'));
      console.log('  Learning Outcome: ' + (meta.learningOutcome || 'N/A')?.substring(0, 100));
      console.log('  Specific LO: ' + (meta.specificLearningOutcome || 'N/A')?.substring(0, 100));
      console.log('  Key Inquiry: ' + (meta.keyInquiryQuestion || 'N/A')?.substring(0, 100));
      console.log('  Suggested Experience: ' + (meta.suggestedLearningExperience || 'N/A')?.substring(0, 100));
      console.log('  Activity Instructions: ' + (meta.activityInstructions || 'N/A')?.substring(0, 100));

      const journey = meta.studentJourneyDraft || meta.studentJourney || [];
      if (journey.length > 0) {
        console.log('  Journey steps: ' + journey.length);
        journey.forEach((step, i) => {
          console.log('    Step ' + i + ' (' + step.stepType + '):');
          console.log('      Student: ' + (step.studentText || '').substring(0, 80));
          if (step.interaction?.question) console.log('      Q: ' + step.interaction.question);
          if (step.interaction?.options) console.log('      Options: ' + step.interaction.options.join(' | '));
        });
      } else {
        console.log('  No journey');
      }
    }
  }
}
main().catch(e => console.error(e));
