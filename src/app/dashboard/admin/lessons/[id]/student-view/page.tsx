"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft, CheckCircle2, Zap, BookOpen, Eye, Sparkles,
  Play, ChevronRight, ChevronLeft, Trophy, Pencil, Archive,
  ArchiveRestore, AlertTriangle, Settings, Loader2, Edit3,
  Image, Video, Trash2, Upload, MoreVertical, ExternalLink,
  RefreshCw, MessageCircle, Send
} from "lucide-react";
import { convertLegacyBlocksToJourney } from "@/lib/curriculum/lesson-journey";

/* ─────────────────────────────────────────────────────────────────────────────
   Admin Student-Style Lesson Editor
   
   This page shows the SAME lesson journey students see, but with admin
   editing tools layered on top. It uses the shared rendering logic from
   the student lesson player, ensuring admin sees exactly what students see.
   
   Route: /dashboard/admin/lessons/[id]/student-view
   ───────────────────────────────────────────────────────────────────────────── */

interface JourneyStep {
  id: string;
  stepType: string;
  title: string;
  studentText: string;
  owlText: string;
  mathDisplay?: string;
  illustrationPrompt?: string;
  interaction?: any;
  reflectionOptions?: string[];
  materials?: string[];
  video?: any;
  media?: any;
}

interface LessonData {
  id: string;
  title: string;
  slug: string;
  description?: string;
  status: string;
  xpReward: any;
  coinReward?: number;
  contentBlocks?: any;
  quest?: any;
  isAvailable?: boolean;
}

const STEP_META: Record<string, { icon: string; label: string; color: string; bg: string; border: string; gradient: string }> = {
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

function getMeta(type: string) { return STEP_META[type] || STEP_META.welcome; }

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

function getRewardValue(value: any): number {
  if (typeof value === "number") return value;
  if (!value) return 0;
  if (typeof value === "string") { const n = Number(value); return (!isNaN(n) && value.trim() !== "") ? n : 0; }
  if (typeof value === "object") return value?.base ?? value?.amount ?? value?.value ?? 0;
  return 0;
}

function buildLessonJourney(lesson: LessonData | null, mode: "live" | "draft" = "live"): JourneyStep[] {
  if (!lesson?.contentBlocks) return [];
  try {
    const cb = typeof lesson.contentBlocks === "string" ? JSON.parse(lesson.contentBlocks) : lesson.contentBlocks;
    // Handle both dict format {studentJourney: [...]} and legacy array format [{type: "text", ...}]
    if (Array.isArray(cb)) {
      // Legacy array format — convert to journey steps
      return convertLegacyBlocksToJourney(cb, lesson.title || "Lesson");
    }
    // Dict format — use mode to select which journey to show
    if (mode === "draft") {
      const rawDraft = cb?.studentJourneyDraft;
      const draftJourney = Array.isArray(rawDraft) ? rawDraft : (rawDraft && Array.isArray(rawDraft.steps) ? rawDraft.steps : []);
      if (draftJourney.length > 0) return draftJourney;
      // Fallback to live if no draft
      const publishedJourney = Array.isArray(cb?.studentJourney) ? cb.studentJourney : [];
      return publishedJourney;
    }
    // Live mode: published journey first
    const publishedJourney = Array.isArray(cb?.studentJourney) ? cb.studentJourney : [];
    if (publishedJourney.length > 0) return publishedJourney;
    // Fallback to draft if no published
    const rawDraft = cb?.studentJourneyDraft;
    const draftJourney = Array.isArray(rawDraft) ? rawDraft : (rawDraft && Array.isArray(rawDraft.steps) ? rawDraft.steps : []);
    return draftJourney;
  } catch { return []; }
}

export default function AdminStudentLessonEditor({ params }: { params: Promise<{ id: string }> }) {
  const [lessonId, setLessonId] = useState<string>("");
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [viewing, setViewing] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingStep, setEditingStep] = useState<number | null>(null);
  const [editBuffer, setEditBuffer] = useState<any>({});
  const [generating, setGenerating] = useState<number | null>(null);
  const [videoUrl, setVideoUrl] = useState<Record<number, string>>({});
  const [videoTitle, setVideoTitle] = useState<Record<number, string>>({});
  const [addingVideo, setAddingVideo] = useState<number | null>(null);
  const hasCompletedRef = useRef(false);
  const [viewMode, setViewMode] = useState<"live" | "draft">("draft");

  const journey = buildLessonJourney(lesson, viewMode);
  const totalSteps = journey.length;
  const isLastStep = currentStep >= totalSteps - 1;
  const clampedStep = Math.min(currentStep, Math.max(totalSteps - 1, 0));
  const currentJourneyStep = totalSteps > 0 ? journey[clampedStep] : null;
  const xp = getRewardValue(lesson?.xpReward);
  const subject = lesson?.quest?.theme?.themeSubjects?.[0]?.subject || "";
  const grade = lesson?.quest?.theme?.grade || 0;

  // Next step label — defined at component scope so bottom nav can use it
  const nextStepLabel = !isLastStep && journey[clampedStep + 1]
    ? getMeta(journey[clampedStep + 1].stepType).label
    : null;

  // Missing media counts
  const missingIllustrations = journey.filter(s => s.illustrationPrompt && !s.media?.illustration?.approvedUrl).length;
  const missingVideos = journey.filter(s => {
    const v = s.media?.video || s.video;
    return v && !v?.approvedByAdmin;
  }).length;

  const [interaction, setInteraction] = useState<any>({
    predictionText: "", practiceEntries: ["", "", ""], selectedChoice: null,
    choiceFeedback: null, selfChecked: null, reflectionText: "", reflectionChip: null, reflectionSaved: false,
  });

  useEffect(() => {
    params.then(p => { setLessonId(p.id); loadLesson(p.id); });
  }, []);

  useEffect(() => {
    setInteraction({ predictionText: "", practiceEntries: ["", "", ""], selectedChoice: null, choiceFeedback: null, selfChecked: null, reflectionText: "", reflectionChip: null, reflectionSaved: false });
  }, [currentStep]);

  async function loadLesson(id: string) {
    try {
      const res = await fetch(`/api/admin/lessons/${id}`, { credentials: "include" });
      if (res.ok) { const data = await res.json(); setLesson(data.lesson); }
      else { const err = await res.json().catch(() => ({})); setError(err.error || "Failed to load"); }
    } catch (e: any) { setError(e?.message || "Failed to load"); }
    finally { setLoading(false); }
  }

  const handlePublish = useCallback(async () => {
    if (!lessonId || publishing) return;
    setPublishing(true);
    try {
      await fetch(`/api/admin/lessons/${lessonId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ status: "PUBLISHED" }),
      });
      setLesson(prev => prev ? { ...prev, status: "PUBLISHED" } : prev);
    } catch { /* non-blocking */ }
    setPublishing(false);
  }, [lessonId, publishing]);

  const handleUnpublish = useCallback(async () => {
    if (!lessonId || publishing) return;
    setPublishing(true);
    try {
      await fetch(`/api/admin/lessons/${lessonId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ status: "DRAFT" }),
      });
      setLesson(prev => prev ? { ...prev, status: "DRAFT" } : prev);
    } catch { /* non-blocking */ }
    setPublishing(false);
  }, [lessonId, publishing]);

  const handleArchive = useCallback(async () => {
    if (!lessonId || archiving) return;
    if (!confirm("Archive this lesson? It will no longer be visible to students.")) return;
    setArchiving(true);
    try {
      await fetch(`/api/admin/lessons/${lessonId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ status: "ARCHIVED" }),
      });
      setLesson(prev => prev ? { ...prev, status: "ARCHIVED" } : prev);
    } catch { /* non-blocking */ }
    setArchiving(false);
  }, [lessonId, archiving]);

  const handleRestore = useCallback(async () => {
    if (!lessonId || archiving) return;
    setArchiving(true);
    try {
      await fetch(`/api/admin/lessons/${lessonId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ status: "DRAFT" }),
      });
      setLesson(prev => prev ? { ...prev, status: "DRAFT" } : prev);
    } catch { /* non-blocking */ }
    setArchiving(false);
  }, [lessonId, archiving]);

  const handleToggleAvailability = useCallback(async () => {
    if (!lessonId) return;
    try {
      await fetch(`/api/admin/lessons/${lessonId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ isAvailable: !lesson?.isAvailable }),
      });
      setLesson(prev => prev ? { ...prev, isAvailable: !prev.isAvailable } : prev);
    } catch { /* non-blocking */ }
  }, [lessonId, lesson?.isAvailable]);

  const handleSaveChanges = useCallback(async () => {
    if (!lessonId || saving) return;
    setSaving(true);
    try {
      await fetch(`/api/admin/lessons/${lessonId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ title: lesson?.title, description: lesson?.description }),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch { /* non-blocking */ }
    setSaving(false);
  }, [lessonId, saving, lesson]);

  const handleGenerateIllustration = useCallback(async (stepIndex: number) => {
    setGenerating(stepIndex);
    try {
      const step = journey[stepIndex];
      const res = await fetch(`/api/admin/lessons/${lessonId}/illustrations/generate`, {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ stepIndex, illustrationPrompt: step.illustrationPrompt }),
      });
      if (res.ok) loadLesson(lessonId);
    } catch { /* non-blocking */ }
    setGenerating(null);
  }, [lessonId, journey]);

  const handleAddVideo = useCallback(async (stepIndex: number) => {
    const url = videoUrl[stepIndex];
    if (!url?.trim()) return;
    setAddingVideo(stepIndex);
    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}/video`, {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ stepIndex, action: "add", videoUrl: url.trim(), videoTitle: videoTitle[stepIndex] || "" }),
      });
      if (res.ok) { loadLesson(lessonId); setVideoUrl(prev => ({ ...prev, [stepIndex]: "" })); }
    } catch { /* non-blocking */ }
    setAddingVideo(null);
  }, [lessonId, videoUrl, videoTitle]);

  const handleApproveVideo = useCallback(async (stepIndex: number) => {
    setAddingVideo(stepIndex);
    try {
      await fetch(`/api/admin/lessons/${lessonId}/video`, {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ stepIndex, action: "approve" }),
      });
      loadLesson(lessonId);
    } catch { /* non-blocking */ }
    setAddingVideo(null);
  }, [lessonId]);

  const handleRemoveVideo = useCallback(async (stepIndex: number) => {
    if (!confirm("Remove this video?")) return;
    setAddingVideo(stepIndex);
    try {
      await fetch(`/api/admin/lessons/${lessonId}/video`, {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ stepIndex, action: "remove" }),
      });
      loadLesson(lessonId);
    } catch { /* non-blocking */ }
    setAddingVideo(null);
  }, [lessonId]);

  // ── Loading ──
  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-sm font-bold text-slate-500">Loading lesson...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center bg-white rounded-2xl p-10 shadow-lg border border-slate-100 max-w-md">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-800 mb-2">{error}</h3>
        <Link href="/dashboard/admin/lessons" className="text-sm font-bold text-indigo-600 hover:text-indigo-700">← Back to Lessons</Link>
      </div>
    </div>
  );

  const statusColors: Record<string, string> = {
    DRAFT: "bg-amber-50 text-amber-700 border-amber-200",
    REVIEW: "bg-blue-50 text-blue-700 border-blue-200",
    PUBLISHED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    ARCHIVED: "bg-slate-100 text-slate-600 border-slate-200",
  };

  // ── Admin Toolbar ──
  const renderToolbar = () => (
    <div className="bg-white border-b border-slate-200/60 px-4 py-3 flex-shrink-0 shadow-sm">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <Link href={`/dashboard/admin/lessons/${lessonId}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition-all">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Link>
          <div className="min-w-0">
            <h1 className="font-extrabold text-slate-900 text-sm truncate">{lesson?.title}</h1>
            {subject && <p className="text-[10px] text-slate-500 font-semibold">{subject}{grade ? ` · Grade ${grade}` : ""}</p>}
          </div>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border flex-shrink-0 ${statusColors[lesson?.status || "DRAFT"]}`}>
            {lesson?.status}
          </span>
          {lesson?.status === "PUBLISHED" && (
            <span className={`text-[10px] font-bold px-2 py-1 rounded-lg flex-shrink-0 ${lesson?.isAvailable !== false ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
              {lesson?.isAvailable !== false ? "Visible" : "Hidden"}
            </span>
          )}
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={() => { setViewMode("draft"); setCurrentStep(0); }}
              className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-all ${viewMode === "draft" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              📝 Draft
            </button>
            <button
              onClick={() => { setViewMode("live"); setCurrentStep(0); }}
              className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-all ${viewMode === "live" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              🌐 Live
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(missingIllustrations > 0 || missingVideos > 0) && (
            <div className="flex items-center gap-1.5 mr-2">
              {missingIllustrations > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg">
                  <Image className="w-3 h-3" /> {missingIllustrations}
                </span>
              )}
              {missingVideos > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg">
                  <Video className="w-3 h-3" /> {missingVideos}
                </span>
              )}
            </div>
          )}
          <button onClick={handleSaveChanges} disabled={saving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all disabled:opacity-50">
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : saveSuccess ? "✓ Saved" : "Save"}
          </button>
          {lesson?.status !== "PUBLISHED" && (
            <button onClick={handlePublish} disabled={publishing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all disabled:opacity-50">
              {publishing ? <Loader2 className="w-3 h-3 animate-spin" /> : <><CheckCircle2 className="w-3 h-3" /> Publish</>}
            </button>
          )}
          {lesson?.status === "PUBLISHED" && (
            <>
              <button onClick={handleUnpublish} disabled={publishing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-all disabled:opacity-50">
                {publishing ? <Loader2 className="w-3 h-3 animate-spin" /> : "Unpublish"}
              </button>
              <button onClick={handleToggleAvailability}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                  lesson?.isAvailable !== false
                    ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                    : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                }`}>
                {lesson?.isAvailable !== false ? "Hide" : "Show"}
              </button>
            </>
          )}
          {lesson?.status !== "ARCHIVED" && (
            <button onClick={handleArchive} disabled={archiving}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs transition-all">
              <Archive className="w-3 h-3" /> Archive
            </button>
          )}
          {lesson?.status === "ARCHIVED" && (
            <button onClick={handleRestore} disabled={archiving}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs transition-all">
              <ArchiveRestore className="w-3 h-3" /> Restore
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // ── Contamination detection ──
  const contaminationInfo = (() => {
    try {
      if (!lesson?.contentBlocks) return null;
      const cb = typeof lesson.contentBlocks === "string" ? JSON.parse(lesson.contentBlocks) : lesson.contentBlocks;
      if (!cb || typeof cb !== "object" || Array.isArray(cb)) return null;
      const CONTAMINATION_PHRASES = [
        "reading comprehension", "main idea", "read a short passage",
        "good readers", "reading passage", "passage about",
        "tell the main idea", "what the story is mostly about",
      ];
      function check(steps: any[]): string[] {
        if (!Array.isArray(steps) || steps.length === 0) return [];
        const text = JSON.stringify(steps).toLowerCase();
        return CONTAMINATION_PHRASES.filter(p => text.includes(p));
      }
      const liveContamination = check(Array.isArray(cb?.studentJourney) ? cb.studentJourney : []);
      const draftContamination = check(Array.isArray(cb?.studentJourneyDraft) ? cb.studentJourneyDraft : []);
      const hasDraft = Array.isArray(cb?.studentJourneyDraft) && cb.studentJourneyDraft.length > 0;
      return { liveContamination, draftContamination, hasDraft };
    } catch { return null; }
  })();

  // ── Main slide view (reuses student rendering logic) ──
  const renderSlideView = () => {
    if (!currentJourneyStep && journey.length === 0) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center bg-white rounded-2xl p-10 shadow-lg border border-slate-100 max-w-md">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">No {viewMode} journey steps</h3>
            <p className="text-sm text-slate-500 mb-4">Generate a journey draft from the lesson editor to preview it here.</p>
            <Link href={`/dashboard/admin/lessons/${lessId}`}>
              <GradientButton variant="primary" size="sm" icon={<Sparkles className="w-4 h-4" />}>
                Go to Lesson Editor
              </GradientButton>
            </Link>
          </div>
        </div>
      );
    }

    if (!currentJourneyStep) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center bg-white rounded-2xl p-10 shadow-lg border border-slate-100 max-w-md">
            <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">Journey data unavailable</h3>
            <p className="text-sm text-slate-500">This lesson journey could not be loaded. It may need to be regenerated.</p>
          </div>
        </div>
      );
    }

    const meta = getMeta(currentJourneyStep.stepType);

    return (
      <div className="max-w-[1200px] mx-auto px-4 py-5 flex gap-5">
        {/* Main slide */}
        <div className="flex-1 min-w-0 max-w-[720px]">
          <div className={`rounded-2xl border-2 ${meta.border} bg-white p-6 lg:p-8 shadow-lg`}>
            {/* Step header */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${meta.gradient} text-white shadow-md`}>
                <span className="text-lg font-black">{clampedStep + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className={`font-black text-xl lg:text-2xl ${meta.accent} tracking-tight leading-tight`}>{currentJourneyStep.title}</h2>
                <span className="text-[11px] font-semibold text-slate-400">Step {clampedStep + 1} of {totalSteps}</span>
              </div>
              <button onClick={() => { setEditingStep(clampedStep); setEditBuffer({}); }} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                <Edit3 className="w-4 h-4" />
              </button>
            </div>

            {/* Owl guide */}
            {currentJourneyStep.owlText && (
              <div className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-gradient-to-br from-sky-50/90 via-indigo-50/60 to-purple-50/40 border border-sky-200/50 shadow-sm mb-4">
                <MessageCircle className="w-5 h-5 text-sky-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-slate-700 text-sm leading-relaxed font-medium">{currentJourneyStep.owlText}</p>
                </div>
              </div>
            )}

            {/* Student text */}
            {currentJourneyStep.studentText && (
              <div className="flex flex-col gap-3 mb-4">
                {currentJourneyStep.studentText.split("\n").filter(Boolean).map((p: string, i: number) => (
                  <p key={i} className="text-slate-700 text-base lg:text-lg leading-relaxed whitespace-pre-line">{p}</p>
                ))}
              </div>
            )}

            {/* Math display */}
            {currentJourneyStep.mathDisplay && (
              <div className="mt-4 px-5 py-4 rounded-xl bg-slate-50 border border-slate-200/60 text-center">
                <span className="text-xl font-mono font-bold text-slate-800">{currentJourneyStep.mathDisplay}</span>
              </div>
            )}

            {/* Illustration — with admin controls */}
            <AdminIllustration step={currentJourneyStep} stepIndex={clampedStep} meta={meta}
              generating={generating === clampedStep}
              onGenerate={() => handleGenerateIllustration(clampedStep)} />

            {/* Video — with admin controls */}
            <AdminVideo step={currentJourneyStep} stepIndex={clampedStep}
              videoUrl={videoUrl[clampedStep] || ""} videoTitle={videoTitle[clampedStep] || ""}
              adding={addingVideo === clampedStep}
              onUrlChange={v => setVideoUrl(prev => ({ ...prev, [clampedStep]: v }))}
              onTitleChange={v => setVideoTitle(prev => ({ ...prev, [clampedStep]: v }))}
              onAdd={() => handleAddVideo(clampedStep)}
              onApprove={() => handleApproveVideo(clampedStep)}
              onRemove={() => handleRemoveVideo(clampedStep)} />

            {/* Interaction */}
            <AdminInteraction step={currentJourneyStep} interaction={interaction} setInteraction={setInteraction} />

            {/* Materials */}
            {currentJourneyStep.materials?.length > 0 && (
              <div className="mt-4 px-4 py-3 rounded-xl bg-amber-50/60 border border-amber-200/50">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 mb-1.5">What you might need:</p>
                <div className="flex flex-wrap gap-1.5">
                  {currentJourneyStep.materials.map((m: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">{m}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Completion */}
            {currentJourneyStep.stepType === "complete" && (
              <div className="mt-4 text-center py-4">
                <h3 className="text-xl font-black text-slate-900 mb-1">Lesson Complete! 🏆</h3>
                <p className="text-slate-600 text-base">Great work! +{xp} XP earned.</p>
              </div>
            )}
          </div>

          {/* Step-level admin actions */}
          <div className="mt-3 flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2">
              {currentJourneyStep.illustrationPrompt && !currentJourneyStep.media?.illustration?.approvedUrl && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg">
                  <Image className="w-3 h-3" /> No approved illustration
                </span>
              )}
              {(currentJourneyStep.media?.video?.suggestedUrl && !currentJourneyStep.media?.video?.approvedByAdmin) && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg">
                  <Video className="w-3 h-3" /> Video pending approval
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right sidebar — lesson map + status */}
        <div className="hidden lg:block w-[260px] flex-shrink-0">
          <div className="space-y-3 sticky top-4">
            {/* Status card */}
            <div className={`rounded-2xl border p-4 shadow-sm ${statusColors[lesson?.status || "DRAFT"]}`}>
              <div className="flex items-center gap-1.5 mb-1">
                <Settings className="w-3.5 h-3.5" />
                <h3 className="font-bold text-xs">Status</h3>
              </div>
              <p className="text-xs font-medium mt-1">{lesson?.status}</p>
              {lesson?.status === "PUBLISHED" && (
                <p className="text-[10px] mt-1 opacity-75">{lesson?.isAvailable !== false ? "Visible to students" : "Hidden from students"}</p>
              )}
            </div>

            {/* Lesson map */}
            <div className="rounded-2xl border border-slate-200/50 bg-white/80 backdrop-blur-sm p-4 shadow-sm">
              <h3 className="font-bold text-slate-800 text-xs mb-2">Lesson Map</h3>
              <div className="space-y-0.5">
                {journey.map((s, i) => {
                  const sm = getMeta(s.stepType);
                  return (
                    <button key={i} onClick={() => setCurrentStep(i)} className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-all text-[11px] font-semibold ${
                      i === clampedStep ? "bg-indigo-100/80 text-indigo-800 shadow-sm" : i < clampedStep ? "bg-emerald-50/80 text-emerald-700" : "text-slate-400 hover:bg-slate-50/80"
                    }`}>
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] flex-shrink-0 ${
                        i === clampedStep ? `bg-gradient-to-br ${sm.gradient} text-white` : i < clampedStep ? "bg-emerald-200 text-emerald-700" : "bg-slate-100 text-slate-400"
                      }`}>
                        {i < clampedStep ? "✓" : sm.icon}
                      </span>
                      <span className="truncate">{sm.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rewards */}
            {xp > 0 && (
              <div className="rounded-2xl border border-amber-200/50 bg-gradient-to-br from-amber-50/80 to-yellow-50/60 p-4 shadow-sm">
                <h3 className="font-bold text-amber-800 text-xs mb-1.5">Rewards</h3>
                <div className="flex gap-3">
                  <div className="flex items-center gap-1 text-amber-700"><Zap className="w-3.5 h-3.5" /><span className="font-bold text-xs">{xp} XP</span></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {renderToolbar()}

      {/* Progress bar */}
      {totalSteps > 0 && (
        <div className="bg-white/60 backdrop-blur-sm border-b border-slate-200/40 px-4 py-2 flex-shrink-0">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex gap-1">
              {journey.map((s, i) => {
                const sm = getMeta(s.stepType);
                return (
                  <button key={i} onClick={() => setCurrentStep(i)} className="flex-1 group" title={`${sm.label}: ${s.title}`}>
                    <div className={`h-1.5 rounded-full transition-all duration-500 ${
                      i < clampedStep ? "bg-gradient-to-r from-emerald-400 to-teal-400"
                        : i === clampedStep ? `bg-gradient-to-r ${getMeta(currentJourneyStep?.stepType || "welcome").gradient}`
                        : "bg-slate-200/60 group-hover:bg-slate-300/60"
                    }`} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        {renderSlideView()}
      </div>

      {/* Bottom nav */}
      {totalSteps > 0 && currentJourneyStep && (
        <div className="bg-white/90 backdrop-blur-xl border-t border-slate-200/60 px-4 py-3 flex-shrink-0 shadow-[0_-2px_12px_rgba(0,0,0,0.04)]">
          <div className="max-w-[1200px] mx-auto flex items-center gap-3">
            {clampedStep > 0 ? (
              <button onClick={() => setCurrentStep(clampedStep - 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all active:scale-[0.97]">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            ) : <div className="w-20" />}

            <div className="flex-1 flex items-center justify-center gap-1.5 lg:hidden">
              {journey.map((_, i) => (
                <div key={i} className={`h-2 rounded-full transition-all ${i === clampedStep ? "bg-indigo-500 w-6" : i < clampedStep ? "bg-emerald-400 w-2" : "bg-slate-300 w-2"}`} />
              ))}
            </div>
            <div className="flex-1 hidden lg:block" />

            {!isLastStep && (
              <button onClick={() => setCurrentStep(clampedStep + 1)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-[0.97] bg-gradient-to-r ${getMeta(currentJourneyStep.stepType).gradient} text-white shadow-lg hover:brightness-110`}>
                <span>Next{nextStepLabel ? `: ${nextStepLabel}` : ""}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            {isLastStep && (
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-sm">
                <Trophy className="w-4 h-4" /> Lesson Complete
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Admin sub-components ────────────────────────────────────────────────────

function AdminIllustration({ step, stepIndex, meta, generating, onGenerate }: any) {
  const approvedUrl = step.media?.illustration?.approvedUrl;
  if (approvedUrl) {
    return (
      <div className="mt-4 rounded-2xl overflow-hidden border border-slate-200/50 shadow-sm">
        <img src={approvedUrl} alt="Illustration" className="w-full h-auto max-h-[220px] object-cover" />
        <div className="px-3 py-1.5 bg-emerald-50 border-t border-emerald-200/40 flex items-center justify-between">
          <span className="text-[10px] font-bold text-emerald-700">✓ Approved</span>
        </div>
      </div>
    );
  }
  // Handle flat media structure (POC journeys with media.altText / media.fallbackText)
  const flatMedia = step.media;
  if (flatMedia && !flatMedia.illustration && !flatMedia.video && flatMedia.altText) {
    return (
      <div className={`mt-4 rounded-2xl border-2 border-dashed ${meta.border} overflow-hidden`}>
        <div className={`bg-gradient-to-br ${meta.softBg || ""} p-5 flex flex-col items-center gap-2.5`}>
          <div className={`w-12 h-12 rounded-xl ${meta.iconBg || "bg-slate-100"} flex items-center justify-center`}>
            <span className="text-xl">🖼️</span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Illustration (Draft)</p>
          <p className={`text-sm font-semibold ${meta.accent} text-center max-w-xs leading-snug`}>{flatMedia.altText}</p>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[9px] font-bold text-amber-600">Draft — not yet approved</span>
        </div>
      </div>
    );
  }
  const prompt = step.illustrationPrompt;
  if (!prompt) return null;
  return (
    <div className={`mt-4 rounded-2xl border-2 border-dashed ${meta.border} overflow-hidden`}>
      <div className={`bg-gradient-to-br ${meta.softBg || ""} p-5 flex flex-col items-center gap-2.5`}>
        <div className={`w-12 h-12 rounded-xl ${meta.iconBg || "bg-slate-100"} flex items-center justify-center`}>
          <span className="text-xl">{meta.icon}</span>
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Illustration</p>
        <p className={`text-sm font-semibold ${meta.accent} text-center max-w-xs leading-snug`}>{prompt}</p>
        <button onClick={onGenerate} disabled={generating}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500 text-white text-xs font-bold hover:bg-indigo-600 disabled:opacity-50 transition-colors mt-1">
          {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
          {generating ? "Generating..." : "Generate AI"}
        </button>
      </div>
    </div>
  );
}

function AdminVideo({ step, stepIndex, videoUrl, videoTitle, adding, onUrlChange, onTitleChange, onAdd, onApprove, onRemove }: any) {
  const videoData = step.media?.video || step.video;
  const hasApproved = videoData?.approvedUrl && videoData?.approvedByAdmin;
  const hasSuggested = videoData?.suggestedUrl && !videoData?.approvedByAdmin;

  if (hasApproved) {
    const videoId = extractYouTubeId(videoData.approvedUrl);
    const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    return (
      <div className="mt-4 rounded-2xl border border-blue-200/50 overflow-hidden bg-gradient-to-br from-blue-50/80 to-cyan-50/60 shadow-sm">
        <div className="px-4 py-2.5 flex items-center gap-2 border-b border-blue-200/40">
          <Play className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold text-blue-700">Watch</span>
          <span className="text-[10px] font-bold text-emerald-700 ml-auto">✓ Approved</span>
          <button onClick={onRemove} className="text-[10px] font-bold text-red-600 hover:text-red-700">Remove</button>
        </div>
        {embedUrl ? (
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <iframe src={embedUrl} title="Lesson video" allowFullScreen className="absolute inset-0 w-full h-full" />
          </div>
        ) : (
          <div className="p-4 text-center">
            <a href={videoData.approvedUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-blue-600 underline">Watch →</a>
          </div>
        )}
      </div>
    );
  }

  if (hasSuggested) {
    return (
      <div className="mt-4 rounded-2xl border border-amber-200/50 overflow-hidden bg-gradient-to-br from-amber-50/80 to-yellow-50/60 shadow-sm">
        <div className="px-4 py-2.5 flex items-center gap-2 border-b border-amber-200/40">
          <Play className="w-4 h-4 text-amber-600" />
          <span className="text-xs font-bold text-amber-700">Pending Approval</span>
        </div>
        <div className="p-4 text-center">
          <a href={videoData.suggestedUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-amber-600 underline">Preview →</a>
        </div>
        <div className="px-4 py-2 border-t border-amber-200/40 flex gap-2">
          <button onClick={onApprove} className="text-xs font-bold text-emerald-600 hover:text-emerald-700">Approve</button>
          <button onClick={onRemove} className="text-xs font-bold text-red-600 hover:text-red-700">Remove</button>
        </div>
      </div>
    );
  }

  // Add video form
  return (
    <div className="mt-4 rounded-2xl border-2 border-dashed border-slate-200 p-4">
      <p className="text-xs font-bold text-slate-500 mb-2">Add Video</p>
      <div className="flex gap-2">
        <input type="url" placeholder="YouTube URL..." value={videoUrl} onChange={e => onUrlChange(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        <input type="text" placeholder="Title (optional)" value={videoTitle} onChange={e => onTitleChange(e.target.value)}
          className="w-32 px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        <button onClick={onAdd} disabled={adding || !videoUrl.trim()}
          className="px-3 py-2 rounded-lg bg-indigo-500 text-white text-xs font-bold hover:bg-indigo-600 disabled:opacity-50 transition-colors">
          {adding ? <Loader2 className="w-3 h-3 animate-spin" /> : "Add"}
        </button>
      </div>
    </div>
  );
}

function AdminInteraction({ step, interaction, setInteraction }: any) {
  if (!step) return null;
  const ix = step.interaction;
  const ixType = ix?.type || "none";
  const question = ix?.question || ix?.prompt;
  const options = ix?.options || [];
  const correctIdx = typeof ix?.correctIndex === "number" ? ix.correctIndex
    : (typeof ix?.correctAnswer === "number" ? ix.correctAnswer
    : (options.length && ix?.correctAnswer ? options.indexOf(ix.correctAnswer) : null));

  if (step.stepType === "think_first" && question) {
    return (
      <div className="mt-4 px-5 py-4 rounded-xl bg-amber-50/80 border border-amber-200/60">
        <p className="text-base font-bold text-amber-900 mb-2 flex items-center gap-2"><Pencil className="w-4 h-4" /> {question}</p>
        <div className="px-3 py-2 rounded-lg bg-amber-50/50 border border-amber-200/40">
          <p className="text-xs text-amber-600 italic">Student will type their guess here</p>
        </div>
      </div>
    );
  }
  if (step.stepType === "practice" && ixType === "multiple_choice" && options.length > 0 && question) {
    return (
      <div className="mt-4 px-5 py-4 rounded-xl bg-sky-50/80 border border-sky-200/60">
        <p className="text-base font-bold text-sky-900 mb-2 flex items-center gap-2"><Pencil className="w-4 h-4" /> Practice</p>
        <p className="text-sm font-semibold text-sky-800 mb-2">{question}</p>
        <div className="flex flex-col gap-1.5">
          {options.map((opt, i) => (
            <div key={i} className={"px-3 py-2 rounded-lg text-sm font-medium border " + (i === correctIdx ? "bg-emerald-50 border-emerald-300 text-emerald-800" : "bg-white border-sky-200 text-sky-700")}>
              <span className="mr-2 font-bold">{String.fromCharCode(65 + i)}.</span> {opt}
              {i === correctIdx && <span className="ml-2 text-emerald-600 font-bold">✓ Correct</span>}
            </div>
          ))}
        </div>
        {ix?.feedbackCorrect && <p className="text-xs text-emerald-600 mt-2">Feedback (correct): {ix.feedbackCorrect}</p>}
        {ix?.feedbackIncorrect && <p className="text-xs text-orange-600 mt-1">Feedback (incorrect): {ix.feedbackIncorrect}</p>}
      </div>
    );
  }
  if (step.stepType === "practice") {
    return (
      <div className="mt-4 px-5 py-4 rounded-xl bg-sky-50/80 border border-sky-200/60">
        <p className="text-base font-bold text-sky-900 mb-2 flex items-center gap-2"><Pencil className="w-4 h-4" /> Practice</p>
        <div className="px-3 py-2 rounded-lg bg-sky-50/50 border border-sky-200/40">
          <p className="text-xs text-sky-600 italic">Student will enter practice answers here</p>
        </div>
      </div>
    );
  }
  if (step.stepType === "quick_check" && ixType === "multiple_choice" && options.length > 0 && question) {
    return (
      <div className="mt-4 px-5 py-4 rounded-xl bg-lime-50/80 border border-lime-200/60">
        <p className="text-base font-bold text-lime-900 mb-2">Quick Check: {question}</p>
        <div className="flex flex-col gap-1.5">
          {options.map((opt, i) => (
            <div key={i} className={"px-3 py-2 rounded-lg text-sm font-medium border " + (i === correctIdx ? "bg-emerald-50 border-emerald-300 text-emerald-800" : "bg-white border-lime-200 text-lime-700")}>
              <span className="mr-2 font-bold">{String.fromCharCode(65 + i)}.</span> {opt}
              {i === correctIdx && <span className="ml-2 text-emerald-600 font-bold">✓ Correct</span>}
            </div>
          ))}
        </div>
        {ix?.feedbackCorrect && <p className="text-xs text-emerald-600 mt-2">Feedback (correct): {ix.feedbackCorrect}</p>}
        {ix?.feedbackIncorrect && <p className="text-xs text-orange-600 mt-1">Feedback (incorrect): {ix.feedbackIncorrect}</p>}
      </div>
    );
  }
  if (step.stepType === "quick_check" && question) {
    return (
      <div className="mt-4 px-5 py-4 rounded-xl bg-lime-50/80 border border-lime-200/60">
        <p className="text-base font-bold text-lime-900 mb-2">Quick Check: {question}</p>
        <div className="px-3 py-2 rounded-lg bg-lime-50/50 border border-lime-200/40">
          <p className="text-xs text-lime-600 italic">Student will select an answer here</p>
        </div>
      </div>
    );
  }
  if (step.stepType === "reflect") {
    const reflectQuestion = ix?.question || "What did you learn today?";
    const reflectOptions = ix?.options || [];
    return (
      <div className="mt-4 px-5 py-4 rounded-xl bg-rose-50/80 border border-rose-200/60">
        <p className="text-base font-bold text-rose-900 mb-2 flex items-center gap-2"><MessageCircle className="w-4 h-4" /> Reflection</p>
        <p className="text-sm font-semibold text-rose-800 mb-2">{reflectQuestion}</p>
        {reflectOptions.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {reflectOptions.map((opt, i) => (
              <span key={i} className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold">{opt}</span>
            ))}
          </div>
        ) : (
          <div className="px-3 py-2 rounded-lg bg-rose-50/50 border border-rose-200/40">
            <p className="text-xs text-rose-600 italic">Student will write their reflection here</p>
          </div>
        )}
      </div>
    );
  }
  return null;
}


// Need to import GradientButton for the empty state link
function GradientButton({ variant = "primary", size = "md", icon, children, className, ...props }: any) {
  const base = "inline-flex items-center justify-center font-bold rounded-2xl transition-all duration-200 cursor-pointer gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]";
  const variants: Record<string, string> = {
    primary: "bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-[0_4px_16px_rgba(79,70,229,0.2)] hover:shadow-[0_8px_24px_rgba(79,70,229,0.3)]",
    secondary: "bg-white text-text hover:bg-bg-main shadow-[0_2px_8px_rgba(0,0,0,0.04)]",
  };
  const sizes: Record<string, string> = { sm: "px-4 py-2 text-sm gap-1.5 rounded-xl", md: "px-6 py-3 text-sm", lg: "px-8 py-4 text-base rounded-[1.25rem]" };
  return <button className={`${base} ${variants[variant]} ${sizes[size]} ${className || ""}`} {...props}>{icon}{children}</button>;
}

function Play({ className }: any) { return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>; }
