const fs = require('fs');
const content = fs.readFileSync('src/lib/curriculum/grade4-journeys.ts', 'utf8');
// Find quick_check and practice step definitions
const quickCheckMatch = content.match(/id:\s*["']quick_check["'][\s\S]*?(?=\n\s*\n|\n\s*\},)/);
const practiceMatch = content.match(/id:\s*["']practice["'][\s\S]*?(?=\n\s*\n|\n\s*\},)/);
if (practiceMatch) {
  console.log('=== PRACTICE STEP ===');
  console.log(practiceMatch[0].substring(0, 800));
}
if (quickCheckMatch) {
  console.log('\n=== QUICK_CHECK STEP ===');
  console.log(quickCheckMatch[0].substring(0, 800));
}
// Also check read-numbers concept in adaptive-engine
const engineContent = fs.readFileSync('src/lib/curriculum/adaptive-engine.ts', 'utf8');
const readNumbersMatch = engineContent.match(/read-numbers[\s\S]*?(?=\n\s*\n|\n\s*export)/);
if (readNumbersMatch) {
  console.log('\n=== READ-NUMBERS IN ADAPTIVE-ENGINE ===');
  console.log(readNumbersMatch[0].substring(0, 500));
}
// Check detectMisconception for read-numbers
const mcMatch = engineContent.match(/case ["']read-numbers["'][\s\S]*?(?=\n\s*\n|\n\s*case)/);
if (mcMatch) {
  console.log('\n=== detectMisconception read-numbers ===');
  console.log(mcMatch[0].substring(0, 500));
}
