/**
 * Fix pre-existing 11-step journeys by merging consecutive practice steps.
 * Affected: multiplication-as-repeated-addition-with-2s-and-3s, counting-numbers-to-100
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

const SLUGS = [
  "g2-mathematics-multiplication-as-repeated-addition-with-2s-and-3s",
  "g2-mathematics-counting-numbers-to-100",
];

async function main() {
  for (const slug of SLUGS) {
    const { data } = await db.from("Lesson").select("id, contentBlocks").eq("slug", slug).single();
    if (!data) { console.log("NOT FOUND:", slug); continue; }

    const cb = typeof data.contentBlocks === "string" ? JSON.parse(data.contentBlocks) : data.contentBlocks;
    const journey = cb?.studentJourney;
    if (!journey) { console.log("No journey:", slug); continue; }

    // Normalize to array
    let steps = Array.isArray(journey) ? [...journey] : (journey.steps || []);
    if (steps.length === 0) {
      const keys = Object.keys(journey).filter(k => /^[0-9]+$/.test(k));
      if (keys.length > 0) steps = keys.sort((a, b) => Number(a) - Number(b)).map(k => journey[k]);
    }

    if (steps.length !== 11) { console.log(slug + ': not 11 steps (' + steps.length + '), skipping'); continue; }

    // Find and merge consecutive practice steps
    let merged = false;
    for (let i = 0; i < steps.length - 1; i++) {
      const type_i = steps[i].stepType || steps[i].type;
      const type_j = steps[i + 1].stepType || steps[i + 1].type;
      if (type_i === "practice" && type_j === "practice") {
        console.log("  Merging practice steps " + (i+1) + " and " + (i+2) + " in " + slug);
        const mergedStep = {
          ...steps[i],
          title: steps[i].title + " & " + steps[i + 1].title,
          studentText: steps[i].studentText + "\n\n" + steps[i + 1].studentText,
          owlText: steps[i].owlText + " " + steps[i + 1].owlText,
          materials: [...(steps[i].materials || []), ...(steps[i + 1].materials || [])],
        };
        steps.splice(i, 2, mergedStep);
        merged = true;
        break;
      }
    }

    if (!merged) { console.log("  No consecutive practice steps found in " + slug); continue; }

    // Save back - normalize journey format to match original
    if (Array.isArray(journey)) {
      cb.studentJourney = steps;
    } else if (journey.steps) {
      cb.studentJourney = { ...journey, steps };
    } else {
      // Numeric keys format - convert back
      const newJourney = {};
      steps.forEach((s, idx) => { newJourney[idx] = s; });
      cb.studentJourney = newJourney;
    }

    const { error } = await db
      .from("Lesson")
      .update({ contentBlocks: JSON.stringify(cb) })
      .eq("id", data.id);

    if (error) {
      console.log("  ERROR:", error.message);
    } else {
      console.log("  Fixed: " + slug + " (" + steps.length + " steps)");
    }
  }
  console.log("Done");
}

main().catch(e => console.error("FATAL:", e.message));
