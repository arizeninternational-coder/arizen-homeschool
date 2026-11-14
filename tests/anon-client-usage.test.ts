/**
 * Guard: nothing under src/ may use the anon Supabase client.
 *
 * The anon key ships to every browser by design. Before Phase 0 it was the only
 * client in the app, and with RLS open it exposed all 35 tables — including
 * bcrypt password hashes and children's progress data. Every server call now
 * goes through getSupabaseAdmin() (service role, server-only).
 *
 * This test exists so that invariant cannot quietly erode: a single new
 * `import { supabase } from "@/lib/supabase"` would reintroduce the hole the
 * moment the RLS lockdown is applied — that route would start returning 401s, or
 * worse, be "fixed" by loosening RLS again.
 *
 * Run: npx tsx tests/anon-client-usage.test.ts
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative, sep } from 'path';

const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'src');

/** The only file allowed to define/export the anon client. */
const ANON_DEFINITION = 'src/lib/supabase.ts';

const ANON_IMPORT = /from\s*['"]@\/lib\/supabase['"]/;
const ADMIN_IMPORT = /from\s*['"]@\/lib\/supabase-admin['"]/;

let pass = 0;
let fail = 0;
const check = (name: string, cond: boolean, detail?: string) => {
  if (cond) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name}${detail ? ' — ' + detail : ''}`); }
};

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(entry)) out.push(p);
  }
  return out;
}

const files = walk(SRC);
const anonUsers: string[] = [];
let adminUsers = 0;

for (const abs of files) {
  const rel = relative(ROOT, abs).split(sep).join('/');
  const src = readFileSync(abs, 'utf8');

  if (ANON_IMPORT.test(src) && rel !== ANON_DEFINITION) anonUsers.push(rel);
  if (ADMIN_IMPORT.test(src)) adminUsers++;
}

console.log('── 1. no file imports the anon client ──');
check(
  'no src file imports @/lib/supabase',
  anonUsers.length === 0,
  anonUsers.length ? `${anonUsers.length} file(s): ${anonUsers.slice(0, 8).join(', ')}${anonUsers.length > 8 ? ', …' : ''}` : undefined
);

console.log('\n── 2. the service-role client is the one in use ──');
check(
  `getSupabaseAdmin is imported widely (found ${adminUsers})`,
  adminUsers >= 60,
  adminUsers < 60 ? 'migration appears reverted or partially undone' : undefined
);

console.log('\n── 3. the admin helper keeps its guard rails ──');
const adminSrc = readFileSync(join(SRC, 'lib/supabase-admin.ts'), 'utf8');
check('throws when evaluated in a browser', /typeof window !== "undefined"|isBrowser\(\)/.test(adminSrc));
check('throws inside getSupabaseAdmin as well', /getSupabaseAdmin\(\)\s*called in the browser/i.test(adminSrc));
check('reads SUPABASE_SERVICE_ROLE_KEY', adminSrc.includes('SUPABASE_SERVICE_ROLE_KEY'));
check('never reads the anon key', !adminSrc.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY'));

console.log('\n── 4. the anon key is not read anywhere in server/app code ──');
const anonKeyReaders: string[] = [];
for (const abs of files) {
  const rel = relative(ROOT, abs).split(sep).join('/');
  if (rel === ANON_DEFINITION) continue;
  if (readFileSync(abs, 'utf8').includes('NEXT_PUBLIC_SUPABASE_ANON_KEY')) anonKeyReaders.push(rel);
}
check(
  'no file outside src/lib/supabase.ts reads NEXT_PUBLIC_SUPABASE_ANON_KEY',
  anonKeyReaders.length === 0,
  anonKeyReaders.length ? anonKeyReaders.join(', ') : undefined
);
console.log(
  '  INFO  src/lib/supabase.ts still exists as dead code — harmless, unimported, safe to delete later'
);

console.log('\n' + '='.repeat(32));
console.log(`PASS: ${pass}   FAIL: ${fail}   TOTAL: ${pass + fail}`);
if (fail > 0) {
  console.log('anon client usage detected — Phase 0 regression.');
  process.exit(1);
}
