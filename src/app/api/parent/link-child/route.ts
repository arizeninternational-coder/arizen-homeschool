import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    // Read parent session from cookie
    const cookieHeader = request.headers.get("cookie") || "";
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((c) => {
        const [key, ...rest] = c.trim().split("=");
        return [key.trim(), rest.join("=")];
      })
    );

    const { jwtVerify } = await import("jose");
    const secret = process.env.NEXTAUTH_SECRET || "arizen-dev-secret-change-in-production";
    const isProduction = process.env.NODE_ENV === "production";
    const cookieName = isProduction ? "__Secure-next-auth.session-token" : "next-auth.session-token";
    const token = cookies[cookieName] || cookies["next-auth.session-token"] || cookies["__Secure-next-auth.session-token"];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized — please log in" }, { status: 401 });
    }

    let payload;
    try {
      const result = await jwtVerify(token, new TextEncoder().encode(secret), { algorithms: ["HS256"] });
      payload = result.payload;
    } catch {
      return NextResponse.json({ error: "Invalid session — please log in again" }, { status: 401 });
    }

    const parentId = payload.sub as string;
    const parentRole = (payload.role as string)?.toUpperCase();

    if (!parentId || parentRole !== "PARENT") {
      return NextResponse.json({ error: "Only parent accounts can link children" }, { status: 403 });
    }

    const body = await request.json();
    const { childEmail } = body;

    if (!childEmail || typeof childEmail !== "string") {
      return NextResponse.json({ error: "Student email is required" }, { status: 400 });
    }

    const email = childEmail.trim().toLowerCase();

    if (!email.includes("@")) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }

    // Find the child user by email
    const { data: childUser, error: childErr } = await supabase
      .from("User")
      .select("id, email, role, name")
      .ilike("email", email)
      .maybeSingle();

    if (childErr) {
      console.error("Error finding child user:", childErr);
      return NextResponse.json({ error: "Unable to search for student. Please try again." }, { status: 500 });
    }

    if (!childUser) {
      return NextResponse.json({ error: "No student account found with that email." }, { status: 404 });
    }

    // Check the role — only LEARNER accounts can be linked
    if (childUser.role?.toUpperCase() !== "LEARNER") {
      return NextResponse.json({ error: "Only student accounts can be linked as children." }, { status: 400 });
    }

    // Check if already linked to this parent
    const { data: existingLink } = await supabase
      .from("ParentChild")
      .select("id")
      .eq("parentId", parentId)
      .eq("childUserId", childUser.id)
      .maybeSingle();

    if (existingLink) {
      return NextResponse.json({ error: "This student is already linked to your account." }, { status: 400 });
    }

    // Check if linked to another parent
    const { data: otherLink } = await supabase
      .from("ParentChild")
      .select("id")
      .eq("childUserId", childUser.id)
      .maybeSingle();

    if (otherLink) {
      return NextResponse.json({ error: "This student is already linked to another parent account." }, { status: 400 });
    }

    // Create the link
    const { error: insertErr } = await supabase
      .from("ParentChild")
      .insert({ parentId, childUserId: childUser.id });

    if (insertErr) {
      console.error("Error creating parent-child link:", insertErr);

      // Check if table doesn't exist
      if (insertErr.code === "42P01" || insertErr.message?.includes("does not exist")) {
        return NextResponse.json({
          error: "Parent-child linking table does not exist yet. Please run the DB_FIX_MISSING_TABLES.sql in Supabase SQL Editor."
        }, { status: 500 });
      }

      return NextResponse.json({ error: "Unable to link student. Please try again." }, { status: 500 });
    }

    // Get learner profile info for the response
    const { data: learnerProfile } = await supabase
      .from("LearnerProfile")
      .select("id, displayName, grade, totalXp, currentStreak, avatarUrl")
      .eq("userId", childUser.id)
      .maybeSingle();

    return NextResponse.json({
      success: true,
      message: `${childUser.name || childUser.email} has been linked to your account.`,
      child: {
        id: childUser.id,
        name: learnerProfile?.displayName || childUser.name || childUser.email,
        grade: learnerProfile?.grade,
        totalXp: learnerProfile?.totalXp ?? 0,
        currentStreak: learnerProfile?.currentStreak ?? 0,
        avatarUrl: learnerProfile?.avatarUrl,
      },
    });
  } catch (e: any) {
    console.error("link-child unexpected error:", e);
    return NextResponse.json({
      error: e.message || "An unexpected error occurred. Please try again."
    }, { status: 500 });
  }
}

// GET — list children linked to this parent
export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((c) => {
        const [key, ...rest] = c.trim().split("=");
        return [key.trim(), rest.join("=")];
      })
    );

    const { jwtVerify } = await import("jose");
    const secret = process.env.NEXTAUTH_SECRET || "arizen-dev-secret-change-in-production";
    const isProduction = process.env.NODE_ENV === "production";
    const cookieName = isProduction ? "__Secure-next-auth.session-token" : "next-auth.session-token";
    const token = cookies[cookieName] || cookies["next-auth.session-token"] || cookies["__Secure-next-auth.session-token"];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let payload;
    try {
      const result = await jwtVerify(token, new TextEncoder().encode(secret), { algorithms: ["HS256"] });
      payload = result.payload;
    } catch {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const parentId = payload.sub as string;

    const { data: links, error } = await supabase
      .from("ParentChild")
      .select(`
        id,
        childUserId,
        createdAt,
        childUser:User!ParentChild_childUserId_fkey(id, email, name),
        learnerProfile:LearnerProfile(userId)
      `)
      .eq("parentId", parentId);

    if (error) {
      if (error.code === "42P01" || error.message?.includes("does not exist")) {
        return NextResponse.json({ children: [], tableMissing: true });
      }
      throw error;
    }

    const children = (links || []).map((link: any) => ({
      id: link.childUserId,
      name: link.learnerProfile?.[0]?.displayName || link.childUser?.name || link.childUser?.email,
      email: link.childUser?.email,
      grade: link.learnerProfile?.[0]?.grade,
      totalXp: link.learnerProfile?.[0]?.totalXp ?? 0,
      currentStreak: link.learnerProfile?.[0]?.currentStreak ?? 0,
      avatarUrl: link.learnerProfile?.[0]?.avatarUrl,
      linkedAt: link.createdAt,
    }));

    return NextResponse.json({ children });
  } catch (e: any) {
    console.error("get children error:", e);
    return NextResponse.json({ error: e.message || "Unable to load children" }, { status: 500 });
  }
}
