import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAuthUser } from "@/lib/api-guard";

export async function GET(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authUser.learnerProfileId) return NextResponse.json({ inventory: [] });

  const { data, error } = await supabase
    .from("StudentInventory")
    .select("id, equipped, purchasedAt, avatarItem:AvatarItem(id, name, description, category, price, rarity, emoji)")
    .eq("learnerId", authUser.learnerProfileId)
    .order("purchasedAt", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ inventory: data || [] });
}
