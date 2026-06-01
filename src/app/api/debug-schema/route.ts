import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );

  // Get column names by selecting one row
  const { data: sample, error: sampleErr } = await supabase.from("Theme").select("*").limit(1);

  return NextResponse.json({
    columnNames: sample?.[0] ? Object.keys(sample[0]) : [],
    sampleRow: sample?.[0] || null,
    error: sampleErr?.message || null,
  });
}
