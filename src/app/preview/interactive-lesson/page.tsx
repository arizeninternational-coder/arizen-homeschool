"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  ChevronRight, ChevronLeft, Trophy, Zap,
  AlertTriangle, CheckCircle2, RotateCcw, Home
} from "lucide-react";
import { InteractiveStepRenderer, ExtendedJourneyStep } from "@/components/interactive";

// Load fixture data directly — no Supabase, no auth
import goldStandardFixture from "@/data/fixtures/gold-standard-fractions.json";

const LESSON = goldStandardFixture;
const JOURNEY: ExtendedJourneyStep[] = (LESSON.contentBlocks?.studentJourney || []) as unknown as ExtendedJourneyStep[];

const STEP_META: Record<string, { icon: string; label: string; color: string; gradient: string; border: string; accent: string }> = {
  welcome:     { icon: "🦉", label: "Welcome",     color: "text-indigo-700", gradient: "from-indigo-500 to-purple-500", border: "border-indigo-200/60", accent: "text-indigo-700" },
  mission:     { icon: "🎯", label: "Mission",     color: "text-violet-700", gradient: "from-violet-500 to-purple-500", border: "border-violet-200/60", accent: "text-violet-700" },
  think_first: { icon: "💭", label: "Predict",     color: "text-amber-700", gradient: "from-amber-500 to-orange-500", border: "border-amber-200/60", accent: "text-amber-700" },
  learn:       { icon: "📖", label: "Learn",       color: "text-emerald-700", gradient: "from-emerald-500 to-teal-500", border: "border-emerald-200/60", accent: "text-emerald-700" },
  connect:     { icon: "🔗", label: "Connect",     color: "text-teal-700",   gradient: "from-teal-500 to-cyan-500",   border: "border-teal-200/60",   accent: "text-teal-700" },
  example:     { icon: "💡", label: "Example",     color: "text-cyan-700",   gradient: "from-cyan-500 to-blue-500",   border: "border-cyan-200/60",   accent: "text-cyan-700" },
  practice:    { icon: "✏️", label: "Practice",    color: "text-sky-700",    gradient: "from-sky-500 to-blue-500",    border: "border-sky-200/60",    accent: "text-sky-700" },
  quick_check: { icon: "✅", label: "Check",       color: "text-lime-700",   gradient: "from-lime-500 to-green-500",  border: "border-lime-200/60",   accent: "text-lime-700" },
  reflect:     { icon: "🪞", label: "Reflect",     color: "text-rose-700",   gradient: "from-rose-500 to-pink-500",   border: "border-rose-200/60",   accent: "text-rose-700" },
  complete:    { icon: "🏆", label: "Done",        color: "text-yellow-700", gradient: "from-yellow-500 to-amber-500", border: "border-yellow-200/60", accent: "text-yellow-700" },
};

function getMeta(type: string) { return STEP_META[type] || STEP_META.welcome; }

export default function PreviewInteractiveLesson() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const hasCompletedRef = useRef(false);
  const [interaction, setInteraction] = useState<any>({
    predictionText: "", selectedChoice: null, choiceFeedback: null,
    selectedChoiceId: null, choiceSubmitted: false, selfChecked: null,
    reflectionText: "", reflectionChips: [], reflectionSaved: false,
  });

  useEffect(() => {
    setInteraction({
      predictionText: "", selectedChoice: null, choiceFeedback: null,
      selectedChoiceId: null, choiceSubmitted: false, selfChecked: null,
      reflectionText: "", reflectionChips: [], reflectionSaved: false,
    });
  }, [currentStep]);

  const totalSteps = JOURNEY.length;
  const isLastStep = currentStep >= totalSteps - 1;
  const clampedStep = Math.min(currentStep, Math.max(totalSteps - 1, 0));
  const step = totalSteps > 0 ? JOURNEY[clampedStep] : null;
  const meta = step ? getMeta(step.stepType) : getMeta("welcome");

  const handleNext = useCallback(() => {
    if (isLastStep) {
      if (!hasCompletedRef.current) {
        hasCompletedRef.current = true;
        setCompleted(true);
        setXpEarned(50);
      }
    } else {
      setCurrentStep((s) => Math.min(totalSteps - 1, s + 1));
    }
  }, [isLastStep, totalSteps]);

  const handlePrev = useCallback(() => {
    setCurrentStep((s) => Math.max(0, s - 1));
  }, []);

  const handleRestart = () => {
    setCurrentStep(0);
    setCompleted(false);
    setXpEarned(0);
    hasCompletedRef.current = false;
  };

  if (!step && totalSteps === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-10 shadow-lg border border-slate-100 max-w-md">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800 mb-2">No journey steps</h3>
          <p className="text-sm text-slate-500">The gold-standard fixture could not be loaded.</p>
        </div>
      </div>
    );
  }

  if (!step) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Preview banner */}
      <div className="bg-amber-500 text-white px-4 py-2 text-center text-sm font-bold">
        ⚠️ PREVIEW MODE — Gold Standard Fractions Lesson — Not for production use
      </div>

      {/* Top bar */}
      <div className="bg-white border-b border-slate-200/60 px-4 py-3 flex-shrink-0 shadow-sm">
        <div className="max-w-[780px] mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <a href="/" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition-all">
              <Home className="w-3.5 h-3.5" /> Home
            </a>
            <div className="min-w-0">
              <h1 className="font-extrabold text-slate-900 text-sm truncate">{LESSON.title}</h1>
              <p className="text-[10px] text-slate-500 font-semibold">Preview · {totalSteps} steps · No data saved</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {xpEarned > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg">
                <Zap className="w-3 h-3" /> +{xpEarned} XP
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {totalSteps > 0 && (
        <div className="px-4 py-2 bg-white border-b border-slate-100">
          <div className="max-w-[780px] mx-auto">
            <div className="flex gap-1">
              {JOURNEY.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentStep(i)}
                  className={`flex-1 h-1.5 rounded-full transition-all ${
                    i < clampedStep
                      ? "bg-gradient-to-r from-emerald-400 to-teal-400"
                      : i === clampedStep
                      ? "bg-gradient-to-r " + getMeta(s.stepType).gradient
                      : "bg-slate-200/60"
                  }`}
                  title={getMeta(s.stepType).label + ": " + s.title}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[780px] mx-auto px-4 py-6">
          {completed ? (
            <div className="text-center bg-white rounded-2xl p-10 shadow-lg border border-slate-100">
              <Trophy className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <h2 className="text-2xl font-black text-slate-800 mb-2">Lesson Complete!</h2>
              <p className="text-slate-600 mb-2">
                You earned <span className="font-bold text-amber-600">+{xpEarned} XP</span>
              </p>
              {step?.rewardText && (
                <p className="text-sm text-slate-500 italic mb-6">{step.rewardText}</p>
              )}
              <p className="text-xs text-amber-600 font-semibold mb-6">
                ⚠️ This is a preview. No data has been saved.
              </p>
              <button
                onClick={handleRestart}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 text-white font-bold text-sm hover:bg-indigo-600 transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Play Again
              </button>
            </div>
          ) : (
            <div className={"rounded-2xl border-2 " + meta.border + " bg-white p-6 lg:p-8 shadow-lg"}>
              {/* Step header */}
              <div className="flex items-center gap-3 mb-5">
                <div className={"flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br " + meta.gradient + " text-white shadow-md"}>
                  <span className="text-lg font-black">{clampedStep + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className={"font-black text-xl lg:text-2xl " + meta.accent + " tracking-tight leading-tight"}>
                    {step.title}
                  </h2>
                  <span className="text-[11px] font-semibold text-slate-400">
                    Step {clampedStep + 1} of {totalSteps}
                  </span>
                </div>
              </div>

              {/* Owl guidance */}
              {step.owlText && (
                <div className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-gradient-to-br from-sky-50/90 via-indigo-50/60 to-purple-50/40 border border-sky-200/50 shadow-sm mb-5">
                  <span className="text-2xl flex-shrink-0">🦉</span>
                  <p className="text-slate-700 text-sm leading-relaxed font-medium">{step.owlText}</p>
                </div>
              )}

              {/* Interactive step renderer */}
              <InteractiveStepRenderer
                step={step}
                stepNumber={clampedStep + 1}
                totalSteps={totalSteps}
                interaction={interaction}
                setInteraction={setInteraction}
                onNext={handleNext}
              />
            </div>
          )}
        </div>
      </div>

      {/* Bottom navigation */}
      {!completed && (
        <div className="sticky bottom-0 z-10 bg-white/90 backdrop-blur-md border-t border-slate-200 flex-shrink-0">
          <div className="max-w-[780px] mx-auto px-4 py-3 flex items-center justify-between gap-3">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <span className="text-xs text-slate-400 font-medium">
              {Math.round(((clampedStep + 1) / totalSteps) * 100)}% complete
            </span>
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-600 transition-all"
            >
              {isLastStep ? "Finish" : "Next"}
              {isLastStep ? <CheckCircle2 className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
