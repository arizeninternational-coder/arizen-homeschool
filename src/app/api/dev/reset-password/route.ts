import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, newPassword } = body;

    if (!email || !newPassword) {
      return NextResponse.json({ error: "Email and newPassword required" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    const { data, error } = await supabase
      .from("User")
      .update({ passwordHash })
      .eq("email", email)
      .select("id, email, role")
      .single();

    if (error) {
      console.error("Password reset error:", error);
      return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Password reset for ${email}`,
      user: { id: data.id, email: data.email, role: data.role },
    });
  } catch (e: any) {
    console.error("Password reset error:", e);
    return NextResponse.json({ error: e.message || "Failed" }, { status: 500 });
  }
}
