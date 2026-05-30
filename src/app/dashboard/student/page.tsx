"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ds, colors } from "@/lib/design-system";

/* ═══════════════════════════════════════════════════════════════════════════
   STUDENT DASHBOARD — CBC Learning Dashboard
   3-column layout: Sidebar | Main Content | Right Panel
   ═══════════════════════════════════════════════════════════════════════════ */

// ─── Color Palette ───
const C = {
  page: "#F7FBF7",
  teal: "#047A70",
  tealSoft: "#E6F5F1",
  dark: "#111827",
  body: "#475569",
  white: "#FFFFFF",
  border: "#E2E8F0",
  borderLight: "#F1F5F9",
  purple: "#EDE9FE",
  purpleDark: "#6D28D9",
  yellow: "#FFF4D8",
  yellowDark: "#92400E",
  green: "#EAF8EE",
  greenDark: "#065F46",
  blue: "#EAF3FF",
  blueDark: "#1D4ED8",
  coral: "#FFE4E6",
  coralRed: "#F43F5E",
  lavender: "#EDE9FE",
  mint: "#E6F5F1",
  warm: "#FEF3C7",
  gray: "#94A3B8",
};

// ─── Confetti ───
function fireConfetti() {
  const canvas = document.createElement("canvas");
  canvas.style.cssText =
    "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    document.body.removeChild(canvas);
    return;
  }
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const colors = [
    "#FDE047", "#6EE7B7", "#A5B4FC", "#FDA4AF", "#7DD3FC", "#C4B5FD",
  ];
  const particles = Array.from({ length: 40 }, () => ({
    x: canvas.width / 2 + (Math.random() - 0.5) * 300,
    y: canvas.height / 2 + (Math.random() - 0.5) * 200,
    vx: (Math.random() - 0.5) * 8,
    vy: -Math.random() * 6 - 2,
    size: Math.random() * 5 + 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    life: 50 + Math.random() * 40,
  }));
  let frame = 0;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frame++;
    let alive = false;
    for (const p of particles) {
      if (p.life <= 0) continue;
      alive = true;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1;
      p.life--;
      ctx.globalAlpha = Math.min(p.life / 25, 1);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    if (alive && frame < 100) requestAnimationFrame(animate);
    else document.body.removeChild(canvas);
  }
  requestAnimationFrame(animate);
}

// ─── EQ Config ───
const eqOptions: Record<
  string,
  { bg: string; border: string; emoji: string; label: string }
> = {
  "very-happy": { bg: "#FEF9C3", border: "#FDE047", emoji: "😄", label: "Very Happy" },
  happy: { bg: "#D1FAE5", border: "#6EE7B7", emoji: "😊", label: "Happy" },
  okay: { bg: "#E0F2FE", border: "#7DD3FC", emoji: "😐", label: "Okay" },
  sad: { bg: "#DBEAFE", border: "#93C5FD", emoji: "😢", label: "Sad" },
  upset: { bg: "#FFE4E6", border: "#FDA4AF", emoji: "😟", label: "Upset" },
};

const eqMessages: Record<string, string> = {
  "very-happy": "Amazing! Your bright energy will power today's learning. Lets go!",
  happy: "Wonderful! Let's use that positive energy for today's lesson.",
  okay: "That's okay. One small step and you'll feel the momentum building.",
  sad: "Thanks for being honest. A short lesson might help you feel better.",
  upset: "That's okay. Let's start with something simple and fun.",
};

// ─── Nav Items ───
const NAV_ITEMS = [
  { emoji: "🏠", label: "Dashboard", href: "/dashboard/student", id: "dashboard" },
  { emoji: "📖", label: "My Lessons", href: "/dashboard/student/lessons", id: "lessons" },
  { emoji: "⚔️", label: "Quests", href: "/dashboard/student/quests", id: "quests" },
  { emoji: "📊", label: "My Progress", href: "/dashboard/student/progress", id: "progress" },
  { emoji: "🏅", label: "Badges", href: "/dashboard/student/badges", id: "badges" },
  { emoji: "🏆", label: "Leaderboard", href: "/dashboard/student/leaderboard", id: "leaderboard" },
  { emoji: "📚", label: "Library", href: "/dashboard/student/library", id: "library" },
  { emoji: "📅", label: "Calendar", href: "/dashboard/student/calendar", id: "calendar" },
  { emoji: "💬", label: "Messages", href: "/dashboard/student/messages", id: "messages" },
  { emoji: "👤", label: "Profile", href: "/dashboard/student/profile", id: "profile" },
  { emoji: "⚙️", label: "Settings", href: "/dashboard/student/settings", id: "settings" },
];

// ─── Fallback Subjects ───
const FALLBACK_SUBJECTS = [
  { name: "Mathematics", emoji: "🔢", color: C.purple, barColor: "#7C3AED", level: 1, progress: 0 },
  { name: "English", emoji: "📚", color: C.yellow, barColor: "#D97706", level: 1, progress: 0 },
  { name: "Science", emoji: "🔬", color: C.green, barColor: "#059669", level: 1, progress: 0 },
  { name: "Social Studies", emoji: "🌍", color: C.blue, barColor: "#2563EB", level: 1, progress: 0 },
];

// ─── Badge Definitions ───
const ALL_BADGES = [
  { id: "math-whiz", name: "Math Whiz", emoji: "🔢" },
  { id: "reader", name: "Reader", emoji: "📖" },
  { id: "science-explorer", name: "Science Explorer", emoji: "🔬" },
  { id: "kind-heart", name: "Kind Heart", emoji: "💚" },
  { id: "quiz-master", name: "Quiz Master", emoji: "🧠" },
  { id: "goal-getter", name: "Goal Getter", emoji: "🎯" },
  { id: "team-player", name: "Team Player", emoji: "🤝" },
  { id: "early-bird", name: "Early Bird", emoji: "🌅" },
];

// ─── Skeleton Loader ───
function Skeleton({ width = "100%", height = "1rem", radius = "0.5rem" }: { width?: string; height?: string; radius?: string }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background: "linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
      }}
    />
  );
}

// ─── Component ───
export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [lessons, setLessons] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [checkin, setCheckin] = useState<any>(null);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [sparkleEmotion, setSparkleEmotion] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Derived
  const displayName = profile?.displayName || "Learner";
  const totalXp = profile?.totalXp || 0;
  const streak = profile?.currentStreak || 0;
  const coinBalance = wallet?.balance || 0;
  const avatarLevel = Math.floor(totalXp / 1000) + 1;
  const xpInLevel = totalXp % 1000;
  const xpPct = totalXp === 0 ? 0 : Math.min((xpInLevel / 1000) * 100, 100);
  const earnedBadges = badges.filter((b: any) => b.awardedAt);
  const unreadCount = notifications.filter((n: any) => !n.read).length;

  // Current lesson
  const currentLesson = lessons?.current || null;
  const nextLesson = lessons?.next || null;
  const featuredLesson = currentLesson || nextLesson;

  // Quest progress
  const questCompleted = progress?.questsCompleted || 0;
  const questTotal = progress?.questsTotal || 10;

  // Daily goal
  const dailyCompleted = progress?.dailyLessonsCompleted || 0;
  const dailyGoal = progress?.dailyGoal || 3;

  // Load data
  useEffect(() => {
    async function load() {
      try {
        const results = await Promise.allSettled([
          fetch("/api/learner/profile", { credentials: "include" }).then((r) => r.json()),
          fetch("/api/coins/wallet", { credentials: "include" }).then((r) => r.json()),
          fetch("/api/learner/subjects", { credentials: "include" }).then((r) => r.json()),
          fetch("/api/learner/badges", { credentials: "include" }).then((r) => r.json()),
          fetch("/api/learner/progress", { credentials: "include" }).then((r) => r.json()),
          fetch("/api/learner/lessons", { credentials: "include" }).then((r) => r.json()),
          fetch("/api/notifications", { credentials: "include" }).then((r) => r.json()),
          fetch("/api/learner/checkin", { credentials: "include" }).then((r) => r.json()),
        ]);

        const [profileRes, walletRes, subjectsRes, badgesRes, progressRes, lessonsRes, notifRes, checkinRes] = results;

        if (profileRes.status === "fulfilled" && profileRes.value?.profile)
          setProfile(profileRes.value.profile);
        if (walletRes.status === "fulfilled")
          setWallet(walletRes.value?.wallet || walletRes.value);
        if (subjectsRes.status === "fulfilled")
          setSubjects(subjectsRes.value?.subjects || subjectsRes.value || []);
        if (badgesRes.status === "fulfilled")
          setBadges(badgesRes.value?.badges || badgesRes.value || []);
        if (progressRes.status === "fulfilled") {
          const p = progressRes.value;
          setProgress({
            questsCompleted: p?.questsCompleted || p?.completed || 0,
            questsTotal: p?.questsTotal || p?.total || 10,
            dailyLessonsCompleted: p?.dailyLessonsCompleted || 0,
            dailyGoal: p?.dailyGoal || 3,
          });
        }
        if (lessonsRes.status === "fulfilled") {
          const l = lessonsRes.value;
          setLessons({
            current: l?.current || l?.lessons?.[0] || null,
            next: l?.next || l?.lessons?.[1] || null,
          });
        }
        if (notifRes.status === "fulfilled")
          setNotifications(notifRes.value?.notifications || notifRes.value || []);
        if (checkinRes.status === "fulfilled" && checkinRes.value?.checkin)
          setCheckin(checkinRes.value.checkin);
      } catch (e) {
        console.error("[STUDENT] Load error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Close notif dropdown
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node))
        setNotifOpen(false);
    }
    if (notifOpen) {
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }
  }, [notifOpen]);

  // EQ Check-in
  const handleCheckin = useCallback(async (emotion: string) => {
    setCheckinLoading(true);
    try {
      const res = await fetch("/api/learner/checkin", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emotion: emotion.toUpperCase() }),
      });
      if (res.ok) {
        setCheckin({ emotion, emotionLabel: eqOptions[emotion]?.label });
        setSparkleEmotion(emotion);
        fireConfetti();
        setTimeout(() => setSparkleEmotion(null), 1200);
      }
    } catch {
      /* ignore */
    } finally {
      setCheckinLoading(false);
    }
  }, []);

  const checkinEmotion = checkin?.emotion?.toLowerCase();
  const hasCheckin = !!checkinEmotion && eqOptions[checkinEmotion];

  // ─── Loading State ───
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: C.page,
          fontFamily: "'Nunito', system-ui, sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: "0.75rem" }}>🎓</div>
          <p style={{ fontWeight: 700, color: C.body, fontSize: "1rem" }}>
            Loading your dashboard...
          </p>
          <div style={{ marginTop: "1rem", display: "flex", justifyContent: "center", gap: "0.35rem" }}>
            {["🟢", "🟡", "🔵"].map((c, i) => (
              <span key={i} style={{ fontSize: "1.25rem", animation: `bounce 1s ${i * 0.15}s infinite` }}>
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── Subject display data ───
  const displaySubjects =
    subjects.length > 0
      ? subjects.slice(0, 4).map((s: any, i: number) => ({
          name: s.name || s.title || "Subject",
          emoji: s.emoji || ["🔢", "📚", "🔬", "🌍"][i] || "📖",
          color: [C.purple, C.yellow, C.green, C.blue][i] || C.purple,
          barColor: ["#7C3AED", "#D97006", "#059669", "#2563EB"][i] || "#7C3AED",
          level: s.level || 1,
          progress: s.progress || 0,
          lessonCount: s.lessonCount || 0,
        }))
      : FALLBACK_SUBJECTS;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.page,
        fontFamily: "'Nunito', system-ui, sans-serif",
      }}
    >
      {/* ═══ SHIMMER KEYFRAMES ═══ */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .dash-card {
          transition: box-shadow 0.2s ease, transform 0.2s ease;
        }
        .dash-card:hover {
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          transform: translateY(-1px);
        }
        .nav-item {
          transition: background 0.15s ease, color 0.15s ease;
        }
        .nav-item:hover {
          background: ${C.tealSoft};
        }
        .eq-btn {
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .eq-btn:hover {
          transform: scale(1.08);
        }
        @media (max-width: 1023px) {
          .right-panel { display: none; }
        }
        @media (max-width: 767px) {
          .sidebar { display: none; }
          .main-content { padding: 1rem !important; }
          .header-inner { flex-wrap: wrap; }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .sidebar { width: 64px !important; }
          .sidebar .nav-label { display: none; }
          .sidebar .motivational-card { display: none !important; }
          .sidebar .nav-item { justify-content: center !important; padding: 0.75rem !important; }
        }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh" }}>
        {/* ═══ LEFT SIDEBAR ═══ */}
        <aside
          className="sidebar"
          style={{
            width: 240,
            minWidth: 240,
            background: C.white,
            borderRight: `1px solid ${C.border}`,
            display: "flex",
            flexDirection: "column",
            position: "sticky",
            top: 0,
            height: "100vh",
            zIndex: 20,
            overflowY: "auto",
          }}
        >
          {/* Brand */}
          <div
            style={{
              padding: "1.25rem 1rem 0.75rem",
              borderBottom: `1px solid ${C.borderLight}`,
            }}
          >
            <Link
              href="/dashboard/student"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                textDecoration: "none",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: `linear-gradient(135deg, ${C.teal}, #0D9488)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.1rem",
                  boxShadow: "0 2px 8px rgba(4,122,112,0.25)",
                }}
              >
                🎓
              </div>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: "0.9375rem",
                  color: C.dark,
                }}
              >
                Arizen School
              </span>
            </Link>
          </div>

          {/* Nav Items */}
          <nav style={{ flex: 1, padding: "0.5rem 0.5rem" }}>
            {NAV_ITEMS.map((item) => {
              const isActive = item.id === "dashboard";
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="nav-item"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.625rem",
                    padding: "0.625rem 0.75rem",
                    borderRadius: 10,
                    textDecoration: "none",
                    marginBottom: "0.125rem",
                    background: isActive ? C.tealSoft : "transparent",
                    color: isActive ? C.teal : C.body,
                    fontWeight: isActive ? 700 : 500,
                    fontSize: "0.8125rem",
                    borderLeft: isActive ? `3px solid ${C.teal}` : "3px solid transparent",
                  }}
                >
                  <span style={{ fontSize: "1rem", width: 20, textAlign: "center", flexShrink: 0 }}>
                    {item.emoji}
                  </span>
                  <span className="nav-label">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Motivational Card */}
          <div
            className="motivational-card"
            style={{
              margin: "0.5rem",
              padding: "1rem",
              borderRadius: 14,
              background: `linear-gradient(135deg, ${C.mint}, #D1FAE5)`,
              border: `1px solid #A7F3D0`,
            }}
          >
            <div style={{ fontSize: "1.5rem", marginBottom: "0.35rem" }}>🌟</div>
            <p
              style={{
                fontWeight: 800,
                fontSize: "0.8125rem",
                color: C.greenDark,
                marginBottom: "0.25rem",
              }}
            >
              Keep learning!
            </p>
            <p
              style={{
                fontSize: "0.75rem",
                color: "#065F46",
                lineHeight: 1.5,
                opacity: 0.8,
              }}
            >
              Every lesson makes you smarter. You're doing great! 💪
            </p>
          </div>
        </aside>

        {/* ═══ MAIN + RIGHT PANEL WRAPPER ═══ */}
        <div style={{ flex: 1, display: "flex", minWidth: 0 }}>
          {/* ═══ MAIN CONTENT ═══ */}
          <main
            className="main-content"
            style={{
              flex: 1,
              padding: "1.5rem",
              minWidth: 0,
              maxWidth: "100%",
            }}
          >
            {/* ── Header ── */}
            <div
              className="header-inner"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1.5rem",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: "clamp(1.125rem, 2.5vw, 1.5rem)",
                    fontWeight: 900,
                    color: C.dark,
                    marginBottom: "0.2rem",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Good morning, {displayName}! 👋
                </h1>
                <p style={{ fontSize: "0.8125rem", color: C.body }}>
                  Ready to learn something amazing today?
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                {/* Coins */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.4rem 0.875rem",
                    borderRadius: 999,
                    background: C.yellow,
                    border: "1px solid #FDE68A",
                  }}
                >
                  <span style={{ fontSize: "1rem" }}>🪙</span>
                  <span
                    style={{
                      fontWeight: 800,
                      fontSize: "0.875rem",
                      color: C.yellowDark,
                    }}
                  >
                    {coinBalance}
                  </span>
                </div>

                {/* Notification Bell */}
                <div ref={notifRef} style={{ position: "relative" }}>
                  <button
                    onClick={() => setNotifOpen(!notifOpen)}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      border: `1px solid ${C.border}`,
                      background: C.white,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.125rem",
                      position: "relative",
                    }}
                  >
                    🔔
                    {unreadCount > 0 && (
                      <span
                        style={{
                          position: "absolute",
                          top: -3,
                          right: -3,
                          width: 16,
                          height: 16,
                          borderRadius: 999,
                          background: C.coralRed,
                          color: "#fff",
                          fontSize: "0.625rem",
                          fontWeight: 800,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>
                  {notifOpen && (
                    <div
                      style={{
                        position: "absolute",
                        top: "calc(100% + 0.5rem)",
                        right: 0,
                        width: 300,
                        maxWidth: "85vw",
                        background: C.white,
                        borderRadius: 14,
                        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                        border: `1px solid ${C.border}`,
                        zIndex: 60,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          padding: "0.75rem 1rem",
                          borderBottom: `1px solid ${C.border}`,
                          fontWeight: 800,
                          fontSize: "0.875rem",
                          color: C.dark,
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        Notifications
                        <button
                          onClick={() => setNotifOpen(false)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: C.body,
                            fontSize: "0.875rem",
                          }}
                        >
                          ✕
                        </button>
                      </div>
                      <div style={{ maxHeight: 260, overflowY: "auto" }}>
                        {notifications.length === 0 ? (
                          <div
                            style={{
                              padding: "1.5rem",
                              textAlign: "center",
                              color: C.body,
                              fontSize: "0.8125rem",
                            }}
                          >
                            No notifications yet ✨
                          </div>
                        ) : (
                          notifications.slice(0, 8).map((n: any) => (
                            <div
                              key={n.id}
                              style={{
                                padding: "0.75rem 1rem",
                                borderBottom: `1px solid ${C.border}`,
                                fontSize: "0.8125rem",
                                background: n.read ? "transparent" : C.tealSoft,
                              }}
                            >
                              <div
                                style={{
                                  fontWeight: n.read ? 500 : 700,
                                  color: C.dark,
                                }}
                              >
                                {n.title || n.message}
                              </div>
                              {n.message && n.title && (
                                <div
                                  style={{
                                    color: C.body,
                                    fontSize: "0.75rem",
                                    marginTop: "0.125rem",
                                  }}
                                >
                                  {n.message}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Avatar */}
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 999,
                    background: `linear-gradient(135deg, ${C.mint}, #D1FAE5)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.25rem",
                    border: `2px solid ${C.tealSoft}`,
                    cursor: "pointer",
                  }}
                >
                  🧒
                </div>
              </div>
            </div>

            {/* ── Today's Lesson Card ── */}
            <div
              className="dash-card"
              style={{
                background: C.lavender,
                borderRadius: 20,
                padding: "1.5rem",
                marginBottom: "1.25rem",
                border: "1px solid #DDD6FE",
                boxShadow: "0 2px 12px rgba(109,40,217,0.06)",
                display: "flex",
                gap: "1.5rem",
                flexDirection: "row",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                {featuredLesson ? (
                  <>
                    <span
                      style={{
                        display: "inline-block",
                        fontSize: "0.625rem",
                        fontWeight: 800,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: C.purpleDark,
                        background: "rgba(109,40,217,0.1)",
                        padding: "0.2rem 0.625rem",
                        borderRadius: 999,
                        marginBottom: "0.5rem",
                      }}
                    >
                      Today's Lesson
                    </span>
                    <h2
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: 800,
                        color: C.dark,
                        marginBottom: "0.35rem",
                        lineHeight: 1.3,
                      }}
                    >
                      {featuredLesson.title}
                    </h2>
                    <span
                      style={{
                        display: "inline-block",
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        color: C.purpleDark,
                        background: "rgba(255,255,255,0.7)",
                        padding: "0.2rem 0.75rem",
                        borderRadius: 999,
                        marginBottom: "0.625rem",
                      }}
                    >
                      {featuredLesson.subject || "Mathematics"}
                    </span>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        color: C.body,
                        lineHeight: 1.6,
                        marginBottom: "1rem",
                        maxWidth: 400,
                      }}
                    >
                      {featuredLesson.description ||
                        "A fun CBC lesson to boost your skills and earn Spark Coins."}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                      }}
                    >
                      <Link
                        href={
                          featuredLesson.id
                            ? `/dashboard/student/lessons/${featuredLesson.id}`
                            : "/dashboard/student/lessons"
                        }
                        style={{
                          display: "inline-block",
                          background: C.teal,
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: "0.8125rem",
                          padding: "0.625rem 1.25rem",
                          borderRadius: 12,
                          textDecoration: "none",
                          boxShadow: "0 2px 8px rgba(4,122,112,0.2)",
                        }}
                      >
                        Continue Lesson →
                      </Link>
                      {featuredLesson.duration && (
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: C.gray,
                            fontWeight: 600,
                          }}
                        >
                          ⏱ {featuredLesson.duration}
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <span
                      style={{
                        display: "inline-block",
                        fontSize: "0.625rem",
                        fontWeight: 800,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: C.purpleDark,
                        background: "rgba(109,40,217,0.1)",
                        padding: "0.2rem 0.625rem",
                        borderRadius: 999,
                        marginBottom: "0.5rem",
                      }}
                    >
                      START HERE
                    </span>
                    <h2
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: 800,
                        color: C.dark,
                        marginBottom: "0.35rem",
                        lineHeight: 1.3,
                      }}
                    >
                      Start Your First Lesson
                    </h2>
                    <span
                      style={{
                        display: "inline-block",
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        color: C.purpleDark,
                        background: "rgba(255,255,255,0.7)",
                        padding: "0.2rem 0.75rem",
                        borderRadius: 999,
                        marginBottom: "0.625rem",
                      }}
                    >
                      Mathematics
                    </span>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        color: C.body,
                        lineHeight: 1.6,
                        marginBottom: "1rem",
                        maxWidth: 400,
                      }}
                    >
                      Begin with a simple CBC lesson and earn your first Spark Coins.
                    </p>
                    <Link
                      href="/dashboard/student/lessons"
                      style={{
                        display: "inline-block",
                        background: C.teal,
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "0.8125rem",
                        padding: "0.625rem 1.25rem",
                        borderRadius: 12,
                        textDecoration: "none",
                        boxShadow: "0 2px 8px rgba(4,122,112,0.2)",
                      }}
                    >
                      Browse Lessons →
                    </Link>
                  </>
                )}
              </div>

              {/* Math Visual */}
              <div
                style={{
                  flexShrink: 0,
                  width: 180,
                  display: "none",
                }}
                className="math-visual"
              >
                <div
                  style={{
                    background: "rgba(255,255,255,0.8)",
                    borderRadius: 14,
                    padding: "1rem",
                    border: "1px solid #DDD6FE",
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.625rem",
                      fontWeight: 800,
                      color: C.purpleDark,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Quick Math
                  </p>
                  <div style={{ fontSize: "0.875rem", fontWeight: 700, color: C.dark, lineHeight: 1.8 }}>
                    <div>
                      ½ + ¼ = <span style={{ color: C.purpleDark }}>¾</span>
                    </div>
                    <div>
                      ⅓ + ⅔ = <span style={{ color: C.purpleDark }}>1</span>
                    </div>
                    <div>
                      ¾ − ¼ = <span style={{ color: C.purpleDark }}>½</span>
                    </div>
                    <div>
                      2 × ½ = <span style={{ color: C.purpleDark }}>1</span>
                    </div>
                  </div>
                </div>
              </div>

              <style>{`
                @media (min-width: 640px) {
                  .math-visual { display: block !important; }
                }
              `}</style>
            </div>

            {/* ── Spark Coins + Streak Row ── */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
                marginBottom: "1.25rem",
              }}
            >
              {/* Spark Coins */}
              <div
                className="dash-card"
                style={{
                  background: C.yellow,
                  borderRadius: 16,
                  padding: "1.25rem",
                  border: "1px solid #FDE68A",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  <span style={{ fontSize: "1.375rem" }}>🪙</span>
                  <h3
                    style={{
                      fontWeight: 800,
                      fontSize: "0.875rem",
                      color: C.dark,
                    }}
                  >
                    Spark Coins
                  </h3>
                </div>
                <div
                  style={{
                    fontSize: "2rem",
                    fontWeight: 900,
                    color: C.yellowDark,
                    lineHeight: 1,
                  }}
                >
                  {coinBalance}
                </div>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: C.body,
                    marginTop: "0.35rem",
                    lineHeight: 1.5,
                  }}
                >
                  {coinBalance === 0
                    ? "Complete your first lesson to earn coins."
                    : "Keep learning to earn more!"}
                </p>
              </div>

              {/* Streak */}
              <div
                className="dash-card"
                style={{
                  background: C.coral,
                  borderRadius: 16,
                  padding: "1.25rem",
                  border: "1px solid #FECDD3",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  <span style={{ fontSize: "1.375rem" }}>🔥</span>
                  <h3
                    style={{
                      fontWeight: 800,
                      fontSize: "0.875rem",
                      color: C.dark,
                    }}
                  >
                    Learning Streak
                  </h3>
                </div>
                <div
                  style={{
                    fontSize: "2rem",
                    fontWeight: 900,
                    color: "#BE123C",
                    lineHeight: 1,
                  }}
                >
                  {streak}
                  <span
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: 700,
                      color: C.body,
                      marginLeft: "0.25rem",
                    }}
                  >
                    {streak === 1 ? "day" : "days"}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: C.body,
                    marginTop: "0.35rem",
                    lineHeight: 1.5,
                  }}
                >
                  {streak === 0
                    ? "Start today to build your learning streak."
                    : "Amazing! Keep the fire burning!"}
                </p>
              </div>
            </div>

            {/* ── Avatar Progress Card ── */}
            <div
              className="dash-card"
              style={{
                background: C.green,
                borderRadius: 16,
                padding: "1.25rem",
                marginBottom: "1.25rem",
                border: "1px solid #A7F3D0",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 999,
                    background: `linear-gradient(135deg, #D1FAE5, #A7F3D0)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2.25rem",
                    flexShrink: 0,
                    border: "3px solid #6EE7B7",
                  }}
                >
                  🧒
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3
                    style={{
                      fontWeight: 800,
                      fontSize: "0.9375rem",
                      color: C.dark,
                      marginBottom: "0.125rem",
                    }}
                  >
                    Avatar Progress
                  </h3>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: C.body,
                      marginBottom: "0.5rem",
                    }}
                  >
                    Level {avatarLevel} ·{" "}
                    {totalXp === 0
                      ? "Start your journey"
                      : `${xpInLevel} / 1000 XP`}
                  </p>
                  <div
                    style={{
                      height: 10,
                      borderRadius: 5,
                      background: "rgba(255,255,255,0.7)",
                      overflow: "hidden",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        borderRadius: 5,
                        background: `linear-gradient(90deg, ${C.teal}, #0D9488)`,
                        width: `${xpPct}%`,
                        transition: "width 0.8s ease",
                      }}
                    />
                  </div>
                  <Link
                    href="/dashboard/student/profile"
                    style={{
                      display: "inline-block",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: C.teal,
                      textDecoration: "none",
                    }}
                  >
                    Customize Avatar →
                  </Link>
                </div>
              </div>
            </div>

            {/* ── My Subjects ── */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "0.75rem",
                }}
              >
                <h2
                  style={{
                    fontSize: "1.0625rem",
                    fontWeight: 800,
                    color: C.dark,
                  }}
                >
                  My Subjects
                </h2>
                <Link
                  href="/dashboard/student/subjects"
                  style={{
                    fontSize: "0.8125rem",
                    fontWeight: 700,
                    color: C.teal,
                    textDecoration: "none",
                  }}
                >
                  View All Subjects →
                </Link>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: "0.75rem",
                }}
              >
                {displaySubjects.map((s: any, i: number) => (
                  <Link
                    key={s.name}
                    href={`/dashboard/student/subjects`}
                    className="dash-card"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.875rem 1rem",
                      borderRadius: 14,
                      background: s.color || C.white,
                      border: `1px solid ${C.border}`,
                      textDecoration: "none",
                    }}
                  >
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 12,
                        background: "rgba(255,255,255,0.8)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.25rem",
                        flexShrink: 0,
                      }}
                    >
                      {s.emoji}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: "0.8125rem",
                          color: C.dark,
                          marginBottom: "0.25rem",
                        }}
                      >
                        {s.name}
                      </div>
                      <div
                        style={{
                          height: 6,
                          borderRadius: 3,
                          background: "rgba(255,255,255,0.7)",
                          overflow: "hidden",
                          marginBottom: "0.2rem",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            borderRadius: 3,
                            background: s.barColor || C.teal,
                            width: `${s.progress || 0}%`,
                            transition: "width 0.6s ease",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          fontSize: "0.6875rem",
                          fontWeight: 700,
                          color: C.gray,
                        }}
                      >
                        Level {s.level || 1} · {s.progress || 0}%
                        {s.progress === 0 && (
                          <span style={{ fontWeight: 500, marginLeft: "0.25rem" }}>
                            · Start learning
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </main>

          {/* ═══ RIGHT PANEL ═══ */}
          <aside
            className="right-panel"
            style={{
              width: 280,
              minWidth: 280,
              padding: "1.5rem 1rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              borderLeft: `1px solid ${C.border}`,
              background: C.page,
              overflowY: "auto",
              maxHeight: "100vh",
              position: "sticky",
              top: 0,
            }}
          >
            {/* ── EQ Check-in ── */}
            <div
              style={{
                background: C.white,
                borderRadius: 16,
                padding: "1.125rem",
                border: `1px solid ${C.border}`,
                boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.625rem",
                }}
              >
                <span style={{ fontSize: "1.25rem" }}>💚</span>
                <h3
                  style={{
                    fontWeight: 800,
                    fontSize: "0.875rem",
                    color: C.dark,
                  }}
                >
                  EQ Check-in
                </h3>
              </div>
              {!hasCheckin ? (
                <>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: C.body,
                      marginBottom: "0.625rem",
                      lineHeight: 1.5,
                    }}
                  >
                    How are you feeling today? All feelings are welcome. 💛
                  </p>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(5, 1fr)",
                      gap: "0.35rem",
                      marginBottom: "0.625rem",
                    }}
                  >
                    {Object.keys(eqOptions).map((key) => {
                      const eq = eqOptions[key];
                      const isSparkle = sparkleEmotion === key;
                      return (
                        <button
                          key={key}
                          onClick={() => handleCheckin(key)}
                          disabled={checkinLoading}
                          className="eq-btn"
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "0.15rem",
                            padding: "0.4rem 0.15rem",
                            borderRadius: 10,
                            border: `1.5px solid ${eq.border}`,
                            background: eq.bg,
                            cursor: checkinLoading ? "wait" : "pointer",
                            transform: isSparkle ? "scale(1.1)" : "none",
                            boxShadow: isSparkle
                              ? `0 0 10px ${eq.border}`
                              : "none",
                          }}
                        >
                          <span style={{ fontSize: "1.125rem", lineHeight: 1 }}>
                            {eq.emoji}
                          </span>
                          <span
                            style={{
                              fontSize: "0.5625rem",
                              fontWeight: 700,
                              color: "#44403c",
                            }}
                          >
                            {eq.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => handleCheckin("happy")}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      borderRadius: 10,
                      border: "none",
                      background: C.teal,
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      cursor: "pointer",
                    }}
                  >
                    Check In ✓
                  </button>
                </>
              ) : (
                <div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.4rem 0.75rem",
                      borderRadius: 999,
                      background: eqOptions[checkinEmotion]?.bg || "#f5f5f4",
                      border: `2px solid ${eqOptions[checkinEmotion]?.border || "#e7e5e4"}`,
                      marginBottom: "0.5rem",
                    }}
                  >
                    <span style={{ fontSize: "1.125rem" }}>
                      {eqOptions[checkinEmotion]?.emoji}
                    </span>
                    <span
                      style={{
                        fontWeight: 700,
                        color: C.dark,
                        fontSize: "0.8125rem",
                      }}
                    >
                      {eqOptions[checkinEmotion]?.label}
                    </span>
                    <span style={{ color: "#059669", fontSize: "0.875rem" }}>✓</span>
                  </div>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: C.body,
                      lineHeight: 1.55,
                      fontStyle: "italic",
                    }}
                  >
                    "{eqMessages[checkinEmotion] || "Thanks for checking in!"}"
                  </p>
                  <button
                    onClick={() => setCheckin(null)}
                    style={{
                      marginTop: "0.35rem",
                      background: "none",
                      border: "none",
                      color: C.body,
                      fontWeight: 600,
                      fontSize: "0.6875rem",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    Change
                  </button>
                </div>
              )}
            </div>

            {/* ── Quest Progress ── */}
            <div
              style={{
                background: C.white,
                borderRadius: 16,
                padding: "1.125rem",
                border: `1px solid ${C.border}`,
                boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.5rem",
                }}
              >
                <span style={{ fontSize: "1.25rem" }}>⚔️</span>
                <h3
                  style={{
                    fontWeight: 800,
                    fontSize: "0.875rem",
                    color: C.dark,
                  }}
                >
                  Quest Progress
                </h3>
              </div>
              <div
                style={{
                  height: 10,
                  borderRadius: 5,
                  background: C.borderLight,
                  overflow: "hidden",
                  marginBottom: "0.35rem",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    borderRadius: 5,
                    background: `linear-gradient(90deg, ${C.teal}, #0D9488)`,
                    width:
                      questTotal > 0
                        ? `${Math.min((questCompleted / questTotal) * 100, 100)}%`
                        : "0%",
                    transition: "width 0.6s ease",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    color: C.gray,
                  }}
                >
                  {questCompleted} / {questTotal} quests
                </span>
                <Link
                  href="/dashboard/student/quests"
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    color: C.teal,
                    textDecoration: "none",
                  }}
                >
                  View Quests →
                </Link>
              </div>
              {questCompleted === 0 && (
                <p
                  style={{
                    fontSize: "0.6875rem",
                    color: C.body,
                    marginTop: "0.35rem",
                    lineHeight: 1.4,
                  }}
                >
                  Complete lessons and quests to earn rewards.
                </p>
              )}
            </div>

            {/* ── Badges Earned ── */}
            <div
              style={{
                background: C.white,
                borderRadius: 16,
                padding: "1.125rem",
                border: `1px solid ${C.border}`,
                boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.625rem",
                }}
              >
                <span style={{ fontSize: "1.25rem" }}>🏆</span>
                <h3
                  style={{
                    fontWeight: 800,
                    fontSize: "0.875rem",
                    color: C.dark,
                  }}
                >
                  Badges Earned
                </h3>
              </div>

              {earnedBadges.length === 0 ? (
                <div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4, 1fr)",
                      gap: "0.35rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {ALL_BADGES.slice(0, 8).map((b) => (
                      <div
                        key={b.id}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "0.15rem",
                          padding: "0.35rem 0.15rem",
                          borderRadius: 10,
                          background: C.borderLight,
                          opacity: 0.5,
                        }}
                      >
                        <span style={{ fontSize: "1.125rem" }}>🔒</span>
                        <span
                          style={{
                            fontSize: "0.5rem",
                            fontWeight: 700,
                            color: C.gray,
                            textAlign: "center",
                            lineHeight: 1.2,
                          }}
                        >
                          {b.name}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p
                    style={{
                      fontSize: "0.6875rem",
                      color: C.body,
                      lineHeight: 1.4,
                    }}
                  >
                    Complete your first lesson to unlock badges.
                  </p>
                </div>
              ) : (
                <div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4, 1fr)",
                      gap: "0.35rem",
                    }}
                  >
                    {earnedBadges.slice(0, 8).map((b: any) => (
                      <div
                        key={b.id}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "0.15rem",
                          padding: "0.35rem 0.15rem",
                          borderRadius: 10,
                          background: C.warm,
                          border: "1px solid #FDE68A",
                        }}
                      >
                        <span style={{ fontSize: "1.125rem" }}>
                          {ALL_BADGES.find((ab) => ab.id === b.id)?.emoji || "🏅"}
                        </span>
                        <span
                          style={{
                            fontSize: "0.5rem",
                            fontWeight: 700,
                            color: C.yellowDark,
                            textAlign: "center",
                            lineHeight: 1.2,
                          }}
                        >
                          {b.name}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/dashboard/student/badges"
                    style={{
                      display: "inline-block",
                      marginTop: "0.5rem",
                      fontSize: "0.6875rem",
                      fontWeight: 700,
                      color: C.teal,
                      textDecoration: "none",
                    }}
                  >
                    View All Badges →
                  </Link>
                </div>
              )}
            </div>

            {/* ── Daily Goal ── */}
            <div
              style={{
                background: C.white,
                borderRadius: 16,
                padding: "1.125rem",
                border: `1px solid ${C.border}`,
                boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.5rem",
                }}
              >
                <span style={{ fontSize: "1.25rem" }}>🎯</span>
                <h3
                  style={{
                    fontWeight: 800,
                    fontSize: "0.875rem",
                    color: C.dark,
                  }}
                >
                  Daily Goal
                </h3>
              </div>
              <div
                style={{
                  height: 10,
                  borderRadius: 5,
                  background: C.borderLight,
                  overflow: "hidden",
                  marginBottom: "0.35rem",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    borderRadius: 5,
                    background:
                      dailyCompleted >= dailyGoal
                        ? "linear-gradient(90deg, #059669, #10B981)"
                        : `linear-gradient(90deg, ${C.teal}, #0D9488)`,
                    width:
                      dailyGoal > 0
                        ? `${Math.min((dailyCompleted / dailyGoal) * 100, 100)}%`
                        : "0%",
                    transition: "width 0.6s ease",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    color: C.gray,
                  }}
                >
                  {dailyCompleted} / {dailyGoal} lessons
                </span>
                {dailyCompleted >= dailyGoal && (
                  <span style={{ fontSize: "0.6875rem" }}>✅ Done!</span>
                )}
              </div>
              {dailyCompleted === 0 && (
                <p
                  style={{
                    fontSize: "0.6875rem",
                    color: C.body,
                    marginTop: "0.35rem",
                    lineHeight: 1.4,
                  }}
                >
                  Complete your first lesson today.
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
