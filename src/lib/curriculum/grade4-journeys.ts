/**
 * Grade 4 Math Journey Transformer
 *
 * Converts Grade 4 Mathematics Sub-strand 1.1 content blocks
 * (from grade4-math.ts) into a studentJourney array that the
 * existing InteractiveStepRenderer can render.
 *
 * Architecture:
 *   grade4-math.ts (flat contentBlocks) → buildGrade4Journey()
 *   → studentJourney steps → InteractiveStepRenderer → learner experience
 *
 * Reuses the Grade 2 fractions journey model as the UX reference:
 *   welcome → mission → think_first → learn → connect → example
 *   → practice → quick_check → reflect → complete
 *
 * First-class for all grades/subjects — not Grade-4-specific logic
 * hard-coded in the renderer. The transformer is the subject-specific
 * layer; the renderer is the generic engine.
 */

import type { LessonTemplate, GeneratedContentBlock as ContentBlock } from "../../data/content-types";
export type { GeneratedContentBlock as ContentBlock } from "../../data/content-types";

// -- Journey step type (mirrors the Grade 2 studentJourney step shape) --------

export interface JourneyStep {
  id: string;
  stepType: string;
  title: string;
  studentText?: string;
  owlText?: string;
  studentInstruction?: string;
  content?: string;
  visualSpec?: {
    type?: string;
    parts?: number;
    shadedParts?: number;
    equalParts?: boolean;
    showLabels?: boolean;
    labels?: string[];
    orientation?: string;
    object?: string;
    highlightPart?: number;
    label?: string;
    items?: string[];
    steps?: Array<{ title: string; description?: string; visual?: Record<string, unknown> }>;
    choices?: Array<{
      id: string;
      label: string;
      description?: string;
      visual?: Record<string, unknown>;
    }>;
    icon?: string;
    sentenceStarter?: string;
    digits?: string[];
    highlightColumn?: number;
    showValues?: boolean;
    columns?: string[];
    rangeMin?: number;
    rangeMax?: number;
    tickInterval?: number;
    markers?: number[];
    markerValue?: number;
    markerLabel?: string;
  };
  interactionSpec?: {
    type?: string;
    prompt?: string;
    question?: string;
    buttonLabel?: string;
    choices?: string[];
    correctChoiceId?: string;
    correctIndex?: number;
    correctAnswer?: number | string;
    hint?: string;
    chips?: string[];
    sentenceStarter?: string;
    activities?: Array<{
      id: string;
      type: string;
      prompt?: string;
      question?: string;
      choices?: string[];
      options?: string[];
      correctChoiceId?: string;
      correctIndex?: number;
      hint?: string;
    }>;
  };
  feedbackSpec?: {
    correct?: string;
    incorrect?: string;
    hint?: string;
  };
  successCriteria?: string;
  rewardText?: string;
}

// -- Helpers ------------------------------------------------------------------

/** Extract text blocks from contentBlocks */
function textBlocks(blocks: ContentBlock[]): ContentBlock[] {
  return blocks.filter((b) => b.type === "text");
}

/** Extract quiz blocks */
function quizBlocks(blocks: ContentBlock[]): ContentBlock[] {
  return blocks.filter((b) => b.type === "quiz");
}

/** Extract experiment blocks */
function experimentBlocks(blocks: ContentBlock[]): ContentBlock[] {
  return blocks.filter((b) => b.type === "experiment");
}

/** Extract journal blocks */
function journalBlocks(blocks: ContentBlock[]): ContentBlock[] {
  return blocks.filter((b) => b.type === "journal");
}

/** Get the first text block's content, or a fallback */
function firstText(blocks: ContentBlock[]): string {
  const t = textBlocks(blocks)[0];
  return t?.data.content || "";
}

/** Get the second text block's content, or empty */
function secondText(blocks: ContentBlock[]): string {
  const t = textBlocks(blocks)[1];
  return t?.data.content || "";
}

/**
 * Build a place-value-chart visualSpec.
 * Automatically derives the correct columns from the digit count.
 * 4 digits → ["Thousands", "Hundreds", "Tens", "Ones"]
 * 5 digits → ["Ten Thousands", "Thousands", "Hundreds", "Tens", "Ones"]
 *
 * highlightColumn: left-based index (0 = most significant / leftmost)
 *   For ["4","7","2","9"]: 0=thousands(4), 1=hundreds(7), 2=tens(2), 3=ones(9)
 *   To highlight the 7 (hundreds), use highlightColumn=1
 */
export function pvVisual(
  digits: string[],
  highlightColumn?: number,
  showValues = false,
): Record<string, unknown> {
  // Derive columns from digit count (PlaceValueChart does this too, but we keep
  // the explicit columns for backward compatibility)
  const colCount = digits.length;
  const allColumns = ["Ten Thousands", "Thousands", "Hundreds", "Tens", "Ones"];
  const columns = allColumns.slice(5 - colCount);

  return {
    type: "place_value_chart",
    digits,
    highlightColumn,
    showValues,
    columns,
  };
}

/** Build a number-line visualSpec */
function nlVisual(
  rangeMin: number,
  rangeMax: number,
  tickInterval: number,
  markerValue?: number,
  markerLabel?: string,
): Record<string, unknown> {
  const markers: number[] = [];
  for (let v = rangeMin; v <= rangeMax; v += tickInterval) {
    markers.push(v);
  }
  return {
    type: "number_line",
    rangeMin,
    rangeMax,
    tickInterval,
    markers,
    markerValue: markerValue,
    markerLabel: markerLabel,
  };
}

/** Make a step_reveal visual from an array of { title, visual } */
function stepRevealVisual(steps: Array<{ title: string; visual: Record<string, unknown> }>): Record<string, unknown> {
  return {
    type: "step_reveal",
    steps: steps.map((s) => ({ title: s.title, visual: s.visual })),
  };
}

// -- Journey builders ---------------------------------------------------------

/**
 * Build the Place Value & Number Reading journey.
 *
 * Pilot lesson — designed as a high-quality learning experience
 * using the Grade 2 fractions journey as the UX reference.
 */
export function buildPlaceValueJourney(): JourneyStep[] {
  // ── Content from grade4-math.ts lesson1 (Place Value & Number Reading) ────
  // The Place Value lesson in grade4-math.ts has 2 text blocks, 2 quiz blocks,
  // 1 experiment, 1 journal. The content here mirrors that structure.
  // First text block content
  const firstTextContent =
    "Place value is the value of each digit in a number. It tells us what each digit is worth based on its position. In a 4-digit number, the positions are: ones, tens, hundreds, and thousands. For example, in the number 4,729, the 4 is in the thousands place and is worth 4,000. The 7 is in the hundreds place and is worth 700. The 2 is in the tens place and is worth 20. The 9 is in the ones place and is worth 9. We can write 4,729 in expanded form as: 4,000 + 700 + 20 + 9 = 4,729. Place value helps us read, write, and compare big numbers. It also helps us understand what each digit means in real life, like the number of people in a town or the price of an item at the market.";

  // Second text block content
  const secondTextContent =
    "In real life, numbers like 3,042 people in a town use place value. The 3 means 3,000 people, the 0 means no hundreds, the 4 means 4 tens (40), and the 2 means 2 ones. When we read 3,042 aloud, we say 'three thousand, forty-two.' Notice that we skip the zero hundreds. Place value helps us read big numbers correctly. For example, a school with 2,500 students has 2 thousands, 5 hundreds, 0 tens, and 0 ones. We read it as 'two thousand, five hundred.' Understanding place value makes it easier to work with big numbers every day.";

  // Quiz 1: "What does the digit 7 represent in the number 4,729?"
  const quiz1Question =
    "What does the digit 7 represent in the number 4,729?";
  const quiz1Options = [
    "7 ones",
    "7 tens",
    "7 hundreds",
    "7 thousands",
  ];
  const quiz1Correct = 2; // hundreds
  const quiz1Explanation =
    "The 7 is in the hundreds place, so it represents 700.";

  // Quiz 2: "Which number is read as 'three thousand, forty-two'?"
  const quiz2Question =
    "Which number is read as 'three thousand, forty-two'?";
  const quiz2Options = ["3,402", "3,042", "3,024", "3,240"];
  const quiz2Correct = 1; // 3,042
  const quiz2Explanation =
    "'Three thousand' = 3,000, 'forty-two' = 42. So the number is 3,042.";

  // Reuse existing quiz content for the quick_check step
  const quickCheckQuestion = quiz2Question;
  const quickCheckOptions = quiz2Options;

  return [
    // ── 1. Welcome ──────────────────────────────────────────────────────────
    {
      id: "welcome",
      stepType: "welcome",
      title: "Welcome to Place Value",
      studentText: firstTextContent,
      owlText:
        "Hello explorer! Today we're going to become number detectives. Every digit in a big number has a secret job — and you're going to discover what each one does!",
      studentInstruction: "Get ready to explore how numbers work.",
      interactionSpec: {
        type: "tap_continue",
        prompt: "Begin your place value journey",
        buttonLabel: "Start lesson",
        hint: "Each digit has a special place.",
      },
      visualSpec: pvVisual(["1", "2", "3", "4", "5"]),
      feedbackSpec: {
        hint: "Each digit has a special place.",
      },
      successCriteria: "Ready to explore place value.",
    },

    // ── 2. Mission ──────────────────────────────────────────────────────────
    {
      id: "mission",
      stepType: "mission",
      title: "Your Mission Today",
      studentText:
        "By the end of this lesson, you will be able to read big numbers, explain what each digit means, and write numbers in expanded form.",
      owlText:
        "Here is your mission! You will learn to decode numbers like a pro — reading them aloud, finding what each digit is worth, and breaking them into expanded form.",
      studentInstruction: "Your mission is to master place value by the end of this lesson.",
      interactionSpec: {
        type: "tap_continue",
        prompt: "Accept your mission to begin learning",
        buttonLabel: "Accept mission",
      },
      visualSpec: {
        type: "mission_preview",
        items: [
          "Read a 4-digit number aloud",
          "Tell what each digit represents",
          "Write a number in expanded form",
          "Compare big numbers",
        ],
      },
      feedbackSpec: {
        hint: "You will learn to read, explain, and build big numbers.",
      },
      successCriteria: "Understands the learning goals.",
    },

    // ── 3. Think First (prediction) ─────────────────────────────────────────
    // Reuses quiz 1's question as a prediction BEFORE teaching.
    {
      id: "think_first",
      stepType: "think_first",
      title: "What Do You Think?",
      studentText: "Look at the number 4,729. What does the digit 7 mean?",
      owlText:
        "Before we learn the answer, make your best guess. What do you think the 7 tells us about this number?",
      studentInstruction:
        "Read the number 4,729. Think about where the 7 sits. Then choose your answer.",
      interactionSpec: {
        type: "tap_choice",
        prompt: "What does the 7 represent in 4,729?",
        choices: [
          { id: "A", label: "7 ones", description: "7 × 1 = 7" },
          { id: "B", label: "7 tens", description: "7 × 10 = 70" },
          { id: "C", label: "7 hundreds", description: "7 × 100 = 700" },
          { id: "D", label: "7 thousands", description: "7 × 1,000 = 7,000" },
        ],
        correctChoiceId: "C",
        hint: "Look at which column the 7 is in on the chart.",
      },
      visualSpec: pvVisual(["4", "7", "2", "9"], /*highlightColumn=*/ 1, /*showValues=*/ true),
      feedbackSpec: {
        correct:
          "Yes! The 7 is in the hundreds place, so it represents 700. Excellent thinking!",
        incorrect:
          "Not quite. Look at the place value chart — which column is the 7 in?",
        hint: "The column name tells you the value: ones, tens, hundreds, thousands.",
      },
      successCriteria: "Makes a prediction about digit values.",
    },

    // ── 4. Learn (StepReveal — discover place value) ────────────────────────
    // Reuses first text block's concept, presented as a step-by-step reveal.
    {
      id: "learn",
      stepType: "learn",
      title: "Discover Place Value",
      studentText: firstTextContent,
      owlText:
        "Let me show you how it works. Watch carefully — each digit lives in a special place!",
      studentInstruction:
        "Tap Show me to see how each digit in 4,729 has a different value.",
      interactionSpec: {
        type: "step_reveal",
        prompt: "Show me",
        buttonLabel: "Show me",
        hint: "Each place is 10 times the place to its right.",
      },
      visualSpec: stepRevealVisual([
        {
          title: "Our number: 4,729",
          visual: pvVisual(["4", "7", "2", "9"], undefined, false),
        },
        {
          title: "The 4 is in the Thousands place — worth 4,000",
          visual: pvVisual(["4", "7", "2", "9"], /*highlightColumn=*/ 0, true),
        },
        {
          title: "The 7 is in the Hundreds place — worth 700",
          visual: pvVisual(["4", "7", "2", "9"], /*highlightColumn=*/ 1, true),
        },
        {
          title: "The 2 is in the Tens place — worth 20",
          visual: pvVisual(["4", "7", "2", "9"], /*highlightColumn=*/ 2, true),
        },
        {
          title: "The 9 is in the Ones place — worth 9",
          visual: pvVisual(["4", "7", "2", "9"], /*highlightColumn=*/ 3, true),
        },
        {
          title: "Expanded form: 4,000 + 700 + 20 + 9 = 4,729",
          visual: pvVisual(["4", "7", "2", "9"], undefined, true),
        },
      ]),
      feedbackSpec: {
        correct:
          "Perfect! You can see how each digit's place gives it its value. 4,729 = 4,000 + 700 + 20 + 9.",
        incorrect: "",
        hint: "Each place is 10 times the place to its right.",
      },
      successCriteria: "Understands how place value gives digits their value.",
    },

    // ── 5. Connect (real-life application) ──────────────────────────────────
    {
      id: "connect",
      stepType: "connect",
      title: "Place Value in Real Life",
      studentText: secondTextContent,
      owlText:
        "Numbers are everywhere! A school enrolment, a football attendance, a market price — all of them use place value. Let us see how.",
      studentInstruction:
        "A town has 3,042 people. Think about what each digit means in real life.",
      interactionSpec: {
        type: "tap_choice",
        prompt: "A town has 3,042 people. What does the 3 represent?",
        choices: [
          { id: "A", label: "3 people", description: "3 × 1 = 3" },
          { id: "B", label: "30 people", description: "3 × 10 = 30" },
          { id: "C", label: "300 people", description: "3 × 100 = 300" },
          { id: "D", label: "3,000 people", description: "3 × 1,000 = 3,000" },
        ],
        correctChoiceId: "D",
        hint: "The 3 is in the thousands place.",
      },
      visualSpec: pvVisual(["3", "0", "4", "2"], undefined, true),
      feedbackSpec: {
        correct:
          "Yes! The 3 is in the thousands place, so there are 3,000 people. Place value helps us read big numbers in real life.",
        incorrect:
          "Not quite. Look at the place value chart — which column is the 3 in?",
        hint: "The column name tells you the value.",
      },
      successCriteria: "Connects place value to a real-life situation.",
    },

    // ── 6. Example (StepReveal — reading a number aloud) ────────────────────
    {
      id: "example",
      stepType: "example",
      title: "How to Read 3,042 Aloud",
      studentText:
        "Read and write multi-digit whole numbers using base-ten numerals, number names, and expanded form. Compare two multi-digit numbers using >, =, and < symbols based on the meanings of the digits in each place.",
      owlText:
        "Let me show you how to read 3,042 out loud, step by step. Watch carefully!",
      studentInstruction:
        "Follow each step to see how we read 3,042 aloud.",
      interactionSpec: {
        type: "step_reveal",
        prompt: "Next step",
        buttonLabel: "Next step",
        hint: "Read the number in groups: thousands, then hundreds, then tens and ones.",
      },
      visualSpec: stepRevealVisual([
        {
          title: "Start with the thousands: 3 thousand",
          visual: pvVisual(["3", "0", "4", "2"], /*highlightColumn=*/ 0, true),
        },
        {
          title: "No hundreds — we skip it (0 hundreds)",
          visual: pvVisual(["3", "0", "4", "2"], /*highlightColumn=*/ 1, true),
        },
        {
          title: "42 in the tens and ones places",
          visual: pvVisual(["3", "0", "4", "2"], undefined, true),
        },
        {
          title: "Three thousand, forty-two!",
          visual: pvVisual(["3", "0", "4", "2"], undefined, true),
        },
      ]),
      feedbackSpec: {
        correct:
          "Excellent! You read 3,042 as 'three thousand, forty-two.' Notice how we skip the zero hundreds.",
        incorrect: "",
        hint: "Read the number in groups: thousands, then hundreds, then tens and ones.",
      },
      successCriteria: "Follows how to read a multi-digit number aloud.",
    },

    // ── 7. Practice (MultiActivity — hands on) ──────────────────────────────
    // Reuses experiment concept as guided practice activities.
    {
      id: "practice",
      stepType: "practice",
      title: "Your Turn",
      studentText:
        "Build numbers, write them in expanded form, and compare them. You can do this!",
      owlText:
        "Now it is your turn to practise. Try each activity — take your time and think about place value.",
      studentInstruction: "Complete each activity.",
      interactionSpec: {
        type: "multi_activity",
        prompt: "Complete each activity",
        hint: "Think about place value.",
        activities: [
          {
            id: "p1",
            type: "tap_choice",
            prompt: "Build the number: 2 thousands, 5 hundreds, 3 tens, 8 ones",
            choices: [
              { id: "A", label: "2,538", description: "2,000 + 500 + 30 + 8" },
              { id: "B", label: "2,358", description: "2,000 + 300 + 50 + 8" },
              { id: "C", label: "5,238", description: "5,000 + 200 + 30 + 8" },
              { id: "D", label: "2,583", description: "2,000 + 500 + 80 + 3" },
            ],
            correctChoiceId: "A",
            hint: "Put 2 in thousands, 5 in hundreds, 3 in tens, 8 in ones.",
          },
          {
            id: "p2",
            type: "multiple_choice",
            question: "What is 1,200 + 300 + 40 + 7?",
            options: [
              "1,247",
              "1,547",
              "1,347",
              "1,537",
            ],
            correctIndex: 1,
            hint: "Add each place: 1,200 + 300 = 1,500, + 40 = 1,540, + 7 = 1,547.",
          },
          {
            id: "p3",
            type: "tap_choice",
            prompt: "Which number is larger: 5,621 or 5,261?",
            choices: [
              { id: "A", label: "5,621", description: "6 hundreds > 2 hundreds" },
              { id: "B", label: "5,261", description: "2 hundreds > 6 hundreds" },
              { id: "C", label: "They are equal", description: "Both start with 5" },
            ],
            correctChoiceId: "A",
            hint: "Compare from left to right. Both have 5 thousands. 6 hundreds > 2 hundreds.",
          },
        ],
      },
      visualSpec: {
        type: "practice_set",
        items: [
          { id: "p1", type: "tap_choice", prompt: "Build a number from its parts" },
          { id: "p2", type: "multiple_choice", prompt: "Add expanded-form values" },
          { id: "p3", type: "tap_choice", prompt: "Compare two numbers using place value" },
        ],
      },
      feedbackSpec: {
        correct:
          "Well done! You built numbers, added expanded forms, and compared numbers like a place value pro!",
        incorrect: "Try again. Think about which place to compare first.",
        hint: "Think about place value — start from the left.",
      },
      successCriteria: "Practises building, adding, and comparing numbers.",
    },

    // ── 8. Quick Check ──────────────────────────────────────────────────────
    // Reuses quiz 2 as a quick check of understanding.
    {
      id: "quick_check",
      stepType: "quick_check",
      title: "Quick Check",
      studentText: quickCheckQuestion,
      owlText:
        "Let us check your understanding. Choose the correct answer.",
      studentInstruction: "Choose the best answer.",
      interactionSpec: {
        type: "multiple_choice",
        question: quickCheckQuestion,
        options: quickCheckOptions,
        correctIndex: quiz2Correct,
        hint: "Listen for 'forty-two' — that's 4 tens and 2 ones, with no hundreds.",
      },
      visualSpec: pvVisual(["3", "0", "4", "2"], undefined, true),
      feedbackSpec: {
        correct:
          "Correct! 3,042 is read as 'three thousand, forty-two.' You can read big numbers!",
        incorrect:
          "Not quite. Listen for the place values in the words: 'three thousand' = 3,000, 'forty-two' = 42.",
        hint: "Listen for 'forty-two' — that's 4 tens and 2 ones.",
      },
      successCriteria: "Identifies the correct number from its name.",
    },

    // ── 9. Reflect ──────────────────────────────────────────────────────────
    // Reuses the journal prompt as a reflection.
    {
      id: "reflect",
      stepType: "reflect",
      title: "Think About It",
      studentText:
        "Choose a 4-digit number from your daily life — a page number, a year, a bus number, a price. Break it down using place value and explain what each digit means.",
      owlText:
        "You have learned something important about how numbers work. Take a moment to reflect.",
      studentInstruction:
        "Think about what you discovered. Choose the ideas that match your learning.",
      interactionSpec: {
        type: "reflection_chips",
        prompt: "What did you discover about place value?",
        chips: [
          "Each place is 10 times the place to its right",
          "Zero means no amount in that place",
          "Expanded form shows each digit's value",
          "Reading big numbers is like reading in groups",
          "The position of a digit changes its value",
        ],
        sentenceStarter:
          "I used to think... but now I know...",
        hint: "Use the words 'place value,' 'digit,' and 'worth.'",
      },
      feedbackSpec: {
        correct:
          "Beautiful reflection. You now understand that place value is the secret code of big numbers.",
        incorrect:
          "Think about what changed in your understanding. Use words like 'place,' 'value,' and 'position.'",
        hint: "Use the words 'place value,' 'digit,' and 'worth.'",
      },
      successCriteria: "Explains understanding of place value.",
    },

    // ── 10. Complete ────────────────────────────────────────────────────────
    {
      id: "complete",
      stepType: "complete",
      title: "Lesson Complete!",
      studentText: "Today you learned about place value!",
      owlText:
        "Amazing work! You can now read big numbers, explain what each digit means, and write numbers in expanded form. You are a Place Value Pro!",
      studentInstruction: "You have completed the lesson.",
      interactionSpec: {
        type: "tap_continue",
        prompt: "Complete lesson",
        buttonLabel: "Finish lesson",
      },
      visualSpec: {
        type: "recap_checklist",
        items: [
          "Read 4,729 aloud: four thousand, seven hundred twenty-nine",
          "Tell what each digit means in a 4-digit number",
          "Write 4,729 in expanded form: 4,000 + 700 + 20 + 9",
          "Compare numbers using place value",
        ],
      },
      feedbackSpec: {
        correct:
          "You earned your Place Value Pro badge! Keep exploring numbers!",
        hint: "Great work on place value!",
      },
      successCriteria: "Completes the place value journey.",
      rewardText:
        "You earned your Place Value Pro badge for mastering place value!",
      mediaSpec: {
        type: "reward_animation",
        name: "Place Value Pro Badge",
        purpose: "Celebrate place value mastery",
      },
    },
  ];
}

/**
 * Generic Grade 4 journey builder — uses heuristics to transform
 * flat contentBlocks into a studentJourney. Used for lessons that
 * don't have a dedicated builder yet.
 */
export function buildGrade4Journey(blocks: ContentBlock[]): JourneyStep[] {
  const texts = textBlocks(blocks);
  const quizzes = quizBlocks(blocks);
  const experiments = experimentBlocks(blocks);
  const journals = journalBlocks(blocks);

  const steps: JourneyStep[] = [];

  // ── Welcome ──
  steps.push({
    id: "welcome",
    stepType: "welcome",
    title: "Welcome",
    studentText: firstText(blocks) || "In this lesson, you will explore an important math idea.",
    owlText: "Hello explorer! Today we are going to learn something new. Ready?",
    studentInstruction: "Look at what we will explore today.",
    interactionSpec: {
      type: "tap_continue",
      prompt: "Begin your learning journey",
      buttonLabel: "Start lesson",
    },
    visualSpec: {
      type: "mission_preview",
      items: ["Explore a new math idea", "Try some activities", "Show what you learned"],
    },
    feedbackSpec: { hint: "" },
    successCriteria: "Ready to learn.",
  });

  // ── Mission ──
  steps.push({
    id: "mission",
    stepType: "mission",
    title: "Your Mission",
    studentText:
      "By the end of this lesson, you will understand the math idea we are exploring and be able to use it.",
    owlText: "Here is your challenge! By the end, you will be able to explain what you learned.",
    studentInstruction: "Accept your mission.",
    interactionSpec: {
      type: "tap_continue",
      prompt: "Accept your mission to begin learning",
      buttonLabel: "Accept mission",
    },
    visualSpec: {
      type: "mission_preview",
      items: [
        "Explore the math idea",
        "Try the activities",
        "Complete the quick check",
        "Reflect on what you learned",
      ],
    },
    feedbackSpec: { hint: "" },
    successCriteria: "Understands the goal.",
  });

  // ── Think First (prediction from first quiz) ──
  if (quizzes.length > 0) {
    const q = quizzes[0];
    const choices = (q.data.options || []).map((opt, i) => ({
      id: String.fromCharCode(65 + i),
      label: opt,
      description: opt,
    }));
    const correctId =
      choices.length > (q.data.correctIndex ?? 0)
        ? choices[q.data.correctIndex].id
        : "A";

    steps.push({
      id: "think_first",
      stepType: "think_first",
      title: "What Do You Think?",
      studentText:
        "Before we learn the answer, make your best guess. What do you think?",
      owlText: "Make your best guess. We will check it together.",
      studentInstruction: "Choose the answer you think is right.",
      interactionSpec: {
        type: "tap_choice",
        prompt: q.data.question || "What do you think?",
        choices,
        correctChoiceId: correctId,
        hint: q.data.explanation || "Think carefully about the question.",
      },
      feedbackSpec: {
        correct: "Great prediction! Let us see if you are right.",
        incorrect: "Not quite — but that is why we are learning!",
        hint: q.data.explanation || "Think carefully.",
      },
      successCriteria: "Makes a prediction.",
    });
  }

  // ── Learn (from first text block) ──
  steps.push({
    id: "learn",
    stepType: "learn",
    title: "Learn",
    studentText: firstText(blocks) || "Here is what you need to know.",
    owlText: "Let me explain the important idea.",
    studentInstruction: "Read and understand the idea.",
    interactionSpec: {
      type: "tap_continue",
      prompt: "I understand",
      buttonLabel: "I understand",
    },
    feedbackSpec: { correct: "Good. Now let us try it.", hint: "" },
    successCriteria: "Understands the main idea.",
  });

  // ── Practice (from experiment blocks) ──
  if (experiments.length > 0) {
    const exp = experiments[0];
    const activitySteps = (exp.data.steps || []).map((step, i) => ({
      id: `exp-${i}`,
      type: "tap_choice" as const,
      prompt: step,
      choices: ["I did it!", "I need help"],
      correctChoiceId: "I did it!",
      hint: "",
    }));

    steps.push({
      id: "practice",
      stepType: "practice",
      title: "Your Turn",
      studentText: exp.data.title || "Try the activity.",
      owlText: "Now you try it. Follow the steps.",
      studentInstruction: "Follow each step.",
      interactionSpec: {
        type: "multi_activity",
        prompt: "Complete each step",
        activities: activitySteps,
      },
      visualSpec: {
        type: "practice_set",
        items: exp.data.steps?.map((s, i) => ({ id: `step-${i}`, type: "tap_continue", prompt: s })) || [],
      },
      feedbackSpec: {
        correct: "Well done! You completed the activity.",
        incorrect: "Try again.",
        hint: "",
      },
      successCriteria: "Completes the hands-on activity.",
    });
  }

  // ── Quick Check (from second quiz or first quiz if only one) ──
  const checkQuiz = quizzes.length > 1 ? quizzes[1] : quizzes[0];
  if (checkQuiz) {
    const opts = checkQuiz.data.options || [];
    const correctIdx = checkQuiz.data.correctIndex ?? 0;
    steps.push({
      id: "quick_check",
      stepType: "quick_check",
      title: "Quick Check",
      studentText: checkQuiz.data.question || "Quick check!",
      owlText: "Let us check what you learned.",
      studentInstruction: "Choose the best answer.",
      interactionSpec: {
        type: "multiple_choice",
        question: checkQuiz.data.question || "Quick check!",
        options: opts,
        correctIndex: correctIdx,
        hint: checkQuiz.data.explanation || "Think about what you learned.",
      },
      feedbackSpec: {
        correct: "Correct! You know this.",
        incorrect: "Not quite — review the lesson and try again.",
        hint: checkQuiz.data.explanation || "Think about the lesson.",
      },
      successCriteria: "Shows understanding.",
    });
  }

  // ── Reflect (from journal block) ──
  if (journals.length > 0) {
    const j = journals[0];
    steps.push({
      id: "reflect",
      stepType: "reflect",
      title: "Think About It",
      studentText: j.data.prompt || "Reflect on what you learned.",
      owlText: "Take a moment to reflect on what you learned.",
      studentInstruction: "Write your reflection.",
      interactionSpec: {
        type: "reflection_chips",
        prompt: j.data.prompt || "What did you learn?",
        chips: ["I learned something new", "I can explain it", "I want to learn more"],
        sentenceStarter: "I learned that...",
        hint: "Use your own words.",
      },
      feedbackSpec: {
        correct: "Great reflection!",
        incorrect: "Think about what you learned.",
        hint: "Use your own words.",
      },
      successCriteria: "Reflects on learning.",
    });
  }

  // ── Complete ──
  steps.push({
    id: "complete",
    stepType: "complete",
    title: "Lesson Complete",
    studentText: "You completed this lesson!",
    owlText: "Great work! You learned something new today.",
    studentInstruction: "Collect your reward.",
    interactionSpec: {
      type: "tap_continue",
      prompt: "Complete lesson",
      buttonLabel: "Finish lesson",
    },
    visualSpec: {
      type: "recap_checklist",
      items: [
        "Explored the math idea",
        "Tried the activities",
        "Completed the quick check",
        "Reflected on learning",
      ],
    },
    feedbackSpec: {
      correct: "You completed the lesson! Great work!",
      hint: "Amazing learning today!",
    },
    successCriteria: "Finishes the lesson.",
    rewardText: "You completed the lesson and earned XP!",
    mediaSpec: {
      type: "reward_animation",
      name: "Learning Complete",
      purpose: "Celebrate lesson completion",
    },
  });

  return steps;
}

// -- Detection + routing (consumed by student-view page) ------------------------

const GRADE_4_MATH_LESSON_TITLES = [
  "Place Value and Number Reading",
  "Ordering and Rounding",
  "Factors, Multiples and Even/Odd Numbers",
  "Number Patterns",
  "Roman Numerals",
  "Numbers in Real Life",
] as const;

/**
 * Returns true if the legacy contentBlocks array looks like Grade 4
 * Mathematics content (has the characteristic mix of text + quiz +
 * experiment + journal blocks that Grade 4 Math lessons use).
 */
export function isGrade4MathContent(blocks: ContentBlock[]): boolean {
  if (!Array.isArray(blocks) || blocks.length === 0) return false;
  const types = new Set(blocks.map((b) => b.type));
  // Grade 4 Math lessons have text + quiz + journal blocks.
  // Some also have experiments, but not all — the core trio is sufficient
  // to distinguish them from other legacy content (e.g. Grade 2 fractions
  // uses a different block structure with studentJourney arrays, not flat blocks).
  return (
    types.has("text") &&
    types.has("quiz") &&
    types.has("journal")
  );
}

/**
 * Build a Grade 4 journey from legacy contentBlocks.
 * Routes to the dedicated builder for the Place Value lesson when
 * the lesson title matches; otherwise uses the generic builder.
 */
export function buildGrade4JourneyFromBlocks(
  blocks: ContentBlock[],
  lessonTitle?: string,
): JourneyStep[] {
  // Route to the dedicated Place Value builder when we can identify it
  if (lessonTitle === "Place Value and Number Reading") {
    return buildPlaceValueJourney();
  }
  // Generic builder for all other Grade 4 Math lessons
  return buildGrade4Journey(blocks);
}
