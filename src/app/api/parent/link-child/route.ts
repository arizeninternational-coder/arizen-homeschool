// GET/POST /api/parent/link-child
// GET — list all children linked to the current parent
// POST — link an existing learner to the current parent by child email
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { withAuth, withAuthPost } from "@/lib/api-guard";
export const dynamic = "force-dynamic";

// GET — list linked children
export const GET = withAuth(async (req, user) => {
  try {
    console.log("[PARENT_LINK_CHILD] GET user.id:", user.id, "role:", user.role);

    const { data, error } = await supabase
      .from("ParentChild")
      .select(`
        id,
        childUserId,
        createdAt,
        childUser:User!ParentChild_childUserId_fkey (
          id,
          name,
          email,
          learnerProfile:LearnerProfile (
            grade,
            displayName,
            totalXp,
            currentStreak,
            avatarUrl
          )
        )
      `)
      .eq("parentId", user.id);

    if (error) {
      console.error("[PARENT_LINK_CHILD] GET error:", error.message);
      return NextResponse.json({ children: [], error: error.message });
    }

    // Normalize the data — Supabase may return learnerProfile as array or object
    const children = (data || []).map((row: any) => {
      const childUser = row.childUser;
      const learnerProfile = Array.isArray(childUser?.learnerProfile)
        ? childUser?.learnerProfile[0] || null
        : childUser?.learnerProfile || null;
      return {
        ...row,
        childUser: childUser ? { ...childUser, learnerProfile } : null,
      };
    });

    console.log("[PARENT_LINK_CHILD] GET returning", children.length, "children");
    return NextResponse.json({ children });
  } catch (err: any) {
    console.error("[PARENT_LINK_CHILD] GET critical:", err);
    return NextResponse.json({ children: [], error: err.message || "Failed to load children" });
  }
}, { roles: ["PARENT"] });

// POST — link an existing learner by email
export const POST = withAuthPost(async (req, user, body: any) => {
  try {
    const parentId = user.id;
    const { childEmail } = body;

    console.log("[PARENT_LINK_CHILD] POST parentId:", parentId, "childEmail:", childEmail);

    if (!childEmail || typeof childEmail !== "string" || !childEmail.trim()) {
      return NextResponse.json({ error: "Child email is required" }, { status: 400 });
    }

    const email = childEmail.trim().toLowerCase();

    // Find the child user
    const { data: childUser, error: findErr } = await supabase
      .from("User")
      .select("id, name, email, role")
      .eq("email", email)
      .single();

    if (findErr || !childUser) {
      console.error("[PARENT_LINK_CHILD] Child not found:", findErr?.message || "no user");
      return NextResponse.json({ error: "No user found with that email address" }, { status: 404 });
    }

    if (childUser.role?.toUpperCase() !== "LEARNER") {
      return NextResponse.json({ error: "The user with that email is not a learner account" }, { status: 400 });
    }

    // Check if already linked to this parent
    const { data: existing } = await supabase
      .from("ParentChild")
      .select("id, parentId")
      .eq("childUserId", childUser.id)
      .single();

    if (existing) {
      if (existing.parentId === parentId) {
        return NextResponse.json({ error: "This child is already linked to your account" }, { status: 409 });
      }
      return NextResponse.json({ error: "This student is already linked to a parent account" }, { status: 409 });
    }

    // Create the link
    const { error: linkErr } = await supabase
      .from("ParentChild")
      .insert({ parentId, childUserId: childUser.id });

    if (linkErr) {
      console.error("[PARENT_LINK_CHILD] Link insert error:", linkErr.message, linkErr.code, linkErr.details);
      return NextResponse.json({
        error: "Failed to link child",
        details: linkErr.message,
        code: linkErr.code,
      }, { status: 500 });
    }

    console.log("[PARENT_LINK_CHILD] Successfully linked child:", childUser.id);
    return NextResponse.json({
      message: "Child linked successfully",
      child: {
        id: childUser.id,
        name: childUser.name,
        email: childUser.email,
      },
    });
  } catch (err: any) {
    console.error("[PARENT_LINK_CHILD] POST critical:", err);
    return NextResponse.json({ error: err.message || "Failed to link child" }, { status: 500 });
  }
}, { roles: ["PARENT"] });
