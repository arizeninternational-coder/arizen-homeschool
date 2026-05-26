import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, guildSlug, role, grade, displayName } = body;

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Find or create guild
    let guildId: string;
    if (guildSlug) {
      const guild = await prisma.guild.findUnique({ where: { slug: guildSlug } });
      if (!guild) {
        return NextResponse.json(
          { error: `Guild "${guildSlug}" not found` },
          { status: 404 }
        );
      }
      guildId = guild.id;
    } else {
      const defaultGuild = await prisma.guild.findFirst();
      if (defaultGuild) {
        guildId = defaultGuild.id;
      } else {
        const newGuild = await prisma.guild.create({
          data: {
            name: "My Homeschool",
            slug: `homeschool-${Date.now()}`,
          },
        });
        guildId = newGuild.id;
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const userRole = (role as UserRole) || UserRole.LEARNER;
    const user = await prisma.user.create({
      data: {
        guildId,
        email: normalizedEmail,
        name,
        passwordHash,
        role: userRole,
        learnerProfile: userRole === UserRole.LEARNER
          ? {
              create: {
                guildId,
                displayName: displayName || name,
                grade: grade || 5,
              },
            }
          : undefined,
      },
      include: { learnerProfile: true },
    });

    console.log(`[AUTH] Registered: ${normalizedEmail} (${userRole})`);

    return NextResponse.json(
      {
        message: "Account created successfully",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          learnerProfile: user.learnerProfile
            ? {
                id: user.learnerProfile.id,
                displayName: user.learnerProfile.displayName,
                grade: user.learnerProfile.grade,
              }
            : null,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    // ALWAYS log the full error to server logs
    console.error("[AUTH] Registration error:", error);
    console.error("[AUTH] Error message:", error?.message);
    console.error("[AUTH] Error code:", error?.code);
    console.error("[AUTH] Error meta:", JSON.stringify(error?.meta || {}));

    // Return the actual error so we can see what's wrong
    // In production this is safe — it's just a registration error message
    const message = error?.message || "Unknown error";
    return NextResponse.json(
      { error: `Registration failed: ${message}` },
      { status: 500 }
    );
  }
}
