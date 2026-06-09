import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-guard";
import { supabase } from "@/lib/supabase";
export const dynamic = "force-dynamic";

// POST /api/messages/conversations/[id]/send
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: conversationId } = await params;
    const senderId = user.id;
    const senderRole = user.role;
    const body = await req.json();
    const messageBody = body?.body;

    if (!messageBody || typeof messageBody !== "string" || !messageBody.trim()) {
      return NextResponse.json({ error: "Message body required" }, { status: 400 });
    }

    // Set RLS session variable so policies can identify the current user
    await supabase.rpc('set_app_user_id', { uid: senderId });

    // Verify user is a participant
    const { data: participant } = await supabase
      .from("ConversationParticipant")
      .select("id")
      .eq("conversationId", conversationId)
      .eq("userId", senderId)
      .single();

    if (!participant) return NextResponse.json({ error: "Not a participant" }, { status: 403 });

    // Get other participants' roles for validation
    const { data: otherParts } = await supabase
      .from("ConversationParticipant")
      .select("userId")
      .eq("conversationId", conversationId)
      .neq("userId", senderId);

    const otherIds = (otherParts || []).map((p: any) => p.userId);

    if (otherIds.length > 0) {
      const { data: otherUsers } = await supabase
        .from("User")
        .select("role")
        .in("id", otherIds);

      const otherRoles = (otherUsers || []).map((u: any) => u.role);

      for (const targetRole of otherRoles) {
        if (senderRole === "LEARNER" && targetRole !== "PARENT") {
          return NextResponse.json({ error: "Learners can only message parents" }, { status: 403 });
        }
        if ((senderRole === "ADMIN" || senderRole === "TEACHER") && targetRole !== "PARENT") {
          return NextResponse.json({ error: "Teachers can only message parents" }, { status: 403 });
        }
      }
    }

    // Create message
    const { data: message, error } = await supabase
      .from("Message")
      .insert({
        conversationId,
        senderId,
        body: messageBody.trim(),
        messageType: "text",
      })
      .select()
      .single();

    if (error) throw error;

    // Update conversation updatedAt
    await supabase
      .from("Conversation")
      .update({ updatedAt: new Date().toISOString() })
      .eq("id", conversationId);

    return NextResponse.json({ message, success: true });
  } catch (err: any) {
    console.error("[MESSAGES_SEND] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
