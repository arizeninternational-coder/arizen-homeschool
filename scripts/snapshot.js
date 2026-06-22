#!/usr/bin/env node
const fs = require('fs');
const env = {};
fs.readFileSync('.env','utf-8').split('\n').forEach(l => { const t=l.trim(); if(!t||t.startsWith('#'))return; const i=t.indexOf('='); if(i===-1)return; env[t.slice(0,i).trim()]=t.slice(i+1).trim().replace(/^['"]|['"]$/g,''); });
const { createClient } = require('@supabase/supabase-js');
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function main() {
  const { data: themes } = await db.from('Theme').select('id, title, slug').eq('grade', 2);
  const { data: quests } = await db.from('Quest').select('id, title, themeId').in('themeId', themes?.map(t=>t.id)||[]);
  const { data: lessons } = await db.from('Lesson').select('id, title, slug, status, contentBlocks, orderIndex').in('questId', quests?.map(q=>q.id)||[]).order('orderIndex');

  // Group by subject
  const bySubject = {};
  for (const l of lessons || []) {
    let meta = {};
    try { meta = JSON.parse(l.contentBlocks || '{}'); } catch(e) {}
    const subject = meta.strand || meta.subject || 'unknown';
    if (!bySubject[subject]) bySubject[subject] = { total: 0, withJourney: 0, withoutJourney: 0, draft: 0, review: 0, published: 0 };
    bySubject[subject].total++;
    const hasJourney = Array.isArray(meta.studentJourneyDraft) && meta.studentJourneyDraft.length > 0;
    if (hasJourney) bySubject[subject].withJourney++;
    else bySubject[subject].withoutJourney++;
    const status = (l.status || 'unknown').toLowerCase();
    bySubject[subject][status] = (bySubject[subject][status] || 0) + 1;
  }

  console.log('=== LESSON DATA BY SUBJECT ===\n');
  let grandTotal = 0, grandWith = 0, grandWithout = 0, grandDraft = 0, grandReview = 0, grandPub = 0;
  for (const [subj, d] of Object.entries(bySubject).sort()) {
    console.log(subj + ':');
    console.log('  Total: ' + d.total + ' | With journey: ' + d.withJourney + ' | Without: ' + d.withoutJourney);
    console.log('  DRAFT: ' + (d.draft||0) + ' | REVIEW: ' + (d.review||0) + ' | PUBLISHED: ' + (d.published||0));
    grandTotal += d.total; grandWith += d.withJourney; grandWithout += d.withoutJourney;
    grandDraft += d.draft||0; grandReview += d.review||0; grandPub += d.published||0;
  }
  console.log('\\nGRAND TOTAL:');
  console.log('  Total: ' + grandTotal + ' | With journey: ' + grandWith + ' | Without: ' + grandWithout);
  console.log('  DRAFT: ' + grandDraft + ' | REVIEW: ' + grandReview + ' | PUBLISHED: ' + grandPub);

  // Unknown/other lessons
  console.log('\\n=== UNKNOWN/OTHER LESSONS ===');
  const unknown = lessons?.filter(l => {
    let meta = {};
    try { meta = JSON.parse(l.contentBlocks || '{}'); } catch(e) {}
    return !meta.strand && !meta.subject;
  }) || [];
  unknown.forEach(l => console.log('  [' + l.id + '] ' + l.title + ' | status=' + l.status));

  // Published without journeys
  console.log('\\n=== PUBLISHED WITHOUT JOURNEYS ===');
  const pubNoJourney = lessons?.filter(l => {
    let meta = {};
    try { meta = JSON.parse(l.contentBlocks || '{}'); } catch(e) {}
    return l.status === 'PUBLISHED' && (!Array.isArray(meta.studentJourneyDraft) || meta.studentJourneyDraft.length === 0);
  }) || [];
  console.log('Count: ' + pubNoJourney.length);
  pubNoJourney.forEach(l => {
    let meta = {};
    try { meta = JSON.parse(l.contentBlocks || '{}'); } catch(e) {}
    console.log('  [' + l.id.substring(0,8) + '] ' + l.title + ' [' + (meta.strand||'?') + ']');
  });

  // Missing key fields
  console.log('\\n=== MISSING KEY FIELDS ===');
  const fields = ['learningOutcome','specificLearningOutcome','keyInquiryQuestion','suggestedLearningExperience','activityInstructions','strand','subStrand'];
  for (const f of fields) {
    let missing = 0, empty = 0;
    for (const l of lessons || []) {
      let meta = {};
      try { meta = JSON.parse(l.contentBlocks || '{}'); } catch(e) {}
      if (!(f in meta)) missing++;
      else if (!meta[f] || (typeof meta[f] === 'string' && meta[f].trim() === '')) empty++;
    }
    console.log('  ' + f + ': missing=' + missing + ' empty=' + empty);
  }

  // Sample 1 lesson per subject with full data
  console.log('\\n=== SAMPLE LESSON PER SUBJECT ===');
  const seenSubjects = new Set();
  for (const l of lessons || []) {
    let meta = {};
    try { meta = JSON.parse(l.contentBlocks || '{}'); } catch(e) {}
    const subject = meta.strand || meta.subject || 'unknown';
    if (seenSubjects.has(subject)) continue;
    seenSubjects.add(subject);
    console.log('\\n--- ' + subject + ' ---');
    console.log('  Title: ' + l.title);
    console.log('  Strand: ' + (meta.strand || 'N/A'));
    console.log('  Sub-strand: ' + (meta.subStrand || 'N/A'));
    console.log('  Learning Outcome: ' + (meta.learningOutcome || 'N/A')?.substring(0, 150));
    console.log('  Specific LO: ' + (meta.specificLearningOutcome || 'N/A')?.substring(0, 150));
    console.log('  Key Inquiry: ' + (meta.keyInquiryQuestion || 'N/A')?.substring(0, 150));
    console.log('  Suggested Experience: ' + (meta.suggestedLearningExperience || 'N/A')?.substring(0, 150));
    console.log('  Activity Instructions: ' + (meta.activityInstructions || 'N/A')?.substring(0, 150));
    const journey = meta.studentJourneyDraft || meta.studentJourney || [];
    console.log('  Journey steps: ' + journey.length);
    if (journey.length > 0) {
      journey.forEach((s, i) => {
        console.log('    ' + i + ' (' + s.stepType + '): ' + (s.studentText||'').substring(0, 80));
      });
    }
  }
}
main().catch(e => console.error(e));
