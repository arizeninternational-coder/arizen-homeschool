import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabase } from "@/lib/supabase";

const secret = process.env.NEXTAUTH_SECRET || "arizen-dev-secret-change-in-production";

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret });
    if (!token?.sub) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const { data: user } = await supabase
      .from("User")
      .select("id, name, email, role, guildId")
      .eq("id", token.sub)
      .single();

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        guildId: user.guildId,
      },
    });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
