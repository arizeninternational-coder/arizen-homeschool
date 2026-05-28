// GET /api/admin/quests — List all quests with theme info (ADMIN only)
// POST /api/admin/quests — Create a new quest (ADMIN only)
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/api-guard";

// GET — list all quests
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;
  const { user } = auth;

  try {
    const url = new URL(req.url);
    const grade = url.searchParams.get("grade");
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");

    let query = supabase
      .from("Quest")
      .select(`
        id,
        title,
        slug,
        description,
        questType,
        orderIndex,
        xpReward,
        status,
        createdAt,
        updatedAt,
        theme:Theme(
          id,
          title,
          grade
        )
      `)
      .order("createdAt", { ascending: false })
      .limit(200);

    if (status && status !== "all") {
      query = query.eq("status", status.toUpperCase());
    }

    const { data: quests, error } = await query;

    if (error) {
      console.error("[ADMIN_QUESTS] Error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Filter by grade and search on the server results (Supabase REST limitations)
    let filtered = quests || [];
    if (grade && grade !== "all") {
      filtered = filtered.filter((q: any) => q.theme?.grade === parseInt(grade));
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((quest: any) =>
        (quest.title || "").toLowerCase().includes(q) ||
        (quest.theme?.title || "").toLowerCase().includes(q)
      );
    }

    return NextResponse.json({ quests: filtered });
  } catch (err: any) {
    console.error("[ADMIN_QUESTS] Critical error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch quests" }, { status: 500 });
  }
}

// POST — create a new quest
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;
  const { user } = auth;

  try {
    const body = await req.json();
    const { title, description, themeId, questType, orderIndex, xpReward, status } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "Quest title is required" }, { status: 400 });
    }

    // Generate slug from title
    const slug = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60) + "-" + Date.now().toString(36);

    // Verify theme exists if themeId provided
    if (themeId) {
      const { data: theme } = await supabase.from("Theme").select("id").eq("id", themeId).single();
      if (!theme) {
        return NextResponse.json({ error: "Theme not found" }, { status: 400 });
      }
    }

    const insertData: any = {
      title: title.trim(),
      slug,
      description: description?.trim() || null,
      questType: questType || "MAIN",
      orderIndex: orderIndex || 1,
      xpReward: JSON.stringify({ base: 50 }),
      status: status?.toUpperCase() || "DRAFT",
    };

    if (themeId) {
      insertData.themeId = themeId;
    } else {
      return NextResponse.json({ error: "themeId is required" }, { status: 400 });
    }

    const { data: newQuest, error } = await supabase
      .from("Quest")
      .insert(insertData)
      .select(`
        id,
        title,
        slug,
        description,
        questType,
        orderIndex,
        xpReward,
        status,
        createdAt,
        theme:Theme(id, title, grade)
      `)
      .single();

    if (error) {
      console.error("[ADMIN_QUESTS] Create error:", error.message);
      return NextResponse.json({ error: error.message || "Failed to create quest" }, { status: 500 });
    }

    return NextResponse.json({ quest: newQuest, message: "Quest created successfully" }, { status: 201 });
  } catch (err: any) {
    console.error("[ADMIN_QUESTS] Create critical error:", err);
    return NextResponse.json({ error: err.message || "Failed to create quest" }, { status: 500 });
  }
}

// DELETE — delete a quest by ID
export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Quest ID is required" }, { status: 400 });
    }

    // Check if quest has lessons
    const { data: lessons } = await supabase
      .from("Lesson")
      .select("id")
      .eq("questId", id)
      .limit(1);

    if (lessons && lessons.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete quest with lessons. Remove lessons first." },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("Quest").delete().eq("id", id);
    if (error) {
      console.error("[ADMIN_QUESTS] Delete error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Quest deleted" });
  } catch (err: any) {
    console.error("[ADMIN_QUESTS] Delete critical error:", err);
    return NextResponse.json({ error: err.message || "Failed to delete quest" }, { status: 500 });
  }
}
