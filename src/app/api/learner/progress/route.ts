// GET /api/learner/progress — Get all progress
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabase } from "@/lib/supabase";
const secret = process.env.NEXTAUTH_SECRET || "arizen-dev-secret-change-in-production";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret });
    if (!token?.learnerProfileId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data, error } = await supabase
      .from("Progress")
      .select("*")
      .eq("learnerId", token.learnerProfileId)
      .order("lastAccessed", { ascending: false })
      .limit(100);
    if (error) throw error;
    return NextResponse.json({ progress: data || [] });
  } catch (err) { return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 }); }
}
