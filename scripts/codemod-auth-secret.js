/**
 * Replace hardcoded NEXTAUTH_SECRET fallbacks with getAuthSecret().
 * Usage: node scripts/codemod-auth-secret.js [--apply]
 */
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const APPLY = process.argv.includes('--apply');

const PATTERN =
  /process\.env\.NEXTAUTH_SECRET\s*\|\|\s*(["'])arizen-dev-secret-change-in-production\1/g;
const IMPORT_LINE = 'import { getAuthSecret } from "@/lib/auth/secret";';

const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'node_modules' && e.name !== '.next') walk(p); continue; }
    if (!/\.(ts|tsx)$/.test(e.name)) continue;
    if (fs.readFileSync(p, 'utf8').includes('arizen-dev-secret-change-in-production')) {
      files.push(path.relative(repoRoot, p).replace(/\\/g, '/'));
    }
  }
})(path.join(repoRoot, 'src'));

let total = 0;
for (const f of files) {
  const abs = path.join(repoRoot, f);
  let src = fs.readFileSync(abs, 'utf8');
  const before = src;

  src = src.replace(PATTERN, 'getAuthSecret()');

  // Add the import if it is not already present.
  if (!src.includes('@/lib/auth/secret')) {
    const lines = src.split('\n');
    let lastImport = -1;
    for (let i = 0; i < lines.length; i++) {
      if (/^\s*import\s/.test(lines[i]) || /^\s*\}\s*from\s*["']/.test(lines[i])) lastImport = i;
    }
    if (lastImport === -1) {
      lines.unshift(IMPORT_LINE);
    } else {
      lines.splice(lastImport + 1, 0, IMPORT_LINE);
    }
    src = lines.join('\n');
  }

  if (src !== before) {
    total++;
    console.log(`  ${f}`);
    if (APPLY) fs.writeFileSync(abs, src);
  }
}

console.log(`\nfiles changed: ${total}`);
console.log(APPLY ? 'APPLIED' : 'DRY RUN — rerun with --apply');
