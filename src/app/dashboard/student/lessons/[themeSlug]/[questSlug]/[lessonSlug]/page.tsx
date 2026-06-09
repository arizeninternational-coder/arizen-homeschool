"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback, useRef, Component, ReactNode } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ArrowLeft, CheckCircle2, Zap, BookOpen, Flame,
  Target, Star, ChevronRight, ChevronLeft, RotateCcw, Eye,
  Pencil, HelpCircle, Trophy, MessageCircle, Play,
  Map, Sparkles
} from "lucide-react";
import { GradientButton } from "@/components/ui/Pill";
import OwlTeacher from "@/components/ui/OwlTeacher";
// confetti is dynamically imported in fireConfetti to avoid SSR issues
import type { JourneyStep, JourneyStepType, JourneyInteraction } from "@/lib/curriculum/lesson-journey";
import { STEP_TYPE_ICONS, buildUniversalJourney } from "@/lib/curriculum/lesson-journey";

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

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

const STEP_LABELS: Record<JourneyStepType, string> = {
  welcome: "Welcome", mission: "Mission", think_first: "Predict",
  learn: "Learn", connect: "Connect", example: "Example",
  practice: "Practice", quick_check: "Check", reflect: "Reflect", complete: "Done",
};

const NEXT_BUTTON_LABELS: Record<JourneyStepType, string> = {
  welcome: "Start Mission", mission: "I'm Ready", think_first: "Save My Guess",
  learn: "I Understand", connect: "Continue", example: "Show Practice",
  practice: "Save Measurements", quick_check: "Check Answer",
  reflect: "Continue to Finish", complete: "",
};

const OWL_EXPRESSIONS: Record<JourneyStepType, 'happy' | 'thinking' | 'encouraging' | 'celebrating'> = {
  welcome: "happy", mission: "encouraging", think_first: "thinking",
  learn: "happy", connect: "encouraging", example: "happy",
  practice: "encouraging", quick_check: "thinking", reflect: "happy", complete: "celebrating",
};

const STEP_THEME: Record<JourneyStepType, { accent: string; bg: string; border: string; gradient: string; softBg: string; iconBg: string; iconColor: string }> = {
  welcome:    { accent: "text-indigo-700", bg: "bg-indigo-50/60",   border: "border-indigo-200/60", gradient: "from-indigo-500 to-purple-500", softBg: "from-indigo-50/80 to-purple-50/50", iconBg: "bg-indigo-100", iconColor: "text-indigo-600" },
  mission:    { accent: "text-violet-700",  bg: "bg-violet-50/60",   border: "border-violet-200/60", gradient: "from-violet-500 to-purple-500", softBg: "from-violet-50/80 to-purple-50/50", iconBg: "bg-violet-100", iconColor: "text-violet-600" },
  think_first:{ accent: "text-amber-700",   bg: "bg-amber-50/60",    border: "border-amber-200/60",  gradient: "from-amber-500 to-orange-500", softBg: "from-amber-50/80 to-orange-50/50", iconBg: "bg-amber-100", iconColor: "text-amber-600" },
  learn:      { accent: "text-emerald-700", bg: "bg-emerald-50/60",  border: "border-emerald-200/60", gradient: "from-emerald-500 to-teal-500", softBg: "from-emerald-50/80 to-teal-50/50", iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
  connect:    { accent: "text-teal-700",    bg: "bg-teal-50/60",     border: "border-teal-200/60",    gradient: "from-teal-500 to-cyan-500", softBg: "from-teal-50/80 to-cyan-50/50", iconBg: "bg-teal-100", iconColor: "text-teal-600" },
  example:    { accent: "text-cyan-700",    bg: "bg-cyan-50/60",     border: "border-cyan-200/60",    gradient: "from-cyan-500 to-blue-500", softBg: "from-cyan-50/80 to-blue-50/50", iconBg: "bg-cyan-100", iconColor: "text-cyan-600" },
  practice:   { accent: "text-sky-700",     bg: "bg-sky-50/60",      border: "border-sky-200/60",     gradient: "from-sky-500 to-blue-500", softBg: "from-sky-50/80 to-blue-50/50", iconBg: "bg-sky-100", iconColor: "text-sky-600" },
  quick_check:{ accent: "text-lime-700",    bg: "bg-lime-50/60",     border: "border-lime-200/60",    gradient: "from-lime-500 to-green-500", softBg: "from-lime-50/80 to-green-50/50", iconBg: "bg-lime-100", iconColor: "text-lime-600" },
  reflect:    { accent: "text-rose-700",    bg: "bg-rose-50/60",     border: "border-rose-200/60",    gradient: "from-rose-500 to-pink-500", softBg: "from-rose-50/80 to-pink-50/50", iconBg: "bg-rose-100", iconColor: "text-rose-600" },
  complete:   { accent: "text-yellow-700",  bg: "bg-yellow-50/60",   border: "border-yellow-200/60",  gradient: "from-yellow-500 to-amber-500", softBg: "from-yellow-50/80 to-amber-50/50", iconBg: "bg-yellow-100", iconColor: "text-yellow-600" },
};

const CELEBRATION_CSS = `
@keyframes float { 0% { transform: translateY(0) rotate(0deg); opacity: .8 } 100% { transform: translateY(-20px) rotate(15deg); opacity: 1 } }
@keyframes popIn { 0% { transform: scale(.5); opacity: 0 } 70% { transform: scale(1.1) } 100% { transform: scale(1); opacity: 1 } }
@keyframes xpBurst { 0% { transform: scale(1) } 50% { transform: scale(1.3) } 100% { transform: scale(1) } }
@keyframes shimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }
@keyframes slideUp { 0% { transform: translateY(20px); opacity: 0 } 100% { transform: translateY(0); opacity: 1 } }
@keyframes pulse-glow { 0%,100% { box-shadow: 0 0 0 0 rgba(79,70,229,.3) } 50% { box-shadow: 0 0 0 8px rgba(79,70,229,0) } }
@keyframes sparkle { 0%,100% { opacity:0; transform: scale(0) rotate(0deg) } 50% { opacity:1; transform: scale(1) rotate(180deg) } }
`;

/* ─── Sub-components ─── */

function OwlGuideInline({ step }: { step: JourneyStep }) {
  if (!step.owlText) return null;
  const expression = OWL_EXPRESSIONS[step.stepType] || 'happy';
  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-gradient-to-br from-sky-50/90 via-indigo-50/60 to-purple-50/40 border border-sky-200/50 shadow-sm">
      <div className="flex-shrink-0 mt-0.5">
        <OwlTeacher size={44} expression={expression} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-sky-600/70 mb-0.5">Owl Teacher says:</p>
        <p className="text-slate-700 text-sm leading-relaxed font-medium">{step.owlText}</p>
      </div>
    </div>
  );
}

function IllustrationArea({ step, stepType }: { step: JourneyStep; stepType: JourneyStepType }) {
  const approvedUrl = step.media?.illustration?.approvedUrl;
  const theme = STEP_THEME[stepType];
  const icon = STEP_TYPE_ICONS[stepType] || "📖";

  if (approvedUrl) {
    return (
      <div className="rounded-2xl overflow-hidden border border-slate-200/50 shadow-sm">
        <img src={approvedUrl} alt="Lesson illustration" className="w-full h-auto max-h-[220px] object-cover" />
      </div>
    );
  }

  const prompt = step.illustrationPrompt;
  if (!prompt) return null;

  const friendlyDesc = prompt
    .replace(/^A (child|student|young learner) (measuring|choosing|writing|looking at|thinking about|on a quest|celebrating with)/i, (_, _p, action) => action.charAt(0).toUpperCase() + action.slice(1))
    .replace(/^A friendly owl teacher welcoming a (young )?student to a lesson about/i, "Learning about")
    .replace(/^A mission banner for/i, "Goal:")
    .replace(/^Colourful illustration showing/i, "Picture of")
    .replace(/^Science illustration showing/i, "Science picture of")
    .replace(/^Visual examples of/i, "Examples of")
    .replace(/^Hands-on practice with/i, "Practicing")
    .replace(/^A celebration scene with/i, "Celebrating with")
    .replace(/^Objects of different sizes with measurement labels:/i, "Different sized objects:")
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
    <div className={`rounded-2xl border-2 border-dashed ${theme.border} overflow-hidden`}>
      <div className={`bg-gradient-to-br ${theme.softBg} p-5 flex flex-col items-center gap-2.5`}>
        <div className={`w-12 h-12 rounded-xl ${theme.iconBg} flex items-center justify-center`}>
          <span className="text-xl">{icon}</span>
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Illustration</p>
        <p className={`text-sm font-semibold ${theme.accent} text-center max-w-xs leading-snug`}>{friendlyDesc}</p>
      </div>
    </div>
  );
}

function VideoArea({ step }: { step: JourneyStep }) {
  const videoData = step.media?.video || step.video;
  const hasApproved = videoData?.approvedUrl && videoData?.approvedByAdmin === true;
  const searchKeywordsStr = Array.isArray(videoData?.searchKeywords) ? videoData.searchKeywords.join(', ') : (videoData?.searchKeywords || '');
  const hasSearchKeywords = searchKeywordsStr.trim().length > 0;
  const hasSuggestedUrl = videoData?.suggestedUrl;

  if (hasApproved) {
    const videoId = extractYouTubeId(videoData!.approvedUrl!);
    const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : null;

    return (
      <div className="rounded-2xl border border-blue-200/50 overflow-hidden bg-gradient-to-br from-blue-50/80 to-cyan-50/60 shadow-sm">
        <div className="px-4 py-2.5 flex items-center gap-2 border-b border-blue-200/40">
          <Play className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold text-blue-700">Watch</span>
        </div>
        {embedUrl ? (
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <iframe
              src={embedUrl}
              title={videoData!.approvedTitle || "Lesson video"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        ) : (
          <div className="p-4 text-center">
            <a href={videoData!.approvedUrl!} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-blue-600 underline hover:text-blue-800">
              Watch video →
            </a>
          </div>
        )}
      </div>
    );
  }

  if (hasSuggestedUrl) {
    const videoId = extractYouTubeId(videoData!.suggestedUrl!);
    if (videoId) {
      return (
        <div className="rounded-2xl border border-amber-200/50 overflow-hidden bg-gradient-to-br from-amber-50/80 to-yellow-50/60 shadow-sm">
          <div className="px-4 py-2.5 flex items-center gap-2 border-b border-amber-200/40">
            <Play className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold text-amber-700">Suggested Video (pending approval)</span>
          </div>
          <div className="p-4 text-center">
            <a href={videoData!.suggestedUrl!} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-amber-600 underline hover:text-amber-800">
              Preview on YouTube →
            </a>
          </div>
        </div>
      );
    }
  }

  if (hasSearchKeywords) {
    return (
      <div className="rounded-2xl border border-slate-200/50 bg-slate-50/60 p-4 flex items-center gap-3">
        <Play className="w-5 h-5 text-slate-400 flex-shrink-0" />
        <div>
          <p className="text-xs font-bold text-slate-500">Video coming soon</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Search: {searchKeywordsStr}</p>
        </div>
      </div>
    );
  }

  return null;
}

/* ─── Fallback Quick Check Interaction Builder ─── */

function buildFallbackQuickCheckInteraction(step: JourneyStep): JourneyInteraction | null {
  // If step already has a valid interaction with a recognized type, return null (use as-is)
  if (step.interaction && step.interaction.type && step.interaction.type !== "none") {
    return null; // signal: use existing interaction
  }

  const text = step.studentText || "";
  const title = step.title || "";
  const combined = `${title} ${text}`;

  // Detect numbered questions (1. 2. 3. or 1) 2) 3))
  const numberedQ = combined.match(/(?:\d+[.)]\s*[^\n]+)/g);

  // Detect option lists: patterns like "greater than, less than, or equal to"
  // or lines starting with -, *, a), b), A), B)
  const optionPatterns = combined.match(/(?:^|\n)\s*(?:[-*]|[a-dA-D][.)])\s*[^\n]+/g);

  // Detect blanks (___)
  const hasBlanks = /_{3,}/.test(combined);

  // Detect yes/no or self-check patterns
  const isYesNo = /\b(yes|no|true|false|agree|disagree)\b/i.test(combined) &&
    (/\?/.test(combined) || /check|decide|choose/i.test(combined));

  // Detect simple math questions (contains = ? or "what is")
  const isMath = /\bwhat\s+is\b.*[=?]|[0-9]\s*[+−×÷]\s*[0-9].*\?/.test(combined);

  // If we found option patterns, build multiple_choice
  if (optionPatterns && optionPatterns.length >= 2) {
    const options = optionPatterns.map(o => o.replace(/^\s*(?:[-*]|[a-dA-D][.)])\s*/, "").trim()).filter(Boolean);
    if (options.length >= 2) {
      return {
        type: "multiple_choice",
        question: step.interaction?.question || step.interaction?.prompt || title || "Quick Check",
        options,
        correctAnswer: undefined, // no answer key — will use self-check style
        hint: "Think carefully about each option before choosing!",
      };
    }
  }

  // If we found numbered questions, build multiple_choice from them
  if (numberedQ && numberedQ.length >= 2) {
    const options = numberedQ.map(q => q.replace(/^\d+[.)]\s*/, "").trim()).filter(Boolean);
    if (options.length >= 2) {
      return {
        type: "multiple_choice",
        question: step.interaction?.question || step.interaction?.prompt || title || "Quick Check",
        options,
        correctAnswer: undefined,
        hint: "Read each option carefully and pick the one you think is right!",
      };
    }
  }

  // If it's a yes/no or self-check pattern
  if (isYesNo || hasBlanks || isMath) {
    return {
      type: "self_check",
      question: step.interaction?.question || step.interaction?.prompt || title || "Quick Check",
      hint: "Take your time and think through your answer!",
    };
  }

  // Default: self-check with the student text as the prompt
  return {
    type: "self_check",
    question: step.interaction?.question || step.interaction?.prompt || "Can you answer this question?",
    hint: "Try your best — there's no wrong effort here!",
  };
}

/* ─── Normalize interaction type from DB ─── */
function normalizeInteractionType(type: string | undefined): string {
  if (!type || type === "none") return "none";
  if (type === "choice") return "multiple_choice"; // DB uses "choice", code expects "multiple_choice"
  return type;
}

/* ─── Slide Step View ─── */

function SlideStepView({ step, stepNumber, totalSteps, interaction, setInteraction, lesson, onSaveReflection }: {
  step: JourneyStep; stepNumber: number; totalSteps: number;
  interaction: any; setInteraction: any; lesson: any;
  onSaveReflection: () => Promise<void>;
}) {
  if (!step) return null;
  const theme = STEP_THEME[step.stepType] || STEP_THEME.welcome;
  const paragraphs = splitIntoParagraphs(step.studentText);
  const isComplete = step.stepType === "complete";

  // Effective interaction: for quick_check steps, normalize type and apply fallback if missing
  const _rawQcInteraction = step.stepType === "quick_check" ? (step.interaction || null) : null;
  const _existingQcInteraction = _rawQcInteraction && _rawQcInteraction.type && _rawQcInteraction.type !== "none" ? _rawQcInteraction : null;
  const _fallbackQcInteraction = !_existingQcInteraction && step.stepType === "quick_check" ? buildFallbackQuickCheckInteraction(step) : null;
  const effectiveQcInteraction = _existingQcInteraction || _fallbackQcInteraction; // JourneyInteraction | null
  const normalizedQcType = normalizeInteractionType(effectiveQcInteraction?.type);
  // Use effective interaction for quick_check, otherwise use step.interaction as-is
  const effectiveInteraction = step.stepType === "quick_check" ? effectiveQcInteraction : (step.interaction || null);
  const normalizedType = step.stepType === "quick_check" ? normalizedQcType : normalizeInteractionType(step.interaction?.type);
  // Question text: support both `question` and `prompt` field names (DB uses `prompt`)
  const effectiveQuestion = effectiveInteraction?.question || effectiveInteraction?.prompt || null;

  // Safe Owl text for Quick Check: encourage without revealing answers
  // For quick_check steps, replace owlText with a safe encouraging version
  const safeOwlText = step.stepType === "quick_check"
    ? "Let's see what you remember! Take your time and think carefully. There's no rush — you've got this!"
    : step.owlText;

  // Determine if student text adds value beyond the owl message
  // For welcome/mission steps, the owl text IS the main content — skip redundant body
  const isOwlPrimaryStep = ["welcome", "mission", "complete"].includes(step.stepType);
  const studentTextAddsValue = !isOwlPrimaryStep && paragraphs.length > 0;

  return (
    <div className="flex flex-col">
      {/* Step header badge */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${theme.gradient} text-white shadow-md`}>
          <span className="text-lg font-black">{stepNumber}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className={`font-black text-xl lg:text-2xl ${theme.accent} tracking-tight leading-tight`}>{step.title}</h2>
          <span className="text-[11px] font-semibold text-slate-400">Step {stepNumber} of {totalSteps}</span>
        </div>
      </div>

      {/* For owl-primary steps (welcome, mission, complete), show owl as the main content */}
      {isOwlPrimaryStep && safeOwlText ? (
        <div className="flex items-start gap-3 px-5 py-4 rounded-2xl bg-gradient-to-br from-sky-50/90 via-indigo-50/60 to-purple-50/40 border border-sky-200/50 shadow-sm">
          <div className="flex-shrink-0 mt-0.5">
            <OwlTeacher size={48} expression={OWL_EXPRESSIONS[step.stepType] || 'happy'} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-sky-600/70 mb-1">Owl Teacher says:</p>
            <p className="text-slate-700 text-base lg:text-lg leading-relaxed font-medium">{safeOwlText}</p>
          </div>
        </div>
      ) : (
        <>
          {/* For other steps, show owl guidance inline (compact) */}
          <OwlGuideInline step={step} />
          {/* Student text is the main content for non-owl-primary steps */}
          {studentTextAddsValue && (
            <div className="mt-4 flex flex-col gap-3">
              {paragraphs.map((p, i) => (
                <p key={i} className="text-slate-700 text-base lg:text-lg leading-relaxed whitespace-pre-line">{p}</p>
              ))}
            </div>
          )}
        </>
      )}

      {/* Math display */}
      {step.mathDisplay && (
        <div className="mt-4 px-5 py-4 rounded-xl bg-slate-50 border border-slate-200/60 text-center">
          <span className="text-xl font-mono font-bold text-slate-800">{step.mathDisplay}</span>
        </div>
      )}

      {/* Illustration */}
      <div className="mt-4">
        <IllustrationArea step={step} stepType={step.stepType} />
      </div>

      {/* Video */}
      <div className="mt-4">
        <VideoArea step={step} />
      </div>

      {/* Materials */}
      {step.materials && step.materials.length > 0 && (
        <div className="mt-4 px-4 py-3 rounded-xl bg-amber-50/60 border border-amber-200/50">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 mb-1.5">What you might need:</p>
          <div className="flex flex-wrap gap-1.5">
            {step.materials.map((m: string, i: number) => <span key={i} className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">{m}</span>)}
          </div>
        </div>
      )}

      {/* ── Prediction step ── */}
      {step.stepType === "think_first" && step.interaction?.question && (
        <div className="mt-4 px-5 py-4 rounded-xl bg-amber-50/80 border border-amber-200/60">
          <p className="text-base font-bold text-amber-900 mb-2 flex items-center gap-2"><HelpCircle className="w-4 h-4" /> {step.interaction.question}</p>
          <textarea value={interaction.predictionText} onChange={e => setInteraction((p: any) => ({ ...p, predictionText: e.target.value }))}
            placeholder="Type your guess here..."
            className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-white text-base text-slate-800 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-amber-300" rows={3} />
          {interaction.predictionText.trim() && <p className="text-xs text-amber-600 mt-1.5 font-semibold">✓ Your guess is saved! Click Next to continue.</p>}
        </div>
      )}

      {/* ── Guided Practice ── */}
      {step.stepType === "practice" && (
        <div className="mt-4 px-5 py-4 rounded-xl bg-sky-50/80 border border-sky-200/60">
          <p className="text-base font-bold text-sky-900 mb-1.5 flex items-center gap-2"><Pencil className="w-4 h-4" /> Record your measurements</p>
          <p className="text-xs text-sky-700 mb-3">Write down 3 things that can be measured in metres:</p>
          {[0, 1, 2].map(i => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <span className="w-7 h-7 rounded-lg bg-sky-200 text-sky-800 text-xs font-black flex items-center justify-center flex-shrink-0">{i + 1}</span>
              <input value={interaction.practiceEntries[i] || ""} onChange={e => {
                const entries = [...interaction.practiceEntries]; entries[i] = e.target.value;
                setInteraction((p: any) => ({ ...p, practiceEntries: entries }));
              }} placeholder={`Thing ${i + 1} (e.g., "classroom door")`}
                className="flex-1 px-3 py-2.5 rounded-xl border border-sky-200 bg-white text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300" />
            </div>
          ))}
          {interaction.practiceEntries.some((e: string) => e.trim()) && <p className="text-xs text-sky-600 mt-1.5 font-semibold">✓ Measurements saved! Click Next to continue.</p>}
        </div>
      )}

      {/* ── Quick Check (multiple choice) ── */}
      {step.stepType === "quick_check" && normalizedType === "multiple_choice" && effectiveQuestion && (
        <div className="mt-4 px-5 py-4 rounded-xl bg-lime-50/80 border border-lime-200/60">
          <p className="text-base font-bold text-lime-900 mb-0.5 flex items-center gap-2"><HelpCircle className="w-4 h-4" /> Quick Check</p>
          <p className="text-lg font-bold text-lime-800 mb-3">{effectiveQuestion}</p>
          {effectiveInteraction?.options && effectiveInteraction.options.length > 0 && (
            <div className="flex flex-col gap-2">
              {effectiveInteraction.options.map((opt: string, i: number) => {
                const isSelected = interaction.selectedChoice === i;
                const hasCorrectAnswer = effectiveInteraction?.correctAnswer !== undefined && effectiveInteraction?.correctAnswer !== null;
                const isCorrect = hasCorrectAnswer ? i === effectiveInteraction?.correctAnswer : true; // if no answer key, treat all as valid
                const showFeedback = interaction.choiceFeedback !== null;
                let btnClass = "bg-white border-lime-200 text-lime-800 hover:bg-lime-50 hover:shadow-md";
                if (isSelected && !showFeedback) btnClass = "bg-lime-600 text-white border-lime-600 shadow-lg shadow-lime-200";
                if (showFeedback && isSelected && isCorrect) btnClass = "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-200";
                if (showFeedback && isSelected && !isCorrect) btnClass = "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-200";
                if (showFeedback && !isSelected && isCorrect && hasCorrectAnswer) btnClass = "bg-emerald-100 border-emerald-400 text-emerald-800";
                return (
                  <button key={i} onClick={() => {
                    if (interaction.choiceFeedback !== null) return;
                    const correct = hasCorrectAnswer ? i === effectiveInteraction?.correctAnswer : true;
                    setInteraction((p: any) => ({ ...p, selectedChoice: i, choiceFeedback: correct ? "correct" : "incorrect" }));
                  }} disabled={interaction.choiceFeedback !== null}
                    className={`text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all border-2 ${btnClass} disabled:cursor-default`}>
                    <span className="mr-2 text-base">{String.fromCharCode(65 + i)}.</span> {opt}
                  </button>
                );
              })}
            </div>
          )}
          {interaction.choiceFeedback === "correct" && (
            <div className="mt-3 px-4 py-2.5 rounded-xl bg-emerald-100 border border-emerald-300">
              <p className="text-sm font-bold text-emerald-800">
                ✅ {effectiveInteraction?.hint || "Great job thinking through this!"}
              </p>
            </div>
          )}
          {interaction.choiceFeedback === "incorrect" && (
            <div className="mt-3 px-4 py-2.5 rounded-xl bg-orange-100 border border-orange-300">
              <p className="text-sm font-bold text-orange-800">Not quite. {effectiveInteraction?.hint || "Think about it again!"} Try a different answer.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Self check (also used as fallback when no correctAnswer in multiple_choice) ── */}
      {step.stepType === "quick_check" && (normalizedType === "self_check" || (normalizedType === "multiple_choice" && effectiveInteraction?.correctAnswer == null && interaction.selectedChoice !== undefined && !interaction.choiceFeedback)) && effectiveQuestion && (
        <div className="mt-4 px-5 py-4 rounded-xl bg-lime-50/80 border border-lime-200/60">
          <p className="text-base font-bold text-lime-900 mb-0.5 flex items-center gap-2"><HelpCircle className="w-4 h-4" /> Quick Check</p>
          <p className="text-lg font-bold text-lime-800 mb-3">{effectiveQuestion}</p>
          <p className="text-sm text-lime-700 mb-3 italic">Take a moment to think about your answer. There's no rush — trust your learning!</p>
          <div className="flex gap-2">
            <button onClick={() => setInteraction((p: any) => ({ ...p, selfChecked: true }))}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${interaction.selfChecked === true ? "bg-emerald-600 text-white border-emerald-600 shadow-lg" : "bg-white border-lime-200 text-lime-700 hover:bg-lime-50"}`}>
              ✓ Yes, I worked it out!
            </button>
            <button onClick={() => setInteraction((p: any) => ({ ...p, selfChecked: false }))}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${interaction.selfChecked === false ? "bg-orange-500 text-white border-orange-500 shadow-lg" : "bg-white border-orange-200 text-orange-600 hover:bg-orange-50"}`}>
              ↺ I want to review again
            </button>
          </div>
          {interaction.selfChecked === true && (
            <div className="mt-3 px-4 py-2.5 rounded-xl bg-emerald-100 border border-emerald-300">
              <p className="text-sm font-bold text-emerald-800">🌟 Wonderful! Keep up the great thinking!</p>
            </div>
          )}
          {interaction.selfChecked === false && (
            <div className="mt-3 px-4 py-2.5 rounded-xl bg-amber-100 border border-amber-300">
              <p className="text-sm font-bold text-amber-800">👍 That's okay! Reviewing helps us learn even more.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Reflection step ── */}
      {step.stepType === "reflect" && (
        <div className="mt-4 px-5 py-4 rounded-xl bg-rose-50/80 border border-rose-200/60">
          <p className="text-base font-bold text-rose-900 mb-0.5 flex items-center gap-2"><MessageCircle className="w-4 h-4" /> Reflection Time</p>
          <p className="text-lg font-bold text-rose-800 mb-3">{step.interaction?.question || "What did you learn today?"}</p>

          {step.reflectionOptions && step.reflectionOptions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {step.reflectionOptions.map((opt: string, i: number) => (
                <button key={i} onClick={() => setInteraction((p: any) => ({ ...p, reflectionChip: p.reflectionChip === i ? null : i }))}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border-2 ${
                    interaction.reflectionChip === i ? "bg-rose-600 text-white border-rose-600 shadow-md" : "bg-white border-rose-200 text-rose-700 hover:bg-rose-50"
                  }`}>{opt}</button>
              ))}
            </div>
          )}

          <textarea value={interaction.reflectionText} onChange={e => setInteraction((p: any) => ({ ...p, reflectionText: e.target.value }))}
            placeholder="Write what you learned... (optional)"
            className="w-full px-4 py-3 rounded-xl border border-rose-200 bg-white text-base text-slate-800 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-rose-300" rows={3} />

          {(interaction.reflectionText.trim() || interaction.reflectionChip !== null) && !interaction.reflectionSaved && (
            <button onClick={onSaveReflection} className="mt-2.5 px-4 py-2 rounded-xl bg-rose-600 text-white text-sm font-bold hover:bg-rose-700 transition-colors shadow-md">
              💾 Save Reflection
            </button>
          )}
          {interaction.reflectionSaved && <p className="text-xs text-rose-600 mt-1.5 font-semibold">✓ Reflection saved!</p>}
        </div>
      )}

      {/* ── Completion step ── */}
      {isComplete && (
        <div className="mt-4 text-center py-4">
          <div className="flex justify-center mb-3"><OwlTeacher size={72} expression="celebrating" /></div>
          <h3 className="text-xl lg:text-2xl font-black text-slate-900 mb-1">You did it! 🏆</h3>
          <p className="text-slate-600 text-base lg:text-lg">You've completed this lesson. Great work!</p>
        </div>
      )}
    </div>
  );
}

/* ─── Compact Support Panel (right sidebar) ─── */

function SupportPanel({ lesson, journeySteps, currentStep, xp, subject, grade, onStepClick }: {
  lesson: any; journeySteps: JourneyStep[]; currentStep: number; xp: number; subject: string; grade: number;
  onStepClick: (i: number) => void;
}) {
  const missionStep = journeySteps.find(s => s.stepType === "mission");

  return (
    <div className="space-y-3 sticky top-4">
      {/* Mission Card */}
      <div className="rounded-2xl border border-violet-200/50 bg-gradient-to-br from-violet-50/80 to-purple-50/60 p-4 shadow-sm">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Target className="w-3.5 h-3.5 text-violet-600" />
          <h3 className="font-bold text-violet-800 text-xs">Today's Mission</h3>
        </div>
        <p className="text-violet-700 text-xs leading-relaxed font-medium">{missionStep?.studentText?.slice(0, 120) || "Complete this lesson to learn something new!"}</p>
      </div>

      {/* Lesson Map */}
      <div className="rounded-2xl border border-slate-200/50 bg-white/80 backdrop-blur-sm p-4 shadow-sm">
        <div className="flex items-center gap-1.5 mb-2">
          <Map className="w-3.5 h-3.5 text-slate-500" />
          <h3 className="font-bold text-slate-800 text-xs">Lesson Map</h3>
        </div>
        <div className="space-y-0.5">
          {journeySteps.map((s, i) => (
            <button key={i} onClick={() => onStepClick(i)} className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-all text-[11px] font-semibold ${
              i === currentStep ? "bg-indigo-100/80 text-indigo-800 shadow-sm" : i < currentStep ? "bg-emerald-50/80 text-emerald-700" : "text-slate-600 hover:bg-slate-50/80"
            }`}>
              <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] flex-shrink-0 ${
                i === currentStep ? "bg-gradient-to-br from-indigo-500 to-purple-500 text-white" : i < currentStep ? "bg-emerald-200 text-emerald-700" : "bg-slate-100 text-slate-500"
              }`}>
                {i < currentStep ? "✓" : (STEP_TYPE_ICONS[s.stepType] || "•")}
              </span>
              <span className="truncate">{STEP_LABELS[s.stepType] || s.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Rewards */}
      {xp > 0 && (
        <div className="rounded-2xl border border-amber-200/50 bg-gradient-to-br from-amber-50/80 to-yellow-50/60 p-4 shadow-sm">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Star className="w-3.5 h-3.5 text-amber-600" />
            <h3 className="font-bold text-amber-800 text-xs">Rewards</h3>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-1 text-amber-700"><Zap className="w-3.5 h-3.5" /><span className="font-bold text-xs">{xp} XP</span></div>
            <div className="flex items-center gap-1 text-amber-700"><Flame className="w-3.5 h-3.5" /><span className="font-bold text-xs">{Math.floor(xp / 2)} coins</span></div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Error Boundary ─── */

interface ErrorBoundaryState { error: Error | null; errorInfo: string; }
interface ErrorBoundaryProps { children: ReactNode; fallback?: ReactNode; }

class JourneyErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null, errorInfo: "" };
  }
  static getDerivedStateFromError(error: Error) {
    return { error, errorInfo: error.stack || error.message };
  }
  render() {
    if (this.state.error) {
      return this.props.fallback || (
        <div className="p-8 text-center">
          <p className="text-lg font-bold text-red-600 mb-2">Something went wrong displaying this lesson step.</p>
          <details className="text-left bg-red-50 p-4 rounded-lg text-xs font-mono text-red-800 max-w-xl mx-auto mt-4">
            <summary className="cursor-pointer font-bold mb-2">Show error details</summary>
            <pre className="whitespace-pre-wrap break-all">{this.state.error.message}\n\n{this.state.errorInfo}</pre>
          </details>
          <button onClick={() => this.setState({ error: null, errorInfo: "" })} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold">Try Again</button>
        </div>
      );
    }
    return this.props.children;
  }
}

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

  // Next step label for the slide-style Next button
  const nextStepLabel = !isLastStep && journeySteps[clampedStep + 1]
    ? (STEP_LABELS[journeySteps[clampedStep + 1].stepType] || journeySteps[clampedStep + 1].title)
    : null;

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

  const fireConfetti = useCallback(async () => {
    try {
      const confetti = (await import("canvas-confetti")).default;
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ["#2DD4BF", "#F59E0B", "#3B82F6", "#EC4899", "#10B981"] });
      setTimeout(() => confetti({ particleCount: 40, angle: 60, spread: 55, origin: { x: 0, y: 0.6 }, colors: ["#2DD4BF", "#F59E0B", "#3B82F6"] }), 150);
      setTimeout(() => confetti({ particleCount: 40, angle: 120, spread: 55, origin: { x: 1, y: 0.6 }, colors: ["#EC4899", "#10B981", "#F59E0B"] }), 300);
      setTimeout(() => confetti({ particleCount: 30, spread: 100, origin: { y: 0.5 }, shapes: ["star"], colors: ["#FFD700", "#FFA500"], scalar: 1.5 }), 500);
    } catch { /* non-blocking */ }
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
      setInteraction((prev: any) => ({ ...prev, reflectionSaved: true }));
    } catch { /* non-blocking */ }
  }, [interaction.reflectionText, interaction.reflectionChip, currentJourneyStep, lesson]);

  const goNext = useCallback(() => {
    if (currentJourneyStep?.stepType === "complete") {
      if (!completed) handleComplete();
    } else if (!isLastStep) {
      setCurrentStep(clampedStep + 1);
    }
  }, [currentJourneyStep, completed, isLastStep, clampedStep, handleComplete]);

  const goBack = useCallback(() => {
    if (clampedStep > 0) setCurrentStep(clampedStep - 1);
  }, [clampedStep]);

  /* ─── loading state ─── */
  if (loading) return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-5 bg-white rounded-3xl p-12 shadow-lg border border-slate-100">
          <OwlTeacher size={80} expression="happy" />
          <p className="text-lg font-bold text-slate-500">Loading your lesson...</p>
          <div className="relative w-8 h-8"><div className="absolute inset-0 rounded-full border-[3px] border-indigo-200/30" /><div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-indigo-500 animate-spin" /></div>
        </div>
      </div>
    </div>
  );

  /* ─── Journey Slide View ─── */
  if (viewing) {
    // Debug: log journey data to console
    console.log("[LessonPlayer] viewing=true, journeySteps:", journeySteps.length, "source:", journeySource, "isJourney:", isJourney);
    if (journeySteps.length > 0) {
      console.log("[LessonPlayer] step types:", journeySteps.map(s => s.stepType));
      console.log("[LessonPlayer] first step:", JSON.stringify(journeySteps[0], null, 2));
    }

    const stepLabel = currentJourneyStep ? (STEP_LABELS[currentJourneyStep.stepType] || "Next") : "Next";
    const theme = (currentJourneyStep ? STEP_THEME[currentJourneyStep.stepType] : STEP_THEME.welcome) || STEP_THEME.welcome;

    console.log("[LessonPlayer] about to render journey view, currentJourneyStep:", currentJourneyStep?.stepType, "theme:", theme?.accent);

    return (
      <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col overflow-hidden">
        <style>{CELEBRATION_CSS}</style>

        {/* ── Compact Top Bar ── */}
        <div className="relative z-10 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 px-4 py-2.5 flex-shrink-0 shadow-sm">
          <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button onClick={() => { setViewing(false); setShowCelebration(false); setCurrentStep(0); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition-all">
                <ArrowLeft className="w-3.5 h-3.5" /> {completed ? "Exit" : "Back"}
              </button>
              <div className="min-w-0">
                <h1 className="font-extrabold text-slate-900 text-sm lg:text-base truncate tracking-tight">{cleanTitle(lesson?.title)}</h1>
                {subject && <p className="text-[10px] text-slate-500 font-semibold">{subject}{grade ? ` · Grade ${grade}` : ""}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {isJourney && <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">{clampedStep + 1}/{totalSteps}</span>}
              {xp > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/50">
                  <Zap className="w-3 h-3" /> +{xp} XP
                </span>
              )}
              {justCompleted ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/50">
                  <CheckCircle2 className="w-3 h-3" /> Done
                </span>
              ) : completed ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200/50">
                  <Eye className="w-3 h-3" /> Review
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/50">
                  <Pencil className="w-3 h-3" /> In Progress
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Progress Bar ── */}
        {isJourney && totalSteps > 0 && (
          <div className="relative z-10 bg-white/60 backdrop-blur-sm border-b border-slate-200/40 px-4 py-2 flex-shrink-0">
            <div className="max-w-[1200px] mx-auto">
              <div className="flex gap-1">
                {journeySteps.map((s, i) => (
                  <button key={i} onClick={() => setCurrentStep(i)} className="flex-1 group" title={STEP_LABELS[s.stepType] || s.title}>
                    <div className={`h-1.5 rounded-full transition-all duration-500 ${
                      i < clampedStep
                        ? "bg-gradient-to-r from-emerald-400 to-teal-400"
                        : i === clampedStep
                        ? `bg-gradient-to-r ${theme.gradient}`
                        : "bg-slate-200/60 group-hover:bg-slate-300/60"
                    }`} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Main Content Area ── */}
        <div className="flex-1 overflow-y-auto relative z-10">
          <div className="max-w-[1200px] mx-auto px-4 py-5 flex gap-5">

            {/* ── Main Slide Card ── */}
            <div className="flex-1 min-w-0 max-w-[720px]">

              {/* Celebration overlay */}
              {showCelebration && xpEarned > 0 && (
                <div className="rounded-2xl p-8 mb-5 text-center overflow-hidden border-2 border-indigo-200/50 shadow-xl bg-gradient-to-br from-indigo-50 via-amber-50/50 to-rose-50/50">
                  <div className="relative z-10">
                    <div className="flex justify-center mb-3"><OwlTeacher size={80} expression="celebrating" /></div>
                    <h2 className="text-2xl lg:text-3xl font-black text-slate-900 mb-2 tracking-tight">Lesson Complete!</h2>
                    <p className="text-slate-600 text-base lg:text-lg mb-4 font-medium">You worked hard and learned something amazing!</p>
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white shadow-lg border border-indigo-100">
                        <Zap className="w-5 h-5 text-indigo-600" /><span className="text-2xl font-black text-indigo-600">+{xpEarned}</span><span className="text-sm font-bold text-slate-500">XP</span>
                      </div>
                      {streakCount > 0 && (
                        <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white shadow-lg border border-pink-100">
                          <Flame className="w-5 h-5 text-pink-500" /><span className="text-2xl font-black text-pink-500">+{streakCount}</span><span className="text-sm font-bold text-slate-500">streak</span>
                        </div>
                      )}
                    </div>
                    {newBadges.length > 0 && (
                      <div className="mt-4 flex gap-2 justify-center flex-wrap">
                        {newBadges.map((b, i) => (
                          <div key={i} className="rounded-xl border-2 border-purple-200/60 bg-white px-3 py-2 flex items-center gap-1.5 shadow-md">
                            <span className="text-lg">🏅</span><span className="font-bold text-xs text-slate-800">{b}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-5 flex gap-3 justify-center flex-wrap">
                      <button onClick={() => { setViewing(false); setShowCelebration(false); setCurrentStep(0); }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border-2 border-slate-200/60 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all active:scale-[0.98] shadow-sm">
                        <ArrowLeft className="w-4 h-4" /> Back to Quest
                      </button>
                      <button onClick={() => { setShowCelebration(false); setCurrentStep(0); }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-sm hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg shadow-indigo-200/50 active:scale-[0.98]">
                        <RotateCcw className="w-4 h-4" /> Review Lesson
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Current step slide */}
              {isJourney && currentJourneyStep ? (
                <JourneyErrorBoundary>
                <div className={`rounded-2xl border-2 ${theme.border} bg-white p-6 lg:p-8 shadow-lg`}>
                  <SlideStepView step={currentJourneyStep} stepNumber={clampedStep + 1} totalSteps={totalSteps}
                    interaction={interaction} setInteraction={setInteraction} lesson={lesson} onSaveReflection={handleSaveReflection} />
                </div>
                </JourneyErrorBoundary>
              ) : journeySteps.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {journeySteps.map((s, i) => (
                    <div key={s.id} className="rounded-2xl border-2 border-slate-200/60 bg-white p-6 lg:p-8 shadow-lg">
                      <SlideStepView step={s} stepNumber={i + 1} totalSteps={journeySteps.length}
                        interaction={interaction} setInteraction={setInteraction} lesson={lesson} onSaveReflection={handleSaveReflection} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200/50 bg-white text-center p-10 shadow-lg">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3"><BookOpen className="w-6 h-6 text-slate-400" /></div>
                  <h3 className="text-lg font-extrabold text-slate-800 mb-1">This lesson is being prepared</h3>
                  <p className="text-slate-500 text-sm font-medium">Please check back soon.</p>
                </div>
              )}

              {completeError && (
                <div className="mt-4 rounded-xl border border-red-300/50 bg-red-50 p-4 text-center shadow-sm">
                  <p className="text-sm font-bold text-red-700">{completeError}</p>
                  <button onClick={() => setCompleteError(null)} className="mt-1.5 text-xs text-red-500 underline hover:text-red-700 font-semibold">Dismiss</button>
                </div>
              )}
            </div>

            {/* ── Right Support Panel (desktop) ── */}
            <div className="hidden lg:block w-[260px] flex-shrink-0">
              <SupportPanel lesson={lesson} journeySteps={journeySteps} currentStep={clampedStep} xp={xp} subject={subject} grade={grade} onStepClick={setCurrentStep} />
            </div>
          </div>
        </div>

        {/* ── Bottom Navigation Bar ── */}
        {isJourney && currentJourneyStep && (
          <div className="relative z-10 bg-white/90 backdrop-blur-xl border-t border-slate-200/60 px-4 py-3 flex-shrink-0 shadow-[0_-2px_12px_rgba(0,0,0,0.04)]">
            <div className="max-w-[1200px] mx-auto flex items-center gap-3">

              {/* Back button — compact floating style */}
              {clampedStep > 0 ? (
                <button onClick={goBack}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all active:scale-[0.97]">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              ) : (
                <div className="w-20" />
              )}

              {/* Step dots (mobile) */}
              <div className="flex-1 flex items-center justify-center gap-1.5 lg:hidden">
                {journeySteps.map((_, i) => (
                  <button key={i} onClick={() => setCurrentStep(i)} className={`w-2 h-2 rounded-full transition-all ${
                    i === clampedStep ? "bg-indigo-500 w-6" : i < clampedStep ? "bg-emerald-400" : "bg-slate-300"
                  }`} />
                ))}
              </div>

              {/* Spacer for desktop */}
              <div className="flex-1 hidden lg:block" />

              {/* Next / Complete button — slide-style card */}
              {currentJourneyStep.stepType === "complete" ? (
                <div className="flex gap-2">
                  {!completed ? (
                    <button onClick={handleComplete} disabled={completing}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-200/50 disabled:opacity-50 active:scale-[0.97]">
                      {completing ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Earning...</> : <><Trophy className="w-4 h-4" /> Finish +{xp} XP</>}
                    </button>
                  ) : (
                    <button onClick={() => { setViewing(false); setShowCelebration(false); setCurrentStep(0); }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-sm hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg shadow-indigo-200/50 active:scale-[0.97]">
                      <RotateCcw className="w-4 h-4" /> Review
                    </button>
                  )}
                </div>
              ) : (
                <button onClick={goNext}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-[0.97] ${
                    isLastStep
                      ? "bg-slate-100 text-slate-500 cursor-default"
                      : `bg-gradient-to-r ${theme.gradient} text-white shadow-lg hover:brightness-110`
                  }`}
                  disabled={isLastStep && !completed}>
                  <span>{NEXT_BUTTON_LABELS[currentJourneyStep.stepType] || "Next"}</span>
                  {nextStepLabel && <span className="text-xs opacity-75 hidden sm:inline">— {nextStepLabel}</span>}
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ─── Landing Page ─── */
  return (
    <div className="fade-in max-w-[760px] mx-auto">
      <div className="relative rounded-3xl p-8 lg:p-10 mb-6 overflow-hidden border border-indigo-200/50 shadow-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-white/5" />
        </div>
        <div className="relative z-10">
          {slugs && (
            <Link href={`/dashboard/student/lessons/${slugs.themeSlug}/${slugs.questSlug}`} className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-semibold mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Quest
            </Link>
          )}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {completed && <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 text-white px-2.5 py-1 rounded-full">✓ Completed</span>}
            {subject && <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 text-white px-2.5 py-1 rounded-full">{subject}{grade ? ` · Grade ${grade}` : ""}</span>}
            {xp > 0 && <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-400/80 text-white px-2.5 py-1 rounded-full flex items-center gap-1"><Zap className="w-3 h-3" /> {xp} XP</span>}
          </div>
          <h1 className="text-3xl lg:text-4xl font-black text-white mb-2 tracking-tight">{cleanTitle(lesson?.title)}</h1>
          {lesson?.description && <p className="text-white/85 text-lg leading-relaxed">{lesson.description}</p>}
        </div>
      </div>

      {completed && (
        <div className="rounded-2xl border border-blue-200/50 bg-gradient-to-br from-blue-50/80 to-indigo-50/60 text-center p-6 mb-5 shadow-lg">
          <CheckCircle2 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <p className="font-bold text-blue-800">You've completed this lesson!</p>
          <p className="text-blue-600 text-sm mt-1">Review the content or move on to the next lesson.</p>
        </div>
      )}

      {isJourney && (
        <div className="rounded-2xl border border-indigo-200/50 bg-indigo-50/60 p-5 mb-5 flex items-center gap-4 shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center flex-shrink-0"><Sparkles className="w-6 h-6 text-indigo-600" /></div>
          <div>
            <p className="text-base font-bold text-indigo-800">{totalSteps}-step interactive lesson</p>
            <p className="text-sm text-indigo-600/80 font-medium">Work through each step to complete the lesson</p>
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
        {completed ? "Review Lesson" : isJourney ? `Begin ${totalSteps}-Step Journey` : "Start Lesson"}
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
