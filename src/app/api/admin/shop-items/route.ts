// GET /api/admin/shop-items — List all shop items (ADMIN only)
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/api-guard";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { data: items, error } = await supabase
      .from("AvatarItem")
      .select("id, name, description, category, price, rarity, isActive, unlockRequirementType, unlockRequirementValue, createdAt")
      .order("createdAt", { ascending: false });

    if (error) {
      console.error("[ADMIN_SHOP_ITEMS] Error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ items: items || [] });
  } catch (err: any) {
    console.error("[ADMIN_SHOP_ITEMS] Critical error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch shop items" }, { status: 500 });
  }
}
