"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Coins, Flame, Trophy, Heart, Target, Star,
  BookOpen, Beaker, Globe, BookMarked,
  Clock, Gift, CheckCircle2, CircleDot
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════
   STUDENT DASHBOARD — Single sidebar from layout, lucide icons, real data
   ═══════════════════════════════════════════════════════════════════ */

const C = {
  page: "#F7FBF7", teal: "#047A70", tealSoft: "#E6F5F1",
  dark: "#0F172A", body: "#64748B", muted: "#94A3B8",
  white: "#FFFFFF", border: "#E2E8F0",
  lavender: "#EDE9FE", mint: "#ECFDF5", cream: "#FFFBEB",
  blue: "#EFF6FF", rose: "#FFF1F2",
};

interface DashData {
  name: string;
  sparkCoins: number;
  streak: number;
  avatarLevel: number;
  currentXp: number;
  nextLevelXp: number;
  questCompleted: number;
  questTotal: number;
  dailyGoalCompleted: number;
  dailyGoalTarget: number;
  lessonsCompleted: number;
  currentLesson: { title: string; subject: string; description: string; duration: number } | null;
  badges: { name: string; earned: boolean }[];
  subjects: { name: string; level: number; progress: number; color: string; icon: any }[];
  eqCheckedIn: boolean;
}

const DEFAULT: DashData = {
  name: "Learner", sparkCoins: 0, streak: 0, avatarLevel: 1,
  currentXp: 0, nextLevelXp: 100, questCompleted: 0, questTotal: 10,
  dailyGoalCompleted: 0, dailyGoalTarget: 3, lessonsCompleted: 0,
  currentLesson: null,
  badges: [
    { name: "Math Whiz", earned: false }, { name: "Reader", earned: false },
    { name: "Science Explorer", earned: false }, { name: "Kind Heart", earned: false },
    { name: "Quiz Master", earned: false }, { name: "Goal Getter", earned: false },
    { name: "Team Player", earned: false }, { name: "Early Bird", earned: false },
  ],
  subjects: [],
  eqCheckedIn: false,
};

const MOODS = [
  { emoji: "😊", label: "Happy", value: "HAPPY" },
  { emoji: "😌", label: "Calm", value: "CALM" },
  { emoji: "😢", label: "Sad", value: "SAD" },
  { emoji: "😤", label: "Angry", value: "FRUSTRATED" },
  { emoji: "😟", label: "Worried", value: "WORRIED" },
  { emoji: "🤩", label: "Curious", value: "CURIOUS" },
];

export default function StudentDashboard() {
  const [data, setData] = useState<DashData>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [eqSaving, setEqSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const results = await Promise.allSettled([
          fetch("/api/learner/profile", { credentials: "include" }).then(r => r.json()),
          fetch("/api/coins/wallet", { credentials: "include" }).then(r => r.json()),
          fetch("/api/learner/progress", { credentials: "include" }).then(r => r.json()),
          fetch("/api/learner/lessons?limit=1", { credentials: "include" }).then(r => r.json()),
          fetch("/api/learner/checkin?today=true", { credentials: "include" }).then(r => r.json()),
          fetch("/api/learner/subjects", { credentials: "include" }).then(r => r.json()),
        ]);
        const profile = results[0].status === "fulfilled" ? results[0].value?.profile || results[0].value : {};
        const wallet = results[1].status === "fulfilled" ? results[1].value?.wallet || results[1].value : {};
        const progress = results[2].status === "fulfilled" ? results[2].value?.progress || results[2].value : {};
        const lessonsRes = results[3].status === "fulfilled" ? results[3].value : {};
        const checkin = results[4].status === "fulfilled" ? results[4].value : {};
        const subjectsRes = results[5].status === "fulfilled" ? results[5].value : {};

        const lessonList = lessonsRes.lessons || lessonsRes || [];
        const earnedBadges = (progress.badges || []).filter((b: any) => b.earned).map((b: any) => b.name);

        const apiSubjects = (subjectsRes.subjects || []).map((s: any) => ({
          name: s.name,
          level: 1,
          progress: 0,
          color: s.color + "22" || "#F1F5F9",
          icon: BookOpen,
        }));

        setData({
          name: profile?.name || profile?.displayName || "Learner",
          sparkCoins: wallet?.balance ?? 0,
          streak: profile?.currentStreak ?? 0,
          avatarLevel: profile?.avatarLevel ?? 1,
          currentXp: profile?.totalXp ?? 0,
          nextLevelXp: profile?.nextLevelXp ?? 100,
          questCompleted: progress?.questsCompleted ?? progress?.questCompleted ?? 0,
          questTotal: progress?.questsTotal ?? 10,
          dailyGoalCompleted: progress?.dailyGoalCompleted ?? 0,
          dailyGoalTarget: progress?.dailyGoalTarget ?? 3,
          lessonsCompleted: progress?.lessonsCompleted ?? 0,
          currentLesson: lessonList.length > 0 ? {
            title: lessonList[0].title || "Counting by Ones",
            subject: lessonList[0].subject || "Mathematics",
            description: lessonList[0].description || "Count from 1 to 100 by ones using simple patterns.",
            duration: lessonList[0].durationMinutes || 12,
          } : null,
          badges: DEFAULT.badges.map(b => ({ ...b, earned: earnedBadges.includes(b.name) })),
          subjects: apiSubjects,
          eqCheckedIn: !!checkin?.checkedIn,
        });
      } catch (e) { console.error("[DASHBOARD] Load error:", e); }
      setLoading(false);
    };
    load();
  }, []);

  const handleEqCheckin = async () => {
    if (selectedMood === null || eqSaving) return;
    setEqSaving(true);
    try {
      await fetch("/api/learner/checkin", {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ emotion: MOODS[selectedMood].value }),
      });
      setData(prev => ({ ...prev, eqCheckedIn: true }));
    } catch (e) { console.error("[EQ] Check-in error:", e); }
    setEqSaving(false);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ textAlign: "center" }}><Star size={32} style={{ color: "#047A70", margin: "0 auto 1rem" }} /><p style={{ color: C.body, fontWeight: 600 }}>Loading your dashboard...</p></div>
      </div>
    );
  }

  const xpPercent = data.nextLevelXp > 0 ? Math.min(100, (data.currentXp / data.nextLevelXp) * 100) : 0;
  const earnedCount = data.badges.filter(b => b.earned).length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: C.dark, margin: "0 0 2px 0" }}>
            Good morning, {data.name}! 👋
          </h1>
          <p style={{ color: C.body, fontSize: "0.875rem", margin: 0 }}>Ready to learn something amazing today?</p>
        </div>
      </div>

      {/* Today's Lesson Card */}
      <div style={{ background: C.lavender, borderRadius: 24, padding: "28px 32px", marginBottom: 20, border: "1px solid #DDD6FE" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 260px" }}>
            <p style={{ fontSize: "0.6875rem", fontWeight: 800, color: "#6D28D9", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 6px 0" }}>
              {data.currentLesson ? "Today's Lesson" : "Start Here"}
            </p>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: C.dark, margin: "0 0 4px 0" }}>
              {data.currentLesson?.title || "Counting by Ones"}
            </h2>
            <span style={{ display: "inline-block", background: "rgba(109,40,217,0.1)", borderRadius: 999, padding: "2px 12px", fontSize: "0.6875rem", fontWeight: 700, color: "#6D28D9" }}>
              {data.currentLesson?.subject || "Mathematics"}
            </span>
            <p style={{ fontSize: "0.8125rem", color: C.body, lineHeight: 1.55, margin: "8px 0 0 0" }}>
              {data.currentLesson?.description || "Count from 1 to 100 by ones using simple patterns and examples."}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14 }}>
              <Link href={data.currentLesson ? `/dashboard/student/lessons` : "/dashboard/student/lessons"} style={{ background: C.teal, color: "#fff", fontWeight: 700, fontSize: "0.8125rem", padding: "0.625rem 1.25rem", borderRadius: 10, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
                {data.currentLesson ? "Continue Lesson" : "Browse Lessons"} →
              </Link>
              {data.currentLesson?.duration && (
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem", fontWeight: 600, color: C.muted }}>
                  <Clock size={12} /> {data.currentLesson.duration} min
                </span>
              )}
            </div>
          </div>
          {/* Lesson illustration placeholder — SVG mascot area */}
          <div style={{
            width: 100, height: 100, borderRadius: 20, background: "rgba(109,40,217,0.08)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            flexShrink: 0, alignSelf: "center",
          }}>
            <div style={{ fontSize: "1.75rem", marginBottom: 4 }}>🧮</div>
            <div style={{ fontSize: "0.5625rem", fontWeight: 800, color: "#6D28D9", lineHeight: 1.3, textAlign: "center" }}>1 · 2 · 3<br/>4 · 5 · 6</div>
          </div>
        </div>
      </div>

      {/* Spark Coins + Streak row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div style={{ padding: "18px", borderRadius: 16, background: C.cream, border: "1px solid #FDE68A" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Coins size={18} style={{ color: "#D97706" }} />
            <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: C.body }}>Spark Coins</span>
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 900, color: "#92400E" }}>{data.sparkCoins}</div>
          <div style={{ fontSize: "0.6875rem", color: C.body, marginTop: 2 }}>
            {data.sparkCoins > 0 ? "Keep learning to unlock more rewards!" : "Complete your first lesson to earn coins."}
          </div>
        </div>
        <div style={{ padding: "18px", borderRadius: 16, background: C.rose, border: "1px solid #FECDD3" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Flame size={18} style={{ color: "#E11D48" }} />
            <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: C.body }}>Learning Streak</span>
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 900, color: "#BE123C" }}>{data.streak} {data.streak === 1 ? "day" : "days"}</div>
          <div style={{ fontSize: "0.6875rem", color: C.body, marginTop: 2 }}>
            {data.streak > 0 ? "You're on fire! 🔥" : "Start today to build your learning streak."}
          </div>
        </div>
      </div>

      {/* Avatar Progress */}
      <div style={{ padding: "20px", borderRadius: 16, background: C.mint, border: "1px solid #A7F3D0", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #A7F3D0, #6EE7B7)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.75rem", flexShrink: 0,
            border: "2.5px solid #6EE7B7",
          }}>
            🧒🏽
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <h4 style={{ fontWeight: 800, color: C.dark, fontSize: "0.875rem", margin: "0 0 2px 0" }}>Avatar Progress</h4>
            <p style={{ fontSize: "0.6875rem", color: C.body, margin: "0 0 6px 0" }}>
              Level {data.avatarLevel} {data.currentXp > 0 ? "· Customize your look" : "· Start your journey"}
            </p>
            <div style={{ height: 8, borderRadius: 4, background: "#A7F3D0", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${xpPercent}%`, borderRadius: 4, background: "linear-gradient(90deg, #047A70, #34D399)" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
              <span style={{ fontSize: "0.625rem", fontWeight: 700, color: C.muted }}>{data.currentXp} / {data.nextLevelXp} XP</span>
              {data.currentXp > 0 && <span style={{ fontSize: "0.625rem", fontWeight: 800, color: C.teal }}>{data.nextLevelXp - data.currentXp} to go</span>}
            </div>
          </div>
          <Link href="/dashboard/student/profile" style={{
            padding: "8px 16px", borderRadius: 10, border: "1.5px solid #047A70",
            background: C.white, color: C.teal, fontWeight: 700, fontSize: "0.75rem",
            textDecoration: "none", flexShrink: 0,
          }}>Customize Avatar →</Link>
        </div>
      </div>

      {/* Two-column: Subjects + Right panel */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24 }}>

        {/* Left: Subjects */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ fontSize: "1.0625rem", fontWeight: 800, color: C.dark, margin: 0 }}>My Subjects</h3>
            <Link href="/dashboard/student/subjects" style={{ fontSize: "0.75rem", fontWeight: 700, color: C.teal, textDecoration: "none" }}>View All →</Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            {data.subjects.length === 0 ? (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "2rem", background: "white", borderRadius: 16, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📚</div>
                <p style={{ fontSize: "0.875rem", color: C.body }}>No subjects yet. Ask your admin to publish curriculum.</p>
              </div>
            ) : (
              data.subjects.map(s => {
                const Icon = s.icon;
                return (
                  <Link key={s.name} href="/dashboard/student/subjects" style={{
                    padding: "16px", borderRadius: 14, background: s.color,
                    border: `1px solid ${C.border}`, textDecoration: "none", color: "inherit", display: "block",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <Icon size={18} style={{ color: C.dark, opacity: 0.7 }} />
                      <span style={{ fontSize: "0.8125rem", fontWeight: 800, color: C.dark }}>{s.name}</span>
                    </div>
                    <div style={{ fontSize: "0.6875rem", color: C.body, marginBottom: 6 }}>Level {s.level}</div>
                    <div style={{ height: 5, borderRadius: 3, background: "rgba(0,0,0,0.06)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${s.progress}%`, borderRadius: 3, background: C.teal }} />
                    </div>
                    <div style={{ fontSize: "0.625rem", fontWeight: 700, color: C.muted, marginTop: 4 }}>
                      {s.progress > 0 ? `${s.progress}% complete` : "Start learning"}
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* EQ Check-in */}
          <div style={{ padding: "16px", borderRadius: 16, background: C.mint, border: "1px solid #A7F3D0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <Heart size={16} style={{ color: "#059669" }} />
              <h4 style={{ fontSize: "0.875rem", fontWeight: 800, color: C.dark, margin: 0 }}>EQ Check-in</h4>
            </div>
            <p style={{ fontSize: "0.6875rem", color: C.body, margin: "0 0 10px 0" }}>How are you feeling before today's lesson?</p>
            {!data.eqCheckedIn ? (
              <>
                <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                  {MOODS.map((mood, i) => (
                    <button key={i} onClick={() => setSelectedMood(i)} style={{
                      padding: "4px 10px", borderRadius: 8,
                      border: selectedMood === i ? `2px solid ${C.teal}` : "1px solid #E2E8F0",
                      background: selectedMood === i ? C.tealSoft : "#F8FAFC",
                      fontSize: "0.6875rem", fontWeight: 600, color: C.dark, cursor: "pointer",
                    }}>{mood.label}</button>
                  ))}
                </div>
                <button onClick={handleEqCheckin} disabled={selectedMood === null || eqSaving} style={{
                  width: "100%", padding: "8px", borderRadius: 10, border: "none", background: C.teal, color: "#fff",
                  fontWeight: 700, fontSize: "0.75rem", cursor: selectedMood === null ? "default" : "pointer",
                  opacity: selectedMood === null ? 0.5 : 1,
                }}>{eqSaving ? "Saving..." : "Check In"}</button>
              </>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0" }}>
                <CheckCircle2 size={18} style={{ color: "#059669" }} />
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#059669" }}>Checked in today!</span>
              </div>
            )}
          </div>

          {/* Quest Progress */}
          <div style={{ padding: "16px", borderRadius: 16, background: C.rose, border: "1px solid #FECDD3" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <Target size={16} style={{ color: "#E11D48" }} />
              <h4 style={{ fontSize: "0.875rem", fontWeight: 800, color: C.dark, margin: 0 }}>Quest Progress</h4>
            </div>
            <p style={{ fontSize: "0.6875rem", color: C.body, margin: "0 0 8px 0" }}>Complete lessons and quests to earn rewards!</p>
            <div style={{ height: 6, borderRadius: 3, background: "rgba(0,0,0,0.06)", overflow: "hidden", marginBottom: 4 }}>
              <div style={{ height: "100%", width: `${data.questTotal > 0 ? (data.questCompleted / data.questTotal) * 100 : 0}%`, borderRadius: 3, background: "#E11D48" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.625rem", fontWeight: 700, color: C.muted }}>{data.questCompleted} / {data.questTotal}</span>
              <Link href="/dashboard/student/quests" style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#E11D48", textDecoration: "none" }}>View Quests →</Link>
            </div>
          </div>

          {/* Badges */}
          <div style={{ padding: "16px", borderRadius: 16, background: C.white, border: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Trophy size={16} style={{ color: "#6D28D9" }} />
              <h4 style={{ fontSize: "0.875rem", fontWeight: 800, color: C.dark, margin: 0 }}>Badges Earned</h4>
            </div>
            {earnedCount === 0 ? (
              <>
                <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                  {data.badges.slice(0, 4).map((b, i) => (
                    <div key={i} style={{ width: 32, height: 32, borderRadius: 8, background: "#F8FAFC", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", position: "relative" }}>
                      🏅
                      <span style={{ position: "absolute", bottom: -2, right: -2, fontSize: "0.4rem" }}>🔒</span>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: "0.6875rem", color: C.body, margin: 0 }}>Complete your first lesson to unlock badges.</p>
              </>
            ) : (
              <p style={{ fontSize: "0.75rem", color: C.body, margin: 0 }}>{earnedCount} badge{earnedCount !== 1 ? "s" : ""} unlocked</p>
            )}
            <Link href="/dashboard/student/badges" style={{ fontSize: "0.6875rem", fontWeight: 700, color: C.teal, textDecoration: "none", display: "inline-block", marginTop: 6 }}>View All Badges →</Link>
          </div>

          {/* Daily Goal */}
          <div style={{ padding: "16px", borderRadius: 16, background: C.cream, border: "1px solid #FDE68A" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <Gift size={16} style={{ color: "#D97706" }} />
                  <h4 style={{ fontSize: "0.875rem", fontWeight: 800, color: C.dark, margin: 0 }}>Daily Goal</h4>
                </div>
                <p style={{ fontSize: "0.6875rem", color: C.body, margin: 0 }}>
                  {data.dailyGoalCompleted > 0 ? `Complete ${data.dailyGoalTarget} lessons today` : "Complete your first lesson today"}
                </p>
              </div>
              <Star size={20} style={{ color: "#D97706" }} />
            </div>
            <div style={{ height: 6, borderRadius: 3, background: "rgba(0,0,0,0.06)", overflow: "hidden", marginBottom: 4 }}>
              <div style={{ height: "100%", width: `${data.dailyGoalTarget > 0 ? (data.dailyGoalCompleted / data.dailyGoalTarget) * 100 : 0}%`, borderRadius: 3, background: "#D97706" }} />
            </div>
            <span style={{ fontSize: "0.625rem", fontWeight: 700, color: C.muted }}>{data.dailyGoalCompleted} / {data.dailyGoalTarget}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
