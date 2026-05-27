import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  const results: any = {
    timestamp: new Date().toISOString(),
    env: {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || "MISSING",
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? `SET (${process.env.NEXTAUTH_SECRET.substring(0, 8)}...)` : "MISSING",
      SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "MISSING",
      SUPABASE_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "SET" : "MISSING",
    },
  };

  try {
    const body = await request.json().catch(() => ({}));
    const testEmail = (body.email || "victor@arizen.local").toLowerCase().trim();

    // Test 1: Query user with all columns
    const { data: userAll, error: errAll } = await supabase
      .from("User")
      .select("*")
      .eq("email", testEmail)
      .single();

    results.userQuery = {
      found: !!userAll && !errAll,
      error: errAll?.message || null,
      columnNames: userAll ? Object.keys(userAll) : [],
    };

    if (userAll) {
      // Find password-related fields
      const passFields = Object.entries(userAll)
        .filter(([k]) => k.toLowerCase().includes("pass") || k.toLowerCase().includes("hash"));
      
      results.passwordFields = passFields.map(([k, v]) => ({
        column: k,
        type: typeof v,
        isNull: v === null,
        isUndefined: v === undefined,
        valuePreview: v ? (typeof v === "string" ? v.substring(0, 15) + "..." : String(v)) : null,
      }));

      // Get the actual hash field
      const hashField = Object.keys(userAll).find(k => 
        k.toLowerCase().includes("pass") || k.toLowerCase().includes("hash")
      );
      
      if (hashField) {
        const hash = (userAll as any)[hashField];
        results.hashAnalysis = {
          fieldUsed: hashField,
          hashValue: hash ? hash.substring(0, 20) + "..." : null,
          isValidBcrypt: /^\$2[aby]\$\d+\$/.test(hash || ""),
          hashLength: hash?.length || 0,
        };
        
        // Test bcrypt compare
        const testPasswords = ["demo123", "password", "123456"];
        results.bcryptTests = {};
        for (const testPass of testPasswords) {
          try {
            const match = hash ? await bcrypt.compare(testPass, hash) : false;
            (results.bcryptTests as any)[testPass] = match;
          } catch (e: any) {
            (results.bcryptTests as any)[testPass] = `ERROR: ${e.message}`;
          }
        }
      }
    }

    // List some users
    const { data: sampleUsers } = await supabase
      .from("User")
      .select("id, email, role")
      .limit(5);
    results.sampleUsers = sampleUsers;

  } catch (e: any) {
    results.error = e.message;
  }

  return NextResponse.json(results);
}
