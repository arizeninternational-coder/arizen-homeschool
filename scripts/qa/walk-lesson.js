/**
 * Walk a lesson as a real learner and capture every step.
 *
 * Used to verify the Grade 4 ordering lesson end to end: proves the layout does
 * not overlap the journey rail, that answering advances the lesson, and (with
 * --decisions) what the adaptive orchestrator actually returned for each answer.
 *
 *   PROBE_BASE=http://127.0.0.1:3000 \
 *   PROBE_EMAIL=you@example.test PROBE_PASSWORD=... \
 *   node scripts/qa/walk-lesson.js [--decisions]
 *
 * Credentials come from the environment on purpose — this file is committed, and
 * a test account password does not belong in a repository.
 *
 * Screenshots and per-step text dumps land in $LOCALAPPDATA/lesson-shots (or
 * /tmp). The orchestrator takes ~2s per answer, so the walker waits rather than
 * racing it — sampling too early is what once made a working step look blocked.
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = process.env.PROBE_BASE || 'http://127.0.0.1:3000';
const EMAIL = process.env.PROBE_EMAIL;
const PASS = process.env.PROBE_PASSWORD;
const LESSON = process.env.PROBE_LESSON ||
  `${BASE}/dashboard/student/lessons/g4-mathematics/quest-g4-mathematics-whole-numbers/ordering-rounding`;
const OUT = path.join(process.env.LOCALAPPDATA || '/tmp', 'lesson-shots');
const WAIT = Number(process.env.PROBE_WAIT_MS || 4500);
const CAPTURE_DECISIONS = process.argv.includes('--decisions');

if (!EMAIL || !PASS) {
  console.error('Set PROBE_EMAIL and PROBE_PASSWORD to a throwaway learner account.');
  process.exit(1);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();

  if (CAPTURE_DECISIONS) {
    page.on('response', async (res) => {
      if (!res.url().includes('adaptive-decision')) return;
      try {
        const body = await res.text();
        console.log(`\n<<< ${res.status()} ${res.url()}\n${body.slice(0, 900)}\n>>>`);
      } catch { /* body already consumed */ }
    });
  }

  await page.goto(`${BASE}/auth/login`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.locator('input[type="email"], input[name="email"]').first().fill(EMAIL);
  await page.locator('input[type="password"]').first().fill(PASS);
  await page.locator('input[type="password"]').first().press('Enter');
  await page.waitForURL(/dashboard/, { timeout: 40000 }).catch(() => console.log('login did not redirect'));
  await page.goto(LESSON, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(() => !document.body.innerText.includes('Loading your lesson'), { timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2000);

  for (let i = 1; i <= 12; i++) {
    const text = await page.evaluate(() => document.body.innerText);
    const label = (text.match(/Step\s+(\d+)\s+of\s+(\d+)/) || [null, '?', '?']);
    fs.writeFileSync(path.join(OUT, `step-${i}.txt`), text, 'utf8');
    await page.screenshot({ path: path.join(OUT, `step-${i}.png`), fullPage: true });
    console.log(`step ${label[1]}/${label[2]}`);

    if (await page.evaluate(() => {
      const b = [...document.querySelectorAll('button')].find((x) => /start lesson/i.test(x.innerText || ''));
      if (!b) return false; b.click(); return true;
    })) { await page.waitForTimeout(WAIT); continue; }

    const picked = await page.evaluate(() => {
      const opts = [...document.querySelectorAll('button')].filter((b) => {
        const t = (b.innerText || '').trim(), r = b.getBoundingClientRect();
        return b.offsetParent !== null && r.left > 330 && r.width > 240 && !b.disabled && /^\d{3}\s*,\s*\d{3}/.test(t);
      });
      if (!opts.length) return null;
      opts[0].click();
      return opts[0].innerText.trim().slice(0, 40);
    });
    if (picked) { console.log(`  picked "${picked}"`); await page.waitForTimeout(WAIT); }

    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
      for (const el of document.querySelectorAll('*')) if (el.scrollHeight > el.clientHeight + 40) el.scrollTop = el.scrollHeight;
    });
    await page.waitForTimeout(400);

    const adv = await page.evaluate(() => {
      const vh = window.innerHeight;
      const c = [...document.querySelectorAll('button')]
        .map((b) => ({ b, r: b.getBoundingClientRect() }))
        .filter(({ b, r }) => b.offsetParent !== null && r.width > 80 && r.height > 24 && r.top > vh * 0.45 && r.left > 330 && !/back|exit|sign out/i.test(b.innerText || ''))
        .sort((a, z) => z.r.left - a.r.left)[0];
      if (!c) return null;
      return { text: c.b.innerText.trim().slice(0, 50), disabled: c.b.disabled, x: c.r.left + c.r.width / 2, y: c.r.top + c.r.height / 2 };
    });
    if (!adv) { console.log('  no advance control'); break; }
    if (adv.disabled) { console.log(`  blocked: "${adv.text}"`); break; }
    await page.mouse.click(adv.x, adv.y);
    console.log(`  advance: "${adv.text}"`);
    await page.waitForTimeout(WAIT);
  }

  console.log(`\nshots: ${OUT}`);
  await browser.close();
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
