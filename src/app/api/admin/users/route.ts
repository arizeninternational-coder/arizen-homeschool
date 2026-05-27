// GET /api/admin/users — List all users with their profiles (ADMIN only)
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { withAuth } from "@/lib/api-guard";

export const GET = withAuth(async (req, user) => {
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
}, { roles: ["ADMIN"] });
