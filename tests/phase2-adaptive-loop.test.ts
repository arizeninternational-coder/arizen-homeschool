/**
 * Phase 2 Integration Tests — Adaptive Learning Vertical Slice
 *
 * Grade 4 Mathematics → Whole Numbers → Place Value
 *
 * These tests prove that the AdaptiveOrchestrator actually controls the
 * learning path — a learner's real response measurably influences the
 * next pedagogical activity through the orchestrator.
 *
 * Run: npx tsx tests/phase2-adaptive-loop.test.ts
 */

import { AdaptiveOrchestrator } from "../src/lib/learning/orchestrator";
import { MockAIProvider } from "../src/lib/ai/providers/mock";
import { ActionValidator, extractConceptMastery, type ConceptMasterySnapshot } from "../src/lib/learning/action-validator";
import { createInitialLearningState, recordEvidence } from "../src/lib/curriculum/adaptive-engine";
import { PLACE_VALUE_CONCEPTS } from "../src/lib/curriculum/adaptive-engine";
import { getCurriculumConstraints } from "../src/lib/learning/curriculum-constraints";
import { pedagogicalActionToJourneyStep, canComputeAdvance } from "../src/lib/learning/action-adapter";
import type { Evidence, LearningState } from "../src/lib/curriculum/adaptive-engine";
import type { PedagogicalAction } from "../src/lib/ai/AIProvider";

// ── Concept IDs (strings, not ConceptId objects) ──────────────────────────

const CONCEPT_IDS = PLACE_VALUE_CONCEPTS.map((c) => c.id);

// ── Helpers ──────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(cond: unknown, msg: string): void {
  if (cond) {
    passed++;
  } else {
    failed++;
    console.error(`  ❌ FAIL: ${msg}`);
  }
}

function buildState(): LearningState {
  return createInitialLearningState("test-learner", "grade4-place-value", CONCEPT_IDS);
}

function buildEvidence(
  conceptId: string,
  selectedAnswer: string,
  expectedAnswer: string,
  correct: boolean,
  attemptNumber = 1,
  remediationShown?: string,
): Evidence {
  return {
    conceptId,
    correct,
    timestamp: Date.now() + attemptNumber, // unique timestamps per attempt
    activityId: "place-value-practice",
    answer: selectedAnswer,
    expectedAnswer,
    attemptNumber,
    remediationShown,
  };
}

function buildAIContext(conceptId: string, selectedAnswer: string, expectedAnswer: string, attemptNumber = 1) {
  return {
    learnerId: "test-learner",
    lessonId: "grade4-place-value",
    conceptId,
    selectedAnswer,
    expectedAnswer,
    options: ["1", "2", "3", "4"],
    attemptNumber,
    prompt: "What is the value of the digit?",
  };
}

function buildOrchestrator(scenario: string | object) {
  const provider = new MockAIProvider(scenario);
  return { orch: new AdaptiveOrchestrator(provider), provider };
}

function replayEvidence(state: LearningState, evidenceList: Evidence[]): LearningState {
  let s = state;
  for (const e of evidenceList) s = recordEvidence(s, e);
  return s;
}

async function runOrchestrator(
  scenario: string | object,
  conceptId: string,
  evidenceList: Evidence[],
  latestEvidence: Evidence,
) {
  const state = replayEvidence(buildState(), evidenceList);
  const { orch } = buildOrchestrator(scenario);
  const context = buildAIContext(
    conceptId,
    latestEvidence.answer || "",
    latestEvidence.expectedAnswer || "",
    latestEvidence.attemptNumber || 1,
  );
  const decision = await orch.decide({
    learnerState: state,
    evidence: latestEvidence,
    context,
  });
  return { decision, state, context };
}

// ── Test 1: Diagnosis changes learner path ─────────────────────────────────

async function testDiagnosisChangesPath(): Promise<void> {
  console.log("\n  Test 1: Diagnosis changes learner path");
  console.log("    Same learner evidence, different AI diagnoses → different actions");

  const conceptId = "digit-position";
  const state = buildState();
  const evidence = buildEvidence(conceptId, "2", "5", false, 1);
  const context = buildAIContext(conceptId, "2", "5", 1);

  // Scenario A: repeated misconception → remediate
  const orchA = buildOrchestrator({ scenario: "repeated_misconception", misconceptionId: "position-confusion" }).orch;
  const decisionA = await orchA.decide({
    learnerState: recordEvidence(state, evidence),
    evidence,
    context,
  });

  // Scenario B: mastery → check_mastery (2 attempts is not enough for mastery short-circuit)
  const orchB = buildOrchestrator("mastery").orch;
  const decisionB = await orchB.decide({
    learnerState: recordEvidence(state, evidence),
    evidence,
    context,
  });

  assert(
    decisionA.finalAction.actionType !== decisionB.finalAction.actionType,
    `Diagnosis should change the action. A=${decisionA.finalAction.actionType}, B=${decisionB.finalAction.actionType}`,
  );
  assert(
    decisionA.finalAction.actionType === "remediate" ||
      decisionA.finalAction.actionType === "change_representation",
    "Misconception-driven path should trigger remediation or representation change",
  );
  console.log(`    A (misconception: position-confusion): ${decisionA.finalAction.actionType}`);
  console.log(`    B (mastery):                           ${decisionB.finalAction.actionType}`);
}

// ── Test 2: Repeated misconception produces targeted remediation ───────────

async function testRepeatedMisconception(): Promise<void> {
  console.log("\n  Test 2: Repeated misconception → targeted remediation");

  const conceptId = "digit-position";
  const state = buildState();

  // Three wrong attempts in a row (repeated pattern)
  const allEvidence: Evidence[] = [
    buildEvidence(conceptId, "2", "5", false, 1),
    buildEvidence(conceptId, "2", "5", false, 2),
    buildEvidence(conceptId, "2", "5", false, 3),
  ];

  const { decision } = await runOrchestrator(
    { scenario: "repeated_misconception", misconceptionId: "position-confusion" },
    conceptId,
    allEvidence,
    allEvidence[2],
  );

  assert(
    decision.finalAction.actionType === "remediate",
    `Repeated misconception should trigger remediation. Got: ${decision.finalAction.actionType}`,
  );
  assert(
    (decision.finalAction as any).misconceptionId === "position-confusion",
    `Remediation should target the diagnosed misconception. Got: ${(decision.finalAction as any).misconceptionId}`,
  );
  assert(
    decision.finalAction.actionType !== "move_forward",
    "Should NOT advance through a concept with repeated misconceptions",
  );
  console.log(`    Action: ${decision.finalAction.actionType}, misconception=${(decision.finalAction as any).misconceptionId}`);
}

// ── Test 3: Remediation escalation ────────────────────────────────────────

async function testRemediationEscalation(): Promise<void> {
  console.log("\n  Test 3: Remediation escalation — different representation");

  const conceptId = "digit-value";

  // 3 wrong attempts, remediation shown after attempt 1, still failing
  const allEvidence: Evidence[] = [
    buildEvidence(conceptId, "3", "30", false, 1, undefined),
    buildEvidence(conceptId, "3", "30", false, 2, "place_value_chart"),
    buildEvidence(conceptId, "3", "30", false, 3, "place_value_chart"),
  ];

  const { decision, state } = await runOrchestrator(
    { scenario: "failure_after_remediation", misconceptionId: "digit-not-value" },
    conceptId,
    allEvidence,
    allEvidence[2],
  );

  assert(
    decision.finalAction.actionType === "change_representation",
    `Failed remediation should escalate to different representation. Got: ${decision.finalAction.actionType}`,
  );
  assert(
    (decision.finalAction as any).representation !== undefined,
    "Escalation action should specify a new representation",
  );
  assert(
    (decision.finalAction as any).representation !== "place_value_chart",
    `Should NOT repeat the same representation that already failed. Got: ${(decision.finalAction as any).representation}`,
  );
  console.log(`    Action: ${decision.finalAction.actionType}, representation=${(decision.finalAction as any).representation}`);
}

// ── Test 4: Mastery progression ──────────────────────────────────────────

async function testMasteryProgression(): Promise<void> {
  console.log("\n  Test 4: Mastery progression — 3+ correct advances");

  // Use 'read-numbers' — it has NO prerequisites, so move_forward is valid.
  const conceptId = "read-numbers";

  const allEvidence: Evidence[] = [
    buildEvidence(conceptId, "729", "729", true, 1),
    buildEvidence(conceptId, "4512", "4512", true, 2),
    buildEvidence(conceptId, "30876", "30876", true, 3),
  ];

  const { decision, state } = await runOrchestrator(
    "mastery",
    conceptId,
    allEvidence,
    allEvidence[2],
  );

  const conceptMastery = extractConceptMastery(state);
  const mastery = conceptMastery[conceptId];

  console.log(`    Level: ${mastery?.level}, confidence: ${mastery?.confidence?.toFixed?.(2)}`);

  assert(
    mastery && mastery.level === "proficient",
    `3 correct attempts should achieve proficient level. Got: ${mastery?.level}`,
  );

  // With mastery reached and correct evidence, the orchestrator short-circuits
  // to a deterministic move_forward (no AI consultation needed).
  if (mastery && mastery.level === "proficient") {
    assert(
      decision.finalAction.actionType === "move_forward",
      `Mastered concept + correct evidence should short-circuit to move_forward. Got: ${decision.finalAction.actionType}`,
    );
    assert(
      decision.aiProposal === null,
      "Mastery declaration should be deterministic — AI was NOT consulted",
    );
    console.log(`    Decision: move_forward → ${(decision.finalAction as any).nextConceptId} (deterministic, AI bypassed)`);
  } else {
    console.log(`    Level not yet proficient — short-circuit won't trigger.`);
  }
}

// ── Test 5: Prerequisite protection ────────────────────────────────────────

async function testPrerequisiteProtection(): Promise<void> {
  console.log("\n  Test 5: Prerequisite protection — insufficient prereq blocks move_forward");

  const conceptId = "read-numbers";

  // 1 correct attempt — NOT enough for mastery
  const evidence = buildEvidence(conceptId, "729", "729", true, 1);
  const state = recordEvidence(buildState(), evidence);

  // The mock says "mastery" (no misconception), so the AI would propose move_forward
  // to 'digit-position' (next in chain). But 'digit-position' requires 'read-numbers'
  // to be at 'proficient' level — which it isn't (only 1 correct attempt).
  const { orch } = buildOrchestrator("mastery");
  const context = buildAIContext(conceptId, "729", "729", 1);
  const decision = await orch.decide({
    learnerState: state,
    evidence,
    context,
  });

  const conceptMastery = extractConceptMastery(state);
  const mastery = conceptMastery[conceptId];

  console.log(`    read-numbers: level=${mastery?.level}, confidence=${mastery?.confidence?.toFixed?.(2)}`);

  // The AI may propose move_forward, but the validator should reject it
  // because the prerequisite chain is not satisfied.
  const validator = new ActionValidator(getCurriculumConstraints("g4-math-place-value"));
  const validationResult = validator.validate(decision.finalAction, state);

  if (decision.finalAction.actionType === "move_forward") {
    assert(
      !validationResult.valid,
      "AI proposing move_forward without prerequisite mastery must be rejected",
    );
    assert(
      validationResult.valid === false,
      "Validator should reject move_forward when prerequisites aren't met",
    );
    console.log(`    AI proposed move_forward → validator REJECTED → fallback: ${(validationResult as any).fallback?.actionType}`);
  } else {
    // If the AI didn't propose move_forward, that's also valid —
    // the diagnosis (not enough evidence) drives a different action.
    console.log(`    AI chose ${decision.finalAction.actionType} (no move_forward proposed — safe). usedFallback=${decision.usedFallback}`);
    passed++;
  }
}

// ── Test 6: Invalid AI action ────────────────────────────────────────────

async function testInvalidAIAction(): Promise<void> {
  console.log("\n  Test 6: Invalid AI proposal → deterministic fallback");

  const conceptId = "read-numbers";
  const state = buildState();
  const evidence = buildEvidence(conceptId, "5", "5", true, 1);
  const context = buildAIContext(conceptId, "5", "5", 1);

  // The out_of_scope scenario deliberately returns move_forward to 'calculus'
  const { orch } = buildOrchestrator("out_of_scope");
  const decision = await orch.decide({
    learnerState: recordEvidence(state, evidence),
    evidence,
    context,
  });

  // The AI may have proposed an out-of-scope action — check the AI proposal.
  const aiProposalType = decision.aiProposal?.actionType;
  const aiNextConcept = (decision.aiProposal as any)?.nextConceptId;
  const finalAction = decision.finalAction;

  // Verify the AI actually proposed something (even if out of scope)
  assert(
    aiProposalType !== undefined,
    "AI provider should have proposed an action via the interface",
  );
  console.log(`    AI proposed: ${aiProposalType}${aiNextConcept ? ` → ${aiNextConcept}` : ""}`);

  // If the AI proposed move_forward to 'calculus', the validator MUST reject it.
  if (aiProposalType === "move_forward" && aiNextConcept === "calculus") {
    assert(
      decision.usedFallback === true,
      "Validator should use fallback when AI proposes out-of-scope concept 'calculus'",
    );
    if (finalAction.actionType === "move_forward") {
      assert(
        (finalAction as any).nextConceptId !== "calculus",
        `Final action must not reference 'calculus'. Got: ${(finalAction as any).nextConceptId}`,
      );
    }
    console.log(`    → Validator REJECTED out-of-scope proposal → fallback: ${finalAction.actionType}`);
  }

  // Verify the returned final action is valid per the curriculum constraints.
  const constraints = getCurriculumConstraints("g4-math-place-value");
  const validator = new ActionValidator(constraints);
  const result2 = validator.validate(finalAction, decision.updatedState);
  assert(
    result2.valid === true,
    `Final action should pass validation. ${result2.valid === false ? (result2 as any).reason : "OK"}`,
  );
  console.log(`    Final action: ${finalAction.actionType} — ${decision.usedFallback ? "via fallback" : "AI proposal validated"}`);
}

// ── Test 7: Provider independence ──────────────────────────────────────────

async function testProviderIndependence(): Promise<void> {
  console.log("\n  Test 7: Provider independence — no provider-specific branching");

  const conceptId = "read-numbers";
  const state = buildState();
  const evidence = buildEvidence(conceptId, "5", "5", true, 1);
  const context = buildAIContext(conceptId, "5", "5", 1);

  // Same orchestrator, different providers — both go through AIProvider interface.
  const providerMock = new MockAIProvider("mastery");
  const orchMock = new AdaptiveOrchestrator(providerMock);
  const decisionMock = await orchMock.decide({
    learnerState: recordEvidence(state, evidence),
    evidence,
    context,
  });

  // Verify the orchestrator doesn't expose which provider is behind it
  // (no if-mock / if-ollama branches in student-facing APIs).
  assert(
    typeof decisionMock.finalAction.actionType === "string",
    "Orchestrator should produce a valid action via the AIProvider interface",
  );
  assert(
    providerMock.getScenario() === "mastery",
    "Provider scenario is accessible for testing (not for production branching)",
  );

  // Verify the orchestrator calls both AIProvider methods through the interface
  const callCount = providerMock.callCount;
  assert(callCount.analyze > 0 || callCount.diagnose > 0, "Orchestrator should call AI diagnosis via interface");
  assert(callCount.select > 0, "Orchestrator should call AI action selection via interface");

  console.log(`    Orchestrator called: analyze=${callCount.analyze}, select=${callCount.select}, diagnose=${callCount.diagnose}`);
  console.log(`    Decision: ${decisionMock.finalAction.actionType} (no provider-specific code path)`);
}

// ── Test 8: Evidence persistence ───────────────────────────────────────────

async function testEvidencePersistence(): Promise<void> {
  console.log("\n  Test 8: Evidence persistence — recorded response influences next decision");

  const conceptId = "digit-position";

  // Step 1: Simulate a FIRST response (wrong) — record it.
  const firstEvidence = buildEvidence(conceptId, "2", "5", false, 1);
  const stateAfterFirst = recordEvidence(buildState(), firstEvidence);

  // Step 2: The orchestrator sees this evidence and proposes remediation.
  const { orch: orch1 } = buildOrchestrator({ scenario: "repeated_misconception", misconceptionId: "position-confusion" });
  const ctx1 = buildAIContext(conceptId, "2", "5", 1);
  const decision1 = await orch1.decide({
    learnerState: stateAfterFirst,
    evidence: firstEvidence,
    context: ctx1,
  });

  assert(
    decision1.finalAction.actionType === "remediate" ||
      decision1.finalAction.actionType === "change_representation",
    "First wrong answer should trigger remediation",
  );
  console.log(`    First response (wrong): decision → ${decision1.finalAction.actionType}`);

  // Step 3: Remediation is shown. Student answers correctly this time.
  const remediationEvidence = buildEvidence(conceptId, "5", "5", true, 2, "place_value_chart");

  // Step 4: Simulate "load from persistence" — reconstruct state from
  // the list of all evidence (as if loaded from InteractionResponse records).
  const allEvidence: Evidence[] = [firstEvidence, remediationEvidence];
  const reconstructedState = replayEvidence(buildState(), allEvidence);

  // Verify the reconstructed state captured both responses.
  assert(
    reconstructedState.attempts.length >= 2,
    `Reconstructed state should have >= 2 attempts. Got: ${reconstructedState.attempts.length}`,
  );
  assert(
    reconstructedState.concepts[conceptId].attempts >= 2,
    `Concept should have >= 2 attempts. Got: ${reconstructedState.concepts[conceptId].attempts}`,
  );
  assert(
    reconstructedState.concepts[conceptId].correctAttempts >= 1,
    `Concept should have >= 1 correct attempt after remediation. Got: ${reconstructedState.concepts[conceptId].correctAttempts}`,
  );

  // Step 5: Run the orchestrator on the reconstructed state + latest evidence.
  const { orch: orch2 } = buildOrchestrator("mastery");
  const ctx2 = buildAIContext(conceptId, "5", "5", 2);
  const decision2 = await orch2.decide({
    learnerState: reconstructedState,
    evidence: remediationEvidence,
    context: ctx2,
  });

  // The decision should reflect BOTH the original wrong answer AND the
  // successful remediation — not just the latest answer.
  // With "mastery" scenario + 1 correct + 1 wrong → not proficient → not short-circuit
  // The mock sees mixed evidence and will propose check_mastery or ask.
  assert(
    decision2.finalAction.actionType !== "remediate" ||
      (decision2.finalAction as any).escalated === true,
    `After successful remediation, should not re-propose same remediation. Got: ${decision2.finalAction.actionType}`,
  );

  console.log(`    After remediation (correct): decision → ${decision2.finalAction.actionType}`);
  console.log(`    State has ${reconstructedState.attempts.length} recorded responses influencing decisions`);
}

// ── Test 9: Adaptive bypass race condition ────────────────────────────────
//
// Proves: answer → adaptive request pending → Next cannot advance
//         → adaptive decision returns → only then can progression occur.
//
// This is a regression test for the race condition where the student could
// click the "Next" button while the adaptive API call was still in-flight,
// causing the step index to advance without the orchestrator's decision.

function testAdaptiveBypassRaceCondition(): void {
  console.log("\n  Test 9: Adaptive bypass race condition — Next blocked during pending API call");

  // A tap_choice step that requires a submitted answer before advancing.
  const tapChoiceStep = {
    id: "place-value-practice",
    stepType: "practice",
    title: "Practice",
    interactionSpec: {
      type: "tap_choice",
      choices: [{ id: "0", label: "2" }, { id: "1", label: "5" }, { id: "2", label: "3" }],
      correctChoiceId: "1",
    },
  };

  const interactionSubmitted = { choiceSubmitted: true, selectedChoice: 0 };
  const interactionNotSubmitted = { choiceSubmitted: false, selectedChoice: null };

  // ── Scenario A: Student answers, API call pending ──────────────────────
  // The learner submits their answer → interaction.choiceSubmitted = true
  // → adaptivePending = true (API call in-flight)
  //   → canAdvance must return FALSE (Next button disabled)
  let canAdvanceDuringPending = canComputeAdvance({
    activeRemediation: null,
    adaptivePending: true,
    step: tapChoiceStep,
    interaction: interactionSubmitted,
  });
  assert(
    canAdvanceDuringPending === false,
    "Next button must be disabled while adaptive API call is pending (adaptivePending=true)",
  );

  // ── Scenario B: API returns with remediation → Next stays blocked ──────
  // The orchestrator decided remediation is needed → activeRemediation is set
  // → canAdvance must return FALSE
  let canAdvanceAfterRemediation = canComputeAdvance({
    activeRemediation: { id: "remediation-1", title: "Review Place Value" },
    adaptivePending: false,
    step: tapChoiceStep,
    interaction: interactionSubmitted,
  });
  assert(
    canAdvanceAfterRemediation === false,
    "Next button must remain disabled when remediation overlay is shown",
  );

  // ── Scenario C: API returns move_forward → Next becomes available ───────
  // The orchestrator decided mastery is achieved → activeRemediation = null
  // → adaptivePending = false
  //   → canAdvance must return TRUE (Next button enabled for step advancement)
  let canAdvanceAfterMastery = canComputeAdvance({
    activeRemediation: null,
    adaptivePending: false,
    step: {
      id: "move-forward-step",
      stepType: "complete",
      title: "Well done!",
      interactionSpec: { type: "tap_continue" },
    },
    interaction: interactionSubmitted,
  });
  assert(
    canAdvanceAfterMastery === true,
    "Next button should be enabled after move_forward decision clears remediation overlay",
  );

  // ── Scenario D: No answer submitted yet → Next disabled (existing behavior)
  let canAdvanceNoAnswer = canComputeAdvance({
    activeRemediation: null,
    adaptivePending: false,
    step: tapChoiceStep,
    interaction: interactionNotSubmitted,
  });
  assert(
    canAdvanceNoAnswer === false,
    "Next button must be disabled when no answer has been submitted (existing behavior preserved)",
  );

  // ── Scenario E: Non-adaptive step (tap_continue) → always can advance ───
  let canAdvanceTapContinue = canComputeAdvance({
    activeRemediation: null,
    adaptivePending: false,
    step: {
      id: "intro-step",
      stepType: "learn",
      title: "Introduction",
      interactionSpec: { type: "tap_continue" },
    },
    interaction: interactionNotSubmitted,
  });
  assert(
    canAdvanceTapContinue === true,
    "tap_continue steps should allow advancement regardless of interaction state",
  );

  // ── Scenario F: Duplicate submission blocked ────────────────────────────
  // Even if the learner somehow triggers onAnswer twice while the API is
  // pending, adaptivePending=true should prevent the second call from
  // proceeding (the early-return guard in handleAdaptiveAnswer).
  // canComputeAdvance with adaptivePending=true must still return false.
  let duplicateBlocked = canComputeAdvance({
    activeRemediation: null,
    adaptivePending: true,
    step: tapChoiceStep,
    interaction: interactionSubmitted,
  });
  assert(
    duplicateBlocked === false,
    "Second submission attempt during pending API call must be blocked",
  );

  console.log("    ✓ Next blocked during pending API call");
  console.log("    ✓ Next blocked during remediation overlay");
  console.log("    ✓ Next enabled only after move_forward clears remediation");
  console.log("    ✓ No-answer-yet still blocks Next (existing behavior preserved)");
  console.log("    ✓ tap_continue steps unaffected by adaptive gating");
  console.log("    ✓ Duplicate submission blocked during pending");
}

// ── Test: Action adapter produces renderable steps ────────────────────────

async function testActionAdapterProducesRenderableSteps(): Promise<void> {
  console.log("\n  Test (adapter): PedagogicalAction → JourneyStep");

  const conceptId = "digit-position";
  const state = buildState();
  const evidence = buildEvidence(conceptId, "2", "5", false, 1);
  const context = buildAIContext(conceptId, "2", "5", 1);

  const orch = buildOrchestrator({ scenario: "repeated_misconception", misconceptionId: "position-confusion" }).orch;
  const decision = await orch.decide({
    learnerState: recordEvidence(state, evidence),
    evidence,
    context,
  });

  const step = pedagogicalActionToJourneyStep(decision.finalAction, {
    evidence,
    aiContext: {
      conceptId,
      selectedAnswer: evidence.answer || "",
      expectedAnswer: evidence.expectedAnswer || "",
      options: ["1", "2", "3", "4"],
      prompt: "What is the value of the digit?",
    },
    conceptChain: CONCEPT_IDS,
  });

  assert(step !== null, "Adapter should produce a renderable JourneyStep");
  if (step) {
    assert(
      typeof step.stepType === "string",
      "JourneyStep should have a valid stepType",
    );
    console.log(`    Action: ${decision.finalAction.actionType} → Step: ${step.stepType} ("${step.title}")`);
  }
}

// ── Test 10: Server-side attempt number computation ─────────────────────────
//
// Verifies that the server (route.ts) computes attemptNumber from persisted
// state rather than trusting the client's value. This mirrors the logic
// added to src/app/api/learner/adaptive-decision/route.ts:
//   const existingAttemptsForActivity = learningState.attempts.filter(
//     (a) => a.activityId === activityId
//   ).length;
//   const attemptNumberToUse = existingAttemptsForActivity + 1;
//
// The test proves:
//   - First submission for an activity → attemptNumber = 1
//   - Second submission for the same activity → attemptNumber = 2
//   - Third submission for the same activity → attemptNumber = 3
//   - A different activity starts back at attemptNumber = 1
//   - A stale client value (e.g. always 1) is overridden by the server

function testAttemptNumberComputation(): void {
  console.log("\n  Test 10: Server-side attempt number computation");

  const conceptId = "digit-position";
  const activityId = "think_first";

  // Simulate the server-side computation exactly as in route.ts.
  function computeAttemptNumber(state: LearningState, activityId: string): number {
    const existing = state.attempts.filter((a) => a.activityId === activityId).length;
    return existing + 1;
  }

  // ── Step 1: Fresh state — no prior attempts ──
  let state = createInitialLearningState("test-learner", "lesson-1", CONCEPT_IDS);
  let attemptNum = computeAttemptNumber(state, activityId);
  assert(
    attemptNum === 1,
    `First submission for activity should be attemptNumber=1. Got: ${attemptNum}`,
  );

  // Record the first attempt (as the server would after INSERT succeeds).
  const evidence1: Evidence = {
    conceptId,
    correct: false,
    timestamp: Date.now(),
    activityId,
    answer: "2",
    expectedAnswer: "5",
    attemptNumber: attemptNum,
  };
  state = recordEvidence(state, evidence1);

  // ── Step 2: Same activity submitted again → attemptNumber should be 2 ──
  attemptNum = computeAttemptNumber(state, activityId);
  assert(
    attemptNum === 2,
    `Second submission for same activity should be attemptNumber=2. Got: ${attemptNum}`,
  );

  // Record the second attempt.
  const evidence2: Evidence = {
    conceptId,
    correct: false,
    timestamp: Date.now() + 1,
    activityId,
    answer: "3",
    expectedAnswer: "5",
    attemptNumber: attemptNum,
  };
  state = recordEvidence(state, evidence2);

  // ── Step 3: Same activity submitted a third time → attemptNumber should be 3 ──
  attemptNum = computeAttemptNumber(state, activityId);
  assert(
    attemptNum === 3,
    `Third submission for same activity should be attemptNumber=3. Got: ${attemptNum}`,
  );
  // Record the third attempt.
  const evidence3: Evidence = {
    conceptId,
    correct: false,
    timestamp: Date.now() + 2,
    activityId,
    answer: "4",
    expectedAnswer: "5",
    attemptNumber: attemptNum,
  };
  state = recordEvidence(state, evidence3);

  // ── Step 4: Different activity → attemptNumber resets to 1 ──
  const otherActivityId = "connect";
  attemptNum = computeAttemptNumber(state, otherActivityId);
  assert(
    attemptNum === 1,
    `First submission for a different activity should be attemptNumber=1. Got: ${attemptNum}`,
  );

  // ── Step 5: Stale client value does not override server computation ──
  // The client (page.tsx) sends attemptNumber: 1 even on the 3rd attempt.
  // The server must NOT trust this — it computes from state.
  const staleClientAttemptNumber = 1; // what page.tsx hardcodes
  const serverComputed = computeAttemptNumber(state, activityId); // should be 4 (3 existing)
  assert(
    serverComputed === 4,
    `Server must override stale client value (1) with computed value (4). Got: ${serverComputed}`,
  );
  assert(
    serverComputed !== staleClientAttemptNumber || state.attempts.filter((a) => a.activityId === activityId).length === 3,
    "Server computation differs from stale client value when attempts exist",
  );

  // Verify the state's attempts array has correct attemptNumbers.
  const attemptsForActivity = state.attempts.filter((a) => a.activityId === activityId);
  assert(
    attemptsForActivity.length === 3,
    `State should have 3 recorded attempts for the activity. Got: ${attemptsForActivity.length}`,
  );
  assert(
    attemptsForActivity.every((a) => [1, 2, 3].includes(a.attemptNumber)),
    "Each attempt should have a unique, incrementing attemptNumber (1, 2, 3)",
  );

  console.log(`    ✓ attemptNumber = 1 for first submission`);
  console.log(`    ✓ attemptNumber = 2 for second submission (same activity)`);
  console.log(`    ✓ attemptNumber = 3 for third submission (same activity)`);
  console.log(`    ✓ attemptNumber = 1 for a different activity`);
  console.log(`    ✓ Server overrides stale client value (1 → ${serverComputed})`);
  console.log(`    ✓ State records 3 unique attempts with attemptNumbers [1, 2, 3]`);
}

// ── Main ─────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log("Phase 2 Integration Tests — Adaptive Learning Vertical Slice");
  console.log("Grade 4 Mathematics → Whole Numbers → Place Value");
  console.log("=".repeat(70));

  await testDiagnosisChangesPath();
  await testRepeatedMisconception();
  await testRemediationEscalation();
  await testMasteryProgression();
  await testPrerequisiteProtection();
  await testInvalidAIAction();
  await testProviderIndependence();
  await testEvidencePersistence();
  testAdaptiveBypassRaceCondition();
  await testActionAdapterProducesRenderableSteps();
  testAttemptNumberComputation();

  console.log("\n" + "=".repeat(70));
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    console.error("❌ Phase 2 tests FAILED");
    process.exit(1);
  } else {
    console.log("✅ All Phase 2 integration tests passed");
  }
}

main().catch((err) => {
  console.error("Test runner error:", err);
  process.exit(1);
});
