import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { jwtVerify } from "jose";

export const dynamic = "force-dynamic";

async function getUserIdFromCookie(request: Request): Promise<{ id: string; role: string } | null> {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((c) => {
        const [key, ...rest] = c.trim().split("=");
        return [key.trim(), rest.join("=")];
      })
    );
    const secret = process.env.NEXTAUTH_SECRET || "arizen-dev-secret-change-in-production";
    const isProd = process.env.NODE_ENV === "production";
    const cookieName = isProd ? "__Secure-next-auth.session-token" : "next-auth.session-token";
    const token = cookies[cookieName] || cookies["next-auth.session-token"] || cookies["__Secure-next-auth.session-token"];
    if (!token) return null;
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), { algorithms: ["HS256"] });
    if (!payload.sub || !payload.role) return null;
    return { id: payload.sub as string, role: (payload.role as string).toUpperCase() };
  } catch {
    return null;
  }
}

// GET — list homework for a learner
export async function GET(request: Request) {
  try {
    const user = await getUserIdFromCookie(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const learnerId = searchParams.get("learnerId");

    if (user.role === "LEARNER") {
      // Students see their own homework
      const { data: profile } = await supabase.from("LearnerProfile").select("id").eq("userId", user.id).maybeSingle();
      if (!profile) return NextResponse.json({ homework: [] });

      const { data, error } = await supabase
        .from("Homework")
        .select("*")
        .eq("learnerId", profile.id)
        .order("createdAt", { ascending: false });

      if (error) {
        if (error.code === "42P01") return NextResponse.json({ homework: [], tableMissing: true });
        throw error;
      }
      return NextResponse.json({ homework: data || [] });
    }

    if (user.role === "PARENT") {
      // Parents see homework for their linked children
      if (!learnerId) {
        // Return all homework for all linked children
        const { data: links } = await supabase.from("ParentChild").select("childUserId").eq("parentId", user.id);
        if (!links || links.length === 0) return NextResponse.json({ homework: [] });

        const childUserIds = links.map((l: any) => l.childUserId);
        const { data: profiles } = await supabase.from("LearnerProfile").select("id").in("userId", childUserIds);
        if (!profiles || profiles.length === 0) return NextResponse.json({ homework: [] });

        const profileIds = profiles.map((p: any) => p.id);
        const { data, error } = await supabase
          .from("Homework")
          .select("*")
          .in("learnerId", profileIds)
          .order("createdAt", { ascending: false });

        if (error) {
          if (error.code === "42P01") return NextResponse.json({ homework: [], tableMissing: true });
          throw error;
        }
        return NextResponse.json({ homework: data || [] });
      }

      // Verify this learner belongs to this parent
      const { data: link } = await supabase
        .from("ParentChild")
        .select("childUserId")
        .eq("parentId", user.id)
        .eq("childUserId", learnerId)
        .maybeSingle();

      if (!link) return NextResponse.json({ error: "Not authorized for this learner" }, { status: 403 });

      const { data: profile } = await supabase.from("LearnerProfile").select("id").eq("userId", learnerId).maybeSingle();
      if (!profile) return NextResponse.json({ homework: [] });

      const { data, error } = await supabase
        .from("Homework")
        .select("*")
        .eq("learnerId", profile.id)
        .order("createdAt", { ascending: false });

      if (error) {
        if (error.code === "42P01") return NextResponse.json({ homework: [], tableMissing: true });
        throw error;
      }
      return NextResponse.json({ homework: data || [] });
    }

    return NextResponse.json({ error: "Unauthorized role" }, { status: 403 });
  } catch (e: any) {
    console.error("GET homework error:", e);
    return NextResponse.json({ error: e.message || "Unable to load homework" }, { status: 500 });
  }
}

// POST — parent creates homework
export async function POST(request: Request) {
  try {
    const user = await getUserIdFromCookie(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "PARENT") return NextResponse.json({ error: "Only parents can assign homework" }, { status: 403 });

    const body = await request.json();
    const { childUserId, title, subject, focusArea, instructions, linkedLessonId, dueDate } = body;

    if (!childUserId || !title) {
      return NextResponse.json({ error: "Child and title are required" }, { status: 400 });
    }

    // Verify this child belongs to this parent
    const { data: link } = await supabase
      .from("ParentChild")
      .select("childUserId")
      .eq("parentId", user.id)
      .eq("childUserId", childUserId)
      .maybeSingle();

    if (!link) {
      return NextResponse.json({ error: "This student is not linked to your account" }, { status: 403 });
    }

    // Get learner profile
    const { data: profile } = await supabase
      .from("LearnerProfile")
      .select("id")
      .eq("userId", childUserId)
      .maybeSingle();

    if (!profile) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("Homework")
      .insert({
        parentId: user.id,
        learnerId: profile.id,
        title,
        subject: subject || null,
        focusArea: focusArea || null,
        instructions: instructions || null,
        linkedLessonId: linkedLessonId || null,
        dueDate: dueDate || null,
        status: "assigned",
      })
      .select()
      .single();

    if (error) {
      console.error("Create homework error:", error);
      if (error.code === "42P01") {
        return NextResponse.json({ error: "Homework table does not exist. Please run DB_FIX_MISSING_TABLES.sql" }, { status: 500 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, homework: data });
  } catch (e: any) {
    console.error("POST homework error:", e);
    return NextResponse.json({ error: e.message || "Unable to create homework" }, { status: 500 });
  }
}

// PATCH — mark homework as complete
export async function PATCH(request: Request) {
  try {
    const user = await getUserIdFromCookie(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { homeworkId, status } = body;

    if (!homeworkId) return NextResponse.json({ error: "Homework ID required" }, { status: 400 });

    const updateData: any = { status: status || "completed" };
    if (status === "completed") {
      updateData.completedAt = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("Homework")
      .update(updateData)
      .eq("id", homeworkId)
      .select()
      .single();

    if (error) {
      if (error.code === "42P01") return NextResponse.json({ error: "Homework table does not exist yet" }, { status: 500 });
      throw error;
    }

    return NextResponse.json({ success: true, homework: data });
  } catch (e: any) {
    console.error("PATCH homework error:", e);
    return NextResponse.json({ error: e.message || "Unable to update homework" }, { status: 500 });
  }
}
