// GET /api/learners — List learners in guild
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabase } from "@/lib/supabase";
const secret = process.env.NEXTAUTH_SECRET || "arizen-dev-secret-change-in-production";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret });
    if (!token?.guildId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data, error } = await supabase
      .from("LearnerProfile")
      .select("id, displayName, grade, totalXp, currentStreak, avatarUrl")
      .eq("guildId", token.guildId)
      .order("grade", { ascending: true });
    if (error) throw error;
    return NextResponse.json({ learners: data || [] });
  } catch (err) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
