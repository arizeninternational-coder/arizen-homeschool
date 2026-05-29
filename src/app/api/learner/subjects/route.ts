import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { jwtVerify } from "jose";

export const dynamic = "force-dynamic";

async function getLearnerIdFromCookie(request: Request): Promise<string | null> {
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
    const userId = payload.sub as string;
    if (!userId) return null;

    const { data: profile } = await supabase.from("LearnerProfile").select("id").eq("userId", userId).maybeSingle();
    return profile?.id || null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const learnerId = await getLearnerIdFromCookie(request);

    // Get learner's grade
    let learnerGrade: number | null = null;
    if (learnerId) {
      const { data: profile } = await supabase.from("LearnerProfile").select("grade").eq("id", learnerId).maybeSingle();
      learnerGrade = profile?.grade ?? null;
    }

    // Get themes with subjects
    const gradeFilter = learnerGrade ? { grade: learnerGrade } : {};
    const { data: themes, error } = await supabase
      .from("Theme")
      .select(`
        id,
        title,
        grade,
        status,
        themeSubjects:ThemeSubject(subject)
      `)
      .eq("status", "PUBLISHED")
      .order("grade", { ascending: true });

    if (error) {
      if (error.code === "42P01") return NextResponse.json({ subjects: [] });
      throw error;
    }

    // Extract unique subjects with lesson counts
    const subjectMap = new Map<string, { name: string; lessonCount: number; themeCount: number }>();

    for (const theme of themes || []) {
      const subjects = (theme as any).themeSubjects || [];
      for (const ts of subjects) {
        const subjectName = ts.subject;
        if (!subjectMap.has(subjectName)) {
          subjectMap.set(subjectName, { name: subjectName, lessonCount: 0, themeCount: 0 });
        }
        const entry = subjectMap.get(subjectName)!;
        entry.themeCount++;
      }
    }

    // Get lesson counts per subject via quests
    for (const [name, entry] of subjectMap) {
      // Count lessons in quests linked to themes that have this subject
      const { data: themesWithSubject } = await supabase
        .from("Theme")
        .select(`
          id,
          quests:Quest(
            id,
            lessons:Lesson(id)
          )
        `)
        .eq("status", "PUBLISHED")
        .contains("themeSubjects", [{ subject: name }]);

      let lessonCount = 0;
      for (const t of themesWithSubject || []) {
        const quests = (t as any).quests || [];
        for (const q of quests) {
          const lessons = (q as any).lessons || [];
          lessonCount += lessons.length;
        }
      }
      entry.lessonCount = lessonCount;
    }

    const subjectIcons: Record<string, string> = {
      "Mathematics": "🔢", "Math": "🔢",
      "Science": "🔬", "English": "📚", "Language Arts": "📚",
      "History": "🏛️", "Geography": "🌍", "Art": "🎨", "Music": "🎵",
      "Physical Education": "🏃", "PE": "🏃",
      "Computer Science": "💻", "Coding": "💻",
    };

    const colors = ["#0D9488", "#059669", "#7C3AED", "#2563EB", "#D97706", "#DC2626", "#0891B2"];

    const subjects = Array.from(subjectMap.values()).map((s, i) => ({
      id: s.name.toLowerCase().replace(/\s+/g, "-"),
      name: s.name,
      emoji: subjectIcons[s.name] || "📖",
      lessonCount: s.lessonCount,
      themeCount: s.themeCount,
      color: colors[i % colors.length],
    }));

    return NextResponse.json({ subjects });
  } catch (e: any) {
    console.error("Subjects API error:", e);
    return NextResponse.json({ subjects: [] });
  }
}
