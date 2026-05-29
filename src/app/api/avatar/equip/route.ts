import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api-guard";
import { supabase } from "@/lib/supabase";
export const dynamic = "force-dynamic";

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

    const { avatarItemId, category } = body || {};
    if (!avatarItemId) return NextResponse.json({ error: "avatarItemId required" }, { status: 400 });

    const fieldName = CATEGORY_FIELD_MAP[category];
    if (!fieldName) return NextResponse.json({ error: `Unknown category: ${category}` }, { status: 400 });

    // Verify ownership
    const { data: ownership } = await supabase
      .from("StudentInventory")
      .select("id")
      .eq("learnerId", learnerId)
      .eq("avatarItemId", avatarItemId)
      .single();

    if (!ownership) return NextResponse.json({ error: "Item not in inventory" }, { status: 403 });

    // Unequip existing item in same category
    const { data: currentAvatar } = await supabase
      .from("StudentAvatar")
      .select("*")
      .eq("learnerId", learnerId)
      .single();

    if (currentAvatar) {
      const existingItemId = (currentAvatar as any)[fieldName];
      if (existingItemId) {
        await supabase.from("StudentInventory").update({ equipped: false }).eq("avatarItemId", existingItemId).eq("learnerId", learnerId);
      }
    }

    // Equip new item
    const { data: updated, error: updErr } = await supabase
      .from("StudentAvatar")
      .update({ [fieldName]: avatarItemId })
      .eq("learnerId", learnerId)
      .select("*")
      .single();

    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

    await supabase.from("StudentInventory").update({ equipped: true }).eq("avatarItemId", avatarItemId).eq("learnerId", learnerId);

    return NextResponse.json({ avatar: updated, success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to equip" }, { status: 500 });
  }
});
