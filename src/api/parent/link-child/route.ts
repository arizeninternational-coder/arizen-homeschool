// POST /api/parent/link-child — Link a learner account to the current parent

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabase } from "@/lib/supabase";

const secret = process.env.NEXTAUTH_SECRET || "arizen-dev-secret-change-in-production";

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret });
    if (!token?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (token.role !== "PARENT") return NextResponse.json({ error: "Only parents can link children" }, { status: 403 });

    const body = await req.json();
    const { childEmail } = body;
    if (!childEmail) return NextResponse.json({ error: "Child email is required" }, { status: 400 });

    const parentId = token.sub as string;
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
    return NextResponse.json({ error: "Failed to link child" }, { status: 500 });
  }
}

// GET /api/parent/children — Get linked children for current parent
export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret });
    if (!token?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (token.role !== "PARENT") return NextResponse.json({ error: "Only parents can list children" }, { status: 403 });

    const parentId = token.sub as string;

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
}
