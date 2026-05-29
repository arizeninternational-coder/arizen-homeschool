// GET /api/admin/lessons — List all lessons (ADMIN only)
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/api-guard";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

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
}

// POST /api/admin/lessons — Create a new lesson
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { title, description, content, xpReward, status } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "Lesson title is required" }, { status: 400 });
    }

    const slug = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const { data: lesson, error } = await supabase
      .from("Lesson")
      .insert({
        title: title.trim(),
        slug,
        description: description?.trim() || null,
        xpReward: xpReward || 10,
        status: status || "DRAFT",
        orderIndex: 1,
      })
      .select("id, title, slug, status, xpReward")
      .single();

    if (error) {
      console.error("[ADMIN_CREATE_LESSON] Error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ lesson });
  } catch (err: any) {
    console.error("[ADMIN_CREATE_LESSON] Critical error:", err);
    return NextResponse.json({ error: err.message || "Failed to create lesson" }, { status: 500 });
  }
}
