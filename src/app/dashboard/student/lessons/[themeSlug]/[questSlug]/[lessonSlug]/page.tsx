"use client";

import { useState, useEffect, useCallback, useRef, Component, ReactNode } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ArrowLeft, CheckCircle2, Zap, BookOpen, Flame,
  ChevronRight, ChevronLeft, Trophy, MessageCircle, Play,
  Star, Sparkles, Award, Target, Lightbulb, HelpCircle,
  Pencil, Eye, Clock, Gift,
} from "lucide-react";
import { GradientButton } from "@/components/ui/Pill";
import OwlTeacher from "@/components/ui/OwlTeacher";
import type { JourneyStep, JourneyStepType } from "@/lib/curriculum/lesson-journey";
import { STEP_TYPE_ICONS } from "@/lib/curriculum/lesson-journey";
import { InteractiveStepRenderer } from "@/components/interactive";
import { isLessonStudentVisible } from "@/lib/curriculum/student-visibility";

function getStepType(step: any): JourneyStepType {
  return (step?.stepType || "welcome") as JourneyStepType;
}

function hasInteractiveSpec(step: any): boolean {
  return !!(step?.visualSpec || step?.interactionSpec || step?.feedbackSpec || step?.mediaSpec);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getRewardValue(value: any): number {
  if (typeof value === "number") return value;
  if (!value) return 0;
  if (typeof value === "string") {
    const num = Number(value);
    if (!isNaN(num) && value.trim() !== "") return num;
    try { return getRewardValue(JSON.parse(value)); } catch { return 0; }
  }
  if (typeof value === "object") return value?.base ?? value?.amount ?? value?.value ?? 0;
  return 0;
}

function cleanTitle(title: string): string {
  return title?.replace(/\/[a-z]+$/i, "").replace(/\/m$/i, "").trim() || title || "Lesson";
}

function splitIntoParagraphs(text: string): string[] {
  if (!text) return [];
  if (text.includes("\n\n")) return text.split("\n\n").filter(Boolean);
  if (text.includes("\n")) return text.split("\n").filter(Boolean);
  if (text.length > 250) {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const paragraphs: string[] = [];
    let current = "";
    for (const s of sentences) {
      current += s;
      if (current.length > 200) { paragraphs.push(current.trim()); current = ""; }
    }
    if (current.trim()) paragraphs.push(current.trim());
    return paragraphs;
  }
  return [text];
}

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) { const m = url.match(p); if (m) return m[1]; }
  return null;
}

const OWL_EXPRESSIONS: Record<JourneyStepType, 'happy' | 'thinking' | 'encouraging' | 'celebrating'> = {
  welcome: "happy", mission: "encouraging", think_first: "thinking",
  learn: "happy", connect: "encouraging", example: "happy",
  practice: "encouraging", quick_check: "thinking", reflect: "happy", complete: "celebrating",
};

// ── Error Boundary ───────────────────────────────────────────────────────────

interface EBProps { children: ReactNode; fallback?: ReactNode; }
interface EBState { error: Error | null; }

class LessonErrorBoundary extends Component<EBProps, EBState> {
  constructor(props: EBProps) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error: Error): EBState { return { error }; }
  render() {
    if (this.state.error) {
      return this.props.fallback || (
        <div style={{ minHeight: "50vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ textAlign: "center", background: "#fff", padding: 32, borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", maxWidth: 400 }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>🦉</p>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>Something went wrong</p>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>This lesson step couldn't load properly.</p>
            <button onClick={() => window.location.reload()} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "#4f46e5", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
              Refresh
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function StudentLessonPlayer({ params }: { params: Promise<{ themeSlug: string; questSlug: string; lessonSlug: string }> }) {
  const { data: session, status } = useSession();
  const [slugs, setSlugs] = useState<{ themeSlug: string; questSlug: string; lessonSlug: string } | null>(null);
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [subjectMismatch, setSubjectMismatch] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [viewing, setViewing] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [justCompleted, setJustCompleted] = useState(false);
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);
  const hasCompletedRef = useRef(false);
  const [interaction, setInteraction] = useState<any>({
    predictionText: "", practiceEntries: ["", "", ""],
    selectedChoice: null, choiceFeedback: null,
    selfChecked: null, reflectionText: "",
    reflectionChip: null, reflectionSaved: false,
  });

  const journey = buildLessonJourney(lesson);
  const journeySteps = journey?.steps || [];
  const totalSteps = journeySteps.length;
  const isLastStep = currentStep >= totalSteps - 1;
  const clampedStep = Math.min(currentStep, Math.max(totalSteps - 1, 0));
  const currentJourneyStep = totalSteps > 0 ? journeySteps[clampedStep] : null;
  const xp = getRewardValue(lesson?.xpReward);
  const subject = lesson?.quest?.theme?.themeSubjects?.[0]?.subject || "";
  const grade = lesson?.quest?.theme?.grade || 0;

  // ── Debug logging in development ──────────────────────────────────────────
  if (process.env.NODE_ENV === "development") {
    console.log("[StudentPlayer] Loaded lesson:", {
      id: lesson?.id,
      title: lesson?.title,
      slug: lesson?.slug,
      subject,
      grade,
      questId: lesson?.questId,
      questTitle: lesson?.quest?.title,
      themeSlug: lesson?.quest?.theme?.slug,
      journeySource: journey?.source,
      journeySteps: journeySteps.length,
    });
  }

  // ── Subject mismatch guardrail ────────────────────────────────────────────
  // Detect if a Math lesson contains English reading comprehension content
  const expectedSubjectFromSlug = lesson?.slug?.startsWith("g2-mathematics") ? "mathematics"
    : lesson?.slug?.startsWith("g2-english") ? "english"
    : lesson?.slug?.startsWith("g2-environmental") ? "environmental"
    : lesson?.slug?.startsWith("g2-movement") ? "movement"
    : lesson?.slug?.startsWith("g2-kiswahili") ? "kiswahili"
    : lesson?.slug?.startsWith("g2-hygiene") ? "hygiene_nutrition"
    : lesson?.slug?.startsWith("g2-science") ? "science_technology"
    : lesson?.slug?.startsWith("g2-social") ? "social_studies"
    : lesson?.slug?.startsWith("g2-creative") ? "creative_arts"
    : lesson?.slug?.startsWith("g2-agriculture") ? "agriculture_nutrition"
    : "";

  if (expectedSubjectFromSlug && journeySteps.length > 0) {
    // Check first 3 steps for content mismatch
    const sampleText = journeySteps.slice(0, 3).map((s: any) =>
      `${s.studentText || ""} ${s.owlText || ""} ${s.content || ""}`
    ).join(" ").toLowerCase();

    const hasReadingComprehension = sampleText.includes("reading comprehension");
    const isMathExpected = expectedSubjectFromSlug === "mathematics";

    if (isMathExpected && hasReadingComprehension) {
      const msg = `Lesson subject mismatch: expected ${expectedSubjectFromSlug}, but content contains reading comprehension. Lesson: ${lesson?.title} (${lesson?.slug})`;
      console.error("[StudentPlayer] SUBJECT MISMATCH:", msg, {
        lessonId: lesson?.id,
        title: lesson?.title,
        slug: lesson?.slug,
        expectedSubject: expectedSubjectFromSlug,
      });
      if (process.env.NODE_ENV === "development") {
        setSubjectMismatch(msg);
      }
    }
  }

  // ── Student visibility gate ───────────────────────────────────────────────
  const visibility = lesson ? isLessonStudentVisible(lesson) : { visible: false, reasons: ["No lesson loaded"] };
  const isHiddenFromStudent = !visibility.visible;

  const nextStepLabel = !isLastStep && journeySteps[clampedStep + 1]
    ? STEP_TYPE_ICONS[journeySteps[clampedStep + 1].stepType as JourneyStepType] + " " + (journeySteps[clampedStep + 1].title || "Next")
    : null;

  useEffect(() => {
    setInteraction({
      predictionText: "", practiceEntries: ["", "", ""],
      selectedChoice: null, choiceFeedback: null,
      selfChecked: null, reflectionText: "",
      reflectionChip: null, reflectionSaved: false,
    });
  }, [currentStep]);

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

  const fireConfetti = useCallback(async () => {
    try {
      const confetti = (await import("canvas-confetti")).default;
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      setTimeout(() => confetti({ particleCount: 40, angle: 60, spread: 55, origin: { x: 0, y: 0.6 } }), 150);
      setTimeout(() => confetti({ particleCount: 40, angle: 120, spread: 55, origin: { x: 1, y: 0.6 } }), 300);
    } catch { /* non-blocking */ }
  }, []);

  const handleComplete = useCallback(async () => {
    if (!slugs || hasCompletedRef.current) return;
    hasCompletedRef.current = true;
    try {
      const res = await fetch("/api/learner/progress", {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ lessonId: lesson?.id, questId: slugs.questSlug || null, action: "complete" }),
      });
      const data = await res.json();
      if (data.success || data.completed) {
        setCompleted(true); setJustCompleted(true);
        setXpEarned(getRewardValue(data.rewards?.xp));
        if (data.newBadges?.length) setNewBadges(data.newBadges);
        setShowCelebration(true); fireConfetti();
      } else {
        setCompleteError("Could not complete lesson");
        hasCompletedRef.current = false;
      }
    } catch {
      setCompleteError("Network error. Please try again.");
      hasCompletedRef.current = false;
    }
  }, [slugs, lesson, fireConfetti]);

  if (status === "unauthenticated") return null;

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC" }}>
        <div style={{ textAlign: "center" }}>
          <OwlTeacher size={64} expression="happy" />
          <p style={{ marginTop: 16, fontSize: 16, fontWeight: 700, color: "#64748b" }}>Loading your lesson...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC" }}>
        <div style={{ textAlign: "center", background: "#fff", padding: 32, borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
          <BookOpen style={{ width: 48, height: 48, color: "#CBD5E1", margin: "0 auto 16px" }} />
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1e293b", marginBottom: 8 }}>Lesson not found</h2>
          <Link href="/dashboard/student" style={{ color: "#4f46e5", fontWeight: 700, fontSize: 14 }}>← Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  // ── Hidden lesson gate ────────────────────────────────────────────────────
  if (isHiddenFromStudent) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC" }}>
        <div style={{ textAlign: "center", background: "#fff", padding: 40, borderRadius: 20, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", maxWidth: 480 }}>
          <span style={{ fontSize: 48 }}>🔒</span>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1e293b", margin: "16px 0 8px" }}>Lesson Not Ready Yet</h2>
          <p style={{ fontSize: 14, color: "#64748b", marginBottom: 20, lineHeight: 1.6 }}>
            This lesson is being improved and is not ready yet. Please check back later or try another lesson.
          </p>
          {process.env.NODE_ENV === "development" && (
            <details style={{ textAlign: "left", marginBottom: 16, padding: 12, background: "#FEF3C7", borderRadius: 8, fontSize: 12 }}>
              <summary style={{ fontWeight: 700, color: "#92400E", cursor: "pointer" }}>Dev: Visibility Reasons</summary>
              <ul style={{ marginTop: 8, paddingLeft: 16, color: "#78350F" }}>
                {visibility.reasons.map((r: string, i: number) => (
                  <li key={i} style={{ marginBottom: 4 }}>{r}</li>
                ))}
              </ul>
            </details>
          )}
          <Link href="/dashboard/student" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#4f46e5", fontWeight: 700, fontSize: 14 }}>
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // ── Journey View ─────────────────────────────────────────────────────────

  if (viewing && currentJourneyStep) {
    return (
      <LessonErrorBoundary>
        <div style={{ minHeight: "100vh", background: "#F8FAFC", display: "flex", flexDirection: "column" }}>
          {/* Top bar */}
          <div style={{ background: "#fff", borderBottom: "1px solid #E2E8F0", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
            <button onClick={() => setViewing(false)} style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#64748b", fontWeight: 700, fontSize: 13, background: "none", border: "none", cursor: "pointer" }}>
              <ChevronLeft style={{ width: 16, height: 16 }} /> Exit
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {totalSteps > 0 && (
                <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>
                  {clampedStep + 1}/{totalSteps}
                </span>
              )}
              {xp > 0 && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "#B45309", background: "#FEF3C7", padding: "3px 8px", borderRadius: 6 }}>
                  <Zap style={{ width: 10, height: 10 }} /> +{xp} XP
                </span>
              )}
            </div>
          </div>

          {/* Progress bar */}
          {totalSteps > 0 && (
            <div style={{ padding: "8px 16px", background: "#fff", borderBottom: "1px solid #F1F5F9" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>Step {clampedStep + 1} of {totalSteps}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>{Math.round(((clampedStep + 1) / totalSteps) * 100)}%</span>
              </div>
              <div style={{ height: 6, background: "#F1F5F9", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: `${((clampedStep + 1) / totalSteps) * 100}%`, height: "100%", background: "linear-gradient(90deg, #6366F1, #8B5CF6)", borderRadius: 3, transition: "width 0.5s ease" }} />
              </div>
            </div>
          )}

          {/* Step content */}
          <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
            <div style={{ maxWidth: 720, margin: "0 auto" }}>
              {/* Subject mismatch warning */}
              {subjectMismatch && (
                <div style={{ marginBottom: 16, padding: "12px 16px", borderRadius: 12, background: "#FEF2F2", border: "2px solid #DC2626" }}>
                  <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#DC2626", margin: "0 0 4px" }}>
                    ⚠️ Lesson Content Error Detected
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "#991B1B", margin: 0 }}>
                    {subjectMismatch}
                  </p>
                  <p style={{ fontSize: "0.6875rem", color: "#B91C1C", margin: "4px 0 0" }}>
                    This is a data issue — the wrong content was stored for this lesson. Please report to the admin.
                  </p>
                </div>
              )}

                {/* Interactive renderer for steps with new spec fields — it owns title/Owl/chrome */}
                {hasInteractiveSpec(currentJourneyStep) ? (
                  <InteractiveStepRenderer
                    step={currentJourneyStep as any}
                    stepNumber={clampedStep + 1}
                    totalSteps={totalSteps}
                    interaction={interaction}
                    setInteraction={setInteraction}
                    onNext={() => {
                      if (isLastStep) {
                        handleComplete();
                      } else {
                        setCurrentStep((s) => Math.min(totalSteps - 1, s + 1));
                      }
                    }}
                    showChrome={true}
                  />
                ) : (
                  <LegacyStepContent step={currentJourneyStep} />
                )}
            </div>
          </div>

          {/* Bottom navigation */}
          {totalSteps > 0 && (
            <div style={{ background: "#fff", borderTop: "1px solid #E2E8F0", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              {clampedStep > 0 ? (
                <button onClick={() => setCurrentStep(clampedStep - 1)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 10, border: "1px solid #CBD5E1", background: "#fff", color: "#334155", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                  <ChevronLeft style={{ width: 16, height: 16 }} /> Back
                </button>
              ) : <div />}
              {isLastStep ? (
                <button onClick={handleComplete} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #059669, #10B981)", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
                  <Trophy style={{ width: 18, height: 18 }} /> Complete Lesson
                </button>
              ) : (
                nextStepLabel && (
                  <button onClick={() => setCurrentStep(clampedStep + 1)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #6366F1, #8B5CF6)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                    {nextStepLabel} <ChevronRight style={{ width: 16, height: 16 }} />
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </LessonErrorBoundary>
    );
  }

  // ── Landing / Start View ─────────────────────────────────────────────────

  const completedSteps = journeySteps.filter((_: any, i: number) => i < currentStep);
  const progress = totalSteps > 0 ? Math.round((completedSteps.length / totalSteps) * 100) : 0;

  return (
    <div style={{ minHeight: "100vh", background: "#F0F4FF" }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A78BFA 100%)", padding: "32px 16px", color: "#fff" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <Link href="/dashboard/student" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.8)", fontWeight: 600, fontSize: 13, textDecoration: "none", marginBottom: 16 }}>
            <ArrowLeft style={{ width: 14, height: 14 }} /> Back to Dashboard
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ fontSize: "3rem" }}>{STEP_TYPE_ICONS[getStepType(journeySteps[0])] || "🦉"}</div>
            <div>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 900, margin: 0, color: "#fff" }}>{cleanTitle(lesson.title)}</h1>
              {subject && <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.8)", margin: "4px 0 0" }}>{subject}{grade ? ` · Grade ${grade}` : ""}</p>}
            </div>
          </div>
          {xp > 0 && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 12, padding: "6px 14px", borderRadius: 20, background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}>
              <Zap style={{ width: 14, height: 14 }} />
              <span style={{ fontSize: "0.8125rem", fontWeight: 700 }}>+{xp} XP</span>
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px" }}>
        {/* Journey overview */}
        {journeySteps.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 16, padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#1e293b", margin: 0 }}>Lesson Journey</h3>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6366F1", background: "#EEF2FF", padding: "3px 8px", borderRadius: 6 }}>{progress}% Complete</span>
            </div>
            {/* Progress bar */}
            <div style={{ height: 8, background: "#F1F5F9", borderRadius: 4, overflow: "hidden", marginBottom: 16 }}>
              <div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg, #6366F1, #8B5CF6)", borderRadius: 4, transition: "width 0.5s ease" }} />
            </div>
            {/* Step indicators */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {journeySteps.map((step: any, i: number) => {
                const isCompleted = i < currentStep;
                const isCurrent = i === currentStep;
                return (
                  <button key={step.id} onClick={() => setCurrentStep(i)} style={{
                    width: 36, height: 36, borderRadius: 10, border: "none",
                    background: isCurrent ? "#6366F1" : isCompleted ? "#10B981" : "#F1F5F9",
                    color: isCurrent || isCompleted ? "#fff" : "#94A3B8",
                    fontSize: "0.875rem", fontWeight: 700, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    position: "relative",
                    boxShadow: isCurrent ? "0 4px 12px rgba(99,102,241,0.3)" : "none",
                  }}>
                    {isCompleted ? <CheckCircle2 style={{ width: 16, height: 16 }} /> : (STEP_TYPE_ICONS[getStepType(step)] || (i + 1))}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Start / Continue button */}
        {!completed && (
          <GradientButton variant="primary" size="lg" icon={<Play style={{ width: 18, height: 18 }} />} onClick={() => { setCurrentStep(0); setViewing(true); }} style={{ width: "100%", marginBottom: 16 }}>
            {completedSteps.length > 0 ? "Continue Lesson" : "Start Lesson"}
          </GradientButton>
        )}

        {/* Last step info */}
        {currentJourneyStep && !viewing && (
          <div style={{ background: "#fff", borderRadius: 16, padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6366F1", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Current Step</p>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: "#1e293b", marginBottom: 8 }}>{currentJourneyStep.title}</h3>
            {currentJourneyStep.owlText && (
              <div style={{ display: "flex", gap: 10, padding: "12px", borderRadius: 10, background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                <OwlTeacher size={32} expression={OWL_EXPRESSIONS[getStepType(currentJourneyStep)] || 'happy'} />
                <p style={{ fontSize: "0.8125rem", color: "#475569", margin: 0, lineHeight: 1.5 }}>{currentJourneyStep.owlText.slice(0, 150)}{currentJourneyStep.owlText.length > 150 ? "..." : ""}</p>
              </div>
            )}
          </div>
        )}

        {completed && (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <Trophy style={{ width: 48, height: 48, color: "#F59E0B", margin: "0 auto 12px" }} />
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#1e293b" }}>Lesson Complete! 🎉</h3>
            <p style={{ fontSize: "0.875rem", color: "#64748b" }}>You've finished this lesson. Great work!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function buildLessonJourney(lesson: any) {
  if (!lesson) return null;
  try {
    const cb = typeof lesson.contentBlocks === "string" ? JSON.parse(lesson.contentBlocks) : lesson.contentBlocks;
    if (!cb) return null;
    const steps = Array.isArray(cb.studentJourney) && cb.studentJourney.length > 0
      ? cb.studentJourney
      : Array.isArray(cb.studentJourneyDraft) && cb.studentJourneyDraft.length > 0
        ? cb.studentJourneyDraft
        : [];
    return { steps, source: Array.isArray(cb.studentJourney) && cb.studentJourney.length > 0 ? "live" : "draft" };
  } catch { return null; }
}

// -- Legacy step content (non-interactive steps) -------------------------------

function LegacyStepContent({ step }: { step: any }) {
  return (
    <>
      {/* Student content */}
      {step.studentText && (
        <div style={{ marginBottom: 16 }}>
          {splitIntoParagraphs(step.studentText).map((p: string, i: number) => (
            <p key={i} style={{ fontSize: "1rem", color: "#334155", lineHeight: 1.7, marginBottom: 12 }}>{p}</p>
          ))}
        </div>
      )}

      {/* Math display */}
      {step.mathDisplay && (
        <div style={{ padding: "16px", borderRadius: 12, background: "#F8FAFC", border: "1px solid #E2E8F0", textAlign: "center", marginBottom: 16 }}>
          <span style={{ fontSize: "1.5rem", fontFamily: "monospace", fontWeight: 700, color: "#1e293b" }}>{step.mathDisplay}</span>
        </div>
      )}

      {/* Illustration */}
      {step.media?.illustration?.approvedUrl && (
        <div style={{ marginBottom: 16, borderRadius: 12, overflow: "hidden", border: "1px solid #E2E8F0" }}>
          <img src={step.media.illustration.approvedUrl} alt={step.media.illustration.altText || ""} style={{ width: "100%", height: "auto", display: "block" }} />
        </div>
      )}

      {/* Video */}
      {(() => {
        const vUrl = step.media?.video?.approvedUrl;
        if (!vUrl) return null;
        const videoId = extractYouTubeId(vUrl);
        if (!videoId) return null;
        return (
          <div style={{ marginBottom: 16, borderRadius: 12, overflow: "hidden", border: "1px solid #E2E8F0" }}>
            <div style={{ position: "relative", width: "100%", paddingBottom: "56.25%" }}>
              <iframe src={`https://www.youtube.com/embed/${videoId}`} title="Lesson video" allowFullScreen style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }} />
            </div>
          </div>
        );
      })()}

      {/* Callout for "connect" step */}
      {step.stepType === "connect" && (
        <div style={{ padding: "14px 16px", borderRadius: 12, background: "#ECFDF5", border: "1px solid #A7F3D0", marginBottom: 16, display: "flex", gap: 10, alignItems: "flex-start" }}>
          <Lightbulb style={{ width: 18, height: 18, color: "#059669", flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: "0.875rem", color: "#065F46", margin: 0, lineHeight: 1.5 }}>{step.studentText}</p>
        </div>
      )}

      {/* Practice section */}
      {step.stepType === "practice" && !step.interaction?.options && (
        <div style={{ padding: "14px 16px", borderRadius: 12, background: "#F0F9FF", border: "1px solid #BAE6FD", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Pencil style={{ width: 16, height: 16, color: "#0284C7" }} />
            <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0C4A6E" }}>Your Turn!</span>
          </div>
          <textarea
            value={step._interaction?.practiceEntries?.[0] || ""}
            onChange={() => {}}
            placeholder="Write your answer here..."
            rows={4}
            style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #BAE6FD", fontSize: "0.875rem", color: "#1e293b", outline: "none", resize: "vertical", background: "#fff" }}
          />
        </div>
      )}

      {/* Think first */}
      {step.stepType === "think_first" && (
        <div style={{ padding: "14px 16px", borderRadius: 12, background: "#FFFBEB", border: "1px solid #FDE68A", marginBottom: 16 }}>
          <textarea
            value={step._interaction?.predictionText || ""}
            onChange={() => {}}
            placeholder="What do you think? Write your ideas here..."
            rows={3}
            style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #FDE68A", fontSize: "0.875rem", color: "#1e293b", outline: "none", resize: "vertical", background: "#fff" }}
          />
        </div>
      )}

      {/* Reflection */}
      {step.stepType === "reflect" && (
        <div style={{ padding: "14px 16px", borderRadius: 12, background: "#FFF1F2", border: "1px solid #FECDD3", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <MessageCircle style={{ width: 16, height: 16, color: "#E11D48" }} />
            <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#9F1239" }}>Reflection Time</span>
          </div>
          <textarea
            value={step._interaction?.reflectionText || ""}
            onChange={() => {}}
            placeholder="What did you learn today? How do you feel?"
            rows={3}
            style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #FECDD3", fontSize: "0.875rem", color: "#1e293b", outline: "none", resize: "vertical", background: "#fff", marginBottom: 8 }}
          />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {(step.reflectionOptions || ["I learned something new!", "I need more practice", "This was fun!", "I can teach someone else now"]).map((opt: string, i: number) => (
              <span key={i} style={{ padding: "6px 12px", borderRadius: 20, border: "2px solid #FECDD3", background: "#fff", color: "#9F1239", fontSize: "0.75rem", fontWeight: 700 }}>
                {opt}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Completion */}
      {step.stepType === "complete" && (
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <OwlTeacher size={72} expression="celebrating" />
          <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1e293b", margin: "16px 0 8px" }}>You Did It! 🏆</h3>
          <p style={{ fontSize: "1rem", color: "#64748b", marginBottom: 16 }}>Amazing work! You have completed this lesson.</p>
        </div>
      )}
    </>
  );
}
