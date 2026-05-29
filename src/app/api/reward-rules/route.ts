import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAuthUser, requireAdmin } from "@/lib/api-guard";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await supabase.from("RewardRule").select("*").eq("isActive", true).order("action");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ rules: data || [] });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;
  const body = await req.json();
  const { data, error } = await supabase.from("RewardRule").upsert({ action: body.action?.trim().toLowerCase(), coins: body.coins || 0, xp: body.xp || 0, dailyLimit: body.dailyLimit || 0, isActive: body.isActive !== false, description: body.description || null }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ rule: data, message: "Saved" }, { status: 201 });
}
