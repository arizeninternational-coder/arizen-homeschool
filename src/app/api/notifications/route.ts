import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { jwtVerify } from "jose";

export const dynamic = "force-dynamic";

async function getUserFromCookie(request: Request): Promise<{ id: string; role: string } | null> {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((c) => {
        const [key, ...rest] = c.trim().split("=");
        return [key.trim(), rest.join("=")];
      })
    );
    const secret = process.env.NEXTAUTH_SECRET || "arizen-dev-secret-change-in-production";
    const isProd = process.env.NODE_ENV === "production";
    const cookieName = isProd ? "__Secure-next-auth.session-token" : "next-auth.session-token";
    const token = cookies[cookieName] || cookies["next-auth.session-token"] || cookies["__Secure-next-auth.session-token"];
    if (!token) return null;
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), { algorithms: ["HS256"] });
    if (!payload.sub || !payload.role) return null;
    return { id: payload.sub as string, role: (payload.role as string).toUpperCase() };
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const user = await getUserFromCookie(request);
    if (!user) return NextResponse.json({ notifications: [], unread: 0 });

    const notifications: any[] = [];
    let unread = 0;

    if (user.role === "LEARNER") {
      // Get learner profile
      const { data: profile } = await supabase.from("LearnerProfile").select("id").eq("userId", user.id).maybeSingle();
      if (profile) {
        // Check for assigned homework
        const { data: homework } = await supabase
          .from("Homework")
          .select("id, title, createdAt")
          .eq("learnerId", profile.id)
          .eq("status", "assigned")
          .order("createdAt", { ascending: false })
          .limit(5);

        if (homework && homework.length > 0) {
          homework.forEach((h: any) => {
            notifications.push({
              id: `hw-${h.id}`,
              type: "homework",
              title: "New Assignment",
              message: h.title,
              createdAt: h.createdAt,
              read: false,
            });
          });
          unread += homework.length;
        }

        // Check for recent badges
        const { data: badges } = await supabase
          .from("Badge")
          .select("id, name, awardedAt")
          .eq("learnerId", profile.id)
          .order("awardedAt", { ascending: false })
          .limit(3);

        if (badges && badges.length > 0) {
          badges.forEach((b: any) => {
            notifications.push({
              id: `badge-${b.id}`,
              type: "badge",
              title: "Badge Earned!",
              message: b.name,
              createdAt: b.awardedAt,
              read: false,
            });
          });
          unread += badges.length;
        }
      }
    }

    if (user.role === "PARENT") {
      // Get linked children
      const { data: links } = await supabase.from("ParentChild").select("childUserId").eq("parentId", user.id);
      if (links && links.length > 0) {
        const childIds = links.map((l: any) => l.childUserId);
        const { data: profiles } = await supabase.from("LearnerProfile").select("id, displayName").in("userId", childIds);
        if (profiles) {
          // Recent check-ins
          for (const p of profiles) {
            const { data: checkin } = await supabase
              .from("EmotionalCheckin")
              .select("emotionLabel, createdAt")
              .eq("learnerId", p.id)
              .order("createdAt", { ascending: false })
              .limit(1)
              .maybeSingle();

            if (checkin) {
              const checkinDate = new Date(checkin.createdAt);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              if (checkinDate >= today) {
                notifications.push({
                  id: `checkin-${p.id}`,
                  type: "checkin",
                  title: `${p.displayName || "Child"} checked in`,
                  message: `Feeling ${checkin.emotionLabel} today`,
                  createdAt: checkin.createdAt,
                  read: false,
                });
                unread++;
              }
            }
          }
        }
      }
    }

    if (user.role === "ADMIN") {
      // Recent user registrations
      const { data: newUsers } = await supabase
        .from("User")
        .select("id, name, email, createdAt")
        .order("createdAt", { ascending: false })
        .limit(5);

      if (newUsers) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        newUsers.forEach((u: any) => {
          if (new Date(u.createdAt) >= yesterday) {
            notifications.push({
              id: `user-${u.id}`,
              type: "user",
              title: "New User",
              message: u.name || u.email,
              createdAt: u.createdAt,
              read: false,
            });
            unread++;
          }
        });
      }
    }

    return NextResponse.json({ notifications, unread });
  } catch (e: any) {
    console.error("Notifications error:", e);
    return NextResponse.json({ notifications: [], unread: 0 });
  }
}
