/**
 * Guard: passwordHash must never be selected outside the credential-check paths.
 *
 * A bcrypt hash is offline-crackable, so any route, page, component or lib that
 * pulls it is a vulnerability — not a style issue. This test fails the build if
 * `passwordHash` appears in a file that has no business knowing it.
 *
 * Run: npx tsx tests/password-hash-exposure.test.ts
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative, sep } from 'path';
import { USER_PUBLIC_COLUMNS, USER_AUTH_COLUMNS } from '../src/lib/db/user-columns';

const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'src');

/**
 * The only files allowed to mention passwordHash, and why:
 *   - login/options ....... bcrypt.compare during sign-in
 *   - register/utils ...... bcrypt.hash written on account creation (insert, never select)
 *   - user-columns ........ defines USER_AUTH_COLUMNS
 */
const ALLOWED = new Set([
  'src/lib/auth/options.ts',
  'src/lib/auth/utils.ts',
  'src/app/api/auth/login/route.ts',
  'src/app/api/auth/register/route.ts',
  'src/lib/db/user-columns.ts',
]);

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
const offenders: string[] = [];
const selects: string[] = [];

for (const abs of files) {
  const rel = relative(ROOT, abs).split(sep).join('/');
  const src = readFileSync(abs, 'utf8');
  if (!src.includes('passwordHash')) continue;

  if (!ALLOWED.has(rel)) offenders.push(rel);

  // Any select()/json() that mentions the hash outside an allowed file is a leak.
  for (const m of src.matchAll(/\.select\(\s*([`"'])([^`"']*)\1/g)) {
    if (m[2].includes('passwordHash') && !ALLOWED.has(rel)) selects.push(`${rel} -> select(${m[2]})`);
  }
}

console.log('── 1. passwordHash only appears in credential-check files ──');
check('no unexpected file references passwordHash', offenders.length === 0, offenders.join(', '));

console.log('\n── 2. no select() outside auth pulls the hash ──');
check('no non-auth select() requests passwordHash', selects.length === 0, selects.join('; '));

console.log('\n── 3. the public column list excludes the hash ──');
check('USER_PUBLIC_COLUMNS does not contain passwordHash', !USER_PUBLIC_COLUMNS.includes('passwordHash'), USER_PUBLIC_COLUMNS);
check('USER_AUTH_COLUMNS contains passwordHash', USER_AUTH_COLUMNS.includes('passwordHash'));
check('USER_AUTH_COLUMNS extends USER_PUBLIC_COLUMNS', USER_AUTH_COLUMNS.startsWith(USER_PUBLIC_COLUMNS));

console.log('\n── 4. credential checks still have what they need ──');
const optionsSrc = readFileSync(join(ROOT, 'src/lib/auth/options.ts'), 'utf8');
check('NextAuth authorize uses USER_AUTH_COLUMNS', optionsSrc.includes('USER_AUTH_COLUMNS'));
check('NextAuth authorize compares with bcrypt', /bcrypt\.compare\(/.test(optionsSrc));
const loginSrc = readFileSync(join(ROOT, 'src/app/api/auth/login/route.ts'), 'utf8');
check('/api/auth/login uses USER_AUTH_COLUMNS', loginSrc.includes('USER_AUTH_COLUMNS'));

console.log('\n' + '='.repeat(32));
console.log(`PASS: ${pass}   FAIL: ${fail}   TOTAL: ${pass + fail}`);
if (fail > 0) {
  console.log('passwordHash exposure detected — fix before shipping.');
  process.exit(1);
}
