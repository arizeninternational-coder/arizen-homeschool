#!/usr/bin/env node
/**
 * Update math-lesson-map.csv for the 2 misclassified Fractions lessons.
 * These exist in DB but were mapped to "Numbers" strand.
 * We remap them in the source pack but do NOT update the database.
 */
const fs = require('fs');
const csvPath = 'C:\\Users\\Victor\\Arizen Homeschool\\curriculum-source-packs\\grade-2\\math\\math-lesson-map.csv';
const csv = fs.readFileSync(csvPath, 'utf-8');
const lines = csv.split('\n');
const header = lines[0];
const headers = header.split(',');

// Find column indices
const colMap = {};
headers.forEach((h, idx) => colMap[h] = idx);

// The 2 misclassified lessons
const remapIds = new Set([
  '159f92b9-69c7-45ea-8376-2b15af491360',  // Identifying 1/2 in Everyday Objects
  '60441bd5-774f-4135-9871-666fc481b13b',  // Identifying 1/4 in Everyday Objects
]);

const updatedLines = [header];
let updated = 0;

for (let i = 1; i < lines.length; i++) {
  if (!lines[i].trim()) { updatedLines.push(lines[i]); continue; }
  const cols = lines[i].split(',');
  const id = cols[0]?.replace(/"/g, '');

  if (remapIds.has(id)) {
    // Update source_pack_status to indicate remapping
    cols[colMap['source_pack_status']] = '"remapped-from-numbers-to-fractions"';
    // Update mapped_topic to Fractions
    cols[colMap['mapped_topic']] = '"Fractions"';
    updatedLines.push(cols.join(','));
    updated++;
  } else {
    updatedLines.push(lines[i]);
  }
}

fs.writeFileSync(csvPath, updatedLines.join('\n'));
console.log(`Updated ${updated} misclassified Fractions lessons`);
