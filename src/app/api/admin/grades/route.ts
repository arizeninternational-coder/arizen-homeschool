import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

// Get distinct grades from themes
export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;

    const { data: themes, error } = await supabase
      .from("Theme")
      .select("grade, title, slug, status, id")
      .order("grade", { ascending: true });

    if (error) throw error;

    // Group by grade
    const gradeMap = new Map<number, { grade: number; themes: any[] }>();
    for (const t of themes || []) {
      const g = t.grade;
      if (!gradeMap.has(g)) gradeMap.set(g, { grade: g, themes: [] });
      gradeMap.get(g)!.themes.push(t);
    }

    // Also get distinct grades from LearnerProfile (actual enrolled grades)
    const { data: profiles } = await supabase
      .from("LearnerProfile")
      .select("grade")
      .order("grade", { ascending: true });

    const enrolledGrades = [...new Set((profiles || []).map((p: any) => p.grade).filter(Boolean))];

    // Merge: any grade that appears in either themes or enrolled profiles
    for (const g of enrolledGrades) {
      if (!gradeMap.has(g)) gradeMap.set(g, { grade: g, themes: [] });
    }

    const grades = Array.from(gradeMap.values()).sort((a, b) => a.grade - b.grade);

    return NextResponse.json({ grades });
  } catch (e: any) {
    console.error("Grades API error:", e);
    return NextResponse.json({ error: e.message || "Unable to load grades" }, { status: 500 });
  }
}
