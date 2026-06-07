"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Sparkles, ArrowLeft, CheckCircle2, Zap, BookOpen, Flame, Award,
  Target, Star, ChevronRight, ChevronLeft, RotateCcw, Eye, Lightbulb,
  Pencil, CheckCircle, HelpCircle, Trophy, Heart, MessageCircle
} from "lucide-react";
import { GradientButton } from "@/components/ui/Pill";
import confetti from "canvas-confetti";
import {
  type JourneyStep,
  type JourneyStepType,
  STEP_TYPE_ICONS,
  buildUniversalJourney,
} from "@/lib/curriculum/lesson-journey";

/* ─── helpers ─── */

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

const STEP_LABELS: Record<JourneyStepType, string> = {
  welcome: "Welcome", mission: "Mission", think_first: "Predict",
  learn: "Learn", connect: "Connect", example: "Example",
  practice: "Practice", quick_check: "Check", reflect: "Reflect", complete: "Done",
};

const NEXT_BUTTON_LABELS: Record<JourneyStepType, string> = {
  welcome: "Start Mission →", mission: "I'm Ready →", think_first: "Save My Guess →",
  learn: "I Understand →", connect: "Continue →", example: "Show Practice →",
  practice: "Save Measurements →", quick_check: "Check Answer",
  reflect: "Continue to Finish →", complete: "",
};

/* ─── theme colors per step type ─── */

const STEP_THEME: Record<JourneyStepType, { accent: string; bg: string; border: string; gradient: string }> = {
  welcome:    { accent: "text-indigo-700", bg: "bg-indigo-50",   border: "border-indigo-200", gradient: "from-indigo-500 to-purple-500" },
  mission:    { accent: "text-violet-700",  bg: "bg-violet-50",   border: "border-violet-200", gradient: "from-violet-500 to-purple-500" },
  think_first:{ accent: "text-amber-700",   bg: "bg-amber-50",    border: "border-amber-200",  gradient: "from-amber-500 to-orange-500" },
  learn:      { accent: "text-emerald-700", bg: "bg-emerald-50",  border: "border-emerald-200", gradient: "from-emerald-500 to-teal-500" },
  connect:    { accent: "text-teal-700",    bg: "bg-teal-50",     border: "border-teal-200",    gradient: "from-teal-500 to-cyan-500" },
  example:    { accent: "text-cyan-700",    bg: "bg-cyan-50",     border: "border-cyan-200",    gradient: "from-cyan-500 to-blue-500" },
  practice:   { accent: "text-sky-700",     bg: "bg-sky-50",      border: "border-sky-200",     gradient: "from-sky-500 to-blue-500" },
  quick_check:{ accent: "text-lime-700",    bg: "bg-lime-50",     border: "border-lime-200",    gradient: "from-lime-500 to-green-500" },
  reflect:    { accent: "text-rose-700",    bg: "bg-rose-50",     border: "border-rose-200",    gradient: "from-rose-500 to-pink-500" },
  complete:   { accent: "text-yellow-700",  bg: "bg-yellow-50",   border: "border-yellow-200",  gradient: "from-yellow-500 to-amber-500" },
};

/* ─── celebration styles ─── */

const CELEBRATION_CSS = `
@keyframes float { 0% { transform: translateY(0) rotate(0deg); opacity: .8 } 100% { transform: translateY(-20px) rotate(15deg); opacity: 1 } }
@keyframes popIn { 0% { transform: scale(.5); opacity: 0 } 70% { transform: scale(1.1) } 100% { transform: scale(1); opacity: 1 } }
@keyframes xpBurst { 0% { transform: scale(1) } 50% { transform: scale(1.3) } 100% { transform: scale(1) } }
@keyframes shimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }
@keyframes slideUp { 0% { transform: translateY(20px); opacity: 0 } 100% { transform: translateY(0); opacity: 1 } }
@keyframes pulse-glow { 0%,100% { box-shadow: 0 0 0 0 rgba(79,70,229,.3) } 50% { box-shadow: 0 0 0 8px rgba(79,70,229,0) } }
`;

/* ─── main page component ─── */

export default function LessonPlayerPage({ params }: { params: Promise<{ themeSlug: string; questSlug: string; lessonSlug: string }> }) {
  const { data: session, status } = useSession();
  const [slugs, setSlugs] = useState<{ themeSlug: string; questSlug: string; lessonSlug: string } | null>(null);
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);
  const hasCompletedRef = useRef(false);

  // Per-step interaction state
  const [interaction, setInteraction] = useState({
    predictionText: "",
    practiceEntries: ["", "", ""] as string[],
    selectedChoice: null as number | null,
    choiceFeedback: null as "correct" | "incorrect" | null,
    selfChecked: null as boolean | null,
    reflectionText: "",
    reflectionChip: null as number | null,
    reflectionSaved: false,
  });

  // Build journey
  const journey = buildLessonJourney(lesson);
  const journeySteps = journey?.steps || [];
  const journeySource = journey?.source || "cbc_fallback";
  const isJourney = journeySteps.length >= 5 && journeySource !== "legacy_array";
  const totalSteps = journeySteps.length;
  const isLastStep = currentStep >= totalSteps - 1;
  const clampedStep = Math.min(currentStep, Math.max(totalSteps - 1, 0));
  const currentJourneyStep = isJourney && totalSteps > 0 ? journeySteps[clampedStep] : null;
  const xp = getRewardValue(lesson?.xpReward);
  const subject = lesson?.quest?.theme?.themeSubjects?.[0]?.subject || "";
  const grade = lesson?.quest?.theme?.grade || 0;

  // Reset interaction state when step changes
  useEffect(() => {
    setInteraction({
      predictionText: "", practiceEntries: ["", "", ""], selectedChoice: null,
      choiceFeedback: null, selfChecked: null, reflectionText: "",
      reflectionChip: null, reflectionSaved: false,
    });
  }, [currentStep]);

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
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ["#2DD4BF", "#F59E0B", "#3B82F6", "#EC4899", "#10B981"] });
    setTimeout(() => confetti({ particleCount: 40, angle: 60, spread: 55, origin: { x: 0, y: 0.6 }, colors: ["#2DD4BF", "#F59E0B", "#3B82F6"] }), 150);
    setTimeout(() => confetti({ particleCount: 40, angle: 120, spread: 55, origin: { x: 1, y: 0.6 }, colors: ["#EC4899", "#10B981", "#F59E0B"] }), 300);
    setTimeout(() => confetti({ particleCount: 30, spread: 100, origin: { y: 0.5 }, shapes: ["star"], colors: ["#FFD700", "#FFA500"], scalar: 1.5 }), 500);
  }, []);

  const handleComplete = useCallback(async () => {
    if (!slugs || completing || hasCompletedRef.current) return;
    hasCompletedRef.current = true;
    setCompleting(true);
    setCompleteError(null);
    try {
      const questId = lesson?.questId || slugs.questSlug || null;
      const res = await fetch("/api/learner/progress", {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ lessonId: lesson?.id, questId, action: "complete" }),
      });
      const data = await res.json();
      if (!res.ok) { setCompleteError(data.error || `Could not complete (status ${res.status})`); hasCompletedRef.current = false; return; }
      if (data.success || data.completed) {
        const xpAmt = getRewardValue(data.rewards?.xp);
        setCompleted(true); setJustCompleted(true); setXpEarned(xpAmt); setStreakCount(data.streak || 0);
        setShowCelebration(true);
        if (data.newBadges?.length) setNewBadges(data.newBadges);
        fireConfetti();
      } else if (data.alreadyCompleted) {
        setCompleted(true); setShowCelebration(false);
      } else {
        setCompleteError("Unexpected response. Please try again.");
        hasCompletedRef.current = false;
      }
    } catch {
      setCompleteError("Network error. Please check your connection.");
      hasCompletedRef.current = false;
    } finally { setCompleting(false); }
  }, [slugs, completing, lesson, fireConfetti]);

  const handleSaveReflection = useCallback(async () => {
    const text = interaction.reflectionText.trim() || (interaction.reflectionChip !== null && currentJourneyStep?.reflectionOptions?.[interaction.reflectionChip]) || "";
    if (!text) return;
    try {
      await fetch("/api/learner/reflections", {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ prompt: currentJourneyStep?.interaction?.question || "Reflection", response: text, lessonId: lesson?.id || null, questId: lesson?.questId || null }),
      });
      setInteraction(prev => ({ ...prev, reflectionSaved: true }));
    } catch { /* non-blocking */ }
  }, [interaction.reflectionText, interaction.reflectionChip, currentJourneyStep, lesson]);

  /* ─── loading state ─── */
  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-10 h-10"><div className="absolute inset-0 rounded-full border-[3px] border-primary/15" /><div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-primary animate-spin" /></div>
        <p className="text-sm font-bold text-text-muted">Loading lesson...</p>
      </div>
    </div>
  );

  /* ─── journey overlay ─── */
  if (viewing) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col">
        <style>{CELEBRATION_CSS}</style>

        {/* ── Top Bar ── */}
        <div className="bg-white border-b border-slate-200 px-4 lg:px-8 py-3 flex-shrink-0 shadow-sm">
          <div className="max-w-[1220px] mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button onClick={() => { setViewing(false); setShowCelebration(false); setCurrentStep(0); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-sm transition-colors flex-shrink-0">
                <ArrowLeft className="w-4 h-4" /> {completed ? "Exit" : "Back"}
              </button>
              <div className="min-w-0">
                <h1 className="font-bold text-slate-900 text-sm lg:text-base truncate">{cleanTitle(lesson?.title)}</h1>
                {subject && <p className="text-[11px] text-slate-500 font-medium">{subject}{grade ? ` · Grade ${grade}` : ""}</p>}
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {isJourney && <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Step {clampedStep + 1}/{totalSteps}</span>}
              {xp > 0 && <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg"><Zap className="w-3 h-3" /> +{xp} XP</span>}
              {justCompleted ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg"><CheckCircle2 className="w-3.5 h-3.5" /> Completed</span>
              ) : completed ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg"><Eye className="w-3.5 h-3.5" /> Review</span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg"><Pencil className="w-3.5 h-3.5" /> In Progress</span>
              )}
            </div>
          </div>
        </div>

        {/* ── Progress Bar ── */}
        {isJourney && totalSteps > 0 && (
          <div className="bg-white border-b border-slate-100 px-4 lg:px-8 py-3 flex-shrink-0">
            <div className="max-w-[1220px] mx-auto">
              <div className="flex items-center gap-1.5 mb-2">
                {journeySteps.map((s, i) => (
                  <button key={i} onClick={() => setCurrentStep(i)} className="flex-1 flex flex-col items-center gap-1 group" title={STEP_LABELS[s.stepType] || s.title}>
                    <span className={`text-xs transition-all ${i === clampedStep ? "scale-125" : i < clampedStep ? "opacity-80" : "opacity-40"}`}>
                      {STEP_TYPE_ICONS[s.stepType] || "•"}
                    </span>
                  </button>
                ))}
              </div>
              <div className="flex gap-1">
                {journeySteps.map((_, i) => (
                  <div key={i} className={`h-2.5 rounded-full flex-1 transition-all duration-300 ${
                    i < clampedStep ? "bg-indigo-500" : i === clampedStep ? "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]" : "bg-slate-200"
                  }`} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Main Content Area ── */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-[1220px] mx-auto px-4 lg:px-8 py-6 flex gap-6">
            {/* ── Main Lesson Column ── */}
            <div className="flex-1 min-w-0 max-w-[800px]">
              {/* Celebration overlay */}
              {showCelebration && xpEarned > 0 && (
                <div className="relative rounded-2xl p-8 mb-6 text-center overflow-hidden border-2 border-indigo-200" style={{ background: "linear-gradient(135deg, #EEF2FF 0%, #FFF7ED 50%, #FFF1F2 100%)" }}>
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="absolute text-2xl" style={{ left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 25}%`, animation: `float ${2 + i * 0.5}s ease-in-out infinite alternate`, animationDelay: `${i * 0.2}s` }}>
                        {["⭐", "✨", "🎉", "💫", "🌟", "⚡"][i]}
                      </div>
                    ))}
                  </div>
                  <div className="relative z-10">
                    <div className="text-6xl mb-3">🎉</div>
                    <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Lesson Complete!</h2>
                    <p className="text-slate-600 mb-4">You worked hard and learned something new!</p>
                    <div className="flex items-center justify-center gap-4 flex-wrap">
                      <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white shadow-lg" style={{ animation: "xpBurst .5s ease-out" }}>
                        <Zap className="w-5 h-5 text-indigo-600" /><span className="text-xl font-extrabold text-indigo-600">+{xpEarned}</span><span className="text-sm font-semibold text-slate-500">XP</span>
                      </div>
                      {streakCount > 0 && (
                        <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white shadow-lg">
                          <Flame className="w-5 h-5 text-pink-500" /><span className="text-xl font-extrabold text-pink-500">+{streakCount}</span><span className="text-sm font-semibold text-slate-500">streak</span>
                        </div>
                      )}
                    </div>
                    {newBadges.length > 0 && (
                      <div className="mt-4 flex gap-2 justify-center flex-wrap">
                        {newBadges.map((b, i) => (
                          <div key={i} className="rounded-xl border-2 border-purple-200 bg-purple-50 px-3 py-2 flex items-center gap-2" style={{ animation: "popIn .4s ease-out" }}>
                            <span className="text-xl">🏅</span><span className="font-bold text-sm text-slate-800">{b}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Already completed (review) */}
              {completed && !showCelebration && !justCompleted && (
                <div className="text-center rounded-2xl p-6 mb-6 border border-blue-200 bg-blue-50">
                  <Eye className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-bold text-blue-800 text-base">Review Mode</h3>
                  <p className="text-blue-600 text-sm mt-1">You've completed this lesson. Review the content below!</p>
                </div>
              )}

              {/* Current step */}
              {isJourney && currentJourneyStep ? (
                <LessonStepView
                  step={currentJourneyStep}
                  stepNumber={clampedStep + 1}
                  totalSteps={totalSteps}
                  interaction={interaction}
                  setInteraction={setInteraction}
                  lesson={lesson}
                  onSaveReflection={handleSaveReflection}
                />
              ) : journeySteps.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {journeySteps.map((s, i) => (
                    <LessonStepView key={s.id} step={s} stepNumber={i + 1} totalSteps={journeySteps.length}
                      interaction={interaction} setInteraction={setInteraction} lesson={lesson} onSaveReflection={handleSaveReflection} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white text-center p-12">
                  <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-slate-800 mb-2">This lesson is being prepared</h3>
                  <p className="text-slate-500 text-sm">Please check back soon.</p>
                </div>
              )}

              {/* Completion error */}
              {completeError && (
                <div className="mt-4 rounded-xl border border-red-300 bg-red-50 p-4 text-center">
                  <p className="text-sm font-semibold text-red-700">{completeError}</p>
                  <button onClick={() => setCompleteError(null)} className="mt-2 text-xs text-red-500 underline hover:text-red-700">Dismiss</button>
                </div>
              )}

              {/* ── Navigation Buttons ── */}
              {isJourney && currentJourneyStep && (
                <div className="mt-6 flex gap-3">
                  {clampedStep > 0 ? (
                    <button onClick={() => setCurrentStep(clampedStep - 1)}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border-2 border-slate-200 bg-white text-slate-700 font-bold text-base hover:bg-slate-50 transition-all">
                      <ChevronLeft className="w-5 h-5" /> Back
                    </button>
                  ) : (
                    <div className="flex-1" />
                  )}

                  {/* Completion step */}
                  {currentJourneyStep.stepType === "complete" ? (
                    <div className="flex-1 flex gap-2">
                      <button onClick={() => { setViewing(false); setShowCelebration(false); setCurrentStep(0); }}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border-2 border-slate-200 bg-white text-slate-700 font-bold text-base hover:bg-slate-50 transition-all">
                        <ArrowLeft className="w-4 h-4" /> Quest
                      </button>
                      {!completed ? (
                        <button onClick={handleComplete} disabled={completing}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-base hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50">
                          {completing ? <><span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Earning...</> : <><Trophy className="w-5 h-5" /> Finish & Earn +{xp} XP</>}
                        </button>
                      ) : (
                        <button onClick={() => { setViewing(false); setShowCelebration(false); setCurrentStep(0); }}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-base hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg shadow-indigo-200">
                          <RotateCcw className="w-4 h-4" /> Review Again
                        </button>
                      )}
                    </div>
                  ) : !isLastStep ? (
                    <button onClick={() => setCurrentStep(clampedStep + 1)}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-base hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg shadow-indigo-200">
                      {NEXT_BUTTON_LABELS[currentJourneyStep.stepType] || "Next →"} <ChevronRight className="w-5 h-5" />
                    </button>
                  ) : !completed ? (
                    <button onClick={handleComplete} disabled={completing}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-base hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50">
                      {completing ? <><span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Completing...</> : <>Complete Lesson {xp > 0 && <span className="bg-white/20 px-2 py-0.5 rounded-lg text-xs">+{xp} XP</span>}</>}
                    </button>
                  ) : (
                    <button onClick={() => { setViewing(false); setShowCelebration(false); setCurrentStep(0); }}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border-2 border-slate-200 bg-white text-slate-700 font-bold text-base hover:bg-slate-50 transition-all">
                      <ArrowLeft className="w-4 h-4" /> Back to Quest
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* ── Right Support Panel (desktop) ── */}
            <div className="hidden lg:block w-[320px] flex-shrink-0 space-y-4">
              <SupportPanel
                lesson={lesson}
                journeySteps={journeySteps}
                currentStep={clampedStep}
                xp={xp}
                subject={subject}
                grade={grade}
                onStepClick={setCurrentStep}
              />
            </div>
          </div>
        </div>

        {/* ── Mobile Support Panel (below content) ── */}
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 flex-shrink-0">
          <SupportPanel
            lesson={lesson}
            journeySteps={journeySteps}
            currentStep={clampedStep}
            xp={xp}
            subject={subject}
            grade={grade}
            onStepClick={setCurrentStep}
            compact
          />
        </div>
      </div>
    );
  }

  /* ─── Landing Page (before journey starts) ─── */
  return (
    <div className="fade-in max-w-[760px] mx-auto">
      <div className="relative rounded-2xl p-6 lg:p-8 mb-6 overflow-hidden border border-indigo-200" style={{ background: "linear-gradient(135deg, #4F46E5 0%, #8B5CF6 50%, #6D28D9 100%)" }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-white/5" />
        </div>
        <div className="relative z-10">
          {slugs && (
            <Link href={`/dashboard/student/lessons/${slugs.themeSlug}/${slugs.questSlug}`}
              className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-semibold mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Quest
            </Link>
          )}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {completed && <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 text-white px-2.5 py-1 rounded-full">✓ Completed</span>}
            {subject && <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 text-white px-2.5 py-1 rounded-full">{subject}{grade ? ` · Grade ${grade}` : ""}</span>}
            {xp > 0 && <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-400/80 text-white px-2.5 py-1 rounded-full flex items-center gap-1"><Zap className="w-3 h-3" /> {xp} XP</span>}
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white mb-2 tracking-tight">{cleanTitle(lesson?.title)}</h1>
          {lesson?.description && <p className="text-white/85 text-base leading-relaxed">{lesson.description}</p>}
        </div>
      </div>

      {completed && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 text-center p-6 mb-5">
          <CheckCircle2 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <p className="font-bold text-blue-800">You've completed this lesson!</p>
          <p className="text-blue-600 text-sm mt-1">Review the content or move on to the next lesson.</p>
        </div>
      )}

      {isJourney && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 mb-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center"><Sparkles className="w-5 h-5 text-indigo-600" /></div>
          <div>
            <p className="text-sm font-bold text-indigo-800">{totalSteps}-step interactive lesson</p>
            <p className="text-[11px] text-indigo-600">Work through each step to complete the lesson</p>
          </div>
        </div>
      )}

      <GradientButton variant={completed ? "secondary" : "primary"} size="lg"
        icon={completed ? <Eye className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
        onClick={async () => {
          if (lesson?.id) {
            try { await fetch("/api/learner/progress", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ lessonId: lesson.id, action: "start" }) }); } catch { /* non-blocking */ }
          }
          setCurrentStep(0); setViewing(true);
        }} className="w-full">
        {completed ? "🔄 Review Lesson" : isJourney ? `🚀 Begin ${totalSteps}-Step Journey` : "📖 Start Lesson"}
      </GradientButton>
    </div>
  );
}

/* ─── build lesson journey ─── */

function buildLessonJourney(lesson: any): { steps: JourneyStep[]; source: string } | null {
  if (!lesson?.id) return null;
  const subject = lesson.quest?.theme?.themeSubjects?.[0]?.subject || "";
  const grade = lesson.quest?.theme?.grade || 0;
  return buildUniversalJourney(lesson.id, lesson.title || "Lesson", lesson.contentBlocks, {
    subject, grade, xpReward: getRewardValue(lesson?.xpReward), coinReward: lesson?.coinReward,
  });
}

/* ─── Support Panel ─── */

function SupportPanel({ lesson, journeySteps, currentStep, xp, subject, grade, onStepClick, compact }: {
  lesson: any; journeySteps: JourneyStep[]; currentStep: number; xp: number; subject: string; grade: number;
  onStepClick: (i: number) => void; compact?: boolean;
}) {
  const currentStepData = journeySteps[currentStep];
  const missionStep = journeySteps.find(s => s.stepType === "mission");

  return (
    <div className={`space-y-4 ${compact ? "flex gap-4 overflow-x-auto pb-2" : ""}`}>
      {/* Mission Card */}
      <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
        <h3 className="font-bold text-violet-800 text-sm mb-2 flex items-center gap-1.5"><Target className="w-4 h-4" /> Today's Mission</h3>
        <p className="text-violet-700 text-sm leading-relaxed">{missionStep?.studentText || "Complete this lesson to learn something new!"}</p>
      </div>

      {/* Progress Overview */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="font-bold text-slate-800 text-sm mb-3">Lesson Progress</h3>
        <div className="space-y-1.5">
          {journeySteps.map((s, i) => (
            <button key={i} onClick={() => onStepClick(i)} className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-all text-xs font-semibold ${
              i === currentStep ? "bg-indigo-100 text-indigo-800" : i < currentStep ? "bg-emerald-50 text-emerald-700" : "text-slate-400 hover:bg-slate-50"
            }`}>
              <span className="text-sm">{STEP_TYPE_ICONS[s.stepType] || "•"}</span>
              <span className="truncate">{STEP_LABELS[s.stepType] || s.title}</span>
              {i < currentStep && <CheckCircle className="w-3.5 h-3.5 text-emerald-500 ml-auto flex-shrink-0" />}
              {i === currentStep && <span className="w-2 h-2 rounded-full bg-indigo-500 ml-auto flex-shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {/* Rewards */}
      {xp > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="font-bold text-amber-800 text-sm mb-2 flex items-center gap-1.5"><Star className="w-4 h-4" /> Rewards</h3>
          <div className="flex gap-3">
            <div className="flex items-center gap-1.5 text-amber-700"><Zap className="w-4 h-4" /><span className="font-bold text-sm">{xp} XP</span></div>
            <div className="flex items-center gap-1.5 text-amber-700"><Flame className="w-4 h-4" /><span className="font-bold text-sm">{Math.floor(xp / 2)} coins</span></div>
          </div>
        </div>
      )}

      {/* Tools Needed */}
      {currentStepData?.materials && currentStepData.materials.length > 0 && (
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
          <h3 className="font-bold text-orange-800 text-sm mb-2">🧰 What you might need</h3>
          <div className="flex flex-wrap gap-1.5">
            {currentStepData.materials.map((m: string, i: number) => (
              <span key={i} className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[11px] font-semibold">{m}</span>
            ))}
          </div>
        </div>
      )}

      {/* Owl Tip */}
      {currentStepData?.owlText && (
        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
          <div className="flex items-start gap-2.5">
            <span className="text-3xl flex-shrink-0">🦉</span>
            <div>
              <h3 className="font-bold text-sky-800 text-xs mb-1">Owl Teacher says:</h3>
              <p className="text-sky-700 text-sm leading-relaxed italic">{currentStepData.owlText}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Lesson Step View ─── */

function LessonStepView({ step, stepNumber, totalSteps, interaction, setInteraction, lesson, onSaveReflection }: {
  step: JourneyStep; stepNumber: number; totalSteps: number;
  interaction: any; setInteraction: any; lesson: any;
  onSaveReflection: () => Promise<void>;
}) {
  if (!step) return null;
  const theme = STEP_THEME[step.stepType] || STEP_THEME.welcome;
  const icon = STEP_TYPE_ICONS[step.stepType] || "📖";
  const paragraphs = splitIntoParagraphs(step.studentText);
  const isComplete = step.stepType === "complete";
  const hasApprovedVideo = step.video?.approvedUrl && step.video?.approvedByAdmin;
  const nextLabel = NEXT_BUTTON_LABELS[step.stepType] || "Continue →";

  // Render illustration placeholder (never show raw prompts)
  const renderIllustration = () => {
    if (!step.illustrationPrompt) return null;
    // Convert raw prompt to learner-friendly description
    const friendlyDesc = step.illustrationPrompt
      .replace(/^A child measuring/, "Measuring")
      .replace(/^A /, "")
      .replace(/^Colourful illustration showing/, "Picture of")
      .replace(/^Science illustration showing/, "Science picture of")
      .replace(/^Visual examples of/, "Examples of")
      .replace(/^Hands-on practice with/, "Practicing")
      .replace(/^A celebration scene with/, "Celebrating with")
      .replace(/^A mission banner for/, "Goal:")
      .replace(/^A friendly owl teacher welcoming a (young )?student to a lesson about/, "Learning about")
      .replace(/^Objects of different sizes with measurement labels:/, "Different sized objects:")
      .replace(/\s*grade\s*\d.*$/i, "")
      .replace(/\s*with maths objects.*$/i, "")
      .replace(/\s*with labelled diagrams$/i, "")
      .replace(/\s*with counters and number lines$/i, "")
      .replace(/\s*with stars and confetti$/i, "")
      .replace(/\s*looking at a goal$/i, "")
      .replace(/\s*on a quest, exploring and measuring things$/i, " on an adventure")
      .replace(/\s*choosing an answer about.*$/i, " choosing an answer")
      .replace(/\s*writing a reflection$/i, " writing thoughts")
      .trim() || "A helpful picture for this lesson";

    return (
      <div className="my-5 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-purple-50/60 border border-indigo-200/50 p-5 flex flex-col items-center gap-3">
        <div className="w-full h-40 rounded-xl bg-white/60 border-2 border-dashed border-indigo-200 flex flex-col items-center justify-center gap-2">
          <span className="text-5xl">{icon}</span>
          <span className="text-xs font-semibold text-indigo-400">🖼️ Picture coming soon</span>
        </div>
        <p className="text-xs text-indigo-500 font-medium text-center">{friendlyDesc}</p>
      </div>
    );
  };

  return (
    <div className={`rounded-2xl border-2 ${theme.border} ${theme.bg} p-6 lg:p-8 shadow-sm`}>
      {/* Step header */}
      <div className="flex items-center gap-4 mb-5">
        <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-extrabold bg-gradient-to-br ${theme.gradient} text-white shadow-lg`}>
          {stepNumber}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-extrabold text-xl lg:text-2xl ${theme.accent} flex items-center gap-2`}>
            <span className="text-2xl">{icon}</span> {step.title}
          </h3>
          <span className="text-xs font-semibold text-slate-400">Step {stepNumber} of {totalSteps}</span>
        </div>
      </div>

      {/* Owl guide — large speech bubble */}
      {step.owlText && (
        <div className="mb-6 flex items-start gap-3 px-5 py-4 rounded-2xl bg-white/90 border border-slate-200 shadow-sm">
          <span className="text-4xl flex-shrink-0">🦉</span>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Owl Teacher</p>
            <p className="text-slate-700 text-base leading-relaxed font-medium italic">{step.owlText}</p>
          </div>
        </div>
      )}

      {/* Math display */}
      {step.mathDisplay && (
        <div className="mb-5 px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
          <span className="text-xl font-mono font-bold text-slate-800">{step.mathDisplay}</span>
        </div>
      )}

      {/* Content paragraphs */}
      <div className="flex flex-col gap-4 mb-5">
        {paragraphs.map((p, i) => (
          <p key={i} className="text-slate-700 text-base lg:text-lg leading-relaxed whitespace-pre-line">{p}</p>
        ))}
      </div>

      {/* Illustration */}
      {renderIllustration()}

      {/* Video */}
      {hasApprovedVideo && (
        <div className="my-5 rounded-2xl bg-gradient-to-br from-blue-50/80 to-cyan-50/60 border border-blue-200/50 p-5 flex flex-col items-center gap-2">
          <div className="w-full h-40 rounded-xl bg-white/60 border-2 border-dashed border-blue-200 flex flex-col items-center justify-center gap-1">
            <span className="text-4xl">▶️</span><span className="text-sm font-semibold text-blue-600">Video</span>
          </div>
          {step.video?.approvedUrl && <a href={step.video.approvedUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-blue-600 underline hover:text-blue-800">Watch video →</a>}
        </div>
      )}

      {/* Materials */}
      {step.materials && step.materials.length > 0 && (
        <div className="mt-4 px-4 py-3 rounded-xl bg-amber-50/60 border border-amber-200/50">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 mb-1.5">🧰 What you might need:</p>
          <div className="flex flex-wrap gap-1.5">
            {step.materials.map((m: string, i: number) => <span key={i} className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">{m}</span>)}
          </div>
        </div>
      )}

      {/* ── Prediction step (think_first) ── */}
      {step.stepType === "think_first" && step.interaction?.question && (
        <div className="mt-4 px-5 py-4 rounded-xl bg-amber-50 border border-amber-200">
          <p className="text-sm font-bold text-amber-900 mb-2 flex items-center gap-1.5"><HelpCircle className="w-4 h-4" /> {step.interaction.question}</p>
          <textarea value={interaction.predictionText} onChange={e => setInteraction((p: any) => ({ ...p, predictionText: e.target.value }))}
            placeholder="Type your guess here..."
            className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-white text-base text-slate-800 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-amber-300" rows={3} />
          {interaction.predictionText.trim() && <p className="text-xs text-amber-600 mt-2 font-medium">✓ Your guess is saved! Click Next to continue.</p>}
        </div>
      )}

      {/* ── Guided Practice (practice) ── */}
      {step.stepType === "practice" && (
        <div className="mt-4 px-5 py-4 rounded-xl bg-sky-50 border border-sky-200">
          <p className="text-sm font-bold text-sky-900 mb-3 flex items-center gap-1.5"><Pencil className="w-4 h-4" /> Record your measurements</p>
          <p className="text-xs text-sky-700 mb-3">Write down 3 things that can be measured in metres:</p>
          {[0, 1, 2].map(i => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-sky-200 text-sky-800 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
              <input value={interaction.practiceEntries[i] || ""} onChange={e => {
                const entries = [...interaction.practiceEntries]; entries[i] = e.target.value;
                setInteraction((p: any) => ({ ...p, practiceEntries: entries }));
              }} placeholder={`Thing ${i + 1} (e.g., "classroom door")`}
                className="flex-1 px-3 py-2 rounded-lg border border-sky-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300" />
            </div>
          ))}
          {interaction.practiceEntries.some((e: string) => e.trim()) && <p className="text-xs text-sky-600 mt-2 font-medium">✓ Measurements saved! Click Next to continue.</p>}
        </div>
      )}

      {/* ── Quick Check (multiple choice) ── */}
      {step.stepType === "quick_check" && step.interaction?.type === "multiple_choice" && step.interaction.question && (
        <div className="mt-4 px-5 py-4 rounded-xl bg-lime-50 border border-lime-200">
          <p className="text-sm font-bold text-lime-900 mb-1 flex items-center gap-1.5"><HelpCircle className="w-4 h-4" /> Quick Check</p>
          <p className="text-base font-semibold text-lime-800 mb-3">{step.interaction.question}</p>
          {step.interaction.options && step.interaction.options.length > 0 && (
            <div className="flex flex-col gap-2">
              {step.interaction.options.map((opt: string, i: number) => {
                const isSelected = interaction.selectedChoice === i;
                const isCorrect = i === step.interaction?.correctAnswer;
                const showFeedback = interaction.choiceFeedback !== null;
                let btnClass = "bg-white border-lime-200 text-lime-800 hover:bg-lime-50";
                if (isSelected && !showFeedback) btnClass = "bg-lime-600 text-white border-lime-600 shadow-md";
                if (showFeedback && isSelected && isCorrect) btnClass = "bg-emerald-600 text-white border-emerald-600 shadow-md";
                if (showFeedback && isSelected && !isCorrect) btnClass = "bg-orange-500 text-white border-orange-500 shadow-md";
                if (showFeedback && !isSelected && isCorrect) btnClass = "bg-emerald-100 border-emerald-400 text-emerald-800";
                return (
                  <button key={i} onClick={() => {
                    if (interaction.choiceFeedback !== null) return; // already answered
                    const correct = i === step.interaction?.correctAnswer;
                    setInteraction((p: any) => ({ ...p, selectedChoice: i, choiceFeedback: correct ? "correct" : "incorrect" }));
                  }} disabled={interaction.choiceFeedback !== null}
                    className={`text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all border-2 ${btnClass} disabled:cursor-default`}>
                    <span className="mr-2">{String.fromCharCode(65 + i)}.</span> {opt}
                  </button>
                );
              })}
            </div>
          )}
          {interaction.choiceFeedback === "correct" && (
            <div className="mt-3 px-4 py-2.5 rounded-xl bg-emerald-100 border border-emerald-300">
              <p className="text-sm font-bold text-emerald-800">✅ Correct! Well done! {step.interaction.hint || ""}</p>
            </div>
          )}
          {interaction.choiceFeedback === "incorrect" && (
            <div className="mt-3 px-4 py-2.5 rounded-xl bg-orange-100 border border-orange-300">
              <p className="text-sm font-bold text-orange-800">Not quite. {step.interaction.hint || "Think about it again!"} Try a different answer.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Self check (non-multiple-choice) ── */}
      {step.stepType === "quick_check" && step.interaction?.type === "self_check" && step.interaction.question && (
        <div className="mt-4 px-5 py-4 rounded-xl bg-lime-50 border border-lime-200">
          <p className="text-sm font-bold text-lime-900 mb-1">✅ Check yourself:</p>
          <p className="text-base font-semibold text-lime-800 mb-3">{step.interaction.question}</p>
          <div className="flex gap-2">
            <button onClick={() => setInteraction((p: any) => ({ ...p, selfChecked: true }))}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${interaction.selfChecked === true ? "bg-emerald-600 text-white border-emerald-600" : "bg-white border-lime-200 text-lime-700 hover:bg-lime-50"}`}>
              ✓ Yes, I got it!
            </button>
            <button onClick={() => setInteraction((p: any) => ({ ...p, selfChecked: false }))}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${interaction.selfChecked === false ? "bg-orange-500 text-white border-orange-500" : "bg-white border-orange-200 text-orange-600 hover:bg-orange-50"}`}>
              ↺ I need more practice
            </button>
          </div>
        </div>
      )}

      {/* ── Reflection step ── */}
      {step.stepType === "reflect" && (
        <div className="mt-4 px-5 py-4 rounded-xl bg-rose-50 border border-rose-200">
          <p className="text-sm font-bold text-rose-900 mb-1 flex items-center gap-1.5"><MessageCircle className="w-4 h-4" /> Reflection Time</p>
          <p className="text-base font-semibold text-rose-800 mb-3">{step.interaction?.question || "What did you learn today?"}</p>

          {/* Reflection chips */}
          {step.reflectionOptions && step.reflectionOptions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {step.reflectionOptions.map((opt: string, i: number) => (
                <button key={i} onClick={() => setInteraction((p: any) => ({ ...p, reflectionChip: p.reflectionChip === i ? null : i }))}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                    interaction.reflectionChip === i ? "bg-rose-600 text-white border-rose-600 shadow-sm" : "bg-white border-rose-200 text-rose-700 hover:bg-rose-50"
                  }`}>{opt}</button>
              ))}
            </div>
          )}

          <textarea value={interaction.reflectionText} onChange={e => setInteraction((p: any) => ({ ...p, reflectionText: e.target.value }))}
            placeholder="Write what you learned... (optional)"
            className="w-full px-4 py-3 rounded-xl border border-rose-200 bg-white text-base text-slate-800 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-rose-300" rows={3} />

          {(interaction.reflectionText.trim() || interaction.reflectionChip !== null) && !interaction.reflectionSaved && (
            <button onClick={onSaveReflection} className="mt-2 px-4 py-2 rounded-xl bg-rose-600 text-white text-sm font-bold hover:bg-rose-700 transition-colors">
              💾 Save Reflection
            </button>
          )}
          {interaction.reflectionSaved && <p className="text-xs text-rose-600 mt-2 font-medium">✓ Reflection saved!</p>}
        </div>
      )}

      {/* ── Completion step ── */}
      {isComplete && (
        <div className="mt-4 text-center">
          <div className="text-5xl mb-3">🏆</div>
          <h3 className="text-xl font-extrabold text-slate-900 mb-2">You did it!</h3>
          <p className="text-slate-600 text-base">You've completed this lesson. Great work!</p>
        </div>
      )}
    </div>
  );
}
