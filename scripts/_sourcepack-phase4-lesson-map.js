#!/usr/bin/env node
/**
 * PHASE 4: Create math-lesson-map.csv from audit data.
 * Reads docs/audits/_math2-full-data.json (121 lessons).
 * Maps each lesson to topic, sub-topic, and requirements.
 * Fields needing human input are marked "TODO: Victor to provide/approve".
 * No database queries. No writes.
 */
const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync('C:\\Users\\Victor\\Arizen Homeschool\\docs\\audits\\_math2-full-data.json'));
const sourceDir = 'C:\\Users\\Victor\\Arizen Homeschool\\curriculum-source-packs\\grade-2\\math';

// Topic mapping function (same logic as audit)
function mapTopic(title, strand, subStrand) {
  const t = title.toLowerCase();
  const s = (strand || '').toLowerCase();
  const ss = (subStrand || '').toLowerCase();

  if (t.includes('fraction') || t.includes('half') || t.includes('halves') || t.includes('quarter')) return 'Fractions';
  if (t.includes('subtract') || t.includes('subtraction') || t.includes('minus')) return 'Subtraction';
  if (t.includes('add') || t.includes('addition') || t.includes('plus') || t.includes('sum')) return 'Addition';
  if (t.includes('multiply') || t.includes('multiplication') || t.includes('repeated addition') || t.includes('equal group') || t.includes('array') || t.includes('times')) return 'Multiplication';
  if (t.includes('place value') || (t.includes('digit') && (t.includes('represent') || t.includes('value')))) return 'Place Value';
  if (t.includes('count') || t.includes('skip') || t.includes('number pattern') || t.includes('missing number') || t.includes('filling')) return 'Number Patterns & Counting';
  if (t.includes('read') && (t.includes('number') || t.includes('symbol'))) return 'Reading & Writing Numbers';
  if (t.includes('write') && (t.includes('number') || t.includes('word'))) return 'Reading & Writing Numbers';
  if (t.includes('measur') || t.includes('length') || t.includes('metre') || t.includes('capacity') || t.includes('litre') || t.includes('mass') || t.includes('weight') || t.includes('volume')) return 'Measurement';
  if (t.includes('time') || t.includes('clock') || t.includes('hour') || t.includes('minute')) return 'Time';
  if (t.includes('money') || t.includes('coin') || t.includes('shilling') || t.includes('purchase') || t.includes('buy') || t.includes('sell') || t.includes('change') || t.includes('budget')) return 'Money';
  if (t.includes('shape') || t.includes('line') || t.includes('curve') || t.includes('rectangle') || t.includes('circle') || t.includes('triangle') || t.includes('oval') || t.includes('square') || t.includes('sort') || t.includes('group')) return 'Geometry & Patterns';
  if (t.includes('data') || t.includes('graph') || t.includes('pictograph') || t.includes('table') || t.includes('chart')) return 'Data Handling';
  if (t.includes('word problem') || t.includes('story') || t.includes('real life') || t.includes('apply') || t.includes('application') || t.includes('community')) return 'Word Problems & Application';
  if (t.includes('number concept') || t.includes('number line') || t.includes('concrete object') || t.includes('represent') || t.includes('compare') || t.includes('order')) return 'Number Concept';
  return strand || 'Other';
}

function mapSubtopic(title, subStrand) {
  const t = title.toLowerCase();
  if (subStrand) return subStrand;
  // Derive from title
  if (t.includes('without regrouping')) return 'Without Regrouping';
  if (t.includes('with regrouping')) return 'With Regrouping';
  if (t.includes('horizontal')) return 'Horizontal Format';
  if (t.includes('vertical')) return 'Vertical Format';
  if (t.includes('number line')) return 'Number Line Method';
  if (t.includes('word problem')) return 'Word Problems';
  return 'TODO: Victor to specify';
}

function mapRepresentation(topic) {
  const reps = {
    'Addition': 'counters, number line, base-ten blocks',
    'Subtraction': 'counters, crossing out, number line',
    'Multiplication': 'equal groups, arrays, repeated addition',
    'Fractions': 'shapes (circles, rectangles), paper folding, shading',
    'Measurement': 'classroom objects, ruler, measuring tools',
    'Time': 'clock face, daily routine',
    'Money': 'Kenyan shillings (coins and notes), market context',
    'Geometry & Patterns': 'shape cutouts, real objects, pattern blocks',
    'Number Patterns & Counting': 'number line, hundred chart, skip counting',
    'Place Value': 'base-ten blocks, place value chart',
    'Reading & Writing Numbers': 'number cards, word-symbol matching',
    'Number Concept': 'concrete objects, number cards',
    'Word Problems & Application': 'real-life scenarios, Kenyan context',
    'Data Handling': 'pictographs, tally marks, simple tables',
  };
  return reps[topic] || 'TODO: Victor to specify';
}

function mapExampleType(topic) {
  const types = {
    'Addition': 'worked example with regrouping/no-regrouping',
    'Subtraction': 'worked example with borrowing/no-borrowing',
    'Multiplication': 'equal groups model → repeated addition → multiplication sentence',
    'Fractions': 'whole divided into equal parts, shaded fraction',
    'Measurement': 'measuring with standard units, comparing',
    'Time': 'clock reading, daily events',
    'Money': 'counting coins/notes, simple purchase',
    'Geometry & Patterns': 'identifying shapes, sorting, pattern creation',
    'Number Patterns & Counting': 'skip counting sequences, pattern completion',
    'Place Value': 'decomposing numbers into tens and ones',
    'Reading & Writing Numbers': 'number-symbol matching, word writing',
    'Number Concept': 'representing quantities with objects',
    'Word Problems & Application': 'step-by-step problem solving',
    'Data Handling': 'reading pictographs, creating tally marks',
  };
  return types[topic] || 'TODO: Victor to specify';
}

function mapQcType(topic) {
  const types = {
    'Addition': 'addition-fact-regrouping / addition-fact-no-regrouping',
    'Subtraction': 'subtraction-fact-no-negative',
    'Multiplication': 'equal-groups / repeated-addition',
    'Fractions': 'identify-fraction-shaded / identify-fraction-parts',
    'Measurement': 'compare-units / read-measurement',
    'Time': 'read-clock-o-clock / read-clock-half-past',
    'Money': 'count-money / simple-purchase',
    'Geometry & Patterns': 'identify-shape / complete-pattern',
    'Number Patterns & Counting': 'skip-counting / missing-number',
    'Place Value': 'digit-value / decompose-number',
    'Reading & Writing Numbers': 'read-number / write-number',
    'Number Concept': 'represent-quantity / compare-numbers',
    'Word Problems & Application': 'single-step-word-problem',
    'Data Handling': 'read-pictograph / count-tally',
  };
  return types[topic] || 'TODO: Victor to specify';
}

function mapDifficultyLimit(topic) {
  const limits = {
    'Addition': 'max 3-digit + 3-digit, with/without regrouping',
    'Subtraction': 'max 3-digit - 3-digit, NO negative answers',
    'Multiplication': 'max factor 10, equal groups only',
    'Fractions': 'halves and quarters only, NO arithmetic',
    'Measurement': 'metres, litres, kilograms; non-standard before standard',
    'Time': 'o\'clock and half past only',
    'Money': 'Kenyan shillings, simple purchases',
    'Geometry & Patterns': '5 basic shapes, simple patterns',
    'Number Patterns & Counting': '1-100, skip by 2s/5s/10s',
    'Place Value': 'ones, tens, hundreds',
    'Reading & Writing Numbers': '1-100 in symbols and words',
    'Number Concept': '1-1000 representation',
    'Word Problems & Application': 'single-step, Kenyan context',
    'Data Handling': 'simple pictographs, tally marks',
  };
  return limits[topic] || 'TODO: Victor to specify';
}

// Build CSV
const headers = [
  'lesson_id', 'title', 'strand', 'sub_strand', 'learningOutcome',
  'keyInquiryQuestion', 'suggestedLearningExperience', 'activityInstructions',
  'mapped_topic', 'mapped_subtopic', 'source_file_reference',
  'child_friendly_goal', 'vocabulary_needed', 'representation_needed',
  'example_type', 'practice_type', 'quick_check_type', 'difficulty_limit',
  'video_needed', 'visual_needed', 'source_pack_status', 'human_input_needed',
  'safe_to_generate'
];

const rows = [headers.join(',')];

for (const lesson of data) {
  const cb = lesson.contentBlocks;
  const topic = mapTopic(lesson.title, cb.strand, cb.subStrand);
  const subtopic = mapSubtopic(lesson.title, cb.subStrand);
  const isRecovery = (cb.aiMetadata?.batchId || '').includes('g-math-hq');
  const isOldV2 = !cb.aiMetadata?.batchId && (cb.studentJourney || []).length > 0;

  const row = [
    lesson.id,
    lesson.title,
    cb.strand || '',
    cb.subStrand || '',
    (cb.learningOutcome || '').substring(0, 200),
    (cb.keyInquiryQuestion || '').substring(0, 200),
    (cb.suggestedLearningExperience || '').substring(0, 200),
    (cb.activityInstructions || '').substring(0, 200),
    topic,
    subtopic,
    'mathematics-source-extended.csv',
    'TODO: Victor to provide',
    'TODO: Victor to provide',
    mapRepresentation(topic),
    mapExampleType(topic),
    'TODO: Victor to provide',
    mapQcType(topic),
    mapDifficultyLimit(topic),
    'YES - needs human approval',
    'YES - per topic guidance',
    isRecovery ? 'recovery-batch-needs-rebuild' : isOldV2 ? 'old-v2-needs-replacement' : 'new-needs-generation',
    'YES',
    'NO - awaiting source pack completion'
  ];

  rows.push(row.map(v => '"' + String(v || '').replace(/"/g, '""').replace(/\n/g, ' ') + '"').join(','));
}

fs.writeFileSync(path.join(sourceDir, 'math-lesson-map.csv'), rows.join('\n'));
console.log(`Phase 4: Lesson map created with ${data.length} lessons`);
