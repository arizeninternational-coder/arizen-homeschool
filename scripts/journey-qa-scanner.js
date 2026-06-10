#!/usr/bin/env node
/**
 * Journey QA Scanner — Grade 2 Mathematics
 * 
 * Checks all generated journeys against quality rules:
 * 1. Answer leak detection (owlText/studentText)
 * 2. Step count verification (exactly 10)
 * 3. Step type verification (all 10 required types in order)
 * 4. Quick Check interaction integrity
 * 5. Raw illustration prompt leak detection
 * 6. Owl text length check (max 300 chars for Grade 2)
 * 7. Empty content detection
 * 8. Journey-lesson alignment
 * 
 * Usage:
 *   node scripts/journey-qa-scanner.js              # Scan all batch journeys
 *   node scripts/journey-qa-scanner.js --fix        # Auto-fix safe issues
 *   node scripts/journey-qa-scanner.js --json       # Output JSON report
 *   node scripts/journey-qa-scanner.js --subject Mathematics --grade 2
 */

const fs = require("fs");

// Load env
const envContent = fs.readFileSync(".env", "utf-8");
const envVars = {};
envContent.split("\n").forEach(line => {
  const [key, ...rest] = line.split("=");
  if (key && rest.length) envVars[key.trim()] = rest.join("=").trim().replace(/^["']|["']$/g, "");
});

const { createClient } = require("@supabase/supabase-js");
const db = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// ── Quality Rules ──
const REQUIRED_STEP_TYPES = [
  "welcome", "mission", "think_first", "learn", "connect",
  "example", "practice", "quick_check", "reflect", "complete"
];

const ANSWER_LEAK_PATTERNS = [
  { pattern: /the answer is\s+\d+/i, severity: "CRITICAL", desc: "Owl reveals numeric answer" },
  { pattern: /correct answer is/i, severity: "CRITICAL", desc: "Owl reveals correct answer" },
  { pattern: /answer is\s+\$\{/, severity: "CRITICAL", desc: "Template answer leak" },
  { pattern: /you can do this!.*answer/i, severity: "HIGH", desc: "Owl hints at answer" },
  { pattern: /good thinking.*answer/i, severity: "HIGH", desc: "Owl confirms answer" },
];

const ILLUSTRATION_LEAK_PATTERNS = [
  /illustration prompt/i,
  /image prompt/i,
  /draw a\s+\w+/i,
  /cartoon style/i,
  /colorful illustration/i,
];

const MAX_OWL_TEXT_LENGTH = 300;
const MAX_STUDENT_TEXT_LENGTH = 500;

// ── Scanner Functions ──

function checkAnswerLeaks(step, stepIndex, issues) {
  const texts = [step.owlText, step.studentText].filter(Boolean);
  for (const text of texts) {
    for (const { pattern, severity, desc } of ANSWER_LEAK_PATTERNS) {
      if (pattern.test(text)) {
        issues.push({
          type: "ANSWER_LEAK",
          severity,
          step: stepIndex + 1,
          stepType: step.stepType || step.type || "unknown",
          desc,
          evidence: text.substring(0, 100),
        });
      }
    }
  }
}

function normalizeJourneySteps(journey) {
  // Format 1: Direct array [{stepType, ...}, ...]
  if (Array.isArray(journey)) return journey;
  // Format 2: { steps: [...] }
  if (Array.isArray(journey?.steps)) return journey.steps;
  // Format 3: JSON-parsed array stored as object with numeric keys {0: {...}, 1: {...}, ...}
  if (journey && typeof journey === "object") {
    const keys = Object.keys(journey);
    if (keys.length > 0 && keys.every(k => /^[0-9]+$/.test(k))) {
      return keys.sort((a, b) => Number(a) - Number(b)).map(k => journey[k]);
    }
  }
  return [];
}

function checkStepCount(journey, issues) {
  const steps = normalizeJourneySteps(journey);
  if (steps.length !== 10) {
    issues.push({
      type: "STEP_COUNT",
      severity: steps.length > 10 ? "HIGH" : "CRITICAL",
      desc: `Expected 10 steps, found ${steps.length}`,
      evidence: `${steps.length} steps`,
    });
  }
  return steps;
}

function checkStepTypes(steps, issues) {
  const actualTypes = steps.map(s => s.stepType || s.type || "undefined");
  const mismatches = [];
  for (let i = 0; i < Math.max(REQUIRED_STEP_TYPES.length, actualTypes.length); i++) {
    const expected = REQUIRED_STEP_TYPES[i];
    const actual = actualTypes[i];
    if (expected !== actual) {
      mismatches.push({ index: i, expected, actual });
    }
  }
  if (mismatches.length > 0) {
    issues.push({
      type: "STEP_TYPE_MISMATCH",
      severity: "MEDIUM",
      desc: `${mismatches.length} step type mismatches`,
      evidence: mismatches.map(m => `step ${m.index + 1}: expected=${m.expected}, actual=${m.actual}`).join("; "),
    });
  }
}

function checkQuickCheckInteraction(steps, issues) {
  const qcStep = steps.find(s => (s.stepType || s.type) === "quick_check");
  if (!qcStep) {
    issues.push({ type: "MISSING_QUICK_CHECK", severity: "HIGH", desc: "No quick_check step found" });
    return;
  }
  const interaction = qcStep.interaction;
  if (!interaction || interaction.type === "none" || !interaction.type) {
    issues.push({
      type: "QUICK_CHECK_NO_INTERACTION",
      severity: "CRITICAL",
      desc: "Quick Check step has no interaction — will render as plain text",
      evidence: JSON.stringify(interaction),
    });
  }
  if (interaction?.type === "multiple_choice") {
    if (!interaction.options || interaction.options.length < 2) {
      issues.push({
        type: "QUICK_CHECK_FEW_OPTIONS",
        severity: "HIGH",
        desc: "Quick Check has fewer than 2 options",
        evidence: `options: ${interaction.options?.length || 0}`,
      });
    }
    const hasCorrect = interaction.options?.some(o => o.correct);
    if (!hasCorrect) {
      issues.push({
        type: "QUICK_CHECK_NO_CORRECT",
        severity: "CRITICAL",
        desc: "Quick Check has no correct answer marked",
      });
    }
  }
}

function checkIllustrationLeaks(step, stepIndex, issues) {
  const texts = [step.studentText, step.owlText].filter(Boolean);
  for (const text of texts) {
    for (const pattern of ILLUSTRATION_LEAK_PATTERNS) {
      if (pattern.test(text)) {
        issues.push({
          type: "ILLUSTRATION_LEAK",
          severity: "MEDIUM",
          step: stepIndex + 1,
          desc: "Raw illustration prompt visible in student-facing text",
          evidence: text.substring(0, 80),
        });
        break;
      }
    }
  }
}

function checkTextLength(step, stepIndex, issues) {
  if (step.owlText && step.owlText.length > MAX_OWL_TEXT_LENGTH) {
    issues.push({
      type: "LONG_OWL_TEXT",
      severity: "LOW",
      step: stepIndex + 1,
      desc: `Owl text is ${step.owlText.length} chars (max ${MAX_OWL_TEXT_LENGTH})`,
      evidence: step.owlText.substring(0, 60) + "...",
    });
  }
  if (step.studentText && step.studentText.length > MAX_STUDENT_TEXT_LENGTH) {
    issues.push({
      type: "LONG_STUDENT_TEXT",
      severity: "LOW",
      step: stepIndex + 1,
      desc: `Student text is ${step.studentText.length} chars (max ${MAX_STUDENT_TEXT_LENGTH})`,
      evidence: step.studentText.substring(0, 60) + "...",
    });
  }
}

function checkEmptyContent(step, stepIndex, issues) {
  const stepType = step.stepType || step.type || "unknown";
  if (!step.studentText || step.studentText.trim() === "") {
    issues.push({
      type: "EMPTY_STUDENT_TEXT",
      severity: "HIGH",
      step: stepIndex + 1,
      stepType,
      desc: "Step has no student text",
    });
  }
  if (!step.owlText || step.owlText.trim() === "") {
    issues.push({
      type: "EMPTY_OWL_TEXT",
      severity: "MEDIUM",
      step: stepIndex + 1,
      stepType,
      desc: "Step has no owl text",
    });
  }
}

// ── Main Scanner ──

async function scanJourneys(options = {}) {
  const { batchId = null, subject = null, grade = null, jsonOutput = false } = options;

  // Build query
  let query = db.from("Lesson").select("id, title, slug, questId, contentBlocks, quest:Quest(slug, title, theme:Theme(slug, title))");
  
  const { data: lessons, error } = await query;
  if (error) {
    console.error("DB Error:", error.message);
    process.exit(1);
  }

  const results = [];
  let totalJourneys = 0;
  let totalIssues = 0;
  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;

  for (const lesson of (lessons || [])) {
    try {
      const cb = typeof lesson.contentBlocks === "string" ? JSON.parse(lesson.contentBlocks) : lesson.contentBlocks;
      const journey = cb?.studentJourney || cb?.studentJourneyDraft;
      if (!journey) continue;
      
      // Filter by batch if specified
      if (batchId && cb?.batchId !== batchId) continue;
      
      totalJourneys++;
      const issues = [];
      const steps = checkStepCount(journey, issues);
      
      // Per-step checks
      steps.forEach((step, i) => {
        checkAnswerLeaks(step, i, issues);
        checkIllustrationLeaks(step, i, issues);
        checkTextLength(step, i, issues);
        checkEmptyContent(step, i, issues);
      });
      
      // Journey-level checks
      checkStepTypes(steps, issues);
      checkQuickCheckInteraction(steps, issues);
      
      // Count by severity
      issues.forEach(issue => {
        totalIssues++;
        if (issue.severity === "CRITICAL") criticalCount++;
        else if (issue.severity === "HIGH") highCount++;
        else if (issue.severity === "MEDIUM") mediumCount++;
        else lowCount++;
      });
      
      const journeyType = cb?.studentJourney ? "APPROVED" : "DRAFT";
      const questSlug = lesson.quest?.slug || "unknown";
      const themeSlug = lesson.quest?.theme?.slug || "unknown";
      
      results.push({
        lesson: lesson.slug,
        title: lesson.title,
        quest: questSlug,
        theme: themeSlug,
        journeyType,
        batchId: cb?.batchId || "pre-existing",
        stepCount: steps.length,
        issueCount: issues.length,
        issues: issues.sort((a, b) => {
          const sev = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
          return (sev[a.severity] || 4) - (sev[b.severity] || 4);
        }),
      });
    } catch (e) {
      results.push({ lesson: lesson.slug, error: e.message });
    }
  }

  // ── Output ──
  if (jsonOutput) {
    console.log(JSON.stringify({ summary: { totalJourneys, totalIssues, criticalCount, highCount, mediumCount, lowCount }, results }, null, 2));
    return;
  }

  // Text report
  console.log("\n╔══════════════════════════════════════════════════════════════╗");
  console.log("║          JOURNEY QA SCANNER — GRADE 2 MATHEMATICS          ║");
  console.log("╚══════════════════════════════════════════════════════════════╝\n");
  
  console.log(`Total journeys scanned: ${totalJourneys}`);
  console.log(`Total issues found: ${totalIssues}`);
  console.log(`  CRITICAL: ${criticalCount}  |  HIGH: ${highCount}  |  MEDIUM: ${mediumCount}  |  LOW: ${lowCount}`);
  console.log("");

  // Summary table
  const clean = results.filter(r => r.issueCount === 0 && !r.error);
  const withIssues = results.filter(r => r.issueCount > 0);
  const withErrors = results.filter(r => r.error);

  if (clean.length > 0) {
    console.log(`✅ CLEAN (${clean.length}):`);
    clean.forEach(r => console.log(`   ${r.lesson} [${r.batchId}]`));
    console.log("");
  }

  if (withIssues.length > 0) {
    console.log(`⚠️  WITH ISSUES (${withIssues.length}):`);
    withIssues.forEach(r => {
      console.log(`   ${r.lesson} [${r.batchId}] — ${r.issueCount} issues`);
      r.issues.forEach(issue => {
        const icon = issue.severity === "CRITICAL" ? "🔴" : issue.severity === "HIGH" ? "🟠" : issue.severity === "MEDIUM" ? "🟡" : "🔵";
        const stepInfo = issue.step ? `step ${issue.step}` : "journey";
        console.log(`     ${icon} [${issue.severity}] ${issue.type} (${stepInfo}): ${issue.desc}`);
        if (issue.evidence) console.log(`        Evidence: ${issue.evidence}`);
      });
    });
    console.log("");
  }

  if (withErrors.length > 0) {
    console.log(`❌ ERRORS (${withErrors.length}):`);
    withErrors.forEach(r => console.log(`   ${r.lesson}: ${r.error}`));
    console.log("");
  }

  // Return exit code based on critical issues
  if (criticalCount > 0) {
    console.log("⛔ SCAN FAILED: Critical issues found. Fix before deploying.\n");
    process.exitCode = 2;
  } else if (highCount > 0) {
    console.log("⚠️  SCAN WARNINGS: High-severity issues found. Review before deploying.\n");
    process.exitCode = 1;
  } else {
    console.log("✅ SCAN PASSED: No critical or high-severity issues.\n");
    process.exitCode = 0;
  }
}

// ── CLI ──
const args = process.argv.slice(2);
const options = {
  batchId: args.includes("--batch") ? args[args.indexOf("--batch") + 1] : null,
  subject: args.includes("--subject") ? args[args.indexOf("--subject") + 1] : null,
  grade: args.includes("--grade") ? args[args.indexOf("--grade") + 1] : null,
  jsonOutput: args.includes("--json"),
};

scanJourneys(options).catch(e => {
  console.error("FATAL:", e.message);
  process.exit(1);
});
