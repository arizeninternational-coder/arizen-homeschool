const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

const envContent = fs.readFileSync(".env", "utf-8");
const envVars = {};
envContent.split("\n").forEach(line => {
  const [key, ...rest] = line.split("=");
  if (key && rest.length) {
    envVars[key.trim()] = rest.join("=").trim().replace(/^["']|["']$/g, "");
  }
});

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const BATCH_ID = "grade-2-math-batch-1";

function makeStep(stepType, title, studentText, owlText, interaction, materials = [], videoKeywords = "", illustrationPrompt = "") {
  return {
    id: stepType, stepType, title, studentText, owlText, visualType: "owl_teacher",
    illustrationPrompt, interaction, materials,
    video: { required: false, searchKeywords: videoKeywords, approvedUrl: null, approvedByAdmin: false },
  };
}
function mcInteraction(question, options) { return { type: "multiple_choice", question, options: options.map((opt, i) => ({ id: String.fromCharCode(97 + i), label: opt[0], correct: opt[1] })) }; }
function openInteraction(prompt) { return { type: "open_response", prompt }; }
function selfCheck(question, answer) { return { type: "self_check", question, answer }; }
function numericInteraction(prompt, expected) { return { type: "open_numeric", prompt, expectedAnswer: expected }; }
function chipSelect(chips, writePrompt = "") { return { type: "chip_select_plus_write", prompt: "Choose what you learned today:", chips, writePrompt }; }

function generateJourney() {
  return [
    makeStep("welcome", "Let's Add Numbers!", "Today we learn to add single digit numbers. Adding means putting numbers together.", "Hello! Adding is like collecting things. If you have 3 pencils and get 2 more, how many?", { type: "none" }, ["pencil", "notebook", "counters"], "Grade 2 addition single digit", "A cartoon owl holding pencils"),
    makeStep("mission", "Your Addition Mission", "By the end of this lesson, you will add single digit numbers horizontally and write addition sentences.", "Your mission is to become an addition expert!", { type: "none" }, ["pencil", "notebook", "counters"]),
    makeStep("think_first", "How Many Altogether?", "You have 4 bottle tops. Your friend gives you 3 more. How many altogether?", "This is adding! We put 4 and 3 together.", numericInteraction("4 + 3 = ?", 7), ["bottle tops", "pencil"]),
    makeStep("learn", "Adding Horizontally", "We write: 4 + 3 = 7. The + means 'put together'. The = means 'is the same as'.", "The + sign means put together. The = sign means 'the answer is'.", selfCheck("What does the + sign mean?", "Put together"), ["pencil", "notebook"], "Grade 2 addition horizontal", "'4 + 3 = 7' with circles merging"),
    makeStep("connect", "Add With Your Fingers", "Hold up 5 fingers on one hand. Hold up 2 on the other. Put them together. How many?", "Your fingers are adding machines! 5 + 2 = 7!", numericInteraction("5 + 2 = ?", 7), ["your hands"], "Grade 2 addition with fingers", "Two hands showing 5 and 2 fingers"),
    makeStep("example", "Worked Example", "There are 6 cups. Add 3 more. Count: 6 + 3 = 9 cups.", "Start at 6, count 3 more: 7, 8, 9. So 6 + 3 = 9!", numericInteraction("5 + 4 = ?", 9), ["cups", "books", "pencil", "notebook"], "Grade 2 addition with objects", "6 cups + 3 cups = 9 cups"),
    makeStep("practice", "Try Together", "Take 7 counters. Add 2 more. Write: 7 + 2 = ?", "Count all counters. Start at 7, count 2 more: 8, 9.", numericInteraction("7 + 2 = ?", 9), ["counters", "bottle tops", "pencil", "notebook"]),
    makeStep("practice", "Try It Yourself", "Write: a) 3 + 4 = ? b) 5 + 3 = ?", "Remember: first number + second number = total.", openInteraction("a) 3 + 4 = __ b) 5 + 3 = __"), ["pencil", "notebook"], "Grade 2 writing addition sentences", "A notebook with addition sentences"),
    makeStep("quick_check", "Quick Check", "Choose the correct answer.", "Let's check your addition skills!", mcInteraction("What is 6 + 3?", [["8", false], ["9", true], ["10", false]]), ["pencil"], "Grade 2 addition quick check", "A cartoon owl: '6 + 3 = ?'"),
    makeStep("reflect", "What Did You Learn?", "Choose what you learned. Write one addition sentence about your family.", "You learned to add today!", chipSelect(["I can add single digit numbers.", "I know what the + and = signs mean.", "I can use objects to help me add.", "I can write addition sentences."], "Write one addition sentence about your family."), ["pencil", "notebook"]),
    makeStep("complete", "Addition Expert!", "You can add single digit numbers! Practice at home.", "You are an addition star!", { type: "none" }, [], "Grade 2 addition celebration", "A cheerful owl with 'Addition Expert' medal"),
  ];
}

async function main() {
  const lessonId = "ca9a1fe5-99cd-46bd-bb2f-ea1e2c43800a";

  const { data: lesson, error: fetchErr } = await supabase.from("Lesson").select("id, title, status, contentBlocks").eq("id", lessonId).single();
  if (fetchErr || !lesson) { console.error("Fetch error:", fetchErr); return; }

  console.log(`Lesson: ${lesson.title} (${lesson.status})`);

  const journey = generateJourney();
  console.log(`Generated ${journey.length} steps`);

  let existingCb = {};
  try { existingCb = JSON.parse(lesson.contentBlocks || "{}"); } catch {}

  const newCb = {
    ...existingCb,
    studentJourneyDraft: journey,
    batchId: BATCH_ID,
    aiMetadata: { model: "structured-template-v1", promptVersion: "batch-1-template", generatedAt: new Date().toISOString(), reviewStatus: "NEEDS_REVIEW", batchId: BATCH_ID },
  };

  const { error: updateErr } = await supabase.from("Lesson").update({ contentBlocks: JSON.stringify(newCb), updatedAt: new Date().toISOString() }).eq("id", lessonId);
  if (updateErr) { console.error("Save error:", updateErr); return; }
  console.log("✓ SAVED");
}

main().catch(e => console.error(e.message));
