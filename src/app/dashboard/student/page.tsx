"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════════════════
   STUDENT DASHBOARD — CBC Learning Dashboard
   3-column: Sidebar | Main Content | Right Panel
   Real data from API, honest empty states, academic focus
   ═══════════════════════════════════════════════════════════════════ */

const C = {
  page: "#F7FBF7", teal: "#047A70", tealSoft: "#E6F5F1",
  dark: "#0F172A", body: "#64748B", muted: "#94A3B8",
  white: "#FFFFFF", border: "#E2E8F0",
  lavender: "#EDE9FE", mint: "#ECFDF5", cream: "#FFFBEB",
  blue: "#EFF6FF", rose: "#FFF1F2",
};

interface DashboardData {
  name: string;
  sparkCoins: number;
  streak: number;
  avatarLevel: number;
  currentXp: number;
  nextLevelXp: number;
  questCompleted: number;
  questTotal: number;
  dailyGoalCompleted: number;
  dailyGoalTotal: number;
  lessonsCompleted: number;
  quizzesCompleted: number;
  reflectionsCompleted: number;
  badgesEarned: number;
  subjects: { name: string; level: number; progress: number; color: string; icon: string }[];
  currentLesson: { title: string; subject: string; description: string; duration: number } | null;
  badges: { name: string; icon: string; earned: boolean }[];
  eqCheckedInToday: boolean;
}

const DEFAULT_DATA: DashboardData = {
  name: "Alex", sparkCoins: 0, streak: 0, avatarLevel: 1, currentXp: 0, nextLevelXp: 1000,
  questCompleted: 0, questTotal: 10, dailyGoalCompleted: 0, dailyGoalTotal: 3,
  lessonsCompleted: 0, quizzesCompleted: 0, reflectionsCompleted: 0, badgesEarned: 0,
  subjects: [
    { name: "Mathematics", level: 1, progress: 0, color: "#EDE9FE", icon: "\uD83D\uDCCA" },
    { name: "English", level: 1, progress: 0, color: "#FFF4D8", icon: "\uD83D\uDCD6" },
    { name: "Science", level: 1, progress: 0, color: "#ECFDF5", icon: "\uD83D\uDD2C" },
    { name: "Social Studies", level: 1, progress: 0, color: "#EFF6FF", icon: "\uD83C\uDF0D" },
  ],
  currentLesson: null,
  badges: [
    { name: "Math Whiz", icon: "\uD83D\uDCCA", earned: false },
    { name: "Reader", icon: "\uD83D\uDCD6", earned: false },
    { name: "Science Explorer", icon: "\uD83D\uDD2C", earned: false },
    { name: "Kind Heart", icon: "\uD83D\uDC9A", earned: false },
    { name: "Quiz Master", icon: "\uD83C\uDFAF", earned: false },
    { name: "Goal Getter", icon: "\uD83C\uDFAF", earned: false },
    { name: "Team Player", icon: "\uD83D\uDC65", earned: false },
    { name: "Early Bird", icon: "\uD83D\uDC24", earned: false },
  ],
  eqCheckedInToday: false,
};

const NAV_ITEMS = [
  { icon: "\uD83C\uDFE0", label: "Dashboard", href: "/dashboard/student", active: true },
  { icon: "\uD83D\uDCD6", label: "My Lessons", href: "/dashboard/student/lessons", active: false },
  { icon: "\u2694\uFE0F", label: "Quests", href: "/dashboard/student/quests", active: false },
  { icon: "\uD83D\uDCC8", label: "My Progress", href: "/dashboard/student/subjects", active: false },
  { icon: "\uD83C\uDFC6", label: "Badges", href: "/dashboard/student/badges", active: false },
  { icon: "\uD83C\uDFC5", label: "Leaderboard", href: "/dashboard/student/badges", active: false },
  { icon: "\uD83D\uDCDA", label: "Library", href: "/dashboard/student/lessons", active: false },
  { icon: "\uD83D\uDCC5", label: "Calendar", href: "/dashboard/student", active: false },
  { icon: "\uD83D\uDCEC", label: "Messages", href: "/dashboard/student", active: false },
  { icon: "\uD83D\uDC64", label: "Profile", href: "/dashboard/student/profile", active: false },
  { icon: "\u2699\uFE0F", label: "Settings", href: "/dashboard/student/profile", active: false },
];

const MOODS = [
  { emoji: "\uD83D\uDE04", label: "Very Happy" },
  { emoji: "\uD83D\uDE0A", label: "Happy" },
  { emoji: "\uD83D\uDE10", label: "Okay" },
  { emoji: "\uD83D\uDE1E", label: "Sad" },
  { emoji: "\uD83D\uDE22", label: "Upset" },
];

export default function StudentDashboard() {
  const [data, setData] = useState<DashboardData>(DEFAULT_DATA);
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [eqSaving, setEqSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const results = await Promise.allSettled([
          fetch("/api/learner/profile", { credentials: "include" }).then(r => r.json()),
          fetch("/api/coins/wallet", { credentials: "include" }).then(r => r.json()),
          fetch("/api/learner/subjects", { credentials: "include" }).then(r => r.json()),
          fetch("/api/learner/badges", { credentials: "include" }).then(r => r.json()),
          fetch("/api/learner/progress", { credentials: "include" }).then(r => r.json()),
          fetch("/api/learner/lessons?limit=1", { credentials: "include" }).then(r => r.json()),
          fetch("/api/learner/checkin?today=true", { credentials: "include" }).then(r => r.json()),
        ]);

        const profile = results[0].status === "fulfilled" ? results[0].value?.profile || results[0].value : {};
        const wallet = results[1].status === "fulfilled" ? results[1].value?.wallet || results[1].value : {};
        const subjectsRes = results[2].status === "fulfilled" ? results[2].value : {};
        const badgesRes = results[3].status === "fulfilled" ? results[3].value : {};
        const progress = results[4].status === "fulfilled" ? results[4].value?.progress || results[4].value : {};
        const lessonsRes = results[5].status === "fulfilled" ? results[5].value : {};
        const checkin = results[6].status === "fulfilled" ? results[6].value : {};

        const subjects = (subjectsRes.subjects || DEFAULT_DATA.subjects).map((s: any, i: number) => ({
          ...s,
          color: DEFAULT_DATA.subjects[i]?.color || "#F1F5F9",
          icon: DEFAULT_DATA.subjects[i]?.icon || "\uD83D\uDCDA",
        }));

        const badges = (badgesRes.badges || DEFAULT_DATA.badges).map((b: any) => ({
          name: b.name || b.title,
          icon: b.icon || "\uD83C\uDFC6",
          earned: !!b.earned,
        }));

        const earnedCount = badges.filter((b: any) => b.earned).length;

        const lessonList = lessonsRes.lessons || lessonsRes || [];
        const currentLesson = lessonList.length > 0 ? {
          title: lessonList[0].title || "Adding Fractions",
          subject: lessonList[0].subject || "Mathematics",
          description: lessonList[0].description || "Learn how to add fractions with like and unlike denominators.",
          duration: lessonList[0].durationMinutes || 12,
        } : null;

        setData({
          name: profile?.name || profile?.displayName || DEFAULT_DATA.name,
          sparkCoins: wallet?.balance ?? wallet?.sparkCoins ?? DEFAULT_DATA.sparkCoins,
          streak: profile?.currentStreak ?? profile?.streak ?? DEFAULT_DATA.streak,
          avatarLevel: profile?.avatarLevel ?? profile?.level ?? DEFAULT_DATA.avatarLevel,
          currentXp: profile?.totalXp ?? profile?.currentXp ?? DEFAULT_DATA.currentXp,
          nextLevelXp: profile?.nextLevelXp ?? 1000,
          questCompleted: progress?.questsCompleted ?? progress?.questCompleted ?? DEFAULT_DATA.questCompleted,
          questTotal: progress?.questsTotal ?? progress?.questTotal ?? DEFAULT_DATA.questTotal,
          dailyGoalCompleted: progress?.dailyGoalCompleted ?? DEFAULT_DATA.dailyGoalCompleted,
          dailyGoalTotal: progress?.dailyGoalTotal ?? DEFAULT_DATA.dailyGoalTotal,
          lessonsCompleted: progress?.lessonsCompleted ?? DEFAULT_DATA.lessonsCompleted,
          quizzesCompleted: progress?.quizzesCompleted ?? DEFAULT_DATA.quizzesCompleted,
          reflectionsCompleted: progress?.reflectionsCompleted ?? DEFAULT_DATA.reflectionsCompleted,
          badgesEarned: earnedCount,
          subjects,
          currentLesson,
          badges,
          eqCheckedInToday: !!checkin?.checkedIn,
        });
      } catch (e) {
        console.error("[DASHBOARD] Load error:", e);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleEqCheckin = async () => {
    if (selectedMood === null || eqSaving) return;
    setEqSaving(true);
    try {
      await fetch("/api/learner/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ emotion: MOODS[selectedMood].label.toUpperCase() }),
      });
      setData(prev => ({ ...prev, eqCheckedInToday: true }));
    } catch (e) { console.error("[EQ] Check-in error:", e); }
    setEqSaving(false);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: C.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>{"\u2728"}</div>
          <p style={{ color: C.body, fontWeight: 600 }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.page, fontFamily: "'Nunito', system-ui, sans-serif" }}>
      <div style={{ display: "flex" }}>

        {/* ═══════════════════════════════════════════════════
            LEFT SIDEBAR
            ═══════════════════════════════════════════════════ */}
        <aside className="sd-sidebar" style={{
          width: 240, minWidth: 240, height: "100vh", position: "sticky", top: 0,
          background: C.white, borderRight: `1px solid ${C.border}`,
          display: "flex", flexDirection: "column", zIndex: 20, overflowY: "auto",
        }}>
          <div style={{ padding: "20px 16px 12px", borderBottom: `1px solid ${C.border}` }}>
            <Link href="/dashboard/student" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: C.teal, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: "0.875rem" }}>A</div>
              <span style={{ fontWeight: 800, fontSize: "0.875rem", color: C.teal }}>Arizen School</span>
            </Link>
          </div>
          <nav style={{ padding: "8px", flex: 1 }}>
            {NAV_ITEMS.map(item => (
              <Link key={item.label} href={item.href} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
                borderRadius: 10, textDecoration: "none", marginBottom: 2,
                background: item.active ? C.tealSoft : "transparent",
                color: item.active ? C.teal : C.dark,
                fontWeight: item.active ? 700 : 500, fontSize: "0.8125rem",
              }}>
                <span style={{ fontSize: "0.875rem", width: 20, textAlign: "center" }}>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
          <div style={{ padding: "12px" }}>
            <div style={{ padding: "14px", borderRadius: 14, background: C.mint, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: "1.25rem", marginBottom: 4 }}>{"\uD83D\uDCAA"}</div>
              <h4 style={{ fontSize: "0.8125rem", fontWeight: 800, color: C.dark, margin: "0 0 2px 0" }}>Keep learning!</h4>
              <p style={{ fontSize: "0.6875rem", color: C.body, margin: 0, lineHeight: 1.4 }}>
                {data.streak > 0 ? "You're doing amazing this week." : "Start your first lesson today."}
              </p>
            </div>
          </div>
        </aside>

        {/* ═══════════════════════════════════════════════════
            MAIN CONTENT
            ═══════════════════════════════════════════════════ */}
        <main className="sd-main" style={{ flex: 1, minWidth: 0, padding: "28px 32px" }}>

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
            <div>
              <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: C.dark, margin: "0 0 2px 0" }}>
                Good morning, {data.name}! {"\uD83D\uDC4B"}
              </h1>
              <p style={{ color: C.body, fontSize: "0.875rem", margin: 0 }}>Ready to learn something amazing today?</p>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 10, background: C.cream, color: "#92400E", fontWeight: 700, fontSize: "0.8125rem" }}>
                <span>{"\uD83E\uDEE1"}</span> {data.sparkCoins}
              </div>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: C.white, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", position: "relative", cursor: "pointer" }}>
                {"\uD83D\uDD14"}
                <span style={{ position: "absolute", top: 4, right: 4, width: 7, height: 7, borderRadius: "50%", background: "#EF4444" }} />
              </div>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.mint, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.125rem" }}>
                {"\uD83E\uDDD2\uD83C\uDFFD"}
              </div>
            </div>
          </div>

          {/* Today's Lesson Card */}
          <div style={{
            background: C.lavender, borderRadius: 24, padding: "28px 32px", marginBottom: 20,
            border: "1px solid #DDD6FE", position: "relative", overflow: "hidden",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 260px" }}>
                <p style={{ fontSize: "0.6875rem", fontWeight: 800, color: "#6D28D9", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 6px 0" }}>
                  {data.currentLesson ? "\uD83C\uDFAF Today's Lesson" : "\uD83D\uDCCC START HERE"}
                </p>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: C.dark, margin: "0 0 4px 0" }}>
                  {data.currentLesson?.title || "Start Your First Lesson"}
                </h2>
                <span style={{ display: "inline-block", background: "rgba(109,40,217,0.1)", borderRadius: 999, padding: "2px 12px", fontSize: "0.6875rem", fontWeight: 700, color: "#6D28D9" }}>
                  {data.currentLesson?.subject || "Mathematics"}
                </span>
                <p style={{ fontSize: "0.8125rem", color: C.body, lineHeight: 1.55, margin: "8px 0 0 0" }}>
                  {data.currentLesson?.description || "Begin with a simple CBC lesson and earn your first Spark Coins."}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14 }}>
                  <button style={{ background: C.teal, color: "#fff", fontWeight: 700, fontSize: "0.8125rem", padding: "0.625rem 1.25rem", borderRadius: 10, border: "none", cursor: "pointer" }}>
                    {data.currentLesson ? "Continue Lesson \u2192" : "Browse Lessons \u2192"}
                  </button>
                  {data.currentLesson?.duration && (
                    <span style={{ fontSize: "0.75rem", fontWeight: 600, color: C.muted }}>{data.currentLesson.duration} min</span>
                  )}
                </div>
              </div>
              {/* Math visual */}
              <div style={{
                width: 90, height: 90, borderRadius: 18, background: "rgba(109,40,217,0.08)",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                flexShrink: 0, alignSelf: "center",
              }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#6D28D9", lineHeight: 1.4, textAlign: "center" }}>
                  <div>1/2</div><div>+</div><div>1/4</div>
                </div>
                <div style={{ fontSize: "0.625rem", fontWeight: 700, color: "#6D28D9", marginTop: 2 }}>= ?</div>
              </div>
            </div>
          </div>

          {/* Spark Coins + Streak row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div style={{ padding: "18px", borderRadius: 16, background: C.cream, border: "1px solid #FDE68A" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: "1.25rem" }}>{"\uD83E\uDEE1"}</span>
                <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: C.body }}>Spark Coins</span>
              </div>
              <div style={{ fontSize: "1.75rem", fontWeight: 900, color: "#92400E" }}>{data.sparkCoins}</div>
              <div style={{ fontSize: "0.6875rem", color: C.body, marginTop: 2 }}>
                {data.sparkCoins > 0 ? "Keep learning to unlock more rewards!" : "Complete your first lesson to earn coins."}
              </div>
            </div>
            <div style={{ padding: "18px", borderRadius: 16, background: C.rose, border: "1px solid #FECDD3" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: "1.25rem" }}>{"\uD83D\uDD25"}</span>
                <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: C.body }}>Streak</span>
              </div>
              <div style={{ fontSize: "1.75rem", fontWeight: 900, color: "#BE123C" }}>{data.streak} {data.streak === 1 ? "day" : "days"}</div>
              <div style={{ fontSize: "0.6875rem", color: C.body, marginTop: 2 }}>
                {data.streak > 0 ? "You're on fire! \uD83D\uDD25" : "Start today to build your learning streak."}
              </div>
            </div>
          </div>

          {/* Avatar Progress */}
          <div style={{ padding: "20px", borderRadius: 16, background: C.mint, border: "1px solid #A7F3D0", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #A7F3D0, #6EE7B7)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", flexShrink: 0,
                border: "2.5px solid #6EE7B7", position: "relative",
              }}>
                {"\uD83E\uDDD2\uD83C\uDFFD"}
                <span style={{ position: "absolute", bottom: -2, right: -2, fontSize: "0.75rem" }}>{"\u2728"}</span>
              </div>
              <div style={{ flex: 1, minWidth: 140 }}>
                <h4 style={{ fontWeight: 800, color: C.dark, fontSize: "0.875rem", margin: "0 0 2px 0" }}>Avatar Progress</h4>
                <p style={{ fontSize: "0.6875rem", color: C.body, margin: "0 0 6px 0" }}>
                  Level {data.avatarLevel} {data.currentXp > 0 ? "\u00B7 Customize your look" : "\u00B7 Start your journey"}
                </p>
                <div style={{ height: 8, borderRadius: 4, background: "#A7F3D0", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(100, (data.currentXp / data.nextLevelXp) * 100)}%`, borderRadius: 4, background: "linear-gradient(90deg, #047A70, #34D399)" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
                  <span style={{ fontSize: "0.625rem", fontWeight: 700, color: C.muted }}>{data.currentXp} / {data.nextLevelXp} XP</span>
                  {data.currentXp > 0 && <span style={{ fontSize: "0.625rem", fontWeight: 800, color: C.teal }}>{data.nextLevelXp - data.currentXp} to go</span>}
                </div>
              </div>
              <Link href="/dashboard/student/profile" style={{
                padding: "8px 16px", borderRadius: 10, border: "1.5px solid " + C.teal,
                background: C.white, color: C.teal, fontWeight: 700, fontSize: "0.75rem",
                textDecoration: "none", flexShrink: 0,
              }}>Customize Avatar {"\u2192"}</Link>
            </div>
          </div>

          {/* My Subjects */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ fontSize: "1.0625rem", fontWeight: 800, color: C.dark, margin: 0 }}>My Subjects</h3>
              <Link href="/dashboard/student/subjects" style={{ fontSize: "0.75rem", fontWeight: 700, color: C.teal, textDecoration: "none" }}>View All Subjects {"\u2192"}</Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
              {data.subjects.map(subject => (
                <Link key={subject.name} href={`/dashboard/student/subjects`} style={{
                  padding: "16px", borderRadius: 14, background: subject.color,
                  border: `1px solid ${C.border}`, textDecoration: "none", color: "inherit",
                  display: "block",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: "1.25rem" }}>{subject.icon}</span>
                    <span style={{ fontSize: "0.8125rem", fontWeight: 800, color: C.dark }}>{subject.name}</span>
                  </div>
                  <div style={{ fontSize: "0.6875rem", color: C.body, marginBottom: 6 }}>Level {subject.level}</div>
                  <div style={{ height: 5, borderRadius: 3, background: "rgba(0,0,0,0.06)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${subject.progress}%`, borderRadius: 3, background: C.teal }} />
                  </div>
                  <div style={{ fontSize: "0.625rem", fontWeight: 700, color: C.muted, marginTop: 4 }}>
                    {subject.progress > 0 ? `${subject.progress}% complete` : "Start learning"}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </main>

        {/* ═══════════════════════════════════════════════════
            RIGHT PANEL
            ═══════════════════════════════════════════════════ */}
        <aside className="sd-right" style={{
          width: 360, minWidth: 360, height: "100vh", position: "sticky", top: 0,
          background: C.white, borderLeft: `1px solid ${C.border}`,
          overflowY: "auto", zIndex: 20, padding: "20px 16px",
        }}>

          {/* EQ Check-in */}
          <div style={{ padding: "16px", borderRadius: 14, background: C.mint, border: "1px solid #A7F3D0", marginBottom: 16 }}>
            <h4 style={{ fontSize: "0.875rem", fontWeight: 800, color: C.dark, margin: "0 0 4px 0" }}>EQ Check-in</h4>
            <p style={{ fontSize: "0.6875rem", color: C.body, margin: "0 0 10px 0" }}>How are you feeling before today's lesson?</p>
            {!data.eqCheckedInToday ? (
              <>
                <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                  {MOODS.map((mood, i) => (
                    <button key={i} onClick={() => setSelectedMood(i)} style={{
                      width: 36, height: 36, borderRadius: "50%", border: selectedMood === i ? `2px solid ${C.teal}` : "2px solid transparent",
                      background: selectedMood === i ? C.tealSoft : "#F8FAFC", fontSize: "1.125rem", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>{mood.emoji}</button>
                  ))}
                </div>
                <button onClick={handleEqCheckin} disabled={selectedMood === null || eqSaving} style={{
                  width: "100%", padding: "8px", borderRadius: 10, border: "none", background: C.teal, color: "#fff",
                  fontWeight: 700, fontSize: "0.75rem", cursor: selectedMood === null ? "default" : "pointer",
                  opacity: selectedMood === null ? 0.5 : 1,
                }}>{eqSaving ? "Saving..." : "Check In"}</button>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "8px 0" }}>
                <span style={{ fontSize: "1.5rem" }}>{"\uD83D\uDC9A"}</span>
                <p style={{ fontSize: "0.6875rem", color: C.body, margin: "4px 0 0 0" }}>Checked in today!</p>
              </div>
            )}
          </div>

          {/* Quest Progress */}
          <div style={{ padding: "16px", borderRadius: 14, background: C.rose, border: "1px solid #FECDD3", marginBottom: 16 }}>
            <h4 style={{ fontSize: "0.875rem", fontWeight: 800, color: C.dark, margin: "0 0 4px 0" }}>Quest Progress</h4>
            <p style={{ fontSize: "0.6875rem", color: C.body, margin: "0 0 8px 0" }}>Complete lessons and quests to earn rewards!</p>
            <div style={{ height: 6, borderRadius: 3, background: "rgba(0,0,0,0.06)", overflow: "hidden", marginBottom: 4 }}>
              <div style={{ height: "100%", width: `${data.questTotal > 0 ? (data.questCompleted / data.questTotal) * 100 : 0}%`, borderRadius: 3, background: "#E11D48" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.625rem", fontWeight: 700, color: C.muted }}>{data.questCompleted} / {data.questTotal}</span>
              <Link href="/dashboard/student/quests" style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#E11D48", textDecoration: "none" }}>View Quests {"\u2192"}</Link>
            </div>
          </div>

          {/* Badges Earned */}
          <div style={{ padding: "16px", borderRadius: 14, background: C.white, border: `1px solid ${C.border}`, marginBottom: 16 }}>
            <h4 style={{ fontSize: "0.875rem", fontWeight: 800, color: C.dark, margin: "0 0 8px 0" }}>Badges Earned</h4>
            {data.badgesEarned === 0 ? (
              <>
                <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                  {data.badges.slice(0, 4).map((b, i) => (
                    <div key={i} style={{ width: 32, height: 32, borderRadius: 8, background: "#F8FAFC", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.875rem", position: "relative" }}>
                      {b.icon}
                      <span style={{ position: "absolute", bottom: -2, right: -2, fontSize: "0.5rem" }}>{"\uD83D\uDD12"}</span>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: "0.6875rem", color: C.body, margin: 0 }}>Complete your first lesson to unlock badges.</p>
              </>
            ) : (
              <>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
                  {data.badges.filter(b => b.earned).slice(0, 6).map((b, i) => (
                    <div key={i} style={{ width: 32, height: 32, borderRadius: 8, background: C.mint, border: "1px solid #A7F3D0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.875rem" }} title={b.name}>
                      {b.icon}
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: "0.6875rem", color: C.body, margin: 0 }}>{data.badgesEarned} badge{data.badgesEarned !== 1 ? "s" : ""} unlocked</p>
              </>
            )}
            <Link href="/dashboard/student/badges" style={{ fontSize: "0.6875rem", fontWeight: 700, color: C.teal, textDecoration: "none", display: "inline-block", marginTop: 6 }}>View All Badges {"\u2192"}</Link>
          </div>

          {/* Daily Goal */}
          <div style={{ padding: "16px", borderRadius: 14, background: C.cream, border: "1px solid #FDE68A" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <h4 style={{ fontSize: "0.875rem", fontWeight: 800, color: C.dark, margin: "0 0 2px 0" }}>Daily Goal</h4>
                <p style={{ fontSize: "0.6875rem", color: C.body, margin: 0 }}>
                  {data.dailyGoalCompleted > 0 ? `Complete ${data.dailyGoalTotal} lessons today` : "Complete your first lesson today"}
                </p>
              </div>
              <span style={{ fontSize: "1.25rem" }}>{"\uD83C\uDF81"}</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: "rgba(0,0,0,0.06)", overflow: "hidden", marginBottom: 4 }}>
              <div style={{ height: "100%", width: `${data.dailyGoalTotal > 0 ? (data.dailyGoalCompleted / data.dailyGoalTotal) * 100 : 0}%`, borderRadius: 3, background: "#D97706" }} />
            </div>
            <span style={{ fontSize: "0.625rem", fontWeight: 700, color: C.muted }}>{data.dailyGoalCompleted} / {data.dailyGoalTotal}</span>
          </div>
        </aside>
      </div>

      {/* Responsive: handled via className + globals.css */}
    </div>
  );
}
