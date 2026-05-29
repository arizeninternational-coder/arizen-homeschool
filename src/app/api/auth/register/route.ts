import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";
export const dynamic = "force-dynamic";

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

    // Check if user exists via Supabase REST API
    const { data: existing, error: checkError } = await supabase
      .from("User")
      .select("id")
      .eq("email", normalizedEmail)
      .limit(1);

    if (checkError) {
      console.error("[AUTH] Supabase check error:", checkError);
      return NextResponse.json(
        { error: "Registration failed: database error" },
        { status: 500 }
      );
    }

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Find or create guild
    let guildId: string;
    if (guildSlug) {
      const { data: guild, error: guildError } = await supabase
        .from("Guild")
        .select("id")
        .eq("slug", guildSlug)
        .single();

      if (guildError || !guild) {
        return NextResponse.json(
          { error: `Guild "${guildSlug}" not found` },
          { status: 404 }
        );
      }
      guildId = guild.id;
    } else {
      // Use Prisma for this — it's a write operation
      const defaultGuild = await supabase
        .from("Guild")
        .select("id")
        .limit(1)
        .single();

      if (defaultGuild.data) {
        guildId = defaultGuild.data.id;
      } else {
        return NextResponse.json(
          { error: "No guild available. Please contact support." },
          { status: 500 }
        );
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user via Supabase REST API
    const userRole = role || "LEARNER";
    console.log(`[AUTH] Attempting to create user: ${normalizedEmail}, role: ${userRole}`);
    const { data: newUser, error: createError } = await supabase
      .from("User")
      .insert({
        guildId,
        email: normalizedEmail,
        name,
        passwordHash,
        role: userRole,
      })
      .select("id, name, email, role")
      .single();

    if (createError) {
      console.error("[AUTH] Supabase create error:", JSON.stringify(createError));
      return NextResponse.json(
        { error: `Registration failed: ${createError.message || createError.code || 'Unknown database error'}` },
        { status: 500 }
      );
    }

    console.log(`[AUTH] User created: ${newUser.id}`);

    // Create learner profile if LEARNER
    let learnerProfile = null;
    if (userRole === "LEARNER") {
      const { data: profile, error: profileError } = await supabase
        .from("LearnerProfile")
        .insert({
          userId: newUser.id,
          guildId,
          displayName: displayName || name,
          grade: grade || 5,
        })
        .select("id, displayName, grade")
        .single();

      if (!profileError && profile) {
        learnerProfile = profile;
      }
    }

    console.log(`[AUTH] Registered: ${normalizedEmail} (${userRole})`);

    return NextResponse.json(
      {
        message: "Account created successfully",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          learnerProfile,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[AUTH] Registration error:", error);
    const message = error?.message || "Unknown error";
    return NextResponse.json(
      { error: `Registration failed: ${message}` },
      { status: 500 }
    );
  }
}
