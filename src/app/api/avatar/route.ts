import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAuthUser } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

// GET /api/avatar — get current student's avatar config
export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request as any);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("StudentAvatar")
      .select("*")
      .eq("studentId", user.id)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    return NextResponse.json({ avatar: data || null });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Unable to load avatar" }, { status: 500 });
  }
}

// POST /api/avatar — save avatar config
export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request as any);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { hairStyle, hairColor, skinStyle, skinTone, outfitId, accessoryId, petId, backgroundId, shoesId } = body;

    // Upsert avatar
    const { data, error } = await supabase
      .from("StudentAvatar")
      .upsert({
        studentId: user.id,
        hairStyle: hairStyle || "short-curls",
        hairColor: hairColor || "black",
        skinTone: skinTone || "medium-brown",
        updatedAt: new Date().toISOString(),
      }, { onConflict: "studentId" })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, avatar: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Unable to save avatar" }, { status: 500 });
  }
}
