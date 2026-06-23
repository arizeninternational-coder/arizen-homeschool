// ─────────────────────────────────────────────────────────────────────────────
// Curriculum Journey Validation — Pipeline Safety Layer
// ─────────────────────────────────────────────────────────────────────────────
// This module provides comprehensive validation for lesson journeys.
// It should be used:
//   1. Before saving generated drafts to the database
//   2. Before approving draft → live
//   3. Before rendering student-facing lessons
//   4. In validation report scripts
// ─────────────────────────────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  errors: ValidationWarning[];
  warnings: ValidationWarning[];
  score: number; // 0-100
}

export interface ValidationWarning {
  code: string;
  message: string;
  step?: number;
  stepType?: string;
  severity: "error" | "warning";
}

// ── Placeholder Detection ────────────────────────────────────────────────────

const PLACEHOLDER_PATTERNS = [
  /\[content based on source pack\]/i,
  /\[detailed teaching content/i,
  /\[example to be added/i,
  /\[example for/i,
  /\[practice question/i,
  /\[detailed content/i,
  /\[content to be added/i,
  /\[topic\]/i,
  /\[title\]/i,
  /\[concept\]/i,
  /\[learning outcome\]/i,
  /\[strand\]/i,
  /\[sub-strand\]/i,
  /\[grade\]/i,
  /\[subject\]/i,
  /\[step \d+\]/i,
  /\[step type\]/i,
  /\[interaction type\]/i,
  /\[correct answer\]/i,
  /\[explanation\]/i,
  /\[hint\]/i,
  /\[prompt\]/i,
  /\[option \d+\]/i,
  /\[fill in the blank\]/i,
  /\[insert/i,
  /\[add .+ here\]/i,
  /\[write .+ here\]/i,
  /\[describe/i,
  /\[explain/i,
  /\[list/i,
  /\[provide/i,
  /\[include/i,
  /\[create/i,
  /\[design/i,
  /\[develop/i,
  /todo[: ]/i,
  /placeholder/i,
  /lorem ipsum/i,
  /xxx+/i,
  /yyy+/i,
  /zzz+/i,
  /tbd/i,
  /tba/i,
  /coming soon/i,
  /under construction/i,
  /work in progress/i,
  /wip/i,
];

export function detectPlaceholders(text: string): string[] {
  const found: string[] = [];
  for (const pattern of PLACEHOLDER_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      found.push(match[0]);
    }
  }
  return found;
}

// ── Minimum Content Requirements ─────────────────────────────────────────────

interface StepContentRequirements {
  minStudentTextLength: number;
  minOwlTextLength: number;
  requiresInteraction: boolean;
  requiresOptions: boolean;
  requiresCorrectAnswer: number;
  requiresExplanation: boolean;
  minPracticeTasks: number;
  minReflectionPrompts: number;
}

const STEP_REQUIREMENTS: Record<string, StepContentRequirements> = {
  welcome: {
    minStudentTextLength: 0,
    minOwlTextLength: 20,
    requiresInteraction: false,
    requiresOptions: false,
    requiresCorrectAnswer: 0,
    requiresExplanation: false,
    minPracticeTasks: 0,
    minReflectionPrompts: 0,
  },
  mission: {
    minStudentTextLength: 20,
    minOwlTextLength: 10,
    requiresInteraction: false,
    requiresOptions: false,
    requiresCorrectAnswer: 0,
    requiresExplanation: false,
    minPracticeTasks: 0,
    minReflectionPrompts: 0,
  },
  think_first: {
    minStudentTextLength: 20,
    minOwlTextLength: 10,
    requiresInteraction: true,
    requiresOptions: false,
    requiresCorrectAnswer: 0,
    requiresExplanation: false,
    minPracticeTasks: 0,
    minReflectionPrompts: 0,
  },
  learn: {
    minStudentTextLength: 100,
    minOwlTextLength: 0,
    requiresInteraction: false,
    requiresOptions: false,
    requiresCorrectAnswer: 0,
    requiresExplanation: false,
    minPracticeTasks: 0,
    minReflectionPrompts: 0,
  },
  connect: {
    minStudentTextLength: 20,
    minOwlTextLength: 10,
    requiresInteraction: false,
    requiresOptions: false,
    requiresCorrectAnswer: 0,
    requiresExplanation: false,
    minPracticeTasks: 0,
    minReflectionPrompts: 0,
  },
  example: {
    minStudentTextLength: 80,
    minOwlTextLength: 0,
    requiresInteraction: false,
    requiresOptions: false,
    requiresCorrectAnswer: 0,
    requiresExplanation: false,
    minPracticeTasks: 0,
    minReflectionPrompts: 0,
  },
  practice: {
    minStudentTextLength: 40,
    minOwlTextLength: 10,
    requiresInteraction: false,
    requiresOptions: false,
    requiresCorrectAnswer: 0,
    requiresExplanation: false,
    minPracticeTasks: 2,
    minReflectionPrompts: 0,
  },
  quick_check: {
    minStudentTextLength: 0,
    minOwlTextLength: 0,
    requiresInteraction: true,
    requiresOptions: true,
    requiresCorrectAnswer: 1,
    requiresExplanation: true,
    minPracticeTasks: 0,
    minReflectionPrompts: 0,
  },
  reflect: {
    minStudentTextLength: 0,
    minOwlTextLength: 10,
    requiresInteraction: true,
    requiresOptions: false,
    requiresCorrectAnswer: 0,
    requiresExplanation: false,
    minPracticeTasks: 0,
    minReflectionPrompts: 1,
  },
  complete: {
    minStudentTextLength: 10,
    minOwlTextLength: 10,
    requiresInteraction: false,
    requiresOptions: false,
    requiresCorrectAnswer: 0,
    requiresExplanation: false,
    minPracticeTasks: 0,
    minReflectionPrompts: 0,
  },
};

// ── Main Validation Function ─────────────────────────────────────────────────

const STEP_ORDER = ["welcome", "mission", "think_first", "learn", "connect", "example", "practice", "quick_check", "reflect", "complete"];

export function validateJourney(journey: any[]): ValidationResult {
  const errors: ValidationWarning[] = [];
  const warnings: ValidationWarning[] = [];

  // ── 1. Structure Validation ──────────────────────────────────────────────

  if (!Array.isArray(journey)) {
    return {
      valid: false,
      errors: [{ code: "NOT_ARRAY", message: "Journey is not an array", severity: "error" }],
      warnings: [],
      score: 0,
    };
  }

  if (journey.length !== 10) {
    errors.push({
      code: "WRONG_STEP_COUNT",
      message: `Expected 10 steps, got ${journey.length}`,
      severity: "error",
    });
  }

  // Check step types
  const actualTypes = journey.map((s) => s?.stepType);
  for (let i = 0; i < Math.max(actualTypes.length, STEP_ORDER.length); i++) {
    const expected = STEP_ORDER[i];
    const actual = actualTypes[i];
    if (expected && !actual) {
      errors.push({
        code: "MISSING_STEP",
        message: `Step ${i + 1} is missing (expected ${expected})`,
        step: i + 1,
        severity: "error",
      });
    } else if (expected && actual && actual !== expected) {
      errors.push({
        code: "WRONG_STEP_TYPE",
        message: `Step ${i + 1} has type "${actual}" but expected "${expected}"`,
        step: i + 1,
        stepType: actual,
        severity: "error",
      });
    }
  }

  // ── 2. Per-Step Content Validation (STRICT) ─────────────────────────────

  for (let i = 0; i < journey.length; i++) {
    const step = journey[i];
    const stepNum = i + 1;
    const stepType = step?.stepType || "unknown";
    const requirements = STEP_REQUIREMENTS[stepType];

    if (!requirements) continue;

    const studentText = (step?.studentText || "").trim();
    const owlText = (step?.owlText || "").trim();
    const interaction = step?.interaction || {};

    // 2a. Placeholder detection (STRICT)
    const allStepText = `${studentText} ${owlText} ${JSON.stringify(interaction)}`;
    const placeholders = detectPlaceholders(allStepText);
    if (placeholders.length > 0) {
      errors.push({
        code: "PLACEHOLDER_CONTENT",
        message: `Step ${stepNum} (${stepType}) contains placeholder text: ${placeholders.join(", ")}`,
        step: stepNum,
        stepType,
        severity: "error",
      });
    }

    // 2b. Minimum student text length (STRICT)
    if (requirements.minStudentTextLength > 0 && studentText.length < requirements.minStudentTextLength) {
      errors.push({
        code: "STUDENT_TEXT_TOO_SHORT",
        message: `Step ${stepNum} (${stepType}) student text is ${studentText.length} chars, minimum is ${requirements.minStudentTextLength}`,
        step: stepNum,
        stepType,
        severity: "error",
      });
    }

    // 2c. Minimum owl text length
    if (requirements.minOwlTextLength > 0 && owlText.length < requirements.minOwlTextLength) {
      errors.push({
        code: "OWL_TEXT_TOO_SHORT",
        message: `Step ${stepNum} (${stepType}) owl text is ${owlText.length} chars, minimum is ${requirements.minOwlTextLength}`,
        step: stepNum,
        stepType,
        severity: "error",
      });
    }

    // 2d. Interaction required
    if (requirements.requiresInteraction && (!interaction || interaction.type === "none")) {
      errors.push({
        code: "MISSING_INTERACTION",
        message: `Step ${stepNum} (${stepType}) requires an interaction but has none`,
        step: stepNum,
        stepType,
        severity: "error",
      });
    }

    // ────────────────────────────────────────────────────────────────────────
    // STEP-SPECIFIC STRICT VALIDATION
    // ────────────────────────────────────────────────────────────────────────

    // LEARN STEP: Must have 2+ meaningful lines and real teaching content
    if (stepType === "learn") {
      const meaningfulLines = studentText.split("\n").filter((l) => l.trim().length > 10);
      if (meaningfulLines.length < 2) {
        errors.push({
          code: "LEARN_TOO_THIN",
          message: `Learn step has only ${meaningfulLines.length} meaningful line(s), minimum is 2`,
          step: stepNum,
          stepType,
          severity: "error",
        });
      }
      // Must contain actual teaching content (not just a definition)
      const hasTeachingContent = studentText.includes("**") || studentText.includes("##") ||
        studentText.includes("1.") || studentText.includes("•") ||
        meaningfulLines.length >= 3;
      if (!hasTeachingContent && studentText.length < 150) {
        warnings.push({
          code: "LEAK_LACKS_STRUCTURE",
          message: `Learn step may lack teaching structure (no formatting, bullets, or numbered points)`,
          step: stepNum,
          stepType,
          severity: "warning",
        });
      }
    }

    // EXAMPLE STEP: Must have step-by-step structure
    if (stepType === "example") {
      const hasStepByStep = /step\s*\d/i.test(studentText) ||
        /→/.test(studentText) || /->/.test(studentText) ||
        /^\d+[\.\)]/m.test(studentText) ||
        /first|then|next|finally|lastly/i.test(studentText);
      if (!hasStepByStep) {
        errors.push({
          code: "EXAMPLE_NO_STEPS",
          message: `Example step lacks step-by-step structure (no "Step 1", "→", "First/Then/Next" pattern)`,
          step: stepNum,
          stepType,
          severity: "error",
        });
      }
      const exampleMeaningfulLines = studentText.split("\n").filter((l) => l.trim().length > 10);
      if (exampleMeaningfulLines.length < 2) {
        errors.push({
          code: "EXAMPLE_TOO_THIN",
          message: `Example step has only ${exampleMeaningfulLines.length} meaningful line(s)`,
          step: stepNum,
          stepType,
          severity: "error",
        });
      }
    }

    // PRACTICE STEP: Must have 2+ identifiable tasks
    if (stepType === "practice") {
      const numberedTasks = (studentText.match(/\d+[\.\)]/g) || []).length;
      const questionMarks = (studentText.match(/\?/g) || []).length;
      const bulletPoints = (studentText.match(/[•\-*]/g) || []).length;
      const imperativeVerbs = (studentText.match(/\b(draw|write|count|solve|find|circle|shade|match|complete|fill|tell|show|make|choose|pick|color|cut|paste|measure|record|list|name|identify|compare|order|arrange|build|create|design|explain|describe|answer|calculate|add|subtract|multiply|divide)\b/gi) || []).length;
      const taskCount = Math.max(numberedTasks, questionMarks, bulletPoints > 2 ? bulletPoints : 0);
      
      if (taskCount < 2 && imperativeVerbs < 2) {
        errors.push({
          code: "PRACTICE_TOO_FEW_TASKS",
          message: `Practice step has ~${taskCount} identifiable tasks, minimum is 2`,
          step: stepNum,
          stepType,
          severity: "error",
        });
      }
    }

    // QUICK CHECK: Must have valid multiple choice with correct answer
    if (stepType === "quick_check") {
      if (requirements.requiresOptions) {
        const options = interaction?.options || [];
        if (!Array.isArray(options) || options.length < 2) {
          errors.push({
            code: "QC_TOO_FEW_OPTIONS",
            message: `Quick Check has ${options.length} options, minimum is 2`,
            step: stepNum,
            stepType,
            severity: "error",
          });
        }
        // Check for empty options
        const emptyOptions = options.filter((o: string) => !o || o.trim().length === 0);
        if (emptyOptions.length > 0) {
          errors.push({
            code: "QC_EMPTY_OPTIONS",
            message: `Quick Check has ${emptyOptions.length} empty option(s)`,
            step: stepNum,
            stepType,
            severity: "error",
          });
        }
      }

      if (requirements.requiresCorrectAnswer) {
        const correctIdx = interaction?.correctIndex;
        // Must be a valid number (not null, undefined, or non-integer)
        if (typeof correctIdx !== "number" || !Number.isInteger(correctIdx) || correctIdx < 0) {
          errors.push({
            code: "QC_NO_CORRECT_ANSWER",
            message: `Quick Check has no valid correctIndex (got: ${correctIdx})`,
            step: stepNum,
            stepType,
            severity: "error",
          });
        }
        const options = interaction?.options || [];
        if (typeof correctIdx === "number" && correctIdx >= options.length) {
          errors.push({
            code: "QC_CORRECT_OUT_OF_RANGE",
            message: `Quick Check correctIndex ${correctIdx} is out of range (0-${options.length - 1})`,
            step: stepNum,
            stepType,
            severity: "error",
          });
        }
      }

      if (requirements.requiresExplanation && (!interaction?.explanation || interaction.explanation.trim().length < 10)) {
        warnings.push({
          code: "QC_WEAK_EXPLANATION",
          message: `Quick Check explanation is missing or too short`,
          step: stepNum,
          stepType,
          severity: "warning",
        });
      }
    }

    // REFLECT STEP: Must have meaningful prompt or options
    if (stepType === "reflect") {
      const reflectionOptions = step?.reflectionOptions || [];
      const hasPrompt = owlText.length > 10 || studentText.length > 10;
      if (!hasPrompt && reflectionOptions.length === 0) {
        errors.push({
          code: "REFLECT_TOO_WEAK",
          message: `Reflect step has no meaningful prompt or reflection options`,
          step: stepNum,
          stepType,
          severity: "error",
        });
      }
    }
  }

  // ── 3. Cross-Step Validation ─────────────────────────────────────────────

  // 3a. Duplicate text detection
  const allOwlTexts = journey.map((s) => (s?.owlText || "").trim()).filter(Boolean);
  const allStudentTexts = journey.map((s) => (s?.studentText || "").trim()).filter(Boolean);

  const duplicateOwl = allOwlTexts.filter((t, i) => allOwlTexts.indexOf(t) !== i);
  if (duplicateOwl.length > 0) {
    warnings.push({
      code: "DUPLICATE_OWL_TEXT",
      message: `Duplicate owl text found: "${duplicateOwl[0].slice(0, 50)}..."`,
      severity: "warning",
    });
  }

  const duplicateStudent = allStudentTexts.filter((t, i) => allStudentTexts.indexOf(t) !== i);
  if (duplicateStudent.length > 0) {
    errors.push({
      code: "DUPLICATE_STUDENT_TEXT",
      message: `Duplicate student text found: "${duplicateStudent[0].slice(0, 50)}..."`,
      severity: "error",
    });
  }

  // 3b. Learn step must have substantial content
  const learnStep = journey.find((s) => s?.stepType === "learn");
  if (learnStep) {
    const learnText = (learnStep.studentText || "").trim();
    // Check if learn step only has a title and placeholder
    const learnLines = learnText.split("\n").filter((l) => l.trim().length > 10);
    if (learnLines.length < 2) {
      errors.push({
        code: "LEARN_TOO_THIN",
        message: `Learn step has insufficient teaching content (${learnLines.length} meaningful lines)`,
        step: 4,
        stepType: "learn",
        severity: "error",
      });
    }
  }

  // 3c. Example step must have actual example content
  const exampleStep = journey.find((s) => s?.stepType === "example");
  if (exampleStep) {
    const exampleText = (exampleStep.studentText || "").trim();
    const hasExampleContent = exampleText.length > 80 &&
      !exampleText.includes("[Example") &&
      !exampleText.includes("based on source pack");
    if (!hasExampleContent) {
      errors.push({
        code: "EXAMPLE_TOO_WEAK",
        message: `Example step lacks actual worked example content`,
        step: 6,
        stepType: "example",
        severity: "error",
      });
    }
  }

  // ── 4. Score Calculation ─────────────────────────────────────────────────

  let score = 100;
  score -= errors.length * 10;
  score -= warnings.length * 3;
  score = Math.max(0, Math.min(100, score));

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    score,
  };
}

// ── Duplicate Journey Detection ──────────────────────────────────────────────

export function detectDuplicateJourneys(
  newJourney: any[],
  existingJourneys: { id: string; title: string; journey: any[] }[]
): { id: string; title: string; similarity: number }[] {
  const duplicates: { id: string; title: string; similarity: number }[] = [];

  const newText = JSON.stringify(newJourney.map((s) => ({
    type: s?.stepType,
    student: (s?.studentText || "").trim().slice(0, 200),
    owl: (s?.owlText || "").trim().slice(0, 100),
  })));

  for (const existing of existingJourneys) {
    const existingText = JSON.stringify(existing.journey.map((s) => ({
      type: s?.stepType,
      student: (s?.studentText || "").trim().slice(0, 200),
      owl: (s?.owlText || "").trim().slice(0, 100),
    })));

    // Exact match
    if (newText === existingText) {
      duplicates.push({ id: existing.id, title: existing.title, similarity: 1.0 });
      continue;
    }

    // High similarity (compare student text only)
    const newStudentTexts = newJourney.map((s) => (s?.studentText || "").trim()).join(" ");
    const existingStudentTexts = existing.journey.map((s) => (s?.studentText || "").trim()).join(" ");

    if (newStudentTexts.length > 50 && existingStudentTexts.length > 50) {
      const similarity = calculateSimilarity(newStudentTexts, existingStudentTexts);
      if (similarity > 0.8) {
        duplicates.push({ id: existing.id, title: existing.title, similarity });
      }
    }
  }

  return duplicates;
}

function calculateSimilarity(a: string, b: string): number {
  if (a === b) return 1.0;
  if (a.length === 0 || b.length === 0) return 0.0;

  // Simple Jaccard similarity on word sets
  const wordsA = new Set(a.toLowerCase().split(/\s+/));
  const wordsB = new Set(b.toLowerCase().split(/\s+/));
  const intersection = new Set([...wordsA].filter((w) => wordsB.has(w)));
  const union = new Set([...wordsA, ...wordsB]);

  return intersection.size / union.size;
}

// ── Convenience Functions ────────────────────────────────────────────────────

export function isJourneyReadyForApproval(journey: any[]): { ready: boolean; reasons: string[] } {
  const result = validateJourney(journey);
  const reasons: string[] = [];

  if (!result.valid) {
    for (const error of result.errors) {
      reasons.push(`${error.code}: ${error.message}`);
    }
  }

  for (const warning of result.warnings) {
    reasons.push(`WARNING: ${warning.code}: ${warning.message}`);
  }

  return { ready: result.valid, reasons };
}

export function getJourneyQualityLabel(score: number): string {
  if (score >= 90) return "EXCELLENT";
  if (score >= 75) return "GOOD";
  if (score >= 60) return "ACCEPTABLE";
  if (score >= 40) return "NEEDS_REVISION";
  return "REJECT";
}
