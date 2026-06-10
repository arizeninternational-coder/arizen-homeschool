const { createClient } = require("@supabase/supabase-js");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hgufndnqbvcukbxmwtvo.supabase.co";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
if (!key) { console.log("NO_ANON_KEY"); process.exit(0); }
const supabase = createClient(url, key);

async function main() {
  // Find Grade 2 Mathematics subject
  const { data: subjects } = await supabase.from("Subject").select("*").ilike("name", "%ath%").eq("grade", 2);
  console.log("SUBJECTS:", JSON.stringify(subjects?.map(s => ({id: s.id, name: s.name, grade: s.grade, slug: s.slug}))));

  if (subjects && subjects.length > 0) {
    for (const subj of subjects) {
      console.log(`\n=== SUBJECT: ${subj.name} (${subj.id}) ===`);

      // Count lessons
      const { count: lessonCount } = await supabase.from("Lesson").select("*", { count: "exact", head: true }).eq("subjectId", subj.id);
      console.log("LESSON_COUNT:", lessonCount);

      // Get lesson details
      const { data: lessons } = await supabase.from("Lesson").select("id, title, slug, status, strand, subStrand, term, week, lessonOrder, completenessScore, contentBlocks").eq("subjectId", subj.id).order("lessonOrder", { ascending: true });
      if (lessons) {
        lessons.forEach((l, i) => {
          const cb = l.contentBlocks;
          let hasSourceRef = false;
          if (cb && typeof cb === "object") {
            if (cb.source?.reference) hasSourceRef = true;
            if (cb.curriculum?.sourceReference) hasSourceRef = true;
          }
          console.log(`LESSON_${i+1}: title="${l.title}" strand="${l.strand}" subStrand="${l.subStrand}" term="${l.term}" week="${l.week}" order=${l.lessonOrder} status=${l.status} completeness=${l.completenessScore} hasSourceRef=${hasSourceRef}`);
        });
      }

      // Get themes
      const { data: themes } = await supabase.from("Theme").select("id, title, slug").eq("subjectId", subj.id);
      console.log("THEMES:", JSON.stringify(themes?.map(t => ({title: t.title, slug: t.slug}))));

      // Get quests
      const { data: quests } = await supabase.from("Quest").select("id, title, slug").eq("subjectId", subj.id);
      console.log("QUESTS:", JSON.stringify(quests?.map(q => ({title: q.title, slug: q.slug}))));
    }
  }
}
main().catch(e => console.error("ERR:", e.message));
