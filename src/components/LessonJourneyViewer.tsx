"use client";

import { useState, useCallback, createContext, useContext } from "react";
import {
  ChevronRight, ChevronLeft, Play, Pause, Settings, Eye, Edit3,
  Sparkles, Upload, Video, Trash2, Archive, ArchiveRestore,
  Send, CheckCircle, AlertTriangle, Clock, BookOpen, Target,
  Star, Flame, Map, X, Loader2, MessageCircle, Zap, Award,
  HelpCircle, Pencil, RotateCcw, Image, Link2, ExternalLink,
  FileText, Users, MoreVertical, ChevronDown, Search, Filter
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────────
   LessonJourneyViewer — Shared component for student + admin-editor modes
   
   Modes:
   - "student": read-only journey for students
   - "admin-editor": full editing + publishing controls for admins
   
   This replaces the duplicated lesson rendering logic across:
   - src/app/dashboard/student/lessons/[themeSlug]/[questSlug]/[lessonSlug]/page.tsx
   - src/app/dashboard/admin/lessons/[id]/page.tsx (preview section)
   ───────────────────────────────────────────────────────────────────────────── */

// ── Types ────────────────────────────────────────────────────────────────────

export interface JourneyStep {
  id: string;
  stepType: string;
  title: string;
  studentText: string;
  owlText: string;
  mathDisplay?: string;
  visualType?: string;
  illustrationPrompt?: string;
  interaction?: {
    type: string;
    question?: string;
    options?: string[];
    correctAnswer?: number | string;
    hint?: string;
    parentInstructions?: string;
  };
  reflectionOptions?: string[];
  materials?: string[];
  video?: any;
  media?: {
    illustration?: any;
    video?: any;
  };
  estimatedMinutes?: number;
}

export interface LessonData {
  id: string;
  title: string;
  slug: string;
  description?: string;
  status: string;
  xpReward: number;
  coinReward?: number;
  subject?: string;
  grade?: number;
  contentBlocks?: any;
  journey?: JourneyStep[];
  quest?: {
    id: string;
    title: string;
    slug?: string;
    theme?: {
      id: string;
      title: string;
      slug?: string;
      grade: number;
    };
  };
}

export interface ViewerPermissions {
  canEdit: boolean;
  canPublish: boolean;
  canArchive: boolean;
  canDelete: boolean;
  canManageMedia: boolean;
}

interface ViewerContextValue {
  mode: "student" | "admin-editor";
  lesson: LessonData | null;
  journey: JourneyStep[];
  currentStep: number;
  setCurrentStep: (n: number) => void;
  permissions: ViewerPermissions;
  stepInteraction: any;
  setStepInteraction: (v: any) => void;
  onEditStep?: (stepIndex: number, field: string, value: any) => void;
  onGenerateIllustration?: (stepIndex: number) => void;
  onUploadIllustration?: (stepIndex: number) => void;
  onAddVideo?: (stepIndex: number, url: string, title: string) => void;
  onApproveVideo?: (stepIndex: number) => void;
  onRemoveMedia?: (stepIndex: number, type: "illustration" | "video") => void;
  onPublish?: () => void;
  onUnpublish?: () => void;
  onArchive?: () => void;
  onRestore?: () => void;
  onToggleAvailability?: () => void;
  onSaveChanges?: () => void;
  publishLoading?: boolean;
  saveLoading?: boolean;
  isAvailable?: boolean;
  needsReview?: boolean;
  missingMedia?: { illustrations: number; videos: number };
  completed?: boolean;
  justCompleted?: boolean;
  showCelebration?: boolean;
  xpEarned?: number;
  streakCount?: number;
  onComplete?: () => void;
  onExit?: () => void;
  isMobile?: boolean;
}

const ViewerContext = createContext<ViewerContextValue | null>(null);
export const useViewer = () => useContext(ViewerContext)!;

// ── Shared sub-components ────────────────────────────────────────────────────

const STEP_TYPE_META: Record<string, { icon: string; label: string; color: string; bg: string; border: string; gradient: string }> = {
  welcome:    { icon: "🦉", label: "Welcome", color: "text-indigo-700", bg: "bg-indigo-50/60", border: "border-indigo-200/60", gradient: "from-indigo-500 to-purple-500" },
  mission:    { icon: "🎯", label: "Mission", color: "text-violet-700", bg: "bg-violet-50/60", border: "border-violet-200/60", gradient: "from-violet-500 to-purple-500" },
  think_first:{ icon: "💭", label: "Predict", color: "text-amber-700", bg: "bg-amber-50/60", border: "border-amber-200/60", gradient: "from-amber-500 to-orange-500" },
  learn:      { icon: "📖", label: "Learn", color: "text-emerald-700", bg: "bg-emerald-50/60", border: "border-emerald-200/60", gradient: "from-emerald-500 to-teal-500" },
  connect:    { icon: "🔗", label: "Connect", color: "text-teal-700", bg: "bg-teal-50/60", border: "border-teal-200/60", gradient: "from-teal-500 to-cyan-500" },
  example:    { icon: "💡", label: "Example", color: "text-cyan-700", bg: "bg-cyan-50/60", border: "border-cyan-200/60", gradient: "from-cyan-500 to-blue-500" },
  practice:   { icon: "✏️", label: "Practice", color: "text-sky-700", bg: "bg-sky-50/60", border: "border-sky-200/60", gradient: "from-sky-500 to-blue-500" },
  quick_check:{ icon: "✅", label: "Check", color: "text-lime-700", bg: "bg-lime-50/60", border: "border-lime-200/60", gradient: "from-lime-500 to-green-500" },
  reflect:    { icon: "🪞", label: "Reflect", color: "text-rose-700", bg: "bg-rose-50/60", border: "border-rose-200/60", gradient: "from-rose-500 to-pink-500" },
  complete:   { icon: "🏆", label: "Done", color: "text-yellow-700", bg: "bg-yellow-50/60", border: "border-yellow-200/60", gradient: "from-yellow-500 to-amber-500" },
};

export function getStepMeta(stepType: string) {
  return STEP_TYPE_META[stepType] || STEP_TYPE_META.welcome;
}

// ProgressBar — slim, colored segments
export function ViewerProgressBar({ steps, currentStep, onStepClick, className = "" }: {
  steps: JourneyStep[]; currentStep: number; onStepClick: (i: number) => void; className?: string;
}) {
  const meta = steps[currentStep] ? getStepMeta(steps[currentStep].stepType) : getStepMeta("welcome");
  return (
    <div className={className}>
      <div className="flex gap-1">
        {steps.map((s, i) => (
          <button key={i} onClick={() => onStepClick(i)} className="flex-1 group" title={`${getStepMeta(s.stepType).label}: ${s.title}`}>
            <div className={`h-1.5 rounded-full transition-all duration-500 ${
              i < currentStep
                ? "bg-gradient-to-r from-emerald-400 to-teal-400"
                : i === currentStep
                ? `bg-gradient-to-r ${meta.gradient}`
                : "bg-slate-200/60 group-hover:bg-slate-300/60"
            }`} />
          </button>
        ))}
      </div>
    </div>
  );
}

// StepHeader — badge + title
export function ViewerStepHeader({ step, stepNumber, totalSteps, editable, onEdit }: {
  step: JourneyStep; stepNumber: number; totalSteps: number;
  editable?: boolean; onEdit?: (field: string, value: any) => void;
}) {
  const meta = getStepMeta(step.stepType);
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${meta.gradient} text-white shadow-md`}>
        <span className="text-lg font-black">{stepNumber}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h2 className={`font-black text-xl lg:text-2xl ${meta.accent} tracking-tight leading-tight`}>{step.title}</h2>
        <span className="text-[11px] font-semibold text-slate-400">Step {stepNumber} of {totalSteps}</span>
      </div>
      {editable && onEdit && (
        <button onClick={() => onEdit("title", step.title)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
          <Edit3 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// OwlGuide — single inline owl message (not duplicated)
export function ViewerOwlGuide({ step, editable, onEdit }: { step: JourneyStep; editable?: boolean; onEdit?: (field: string, value: any) => void }) {
  if (!step.owlText) return null;
  const expressionMap: Record<string, "happy" | "thinking" | "encouraging" | "celebrating"> = {
    welcome: "happy", mission: "encouraging", think_first: "thinking",
    learn: "happy", connect: "encouraging", example: "happy",
    practice: "encouraging", quick_check: "thinking", reflect: "happy", complete: "celebrating",
  };
  const expression = expressionMap[step.stepType] || "happy";

  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-gradient-to-br from-sky-50/90 via-indigo-50/60 to-purple-50/40 border border-sky-200/50 shadow-sm mb-4">
      <OwlIcon size={44} expression={expression} />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-sky-600/70 mb-0.5">Owl Teacher says:</p>
        {editable && onEdit ? (
          <textarea
            value={step.owlText}
            onChange={e => onEdit("owlText", e.target.value)}
            className="w-full bg-transparent text-slate-700 text-sm leading-relaxed font-medium resize-none focus:outline-none"
            rows={2}
          />
        ) : (
          <p className="text-slate-700 text-sm leading-relaxed font-medium">{step.owlText}</p>
        )}
      </div>
    </div>
  );
}

// OwlIcon — simplified SVG mascot (inline to avoid import issues)
function OwlIcon({ size = 44, expression = "happy" }: { size?: number; expression?: string }) {
  const eyes = expression === "celebrating" ? "★★" : expression === "thinking" ? "◔◕" : "◕◕";
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className="flex-shrink-0">
      <defs>
        <radialGradient id={`owl-${expression}`} cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#D4A574" />
          <stop offset="100%" stopColor="#A67B5B" />
        </radialGradient>
      </defs>
      <ellipse cx="60" cy="65" rx="35" ry="40" fill={`url(#owl-${expression})`} />
      <ellipse cx="60" cy="72" rx="22" ry="25" fill="#FFF8F0" />
      <circle cx="48" cy="52" r="14" fill="#FFF8F0" />
      <circle cx="72" cy="52" r="14" fill="#FFF8F0" />
      <text x="48" y="57" textAnchor="middle" fontSize="12" fill="#1a1a1a">{eyes[0] || "◕"}</text>
      <text x="72" y="57" textAnchor="middle" fontSize="12" fill="#1a1a1a">{eyes[1] || "◕"}</text>
      <path d="M54 68 L60 76 L66 68" fill="#FFB347" />
      <ellipse cx="38" cy="62" rx="8" ry="12" fill="#C4956A" opacity="0.6" />
      <ellipse cx="82" cy="62" rx="8" ry="12" fill="#C4956A" opacity="0.6" />
    </svg>
  );
}

// IllustrationArea — shared between modes
export function ViewerIllustrationArea({ step, adminMode, onGenerate, onUpload, generating }: {
  step: JourneyStep; adminMode?: boolean;
  onGenerate?: () => void; onUpload?: () => void; generating?: boolean;
}) {
  const approvedUrl = step.media?.illustration?.approvedUrl;
  const meta = getStepMeta(step.stepType);
  const icon = meta.icon;

  if (approvedUrl) {
    return (
      <div className="rounded-2xl overflow-hidden border border-slate-200/50 shadow-sm mt-4">
        <img src={approvedUrl} alt="Lesson illustration" className="w-full h-auto max-h-[220px] object-cover" />
      </div>
    );
  }

  const prompt = step.illustrationPrompt;
  if (!prompt && !adminMode) return null;

  return (
    <div className={`rounded-2xl border-2 border-dashed ${meta.border} overflow-hidden mt-4`}>
      <div className={`bg-gradient-to-br ${meta.softBg || ""} p-5 flex flex-col items-center gap-2.5`}>
        <div className={`w-12 h-12 rounded-xl ${meta.iconBg || "bg-slate-100"} flex items-center justify-center`}>
          <span className="text-xl">{icon}</span>
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Illustration</p>
        {prompt && (
          <p className={`text-sm font-semibold ${meta.accent} text-center max-w-xs leading-snug`}>{prompt}</p>
        )}
        {adminMode && (
          <div className="flex gap-2 mt-1">
            {onGenerate && (
              <button onClick={onGenerate} disabled={generating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500 text-white text-xs font-bold hover:bg-indigo-600 disabled:opacity-50 transition-colors">
                {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                Generate
              </button>
            )}
            {onUpload && (
              <button onClick={onUpload}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors">
                <Upload className="w-3 h-3" /> Upload
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// VideoArea — shared between modes
export function ViewerVideoArea({ step, adminMode, onAddVideo, onApproveVideo, onRemoveVideo }: {
  step: JourneyStep; adminMode?: boolean;
  onAddVideo?: () => void; onApproveVideo?: () => void; onRemoveVideo?: () => void;
}) {
  const videoData = step.media?.video || step.video;
  const hasApproved = videoData?.approvedUrl && videoData?.approvedByAdmin === true;
  const hasSuggested = videoData?.suggestedUrl && !videoData?.approvedByAdmin;
  const hasKeywords = videoData?.searchKeywords && (Array.isArray(videoData.searchKeywords) ? videoData.searchKeywords.length > 0 : videoData.searchKeywords.trim().length > 0);

  if (hasApproved) {
    const videoId = extractYouTubeId(videoData.approvedUrl);
    const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    return (
      <div className="rounded-2xl border border-blue-200/50 overflow-hidden bg-gradient-to-br from-blue-50/80 to-cyan-50/60 shadow-sm mt-4">
        <div className="px-4 py-2.5 flex items-center gap-2 border-b border-blue-200/40">
          <Play className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold text-blue-700">Watch</span>
        </div>
        {embedUrl ? (
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <iframe src={embedUrl} title={videoData.approvedTitle || "Lesson video"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen className="absolute inset-0 w-full h-full" />
          </div>
        ) : (
          <div className="p-4 text-center">
            <a href={videoData.approvedUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-blue-600 underline hover:text-blue-800">Watch video →</a>
          </div>
        )}
        {adminMode && onRemoveVideo && (
          <div className="px-4 py-2 border-t border-blue-200/40">
            <button onClick={onRemoveVideo} className="text-xs font-bold text-red-600 hover:text-red-700">Remove Video</button>
          </div>
        )}
      </div>
    );
  }

  if (hasSuggested) {
    return (
      <div className="rounded-2xl border border-amber-200/50 overflow-hidden bg-gradient-to-br from-amber-50/80 to-yellow-50/60 shadow-sm mt-4">
        <div className="px-4 py-2.5 flex items-center gap-2 border-b border-amber-200/40">
          <Play className="w-4 h-4 text-amber-600" />
          <span className="text-xs font-bold text-amber-700">Suggested (pending approval)</span>
        </div>
        <div className="p-4 text-center">
          <a href={videoData.suggestedUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-amber-600 underline hover:text-amber-800">Preview on YouTube →</a>
        </div>
        {adminMode && (
          <div className="px-4 py-2 border-t border-amber-200/40 flex gap-2">
            {onApproveVideo && (
              <button onClick={onApproveVideo} className="text-xs font-bold text-emerald-600 hover:text-emerald-700">Approve</button>
            )}
            {onRemoveVideo && (
              <button onClick={onRemoveVideo} className="text-xs font-bold text-red-600 hover:text-red-700">Remove</button>
            )}
          </div>
        )}
      </div>
    );
  }

  if (hasKeywords) {
    return (
      <div className="rounded-2xl border border-slate-200/50 bg-slate-50/60 p-4 flex items-center gap-3 mt-4">
        <Play className="w-5 h-5 text-slate-400 flex-shrink-0" />
        <div>
          <p className="text-xs font-bold text-slate-500">Video coming soon</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Search: {Array.isArray(videoData.searchKeywords) ? videoData.searchKeywords.join(", ") : videoData.searchKeywords}</p>
        </div>
        {adminMode && onAddVideo && (
          <button onClick={onAddVideo} className="ml-auto text-xs font-bold text-indigo-600 hover:text-indigo-700">Add Video</button>
        )}
      </div>
    );
  }

  if (adminMode && onAddVideo) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-slate-200 p-4 flex items-center justify-center mt-4">
        <button onClick={onAddVideo} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 text-slate-500 text-sm font-bold hover:bg-slate-100 transition-colors">
          <Video className="w-4 h-4" /> Add Video
        </button>
      </div>
    );
  }

  return null;
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

// InteractionArea — prediction, practice, quick check, reflection
export function ViewerInteractionArea({ step, interaction, setInteraction, onSaveReflection, editable }: {
  step: JourneyStep; interaction: any; setInteraction: any;
  onSaveReflection?: () => void; editable?: boolean;
}) {
  if (!step.interaction && step.stepType !== "reflect") return null;

  // Prediction
  if (step.stepType === "think_first" && step.interaction?.question) {
    return (
      <div className="mt-4 px-5 py-4 rounded-xl bg-amber-50/80 border border-amber-200/60">
        <p className="text-base font-bold text-amber-900 mb-2 flex items-center gap-2"><HelpCircle className="w-4 h-4" /> {step.interaction.question}</p>
        <textarea value={interaction.predictionText || ""} onChange={e => setInteraction((p: any) => ({ ...p, predictionText: e.target.value }))}
          placeholder="Type your guess here..."
          className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-white text-base text-slate-800 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-amber-300" rows={3} />
        {interaction.predictionText?.trim() && <p className="text-xs text-amber-600 mt-1.5 font-semibold">✓ Your guess is saved!</p>}
      </div>
    );
  }

  // Practice
  if (step.stepType === "practice") {
    return (
      <div className="mt-4 px-5 py-4 rounded-xl bg-sky-50/80 border border-sky-200/60">
        <p className="text-base font-bold text-sky-900 mb-1.5 flex items-center gap-2"><Pencil className="w-4 h-4" /> Record your measurements</p>
        <p className="text-xs text-sky-700 mb-3">Write down 3 things that can be measured in metres:</p>
        {[0, 1, 2].map(i => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <span className="w-7 h-7 rounded-lg bg-sky-200 text-sky-800 text-xs font-black flex items-center justify-center flex-shrink-0">{i + 1}</span>
            <input value={interaction.practiceEntries?.[i] || ""} onChange={e => {
              const entries = [...(interaction.practiceEntries || ["", "", ""])]; entries[i] = e.target.value;
              setInteraction((p: any) => ({ ...p, practiceEntries: entries }));
            }} placeholder={`Thing ${i + 1} (e.g., "classroom door")`}
              className="flex-1 px-3 py-2.5 rounded-xl border border-sky-200 bg-white text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300" />
          </div>
        ))}
        {interaction.practiceEntries?.some((e: string) => e.trim()) && <p className="text-xs text-sky-600 mt-1.5 font-semibold">✓ Measurements saved!</p>}
      </div>
    );
  }

  // Quick check — multiple choice
  if (step.stepType === "quick_check" && step.interaction?.type === "multiple_choice" && step.interaction.question) {
    return (
      <div className="mt-4 px-5 py-4 rounded-xl bg-lime-50/80 border border-lime-200/60">
        <p className="text-base font-bold text-lime-900 mb-0.5 flex items-center gap-2"><HelpCircle className="w-4 h-4" /> Quick Check</p>
        <p className="text-lg font-bold text-lime-800 mb-3">{step.interaction.question}</p>
        {step.interaction.options?.map((opt: string, i: number) => {
          const isSelected = interaction.selectedChoice === i;
          const isCorrect = i === step.interaction?.correctAnswer;
          const showFeedback = interaction.choiceFeedback !== null;
          let btnClass = "bg-white border-lime-200 text-lime-800 hover:bg-lime-50 hover:shadow-md";
          if (isSelected && !showFeedback) btnClass = "bg-lime-600 text-white border-lime-600 shadow-lg shadow-lime-200";
          if (showFeedback && isSelected && isCorrect) btnClass = "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-200";
          if (showFeedback && isSelected && !isCorrect) btnClass = "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-200";
          if (showFeedback && !isSelected && isCorrect) btnClass = "bg-emerald-100 border-emerald-400 text-emerald-800";
          return (
            <button key={i} onClick={() => {
              if (interaction.choiceFeedback !== null) return;
              setInteraction((p: any) => ({ ...p, selectedChoice: i, choiceFeedback: i === step.interaction?.correctAnswer ? "correct" : "incorrect" }));
            }} disabled={interaction.choiceFeedback !== null}
              className={`text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all border-2 ${btnClass} disabled:cursor-default mb-2`}>
              <span className="mr-2 text-base">{String.fromCharCode(65 + i)}.</span> {opt}
            </button>
          );
        })}
        {interaction.choiceFeedback === "correct" && (
          <div className="mt-3 px-4 py-2.5 rounded-xl bg-emerald-100 border border-emerald-300">
            <p className="text-sm font-bold text-emerald-800">✅ Correct! Well done!</p>
          </div>
        )}
        {interaction.choiceFeedback === "incorrect" && (
          <div className="mt-3 px-4 py-2.5 rounded-xl bg-orange-100 border border-orange-300">
            <p className="text-sm font-bold text-orange-800">Not quite. {step.interaction.hint || "Think about it again!"}</p>
          </div>
        )}
      </div>
    );
  }

  // Self check
  if (step.stepType === "quick_check" && step.interaction?.type === "self_check" && step.interaction.question) {
    return (
      <div className="mt-4 px-5 py-4 rounded-xl bg-lime-50/80 border border-lime-200/60">
        <p className="text-base font-bold text-lime-900 mb-0.5">✅ Check yourself:</p>
        <p className="text-lg font-bold text-lime-800 mb-3">{step.interaction.question}</p>
        <div className="flex gap-2">
          <button onClick={() => setInteraction((p: any) => ({ ...p, selfChecked: true }))}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${interaction.selfChecked === true ? "bg-emerald-600 text-white border-emerald-600 shadow-lg" : "bg-white border-lime-200 text-lime-700 hover:bg-lime-50"}`}>
            ✓ Yes, I got it!
          </button>
          <button onClick={() => setInteraction((p: any) => ({ ...p, selfChecked: false }))}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${interaction.selfChecked === false ? "bg-orange-500 text-white border-orange-500 shadow-lg" : "bg-white border-orange-200 text-orange-600 hover:bg-orange-50"}`}>
            ↺ I need more practice
          </button>
        </div>
      </div>
    );
  }

  // Reflection
  if (step.stepType === "reflect") {
    return (
      <div className="mt-4 px-5 py-4 rounded-xl bg-rose-50/80 border border-rose-200/60">
        <p className="text-base font-bold text-rose-900 mb-0.5 flex items-center gap-2"><MessageCircle className="w-4 h-4" /> Reflection Time</p>
        <p className="text-lg font-bold text-rose-800 mb-3">{step.interaction?.question || "What did you learn today?"}</p>
        {step.reflectionOptions?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {step.reflectionOptions.map((opt: string, i: number) => (
              <button key={i} onClick={() => setInteraction((p: any) => ({ ...p, reflectionChip: p.reflectionChip === i ? null : i }))}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border-2 ${
                  interaction.reflectionChip === i ? "bg-rose-600 text-white border-rose-600 shadow-md" : "bg-white border-rose-200 text-rose-700 hover:bg-rose-50"
                }`}>{opt}</button>
            ))}
          </div>
        )}
        <textarea value={interaction.reflectionText || ""} onChange={e => setInteraction((p: any) => ({ ...p, reflectionText: e.target.value }))}
          placeholder="Write what you learned... (optional)"
          className="w-full px-4 py-3 rounded-xl border border-rose-200 bg-white text-base text-slate-800 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-rose-300" rows={3} />
        {(interaction.reflectionText?.trim() || interaction.reflectionChip !== null) && !interaction.reflectionSaved && onSaveReflection && (
          <button onClick={onSaveReflection} className="mt-2.5 px-4 py-2 rounded-xl bg-rose-600 text-white text-sm font-bold hover:bg-rose-700 transition-colors shadow-md">
            Save Reflection
          </button>
        )}
        {interaction.reflectionSaved && <p className="text-xs text-rose-600 mt-1.5 font-semibold">✓ Reflection saved!</p>}
      </div>
    );
  }

  return null;
}

// CompletionStep
export function ViewerCompletionStep({ xp, streak }: { xp: number; streak: number }) {
  return (
    <div className="mt-4 text-center py-4">
      <div className="flex justify-center mb-3">
        <OwlIcon size={72} expression="celebrating" />
      </div>
      <h3 className="text-xl lg:text-2xl font-black text-slate-900 mb-1">You did it! 🏆</h3>
      <p className="text-slate-600 text-base lg:text-lg">You've completed this lesson. Great work!</p>
    </div>
  );
}

// SupportPanel — right sidebar for journey viewer
export function ViewerSupportPanel({ lesson, journey, currentStep, onStepClick, xp, subject, grade }: {
  lesson: LessonData | null; journey: JourneyStep[]; currentStep: number;
  onStepClick: (i: number) => void; xp: number; subject: string; grade?: number;
}) {
  const missionStep = journey.find(s => s.stepType === "mission");
  const currentStepData = journey[currentStep];

  return (
    <div className="space-y-3 sticky top-4">
      {/* Mission */}
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
          {journey.map((s, i) => {
            const meta = getStepMeta(s.stepType);
            return (
              <button key={i} onClick={() => onStepClick(i)} className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-all text-[11px] font-semibold ${
                i === currentStep ? "bg-indigo-100/80 text-indigo-800 shadow-sm" : i < currentStep ? "bg-emerald-50/80 text-emerald-700" : "text-slate-400 hover:bg-slate-50/80"
              }`}>
                <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] flex-shrink-0 ${
                  i === currentStep ? `bg-gradient-to-br ${meta.gradient} text-white` : i < currentStep ? "bg-emerald-200 text-emerald-700" : "bg-slate-100 text-slate-400"
                }`}>
                  {i < currentStep ? "✓" : meta.icon}
                </span>
                <span className="truncate">{meta.label}</span>
              </button>
            );
          })}
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

// AdminToolbar — editing controls for admin-editor mode
export function AdminToolbar({ lesson, permissions, status, isAvailable, missingMedia, onPublish, onUnpublish, onArchive, onRestore, onToggleAvailability, onSaveChanges, publishLoading, saveLoading, onBack }: {
  lesson: LessonData | null; permissions: ViewerPermissions; status: string;
  isAvailable?: boolean; missingMedia?: { illustrations: number; videos: number };
  onPublish?: () => void; onUnpublish?: () => void; onArchive?: () => void; onRestore?: () => void;
  onToggleAvailability?: () => void; onSaveChanges?: () => void;
  publishLoading?: boolean; saveLoading?: boolean; onBack?: () => void;
}) {
  const statusColors: Record<string, string> = {
    DRAFT: "bg-amber-50 text-amber-700 border-amber-200",
    REVIEW: "bg-blue-50 text-blue-700 border-blue-200",
    PUBLISHED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    ARCHIVED: "bg-slate-100 text-slate-600 border-slate-200",
  };

  return (
    <div className="bg-white border-b border-slate-200/60 px-4 py-3 flex-shrink-0 shadow-sm">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button onClick={onBack} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition-all">
              <ChevronLeft className="w-3.5 h-3.5" /> Back
            </button>
          )}
          <div className="min-w-0">
            <h1 className="font-extrabold text-slate-900 text-sm truncate">{lesson?.title || "Lesson Editor"}</h1>
            {lesson?.subject && <p className="text-[10px] text-slate-500 font-semibold">{lesson.subject}{lesson.grade ? ` · Grade ${lesson.grade}` : ""}</p>}
          </div>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border flex-shrink-0 ${statusColors[status] || statusColors.DRAFT}`}>
            {status}
          </span>
          {isAvailable !== undefined && (
            <span className={`text-[10px] font-bold px-2 py-1 rounded-lg flex-shrink-0 ${isAvailable ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
              {isAvailable ? "Visible to students" : "Hidden"}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Missing media indicators */}
          {missingMedia && (missingMedia.illustrations > 0 || missingMedia.videos > 0) && (
            <div className="flex items-center gap-1.5 mr-2">
              {missingMedia.illustrations > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg">
                  <Image className="w-3 h-3" /> {missingMedia.illustrations} missing
                </span>
              )}
              {missingMedia.videos > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg">
                  <Video className="w-3 h-3" /> {missingMedia.videos} missing
                </span>
              )}
            </div>
          )}

          {permissions.canEdit && onSaveChanges && (
            <button onClick={onSaveChanges} disabled={saveLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all disabled:opacity-50">
              {saveLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save Changes"}
            </button>
          )}

          {permissions.canPublish && status !== "PUBLISHED" && onPublish && (
            <button onClick={onPublish} disabled={publishLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all disabled:opacity-50">
              {publishLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <><CheckCircle className="w-3 h-3" /> Publish</>}
            </button>
          )}

          {permissions.canPublish && status === "PUBLISHED" && onUnpublish && (
            <button onClick={onUnpublish} disabled={publishLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-all disabled:opacity-50">
              {publishLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Unpublish"}
            </button>
          )}

          {permissions.canArchive && status !== "ARCHIVED" && onArchive && (
            <button onClick={onArchive}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs transition-all">
              <Archive className="w-3 h-3" /> Archive
            </button>
          )}

          {permissions.canArchive && status === "ARCHIVED" && onRestore && (
            <button onClick={onRestore}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs transition-all">
              <ArchiveRestore className="w-3 h-3" /> Restore
            </button>
          )}

          {permissions.canEdit && onToggleAvailability && status === "PUBLISHED" && (
            <button onClick={onToggleAvailability}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                isAvailable
                  ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                  : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              }`}>
              {isAvailable ? "Hide from students" : "Make visible"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// BottomNav — shared navigation bar
export function ViewerBottomNav({ currentStep, totalSteps, isLastStep, stepLabel, nextStepLabel, theme, completed, completing, xp, onBack, onNext, onComplete }: {
  currentStep: number; totalSteps: number; isLastStep: boolean;
  stepLabel: string; nextStepLabel: string | null; theme: string;
  completed: boolean; completing: boolean; xp: number;
  onBack: () => void; onNext: () => void; onComplete: () => void;
}) {
  return (
    <div className="bg-white/90 backdrop-blur-xl border-t border-slate-200/60 px-4 py-3 flex-shrink-0 shadow-[0_-2px_12px_rgba(0,0,0,0.04)]">
      <div className="max-w-[1200px] mx-auto flex items-center gap-3">
        {currentStep > 0 ? (
          <button onClick={onBack}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all active:scale-[0.97]">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        ) : (
          <div className="w-20" />
        )}

        {/* Step dots (mobile) */}
        <div className="flex-1 flex items-center justify-center gap-1.5 lg:hidden">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all ${
              i === currentStep ? "bg-indigo-500 w-6" : i < currentStep ? "bg-emerald-400 w-2" : "bg-slate-300 w-2"
            }`} />
          ))}
        </div>

        <div className="flex-1 hidden lg:block" />

        {/* Next / Complete */}
        {isLastStep && !completed ? (
          <button onClick={onComplete} disabled={completing}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-200/50 disabled:opacity-50 active:scale-[0.97]">
            {completing ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Earning...</> : <><Trophy className="w-4 h-4" /> Finish +{xp} XP</>}
          </button>
        ) : isLastStep && completed ? (
          <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-sm">
            <CheckCircle className="w-4 h-4" /> Completed
          </span>
        ) : (
          <button onClick={onNext}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-[0.97] bg-gradient-to-r ${theme} text-white shadow-lg hover:brightness-110`}>
            <span>{stepLabel}</span>
            {nextStepLabel && <span className="text-xs opacity-75 hidden sm:inline">— {nextStepLabel}</span>}
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
