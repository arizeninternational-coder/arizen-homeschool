import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-guard";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
export const dynamic = "force-dynamic";

// POST /api/messages/conversations/[id]/send
// Permission: sender must be a participant; role-based relationship enforced
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: conversationId } = await params;
    const senderId = user.id;
    const senderRole = user.role;
    const db = getSupabaseAdmin();
    const body = await req.json();
    const messageBody = body?.body;

    if (!messageBody || typeof messageBody !== "string" || !messageBody.trim()) {
      return NextResponse.json({ error: "Message body required" }, { status: 400 });
    }

    // Verify sender is a participant
    const { data: participant } = await db
      .from("ConversationParticipant")
      .select("id")
      .eq("conversationId", conversationId)
      .eq("userId", senderId)
      .single();

    if (!participant)
      return NextResponse.json({ error: "Not a participant" }, { status: 403 });

    // Get other participants and validate role-based relationship
    const { data: otherParts } = await db
      .from("ConversationParticipant")
      .select("userId")
      .eq("conversationId", conversationId)
      .neq("userId", senderId);

    const otherIds = (otherParts || []).map((p: any) => p.userId);

    if (otherIds.length > 0) {
      const { data: otherUsers } = await db
        .from("User")
        .select("id, role")
        .in("id", otherIds);

      const otherRoles = (otherUsers || []).map((u: any) => u.role);

      for (const targetRole of otherRoles) {
        if (senderRole === "LEARNER" && targetRole !== "PARENT") {
          return NextResponse.json(
            { error: "Students can only message their parent or guardian" },
            { status: 403 }
          );
        }
        if (
          (senderRole === "ADMIN" || senderRole === "TEACHER") &&
          targetRole !== "PARENT"
        ) {
          return NextResponse.json(
            { error: "Staff can only message parents" },
            { status: 403 }
          );
        }
        if (senderRole === "PARENT" && targetRole !== "LEARNER") {
          return NextResponse.json(
            { error: "Parents can only message their children" },
            { status: 403 }
          );
        }
      }
    }

    // Create message
    const { data: message, error } = await db
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
    await db
      .from("Conversation")
      .update({ updatedAt: new Date().toISOString() })
      .eq("id", conversationId);

    return NextResponse.json({ message, success: true });
  } catch (err: any) {
    console.error("[MESSAGES_SEND] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
