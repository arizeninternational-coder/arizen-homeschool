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
  contentBlocks: any;
  difficulty?: string;
  xpReward?: { base: number } | number;
  progress: number;
  isCompleted: boolean;
}

/**
 * Normalize contentBlocks so the student lesson page can safely render
 * regardless of how contentBlocks was stored (array, JSON string,
 * structured CBC-rich object, or null/undefined).
 *
 * For structured objects, generates a student journey with step numbers.
 */
function normalizeContentBlocks(input: any): any[] {
  if (Array.isArray(input)) return input;

  if (!input) return [];

  if (typeof input === "string") {
    try {
      return normalizeContentBlocks(JSON.parse(input));
    } catch {
      return [];
    }
  }

  if (typeof input === "object") {
    const blocks: any[] = [];
    let step = 1;

    const curriculum = input.curriculum || {};
    const shell = input.lessonShell || {};

    const learningGoal =
      curriculum.specificLearningOutcome ||
      input.learningOutcome;

    const keyInquiry =
      curriculum.keyInquiryQuestion ||
      input.keyInquiryQuestion;

    const suggestedExperience =
      curriculum.suggestedLearningExperience ||
      input.suggestedLearningExperience;

    const activityInstructions =
      shell.activityInstructions ||
      input.activityInstructions;

    const offlineActivity =
      shell.offlineActivity ||
      input.offlineActivity;

    const assessment =
      shell.assessmentCriteria ||
      shell.assessmentMethod ||
      input.assessmentCriteria ||
      input.assessmentMethod;

    const reflection =
      shell.reflectionPrompt ||
      input.reflectionPrompt;

    // A. Mission — Your learning goal
    if (learningGoal) {
      blocks.push({
        type: "journey-mission",
        step: step++,
        title: "Your Mission",
        icon: "🎯",
        content: learningGoal
      });
    }

    // B. Warm-Up — Think first
    if (keyInquiry) {
      blocks.push({
        type: "journey-warmup",
        step: step++,
        title: "Think First",
        icon: "💭",
        content: keyInquiry
      });
    }

    // C. Learn — Suggested learning experience
    if (suggestedExperience) {
      blocks.push({
        type: "journey-learn",
        step: step++,
        title: "Learn It",
        icon: "📖",
        content: suggestedExperience
      });
    }

    // D. Example — From activity instructions (if different from suggested experience)
    const exampleContent = (activityInstructions && activityInstructions !== suggestedExperience) ? activityInstructions : offlineActivity;
    if (exampleContent && exampleContent !== suggestedExperience) {
      blocks.push({
        type: "journey-example",
        step: step++,
        title: "Example",
        icon: "💡",
        content: exampleContent
      });
    }

    // E. Try It — Activity instructions or offline activity
    const tryContent = activityInstructions || offlineActivity;
    if (tryContent) {
      blocks.push({
        type: "journey-try",
        step: step++,
        title: "Try It Yourself",
        icon: "✏️",
        content: tryContent
      });
    }

    // E. Quick Check — Assessment
    if (assessment) {
      blocks.push({
        type: "journey-check",
        step: step++,
        title: "Quick Check",
        icon: "✅",
        content: assessment
      });
    }

    // F. Reflect
    if (reflection) {
      blocks.push({
        type: "journey-reflect",
        step: step++,
        title: "Reflect",
        icon: "🪞",
        content: reflection
      });
    }

    return blocks;
  }

  return [];
}

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

  // Normalize contentBlocks to a safe array regardless of storage shape
  const renderBlocks = normalizeContentBlocks(lesson?.contentBlocks);

  // Determine if we're in journey mode (structured CBC blocks)
  const isJourney = renderBlocks.some((b: any) => typeof b?.type === "string" && b.type.startsWith("journey-"));
  const totalSteps = renderBlocks.length;
  const isLastStep = currentStep >= totalSteps - 1;
  const clampedStep = Math.min(currentStep, Math.max(totalSteps - 1, 0));

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
                {newBadges.map((badge) => (
                  <div key={badge.id} className="rounded-2xl border-2 border-accent-purple/20 bg-accent-purple-soft/40 p-3.5 flex items-center gap-2.5" style={{ animation: "popIn 0.4s ease-out" }}>
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

          {/* Content blocks — paginated for journey, stacked for arrays */}
          {renderBlocks.length > 0 ? (
            isJourney ? (
              // Journey mode — show one step at a time
              <JourneyStep block={renderBlocks[clampedStep]} />
            ) : (
              // Array mode — show all grouped cards
              <div className="flex flex-col gap-4">
                {(() => {
                  const cardGroups: { heading?: any; items: any[] }[] = [];
                  let currentGroup: typeof cardGroups[number] | null = null;
                  renderBlocks.forEach((block: any) => {
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
                    <div key={i} className="rounded-2xl border border-white/60 bg-white/90 backdrop-blur-sm p-5 lg:p-6">
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
            )
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
      {renderBlocks.length > 0 && (
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

// Owl teacher helper texts for each journey step type
const OwlHelperMessages: Record<string, string> = {
  "journey-mission": "📖 This is what you'll be able to do by the end. Read it carefully!",
  "journey-warmup": "🤔 Think about this question before we start. Your first idea matters!",
  "journey-learn": "👀 Watch how it works step by step. Don't worry if it's new — we'll practice next.",
  "journey-example": "✨ See? Here's how someone else did it. This can be your guide!",
  "journey-try": "✏️ Now it's your turn! Use counters, drawings, or examples to try it yourself.",
  "journey-check": "🎯 Let's see if the idea makes sense. Can you answer this?",
  "journey-reflect": "🪞 What did you notice? Write it in your own words — that's how you remember!",
};

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

// Journey step color themes
const journeyThemes: Record<string, { accent: string; bg: string; border: string }> = {
  "journey-mission":  { accent: "text-indigo-600",   bg: "bg-indigo-50",   border: "border-indigo-200" },
  "journey-warmup":   { accent: "text-amber-600",    bg: "bg-amber-50",    border: "border-amber-200" },
  "journey-learn":    { accent: "text-emerald-600",  bg: "bg-emerald-50",  border: "border-emerald-200" },
  "journey-example":  { accent: "text-cyan-600",    bg: "bg-cyan-50",    border: "border-cyan-200" },
  "journey-try":      { accent: "text-sky-600",      bg: "bg-sky-50",      border: "border-sky-200" },
  "journey-check":    { accent: "text-violet-600",   bg: "bg-violet-50",   border: "border-violet-200" },
  "journey-reflect":  { accent: "text-rose-600",     bg: "bg-rose-50",     border: "border-rose-200" },
};

function JourneyStep({ block }: { block: any }) {
  if (!block || typeof block !== "object") return null;

  const type = block.type || "";
  const theme = journeyThemes[type] || { accent: "text-text", bg: "bg-white/90", border: "border-white/60" };
  const step = block.step || 1;
  const icon = block.icon || "📌";
  const title = block.title || "Step";
  const content = block.content || block.text || block.body || "";
  const owlMessage = OwlHelperMessages[type] || "";

  if (!content) return null;

  const paragraphs = splitIntoParagraphs(content);

  return (
    <div className={`rounded-xl border ${theme.border} ${theme.bg} p-4 lg:p-5`}>
      <div className="flex items-start gap-3">
        {/* Step number bubble */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold ${theme.bg} ${theme.accent} ring-1 ${theme.border}`}>
          {step}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-bold text-sm ${theme.accent} flex items-center gap-1.5 mb-2`}>
            <span>{icon}</span> {title}
          </h4>
          {/* Owl teacher guide */}
          {owlMessage && (
            <div className="flex items-start gap-2 mb-3 px-3 py-2 rounded-lg bg-white/70 border border-white/40">
              <span className="text-base flex-shrink-0">🦉</span>
              <p className="text-text-muted text-xs italic leading-relaxed">{owlMessage}</p>
            </div>
          )}
          {/* Content paragraphs */}
          <div className="flex flex-col gap-2">
            {paragraphs.map((p, i) => (
              <p key={i} className="text-text text-sm leading-relaxed">{p}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
