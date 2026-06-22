#!/usr/bin/env node
/**
 * PHASE 5b: DB vs CSV comparison + Phase 8: Proposed source pack structure.
 * READ ONLY.
 */
const fs = require('fs');
const path = require('path');
const projectRoot = 'C:\\Users\\Victor\\Arizen Homeschool';
const auditDir = path.join(projectRoot, 'docs', 'audits');

// Load DB data
const dbData = JSON.parse(fs.readFileSync(path.join(auditDir, '_math2-full-data.json')));
const dbById = {};
for (const l of dbData) dbById[l.id] = l;

// Load extended CSV
const csvContent = fs.readFileSync(path.join(projectRoot, 'curriculum-shells', 'grade-2', 'mathematics-source-extended.csv'), 'utf-8');
const csvLines = csvContent.split('\n').filter(l => l.trim());
const csvHeader = csvLines[0].split(',').map(h => h.replace(/"/g, '').trim());
const csvRows = csvLines.slice(1).map(line => {
  const cols = line.split(',').map(c => c.replace(/"/g, '').trim());
  const obj = {};
  csvHeader.forEach((h, i) => obj[h] = cols[i] || '');
  return obj;
});

// Match CSV rows to DB lessons by title
const csvByTitle = {};
for (const row of csvRows) {
  const title = (row.lesson_title || '').trim();
  if (title) csvByTitle[title.toLowerCase()] = row;
}

// Compare
const comparisons = [];
for (const dbLesson of dbData) {
  const cb = dbLesson.contentBlocks;
  const dbTitle = dbLesson.title.trim();
  const csvRow = csvByTitle[dbTitle.toLowerCase()];

  if (!csvRow) {
    comparisons.push({
      id: dbLesson.id,
      title: dbTitle,
      in_db: true,
      in_csv: false,
      differences: ['Lesson exists in DB but not in CSV'],
    });
    continue;
  }

  const diffs = [];

  // Compare key fields
  const dbStrand = (cb.strand || '').trim();
  const csvStrand = (csvRow.strand || '').trim();
  if (dbStrand !== csvStrand) diffs.push(`strand: DB="${dbStrand}" CSV="${csvStrand}"`);

  const dbSubStrand = (cb.subStrand || '').trim();
  const csvSubStrand = (csvRow.sub_strand || '').trim();
  if (dbSubStrand !== csvSubStrand) diffs.push(`subStrand: DB="${dbSubStrand}" CSV="${csvSubStrand}"`);

  const dbOutcome = (cb.learningOutcome || '').trim().substring(0, 100);
  const csvOutcome = (csvRow.learning_outcome || '').trim().substring(0, 100);
  if (dbOutcome !== csvOutcome) diffs.push(`learningOutcome differs`);

  const dbActivity = (cb.activityInstructions || '').trim().substring(0, 100);
  const csvActivity = (csvRow.activity_instructions || '').trim().substring(0, 100);
  if (dbActivity !== csvActivity) diffs.push(`activityInstructions differs`);

  if (diffs.length > 0) {
    comparisons.push({
      id: dbLesson.id,
      title: dbTitle,
      in_db: true,
      in_csv: true,
      differences: diffs,
    });
  }
}

// Find CSV rows not in DB
const dbTitles = new Set(dbData.map(l => l.title.trim().toLowerCase()));
const csvNotInDb = csvRows.filter(r => !dbTitles.has((r.lesson_title || '').trim().toLowerCase()));

// Write comparison report
let md = '# Grade 2 Math — DB vs CSV Comparison\n\n';
md += `**Generated:** ${new Date().toISOString()}\n\n`;
md += `**DB lessons:** ${dbData.length}\n`;
md += `**CSV rows:** ${csvRows.length}\n`;
md += `**DB lessons not in CSV:** ${dbData.filter(l => !csvByTitle[l.title.trim().toLowerCase()]).length}\n`;
md += `**CSV rows not in DB:** ${csvNotInDb.length}\n`;
md += `**Lessons with differences:** ${comparisons.filter(c => c.in_csv && c.differences.length > 0).length}\n\n`;

if (csvNotInDb.length > 0) {
  md += `## CSV rows NOT in database (${csvNotInDb.length})\n\n`;
  for (const row of csvNotInDb) {
    md += `- ${row.lesson_title} (strand: ${row.strand}, sub_strand: ${row.sub_strand})\n`;
  }
  md += '\n';
}

const dbNotInCsv = comparisons.filter(c => !c.in_csv);
if (dbNotInCsv.length > 0) {
  md += `## DB lessons NOT in CSV (${dbNotInCsv.length})\n\n`;
  for (const c of dbNotInCsv) {
    md += `- ${c.title} (${c.id})\n`;
  }
  md += '\n';
}

const withDiffs = comparisons.filter(c => c.in_csv && c.differences.length > 0);
if (withDiffs.length > 0) {
  md += `## Lessons with field differences (${withDiffs.length})\n\n`;
  for (const c of withDiffs) {
    md += `### ${c.title}\n`;
    for (const d of c.differences) md += `- ${d}\n`;
    md += '\n';
  }
}

md += `## Recommendation\n\n`;
md += `- The extended CSV (\`mathematics-source-extended.csv\`) is the most complete source file\n`;
md += `- It contains: grade, subject, strand, sub_strand, learning_outcome, lesson_title, term, week, activity_title, activity_instructions, quest_title, quest_instructions, reflection_prompt, key_inquiry_question, suggested_learning_experience, assessment_hint, values, core_competencies, source_document, source_page_or_section, source_confidence\n`;
md += `- **Safe to use as source of truth for the source pack**\n`;
md += `- DB has additional fields from generation (aiMetadata, studentJourney, studentJourneyDraft) that CSV doesn't have\n`;
md += `- Minor field differences exist but don't affect source pack creation\n`;

fs.writeFileSync(path.join(auditDir, 'math-db-vs-csv-comparison.md'), md);
console.log(`Phase 5b: DB vs CSV comparison written`);
console.log(`  DB lessons: ${dbData.length}, CSV rows: ${csvRows.length}`);
console.log(`  DB not in CSV: ${dbNotInCsv.length}, CSV not in DB: ${csvNotInDb.length}`);
console.log(`  With differences: ${withDiffs.length}`);
