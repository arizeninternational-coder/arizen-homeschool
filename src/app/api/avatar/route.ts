import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAuthUser } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

// GET /api/avatar — get current student's avatar config
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Find learner profile id from user id
    const { data: profile } = await supabase
      .from("LearnerProfile")
      .select("id")
      .eq("userId", user.id)
      .maybeSingle();

    const learnerId = profile?.id;
    if (!learnerId) return NextResponse.json({ avatar: null });

    const { data, error } = await supabase
      .from("StudentAvatar")
      .select("*")
      .eq("learnerId", learnerId)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    return NextResponse.json({ avatar: data || null });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Unable to load avatar" }, { status: 500 });
  }
}

// POST /api/avatar — save avatar config
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Find learner profile id from user id
    const { data: profile } = await supabase
      .from("LearnerProfile")
      .select("id")
      .eq("userId", user.id)
      .maybeSingle();

    const learnerId = profile?.id;
    if (!learnerId) return NextResponse.json({ error: "No learner profile" }, { status: 404 });

    const body = await req.json();
    const { hairStyle, hairColor, skinTone, outfitColor, shoeColor, accessoryId, petId, backgroundId, shoesId } = body;

    // Check if avatar exists
    const { data: existing } = await supabase
      .from("StudentAvatar")
      .select("id")
      .eq("learnerId", learnerId)
      .maybeSingle();

    const upsertData: any = { learnerId };

    if (existing) {
      // Update only provided fields
      if (hairStyle !== undefined) upsertData.hairStyle = hairStyle;
      if (hairColor !== undefined) upsertData.hairColor = hairColor;
      if (skinTone !== undefined) upsertData.skinTone = skinTone;
      if (outfitColor !== undefined) upsertData.outfitColor = outfitColor;
      if (shoeColor !== undefined) upsertData.shoeColor = shoeColor;
      if (accessoryId !== undefined) upsertData.equippedAccessoryId = accessoryId;
      if (petId !== undefined) upsertData.equippedPetId = petId;
      if (backgroundId !== undefined) upsertData.equippedBackgroundId = backgroundId;
      if (shoesId !== undefined) upsertData.equippedShoesId = shoesId;

      const { data, error } = await supabase
        .from("StudentAvatar")
        .update(upsertData)
        .eq("learnerId", learnerId)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, avatar: data });
    } else {
      // Create new
      upsertData.hairStyle = hairStyle || "short-curls";
      upsertData.hairColor = hairColor || "black";
      upsertData.skinTone = skinTone || "medium-brown";

      const { data, error } = await supabase
        .from("StudentAvatar")
        .insert(upsertData)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, avatar: data });
    }
  } catch (e: any) {
    console.error("[AVATAR_SAVE] Error:", e);
    return NextResponse.json({ error: e.message || "Unable to save avatar" }, { status: 500 });
  }
}
