// Query Grade 2 Mathematics lessons from the database
// Uses the app's existing supabase client
const { createClient } = require("@supabase/supabase-js");

// Read env file manually
const fs = require("fs");
const envContent = fs.readFileSync(".env", "utf-8");
const envVars = {};
envContent.split("\n").forEach(line => {
  const [key, ...rest] = line.split("=");
  if (key && rest.length) {
    envVars[key.trim()] = rest.join("=").trim().replace(/^["']|["']$/g, "");
  }
});

const url = envVars.NEXT_PUBLIC_SUPABASE_URL;
const key = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing Supabase credentials");
  console.error("URL:", url ? "present" : "MISSING");
  console.error("Key:", key ? `present (${key.length} chars)` : "MISSING");
  process.exit(1);
}

console.log("Connecting to Supabase...");
const supabase = createClient(url, key);

async function main() {
  // Find Grade 2 Mathematics themes
  const { data: themes, error: themeErr } = await supabase
    .from("Theme")
    .select("id, title, slug, grade")
    .eq("grade", 2)
    .ilike("title", "%ath%");

  if (themeErr) {
    console.error("Theme query error:", themeErr.message);
    // Try broader query
    const { data: allThemes } = await supabase
      .from("Theme")
      .select("id, title, slug, grade")
      .eq("grade", 2);
    console.log("All Grade 2 themes:", JSON.stringify(allThemes, null, 2));
  } else {
    console.log("Grade 2 Math themes:", JSON.stringify(themes, null, 2));
  }

  // Find all Grade 2 themes
  const { data: allG2Themes } = await supabase
    .from("Theme")
    .select("id, title, slug, grade")
    .eq("grade", 2);

  console.log("\nAll Grade 2 themes:");
  if (allG2Themes) {
    allG2Themes.forEach(t => console.log(`  ${t.title} (${t.slug}) - ${t.id}`));
  }

  // Find quests for math themes
  const mathThemeIds = allG2Themes?.filter(t =>
    t.title.toLowerCase().includes("ath") ||
    t.title.toLowerCase().includes("math") ||
    t.slug.includes("math")
  ).map(t => t.id) || [];

  if (mathThemeIds.length > 0) {
    const { data: quests } = await supabase
      .from("Quest")
      .select("id, title, slug, themeId")
      .in("themeId", mathThemeIds);

    console.log("\nMath quests:");
    if (quests) {
      quests.forEach(q => console.log(`  ${q.title} (${q.slug}) - ${q.id}`));
    }

    // Find lessons for these quests
    const questIds = quests?.map(q => q.id) || [];
    if (questIds.length > 0) {
      const { data: lessons, count } = await supabase
        .from("Lesson")
        .select("id, title, slug, status, contentBlocks, questId, orderIndex", { count: "exact" })
        .in("questId", questIds)
        .order("orderIndex", { ascending: true });

      console.log(`\nTotal lessons: ${count}`);
      if (lessons) {
        lessons.forEach((l, i) => {
          let hasJourney = false;
          let journeyStatus = "none";
          try {
            const cb = JSON.parse(l.contentBlocks || "{}");
            if (cb.studentJourney && Array.isArray(cb.studentJourney) && cb.studentJourney.length > 0) {
              hasJourney = true;
              journeyStatus = "approved";
            }
            if (cb.studentJourneyDraft && Array.isArray(cb.studentJourneyDraft) && cb.studentJourneyDraft.length > 0) {
              hasJourney = true;
              journeyStatus = journeyStatus === "approved" ? "both" : "draft";
            }
          } catch {}

          let strand = "", subStrand = "", learningOutcome = "";
          try {
            const cb = JSON.parse(l.contentBlocks || "{}");
            strand = cb.strand || "";
            subStrand = cb.subStrand || "";
            learningOutcome = (cb.specificLearningOutcome || cb.learningOutcome || "").slice(0, 80);
          } catch {}

          console.log(`  ${i+1}. [${l.status}] ${l.title} | strand=${strand} | subStrand=${subStrand} | journey=${journeyStatus} | order=${l.orderIndex}`);
          if (learningOutcome) console.log(`     SLO: ${learningOutcome}...`);
        });
      }
    }
  }
}

main().catch(e => console.error("Error:", e.message));
