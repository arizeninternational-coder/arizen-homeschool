#!/usr/bin/env node
/**
 * Batch 2 Journey Generator — Grade 2 Mathematics
 * Generates EXACTLY 10-step student journeys for 19 lessons.
 * Saves to database as studentJourneyDraft (DRAFT, not published).
 */

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

const envContent = fs.readFileSync(".env", "utf-8");
const envVars = {};
envContent.split("\n").forEach(line => {
  const [key, ...rest] = line.split("=");
  if (key && rest.length) envVars[key.trim()] = rest.join("=").trim().replace(/^["']|["']$/g, "");
});

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const BATCH_ID = "grade-2-math-batch-2";
const lessonsData = JSON.parse(fs.readFileSync("scripts/batch2-lesson-data.json", "utf-8"));

function makeStep(stepType, title, studentText, owlText, interaction, materials = [], videoKeywords = "", illustrationPrompt = "") {
  return {
    id: stepType, stepType, title, studentText, owlText, illustrationPrompt,
    interaction, materials,
    video: { required: false, searchKeywords: videoKeywords, approvedUrl: null, approvedByAdmin: false },
  };
}
function mcInteraction(question, options) {
  return { type: "multiple_choice", question, options: options.map((opt, i) => ({ id: String.fromCharCode(97 + i), label: opt[0], correct: opt[1] })) };
}
function openInteraction(prompt) { return { type: "open_response", prompt }; }
function selfCheck(question, answer) { return { type: "self_check", question, answer }; }
function numericInteraction(prompt, expected) { return { type: "open_numeric", prompt, expectedAnswer: expected }; }
function chipSelect(chips, writePrompt = "") { return { type: "chip_select_plus_write", prompt: "Choose what you learned today:", chips, writePrompt }; }

// Helper to create standard 10-step journey
function standardJourney(welcomeTitle, welcomeText, welcomeOwl, missionText, missionOwl,
  thinkQ, thinkOwl, learnText, learnOwl, learnCheck,
  connectQ, connectAns, exampleText, exampleOwl, practiceQ, practiceAns,
  qcQuestion, qcOptions, reflectChips, completeTitle, completeOwl,
  materials, videoKw, illPrompt) {
  return [
    makeStep("welcome", welcomeTitle, welcomeText, welcomeOwl, { type: "none" }, materials, videoKw, illPrompt),
    makeStep("mission", "Your Mission", missionText, missionOwl, { type: "none" }, materials),
    makeStep("think_first", "Think First", thinkQ, thinkOwl, openInteraction("What do you think? Write your answer."), materials),
    makeStep("learn", "Let's Learn", learnText, learnOwl, learnCheck, materials, videoKw, illPrompt),
    makeStep("connect", "In Real Life", connectQ, `Real addition! The answer is ${connectAns}.`, numericInteraction(connectQ, connectAns), materials),
    makeStep("example", "Worked Example", exampleText, exampleOwl, { type: "none" }, materials),
    makeStep("practice", "Practice Time", practiceQ, `You can do this! The answer is ${practiceAns}.`, numericInteraction(practiceQ, practiceAns), materials),
    makeStep("quick_check", "Quick Check", qcQuestion, "Think carefully. Choose the best answer.", mcInteraction(qcQuestion, qcOptions), materials),
    makeStep("reflect", "What Did You Learn?", "Choose what you learned today.", "You did great! Think about what you learned.", chipSelect(reflectChips, "Write one thing you want to practice more."), materials),
    makeStep("complete", completeTitle, "You completed this lesson! Well done!", completeOwl, { type: "none" }, [], videoKw),
  ];
}

const journeys = {};

// JOURNEY 1: Adding 2-Digit and 1-Digit With Regrouping
journeys[lessonsData[0].id] = standardJourney(
  "Let's Add Big Numbers!", "Today you will add a 2-digit and 1-digit number. Sometimes we regroup!", "Hello! We are learning regrouping today. When ones add to 10 or more, we carry a ten!",
  "Add a 2-digit and 1-digit number with regrouping. Know when to carry.", "Your mission is mastering regrouping!",
  "Try 15 + 7. Will you regroup? Why?", "Think: 5 + 7 = 12. That's more than 10, so we regroup!",
  "To add 27 + 5: Add ones: 7 + 5 = 12. Write 2, carry 1 ten. Tens: 2 + 1 = 3. Answer: 32.", "Add ones first. If 10 or more, carry one ten to the tens place!",
  selfCheck("In 27 + 5, we regroup because 7 + 5 = 12.", "Yes"),
  "You have 36 marbles and get 8 more. How many?", 44,
  "45 + 7: Ones: 5 + 7 = 12, write 2 carry 1. Tens: 4 + 1 = 5. Answer: 52.", "Five plus seven equals twelve. Carry one. Four plus one equals five. Answer: 52!",
  "What is 34 + 8?", 42, "What is 38 + 5?", [["43", true], ["33", false], ["45", false]],
  ["I can regroup when adding.", "I add ones first then tens.", "I carry when ones make 10 or more."],
  "Regrouping Champion!", "You are a regrouping champion! Practice every day.",
  ["pencil", "notebook", "counters"], "Grade 2 addition with regrouping", "Owl teacher showing 27 + 5 with counters"
);

// JOURNEY 2: Adding 2-Digit and 1-Digit Without Regrouping
journeys[lessonsData[1].id] = standardJourney(
  "Easy Addition Today!", "Today you will add a 2-digit and 1-digit number. No regrouping needed!", "Hello! Today is simpler. The ones add to 9 or less — no carrying!",
  "Add a 2-digit and 1-digit number without regrouping.", "Your mission: easy addition!",
  "Try 23 + 4. Will you regroup?", "Three plus four equals seven. Less than 10 — no regrouping!",
  "To add 42 + 3: Add ones: 2 + 3 = 5. Tens stay: 4. Answer: 45.", "When ones add to 9 or less, the tens stay the same!",
  selfCheck("In 42 + 3, the tens digit stays as 4.", "Yes"),
  "There are 31 learners and 4 visitors come. How many people?", 35,
  "53 + 6: Ones: 3 + 6 = 9. Tens stay: 5. Answer: 59.", "Three plus six equals nine. Tens stay as five. Answer: 59!",
  "What is 61 + 5?", 66, "What is 54 + 3?", [["57", true], ["51", false], ["63", false]],
  ["I can add without regrouping.", "The tens stay the same.", "I add ones first, then tens."],
  "Easy Addition Star!", "You are an addition star! Keep practicing.",
  ["pencil", "notebook"], "Grade 2 addition without regrouping", "Happy owl showing 42 + 3 = 45"
);

// JOURNEY 3: Adding 3 Single Digit Numbers Horizontally
journeys[lessonsData[2].id] = [
  makeStep("welcome", "Three Numbers, One Sum!", "Today you add THREE single-digit numbers! Like 3 + 4 + 2 = ?", "Hello! Add two numbers first, then add the third.", { type: "none" }, ["pencil", "notebook", "counters"], "Grade 2 adding three numbers", "Owl with 3 + 4 + 2"),
  makeStep("mission", "Your Mission", "Add three single-digit numbers by adding two first, then the third.", "Add any two first, then the third. Look for pairs that make 10!", { type: "none" }, ["pencil"]),
  makeStep("think_first", "Try It!", "What is 2 + 3 + 4? Which two did you add first?", "You can add in any order! Try the pair that makes 10.", openInteraction("What is 2 + 3 + 4? Which two did you add first?"), ["pencil"]),
  makeStep("learn", "How to Add Three Numbers", "To add 4 + 3 + 2: Step 1: 4 + 3 = 7. Step 2: 7 + 2 = 9. Answer: 9!", "Add two first. Then add the third to your answer!", selfCheck("To add 5 + 2 + 3, I can do 5 + 2 = 7, then 7 + 3 = 10.", "Yes"), ["counters"], "Grade 2 three number addition", "4 + 3 + 2 step by step"),
  makeStep("connect", "Real Life", "You have 3 pencils, 4 erasers, and 2 rulers. How many items?", "Three groups: 3 + 4 + 2 = 9 items!", numericInteraction("3 + 4 + 2 = ?", 9), ["pencil"]),
  makeStep("example", "Worked Example", "6 + 2 + 4: 6 + 2 = 8, then 8 + 4 = 12. Or: 2 + 4 = 6, then 6 + 6 = 12!", "You can add in any order — same answer!", { type: "none" }, ["pencil"]),
  makeStep("practice", "Practice", "a) 3 + 5 + 2  b) 4 + 4 + 3", "Add two first, then the third!", numericInteraction("3 + 5 + 2 = ?", 10), ["counters", "pencil"]),
  makeStep("quick_check", "Quick Check", "What is 5 + 3 + 4?", "Add two numbers first, then the third!", mcInteraction("5 + 3 + 4 = ?", [["12", true], ["11", false], ["13", false]]), ["pencil"]),
  makeStep("reflect", "Reflect", "Choose what you learned.", "You added three numbers today!", chipSelect(["I can add three numbers by adding two first.", "I can add in any order.", "Making 10 helps me add faster."], "Write a tip for adding three numbers."), ["pencil"]),
  makeStep("complete", "Champion!", "You can add three numbers! Practice with objects at home.", "Three-number champion! Well done!", { type: "none" }, [], "Grade 2 celebration", "Child with three number cards"),
];

// JOURNEYS 4-17: Using standardJourney for remaining lessons
// JOURNEY 4: Adding 3 Single Digit Vertically
journeys[lessonsData[3].id] = [
  makeStep("welcome", "Stack and Add!", "Today you will write three numbers vertically — in a column — and add downward!", "Hello! Stacking numbers helps us organize our work.", { type: "none" }, ["pencil", "notebook"], "Grade 2 vertical addition", "Owl showing stacked numbers"),
  makeStep("mission", "Your Mission", "Write three single-digit numbers vertically and add them.", "Stack the numbers. Add from top to bottom!", { type: "none" }, ["pencil"]),
  makeStep("think_first", "Horizontal or Vertical?", "Look at 3 + 4 + 2. Can you write it as a column?", "Both ways give the same answer! Vertical keeps things neat.", openInteraction("Write 3 + 4 + 2 vertically. What is the answer?"), ["pencil"]),
  makeStep("learn", "Vertical Addition", "  3\n  4\n+ 2\n――\n  9\nStack them. Add top to bottom: 3 + 4 = 7, 7 + 2 = 9", "Stack neatly. Add from top to bottom!", selfCheck("In vertical addition, I add from top to bottom.", "Yes"), ["pencil"], "Grade 2 vertical format", "3 + 4 + 2 in column"),
  makeStep("connect", "Counting Groups", "3 children + 5 children + 2 children = ? children", "3 + 5 + 2. Three plus five equals eight, plus two equals 10!", numericInteraction("3 + 5 + 2 = ?", 10), ["pencil"]),
  makeStep("example", "Example: 4 + 5 + 3", "  4\n  5\n+ 3\n――\n 12\n4 + 5 = 9, 9 + 3 = 12", "Stack and add. Four plus five is nine, plus three is twelve!", { type: "none" }, ["pencil"]),
  makeStep("practice", "Practice", "a) 2 + 6 + 1  b) 5 + 3 + 4", "Stack them and add down!", numericInteraction("2 + 6 + 1 = ?", 9), ["pencil"]),
  makeStep("quick_check", "Quick Check", "What is 6 + 2 + 5?", "Stack and add from top to bottom!", mcInteraction("6 + 2 + 5 = ?", [["13", true], ["11", false], ["15", false]]), ["pencil"]),
  makeStep("reflect", "Reflect", "Choose what you learned.", "You learned vertical addition!", chipSelect(["I can write addition vertically.", "I add from top to bottom.", "Vertical keeps my work neat."], "Write one thing you like about vertical addition."), ["pencil"]),
  makeStep("complete", "Stacking Star!", "You can add vertically! Practice stacking numbers at home.", "Stacking star! Well done!", { type: "none" }, [], "Grade 2 celebration", "Child stacking number blocks"),
];

// JOURNEY 5: Adding Single Digit Numbers Vertically
journeys[lessonsData[4].id] = [
  makeStep("welcome", "Stack Your Addition!", "Today you add single-digit numbers by stacking them in a column!", "Hello! Vertical addition means stacking and adding down.", { type: "none" }, ["pencil", "notebook"], "Grade 2 vertical addition", "Owl showing 5 + 3 stacked"),
  makeStep("mission", "Your Mission", "Write single-digit addition in vertical form and solve.", "Stack the numbers. Add down the column!", { type: "none" }, ["pencil"]),
  makeStep("think_first", "Sideways or Down?", "Look at 4 + 2. Now write it as a column. Which is easier?", "Both work! Vertical helps with bigger numbers.", openInteraction("Write 4 + 2 vertically. What is the answer?"), ["pencil"]),
  makeStep("learn", "How to Write Vertically", "  7\n+ 4\n――\n 11\nStack them. Add: 7 + 4 = 11. Write below the line.", "Put one on top, one below. Draw a line. Add and write below!", selfCheck("In vertical addition, I write the answer below the line.", "Yes"), ["pencil"], "Grade 2 vertical format", "7 + 4 = 11 stacked"),
  makeStep("connect", "Shopping", "A sweet costs 3 shillings and a banana 4 shillings. Write it vertically. Total?", "3 + 4 written vertically. Three plus four equals seven shillings!", numericInteraction("3 + 4 = ?", 7), ["pencil"]),
  makeStep("example", "Example: 6 + 5", "  6\n+ 5\n――\n 11\nSix plus five equals eleven. Write below the line!", "Six plus five is eleven!", { type: "none" }, ["pencil"]),
  makeStep("practice", "Practice", "a) 5 + 3  b) 8 + 2  c) 4 + 7", "Stack and add!", numericInteraction("5 + 3 = ?", 8), ["pencil"]),
  makeStep("quick_check", "Quick Check", "What is 8 + 6?", "Stack and add!", mcInteraction("8 + 6 = ?", [["14", true], ["13", false], ["15", false]]), ["pencil"]),
  makeStep("reflect", "Reflect", "Choose what you learned.", "You learned vertical addition!", chipSelect(["I can write addition vertically.", "I add down the column.", "Vertical keeps my work organized."], "Write why vertical addition is useful."), ["pencil"]),
  makeStep("complete", "Stacking Star!", "You can write and solve addition vertically!", "Stacking star! Great work!", { type: "none" }, [], "Grade 2 celebration", "Child stacking numbers"),
];

// JOURNEY 6: Adding Two 2-Digit Numbers With Regrouping
journeys[lessonsData[5].id] = standardJourney(
  "Adding Two Big Numbers!", "Today you add two 2-digit numbers. Sometimes both ones and tens need regrouping!", "Hello! Adding two 2-digit numbers. Ones first, then tens. Regroup when needed!",
  "Add two 2-digit numbers with regrouping.", "Your mission: master big number addition!",
  "Look at 35 + 28. Add ones: 5 + 8 = 13. Will you regroup?", "Five plus eight equals thirteen. More than ten — regroup!",
  "To add 35 + 28: Ones: 5 + 8 = 13, write 3 carry 1. Tens: 3 + 2 + 1 = 6. Answer: 63.", "Add ones first. Carry if needed. Then add all tens!", selfCheck("In 35 + 28, we carry 1 ten because 5 + 8 = 13.", "Yes"),
  "You have 42 books and get 19 more. How many books?", 61,
  "  47\n+ 36\n――\n  83\n7 + 6 = 13, write 3 carry 1. 4 + 3 + 1 = 8. Answer: 83.", "Seven plus six is thirteen. Carry one. Four plus three plus one is eight!", "a) 28 + 34  b) 56 + 27", 62, "What is 36 + 27?", [["63", true], ["53", false], ["73", false]],
  ["I can add two 2-digit numbers with regrouping.", "I add ones first, then tens.", "I carry when ones make 10 or more."],
  "Big Number Champion!", "You are a big number champion! Keep practicing!",
  ["pencil", "notebook", "counters"], "Grade 2 two-digit addition regrouping", "Owl showing 35 + 28 with blocks"
);

// JOURNEY 7: Adding Two 2-Digit Numbers Without Regrouping
journeys[lessonsData[6].id] = standardJourney(
  "Easy Two-Digit Addition!", "Today you add two 2-digit numbers. Ones add to 9 or less — no regrouping!", "Hello! Today is simple. No regrouping needed!",
  "Add two 2-digit numbers without regrouping.", "Your mission: easy two-digit addition!",
  "Look at 23 + 34. Ones: 3 + 4 = 7. Will you regroup?", "Three plus four equals seven. Less than ten — no regrouping!",
  "To add 23 + 34: Ones: 3 + 4 = 7. Tens: 2 + 3 = 5. Answer: 57.", "Add ones and tens separately. No regrouping!", selfCheck("In 23 + 34, I add ones (3+4=7) and tens (2+3=5) to get 57.", "Yes"),
  "Group A has 31 children. Group B has 25. How many altogether?", 56,
  "  42\n+ 16\n――\n  58\n2 + 6 = 8. 4 + 1 = 5. Answer: 58.", "Two plus six is eight. Four plus one is five. Answer: 58!",
  "a) 31 + 24  b) 52 + 36", 55, "What is 53 + 26?", [["79", true], ["78", false], ["89", false]],
  ["I can add two 2-digit numbers without regrouping.", "I add ones and tens separately.", "No regrouping when ones add to 9 or less."],
  "Easy Addition Expert!", "You are an easy addition expert!",
  ["pencil", "notebook"], "Grade 2 two-digit addition no regrouping", "Happy owl showing 23 + 34"
);

// JOURNEY 8: Adding Using the Number Line
journeys[lessonsData[7].id] = [
  makeStep("welcome", "Jump Along the Number Line!", "Today you add by jumping forward on a number line!", "Hello! A number line is a path of numbers. We jump forward to add!", { type: "none" }, ["pencil", "notebook"], "Grade 2 number line", "Owl on number line"),
  makeStep("mission", "Your Mission", "Use a number line to add numbers by jumping forward.", "Start at one number. Jump forward. Where you land is the answer!", { type: "none" }, ["pencil"]),
  makeStep("think_first", "Try It!", "Draw 0-20. Put your finger on 5. Jump 3 forward. Where do you land?", "Start at 5. Jump: 6, 7, 8. You land on 8!", openInteraction("Start at 5, jump 3. What number?"), ["pencil"]),
  makeStep("learn", "Number Line Addition", "To add 5 + 3: Start at 5. Jump 3 times: 6, 7, 8. Land on 8! 5 + 3 = 8", "Start at the first number. Jump forward. Land on the answer!", selfCheck("To add 7 + 4, start at 7 and jump 4 to reach 11.", "Yes"), ["pencil"], "Grade 2 number line addition", "Number line 5 → 8"),
  makeStep("connect", "Jumping Game", "Stand on 10. Jump 6 steps forward. What number?", "Start at 10, jump 6: 11,12,13,14,15,16. You're on 16!", numericInteraction("Start at 10, jump 6. What number?", 16), []),
  makeStep("example", "Example: 12 + 5", "Start at 12. Jump 5: 13,14,15,16,17. Land on 17! 12 + 5 = 17", "Start at twelve. Five jumps. Land on seventeen!", { type: "none" }, ["pencil"]),
  makeStep("practice", "Practice", "a) 8 + 4  b) 15 + 3", "Draw a number line. Jump and add!", numericInteraction("8 + 4 = ?", 12), ["pencil"]),
  makeStep("quick_check", "Quick Check", "What is 9 + 6 on a number line?", "Start at 9. Jump 6 forward!", mcInteraction("9 + 6 = ?", [["15", true], ["14", false], ["16", false]]), ["pencil"]),
  makeStep("reflect", "Reflect", "Choose what you learned.", "You learned number line addition!", chipSelect(["I can add on a number line.", "I start at the first number and jump forward.", "Number lines help me see addition."], "Write why number lines help."), ["pencil"]),
  makeStep("complete", "Number Line Jumper!", "You can add using a number line!", "Number line jumper! Great work!", { type: "none" }, [], "Grade 2 celebration", "Child jumping on number line"),
];

// JOURNEYS 9-17: Compact standard journeys
// JOURNEY 9: Addition Patterns up to 100
journeys[lessonsData[8].id] = [
  makeStep("welcome", "Number Patterns!", "Today you find patterns in addition. Numbers follow rules!", "Hello! Patterns are puzzles. Find the rule, predict what comes next!", { type: "none" }, ["pencil", "notebook"], "Grade 2 patterns", "Owl with number patterns"),
  makeStep("mission", "Your Mission", "Find patterns in addition and predict the next number.", "Be a pattern detective! Find the rule!", { type: "none" }, ["pencil"]),
  makeStep("think_first", "See the Pattern?", "10, 20, 30, 40, __. What comes next?", "Add 10 each time. Next is 50!", openInteraction("10,20,30,40,__? What is the rule?"), ["pencil"]),
  makeStep("learn", "Finding Patterns", "Pattern: 5,10,15,20,25. Rule: Add 5! To find the rule: 10-5=5.", "Check the difference between numbers. That's your rule!", selfCheck("In 3,6,9,12 the rule is add 3.", "Yes"), ["pencil"], "Grade 2 finding patterns", "Pattern with +5 arrows"),
  makeStep("connect", "Real Patterns", "Eggs: Day 1=2, Day 2=4, Day 3=6. How many on Day 5?", "Pattern: 2,4,6,8,10. Day 5 = 10 eggs!", numericInteraction("Pattern 2,4,6,8,__. Next?", 10), ["pencil"]),
  makeStep("example", "Example: 15,20,25,30,__", "Rule: 20-15=5. Add 5. Next: 30+5=35", "Difference is 5. Rule is add five. Thirty plus five is 35!", { type: "none" }, ["pencil"]),
  makeStep("practice", "Practice", "a) 4,8,12,16,__  b) 10,13,16,19,__", "Find the rule, then the next number!", numericInteraction("4,8,12,16,__?", 20), ["pencil"]),
  makeStep("quick_check", "Quick Check", "What comes next: 7,14,21,28,__?", "Find the rule!", mcInteraction("7,14,21,28,__?", [["35", true], ["30", false], ["42", false]]), ["pencil"]),
  makeStep("reflect", "Reflect", "Choose what you learned.", "You found patterns!", chipSelect(["I can find the rule in a pattern.", "I can predict the next number.", "I find the rule by checking differences."], "Write your own pattern."), ["pencil"]),
  makeStep("complete", "Pattern Detective!", "You can find and continue patterns!", "Pattern detective! Excellent!", { type: "none" }, [], "Grade 2 celebration", "Detective with patterns"),
];

// JOURNEY 10: Assessment and Review
journeys[lessonsData[9].id] = [
  makeStep("welcome", "Show What You Know!", "Today you review all your addition skills. Time to shine!", "Hello! You have learned so much. Let's review together!", { type: "none" }, ["pencil", "notebook"], "Grade 2 review", "Owl with checklist"),
  makeStep("mission", "Your Mission", "Review and practice all addition skills.", "Show what you can do! You are ready!", { type: "none" }, ["pencil"]),
  makeStep("think_first", "What Do You Know?", "Name three types of addition you learned.", "Single digits, regrouping, number line, patterns — so many!", openInteraction("Name three addition types you learned."), ["pencil"]),
  makeStep("learn", "Skills Review", "You learned: single-digit addition, regrouping, no regrouping, number line, three numbers, vertical, patterns.", "So many skills! Let's practice them all!", selfCheck("I learned at least 5 addition skills.", "Yes"), ["pencil"], "Grade 2 skills review", "Mind map of skills"),
  makeStep("connect", "Real Life Addition", "Give an example of addition you used this week.", "Addition is everywhere — home, school, market!", openInteraction("Tell about addition you used in real life."), ["pencil"]),
  makeStep("example", "Mixed Practice", "a) 23+15  b) 7+8  c) 4+3+2  d) 36+27", "Use the best strategy for each!", numericInteraction("23+15=?", 38), ["pencil"]),
  makeStep("practice", "Practice", "a) 45+23  b) 6+9  c) 3+5+4", "Choose your strategy!", numericInteraction("45+23=?", 68), ["pencil"]),
  makeStep("quick_check", "Quick Check", "What is 34+28?", "Think carefully!", mcInteraction("34+28=?", [["62", true], ["52", false], ["64", false]]), ["pencil"]),
  makeStep("reflect", "Reflect", "Choose your best skill. Write what to practice.", "You are an addition master!", chipSelect(["I can add with regrouping.", "I can add without regrouping.", "I can add three numbers.", "I can add on a number line."], "Write one skill to practice more."), ["pencil"]),
  makeStep("complete", "Addition Master!", "You reviewed all your skills!", "Addition master! Keep practicing!", { type: "none" }, [], "Grade 2 celebration", "Graduation cap"),
];

// JOURNEY 11: Community Application
journeys[lessonsData[10].id] = [
  makeStep("welcome", "Addition in Our Community!", "Today you solve real problems from your community!", "Hello! People use addition every day — at home, school, market!", { type: "none" }, ["pencil", "notebook"], "Grade 2 community", "Owl in village scene"),
  makeStep("mission", "Your Mission", "Solve addition problems from community life.", "Be a community mathematician!", { type: "none" }, ["pencil"]),
  makeStep("think_first", "Where Do People Add?", "Where in your community do people use addition?", "Market, school, home — everywhere!", openInteraction("Give one example of community addition."), ["pencil"]),
  makeStep("learn", "Community Addition", "Market: 5+3=8 oranges. School: 25+22=47 learners. Home: 10+6=16 cups.", "People add every day!", selfCheck("A shopkeeper adds money amounts.", "Yes"), ["pencil"], "Grade 2 community examples", "Market, school, home scenes"),
  makeStep("connect", "Help at Home", "Count plates: 8 big + 5 small = ?", "8+5=13 plates! You are a great helper!", numericInteraction("8+5=?", 13), ["pencil"]),
  makeStep("example", "Market Problem", "Tomatoes 25sh + onions 18sh = ? 25+18=43 shillings", "Twenty-five plus eighteen. Five plus eight is thirteen, carry one. Two plus one plus one is four. Forty-three shillings!", numericInteraction("25+18=?", 43), ["pencil"]),
  makeStep("practice", "Practice", "a) 34 cows + 15 goats = ? b) 28 trees + 17 trees = ?", "Read carefully. What is being added?", numericInteraction("34+15=?", 49), ["pencil"]),
  makeStep("quick_check", "Quick Check", "42 in Class 2A + 35 in Class 2B = ?", "Add the groups!", mcInteraction("42+35=?", [["77", true], ["75", false], ["87", false]]), ["pencil"]),
  makeStep("reflect", "Reflect", "Choose what you learned. Write how you'll use addition.", "You are a community mathematician!", chipSelect(["I can solve community problems.", "I can add money amounts.", "I can add groups of things."], "Write how you'll use addition this week."), ["pencil"]),
  makeStep("complete", "Community Mathematician!", "You use addition in the community!", "Community mathematician! Well done!", { type: "none" }, [], "Grade 2 celebration", "Children helping community"),
];

// JOURNEY 12: Creating Number Patterns
journeys[lessonsData[11].id] = [
  makeStep("welcome", "Create Your Own Patterns!", "Today you CREATE number patterns — you make the rules!", "Hello! You are a pattern artist. Choose a start number and a rule!", { type: "none" }, ["pencil", "notebook"], "Grade 2 creating patterns", "Owl painting numbers"),
  makeStep("mission", "Your Mission", "Create your own addition patterns and explain the rule.", "Be a pattern creator!", { type: "none" }, ["pencil"]),
  makeStep("think_first", "Make a Pattern", "Start at 2, add 3. Write 5 numbers.", "2,5,8,11,14! Rule: add 3!", openInteraction("Start at 2, add 3. Write 5 numbers."), ["pencil"]),
  makeStep("learn", "Creating Patterns", "Step 1: Choose start (like 4). Step 2: Choose rule (like add 6). Step 3: Keep adding! 4,10,16,22,28", "You are the boss! Choose any start and rule!", selfCheck("Start at 3, add 4: 3,7,11,15,19.", "Yes"), ["pencil"], "Grade 2 pattern creation", "Pattern creation steps"),
  makeStep("connect", "Nature Patterns", "Flower petals: 5,8,13... Nature has patterns!", "Pinecones, petals, seeds — all have patterns!", openInteraction("Find a pattern in nature."), ["pencil"]),
  makeStep("example", "Example: Start 5, add 5", "5,10,15,20,25,30. Rule: Add 5. It's the 5 times table!", "Five, ten, fifteen, twenty, twenty-five, thirty! The 5 times table!", { type: "none" }, ["pencil"]),
  makeStep("practice", "Practice", "Create: a) Start 1, add 4  b) Start 10, add 10  c) Your choice!", "Be creative! Write 5 numbers each.", openInteraction("Write your three patterns."), ["pencil"]),
  makeStep("quick_check", "Quick Check", "Rule for: 6,12,18,24,30?", "Find the rule!", mcInteraction("Rule for 6,12,18,24,30?", [["Add 6", true], ["Add 5", false], ["Add 4", false]]), ["pencil"]),
  makeStep("reflect", "Reflect", "Choose what you learned. Write your favourite pattern.", "You are a pattern creator!", chipSelect(["I can create patterns.", "I can explain the rule.", "Patterns are everywhere."], "Write your favourite pattern."), ["pencil"]),
  makeStep("complete", "Pattern Creator!", "You created your own patterns!", "Pattern creator! Excellent!", { type: "none" }, [], "Grade 2 celebration", "Colorful patterns"),
];

// JOURNEY 13: Digital Games
journeys[lessonsData[12].id] = [
  makeStep("welcome", "Play and Learn!", "Today you practice addition through digital games!", "Hello! Games make addition fun!", { type: "none" }, ["pencil", "notebook"], "Grade 2 digital games", "Owl on tablet"),
  makeStep("mission", "Your Mission", "Practice addition through games — digital or traditional!", "Play and learn!", { type: "none" }, ["pencil"]),
  makeStep("think_first", "Learning Games?", "Have you played a learning game? What did it teach?", "Games teach numbers, letters, addition!", openInteraction("Tell about a learning game you played."), ["pencil"]),
  makeStep("learn", "Addition Games", "Games: number matching, racing, puzzles, quizzes. Play 15-20 min, then break!", "Games give instant feedback!", selfCheck("Digital games help practice addition.", "Yes"), ["pencil"], "Grade 2 game types", "Game screens"),
  makeStep("connect", "No Device? No Problem!", "Play addition with cards, dice, or paper!", "Card games, dice games, number puzzles!", openInteraction("Name a game without devices."), ["pencil"]),
  makeStep("example", "Quiz Game", "Game shows: 25+17=? You think: 5+7=12, regroup. 2+1+1=4. Answer: 42! 'Correct! +10 points!'", "Games give quick practice!", numericInteraction("25+17=?", 42), ["pencil"]),
  makeStep("practice", "Practice", "a) 33+19  b) 46+27", "Quiz yourself!", numericInteraction("33+19=?", 52), ["pencil"]),
  makeStep("quick_check", "Quick Check", "Quick! 15+28?", "Game time!", mcInteraction("15+28=?", [["43", true], ["33", false], ["45", false]]), ["pencil"]),
  makeStep("reflect", "Reflect", "Choose what you learned. Write your favourite way to practice.", "You practiced through games!", chipSelect(["I can use digital games.", "Games make practice fun.", "I can play without devices."], "Write your favourite practice way."), ["pencil"]),
  makeStep("complete", "Game Master!", "You practiced through games!", "Game master! Well done!", { type: "none" }, [], "Grade 2 celebration", "Game controller"),
];

// JOURNEY 14: Missing Numbers in Patterns
journeys[lessonsData[13].id] = [
  makeStep("welcome", "Find the Missing Number!", "Today you are a number detective. Find missing numbers in patterns!", "Hello! Numbers are hiding. Find them!", { type: "none" }, ["pencil", "notebook"], "Grade 2 missing numbers", "Detective owl"),
  makeStep("mission", "Your Mission", "Find missing numbers in addition patterns.", "Be a number detective!", { type: "none" }, ["pencil"]),
  makeStep("think_first", "What's Missing?", "5,10,__,20,25. What is missing?", "Rule: add 5. Missing: 15!", openInteraction("5,10,__,20,25. Missing number?"), ["pencil"]),
  makeStep("learn", "Finding Missing Numbers", "Step 1: Find rule (12-8=4). Step 2: Apply rule (12+4=16). Check: 16+4=20!", "Find the rule, fill the gap, check your answer!", selfCheck("In 7,10,__,16 the rule is add 3. Missing: 13.", "Yes"), ["pencil"], "Grade 2 missing number steps", "Pattern with blank"),
  makeStep("connect", "Missing Prices", "Prices: 10,20,__,40,50. Missing price?", "Rule: add 10. Missing: 30 shillings!", numericInteraction("10,20,__,40,50. Missing?", 30), ["pencil"]),
  makeStep("example", "Example: 15,__,25,30", "Rule: 30-25=5. Missing: 15+5=20. Check: 20+5=25!", "Rule is add five. Fifteen plus five is twenty!", { type: "none" }, ["pencil"]),
  makeStep("practice", "Practice", "a) 3,6,__,12  b) 20,__,30,35", "Find rule, then missing number!", numericInteraction("3,6,__,12. Missing?", 9), ["pencil"]),
  makeStep("quick_check", "Quick Check", "Missing: 9,13,__,21?", "Find the rule!", mcInteraction("9,13,__,21. Missing?", [["17", true], ["15", false], ["19", false]]), ["pencil"]),
  makeStep("reflect", "Reflect", "Choose what you learned. Write the steps.", "You are a number detective!", chipSelect(["I can find missing numbers.", "I find the rule first.", "I check my answer."], "Write the steps to find a missing number."), ["pencil"]),
  makeStep("complete", "Number Detective!", "You found missing numbers!", "Number detective! Great work!", { type: "none" }, [], "Grade 2 celebration", "Detective badge"),
];

// JOURNEY 15: Practice and Application
journeys[lessonsData[14].id] = [
  makeStep("welcome", "Practice Makes Perfect!", "Today you practice all your addition skills!", "Hello! Every problem makes you stronger!", { type: "none" }, ["pencil", "notebook"], "Grade 2 practice", "Owl with worksheet"),
  makeStep("mission", "Your Mission", "Practice different types of addition. Choose the best strategy!", "Practice, practice, practice!", { type: "none" }, ["pencil"]),
  makeStep("think_first", "Best Strategy?", "For 45+23, what do you do first? What about 7+8?", "Different problems need different strategies!", openInteraction("What is your favourite addition strategy?"), ["pencil"]),
  makeStep("learn", "Choosing Strategies", "No regrouping: add ones and tens separately. Regrouping: add ones, carry. Number line: jump forward.", "Look at the numbers first, then choose!", selfCheck("For 56+23, no regrouping because 6+3=9<10.", "Yes"), ["pencil"], "Grade 2 strategies", "Strategy cards"),
  makeStep("connect", "Shop Addition", "Book 35sh + pencil 12sh = ?", "35+12=47 shillings!", numericInteraction("35+12=?", 47), ["pencil"]),
  makeStep("example", "Example: 47+28", "  47\n+ 28\n――\n  75\n7+8=15, write 5 carry 1. 4+2+1=7. Answer: 75.", "Seven plus eight is fifteen. Carry one. Four plus two plus one is seven!", { type: "none" }, ["pencil"]),
  makeStep("practice", "Practice", "a) 34+25  b) 56+18  c) 23+49", "Choose your strategy!", numericInteraction("34+25=?", 59), ["pencil"]),
  makeStep("quick_check", "Quick Check", "What is 38+27?", "Think carefully!", mcInteraction("38+27=?", [["65", true], ["55", false], ["63", false]]), ["pencil"]),
  makeStep("reflect", "Reflect", "Choose what you learned. Write your best tip.", "You practiced a lot!", chipSelect(["I can choose the best strategy.", "I can add with and without regrouping.", "Practice makes me faster."], "Write your best addition tip."), ["pencil"]),
  makeStep("complete", "Practice Champion!", "You practiced addition today!", "Practice champion! Keep going!", { type: "none" }, [], "Grade 2 celebration", "Champion certificate"),
];

// JOURNEY 16: Word Problems with 2-Digit Numbers
journeys[lessonsData[15].id] = [
  makeStep("welcome", "Story Problems!", "Today you solve word problems — addition hidden in stories!", "Hello! Read carefully, find the numbers, add!", { type: "none" }, ["pencil", "notebook"], "Grade 2 word problems", "Owl reading storybook"),
  makeStep("mission", "Your Mission", "Read, understand, and solve 2-digit addition word problems.", "Read, think, add!", { type: "none" }, ["pencil"]),
  makeStep("think_first", "What's the Story?", "Maria has 24 flowers. Friend gives 18 more. How many?", "24+18. Read, find numbers, add!", openInteraction("Maria: 24 flowers + 18 more = ?"), ["pencil"]),
  makeStep("learn", "Solving Word Problems", "Steps: 1) Read twice 2) Find numbers 3) Decide: addition? 4) Write sentence 5) Solve 6) Check", "Read twice before starting!", selfCheck("I read the problem at least twice.", "Yes"), ["pencil"], "Grade 2 word problem steps", "6-step flowchart"),
  makeStep("connect", "School Problem", "School has 45 trees. Community plants 28 more. How many trees?", "45+28=73 trees!", numericInteraction("45+28=?", 73), ["pencil"]),
  makeStep("example", "Market Problem", "36 oranges Monday + 27 oranges Tuesday = ? 36+27=63 oranges", "Thirty-six plus twenty-seven. Six plus seven is thirteen, carry one. Three plus two plus one is six. Sixty-three oranges!", numericInteraction("36+27=?", 63), ["pencil"]),
  makeStep("practice", "Practice", "a) 34 boys + 29 girls = ? b) 47 chickens + 25 ducks = ?", "Read, find numbers, add!", numericInteraction("34+29=?", 63), ["pencil"]),
  makeStep("quick_check", "Quick Check", "Peter has 43 marbles. Wins 19 more. How many now?", "Read and add!", mcInteraction("43+19=?", [["62", true], ["52", false], ["64", false]]), ["pencil"]),
  makeStep("reflect", "Reflect", "Choose what you learned. Write your own word problem.", "You solved word problems!", chipSelect(["I can solve word problems.", "I read carefully first.", "I can write my own problems."], "Write your own word problem."), ["pencil"]),
  makeStep("complete", "Word Problem Solver!", "You can solve word problems!", "Word problem solver! Excellent!", { type: "none" }, [], "Grade 2 celebration", "Storybooks with numbers"),
];

// JOURNEY 17: Breaking Numbers Apart to Make 10
journeys[lessonsData[16].id] = [
  makeStep("welcome", "Break It Apart!", "Today you learn to break numbers apart to make 10. This makes adding easier!", "Hello! Making 10 is a superpower!", { type: "none" }, ["pencil", "notebook", "counters"], "Grade 2 make 10", "Owl breaking 8 into 6+2"),
  makeStep("mission", "Your Mission", "Break numbers apart to make 10 and add faster.", "Master the make-10 strategy!", { type: "none" }, ["pencil"]),
  makeStep("think_first", "Friends of 10", "What makes 10 with 6? With 8? With 3?", "6+4=10, 8+2=10, 3+7=10!", openInteraction("What makes 10 with: 6? 8? 3? 9?"), ["pencil"]),
  makeStep("learn", "Make-10 Strategy", "To add 8+5: Break 5 into 2+3 (because 8+2=10). Then 10+3=13. So 8+5=13!", "Break to make 10, then add what's left!", selfCheck("7+6: break 6 into 3+3. 7+3=10, 10+3=13.", "Yes"), ["counters"], "Grade 2 make 10 strategy", "8+5 as 8+2+3=13"),
  makeStep("connect", "Quick Addition", "Use make-10 for 9+4. Break 4 into 1+3. 9+1=10, 10+3=13!", "Nine plus four. Break four into one plus three. Nine plus one is ten, plus three is thirteen!", numericInteraction("9+4 using make-10 = ?", 13), ["counters"]),
  makeStep("example", "Example: 6+7", "Break 7 into 4+3 (because 6+4=10). 6+4=10, 10+3=13. Answer: 13", "Six plus seven. Break seven into four plus three. Six plus four is ten, plus three is thirteen!", { type: "none" }, ["counters"]),
  makeStep("practice", "Practice", "a) 8+6 (break 6 into 2+4)  b) 9+5 (break 5 into 1+4)", "Break to make 10!", numericInteraction("8+6 using make-10 = ?", 14), ["counters"]),
  makeStep("quick_check", "Quick Check", "7+5 using make-10?", "Break 5 to make 10 with 7!", mcInteraction("7+5 = ?", [["12", true], ["11", false], ["13", false]]), ["pencil"]),
  makeStep("reflect", "Reflect", "Choose what you learned. Write how make-10 helps.", "You learned make-10!", chipSelect(["I can break numbers to make 10.", "Make-10 helps me add faster.", "I break the smaller number to make 10."], "Write how make-10 helps you."), ["pencil"]),
  makeStep("complete", "Make-10 Master!", "You can break numbers to make 10!", "Make-10 master! Well done!", { type: "none" }, [], "Grade 2 celebration", "Child with 10-block"),
];

// JOURNEY 18: Capacity in Litres - Practice and Assessment
journeys[lessonsData[17].id] = [
  makeStep("welcome", "Measuring Litres!", "Today you practice measuring capacity in litres!", "Hello! Capacity is how much a container holds. We measure in litres!", { type: "none" }, ["pencil", "notebook"], "Grade 2 capacity litres", "Owl with measuring jug"),
  makeStep("mission", "Your Mission", "Practice measuring and adding capacity in litres.", "Be a capacity expert!", { type: "none" }, ["pencil"]),
  makeStep("think_first", "What Holds Litres?", "Name three things measured in litres.", "Water bottles, jerrycans, cooking pots!", openInteraction("Name three things measured in litres."), ["pencil"]),
  makeStep("learn", "Adding Litres", "If a jug has 3 litres and you add 2 more: 3+2=5 litres. A bucket has 10 litres. You pour out 4. 10-4=6 litres left.", "Adding and subtracting litres is just like adding and subtracting numbers!", selfCheck("3 litres + 2 litres = 5 litres.", "Yes"), ["pencil"], "Grade 2 adding litres", "Jugs with litre marks"),
  makeStep("connect", "At Home", "Mother has a 5-litre jerrycan and a 2-litre bottle. How much water altogether?", "5+2=7 litres of water!", numericInteraction("5+2=?", 7), ["pencil"]),
  makeStep("example", "Example: 8L + 4L", "8 litres + 4 litres = 12 litres. Count: 8,9,10,11,12!", "Eight plus four is twelve litres!", { type: "none" }, ["pencil"]),
  makeStep("practice", "Practice", "a) 6L+3L  b) 9L+5L  c) 4L+4L", "Add the litres!", numericInteraction("6+3=?", 9), ["pencil"]),
  makeStep("quick_check", "Quick Check", "A container has 7 litres. You add 6 more. How many litres?", "Add the litres!", mcInteraction("7+6=?", [["13", true], ["12", false], ["14", false]]), ["pencil"]),
  makeStep("reflect", "Reflect", "Choose what you learned. Write how you use capacity at home.", "You practiced capacity!", chipSelect(["I can add litres.", "I can measure capacity.", "Capacity is used at home every day."], "Write how you use capacity at home."), ["pencil"]),
  makeStep("complete", "Capacity Expert!", "You can measure and add in litres!", "Capacity expert! Great work!", { type: "none" }, [], "Grade 2 celebration", "Child measuring water"),
];

// JOURNEY 19: Capacity in Litres - Real-Life Practice
journeys[lessonsData[18].id] = [
  makeStep("welcome", "Litres in Real Life!", "Today you use litres to solve real problems — cooking, farming, and daily life!", "Hello! Litres are used every day. Let's solve real problems!", { type: "none" }, ["pencil", "notebook"], "Grade 2 real life capacity", "Owl in kitchen scene"),
  makeStep("mission", "Your Mission", "Solve real-life capacity problems using addition and subtraction.", "Be a real-life mathematician!", { type: "none" }, ["pencil"]),
  makeStep("think_first", "Where Do We Use Litres?", "Where do people use litres in your home or community?", "Cooking, farming, fetching water, buying drinks!", openInteraction("Where do people use litres in your community?"), ["pencil"]),
  makeStep("learn", "Real-Life Litre Problems", "Cooking: 2L water + 3L milk = 5L total. Fetching: 10L jerrycan - 4L used = 6L left.", "Real problems use the same addition and subtraction skills!", selfCheck("2 litres + 3 litres = 5 litres.", "Yes"), ["pencil"], "Grade 2 real life litres", "Kitchen and farm scenes"),
  makeStep("connect", "Helping Mother", "Mother needs 8 litres of water. She has a 5L and a 3L container. Will that be enough?", "5+3=8 litres. Yes, exactly enough!", numericInteraction("5+3=?", 8), ["pencil"]),
  makeStep("example", "Market Problem", "Mama buys 6 litres of milk on Monday and 4 litres on Tuesday. How much milk altogether?", "6+4=10 litres of milk!", numericInteraction("6+4=?", 10), ["pencil"]),
  makeStep("practice", "Practice", "a) 7L+5L  b) 12L-4L  c) Mother has 9L, uses 3L. How much left?", "Solve each problem!", numericInteraction("7+5=?", 12), ["pencil"]),
  makeStep("quick_check", "Quick Check", "A jerrycan has 15 litres. You pour out 6 litres. How much is left?", "Subtract!", mcInteraction("15-6=?", [["9", true], ["8", false], ["10", false]]), ["pencil"]),
  makeStep("reflect", "Reflect", "Choose what you learned. Write one way you'll use litres at home.", "You solved real capacity problems!", chipSelect(["I can add litres.", "I can subtract litres.", "I use litres in daily life."], "Write how you'll use litres at home."), ["pencil"]),
  makeStep("complete", "Real-Life Capacity Star!", "You can solve real capacity problems!", "Capacity star! Well done!", { type: "none" }, [], "Grade 2 celebration", "Child helping with water"),
];

// ═══════════════════════════════════════════════════════════════════════════════
// SAVE TO DATABASE
// ═══════════════════════════════════════════════════════════════════════════════
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
      const { data: current } = await supabase.from("Lesson").select("contentBlocks").eq("id", lesson.id).single();
      if (current?.contentBlocks) {
        existingMeta = JSON.parse(current.contentBlocks);
      }
    } catch {}
    
    const newMeta = {
      ...existingMeta,
      studentJourneyDraft: journey,
      aiMetadata: {
        model: "structured-template-v2",
        promptVersion: "batch-2-standard",
        generatedAt: new Date().toISOString(),
        reviewStatus: "NEEDS_REVIEW",
        batchId: BATCH_ID,
      },
    };
    
    const { error } = await supabase.from("Lesson").update({
      contentBlocks: JSON.stringify(newMeta),
      updatedAt: new Date().toISOString(),
    }).eq("id", lesson.id);
    
    if (error) {
      console.log(`❌ ${lesson.title}: ${error.message}`);
      errors++;
    } else {
      console.log(`✅ ${lesson.title}: ${journey.length} steps saved`);
      saved++;
    }
    
    await new Promise(r => setTimeout(r, 150)); // Rate limit
  }
  
  console.log(`\n=== RESULTS ===`);
  console.log(`Saved: ${saved}`);
  console.log(`Errors: ${errors}`);
  console.log(`Skipped: ${skipped}`);
}

saveJourneys().catch(console.error);
