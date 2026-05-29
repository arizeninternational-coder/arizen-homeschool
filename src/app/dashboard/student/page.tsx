"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Bell, Lock, Check, ChevronRight, Sparkles, Coins, Target, Award, BookOpen, Zap
} from "lucide-react";

/* ═══════════════════════════════════════════════════════
   STUDENT DASHBOARD v3
   Professional card layout · Subjects first · Large avatar
   ═══════════════════════════════════════════════════════ */

const C = {
  page: "#F7FBF7", teal: "#047A70", tealLight: "#E6F5F1",
  dark: "#111827", body: "#475569", white: "#FFFFFF",
  border: "#E2E8F0", purple: "#F1ECFF", yellow: "#FFF4D8",
  green: "#EAF8EE", coral: "#FFE4E6", blue: "#EFF6FF",
};

// ─── Confetti helper ───
function fireConfetti() {
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) { document.body.removeChild(canvas); return; }
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  const colors = ["#FDE047","#6EE7B7","#A5B4FC","#FDA4AF","#7DD3FC","#C4B5FD"];
  const particles = Array.from({length: 40}, () => ({
    x: canvas.width/2 + (Math.random()-0.5)*300,
    y: canvas.height/2 + (Math.random()-0.5)*200,
    vx: (Math.random()-0.5)*8, vy: -Math.random()*6-2,
    size: Math.random()*5+2, color: colors[Math.floor(Math.random()*colors.length)],
    life: 50+Math.random()*40,
  }));
  let frame = 0;
  function animate() {
    ctx.clearRect(0,0,canvas.width,canvas.height); frame++; let alive = false;
    for (const p of particles) {
      if (p.life <= 0) continue; alive = true;
      p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.life--;
      ctx.globalAlpha = Math.min(p.life/25,1); ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
    }
    if (alive && frame < 100) requestAnimationFrame(animate);
    else document.body.removeChild(canvas);
  }
  requestAnimationFrame(animate);
}

const eqColors: Record<string, { bg: string; border: string; emoji: string; label: string }> = {
  happy:      { bg: "#FEF9C3", border: "#FDE047", emoji: "😊", label: "Happy" },
  calm:       { bg: "#D1FAE5", border: "#6EE7B7", emoji: "😌", label: "Calm" },
  curious:    { bg: "#E0E7FF", border: "#A5B4FC", emoji: "🤔", label: "Curious" },
  okay:       { bg: "#E0F2FE", border: "#7DD3FC", emoji: "😐", label: "Okay" },
  sad:        { bg: "#DBEAFE", border: "#93C5FD", emoji: "😢", label: "Sad" },
  worried:    { bg: "#EDE9FE", border: "#C4B5FD", emoji: "😟", label: "Worried" },
  tired:      { bg: "#DDD6FE", border: "#A78BFA", emoji: "😴", label: "Tired" },
  frustrated: { bg: "#FFE4E6", border: "#FDA4AF", emoji: "😤", label: "Frustrated" },
};

const owlMessages: Record<string, string> = {
  happy: "Wonderful! Let's use that bright energy for today's lesson.",
  calm: "A calm mind is ready to learn. Let's begin with something cool.",
  curious: "Curiosity is a superpower. Let's explore something new.",
  okay: "That's okay. One small step is enough to begin.",
  sad: "I'm here with you. One small step is enough today.",
  worried: "Thank you for sharing. Let's take it slowly today.",
  tired: "Thanks for noticing. A short lesson might be just right.",
  frustrated: "That feeling is allowed. Let's start with something simple.",
};

const supportMessages: Record<string, string> = {
  happy: "That's wonderful! Let's use that energy for today's lesson.",
  calm: "A calm mind is ready to learn. Let's begin gently.",
  curious: "Curiosity is a superpower. Let's explore something new.",
  okay: "That's okay. You can start small today.",
  sad: "I'm sorry you're feeling that way. Let's take one gentle step together.",
  worried: "Thanks for sharing. Let's take one small step at a time.",
  tired: "Thanks for noticing. Try one short lesson and take it slowly.",
  frustrated: "That feeling is allowed. Let's begin with something simple.",
};

const subjectIcons: Record<string, string> = {
  "Mathematics":"🔢","Math":"🔢","Science":"🔬","English":"📚","Language Arts":"📚",
  "History":"🏛️","Geography":"🌍","Art":"🎨","Music":"🎵","Physical Education":"🏃","PE":"🏃",
  "Computer Science":"💻","Coding":"💻","Life Skills":"🌱","default":"📖",
};

export default function StudentDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [checkin, setCheckin] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [sparkleEmotion, setSparkleEmotion] = useState<string|null>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const displayName = profile?.displayName || "Learner";
  const totalXp = profile?.totalXp || 0;
  const streak = profile?.currentStreak || 0;
  const coinBalance = wallet?.balance || 0;
  const level = Math.floor(totalXp / 500) + 1;
  const xpInLevel = totalXp % 500;
  const xpPct = Math.min((xpInLevel / 500) * 100, 100);
  const earnedBadges = badges.filter((b: any) => b.awardedAt);
  const unreadCount = notifications.filter((n: any) => !n.read).length;

  useEffect(() => {
    async function load() {
      try {
        const [pw, walletRes, checkinRes, notifRes, subjRes, badgeRes, progRes] = await Promise.allSettled([
          fetch("/api/learner/profile", { credentials: "include" }).then(r => r.json()),
          fetch("/api/coins/wallet", { credentials: "include" }).then(r => r.json()),
          fetch("/api/learner/checkin", { credentials: "include" }).then(r => r.json()),
          fetch("/api/notifications", { credentials: "include" }).then(r => r.json()),
          fetch("/api/learner/subjects", { credentials: "include" }).then(r => r.json()),
          fetch("/api/learner/badges", { credentials: "include" }).then(r => r.json()),
          fetch("/api/learner/progress", { credentials: "include" }).then(r => r.json()),
        ]);
        if (pw.status === "fulfilled" && pw.value?.profile) setProfile(pw.value.profile);
        if (walletRes.status === "fulfilled") setWallet(walletRes.value?.wallet || walletRes.value);
        if (checkinRes.status === "fulfilled" && checkinRes.value?.checkin) setCheckin(checkinRes.value.checkin);
        if (notifRes.status === "fulfilled") setNotifications(notifRes.value?.notifications || notifRes.value || []);
        if (subjRes.status === "fulfilled") setSubjects(subjRes.value?.subjects || subjRes.value || []);
        if (badgeRes.status === "fulfilled") setBadges(badgeRes.value?.badges || badgeRes.value || []);
        if (progRes.status === "fulfilled") setProgress({ completed: progRes.value?.completed || 0, total: progRes.value?.total || 0 });
      } catch (e) { console.error("[STUDENT] Load error:", e); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  // Close notif dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    if (notifOpen) { document.addEventListener("mousedown", handler); return () => document.removeEventListener("mousedown", handler); }
  }, [notifOpen]);

  const handleCheckin = useCallback(async (emotion: string) => {
    setCheckinLoading(true);
    try {
      const res = await fetch("/api/learner/checkin", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emotion: emotion.toUpperCase() }),
      });
      if (res.ok) {
        setCheckin({ emotion, emotionLabel: eqColors[emotion]?.label });
        setSparkleEmotion(emotion);
        fireConfetti();
        setTimeout(() => setSparkleEmotion(null), 1200);
      }
    } catch { /* ignore */ }
    finally { setCheckinLoading(false); }
  }, []);

  const checkinEmotion = checkin?.emotion?.toLowerCase();
  const hasCheckin = !!checkinEmotion && eqColors[checkinEmotion];

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.page }}>
        <div style={{ textAlign: "center", color: C.body }}>
          <div style={{ fontSize: 32, marginBottom: "0.75rem" }}>🎓</div>
          <p style={{ fontWeight: 600 }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.page, fontFamily: "'Nunito', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "1rem" }}>

        {/* ── 1. GREETING HERO ── */}
        <div style={{ borderRadius: 20, background: `linear-gradient(135deg, ${C.teal} 0%, #059669 50%, #10B981 100%)`, color: "#fff", padding: "1.25rem 1.5rem", marginBottom: "1rem", position: "relative", overflow: "hidden", boxShadow: "0 4px 20px rgba(5,150,105,0.2)" }}>
          <div style={{ position: "absolute", top: "-1.5rem", right: "-1.5rem", width: 90, height: 90, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", position: "relative" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.2rem 0.7rem", borderRadius: 999, background: "rgba(255,255,255,0.15)", marginBottom: "0.4rem" }}>
                <Sparkles style={{ width: 12, height: 12 }} />
                <span style={{ fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>Level {level}</span>
              </div>
              <h1 style={{ fontSize: "clamp(1.25rem, 3vw, 1.625rem)", fontWeight: 900, marginBottom: "0.25rem", letterSpacing: "-0.02em" }}>
                Good morning, {displayName}! 👋
              </h1>
              <p style={{ opacity: 0.85, fontSize: "0.8125rem", marginBottom: "0.625rem" }}>Ready to learn something amazing today?</p>
              {/* XP bar */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ flex: 1, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.2)", overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 4, background: "linear-gradient(90deg, #FDE047, #F59E0B)", width: `${xpPct}%`, transition: "width 0.8s ease" }} />
                </div>
                <span style={{ fontSize: "0.6875rem", fontWeight: 700, whiteSpace: "nowrap", opacity: 0.9 }}>{xpInLevel}/500 XP</span>
              </div>
            </div>
            {/* Right: coins + notif */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.35rem 0.875rem", borderRadius: 999, background: "rgba(255,255,255,0.15)" }}>
                <Coins style={{ width: 14, height: 14, color: "#FDE047" }} />
                <span style={{ fontSize: "0.875rem", fontWeight: 800 }}>{coinBalance}</span>
              </div>
              {/* Notification bell */}
              <div ref={notifRef} style={{ position: "relative" }}>
                <button onClick={() => setNotifOpen(!notifOpen)} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 10, padding: "0.4rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  <Bell style={{ width: 18, height: 18, color: "#fff" }} />
                  {unreadCount > 0 && (
                    <span style={{ position: "absolute", top: -2, right: -2, width: 16, height: 16, borderRadius: 999, background: "#F43F5E", color: "#fff", fontSize: "0.625rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{unreadCount > 9 ? "9+" : unreadCount}</span>
                  )}
                </button>
                {notifOpen && (
                  <div style={{ position: "absolute", top: "calc(100% + 0.5rem)", right: 0, width: 300, maxWidth: "85vw", background: C.white, borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", border: `1px solid ${C.border}`, zIndex: 60, overflow: "hidden" }}>
                    <div style={{ padding: "0.75rem 1rem", borderBottom: `1px solid ${C.border}`, fontWeight: 800, fontSize: "0.875rem", color: C.dark, display: "flex", justifyContent: "space-between" }}>
                      Notifications
                      <button onClick={() => setNotifOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: C.body, fontSize: "0.875rem" }}>✕</button>
                    </div>
                    <div style={{ maxHeight: 260, overflowY: "auto" }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: "1.5rem", textAlign: "center", color: C.body, fontSize: "0.8125rem" }}>No notifications yet ✨</div>
                      ) : notifications.slice(0, 8).map((n: any) => (
                        <div key={n.id} style={{ padding: "0.75rem 1rem", borderBottom: `1px solid ${C.border}`, fontSize: "0.8125rem", background: n.read ? "transparent" : C.tealLight }}>
                          <div style={{ fontWeight: n.read ? 500 : 700, color: C.dark }}>{n.title || n.message}</div>
                          {n.message && n.title && <div style={{ color: C.body, fontSize: "0.75rem", marginTop: "0.125rem" }}>{n.message}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. MAIN CARD GRID ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.75rem", marginBottom: "1.25rem" }} className="student-grid">

          {/* Today's Lesson — purple, spans full width */}
          <div style={{ background: C.purple, borderRadius: 18, padding: "1.25rem" }}>
            <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#6D28D9" }}>Today's Lesson</p>
            <h4 style={{ fontSize: "1.125rem", fontWeight: 800, color: C.dark, marginTop: "0.5rem" }}>Understanding Feelings</h4>
            <span style={{ display: "inline-block", marginTop: "0.35rem", background: "rgba(255,255,255,0.7)", borderRadius: 999, padding: "0.2rem 0.75rem", fontSize: "0.6875rem", fontWeight: 700, color: "#7C3AED" }}>Life Skills</span>
            <p style={{ marginTop: "0.75rem", fontSize: "0.875rem", lineHeight: 1.55, color: C.body, maxWidth: 380 }}>Learn how to identify and manage your emotions in a healthy way.</p>
            <div style={{ marginTop: "1rem", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "1rem" }}>
              <Link href="/dashboard/student/lessons" style={{ display: "inline-block", background: C.teal, color: "#fff", fontWeight: 700, fontSize: "0.8125rem", padding: "0.625rem 1.25rem", borderRadius: 12, textDecoration: "none" }}>Continue Lesson →</Link>
              <div style={{ fontSize: "2.5rem" }}>🧘🏽‍♂️</div>
            </div>
          </div>

          {/* EQ Check-in */}
          <div style={{ background: C.green, borderRadius: 18, padding: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <span style={{ fontSize: "1.5rem" }}>💚</span>
              <h4 style={{ fontWeight: 800, color: C.dark, fontSize: "1rem" }}>EQ Check-in</h4>
            </div>
            {!hasCheckin ? (
              <>
                <p style={{ fontSize: "0.875rem", color: C.body, marginBottom: "0.75rem" }}>How are you feeling today? All feelings are welcome. 💛</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.375rem" }}>
                  {Object.keys(eqColors).map((key) => {
                    const eq = eqColors[key];
                    const isSparkle = sparkleEmotion === key;
                    return (
                      <button key={key} onClick={() => handleCheckin(key)} disabled={checkinLoading}
                        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem", padding: "0.5rem 0.25rem", borderRadius: 12, border: `1.5px solid ${eq.border}`, background: eq.bg, cursor: checkinLoading ? "wait" : "pointer", transition: "all 0.2s", transform: isSparkle ? "scale(1.08)" : "none", boxShadow: isSparkle ? `0 0 12px ${eq.border}` : "none" }}>
                        <span style={{ fontSize: "1.25rem", lineHeight: 1 }}>{eq.emoji}</span>
                        <span style={{ fontSize: "0.625rem", fontWeight: 700, color: "#44403c" }}>{eq.label}</span>
                        {isSparkle && <span style={{ fontSize: "0.625rem" }}>✓</span>}
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.4rem 1rem", borderRadius: 999, background: eqColors[checkinEmotion]?.bg || "#f5f5f4", border: `2px solid ${eqColors[checkinEmotion]?.border || "#e7e5e4"}`, marginBottom: "0.75rem" }}>
                  <span style={{ fontSize: "1.25rem" }}>{eqColors[checkinEmotion]?.emoji}</span>
                  <span style={{ fontWeight: 700, color: C.dark, fontSize: "0.875rem" }}>{eqColors[checkinEmotion]?.label}</span>
                  <Check style={{ width: 14, height: 14, color: "#059669" }} />
                </div>
                <p style={{ fontSize: "0.875rem", color: C.body, lineHeight: 1.55, fontStyle: "italic" }}>"{owlMessages[checkinEmotion] || supportMessages[checkinEmotion] || "Thanks for checking in!"}"</p>
                <button onClick={() => { setCheckin(null); }} style={{ marginTop: "0.5rem", background: "none", border: "none", color: C.body, fontWeight: 600, fontSize: "0.75rem", cursor: "pointer", textDecoration: "underline" }}>Change</button>
              </div>
            )}
          </div>

          {/* Quest Progress */}
          <div style={{ borderRadius: 18, border: `1px solid ${C.border}`, background: C.white, padding: "1.125rem" }}>
            <div style={{ fontSize: "1.75rem", marginBottom: "0.35rem" }}>⚔️</div>
            <h4 style={{ fontWeight: 800, color: C.dark, fontSize: "0.9375rem" }}>Quest Progress</h4>
            <p style={{ fontSize: "0.8125rem", color: C.body, lineHeight: 1.5, marginTop: "0.25rem" }}>Complete quests and earn rewards!</p>
            <div style={{ marginTop: "0.75rem", height: 8, borderRadius: 4, background: "#F1F5F9", overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 4, background: C.teal, width: progress.total > 0 ? `${(progress.completed / progress.total) * 100}%` : "0%", transition: "width 0.6s ease" }} />
            </div>
            <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#94A3B8", marginTop: "0.35rem" }}>{progress.completed} / {progress.total}</p>
          </div>

          {/* Spark Coins */}
          <div style={{ background: C.yellow, borderRadius: 18, padding: "1.125rem" }}>
            <div style={{ fontSize: "1.75rem", marginBottom: "0.35rem" }}>🪙</div>
            <h4 style={{ fontWeight: 800, color: C.dark, fontSize: "0.9375rem" }}>Spark Coins</h4>
            <div style={{ fontSize: "1.75rem", fontWeight: 900, color: "#92400E", marginTop: "0.25rem" }}>{coinBalance}</div>
            <p style={{ fontSize: "0.8125rem", color: C.body, lineHeight: 1.5, marginTop: "0.25rem" }}>Keep learning to earn more!</p>
          </div>

          {/* Avatar Progress — LARGE, green, spans 2 cols on desktop */}
          <div style={{ background: C.green, borderRadius: 18, padding: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
              <div style={{ fontSize: "4rem", flexShrink: 0, lineHeight: 1 }}>🧒🏽</div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontWeight: 800, color: C.dark, fontSize: "1rem" }}>Avatar Progress</h4>
                <p style={{ fontSize: "0.8125rem", color: C.body }}>Level {level}</p>
                <div style={{ marginTop: "0.5rem", height: 10, borderRadius: 5, background: "#fff", overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 5, background: `linear-gradient(90deg, ${C.teal}, #0D9488)`, width: `${xpPct}%`, transition: "width 0.8s ease" }} />
                </div>
                <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#94A3B8", marginTop: "0.35rem" }}>{totalXp} / {level * 500} XP</p>
                <Link href="/dashboard/student/profile" style={{ display: "inline-block", marginTop: "0.625rem", background: C.teal, color: "#fff", fontWeight: 700, fontSize: "0.75rem", padding: "0.4rem 1rem", borderRadius: 10, textDecoration: "none" }}>Customize Avatar</Link>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div style={{ borderRadius: 18, border: `1px solid ${C.border}`, background: C.white, padding: "1.125rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "1.5rem" }}>🏆</span>
                <h4 style={{ fontWeight: 800, color: C.dark, fontSize: "0.9375rem" }}>Badges Earned</h4>
              </div>
              <Link href="/dashboard/student/badges" style={{ fontSize: "0.75rem", fontWeight: 700, color: C.teal, textDecoration: "none" }}>View All →</Link>
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: 900, color: "#7C3AED" }}>{earnedBadges.length}</div>
            <p style={{ fontSize: "0.8125rem", color: C.body, marginTop: "0.125rem" }}>{earnedBadges.length === 0 ? "Complete lessons to earn your first badge!" : `${earnedBadges.length} badge${earnedBadges.length !== 1 ? "s" : ""} unlocked`}</p>
            {earnedBadges.length > 0 && (
              <div style={{ display: "flex", gap: "0.35rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                {earnedBadges.slice(0, 5).map((b: any) => (
                  <span key={b.id} style={{ fontSize: "1.25rem" }} title={b.name}>🏅</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── 3. MY SUBJECTS ── */}
        <div style={{ marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: C.dark }}>My Subjects</h2>
            <Link href="/dashboard/student/subjects" style={{ fontSize: "0.8125rem", fontWeight: 700, color: C.teal, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
              View all <ChevronRight style={{ width: 14, height: 14 }} />
            </Link>
          </div>
          {subjects.length === 0 ? (
            <div style={{ borderRadius: 18, border: `1px solid ${C.border}`, background: C.white, padding: "1.5rem", textAlign: "center" }}>
              <BookOpen style={{ width: 32, height: 32, color: "#CBD5E1", margin: "0 auto 0.5rem" }} />
              <p style={{ color: C.body, fontSize: "0.875rem" }}>No subjects available yet. Check back soon!</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.625rem" }}>
              {subjects.slice(0, 6).map((s: any) => (
                <Link key={s.id} href={`/dashboard/student/subjects/${s.id}`} style={{ display: "flex", alignItems: "center", gap: "0.875rem", padding: "0.875rem 1rem", borderRadius: 14, border: `1px solid ${C.border}`, background: C.white, textDecoration: "none", transition: "box-shadow 0.2s" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: C.tealLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.375rem", flexShrink: 0 }}>
                    {subjectIcons[s.name] || subjectIcons.default}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: C.dark, fontSize: "0.875rem" }}>{s.name}</div>
                    <div style={{ fontSize: "0.75rem", color: C.body }}>{s.lessonCount || 0} lessons</div>
                  </div>
                  <ChevronRight style={{ width: 16, height: 16, color: "#CBD5E1", flexShrink: 0 }} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ── 4. QUICK LINKS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.625rem", marginBottom: "2rem" }}>
          <Link href="/dashboard/student/reflections" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem", borderRadius: 14, background: C.blue, border: `1px solid ${C.border}`, textDecoration: "none" }}>
            <span style={{ fontSize: "1.5rem" }}>✍️</span>
            <div>
              <div style={{ fontWeight: 700, color: C.dark, fontSize: "0.875rem" }}>Reflections</div>
              <div style={{ fontSize: "0.75rem", color: C.body }}>Write about your learning</div>
            </div>
          </Link>
          <Link href="/dashboard/student/shop" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem", borderRadius: 14, background: C.yellow, border: `1px solid ${C.border}`, textDecoration: "none" }}>
            <span style={{ fontSize: "1.5rem" }}>🛍️</span>
            <div>
              <div style={{ fontWeight: 700, color: C.dark, fontSize: "0.875rem" }}>Shop</div>
              <div style={{ fontSize: "0.75rem", color: C.body }}>Customize your avatar</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
