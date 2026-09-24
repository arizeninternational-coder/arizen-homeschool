/**
 * Regression test: Lesson page renders without ReferenceError
 * 
 * The db983db commit introduced a regression where `progress` was used
 * in the landing view JSX before being declared. This test verifies
 * the landing view can render without undefined variable errors.
 * 
 * Run with: npx tsx tests/lesson-landing-renders.test.ts
 */

import { test, expect } from '@playwright/test';

const PROD = 'https://arizen-homeschool.vercel.app';

test('Lesson landing page renders without ReferenceError', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', err => errors.push(err.message));
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

  // Login
  await page.goto(`${PROD}/auth/login`);
  await page.waitForSelector('input[type="email"]');
  await page.fill('input[type="email"]', 'grade4reviewtest@arizen.com');
  await page.fill('input[type="password"]', 'ReviewTest2024!');
  await page.locator('button[type="submit"]').first().click();
  await page.waitForURL(/dashboard\/student/, { timeout: 30000 });

  // Navigate to lesson
  await page.goto(`${PROD}/dashboard/student/lessons/g4-mathematics/quest-g4-mathematics-whole-numbers/place-value`);
  
  // Wait for key elements to render (not crash)
  await page.waitForSelector('text=/Place Value/i', { timeout: 30000 });
  
  // Verify no page errors occurred
  const pageErrors = errors.filter(e => 
    e.includes('ReferenceError') || e.includes('is not defined') || e.includes('Cannot read')
  );
  expect(pageErrors, `Page errors: ${pageErrors.join(', ')}`).toHaveLength(0);
  
  // Verify landing view elements render
  const pageText = await page.innerText('body');
  expect(pageText).toContain('Place Value');
  expect(pageText).toContain('Start Lesson');
  
  // Verify personalized greeting (no "Hello explorer")
  expect(pageText).not.toContain('Hello explorer');
  
  // Verify Start Lesson button exists
  const startBtn = page.locator('button:has-text("Start Lesson")');
  expect(await startBtn.count()).toBe(1);
});

test('Lesson landing page - Start Lesson is final CTA', async ({ page }) => {
  await page.goto(`${PROD}/auth/login`);
  await page.waitForSelector('input[type="email"]');
  await page.fill('input[type="email"]', 'grade4reviewtest@arizen.com');
  await page.fill('input[type="password"]', 'ReviewTest2024!');
  await page.locator('button[type="submit"]').first().click();
  await page.waitForURL(/dashboard\/student/, { timeout: 30000 });

  await page.goto(`${PROD}/dashboard/student/lessons/g4-mathematics/quest-g4-mathematics-whole-numbers/place-value`);
  await page.waitForSelector('text=/Place Value/i', { timeout: 30000 });

  // Get all primary buttons in order
  const buttons = await page.locator('button').allTextContents();
  const primaryButtons = buttons.filter(b => 
    b.includes('Start Lesson') || b.includes('Continue Lesson') || b.includes('Review Lesson') ||
    b.includes('Begin') || b.includes('Accept') || b.includes('Done')
  );
  
  // Start Lesson should be the last primary button
  const lastPrimary = primaryButtons[primaryButtons.length - 1];
  expect(lastPrimary).toContain('Start Lesson');
});
