// GET /api/admin/users — List all users with their profiles (ADMIN only)
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/api-guard";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;
  const { user } = auth;

  try {
    const { data: users, error } = await supabase
      .from("User")
      .select(`
        id,
        name,
        email,
        role,
        createdAt,
        learnerProfile:LearnerProfile(grade, displayName, totalXp)
      `)
      .order("createdAt", { ascending: false });

    if (error) {
      console.error("[ADMIN_USERS] Error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ users: users || [] });
  } catch (err: any) {
    console.error("[ADMIN_USERS] Critical error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch users" }, { status: 500 });
  }
}
