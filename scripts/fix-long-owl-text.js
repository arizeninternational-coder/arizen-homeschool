/**
 * Fix long owl text in pre-existing journeys (Grade 2 Math).
 * Trims owlText to ≤250 chars with ellipsis, preserving sentence boundaries.
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

const MAX_OWL = 250;

function trimOwl(text) {
  if (!text || text.length <= MAX_OWL) return text;
  // Cut at last sentence boundary before limit
  const trunc = text.substring(0, MAX_OWL);
  const lastPeriod = trunc.lastIndexOf(".");
  const lastExclaim = trunc.lastIndexOf("!");
  const lastQuestion = trunc.lastIndexOf("?");
  const cut = Math.max(lastPeriod, lastExclaim, lastQuestion);
  if (cut > 100) return trunc.substring(0, cut + 1);
  return trunc.trim() + "…";
}

async function main() {
  const { data: theme } = await db.from("Theme").select("id").eq("slug", "g2-mathematics").single();
  const { data: quests } = await db.from("Quest").select("id").eq("themeId", theme.id);
  const questIds = (quests || []).map(q => q.id);
  const { data: lessons } = await db.from("Lesson").select("id, slug, contentBlocks").in("questId", questIds);

  let fixed = 0, skipped = 0;

  for (const lesson of (lessons || [])) {
    try {
      const cb = typeof lesson.contentBlocks === "string" ? JSON.parse(lesson.contentBlocks) : lesson.contentBlocks;
      const journey = cb?.studentJourney || cb?.studentJourneyDraft;
      if (!journey) continue;

      // Normalize to array
      let steps = Array.isArray(journey) ? [...journey] : (journey.steps || []);
      if (steps.length === 0) {
        const keys = Object.keys(journey).filter(k => /^[0-9]+$/.test(k));
        if (keys.length > 0) steps = keys.sort((a, b) => Number(a) - Number(b)).map(k => journey[k]);
      }

      let patched = false;
      for (const step of steps) {
        if (step.owlText && step.owlText.length > MAX_OWL) {
          const oldLen = step.owlText.length;
          step.owlText = trimOwl(step.owlText);
          console.log("  " + lesson.slug + " step " + (steps.indexOf(step) + 1) + ": " + oldLen + " → " + step.owlText.length + " chars");
          patched = true;
        }
      }

      if (!patched) { skipped++; continue; }

      // Save back
      if (Array.isArray(journey)) {
        cb.studentJourney = steps;
      } else if (journey.steps) {
        cb.studentJourney = { ...journey, steps };
      } else {
        const newJourney = {};
        steps.forEach((s, idx) => { newJourney[idx] = s; });
        cb.studentJourney = newJourney;
      }

      const { error } = await db.from("Lesson").update({
        contentBlocks: JSON.stringify(cb),
      }).eq("id", lesson.id);

      if (error) {
        console.log("  ERROR " + lesson.slug + ": " + error.message);
      } else {
        fixed++;
      }

      await new Promise(r => setTimeout(r, 100));
    } catch (e) {}
  }

  console.log("\nFixed: " + fixed + ", Skipped (no long text): " + skipped);
}

main().catch(e => console.error("FATAL:", e.message));
