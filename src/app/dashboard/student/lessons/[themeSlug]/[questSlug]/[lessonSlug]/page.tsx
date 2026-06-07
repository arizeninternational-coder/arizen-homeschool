"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Sparkles, ArrowLeft, CheckCircle2, Zap, LogOut, BookOpen, Flame, Award
} from "lucide-react";
import { GradientButton, ProgressBar } from "@/components/ui/Pill";
import confetti from "canvas-confetti";
import {
  type JourneyStep,
  type JourneyStepType,
  STEP_TYPE_ICONS,
  buildUniversalJourney,
} from "@/lib/curriculum/lesson-journey";

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
  contentBlocks: any;
  difficulty?: string;
  xpReward?: { base: number } | number;
  progress: number;
  isCompleted: boolean;
  quest?: { id: string; title: string; slug: string; theme?: { grade?: number; themeSubjects?: { subject: string }[] } };
}

function buildLessonJourney(lesson: any): { steps: JourneyStep[]; source: string } | null {
  if (!lesson?.id) return null;
  // Extract subject and grade from the joined quest/theme data
  const subject = lesson.quest?.theme?.themeSubjects?.[0]?.subject || "";
  const grade = lesson.quest?.theme?.grade || 0;
  return buildUniversalJourney(
    lesson.id,
    lesson.title || "Lesson",
    lesson.contentBlocks,
    {
      subject,
      grade,
      xpReward: getRewardValue(lesson?.xpReward),
      coinReward: lesson?.coinReward,
    }
  );
}

// Keep getRewardValue here since it's also used by the completion handler

/**
 * Safely extract a numeric reward value from any storage shape.
 * Handles: number, "12", '{"base":12}', { base: 12 }, null/undefined
 */
function getRewardValue(value: any): number {
  if (typeof value === "number") return value;
  if (!value) return 0;
  if (typeof value === "string") {
    const num = Number(value);
    if (!isNaN(num) && value.trim() !== "") return num;
    try {
      return getRewardValue(JSON.parse(value));
    } catch {
      return 0;
    }
  }
  if (typeof value === "object") {
    return value?.base ?? value?.amount ?? value?.value ?? 0;
  }
  return 0;
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
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [animatedXp, setAnimatedXp] = useState(0);
  const [completeError, setCompleteError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
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
    if (!slugs || completing || completed) return;
    setCompleting(true);
    setCompleteError(null);
    try {
      // Use lesson's questId from the API response, falling back to the URL questSlug
      const questId = (lesson as any)?.questId || slugs.questSlug || null;

      const res = await fetch("/api/learner/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          lessonId: lesson?.id,
          questId,
          action: "complete",
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        const detail = data.error || data.message || "";
        setCompleteError(detail || `Could not complete lesson (status ${res.status})`);
        return;
      }

      if (data.success || data.completed) {
        const xp = getRewardValue(data.rewards?.xp);
        const streak = data.streak || 0;

        setCompleted(true);
        setXpEarned(xp);
        setStreakBonus(streak);
        setShowCelebration(true);

        // Track newly unlocked badges
        if (data.newBadges && data.newBadges.length > 0) {
          setNewBadges(data.newBadges);
        }

        fireConfetti();
        animateXpCounter(xp, streak);
      } else if (data.alreadyCompleted) {
        setCompleted(true);
        setShowCelebration(false);
      } else {
        setCompleteError("Unexpected response. Please try again.");
      }
    } catch (err) {
      console.error("Complete lesson error:", err);
      setCompleteError("Network error. Please check your connection and try again.");
    } finally {
      setCompleting(false);
    }
  }, [slugs, completing, completed, lesson, fireConfetti, animateXpCounter]);

  const totalXpWithBonus = xpEarned + streakBonus;

  const xp = getRewardValue(lesson?.xpReward);

  // Build journey: handles AI journey, old array, and structured CBC
  const journey = buildLessonJourney(lesson);
  const journeySteps = journey?.steps || [];
  const journeySource = journey?.source || "cbc_fallback";

  // Determine if we have a valid journey (5+ steps from structured CBC data)
  // Old array contentBlocks with fewer steps use stacked rendering
  const isJourney = journeySteps.length >= 5 && journeySource !== "legacy_array";
  const totalSteps = journeySteps.length;
  const isLastStep = currentStep >= totalSteps - 1;
  const clampedStep = Math.min(currentStep, Math.max(totalSteps - 1, 0));
  const currentJourneyStep = isJourney && totalSteps > 0 ? journeySteps[clampedStep] : null;

  // Derive renderBlocks from journey steps for progress bar and content preview
  // This replaces the old normalizeContentBlocks output
  const renderBlocks = journeySteps.map((s) => ({
    title: s.title,
    heading: s.title,
    text: s.studentText,
    stepType: s.stepType,
  }));

  // Lesson viewer overlay
  if (viewing) {
    return (
      <div className="fixed inset-0 z-50 bg-bg-main flex flex-col">
        {/* Sticky header */}
        <div className="bg-white/90 backdrop-blur-xl border-b border-white/40 px-4 lg:px-6 py-3 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setViewing(false); setShowCelebration(false); setCurrentStep(0); }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border-soft hover:bg-bg-main text-text-muted font-semibold text-sm transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Exit
            </button>
            <span className="font-bold text-text text-sm lg:text-base truncate max-w-[200px] lg:max-w-none">{lesson?.title}</span>
          </div>
          {/* Only show Mark Complete in header on last step for journey mode, or always for array mode */}
          {!completed && (!isJourney || isLastStep) && (
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

        {/* Step progress bar (journey mode only) */}
        {isJourney && totalSteps > 0 && (
          <div className="px-4 lg:px-8 pt-3 pb-1 max-w-[760px] mx-auto w-full">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-text-muted">Step {clampedStep + 1} of {totalSteps}</span>
              {xp > 0 && (
                <span className="text-xs font-semibold text-text-muted flex items-center gap-1">
                  <Zap className="w-3 h-3" /> {xp} XP
                </span>
              )}
            </div>
            <div className="flex gap-1.5">
              {renderBlocks.map((_: any, i: number) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full flex-1 transition-all ${i <= clampedStep ? "bg-primary" : "bg-primary/15"}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Scrollable content */}
        <div className="flex-1 overflow-auto p-4 lg:p-8 max-w-[760px] mx-auto w-full">
          {/* Celebration overlay */}
          {showCelebration && totalXpWithBonus > 0 && (
            <div
              className="relative rounded-[1.5rem] p-8 mb-6 text-center overflow-hidden border-2 border-primary/20"
              style={{ background: "linear-gradient(135deg, #EEF2FF 0%, #FFF7ED 50%, #FFF1F2 100%)" }}
            >
              <style>{celebrationStyles}</style>
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
                {newBadges.map((badgeName, idx) => (
                  <div key={idx} className="rounded-2xl border-2 border-accent-purple/20 bg-accent-purple-soft/40 p-3.5 flex items-center gap-2.5" style={{ animation: "popIn 0.4s ease-out" }}>
                    <span className="text-2xl">🏅</span>
                    <div>
                      <div className="font-bold text-text text-sm">{badgeName}</div>
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

          {/* Journey steps — one at a time */}
          {isJourney && currentJourneyStep ? (
            <JourneyStepView step={currentJourneyStep} stepNumber={clampedStep + 1} totalSteps={totalSteps} />
          ) : journeySteps.length > 0 ? (
            /* Fallback: render all journey steps stacked */
            <div className="flex flex-col gap-4">
              {journeySteps.map((s, i) => (
                <JourneyStepView key={s.id} step={s} stepNumber={i + 1} totalSteps={journeySteps.length} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/60 bg-white/90 backdrop-blur-sm text-center p-12">
              <BookOpen className="w-10 h-10 text-text-muted/30 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-text mb-2">This lesson is being prepared</h3>
              <p className="text-text-muted text-sm">Please check back soon.</p>
            </div>
          )}

          {/* Completion error */}
          {completeError && (
            <div className="mt-4 rounded-xl border border-red-300 bg-red-50 p-4 text-center">
              <p className="text-sm font-semibold text-red-700">{completeError}</p>
              <button onClick={() => setCompleteError(null)} className="mt-2 text-xs text-red-500 underline hover:text-red-700">Dismiss</button>
            </div>
          )}

          {/* Completed state — show reflection prompt */}
          {completed && (
            <div className="mt-6 rounded-2xl border border-primary/20 bg-primary-soft/30 p-5 text-center">
              <CheckCircle2 className="w-10 h-10 text-secondary mx-auto mb-2" />
              <h3 className="font-bold text-text text-base mb-1">Lesson Complete! 🎉</h3>
              <p className="text-text-muted text-sm mb-4">Take a moment to write a reflection on what you learned.</p>
              <GradientButton variant="primary" size="md" icon={<BookOpen className="w-4 h-4" />} onClick={() => window.location.href = "/dashboard/student/reflections"}>
                Write a Reflection
              </GradientButton>
            </div>
          )}

          {/* Navigation buttons for journey mode */}
          {isJourney && renderBlocks.length > 0 && (
            <div className="mt-6 flex gap-3">
              {clampedStep > 0 ? (
                <GradientButton variant="secondary" size="lg" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => setCurrentStep(clampedStep - 1)} className="flex-1">
                  Previous
                </GradientButton>
              ) : (
                <div className="flex-1" />
              )}
              {!isLastStep ? (
                <GradientButton variant="primary" size="lg" onClick={() => setCurrentStep(clampedStep + 1)} className="flex-1">
                  Next
                </GradientButton>
              ) : !completed ? (
                <GradientButton variant="success" size="lg" icon={<CheckCircle2 className="w-5 h-5" />} onClick={handleComplete} disabled={completing} className="flex-1">
                  {completing ? (
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full spinner" />
                      Completing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Complete Lesson
                      {xp > 0 && (
                        <span className="bg-white/20 px-2.5 py-0.5 rounded-lg text-xs font-bold flex items-center gap-1">
                          <Zap className="w-3 h-3" /> +{xp} XP
                        </span>
                      )}
                    </span>
                  )}
                </GradientButton>
              ) : (
                <GradientButton variant="secondary" size="lg" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => { setViewing(false); setShowCelebration(false); setCurrentStep(0); }} className="flex-1">
                  Back to Quest
                </GradientButton>
              )}
            </div>
          )}

          {/* Bottom complete button for array mode (non-journey) */}
          {!isJourney && !completed && renderBlocks.length > 0 && (
            <div className="mt-6">
              <GradientButton variant="success" size="lg" icon={<CheckCircle2 className="w-5 h-5" />} onClick={handleComplete} disabled={completing} className="w-full">
                {completing ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full spinner" />
                    Completing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Complete Lesson
                    {xp > 0 && (
                      <span className="bg-white/20 px-2.5 py-0.5 rounded-lg text-xs font-bold flex items-center gap-1">
                        <Zap className="w-3 h-3" /> +{xp} XP
                      </span>
                    )}
                  </span>
                )}
              </GradientButton>
            </div>
          )}

          {/* Review mode: exit button (non-journey) */}
          {!isJourney && completed && (
            <div className="mt-6">
              <GradientButton variant="secondary" size="md" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => { setViewing(false); setShowCelebration(false); }} className="w-full">
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
            {lesson?.difficulty && (() => {
              const d = typeof lesson.difficulty === "string" ? lesson.difficulty : JSON.stringify(lesson.difficulty);
              const label = d.includes("{") ? (JSON.parse(d)?.level || d) : d;
              return (
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 text-white px-2.5 py-1 rounded-full">
                  {label}
                </span>
              );
            })()}
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

      {/* ── Content preview — only show when NO approved journey exists */}
      {!isJourney && renderBlocks.length > 0 && (
        <div className="rounded-2xl border border-white/60 bg-white/90 backdrop-blur-sm p-5 lg:p-6 mb-5">
          <h3 className="font-extrabold text-text text-base mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" /> What you'll learn
          </h3>
          <div className="flex flex-col gap-3">
            {renderBlocks.slice(0, 3).map((block: any, i: number) => (
              <div key={i} className="flex items-center gap-3 text-sm text-text-muted">
                <div className="w-7 h-7 rounded-xl bg-primary-soft flex items-center justify-center flex-shrink-0">
                  <span className="font-extrabold text-primary text-xs">{i + 1}</span>
                </div>
                <span className="truncate">
                  {block.title || block.heading || block.text?.slice(0, 40) || `Section ${i + 1}`}
                </span>
              </div>
            ))}
            {renderBlocks.length > 3 && (
              <span className="text-xs text-text-muted font-semibold pl-10">
                +{renderBlocks.length - 3} more sections
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Journey step count badge (when journey exists) */}
      {isJourney && (
        <div className="rounded-2xl border border-primary/20 bg-primary-soft/30 p-4 mb-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-primary">{totalSteps}-step interactive lesson</p>
            <p className="text-[10px] text-text-muted">Work through each step to complete the lesson</p>
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
          setCurrentStep(0);
          setViewing(true);
        }}
        className="w-full"
      >
        {completed ? "🔄 Review Lesson" : isJourney ? `🚀 Begin ${totalSteps}-Step Journey` : "📖 Start Lesson"}
      </GradientButton>
    </div>
  );
}

// Split long text into paragraphs for readability
function splitIntoParagraphs(text: string): string[] {
  if (!text) return [];
  // If text already has double newlines, split on those
  if (text.includes("\n\n")) return text.split("\n\n").filter(Boolean);
  // If text has single newlines, split on those
  if (text.includes("\n")) return text.split("\n").filter(Boolean);
  // For long single-paragraph text, split at ~200 chars on sentence boundaries
  if (text.length > 250) {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const paragraphs: string[] = [];
    let current = "";
    for (const s of sentences) {
      current += s;
      if (current.length > 200) {
        paragraphs.push(current.trim());
        current = "";
      }
    }
    if (current.trim()) paragraphs.push(current.trim());
    return paragraphs;
  }
  return [text];
}

// ── Journey Step View (new schema-based) ────────────────────────────────────

const STEP_THEME_COLORS: Record<JourneyStepType, { accent: string; bg: string; border: string; icon: string }> = {
  welcome:    { accent: "text-indigo-600", bg: "bg-indigo-50",   border: "border-indigo-200", icon: "🦉" },
  mission:    { accent: "text-violet-600",  bg: "bg-violet-50",   border: "border-violet-200", icon: "🎯" },
  think_first:{ accent: "text-amber-600",   bg: "bg-amber-50",    border: "border-amber-200",  icon: "💭" },
  learn:      { accent: "text-emerald-600", bg: "bg-emerald-50",  border: "border-emerald-200", icon: "📖" },
  connect:    { accent: "text-teal-600",    bg: "bg-teal-50",     border: "border-teal-200",    icon: "🔗" },
  example:    { accent: "text-cyan-600",    bg: "bg-cyan-50",     border: "border-cyan-200",    icon: "💡" },
  practice:   { accent: "text-sky-600",     bg: "bg-sky-50",      border: "border-sky-200",     icon: "✏️" },
  quick_check:{ accent: "text-lime-600",    bg: "bg-lime-50",     border: "border-lime-200",    icon: "✅" },
  reflect:    { accent: "text-rose-600",    bg: "bg-rose-50",     border: "border-rose-200",    icon: "🪞" },
  complete:   { accent: "text-yellow-600",  bg: "bg-yellow-50",   border: "border-yellow-200",  icon: "🏆" },
};

function JourneyStepView({ step, stepNumber, totalSteps }: { step: JourneyStep; stepNumber: number; totalSteps: number }) {
  const [selectedReflection, setSelectedReflection] = useState<number | null>(null);
  const [openResponse, setOpenResponse] = useState("");
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [selfChecked, setSelfChecked] = useState<boolean | null>(null);

  if (!step) return null;

  const theme = STEP_THEME_COLORS[step.stepType] || STEP_THEME_COLORS.welcome;
  const icon = STEP_TYPE_ICONS[step.stepType] || theme.icon;
  const paragraphs = splitIntoParagraphs(step.studentText);
  const isComplete = step.stepType === "complete";
  const hasApprovedVideo = step.video?.approvedUrl && step.video?.approvedByAdmin;

  return (
    <div className={`rounded-2xl border-2 ${theme.border} ${theme.bg} p-5 lg:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]`}>
      {/* Step header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg font-extrabold ${theme.bg} ${theme.accent} ring-2 ${theme.border} shadow-sm`}>
          {stepNumber}
        </div>
        <div className="flex-1">
          <h4 className={`font-extrabold text-base ${theme.accent} flex items-center gap-2`}>
            <span className="text-xl">{icon}</span> {step.title}
          </h4>
          <span className="text-[10px] font-semibold text-text-muted">Step {stepNumber} of {totalSteps}</span>
        </div>
      </div>

      {/* Owl teacher guide */}
      {step.owlText && (
        <div className="flex items-start gap-2.5 mb-4 px-4 py-3 rounded-xl bg-white/80 border border-white/60 shadow-sm">
          <span className="text-xl flex-shrink-0 mt-0.5">🦉</span>
          <p className="text-text text-xs font-medium leading-relaxed italic">{step.owlText}</p>
        </div>
      )}

      {/* Math display */}
      {step.mathDisplay && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
          <span className="text-lg font-mono font-bold text-slate-800">{step.mathDisplay}</span>
        </div>
      )}

      {/* Content paragraphs */}
      <div className="flex flex-col gap-3 mb-4">
        {paragraphs.map((p, i) => (
          <p key={i} className="text-text text-sm leading-relaxed">{p}</p>
        ))}
      </div>

      {/* Illustration placeholder */}
      {step.illustrationPrompt && (
        <div className="mb-4 rounded-xl bg-gradient-to-br from-indigo-50/80 to-purple-50/60 border border-indigo-200/40 p-4 flex flex-col items-center gap-2">
          <div className="w-full h-32 rounded-lg bg-white/60 border-2 border-dashed border-indigo-200 flex items-center justify-center">
            <span className="text-4xl">{icon}</span>
          </div>
          <p className="text-[10px] text-indigo-400 font-medium text-center">📸 Illustration: {step.illustrationPrompt}</p>
        </div>
      )}

      {/* Video placeholder — only for approved videos */}
      {hasApprovedVideo && (
        <div className="mb-4 rounded-xl bg-gradient-to-br from-blue-50/80 to-cyan-50/60 border border-blue-200/40 p-4 flex flex-col items-center gap-2">
          <div className="w-full h-36 rounded-lg bg-white/60 border-2 border-dashed border-blue-200 flex flex-col items-center justify-center gap-1">
            <span className="text-3xl">▶️</span>
            <span className="text-xs font-semibold text-blue-600">Video</span>
          </div>
          {step.video?.approvedUrl && (
            <a href={step.video.approvedUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-600 underline hover:text-blue-800">
              Watch video →
            </a>
          )}
        </div>
      )}

      {/* Video search keywords (admin-only info, not shown to students) */}
      {/* Search keywords are for admin reference only — not rendered to students */}

      {/* Materials list */}
      {step.materials && step.materials.length > 0 && (
        <div className="mt-3 px-4 py-3 rounded-xl bg-amber-50/60 border border-amber-200/50">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 mb-1.5">🧰 What you might need:</p>
          <div className="flex flex-wrap gap-1.5">
            {step.materials.map((m: string, i: number) => (
              <span key={i} className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-semibold">
                {m}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Interactive: Multiple choice */}
      {step.interaction?.type === "multiple_choice" && step.interaction.question && (
        <div className="mt-3 px-4 py-3 rounded-xl bg-blue-50/60 border border-blue-200/50">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 mb-1">🔘 Choose one:</p>
          <p className="text-sm font-medium text-blue-900 mb-2">{step.interaction.question}</p>
          {step.interaction.options && step.interaction.options.length > 0 && (
            <div className="flex flex-col gap-2">
              {step.interaction.options.map((opt: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedChoice(i)}
                  className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedChoice === i
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-white border border-blue-200 text-blue-800 hover:bg-blue-50"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
          {step.interaction.hint && (
            <p className="text-[11px] text-blue-600 mt-2 italic">💡 Hint: {step.interaction.hint}</p>
          )}
        </div>
      )}

      {/* Interactive: Open response */}
      {step.interaction?.type === "open_response" && step.interaction.question && (
        <div className="mt-3 px-4 py-3 rounded-xl bg-blue-50/60 border border-blue-200/50">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 mb-1">✏️ Your answer:</p>
          <p className="text-sm font-medium text-blue-900 mb-2">{step.interaction.question}</p>
          <textarea
            value={openResponse}
            onChange={e => setOpenResponse(e.target.value)}
            placeholder="Type your answer here..."
            className="w-full px-3 py-2 rounded-lg border border-blue-200 bg-white text-sm text-text placeholder:text-text-muted/50 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
            rows={3}
          />
        </div>
      )}

      {/* Interactive: Self check */}
      {step.interaction?.type === "self_check" && step.interaction.question && (
        <div className="mt-3 px-4 py-3 rounded-xl bg-lime-50/60 border border-lime-200/50">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-lime-700 mb-1">✅ Check yourself:</p>
          <p className="text-sm font-medium text-lime-900 mb-2">{step.interaction.question}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setSelfChecked(true)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                selfChecked === true ? "bg-lime-600 text-white" : "bg-white border border-lime-200 text-lime-700 hover:bg-lime-50"
              }`}
            >✓ Yes, I got it!</button>
            <button
              onClick={() => setSelfChecked(false)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                selfChecked === false ? "bg-orange-500 text-white" : "bg-white border border-orange-200 text-orange-600 hover:bg-orange-50"
              }`}
            >↺ I need more practice</button>
          </div>
          {step.interaction.hint && (
            <p className="text-[11px] text-lime-600 mt-2 italic">💡 Hint: {step.interaction.hint}</p>
          )}
        </div>
      )}

      {/* Interactive: Draw or use objects */}
      {step.interaction?.type === "draw_or_use_objects" && (
        <div className="mt-3 px-4 py-3 rounded-xl bg-orange-50/60 border border-orange-200/50">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-orange-700 mb-1">🎨 Try it with objects or drawings:</p>
          {step.interaction.question && (
            <p className="text-sm font-medium text-orange-900">{step.interaction.question}</p>
          )}
          {!step.interaction.question && (
            <p className="text-sm font-medium text-orange-900">Use objects at home — like counters, bottle tops, fruits, or drawings — to try this yourself!</p>
          )}
        </div>
      )}

      {/* Interactive: Offline activity */}
      {step.interaction?.type === "offline_activity" && (
        <div className="mt-3 px-4 py-3 rounded-xl bg-teal-50/60 border border-teal-200/50">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 mb-1">🏠 Offline activity:</p>
          {step.interaction.question && (
            <p className="text-sm font-medium text-teal-900">{step.interaction.question}</p>
          )}
          <p className="text-xs text-teal-600 mt-1">Put your device aside and try this with real objects at home.</p>
        </div>
      )}

      {/* Interactive: Parent assisted */}
      {step.interaction?.type === "parent_assisted" && (
        <div className="mt-3 px-4 py-3 rounded-xl bg-purple-50/60 border border-purple-200/50">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 mb-1">👨‍👩‍👧 Try with a parent or guardian:</p>
          {step.interaction.question && (
            <p className="text-sm font-medium text-purple-900">{step.interaction.question}</p>
          )}
        </div>
      )}

      {/* Reflection options — selectable chips */}
      {step.reflectionOptions && step.reflectionOptions.length > 0 && (
        <div className="mt-3 px-4 py-3 rounded-xl bg-rose-50/60 border border-rose-200/50">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700 mb-2">🪞 How did this lesson feel? Tap one:</p>
          <div className="flex flex-wrap gap-1.5">
            {step.reflectionOptions.map((opt: string, i: number) => (
              <button
                key={i}
                onClick={() => setSelectedReflection(selectedReflection === i ? null : i)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedReflection === i
                    ? "bg-rose-600 text-white shadow-sm"
                    : "bg-white border border-rose-200 text-rose-700 hover:bg-rose-50"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          {selectedReflection !== null && (
            <textarea
              value={openResponse}
              onChange={e => setOpenResponse(e.target.value)}
              placeholder="Want to write more? (optional)"
              className="w-full mt-2 px-3 py-2 rounded-lg border border-rose-200 bg-white text-sm text-text placeholder:text-text-muted/50 resize-none focus:outline-none focus:ring-2 focus:ring-rose-300"
              rows={2}
            />
          )}
          {/* Save reflection button */}
          {(openResponse.trim() || selectedReflection !== null) && (
            <button
              onClick={async () => {
                const text = openResponse.trim() || (selectedReflection !== null ? step.reflectionOptions?.[selectedReflection] : "");
                if (!text) return;
                try {
                  await fetch("/api/learner/reflections", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                      prompt: step.interaction?.question || "Reflection",
                      response: text,
                      lessonId: (lesson as any)?.id || null,
                      questId: (lesson as any)?.questId || null,
                    }),
                  });
                } catch (e) {
                  console.error("Failed to save reflection:", e);
                }
              }}
              className="mt-2 px-4 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors"
            >
              💾 Save Reflection
            </button>
          )}
        </div>
      )}

      {/* Reward summary on complete step */}
      {isComplete && step.materials && step.materials.length === 0 && (
        <div className="mt-3 px-4 py-3 rounded-xl bg-yellow-50/60 border border-yellow-200/50">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-yellow-700 mb-1">🏆 Lesson Complete!</p>
          <p className="text-sm font-medium text-yellow-900">Great job! You've finished this lesson.</p>
        </div>
      )}
    </div>
  );
}
