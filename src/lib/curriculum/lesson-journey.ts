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
  | "choice" // DB alias for multiple_choice
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
  prompt?: string; // DB field name used by AI generator
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
  /** Media assets for this step (illustration, video, audio, etc.) */
  media?: StepMedia;
  /** Estimated time in minutes */
  estimatedMinutes?: number;
}

// ── Step Media ────────────────────────────────────────────────────────────────

export interface StepIllustration {
  /** The prompt used to generate or describe this illustration */
  prompt: string;
  /** URL of AI-generated image (not yet approved) */
  generatedUrl: string | null;
  /** URL of admin-uploaded image (not yet approved) */
  uploadedUrl: string | null;
  /** URL of approved image (visible to students) */
  approvedUrl: string | null;
  /** Whether the image has been approved by an admin */
  approvedByAdmin: boolean;
  /** Current status of the illustration */
  status: "MISSING" | "GENERATING" | "GENERATED" | "UPLOADED" | "APPROVED" | "FAILED";
  /** Error message if generation/upload failed */
  errorMessage?: string | null;
  /** When the image was generated */
  generatedAt?: string | null;
  /** When the image was uploaded */
  uploadedAt?: string | null;
  /** When the image was approved */
  approvedAt?: string | null;
  /** Style preset used for generation */
  stylePreset?: string | null;
  /** AI-generated description of the image */
  description?: string | null;
}

export interface StepVideo {
  /** Search keywords for finding relevant YouTube videos */
  searchKeywords: string[];
  /** URL of a suggested video (not yet approved) */
  suggestedUrl: string | null;
  /** URL of admin-approved YouTube video */
  approvedUrl: string | null;
  /** Whether the video has been approved by an admin */
  approvedByAdmin: boolean;
  /** Title of the video */
  approvedTitle?: string | null;
}

export interface StepMedia {
  /** Illustration for this step */
  illustration?: StepIllustration;
  /** Video for this step (extends the top-level video field) */
  video?: StepVideo;
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

/**
 * Generate child-friendly journey content from lesson title/subject/grade.
 * This ensures every lesson gets a rich 8-step journey even when CBC fields are empty.
 */
function generateJourneyContent(title: string, subject: string, grade: number) {
  const subjectLower = subject.toLowerCase();
  const isMath = subjectLower.includes("math");
  const isScience = subjectLower.includes("science");
  const isEnglish = subjectLower.includes("english") || subjectLower.includes("language");
  const isKiswahili = subjectLower.includes("kiswahili");
  const isSocial = subjectLower.includes("social") || subjectLower.includes("history");
  const isLowerPrimary = grade <= 3;

  // Clean title: remove trailing /slug artifacts like "Metres/m" → "Metres"
  const cleanTitle = title.replace(/\/[a-z]+$/i, "").replace(/\/m$/i, "").trim() || title;

  // ── Welcome ──
  const welcomeText = isLowerPrimary
    ? `Welcome, young explorer! 🌟 Today we're going to learn about "${cleanTitle}". It's a really cool topic and I think you're going to love it!`
    : `Welcome! Today's lesson is about "${cleanTitle}". Let's dive in and discover something new together.`;

  const welcomeOwl = isLowerPrimary
    ? `Hi there! I'm Owl Teacher 🦉. Today we're going to learn about "${cleanTitle}". It's going to be so much fun! Are you ready to begin?`
    : `Hello! I'm Owl Teacher 🦉. Let's explore "${cleanTitle}" together. I'll guide you through every step!`;

  // ── Mission ──
  const missionText = isMath
    ? `By the end of this lesson, you'll be able to understand and use "${cleanTitle}" in your daily life. You'll be a maths detective!`
    : isScience
    ? `By the end of this lesson, you'll understand how "${cleanTitle}" works in the world around you. You'll be a little scientist!`
    : `By the end of this lesson, you'll know all about "${cleanTitle}" and be able to use what you've learned!`;

  const missionOwl = `This is your mission! 🎯 ${missionText} Let's do this together — I believe in you!`;

  // ── Think First ──
  const thinkQuestion = isMath
    ? `Have you ever had to measure something at home? What did you use? Think about it for a moment!`
    : isScience
    ? `What do you already know about "${cleanTitle}"? Have you seen it in your daily life?`
    : `What comes to mind when you hear "${cleanTitle}"? What do you think we'll learn today?`;

  const thinkOwl = `Before we start, think about this: ${thinkQuestion} There's no wrong answer — just think about what you already know! 💭`;

  // ── Learn ──
  let learnText: string;
  let learnVisual: VisualType = "concept_illustration";
  let learnIllustration: string;

  if (isMath && cleanTitle.toLowerCase().includes("metre")) {
    learnText = `A **metre** is a unit we use to measure how long or tall things are.\n\nImagine a big step you take — that's about 1 metre! A door is about 2 metres tall. A pencil is much smaller, so we don't use metres for it.\n\nWe use metres to measure things like:\n- The height of a wall\n- The length of a room\n- How tall your mum or dad is\n- The length of a football field\n\nA metre is the same as 100 centimetres. That's a lot of centimetres!`;
    learnVisual = "measurement_objects";
    learnIllustration = "A child measuring a table with a metre stick, showing the 1m mark";
  } else if (isMath && cleanTitle.toLowerCase().includes("length")) {
    learnText = `**Length** tells us how long something is — from one end to the other.\n\nWe can measure length in different units:\n- **Millimetres (mm)** — for very small things like a button\n- **Centimetres (cm)** — for things like a book\n- **Metres (m)** — for big things like a room\n- **Kilometres (km)** — for very long distances like from home to school\n\nThe most common unit for everyday measuring is the **metre**.`;
    learnVisual = "measurement_objects";
    learnIllustration = "Objects of different sizes with measurement labels: button (mm), book (cm), room (m)";
  } else if (isMath) {
    learnText = `Let's learn about "${cleanTitle}"! 📖\n\nThis is an important maths concept that you'll use every day. We'll start with the basics and build up your understanding step by step.\n\nRead this part slowly. If something is new, that's okay — we'll practice it together!`;
    learnVisual = "counters";
    learnIllustration = `Colourful illustration showing "${cleanTitle}" with maths objects like counters and number lines`;
  } else if (isScience) {
    learnText = `Let's discover "${cleanTitle}"! 🔬\n\nScience helps us understand the world around us. Today we're going to explore this topic and see how it connects to things you see every day.\n\nPay attention to the examples — they'll help you understand!`;
    learnIllustration = `Science illustration showing "${cleanTitle}" with labelled diagrams`;
  } else {
    learnText = `Let's learn about "${cleanTitle}"! 📖\n\nWe're going to explore this topic together. Read through the content below and see what you can discover.\n\nTake your time — understanding is more important than speed!`;
    learnIllustration = `Illustration showing "${cleanTitle}" in a child-friendly scene`;
  }

  const learnOwl = DEFAULT_OWL_MESSAGES.learn;

  // ── Connect ──
  const connectText = isMath
    ? `You know what? You already use maths every day! When you help mum measure ingredients, or when you see how tall you've grown — that's "${cleanTitle}" in real life!`
    : isScience
    ? `This is just like things you see every day! "${cleanTitle}" is all around us — at home, at school, and in nature. Once you start looking, you'll see it everywhere!`
    : `"${cleanTitle}" connects to things you already know. Think about what you've learned before — this builds on that knowledge!`;

  // ── Example ──
  let exampleText: string;
  if (isMath && cleanTitle.toLowerCase().includes("metre")) {
    exampleText = `Let's look at some examples:\n\n🏠 **A door** is about **2 metres** tall. That's two big steps!\n✏️ **A pencil** is about **15 centimetres** — too small for metres.\n🏫 **A classroom** is about **8 metres** long.\n📏 **A metre ruler** is a tool we use to measure in metres.\n\nRemember: We use metres for BIG things and centimetres for small things!`;
  } else if (isMath) {
    exampleText = `Let's see how "${cleanTitle}" works with a real example:\n\nImagine you have objects at home — like fruits, books, or bottle tops. We can use these to practice what we're learning today.\n\nWatch how this works step by step. This is like a recipe — you can follow these steps when you try it yourself! 💡`;
  } else {
    exampleText = `Let's look at an example of "${cleanTitle}" in action:\n\nThink about something from your daily life that connects to this topic. The more you can connect it to real life, the better you'll understand it!`;
  }

  // ── Try It (interactive multiple choice) ──
  let tryQuestion: string;
  let tryOptions: string[];
  let tryCorrect: number;
  let tryHint: string;

  if (isMath && cleanTitle.toLowerCase().includes("metre")) {
    tryQuestion = "Which object is BEST measured in metres?";
    tryOptions = ["A pencil", "A classroom wall", "A spoon", "An eraser"];
    tryCorrect = 1;
    tryHint = "Think about which object is the BIGGEST! We use metres for big things.";
  } else if (isMath && cleanTitle.toLowerCase().includes("length")) {
    tryQuestion = "What unit would you use to measure a room?";
    tryOptions = ["Millimetres", "Centimetres", "Metres", "Grams"];
    tryCorrect = 2;
    tryHint = "A room is quite big! Which unit is used for big measurements?";
  } else if (isMath) {
    tryQuestion = `Which of these best relates to "${cleanTitle}"?`;
    tryOptions = ["Counting objects", "Measuring length", "Telling time", "Drawing shapes"];
    tryCorrect = 0;
    tryHint = "Think about what we've been learning about in this lesson!";
  } else {
    tryQuestion = `What is the main idea of "${cleanTitle}"?`;
    tryOptions = ["Something we can observe and learn about", "Only found in books", "Too hard to understand", "Not useful in real life"];
    tryCorrect = 0;
    tryHint = "Think about what we've been discussing. The main idea is something you can see and use!";
  }

  // ── Practice ──
  const practiceText = isMath
    ? `Now it's YOUR turn! ✏️\n\nUse objects at home — like a metre stick, a tape measure, or even your hands — to measure 3 things. Write down what you measured and how long each one is.\n\nYou can also draw pictures of the things you measured!`
    : `Now it's YOUR turn! ✏️\n\nTry this activity: Find 3 examples of "${cleanTitle}" in your home or school. Write or draw what you discover.\n\nThe more you look for it, the more you'll understand it!`;

  const practiceMaterials = isMath
    ? ["metre stick or tape measure", "paper", "pencil", "objects at home to measure"]
    : ["paper", "pencil", "crayons", "your eyes and curiosity"];

  // ── Mini Quest ──
  const questText = isMath && cleanTitle.toLowerCase().includes("metre")
    ? `🗺️ **Mini Quest: The Metre Detective!**\n\nYour mission: Find and measure 3 things around your home or school that are LONGER than 1 metre.\n\n**How to complete your quest:**\n1. Look around for big things — walls, tables, beds, doors\n2. Use a metre stick, tape measure, or even your arms to measure\n3. Write down each thing and how many metres long it is\n4. Ask a parent or teacher to help if needed\n\n**Success criteria:**\n✅ You found 3 things longer than 1 metre\n✅ You recorded your measurements\n✅ You can explain why metres were the right unit to use\n\nGood luck, Detective! 🔍`
    : `🗺️ **Mini Quest: Real-World Explorer!**\n\nYour mission: Find 3 real-world examples of "${cleanTitle}" in your daily life.\n\n**How to complete your quest:**\n1. Look around your home, school, or neighbourhood\n2. Find 3 things that connect to what you learned today\n3. Write or draw what you discovered\n4. Share what you found with someone!\n\n**Success criteria:**\n✅ You found 3 real-world examples\n✅ You can explain how they connect to the lesson\n✅ You shared your discoveries\n\nHappy exploring! 🔍`;

  // ── Quick Check ──
  const quickCheckQuestion = isMath && cleanTitle.toLowerCase().includes("metre")
    ? "Can you name one thing at home that you would measure in metres?"
    : `Can you explain "${cleanTitle}" in your own words?`;

  // ── Reflect ──
  const reflectPrompt = isMath && cleanTitle.toLowerCase().includes("metre")
    ? "What did you learn about measuring in metres? What was the most interesting thing? Write your thoughts below!"
    : `What did you learn about "${cleanTitle}" today? What was your favourite part? Write your thoughts below!`;

  const reflectOwl = `What did you notice? What was easy? What was a little hard? Writing it down helps you remember! 🪞`;

  return {
    cleanTitle,
    welcomeText,
    welcomeOwl,
    missionText,
    missionOwl,
    thinkQuestion,
    thinkOwl,
    learnText,
    learnVisual,
    learnIllustration,
    learnOwl,
    connectText,
    exampleText,
    tryQuestion,
    tryOptions,
    tryCorrect,
    tryHint,
    practiceText,
    practiceMaterials,
    questText,
    quickCheckQuestion,
    reflectPrompt,
    reflectOwl,
  };
}


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

  const subject = meta?.subject || curriculum.subject || "";
  const grade = meta?.grade || parseInt(curriculum.grade, 10) || 0;
  const xpReward = meta?.xpReward || rewards.xp || 50;
  const coinReward = meta?.coinReward || rewards.coins || Math.floor(xpReward / 2);

  // Generate rich content from title/subject/grade
  const gen = generateJourneyContent(title, subject, grade);

  const steps: JourneyStep[] = [];
  let stepNum = 1;
  const sid = (type: JourneyStepType) => `step-${stepNum++}-${type}`;

  // ── Step 1: Welcome ──
  steps.push(
    createJourneyStep({
      id: sid("welcome"),
      stepType: "welcome",
      studentText: gen.welcomeText,
      owlText: gen.welcomeOwl,
      visualType: "owl_teacher",
      illustrationPrompt: `A friendly owl teacher welcoming a ${grade <= 2 ? "young" : ""} student to a lesson about ${gen.cleanTitle}`,
      estimatedMinutes: 1,
    })
  );

  // ── Step 2: Mission ──
  const learningGoal =
    curriculum.specificLearningOutcome ||
    blocks.specificLearningOutcome ||
    blocks.learningOutcome;
  steps.push(
    createJourneyStep({
      id: sid("mission"),
      stepType: "mission",
      studentText: learningGoal || gen.missionText,
      owlText: learningGoal
        ? `This is your mission! By the end of this lesson, you'll be able to: ${learningGoal}`
        : gen.missionOwl,
      illustrationPrompt: `A mission banner for "${gen.cleanTitle}" with a ${grade <= 2 ? "child" : "student"} looking at a goal`,
      estimatedMinutes: 1,
    })
  );

  // ── Step 3: Think First ──
  const keyInquiry =
    curriculum.keyInquiryQuestion ||
    blocks.keyInquiryQuestion;
  steps.push(
    createJourneyStep({
      id: sid("think_first"),
      stepType: "think_first",
      studentText: keyInquiry || gen.thinkQuestion,
      owlText: keyInquiry
        ? `Before we start, think about this: ${keyInquiry} There's no wrong answer — just think about what you already know!`
        : gen.thinkOwl,
      interaction: { type: "open_response", question: keyInquiry || gen.thinkQuestion },
      illustrationPrompt: `A ${grade <= 2 ? "child" : "student"} thinking with a thought bubble about ${gen.cleanTitle}`,
      estimatedMinutes: 2,
    })
  );

  // ── Step 4: Learn It ──
  const suggestedExperience =
    curriculum.suggestedLearningExperience ||
    blocks.suggestedLearningExperience;
  steps.push(
    createJourneyStep({
      id: sid("learn"),
      stepType: "learn",
      studentText: suggestedExperience || gen.learnText,
      owlText: gen.learnOwl,
      visualType: gen.learnVisual,
      illustrationPrompt: suggestedExperience ? `Illustration showing ${gen.cleanTitle}` : gen.learnIllustration,
      estimatedMinutes: 4,
    })
  );

  // ── Step 5: Observe (Example) ──
  const exampleContent =
    shell.example ||
    blocks.example ||
    shell.workedExample ||
    blocks.workedExample ||
    (shell.activityInstructions && shell.activityInstructions !== suggestedExperience
      ? shell.activityInstructions
      : null);
  steps.push(
    createJourneyStep({
      id: sid("example"),
      stepType: "example",
      studentText: exampleContent || gen.exampleText,
      owlText: DEFAULT_OWL_MESSAGES.example,
      visualType: subject.toLowerCase().includes("math") ? "counters" : "concept_illustration",
      illustrationPrompt: `Visual examples of ${gen.cleanTitle} in everyday life`,
      estimatedMinutes: 3,
    })
  );

  // ── Step 6: Try It (Interactive) ──
  const tryContent =
    shell.activityInstructions ||
    blocks.activityInstructions ||
    shell.offlineActivity ||
    blocks.offlineActivity;
  steps.push(
    createJourneyStep({
      id: sid("practice"),
      stepType: "practice",
      studentText: tryContent || gen.tryQuestion,
      owlText: DEFAULT_OWL_MESSAGES.practice,
      interaction: {
        type: "multiple_choice",
        question: gen.tryQuestion,
        options: gen.tryOptions,
        correctAnswer: gen.tryCorrect,
        hint: gen.tryHint,
      },
      materials: gen.practiceMaterials,
      illustrationPrompt: `A ${grade <= 2 ? "child" : "student"} choosing an answer about ${gen.cleanTitle}`,
      estimatedMinutes: 3,
    })
  );

  // ── Step 7: Mini Quest ──
  steps.push(
    createJourneyStep({
      id: sid("quick_check"),
      stepType: "quick_check",
      studentText: gen.questText,
      owlText: `Time for your mini quest! 🗺️ This is where you take what you've learned and use it in the real world. I know you can do it!`,
      interaction: {
        type: "self_check",
        question: "Have you completed your mini quest? Check when you're done!",
        hint: "Take your time with the quest. You can come back to this step after you've finished exploring!",
      },
      illustrationPrompt: `A ${grade <= 2 ? "child" : "student"} on a quest, exploring and measuring things`,
      estimatedMinutes: 5,
    })
  );

  // ── Step 8: Practice (offline activity) ──
  if (tryContent) {
    steps.push(
      createJourneyStep({
        id: sid("quick_check"),
        stepType: "quick_check",
        studentText: gen.practiceText,
        owlText: DEFAULT_OWL_MESSAGES.practice,
        interaction: { type: "draw_or_use_objects", question: gen.tryQuestion },
        materials: gen.practiceMaterials,
        illustrationPrompt: `Hands-on practice with ${gen.cleanTitle}`,
        estimatedMinutes: 5,
      })
    );
  }

  // ── Step 9: Reflect ──
  const reflection =
    shell.reflectionPrompt ||
    blocks.reflectionPrompt;
  steps.push(
    createJourneyStep({
      id: sid("reflect"),
      stepType: "reflect",
      studentText: reflection || gen.reflectPrompt,
      owlText: gen.reflectOwl,
      interaction: {
        type: "open_response",
        question: reflection || gen.reflectPrompt,
      },
      reflectionOptions: subject.toLowerCase().includes("math")
        ? MATH_REFLECTION_OPTIONS
        : GENERAL_REFLECTION_OPTIONS,
      illustrationPrompt: `A ${grade <= 2 ? "child" : "student"} writing a reflection`,
      estimatedMinutes: 2,
    })
  );

  // ── Step 10: Complete ──
  steps.push(
    createJourneyStep({
      id: sid("complete"),
      stepType: "complete",
      studentText: `🎉 Congratulations! You've completed "${gen.cleanTitle}"!\n\nYou worked hard, learned something new, and completed your mini quest. You earned ${xpReward} XP and ${coinReward} coins!\n\nYou're becoming a real ${subject || "learning"} expert!`,
      owlText: `Amazing work! 🌟 You've completed the lesson. You earned ${xpReward} XP and ${coinReward} coins! You're becoming a real ${subject || "learning"} expert! I'm so proud of you!`,
      visualType: "owl_teacher",
      illustrationPrompt: `A celebration scene with the owl teacher and a ${grade <= 2 ? "happy child" : "student"} with stars and confetti`,
      estimatedMinutes: 1,
    })
  );

  const totalEstimatedMinutes = steps.reduce(
    (sum, s) => sum + (s.estimatedMinutes || 2),
    0
  );

  return {
    lessonId,
    title: gen.cleanTitle,
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
  const blocks = parseContentBlocks(contentBlocks);

  // ── First: check if an approved student journey exists ──
  const hasApprovedJourney = Array.isArray(blocks.studentJourney) && blocks.studentJourney.length > 0;
  const rawDraft = blocks.studentJourneyDraft;
  const hasDraftJourney = (Array.isArray(rawDraft) && rawDraft.length > 0) || (rawDraft && Array.isArray(rawDraft.steps) && rawDraft.steps.length > 0);
  const aiMeta = blocks.aiMetadata || {};
  const reviewStatus = aiMeta.reviewStatus || null;

  // If we have an approved journey, evaluate its quality directly
  if (hasApprovedJourney) {
    return evaluateJourneyReadiness(blocks.studentJourney, reviewStatus, hasDraftJourney);
  }

  // ── No approved journey yet — evaluate CBC shell completeness ──
  return evaluateShellReadiness(blocks, hasDraftJourney, reviewStatus);
}

/**
 * Evaluate readiness based on the actual approved student journey.
 * This is the source of truth for lessons that have been AI-generated and approved.
 */
function evaluateJourneyReadiness(
  journey: any[],
  reviewStatus: string | null,
  hasDraftJourney: boolean
): LessonReadiness {
  const recommendations: string[] = [];
  const missing: JourneyStepType[] = [];
  const available: JourneyStepType[] = [];

  const stepTypes = journey.map((s: any) => s.stepType);
  const uniqueTypes = Array.from(new Set(stepTypes));

  // Check required step types for a complete journey
  const requiredTypes: JourneyStepType[] = [
    "welcome", "mission", "think_first", "learn", "example",
    "practice", "quick_check", "reflect", "complete"
  ];

  for (const rt of requiredTypes) {
    if (uniqueTypes.includes(rt)) {
      available.push(rt);
    } else {
      missing.push(rt);
    }
  }

  // Count interactive moments (steps with interaction.type !== "none")
  let interactiveCount = 0;
  let hasIllustrationPrompts = true;
  let hasUnapprovedVideo = false;
  let practiceCount = 0;

  for (const step of journey) {
    if (step.interaction && step.interaction.type !== "none") {
      interactiveCount++;
    }
    if (!step.illustrationPrompt || step.illustrationPrompt.trim() === "") {
      hasIllustrationPrompts = false;
    }
    if (step.video?.required && !step.video?.approvedByAdmin) {
      hasUnapprovedVideo = true;
    }
    const vData = step.media?.video || step.video;
    if (vData && !vData.approvedByAdmin && (vData.suggestedUrl || vData.approvedUrl)) {
      hasUnapprovedVideo = true;
    }
    if (step.stepType === "practice") {
      practiceCount++;
    }
  }

  // Calculate score based on journey quality
  let score = 0;

  // Base: step count (up to 30 points for 8+ steps)
  score += Math.min(30, journey.length * 3);

  // Required types present (up to 30 points)
  score += Math.min(30, available.length * 3);

  // Interactive moments (up to 15 points, need at least 3)
  score += Math.min(15, interactiveCount * 5);

  // Practice steps (up to 10 points, need at least 2)
  score += Math.min(10, practiceCount * 5);

  // Illustration prompts (up to 10 points)
  if (hasIllustrationPrompts) score += 10;

  // Penalties
  if (hasUnapprovedVideo) {
    score -= 15;
    recommendations.push("Lesson has unapproved video. Approve or remove video before publishing.");
  }

  score = Math.max(0, Math.min(100, score));

  const isReady = score >= 60 && missing.length <= 2 && !hasUnapprovedVideo && interactiveCount >= 2;

  // Build recommendations
  if (isReady && missing.length === 0) {
    recommendations.unshift("✅ Approved journey is complete and ready to publish.");
  } else if (isReady && missing.length > 0) {
    recommendations.unshift(`✅ Approved journey is publishable. Missing optional steps: ${missing.join(", ")}.`);
  } else {
    recommendations.unshift("⚠️ Approved journey needs improvement before publishing.");
  }

  if (interactiveCount < 2) {
    recommendations.push(`Add more interactive moments (currently ${interactiveCount}, need at least 2).`);
  }
  if (practiceCount < 2) {
    recommendations.push(`Add more practice steps (currently ${practiceCount}, need at least 2).`);
  }
  if (!hasIllustrationPrompts) {
    recommendations.push("Add illustration prompts to all steps for better visual learning.");
  }
  if (journey.length < 8) {
    recommendations.push(`Journey has ${journey.length} steps. Aim for at least 10 steps for a complete experience.`);
  }

  return {
    score,
    isReady,
    availableSteps: available,
    missingSteps: missing,
    recommendations,
    hasApprovedJourney: true,
    hasDraftJourney,
    draftReviewStatus: reviewStatus,
    hasUnapprovedVideo,
  };
}

/**
 * Evaluate readiness based on CBC shell fields (no approved journey yet).
 */
function evaluateShellReadiness(
  blocks: any,
  hasDraftJourney: boolean,
  reviewStatus: string | null
): LessonReadiness {
  const curriculum = blocks.curriculum || {};
  const shell = blocks.lessonShell || {};

  const available: JourneyStepType[] = [];
  const missing: JourneyStepType[] = [];
  const recommendations: string[] = [];

  // Welcome is always available (generated from title)
  available.push("welcome");

  // Mission
  const learningGoal = curriculum.specificLearningOutcome || blocks.specificLearningOutcome || blocks.learningOutcome;
  if (learningGoal) {
    available.push("mission");
  } else {
    missing.push("mission");
    recommendations.push("Add a specific learning outcome so students know what they'll learn.");
  }

  // Think First
  const keyInquiry = curriculum.keyInquiryQuestion || blocks.keyInquiryQuestion;
  if (keyInquiry) {
    available.push("think_first");
  } else {
    missing.push("think_first");
    recommendations.push("Add a key inquiry question to spark curiosity.");
  }

  // Learn
  const suggestedExperience = curriculum.suggestedLearningExperience || blocks.suggestedLearningExperience;
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
  const example = shell.example || blocks.example || shell.workedExample || blocks.workedExample || shell.activityInstructions || blocks.activityInstructions;
  if (example) {
    available.push("example");
  } else {
    missing.push("example");
    recommendations.push("Add a worked example so students can see how it's done step by step.");
  }

  // Practice
  const tryContent = shell.activityInstructions || blocks.activityInstructions || shell.offlineActivity || blocks.offlineActivity;
  if (tryContent) {
    available.push("practice");
  } else {
    missing.push("practice");
    recommendations.push("Add activity instructions or an offline activity for hands-on practice.");
  }

  // Quick Check
  const assessment = shell.assessmentCriteria || blocks.assessmentCriteria || shell.assessmentMethod || blocks.assessmentMethod;
  if (assessment) {
    available.push("quick_check");
  } else {
    missing.push("quick_check");
    recommendations.push("Add assessment criteria or method to check understanding.");
  }

  // Reflect
  const reflection = shell.reflectionPrompt || blocks.reflectionPrompt;
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
  const score = Math.min(100, coreAvailable * 14 + bonusAvailable * 4);

  const isReady = score >= 70;

  if (hasDraftJourney && reviewStatus === "NEEDS_REVIEW") {
    recommendations.unshift("📝 AI journey draft generated — review and approve to make it student-visible.");
  } else if (isReady) {
    recommendations.unshift("Shell is complete — generate an AI journey draft to create the student experience.");
  } else if (score >= 42) {
    recommendations.unshift("Shell is almost complete — add missing fields, then generate a journey draft.");
  } else {
    recommendations.unshift("Shell needs more content before generating a journey draft.");
  }

  return {
    score,
    isReady,
    availableSteps: available,
    missingSteps: missing,
    recommendations,
    hasApprovedJourney: false,
    hasDraftJourney,
    draftReviewStatus: reviewStatus,
    hasUnapprovedVideo: false,
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

/** Safely parse contentBlocks — handles both JSON string and object */
function parseContentBlocks(contentBlocks: any): any {
  if (!contentBlocks) return {};
  if (typeof contentBlocks === "string") {
    try { return JSON.parse(contentBlocks); } catch { return {}; }
  }
  return contentBlocks;
}

/** Helper: Get the student journey from contentBlocks, with fallback */
export function getStudentJourney(contentBlocks: any): JourneyStep[] | null {
  const blocks = parseContentBlocks(contentBlocks);
  const approved = blocks.studentJourney;
  if (Array.isArray(approved) && approved.length > 0) return approved;
  return null;
}

/** Helper: Check if contentBlocks has an AI-generated draft */
export function hasAiDraft(contentBlocks: any): boolean {
  const blocks = parseContentBlocks(contentBlocks);
  const draft = blocks.studentJourneyDraft;
  return (Array.isArray(draft) && draft.length > 0) || (draft && Array.isArray(draft.steps) && draft.steps.length > 0);
}

/** Helper: Check if contentBlocks has an approved student journey */
export function hasApprovedJourney(contentBlocks: any): boolean {
  const blocks = parseContentBlocks(contentBlocks);
  const journey = blocks.studentJourney;
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
  const blocks = parseContentBlocks(contentBlocks);

  // 1. Check for AI-approved student journey first
  const aiJourney = getStudentJourney(blocks);
  if (aiJourney) {
    return { steps: aiJourney, source: "ai_journey" };
  }

  // 2. Check for old array contentBlocks
  if (Array.isArray(blocks)) {
    return {
      steps: convertLegacyBlocksToJourney(blocks, title),
      source: "legacy_array",
    };
  }

  // 3. Build from structured CBC fields
  try {
    const journey = buildJourneyFromCbcBlocks(lessonId, title, blocks, meta);
    return { steps: journey.steps, source: "cbc_fallback" };
  } catch {
    return { steps: [], source: "cbc_fallback" };
  }
}
