"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { signOut as nextAuthSignOut } from "next-auth/react";
import {
  Sparkles, ArrowLeft, CheckCircle2, Zap, LogOut, BookOpen, Flame, Award
} from "lucide-react";
import { ds, colors, gradients } from "@/lib/design-system";
import confetti from "canvas-confetti";

// Inject celebration animations
const celebrationStyles = `
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes float { 0% { transform: translateY(0) rotate(0deg); opacity: 0.8; } 100% { transform: translateY(-20px) rotate(15deg); opacity: 1; } }
@keyframes popIn { 0% { transform: scale(0.5); opacity: 0; } 70% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
@keyframes slideUp { 0% { transform: translateY(20px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
@keyframes xpBurst { 0% { transform: scale(1); } 50% { transform: scale(1.3); } 100% { transform: scale(1); } }
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
`;

interface LessonData {
  id: string;
  title: string;
  slug: string;
  description: string;
  contentBlocks: any[];
  difficulty?: string;
  xpReward?: { base: number } | number;
  progress: number;
  isCompleted: boolean;
}

interface Badge {
  id: string;
  name: string;
  badgeType: string;
}

export default function LessonPlayerPage({ params }: { params: Promise<{ themeSlug: string; questSlug: string; lessonSlug: string }> }) {
  const { data: session, status } = useSession();
  const [slugs, setSlugs] = useState<{ themeSlug: string; questSlug: string; lessonSlug: string } | null>(null);
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [streakBonus, setStreakBonus] = useState(0);
  const [newBadges, setNewBadges] = useState<Badge[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [animatedXp, setAnimatedXp] = useState(0);
  const celebrationFired = useRef(false);

  useEffect(() => {
    if (status === "unauthenticated") window.location.replace("/auth/login");
  }, [status]);

  useEffect(() => {
    params.then(p => {
      setSlugs(p);
      fetch(`/api/lessons/${p.lessonSlug}?slug=${p.lessonSlug}`)
        .then(r => r.json())
        .then(data => {
          if (data.lesson) {
            setLesson(data.lesson);
            setCompleted(data.lesson.isCompleted);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    });
  }, [params]);

  const fireConfetti = useCallback(() => {
    // Primary burst from center
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#2DD4BF", "#F59E0B", "#3B82F6", "#EC4899", "#10B981"],
    });
    // Left burst
    setTimeout(() => {
      confetti({
        particleCount: 40,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ["#2DD4BF", "#F59E0B", "#3B82F6"],
      });
    }, 150);
    // Right burst
    setTimeout(() => {
      confetti({
        particleCount: 40,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ["#EC4899", "#10B981", "#F59E0B"],
      });
    }, 300);
    // Star shapes finale
    setTimeout(() => {
      confetti({
        particleCount: 30,
        spread: 100,
        origin: { y: 0.5 },
        shapes: ["star"],
        colors: ["#FFD700", "#FFA500"],
        scalar: 1.5,
      });
    }, 500);
  }, []);

  const animateXpCounter = useCallback((targetXp: number, targetStreak: number) => {
    const total = targetXp + targetStreak;
    const duration = 1200;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedXp(Math.floor(eased * total));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);

  const handleComplete = useCallback(async () => {
    if (!slugs || completing) return;
    setCompleting(true);
    try {
      const res = await fetch(`/api/lessons/${slugs.lessonSlug}?slug=${slugs.lessonSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: slugs.lessonSlug, masteryPercent: 100 }),
      });
      const data = await res.json();
      if (data.success) {
        const xp = data.xpAwarded || 0;
        const streak = data.streakBonus || 0;
        const badges = data.newBadges || [];

        setCompleted(true);
        setXpEarned(xp);
        setStreakBonus(streak);
        setNewBadges(badges);
        setShowCelebration(true);

        // Fire confetti
        fireConfetti();

        // Animate XP counter
        animateXpCounter(xp, streak);
      }
    } catch (err) {
      console.error("Complete lesson error:", err);
    } finally {
      setCompleting(false);
    }
  }, [slugs, completing, fireConfetti, animateXpCounter]);

  const totalXpWithBonus = xpEarned + streakBonus;

  if (status === "loading" || loading) return <LoadingScreen />;
  if (!lesson) return <NotFoundScreen />;

  const xp = typeof lesson.xpReward === "object" ? (lesson.xpReward as any)?.base : lesson.xpReward;

  // Lesson viewer overlay
  if (viewing) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 50, background: colors.bg, display: "flex", flexDirection: "column" }}>
        {/* Sticky header */}
        <div style={{ background: "rgba(253,253,251,0.95)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${colors.border}`, padding: "0.75rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <button onClick={() => { setViewing(false); setShowCelebration(false); }} style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.375rem 0.75rem", borderRadius: 8, border: `1px solid ${colors.border}`, background: "none", color: colors.textMuted, cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600 }}>
              <ArrowLeft style={{ width: 14, height: 14 }} /> Exit
            </button>
            <span style={{ fontWeight: 700, color: colors.text, fontSize: "0.9375rem" }}>{lesson.title}</span>
          </div>
          {!completed && (
            <button onClick={handleComplete} disabled={completing} style={{ ...ds.btnPrimary, padding: "0.5rem 1rem", fontSize: "0.875rem", opacity: completing ? 0.6 : 1, cursor: completing ? "wait" : "pointer" }}>
              {completing ? (
                <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                  <span style={{ width: 14, height: 14, border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />
                  Completing...
                </span>
              ) : "Mark Complete"}
            </button>
          )}
          {completed && (
            <span style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontWeight: 700, color: colors.success, fontSize: "0.875rem" }}>
              <CheckCircle2 style={{ width: 18, height: 18 }} /> Completed
            </span>
          )}
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflow: "auto", padding: "2rem", maxWidth: 720, margin: "0 auto", width: "100%" }}>
          {/* Celebration overlay */}
          {showCelebration && totalXpWithBonus > 0 && (
            <div style={{ textAlign: "center", padding: "2rem", borderRadius: 20, background: `linear-gradient(135deg, ${colors.primarySoft}, ${colors.warmSoft})`, marginBottom: "1.5rem", border: `2px solid ${colors.primary}30`, position: "relative", overflow: "hidden" }}>
              <style>{celebrationStyles}</style>
              {/* Animated background particles */}
              <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} style={{ position: "absolute", fontSize: "1.5rem", left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 25}%`, animation: `float ${2 + i * 0.5}s ease-in-out infinite alternate`, animationDelay: `${i * 0.2}s` }}>
                    {["⭐", "✨", "🎉", "💫", "🌟", "⚡"][i]}
                  </div>
                ))}
              </div>

              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🎉</div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: colors.text, marginBottom: "0.5rem" }}>Lesson Complete!</h2>

                {/* Animated XP display */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", marginTop: "1rem", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.5rem 1rem", borderRadius: 12, background: "white", boxShadow: shadows.sm, animation: "xpBurst 0.5s ease-out" }}>
                    <Zap style={{ width: 20, height: 20, color: colors.primary }} />
                    <span style={{ fontSize: "1.25rem", fontWeight: 800, color: colors.primary }}>+{animatedXp}</span>
                    <span style={{ fontSize: "0.875rem", fontWeight: 600, color: colors.textMuted }}>XP</span>
                  </div>
                  {streakBonus > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.5rem 1rem", borderRadius: 12, background: colors.warmSoft, boxShadow: shadows.sm }}>
                      <Flame style={{ width: 20, height: 20, color: colors.warm }} />
                      <span style={{ fontSize: "1.25rem", fontWeight: 800, color: colors.warm }}>+{streakBonus}</span>
                      <span style={{ fontSize: "0.875rem", fontWeight: 600, color: colors.warm }}>streak</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* New badges earned */}
          {showCelebration && newBadges.length > 0 && (
            <div style={{ marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: colors.text, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                <Award style={{ width: 18, height: 18, color: colors.accent }} /> New Badge{newBadges.length > 1 ? "s" : ""} Earned!
              </h3>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                {newBadges.map((badge) => (
                  <div key={badge.id} style={{ ...ds.card, padding: "0.875rem 1.25rem", display: "flex", alignItems: "center", gap: "0.625rem", background: `${colors.accent}10`, border: `2px solid ${colors.accent}30`, animation: "popIn 0.4s ease-out" }}>
                    <span style={{ fontSize: "1.5rem" }}>🏅</span>
                    <div>
                      <div style={{ fontWeight: 700, color: colors.text, fontSize: "0.875rem" }}>{badge.name}</div>
                      <div style={{ fontSize: "0.6875rem", color: colors.textMuted }}>New badge earned!</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Already completed state (no celebration) */}
          {completed && !showCelebration && (
            <div style={{ textAlign: "center", padding: "1.5rem", borderRadius: 16, background: `${colors.success}10`, marginBottom: "1.5rem", border: `1px solid ${colors.success}30` }}>
              <CheckCircle2 style={{ width: 32, height: 32, color: colors.success, margin: "0 auto 0.5rem" }} />
              <h3 style={{ fontWeight: 700, color: colors.success, fontSize: "1rem" }}>Lesson Already Completed</h3>
              <p style={{ color: colors.textMuted, fontSize: "0.875rem", marginTop: "0.25rem" }}>You've already earned XP for this lesson. Review the content below!</p>
            </div>
          )}

          {/* Content blocks */}
          {lesson.contentBlocks && lesson.contentBlocks.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {(lesson.contentBlocks as any[]).map((block: any, i: number) => (
                <ContentBlock key={i} block={block} />
              ))}
            </div>
          ) : (
            <div style={{ ...ds.card, textAlign: "center", padding: "3rem 2rem" }}>
              <BookOpen style={{ width: 40, height: 40, color: colors.textMuted, margin: "0 auto 1rem", opacity: 0.3 }} />
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: colors.text, marginBottom: "0.5rem" }}>Lesson content coming soon</h3>
              <p style={{ color: colors.textMuted, fontSize: "0.9375rem" }}>This lesson is being prepared. Check back soon!</p>
            </div>
          )}

          {/* Bottom complete button */}
          {!completed && lesson.contentBlocks && lesson.contentBlocks.length > 0 && (
            <div style={{ marginTop: "2rem", textAlign: "center" }}>
              <button onClick={handleComplete} disabled={completing} style={{ ...ds.btnPrimary, padding: "0.875rem 2rem", fontSize: "1rem", opacity: completing ? 0.6 : 1 }}>
                {completing ? (
                  <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    <span style={{ width: 16, height: 16, border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />
                    Completing...
                  </span>
                ) : (
                  <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    Complete Lesson
                    {xp && <span style={{ background: "rgba(255,255,255,0.2)", padding: "0.125rem 0.5rem", borderRadius: 6, fontSize: "0.8125rem", display: "flex", alignItems: "center", gap: "0.25rem" }}><Zap style={{ width: 12, height: 12 }} /> +{xp} XP</span>}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Review mode: exit button */}
          {completed && (
            <div style={{ marginTop: "2rem", textAlign: "center" }}>
              <button onClick={() => { setViewing(false); setShowCelebration(false); }} style={{ ...ds.btnSecondary, padding: "0.75rem 1.5rem", fontSize: "0.937rem" }}>
                <ArrowLeft style={{ width: 16, height: 16 }} /> Back to Quest
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Lesson landing page
  return (
    <div style={{ minHeight: "100vh", background: colors.bg }}>
      <header style={{ background: "rgba(253,253,251,0.85)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${colors.border}`, padding: "0.75rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 10 }}>
        <Link href="/dashboard/student" style={{ display: "flex", alignItems: "center", gap: "0.75rem", textDecoration: "none" }}>
          <Sparkles style={{ width: 28, height: 28, color: colors.primary }} />
          <span style={{ fontWeight: 800, fontSize: "1.125rem", ...ds.textGradient }}>Arizen School</span>
        </Link>
        <button onClick={() => nextAuthSignOut({ callbackUrl: "/" })} style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.375rem 0.75rem", borderRadius: 8, border: `1px solid ${colors.border}`, background: "none", color: colors.textMuted, cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600 }}>
          <LogOut style={{ width: 14, height: 14 }} /> Exit
        </button>
      </header>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1.5rem" }}>
        <Link href={slugs ? `/dashboard/student/lessons/${slugs.themeSlug}/${slugs.questSlug}` : "/dashboard/student/lessons"} style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: colors.textMuted, fontSize: "0.875rem", fontWeight: 600, textDecoration: "none", marginBottom: "1rem" }}>
          <ArrowLeft style={{ width: 16, height: 16 }} /> Back to Quest
        </Link>

        <div style={{ padding: "1.5rem", borderRadius: 16, background: gradients.primary, color: "white", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
            {lesson.isCompleted && <span style={{ fontSize: "0.6875rem", fontWeight: 700, background: "rgba(255,255,255,0.2)", padding: "0.125rem 0.5rem", borderRadius: 6 }}>✓ COMPLETED</span>}
            {lesson.difficulty && <span style={{ fontSize: "0.6875rem", fontWeight: 700, background: "rgba(255,255,255,0.2)", padding: "0.125rem 0.5rem", borderRadius: 6 }}>{lesson.difficulty}</span>}
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>{lesson.title}</h1>
          {lesson.description && <p style={{ opacity: 0.9, fontSize: "0.9375rem" }}>{lesson.description}</p>}
        </div>

        {/* XP reward card */}
        {xp && !completed && (
          <div style={{ ...ds.card, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.25rem", marginBottom: "1.5rem", background: colors.warmSoft }}>
            <p style={{ fontWeight: 700, color: colors.warmDark, fontSize: "0.9375rem" }}>Complete this lesson to earn XP</p>
            <span style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontWeight: 800, color: colors.warm, fontSize: "1.125rem" }}>
              <Zap style={{ width: 18, height: 18 }} /> +{xp} XP
            </span>
          </div>
        )}

        {completed && (
          <div style={{ ...ds.card, textAlign: "center", padding: "1.5rem", marginBottom: "1.5rem", background: `${colors.success}10`, border: `1px solid ${colors.success}30` }}>
            <CheckCircle2 style={{ width: 32, height: 32, color: colors.success, margin: "0 auto 0.5rem" }} />
            <p style={{ fontWeight: 700, color: colors.success }}>You've completed this lesson!</p>
            <p style={{ color: colors.textMuted, fontSize: "0.875rem", marginTop: "0.25xp" }}>Review the content or move on to the next lesson.</p>
          </div>
        )}

        {/* Content preview */}
        {lesson.contentBlocks && lesson.contentBlocks.length > 0 && (
          <div style={{ ...ds.card, marginBottom: "1.5rem" }}>
            <h3 style={{ fontWeight: 700, color: colors.text, fontSize: "1rem", marginBottom: "0.75rem" }}>What you'll learn</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {(lesson.contentBlocks as any[]).slice(0, 3).map((block: any, i: number) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: colors.textMuted }}>
                  <div style={{ width: 20, height: 20, borderRadius: 6, background: colors.primarySoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontWeight: 700, color: colors.primary, fontSize: "0.6875rem" }}>{i + 1}</span>
                  </div>
                  {block.title || block.heading || block.text?.slice(0, 40) || `Section ${i + 1}`}
                </div>
              ))}
              {lesson.contentBlocks.length > 3 && (
                <span style={{ fontSize: "0.75rem", color: colors.textMuted }}>+{lesson.contentBlocks.length - 3} more sections</span>
              )}
            </div>
          </div>
        )}

        {/* Start/Continue button */}
        <button onClick={() => setViewing(true)} style={{ ...ds.btnPrimary, width: "100%", padding: "1rem", fontSize: "1rem" }}>
          {completed ? "Review Lesson" : lesson.progress > 0 ? "Continue Lesson" : "Start Lesson"}
        </button>
      </main>
    </div>
  );
}

function ContentBlock({ block }: { block: any }) {
  if (!block || typeof block !== "object") return null;
  const type = block.type || block.blockType || "text";

  switch (type) {
    case "heading":
    case "h1":
      return <h1 style={{ fontSize: "1.375rem", fontWeight: 800, color: colors.text, marginBottom: "0.5rem" }}>{block.text || block.content || block.title}</h1>;
    case "h2":
    case "subheading":
      return <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: colors.text, marginBottom: "0.5rem", marginTop: "1rem" }}>{block.text || block.content || block.title}</h2>;
    case "h3":
      return <h3 style={{ fontSize: "1rem", fontWeight: 700, color: colors.text, marginBottom: "0.375rem", marginTop: "0.75rem" }}>{block.text || block.content || block.title}</h3>;
    case "paragraph":
    case "text":
      return <p style={{ color: colors.text, lineHeight: 1.7, fontSize: "0.9375rem" }}>{block.text || block.content || block.body || ""}</p>;
    case "image":
      return (
        <div style={{ borderRadius: 12, overflow: "hidden", background: colors.bgAlt }}>
          {block.url && <img src={block.url} alt={block.alt || block.caption || ""} style={{ width: "100%", height: "auto", display: "block" }} />}
          {block.caption && <p style={{ padding: "0.75rem", fontSize: "0.8125rem", color: colors.textMuted, textAlign: "center" }}>{block.caption}</p>}
        </div>
      );
    case "video":
      return (
        <div style={{ borderRadius: 12, overflow: "hidden", background: "#000" }}>
          {block.url && <video src={block.url} controls style={{ width: "100%", display: "block" }} />}
        </div>
      );
    case "list":
      return (
        <ul style={{ paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.375rem" }}>
          {(block.items || []).map((item: string, i: number) => (
            <li key={i} style={{ color: colors.text, fontSize: "0.9375rem", lineHeight: 1.6 }}>{item}</li>
          ))}
        </ul>
      );
    case "quiz":
      return (
        <div style={{ ...ds.card, padding: "1.25rem", background: colors.primarySoft }}>
          <h4 style={{ fontWeight: 700, color: colors.primary, marginBottom: "0.75rem", fontSize: "0.9375rem" }}>❓ {block.question || "Quick Check"}</h4>
          {(block.options || []).map((opt: string, i: number) => (
            <div key={i} style={{ padding: "0.625rem 0.875rem", borderRadius: 8, border: `1px solid ${colors.border}`, marginBottom: "0.375rem", fontSize: "0.875rem", color: colors.text }}>
              {String.fromCharCode(65 + i)}. {opt}
            </div>
          ))}
        </div>
      );
    case "callout":
    case "tip":
      return (
        <div style={{ padding: "1rem", borderRadius: 12, background: colors.warmSoft, borderLeft: `4px solid ${colors.warm}` }}>
          <p style={{ color: colors.warmDark, fontSize: "0.875rem", fontWeight: 600 }}>💡 {block.title || block.text || block.content || ""}</p>
        </div>
      );
    default: {
      const text = block.text || block.content || block.body || block.title || "";
      if (text) return <p style={{ color: colors.text, lineHeight: 1.7, fontSize: "0.9375rem" }}>{text}</p>;
      return null;
    }
  }
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: colors.bg }}>
      <div style={{ textAlign: "center" }}>
        <Sparkles style={{ width: 48, height: 48, color: colors.primary, margin: "0 auto 1rem" }} />
        <p style={{ color: colors.textMuted, fontWeight: 600 }}>Loading lesson...</p>
      </div>
    </div>
  );
}

function NotFoundScreen() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: colors.bg }}>
      <div style={{ textAlign: "center", ...ds.card, padding: "2rem" }}>
        <BookOpen style={{ width: 40, height: 40, color: colors.textMuted, margin: "0 auto 1rem" }} />
        <h3 style={{ fontWeight: 700, color: colors.text, marginBottom: "0.5rem" }}>Lesson not found</h3>
        <p style={{ color: colors.textMuted }}>This lesson may not exist or isn't published yet.</p>
        <Link href="/dashboard/student/lessons" style={{ ...ds.btnPrimary, display: "inline-flex", textDecoration: "none", marginTop: "1rem" }}>Back to Themes</Link>
      </div>
    </div>
  );
}

