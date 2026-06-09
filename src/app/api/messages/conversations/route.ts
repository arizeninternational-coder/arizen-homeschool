import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api-guard";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
export const dynamic = "force-dynamic";

// GET /api/messages/conversations — list all conversations for current user
export const GET = withAuth(async (req: NextRequest, user: any) => {
  try {
    const userId = user.id;
    const db = getSupabaseAdmin();

    // Get conversation IDs where user is a participant
    const { data: participantRows } = await db
      .from("ConversationParticipant")
      .select("conversationId")
      .eq("userId", userId);

    if (!participantRows || participantRows.length === 0) {
      return NextResponse.json({ conversations: [] });
    }

    const convIds = participantRows.map((r: any) => r.conversationId);

    // Get conversations
    const { data: convs } = await db
      .from("Conversation")
      .select("*")
      .in("id", convIds)
      .order("updatedAt", { ascending: false });

    if (!convs || convs.length === 0) {
      return NextResponse.json({ conversations: [] });
    }

    // Get all participants for these conversations
    const { data: allParticipants } = await db
      .from("ConversationParticipant")
      .select("conversationId, userId")
      .in("conversationId", convIds);

    // Batch-fetch user records for all participant user IDs
    const participantUserIds = Array.from(
      new Set((allParticipants || []).map((p: any) => p.userId))
    );
    const { data: participantUsers } =
      participantUserIds.length > 0
        ? await db
            .from("User")
            .select("id, name, role")
            .in("id", participantUserIds)
        : { data: [] };

    const userMap: Record<string, any> = {};
    (participantUsers || []).forEach((u: any) => {
      userMap[u.id] = u;
    });

    // Get last message for each conversation
    const { data: allMessages } = await db
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
          return {
            userId: p.userId,
            name: u.name || "Unknown",
            role: u.role || null,
          };
        });

      const convMessages = (allMessages || []).filter(
        (m: any) => m.conversationId === conv.id
      );
      const lastMessage =
        convMessages.length > 0 ? convMessages[convMessages.length - 1] : null;

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
      const aTime = a.lastMessage
        ? new Date(a.lastMessage.createdAt).getTime()
        : 0;
      const bTime = b.lastMessage
        ? new Date(b.lastMessage.createdAt).getTime()
        : 0;
      return bTime - aTime;
    });

    return NextResponse.json({ conversations });
  } catch (err: any) {
    console.error("[CONVERSATIONS_GET] Error:", err);
    return NextResponse.json({ conversations: [], error: err.message });
  }
});

// POST /api/messages/conversations — create a new conversation
// Body: { participantIds: string[], title?: string }
// Permission: Parent can only message linked child. Child can only message linked parent.
export async function POST(req: NextRequest) {
  try {
    const user = await (
      await import("@/lib/api-guard")
    ).getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = user.id;
    const userRole = user.role;
    const db = getSupabaseAdmin();
    const body = await req.json();
    const { participantIds, title } = body || {};

    if (
      !participantIds ||
      !Array.isArray(participantIds) ||
      participantIds.length === 0
    ) {
      return NextResponse.json(
        { error: "participantIds required" },
        { status: 400 }
      );
    }

    const allParticipantIds = [userId, ...participantIds];

    // Fetch roles of all participants
    const { data: users } = await db
      .from("User")
      .select("id, role")
      .in("id", allParticipantIds);

    const roleMap: Record<string, string> = {};
    (users || []).forEach((u: any) => {
      roleMap[u.id] = u.role;
    });

    // --- Permission checks based on role ---
    if (userRole === "PARENT") {
      // Parent can only message their linked children
      for (const pid of participantIds) {
        const targetRole = roleMap[pid];
        if (targetRole !== "LEARNER") {
          return NextResponse.json(
            { error: "Parents can only message their children" },
            { status: 403 }
          );
        }
        // Verify the child is actually linked to this parent
        const { data: link } = await db
          .from("ParentChild")
          .select("id")
          .eq("parentId", userId)
          .eq("childUserId", pid)
          .single();
        if (!link) {
          return NextResponse.json(
            { error: "You can only message your own child" },
            { status: 403 }
          );
        }
      }
    } else if (userRole === "LEARNER") {
      // Child can only message their linked parent/guardian
      for (const pid of participantIds) {
        const targetRole = roleMap[pid];
        if (targetRole !== "PARENT") {
          return NextResponse.json(
            { error: "Students can only message their parent or guardian" },
            { status: 403 }
          );
        }
        // Verify the parent is actually linked to this child
        const { data: link } = await db
          .from("ParentChild")
          .select("id")
          .eq("parentId", pid)
          .eq("childUserId", userId)
          .single();
        if (!link) {
          return NextResponse.json(
            { error: "You can only message your own parent or guardian" },
            { status: 403 }
          );
        }
      }
    } else if (userRole === "ADMIN" || userRole === "TEACHER") {
      // Admin/Teacher can only message parents
      for (const pid of participantIds) {
        if (roleMap[pid] !== "PARENT") {
          return NextResponse.json(
            { error: "Staff can only message parents" },
            { status: 403 }
          );
        }
      }
    }

    // Check if a 1-on-1 conversation already exists between these exact users
    const { data: existingRows } = await db
      .from("ConversationParticipant")
      .select("conversationId, userId")
      .in("userId", allParticipantIds);

    if (existingRows && existingRows.length >= 2) {
      const convMap: Record<string, string[]> = {};
      for (const row of existingRows) {
        if (!convMap[row.conversationId]) convMap[row.conversationId] = [];
        convMap[row.conversationId].push(row.userId);
      }
      const participantSet = new Set(allParticipantIds);
      for (const convId of Object.keys(convMap)) {
        const members = convMap[convId];
        if (members.length === participantSet.size) {
          let allMatch = true;
          for (const m of members) {
            if (!participantSet.has(m)) {
              allMatch = false;
              break;
            }
          }
          if (allMatch) {
            const { data: existingConv } = await db
              .from("Conversation")
              .select("*")
              .eq("id", convId)
              .single();
            if (existingConv)
              return NextResponse.json({
                conversation: existingConv,
                existing: true,
              });
          }
        }
      }
    }

    // Create new conversation
    const { data: conv, error: convErr } = await db
      .from("Conversation")
      .insert({
        title: title || null,
        createdBy: userId,
        isGroup: participantIds.length > 1,
      })
      .select()
      .single();

    if (convErr) throw convErr;

    // Add all participants
    const participantRows = allParticipantIds.map((pid: string) => ({
      conversationId: conv.id,
      userId: pid,
      role: pid === userId ? "admin" : "member",
    }));

    await db.from("ConversationParticipant").insert(participantRows);

    return NextResponse.json({ conversation: conv, existing: false });
  } catch (err: any) {
    console.error("[CONVERSATIONS_POST] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
