import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-guard";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
export const dynamic = "force-dynamic";

// GET /api/messages/conversations/[id]/messages
// Returns all messages in a conversation (participant check in code)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: conversationId } = await params;
    const db = getSupabaseAdmin();

    // Verify user is a participant
    const { data: participant } = await db
      .from("ConversationParticipant")
      .select("id")
      .eq("conversationId", conversationId)
      .eq("userId", user.id)
      .single();

    if (!participant)
      return NextResponse.json({ error: "Not a participant" }, { status: 403 });

    // Fetch messages
    const { data, error } = await db
      .from("Message")
      .select("id, senderId, body, messageType, readAt, createdAt")
      .eq("conversationId", conversationId)
      .order("createdAt", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ messages: data || [] });
  } catch (err: any) {
    console.error("[MESSAGES_GET] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
