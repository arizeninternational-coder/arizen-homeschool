import { test, expect } from '@playwright/test';

const PROD = 'https://arizen-homeschool-5z69zzlop-arizeninternational-coders-projects.vercel.app';

test('Lesson landing page renders without ReferenceError', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', err => errors.push(err.message));
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

  await page.goto(`${PROD}/auth/login`);
  await page.waitForSelector('input[type="email"]');
  await page.fill('input[type="email"]', 'grade4reviewtest@arizen.com');
  await page.fill('input[type="password"]', 'ReviewTest2024!');
  await page.locator('button[type="submit"]').first().click();
  await page.waitForURL(/dashboard\/student/, { timeout: 30000 });

  await page.goto(`${PROD}/dashboard/student/lessons/g4-mathematics/quest-g4-mathematics-whole-numbers/place-value`);
  await page.waitForSelector('text=/Place Value/i', { timeout: 30000 });
  
  const pageErrors = errors.filter(e => 
    e.includes('ReferenceError') || e.includes('is not defined') || e.includes('Cannot read')
  );
  expect(pageErrors, `Page errors: ${pageErrors.join(', ')}`).toHaveLength(0);
  
  const pageText = await page.innerText('body');
  expect(pageText).toContain('Place Value');
  expect(pageText).not.toContain('Hello explorer');
  expect(pageText).toContain('Hi Grade 4 Review Test');
  
  const startCount = await page.locator('button:has-text("Start Lesson")').count();
  const reviewCount = await page.locator('button:has-text("Review Lesson")').count();
  expect(startCount + reviewCount).toBeGreaterThan(0);
});
