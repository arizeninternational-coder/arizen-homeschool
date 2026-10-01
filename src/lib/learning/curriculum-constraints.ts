/**
 * CurriculumConstraints — The Curriculum Authority for the Learning Engine
 *
 * This module represents WHAT the learner must learn. It is the deterministic
 * authority that the AI can never override.
 *
 * For this phase, it uses the existing Grade 4 Mathematics → Whole Numbers →
 * Place Value concepts already present in the repository
 * (see adaptive-engine.ts PLACE_VALUE_CONCEPTS and PLACE_VALUE_MISCONCEPTIONS).
 *
 * Future subjects/strands can be added by registering a new constraint set
 * without changing the orchestrator or validator.
 *
 * The current 10-step lesson journey is NOT treated as curriculum authority.
 * The 10 steps are a teaching implementation; the concepts/prerequisites below
 * are the curriculum.
 */

// The concept IDs and labels mirror PLACE_VALUE_CONCEPTS from adaptive-engine.ts.
// This spec adds the constraint metadata (prerequisites, mastery thresholds)
// that the original ConceptId type does not carry.
import {
  PLACE_VALUE_MISCONCEPTIONS,
  Misconception,
} from '../curriculum/adaptive-engine';
import type { MasteryLevel } from '../curriculum/adaptive-engine';
import type { PedagogicalActionKind } from '../ai/AIProvider';
import type { AdaptiveLessonConfig } from '../curriculum/adaptive/types';
import { getAllAdaptiveLessonConfigs } from '../curriculum/adaptive/registry';

// ── Allowed pedagogical action types ─────────────────────────────────────────

export const ALLOWED_ACTION_TYPES: ReadonlySet<PedagogicalActionKind> = new Set([
  'explain',
  'demonstrate',
  'ask',
  'provide_hint',
  'provide_example',
  'remediate',
  'targeted_practice',
  'increase_difficulty',
  'revisit_prerequisite',
  'change_representation',
  'check_mastery',
  'move_forward',
]);

export const ALLOWED_REPRESENTATIONS: ReadonlySet<string> = new Set([
  'place_value_chart',
  'number_line',
  'counters',
  'grouped_objects',
  'digit_comparison',
  'step_reveal',
  'recap_checklist',
  'fraction_model',
  'shape_model',
]);

// ── Difficulty range ─────────────────────────────────────────────────────────

export const MIN_DIFFICULTY = 1;
export const MAX_DIFFICULTY = 5;

// ── Place Value prerequisite graph ───────────────────────────────────────────
//
// Inferred from the natural progression of place-value understanding and
// the existing concept order in PLACE_VALUE_CONCEPTS
// (adaptive-engine.ts:91-97).
//
// Each concept may declare prerequisites — concepts that must reach at
// least 'emerging' mastery before this concept can be taught.

interface ConceptSpec {
  id: string;
  label: string;
  prerequisites: string[];
  allowedRepresentations: string[];
  masteryThreshold: number; // 0–1, confidence needed to advance
}

export const PLACE_VALUE_CONCEPTS_SPEC: ConceptSpec[] = [
  {
    id: 'read-numbers',
    label: 'Read whole numbers',
    prerequisites: [],
    allowedRepresentations: ['place_value_chart', 'number_line', 'counters'],
    masteryThreshold: 0.7,
  },
  {
    id: 'digit-position',
    label: 'Identify digit position',
    prerequisites: ['read-numbers'],
    allowedRepresentations: ['place_value_chart', 'counters'],
    masteryThreshold: 0.7,
  },
  {
    id: 'digit-value',
    label: 'Identify digit value',
    prerequisites: ['read-numbers', 'digit-position'],
    allowedRepresentations: ['place_value_chart', 'number_line', 'counters'],
    masteryThreshold: 0.75,
  },
  {
    id: 'expanded-form',
    label: 'Expanded form',
    prerequisites: ['read-numbers', 'digit-position', 'digit-value'],
    allowedRepresentations: ['place_value_chart', 'counters', 'step_reveal'],
    masteryThreshold: 0.75,
  },
  {
    id: 'compare-order',
    label: 'Compare/order numbers',
    prerequisites: ['read-numbers', 'digit-position', 'digit-value', 'expanded-form'],
    allowedRepresentations: ['number_line', 'digit_comparison', 'counters'],
    masteryThreshold: 0.8,
  },
];

// ── Curriculum scope ─────────────────────────────────────────────────────────
//
// The full scope of concepts the learner is permitted to engage with
// in this curriculum unit. Any concept not in this set is out of scope
// and the validator will reject actions targeting it.

export const CURRICULUM_CONCEPT_SCOPE: ReadonlySet<string> = new Set(
  PLACE_VALUE_CONCEPTS_SPEC.map((c) => c.id)
);

// ── Misconception registry (re-exported from existing engine) ──────────────

export const PLACE_VALUE_MISCONCEPTIONS_LIST: Misconception[] = PLACE_VALUE_MISCONCEPTIONS;

// ── CurriculumConstraints type ───────────────────────────────────────────────

export interface CurriculumConstraints {
  /** All concept IDs in scope for this curriculum unit. */
  conceptScope: ReadonlySet<string>;
  /** Concepts and their metadata (prerequisites, allowed reps, mastery threshold). */
  concepts: ConceptSpec[];
  /** Prerequisite relationships: conceptId → set of prerequisite conceptIds. */
  prerequisites: Map<string, Set<string>>;
  /** Pedagogical action types permitted by the curriculum. */
  allowedActionTypes: ReadonlySet<PedagogicalActionKind>;
  /** Representations permitted by the curriculum. */
  allowedRepresentations: ReadonlySet<string>;
  /** Minimum difficulty level. */
  minDifficulty: number;
  /** Maximum difficulty level. */
  maxDifficulty: number;
  /** The curriculum objective (from CBC data). */
  objective: string;
  /** CBC strand this curriculum belongs to. */
  strand: string;
  /** CBC sub-strand. */
  subStrand: string;
  /** Grade level. */
  grade: number;
}

// ── Registry of constraint sets ──────────────────────────────────────────────
//
// Maps a curriculum key (e.g. "g4-math-place-value") to its constraints.
// The orchestrator looks up the constraint set for the current lesson.

/**
 * Constraint sets are derived from the lesson's registered AdaptiveLessonConfig
 * so a new adaptive lesson gets its own concept scope, prerequisite graph and
 * mastery thresholds without touching the orchestrator or validator.
 */
function buildConstraintsFromConfig(config: AdaptiveLessonConfig): CurriculumConstraints {
  const concepts = config.concepts.map((c) => ({
    id: c.id,
    label: c.label,
    prerequisites: [...c.prerequisites],
    allowedRepresentations: c.allowedRepresentations
      ? [...c.allowedRepresentations]
      : Array.from(ALLOWED_REPRESENTATIONS),
    masteryThreshold: c.masteryThreshold,
  }));

  return {
    conceptScope: new Set(concepts.map((c) => c.id)),
    concepts,
    prerequisites: new Map(concepts.map((c) => [c.id, new Set(c.prerequisites)])),
    allowedActionTypes: ALLOWED_ACTION_TYPES,
    allowedRepresentations: ALLOWED_REPRESENTATIONS,
    minDifficulty: MIN_DIFFICULTY,
    maxDifficulty: MAX_DIFFICULTY,
    objective: config.objectives.join(' '),
    strand: config.strand,
    subStrand: config.subStrand,
    grade: config.grade,
  };
}

const CONSTRAINT_REGISTRY: Map<string, CurriculumConstraints> = new Map();

const pvConstraints: CurriculumConstraints = {
  conceptScope: CURRICULUM_CONCEPT_SCOPE,
  concepts: PLACE_VALUE_CONCEPTS_SPEC,
  prerequisites: new Map(
    PLACE_VALUE_CONCEPTS_SPEC.map((c) => [c.id, new Set(c.prerequisites)])
  ),
  allowedActionTypes: ALLOWED_ACTION_TYPES,
  allowedRepresentations: ALLOWED_REPRESENTATIONS,
  minDifficulty: MIN_DIFFICULTY,
  maxDifficulty: MAX_DIFFICULTY,
  objective:
    'Read, write, and represent whole numbers (up to 6 digits) using place value understanding, ' +
    'expanded form, and comparison strategies.',
  strand: 'Mathematics',
  subStrand: 'Whole Numbers / Place Value',
  grade: 4,
};

CONSTRAINT_REGISTRY.set('g4-math-place-value', pvConstraints);

// Every registered adaptive lesson gets its own constraint set from its config.
for (const config of getAllAdaptiveLessonConfigs()) {
  CONSTRAINT_REGISTRY.set(config.curriculumKey, buildConstraintsFromConfig(config));
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Get curriculum constraints for a given curriculum key.
 * Falls back to the Grade 4 Place Value constraints if the key is unknown.
 */
export function getCurriculumConstraints(curriculumKey: string): CurriculumConstraints {
  return CONSTRAINT_REGISTRY.get(curriculumKey) || pvConstraints;
}

/**
 * Check whether a concept ID is within the current curriculum scope.
 */
export function isInScope(
  constraints: CurriculumConstraints,
  conceptId: string
): boolean {
  return constraints.conceptScope.has(conceptId);
}

/**
 * Get the prerequisites for a concept within this curriculum.
 */
export function getPrerequisites(
  constraints: CurriculumConstraints,
  conceptId: string
): string[] {
  return Array.from(constraints.prerequisites.get(conceptId) || new Set());
}

/**
 * Check whether all prerequisites for a concept are satisfied.
 *
 * A prerequisite is considered satisfied ONLY when the learner has reached
 * the 'proficient' mastery level on that prerequisite concept. This is the
 * single canonical prerequisite check — all call sites must use this function.
 *
 * Rationale: 'not_assessed' (never engaged), 'emerging' (one attempt,
 * possibly wrong), and 'developing' (2+ correct out of ≤3 attempts) are all
 * INSUFFICIENT. One failed attempt must never unlock the next concept merely
 * because the state is no longer 'not_assessed'.
 *
 * The threshold is 'proficient' which requires 3+ correct attempts with an
 * 80%+ accuracy ratio (per recordEvidence in adaptive-engine.ts), and
 * carries a confidence ≥ 0.8 (per computeConfidence in action-validator.ts).
 */
export function arePrerequisitesSatisfied(
  constraints: CurriculumConstraints,
  conceptId: string,
  conceptMastery: Record<string, { level: MasteryLevel; confidence: number }>
): boolean {
  const prereqs = getPrerequisites(constraints, conceptId);
  if (prereqs.length === 0) return true;
  return prereqs.every((prereq) => {
    const mastery = conceptMastery[prereq];
    if (!mastery) return false;
    return mastery.level === 'proficient';
  });
}

/**
 * Check whether a misconception ID is a recognized misconception
 * within this curriculum (from the existing PLACE_VALUE_MISCONCEPTIONS list).
 */
export function isKnownMisconception(misconceptionId: string): boolean {
  return PLACE_VALUE_MISCONCEPTIONS_LIST.some((m) => m.id === misconceptionId);
}

/**
 * Get the MasteryLevel thresholds.
 * Re-exported from the existing engine for consistency.
 */
export type { MasteryLevel } from '../curriculum/adaptive-engine';
