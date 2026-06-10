/**
 * Patch remaining pre-existing answer leaks in Grade 2 Math journeys.
 * These use the old standardJourney template that wasn't patched earlier.
 * 
 * Affected journeys:
 * - g2-mathematics-adding-2-digit-and-1-digit-numbers-with-regrouping (steps 5, 7)
 * - g2-mathematics-adding-2-digit-and-1-digit-numbers-without-regrouping (steps 5, 7)
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

const FIXES = [
  {
    slug: "g2-mathematics-adding-2-digit-and-1-digit-numbers-withregrouping",
    // step 5 = connect (index 4), step 7 = practice (index 6)
    patches: [
      { stepIndex: 4, field: "owlText", old: /Real addition! The answer is \d+\./, new: "Good thinking. Now let's connect this idea to something you might see in real life." },
      { stepIndex: 6, field: "owlText", old: /You can do this! The answer is \d+\./, new: "Try this one on your own. Use what you learned in the example. You've got this!" },
    ]
  },
  {
    slug: "g2-mathematics-adding-2-digit-and-1-digit-numbers-without-regrouping",
    patches: [
      { stepIndex: 4, field: "owlText", old: /Real addition! The answer is \d+\./, new: "Good thinking. Now let's connect this idea to something you might see in real life." },
      { stepIndex: 6, field: "owlText", old: /You can do this! The answer is \d+\./, new: "Try this one on your own. Use what you learned in the example. You've got this!" },
    ]
  }
];

// Wait, the slug has a typo. Let me use the correct slugs.
const FIXES_CORRECTED = [
  {
    slug: "g2-mathematics-adding-2-digit-and-1-digit-numbers-with-regrouping",
    patches: [
      { stepIndex: 4, field: "owlText", newText: "Good thinking. Now let's connect this idea to something you might see in real life." },
      { stepIndex: 6, field: "owlText", newText: "Try this one on your own. Use what you learned in the example. You've got this!" },
    ]
  },
  {
    slug: "g2-mathematics-adding-2-digit-and-1-digit-numbers-without-regrouping",
    patches: [
      { stepIndex: 4, field: "owlText", newText: "Good thinking. Now let's connect this idea to something you might see in real life." },
      { stepIndex: 6, field: "owlText", newText: "Try this one on your own. Use what you learned in the example. You've got this!" },
    ]
  }
];

async function main() {
  let fixed = 0;

  for (const fix of FIXES_CORRECTED) {
    const { data } = await db.from("Lesson").select("id, contentBlocks").eq("slug", fix.slug).single();
    if (!data) { console.log("NOT FOUND: " + fix.slug); continue; }

    const cb = typeof data.contentBlocks === "string" ? JSON.parse(data.contentBlocks) : data.contentBlocks;
    const journey = cb?.studentJourneyDraft || cb?.studentJourney;
    const steps = Array.isArray(journey) ? journey : (journey?.steps || []);

    if (steps.length === 0) { console.log("SKIP (no parseable steps): " + fix.slug); continue; }

    let patched = false;
    for (const patch of fix.patches) {
      const step = steps[patch.stepIndex];
      if (step && step[patch.field]) {
        const oldText = step[patch.field];
        if (/The answer is \d+/.test(oldText)) {
          console.log("  [" + fix.slug + "] step " + (patch.stepIndex + 1) + ":");
          console.log("    OLD: " + oldText);
          console.log("    NEW: " + patch.newText);
          step[patch.field] = patch.newText;
          patched = true;
        }
      }
    }

    if (patched) {
      // Save back
      if (Array.isArray(journey)) {
        cb.studentJourneyDraft = steps;
      } else {
        cb.studentJourneyDraft = { ...journey, steps };
      }

      const { error } = await db
        .from("Lesson")
        .update({ contentBlocks: JSON.stringify(cb) })
        .eq("id", data.id);

      if (error) {
        console.log("  ERROR saving " + fix.slug + ": " + error.message);
      } else {
        console.log("  ✓ Fixed: " + fix.slug);
        fixed++;
      }
    }
  }

  console.log("\n=== DONE: " + fixed + " journeys patched ===");
}

main().catch(e => console.error("FATAL:", e.message));
