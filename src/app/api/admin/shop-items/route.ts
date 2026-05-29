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
      .select("*")
      .order("createdAt", { ascending: false });

    if (error) {
      console.error("[ADMIN_SHOP_ITEMS] Error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Normalize items to ensure consistent fields
    const normalized = (items || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description || "",
      category: item.category || "OTHER",
      price: item.price || 0,
      rarity: item.rarity || "COMMON",
      isActive: item.isActive !== false,
      unlockRequirementType: item.unlockRequirementType || null,
      unlockRequirementValue: item.unlockRequirementValue || null,
      emoji: item.emoji || "🎁",
      createdAt: item.createdAt,
    }));

    return NextResponse.json({ items: normalized });
  } catch (err: any) {
    console.error("[ADMIN_SHOP_ITEMS] Critical error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch shop items" }, { status: 500 });
  }
}
