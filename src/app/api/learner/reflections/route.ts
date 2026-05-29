import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { jwtVerify } from "jose";

export const dynamic = "force-dynamic";

async function getAuth(request: Request): Promise<{ userId: string; learnerId: string } | null> {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const cookies = Object.fromEntries(cookieHeader.split(";").map(c => { const [k,...r] = c.trim().split("="); return [k.trim(), r.join("=")]; }));
    const secret = process.env.NEXTAUTH_SECRET || "arizen-dev-secret-change-in-production";
    const isProd = process.env.NODE_ENV === "production";
    const cookieName = isProd ? "__Secure-next-auth.session-token" : "next-auth.session-token";
    const token = cookies[cookieName] || cookies["next-auth.session-token"] || cookies["__Secure-next-auth.session-token"];
    if (!token) return null;
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), { algorithms: ["HS256"] });
    const userId = payload.sub as string;
    if (!userId) return null;
    const { data: profile } = await supabase.from("LearnerProfile").select("id").eq("userId", userId).maybeSingle();
    return { userId, learnerId: profile?.id || userId };
  } catch { return null; }
}

// GET reflections for this learner
export async function GET(request: Request) {
  try {
    const auth = await getAuth(request);
    if (!auth?.learnerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { learnerId } = auth;

    const { data, error } = await supabase
      .from("Reflection")
      .select("id, prompt, response, entryType, createdAt, updatedAt")
      .eq("learnerId", learnerId)
      .order("createdAt", { ascending: false })
      .limit(20);

    if (error) {
      if (error.code === "42P01") return NextResponse.json({ reflections: [] });
      throw error;
    }
    return NextResponse.json({ reflections: data || [] });
  } catch (e: any) {
    console.error("Reflections GET error:", e);
    return NextResponse.json({ reflections: [] });
  }
}
export async function POST(request: Request) {
  try {
    const auth = await getAuth(request);
    if (!auth?.learnerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { userId, learnerId } = auth;

    const body = await request.json();
    const { prompt, response, lessonId, questId, themeId } = body;

    if (!prompt || !response) {
      return NextResponse.json({ error: "Prompt and response are required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("Reflection")
      .insert({
        learnerId,
        userId: userId || learnerId, // fallback if userId not available
        prompt,
        response: { text: response },
        lessonId: lessonId || null,
        questId: questId || null,
        themeId: themeId || null,
        entryType: "reflection",
      })
      .select()
      .single();

    if (error) {
      console.error("Reflection save error:", error);
      if (error.code === "42P01") return NextResponse.json({ error: "Reflections not available yet" }, { status: 500 });
      throw error;
    }
    return NextResponse.json({ success: true, reflection: data });
  } catch (e: any) {
    console.error("Reflections POST error:", e);
    return NextResponse.json({ error: e.message || "Failed to save reflection" }, { status: 500 });
  }
}
