// ─────────────────────────────────────────────────────────────────────────────
// Arizen Lesson Journey Schema
// ─────────────────────────────────────────────────────────────────────────────
// This file defines the canonical lesson journey structure for Arizen.
//
// Design principles:
//   - CBC-aligned: maps directly to imported CBC curriculum fields
//   - Owl-guided: every step has warm character guidance
//   - Child-friendly: short steps, vivid language, practical/offline activities
//   - Parent-aware: includes parental engagement hooks
//   - AI-ready: structured so future AI generation can populate reliably
//   - JSON-serializable: no functions or circular refs in journey data
//
// Usage:
//   Import types and constants into:
//     - Student lesson viewer (render journey steps)
//     - Admin lesson editor (readiness checker, field mapping)
//     - Future AI generation (structured output format)
// ─────────────────────────────────────────────────────────────────────────────

// ── Step Types ───────────────────────────────────────────────────────────────

export type JourneyStepType =
  | "welcome"
  | "mission"
  | "think_first"
  | "learn"
  | "connect"
  | "example"
  | "practice"
  | "quick_check"
  | "reflect"
  | "complete";

export const JOURNEY_STEP_TYPES: JourneyStepType[] = [
  "welcome",
  "mission",
  "think_first",
  "learn",
  "connect",
  "example",
  "practice",
  "quick_check",
  "reflect",
  "complete",
];

export const STEP_TYPE_LABELS: Record<JourneyStepType, string> = {
  welcome: "Welcome",
  mission: "Mission",
  think_first: "Think First",
  learn: "Learn It",
  connect: "Connect",
  example: "Example",
  practice: "Try It Yourself",
  quick_check: "Quick Check",
  reflect: "Reflect",
  complete: "Complete",
};

export const STEP_TYPE_ICONS: Record<JourneyStepType, string> = {
  welcome: "🦉",
  mission: "🎯",
  think_first: "💭",
  learn: "📖",
  connect: "🔗",
  example: "💡",
  practice: "✏️",
  quick_check: "✅",
  reflect: "🪞",
  complete: "🏆",
};

// ── Interaction Types ───────────────────────────────────────────────────────

export type InteractionType =
  | "none"
  | "open_response"
  | "multiple_choice"
  | "self_check"
  | "draw_or_use_objects"
  | "parent_assisted"
  | "offline_activity";

export const INTERACTION_TYPES: InteractionType[] = [
  "none",
  "open_response",
  "multiple_choice",
  "self_check",
  "draw_or_use_objects",
  "parent_assisted",
  "offline_activity",
];

// ── Visual Types ─────────────────────────────────────────────────────────────

export type VisualType =
  | "none"
  | "owl_teacher"
  | "grouped_objects"
  | "number_line"
  | "counters"
  | "fraction_model"
  | "shape_model"
  | "money_objects"
  | "measurement_objects"
  | "classroom_objects"
  | "home_objects"
  | "concept_illustration";

export const VISUAL_TYPES: VisualType[] = [
  "none",
  "owl_teacher",
  "grouped_objects",
  "number_line",
  "counters",
  "fraction_model",
  "shape_model",
  "money_objects",
  "measurement_objects",
  "classroom_objects",
  "home_objects",
  "concept_illustration",
];

// ── Video Metadata ──────────────────────────────────────────────────────────

export interface JourneyVideo {
  required: boolean;
  searchKeywords: string;
  approvedUrl: string | null;
  approvedTitle: string | null;
  approvedByAdmin: boolean;
}

export const EMPTY_VIDEO: JourneyVideo = {
  required: false,
  searchKeywords: "",
  approvedUrl: null,
  approvedTitle: null,
  approvedByAdmin: false,
};

// ── Interaction Block ───────────────────────────────────────────────────────

export interface JourneyInteraction {
  type: InteractionType;
  question?: string;
  options?: string[];
  correctAnswer?: string | number;
  hint?: string;
  parentInstructions?: string;
}

// ── Core Journey Step ───────────────────────────────────────────────────────

export interface JourneyStep {
  /** Unique step identifier (e.g., "step-1-welcome") */
  id: string;
  /** Step type determines the role in the journey */
  stepType: JourneyStepType;
  /** Short, child-friendly step title */
  title: string;
  /** Main content text for the student — short, vivid, child-friendly */
  studentText: string;
  /** Owl Teacher guidance — warm, encouraging, practical */
  owlText: string;
  /** Optional math/symbol display (LaTeX or plain text) */
  mathDisplay?: string;
  /** What kind of visual aid would help here */
  visualType?: VisualType;
  /** Prompt for future AI image generation */
  illustrationPrompt?: string;
  /** Interactive element for the step */
  interaction?: JourneyInteraction;
  /** Premade reflection options (for reflect step) */
  reflectionOptions?: string[];
  /** Materials needed (e.g., ["counters", "paper", "bottle tops"]) */
  materials?: string[];
  /** Video metadata */
  video?: JourneyVideo;
  /** Estimated time in minutes */
  estimatedMinutes?: number;
}

// ── Full Lesson Journey ─────────────────────────────────────────────────────

export interface LessonJourney {
  lessonId: string;
  title: string;
  subject: string;
  grade: number;
  steps: JourneyStep[];
  totalEstimatedMinutes: number;
  xpReward: number;
  coinReward: number;
  /** Which CBC strand this covers */
  strand?: string;
  /** Which CBC sub-strand */
  subStrand?: string;
  /** Parent engagement note */
  parentNote?: string;
}

// ── Standard Lesson Flow ────────────────────────────────────────────────────
//
// The recommended Arizen lesson flow is:
//
// 1. WELCOME (🦉)
//    Purpose: Emotionally prepare the learner. Introduce Owl Teacher.
//    Content: Warm greeting, what we're going to learn today, why it's exciting.
//    Owl: "Hi [name]! I'm Owl Teacher. Today we're going to learn about [topic].
//          It's going to be fun! Are you ready?"
//    Interaction: none or self_check ("Are you ready? Yes / Not yet")
//    Estimated: 1-2 min
//
// 2. MISSION (🎯)
//    Purpose: Explain what the learner will be able to do by the end.
//    Content: Clear, simple learning outcome. "By the end of this lesson, you'll
//             be able to [specific skill]."
//    Owl: "This is your mission! By the end, you'll be able to [skill].
//          Let's do this together!"
//    Source field: specificLearningOutcome
//    Estimated: 1 min
//
// 3. THINK FIRST (💭)
//    Purpose: Activate curiosity using a key inquiry question.
//    Content: A thought-provoking question related to the lesson.
//    Owl: "Before we start, think about this: [question]
//          There's no wrong answer — just think!"
//    Interaction: open_response or none
//    Source field: keyInquiryQuestion
//    Estimated: 2-3 min
//
// 4. LEARN IT (📖)
//    Purpose: Explain the idea in simple child-friendly language.
//    Content: Core concept explanation, broken into short paragraphs.
//             Use analogies, real-life connections, simple words.
//    Owl: "Here's how it works: [explanation]. Read it slowly —
//          if something is new, that's okay!"
//    Visual: concept_illustration, counters, number_line, etc.
//    Source field: suggestedLearningExperience
//    Estimated: 3-5 min
//
// 5. CONNECT (🔗)
//    Purpose: Connect the idea to a symbol, rule, method, or real-life situation.
//    Content: "This is like [real-life example]" or "The math word for this is [term]."
//    Owl: "You know what? This is just like [connection]!
//          Now let's see how it works with numbers/symbols."
//    Visual: grouped_objects, home_objects, classroom_objects
//    Source field: derived from suggestedLearningExperience + lesson title
//    Estimated: 2-3 min
//
// 6. EXAMPLE (💡)
//    Purpose: Show one worked example step by step.
//    Content: A concrete, fully worked example. For math: use counters, fruits,
//             books, groups, numbers. Show each step clearly.
//    Owl: "Let me show you how it's done. Watch carefully —
//          you'll try one next!"
//    Visual: counters, grouped_objects, fraction_model, etc.
//    Source field: example, workedExample, or activityInstructions
//    Estimated: 3-4 min
//
// 7. TRY IT YOURSELF (✏️)
//    Purpose: Student practices with a clear task.
//    Content: Specific activity instructions. Include "You can use counters,
//             drawings, fingers, bottle tops, or objects at home."
//    Owl: "Now it's YOUR turn! [Task]. You can use [materials].
//          Take your time — learning by doing is the best way!"
//    Interaction: draw_or_use_objects, offline_activity, or open_response
//    Materials: ["counters", "paper", "bottle tops", "drawings"]
//    Source field: activityInstructions, offlineActivity
//    Estimated: 5-10 min
//
// 8. QUICK CHECK (✅)
//    Purpose: Verify understanding with a simple check.
//    Content: A question or task that checks if the student got the concept.
//             Can be multiple choice, self-check, or "show me" task.
//    Owl: "Let's see if the idea makes sense! [Question/Task]
//          If you're not sure, that's okay — we can review!"
//    Interaction: multiple_choice, self_check, or draw_or_use_objects
//    Source field: assessmentCriteria, assessmentMethod
//    Estimated: 2-3 min
//
// 9. REFLECT (🪞)
//    Purpose: Help the student consolidate learning through reflection.
//    Content: Reflection prompt + premade response options.
//    Owl: "What did you notice? What was easy? What was a little hard?
//          Writing it down helps you remember!"
//    Interaction: open_response with reflectionOptions
//    Source field: reflectionPrompt
//    Estimated: 2-3 min
//
// 10. COMPLETE (🏆)
//     Purpose: Celebrate completion, show rewards, link to next steps.
//     Content: Congratulations, XP earned, coins earned, badges unlocked.
//     Owl: "Amazing work! You earned [XP] XP and [coins] coins!
//           You're becoming a real [subject] expert!"
//     Estimated: 1 min
//
// ─────────────────────────────────────────────────────────────────────────────

// ── Default Owl Messages by Step Type ────────────────────────────────────────

export const DEFAULT_OWL_MESSAGES: Record<JourneyStepType, string> = {
  welcome:
    "Hi there! I'm Owl Teacher. Today we're going to learn something exciting together. Are you ready?",
  mission:
    "This is your mission! By the end of this lesson, you'll be able to do something new. Let's do this together!",
  think_first:
    "Before we start, think about this question. There's no wrong answer — your first idea matters!",
  learn:
    "Read this part slowly. If something is new, that's okay — we'll practice it together!",
  connect:
    "You know what? This is just like something you already know! Let me show you the connection.",
  example:
    "Watch how this works step by step. This is like a recipe — you can follow these steps when you try it yourself!",
  practice:
    "Now it's YOUR turn! Use counters, drawings, fingers, bottle tops, or objects at home. Take your time!",
  quick_check:
    "Let's see if the idea makes sense! Try this quick check. If you're not sure, that's okay — we can review!",
  reflect:
    "What did you notice? What was easy? What was a little hard? Writing it down helps you remember!",
  complete:
    "Amazing work! You've completed the lesson. You're becoming a real expert!",
};

// ── Reflection Options by Subject ───────────────────────────────────────────

export const MATH_REFLECTION_OPTIONS = [
  "I understand it well.",
  "I need more practice.",
  "This was fun.",
  "This was a little hard.",
  "I can use this at home.",
  "I want help from my parent/teacher.",
  "I learned something new.",
  "I am proud of myself.",
];

export const GENERAL_REFLECTION_OPTIONS = [
  "I understand it well.",
  "I need more practice.",
  "This was fun.",
  "This was a little hard.",
  "I can use this in real life.",
  "I want help from my parent/teacher.",
  "I learned something new.",
  "I am proud of myself.",
];

// ── Materials Suggestions by Subject ────────────────────────────────────────

export const MATH_MATERIALS = [
  "counters",
  "paper",
  "bottle tops",
  "drawings",
  "fruits",
  "books",
  "coins",
  "ruler",
];

export const GENERAL_MATERIALS = [
  "paper",
  "pencil",
  "crayons",
  "books",
  "household objects",
];

// ── Helper: Create a JourneyStep from minimal data ──────────────────────────

export function createJourneyStep(params: {
  id: string;
  stepType: JourneyStepType;
  title?: string;
  studentText: string;
  owlText?: string;
  mathDisplay?: string;
  visualType?: VisualType;
  illustrationPrompt?: string;
  interaction?: JourneyInteraction;
  reflectionOptions?: string[];
  materials?: string[];
  video?: Partial<JourneyVideo>;
  estimatedMinutes?: number;
}): JourneyStep {
  return {
    id: params.id,
    stepType: params.stepType,
    title: params.title || STEP_TYPE_LABELS[params.stepType],
    studentText: params.studentText,
    owlText: params.owlText || DEFAULT_OWL_MESSAGES[params.stepType],
    mathDisplay: params.mathDisplay,
    visualType: params.visualType || "owl_teacher",
    illustrationPrompt: params.illustrationPrompt,
    interaction: params.interaction,
    reflectionOptions: params.reflectionOptions,
    materials: params.materials,
    video: params.video ? { ...EMPTY_VIDEO, ...params.video } : undefined,
    estimatedMinutes: params.estimatedMinutes,
  };
}

// ── Helper: Build a complete journey from CBC contentBlocks ─────────────────

export function buildJourneyFromCbcBlocks(
  lessonId: string,
  title: string,
  contentBlocks: any,
  meta?: {
    subject?: string;
    grade?: number;
    strand?: string;
    subStrand?: string;
    xpReward?: number;
    coinReward?: number;
    parentNote?: string;
  }
): LessonJourney {
  const blocks = contentBlocks || {};
  const curriculum = blocks.curriculum || {};
  const shell = blocks.lessonShell || {};
  const rewards = blocks.rewards || {};
  const video = blocks.video || {};

  const subject = meta?.subject || curriculum.subject || "";
  const grade = meta?.grade || parseInt(curriculum.grade, 10) || 0;
  const xpReward = meta?.xpReward || rewards.xp || 50;
  const coinReward = meta?.coinReward || rewards.coins || Math.floor(xpReward / 2);

  const steps: JourneyStep[] = [];
  let stepNum = 1;

  // Helper to create step ID
  const sid = (type: JourneyStepType) => `step-${stepNum++}-${type}`;

  // 1. Welcome
  steps.push(
    createJourneyStep({
      id: sid("welcome"),
      stepType: "welcome",
      studentText: `Welcome to "${title}"! Today we're going to learn something exciting together.`,
      owlText: `Hi there! I'm Owl Teacher. Today we're going to learn about "${title}". It's going to be fun! Are you ready?`,
      visualType: "owl_teacher",
      estimatedMinutes: 1,
    })
  );

  // 2. Mission
  const learningGoal =
    curriculum.specificLearningOutcome ||
    blocks.specificLearningOutcome ||
    blocks.learningOutcome;
  if (learningGoal) {
    steps.push(
      createJourneyStep({
        id: sid("mission"),
        stepType: "mission",
        studentText: learningGoal,
        owlText: `This is your mission! By the end of this lesson, you'll be able to: ${learningGoal}`,
        estimatedMinutes: 1,
      })
    );
  }

  // 3. Think First
  const keyInquiry =
    curriculum.keyInquiryQuestion ||
    blocks.keyInquiryQuestion;
  if (keyInquiry) {
    steps.push(
      createJourneyStep({
        id: sid("think_first"),
        stepType: "think_first",
        studentText: keyInquiry,
        owlText: `Before we start, think about this: ${keyInquiry} There's no wrong answer — just think about what you already know!`,
        interaction: { type: "open_response" },
        estimatedMinutes: 2,
      })
    );
  }

  // 4. Learn It
  const suggestedExperience =
    curriculum.suggestedLearningExperience ||
    blocks.suggestedLearningExperience;
  if (suggestedExperience) {
    steps.push(
      createJourneyStep({
        id: sid("learn"),
        stepType: "learn",
        studentText: suggestedExperience,
        owlText: DEFAULT_OWL_MESSAGES.learn,
        visualType: "concept_illustration",
        estimatedMinutes: 4,
      })
    );
  }

  // 5. Connect
  if (suggestedExperience || learningGoal) {
    const connectText = `This is connected to what you already know about ${subject || "this topic"}. ${
      grade <= 2
        ? "You can see this in everyday life — at home, at school, and in your community!"
        : "Let's connect this idea to what you've learned before and see how it fits together."
    }`;
    steps.push(
      createJourneyStep({
        id: sid("connect"),
        stepType: "connect",
        studentText: connectText,
        owlText: DEFAULT_OWL_MESSAGES.connect,
        visualType: "home_objects",
        estimatedMinutes: 2,
      })
    );
  }

  // 6. Example
  const exampleContent =
    shell.example ||
    blocks.example ||
    shell.workedExample ||
    blocks.workedExample ||
    (shell.activityInstructions && shell.activityInstructions !== suggestedExperience
      ? shell.activityInstructions
      : null);

  if (exampleContent) {
    steps.push(
      createJourneyStep({
        id: sid("example"),
        stepType: "example",
        studentText: exampleContent,
        owlText: DEFAULT_OWL_MESSAGES.example,
        visualType: "counters",
        estimatedMinutes: 3,
      })
    );
  } else {
    // Derive a simple example from the title
    steps.push(
      createJourneyStep({
        id: sid("example"),
        stepType: "example",
        studentText: `Let's think about "${title}" with something from everyday life. Imagine you have a group of objects at home — like fruits, books, or bottle tops. We can use these to practice what we're learning today.`,
        owlText: "Let me show you with something you know! Imagine you have objects at home — we can use them to practice.",
        visualType: "home_objects",
        estimatedMinutes: 3,
      })
    );
  }

  // 7. Practice
  const tryContent =
    shell.activityInstructions ||
    blocks.activityInstructions ||
    shell.offlineActivity ||
    blocks.offlineActivity;
  if (tryContent) {
    steps.push(
      createJourneyStep({
        id: sid("practice"),
        stepType: "practice",
        studentText: tryContent,
        owlText: DEFAULT_OWL_MESSAGES.practice,
        interaction: { type: "draw_or_use_objects" },
        materials: subject.toLowerCase().includes("math") ? MATH_MATERIALS : GENERAL_MATERIALS,
        estimatedMinutes: 7,
      })
    );
  }

  // 8. Quick Check
  const assessment =
    shell.assessmentCriteria ||
    blocks.assessmentCriteria ||
    shell.assessmentMethod ||
    blocks.assessmentMethod;
  if (assessment) {
    steps.push(
      createJourneyStep({
        id: sid("quick_check"),
        stepType: "quick_check",
        studentText: assessment,
        owlText: DEFAULT_OWL_MESSAGES.quick_check,
        interaction: { type: "self_check" },
        estimatedMinutes: 2,
      })
    );
  }

  // 9. Reflect
  const reflection =
    shell.reflectionPrompt ||
    blocks.reflectionPrompt;
  if (reflection) {
    steps.push(
      createJourneyStep({
        id: sid("reflect"),
        stepType: "reflect",
        studentText: reflection,
        owlText: DEFAULT_OWL_MESSAGES.reflect,
        interaction: { type: "open_response" },
        reflectionOptions: subject.toLowerCase().includes("math")
          ? MATH_REFLECTION_OPTIONS
          : GENERAL_REFLECTION_OPTIONS,
        estimatedMinutes: 2,
      })
    );
  }

  // 10. Complete
  steps.push(
    createJourneyStep({
      id: sid("complete"),
      stepType: "complete",
      studentText: `Congratulations! You've completed "${title}". You earned ${xpReward} XP and ${coinReward} coins!`,
      owlText: `Amazing work! You've completed the lesson. You earned ${xpReward} XP and ${coinReward} coins! You're becoming a real ${subject || "learning"} expert!`,
      visualType: "owl_teacher",
      estimatedMinutes: 1,
    })
  );

  const totalEstimatedMinutes = steps.reduce(
    (sum, s) => sum + (s.estimatedMinutes || 2),
    0
  );

  return {
    lessonId,
    title,
    subject,
    grade,
    steps,
    totalEstimatedMinutes,
    xpReward,
    coinReward,
    strand: meta?.strand || curriculum.strand,
    subStrand: meta?.subStrand || curriculum.subStrand,
    parentNote: meta?.parentNote || curriculum.parentalEngagement,
  };
}

// ── Lesson Readiness Checker ────────────────────────────────────────────────
// Used by admin and future AI generation to determine if a lesson has enough
// content for a high-quality student journey.

export interface LessonReadiness {
  /** Overall readiness score 0-100 */
  score: number;
  /** Whether the lesson is ready for student testing */
  isReady: boolean;
  /** Which steps can be built from available data */
  availableSteps: JourneyStepType[];
  /** Which steps are missing */
  missingSteps: JourneyStepType[];
  /** Human-readable recommendations */
  recommendations: string[];
  /** Whether an approved student journey exists */
  hasApprovedJourney?: boolean;
  /** Whether a draft journey exists */
  hasDraftJourney?: boolean;
  /** Draft review status: NEEDS_REVIEW, APPROVED, REJECTED */
  draftReviewStatus?: string | null;
  /** Whether any step has an unapproved video */
  hasUnapprovedVideo?: boolean;
}

export function checkLessonReadiness(contentBlocks: any): LessonReadiness {
  const blocks = contentBlocks || {};
  const curriculum = blocks.curriculum || {};
  const shell = blocks.lessonShell || {};
  const rewards = blocks.rewards || {};

  const available: JourneyStepType[] = [];
  const missing: JourneyStepType[] = [];
  const recommendations: string[] = [];

  // Welcome is always available (generated from title)
  available.push("welcome");

  // Mission
  const learningGoal =
    curriculum.specificLearningOutcome ||
    blocks.specificLearningOutcome ||
    blocks.learningOutcome;
  if (learningGoal) {
    available.push("mission");
  } else {
    missing.push("mission");
    recommendations.push("Add a specific learning outcome so students know what they'll learn.");
  }

  // Think First
  const keyInquiry =
    curriculum.keyInquiryQuestion ||
    blocks.keyInquiryQuestion;
  if (keyInquiry) {
    available.push("think_first");
  } else {
    missing.push("think_first");
    recommendations.push("Add a key inquiry question to spark curiosity.");
  }

  // Learn
  const suggestedExperience =
    curriculum.suggestedLearningExperience ||
    blocks.suggestedLearningExperience;
  if (suggestedExperience) {
    available.push("learn");
  } else {
    missing.push("learn");
    recommendations.push("Add a suggested learning experience to explain the concept.");
  }

  // Connect (derived from learn content)
  if (suggestedExperience || learningGoal) {
    available.push("connect");
  } else {
    missing.push("connect");
  }

  // Example
  const example =
    shell.example ||
    blocks.example ||
    shell.workedExample ||
    blocks.workedExample ||
    shell.activityInstructions ||
    blocks.activityInstructions;
  if (example) {
    available.push("example");
  } else {
    missing.push("example");
    recommendations.push("Add a worked example so students can see how it's done step by step.");
  }

  // Practice
  const tryContent =
    shell.activityInstructions ||
    blocks.activityInstructions ||
    shell.offlineActivity ||
    blocks.offlineActivity;
  if (tryContent) {
    available.push("practice");
  } else {
    missing.push("practice");
    recommendations.push("Add activity instructions or an offline activity for hands-on practice.");
  }

  // Quick Check
  const assessment =
    shell.assessmentCriteria ||
    blocks.assessmentCriteria ||
    shell.assessmentMethod ||
    blocks.assessmentMethod;
  if (assessment) {
    available.push("quick_check");
  } else {
    missing.push("quick_check");
    recommendations.push("Add assessment criteria or method to check understanding.");
  }

  // Reflect
  const reflection =
    shell.reflectionPrompt ||
    blocks.reflectionPrompt;
  if (reflection) {
    available.push("reflect");
  } else {
    missing.push("reflect");
    recommendations.push("Add a reflection prompt to help students consolidate learning.");
  }

  // Complete is always available
  available.push("complete");

  // Calculate score: each step worth ~10 points, core steps worth more
  const coreSteps: JourneyStepType[] = ["mission", "learn", "example", "practice", "quick_check"];
  const coreAvailable = coreSteps.filter((s) => available.includes(s)).length;
  const bonusAvailable = available.filter((s) => !coreSteps.includes(s)).length;
  let score = Math.min(100, coreAvailable * 14 + bonusAvailable * 4);

  // Bonus: approved student journey adds significant readiness
  const hasApprovedJourney = Array.isArray(blocks.studentJourney) && blocks.studentJourney.length > 0;
  const hasDraftJourney = Array.isArray(blocks.studentJourneyDraft) && blocks.studentJourneyDraft.length > 0;
  const aiMeta = blocks.aiMetadata || {};
  const draftIsUnapproved = hasDraftJourney && aiMeta.reviewStatus === "NEEDS_REVIEW";

  if (hasApprovedJourney) {
    // Approved journey adds up to 20 bonus points (capped at 100)
    score = Math.min(100, score + 20);
  }

  // Check for unapproved video in any journey step
  const allSteps = hasApprovedJourney ? blocks.studentJourney : [];
  let hasUnapprovedVideo = false;
  for (const step of allSteps) {
    if (step.video?.required && !step.video?.approvedByAdmin) {
      hasUnapprovedVideo = true;
      break;
    }
  }

  const isReady = score >= 70 && !hasUnapprovedVideo;

  if (hasApprovedJourney && missing.length === 0 && !hasUnapprovedVideo) {
    recommendations.unshift("Lesson has an approved student journey and is ready to publish.");
  } else if (isReady && missing.length > 0) {
    recommendations.unshift("Lesson is ready to publish but could be improved by adding the missing steps above.");
  } else if (score >= 42) {
    recommendations.unshift("Lesson is almost ready — add more content to reach the publish threshold.");
  } else {
    recommendations.unshift("Lesson needs more content before it is ready to publish.");
  }

  // Draft warnings
  if (draftIsUnapproved) {
    recommendations.push("Generated journey draft needs admin review before students can see it.");
  }
  if (hasUnapprovedVideo) {
    recommendations.push("Lesson has unapproved video. Approve or remove video before publishing.");
  }

  return {
    score,
    isReady,
    availableSteps: available,
    missingSteps: missing,
    recommendations,
    hasApprovedJourney: hasApprovedJourney,
    hasDraftJourney: hasDraftJourney,
    draftReviewStatus: aiMeta.reviewStatus || null,
  };
}

// ── Future AI Generation Structure ─────────────────────────────────────────
// When AI generation is implemented, the output should be saved as:
//
// contentBlocks.studentJourneyDraft: JourneyStep[]  // AI-generated, not yet approved
// contentBlocks.studentJourney: JourneyStep[]       // Admin-approved, shown to students
// contentBlocks.aiMetadata: AiMetadata              // Generation metadata
//
// The student viewer should:
//   1. Prefer contentBlocks.studentJourney if it exists and is non-empty
//   2. Fall back to buildJourneyFromCbcBlocks(contentBlocks) otherwise
//   3. Never show studentJourneyDraft to students (admin only)

export interface AiMetadata {
  model: string;
  promptVersion: string;
  generatedAt: string;
  reviewStatus: "NEEDS_REVIEW" | "APPROVED" | "REJECTED" | "EDITED";
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface StudentJourneyContent {
  studentJourneyDraft?: JourneyStep[];
  studentJourney?: JourneyStep[];
  aiMetadata?: AiMetadata;
}

/** Helper: Get the student journey from contentBlocks, with fallback */
export function getStudentJourney(contentBlocks: any): JourneyStep[] | null {
  if (!contentBlocks) return null;
  const approved = contentBlocks.studentJourney;
  if (Array.isArray(approved) && approved.length > 0) return approved;
  return null;
}

/** Helper: Check if contentBlocks has an AI-generated draft */
export function hasAiDraft(contentBlocks: any): boolean {
  if (!contentBlocks) return false;
  const draft = contentBlocks.studentJourneyDraft;
  return Array.isArray(draft) && draft.length > 0;
}

/** Helper: Check if contentBlocks has an approved student journey */
export function hasApprovedJourney(contentBlocks: any): boolean {
  if (!contentBlocks) return false;
  const journey = contentBlocks.studentJourney;
  return Array.isArray(journey) && journey.length > 0;
}

// ── Old Array contentBlocks Converter ───────────────────────────────────────
// Legacy contentBlocks were stored as an array of block objects:
//   [{ type: "text", text: "..." }, { type: "heading", text: "..." }, ...]
// This converter transforms them into JourneyStep[] so the new viewer
// can render them without breaking.

interface LegacyContentBlock {
  type?: string;
  text?: string;
  heading?: string;
  title?: string;
  content?: string;
  [key: string]: any;
}

/**
 * Convert old array contentBlocks into JourneyStep[] format.
 * Each block becomes a "learn" step with the block's text content.
 * This ensures old lessons still render readable content.
 */
export function convertLegacyBlocksToJourney(
  contentBlocks: any,
  lessonTitle: string = "Lesson"
): JourneyStep[] {
  // If it's not an array, return empty
  if (!Array.isArray(contentBlocks)) return [];

  const blocks: LegacyContentBlock[] = contentBlocks;
  const steps: JourneyStep[] = [];

  // Add a welcome step
  steps.push(
    createJourneyStep({
      id: "step-legacy-welcome",
      stepType: "welcome",
      studentText: `Welcome to "${lessonTitle}"! Let's explore this lesson together.`,
      visualType: "owl_teacher",
      estimatedMinutes: 1,
    })
  );

  // Convert each legacy block into a journey step
  let stepNum = 2;
  for (const block of blocks) {
    // Extract text from various possible field names
    const text =
      block.text ||
      block.content ||
      block.heading ||
      block.title ||
      "";

    if (!text || typeof text !== "string" || !text.trim()) continue;

    // Determine step type from block type
    let stepType: JourneyStepType = "learn";
    const blockType = (block.type || "").toLowerCase();
    if (blockType.includes("heading") || blockType.includes("title")) {
      stepType = "learn";
    } else if (blockType.includes("example") || blockType.includes("worked")) {
      stepType = "example";
    } else if (blockType.includes("practice") || blockType.includes("activity")) {
      stepType = "practice";
    } else if (blockType.includes("check") || blockType.includes("quiz") || blockType.includes("assess")) {
      stepType = "quick_check";
    } else if (blockType.includes("reflect")) {
      stepType = "reflect";
    }

    const title =
      block.heading ||
      block.title ||
      (stepType === "example" ? "Example" :
       stepType === "practice" ? "Try It Yourself" :
       stepType === "quick_check" ? "Quick Check" :
       stepType === "reflect" ? "Reflect" :
       "Learn");

    steps.push(
      createJourneyStep({
        id: `step-legacy-${stepNum++}`,
        stepType,
        title,
        studentText: text,
        visualType: "concept_illustration",
        estimatedMinutes: 2,
      })
    );
  }

  // Add a complete step if we have content
  if (steps.length > 1) {
    steps.push(
      createJourneyStep({
        id: "step-legacy-complete",
        stepType: "complete",
        studentText: `Great job! You've reviewed all the content in "${lessonTitle}".`,
        visualType: "owl_teacher",
        estimatedMinutes: 1,
      })
    );
  }

  return steps;
}

/**
 * Universal journey builder that handles all contentBlocks formats:
 * 1. If contentBlocks.studentJourney exists → use it (AI-approved)
 * 2. If contentBlocks is an old array → convert to JourneyStep[]
 * 3. If contentBlocks is a structured CBC object → build from CBC fields
 * 4. Return empty array as last resort
 */
export function buildUniversalJourney(
  lessonId: string,
  title: string,
  contentBlocks: any,
  meta?: {
    subject?: string;
    grade?: number;
    strand?: string;
    subStrand?: string;
    xpReward?: number;
    coinReward?: number;
    parentNote?: string;
  }
): { steps: JourneyStep[]; source: "ai_journey" | "legacy_array" | "cbc_fallback" } {
  // 1. Check for AI-approved student journey first
  const aiJourney = getStudentJourney(contentBlocks);
  if (aiJourney) {
    return { steps: aiJourney, source: "ai_journey" };
  }

  // 2. Check for old array contentBlocks
  if (Array.isArray(contentBlocks)) {
    return {
      steps: convertLegacyBlocksToJourney(contentBlocks, title),
      source: "legacy_array",
    };
  }

  // 3. Build from structured CBC fields
  try {
    const journey = buildJourneyFromCbcBlocks(lessonId, title, contentBlocks, meta);
    return { steps: journey.steps, source: "cbc_fallback" };
  } catch {
    return { steps: [], source: "cbc_fallback" };
  }
}
