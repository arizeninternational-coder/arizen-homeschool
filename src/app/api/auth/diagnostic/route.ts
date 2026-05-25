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

    // Check demo users
    const demoUsers = await prisma.user.findMany({
      where: { email: { in: ["victor@arizen.local", "ariadne@arizen.local", "ariyana@arizen.local"] } },
      select: { email: true, role: true, passwordHash: true },
    });

    return NextResponse.json({
      status: "ok",
      database: "connected",
      counts: { users: userCount, guilds: guildCount },
      bcrypt: { hashWorks: testVerify },
      demoUsers: demoUsers.map(u => ({
        email: u.email,
        role: u.role,
        hashPrefix: u.passwordHash?.substring(0, 7) + "...",
      })),
    });
  } catch (error: any) {
    return NextResponse.json({
      status: "error",
      message: error.message,
      stack: process.env.NODE_ENV !== "production" ? error.stack : undefined,
    }, { status: 500 });
  }
}
