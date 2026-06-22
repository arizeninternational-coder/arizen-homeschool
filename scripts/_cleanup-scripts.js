const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = path.join('C:', 'Users', 'Victor', 'Arizen Homeschool');
const scriptsDir = path.join(projectRoot, 'scripts');
const scratchDir = path.join(projectRoot, 'scratch');

// Create scratch directory
fs.mkdirSync(scratchDir, { recursive: true });

// Ensure scratch is in .gitignore
const gitignorePath = path.join(projectRoot, '.gitignore');
let gitignore = '';
try { gitignore = fs.readFileSync(gitignorePath, 'utf-8'); } catch(e) {}
if (!gitignore.includes('scratch/')) {
  fs.appendFileSync(gitignorePath, '\nscratch/\n');
  console.log('Added scratch/ to .gitignore');
}

// Temp DB write scripts to move (created during POC process)
const tempWriteScripts = ['phase1-2-3.js', '_poc-write.js', '_storage-create.js'];

// Temp test scripts to move
const tempTestScripts = ['debug-env.js', 'find-env.js', 'kill-13448.js', 'kill-port.js', 'list-env-keys.js', 'read-project-env.js', 'test-conn.js'];

// Helper scripts created this session to move
const tempHelperScripts = ['_classify-scripts.js', '_check-write-scripts.js', 'backup-0767b9f0.js', 'validate-poc-v1.2.js', 'verify-final-db.js', '_debug-check.js', '_debug-check2.js'];

const allTempToMove = [...tempWriteScripts, ...tempTestScripts, ...tempHelperScripts];

let moved = [], notFound = [];
allTempToMove.forEach(f => {
  const src = path.join(scriptsDir, f);
  const dst = path.join(scratchDir, f);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dst);
    fs.unlinkSync(src);
    moved.push(f);
  } else {
    notFound.push(f);
  }
});

console.log(`Moved ${moved.length} scripts to scratch/:`);
moved.forEach(f => console.log(`  ${f}`));
if (notFound.length) {
  console.log(`\nNot found (already moved or missing): ${notFound.length}`);
  notFound.forEach(f => console.log(`  ${f}`));
}

// List what remains in scripts/
const remaining = fs.readdirSync(scriptsDir);
console.log(`\nRemaining in scripts/: ${remaining.length} files`);
remaining.forEach(f => console.log(`  ${f}`));
