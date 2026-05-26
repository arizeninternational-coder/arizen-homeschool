import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { createConnection } from "net";

function testTcpConnection(host: string, port: number, timeoutMs = 5000): Promise<{ reachable: boolean; error?: string }> {
  return new Promise((resolve) => {
    const socket = createConnection({ host, port, timeout: timeoutMs });
    socket.on("connect", () => {
      socket.destroy();
      resolve({ reachable: true });
    });
    socket.on("timeout", () => {
      socket.destroy();
      resolve({ reachable: false, error: "TCP connection timed out" });
    });
    socket.on("error", (err: any) => {
      resolve({ reachable: false, error: err.message || "TCP connection failed" });
    });
  });
}

export async function GET(request: NextRequest) {
  const results: any = {
    status: "ok",
    version: "v6-supabase-test",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercel: !!process.env.VERCEL,
    checks: {},
    errors: [],
  };

  // 1. Check environment variables (don't expose values)
  const requiredEnvVars = ["DATABASE_URL", "DIRECT_URL", "NEXTAUTH_SECRET", "NEXTAUTH_URL", "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"];
  results.checks.envVars = {};
  for (const v of requiredEnvVars) {
    const val = process.env[v];
    if (v === "DATABASE_URL" && val) {
      const portMatch = val.match(/:(\d+)\//);
      const port = portMatch ? portMatch[1] : "unknown";
      results.checks.envVars[v] = `SET (port ${port})`;
    } else if (v === "NEXT_PUBLIC_SUPABASE_ANON_KEY" && val) {
      results.checks.envVars[v] = val ? `SET (${val.substring(0, 10)}...)` : "MISSING";
    } else {
      results.checks.envVars[v] = val
        ? `SET (${val.substring(0, 15)}...)`
        : "MISSING";
    }
    if (!val) results.errors.push(`Missing env var: ${v}`);
  }

  // 1b. Raw TCP connectivity test
  const dbHost = "db.hgufndnqbvcukbxmwtvo.supabase.co";
  results.checks.tcp = {};
  const [tcp5432, tcp6543] = await Promise.all([
    testTcpConnection(dbHost, 5432),
    testTcpConnection(dbHost, 6543),
  ]);
  results.checks.tcp["5432_direct"] = tcp5432;
  results.checks.tcp["6543_pooled"] = tcp6543;
  if (!tcp6543.reachable) {
    results.errors.push(`TCP 6543 unreachable: ${tcp6543.error}`);
  }

  // 1c. Supabase REST API test (HTTPS - works even when TCP fails)
  try {
    const { data, error: supaError } = await supabase
      .from("Guild")
      .select("id")
      .limit(1);
    results.checks.supabaseRest = {
      works: !supaError,
      error: supaError?.message || null,
      guildCount: data?.length || 0,
    };
    if (supaError) {
      results.errors.push(`Supabase REST API failed: ${supaError.message}`);
    }
  } catch (supaCatch: any) {
    results.checks.supabaseRest = { works: false, error: supaCatch.message };
    results.errors.push(`Supabase REST API exception: ${supaCatch.message}`);
  }

  // 2. Check database connection (Prisma - TCP based, may fail on Vercel)
  try {
    const userCount = await prisma.user.count();
    const guildCount = await prisma.guild.count();
    results.checks.database = {
      connected: true,
      users: userCount,
      guilds: guildCount,
    };
  } catch (dbError: any) {
    results.checks.database = { connected: false, error: dbError.message };
    results.errors.push(`Database connection failed: ${dbError.message}`);
    results.status = "error";
  }

  // 3. Check bcrypt
  try {
    const testHash = await bcrypt.hash("diagnostic-test", 10);
    const testVerify = await bcrypt.compare("diagnostic-test", testHash);
    results.checks.bcrypt = { works: testVerify };
    if (!testVerify) {
      results.errors.push("Bcrypt compare failed");
      results.status = "error";
    }
  } catch (bcryptError: any) {
    results.checks.bcrypt = { works: false, error: bcryptError.message };
    results.errors.push(`Bcrypt failed: ${bcryptError.message}`);
    results.status = "error";
  }

  // 4. Check demo users and their passwords
  try {
    const demoEmails = ["victor@arizen.local", "ariadne@arizen.local", "ariyana@arizen.local"];
    const demoUsers = await prisma.user.findMany({
      where: { email: { in: demoEmails } },
      select: { email: true, role: true, passwordHash: true },
    });

    results.checks.demoUsers = [];
    for (const u of demoUsers) {
      let passwordOk = false;
      let hashPrefix = "none";
      if (u.passwordHash) {
        hashPrefix = u.passwordHash.substring(0, 10) + "...";
        try {
          passwordOk = await bcrypt.compare("demo123", u.passwordHash);
        } catch {
          passwordOk = false;
        }
      }
      results.checks.demoUsers.push({
        email: u.email,
        role: u.role,
        hashPrefix,
        demo123Works: passwordOk,
      });
      if (!passwordOk) {
        results.errors.push(`Demo user ${u.email}: password "demo123" does NOT match stored hash`);
      }
    }

    const foundEmails = demoUsers.map((u) => u.email);
    for (const e of demoEmails) {
      if (!foundEmails.includes(e)) {
        results.errors.push(`Demo user missing: ${e}`);
      }
    }
  } catch (userError: any) {
    results.checks.demoUsers = { error: userError.message };
    results.errors.push(`Demo user check failed: ${userError.message}`);
  }

  // 5. Check if we can create and delete a test user (write test)
  try {
    const testEmail = `diagnostic-${Date.now()}@test.local`;
    const guild = await prisma.guild.findFirst();
    if (guild) {
      const testUser = await prisma.user.create({
        data: {
          guildId: guild.id,
          email: testEmail,
          name: "Diagnostic Test",
          passwordHash: "$2a$10$test",
          role: "LEARNER",
        },
      });
      await prisma.user.delete({ where: { id: testUser.id } });
      results.checks.writeTest = { success: true };
    } else {
      results.checks.writeTest = { success: false, error: "No guild found" };
    }
  } catch (writeError: any) {
    results.checks.writeTest = { success: false, error: writeError.message };
    results.errors.push(`Write test failed: ${writeError.message}`);
  }

  // 6. Check NextAuth config
  results.checks.nextauth = {
    secretSet: !!process.env.NEXTAUTH_SECRET,
    urlSet: !!process.env.NEXTAUTH_URL,
    url: process.env.NEXTAUTH_URL || "NOT SET",
  };

  const statusCode = results.status === "ok" ? 200 : 500;
  return NextResponse.json(results, { status: statusCode });
}
