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
    const body = await request.json();
    const { email } = body;
    const testEmail = email || "victor@arizen.local";
    const normalizedEmail = testEmail.toLowerCase().trim();

    // Test 1: Query user with passwordHash (camelCase - Prisma convention)
    const { data: userCamel, error: errCamel } = await supabase
      .from("User")
      .select("id, email, role, passwordHash")
      .eq("email", normalizedEmail)
      .single();

    results.test1_camelCase = {
      found: !!userCamel && !errCamel,
      error: errCamel?.message || null,
      hasPasswordHash: !!userCamel?.passwordHash,
      hashSample: userCamel?.passwordHash ? userCamel.passwordHash.substring(0, 10) + "..." : null,
    };

    // Test 2: Query all columns to see actual column names
    const { data: userAll, error: errAll } = await supabase
      .from("User")
      .select("*")
      .eq("email", normalizedEmail)
      .single();

    results.test2_allColumns = {
      found: !!userAll && !errAll,
      error: errAll?.message || null,
      columnNames: userAll ? Object.keys(userAll) : [],
      passwordRelatedFields: userAll
        ? Object.entries(userAll)
            .filter(([k]) => k.toLowerCase().includes("pass") || k.toLowerCase().includes("hash"))
            .map(([k, v]) => ({ column: k, value: typeof v === "string" ? v.substring(0, 10) + "..." : v }))
        : [],
    };

    // Test 3: If we found a hash, test bcrypt compare
    if (userAll) {
      const hashField = Object.keys(userAll).find(k => 
        k.toLowerCase().includes("pass") || k.toLowerCase().includes("hash")
      );
      if (hashField) {
        const hash = (userAll as any)[hashField];
        results.test3_hashAnalysis = {
          fieldUsed: hashField,
          hashValue: hash ? hash.substring(0, 15) + "..." : null,
          isValidBcrypt: /^\$2[aby]\$\d+\$/.test(hash || ""),
          hashLength: hash?.length || 0,
        };
        
        // Test bcrypt compare with common passwords
        const testPasswords = ["demo123", "password", "123456", "test123"];
        results.test4_bcryptTests = {};
        for (const testPass of testPasswords) {
          try {
            const match = await bcrypt.compare(testPass, hash);
            (results.test4_bcryptTests as any)[testPass] = match;
          } catch {
            (results.test4_bcryptTests as any)[testPass] = "ERROR";
          }
        }
      }
    }

    // Test 5: List some users to see data structure
    const { data: sampleUsers } = await supabase
      .from("User")
      .select("id, email, role")
      .limit(5);
    results.test5_sampleUsers = sampleUsers;

  } catch (e: any) {
    results.error = e.message;
  }

  return NextResponse.json(results);
}
