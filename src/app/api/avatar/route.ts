import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api-guard";
import { supabase } from "@/lib/supabase";
export const dynamic = "force-dynamic";

const EQUIP_FIELDS: Record<string, string> = {
  equippedHatId: "HATS",
  equippedTopId: "CLOTHING",
  equippedBottomId: "CLOTHING",
  equippedShoesId: "SHOES",
  equippedGlassesId: "GLASSES",
  equippedAccessoryId: "ACCESSORIES",
  equippedToolId: "LEARNING_TOOLS",
  equippedPetId: "PETS",
  equippedBackgroundId: "BACKGROUNDS",
};

export const GET = withAuth(async (req: NextRequest, user: any, url: URL) => {
  try {
    const learnerId = user.learnerProfileId;
    if (!learnerId) {
      return NextResponse.json({ error: "No learner profile found" }, { status: 404 });
    }

    let { data: avatar, error: fetchError } = await supabase
      .from("StudentAvatar")
      .select("*")
      .eq("learnerId", learnerId)
      .single();

    if (fetchError && fetchError.code === "PGRST116") {
      const { data: newAvatar, error: createError } = await supabase
        .from("StudentAvatar")
        .insert({ learnerId, baseAvatar: "default", skinTone: "medium", hairStyle: "short", hairColor: "brown", faceExpression: "smile" })
        .select("*")
        .single();
      if (createError) {
        return NextResponse.json({ error: "Failed to create avatar", details: createError.message }, { status: 500 });
      }
      avatar = newAvatar;
    } else if (fetchError) {
      return NextResponse.json({ error: "Failed to fetch avatar", details: fetchError.message }, { status: 500 });
    }

    const itemIds: string[] = [];
    for (const field of Object.keys(EQUIP_FIELDS)) {
      const val = (avatar as any)?.[field];
      if (val) itemIds.push(val);
    }

    let equippedItems: any[] = [];
    if (itemIds.length > 0) {
      const { data: items } = await supabase.from("AvatarItem").select("*").in("id", itemIds);
      equippedItems = items || [];
    }

    const equippedMap: Record<string, any> = {};
    for (const item of equippedItems) {
      for (const field of Object.keys(EQUIP_FIELDS)) {
        if ((avatar as any)?.[field] === item.id) { equippedMap[field] = item; break; }
      }
    }

    return NextResponse.json({ avatar: { ...avatar, equippedItems: equippedMap } });
  } catch (err: any) {
    return NextResponse.json({ error: "Internal error", details: err?.message }, { status: 500 });
  }
});
