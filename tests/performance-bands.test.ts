/**
 * Tests for Performance Bands and Score Calculation
 * 
 * Run with: npx tsx tests/performance-bands.test.ts
 */

import { getPerformanceBand, calculateScore, PERFORMANCE_BANDS } from '../src/lib/curriculum/performance-bands';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${message}`);
  } else {
    failed++;
    console.log(`  ❌ ${message}`);
  }
}

console.log('=== Performance Band Tests ===\n');

// Test 1: Band mapping
console.log('Test 1: Percentage → Band mapping');
assert(getPerformanceBand(95).band === 'exceeding', '95% → Exceeding');
assert(getPerformanceBand(90).band === 'exceeding', '90% → Exceeding');
assert(getPerformanceBand(80).band === 'meeting', '80% → Meeting');
assert(getPerformanceBand(70).band === 'meeting', '70% → Meeting');
assert(getPerformanceBand(60).band === 'approaching', '60% → Approaching');
assert(getPerformanceBand(50).band === 'approaching', '50% → Approaching');
assert(getPerformanceBand(40).band === 'below', '40% → Below');
assert(getPerformanceBand(0).band === 'below', '0% → Below');

// Test 2: Score calculation
console.log('\nTest 2: Score calculation');
const score1 = calculateScore(8, 10);
assert(score1.correct === 8, 'Correct count = 8');
assert(score1.total === 10, 'Total = 10');
assert(score1.percentage === 80, 'Percentage = 80');
assert(score1.band.band === 'meeting', 'Band = meeting');

// Test 3: Zero total
console.log('\nTest 3: Zero total handling');
const score2 = calculateScore(0, 0);
assert(score2.percentage === 0, '0/0 = 0%');

// Test 4: Perfect score
console.log('\nTest 4: Perfect score');
const score3 = calculateScore(10, 10);
assert(score3.percentage === 100, '10/10 = 100%');
assert(score3.band.band === 'exceeding', 'Perfect = exceeding');

// Test 5: Feedback varies by band
console.log('\nTest 5: Feedback varies by band');
const bands = PERFORMANCE_BANDS;
const feedbacks = new Set(bands.map(b => b.feedback));
assert(feedbacks.size === bands.length, 'Each band has unique feedback');

// Test 6: Band labels
console.log('\nTest 6: Band labels');
assert(bands.find(b => b.band === 'exceeding')?.label === 'Exceeding Expectations', 'Exceeding label');
assert(bands.find(b => b.band === 'meeting')?.label === 'Meeting Expectations', 'Meeting label');
assert(bands.find(b => b.band === 'approaching')?.label === 'Approaching Expectations', 'Approaching label');
assert(bands.find(b => b.band === 'below')?.label === 'Below Expectations', 'Below label');

console.log('\n==================================================');
console.log(`📊 Results: ${passed} passed, ${failed} failed`);
console.log('==================================================');

if (failed > 0) {
  process.exit(1);
}
