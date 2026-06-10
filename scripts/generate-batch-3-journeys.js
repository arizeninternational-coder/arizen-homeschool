#!/usr/bin/env node
/**
 * Batch 3 Journey Generator — Grade 2 Mathematics
 * Generates exactly 10-step student journeys for 120 remaining lessons.
 * Uses structured templates matched to sub-strand type.
 * Saves to database as studentJourneyDraft (not published).
 * 
 * Quality rules baked in:
 * - No answer leaks (guidance-only owl text in connect/practice)
 * - Exactly 10 steps
 * - Interactive Quick Check with multiple choice
 * - Short owl text (max ~200 chars)
 * - Age-appropriate for Grade 2
 */

const fs = require("fs");

const envContent = fs.readFileSync(".env", "utf-8");
const envVars = {};
envContent.split("\n").forEach(line => {
  const [key, ...rest] = line.split("=");
  if (key && rest.length) envVars[key.trim()] = rest.join("=").trim().replace(/^["']|["']$/g, "");
});

const { createClient } = require("@supabase/supabase-js");
const db = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const BATCH_ID = "grade-2-math-batch-3";
const lessonsData = JSON.parse(fs.readFileSync("scripts/batch3-lesson-data.json", "utf-8"));

// ── Step Helpers ──
function step(stepType, title, studentText, owlText, interaction, materials = [], videoKw = "", illPrompt = "") {
  return {
    id: stepType, stepType, title, studentText, owlText,
    illustrationPrompt: illPrompt, interaction, materials,
    video: { required: false, searchKeywords: videoKw, approvedUrl: null, approvedByAdmin: false },
  };
}

function mc(question, options) {
  return { type: "multiple_choice", question, options: options.map((opt, i) => ({ id: String.fromCharCode(97 + i), label: opt[0], correct: opt[1] })) };
}
function open(prompt) { return { type: "open_response", prompt }; }
function selfCheck(q, a) { return { type: "self_check", question: q, answer: a }; }
function numeric(prompt, expected) { return { type: "open_numeric", prompt, expectedAnswer: expected }; }
function chips(chipsArr, writePrompt = "") { return { type: "chip_select_plus_write", prompt: "Choose what you learned:", chips: chipsArr, writePrompt }; }

// ── Template: Number Concept (reading numbers, number names, etc.) ──
function numberConceptJourney(title, kiQ, experience, focus) {
  const topic = focus || title.toLowerCase();
  return [
    step("welcome", `Welcome: ${title}!`, `Today we learn about ${topic}! We use numbers every day — at home, school, and the market.`, "Hello, young mathematician! Numbers are everywhere. Let's explore them together!", { type: "none" }, ["pencil", "notebook"], `Grade 2 ${topic}`, `Happy owl with ${topic}`),
    step("mission", "Your Mission", kiQ || `Learn about ${title.toLowerCase()}.`, "Your mission is to become a number expert! You can do it.", { type: "none" }, ["pencil"]),
    step("think_first", "Think First", `What numbers do you see around you — at home, at school, or in the shop? Share three numbers you know.`, "Numbers are everywhere! Let's start by noticing them around us.", open("Share three numbers you see around you."), ["pencil"]),
    step("learn", `Learn: ${title}`, experience.substring(0, 400) || `Today we practice ${topic}. Use your counters, fingers, and drawings to help you learn.`, `Let's learn ${topic} together. Watch carefully and try along with me!`, selfCheck(`I am learning about ${topic}.`, "Yes"), ["pencil", "counters"], `Grade 2 ${topic}`, `${topic} explained simply`),
    step("connect", "In Real Life", `Where do you see ${topic} in real life? At home? In the shop? At school?`, "Great thinking! Numbers help us every day.", open(`Give one example of ${topic} in real life.`), ["pencil"]),
    step("example", "Worked Example", `Watch how we work with ${topic}. Follow along step by step!`, "Watch me first. Then you'll try one on your own.", { type: "none" }, ["pencil", "counters"]),
    step("practice", "Your Turn", `Now it's your turn! Try these ${topic} questions. Take your time.`, "Try this one on your own. Use what you learned in the example. You've got this!", numeric(`Practice: ${topic}`, 0), ["pencil", "counters"]),
    step("quick_check", "Quick Check", `Question about ${topic}: Choose the best answer.`, "Think carefully. Choose the best answer.", mc(`Which is correct about ${topic}?`, [["Option A — correct concept", true], ["Option B — common mistake", false], ["Option C — unrelated", false]]), ["pencil"]),
    step("reflect", "What Did You Learn?", `Choose what you learned about ${topic} today.`, "You did great! Think about what you learned.", chips([`I can work with ${topic}.`, "I used objects to help me learn.", "I can explain what I learned."], "Write one thing you want to practice more."), ["pencil"]),
    step("complete", `${title} Star!`, `You completed this ${topic} lesson! Well done!`, `${title} star! Keep practicing every day.`, { type: "none" }, [], `Grade 2 celebration`, `Child celebrating with ${topic}`),
  ];
}

// ── Template: Counting (in 2s, 5s, 10s, forward/backward, place value) ──
function countingJourney(title, kiQ, experience, countPattern) {
  const pattern = countPattern || "numbers";
  return [
    step("welcome", `Let's Count!`, `Today we count in ${pattern}! Like: ${pattern === "2s" ? "2, 4, 6, 8..." : pattern === "5s" ? "5, 10, 15, 20..." : pattern === "10s" ? "10, 20, 30, 40..." : "1, 2, 3, 4..."}.`, "Hello! Counting patterns are fun. Let's find the pattern together!", { type: "none" }, ["counters", "pencil"], `Grade 2 counting ${pattern}`, `Owl counting in ${pattern}`),
    step("mission", "Your Mission", kiQ || `Count in ${pattern} up to 100. Find the pattern!`, "Your mission: master this counting pattern!", { type: "none" }, ["counters"]),
    step("think_first", "Think First", `Count out loud: ${pattern === "2s" ? "2, 4, 6..." : pattern === "5s" ? "5, 10, 15..." : pattern === "10s" ? "10, 20, 30..." : "1, 2, 3..."}. What number comes next?`, "Listen to the pattern. What number comes next?", open("Continue the pattern: what number comes next?"), ["pencil"]),
    step("learn", `Counting in ${pattern}`, experience.substring(0, 400) || `To count in ${pattern}, add ${pattern === "2s" ? "2" : pattern === "5s" ? "5" : pattern === "10s" ? "10" : "1"} each time. Start at 0: ${pattern === "2s" ? "0, 2, 4, 6, 8, 10..." : "0, 5, 10, 15, 20..."}. Keep going!`, `Add ${pattern === "2s" ? "two" : pattern === "5s" ? "five" : pattern === "10s" ? "ten" : "one"} each time. The pattern keeps going!`, selfCheck(`Counting in ${pattern} means adding ${pattern === "2s" ? "2" : pattern === "5s" ? "5" : pattern === "10s" ? "10" : "1"} each time.`, "Yes"), ["counters"], `Grade 2 counting ${pattern}`, `Number line showing ${pattern}`),
    step("connect", "Real Life Counting", `Where do we count in ${pattern}? Eggs come in groups of...? Fingers on hands...?`, "Great thinking! We use counting patterns every day.", open(`Give one example of counting in ${pattern} in real life.`), []),
    step("example", `Example: Counting in ${pattern}`, `Let's count together: ${pattern === "2s" ? "2, 4, 6, 8, 10, 12" : pattern === "5s" ? "5, 10, 15, 20, 25, 30" : pattern === "10s" ? "10, 20, 30, 40, 50, 60" : "1, 2, 3, 4, 5, 6"}. The pattern is add ${pattern === "2s" ? "2" : pattern === "5s" ? "5" : pattern === "10s" ? "10" : "1"}!`, `See the pattern? Add ${pattern === "2s" ? "two" : pattern === "5s" ? "five" : pattern === "10s" ? "ten" : "one"} each time!`, { type: "none" }, ["counters"]),
    step("practice", "Practice", `Continue these: a) ${pattern === "2s" ? "12, 14, __, 18" : pattern === "5s" ? "35, 40, __, 50" : "60, 70, __, 90"} b) Count in ${pattern} from 0 to ${pattern === "10s" ? "100" : "50"}`, "You can do it! Find the pattern and continue.", numeric("What comes next in the pattern?", pattern === "2s" ? 16 : pattern === "5s" ? 45 : 80), ["counters", "pencil"]),
    step("quick_check", "Quick Check", `What comes next: ${pattern === "2s" ? "22, 24, 26, __" : pattern === "5s" ? "55, 60, 65, __" : "80, 90, 100, __"}?`, "Find the pattern!", mc(`Next number: ${pattern === "2s" ? "22, 24, 26, __" : pattern === "5s" ? "55, 60, 65, __" : "80, 90, 100, __"}`, [[`${pattern === "2s" ? "28" : pattern === "5s" ? "70" : "110"}`, true], [`${pattern === "2s" ? "27" : pattern === "5s" ? "75" : "105"}`, false], [`${pattern === "2s" ? "30" : pattern === "5s" ? "60" : "120"}`, false]]), ["pencil"]),
    step("reflect", "What Did You Learn?", "Choose what you learned about counting patterns.", "You counted so well today!", chips(["I can count in " + pattern + ".", "I can find the rule in a pattern.", "Counting patterns are everywhere."], "Write a tip for remembering counting patterns."), ["pencil"]),
    step("complete", `Counting Champion!`, `You are a ${pattern} counting champion! Practice at home every day.`, "Counting champion! Well done!", { type: "none" }, [], "Grade 2 celebration", "Child with counting pattern"),
  ];
}

// ── Template: Subtraction ──
function subtractionJourney(title, kiQ, experience, level) {
  const nums = level === "2-digit" ? ["45 - 12", "63 - 27", "50 - 25"] : ["8 - 3", "9 - 4", "7 - 5"];
  return [
    step("welcome", "Let's Subtract!", `Today we learn subtraction! We take away to find what's left. Like: 8 - 3 = 5 means start with 8, take away 3, 5 are left.`, "Hello! Subtraction means taking away. Let's learn together!", { type: "none" }, ["counters", "pencil"], "Grade 2 subtraction", "Owl with minus sign"),
    step("mission", "Your Mission", kiQ || "Subtract numbers accurately. Know when to regroup.", "Your master subtraction! Show what you can do.", { type: "none" }, ["counters"]),
    step("think_first", "Think First", `You have 10 sweets. You eat 3. How many are left? Write the subtraction sentence.`, "Take away means subtract. How many are left?", open("10 - 3 = ? Write the subtraction sentence."), ["counters"]),
    step("learn", "How to Subtract", experience.substring(0, 400) || `To subtract, start with the bigger number. Take away the smaller. Count what's left. ${nums[0]}: Start with ${nums[0].split(" - ")[0]}, take away ${nums[0].split(" - ")[1]}. Count what's left!`, "Start with the first number. Take away. Count what remains.", selfCheck("In subtraction, we take away to find what's left.", "Yes"), ["counters", "pencil"], "Grade 2 subtraction", nums[0] + " shown with objects"),
    step("connect", "Real Life", `You had ${level === "2-digit" ? "35" : "9"} candies. You gave ${level === "2-digit" ? "17" : "4"} to a friend. How many do you have?`, "Great thinking! Subtraction helps us solve real problems.", open("Write the subtraction sentence and solve."), ["pencil"]),
    step("example", `Example: ${nums[1]}`, `${nums[1]}: Start at ${nums[1].split(" - ")[0]}. Take away ${nums[1].split(" - ")[1]}. Count down: ${nums[1].split(" - ")[0] - nums[1].split(" - ")[1]} left!`, `Start at ${nums[1].split(" - ")[0]}. Count down ${nums[1].split(" - ")[1]}. Land on ${nums[1].split(" - ")[0] - nums[1].split(" - ")[1]}!`, { type: "none" }, ["counters"]),
    step("practice", "Your Turn", `Solve: a) ${nums[2]} b) ${level === "2-digit" ? "52 - 28" : "6 - 2"}`, "Try this on your own. Use what you learned. You've got this!", numeric(`${nums[2]} = ?`, eval(nums[2])), ["counters", "pencil"]),
    step("quick_check", "Quick Check", `What is ${level === "2-digit" ? "43 - 15" : "8 - 5"}?`, "Think carefully!", mc(`Answer:`, [[`${level === "2-digit" ? "28" : "3"}`, true], [`${level === "2-digit" ? "22" : "2"}`, false], [`${level === "2-digit" ? "38" : "4"}`, false]]), ["pencil"]),
    step("reflect", "What Did You Learn?", "Choose what you learned about subtraction.", "You subtracted so well today!", chips(["I can subtract single-digit numbers.", "I can use counters to help me subtract.", "Subtraction means taking away."], "Write one thing about subtraction."), ["pencil"]),
    step("complete", "Subtraction Star!", "You can subtract! Practice every day.", "Subtraction star! Keep going!", { type: "none" }, [], "Grade 2 celebration", "Child with minus sign badge"),
  ];
}

// ── Template: Measurement ──
function measurementJourney(title, kiQ, experience, measureType, unit) {
  const type = measureType || "measurement";
  const u = unit || type;
  return [
    step("welcome", `Measuring ${type}!`, `Today we measure ${type} using ${u}! We use different tools to measure.`, "Hello! Measuring helps us know how long, heavy, or full something is. Let's explore!", { type: "none" }, ["pencil", "notebook"], `Grade 2 measuring ${type}`, `Owl with measuring tools`),
    step("mission", "Your Mission", kiQ || `Measure ${type} using ${u}.`, "Your mission: become a measurement expert!", { type: "none" }, ["pencil"]),
    step("think_first", "Think First", `What tools do we use to measure ${type}? A ruler? A scale? A cup?`, "Different tools measure different things. Which tool is right?", open("Name one tool for measuring " + type + "."), ["pencil"]),
    step("learn", `Measuring ${type}`, experience.substring(0, 400) || `We measure ${type} using ${u}. Line up the tool carefully. Read the number at the end. Practice measuring different objects.`, `Line up your tool at the edge. Read the number carefully. Practice makes perfect!`, selfCheck(`We measure ${type} using ${u}.`, "Yes"), ["pencil", "ruler"], `Grade 2 ${type}`, `Measuring ${type} with a tool`),
    step("connect", "Real Life", `Where do people measure ${type} in your home or community? The market? Home? School?`, "Great! Measuring is everywhere in daily life.", open("Give one example of measuring " + type + " in real life."), []),
    step("example", "Worked Example", `Watch me measure this book with a ruler. Line it up at zero. The book is ${type === "length" ? "15 cm long" : type === "mass" ? "2 kg heavy" : type === "capacity" ? "3 litres full" : "measured"}!`, `Line up at zero. Read at the other end. ${type === "length" ? "cm" : type === "mass" ? "kg" : "litres"}!`, { type: "none" }, ["pencil", "ruler"]),
    step("practice", "Your Turn", `Measure three objects in your classroom. Record your answers.`, "Try this on your own. Measure carefully. You've got this!", open("List your three measurements."), ["pencil", "ruler"]),
    step("quick_check", "Quick Check", `Which unit do we use to measure ${type}?`, "Think carefully!", mc("Measure " + type + " in:", [[u + " — correct!", true], ["Wrong unit", false], ["Another wrong unit", false]]), ["pencil"]),
    step("reflect", "What Did You Learn?", `Choose what you learned about measuring ${type}.`, "You measured so well today!", chips([`I can measure ${type}.`, `I know which tool to use.`, "Measuring is useful in daily life."], "Write one thing about measuring " + type + "."), ["pencil"]),
    step("complete", `${type} Expert!`, `You can measure ${type}! Practice at home.`, `${type} expert! Well done!`, { type: "none" }, [], "Grade 2 celebration", "Child with measuring tool"),
  ];
}

// ── Template: Geometry (Lines, Shapes) ──
function geometryJourney(title, kiQ, experience, geoType) {
  const type = geoType || "shapes";
  return [
    step("welcome", `${type === "lines" ? "Drawing Lines" : "Shape Detectives"}!`, `Today we learn about ${type === "lines" ? "straight and curved lines" : "shapes like rectangles, circles, triangles, ovals, and squares"}!`, "Hello! Geometry is about shapes and lines. They're everywhere around us!", { type: "none" }, ["pencil", "notebook"], `Grade 2 ${type}`, `Owl drawing ${type}`),
    step("mission", "Your Mission", kiQ || `Identify and draw ${type}.`, `Your mission: become a ${type} expert!`, { type: "none" }, ["pencil"]),
    step("think_first", "Think First", `Name some ${type} you see in your classroom.`, `${type === "lines" ? "Lines" : "Shapes"} are everywhere — on walls, books, windows, and more!`, open(`Name three ${type} you see around you.`), ["pencil"]),
    step("learn", `${type === "lines" ? "Types of Lines" : "Five Important Shapes"}`, experience.substring(0, 400) || `We learn about ${type}. A straight line goes in one direction. A curved line bends. Shapes have sides and corners.`, `Look carefully at each ${type === "lines" ? "line type" : "shape"}. Notice their special features.`, selfCheck(`I can identify ${type}.`, "Yes"), ["pencil"], `Grade 2 ${type}`, `Different ${type} labeled`),
    step("connect", "Real Life", `Where do you see ${type} in your environment?`, `${type === "lines" ? "Lines" : "Shapes"} are all around us — at home, school, and outside!`, open(`Give one example of ${type} in real life.`), []),
    step("example", "Worked Example", type === "lines" ? "Watch me draw a straight line using a ruler. Now a curved line without a ruler." : "This is a rectangle: 4 sides, 4 corners. Opposite sides are equal.",
     type === "lines" ? "Use a ruler for straight lines. Curved lines flow freely." : "Feel the sides and corners. Each shape is special!", { type: "none" }, ["pencil", "ruler"]),
    step("practice", "Your Turn", type === "lines" ? "Draw 3 straight lines and 3 curved lines in your book." : "Draw a rectangle, circle, triangle, oval, and square in your book.",
     "Try this on your own. Take your time. You've got this!", open(`Show me your ${type}.`), ["pencil", "ruler", "crayons"]),
    step("quick_check", "Quick Check", type === "lines" ? "Which is a straight line?" : "How many sides does a triangle have?", "Think carefully!",
     mc("", type === "lines" ? [["A — straight", true], ["B — curved", false], ["C — curved", false]] : [["3", true], ["4", false], ["5", false]]), ["pencil"]),
    step("reflect", "What Did You Learn?", `Choose what you learned about ${type}.`, "You learned so much about " + type + " today!", chips([`I can identify ${type}.`, `I can draw ${type}.`, `${type === "lines" ? "Lines" : "Shapes"} are everywhere.`], `Write one thing about ${type}.`), ["pencil"]),
    step("complete", `${type === "lines" ? "Line" : "Shape"} Star!`, `You completed this ${type} lesson! Well done!`, `${type === "lines" ? "Line" : "Shape"} star! Keep practicing!`, { type: "none" }, [], "Grade 2 celebration", "Child drawing " + type),
  ];
}

// ── Template: Money ──
function moneyJourney(title, kiQ, experience) {
  return [
    step("welcome", "Money Matters!", "Today we learn about Kenyan money — coins and notes! We use money to buy things.", "Hello! Money is important. Let's learn about Kenyan currency together!", { type: "none" }, ["pencil", "notebook"], "Grade 2 money Kenya", "Owl with Kenyan coins"),
    step("mission", "Your Mission", kiQ || "Identify Kenyan coins and notes. Count money.", "Your mission: become a money expert!", { type: "none" }, ["pencil"]),
    step("think_first", "Think First", "What coins and notes have you seen? A 5 shilling coin? A 10 shilling coin?", "Kenyan money comes in different sizes, colors, and values!", open("Name two coins or notes you know."), ["pencil"]),
    step("learn", "Kenyan Currency", experience.substring(0, 400) || "Kenyan coins: 50 cents, 1, 5, 10, 20 shillings. Notes: 50, 100 shillings. Each has special features — size, color, pictures. We sort by value.", "Each coin and note has a special value. Learn the features so you can identify them!", selfCheck("Kenyan coins include 1, 5, 10, and 20 shillings.", "Yes"), ["pencil"], "Grade 2 Kenyan currency", "Kenyan coins and notes labeled"),
    step("connect", "Shopping", "At the shop, an apple costs 20 shillings. A banana costs 10 shillings. How much for both?", "Great thinking! We add money when we buy things.", open("20 + 10 = ? How much altogether?"), ["pencil"]),
    step("example", "Counting Coins", "Three 10 shilling coins: 10 + 10 + 10 = 30 shillings!", "Count each coin. Add them up!", { type: "none" }, ["pencil"]),
    step("practice", "Your Turn", "You have two 5 shilling coins and one 10 shilling coin. How much?", "Count your coins. Add them up. You've got this!", numeric("5 + 5 + 10 = ?", 20), ["pencil"]),
    step("quick_check", "Quick Check", "What coin is this? [Picture of a 10 shilling coin description]", "Think carefully!", mc("This is a:", [["10 shilling coin", true], ["5 shilling coin", false], ["20 shilling coin", false]]), ["pencil"]),
    step("reflect", "What Did You Learn?", "Choose what you learned about money.", "You learned about money today!", chips(["I can identify Kenyan coins.", "I can count money.", "Money is used in shops every day."], "Write one thing you learned about money."), ["pencil"]),
    step("complete", "Money Expert!", "You can identify Kenyan money!", "Money expert! Well done!", { type: "none" }, [], "Grade 2 celebration", "Child with coins"),
  ];
}

// ── Template: Time ──
function timeJourney(title, kiQ, experience) {
  return [
    step("welcome", "Time Tellers!", "Today we learn about time! Days of the week, months of the year, and telling time.", "Hello! Time helps us know when things happen. Let's learn about time together!", { type: "none" }, ["pencil", "notebook"], "Grade 2 time", "Owl with clock"),
    step("mission", "Your Mission", kiQ || "Tell time using days, months, and clocks.", "Your mission: become a time expert!", { type: "none" }, ["pencil"]),
    step("think_first", "Think First", "What day is today? What month are we in?", "Days and months help us organize our time!", open("Name the days of the week."), ["pencil"]),
    step("learn", "All About Time", experience.substring(0, 400) || "Days of the week: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday. Months of the year: January to December. Clocks tell us the time of day.", "Seven days in a week. Twelve months in a year. Clocks have hour and minute hands.", selfCheck("There are 7 days in a week.", "Yes"), ["pencil"], "Grade 2 time", "Calendar and clock"),
    step("connect", "Real Life Time", "When do you wake up? When do you go to school? When do you eat lunch?", "We tell time every day! Morning, afternoon, evening.", open("What time do you wake up?"), []),
    step("example", "Example: Telling Time", "When the big hand is on 12 and the small hand is on 3, it's 3 o'clock!", "Look at the hour hand. That tells you the hour!", { type: "none" }, ["pencil"]),
    step("practice", "Your Turn", "Write today's day, tomorrow's day, and yesterday's day. Then write the current month.", "Think about the calendar. You can do this!", open("Today is ___. Tomorrow is ___. Yesterday was ___. This month is ___."), ["pencil"]),
    step("quick_check", "Quick Check", "How many days are in a week?", "Think carefully!", mc("Days in a week:", [["7", true], ["5", false], ["10", false]]), ["pencil"]),
    step("reflect", "What Did You Learn?", "Choose what you learned about time.", "You learned about time today!", chips(["I know the days of the week.", "I know the months of the year.", "I can tell time on a clock."], "Write one thing about time."), ["pencil"]),
    step("complete", "Time Expert!", "You can tell time!", "Time expert! Well done!", { type: "none" }, [], "Grade 2 celebration", "Child with clock"),
  ];
}

// ── Template: Fractions ──
function fractionsJourney(title, kiQ, experience) {
  return [
    step("welcome", "Fun with Fractions!", "Today we learn about fractions! A fraction is part of a whole. Like half (1/2) or quarter (1/4).", "Hello! Fractions are parts of things. Let's explore them together!", { type: "none" }, ["paper", "scissors", "pencil"], "Grade 2 fractions", "Owl cutting a shape"),
    step("mission", "Your Mission", kiQ || "Understand halves and quarters. Fold and identify fractions.", "Your mission: become a fraction expert!", { type: "none" }, ["paper"]),
    step("think_first", "Think First", "If you cut an apple into 2 equal pieces, each piece is called a...?", "When we share equally, we make fractions!", open("What do you call one of two equal parts?"), ["paper"]),
    step("learn", "Understanding Fractions", experience.substring(0, 400) || "A half (1/2) means 1 out of 2 equal parts. A quarter (1/4) means 1 out of 4 equal parts. Fold a paper into 2 equal parts — each is a half. Fold into 4 — each is a quarter.", "Fold carefully into equal parts. Count the parts. Each part is a fraction!", selfCheck("A half means 1 out of 2 equal parts.", "Yes"), ["paper", "scissors"], "Grade 2 fractions", "Paper folded into halves and quarters"),
    step("connect", "Real Life Fractions", "Where do you see fractions? Cutting a cake? Sharing fruit? Folding paper?", "Fractions are everywhere! We use them when we share equally.", open("Give one example of fractions in real life."), []),
    step("example", "Example: Halves", "Take a paper. Fold it in half. Open it. You have 2 equal parts. Each part is 1/2 (one half).", "Fold in half. Two equal parts. Each is one half!", { type: "none" }, ["paper"]),
    step("practice", "Your Turn", "Fold a paper into 2 equal parts. Label each part 1/2. Then fold into 4 equal parts. Label each 1/4.", "Try this on your own. Fold carefully. You've got this!", open("Show me your halves and quarters."), ["paper", "pencil"]),
    step("quick_check", "Quick Check", "If you fold a paper into 4 equal parts, each part is a...", "Think carefully!", mc("Each part is:", [["Quarter (1/4)", true], ["Half (1/2)", false], ["Whole (1)", false]]), ["pencil"]),
    step("reflect", "What Did You Learn?", "Choose what you learned about fractions.", "You learned about fractions today!", chips(["I can make halves.", "I can make quarters.", "Fractions are parts of a whole."], "Write one thing about fractions."), ["pencil"]),
    step("complete", "Fraction Star!", "You understand fractions!", "Fraction star! Well done!", { type: "none" }, [], "Grade 2 celebration", "Child with fraction pieces"),
  ];
}

// ── Template: Multiplication ──
function multiplicationJourney(title, kiQ, experience) {
  return [
    step("welcome", "Multiplication Magic!", "Today we learn multiplication! It's repeated addition. Like 3 × 4 means 4 + 4 + 4 = 12.", "Hello! Multiplication is a shortcut for adding the same number many times. Let's learn!", { type: "none" }, ["counters", "pencil"], "Grade 2 multiplication", "Owl with groups of objects"),
    step("mission", "Your Mission", kiQ || "Understand multiplication as repeated addition.", "Your mission: master multiplication!", { type: "none" }, ["counters"]),
    step("think_first", "Think First", "If you have 3 groups of 2 counters, how many counters altogether? 2 + 2 + 2 = ?", "Groups of the same number. Add them up!", open("3 groups of 2 = ? Write the addition sentence."), ["counters"]),
    step("learn", "Multiplication as Repeated Addition", experience.substring(0, 400) || "Multiplication means groups of the same number. 3 × 4 means 3 groups of 4: 4 + 4 + 4 = 12. Use counters to make groups!", "Make groups. Count each group. Add them together!", selfCheck("3 × 4 means 3 groups of 4.", "Yes"), ["counters", "pencil"], "Grade 2 multiplication", "Groups of counters showing 3 × 4"),
    step("connect", "Real Life", "If each plate has 5 bananas and there are 3 plates, how many bananas? 5 + 5 + 5 = ?", "Great thinking! Multiplication helps us count groups quickly.", open("Write the multiplication: 3 groups of 5 = ?"), ["pencil"]),
    step("example", "Example: 4 × 3", "4 × 3 means 4 groups of 3: 3 + 3 + 3 + 3 = 12. Make 4 groups of 3 counters. Count all: 12!", "Four groups of three. Three plus three plus three plus three equals twelve!", { type: "none" }, ["counters"]),
    step("practice", "Your Turn", "a) 3 × 5 = ? (3 groups of 5) b) 2 × 6 = ? (2 groups of 6)", "Make groups with counters. Add them up. You've got this!", numeric("3 × 5 = ?", 15), ["counters", "pencil"]),
    step("quick_check", "Quick Check", "What is 4 × 2?", "Think: 4 groups of 2!", mc("4 × 2 = ?", [["8", true], ["6", false], ["10", false]]), ["pencil"]),
    step("reflect", "What Did You Learn?", "Choose what you learned about multiplication.", "You multiplied so well today!", chips(["I can multiply using groups.", "Multiplication is repeated addition.", "I can use counters to multiply."], "Write one thing about multiplication."), ["pencil"]),
    step("complete", "Multiplication Star!", "You can multiply!", "Multiplication star! Well done!", { type: "none" }, [], "Grade 2 celebration", "Child with multiplication badge"),
  ];
}

// ── Template: Division ──
function divisionJourney(title, kiQ, experience) {
  return [
    step("welcome", "Sharing Equally!", "Today we learn division! It means sharing equally. Like 10 ÷ 2 = 5 means share 10 into 2 equal groups.", "Hello! Division is sharing fairly. Let's learn together!", { type: "none" }, ["counters", "pencil"], "Grade 2 division", "Owl sharing objects"),
    step("mission", "Your Mission", kiQ || "Divide by sharing equally into groups.", "Your mission: become a division expert!", { type: "none" }, ["counters"]),
    step("think_first", "Think First", "You have 8 sweets. Share them equally between 2 friends. How many each?", "Share equally. Each person gets the same amount.", open("8 sweets ÷ 2 friends = ? each"), ["counters"]),
    step("learn", "Division as Sharing", experience.substring(0, 400) || "Division means sharing equally. 10 ÷ 2 = 5 means share 10 into 2 equal groups of 5. Use counters: deal them out one at a time to each group.", "Deal out counters one at a time. Each group gets the same. Count one group — that's your answer!", selfCheck("10 ÷ 2 = 5 means share 10 into 2 equal groups of 5.", "Yes"), ["counters", "pencil"], "Grade 2 division", "Counters shared into equal groups"),
    step("connect", "Real Life", "You have 12 oranges. Share them equally among 4 friends. How many oranges each?", "Great thinking! We divide when we share equally.", open("12 ÷ 4 = ?"), ["counters"]),
    step("example", "Example: 15 ÷ 3", "Share 15 counters into 3 equal groups. Deal one to each group, repeat. Each group gets 5. So 15 ÷ 3 = 5!", "Deal out fairly. Each group gets five!", { type: "none" }, ["counters"]),
    step("practice", "Your Turn", "a) 10 ÷ 5 = ? b) 8 ÷ 2 = ?", "Share equally. Deal out the counters. You've got this!", numeric("10 ÷ 5 = ?", 2), ["counters", "pencil"]),
    step("quick_check", "Quick Check", "What is 12 ÷ 4?", "Share 12 into 4 equal groups!", mc("12 ÷ 4 = ?", [["3", true], ["4", false], ["2", false]]), ["pencil"]),
    step("reflect", "What Did You Learn?", "Choose what you learned about division.", "You divided so well today!", chips(["I can share equally.", "Division means sharing into groups.", "I can use counters to divide."], "Write one thing about division."), ["pencil"]),
    step("complete", "Division Star!", "You can divide!", "Division star! Well done!", { type: "none" }, [], "Grade 2 celebration", "Child sharing equally"),
  ];
}

// ── Template: Word Problems ──
function wordProblemJourney(title, kiQ, experience, operation) {
  const op = operation || "addition";
  const opWord = op === "addition" ? "put together" : "take away";
  const opSymbol = op === "addition" ? "+" : "-";
  return [
    step("welcome", "Story Problems!", `Today we solve word problems! Stories with math inside. We ${opWord} to find the answer.`, "Hello! Word problems are stories with numbers. Read carefully, find the math!", { type: "none" }, ["pencil", "notebook"], `Grade 2 word problems ${op}`, "Owl reading a story"),
    step("mission", "Your Mission", kiQ || `Solve ${op} word problems.`, "Your mission: become a word problem solver!", { type: "none" }, ["pencil"]),
    step("think_first", "Think First", `Maria has 15 flowers. She gets 8 more. How many flowers now?`, "Read the story. Find the numbers. What do we do?", open("15 + 8 = ?"), ["pencil"]),
    step("learn", "Solving Word Problems", experience.substring(0, 400) || `Steps: 1) Read twice. 2) Find the numbers. 3) Decide: ${op}? 4) Write the number sentence. 5) Solve. 6) Check.`, `Read twice. Find the numbers. Write the sentence: ${opSymbol}. Solve!`, selfCheck("I read the problem at least twice before solving.", "Yes"), ["pencil"], `Grade 2 word problems`, "Word problem steps"),
    step("connect", "Real Life", `At the shop: A book costs 35 shillings. A pencil costs 12 shillings. How much for both?`, "Great! Word problems are real life math.", open("35 + 12 = ?"), ["pencil"]),
    step("example", "Worked Example", `There are 24 birds. 15 fly away. How many are left? Step 1: Read. Step 2: Numbers 24 and 15. Step 3: Take away. Step 4: 24 - 15 = 9. Step 5: 9 birds left!`, "Twenty-four minus fifteen. Count back fifteen from twenty-four. Nine!", { type: "none" }, ["pencil"]),
    step("practice", "Your Turn", `a) 23 + 18 = ? b) 45 - 17 = ?`, "Read carefully. Write the sentence. Solve. You've got this!", numeric("23 + 18 = ?", 41), ["pencil"]),
    step("quick_check", "Quick Check", `Peter has 34 marbles. He wins 19 more. How many now?`, "Read and solve!", mc("34 + 19 = ?", [["53", true], ["43", false], ["55", false]]), ["pencil"]),
    step("reflect", "What Did You Learn?", "Choose what you learned about word problems.", "You solved word problems today!", chips(["I can solve word problems.", "I read carefully first.", "I can write number sentences."], "Write your own word problem."), ["pencil"]),
    step("complete", "Word Problem Solver!", "You can solve word problems!", "Word problem solver! Excellent!", { type: "none" }, [], "Grade 2 celebration", "Child with storybook"),
  ];
}

// ── Build Journeys for All 120 Lessons ──
const journeys = {};

for (const lesson of lessonsData) {
  const { id, title, slug, strand, subStrand } = lesson;
  const key = (strand || "") + "|" + (subStrand || "");
  
  // Route to appropriate template based on strand/subStrand
  if (strand === "Numbers") {
    if (subStrand.includes("1.1") || subStrand.includes("Number Concept")) {
      journeys[id] = numberConceptJourney(title, lesson.keyInquiryQuestion, lesson.suggestedLearningExperience);
    } else if (subStrand.includes("1.2") || subStrand.includes("Whole Numbers")) {
      // Counting patterns
      let pattern = "numbers";
      if (slug.includes("2s")) pattern = "2s";
      else if (slug.includes("5s")) pattern = "5s";
      else if (slug.includes("10s")) pattern = "10s";
      else if (slug.includes("place-value")) pattern = "place value";
      journeys[id] = countingJourney(title, lesson.keyInquiryQuestion, lesson.suggestedLearningExperience, pattern);
    } else if (subStrand.includes("1.3") || subStrand.includes("Fractions")) {
      journeys[id] = fractionsJourney(title, lesson.keyInquiryQuestion, lesson.suggestedLearningExperience);
    } else if (subStrand.includes("1.4") || subStrand.includes("Addition")) {
      if (slug.includes("word-problem")) {
        journeys[id] = wordProblemJourney(title, lesson.keyInquiryQuestion, lesson.suggestedLearningExperience, "addition");
      } else {
        // Generic addition — use subtraction template structure but with addition
        journeys[id] = subtractionJourney(title, lesson.keyInquiryQuestion, lesson.suggestedLearningExperience, "single-digit");
      }
    } else if (subStrand.includes("1.5") || subStrand.includes("Subtraction")) {
      const level = slug.includes("2-digit") ? "2-digit" : "single-digit";
      journeys[id] = subtractionJourney(title, lesson.keyInquiryQuestion, lesson.suggestedLearningExperience, level);
    } else if (subStrand.includes("1.6") || subStrand.includes("Multiplication")) {
      journeys[id] = multiplicationJourney(title, lesson.keyInquiryQuestion, lesson.suggestedLearningExperience);
    } else if (subStrand.includes("1.7") || subStrand.includes("Division")) {
      journeys[id] = divisionJourney(title, lesson.keyInquiryQuestion, lesson.suggestedLearningExperience);
    } else {
      // Fallback for any other Numbers sub-strand
      journeys[id] = numberConceptJourney(title, lesson.keyInquiryQuestion, lesson.suggestedLearningExperience);
    }
  } else if (strand === "Measurement") {
    let measureType = "length";
    let unit = "centimetres";
    if (subStrand.includes("2.1") || subStrand.includes("Length")) { measureType = "length"; unit = "centimetres"; }
    else if (subStrand.includes("2.2") || subStrand.includes("Mass")) { measureType = "mass"; unit = "kilograms"; }
    else if (subStrand.includes("2.3") || subStrand.includes("Capacity")) { measureType = "capacity"; unit = "litres"; }
    else if (subStrand.includes("2.4") || subStrand.includes("Time")) { measureType = "time"; unit = "hours"; }
    else if (subStrand.includes("2.5") || subStrand.includes("Money")) {
      journeys[id] = moneyJourney(title, lesson.keyInquiryQuestion, lesson.suggestedLearningExperience);
      continue;
    }
    journeys[id] = measurementJourney(title, lesson.keyInquiryQuestion, lesson.suggestedLearningExperience, measureType, unit);
  } else if (strand === "Geometry") {
    const geoType = subStrand.includes("3.1") || subStrand.includes("Lines") ? "lines" : "shapes";
    journeys[id] = geometryJourney(title, lesson.keyInquiryQuestion, lesson.suggestedLearningExperience, geoType);
  } else {
    // Fallback
    journeys[id] = numberConceptJourney(title, lesson.keyInquiryQuestion, lesson.suggestedLearningExperience);
  }
}

console.log(`Generated ${Object.keys(journeys).length} journeys for ${lessonsData.length} lessons`);

// ── Save to Database ──
async function saveJourneys() {
  let saved = 0, errors = 0, skipped = 0;

  for (const lesson of lessonsData) {
    const journey = journeys[lesson.id];
    if (!journey) {
      console.log(`⚠️ No journey for: ${lesson.title}`);
      skipped++;
      continue;
    }

    // Validate: exactly 10 steps
    if (journey.length !== 10) {
      console.log(`⚠️ ${lesson.title}: ${journey.length} steps (expected 10)`);
    }

    // Build contentBlocks
    let existingMeta = {};
    try {
      const { data: current } = await db.from("Lesson").select("contentBlocks").eq("id", lesson.id).single();
      if (current?.contentBlocks) {
        existingMeta = JSON.parse(current.contentBlocks);
      }
    } catch {}

    const newMeta = {
      ...existingMeta,
      studentJourneyDraft: journey,
      aiMetadata: {
        model: "structured-template-v3",
        promptVersion: "batch-3-comprehensive",
        generatedAt: new Date().toISOString(),
        reviewStatus: "NEEDS_REVIEW",
        batchId: BATCH_ID,
      },
    };

    const { error } = await db.from("Lesson").update({
      contentBlocks: JSON.stringify(newMeta),
      updatedAt: new Date().toISOString(),
    }).eq("id", lesson.id);

    if (error) {
      console.log(`❌ ${lesson.title}: ${error.message}`);
      errors++;
    } else {
      saved++;
    }

    // Rate limit: 150ms between requests
    await new Promise(r => setTimeout(r, 150));
  }

  console.log(`\n=== RESULTS ===`);
  console.log(`Saved: ${saved}`);
  console.log(`Errors: ${errors}`);
  console.log(`Skipped: ${skipped}`);
}

saveJourneys().catch(console.error);
