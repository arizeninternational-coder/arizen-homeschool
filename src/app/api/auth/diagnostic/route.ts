import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  const results: any = {
    status: "ok",
    version: "v4-port-diagnostic",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks: {},
    errors: [],
  };

  // 1. Check environment variables (don't expose values)
  const requiredEnvVars = ["DATABASE_URL", "DIRECT_URL", "NEXTAUTH_SECRET", "NEXTAUTH_URL"];
  results.checks.envVars = {};
  for (const v of requiredEnvVars) {
    const val = process.env[v];
    if (v === "DATABASE_URL" && val) {
      const portMatch = val.match(/:(\d+)\//);
      const port = portMatch ? portMatch[1] : "unknown";
      results.checks.envVars[v] = `SET (port ${port})`;
    } else {
      results.checks.envVars[v] = val
        ? `SET (${val.substring(0, 15)}...)`
        : "MISSING";
    }
    if (!val) results.errors.push(`Missing env var: ${v}`);
  }

  // 2. Check database connection
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
