#!/usr/bin/env node
/**
 * Quick defect summary from CSV.
 */
const fs = require('fs');
const csv = fs.readFileSync('C:\\Users\\Victor\\Arizen Homeschool\\docs\\audits\\grade-2-math-journey-defects.csv', 'utf-8');
const lines = csv.split('\n').filter(l => l.trim());
const data = lines.slice(1);

const byType = {};
const bySeverity = {};
const byField = {};

for (const line of data) {
  // Simple CSV parse (no quoted commas in our data)
  const cols = line.split(',');
  const type = (cols[3] || '').replace(/"/g, '');
  const sev = (cols[4] || '').replace(/"/g, '');
  const field = (cols[2] || '').replace(/"/g, '');
  byType[type] = (byType[type] || 0) + 1;
  bySeverity[sev] = (bySeverity[sev] || 0) + 1;
  byField[field] = (byField[field] || 0) + 1;
}

console.log('Total defects:', data.length);
console.log('\nBy severity:');
for (const [k, v] of Object.entries(bySeverity).sort((a, b) => b[1] - a[1])) {
  console.log('  ' + k + ': ' + v);
}
console.log('\nBy type (top 15):');
for (const [k, v] of Object.entries(byType).sort((a, b) => b[1] - a[1]).slice(0, 15)) {
  console.log('  ' + k + ': ' + v);
}
console.log('\nBy journey field:');
for (const [k, v] of Object.entries(byField).sort((a, b) => b[1] - a[1])) {
  console.log('  ' + k + ': ' + v);
}
