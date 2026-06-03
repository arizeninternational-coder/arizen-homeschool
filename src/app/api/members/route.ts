import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { withAuth } from "@/lib/api-guard";
export const dynamic = "force-dynamic";

// GET /api/members?role=learner|parent|admin
// Returns list of users the current user can message based on role restrictions:
// Learner → linked parents only
// Parent → linked children + admin/teacher users
// Admin/Teacher → parent users only
export const GET = withAuth(async (req: NextRequest, user: any) => {
  try {
    const role = user.role;
    const userId = user.id;

    if (role === "LEARNER") {
      // Learner can message their linked parents
      const { data: links } = await supabase
        .from("ParentChild")
        .select("parent:User(id, name, role)")
        .eq("childUserId", userId);
      const parents = (links || []).map((l: any) => l.parent).filter(Boolean);
      return NextResponse.json({ members: parents });
    }

    if (role === "PARENT") {
      // Parent can message: linked children + admin/teacher
      const [childrenRes, adminsRes] = await Promise.all([
        supabase.from("ParentChild").select("child:User(id, name, role)").eq("parentId", userId),
        supabase.from("User").select("id, name, role").in("role", ["ADMIN", "TEACHER"]),
      ]);
      const children = (childrenRes.data || []).map((c: any) => c.child).filter(Boolean);
      const admins = adminsRes.data || [];
      return NextResponse.json({ members: [...children, ...admins] });
    }

    if (role === "ADMIN" || role === "TEACHER") {
      // Admin/teacher can message parents
      const { data: parents } = await supabase
        .from("User")
        .select("id, name, role")
        .eq("role", "PARENT");
      return NextResponse.json({ members: parents || [] });
    }

    return NextResponse.json({ members: [] });
  } catch (err: any) {
    console.error("[MEMBERS] Error:", err);
    return NextResponse.json({ members: [] });
  }
});
