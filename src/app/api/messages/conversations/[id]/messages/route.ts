import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-guard";
import { supabase } from "@/lib/supabase";
export const dynamic = "force-dynamic";

// GET /api/messages/conversations/[id]/messages
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: conversationId } = await params;

    // Set RLS session variable so policies can identify the current user
    await supabase.rpc('set_app_user_id', { uid: user.id });

    // Verify user is a participant
    const { data: participant } = await supabase
      .from("ConversationParticipant")
      .select("id")
      .eq("conversationId", conversationId)
      .eq("userId", user.id)
      .single();

    if (!participant) return NextResponse.json({ error: "Not a participant" }, { status: 403 });

    const { data, error } = await supabase
      .from("Message")
      .select("id, senderId, body, messageType, readAt, createdAt")
      .eq("conversationId", conversationId)
      .order("createdAt", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ messages: data || [] });
  } catch (err: any) {
    console.error("[MESSAGES_GET] Error:", err);
    return NextResponse.json({ messages: [], error: err.message });
  }
}
