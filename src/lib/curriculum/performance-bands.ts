/**
 * Performance band configuration for Arizen learning outcomes.
 * 
 * This is an Arizen learning-performance indicator informed by CBC terminology.
 * It is NOT an official KICD/CBC assessment or certification.
 */

export type PerformanceBand = 'exceeding' | 'meeting' | 'approaching' | 'below';

export interface PerformanceBandConfig {
  band: PerformanceBand;
  label: string;
  minPercentage: number;
  maxPercentage: number;
  feedback: string;
}

export const PERFORMANCE_BANDS: PerformanceBandConfig[] = [
  {
    band: 'exceeding',
    label: 'Exceeding Expectations',
    minPercentage: 90,
    maxPercentage: 100,
    feedback: "You've shown a strong understanding of this topic. You're ready for a bigger challenge!",
  },
  {
    band: 'meeting',
    label: 'Meeting Expectations',
    minPercentage: 70,
    maxPercentage: 89,
    feedback: "You're building a strong understanding. A little more practice will help you become even more confident.",
  },
  {
    band: 'approaching',
    label: 'Approaching Expectations',
    minPercentage: 50,
    maxPercentage: 69,
    feedback: "You're making good progress. Let's review the tricky parts together to strengthen your skills.",
  },
  {
    band: 'below',
    label: 'Below Expectations',
    minPercentage: 0,
    maxPercentage: 49,
    feedback: "You're still building this skill. Let's practise the fundamentals together — you'll get there!",
  },
];

export function getPerformanceBand(percentage: number): PerformanceBandConfig {
  for (const band of PERFORMANCE_BANDS) {
    if (percentage >= band.minPercentage && percentage <= band.maxPercentage) {
      return band;
    }
  }
  return PERFORMANCE_BANDS[PERFORMANCE_BANDS.length - 1];
}

export function calculateScore(correct: number, total: number): {
  correct: number;
  total: number;
  percentage: number;
  band: PerformanceBandConfig;
} {
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  const band = getPerformanceBand(percentage);
  return { correct, total, percentage, band };
}
