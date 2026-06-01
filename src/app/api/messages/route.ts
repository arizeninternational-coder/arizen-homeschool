// GET /api/messages — Get messages for the current user (parent or student)
// POST /api/messages — Send a message
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { withAuth } from "@/lib/api-guard";
export const dynamic = "force-dynamic";

export const GET = withAuth(async (req, user) => {
  try {
    const { searchParams } = new URL(req.url);
    const otherUserId = searchParams.get("otherUserId");

    let query = supabase
      .from("Message")
      .select("*")
      .or(`senderId.eq.${user.id},recipientId.eq.${user.id}`)
      .order("createdAt", { ascending: true });

    if (otherUserId) {
      query = supabase
        .from("Message")
        .select("*")
        .or(`and(senderId.eq.${user.id},recipientId.eq.${otherUserId}),and(senderId.eq.${otherUserId},recipientId.eq.${user.id})`)
        .order("createdAt", { ascending: true });
    }

    const { data, error } = await query.limit(100);
    if (error) throw error;

    return NextResponse.json({ messages: data || [] });
  } catch (err: any) {
    console.error("[MESSAGES] Error:", err);
    return NextResponse.json({ messages: [] });
  }
});

export const POST = withAuth(async (req, user) => {
  try {
    const body = await req.json();
    const { recipientId, content } = body;

    if (!recipientId || !content?.trim()) {
      return NextResponse.json({ error: "recipientId and content are required" }, { status: 400 });
    }

    // Verify the relationship: parent can only message their linked children and vice versa
    if (user.role === "PARENT" || user.role === "Parent" || user.role === "parent") {
      // Check if this child is linked to the parent
      const { data: link } = await supabase
        .from("ParentChild")
        .select("id")
        .eq("parentId", user.id)
        .eq("childUserId", recipientId)
        .single();
      if (!link) return NextResponse.json({ error: "You can only message your linked children" }, { status: 403 });
    } else {
      // Student can only message their linked parent
      const { data: link } = await supabase
        .from("ParentChild")
        .select("id")
        .eq("childUserId", user.id)
        .eq("parentId", recipientId)
        .single();
      if (!link) return NextResponse.json({ error: "You can only message your linked parent" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("Message")
      .insert({
        senderId: user.id,
        recipientId,
        content: content.trim(),
        read: false,
      })
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ message: data, success: true });
  } catch (err: any) {
    console.error("[MESSAGES_SEND] Error:", err);
    return NextResponse.json({ error: err.message || "Failed to send message" }, { status: 500 });
  }
});
