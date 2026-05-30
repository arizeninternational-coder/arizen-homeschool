import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { gradeId: string; subjectSlug: string } }) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;

    const gradeId = Number(params.gradeId);
    const subjectSlug = params.subjectSlug;

    // Find themes matching this grade and subject
    const { data: themes, error } = await supabase
      .from("Theme")
      .select("id, title, slug, description, grade, status, id")
      .eq("grade", gradeId)
      .ilike("slug", `%${subjectSlug}%`)
      .order("title", { ascending: true });

    if (error) throw error;

    // Count lessons per theme via quests
    const themesWithCounts = await Promise.all(
      (themes || []).map(async (theme: any) => {
        const { count } = await supabase
          .from("Quest")
          .select("id", { count: "exact", head: true })
          .eq("themeId", theme.id);
        return { ...theme, lessonCount: count || 0 };
      })
    );

    return NextResponse.json({ themes: themesWithCounts });
  } catch (e: any) {
    console.error("Subject detail error:", e);
    return NextResponse.json({ error: e.message || "Unable to load subject" }, { status: 500 });
  }
}
