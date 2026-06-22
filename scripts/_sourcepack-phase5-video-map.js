#!/usr/bin/env node
/**
 * PHASE 5: Create math-video-map.csv from audit data.
 * Reads docs/audits/_math2-full-data.json.
 */
const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync('C:\\Users\\Victor\\Arizen Homeschool\\docs\\audits\\_math2-full-data.json'));
const sourceDir = 'C:\\Users\\Victor\\Arizen Homeschool\\curriculum-source-packs\\grade-2\\math';

function mapTopic(title) {
  const t = title.toLowerCase();
  if (t.includes('fraction') || t.includes('half') || t.includes('halves') || t.includes('quarter')) return 'Fractions';
  if (t.includes('subtract') || t.includes('subtraction')) return 'Subtraction';
  if (t.includes('add') || t.includes('addition')) return 'Addition';
  if (t.includes('multiply') || t.includes('multiplication') || t.includes('repeated addition')) return 'Multiplication';
  if (t.includes('count') || t.includes('skip') || t.includes('pattern') || t.includes('missing number')) return 'Number Patterns';
  if (t.includes('measur') || t.includes('length') || t.includes('metre') || t.includes('capacity') || t.includes('litre')) return 'Measurement';
  if (t.includes('time') || t.includes('clock')) return 'Time';
  if (t.includes('money') || t.includes('shilling')) return 'Money';
  if (t.includes('shape') || t.includes('line') || t.includes('curve') || t.includes('rectangle') || t.includes('circle')) return 'Geometry';
  if (t.includes('place value') || t.includes('digit')) return 'Place Value';
  if (t.includes('read') || t.includes('write') || t.includes('symbol') || t.includes('word')) return 'Reading & Writing Numbers';
  if (t.includes('word problem') || t.includes('real life') || t.includes('application')) return 'Word Problems';
  if (t.includes('number concept') || t.includes('concrete object')) return 'Number Concept';
  return 'Other';
}

// Count video reuse
const videoCounts = {};
for (const lesson of data) {
  const cb = lesson.contentBlocks;
  const vid = cb.aiMetadata?.videoId || '';
  if (vid) {
    if (!videoCounts[vid]) videoCounts[vid] = 0;
    videoCounts[vid]++;
  }
}

const headers = [
  'lesson_id', 'title', 'mapped_topic', 'current_video_id', 'current_video_url',
  'current_video_reused', 'expected_video_topic', 'video_status',
  'human_review_needed', 'approved_video_url', 'backup_video_url', 'notes'
];

const rows = [headers.join(',')];

for (const lesson of data) {
  const cb = lesson.contentBlocks;
  const topic = mapTopic(lesson.title);
  const vid = cb.aiMetadata?.videoId || '';
  const url = vid ? `https://www.youtube.com/watch?v=${vid}` : '';
  const reused = vid && videoCounts[vid] > 1 ? 'YES' : 'NO';

  const row = [
    lesson.id,
    lesson.title,
    topic,
    vid,
    url,
    reused,
    topic, // expected = same as mapped topic
    vid ? 'unverified' : 'missing',
    'YES',
    'TODO: Victor to approve',
    'TODO: Victor to provide',
    reused === 'YES' ? `Video reused in ${videoCounts[vid]} lessons` : ''
  ];

  rows.push(row.map(v => '"' + String(v || '').replace(/"/g, '""').replace(/\n/g, ' ') + '"').join(','));
}

fs.writeFileSync(path.join(sourceDir, 'math-video-map.csv'), rows.join('\n'));
console.log(`Phase 5: Video map CSV created with ${data.length} lessons`);
