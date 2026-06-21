#!/usr/bin/env node
/**
 * GRADE 2 JOURNEY CONTAMINATION AUDIT — READ-ONLY (v3)
 *
 * Handles: legacy array, structured object, and JSON string contentBlocks.
 * NO Supabase writes.
 */

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
  let v = t.slice(i + 1).trim().replace(/^['"]|['"]$/g, '');
  envVars[t.slice(0, i).trim()] = v;
});

const { createClient } = require('@supabase/supabase-js');
const db = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// ── Subject contamination rules ──
const SUBJECT_RULES = {
  mathematics: {
    forbiddenPhrases: [
      'reading comprehension', 'read a short passage', 'main idea of the story',
      'good readers', 'letter sound', 'syllable', 'grammar', 'noun', 'verb',
      'article', 'preposition', 'listening for key ideas', 'vocabulary and pronunciation',
      'english language', 'words say', 'sentence about', 'write a sentence about',
      'what happened in the story', 'who is the character', 'what is the setting',
      'retell the story', 'favorite part of the story', 'what did you learn about reading',
      'what did you learn about writing', 'spelling words', 'handwriting practice',
      'listen and repeat', 'say the sounds', 'phonics', 'blend the sounds',
      'healthy habits', 'wash your hands', 'brush your teeth', 'eat healthy',
      'exercise', 'stretch', 'jump', 'run', 'movement challenge',
      'living things', 'non-living things', 'plant', 'animal habitat',
      'weather', 'season', 'water cycle',
    ],
    name: 'Mathematics',
  },
  english: {
    forbiddenPhrases: [
      'addition and subtraction', 'number pattern', 'place value', 'tens and ones',
      'fraction', 'half of', 'quarter of', 'equal parts', 'numerator', 'denominator',
      'multiply', 'divide', 'times table', 'multiplication', 'division',
      'measure the length', 'weigh', 'ruler', 'scale', 'clock face', 'hours and minutes',
      'shillings', 'coins', 'money', 'price', 'cost',
      'shape has', 'sides and corners', 'circle', 'triangle', 'rectangle', 'square',
      'graph', 'data', 'tally',
    ],
    name: 'English',
  },
  kiswahili: { forbiddenPhrases: [], name: 'Kiswahili' },
  environmental: {
    forbiddenPhrases: [
      'reading comprehension', 'main idea', 'what happened in the story',
      'addition', 'subtraction', 'fraction', 'multiply', 'divide',
      'letter sound', 'syllable', 'grammar', 'noun', 'verb',
    ],
    name: 'Environmental',
  },
  hygiene: {
    forbiddenPhrases: [
      'reading comprehension', 'main idea', 'what happened in the story',
      'addition', 'subtraction', 'fraction', 'multiply', 'divide',
      'letter sound', 'syllable', 'grammar',
    ],
    name: 'Hygiene & Nutrition',
  },
  movement: {
    forbiddenPhrases: [
      'reading comprehension', 'main idea', 'what happened in the story',
      'addition', 'subtraction', 'fraction', 'multiply', 'divide',
      'letter sound', 'syllable', 'grammar',
    ],
    name: 'Movement & Creative',
  },
};

const GENERIC_PHRASES = [
  'here is what you need to know', 'this is an example sentence',
  'we use this every day', 'take a moment to think',
  "let's learn about this topic", 'this is important for your learning',
  'you will learn many things', 'this is a very important skill',
  'keep practicing and you will get better', 'great job today',
  'you are doing well', 'let us begin', 'are you ready',
  'pay attention', 'listen carefully',
];

// ── Helpers ──

function normalizeSubject(s) {
  if (!s) return '';
  const low = s.toLowerCase().trim();
  if (low.includes('math')) return 'mathematics';
  if (low.includes('english') || low.includes('language activities')) return 'english';
  if (low.includes('kiswahili')) return 'kiswahili';
  if (low.includes('environmental')) return 'environmental';
  if (low.includes('hygiene') || low.includes('nutrition')) return 'hygiene';
  if (low.includes('movement') || low.includes('creative')) return 'movement';
  return low;
}

function parseCB(cb) {
  if (!cb) return null;
  if (typeof cb === 'string') {
    try { return JSON.parse(cb); } catch(e) { return null; }
  }
  if (typeof cb === 'object') {
    if (Array.isArray(cb)) return null; // legacy array format
    const keys = Object.keys(cb);
    if (keys.length > 0 && /^\d+$/.test(keys[0])) return null; // legacy numeric-key format
    return cb;
  }
  return null;
}

function getJourneySteps(structured, source) {
  if (!structured) return [];
  const raw = source === 'draft' ? structured.studentJourneyDraft : structured.studentJourney;
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object' && Array.isArray(raw.steps)) return raw.steps;
  return [];
}

function getAllText(steps) {
  const texts = [];
  for (const step of steps) {
    if (step.owlText) texts.push(step.owlText.toLowerCase());
    if (step.studentText) texts.push(step.studentText.toLowerCase());
    if (step.interaction) {
      if (step.interaction.question) texts.push(step.interaction.question.toLowerCase());
      if (step.interaction.prompt) texts.push(step.interaction.prompt.toLowerCase());
      if (step.interaction.options) {
        for (const opt of step.interaction.options) texts.push(String(opt).toLowerCase());
      }
    }
    if (step.title) texts.push(step.title.toLowerCase());
  }
  return texts.join(' ');
}

function checkContamination(allText, subjectRule) {
  const flags = [];
  if (!subjectRule) return flags;
  for (const phrase of subjectRule.forbiddenPhrases) {
    if (allText.includes(phrase.toLowerCase())) flags.push(`FORBIDDEN: "${phrase}"`);
  }
  return flags;
}

function checkGeneric(allText) {
  const flags = [];
  for (const phrase of GENERIC_PHRASES) {
    if (allText.includes(phrase.toLowerCase())) flags.push(`GENERIC: "${phrase}"`);
  }
  return flags;
}

function checkDuplicates(steps) {
  const flags = [];
  for (const step of steps) {
    const owl = (step.owlText || '').toLowerCase().trim();
    const student = (step.studentText || '').toLowerCase().trim();
    if (owl && student && owl === student && owl.length > 20)
      flags.push(`DUPLICATE: step "${step.stepType}"`);
  }
  return flags;
}

function checkWeakPractice(steps) {
  const flags = [];
  for (const step of steps) {
    if (step.stepType === 'practice') {
      const student = (step.studentText || '').toLowerCase().trim();
      const hasIx = step.interaction && step.interaction.type && step.interaction.type !== 'none';
      if ((!student || student === 'practice' || student.length < 10) && !hasIx)
        flags.push('WEAK_PRACTICE');
    }
  }
  return flags;
}

function checkQC(steps) {
  const flags = [];
  for (const step of steps) {
    if (step.stepType === 'quick_check' && step.interaction) {
      const ix = step.interaction;
      if (ix.type === 'multiple_choice' || ix.type === 'choice') {
        if (ix.correctIndex === undefined || ix.correctIndex === null) flags.push('QC_NO_CORRECT_INDEX');
        if (!ix.options || ix.options.length < 2) flags.push('QC_TOO_FEW_OPTIONS');
        if (ix.correctIndex !== undefined && ix.options && step.owlText) {
          const correctOpt = ix.options[ix.correctIndex];
          if (correctOpt && step.owlText.toLowerCase().includes(String(correctOpt).toLowerCase()))
            flags.push('QC_ANSWER_LEAK');
        }
      }
    }
  }
  return flags;
}

function checkReflection(steps, subject) {
  const flags = [];
  for (const step of steps) {
    if (step.stepType === 'reflect') {
      const text = getAllText([step]);
      const sub = normalizeSubject(subject);
      if (sub === 'mathematics' && (text.includes('reading') || text.includes('story') || text.includes('passage')))
        flags.push('REFLECTION_MISMATCH: Math asks about reading');
      if (sub === 'english' && (text.includes('subtract') || text.includes('fraction') || text.includes('number pattern')))
        flags.push('REFLECTION_MISMATCH: English asks about math');
    }
  }
  return flags;
}

function classifyJourney(steps, subject) {
  if (!steps || steps.length === 0) return { flags: [], severity: 'empty' };
  const allText = getAllText(steps);
  const sub = normalizeSubject(subject);
  const rule = SUBJECT_RULES[sub];
  const flags = [
    ...checkContamination(allText, rule),
    ...checkGeneric(allText),
    ...checkDuplicates(steps),
    ...checkWeakPractice(steps),
    ...checkQC(steps),
    ...checkReflection(steps, sub),
  ];
  const critical = flags.filter(f => f.startsWith('FORBIDDEN:'));
  const high = flags.filter(f => f.startsWith('QC_') || f.startsWith('REFLECTION_MIS'));
  const medium = flags.filter(f => f.startsWith('GENERIC:') || f.startsWith('WEAK_') || f.startsWith('DUPLICATE:'));
  let severity = 'clean';
  if (critical.length > 0) severity = 'contaminated';
  else if (high.length > 0) severity = 'suspicious';
  else if (medium.length >= 3) severity = 'suspicious';
  else if (medium.length > 0) severity = 'likely_clean';
  return { flags, severity };
}

// ── Main ──

async function main() {
  console.log('=== GRADE 2 JOURNEY CONTAMINATION AUDIT v3 ===\n');

  // Fetch Grade 2 themes
  const { data: themes } = await db.from('Theme').select('id, title').eq('grade', 2);
  console.log(`Grade 2 themes: ${themes.length}`);

  // Fetch theme subjects
  const { data: themeSubjects } = await db
    .from('ThemeSubject').select('themeId, subject')
    .in('themeId', themes.map(t => t.id));
  const subjectByTheme = {};
  for (const ts of (themeSubjects || [])) subjectByTheme[ts.themeId] = ts.subject;

  // Fetch quests
  const { data: quests } = await db
    .from('Quest').select('id, title, themeId')
    .in('themeId', themes.map(t => t.id));
  console.log(`Grade 2 quests: ${quests.length}`);
  const questTheme = {};
  for (const q of quests) questTheme[q.id] = q.themeId;

  // Fetch ALL lessons for these quests (paginated)
  let allLessons = [];
  let from = 0;
  const batchSize = 500;
  while (true) {
    const { data } = await db
      .from('Lesson')
      .select('id, title, slug, status, contentBlocks, orderIndex, questId')
      .in('questId', quests.map(q => q.id))
      .range(from, from + batchSize - 1)
      .order('orderIndex', { ascending: true });
    if (!data || data.length === 0) break;
    allLessons = allLessons.concat(data);
    from += batchSize;
    if (data.length < batchSize) break;
  }
  console.log(`Grade 2 lessons: ${allLessons.length}\n`);

  // Audit
  const results = [];
  let countClean = 0, countLikelyClean = 0, countSuspicious = 0, countContaminated = 0, countEmpty = 0, countLegacy = 0;
  const bySubject = {};

  for (const lesson of allLessons) {
    const structured = parseCB(lesson.contentBlocks);
    const themeId = questTheme[lesson.questId];
    const themeSubject = subjectByTheme[themeId] || '';
    const cbSubject = structured ? (structured.curriculum?.subject || structured.subject || '') : '';
    const subject = cbSubject || themeSubject || 'Unknown';
    const sub = normalizeSubject(subject);

    if (!bySubject[sub]) bySubject[sub] = { total: 0, contaminated: 0, suspicious: 0, clean: 0, empty: 0, legacy: 0 };
    bySubject[sub].total++;

    if (!structured) {
      countLegacy++;
      bySubject[sub].legacy++;
      results.push({
        lessonId: lesson.id, title: lesson.title, slug: lesson.slug,
        subject, strand: '', subStrand: '', learningOutcome: '',
        status: lesson.status, journeySource: 'legacy',
        pubStepCount: 0, draftStepCount: 0,
        pubSeverity: 'legacy', draftSeverity: 'legacy', worstSeverity: 'legacy',
        pubFlags: [], draftFlags: [], sampleText: '',
      });
      continue;
    }

    const strand = structured.curriculum?.strand || structured.strand || '';
    const subStrand = structured.curriculum?.subStrand || structured.subStrand || '';
    const lo = structured.curriculum?.specificLearningOutcome || structured.learningOutcome || '';

    const pubSteps = getJourneySteps(structured, 'published');
    const draftSteps = getJourneySteps(structured, 'draft');
    const pubResult = classifyJourney(pubSteps, subject);
    const draftResult = classifyJourney(draftSteps, subject);

    let journeySource = 'none';
    if (pubSteps.length > 0 && draftSteps.length > 0) journeySource = 'both';
    else if (pubSteps.length > 0) journeySource = 'published';
    else if (draftSteps.length > 0) journeySource = 'draft';

    const worstSeverity = ['contaminated','suspicious','likely_clean','clean','empty']
      .find(s => s === pubResult.severity || s === draftResult.severity) || 'clean';

    if (worstSeverity === 'contaminated') { countContaminated++; bySubject[sub].contaminated++; }
    else if (worstSeverity === 'suspicious') { countSuspicious++; bySubject[sub].suspicious++; }
    else if (worstSeverity === 'likely_clean') { countLikelyClean++; bySubject[sub].clean++; }
    else if (worstSeverity === 'clean') { countClean++; bySubject[sub].clean++; }
    else { countEmpty++; bySubject[sub].empty++; }

    results.push({
      lessonId: lesson.id, title: lesson.title, slug: lesson.slug,
      subject, strand, subStrand, learningOutcome: lo.substring(0, 120),
      status: lesson.status, journeySource,
      pubStepCount: pubSteps.length, draftStepCount: draftSteps.length,
      pubSeverity: pubResult.severity, draftSeverity: draftResult.severity,
      worstSeverity, pubFlags: pubResult.flags, draftFlags: draftResult.flags,
      sampleText: getAllText(pubSteps.slice(0, 3)).substring(0, 200),
    });
  }

  // ── Output ──
  const csvDir = path.join(__dirname, '..', 'docs', 'audits');
  if (!fs.existsSync(csvDir)) fs.mkdirSync(csvDir, { recursive: true });

  const csvHeaders = ['lessonId','title','slug','subject','strand','subStrand','learningOutcome','status','journeySource','pubStepCount','draftStepCount','pubSeverity','draftSeverity','worstSeverity','pubFlags','draftFlags','sampleText'];
  const csvRows = results.map(r => csvHeaders.map(h => {
    const val = r[h] || '';
    const str = Array.isArray(val) ? val.join('; ') : String(val);
    return '"' + str.replace(/"/g, '""').replace(/\n/g, ' ') + '"';
  }).join(','));
  fs.writeFileSync(path.join(csvDir, 'grade-2-journey-contamination-report.csv'), [csvHeaders.join(','), ...csvRows].join('\n'));
  fs.writeFileSync(path.join(csvDir, 'grade-2-contaminated-lessons.json'), JSON.stringify(results, null, 2));

  // Summary
  const contaminated = results.filter(r => r.worstSeverity === 'contaminated');
  const suspicious = results.filter(r => r.worstSeverity === 'suspicious');
  const publishedEmpty = results.filter(r => r.status === 'PUBLISHED' && r.pubStepCount === 0 && r.worstSeverity !== 'legacy');
  const top20 = [...contaminated, ...suspicious].sort((a,b) => {
    const s = { contaminated: 0, suspicious: 1, likely_clean: 2, clean: 3, empty: 4, legacy: 5 };
    return (s[a.worstSeverity]||6) - (s[b.worstSeverity]||6);
  }).slice(0, 20);

  const totalStructured = results.length - countLegacy;
  const summary = `# Grade 2 Journey Contamination Audit Summary

**Date**: ${new Date().toISOString()}
**Total Grade 2 lessons**: ${results.length}
**Legacy format (no journey)**: ${countLegacy}
**With structured contentBlocks**: ${totalStructured}

## Severity Breakdown (structured lessons)

| Severity | Count | % structured |
|----------|-------|-------------|
| Contaminated | ${countContaminated} | ${totalStructured > 0 ? ((countContaminated/totalStructured)*100).toFixed(1) : 0}% |
| Suspicious | ${countSuspicious} | ${totalStructured > 0 ? ((countSuspicious/totalStructured)*100).toFixed(1) : 0}% |
| Likely Clean | ${countLikelyClean} | ${totalStructured > 0 ? ((countLikelyClean/totalStructured)*100).toFixed(1) : 0}% |
| Clean | ${countClean} | ${totalStructured > 0 ? ((countClean/totalStructured)*100).toFixed(1) : 0}% |
| Empty (no journey) | ${countEmpty} | ${totalStructured > 0 ? ((countEmpty/totalStructured)*100).toFixed(1) : 0}% |

## By Subject

| Subject | Total | Legacy | Structured | Contaminated | Suspicious | Clean+Likely | Empty |
|---------|-------|--------|-----------|-------------|------------|-------------|-------|
${Object.entries(bySubject).map(([sub,c]) => `| ${SUBJECT_RULES[sub]?.name||sub} | ${c.total} | ${c.legacy} | ${c.total-c.legacy} | ${c.contaminated} | ${c.suspicious} | ${c.clean} | ${c.empty} |`).join('\n')}

## Published-Empty Issues

**PUBLISHED with empty studentJourney**: ${publishedEmpty.length}
${publishedEmpty.slice(0,15).map(r => `- ${r.title} (${r.subject}) [${r.lessonId}]${r.draftStepCount > 0 ? ` — has ${r.draftStepCount} draft steps` : ''}`).join('\n') || 'None'}

## Top 20 Most Urgent

| # | Title | Subject | Severity | Flags |
|---|-------|---------|----------|-------|
${top20.map((r,i) => `| ${i+1} | ${r.title} | ${r.subject} | ${r.worstSeverity} | ${(r.pubFlags.concat(r.draftFlags)).slice(0,3).join('; ').substring(0,100)} |`).join('\n') || 'None'}

## Contamination Examples

${contaminated.slice(0,10).map((r,i) => `### ${i+1}. ${r.title} (${r.subject})
**Flags**: ${r.pubFlags.concat(r.draftFlags).join('; ')}
**Sample**: "${r.sampleText.substring(0,150)}"
`).join('\n') || 'None found'}
`;

  fs.writeFileSync(path.join(csvDir, 'grade-2-journey-contamination-summary.md'), summary);

  // Console
  console.log('=== AUDIT COMPLETE ===\n');
  console.log(`Total: ${results.length} | Legacy: ${countLegacy} | Structured: ${totalStructured}`);
  console.log(`Contaminated: ${countContaminated} | Suspicious: ${countSuspicious} | LikelyClean: ${countLikelyClean} | Clean: ${countClean} | Empty: ${countEmpty}`);
  for (const [sub,c] of Object.entries(bySubject)) {
    console.log(`  ${sub}: ${c.total} (${c.legacy} legacy) — ${c.contaminated}C ${c.suspicious}S ${c.clean}OK ${c.empty}E`);
  }
  console.log(`\nPublished-empty: ${publishedEmpty.length}`);
  if (top20.length > 0) {
    console.log(`\nTop urgent:`);
    top20.slice(0,10).forEach((r,i) => {
      console.log(`  ${i+1}. [${r.worstSeverity}] ${r.title} (${r.subject})`);
      r.pubFlags.concat(r.draftFlags).slice(0,2).forEach(f => console.log(`     - ${f}`));
    });
  }
  console.log(`\nOutput: ${csvDir}/grade-2-journey-contamination-{report.csv,summary.md,lessons.json}`);
}

main().catch(err => { console.error('FATAL:', err); process.exit(1); });
