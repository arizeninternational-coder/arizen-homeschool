import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api-guard";
import { supabase } from "@/lib/supabase";

export const GET = withAuth(async (req: NextRequest, user: any, url: URL) => {
  try {
    const learnerId = user.learnerProfileId;
    if (!learnerId) return NextResponse.json({ transactions: [] });

    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    const { data, error } = await supabase
      .from("CoinTransaction")
      .select("*")
      .eq("learnerId", learnerId)
      .order("createdAt", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ transactions: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to fetch transactions" }, { status: 500 });
  }
});
