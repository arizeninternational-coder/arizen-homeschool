// GET /api/parent/child-checkins - Get today's emotional check-ins for all linked children
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { withAuth } from "@/lib/api-guard";
export const dynamic = "force-dynamic";

export const GET = withAuth(async (req: NextRequest, user: any) => {
  try {
    const parentId = user.id;

    // Get linked children
    const { data: links } = await supabase
      .from("ParentChild")
      .select("childUserId")
      .eq("parentId", parentId);

    if (!links || links.length === 0) {
      return NextResponse.json({ checkins: [] });
    }

    const childIds = links.map((l: any) => l.childUserId);

    // Use Africa/Nairobi timezone for "today" boundaries
    const NAIROBI_TZ = "Africa/Nairobi";
    const now = new Date();
    const nairobiDateStr = new Intl.DateTimeFormat("en-CA", {
      timeZone: NAIROBI_TZ, year: "numeric", month: "2-digit", day: "2-digit",
    }).format(now);
    // Build today/tomorrow in Nairobi time by parsing the date string
    const todayStart = new Date(nairobiDateStr + "T00:00:00+03:00");
    const tomorrowStart = new Date(nairobiDateStr + "T23:59:59+03:00");

    // Get today's check-ins for all linked children (Nairobi day boundaries)
    const { data: checkins } = await supabase
      .from("EmotionalCheckin")
      .select(`
        id,
        emotion,
        emotionLabel,
        note,
        createdAt,
        learner:LearnerProfile(
          id,
          displayName,
          user:User(name, email)
        )
      `)
      .in("learnerId", childIds)
      .gte("createdAt", todayStart.toISOString())
      .lt("createdAt", tomorrowStart.toISOString());

    // Also get child names for those without check-ins
    const { data: children } = await supabase
      .from("ParentChild")
      .select(`
        childUser:User(
          id,
          name,
          learnerProfile:LearnerProfile(displayName)
        )
      `)
      .eq("parentId", parentId);

    const checkedInIds = new Set((checkins || []).map((c: any) => c.learner?.id));
    const childrenWithoutCheckin = (children || [])
      .filter((l: any) => !checkedInIds.has(l.childUser?.id))
      .map((l: any) => ({
        childName: l.childUser?.learnerProfile?.displayName || l.childUser?.name || "Your child",
        emotion: null,
        checkedIn: false,
      }));

    const result = [
      ...(checkins || []).map((c: any) => ({
        childName: c.learner?.displayName || c.learner?.user?.name || "Your child",
        learnerProfileId: c.learner?.id || null,
        emotion: c.emotion,
        emotionLabel: c.emotionLabel,
        checkedIn: true,
        createdAt: c.createdAt,
      })),
      ...childrenWithoutCheckin,
    ];

    return NextResponse.json({ checkins: result });
  } catch (err: any) {
    console.error("[PARENT_CHECKINS] Error:", err);
    return NextResponse.json({ checkins: [] });
  }
}, { roles: ["PARENT", "ADMIN"] });
