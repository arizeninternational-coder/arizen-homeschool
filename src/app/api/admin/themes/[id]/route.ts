// PATCH /api/admin/themes/[id] — Update theme status (ADMIN only)
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/api-guard";
export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = params;
    const body = await req.json();
    const { status } = body;

    if (!status || !["DRAFT", "REVIEW", "PUBLISHED"].includes(status)) {
      return NextResponse.json({ error: "Valid status required (DRAFT, REVIEW, PUBLISHED)" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("Theme")
      .update({ status, updatedAt: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[ADMIN_THEME_UPDATE] Error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ theme: data, success: true });
  } catch (err: any) {
    console.error("[ADMIN_THEME_UPDATE] Critical error:", err);
    return NextResponse.json({ error: err.message || "Failed to update theme" }, { status: 500 });
  }
}
