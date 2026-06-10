/**
 * Approve all Grade 2 Math draft journeys.
 * Moves studentJourneyDraft → studentJourney for all batch journeys.
 * Checks batchId in both contentBlocks.batchId and contentBlocks.aiMetadata.batchId.
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

const BATCH_IDS = ["grade-2-math-batch-1", "grade-2-math-batch-2", "grade-2-math-batch-3"];

function getBatchId(cb) {
  return cb?.batchId || cb?.aiMetadata?.batchId || null;
}

function hasContent(val) {
  if (!val) return false;
  if (Array.isArray(val)) return val.length > 0;
  if (typeof val === "object") return Object.keys(val).length > 0;
  return Boolean(val);
}

async function main() {
  const { data: theme } = await db.from("Theme").select("id").eq("slug", "g2-mathematics").single();
  const { data: quests } = await db.from("Quest").select("id").eq("themeId", theme.id);
  const questIds = (quests || []).map(q => q.id);
  const { data: lessons } = await db.from("Lesson").select("id, slug, contentBlocks").in("questId", questIds);

  let approved = 0, skipped = 0, errors = 0;

  for (const lesson of (lessons || [])) {
    try {
      const cb = typeof lesson.contentBlocks === "string" ? JSON.parse(lesson.contentBlocks) : lesson.contentBlocks;
      const batchId = getBatchId(cb);
      if (!BATCH_IDS.includes(batchId)) { skipped++; continue; }
      if (!hasContent(cb.studentJourneyDraft)) { skipped++; continue; }

      // Move draft → approved
      cb.studentJourney = cb.studentJourneyDraft;
      delete cb.studentJourneyDraft;

      if (cb.aiMetadata) {
        cb.aiMetadata.reviewStatus = "APPROVED";
        cb.aiMetadata.approvedAt = new Date().toISOString();
      }

      const { error } = await db.from("Lesson").update({
        contentBlocks: JSON.stringify(cb),
        updatedAt: new Date().toISOString(),
      }).eq("id", lesson.id);

      if (error) {
        console.log("  ERROR " + lesson.slug + ": " + error.message);
        errors++;
      } else {
        approved++;
      }

      await new Promise(r => setTimeout(r, 100));
    } catch (e) {
      console.log("  EXCEPTION " + lesson.slug + ": " + e.message);
      errors++;
    }
  }

  console.log("\n=== RESULTS ===");
  console.log("Approved: " + approved);
  console.log("Skipped: " + skipped);
  console.log("Errors: " + errors);
}

main().catch(e => console.error("FATAL:", e.message));
