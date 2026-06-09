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
        .select("parentId")
        .eq("childUserId", userId);
      const parentIds = (links || []).map((l: any) => l.parentId).filter(Boolean);
      const { data: parents } = parentIds.length > 0
        ? await supabase.from("User").select("id, name, role").in("id", parentIds)
        : { data: [] };
      return NextResponse.json({ members: parents || [] });
    }

    if (role === "PARENT") {
      // Parent can message: linked children + admin/teacher
      // Step 1: Get child user IDs from ParentChild
      const { data: links } = await supabase
        .from("ParentChild")
        .select("childUserId")
        .eq("parentId", userId);
      const childIds = (links || []).map((l: any) => l.childUserId).filter(Boolean);
      // Step 2: Fetch child user records
      const [childrenRes, adminsRes] = await Promise.all([
        childIds.length > 0
          ? supabase.from("User").select("id, name, role").in("id", childIds)
          : Promise.resolve({ data: [] }),
        supabase.from("User").select("id, name, role").in("role", ["ADMIN", "TEACHER"]),
      ]);
      const children = childrenRes.data || [];
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
