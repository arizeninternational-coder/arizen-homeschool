"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft, AlertCircle, Save, BookOpen, CheckCircle2, AlertTriangle, Info,
  Sparkles, Eye, ChevronDown, ChevronUp, Play, Trash2, ExternalLink, Video,
  Plus, GripVertical, Edit3, X, Check, Image, MessageCircle, HelpCircle,
  Target, Lightbulb, PenTool, Award, Star, Flame, Copy, EyeOff,
} from "lucide-react";
import { ds, colors } from "@/lib/design-system";
import { STEP_TYPE_ICONS, STEP_TYPE_LABELS, JOURNEY_STEP_TYPES, type JourneyStepType } from "@/lib/curriculum/lesson-journey";

// ── Types ────────────────────────────────────────────────────────────────────

interface LessonDetail {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: string;
  orderIndex: number;
  xpReward: any;
  contentBlocks: any;
  difficulty: any;
  estimatedDurationMinutes: number | null;
  createdAt: string;
  updatedAt: string;
  quest?: { id: string; title: string; theme?: { id: string; title: string; grade: number } };
  strand: string;
  subStrand: string;
  learningOutcome: string;
  term: string;
  week: string;
  activityTitle: string;
  activityInstructions: string;
  questTitle: string;
  questInstructions: string;
  reflectionPrompt: string;
  rewardCoins: number;
  rewardStars: number;
  readiness?: {
    score: number;
    isReady: boolean;
    availableSteps: string[];
    missingSteps: string[];
    recommendations: string[];
    hasApprovedJourney?: boolean;
    hasDraftJourney?: boolean;
    draftReviewStatus?: string | null;
  } | null;
}

interface JourneyStepData {
  id: string;
  stepType: JourneyStepType;
  title: string;
  studentText: string;
  owlText: string;
  mathDisplay?: string;
  visualType?: string;
  illustrationPrompt?: string;
  interaction?: {
    type: string;
    question?: string;
    prompt?: string;
    options?: string[];
    correctAnswer?: number | string;
    hint?: string;
  };
  reflectionOptions?: string[];
  materials?: string[];
  video?: any;
  media?: any;
  estimatedMinutes?: number;
}

// ── Step type config ─────────────────────────────────────────────────────────

const STEP_CONFIG: Record<JourneyStepType, { icon: string; label: string; color: string; description: string }> = {
  welcome:    { icon: "🦉", label: "Welcome",     color: "#6366F1", description: "Greet the learner and set the tone" },
  mission:    { icon: "🎯", label: "Mission",     color: "#7C3AED", description: "What will the learner achieve?" },
  think_first:{ icon: "💭", label: "Think First",  color: "#D97706", description: "Activate prior knowledge" },
  learn:      { icon: "📖", label: "Learn It",    color: "#059669", description: "Core teaching content" },
  connect:    { icon: "🔗", label: "Connect",     color: "#0891B2", description: "Real-world connection" },
  example:    { icon: "💡", label: "Example",     color: "#0284C7", description: "Worked examples" },
  practice:   { icon: "✏️", label: "Practice",   color: "#0D9488", description: "Guided practice activities" },
  quick_check:{ icon: "✅", label: "Quick Check",  color: "#65A30D", description: "Check understanding" },
  reflect:    { icon: "🪞", label: "Reflect",     color: "#E11D48", description: "Reflection prompts" },
  complete:   { icon: "🏆", label: "Done",        color: "#CA8A04", description: "Celebrate completion" },
};

// ── Main Component ───────────────────────────────────────────────────────────

export default function AdminLessonEditPage({ params }: { params: { id: string } }) {
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Journey steps state
  const [journeySteps, setJourneySteps] = useState<JourneyStepData[]>([]);
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
  const [editBuffer, setEditBuffer] = useState<JourneyStepData | null>(null);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  // Preview state
  const [showPreview, setShowPreview] = useState(false);
  const [previewStep, setPreviewStep] = useState(0);
  const [activeJourneyTab, setActiveJourneyTab] = useState<"draft" | "live">("draft");

  // Form state for lesson metadata
  const [form, setForm] = useState({
    title: "", description: "", status: "DRAFT", strand: "", subStrand: "",
    learningOutcome: "", term: "", week: "", activityTitle: "", activityInstructions: "",
    questTitle: "", questInstructions: "", reflectionPrompt: "", rewardCoins: 10,
    rewardStars: 0, estimatedDurationMinutes: 30, difficulty: "medium", xpReward: 50,
  });

  // Dirty state tracking
  const [dirtySteps, setDirtySteps] = useState<Set<number>>(new Set());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Load lesson
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/lessons/${params.id}`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          const l = data.lesson;
          setLesson(l);
          setForm({
            title: l.title || "", description: l.description || "", status: l.status || "DRAFT",
            strand: l.strand || "", subStrand: l.subStrand || "", learningOutcome: l.learningOutcome || "",
            term: l.term || "", week: l.week || "", activityTitle: l.activityTitle || "",
            activityInstructions: l.activityInstructions || "", questTitle: l.questTitle || "",
            questInstructions: l.questInstructions || "", reflectionPrompt: l.reflectionPrompt || "",
            rewardCoins: l.rewardCoins || 10, rewardStars: l.rewardStars || 0,
            estimatedDurationMinutes: l.estimatedDurationMinutes || 30,
            difficulty: (typeof l.difficulty === "object" ? l.difficulty?.level : l.difficulty) || "medium",
            xpReward: (typeof l.xpReward === "object" ? l.xpReward?.base : l.xpReward) || 50,
          });
          // Parse journey steps from contentBlocks
          let cb: any = {};
          try { cb = typeof l.contentBlocks === "string" ? JSON.parse(l.contentBlocks) : l.contentBlocks || {}; } catch {}
          const steps = Array.isArray(cb.studentJourneyDraft) && cb.studentJourneyDraft.length > 0
            ? cb.studentJourneyDraft
            : Array.isArray(cb.studentJourney) && cb.studentJourney.length > 0
              ? cb.studentJourney
              : [];
          setJourneySteps(steps);
        } else {
          setError("Failed to load lesson");
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load lesson");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  // Track unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(dirtySteps.size > 0);
  }, [dirtySteps]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsavedChanges]);

  // ── Step editing ──────────────────────────────────────────────────────────

  const startEditingStep = (index: number) => {
    setEditingStepIndex(index);
    setEditBuffer({ ...journeySteps[index] });
    setExpandedStep(index);
  };

  const cancelEditingStep = () => {
    setEditingStepIndex(null);
    setEditBuffer(null);
  };

  const saveStepEdit = () => {
    if (editBuffer === null || editingStepIndex === null) return;
    const newSteps = [...journeySteps];
    newSteps[editingStepIndex] = { ...editBuffer };
    setJourneySteps(newSteps);
    setDirtySteps(prev => new Set(prev).add(editingStepIndex));
    setEditingStepIndex(null);
    setEditBuffer(null);
  };

  const updateEditField = (field: string, value: any) => {
    if (!editBuffer) return;
    setEditBuffer({ ...editBuffer, [field]: value });
  };

  const addNewStep = (afterIndex: number) => {
    const newStep: JourneyStepData = {
      id: `step-${Date.now()}`,
      stepType: "learn",
      title: "New Step",
      studentText: "",
      owlText: "",
    };
    const newSteps = [...journeySteps];
    newSteps.splice(afterIndex + 1, 0, newStep);
    setJourneySteps(newSteps);
    setDirtySteps(prev => new Set(prev).add(afterIndex + 1));
    startEditingStep(afterIndex + 1);
  };

  const deleteStep = (index: number) => {
    if (journeySteps.length <= 1) return;
    const newSteps = journeySteps.filter((_, i) => i !== index);
    setJourneySteps(newSteps);
    setDirtySteps(prev => {
      const next = new Set<number>();
      dirtySteps.forEach(i => { if (i < index) next.add(i); if (i > index) next.add(i - 1); });
      return next;
    });
    if (editingStepIndex === index) {
      setEditingStepIndex(null);
      setEditBuffer(null);
    }
  };

  const moveStep = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= journeySteps.length) return;
    const newSteps = [...journeySteps];
    [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
    setJourneySteps(newSteps);
    setDirtySteps(prev => new Set(prev).add(index).add(newIndex));
  };

  const duplicateStep = (index: number) => {
    const original = journeySteps[index];
    const duplicate: JourneyStepData = {
      ...original,
      id: `step-${Date.now()}`,
      title: `${original.title} (copy)`,
    };
    const newSteps = [...journeySteps];
    newSteps.splice(index + 1, 0, duplicate);
    setJourneySteps(newSteps);
    setDirtySteps(prev => new Set(prev).add(index + 1));
  };

  // ── Save all changes ─────────────────────────────────────────────────────

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setError(null);
    try {
      // Build contentBlocks with updated journey
      let existingCb: any = {};
      try {
        existingCb = typeof lesson?.contentBlocks === "string"
          ? JSON.parse(lesson.contentBlocks)
          : lesson?.contentBlocks || {};
      } catch {}

      // Preserve existing studentJourney (live) alongside draft
      // The student route reads studentJourney; the editor works on draft
      const updatedCb = {
        ...existingCb,
        studentJourneyDraft: journeySteps,
        // Ensure live journey is preserved if it exists
        ...(existingCb.studentJourney ? { studentJourney: existingCb.studentJourney } : {}),
      };

      const res = await fetch(`/api/admin/lessons/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          contentBlocks: updatedCb,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setSaveSuccess(true);
      setLesson(data.lesson);
      setDirtySteps(new Set());
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  // ── Generate journey ─────────────────────────────────────────────────────

  const handleGenerateJourney = useCallback(async () => {
    setGenerating(true);
    setGenerateError(null);
    try {
      const res = await fetch(`/api/admin/lessons/${params.id}/generate-journey`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setJourneySteps(data.studentJourneyDraft || []);
      setDirtySteps(new Set());
    } catch (err: any) {
      setGenerateError(err.message || "Failed to generate journey");
    } finally {
      setGenerating(false);
    }
  }, [params.id]);

  // ── Approve journey ──────────────────────────────────────────────────────

  const handleApproveJourney = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/lessons/${params.id}/review-journey`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "approve" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to approve journey");
      // Reload lesson
      const lessonRes = await fetch(`/api/admin/lessons/${params.id}`, { credentials: "include" });
      if (lessonRes.ok) {
        const lessonData = await lessonRes.json();
        if (lessonData.lesson) setLesson(lessonData.lesson);
      }
    } catch (err: any) {
      setError(err.message || "Failed to approve journey");
    }
  }, [params.id]);

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: colors.bg }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, border: `3px solid ${colors.border}`, borderTopColor: colors.primary, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          <p style={{ color: colors.textMuted, fontSize: 14, fontWeight: 600 }}>Loading lesson editor...</p>
        </div>
      </div>
    );
  }

  if (error && !lesson) {
    return (
      <div style={{ minHeight: "100vh", background: colors.bg, padding: "2rem" }}>
        <div style={{ ...ds.alertError, maxWidth: 600, margin: "0 auto" }}>
          <AlertTriangle style={{ width: 16, height: 16 }} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: 10,
    border: `1.5px solid ${colors.border}`, fontSize: "0.875rem", color: colors.text,
    outline: "none", fontFamily: "inherit", background: "#fff",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "0.8125rem", fontWeight: 700, color: colors.text, marginBottom: 4, display: "block",
  };

  return (
    <div style={{ minHeight: "100vh", background: colors.bg }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ maxWidth: showPreview ? 1400 : 900, margin: "0 auto", padding: "1.5rem" }}>

        {/* ── Top bar ─────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: 8 }}>
          <Link href="/dashboard/admin/lessons" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: colors.textMuted, textDecoration: "none", fontSize: "0.875rem", fontWeight: 600 }}>
            <ArrowLeft style={{ width: 16, height: 16 }} /> Back to Lessons
          </Link>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {hasUnsavedChanges && (
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#D97706", background: "#FEF3C7", padding: "4px 10px", borderRadius: 6 }}>
                ● Unsaved changes
              </span>
            )}
            <button
              onClick={() => setShowPreview(!showPreview)}
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.5rem",
                padding: "8px 14px", borderRadius: 8, border: `1.5px solid ${colors.border}`,
                background: showPreview ? colors.primary : "#fff",
                color: showPreview ? "#fff" : colors.text,
                fontWeight: 700, fontSize: "0.8125rem", cursor: "pointer",
              }}
            >
              {showPreview ? <EyeOff style={{ width: 14, height: 14 }} /> : <Eye style={{ width: 14, height: 14 }} />}
              {showPreview ? "Close Preview" : "Live Preview"}
            </button>
            <button onClick={handleSave} disabled={saving} style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              padding: "10px 22px", borderRadius: 10, border: "none",
              background: saveSuccess ? "#22C55E" : colors.primary,
              color: "#fff", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer",
            }}>
              <Save style={{ width: 16, height: 16 }} />
              {saving ? "Saving..." : saveSuccess ? "Saved ✓" : "Save Changes"}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ ...ds.alertError, marginBottom: "1rem" }}>
            <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}
        {saveSuccess && (
          <div style={{ ...ds.alertSuccess, marginBottom: "1rem" }}>
            ✓ Lesson saved successfully!
          </div>
        )}

        {/* ── Main content ─────────────────────────────────────────────────── */}
        <div style={{ display: showPreview ? "grid" : "block", gridTemplateColumns: showPreview ? "1fr 1fr" : "none", gap: "1.5rem" }}>

          {/* ── LEFT: Editor ──────────────────────────────────────────────── */}
          <div style={{ minWidth: 0 }}>

            {/* Header card */}
            <div style={{ ...ds.card, padding: "1.25rem", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: form.status === "PUBLISHED" ? colors.success : colors.warning, background: form.status === "PUBLISHED" ? `${colors.success}15` : `${colors.warning}15`, padding: "0.2rem 0.5rem", borderRadius: 6 }}>
                  {form.status}
                </span>
                {lesson?.quest?.theme && (
                  <span style={{ fontSize: "0.6875rem", color: colors.textMuted, background: colors.bgSoft, padding: "0.2rem 0.5rem", borderRadius: 6 }}>
                    Grade {lesson.quest.theme.grade} · {lesson.quest.theme.title}
                  </span>
                )}
              </div>
              <input
                value={form.title}
                onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Lesson title..."
                style={{ fontSize: "1.25rem", fontWeight: 800, color: colors.text, border: "none", outline: "none", width: "100%", background: "transparent", marginBottom: "0.5rem" }}
              />
              <input
                value={form.description || ""}
                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Add a short description..."
                style={{ fontSize: "0.875rem", color: colors.textMuted, border: "none", outline: "none", width: "100%", background: "transparent" }}
              />
            </div>

            {/* ── Journey Steps Editor ──────────────────────────────────────── */}
            <div style={{ ...ds.card, padding: "1.25rem", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <h3 style={{ fontSize: "0.9375rem", fontWeight: 800, color: colors.text, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <BookOpen style={{ width: 16, height: 16, color: colors.primary }} />
                  Journey Steps
                  <span style={{ fontSize: "0.75rem", fontWeight: 600, color: colors.textMuted }}>({journeySteps.length} steps)</span>
                </h3>
                <button
                  onClick={handleGenerateJourney}
                  disabled={generating}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "0.35rem",
                    padding: "6px 12px", borderRadius: 8, border: "none",
                    background: colors.primary, color: "#fff", fontWeight: 700,
                    fontSize: "0.75rem", cursor: "pointer",
                  }}
                >
                  <Sparkles style={{ width: 12, height: 12 }} />
                  {generating ? "Generating..." : "Generate Journey"}
                </button>
              </div>

              {generateError && (
                <div style={{ ...ds.alertError, marginBottom: "0.75rem", fontSize: "0.75rem" }}>
                  <AlertCircle style={{ width: 14, height: 14 }} />
                  <span>{generateError}</span>
                </div>
              )}

              {/* Step list */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {journeySteps.map((step, index) => {
                  const config = STEP_CONFIG[step.stepType] || STEP_CONFIG.welcome;
                  const isEditing = editingStepIndex === index;
                  const isExpanded = expandedStep === index;
                  const isDirty = dirtySteps.has(index);

                  return (
                    <div key={step.id} style={{
                      border: `1.5px solid ${isEditing ? config.color : isDirty ? "#D97706" : colors.border}`,
                      borderRadius: 12, overflow: "hidden",
                      background: isEditing ? `${config.color}08` : "#fff",
                    }}>
                      {/* Step header */}
                      <div
                        onClick={() => !isEditing && setExpandedStep(isExpanded ? null : index)}
                        style={{
                          display: "flex", alignItems: "center", gap: 8, padding: "10px 12px",
                          cursor: isEditing ? "default" : "pointer", userSelect: "none",
                        }}
                      >
                        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: colors.textMuted, width: 24, textAlign: "center" }}>
                          {index + 1}
                        </span>
                        <span style={{ fontSize: "1rem" }}>{config.icon}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: colors.text }}>
                              {step.title || "Untitled Step"}
                            </span>
                            {isDirty && (
                              <span style={{ fontSize: "0.625rem", fontWeight: 700, color: "#D97706", background: "#FEF3C7", padding: "1px 5px", borderRadius: 4 }}>
                                edited
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: "0.6875rem", color: colors.textMuted }}>
                            {config.label} — {config.description}
                          </span>
                        </div>
                        <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
                          {index > 0 && (
                            <button onClick={(e) => { e.stopPropagation(); moveStep(index, "up"); }} style={stepActionBtn}>
                              <ChevronUp style={{ width: 12, height: 12 }} />
                            </button>
                          )}
                          {index < journeySteps.length - 1 && (
                            <button onClick={(e) => { e.stopPropagation(); moveStep(index, "down"); }} style={stepActionBtn}>
                              <ChevronDown style={{ width: 12, height: 12 }} />
                            </button>
                          )}
                          {!isEditing ? (
                            <button onClick={(e) => { e.stopPropagation(); startEditingStep(index); }} style={stepActionBtn}>
                              <Edit3 style={{ width: 12, height: 12 }} />
                            </button>
                          ) : (
                            <>
                              <button onClick={(e) => { e.stopPropagation(); saveStepEdit(); }} style={{ ...stepActionBtn, color: "#059669" }}>
                                <Check style={{ width: 12, height: 12 }} />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); cancelEditingStep(); }} style={{ ...stepActionBtn, color: "#DC2626" }}>
                                <X style={{ width: 12, height: 12 }} />
                              </button>
                            </>
                          )}
                          <button onClick={(e) => { e.stopPropagation(); duplicateStep(index); }} style={stepActionBtn} title="Duplicate">
                            <Copy style={{ width: 12, height: 12 }} />
                          </button>
                          {journeySteps.length > 1 && (
                            <button onClick={(e) => { e.stopPropagation(); deleteStep(index); }} style={{ ...stepActionBtn, color: "#DC2626" }}>
                              <Trash2 style={{ width: 12, height: 12 }} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expanded step editor */}
                      {(isExpanded || isEditing) && (
                        <div style={{ padding: "0 12px 12px", borderTop: `1px solid ${colors.border}` }}>
                          {isEditing && editBuffer ? (
                            <div style={{ paddingTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                              {/* Step type selector */}
                              <div>
                                <label style={labelStyle}>Step Type</label>
                                <select
                                  value={editBuffer.stepType}
                                  onChange={e => updateEditField("stepType", e.target.value)}
                                  style={{ ...inputStyle, width: "auto" }}
                                >
                                  {JOURNEY_STEP_TYPES.map(st => (
                                    <option key={st} value={st}>{STEP_CONFIG[st].icon} {STEP_CONFIG[st].label}</option>
                                  ))}
                                </select>
                              </div>

                              {/* Title */}
                              <div>
                                <label style={labelStyle}>Step Title</label>
                                <input
                                  value={editBuffer.title}
                                  onChange={e => updateEditField("title", e.target.value)}
                                  placeholder="e.g., Welcome!, Learn It, Your Turn!"
                                  style={inputStyle}
                                />
                              </div>

                              {/* Owl text */}
                              <div>
                                <label style={labelStyle}>🦉 Owl Teacher Says</label>
                                <textarea
                                  value={editBuffer.owlText}
                                  onChange={e => updateEditField("owlText", e.target.value)}
                                  placeholder="Warm, encouraging guidance for the student..."
                                  rows={3}
                                  style={{ ...inputStyle, resize: "vertical" }}
                                />
                              </div>

                              {/* Student text */}
                              <div>
                                <label style={labelStyle}>📖 Student Content</label>
                                <textarea
                                  value={editBuffer.studentText}
                                  onChange={e => updateEditField("studentText", e.target.value)}
                                  placeholder="Main content for this step — clear, child-friendly..."
                                  rows={4}
                                  style={{ ...inputStyle, resize: "vertical" }}
                                />
                              </div>

                              {/* Math display */}
                              <div>
                                <label style={labelStyle}>🔢 Math Display (optional)</label>
                                <input
                                  value={editBuffer.mathDisplay || ""}
                                  onChange={e => updateEditField("mathDisplay", e.target.value)}
                                  placeholder="e.g., 5 + 3 = 8"
                                  style={inputStyle}
                                />
                              </div>

                              {/* Interaction */}
                              <div>
                                <label style={labelStyle}>✋ Interaction Type</label>
                                <select
                                  value={editBuffer.interaction?.type || "none"}
                                  onChange={e => updateEditField("interaction", { ...editBuffer.interaction, type: e.target.value })}
                                  style={{ ...inputStyle, width: "auto" }}
                                >
                                  <option value="none">None</option>
                                  <option value="open_response">Open Response</option>
                                  <option value="multiple_choice">Multiple Choice</option>
                                  <option value="self_check">Self Check</option>
                                </select>
                              </div>

                              {(editBuffer.interaction?.type === "multiple_choice" || editBuffer.interaction?.type === "open_response") && (
                                <>
                                  <div>
                                    <label style={labelStyle}>Question / Prompt</label>
                                    <textarea
                                      value={editBuffer.interaction?.question || editBuffer.interaction?.prompt || ""}
                                      onChange={e => updateEditField("interaction", { ...editBuffer.interaction, question: e.target.value, prompt: e.target.value })}
                                      placeholder="The question or prompt for the student..."
                                      rows={2}
                                      style={{ ...inputStyle, resize: "vertical" }}
                                    />
                                  </div>
                                  {editBuffer.interaction?.type === "multiple_choice" && (
                                    <div>
                                      <label style={labelStyle}>Answer Options (one per line)</label>
                                      <textarea
                                        value={(editBuffer.interaction?.options || []).join("\n")}
                                        onChange={e => updateEditField("interaction", { ...editBuffer.interaction, options: e.target.value.split("\n").filter(Boolean) })}
                                        placeholder="Option A&#10;Option B&#10;Option C&#10;Option D"
                                        rows={4}
                                        style={{ ...inputStyle, resize: "vertical" }}
                                      />
                                      <label style={{ ...labelStyle, marginTop: 4 }}>Correct Answer Index (0-based)</label>
                                      <input
                                        type="number"
                                        min={0}
                                        value={editBuffer.interaction?.correctAnswer ?? 0}
                                        onChange={e => updateEditField("interaction", { ...editBuffer.interaction, correctAnswer: parseInt(e.target.value) || 0 })}
                                        style={{ ...inputStyle, width: 80 }}
                                      />
                                    </div>
                                  )}
                                </>
                              )}

                              {/* Materials */}
                              <div>
                                <label style={labelStyle}>📦 Materials Needed (one per line)</label>
                                <textarea
                                  value={(editBuffer.materials || []).join("\n")}
                                  onChange={e => updateEditField("materials", e.target.value.split("\n").filter(Boolean))}
                                  placeholder="counters&#10;paper&#10;bottle tops"
                                  rows={2}
                                  style={{ ...inputStyle, resize: "vertical" }}
                                />
                              </div>
                            </div>
                          ) : (
                            /* Read-only preview when expanded but not editing */
                            <div style={{ paddingTop: "0.5rem", fontSize: "0.8125rem", color: colors.textMuted }}>
                              {step.owlText && (
                                <div style={{ marginBottom: "0.5rem" }}>
                                  <span style={{ fontWeight: 700, color: colors.text }}>🦉 Owl: </span>
                                  {step.owlText.slice(0, 120)}{step.owlText.length > 120 ? "..." : ""}
                                </div>
                              )}
                              {step.studentText && (
                                <div>
                                  <span style={{ fontWeight: 700, color: colors.text }}>📖 Content: </span>
                                  {step.studentText.slice(0, 120)}{step.studentText.length > 120 ? "..." : ""}
                                </div>
                              )}
                              {!step.owlText && !step.studentText && (
                                <em>No content yet. Click edit to add content.</em>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add step button */}
              <button
                onClick={() => addNewStep(journeySteps.length - 1)}
                style={{
                  width: "100%", padding: "10px", borderRadius: 10,
                  border: `2px dashed ${colors.border}`, background: "transparent",
                  color: colors.textMuted, fontWeight: 700, fontSize: "0.8125rem",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  marginTop: "0.5rem",
                }}
              >
                <Plus style={{ width: 14, height: 14 }} /> Add Step
              </button>

              {/* Approve journey button */}
              {journeySteps.length > 0 && form.status !== "PUBLISHED" && (
                <button
                  onClick={handleApproveJourney}
                  style={{
                    width: "100%", padding: "12px", borderRadius: 10, border: "none",
                    background: "linear-gradient(135deg, #059669, #10B981)", color: "#fff",
                    fontWeight: 800, fontSize: "0.875rem", cursor: "pointer",
                    marginTop: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  }}
                >
                  <CheckCircle2 style={{ width: 16, height: 16 }} /> Approve Journey & Make Live
                </button>
              )}
            </div>
          </div>

          {/* ── RIGHT: Live Preview ─────────────────────────────────────────── */}
          {showPreview && (
            <div style={{ minWidth: 0 }}>
              <div style={{ ...ds.card, padding: "1rem", position: "sticky", top: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <h3 style={{ fontSize: "0.875rem", fontWeight: 800, color: colors.text, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Eye style={{ width: 14, height: 14, color: colors.primary }} />
                    Live Preview
                  </h3>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button
                      onClick={() => setActiveJourneyTab("draft")}
                      style={{
                        padding: "4px 10px", borderRadius: 6, border: "1.5px solid #6366F1",
                        background: activeJourneyTab === "draft" ? "#6366F1" : "#fff",
                        color: activeJourneyTab === "draft" ? "#fff" : "#6366F1",
                        fontWeight: 700, fontSize: "0.6875rem", cursor: "pointer",
                      }}
                    >
                      📝 Draft
                    </button>
                    <button
                      onClick={() => setActiveJourneyTab("live")}
                      style={{
                        padding: "4px 10px", borderRadius: 6, border: "1.5px solid #059669",
                        background: activeJourneyTab === "live" ? "#059669" : "#fff",
                        color: activeJourneyTab === "live" ? "#fff" : "#059669",
                        fontWeight: 700, fontSize: "0.6875rem", cursor: "pointer",
                      }}
                    >
                      🌐 Live
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                {journeySteps.length > 0 && (
                  <div style={{ marginBottom: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                      <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: colors.textMuted }}>
                        Step {previewStep + 1} of {journeySteps.length}
                      </span>
                      <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: colors.textMuted }}>
                        {Math.round(((previewStep + 1) / journeySteps.length) * 100)}% Complete
                      </span>
                    </div>
                    <div style={{ height: 6, background: colors.bgSoft, borderRadius: 3, overflow: "hidden" }}>
                      <div style={{
                        width: `${((previewStep + 1) / journeySteps.length) * 100}%`,
                        height: "100%", background: "linear-gradient(90deg, #6366F1, #8B5CF6)",
                        borderRadius: 3, transition: "width 0.3s ease",
                      }} />
                    </div>
                  </div>
                )}

                {/* Journey map */}
                <div style={{ display: "flex", gap: 4, marginBottom: "1rem", flexWrap: "wrap" }}>
                  {journeySteps.map((step, i) => {
                    const config = STEP_CONFIG[step.stepType] || STEP_CONFIG.welcome;
                    const isCompleted = i < previewStep;
                    const isCurrent = i === previewStep;
                    return (
                      <button
                        key={step.id}
                        onClick={() => setPreviewStep(i)}
                        style={{
                          width: 32, height: 32, borderRadius: 8, border: "none",
                          background: isCurrent ? config.color : isCompleted ? "#10B981" : colors.bgSoft,
                          color: isCurrent || isCompleted ? "#fff" : colors.textMuted,
                          fontSize: "0.75rem", fontWeight: 700, cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          boxShadow: isCurrent ? `0 2px 8px ${config.color}40` : "none",
                        }}
                        title={step.title}
                      >
                        {isCompleted ? "✓" : config.icon}
                      </button>
                    );
                  })}
                </div>

                {/* Current step preview */}
                {journeySteps[previewStep] && (() => {
                  const step = journeySteps[previewStep];
                  const config = STEP_CONFIG[step.stepType] || STEP_CONFIG.welcome;
                  return (
                    <div style={{ borderRadius: 12, border: `2px solid ${config.color}`, padding: "1.25rem", background: "#fff" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.75rem" }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 10,
                          background: `linear-gradient(135deg, ${config.color}, ${config.color}CC)`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#fff", fontSize: "1rem", fontWeight: 800,
                        }}>
                          {previewStep + 1}
                        </div>
                        <div>
                          <h4 style={{ fontSize: "1rem", fontWeight: 800, color: colors.text }}>{step.title}</h4>
                          <span style={{ fontSize: "0.6875rem", color: colors.textMuted }}>{config.label}</span>
                        </div>
                      </div>

                      {step.owlText && (
                        <div style={{
                          padding: "10px 12px", borderRadius: 10, marginBottom: "0.75rem",
                          background: "linear-gradient(135deg, #F0F9FF, #E0E7FF)",
                          border: "1px solid #BAE6FD",
                        }}>
                          <p style={{ fontSize: "0.8125rem", color: "#1E40AF", lineHeight: 1.5 }}>
                            <span style={{ fontWeight: 700 }}>🦉 Owl Teacher: </span>
                            {step.owlText}
                          </p>
                        </div>
                      )}

                      {step.studentText && (
                        <div style={{ fontSize: "0.875rem", color: colors.text, lineHeight: 1.6, marginBottom: "0.75rem" }}>
                          {step.studentText}
                        </div>
                      )}

                      {step.mathDisplay && (
                        <div style={{
                          padding: "12px", borderRadius: 10, textAlign: "center",
                          background: "#F8FAFC", border: `1px solid ${colors.border}`,
                          marginBottom: "0.75rem",
                        }}>
                          <span style={{ fontSize: "1.25rem", fontFamily: "monospace", fontWeight: 700, color: colors.text }}>
                            {step.mathDisplay}
                          </span>
                        </div>
                      )}

                      {step.interaction?.question && (
                        <div style={{
                          padding: "10px 12px", borderRadius: 10,
                          background: "#FEF3C7", border: "1px solid #FDE68A",
                          marginBottom: "0.75rem",
                        }}>
                          <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#92400E" }}>
                            ✋ {step.interaction.question}
                          </p>
                          {step.interaction.options && (
                            <div style={{ marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                              {step.interaction.options.map((opt, oi) => (
                                <div key={oi} style={{
                                  padding: "6px 10px", borderRadius: 6,
                                  background: oi === step.interaction?.correctAnswer ? "#D1FAE5" : "#fff",
                                  border: `1px solid ${oi === step.interaction?.correctAnswer ? "#10B981" : colors.border}`,
                                  fontSize: "0.75rem", color: colors.text,
                                }}>
                                  {String.fromCharCode(65 + oi)}. {opt}
                                  {oi === step.interaction?.correctAnswer && " ✓"}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Navigation */}
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
                        <button
                          onClick={() => setPreviewStep(Math.max(0, previewStep - 1))}
                          disabled={previewStep === 0}
                          style={{
                            padding: "8px 16px", borderRadius: 8,
                            border: `1px solid ${colors.border}`, background: "#fff",
                            color: colors.text, fontWeight: 700, fontSize: "0.75rem",
                            cursor: previewStep === 0 ? "not-allowed" : "pointer",
                            opacity: previewStep === 0 ? 0.5 : 1,
                          }}
                        >
                          ← Back
                        </button>
                        <button
                          onClick={() => setPreviewStep(Math.min(journeySteps.length - 1, previewStep + 1))}
                          disabled={previewStep === journeySteps.length - 1}
                          style={{
                            padding: "8px 16px", borderRadius: 8, border: "none",
                            background: config.color, color: "#fff",
                            fontWeight: 700, fontSize: "0.75rem",
                            cursor: previewStep === journeySteps.length - 1 ? "not-allowed" : "pointer",
                            opacity: previewStep === journeySteps.length - 1 ? 0.5 : 1,
                          }}
                        >
                          Next →
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const stepActionBtn: React.CSSProperties = {
  padding: 4, borderRadius: 6, border: "none", background: "transparent",
  color: "#94A3B8", cursor: "pointer", display: "flex", alignItems: "center",
};
