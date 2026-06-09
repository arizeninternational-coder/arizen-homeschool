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

const TARGET_TITLES = [
  "Reading Numbers 1 to 50 in Symbols",
  "Counting in 2s Forward up to 100",
  "Introduction to Halves Using Circular Cut-outs",
  "Adding Single Digit Numbers Horizontally",
  "Subtracting Single Digit Numbers",
  "Introduction to Multiplication as Repeated Addition",
  "Measuring Length Using Fixed Units",
  "Measuring Capacity Using Fixed Units",
  "Identifying Kenyan Currency up to Sh.100",
  "Identifying Rectangles, Circles, Triangles, Ovals and Squares",
];

async function main() {
  const { data: lessons, error } = await supabase
    .from("Lesson")
    .select("id, title, slug, status, contentBlocks, orderIndex, questId")
    .in("title", TARGET_TITLES)
    .order("orderIndex", { ascending: true });

  if (error) {
    console.error("Error:", error.message);
    return;
  }

  console.log(JSON.stringify(lessons, null, 2));
}

main().catch(e => console.error(e.message));
