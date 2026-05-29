// GET /api/auth/full-diagnostic — Comprehensive auth diagnostic
// Visit this page on the live site to diagnose auth issues
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";
export const dynamic = "force-dynamic";

function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(base64, "base64").toString("utf-8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const lines: string[] = [];
  const issues: string[] = [];

  // 1. Check env vars
  lines.push("=== ENVIRONMENT ===");
  const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const hasNextAuthSecret = !!process.env.NEXTAUTH_SECRET;
  lines.push(`Supabase URL: ${hasSupabaseUrl ? "SET" : "MISSING!"}`);
  lines.push(`Supabase Anon Key: ${hasSupabaseKey ? `SET (${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length} chars)` : "MISSING!"}`);
  lines.push(`NextAuth Secret: ${hasNextAuthSecret ? "SET" : "MISSING!"}`);
  if (!hasSupabaseUrl) issues.push("NEXT_PUBLIC_SUPABASE_URL is missing");
  if (!hasSupabaseKey) issues.push("NEXT_PUBLIC_SUPABASE_ANON_KEY is missing");
  if (!hasNextAuthSecret) issues.push("NEXTAUTH_SECRET is missing");

  // 2. Check cookies
  lines.push("\n=== COOKIES ===");
  const cookieHeader = req.headers.get("cookie") || "";
  lines.push(`Cookie header length: ${cookieHeader.length}`);
  lines.push(`Cookie header present: ${cookieHeader.length > 0}`);
  
  const cookies: Record<string, string> = {};
  for (const part of cookieHeader.split(";")) {
    const [name, ...val] = part.split("=");
    cookies[name.trim()] = val.join("=").trim();
  }
  lines.push(`Cookie names: ${Object.keys(cookies).join(", ") || "(none)"}`);
  
  const sessionCookieNames = Object.keys(cookies).filter(n => n.includes("session"));
  lines.push(`Session cookies: ${sessionCookieNames.join(", ") || "(none)"}`);
  if (sessionCookieNames.length === 0) {
    lines.push("No session cookie — user is not logged in (this is normal if not logged in)");
  }

  // 3. Try to decode the session JWT
  lines.push("\n=== SESSION JWT ===");
  let jwtPayload: Record<string, any> | null = null;
  for (const name of sessionCookieNames) {
    const token = cookies[name];
    jwtPayload = decodeJwtPayload(token);
    lines.push(`Decoded ${name}: ${jwtPayload ? JSON.stringify(jwtPayload) : "FAILED"}`);
    if (jwtPayload) {
      lines.push(`  sub (user ID): ${jwtPayload.sub || "(missing)"}`);
      lines.push(`  email: ${jwtPayload.email || "(missing)"}`);
      lines.push(`  name: ${jwtPayload.name || "(missing)"}`);
    }
  }

  // 4. Check Supabase connectivity
  lines.push("\n=== SUPABASE CONNECTIVITY ===");
  try {
    const { data: users, error: usersError } = await supabase
      .from("User")
      .select("id, email, role")
      .limit(5);
    
    if (usersError) {
      lines.push(`User query ERROR: ${usersError.message}`);
      issues.push(`Supabase User query failed: ${usersError.message}`);
    } else {
      lines.push(`User query OK — ${users?.length || 0} users found`);
      if (users) {
        for (const u of users) {
          lines.push(`  - ${u.email} (${u.role})`);
        }
      }
    }
  } catch (err: any) {
    lines.push(`Supabase ERROR: ${err?.message}`);
    issues.push(`Supabase connection failed: ${err?.message}`);
  }

  // 5. If we have a JWT sub, try to look up that user
  if (jwtPayload?.sub) {
    lines.push("\n=== USER LOOKUP BY JWT SUB ===");
    try {
      const { data: user, error } = await supabase
        .from("User")
        .select("id, email, role, passwordHash")
        .eq("id", jwtPayload.sub)
        .single();
      
      if (error) {
        lines.push(`Lookup ERROR: ${error.message}`);
        issues.push(`User lookup by JWT sub failed: ${error.message}`);
      } else if (user) {
        lines.push(`Found user: ${user.email} (${user.role})`);
        lines.push(`Has password hash: ${!!user.passwordHash}`);
      } else {
        lines.push("User not found for this JWT sub");
        issues.push("JWT sub does not match any user in database");
      }
    } catch (err: any) {
      lines.push(`Lookup ERROR: ${err?.message}`);
    }
  }

  // 6. Test password verification for known accounts
  lines.push("\n=== PASSWORD VERIFICATION TEST ===");
  for (const email of ["arizeninternational@gmail.com", "vickielizabeths@gmail.com"]) {
    try {
      const { data: user, error } = await supabase
        .from("User")
        .select("id, email, role, passwordHash")
        .eq("email", email)
        .single();
      
      if (error || !user) {
        lines.push(`${email}: NOT FOUND (${error?.message || "no data"})`);
        continue;
      }
      
      if (!user.passwordHash) {
        lines.push(`${email}: NO PASSWORD HASH`);
        issues.push(`${email} has no password hash in database`);
        continue;
      }
      
      const isBcrypt = /^\$2[aby]\$\d+\$/.test(user.passwordHash);
      lines.push(`${email}: hash valid bcrypt = ${isBcrypt}, prefix = ${user.passwordHash.substring(0, 7)}`);
      
      if (isBcrypt) {
        const match = await bcrypt.compare("demo123", user.passwordHash);
        lines.push(`${email}: password "demo123" matches = ${match}`);
        if (!match) {
          issues.push(`${email}: password "demo123" does NOT match the stored hash`);
        }
      } else {
        lines.push(`${email}: password hash is NOT valid bcrypt!`);
        issues.push(`${email}: password hash is not valid bcrypt`);
      }
    } catch (err: any) {
      lines.push(`${email}: ERROR ${err?.message}`);
    }
  }

  // 7. Summary
  lines.push("\n=== SUMMARY ===");
  if (issues.length === 0) {
    lines.push("No issues detected. Auth should work.");
    lines.push("If login still fails, the issue may be in the NextAuth callback flow or CSRF token handling.");
  } else {
    lines.push(`ISSUES FOUND (${issues.length}):`);
    for (const issue of issues) {
      lines.push(`  ⚠ ${issue}`);
    }
  }

  return NextResponse.json({
    ok: issues.length === 0,
    issues,
    details: lines.join("\n"),
  }, {
    headers: { "Content-Type": "application/json" },
  });
}
