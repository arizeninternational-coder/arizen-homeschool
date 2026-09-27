/**
 * Tests for the AI-Native Adaptive Learning Orchestrator
 *
 * These tests verify the FULL adaptive decision chain:
 *   learner evidence → learning state → orchestrator → AI proposal
 *   → curriculum validation → final pedagogical action
 *
 * Run with: npx tsx tests/ai-native-orchestrator.test.ts
 *
 * The tests use MockAIProvider (deterministic, zero-cost) so no LLM API
 * calls are made. The OllamaProvider is covered by structural integration
 * tests only (see test_ai_providers.test.ts).
 */

import {
  createInitialLearningState,
  recordEvidence,
  type LearningState,
  type Evidence,
  type ConceptState,
  type LearningAttempt,
  type MasteryLevel,
  PLACE_VALUE_CONCEPTS,
  PLACE_VALUE_MISCONCEPTIONS,
} from '../src/lib/curriculum/adaptive-engine';
import { MockAIProvider } from '../src/lib/ai/providers/mock';
import { OllamaProvider } from '../src/lib/ai/providers/ollama';
import { createAIProvider } from '../src/lib/ai/providers';
import { AdaptiveOrchestrator } from '../src/lib/learning/orchestrator';
import { ActionValidator } from '../src/lib/learning/action-validator';
import {
  getCurriculumConstraints,
  isInScope,
  isKnownMisconception,
} from '../src/lib/learning/curriculum-constraints';
import type { AIContext, PedagogicalAction, MisconceptionAnalysis } from '../src/lib/ai/AIProvider';

// ============================================================
// Test helpers
// ============================================================

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`❌ ASSERTION FAILED: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(
      `❌ ASSERTION FAILED: ${message}\n    expected: ${expected}\n    actual:   ${actual}`
    );
  }
  console.log(`  ✓ ${message}`);
}

/** Build a LearningState with one concept pre-populated at the given mastery level. */
function buildState(
  conceptId: string,
  level: MasteryLevel,
  attempts: number,
  correctAttempts: number,
  history: Evidence[] = []
): LearningState {
  const concepts: Record<string, ConceptState> = {};
  // Pre-populate all concepts as not_assessed
  for (const c of PLACE_VALUE_CONCEPTS) {
    concepts[c.id] = {
      conceptId: c.id,
      level: 'not_assessed',
      attempts: 0,
      correctAttempts: 0,
      lastEvidence: null,
      history: [],
    };
  }
  concepts[conceptId] = {
    conceptId,
    level,
    attempts,
    correctAttempts,
    lastEvidence: history.length > 0 ? history[history.length - 1] : null,
    history,
  };

  return {
    studentId: 'test-student',
    lessonId: 'lesson-place-value',
    concepts,
    currentActivityId: 'welcome',
    remediationCount: 0,
    difficultyLevel: 2,
    startedAt: Date.now() - 3600000,
    attempts: history.map((e, i) => ({
      activityId: e.activityId || 'activity-1',
      conceptId: e.conceptId,
      selectedAnswer: e.answer || '',
      expectedAnswer: e.expectedAnswer || '',
      correct: e.correct,
      misconceptionId: e.misconceptionId || null,
      attemptNumber: e.attemptNumber || i + 1,
      timestamp: e.timestamp,
      remediationShown: e.remediationShown || null,
    })),
  };
}

/** Build Evidence for a student response. */
function buildEvidence(
  conceptId: string,
  selectedAnswer: string,
  expectedAnswer: string,
  correct: boolean,
  opts: { attemptNumber?: number; remediationShown?: string | null } = {}
): Evidence {
  return {
    conceptId,
    correct,
    timestamp: Date.now(),
    activityId: 'test-activity',
    answer: selectedAnswer,
    expectedAnswer,
    attemptNumber: opts.attemptNumber ?? 1,
    remediationShown: opts.remediationShown ?? null,
  };
}

/** Build a standard AIContext for a place-value question. */
function buildContext(
  conceptId: string,
  selectedAnswer: string,
  expectedAnswer: string,
  options: string[],
  attemptNumber?: number
): AIContext {
  return {
    learnerId: 'test-student',
    lessonId: 'lesson-place-value',
    conceptId,
    selectedAnswer,
    expectedAnswer,
    options,
    prompt: `What does the 7 represent in 4,729?`,
    attemptNumber,
  };
}

/** Build a simple MasteryEvidence list for tests. */
function buildEvidenceList(items: { correct: boolean; answer: string; expected: string }[]): Evidence[] {
  return items.map((item, i) =>
    buildEvidence('read-numbers', item.answer, item.expected, item.correct, { attemptNumber: i + 1 })
  );
}

// ============================================================
// Tests
// ============================================================

async function test_scenarioA_mastery(): Promise<void> {
  console.log('\n--- Scenario A: Mastery → move_forward ---');

  // Set up: 'read-numbers' at proficient, 5/5 correct, confidence=1.0
  const state = buildState('read-numbers', 'proficient', 5, 5);
  const evidence = buildEvidence('read-numbers', '3042', '3042', true);
  const context = buildContext('read-numbers', '3042', '3042', ['3042', '3402', '3002', '3240'], 6);

  const ai = new MockAIProvider('mastery');
  const orchestrator = new AdaptiveOrchestrator(ai);

  const decision = await orchestrator.decide({
    learnerState: state,
    evidence,
    context,
  });

  assert(decision.usedFallback === false, 'mastery: fallback not used');
  assert(decision.aiProposal === null, 'mastery: AI not consulted for mastery declaration');
  assertEqual(decision.finalAction.actionType, 'move_forward', 'mastery: final action is move_forward');
  assertEqual(
    (decision.finalAction as PedagogicalAction & { nextConceptId: string }).nextConceptId,
    'digit-position',
    'mastery: moves to next concept in chain (digit-position)'
  );
}

async function test_scenarioB_repeated_misconception(): Promise<void> {
  console.log('\n--- Scenario B: Repeated misconception → remediate ---');

  // Set up: 'digit-position' at emerging, multiple wrong answers
  const state = buildState('digit-position', 'emerging', 3, 0);
  const evidence = buildEvidence('digit-position', '7', '7 hundreds', false);
  const context = buildContext('digit-position', '7', '7 hundreds', ['7', '7 tens', '7 hundreds', '7 thousands'], 4);

  const ai = new MockAIProvider('repeated_misconception');
  const orchestrator = new AdaptiveOrchestrator(ai);

  const decision = await orchestrator.decide({
    learnerState: state,
    evidence,
    context,
  });

  assert(decision.usedFallback === false, 'misconception: fallback not used');
  assert(decision.aiProposal !== null, 'misconception: AI was consulted');
  assertEqual(decision.finalAction.actionType, 'remediate', 'misconception: final action is remediate');
  assertEqual(
    (decision.finalAction as PedagogicalAction & { misconceptionId: string }).misconceptionId,
    'position-confusion',
    'misconception: identifies position-confusion'
  );
  assertEqual(ai.getScenario(), 'repeated_misconception', 'misconception: mock provider scenario correct');
}

async function test_scenarioC_failure_after_remediation(): Promise<void> {
  console.log('\n--- Scenario C: Failure after remediation → change_representation ---');

  // Set up: 'expanded-form' with prior remediation shown, still failing
  const priorEvidence1: Evidence = buildEvidence(
    'expanded-form', '1472', '1547', false, { remediationShown: 'place_value_chart' }
  );
  const priorEvidence2: Evidence = buildEvidence(
    'expanded-form', '1472', '1547', false
  );
  const state = buildState(
    'expanded-form', 'emerging', 2, 0,
    [priorEvidence1, priorEvidence2]
  );

  const evidence = buildEvidence('expanded-form', '1472', '1547', false);
  const context = buildContext(
    'expanded-form', '1472', '1547',
    ['1247', '1347', '1447', '1547'], 3
  );

  const ai = new MockAIProvider('failure_after_remediation');
  const orchestrator = new AdaptiveOrchestrator(ai);

  const decision = await orchestrator.decide({
    learnerState: state,
    evidence,
    context,
  });

  assert(decision.usedFallback === false, 'failure_after_remediation: fallback not used');
  assert(decision.aiProposal !== null, 'failure_after_remediation: AI was consulted');
  assertEqual(
    decision.finalAction.actionType, 'change_representation',
    'failure_after_remediation: escalates to change_representation'
  );
  assertEqual(
    (decision.finalAction as PedagogicalAction & { representation: string }).representation,
    'number_line',
    'failure_after_remediation: uses number_line (different from prior place_value_chart)'
  );
}

async function test_scenarioD_rapid_mastery(): Promise<void> {
  console.log('\n--- Scenario D: Rapid mastery → check_mastery ---');

  // Set up: 'digit-value' not yet assessed, learner gets it right immediately
  const state = buildState('digit-value', 'not_assessed', 0, 0);
  const evidence = buildEvidence('digit-value', '700', '700', true);
  const context = buildContext('digit-value', '700', '700', ['7', '70', '700', '7000'], 1);

  const ai = new MockAIProvider('rapid_mastery');
  const orchestrator = new AdaptiveOrchestrator(ai);

  const decision = await orchestrator.decide({
    learnerState: state,
    evidence,
    context,
  });

  assert(decision.usedFallback === false, 'rapid_mastery: fallback not used');
  assert(decision.aiProposal !== null, 'rapid_mastery: AI was consulted');
  assertEqual(
    decision.finalAction.actionType, 'check_mastery',
    'rapid_mastery: action is check_mastery (verify, don\'t just advance)'
  );
}

async function test_scenarioE_correct_with_misconception(): Promise<void> {
  console.log('\n--- Scenario E: Correct answer + misconception evidence → remediate ---');

  // Set up: 'compare-order' at 'developing' (1/2 correct), evidence suggests misconception
  const state = buildState('compare-order', 'developing', 2, 1);
  const evidence = buildEvidence('compare-order', '5261', '5261', true); // correct this time
  const context = buildContext('compare-order', '5261', '5261', ['5621', '5261', '5061', '526'], 3);

  const ai = new MockAIProvider({
    scenario: 'correct_with_misconception',
    misconceptionId: 'comparison-reverse',
  });
  const orchestrator = new AdaptiveOrchestrator(ai);

  const decision = await orchestrator.decide({
    learnerState: state,
    evidence,
    context,
  });

  assert(decision.usedFallback === false, 'correct_with_misconception: fallback not used');
  assert(decision.aiProposal !== null, 'correct_with_misconception: AI was consulted');
  assertEqual(
    decision.finalAction.actionType, 'remediate',
    'correct_with_misconception: does NOT auto-advance; proposes remediation'
  );
  assertEqual(
    (decision.finalAction as PedagogicalAction & { misconceptionId: string }).misconceptionId,
    'comparison-reverse',
    'correct_with_misconception: identifies comparison-reverse misconception'
  );
}

async function test_scenarioF_out_of_scope(): Promise<void> {
  console.log('\n--- Scenario F: AI proposes out-of-scope → validator rejects → fallback ---');

  // Set up: 'read-numbers' at emerging, 1/4 correct
  const state = buildState('read-numbers', 'emerging', 4, 1);
  const evidence = buildEvidence('read-numbers', 'wrong', '3042', false);
  const context = buildContext('read-numbers', 'wrong', '3042', ['3042', '3402', '3002', '3240'], 5);

  const ai = new MockAIProvider('out_of_scope');
  const orchestrator = new AdaptiveOrchestrator(ai);

  const decision = await orchestrator.decide({
    learnerState: state,
    evidence,
    context,
  });

  assert(decision.usedFallback === true, 'out_of_scope: fallback WAS used (validator rejected)');
  assert(decision.validationResult.valid === false, 'out_of_scope: validator rejected the AI proposal');
  assert(
    decision.validationResult.reason !== null &&
    decision.validationResult.reason?.includes('calculus'),
    'out_of_scope: rejection reason mentions the out-of-scope concept (calculus)'
  );
  assertEqual(
    decision.aiProposal?.actionType, 'move_forward',
    'out_of_scope: AI proposed move_forward (to calculus)'
  );
  assert(
    decision.finalAction.actionType !== 'move_forward' ||
    (decision.finalAction as PedagogicalAction & { nextConceptId?: string }).nextConceptId !== 'calculus',
    'out_of_scope: final action does NOT move to calculus'
  );
}

async function test_scenarioG_prerequisite_violation(): Promise<void> {
  console.log('\n--- Scenario G: AI proposes move_forward violating prerequisites → rejected ---');

  // Set up: 'digit-value' not assessed, but AI tries to move to 'expanded-form'
  // which requires digit-value as a prerequisite
  const state = buildState('digit-value', 'not_assessed', 0, 0);
  const evidence = buildEvidence('digit-value', '700', '700', false);
  const context = buildContext('digit-value', '700', '700', ['7', '70', '700', '7000'], 1);

  // Custom mock that proposes move_forward to 'expanded-form' (which requires digit-value AND digit-position as prereqs)
  const ai = new MockAIProvider({
    scenario: 'mastery',  // base scenario doesn't matter — we override nextConceptId
    nextConceptId: 'expanded-form',
  });

  // Override selectNextAction to return move_forward to expanded-form
  ai.selectNextAction = async () => ({
    actionType: 'move_forward' as const,
    conceptId: 'digit-value',
    nextConceptId: 'expanded-form',
    reason: 'AI proposes advancing to expanded-form (bypassing prerequisites).',
    confidence: 0.8,
  });

  const orchestrator = new AdaptiveOrchestrator(ai);

  const decision = await orchestrator.decide({
    learnerState: state,
    evidence,
    context,
  });

  // digit-value is 'not_assessed' so the orchestrator's short-circuit won't trigger
  // The AI proposes move_forward to expanded-form, but digit-position (a prereq) is not assessed
  assert(decision.usedFallback === true, 'prereq_violation: fallback used (validator blocked)');
  assert(decision.validationResult.valid === false, 'prereq_violation: validator rejected');
  assert(
    decision.validationResult.reason !== null &&
    decision.validationResult.reason?.includes('prerequisite'),
    'prereq_violation: rejection reason mentions prerequisite'
  );
}

async function test_orchestrator_returns_ai_proposal_when_valid(): Promise<void> {
  console.log('\n--- Test: Valid AI proposal is accepted as-is ---');

  // Set up: 'expanded-form' at emerging, some wrong answers
  const state = buildState('expanded-form', 'emerging', 2, 0);
  const evidence = buildEvidence('expanded-form', '1247', '1547', false);
  const context = buildContext('expanded-form', '1247', '1547', ['1247', '1347', '1447', '1547'], 3);

  const ai = new MockAIProvider('repeated_misconception');
  const orchestrator = new AdaptiveOrchestrator(ai);

  const decision = await orchestrator.decide({
    learnerState: state,
    evidence,
    context,
  });

  assert(decision.usedFallback === false, 'valid_proposal: accepted without fallback');
  assert(decision.finalAction === decision.aiProposal, 'valid_proposal: finalAction IS the AI proposal');
  assertEqual(decision.finalAction.actionType, 'remediate', 'valid_proposal: action is remediate');
}

async function test_orchestrator_mastery_short_circuit_skips_ai(): Promise<void> {
  console.log('\n--- Test: Mastery short-circuit skips AI entirely ---');

  const state = buildState('compare-order', 'proficient', 4, 4);
  const evidence = buildEvidence('compare-order', '5621', '5621', true);
  const context = buildContext('compare-order', '5621', '5621', ['5621', '5261', '6521', '2561'], 5);

  const ai = new MockAIProvider('mastery');
  const orchestrator = new AdaptiveOrchestrator(ai);

  const decision = await orchestrator.decide({
    learnerState: state,
    evidence,
    context,
  });

  assertEqual(ai.callCount.analyze, 0, 'mastery_short_circuit: AI analyze was NOT called');
  assertEqual(ai.callCount.select, 0, 'mastery_short_circuit: AI selectNextAction was NOT called');
  assertEqual(ai.callCount.diagnose, 0, 'mastery_short_circuit: AI diagnose was NOT called');
  assert(decision.aiProposal === null, 'mastery_short_circuit: aiProposal is null');
  assertEqual(decision.finalAction.actionType, 'check_mastery' as const, 'mastery_short_circuit: no next concept, so check_mastery');
  // compare-order is the last concept — no next concept in chain
  assert(
    (decision.finalAction as PedagogicalAction & { nextConceptId?: string }).nextConceptId === undefined,
    'mastery_short_circuit: last concept has no nextConceptId'
  );
}

async function test_provider_factory(): Promise<void> {
  console.log('\n--- Test: Provider factory selects correct provider ---');

  // Test mock provider
  const mockProvider = createAIProvider({ provider: 'mock' });
  assert(mockProvider instanceof MockAIProvider, 'factory: AI_PROVIDER=mock returns MockAIProvider');

  // Test ollama provider (structural — we verify it's the right class)
  const ollamaProvider = createAIProvider({ provider: 'ollama' });
  assert(ollamaProvider instanceof OllamaProvider, 'factory: AI_PROVIDER=ollama returns OllamaProvider');

  // Test both implement the same interface (duck-typing via method presence)
  assert(typeof mockProvider.selectNextAction === 'function', 'factory: mock has selectNextAction');
  assert(typeof ollamaProvider.selectNextAction === 'function', 'factory: ollama has selectNextAction');
  assert(typeof mockProvider.analyzeLearnerEvidence === 'function', 'factory: mock has analyzeLearnerEvidence');
  assert(typeof ollamaProvider.analyzeLearnerEvidence === 'function', 'factory: ollama has analyzeLearnerEvidence');
}

async function test_validation_boundary(): Promise<void> {
  console.log('\n--- Test: ActionValidator blocks unknown concepts ---');

  const constraints = getCurriculumConstraints('g4-math-place-value');
  const validator = new ActionValidator(constraints);

  // Action referencing an unknown concept
  const badAction: PedagogicalAction = {
    actionType: 'explain',
    conceptId: 'calculus',
    reason: 'AI wants to teach calculus',
    confidence: 0.5,
    content: 'Let me explain calculus...',
  };

  const state = buildState('read-numbers', 'not_assessed', 0, 0);
  const result = validator.validate(badAction, state);

  assert(result.valid === false, 'validation: unknown concept rejected');
  assert(
    (result as { valid: false; reason: string }).reason.includes('outside the current curriculum scope'),
    'validation: reason mentions out-of-scope'
  );
}

async function test_validation_boundary_unknown_misconception(): Promise<void> {
  console.log('\n--- Test: ActionValidator blocks unknown misconceptions ---');

  const constraints = getCurriculumConstraints('g4-math-place-value');
  const validator = new ActionValidator(constraints);

  const badAction: PedagogicalAction = {
    actionType: 'remediate',
    conceptId: 'expanded-form',
    misconceptionId: 'quantum-confusion', // ← not a real misconception
    representation: 'place_value_chart',
    escalated: false,
    reason: 'AI detected quantum confusion',
    confidence: 0.8,
  };

  const state = buildState('expanded-form', 'emerging', 1, 0);
  const result = validator.validate(badAction, state);

  assert(result.valid === false, 'validation: unknown misconception rejected');
}

async function test_validation_boundary_unknown_representation(): Promise<void> {
  console.log('\n--- Test: ActionValidator blocks unapproved representations ---');

  const constraints = getCurriculumConstraints('g4-math-place-value');
  const validator = new ActionValidator(constraints);

  const badAction: PedagogicalAction = {
    actionType: 'change_representation',
    conceptId: 'read-numbers',
    representation: 'holodeck_simulation', // ← not approved
    reason: 'AI wants to use holodeck',
    confidence: 0.8,
  };

  const state = buildState('read-numbers', 'emerging', 1, 0);
  const result = validator.validate(badAction, state);

  assert(result.valid === false, 'validation: unknown representation rejected');
  assert(
    (result as { valid: false; fallback: PedagogicalAction }).fallback.actionType !== 'change_representation' ||
      (result as { valid: false; fallback: PedagogicalAction }).fallback.actionType === 'provide_hint',
    'validation: unknown representation triggers fallback'
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// NEW TESTS — Diagnosis-Driven Action Selection & Prerequisite Enforcement
// ──────────────────────────────────────────────────────────────────────────────

function assertNotEqual<T>(actual: T, expected: T, message: string): void {
  if (actual === expected) {
    throw new Error(
      `❌ ASSERTION FAILED: ${message}\n    expected: ${expected}\n    actual:   ${actual}\n    (They should be different — demonstrating diagnosis drives the action)`
    );
  }
  console.log(`  ✓ ${message}`);
}

/** Build a LearningState with multiple concepts overridden from not_assessed. */
function buildStateMulti(
  overrides: Partial<
    Record<
      string,
      { level: MasteryLevel; attempts: number; correctAttempts: number }
    >
  >
): LearningState {
  const state = buildState('read-numbers', 'not_assessed', 0, 0);
  for (const [id, override] of Object.entries(overrides)) {
    if (state.concepts[id]) {
      state.concepts[id].level = override!.level;
      state.concepts[id].attempts = override!.attempts;
      state.concepts[id].correctAttempts = override!.correctAttempts;
    }
  }
  return state;
}

async function test_diagnosis_matters(): Promise<void> {
  console.log('\n--- Test: Same evidence + different diagnosis → different action ---');

  // Same state, SAME evidence, SAME context — only the AI's diagnosis differs.
  // Mock1: diagnosis = 'position-confusion' (specific technical issue)
  //   → selectNextAction should propose 'remediate' (targeted)
  // Mock2: diagnosis = 'read-numbers'    (broad conceptual failure)
  //   → selectNextAction should propose 'explain' (re-teaching from scratch)

  const state = buildStateMulti({
    'digit-position': { level: 'emerging', attempts: 3, correctAttempts: 0 },
  });
  const evidence = buildEvidence('digit-position', '7', '7 tens', false);
  const context = buildContext(
    'digit-position', '7', '7 tens',
    ['7', '7 tens', '70', '700'], 4
  );

  // Mock1: repeated_misconception scenario → diagnosis: position-confusion
  const ai1 = new MockAIProvider({
    scenario: 'repeated_misconception',
    misconceptionId: 'position-confusion',
  });

  // Mock2: correct_with_misconception scenario → diagnosis: read-numbers
  const ai2 = new MockAIProvider({
    scenario: 'correct_with_misconception',
    misconceptionId: 'read-numbers',
  });

  const orch1 = new AdaptiveOrchestrator(ai1);
  const orch2 = new AdaptiveOrchestrator(ai2);

  const d1 = await orch1.decide({ learnerState: state, evidence, context });
  const d2 = await orch2.decide({ learnerState: state, evidence, context });

  // Both should have consulted the AI (no short-circuit at 'emerging' level)
  assert(d1.aiProposal !== null, 'diagnosis_test: AI consulted for position-confusion');
  assert(d2.aiProposal !== null, 'diagnosis_test: AI consulted for read-numbers');

  // Same evidence, different diagnoses → different action types
  assertNotEqual(
    d1.finalAction.actionType, d2.finalAction.actionType,
    'diagnosis_test: same evidence + different diagnosis → different action type'
  );

  // Position-confusion → remediate (targeted intervention)
  assertEqual(
    d1.finalAction.actionType, 'remediate',
    'diagnosis_test: position-confusion → remediate (targeted)'
  );
  const d1Action = d1.finalAction as PedagogicalAction & { misconceptionId: string };
  assertEqual(d1Action.misconceptionId, 'position-confusion', 'diagnosis_test: remediate targets position-confusion');

  // read-numbers → explain (broad failure → re-teaching)
  assertEqual(
    d2.finalAction.actionType, 'explain',
    'diagnosis_test: read-numbers → explain (broader failure needs re-teaching)'
  );

  // The diagnosis appears in the reasoning (not just metadata)
  assert(
    d1.reasoning.includes('position-confusion'),
    'diagnosis_test: reasoning mentions the diagnosed misconception for remediate'
  );
}

async function test_diagnosis_failure_after_remediation_escalates(): Promise<void> {
  console.log('\n--- Test: Diagnosis + failed remediation → escalation ---');

  // When the AI diagnoses a misconception but the learner has already
  // been remediated for it (and still failed), the action should escalate
  // to a different representation — NOT just repeat the same remediation.

  const priorRemediation: Evidence = buildEvidence(
    'expanded-form', '1472', '1547', false, { remediationShown: 'place_value_chart' }
  );
  const state = buildState(
    'expanded-form', 'emerging', 2, 0, [priorRemediation]
  );
  const evidence = buildEvidence('expanded-form', '1472', '1547', false);
  const context = buildContext(
    'expanded-form', '1472', '1547',
    ['1247', '1347', '1447', '1547'], 3
  );

  const ai = new MockAIProvider({
    scenario: 'failure_after_remediation',
    misconceptionId: 'expanded-form-skip',
  });
  const orch = new AdaptiveOrchestrator(ai);

  const decision = await orch.decide({ learnerState: state, evidence, context });

  assert(decision.usedFallback === false, 'escalation: validator accepted the AI proposal');
  assert(decision.aiProposal !== null, 'escalation: AI was consulted');
  assertEqual(
    decision.finalAction.actionType, 'change_representation',
    'escalation: diagnosis of persistent misconception → change_representation (not repeat remediation)'
  );
  assert(
    (decision.finalAction as PedagogicalAction & { representation: string }).representation === 'number_line',
    'escalation: uses number_line (different from prior place_value_chart)'
  );
  assert(
    decision.reasoning.includes('expanded-form-skip'),
    'escalation: reasoning mentions the diagnosed misconception'
  );
}

// ── Direct diagnosis-driven test (single provider, same evidence) ──────────────

async function test_diagnosis_directly_changes_action(): Promise<void> {
  console.log('\\n--- Test: Single provider, same evidence, different diagnosis → different action ---');

  // One provider instance, identical evidence + context — ONLY the diagnosis
  // parameter varies. If selectNextAction does not use the diagnosis, both
  // calls return the same action and this test fails.
  const provider = new MockAIProvider({
    scenario: 'repeated_misconception',
    misconceptionId: 'position-confusion',
  });

  const evidence = buildEvidence('digit-position', '7', '7 tens', false);
  const context = buildContext('digit-position', '7', '7 tens', ['7', '7 tens', '70', '700'], 4);

  const diagnosisA: MisconceptionAnalysis = {
    misconceptionId: 'position-confusion',
    confidence: 0.9,
    explanation: 'Specific place-value position confusion.',
    evidenceStrength: 'strong',
  };

  const diagnosisB: MisconceptionAnalysis = {
    misconceptionId: 'read-numbers',
    confidence: 0.9,
    explanation: 'Broad whole-number reading failure.',
    evidenceStrength: 'strong',
  };

  const actionA = await provider.selectNextAction('digit-position', [evidence], context, diagnosisA);
  const actionB = await provider.selectNextAction('digit-position', [evidence], context, diagnosisB);

  // Same evidence, same provider, different diagnosis → different action
  assertNotEqual(
    actionA.actionType, actionB.actionType,
    'direct: same evidence + different diagnosis → different action type'
  );
  assertEqual(actionA.actionType, 'remediate', 'direct: position-confusion → remediate');
  assertEqual(actionB.actionType, 'explain', 'direct: read-numbers → explain');
  assertNotEqual(
    (actionA as PedagogicalAction & { misconceptionId: string }).misconceptionId,
    (actionB as PedagogicalAction & { misconceptionId?: string }).misconceptionId,
    'direct: different diagnoses target different misconceptions'
  );
}

// ── Prerequisite enforcement tests ─────────────────────────────────────────

async function test_prereq_not_assessed_blocked(): Promise<void> {
  console.log('\n--- Test: Prerequisite not_assessed → move_forward blocked ---');

  const constraints = getCurriculumConstraints('g4-math-place-value');
  const validator = new ActionValidator(constraints);

  // read-numbers is not_assessed → cannot move to digit-position
  const state = buildState('read-numbers', 'not_assessed', 0, 0);
  const action: PedagogicalAction = {
    actionType: 'move_forward',
    conceptId: 'read-numbers',
    nextConceptId: 'digit-position',
    reason: 'test: not_assessed prereq',
    confidence: 0.9,
  };
  const result = validator.validate(action, state);
  assert(result.valid === false, 'prereq_not_assessed: blocked');
  assert(
    (result as { valid: false; reason: string }).reason.includes('prerequisite'),
    'prereq_not_assessed: reason mentions prerequisite'
  );
}

async function test_prereq_emerging_blocked(): Promise<void> {
  console.log('\n--- Test: Prerequisite at emerging → move_forward blocked ---');

  const constraints = getCurriculumConstraints('g4-math-place-value');
  const validator = new ActionValidator(constraints);

  // read-numbers is 'emerging' (one wrong attempt) → NOT sufficient
  const state = buildState('read-numbers', 'emerging', 1, 0);
  const action: PedagogicalAction = {
    actionType: 'move_forward',
    conceptId: 'read-numbers',
    nextConceptId: 'digit-position',
    reason: 'test: emerging prereq',
    confidence: 0.9,
  };
  const result = validator.validate(action, state);
  assert(result.valid === false, 'prereq_emerging: blocked (one attempt insufficient)');
  assert(
    (result as { valid: false; reason: string }).reason.includes('prerequisite'),
    'prereq_emerging: reason mentions prerequisite'
  );
}

async function test_prereq_developing_blocked(): Promise<void> {
  console.log('\n--- Test: Prerequisite at developing → move_forward blocked ---');

  const constraints = getCurriculumConstraints('g4-math-place-value');
  const validator = new ActionValidator(constraints);

  // read-numbers is 'developing' (2/3 correct) → NOT sufficient for prereq
  const state = buildState('read-numbers', 'developing', 3, 2);
  const action: PedagogicalAction = {
    actionType: 'move_forward',
    conceptId: 'read-numbers',
    nextConceptId: 'digit-position',
    reason: 'test: developing prereq',
    confidence: 0.9,
  };
  const result = validator.validate(action, state);
  assert(result.valid === false, 'prereq_developing: blocked (developing insufficient)');
  assert(
    (result as { valid: false; reason: string }).reason.includes('prerequisite'),
    'prereq_developing: reason mentions prerequisite'
  );
}

async function test_prereq_proficient_allowed(): Promise<void> {
  console.log('\n--- Test: All prerequisites at proficient → move_forward allowed ---');

  const constraints = getCurriculumConstraints('g4-math-place-value');
  const validator = new ActionValidator(constraints);

  // read-numbers at proficient → digit-position allowed
  const state = buildState('read-numbers', 'proficient', 5, 5);
  const action: PedagogicalAction = {
    actionType: 'move_forward',
    conceptId: 'read-numbers',
    nextConceptId: 'digit-position',
    reason: 'test: proficient prereq',
    confidence: 0.95,
  };
  const result = validator.validate(action, state);
  assert(result.valid === true, 'prereq_proficient: allowed');
  assertEqual(
    (result as { valid: true; action: PedagogicalAction }).action.actionType,
    'move_forward',
    'prereq_proficient: final action is move_forward'
  );
}

async function test_prereq_partial_blocked(): Promise<void> {
  console.log('\n--- Test: One prerequisite insufficient → move_forward blocked ---');

  const constraints = getCurriculumConstraints('g4-math-place-value');
  const validator = new ActionValidator(constraints);

  // Moving to 'expanded-form' requires: read-numbers, digit-position, digit-value
  // read-numbers = proficient, digit-position = emerging (insufficient)
  const state = buildStateMulti({
    'read-numbers': { level: 'proficient', attempts: 5, correctAttempts: 5 },
    'digit-position': { level: 'emerging', attempts: 1, correctAttempts: 0 },
  });
  // Set the current concept (read-numbers) to non-not_assessed
  // (already done above: proficient)
  const action: PedagogicalAction = {
    actionType: 'move_forward',
    conceptId: 'read-numbers',
    nextConceptId: 'expanded-form',
    reason: 'test: partial prerequisites',
    confidence: 0.95,
  };
  const result = validator.validate(action, state);
  assert(result.valid === false, 'prereq_partial: blocked (digit-position only emerging)');
  assert(
    (result as { valid: false; reason: string }).reason.includes('digit-position'),
    'prereq_partial: reason identifies the unsatisfied prerequisite'
  );
}

// ── Evidence deduplication regression test ──────────────────────────────────

async function test_evidence_deduplication(): Promise<void> {
  console.log('\\n--- Test: Evidence deduplication — no duplicate records in AI input ---');

  // Set up a state with 3 prior evidence records. buildState creates BOTH
  // concept.history AND state.attempts from the same history array, so
  // gatherEvidenceForConcept would see 3 history + 3 attempts = 6 records
  // with 3 duplicates (same timestamp, same interaction).
  // After recordEvidence adds a 4th, it becomes 4 + 4 = 8 with 4 duplicates.
  // After dedup, the AI provider should see exactly 4 unique records.

  // Use explicit timestamps so distinct attempts are never collapsed.
  const e1: Evidence = {
    conceptId: 'digit-position', correct: false, timestamp: 1000,
    activityId: 'act-1', answer: '7', expectedAnswer: '7 tens', attemptNumber: 1,
  };
  const e2: Evidence = {
    conceptId: 'digit-position', correct: false, timestamp: 2000,
    activityId: 'act-2', answer: '7 hundreds', expectedAnswer: '7 tens', attemptNumber: 2,
  };
  const e3: Evidence = {
    conceptId: 'digit-position', correct: false, timestamp: 3000,
    activityId: 'act-3', answer: '70', expectedAnswer: '7 tens', attemptNumber: 3,
  };
  const state = buildState('digit-position', 'emerging', 3, 0, [e1, e2, e3]);

  // 4th attempt — a correct answer
  const evidence: Evidence = {
    conceptId: 'digit-position', correct: true, timestamp: 4000,
    activityId: 'act-4', answer: '7 tens', expectedAnswer: '7 tens', attemptNumber: 4,
  };
  const context = buildContext(
    'digit-position', '7 tens', '7 tens',
    ['7', '7 tens', '70', '700'], 4
  );

  // Use a mock that captures the evidence it receives
  const ai = new MockAIProvider('mastery');
  let capturedEvidence: Evidence[] = [];
  ai.selectNextAction = async (_conceptId, evidence, _context, _diagnosis) => {
    capturedEvidence = evidence;
    return {
      actionType: 'ask' as const,
      conceptId: _conceptId,
      prompt: 'test',
      options: ['A', 'B', 'C', 'D'],
      reason: 'test',
      confidence: 0.5,
    };
  };

  const orchestrator = new AdaptiveOrchestrator(ai);
  await orchestrator.decide({ learnerState: state, evidence, context });

  // Without dedup: 4 history + 4 attempts = 8 records
  // With dedup: 4 unique records
  assertEqual(
    capturedEvidence.length, 4,
    'dedup: 4 unique evidence records (not 8 duplicates from history+attempts)'
  );

  // Verify all 4 records are genuinely distinct
  const keys = capturedEvidence.map((e) => `${e.timestamp}|${e.answer}|${e.correct}`);
  const uniqueKeys = new Set(keys);
  assertEqual(
    uniqueKeys.size, 4,
    'dedup: all 4 records are genuinely distinct (no false deduplication)'
  );

  // Verify chronological order is preserved
  for (let i = 1; i < capturedEvidence.length; i++) {
    assert(
      capturedEvidence[i].timestamp >= capturedEvidence[i - 1].timestamp,
      `dedup: record ${i} is chronological (timestamp ${capturedEvidence[i].timestamp} >= ${capturedEvidence[i - 1].timestamp})`
    );
  }

  // Verify the distinct attempts are all present
  const answers = capturedEvidence.map((e) => e.answer);
  assert(answers.includes('7'), 'dedup: distinct attempt "7" preserved');
  assert(answers.includes('7 hundreds'), 'dedup: distinct attempt "7 hundreds" preserved');
  assert(answers.includes('70'), 'dedup: distinct attempt "70" preserved');
  assert(answers.includes('7 tens'), 'dedup: distinct attempt "7 tens" (correct) preserved');
}

// ──────────────────────────────────────────────────────────────────────────────

// ============================================================
// Main
// ============================================================

async function main(): Promise<void> {
  console.log('=== AI-Native Adaptive Orchestrator Tests ===');
  console.log(`Model: Qwen3 7B Q4_K_M (via Ollama)`);
  console.log(`Provider config: AI_PROVIDER=ollama (structural test only)`);

  // Verify curriculum constraints are loaded
  const constraints = getCurriculumConstraints('g4-math-place-value');
  assertEqual(constraints.concepts.length, 5, 'curriculum: 5 Place Value concepts loaded');
  assert(isInScope(constraints, 'read-numbers'), 'curriculum: read-numbers is in scope');
  assert(!isInScope(constraints, 'calculus'), 'curriculum: calculus is out of scope');
  assert(isKnownMisconception('position-confusion'), 'curriculum: position-confusion is a known misconception');
  assert(!isKnownMisconception('quantum-confusion'), 'curriculum: quantum-confusion is NOT known');

  // Verify the model exists locally
  console.log(`\nModel check: Qwen3 7B Q4_K_M expected via Ollama at http://localhost:11434`);

  // Run all adaptive scenarios
  await test_scenarioA_mastery();
  await test_scenarioB_repeated_misconception();
  await test_scenarioC_failure_after_remediation();
  await test_scenarioD_rapid_mastery();
  await test_scenarioE_correct_with_misconception();
  await test_scenarioF_out_of_scope();
  await test_scenarioG_prerequisite_violation();

  // Run boundary tests
  await test_orchestrator_returns_ai_proposal_when_valid();
  await test_orchestrator_mastery_short_circuit_skips_ai();
  await test_provider_factory();
  await test_validation_boundary();
  await test_validation_boundary_unknown_misconception();
  await test_validation_boundary_unknown_representation();

  // Run diagnosis-driven action selection tests
  await test_diagnosis_matters();
  await test_diagnosis_directly_changes_action();
  await test_diagnosis_failure_after_remediation_escalates();

  // Run prerequisite enforcement tests
  await test_prereq_not_assessed_blocked();
  await test_prereq_emerging_blocked();
  await test_prereq_developing_blocked();
  await test_prereq_proficient_allowed();
  await test_prereq_partial_blocked();

  // Run evidence deduplication test
  await test_evidence_deduplication();

  console.log('\n=== All tests passed ✓ ===');
}

main().catch((err) => {
  console.error('\n❌ Test failure:', err.message);
  process.exit(1);
});
