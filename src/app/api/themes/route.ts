import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAuthUser } from "@/lib/api-guard";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const grade = searchParams.get("grade");

    // Build query for published themes only
    let query = supabase
      .from("Theme")
      .select(`
        id,
        title,
        slug,
        description,
        grade,
        status,
        drivingQuestion,
        durationWeeks,
        coverImage,
        quests:Quest(
          id,
          title,
          slug,
          description,
          questType,
          status,
          xpReward,
          lessons:Lesson(
            id,
            title,
            slug,
            description,
            status,
            orderIndex,
            xpReward,
            estimatedDurationMinutes,
            difficulty
          )
        )
      `)
      .eq("status", "PUBLISHED")
      .order("grade", { ascending: true });

    if (slug) {
      query = query.eq("slug", slug);
    }
    if (grade) {
      query = query.eq("grade", Number(grade));
    }

    const { data: themes, error } = await query;

    if (error) {
      console.error("[THEMES] Error:", error.message);
      // Fallback: return themes without nested relations
      const { data: simple } = await supabase
        .from("Theme")
        .select("id, title, slug, description, grade, status, drivingQuestion")
        .eq("status", "PUBLISHED")
        .limit(50);
      return NextResponse.json({ themes: simple || [] });
    }

    // Filter to only PUBLISHED quests and PUBLISHED lessons within them
    const filtered = (themes || []).map((theme: any) => ({
      ...theme,
      quests: (theme.quests || [])
        .filter((q: any) => q.status === "PUBLISHED")
        .map((q: any) => ({
          ...q,
          lessons: (q.lessons || [])
            .filter((l: any) => l.status === "PUBLISHED")
            .sort((a: any, b: any) => (a.orderIndex || 0) - (b.orderIndex || 0)),
        }))
        .filter((q: any) => q.lessons.length > 0), // Only show quests that have published lessons
    }));

    // If a specific slug was requested, return single theme
    if (slug) {
      const theme = filtered[0];
      if (!theme) return NextResponse.json({ error: "Theme not found" }, { status: 404 });
      return NextResponse.json({ theme });
    }

    return NextResponse.json({ themes: filtered });
  } catch (err: any) {
    console.error("[THEMES] Critical error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch themes" }, { status: 500 });
  }
}
