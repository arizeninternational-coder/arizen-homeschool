"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { signOut as nextAuthSignOut } from "next-auth/react";
import {
  Sparkles, ArrowLeft, CheckCircle2, Zap, LogOut, BookOpen, Flame, Award
} from "lucide-react";
import { PageHeader, SectionHeader, GradientButton, ProgressBar, EmptyStateCard } from "@/components/ui/Pill";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils/cn";

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
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#2DD4BF", "#F59E0B", "#3B82F6", "#EC4899", "#10B981"],
    });
    setTimeout(() => {
      confetti({
        particleCount: 40,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ["#2DD4BF", "#F59E0B", "#3B82F6"],
      });
    }, 150);
    setTimeout(() => {
      confetti({
        particleCount: 40,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ["#EC4899", "#10B981", "#F59E0B"],
      });
    }, 300);
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
      const res = await fetch("/api/learner/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          lessonId: lesson?.id,
          questId: slugs.questSlug || null,
          action: "complete",
        }),
      });
      const data = await res.json();
      if (data.success || data.completed) {
        const xp = data.rewards?.xp || 0;
        const coins = data.rewards?.coins || 0;
        const streak = data.streak || 0;

        setCompleted(true);
        setXpEarned(xp);
        setStreakBonus(streak);
        setShowCelebration(true);

        fireConfetti();
        animateXpCounter(xp, streak);
      } else if (data.alreadyCompleted) {
        setCompleted(true);
        setShowCelebration(false);
      }
    } catch (err) {
      console.error("Complete lesson error:", err);
    } finally {
      setCompleting(false);
    }
  }, [slugs, completing, lesson?.id, fireConfetti, animateXpCounter]);

  const totalXpWithBonus = xpEarned + streakBonus;

  const xp = typeof lesson?.xpReward === "object" ? (lesson?.xpReward as any)?.base : lesson?.xpReward;

  // Lesson viewer overlay
  if (viewing) {
    return (
      <div className="fixed inset-0 z-50 bg-bg-main flex flex-col">
        {/* Sticky header */}
        <div className="bg-white/90 backdrop-blur-xl border-b border-border-soft px-4 lg:px-6 py-3 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setViewing(false); setShowCelebration(false); }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border-soft hover:bg-bg-main text-text-muted font-semibold text-sm transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Exit
            </button>
            <span className="font-bold text-text text-sm lg:text-base truncate max-w-[200px] lg:max-w-none">{lesson?.title}</span>
          </div>
          {!completed && (
            <GradientButton
              variant="success"
              size="sm"
              onClick={handleComplete}
              disabled={completing}
            >
              {completing ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full spinner" />
                  Completing...
                </span>
              ) : "Mark Complete"}
            </GradientButton>
          )}
          {completed && (
            <span className="inline-flex items-center gap-1.5 font-bold text-secondary text-sm">
              <CheckCircle2 className="w-[18px] h-[18px]" /> Completed
            </span>
          )}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-auto p-4 lg:p-8 max-w-[760px] mx-auto w-full">
          {/* Celebration overlay */}
          {showCelebration && totalXpWithBonus > 0 && (
            <div
              className="relative rounded-[1.5rem] p-8 mb-6 text-center overflow-hidden border-2 border-primary/20"
              style={{ background: "linear-gradient(135deg, #EEF2FF 0%, #FFF7ED 50%, #FFF1F2 100%)" }}
            >
              <style>{celebrationStyles}</style>
              {/* Animated background particles */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="absolute text-2xl" style={{
                    left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 25}%`,
                    animation: `float ${2 + i * 0.5}s ease-in-out infinite alternate`,
                    animationDelay: `${i * 0.2}s`
                  }}>
                    {["⭐", "✨", "🎉", "💫", "🌟", "⚡"][i]}
                  </div>
                ))}
              </div>

              <div className="relative z-10">
                <div className="text-5xl mb-2">🎉</div>
                <h2 className="text-2xl font-extrabold text-text mb-2">Lesson Complete!</h2>

                {/* Animated XP display */}
                <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
                  <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white shadow-[0_4px_15px_rgba(79,70,229,0.10)]" style={{ animation: "xpBurst 0.5s ease-out" }}>
                    <Zap className="w-5 h-5 text-primary" />
                    <span className="text-xl font-extrabold text-primary">+{animatedXp}</span>
                    <span className="text-sm font-semibold text-text-muted">XP</span>
                  </div>
                  {streakBonus > 0 && (
                    <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-pink-soft shadow-[0_4px_15px_rgba(255,92,138,0.10)]">
                      <Flame className="w-5 h-5 text-pink" />
                      <span className="text-xl font-extrabold text-pink">+{streakBonus}</span>
                      <span className="text-sm font-semibold text-pink">streak</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* New badges earned */}
          {showCelebration && newBadges.length > 0 && (
            <div className="mb-6">
              <h3 className="text-base font-bold text-text mb-3 flex items-center gap-1.5">
                <Award className="w-[18px] h-[18px] text-accent-purple" /> New Badge{newBadges.length > 1 ? "s" : ""} Earned!
              </h3>
              <div className="flex gap-3 flex-wrap">
                {newBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className="rounded-2xl border-2 border-accent-purple/20 bg-accent-purple-soft/40 p-3.5 flex items-center gap-2.5"
                    style={{ animation: "popIn 0.4s ease-out" }}
                  >
                    <span className="text-2xl">🏅</span>
                    <div>
                      <div className="font-bold text-text text-sm">{badge.name}</div>
                      <div className="text-xs text-text-muted">New badge earned!</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Already completed state (no celebration) */}
          {completed && !showCelebration && (
            <div className="text-center rounded-2xl p-6 mb-6 border border-secondary/20 bg-secondary-soft/40">
              <CheckCircle2 className="w-8 h-8 text-secondary mx-auto mb-2" />
              <h3 className="font-bold text-secondary text-base">Lesson Already Completed</h3>
              <p className="text-text-muted text-sm mt-1">You've already earned XP for this lesson. Review the content below!</p>
            </div>
          )}

          {/* Content blocks */}
          {lesson?.contentBlocks && lesson.contentBlocks.length > 0 ? (
            <div className="flex flex-col gap-4">
              {(() => {
                // Group content blocks so headings and their body content share the same card
                const cardGroups: { heading?: typeof lesson.contentBlocks extends (infer T)[] ? T : never; items: typeof lesson.contentBlocks }[] = [];
                let currentGroup: typeof cardGroups[number] | null = null;

                (lesson.contentBlocks as any[]).forEach((block: any) => {
                  const type = block?.type || block?.blockType || "text";
                  if (type === "heading" || type === "h1" || type === "h2" || type === "h3" || type === "subheading") {
                    if (currentGroup) cardGroups.push(currentGroup);
                    currentGroup = { heading: block, items: [] };
                  } else {
                    if (!currentGroup) currentGroup = { items: [] };
                    currentGroup.items.push(block);
                  }
                });
                if (currentGroup) cardGroups.push(currentGroup);

                return cardGroups.map((group, i) => (
                  <div key={i} className="rounded-2xl border border-border-soft bg-white p-5 lg:p-6">
                    {group.heading && <ContentBlock block={group.heading} isHeading />}
                    <div className="flex flex-col gap-4">
                      {group.items.map((block, j) => (
                        <ContentBlock key={j} block={block} />
                      ))}
                    </div>
                  </div>
                ));
              })()}
            </div>
          ) : (
            <div className="rounded-2xl border border-border-soft bg-white text-center p-12">
              <BookOpen className="w-10 h-10 text-text-muted/30 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-text mb-2">Lesson content coming soon</h3>
              <p className="text-text-muted text-sm">This lesson is being prepared. Check back soon!</p>
            </div>
          )}

          {/* Bottom complete button */}
          {!completed && lesson?.contentBlocks && lesson.contentBlocks.length > 0 && (
            <div className="mt-6">
              <GradientButton
                variant="success"
                size="lg"
                icon={<CheckCircle2 className="w-5 h-5" />}
                onClick={handleComplete}
                disabled={completing}
                className="w-full"
              >
                {completing ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full spinner" />
                    Completing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Complete Lesson
                    {xp && (
                      <span className="bg-white/20 px-2.5 py-0.5 rounded-lg text-xs font-bold flex items-center gap-1">
                        <Zap className="w-3 h-3" /> +{xp} XP
                      </span>
                    )}
                  </span>
                )}
              </GradientButton>
            </div>
          )}

          {/* Review mode: exit button */}
          {completed && (
            <div className="mt-6">
              <GradientButton
                variant="secondary"
                size="md"
                icon={<ArrowLeft className="w-4 h-4" />}
                onClick={() => { setViewing(false); setShowCelebration(false); }}
                className="w-full"
              >
                Back to Quest
              </GradientButton>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Lesson landing page (outside overlay)
  return (
    <div className="fade-in max-w-[760px] mx-auto">
      {/* ── Decorative gradient header ── */}
      <div
        className="relative rounded-[1.75rem] p-6 lg:p-8 mb-6 overflow-hidden border border-primary/20"
        style={{ background: "linear-gradient(135deg, #4F46E5 0%, #8B5CF6 50%, #6D28D9 100%)" }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-white/5" />
        </div>

        <div className="relative z-10">
          {slugs && (
            <Link
              href={`/dashboard/student/lessons/${slugs.themeSlug}/${slugs.questSlug}`}
              className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-semibold mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Quest
            </Link>
          )}

          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {lesson?.isCompleted && (
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 text-white px-2.5 py-1 rounded-full">
                ✓ Completed
              </span>
            )}
            {lesson?.difficulty && (
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 text-white px-2.5 py-1 rounded-full">
                {lesson.difficulty}
              </span>
            )}
            {xp && (
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-gold/80 text-white px-2.5 py-1 rounded-full flex items-center gap-1">
                <Zap className="w-3 h-3" /> {xp} XP
              </span>
            )}
          </div>

          <h1 className="text-2xl lg:text-3xl font-extrabold text-white mb-2 tracking-tight">{lesson?.title}</h1>
          {lesson?.description && (
            <p className="text-white/85 text-base leading-relaxed">{lesson.description}</p>
          )}
        </div>
      </div>

      {/* ── XP reward card ── */}
      {xp && !completed && (
        <div className="rounded-2xl border border-gold/20 bg-gold-soft/50 p-4 mb-5 flex items-center justify-between">
          <p className="font-bold text-gold-dark text-sm">Complete this lesson to earn XP</p>
          <span className="inline-flex items-center gap-1.5 font-extrabold text-gold text-base">
            <Zap className="w-[18px] h-[18px]" /> +{xp} XP
          </span>
        </div>
      )}

      {/* ── Completed state ── */}
      {completed && (
        <div className="rounded-2xl border border-secondary/20 bg-secondary-soft/40 text-center p-6 mb-5">
          <CheckCircle2 className="w-8 h-8 text-secondary mx-auto mb-2" />
          <p className="font-bold text-secondary">You've completed this lesson!</p>
          <p className="text-text-muted text-sm mt-1">Review the content or move on to the next lesson.</p>
        </div>
      )}

      {/* ── Content preview ── */}
      {lesson?.contentBlocks && lesson.contentBlocks.length > 0 && (
        <div className="rounded-2xl border border-border-soft bg-white p-5 lg:p-6 mb-5">
          <h3 className="font-extrabold text-text text-base mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" /> What you'll learn
          </h3>
          <div className="flex flex-col gap-3">
            {(lesson.contentBlocks as any[]).slice(0, 3).map((block: any, i: number) => (
              <div key={i} className="flex items-center gap-3 text-sm text-text-muted">
                <div className="w-7 h-7 rounded-xl bg-primary-soft flex items-center justify-center flex-shrink-0">
                  <span className="font-extrabold text-primary text-xs">{i + 1}</span>
                </div>
                <span className="truncate">
                  {block.title || block.heading || block.text?.slice(0, 40) || `Section ${i + 1}`}
                </span>
              </div>
            ))}
            {lesson.contentBlocks.length > 3 && (
              <span className="text-xs text-text-muted font-semibold pl-10">
                +{lesson.contentBlocks.length - 3} more sections
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Start/Continue button ── */}
      <GradientButton
        variant={completed ? "secondary" : "primary"}
        size="lg"
        icon={completed ? <BookOpen className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
        onClick={async () => {
          if (lesson?.id) {
            try {
              await fetch("/api/learner/progress", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ lessonId: lesson.id, action: "start" }),
              });
            } catch (e) { /* non-blocking */ }
          }
          setViewing(true);
        }}
        className="w-full"
      >
        {completed ? "Review Lesson" : "Start Lesson"}
      </GradientButton>
    </div>
  );
}

function ContentBlock({ block, isHeading }: { block: any; isHeading?: boolean }) {
  if (!block || typeof block !== "object") return null;
  const type = block.type || block.blockType || "text";

  switch (type) {
    case "heading":
    case "h1":
      return <h1 className="text-xl font-extrabold text-text mb-0">{block.text || block.content || block.title}</h1>;
    case "h2":
    case "subheading":
      return <h2 className="text-lg font-bold text-text mb-0">{block.text || block.content || block.title}</h2>;
    case "h3":
      return <h3 className="text-base font-bold text-text mb-0">{block.text || block.content || block.title}</h3>;
    case "paragraph":
    case "text":
      return <p className="text-text leading-[1.7] text-sm">{block.text || block.content || block.body || ""}</p>;
    case "image":
      return (
        <div className="rounded-2xl overflow-hidden bg-bg-main">
          {block.url && <img src={block.url} alt={block.alt || block.caption || ""} className="w-full h-auto block" />}
          {block.caption && <p className="p-3 text-xs text-text-muted text-center">{block.caption}</p>}
        </div>
      );
    case "video":
      return (
        <div className="rounded-2xl overflow-hidden bg-black">
          {block.url && <video src={block.url} controls className="w-full block" />}
        </div>
      );
    case "list":
      return (
        <ul className="pl-5 flex flex-col gap-1.5">
          {(block.items || []).map((item: string, i: number) => (
            <li key={i} className="text-text text-sm leading-relaxed">{item}</li>
          ))}
        </ul>
      );
    case "quiz":
      return (
        <div className="rounded-2xl border border-primary/20 bg-primary-soft/40 p-5">
          <h4 className="font-bold text-primary mb-3 text-sm">❓ {block.question || "Quick Check"}</h4>
          {(block.options || []).map((opt: string, i: number) => (
            <div key={i} className="px-3.5 py-2.5 rounded-xl border border-border-soft mb-1.5 text-sm text-text last:mb-0">
              {String.fromCharCode(65 + i)}. {opt}
            </div>
          ))}
        </div>
      );
    case "callout":
    case "tip":
      return (
        <div className="rounded-2xl p-4 bg-gold-soft/50 border-l-4 border-gold">
          <p className="text-gold-dark text-sm font-semibold">💡 {block.title || block.text || block.content || ""}</p>
        </div>
      );
    default: {
      const text = block.text || block.content || block.body || block.title || "";
      if (text) return <p className="text-text leading-[1.7] text-sm">{text}</p>;
      return null;
    }
  }
}
