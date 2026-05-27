// POST /api/parent/link-child — Link a learner account to the current parent (PARENT only)
// GET /api/parent/children — Get linked children for current parent (PARENT only)
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { withAuth, withAuthPost } from "@/lib/api-guard";

export const POST = withAuthPost(async (req, user, body: any) => {
  try {
    const parentId = user.id;
    const { childEmail } = body;
    if (!childEmail) return NextResponse.json({ error: "Child email is required" }, { status: 400 });

    const normalizedEmail = childEmail.toLowerCase().trim();

    // Find the child user
    const { data: childUser, error: childError } = await supabase
      .from("User")
      .select("id, name, email, role")
      .eq("email", normalizedEmail)
      .single();

    if (childError || !childUser) {
      return NextResponse.json({ error: "No user found with that email address" }, { status: 404 });
    }
    if (childUser.role === "ADMIN" || childUser.role === "PARENT") {
      return NextResponse.json({ error: "This user is not a learner account" }, { status: 400 });
    }

    // Check if already linked
    const { data: existing } = await supabase
      .from("ParentChild")
      .select("id")
      .eq("parentId", parentId)
      .eq("childUserId", childUser.id)
      .single();

    if (existing) {
      return NextResponse.json({ error: "This child is already linked to your account" }, { status: 409 });
    }

    // Create the link
    const { data: link, error: linkError } = await supabase
      .from("ParentChild")
      .insert({ parentId, childUserId: childUser.id })
      .select("id, createdAt")
      .single();

    if (linkError) {
      console.error("[PARENT_LINK] Error:", linkError.message);
      return NextResponse.json({ error: "Failed to link child" }, { status: 500 });
    }

    return NextResponse.json({
      message: "Child linked successfully",
      child: { id: childUser.id, name: childUser.name, email: childUser.email },
    });
  } catch (err: any) {
    console.error("[PARENT_LINK] Error:", err);
    return NextResponse.json({ error: "Failed to link child" }, { status: 500});
  }
}, { roles: ["PARENT"] });

export const GET = withAuth(async (req, user) => {
  try {
    const parentId = user.id;

    const { data: links, error } = await supabase
      .from("ParentChild")
      .select(`
        id,
        childUserId,
        createdAt,
        childUser:User!ParentChild_childUserId_fkey(id, name, email, learnerProfile:LearnerProfile(grade, displayName, totalXp, currentStreak, avatarUrl))
      `)
      .eq("parentId", parentId);

    if (error) {
      console.error("[PARENT_CHILDREN] Error:", error.message);
      return NextResponse.json({ error: "Failed to fetch children" }, { status: 500 });
    }

    return NextResponse.json({ children: links || [] });
  } catch (err: any) {
    console.error("[PARENT_CHILDREN] Error:", err);
    return NextResponse.json({ error: "Failed to fetch children" }, { status: 500 });
  }
}, { roles: ["PARENT"] });
