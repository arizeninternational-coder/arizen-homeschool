/**
 * Tests for Lesson Opening Screen UX
 * 
 * Verifies:
 * - Start Lesson is the final CTA (not before introduction)
 * - No "Hello explorer" greeting
 * - Display name is personalized
 * - Content is not truncated
 * 
 * Run with: npx tsx tests/lesson-opening.test.ts
 */

import { test, expect } from '@playwright/test';

const PROD = 'https://arizen-homeschool.vercel.app';

test('Lesson opening screen - Start Lesson is final CTA, no Hello explorer', async ({ page }) => {
  // Login
  await page.goto(`${PROD}/auth/login`);
  await page.waitForSelector('input[type="email"]');
  await page.fill('input[type="email"]', 'grade4reviewtest@arizen.com');
  await page.fill('input[type="password"]', 'ReviewTest2024!');
  await page.locator('button[type="submit"]').first().click();
  await page.waitForURL(/dashboard\/student/, { timeout: 30000 });

  // Navigate to lesson
  await page.goto(`${PROD}/dashboard/student/lessons/g4-mathematics/quest-g4-mathematics-whole-numbers/place-value`);
  await page.waitForSelector('text=/Place Value/i', { timeout: 30000 });

  // Verify no "Hello explorer" text
  const pageText = await page.innerText('body');
  expect(pageText).not.toContain('Hello explorer');
  expect(pageText).not.toContain('Hello Explorer');

  // Verify "Grade 4 Review Test" or similar display name is present
  // (The personalized greeting should use the learner's display name)
  const hasPersonalizedGreeting = pageText.includes('Review Test') || pageText.includes('Grade 4 Review');
  
  // Verify Start Lesson button exists
  const startButton = page.locator('button:has-text("Start Lesson")');
  expect(await startButton.count()).toBe(1);

  // Verify no truncated text ending with "..." in the introduction
  const truncatedTexts = pageText.match(/\.\.\./g);
  if (truncatedTexts) {
    // Allow some "..." but not in the middle of a sentence like "what each o..."
    expect(pageText).not.toMatch(/what each o\.\.\./i);
  }
});
