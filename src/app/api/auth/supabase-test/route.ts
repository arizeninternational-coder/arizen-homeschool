import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const results: any = {
    timestamp: new Date().toISOString(),
    env: {
      SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "MISSING",
      SUPABASE_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? `SET (${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 10)}...)` : "MISSING",
    },
    tests: {},
  };

  // Test 1: Simple select
  try {
    const { data, error } = await supabase
      .from("Guild")
      .select("id, name, slug")
      .limit(3);
    results.tests.select = {
      success: !error,
      error: error?.message || null,
      rowCount: data?.length || 0,
      sample: data?.[0] || null,
    };
  } catch (e: any) {
    results.tests.select = { success: false, error: e.message };
  }

  // Test 2: Insert a test row
  try {
    const testId = `test-${Date.now()}`;
    const { data: inserted, error: insertError } = await supabase
      .from("Guild")
      .insert({ name: "Diagnostic Test Guild", slug: testId })
      .select("id")
      .single();
    results.tests.insert = {
      success: !insertError,
      error: insertError?.message || null,
      insertedId: inserted?.id || null,
    };
    // Clean up
    if (inserted?.id) {
      await supabase.from("Guild").delete().eq("id", inserted.id);
      results.tests.cleanup = { success: true };
    }
  } catch (e: any) {
    results.tests.insert = { success: false, error: e.message };
  }

  // Test 3: Check User table structure
  try {
    const { data: users, error: userError } = await supabase
      .from("User")
      .select("id, email, role, passwordHash")
      .limit(1);
    results.tests.userTable = {
      success: !userError,
      error: userError?.message || null,
      hasData: users && users.length > 0,
      columns: users?.[0] ? Object.keys(users[0]) : [],
    };
  } catch (e: any) {
    results.tests.userTable = { success: false, error: e.message };
  }

  return NextResponse.json(results);
}
