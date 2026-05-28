import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api-guard";
import { supabase } from "@/lib/supabase";

const CATEGORY_FIELD_MAP: Record<string, string> = {
  HATS: "equippedHatId",
  CLOTHING: "equippedTopId",
  SHOES: "equippedShoesId",
  GLASSES: "equippedGlassesId",
  ACCESSORIES: "equippedAccessoryId",
  LEARNING_TOOLS: "equippedToolId",
  PETS: "equippedPetId",
  BACKGROUNDS: "equippedBackgroundId",
};

export const POST = withAuth(async (req: NextRequest, user: any, body: any) => {
  try {
    const learnerId = user.learnerProfileId;
    if (!learnerId) return NextResponse.json({ error: "No learner profile" }, { status: 404 });

    const { category } = body || {};
    const fieldName = CATEGORY_FIELD_MAP[category];
    if (!fieldName) return NextResponse.json({ error: `Unknown category: ${category}` }, { status: 400 });

    // Get current avatar to find the equipped item
    const { data: currentAvatar } = await supabase
      .from("StudentAvatar")
      .select("*")
      .eq("learnerId", learnerId)
      .single();

    const existingItemId = (currentAvatar as any)?.[fieldName];

    // Unequip
    const { data: updated, error: updErr } = await supabase
      .from("StudentAvatar")
      .update({ [fieldName]: null })
      .eq("learnerId", learnerId)
      .select("*")
      .single();

    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

    if (existingItemId) {
      await supabase.from("StudentInventory").update({ equipped: false }).eq("avatarItemId", existingItemId).eq("learnerId", learnerId);
    }

    return NextResponse.json({ avatar: updated, success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to unequip" }, { status: 500 });
  }
});
