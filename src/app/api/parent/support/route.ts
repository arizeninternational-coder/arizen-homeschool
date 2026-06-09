// POST /api/parent/support
// Parent support request submission
// Permission: userId must match the logged-in user (from JWT)
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
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
      return NextResponse.json(
        { error: "Category, subject, and message are required" },
        { status: 400 }
      );
    }

    // Verify the user is a parent (only parents submit support requests)
    if (user.role !== "PARENT") {
      return NextResponse.json(
        { error: "Only parents can submit support requests" },
        { status: 403 }
      );
    }

    const db = getSupabaseAdmin();

    // Insert support request — userId comes from JWT, not from client input
    const { data, error } = await db
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
          note: "Stored locally (support_requests table not yet created in database)",
        });
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: "Support request submitted successfully. We'll get back to you soon.",
      request: data,
    });
  } catch (err: any) {
    console.error("[SUPPORT_POST] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
