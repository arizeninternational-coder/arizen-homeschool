"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Zap, Award, Target, BookOpen, ChevronRight, Sparkles, Coins, ShoppingBag, RefreshCw
} from "lucide-react";
import { ds, colors, gradients, shadows } from "@/lib/design-system";

// ─── EQ Color Palette ───
const eqColors: Record<string, { bg: string; border: string; emoji: string; label: string }> = {
  happy:      { bg: "#FEF9C3", border: "#FDE047", emoji: "😊", label: "Happy" },
  calm:       { bg: "#D1FAE5", border: "#6EE7B7", emoji: "😌", label: "Calm" },
  curious:    { bg: "#E0E7FF", border: "#A5B4FC", emoji: "🤔", label: "Curious" },
  okay:       { bg: "#E0F2FE", border: "#7DD3FC", emoji: "😐", label: "Okay" },
  worried:    { bg: "#EDE9FE", border: "#C4B5FD", emoji: "😟", label: "Worried" },
  tired:      { bg: "#DDD6FE", border: "#A78BFA", emoji: "😴", label: "Tired" },
  frustrated: { bg: "#FFE4E6", border: "#FDA4AF", emoji: "😤", label: "Frustrated" },
};

const eqMessages: Record<string, string> = {
  happy:      "That's wonderful! Let's use that energy for today's lesson.",
  calm:       "A calm mind is ready to learn. Let's begin gently.",
  curious:    "Curiosity is a superpower. Let's explore something new.",
  okay:       "That's okay. You can start small today.",
  worried:    "Thanks for sharing. Let's take one small step at a time.",
  tired:      "Thanks for noticing. Try one short lesson and take it slowly.",
  frustrated: "That feeling is allowed. Let's begin with something simple.",
};

const eqActions: Record<string, string> = {
  happy:      "Begin today's mission",
  calm:       "Continue your learning path",
  curious:    "Explore today's challenge",
  okay:       "Pick a lesson to start",
  worried:    "Start with something easy",
  tired:      "Start with a short lesson",
  frustrated: "Try a gentle practice lesson",
};

const emotionKeys = Object.keys(eqColors);

interface LearnerProfile {
  id: string;
  displayName: string;
  totalXp: number;
  currentStreak: number;
  completedItems: number;
  badgesCount: number;
}

export default function StudentDashboard() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [coinBalance, setCoinBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  // EQ Check-in state
  const [checkinEmotion, setCheckinEmotion] = useState<string | null>(null);
  const [checkinSaved, setCheckinSaved] = useState(false);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [checkinFetched, setCheckinFetched] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [profileRes, walletRes, checkinRes] = await Promise.allSettled([
          fetch("/api/learner/profile").then(r => r.json()),
          fetch("/api/coins/wallet").then(r => r.json()),
          fetch("/api/learner/checkin").then(r => r.json()),
        ]);
        if (profileRes.status === "fulfilled" && profileRes.value.profile) {
          setProfile(profileRes.value.profile);
        }
        if (walletRes.status === "fulfilled") {
          setCoinBalance(walletRes.value.wallet?.balance || walletRes.value.balance || 0);
        }
        if (checkinRes.status === "fulfilled" && checkinRes.value.checkin) {
          const saved = checkinRes.value.checkin;
          setCheckinEmotion(saved.emotion);
          setCheckinSaved(true);
        }
        setCheckinFetched(true);
      } catch (err) {
        console.error("[DASHBOARD] Load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const user = session?.user as any;
  const displayName = profile?.displayName || user?.name?.split(" ")[0] || "Learner";
  const totalXp = profile?.totalXp || 0;
  const streak = profile?.currentStreak || 0;
  const badgesCount = profile?.badgesCount || 0;
  const completedItems = profile?.completedItems || 0;
  const level = Math.floor(totalXp / 500) + 1;
  const xpInLevel = totalXp % 500;
  const xpProgress = Math.min((xpInLevel / 500) * 100, 100);

  async function handleCheckin(emotion: string) {
    setCheckinLoading(true);
    try {
      const res = await fetch("/api/learner/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emotion }),
      });
      if (res.ok) {
        setCheckinEmotion(emotion);
        setCheckinSaved(true);
      }
    } catch (err) {
      console.error("[CHECK-IN] Save error:", err);
    } finally {
      setCheckinLoading(false);
    }
  }

  return (
    <>
      {/* ─── 1. Greeting Hero ─── */}
      <div style={{
        padding: "2rem 2rem 2.25rem",
        borderRadius: 20,
        background: "linear-gradient(135deg, #0d9488 0%, #059669 50%, #10b981 100%)",
        color: "white",
        marginBottom: "2rem",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 8px 32px rgba(5,150,105,0.22)",
      }}>
        {/* Decorative circles */}
        <div style={{
          position: "absolute", top: "-2rem", right: "-2rem",
          width: 120, height: 120, borderRadius: "50%",
          background: "rgba(255,255,255,0.08)",
        }} />
        <div style={{
          position: "absolute", bottom: "-3rem", right: "20%",
          width: 160, height: 160, borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
        }} />
        <div style={{ position: "relative" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.4rem",
            padding: "0.3rem 0.75rem", borderRadius: 999,
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(8px)",
            marginBottom: "0.75rem",
          }}>
            <Sparkles style={{ width: 14, height: 14 }} />
            <span style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Level {level}
            </span>
          </div>
          <h1 style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)", fontWeight: 900, marginBottom: "0.5rem", letterSpacing: "-0.03em" }}>
            Hey, {displayName}! 👋
          </h1>
          <p style={{ opacity: 0.88, fontSize: "0.9375rem", fontWeight: 500, maxWidth: 480 }}>
            Welcome back to your learning adventure. Let's make today amazing.
          </p>
        </div>
      </div>

      {/* ─── 2. Daily EQ Check-In ─── */}
      <div style={{
        background: "white",
        borderRadius: 20,
        border: "1px solid rgb(var(--color-border-light))",
        padding: "2rem",
        marginBottom: "2rem",
        boxShadow: ds.shadows.md,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Warm top accent */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 4,
          background: "linear-gradient(90deg, #fde047, #6ee7b7, #a5b4fc, #7dd3fc, #c4b5fd, #a78bfa, #fda4af)",
        }} />

        {!checkinSaved ? (
          <>
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.375rem", fontWeight: 800, color: colors.textHeading, marginBottom: "0.5rem", letterSpacing: "-0.02em" }}>
                How are you feeling today?
              </h2>
              <p style={{ fontSize: "0.875rem", color: colors.textMuted, fontWeight: 500 }}>
                All feelings are welcome here. 💛
              </p>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "0.625rem",
              maxWidth: 520,
              margin: "0 auto",
            }}
            className="emotion-grid"
            >
              {emotionKeys.map((key) => {
                const eq = eqColors[key];
                return (
                  <button
                    key={key}
                    onClick={() => handleCheckin(key)}
                    disabled={checkinLoading}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.375rem",
                      padding: "0.875rem 0.625rem",
                      minHeight: 80,
                      borderRadius: 16,
                      border: `2px solid ${eq.border}`,
                      background: eq.bg,
                      cursor: checkinLoading ? "wait" : "pointer",
                      transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                      fontFamily: "'Nunito', system-ui, sans-serif",
                      fontWeight: 700,
                    } as React.CSSProperties}
                  >
                    <span style={{ fontSize: "1.75rem", lineHeight: 1 }}>{eq.emoji}</span>
                    <span style={{ fontSize: "0.8125rem", color: "#44403c", fontWeight: 700 }}>{eq.label}</span>
                  </button>
                );
              })}
            </div>
            <style>{`
              @media (min-width: 640px) {
                .emotion-grid { grid-template-columns: repeat(4, 1fr); }
              }
            `}</style>
          </>
        ) : checkinEmotion ? (
          <div style={{ textAlign: "center" }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.625rem",
              padding: "0.5rem 1rem",
              borderRadius: 999,
              background: eqColors[checkinEmotion]?.bg || "#f5f5f4",
              border: `2px solid ${eqColors[checkinEmotion]?.border || "#e7e5e4"}`,
              marginBottom: "1rem",
            }}>
              <span style={{ fontSize: "1.5rem" }}>{eqColors[checkinEmotion]?.emoji}</span>
              <span style={{ fontSize: "1rem", fontWeight: 700, color: colors.text }}>
                {eqColors[checkinEmotion]?.label}
              </span>
            </div>
            <p style={{
              fontSize: "1.0625rem",
              fontWeight: 600,
              color: colors.text,
              maxWidth: 400,
              margin: "0 auto 1.5rem",
              lineHeight: 1.65,
            }}>
              "{eqMessages[checkinEmotion]}"
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
              <Link href="/dashboard/student/lessons" style={{
                ...ds.btnPrimary,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                background: gradients.primary,
                boxShadow: shadows.primary,
              }}>
                {eqActions[checkinEmotion] || "Begin learning"} <ChevronRight style={{ width: 16, height: 16 }} />
              </Link>
              <button
                onClick={() => { setCheckinSaved(false); setCheckinEmotion(null); }}
                style={{
                  background: "none",
                  border: "none",
                  color: colors.textMuted,
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  textDecoration: "underline",
                  textUnderlineOffset: 3,
                  fontFamily: "'Nunito', system-ui, sans-serif",
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                  <RefreshCw style={{ width: 14, height: 14 }} /> Change
                </span>
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* ─── 3. Continue Learning / Today's Mission ─── */}
      <Link href="/dashboard/student/lessons" style={{
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        padding: "1.5rem 1.75rem",
        borderRadius: 20,
        background: `linear-gradient(135deg, ${colors.primarySoft}, white)`,
        border: `1.5px solid ${colors.primaryLight}`,
        marginBottom: "2rem",
        textDecoration: "none",
        transition: "all 0.3s ease",
        boxShadow: ds.shadows.sm,
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: gradients.primary,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, boxShadow: shadows.primary,
        }}>
          <BookOpen style={{ width: 24, height: 24, color: "white" }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "0.6875rem", fontWeight: 800, color: colors.primary, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.25rem" }}>
            {checkinSaved && checkinEmotion ? `${eqColors[checkinEmotion]?.label} & Ready` : "Today's Mission"}
          </div>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: colors.text }}>
            {checkinSaved && checkinEmotion && eqActions[checkinEmotion]
              ? eqActions[checkinEmotion]
              : "Continue your learning journey"}
          </div>
          <div style={{ fontSize: "0.8125rem", color: colors.textMuted, marginTop: "0.125rem" }}>
            {completedItems} lessons completed · Level {level}
          </div>
        </div>
        <ChevronRight style={{ width: 20, height: 20, color: colors.primary, flexShrink: 0 }} />
      </Link>

      {/* ─── 4. Learning Path Preview ─── */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: colors.text }}>Learning Path</h2>
          <Link href="/dashboard/student/lessons" style={{ fontSize: "0.8125rem", fontWeight: 700, color: colors.primary, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
            View all <ChevronRight style={{ width: 14, height: 14 }} />
          </Link>
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
        }}>
          {[
            {
              emoji: "🌍", title: "World Explorers", lessons: "8 lessons",
              gradient: "linear-gradient(135deg, #E0F2FE, #BAE6FD)", dot: "#0284C7",
            },
            {
              emoji: "🎨", title: "Creative Arts", lessons: "5 lessons",
              gradient: "linear-gradient(135deg, #FEF9C3, #FEF08A)", dot: "#CA8A04",
            },
            {
              emoji: "🌱", title: "Life Skills", lessons: "6 lessons",
              gradient: "linear-gradient(135deg, #D1FAE5, #A7F3D0)", dot: "#059669",
            },
          ].map((theme) => (
            <Link key={theme.title} href="/dashboard/student/lessons" style={{
              padding: "1.25rem",
              borderRadius: 18,
              background: theme.gradient,
              border: "1px solid rgba(0,0,0,0.04)",
              textDecoration: "none",
              display: "block",
              transition: "transform 0.25s ease, box-shadow 0.25s ease",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}>
              <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>{theme.emoji}</div>
              <div style={{ fontSize: "0.9375rem", fontWeight: 800, color: colors.text, marginBottom: "0.25rem" }}>{theme.title}</div>
              <div style={{ fontSize: "0.75rem", color: colors.textMuted, fontWeight: 600 }}>{theme.lessons}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* ─── 5. Progress Stats ─── */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: colors.text, marginBottom: "1rem" }}>Your Progress</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.875rem" }}>
          {/* Total XP */}
          <div style={{
            padding: "1.25rem",
            borderRadius: 18,
            background: "linear-gradient(135deg, #FEF3C7, #FDE68A)",
            border: "1px solid #FDE047",
            boxShadow: "0 2px 8px rgba(245,158,11,0.1)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "#F59E0B", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Zap style={{ width: 16, height: 16, color: "white" }} />
              </div>
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#92400E", letterSpacing: "-0.02em" }}>{totalXp.toLocaleString()}</div>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#B45309", marginTop: "0.125rem" }}>Total XP</div>
          </div>

          {/* Spark Coins */}
          <div style={{
            padding: "1.25rem",
            borderRadius: 18,
            background: "linear-gradient(135deg, #FEF9C3, #FDE04730)",
            border: "1px solid #FDE047",
            boxShadow: "0 2px 8px rgba(234,179,8,0.1)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "#EAB308", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Coins style={{ width: 16, height: 16, color: "white" }} />
              </div>
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#854D0E", letterSpacing: "-0.02em" }}>{coinBalance.toLocaleString()}</div>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#A16207", marginTop: "0.125rem" }}>Spark Coins</div>
          </div>

          {/* Streak */}
          <div style={{
            padding: "1.25rem",
            borderRadius: 18,
            background: "linear-gradient(135deg, #FFEDD5, #FED7AA)",
            border: "1px solid #FDBA74",
            boxShadow: "0 2px 8px rgba(234,88,12,0.1)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "#EA580C", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Target style={{ width: 16, height: 16, color: "white" }} />
              </div>
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#9A3412", letterSpacing: "-0.02em" }}>{streak} days</div>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#C2410C", marginTop: "0.125rem" }}>Streak</div>
          </div>

          {/* Badges */}
          <div style={{
            padding: "1.25rem",
            borderRadius: 18,
            background: "linear-gradient(135deg, #EDE9FE, #DDD6FE)",
            border: "1px solid #C4B5FD",
            boxShadow: "0 2px 8px rgba(124,58,237,0.1)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "#7C3AED", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Award style={{ width: 16, height: 16, color: "white" }} />
              </div>
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#5B21B6", letterSpacing: "-0.02em" }}>{badgesCount}</div>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6D28D9", marginTop: "0.125rem" }}>Badges</div>
          </div>
        </div>

        {/* XP Level Bar */}
        <div style={{
          marginTop: "1rem",
          padding: "1rem 1.25rem",
          borderRadius: 16,
          background: colors.bgSoft,
          border: `1px solid ${colors.borderLight}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: colors.textMuted }}>Level {level}</span>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: colors.primary }}>{xpInLevel}/500 XP</span>
          </div>
          <div style={{ height: 10, borderRadius: 5, background: `${colors.primary}20`, overflow: "hidden" }}>
            <div style={{
              height: "100%",
              borderRadius: 5,
              background: gradients.primary,
              width: `${xpProgress}%`,
              transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
            }} />
          </div>
        </div>
      </div>

      {/* ─── 6. Rewards / Badges Preview ─── */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: colors.text }}>Rewards & Badges</h2>
          <Link href="/dashboard/student/badges" style={{ fontSize: "0.8125rem", fontWeight: 700, color: colors.primary, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
            View all <ChevronRight style={{ width: 14, height: 14 }} />
          </Link>
        </div>
        <div style={{
          padding: "1.5rem",
          borderRadius: 18,
          background: "linear-gradient(135deg, #F5F3FF, #EDE9FE)",
          border: "1px solid #DDD6FE",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "0.5rem",
          minHeight: 120,
        }}>
          <Award style={{ width: 32, height: 32, color: "#7C3AED" }} />
          <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#6D28D9", textAlign: "center" }}>
            {badgesCount > 0 ? `${badgesCount} badges earned — keep going!` : "Complete your first lesson to earn a badge!"}
          </p>
          {badgesCount === 0 && (
            <Link href="/dashboard/student/lessons" style={{ fontSize: "0.75rem", fontWeight: 700, color: "#7C3AED", textDecoration: "none" }}>
              Start learning →
            </Link>
          )}
        </div>
      </div>

      {/* ─── 7. Reflection Prompt ─── */}
      <div style={{
        padding: "1.5rem",
        borderRadius: 18,
        background: "linear-gradient(135deg, #FFF7ED, #FFEDD5)",
        border: "1px solid #FED7AA",
        marginBottom: "2rem",
      }}>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "#FFF7ED", display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, border: "1px solid #FDBA74",
          }}>
            <span style={{ fontSize: "1.125rem" }}>💭</span>
          </div>
          <div>
            <div style={{ fontSize: "0.6875rem", fontWeight: 800, color: "#C2410C", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.375rem" }}>
              Daily Reflection
            </div>
            <p style={{ fontSize: "0.875rem", color: "#9A3412", fontWeight: 500, lineHeight: 1.6 }}>
              What is one thing you&apos;re curious about today? Learning starts with wonder.
            </p>
          </div>
        </div>
      </div>

      {/* ─── 8. Quick Links ─── */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: colors.text, marginBottom: "1rem" }}>Quick Links</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.875rem" }}>
          <Link href="/dashboard/student/lessons" style={{
            ...ds.card, padding: "1.125rem", textDecoration: "none",
            display: "flex", alignItems: "center", gap: "0.75rem",
            border: `1px solid ${colors.borderLight}`,
            borderRadius: 18,
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: colors.primarySoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <BookOpen style={{ width: 18, height: 18, color: colors.primary }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, color: colors.text, fontSize: "0.875rem" }}>My Lessons</div>
              <div style={{ fontSize: "0.75rem", color: colors.textMuted }}>Continue learning</div>
            </div>
            <ChevronRight style={{ width: 16, height: 16, color: colors.textMuted, marginLeft: "auto", flexShrink: 0 }} />
          </Link>
          <Link href="/dashboard/student/quests" style={{
            ...ds.card, padding: "1.125rem", textDecoration: "none",
            display: "flex", alignItems: "center", gap: "0.75rem",
            border: `1px solid ${colors.borderLight}`,
            borderRadius: 18,
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: colors.warmSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Target style={{ width: 18, height: 18, color: colors.warm }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, color: colors.text, fontSize: "0.875rem" }}>Quests</div>
              <div style={{ fontSize: "0.75rem", color: colors.textMuted }}>Explore challenges</div>
            </div>
            <ChevronRight style={{ width: 16, height: 16, color: colors.textMuted, marginLeft: "auto", flexShrink: 0 }} />
          </Link>
          <Link href="/dashboard/student/badges" style={{
            ...ds.card, padding: "1.125rem", textDecoration: "none",
            display: "flex", alignItems: "center", gap: "0.75rem",
            border: `1px solid ${colors.borderLight}`,
            borderRadius: 18,
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `${colors.accent}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Award style={{ width: 18, height: 18, color: colors.accent }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, color: colors.text, fontSize: "0.875rem" }}>Badges</div>
              <div style={{ fontSize: "0.75rem", color: colors.textMuted }}>{badgesCount} earned</div>
            </div>
            <ChevronRight style={{ width: 16, height: 16, color: colors.textMuted, marginLeft: "auto", flexShrink: 0 }} />
          </Link>
          <Link href="/dashboard/student/shop" style={{
            ...ds.card, padding: "1.125rem", textDecoration: "none",
            display: "flex", alignItems: "center", gap: "0.75rem",
            border: `1px solid ${colors.borderLight}`,
            borderRadius: 18,
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <ShoppingBag style={{ width: 18, height: 18, color: "#D97706" }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, color: colors.text, fontSize: "0.875rem" }}>Avatar Shop</div>
              <div style={{ fontSize: "0.75rem", color: colors.textMuted }}>Customize your character</div>
            </div>
            <ChevronRight style={{ width: 16, height: 16, color: colors.textMuted, marginLeft: "auto", flexShrink: 0 }} />
          </Link>
        </div>
      </div>
    </>
  );
}
