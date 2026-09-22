// @ts-nocheck
// Grade 4 Mathematics — Batch 1 Pilot: Sub-strand 1.1 Whole Numbers only
// Traceable to KICD Grade 4 Mathematics Curriculum Design (Revised 2024)
// Every SLO has exactly ONE primary instructional owner.
import type { QuestGroup, GeneratedContentBlock } from "./content-types";
import { gradeConfig } from "./content-types";
const G4 = gradeConfig[4];
let blockIdCounter = 5000;
function blockId(): string { return `blk_${++blockIdCounter}`; }
function textBlock(content: string): GeneratedContentBlock {
  return { id: blockId(), type: "text", data: { content } };
}
function quizBlock(question: string, options: string[], correctIndex: number, explanation: string): GeneratedContentBlock {
  return { id: blockId(), type: "quiz", data: { question, options, correctIndex, explanation } };
}
function experimentBlock(title: string, materials: string[], steps: string[]): GeneratedContentBlock {
  return { id: blockId(), type: "experiment", data: { title, materials, steps } };
}
function journalBlock(prompt: string): GeneratedContentBlock {
  return { id: blockId(), type: "journal", data: { prompt, placeholder: "Write your answer..." } };
}
function generateXp(base: number): { base: number } {
  return { base: Math.round(base * G4.xpMultiplier) };
}
// ─── SLO 1.1-a,b,c: Place Value and Number Reading ──────────────────────────
const lesson1 = {
  topic: {} as any,
  title: "Place Value and Number Reading",
  slug: "place-value-number-reading",
  description: "Understand place value up to tens of thousands, read and write numbers in symbols and words",
  contentBlocks: [
    textBlock("Numbers can be big! 🔢 Today we'll learn about place value — what each digit in a number really means. We'll go up to tens of thousands (10,000)!\n\nLook at the number 4,273:\n- The 4 is in the THOUSANDS place — it means 4,000\n- The 2 is in the HUNDREDS place — it means 200\n- The 7 is in the TENS place — it means 70\n- The 3 is in the ONES place — it means 3\n\nWe can write: 4,273 = 4,000 + 200 + 70 + 3\n\nThis is called EXPANDED FORM!\n\nNow let's try a bigger number — in the TENS OF THOUSANDS:\n\nLook at the number 25,608:\n- The 2 is in the TEN-THOUSANDS place — it means 20,000\n- The 5 is in the THOUSANDS place — it means 5,000\n- The 6 is in the HUNDREDS place — it means 600\n- The 0 is in the TENS place — it means 0 (the zero still holds the place!)\n- The 8 is in the ONES place — it means 8\n\nWe can write: 25,608 = 20,000 + 5,000 + 600 + 0 + 8\n\nNotice the zero — it keeps the other digits in their correct places."),
    textBlock("Let's practice reading numbers in SYMBOLS (digits).\n\nExamples:\n- 5,821 — read as \"five thousand eight hundred twenty-one\"\n- 9,046 — read as \"nine thousand forty-six\"\n- 3,700 — read as \"three thousand seven hundred\"\n\nNotice: when there's a 0 in a place, we skip that name!\n\nNow try reading these in symbols:\n- 6,152\n- 8,903\n- 2,467\n\nNow let's go the OTHER WAY — from words back to digits (writing numbers in symbols).\n\nExample: \"four thousand two hundred seventy-three\" → write the digits:\n- \"four thousand\" → 4,000\n- \"two hundred\" → 200\n- \"seventy\" → 70\n- \"three\" → 3\n- Put them together: 4,273\n\nExample: \"nine thousand sixty-five\" →\n- \"nine thousand\" → 9,000\n- \"sixty\" → 60\n- \"five\" → 5\n- Answer: 9,065\n\nYou use this when someone tells you a number and you need to write it down!\n\nFor example, if a market trader says a bag of maize costs \"three thousand one hundred shillings,\" you need to write 3,100 so you can keep a record of what you paid.\n\nNow YOU try writing these in symbols:\n- \"three thousand one hundred forty-two\" →\n- \"seven thousand fifty\" →\n- \"one thousand nine hundred\" →"),
    quizBlock("Write the number in symbols: \"four thousand two hundred seventy-three\"",
      ["4,273", "4,237", "4,723", "47,230"],
      0,
      "four thousand = 4,000; two hundred = 200; seventy-three = 73; together: 4,273 ✓)"),
    quizBlock("How do you read 6,152 in words?",
      ["six thousand one hundred fifty-two", "six thousand fifty-two",
       "sixty-one thousand fifty-two", "six thousand one hundred twelve"],
      0,
      "6,152 = 6,000 + 100 + 50 + 2 = six thousand one hundred fifty-two ✓"),
    textBlock("Now let's practice reading numbers in WORDS. This means writing the number using letters instead of digits.\n\nExamples:\n- 345 — read as \"three hundred forty-five\"\n- 726 — read as \"seven hundred twenty-six\"\n- 950 — read as \"nine hundred fifty\"\n- 1,000 — read as \"one thousand\"\n\nNotice: For numbers up to 1,000:\n- The first digit (hundreds) tells us how many hundreds\n- The middle digit (tens) tells us how many tens\n- The last digit (ones) tells us how many ones\n\nTry reading these in words:\n- 423\n- 809\n- 127\n- 660\n- 1,000\n\nNow let's practice the OTHER direction — READING numbers that are already in words, and writing them as digits.\n\nExample: \"six hundred twelve\" → write as digits:\n- \"six hundred\" → 600\n- \"twelve\" → 12\n- Put them together: 612\n\nExample: \"eight hundred four\" →\n- \"eight hundred\" → 800\n- \"four\" → 4\n- Answer: 804\n\nExample: \"three hundred ninety\" →\n- \"three hundred\" → 300\n- \"ninety\" → 90\n- Answer: 390\n\nYou use this in day to day activities — like when you read a price tag that says \"three hundred shillings\" and need to understand it is 300!\n\nNow YOU try reading these in words and writing them as digits:\n- \"five hundred thirty\" →\n- \"two hundred seven\" →\n- \"nine hundred\" →"),

    quizBlock("Read this number in words and write it in digits: \"seven hundred twenty-six\"",
      ["726", "7,226", "7206", "7,026"],
      0,
      "seven hundred = 700; twenty-six = 26; together: 726 ✓)"),
    quizBlock("How do you write 530 in words?",
      ["five hundred thirty", "five hundred three",
       "five thousand thirty", "fifty-three"],
      0,
      "530 = 500 + 30, so it is five hundred thirty ✓"),
    quizBlock("What is the place value of 7 in 4,729?",
      ["7 ones", "7 tens", "7 hundreds", "7 thousands"],
      2,
      "In 4,729, the 7 is in the hundreds place — it means 700!"),
    journalBlock("Write a 4-digit number. Show its expanded form. Example: 3,521 = 3,000 + 500 + 20 + 1"),
  ],
  xpReward: generateXp(40),
  difficulty: { complexityScore: 2, cognitiveLevel: "understand", prerequisiteLoad: 1, abstractness: 2 },
  cbcMapping: {
    subjects: ["Mathematics"],
    strands: { mathematics: ["Numbers"] },
    subStrands: { mathematics: ["1.1 Whole Numbers: Place value and total value of digits up to tens of thousands"] },
    specificLearningOutcomes: [
      "ARIZEN-INT-1.1-a: use place value and total value of digits up to tens of thousands in daily life situations",
      "ARIZEN-INT-1.1-b: read and write numbers up to 10,000 in symbols in real life situations",
      "ARIZEN-INT-1.1-c: read and write numbers up to 1,000 in words in day to day activities"
    ],
    coreCompetencies: ["critical_thinking", "learning_to_learn"],
    coreValues: ["responsibility"],
    pertinentContemporaryIssues: [],
    difficultyLevel: 2,
    cognitiveLevel: "understand"
  }
};
// ─── SLO 1.1-d,e: Ordering and Rounding ─────────────────────────────────────
const lesson2 = {
  topic: {} as any,
  title: "Ordering and Rounding",
  slug: "ordering-rounding",
  description: "Order numbers up to 1,000 and round off to the nearest ten",
  contentBlocks: [
    textBlock("Numbers can be compared and ordered! 📊\n\nTo ORDER numbers (put them from smallest to largest or largest to smallest), compare digit by digit.\n\nExample: Order 345, 521, 298, 476 from smallest to largest.\n\nStep 1: Look at the HUNDREDS digit:\n- 345 → 3 hundreds\n- 521 → 5 hundreds\n- 298 → 2 hundreds\n- 476 → 4 hundreds\n\nStep 2: 298 has the smallest hundreds (2), so it's the smallest.\nThen 345 (3), then 476 (4), then 521 (5).\n\nAnswer: 298, 345, 476, 521 ✓"),
    textBlock("ROUNDING OFF means making a number simpler while keeping it close to the original.\n\nTo round to the NEAREST TEN:\n- Look at the ONES digit\n- If it's 0, 1, 2, 3, or 4 → keep the tens digit, change ones to 0\n- If it's 5, 6, 7, 8, or 9 → add 1 to the tens digit, change ones to 0\n\nExamples:\n- 237 → ones digit is 7 (5 or more) → round up → 240\n- 462 → ones digit is 2 (less than 5) → round down → 460\n- 855 → ones digit is 5 → round up → 860\n\nRounding helps us estimate! 💭"),
    experimentBlock("Rounding Practice",
      ["paper", "pencil", "10 small objects (beans or buttons)"],
      [
        "Write 5 numbers between 100 and 999",
        "For each number, circle the ones digit",
        "Decide: round up or round down?",
        "Write the rounded number (nearest ten)",
        "Check with a friend — did you get the same answer?"
      ]),
    quizBlock("Round 384 to the nearest ten.",
      ["380", "390", "384", "385"],
      0,
      "384 → ones digit is 4 (less than 5) → round down → 380 ✓"),
    quizBlock("Order these numbers from SMALLEST to LARGEST: 742, 269, 903, 415",
      ["269, 415, 742, 903", "742, 903, 415, 269", "269, 742, 415, 903", "415, 269, 742, 903"],
      0,
      "Compare hundreds: 269 (2 hundreds) < 415 (4 hundreds) < 742 (7 hundreds) < 903 (9 hundreds) → 269, 415, 742, 903 ✓"),
    quizBlock("Order these numbers from LARGEST to SMALLEST: 528, 316, 804, 199",
      ["804, 528, 316, 199", "199, 316, 528, 804", "804, 316, 528, 199", "528, 804, 316, 199"],
      0,
      "Compare hundreds: 804 (8 hundreds) > 528 (5 hundreds) > 316 (3 hundreds) > 199 (1 hundred) → 804, 528, 316, 199 ✓"),
    journalBlock("Think of a real situation where rounding helps — like counting money or people. Write about it!"),
  ],
  xpReward: generateXp(40),
  difficulty: { complexityScore: 2, cognitiveLevel: "apply", prerequisiteLoad: 2, abstractness: 2 },
  cbcMapping: {
    subjects: ["Mathematics"],
    strands: { mathematics: ["Numbers"] },
    subStrands: { mathematics: ["1.1 Whole Numbers: Ordering and rounding off numbers up to 1,000"] },
    specificLearningOutcomes: [
      "ARIZEN-INT-1.1-d: order numbers up to 1,000 in different situations",
      "ARIZEN-INT-1.1-e: round off numbers up to 1,000 to the nearest ten in different situations"
    ],
    coreCompetencies: ["critical_thinking", "creativity"],
    coreValues: ["responsibility"],
    pertinentContemporaryIssues: [],
    difficultyLevel: 2,
    cognitiveLevel: "apply"
  }
};
// ─── SLO 1.1-f,g,h: Factors, Multiples and Even/Odd Numbers ─────────────────
const lesson3 = {
  topic: {} as any,
  title: "Factors, Multiples and Even/Odd Numbers",
  slug: "factors-multiples-even-odd",
  description: "Identify factors of numbers up to 50, multiples up to 100, and use even and odd numbers",
  contentBlocks: [
    textBlock("FACTORS are numbers that divide exactly into another number.\n\nLet's find the factors of 12:\n- 1 × 12 = 12 ✓\n- 2 × 6 = 12 ✓\n- 3 × 4 = 12 ✓\n- 4 × 3 = 12 (already found!)\n\nSo the factors of 12 are: 1, 2, 3, 4, 6, 12\n\nWhat about 15?\n- 1 × 15 = 15 ✓\n- 3 × 5 = 15 ✓\n\nFactors of 15: 1, 3, 5, 15\n\nEvery number has at least 2 factors: 1 and itself!\n\nReal life: Imagine you have 24 chairs to arrange in equal rows\nfor a school assembly. How many rows can you make?\nYou need the factors of 24!\nThe factors of 24 are 1, 2, 3, 4, 6, 8, 12, 24.\nSo you can have 1 row of 24, 2 rows of 12, 3 rows of 8,\n4 rows of 6, 6 rows of 4, 8 rows of 3, 12 rows of 2, or 24 rows of 1.\n\nTry it with 18 chairs - the factors of 18 are 1, 2, 3, 6, 9, 18."),
    textBlock("MULTIPLES are what you get when you multiply a number by 1, 2, 3, 4, 5...\n\nMultiples of 5: 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, ...\nMultiples of 7: 7, 14, 21, 28, 35, 42, 49, 56, 63, 70, ...\n\nNotice: multiples go on forever! That's why we often say \"multiples up to 100\" or \"multiples up to 1,000\".\n\nMultiples of 10 up to 100: 10, 20, 30, 40, 50, 60, 70, 80, 90, 100\n\nHow to CHECK if a number is a multiple:\nDivide it by the number you're checking.\nIf the answer is a whole number with nothing left over, it IS a multiple!\n\nIs 48 a multiple of 6? 48 ÷ 6 = 8 with nothing left over\n- yes, 48 IS a multiple of 6 ✓\nIs 50 a multiple of 6? 50 ÷ 6 = 8 with 2 left over\n- no, 50 is NOT a multiple of 6 ✗\n\nReal life: A bus comes every 15 minutes.\nWill a bus arrive at 45 minutes past the hour?\n45 ÷ 15 = 3, so yes!\nBut what about 50 minutes? 50 ÷ 15 = 3 remainder 5,\nso no bus at exactly 50 minutes."),
    textBlock("EVEN and ODD numbers are easy to spot!\n\nEVEN numbers end in: 0, 2, 4, 6, 8\nExamples: 2, 14, 36, 78, 100\n\nODD numbers end in: 1, 3, 5, 7, 9\nExamples: 1, 13, 45, 87, 99\n\nQuick trick: Look at the ONES digit only!\n- 57 → ends in 7 → ODD\n- 84 → ends in 0 → EVEN\n- 99 → ends in 9 → ODD\n\nEven numbers can be shared equally between 2 people. Odd numbers always leave 1 leftover!"),
    quizBlock("Which of these is a FACTOR of 24?",
      ["7", "9", "8", "13"],
      2,
      "8 × 3 = 24, so 8 is a factor of 24! ✓"),
    quizBlock("Which number is ODD?",
      ["42", "68", "97", "24"],
      2,
      "97 ends in 7, so it's ODD! ✓"),
    journalBlock("List the factors of 18. Then list the first 5 multiples of 6. Check your answers with a friend!"),
    textBlock("Try listing them on your own first! The quiz below will check your answers — only look after you've had a go."),
    quizBlock("What are the factors of 18?",
      ["1, 2, 3, 6, 9, 18", "1, 2, 6, 9", "2, 3, 6, 9", "1, 3, 6, 18"],
      0,
      "18 ÷ 1 = 18, 18 ÷ 2 = 9, 18 ÷ 3 = 6, 18 ÷ 6 = 3, 18 ÷ 9 = 2, 18 ÷ 18 = 1. Factors of 18: 1, 2, 3, 6, 9, 18 ✓"),
    quizBlock("What are the first 5 multiples of 6?",
      ["6, 12, 18, 24, 30", "6, 12, 18, 24, 36", "12, 18, 24, 30, 36", "6, 18, 24, 30, 36"],
      0,
      "6 × 1 = 6, 6 × 2 = 12, 6 × 3 = 18, 6 × 4 = 24, 6 × 5 = 30. First 5 multiples of 6: 6, 12, 18, 24, 30 ✓"),  ],
  xpReward: generateXp(45),
  difficulty: { complexityScore: 3, cognitiveLevel: "understand", prerequisiteLoad: 2, abstractness: 2 },
  cbcMapping: {
    subjects: ["Mathematics"],
    strands: { mathematics: ["Numbers"] },
    subStrands: { mathematics: ["1.1 Whole Numbers: Factors, multiples, and even/odd numbers up to 1,000"] },
    specificLearningOutcomes: [
      "ARIZEN-INT-1.1-f: identify factors of numbers up to 50 in different contexts",
      "ARIZEN-INT-1.1-g: identify multiples of numbers up to 100 in different situations",
      "ARIZEN-INT-1.1-h: use even and odd numbers up to 100 in different situations"
    ],
    coreCompetencies: ["critical_thinking", "learning_to_learn"],
    coreValues: ["responsibility"],
    pertinentContemporaryIssues: [],
    difficultyLevel: 3,
    cognitiveLevel: "understand"
  }
};
// ─── SLO 1.1-i: Number Patterns ──────────────────────────────────────────────
const lesson4 = {
  topic: {} as any,
  title: "Number Patterns",
  slug: "number-patterns",
  description: "Create and identify patterns using even and odd numbers in real life",
  contentBlocks: [
    textBlock("Patterns are everywhere! 🔄 In numbers, patterns help us predict what comes next. Let's explore patterns with EVEN and ODD numbers — these are the most common number patterns in real life.\n\nLet's look at patterns with EVEN numbers:\n2, 4, 6, 8, 10, 12, 14, 16, ...\nRule: Add 2 each time (skip counting by 2)\n\nPatterns with ODD numbers:\n1, 3, 5, 7, 9, 11, 13, 15, ...\nRule: Add 2 each time (skip counting by 2, starting from 1)\n\nMixed pattern:\n1, 2, 3, 4, 5, 6, 7, 8, ...\nRule: Add 1 each time (counting)\n\nPatterns with MULTIPLES (extension):\n3, 6, 9, 12, 15, 18, ...\nRule: Multiples of 3 (add 3 each time) — notice all multiples of 3 are alternately odd and even!"),
    textBlock("TRY THESE PATTERNS:\n\nPattern 1: 4, 8, 12, 16, __, __, __\nRule: Multiples of 4 (add 4)\nAnswer: 20, 24, 28\n\nPattern 2: 5, 10, 15, 20, __, __, __\nRule: Multiples of 5 (add 5)\nAnswer: 25, 30, 35\n\nPattern 3: 10, 12, 14, 16, __, __, __\nRule: Even numbers — add 2 each time\nAnswer: 18, 20, 22\n\nPattern 4: 1, 3, 5, 7, __, __, __\nRule: Odd numbers — add 2 each time\nAnswer: 9, 11, 13\n\nPattern 5: 2, 4, 8, 16, __, __, __\nRule: Double each time (multiply by 2) — all results are even!\nAnswer: 32, 64, 128! Wow, that grows fast!"),
    experimentBlock("Pattern Detective",
      ["paper", "pencil", "100-bead string or number line (optional)"],
      [
        "Look around your classroom or home — find 3 patterns (tiles, windows, fence, etc.)",
        "Write down the pattern you see",
        "Create a number pattern with at least 6 numbers",
        "Write the rule for your pattern",
        "Give your pattern to a friend and see if they can find the next 3 numbers!"
      ]),
    quizBlock("What is the next number in this pattern: 6, 12, 18, 24, __?",
      ["28", "30", "32", "26"],
      1,
      "Multiples of 6: add 6 each time. 24 + 6 = 30 ✓"),
    journalBlock("Write a number pattern from real life. Example: bus stop arrivals every 10 minutes: 6:00, 6:10, 6:20, 6:30... What's the rule?")
  ],
  xpReward: generateXp(40),
  difficulty: { complexityScore: 2, cognitiveLevel: "create", prerequisiteLoad: 2, abstractness: 2 },
  cbcMapping: {
    subjects: ["Mathematics"],
    strands: { mathematics: ["Numbers"] },
    subStrands: { mathematics: ["1.1 Whole Numbers: Making patterns involving even and odd numbers"] },
    specificLearningOutcomes: [
      "ARIZEN-INT-1.1-i: make patterns involving even and odd numbers in real life situations"
    ],
    coreCompetencies: ["critical_thinking", "creativity"],
    coreValues: ["responsibility"],
    pertinentContemporaryIssues: [],
    difficultyLevel: 2,
    cognitiveLevel: "create"
  }
};
// ─── SLO 1.1-j: Roman Numerals ────────────────────────────────────────────────
const lesson5 = {
  topic: {} as any,
  title: "Roman Numerals",
  slug: "roman-numerals",
  description: "Represent Hindu Arabic numerals using Roman numerals up to X (10)",
  contentBlocks: [
    textBlock("ROMAN NUMERALS are a different way of writing numbers! 🏛️ The ancient Romans used letters instead of digits.\n\nHere are the basic Roman numerals:\n- I = 1\n- V = 5\n- X = 10\n\nRules:\n1. When a smaller letter comes BEFORE a bigger one, SUBTRACT\n   - IV = 5 - 1 = 4\n   - IX = 10 - 1 = 9\n2. When a smaller letter comes AFTER a bigger one, ADD\n   - VI = 5 + 1 = 6\n   - XI = 10 + 1 = 11 (but we only go up to X = 10 in Grade 4)\n3. Never use more than 3 of the same letter in a row\n   - 3 = III ✓\n   - 4 = IV (not IIII!) ✓"),
    textBlock("Let's practice! Converting from HINDU ARABIC (our numbers) to ROMAN:\n\n1 → I\n2 → II\n3 → III\n4 → IV (5 - 1)\n5 → V\n6 → VI (5 + 1)\n7 → VII (5 + 2)\n8 → VIII (5 + 3)\n9 → IX (10 - 1)\n10 → X\n\nNow try converting ROMAN to HINDU ARABIC:\n- III = 3\n- VI = 6\n- IX = 9\n- IV = 4\n- VII = 7"),
    quizBlock("What is the Roman numeral for 4?",
      ["IIII", "IV", "VI", "IX"],
      1,
      "4 = IV (5 - 1). We never write IIII — that's 4 I's, which breaks the rule! ✓"),
    quizBlock("What number is IX?",
      ["4", "5", "8", "9"],
      3,
      "IX = 10 - 1 = 9 ✓"),
    journalBlock("Where have you seen Roman numerals in real life? (Clocks, movie credits, building dates, chapter numbers...) Write 3 examples!")
  ],
  xpReward: generateXp(40),
  difficulty: { complexityScore: 2, cognitiveLevel: "apply", prerequisiteLoad: 2, abstractness: 2 },
  cbcMapping: {
    subjects: ["Mathematics"],
    strands: { mathematics: ["Numbers"] },
    subStrands: { mathematics: ["1.1 Whole Numbers: Representing Hindu Arabic numerals using Roman numerals up to X"] },
    specificLearningOutcomes: [
      "ARIZEN-INT-1.1-j: represent Hindu Arabic numerals using Roman numerals up to 'X' in different situations"
    ],
    coreCompetencies: ["critical_thinking", "communication"],
    coreValues: ["responsibility"],
    pertinentContemporaryIssues: [],
    difficultyLevel: 2,
    cognitiveLevel: "apply"
  }
};
// ─── SLO 1.1-k: SideQuest — Numbers in Real Life (Affective) ────────────────
const sideQuest = {
  id: "g4-math-1.1-appreciation",
  title: "Numbers in Real Life",
  slug: "numbers-in-real-life",
  description: "Explore how whole numbers show up in everyday life — a SideQuest for appreciation",
  orderIndex: 6,
  questType: "SIDE",
  theme: "g4-math-whole-numbers",
  grade: 4,
  subjects: ["Mathematics"],
  xpReward: generateXp(60),
  cbcMapping: {
    subjects: ["Mathematics"],
    strands: ["Numbers"],
    subStrands: ["1.1 Whole Numbers"],
    specificLearningOutcomes: [
      "ARIZEN-INT-1.1-k: appreciate use of whole numbers in real life situations"
    ],
    coreCompetencies: ["critical_thinking", "communication"],
    coreValues: ["responsibility"],
    pertinentContemporaryIssues: []
  },
  lessons: [
    {
      topic: {} as any,
      title: "Whole Numbers Around Us",
      slug: "whole-numbers-around-us",
      description: "Discover and appreciate how whole numbers are used in daily life",
      contentBlocks: [
        textBlock("Numbers are all around us — every day, everywhere! 🌍\n\nThink about your day this morning:\n- What time did you wake up? (7:00 — that's a number!)\n- How many spoons of sugar in your tea? (Maybe 2?)\n- How many people live in your house? (A number!)\n- How many shillings did your parent give you for lunch? (A number!)\n\nWhole numbers help us COUNT, MEASURE, COMPARE, and ORDER things in real life.\n\nWithout numbers, we couldn't:\n- Know how many items to buy at the shop\n- Tell the time\n- Know our age\n- Count money\n- Share things fairly\n- Know which bus to take\n- Keep score in a game"),
        experimentBlock("Number Hunt",
          ["paper", "pencil", "a market or shop nearby (or picture of one)"],
          [
            "Go to a shop/market OR look at a shop advertisement",
            "Find 5 things with numbers on them (price, weight, quantity, date, phone number)",
            "Write down each number and what it tells us",
            "Draw or describe the items",
            "Share your finds with the class — how many different ways did numbers help?"
          ]),
        journalBlock("Write about a time when numbers helped you solve a real problem. Maybe you counted money, measured ingredients, or checked the time. Tell the story!")
      ],
      xpReward: generateXp(60),
      difficulty: { complexityScore: 1, cognitiveLevel: "evaluate", prerequisiteLoad: 3, abstractness: 2 },
      cbcMapping: {
        subjects: ["Mathematics"],
        strands: { mathematics: ["Numbers"] },
        subStrands: { mathematics: ["1.1 Whole Numbers: Appreciating use of whole numbers in real life situations"] },
        specificLearningOutcomes: [
          "ARIZEN-INT-1.1-k: appreciate use of whole numbers in real life situations"
        ],
        coreCompetencies: ["critical_thinking", "communication"],
        coreValues: ["responsibility"],
        pertinentContemporaryIssues: [],
        difficultyLevel: 1,
        cognitiveLevel: "evaluate"
      }
    }
  ]
};
// ─── Quest (MAIN) ─────────────────────────────────────────────────────────────
const wholeNumbersQuest: QuestGroup = {
  id: "g4-math-whole-numbers",
  title: "Whole Numbers",
  slug: "whole-numbers",
  description: "Place value, reading numbers, ordering, rounding, factors, multiples, even/odd, patterns, and Roman numerals",
  orderIndex: 1,
  questType: "MAIN",
  theme: "g4-math-whole-numbers",
  grade: 4,
  subjects: ["Mathematics"],
  xpReward: generateXp(225),
  cbcMapping: {
    subjects: ["Mathematics"],
    strands: ["Numbers"],
    subStrands: ["1.1 Whole Numbers"],
    specificLearningOutcomes: [
      "Use place value and total value of digits up to tens of thousands in daily life situations",
      "Read and write numbers up to 10,000 in symbols and up to 1,000 in words",
      "Order and round off numbers up to 1,000 in different situations",
      "Identify factors and multiples, and use even and odd numbers up to 100",
      "Create number patterns involving even and odd numbers in real life situations",
      "Represent Hindu Arabic numerals using Roman numerals up to X"
    ],
    coreCompetencies: ["critical_thinking", "learning_to_learn", "creativity"],
    coreValues: ["responsibility"],
    pertinentContemporaryIssues: []
  },
  lessons: [lesson1, lesson2, lesson3, lesson4, lesson5]
};
export function generateGrade4Math(): QuestGroup[] {
  return [wholeNumbersQuest, sideQuest];
}
export function getGrade4MathStats() {
  const quests = generateGrade4Math();
  const totalLessons = quests.reduce((sum, q) => sum + q.lessons.length, 0);
  const totalContentBlocks = quests.reduce((sum, q) =>
    sum + q.lessons.reduce((s, l) => s + l.contentBlocks.length, 0), 0);
  const quizzes = quests.reduce((sum, q) =>
    sum + q.lessons.reduce((s, l) => s + l.contentBlocks.filter(b => b.type === "quiz").length, 0), 0);
  return {
    grade: 4,
    subStrand: "1.1",
    totalQuests: quests.length,
    totalLessons,
    totalContentBlocks,
    totalQuizzes: quizzes,
    subjects: [...new Set(quests.flatMap(q => q.subjects))],
    mainQuests: quests.filter(q => q.questType === "MAIN").length,
    sideQuests: quests.filter(q => q.questType === "SIDE").length
  };
}
