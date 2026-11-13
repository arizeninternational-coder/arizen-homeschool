/**
 * Codemod: migrate API/lib files from the anon Supabase client to the
 * server-only service-role client.
 *
 *   import { supabase } from "@/lib/supabase"
 *     ->  import { getSupabaseAdmin } from "@/lib/supabase-admin"
 *         ...plus, inside each exported handler:
 *         const supabase = getSupabaseAdmin();
 *
 * The local identifier `supabase` is preserved, so every existing usage keeps
 * working unchanged — the smallest possible diff.
 *
 * Line-based on purpose: it only inserts after a handler's opening brace, which
 * is unambiguous in these files. Any usage it misses (a non-exported helper)
 * surfaces as a TypeScript "Cannot find name 'supabase'" error, which is the
 * signal to fix that file by hand.
 *
 * Usage: node scripts/codemod-service-key.js [--apply]
 */
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const APPLY = process.argv.includes('--apply');

const FN_DECL = /^\s*export\s+(async\s+)?function\s+[\w$]+\s*\(/;
const ARROW_CONST =
  /^\s*export\s+const\s+[\w$]+\s*=\s*(async\s*)?(function\b|[\w$.]+\s*\(\s*(async\s*)?\(|\([^)]*\)\s*=>|[\w$]+\s*=>)/;
const DECL = 'const supabase = getSupabaseAdmin();';

function indentOf(line) {
  const m = /^[ \t]*/.exec(line);
  return m ? m[0] : '';
}

function transform(file) {
  const abs = path.join(repoRoot, file);
  const src = fs.readFileSync(abs, 'utf8');

  const importRe = /import\s*\{\s*supabase\s*\}\s*from\s*(['"])@\/lib\/supabase\1;?/;
  if (!importRe.test(src)) return { file, skipped: true };

  const withImport = src.replace(importRe, 'import { getSupabaseAdmin } from "@/lib/supabase-admin";');

  const lines = withImport.split('\n');
  const out = [];
  let injected = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    out.push(line);

    if (!FN_DECL.test(line) && !ARROW_CONST.test(line)) continue;

    // Find the line that opens the body: the first line, within the signature,
    // whose trimmed form ends with "{".
    let bodyLine = -1;
    for (let j = i; j < Math.min(i + 10, lines.length); j++) {
      const t = lines[j].trimEnd();
      if (t.endsWith('{')) { bodyLine = j; break; }
      // A complete one-liner signature/promise body means there is no block body.
      if (/;\s*$/.test(t) && j > i) break;
    }
    if (bodyLine === -1) continue;

    // Emit any lines between i and bodyLine, then the inserted declaration.
    for (let j = i + 1; j <= bodyLine; j++) out.push(lines[j]);
    const indent = indentOf(lines[bodyLine]) + '  ';
    out.push(`${indent}${DECL}`);
    injected++;
    i = bodyLine;
  }

  const next = out.join('\n');

  // Report any `supabase` usage that is not inside a handler (rough scan: any
  // occurrence whose nearest enclosing top-level declaration is absent).
  const leftover = [];
  const nl = next.split('\n');
  for (let i = 0; i < nl.length; i++) {
    if (!/\bsupabase\b/.test(nl[i])) continue;
    if (/supabase-admin|const supabase = getSupabaseAdmin/.test(nl[i])) continue;
    leftover.push({ line: i + 1, text: nl[i].trim().slice(0, 80) });
  }

  return { file, changed: next !== src, output: next, injected, leftover };
}

const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'node_modules' && e.name !== '.next') walk(p); continue; }
    if (!/\.(ts|tsx)$/.test(e.name)) continue;
    if (/lib[\\/](supabase|supabase-admin)\.ts$/.test(p)) continue;
    const s = fs.readFileSync(p, 'utf8');
    if (/from\s*['"]@\/lib\/supabase['"]/.test(s)) files.push(path.relative(repoRoot, p).replace(/\\/g, '/'));
  }
})(path.join(repoRoot, 'src'));

let changed = 0;
let totalInjected = 0;
const noHandler = [];
for (const f of files) {
  const r = transform(f);
  if (r.skipped) { noHandler.push(f); continue; }
  if (r.changed) {
    changed++;
    totalInjected += r.injected;
    if (APPLY) fs.writeFileSync(path.join(repoRoot, f), r.output);
  }
}

console.log(`files with anon import : ${files.length}`);
console.log(`files changed          : ${changed}`);
console.log(`declarations injected  : ${totalInjected}`);
if (noHandler.length) console.log(`no import to rewrite   : ${noHandler.join(', ')}`);
console.log(APPLY ? '\nAPPLIED' : '\nDRY RUN — rerun with --apply');
