// POST /api/parent/create-child — Create a new child learner profile linked to the current parent (PARENT only)
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { withAuth, withAuthPost } from "@/lib/api-guard";
export const dynamic = "force-dynamic";

export const POST = withAuthPost(async (req, user, body: any) => {
  try {
    const parentId = user.id;
    const { name, grade } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Child name is required" }, { status: 400 });
    }
    const childName = name.trim();
    const childGrade = parseInt(grade) || 2;

    // Get parent's guild
    const { data: parentUser } = await supabase
      .from("User")
      .select("guildId")
      .eq("id", parentId)
      .single();

    const guildId = parentUser?.guildId;
    if (!guildId) {
      return NextResponse.json({ error: "Parent account is not assigned to a guild" }, { status: 400 });
    }

    // Generate a unique email placeholder for the child (they can change it later)
    const childEmail = `child-${parentId.slice(0, 8)}-${Date.now()}@arizen.local`;

    // Create the child User account
    const { data: childUser, error: createErr } = await supabase
      .from("User")
      .insert({
        guildId,
        email: childEmail,
        name: childName,
        role: "LEARNER",
      })
      .select("id, name, email")
      .single();

    if (createErr) {
      console.error("[PARENT_CREATE_CHILD] User create error:", createErr.message);
      return NextResponse.json({ error: "Failed to create child account" }, { status: 500 });
    }

    // Create the LearnerProfile
    const { error: profileErr } = await supabase
      .from("LearnerProfile")
      .insert({
        userId: childUser.id,
        guildId,
        grade: childGrade,
        displayName: childName,
        totalXp: 0,
        currentStreak: 0,
        bestStreak: 0,
      });

    if (profileErr) {
      console.error("[PARENT_CREATE_CHILD] Profile create error:", profileErr.message);
      // Don't fail — the user exists, profile can be created later
    }

    // Link to parent
    const { error: linkErr } = await supabase
      .from("ParentChild")
      .insert({ parentId, childUserId: childUser.id });

    if (linkErr) {
      console.error("[PARENT_CREATE_CHILD] Link error:", linkErr.message);
      // Don't fail — the child account exists
    }

    return NextResponse.json({
      message: "Child profile created successfully",
      child: { id: childUser.id, name: childUser.name, email: childUser.email, grade: childGrade },
    });
  } catch (err: any) {
    console.error("[PARENT_CREATE_CHILD] Critical error:", err);
    return NextResponse.json({ error: err.message || "Failed to create child" }, { status: 500 });
  }
}, { roles: ["PARENT"] });
