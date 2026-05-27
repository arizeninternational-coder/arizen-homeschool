// GET /api/learner/xp — Get XP history
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabase } from "@/lib/supabase";
const secret = process.env.NEXTAUTH_SECRET || "arizen-dev-secret-change-in-production";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret });
    if (!token?.learnerProfileId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data, error } = await supabase.from("XpRecord").select("*").eq("learnerId", token.learnerProfileId).order("awardedAt", { ascending: false }).limit(50);
    if (error) throw error;
    return NextResponse.json({ xpRecords: data || [] });
  } catch (err) { return NextResponse.json({ error: "Failed to fetch XP records" }, { status: 500 }); }
}
