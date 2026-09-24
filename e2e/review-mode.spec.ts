// E2E Test: Grade 4 Place Value lesson — Review Mode persistence
// Uses API for auth, then exercises the full UI flow

import { test, expect, Page } from '@playwright/test';

const PROD = 'https://arizen-homeschool.vercel.app';

test('Grade 4 Place Value — Review Mode persistence (E2E)', async ({ page }) => {
  const TEST_EMAIL = `e2e_${Date.now()}@arizen.com`;
  const TEST_PASSWORD = 'test123456';
  const TEST_NAME = `E2E_${Date.now().toString(36)}`;

  const consoleErrors: string[] = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', err => consoleErrors.push(err.message()));

  // Capture API calls
  const responseCalls: { url: string; status: number; body?: any }[] = [];
  page.on('response', async res => {
    const url = res.url();
    if (url.includes('/api/learner/responses') || url.includes('/api/learner/progress')) {
      responseCalls.push({ url, status: res.status(), body: await res.json().catch(() => undefined) });
    }
  });

  // ── Step 0: Register via API ──────────────────────────────────────────
  console.log(`\n📋 Test learner: ${TEST_NAME} (${TEST_EMAIL})`);

  const regRes = await page.request.post(`${PROD}/api/auth/register`, {
    data: { name: TEST_NAME, email: TEST_EMAIL, password: TEST_PASSWORD, displayName: TEST_NAME, grade: 4, role: 'LEARNER' },
  });
  console.log('Register status:', regRes.status());
  const regBody = await regRes.json();
  console.log('Register response:', JSON.stringify(regBody));

  // ── Step 1: Login ─────────────────────────────────────────────────────
  console.log('\n=== LOGIN ===');
  await page.goto(`${PROD}/auth/login`);
  await page.waitForSelector('input[type="email"]');
  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  await page.locator('button[type="submit"]').first().click();
  await page.waitForURL(/dashboard\/student/, { timeout: 30000 });
  console.log('✅ Logged in');

  // ── Step 2: Navigate to lesson ────────────────────────────────────────
  console.log('\n=== NAVIGATE TO LESSON ===');
  await page.goto(`${PROD}/dashboard/student/lessons/g4-mathematics/quest-g4-mathematics-whole-numbers/place-value`);
  await page.waitForSelector('text=/Start Lesson/i', { timeout: 30000 });
  console.log('✅ Lesson loaded');

  // ── Step 3: Start Lesson ──────────────────────────────────────────────
  console.log('\n=== START LESSON ===');
  await page.locator('button:has-text("Start Lesson")').click();
  await page.waitForSelector('text=/Step 1 of 10/i', { timeout: 15000 });
  console.log('✅ Journey started');

  // ── Step 4: Step 1 → Step 2 ─────────────────────────────────────────
  console.log('\n=== STEP 1 → 2 ===');
  const beginBtn = page.locator('button').filter({ hasText: /Begin|Start|Continue/i }).first();
  await beginBtn.click();
  await page.waitForFunction(() => document.body.innerText.includes('Step 2 of 10') || document.body.innerText.includes('Mission'), { timeout: 15000 });
  console.log('✅ Step 2 reached');

  // ── Step 5: Step 2 → Step 3 ─────────────────────────────────────────
  console.log('\n=== STEP 2 → 3 ===');
  const acceptBtn = page.locator('button').filter({ hasText: /Accept|Continue/i }).first();
  await acceptBtn.click();
  await page.waitForFunction(() => document.body.innerText.includes('Step 3 of 10') || document.body.innerText.includes('Think'), { timeout: 15000 });
  console.log('✅ Step 3 reached');

  // ── Step 6: Step 3 — INTENTIONALLY WRONG ANSWER ─────────────────────
  console.log('\n=== STEP 3: INTENTIONALLY WRONG ANSWER ===');
  await page.waitForFunction(() => document.body.innerText.includes('4,729'), { timeout: 15000 });
  
  // Select "7 tens" (WRONG — correct is "7 hundreds")
  const wrongBtn = page.locator('button').filter({ hasText: /^7 tens$/ }).first();
  if (await wrongBtn.count()) {
    await wrongBtn.click();
    console.log('✅ Selected "7 tens" (WRONG)');
  } else {
    console.log('❌ "7 tens" not found, trying alternatives');
    const altBtn = page.locator('button').filter({ hasText: /7 t/ }).first();
    if (await altBtn.count()) await altBtn.click();
  }

  await page.waitForTimeout(1500);

  // ── Step 7: Verify persistence via API ──────────────────────────────
  console.log('\n=== VERIFY PERSISTENCE ===');
  await page.waitForTimeout(2000); // Wait for API call

  // Use page.evaluate to make authenticated API call from browser context
  const persistData = await page.evaluate(async () => {
    const res = await fetch('/api/learner/responses?lessonId=place-value', { credentials: 'include' });
    return res.json();
  });
  console.log('Persisted responses:', JSON.stringify(persistData, null, 2));

  const wrongPersisted = persistData.responses?.find((r: any) =>
    r.selectedAnswer?.toLowerCase().includes('7 ten') && r.correct === false
  );
  console.log('Wrong answer persisted:', !!wrongPersisted);

  // ── Step 8: Continue navigation ─────────────────────────────────────
  console.log('\n=== NAVIGATE REMAINING STEPS ===');
  
  // Click next/proceed
  for (let i = 0; i < 30; i++) {
    const step10 = await page.locator('text=/Step 10 of 10|Complete Lesson/i').isVisible();
    if (step10) {
      console.log('✅ Reached Step 10');
      break;
    }

    // Try various navigation patterns
    const nextBtn = page.locator('button').filter({ hasText: /Next|Continue|→|Got it|Finish|Complete/i }).first();
    if (await nextBtn.count()) {
      await nextBtn.click();
      await page.waitForTimeout(2000);
    } else {
      console.log('⚠️ No navigation button found');
      break;
    }
  }

  // ── Step 9: Complete the lesson ─────────────────────────────────────
  console.log('\n=== COMPLETE LESSON ===');
  const completeBtn = page.locator('button').filter({ hasText: /Complete Lesson|Done/i }).first();
  if (await completeBtn.count()) {
    const startTime = Date.now();
    await completeBtn.click();
    
    await page.waitForSelector('text=/You Did It|Lesson Complete|Celebration/i', { timeout: 10000 });
    const celebDelay = Date.now() - startTime;
    console.log(`✅ Celebration after ${celebDelay}ms`);

    const hasConfetti = await page.locator('canvas').count() > 0;
    console.log('Confetti:', hasConfetti);
  }

  // ── Step 10: Back to Dashboard ──────────────────────────────────────
  console.log('\n=== BACK TO DASHBOARD ===');
  const backBtn = page.locator('button, a').filter({ hasText: /Back to Dashboard/i }).first();
  if (await backBtn.count()) {
    await backBtn.click();
    await page.waitForURL(/dashboard\/student/, { timeout: 10000 });
    console.log('✅ Dashboard reached');
  }

  // ── Step 11: Verify completion persisted ─────────────────────────────
  console.log('\n=== VERIFY COMPLETION ===');
  const progressData = await page.evaluate(async () => {
    const res = await fetch('/api/learner/progress?lessonId=place-value', { credentials: 'include' });
    return res.json();
  });
  console.log('Progress:', JSON.stringify(progressData, null, 2));

  // ── Step 12: Review Lesson ─────────────────────────────────────────
  console.log('\n=== REVIEW LESSON ===');
  await page.goto(`${PROD}/dashboard/student/lessons/g4-mathematics/quest-g4-mathematics-whole-numbers/place-value`);
  
  // Wait for either "Review Lesson" or "Start Lesson"
  await page.waitForSelector('text=/Review Lesson|Start Lesson/i', { timeout: 30000 });
  
  const reviewBtn = page.locator('button:has-text("Review Lesson")');
  const startBtn = page.locator('button:has-text("Start Lesson")');
  
  if (await reviewBtn.count()) {
    console.log('✅ Review Lesson button found');
    await reviewBtn.click();
    await page.waitForSelector('text=/Step 1 of 10/i', { timeout: 15000 });
    console.log('✅ Review Lesson opened');

    // Navigate to Step 3 to verify restored answer
    await page.locator('button').filter({ hasText: /Begin|Start|Continue/i }).first().click();
    await page.waitForTimeout(1000);
    await page.locator('button').filter({ hasText: /Accept|Continue/i }).first().click();
    await page.waitForTimeout(1500);

    // Check for restored wrong answer
    await page.waitForFunction(() => document.body.innerText.includes('4,729') || document.body.innerText.includes('7'), { timeout: 15000 });
    const reviewText = await page.innerText('body');
    
    // Look for evidence of restored wrong answer
    const wrongRestored = reviewText.includes('7 tens') || reviewText.toLowerCase().includes('incorrect') || reviewText.includes('Not quite');
    console.log('❌ Wrong answer restored in Review:', wrongRestored);
    if (!wrongRestored) {
      console.log('Review Step 3 excerpt:', reviewText.substring(0, 600));
    }
  } else if (await startBtn.count()) {
    console.log('⚠️ Start Lesson button found — completion may not have persisted');
  }

  // ── Step 13: Final verification ────────────────────────────────────
  console.log('\n=== FINAL VERIFICATION ===');
  const finalData = await page.evaluate(async () => {
    const res = await fetch('/api/learner/responses?lessonId=place-value', { credentials: 'include' });
    return res.json();
  });
  console.log('Total InteractionResponse records:', finalData.responses?.length || 0);

  console.log('\n=== CONSOLE ERRORS ===');
  console.log(consoleErrors);

  // Assertions
  expect(consoleErrors).toHaveLength(0);
});
