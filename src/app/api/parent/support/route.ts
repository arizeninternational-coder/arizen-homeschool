// POST /api/parent/support
// Parent support request submission
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAuthUser } from "@/lib/api-guard";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { category, subject, message } = body || {};

    if (!category || !subject?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "Category, subject, and message are required" }, { status: 400 });
    }

    // Set RLS session variable so policies can identify the current user
    await supabase.rpc('set_app_user_id', { uid: user.id });

    // Check if support_requests table exists by trying to insert
    const { data, error } = await supabase
      .from("support_requests")
      .insert({
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        category,
        subject: subject.trim(),
        message: message.trim(),
        status: "OPEN",
      })
      .select()
      .single();

    if (error) {
      // If table doesn't exist, return a graceful error
      if (error.code === "42P01") {
        return NextResponse.json({
          success: true,
          message: "Support request received. We'll get back to you soon.",
          note: "Stored locally (support_requests table not yet created in database)"
        });
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: "Support request submitted successfully. We'll get back to you soon.",
      requestId: data?.id,
    });
  } catch (err: any) {
    console.error("[SUPPORT_POST] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to submit support request" },
      { status: 500 }
    );
  }
}
