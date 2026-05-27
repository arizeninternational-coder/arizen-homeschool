// GET /api/admin/lessons — List all lessons with quest/theme info (ADMIN only)
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { withAuth } from "@/lib/api-guard";

export const GET = withAuth(async (req, user) => {
  try {
    const { data: lessons, error } = await supabase
      .from("Lesson")
      .select(`
        id,
        title,
        slug,
        description,
        status,
        orderIndex,
        createdAt,
        quest:Quest(
          id,
          title,
          theme:Theme(
            id,
            title,
            grade
          )
        )
      `)
      .order("createdAt", { ascending: false })
      .limit(200);

    if (error) {
      console.error("[ADMIN_LESSONS] Error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ lessons: lessons || [] });
  } catch (err: any) {
    console.error("[ADMIN_LESSONS] Critical error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch lessons" }, { status: 500 });
  }
}, { roles: ["ADMIN"] });
