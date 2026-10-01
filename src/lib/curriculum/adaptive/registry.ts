/**
 * Adaptive lesson registry.
 *
 * Replaces the old title-string gate with an explicit, data-driven lookup.
 * A lesson opts in to the adaptive loop by being registered here under its
 * curriculum slug — not by matching words in its title.
 *
 * Adding a lesson to the adaptive loop is now: register a config + provide
 * lesson content. No shared-UI branching, no title matching.
 */

import type { AdaptiveLessonConfig } from './types';
import { PLACE_VALUE_ADAPTIVE_CONFIG } from './place-value.config';
import { ORDERING_ROUNDING_CONFIG } from './ordering-rounding.config';
import { FACTORS_MULTIPLES_CONFIG } from './factors-multiples.config';
import { NUMBER_PATTERNS_CONFIG } from './number-patterns.config';
import { ROMAN_NUMERALS_CONFIG } from './roman-numerals.config';

const REGISTRY = new Map<string, AdaptiveLessonConfig>();

function register(config: AdaptiveLessonConfig): void {
  REGISTRY.set(normalizeSlug(config.lessonSlug), config);
  // Register every declared alias under the same config object.
  for (const alias of config.slugAliases || []) {
    REGISTRY.set(normalizeSlug(alias), config);
  }
}

/** Slugs arrive from URLs, DB rows and config in several shapes. */
export function normalizeSlug(slug?: string | null): string {
  if (!slug) return '';
  return String(slug)
    .trim()
    .toLowerCase()
    // strip common prefixes/suffixes used by curriculum + route layers
    .replace(/^g\d+[-_]/, '')
    .replace(/[-_]number[-_]reading$/, '')
    .replace(/[-_]and[-_]number[-_]reading$/, '')
    .replace(/^lesson[-_]/, '');
}

for (const config of [
  PLACE_VALUE_ADAPTIVE_CONFIG,
  ORDERING_ROUNDING_CONFIG,
  FACTORS_MULTIPLES_CONFIG,
  NUMBER_PATTERNS_CONFIG,
  ROMAN_NUMERALS_CONFIG,
]) {
  register(config);
}

/** Look up a lesson's adaptive config by slug. Returns null when not adaptive. */
export function getAdaptiveLessonConfig(slug?: string | null): AdaptiveLessonConfig | null {
  const key = normalizeSlug(slug);
  if (!key) return null;
  return REGISTRY.get(key) || null;
}

/**
 * Look up a lesson's adaptive config from the lesson record the player already
 * has. Slug is authoritative; the title is used only as a fallback for legacy
 * rows that predate slugs.
 */
export function resolveAdaptiveLessonConfig(lesson: {
  slug?: string | null;
  title?: string | null;
} | null | undefined): AdaptiveLessonConfig | null {
  if (!lesson) return null;
  const bySlug = getAdaptiveLessonConfig(lesson.slug);
  if (bySlug) return bySlug;
  const title = (lesson.title || '').toLowerCase();
  if (!title) return null;
  for (const config of REGISTRY.values()) {
    if (config.lessonTitle.toLowerCase() === title) return config;
  }
  return null;
}

export function isAdaptiveLesson(lesson: { slug?: string | null; title?: string | null } | null | undefined): boolean {
  return resolveAdaptiveLessonConfig(lesson) !== null;
}

export function getAllAdaptiveLessonConfigs(): AdaptiveLessonConfig[] {
  // Aliases register the SAME config object, so de-duplicate by identity.
  return Array.from(new Set(REGISTRY.values()));
}

/** Registered slugs — used by tests to assert opt-in coverage. */
export function getAdaptiveLessonSlugs(): string[] {
  return Array.from(REGISTRY.keys());
}

/** Resolve an adaptive config from a lesson record (slug first, then title). */
export function resolveAdaptiveLesson(lesson: {
  slug?: string | null;
  title?: string | null;
} | null | undefined): AdaptiveLessonConfig | null {
  return resolveAdaptiveLessonConfig(lesson);
}