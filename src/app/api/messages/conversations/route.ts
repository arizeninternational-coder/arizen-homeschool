import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api-guard";
import { supabase } from "@/lib/supabase";
export const dynamic = "force-dynamic";

// GET /api/messages/conversations - list all conversations for current user
export const GET = withAuth(async (req: NextRequest, user: any) => {
  try {
    const userId = user.id;

    // Set RLS session variable so policies can identify the current user
    await supabase.rpc('set_app_user_id', { uid: userId });

    // Get conversation IDs for this user
    const { data: participantRows } = await supabase
      .from("ConversationParticipant")
      .select("conversationId")
      .eq("userId", userId);

    if (!participantRows || participantRows.length === 0) {
      return NextResponse.json({ conversations: [] });
    }

    const convIds = participantRows.map((r: any) => r.conversationId);

    // Get conversations
    const { data: convs } = await supabase
      .from("Conversation")
      .select("*")
      .in("id", convIds)
      .order("updatedAt", { ascending: false });

    if (!convs || convs.length === 0) {
      return NextResponse.json({ conversations: [] });
    }

    // Get all participants for these conversations (separate query to avoid FK ambiguity)
    const { data: allParticipants } = await supabase
      .from("ConversationParticipant")
      .select("conversationId, userId")
      .in("conversationId", convIds);
    // Batch-fetch user records for all participant user IDs
    const participantUserIds = Array.from(new Set((allParticipants || []).map((p: any) => p.userId)));
    const { data: participantUsers } = participantUserIds.length > 0
      ? await supabase.from("User").select("id, name, role").in("id", participantUserIds)
      : { data: [] };
    const userMap: Record<string, any> = {};
    (participantUsers || []).forEach((u: any) => { userMap[u.id] = u; });

    // Get last message for each conversation
    const { data: allMessages } = await supabase
      .from("Message")
      .select("id, conversationId, senderId, body, createdAt, readAt")
      .in("conversationId", convIds)
      .order("createdAt", { ascending: true });

    // Build result
    const conversations = convs.map((conv: any) => {
      const participants = (allParticipants || [])
        .filter((p: any) => p.conversationId === conv.id)
        .map((p: any) => {
          const u = userMap[p.userId] || {};
          return { userId: p.userId, name: u.name || "Unknown", role: u.role || null };
        });

      const convMessages = (allMessages || [])
        .filter((m: any) => m.conversationId === conv.id);
      const lastMessage = convMessages.length > 0 ? convMessages[convMessages.length - 1] : null;

      return {
        id: conv.id,
        title: conv.title,
        isGroup: conv.isGroup,
        updatedAt: conv.updatedAt,
        lastMessage,
        participants,
      };
    });

    // Sort by last message time
    conversations.sort((a: any, b: any) => {
      const aTime = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const bTime = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return bTime - aTime;
    });

    return NextResponse.json({ conversations });
  } catch (err: any) {
    console.error("[CONVERSATIONS_GET] Error:", err);
    return NextResponse.json({ conversations: [], error: err.message });
  }
});

// POST /api/messages/conversations - create a new conversation
// Body: { participantIds: string[], title?: string }
export async function POST(req: NextRequest) {
  try {
    const user = await (await import("@/lib/api-guard")).getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = user.id;
    const body = await req.json();
    const { participantIds, title } = body || {};

    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return NextResponse.json({ error: "participantIds required" }, { status: 400 });
    }

    // Set RLS session variable so policies can identify the current user
    await supabase.rpc('set_app_user_id', { uid: userId });

    const userRole = user.role;
    const allParticipants = [userId, ...participantIds];

    // Get roles of all participants
    const { data: users } = await supabase
      .from("User")
      .select("id, role")
      .in("id", allParticipants);

    // Validate role-based permissions
    const roleMap: Record<string, string> = {};
    (users || []).forEach((u: any) => { roleMap[u.id] = u.role; });

    for (const pid of participantIds) {
      const targetRole = roleMap[pid];
      if (userRole === "LEARNER" && targetRole !== "PARENT") {
        return NextResponse.json({ error: "Learners can only message their parents" }, { status: 403 });
      }
      if ((userRole === "ADMIN" || userRole === "TEACHER") && targetRole !== "PARENT") {
        return NextResponse.json({ error: "Teachers can only message parents" }, { status: 403 });
      }
    }

    // Check if a 1-on-1 conversation already exists
    const { data: existingRows } = await supabase
      .from("ConversationParticipant")
      .select("conversationId, userId")
      .in("userId", allParticipants);

    if (existingRows && existingRows.length >= 2) {
      const convMap: Record<string, string[]> = {};
      for (const row of existingRows) {
        if (!convMap[row.conversationId]) convMap[row.conversationId] = [];
        convMap[row.conversationId].push(row.userId);
      }
      const participantSet = new Set(allParticipants);
      for (const convId of Object.keys(convMap)) {
        const members = convMap[convId];
        if (members.length === participantSet.size) {
          let allMatch = true;
          for (const m of members) {
            if (!participantSet.has(m)) { allMatch = false; break; }
          }
          if (allMatch) {
            const { data: existingConv } = await supabase.from("Conversation").select("*").eq("id", convId).single();
            if (existingConv) return NextResponse.json({ conversation: existingConv, existing: true });
          }
        }
      }
    }

    // Create new conversation
    const { data: conv, error: convErr } = await supabase
      .from("Conversation")
      .insert({ title: title || null, createdBy: userId, isGroup: participantIds.length > 1 })
      .select()
      .single();

    if (convErr) throw convErr;

    // Add all participants
    const participantRows = allParticipants.map((pid: string) => ({
      conversationId: conv.id,
      userId: pid,
      role: pid === userId ? "admin" : "member",
    }));

    await supabase.from("ConversationParticipant").insert(participantRows);

    return NextResponse.json({ conversation: conv, existing: false });
  } catch (err: any) {
    console.error("[CONVERSATIONS_POST] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
