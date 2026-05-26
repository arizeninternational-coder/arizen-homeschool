import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    // Test DB connection
    const userCount = await prisma.user.count();
    const guildCount = await prisma.guild.count();

    // Test bcrypt
    const testHash = await bcrypt.hash("test123", 12);
    const testVerify = await bcrypt.compare("test123", testHash);

    // Check demo users and verify their passwords
    const demoUsers = await prisma.user.findMany({
      where: { email: { in: ["victor@arizen.local", "ariadne@arizen.local", "ariyana@arizen.local"] } },
      select: { email: true, role: true, passwordHash: true },
    });

    // Test if demo123 matches any of the stored hashes
    const demo123Hash = "$2a$10$hKjvSVKJZv85IPq9PVV6wOxXuX9v14sm0c5C5aN6XJ2E2qyOz/x5W";
    const demo123Verify = await bcrypt.compare("demo123", demo123Hash);

    // Test against the first demo user's actual hash
    let storedHashVerify = false;
    if (demoUsers[0]?.passwordHash) {
      storedHashVerify = await bcrypt.compare("demo123", demoUsers[0].passwordHash);
    }

    return NextResponse.json({
      status: "ok",
      database: "connected",
      counts: { users: userCount, guilds: guildCount },
      bcrypt: { hashWorks: testVerify },
      demo123NewHashWorks: demo123Verify,
      demo123AgainstStoredHash: storedHashVerify,
      demoUsers: demoUsers.map(u => ({
        email: u.email,
        role: u.role,
        hashPrefix: u.passwordHash?.substring(0, 10) + "...",
      })),
      message: storedHashVerify
        ? "Login should work with demo123"
        : "Password mismatch — demo123 does NOT match stored hash. Run the SQL fix.",
    });
  } catch (error: any) {
    return NextResponse.json({
      status: "error",
      message: error.message,
      stack: process.env.NODE_ENV !== "production" ? error.stack : undefined,
    }, { status: 500 });
  }
}
