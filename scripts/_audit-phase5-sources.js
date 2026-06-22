#!/usr/bin/env node
/**
 * PHASE 5: Source files audit — find all curriculum source files.
 */
const fs = require('fs');
const path = require('path');

const projectRoot = 'C:\\Users\\Victor\\Arizen Homeschool';
const sourceFiles = [];

function scanDir(dir, depth = 0) {
  if (depth > 4) return;
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === '.next') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) { scanDir(full, depth + 1); continue; }
      const lower = entry.name.toLowerCase();
      if (!lower.match(/\.(csv|json|md|js|ts)$/i)) continue;
      if (lower.includes('curriculum') || lower.includes('shell') || lower.includes('import') ||
          lower.includes('math') || lower.includes('grade') || lower.includes('kicd') ||
          lower.includes('batch') || lower.includes('generate') || lower.includes('seed') ||
          (lower.includes('.csv') && (lower.includes('grade') || lower.includes('sheet')))) {
        try {
          const size = fs.statSync(full).size;
          if (size > 0 && size < 10_000_000) {
            sourceFiles.push({ path: full, name: entry.name, sizeBytes: size, ext: path.extname(entry.name).toLowerCase() });
          }
        } catch(e) {}
      }
    }
  } catch(e) {}
}

scanDir(projectRoot);

const results = [];
for (const file of sourceFiles) {
  try {
    const content = fs.readFileSync(file.path, 'utf-8');
    const sample = content.substring(0, 3000).toLowerCase();
    const lines = content.split('\n');

    let g2mathRows = 0;
    if (file.ext === '.csv') {
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].toLowerCase();
        if ((row.includes('grade 2') || row.includes('grade-2')) &&
            (row.includes('math') || row.includes('mathematical'))) g2mathRows++;
      }
    }

    results.push({
      path: file.path.replace(projectRoot + '\\', ''),
      name: file.name,
      sizeKB: Math.round(file.sizeBytes / 1024),
      lines: lines.length,
      g2mathRows,
      hasGrade2: sample.includes('grade 2') || sample.includes('grade-2') || sample.includes('g2-'),
      hasMath: sample.includes('math') || sample.includes('mathematical'),
      hasKICD: sample.includes('kicd') || sample.includes('cbc'),
      hasOutcomes: sample.includes('learning outcome') || sample.includes('learningoutcome'),
      hasActivities: sample.includes('activity') || sample.includes('activities'),
      hasInquiry: sample.includes('key inquiry'),
      hasAssessment: sample.includes('assessment'),
      header: file.ext === '.csv' ? (lines[0] || '').substring(0, 200) : '',
    });
  } catch(e) {
    results.push({ path: file.path.replace(projectRoot + '\\', ''), name: file.name, error: e.message });
  }
}

const auditDir = path.join(projectRoot, 'docs', 'audits');
fs.mkdirSync(auditDir, { recursive: true });

let md = '# Grade 2 Math — Source Files Inventory\n\n';
md += `**Generated:** ${new Date().toISOString()}\n\n`;
md += `**Files found:** ${results.length}\n\n`;

const safe = results.filter(r => r.hasKICD && r.hasGrade2);
md += `**Safe sources (KICD + Grade 2):** ${safe.length}\n\n`;

for (const r of results) {
  const flags = [
    r.hasGrade2 && 'Grade 2', r.hasMath && 'Math', r.hasKICD && 'KICD/CBC',
    r.hasOutcomes && 'Outcomes', r.hasActivities && 'Activities',
    r.hasInquiry && 'Inquiry', r.hasAssessment && 'Assessment',
  ].filter(Boolean);

  md += `## ${r.path}\n\n`;
  md += `- **Size:** ${r.sizeKB}KB, **Lines:** ${r.lines || 'N/A'}\n`;
  if (r.g2mathRows) md += `- **Grade 2 Math rows:** ${r.g2mathRows}\n`;
  md += `- **Contains:** ${flags.join(', ') || 'nothing relevant'}\n`;
  md += `- **Safe source:** ${r.hasKICD && r.hasGrade2 ? '✅ YES' : '❌ NO'}\n`;
  if (r.header) md += `- **CSV header:** \`${r.header}\`\n`;
  md += '\n';
}

fs.writeFileSync(path.join(auditDir, 'math-source-files-inventory.md'), md);
console.log(`Phase 5: ${results.length} source files found, ${safe.length} safe. Written to math-source-files-inventory.md`);
