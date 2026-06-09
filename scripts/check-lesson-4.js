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

async function main() {
  // Check the problematic lesson
  const { data, error } = await supabase
    .from("Lesson")
    .select("id, title, slug, status")
    .eq("id", "fb0e6e8e-5c88-4f48-8e65-dbb5e4c9ed0a");

  console.log("Data:", JSON.stringify(data, null, 2));
  console.log("Error:", error);

  // Try to find the lesson by title
  const { data: byTitle } = await supabase
    .from("Lesson")
    .select("id, title, status")
    .ilike("title", "%Adding Single Digit%");

  console.log("\nBy title:", JSON.stringify(byTitle, null, 2));
}

main().catch(e => console.error(e.message));
