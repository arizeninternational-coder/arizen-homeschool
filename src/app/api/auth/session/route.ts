import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabase } from "@/lib/supabase";

const secret = process.env.NEXTAUTH_SECRET || "arizen-dev-secret-change-in-production";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

async function getAuthenticatedUser(req: NextRequest) {
  try {
    const token = await getToken({ req, secret });
    if (!token?.sub) return null;

    const { data: user, error: userError } = await supabase
      .from("User")
      .select("id, name, email, role, guildId")
      .eq("id", token.sub)
      .single();

    if (userError || !user) return null;

    // Fetch guild
    let guildData = null;
    if (user.guildId) {
      const { data: guild } = await supabase
        .from("Guild")
        .select("slug, name")
        .eq("id", user.guildId)
        .single();
      guildData = guild;
    }

    // Fetch learner profile
    const { data: learnerProfile } = await supabase
      .from("LearnerProfile")
      .select("id, displayName, grade, totalXp, currentStreak, bestStreak")
      .eq("userId", user.id)
      .single();

    return {
      ...user,
      guild: guildData,
      learnerProfile,
    };
  } catch (err: any) {
    console.error("[SESSION] Error:", err.message);
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return error("Unauthorized", 401);

    return json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        guildId: user.guildId,
        guildSlug: user.guild?.slug || null,
        guildName: user.guild?.name || null,
        learnerProfile: user.learnerProfile
          ? {
              id: user.learnerProfile.id,
              displayName: user.learnerProfile.displayName,
              grade: user.learnerProfile.grade,
              totalXp: user.learnerProfile.totalXp,
              currentStreak: user.learnerProfile.currentStreak,
              bestStreak: user.learnerProfile.bestStreak,
            }
          : null,
      },
    });
  } catch (err: any) {
    console.error("[SESSION] GET error:", err.message);
    return error("Internal server error", 500);
  }
}
