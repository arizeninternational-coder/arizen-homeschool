"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft, AlertCircle, Save, BookOpen, CheckCircle2, AlertTriangle, Info,
  Sparkles, Eye, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp, Play,
} from "lucide-react";
import { ds, colors } from "@/lib/design-system";

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
  // CSV-imported meta fields
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

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Content Missing (Draft)" },
  { value: "REVIEW", label: "In Review" },
  { value: "PUBLISHED", label: "Published" },
];

export default function AdminLessonEditPage({ params }: { params: { id: string } }) {
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Journey state
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [generateSuccess, setGenerateSuccess] = useState(false);
  const [showJourneyPreview, setShowJourneyPreview] = useState(false);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [aiDraft, setAiDraft] = useState<any[] | null>(null);
  const [aiMetadata, setAiMetadata] = useState<any>(null);
  const [hasApprovedJourney, setHasApprovedJourney] = useState(false);

  // Extract journey info from lesson data
  useEffect(() => {
    if (lesson?.contentBlocks) {
      try {
        const cb = typeof lesson.contentBlocks === "string"
          ? JSON.parse(lesson.contentBlocks)
          : lesson.contentBlocks;
        setAiDraft(cb?.studentJourneyDraft || null);
        setAiMetadata(cb?.aiMetadata || null);
        setHasApprovedJourney(
          Array.isArray(cb?.studentJourney) && cb.studentJourney.length > 0
        );
      } catch {
        setAiDraft(null);
        setAiMetadata(null);
        setHasApprovedJourney(false);
      }
    }
  }, [lesson?.contentBlocks]);

  // Form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "DRAFT",
    strand: "",
    subStrand: "",
    learningOutcome: "",
    term: "",
    week: "",
    activityTitle: "",
    activityInstructions: "",
    questTitle: "",
    questInstructions: "",
    reflectionPrompt: "",
    rewardCoins: 10,
    rewardStars: 0,
    estimatedDurationMinutes: 30,
    difficulty: "medium",
    xpReward: 50,
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/lessons/${params.id}`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          const l = data.lesson;
          setLesson(l);
          setForm({
            title: l.title || "",
            description: l.description || "",
            status: l.status || "DRAFT",
            strand: l.strand || "",
            subStrand: l.subStrand || "",
            learningOutcome: l.learningOutcome || "",
            term: l.term || "",
            week: l.week || "",
            activityTitle: l.activityTitle || "",
            activityInstructions: l.activityInstructions || "",
            questTitle: l.questTitle || "",
            questInstructions: l.questInstructions || "",
            reflectionPrompt: l.reflectionPrompt || "",
            rewardCoins: l.rewardCoins || 10,
            rewardStars: l.rewardStars || 0,
            estimatedDurationMinutes: l.estimatedDurationMinutes || 30,
            difficulty: (typeof l.difficulty === "object" ? l.difficulty?.level : l.difficulty) || "medium",
            xpReward: (typeof l.xpReward === "object" ? l.xpReward?.base : l.xpReward) || 50,
          });
        } else {
          const errBody = await res.json().catch(() => ({}));
          setError(errBody.error || "Failed to load lesson");
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load lesson");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  const updateField = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setError(null);
    try {
      const res = await fetch(`/api/admin/lessons/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setSaveSuccess(true);
      setLesson(data.lesson);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  // Generate journey draft
  const handleGenerateJourney = useCallback(async () => {
    setGenerating(true);
    setGenerateError(null);
    setGenerateSuccess(false);
    try {
      const res = await fetch(`/api/admin/lessons/${params.id}/generate-journey`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setGenerateSuccess(true);
      setAiDraft(data.studentJourneyDraft || []);
      setAiMetadata(data.aiMetadata || null);
      // Reload lesson to get updated readiness
      const lessonRes = await fetch(`/api/admin/lessons/${params.id}`, { credentials: "include" });
      if (lessonRes.ok) {
        const lessonData = await lessonRes.json();
        if (lessonData.lesson) {
          setLesson((prev: any) => prev ? { ...prev, ...lessonData.lesson } : prev);
        }
      }
      setTimeout(() => setGenerateSuccess(false), 5000);
    } catch (err: any) {
      setGenerateError(err.message || "Failed to generate journey");
    } finally {
      setGenerating(false);
    }
  }, [params.id]);

  // Approve draft journey
  const handleApproveJourney = useCallback(async () => {
    if (!aiDraft) return;
    try {
      const res = await fetch(`/api/admin/lessons/${params.id}/review-journey`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "approve" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to approve journey");
      setHasApprovedJourney(true);
      setAiDraft(null);
      setAiMetadata({ ...aiMetadata, reviewStatus: "APPROVED" });
      // Reload lesson to get updated readiness
      const lessonRes = await fetch(`/api/admin/lessons/${params.id}`, { credentials: "include" });
      if (lessonRes.ok) {
        const lessonData = await lessonRes.json();
        if (lessonData.lesson) {
          setLesson((prev: any) => prev ? { ...prev, ...lessonData.lesson } : prev);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to approve journey");
    }
  }, [params.id, aiDraft, aiMetadata]);

  // Reject draft journey
  const handleRejectJourney = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/lessons/${params.id}/review-journey`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "reject" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reject journey");
      setAiMetadata({ ...aiMetadata, reviewStatus: "REJECTED" });
    } catch (err: any) {
      setError(err.message || "Failed to reject journey");
    }
  }, [params.id, aiMetadata]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: colors.bg }}>
        <p style={{ color: colors.textMuted }}>Loading lesson...</p>
      </div>
    );
  }

  if (error && !lesson) {
    return (
      <div style={{ minHeight: "100vh", background: colors.bg }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "2rem 1.5rem" }}>
          <Link href="/dashboard/admin/lessons" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: colors.textMuted, textDecoration: "none", fontSize: "0.875rem", fontWeight: 600, marginBottom: "1.5rem" }}>
            <ArrowLeft style={{ width: 16, height: 16 }} /> Back to Lessons
          </Link>
          <div style={{ ...ds.alertError }}>
            <AlertCircle style={{ width: 16, height: 16, flexShrink: 0, marginTop: 2 }} />
            <span>{error || "Lesson not found"}</span>
          </div>
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
    fontSize: "0.8125rem", fontWeight: 700, color: colors.text,
    marginBottom: 4, display: "block",
  };

  return (
    <div style={{ minHeight: "100vh", background: colors.bg }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.5rem" }}>
        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: 8 }}>
          <Link href="/dashboard/admin/lessons" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: colors.textMuted, textDecoration: "none", fontSize: "0.875rem", fontWeight: 600 }}>
            <ArrowLeft style={{ width: 16, height: 16 }} /> Back to Lessons
          </Link>
          <button onClick={handleSave} disabled={saving} style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            padding: "10px 22px", borderRadius: 10, border: "none",
            background: saveSuccess ? "#22C55E" : colors.primary,
            color: "#fff", fontWeight: 700, fontSize: "0.875rem",
            cursor: "pointer",
          }}>
            <Save style={{ width: 16, height: 16 }} />
            {saving ? "Saving..." : saveSuccess ? "Saved ✓" : "Save Changes"}
          </button>
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

        {/* Header card */}
        <div style={{ ...ds.card, padding: "1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
            <span style={{
              fontSize: "0.6875rem", fontWeight: 700, color: form.status === "PUBLISHED" ? colors.success : colors.warning,
              background: form.status === "PUBLISHED" ? `${colors.success}15` : `${colors.warning}15`,
              padding: "0.2rem 0.5rem", borderRadius: 6,
            }}>
              {form.status}
            </span>
            {lesson?.quest?.theme && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.6875rem", color: colors.textMuted, background: colors.bgSoft, padding: "0.2rem 0.5rem", borderRadius: 6 }}>
                <BookOpen style={{ width: 10, height: 10 }} /> Grade {lesson.quest.theme.grade} · {lesson.quest.theme.title}
              </span>
            )}
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: colors.text, marginBottom: "0.5rem" }}>
            Edit Lesson: {form.title}
          </h1>
          <p style={{ color: colors.textMuted, fontSize: "0.875rem" }}>Slug: {lesson?.slug}</p>
        </div>

        {/* Lesson Readiness */}
        {lesson?.readiness && (
          <div style={{ ...ds.card, padding: "1.25rem 1.5rem", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem", flexWrap: "wrap", gap: 8 }}>
              <h3 style={{ fontSize: "0.9375rem", fontWeight: 800, color: colors.text, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Info style={{ width: 16, height: 16, color: colors.primary }} />
                Lesson Readiness
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                {lesson.readiness.isReady ? (
                  <CheckCircle2 style={{ width: 14, height: 14, color: colors.success }} />
                ) : (
                  <AlertTriangle style={{ width: 14, height: 14, color: colors.warning }} />
                )}
                <span style={{
                  fontSize: "0.75rem", fontWeight: 700,
                  color: lesson.readiness.isReady ? colors.success : colors.warning,
                  background: lesson.readiness.isReady ? `${colors.success}15` : `${colors.warning}15`,
                  padding: "0.15rem 0.5rem", borderRadius: 6,
                }}>
                  {lesson.readiness.score >= 70 ? "Ready to publish" :
                   lesson.readiness.score >= 42 ? "Almost ready" :
                   lesson.readiness.score >= 28 ? "Needs work" : "Not ready"}
                </span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <div style={{ flex: 1, height: 8, background: colors.bgSoft, borderRadius: 4, overflow: "hidden" }}>
                <div style={{
                  width: `${Math.min(lesson.readiness.score, 100)}%`,
                  height: "100%",
                  background: lesson.readiness.isReady ? colors.success : colors.warning,
                  borderRadius: 4,
                  transition: "width 0.3s ease",
                }} />
              </div>
              <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: colors.text, whiteSpace: "nowrap" }}>
                {lesson.readiness.score}/100
              </span>
            </div>

            {/* Missing CBC fields warning */}
            {lesson.readiness.missingSteps && lesson.readiness.missingSteps.length > 0 && (
              <div style={{ marginBottom: "0.5rem", padding: "0.5rem 0.75rem", borderRadius: 8, background: "#FEF3C7", border: "1px solid #FDE68A" }}>
                <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#92400E", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <AlertTriangle style={{ width: 12, height: 12 }} />
                  Missing CBC fields ({lesson.readiness.missingSteps.length}):
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {lesson.readiness.missingSteps.map((step, i) => (
                    <span key={i} style={{
                      fontSize: "0.6875rem", fontWeight: 600,
                      color: "#92400E",
                      background: "#FDE68A",
                      padding: "0.15rem 0.4rem", borderRadius: 4,
                    }}>
                      {step.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
                <p style={{ fontSize: "0.625rem", color: "#B45309", marginTop: "0.25rem" }}>
                  AI drafts may be weaker than expected. Fill these fields for better quality.
                </p>
              </div>
            )}

            {/* Recommendations */}
            {lesson.readiness.recommendations && lesson.readiness.recommendations.length > 0 && (
              <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: "0.5rem" }}>
                {lesson.readiness.recommendations.slice(0, 3).map((rec, i) => (
                  <p key={i} style={{ fontSize: "0.75rem", color: colors.textMuted, marginBottom: "0.2rem", display: "flex", alignItems: "flex-start", gap: "0.35rem" }}>
                    <span style={{ color: colors.warning, flexShrink: 0 }}>•</span>
                    {rec}
                  </p>
                ))}
              </div>
            )}

            {/* Draft warning */}
            {aiDraft && aiDraft.length > 0 && aiMetadata?.reviewStatus === "NEEDS_REVIEW" && (
              <div style={{ marginTop: "0.5rem", padding: "0.5rem 0.75rem", borderRadius: 8, background: "#FEF3C7", border: "1px solid #FDE68A", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <AlertTriangle style={{ width: 14, height: 14, color: "#D97706", flexShrink: 0 }} />
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#92400E" }}>
                  Generated journey needs review. Approve below to make it student-visible.
                </span>
              </div>
            )}

            {/* Unapproved video warning */}
            {lesson.readiness.hasUnapprovedVideo && (
              <div style={{ marginTop: "0.5rem", padding: "0.5rem 0.75rem", borderRadius: 8, background: "#FEE2E2", border: "1px solid #FECACA", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <AlertTriangle style={{ width: 14, height: 14, color: "#DC2626", flexShrink: 0 }} />
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#991B1B" }}>
                  Lesson has unapproved video. Approve or remove video before publishing.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Student Journey Review */}
        <div style={{ ...ds.card, padding: "1.25rem 1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: 8 }}>
            <h3 style={{ fontSize: "0.9375rem", fontWeight: 800, color: colors.text, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <BookOpen style={{ width: 16, height: 16, color: colors.primary }} />
              Student Journey
            </h3>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {hasApprovedJourney && (
                <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: colors.success, background: `${colors.success}15`, padding: "0.15rem 0.5rem", borderRadius: 6 }}>
                  ✓ Approved
                </span>
              )}
              {aiMetadata?.reviewStatus === "NEEDS_REVIEW" && (
                <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#D97706", background: "#FEF3C7", padding: "0.15rem 0.5rem", borderRadius: 6 }}>
                  Draft pending review
                </span>
              )}
              {aiMetadata?.reviewStatus === "REJECTED" && (
                <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#DC2626", background: "#FEF2F2", padding: "0.15rem 0.5rem", borderRadius: 6 }}>
                  Draft rejected
                </span>
              )}
            </div>
          </div>

          {/* Generate + Preview buttons */}
          <div style={{ display: "flex", gap: 8, marginBottom: "1rem", flexWrap: "wrap" }}>
            <button
              onClick={handleGenerateJourney}
              disabled={generating}
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.5rem",
                padding: "8px 16px", borderRadius: 8, border: "none",
                background: generating ? colors.textMuted : colors.primary,
                color: "#fff", fontWeight: 700, fontSize: "0.8125rem",
                cursor: generating ? "not-allowed" : "pointer",
              }}
            >
              <Sparkles style={{ width: 14, height: 14 }} />
              {generating ? "Generating..." : "Generate Journey Draft"}
            </button>
            {(hasApprovedJourney || (aiDraft && aiDraft.length > 0)) && (
              <button
                onClick={() => setShowJourneyPreview(!showJourneyPreview)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "0.5rem",
                  padding: "8px 16px", borderRadius: 8, border: `1.5px solid ${colors.primary}`,
                  background: showJourneyPreview ? colors.primary : "#fff",
                  color: showJourneyPreview ? "#fff" : colors.primary,
                  fontWeight: 700, fontSize: "0.8125rem",
                  cursor: "pointer",
                }}
              >
                <Eye style={{ width: 14, height: 14 }} />
                {showJourneyPreview ? "Hide Preview" : "Preview as Student"}
              </button>
            )}
          </div>

          {generateError && (
            <div style={{ ...ds.alertError, marginBottom: "0.75rem", fontSize: "0.8125rem" }}>
              <AlertCircle style={{ width: 14, height: 14, flexShrink: 0 }} />
              <span>{generateError}</span>
            </div>
          )}
          {generateSuccess && (
            <div style={{ ...ds.alertSuccess, marginBottom: "0.75rem", fontSize: "0.8125rem" }}>
              ✓ Journey draft generated! Review below and approve when ready.
            </div>
          )}

          {/* Journey steps display */}
          {(() => {
            // Determine which journey to show: approved > draft > fallback
            const journeyToShow = hasApprovedJourney
              ? (() => {
                  try {
                    const cb = typeof lesson?.contentBlocks === "string"
                      ? JSON.parse(lesson.contentBlocks)
                      : lesson?.contentBlocks;
                    return cb?.studentJourney || [];
                  } catch { return []; }
                })()
              : (aiDraft || []);

            if (journeyToShow.length === 0) {
              return (
                <div style={{ textAlign: "center", padding: "1.5rem", color: colors.textMuted, fontSize: "0.8125rem" }}>
                  <p style={{ marginBottom: "0.5rem" }}>No student journey yet.</p>
                  <p>Fill in curriculum fields above, then click <strong>Generate Journey Draft</strong> to create one.</p>
                  <p style={{ marginTop: "0.5rem", fontSize: "0.75rem" }}>
                    Or add content manually — a fallback journey will be built from your CBC fields.
                  </p>
                </div>
              );
            }

            const stepIcons: Record<string, string> = {
              welcome: "🦉", mission: "🎯", think_first: "💭", learn: "📖",
              connect: "🔗", example: "💡", practice: "✏️", quick_check: "✅",
              reflect: "🪞", complete: "🏆",
            };

            return (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {journeyToShow.map((step: any, i: number) => {
                  const isExpanded = expandedStep === i;
                  return (
                    <div key={i} style={{
                      border: `1px solid ${colors.border}`,
                      borderRadius: 8,
                      overflow: "hidden",
                    }}>
                      <button
                        onClick={() => setExpandedStep(isExpanded ? null : i)}
                        style={{
                          width: "100%", display: "flex", alignItems: "center", gap: 8,
                          padding: "8px 12px", background: isExpanded ? colors.bgSoft : "#fff",
                          border: "none", cursor: "pointer", textAlign: "left",
                        }}
                      >
                        <span style={{ fontSize: "1rem" }}>{stepIcons[step.stepType] || "📌"}</span>
                        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: colors.text, flex: 1 }}>
                          {i + 1}. {step.title || step.stepType}
                        </span>
                        <span style={{ fontSize: "0.625rem", color: colors.textMuted, textTransform: "uppercase" }}>
                          {step.stepType}
                        </span>
                        {isExpanded ? <ChevronUp size={14} style={{ color: colors.textMuted }} /> : <ChevronDown size={14} style={{ color: colors.textMuted }} />}
                      </button>
                      {isExpanded && (
                        <div style={{ padding: "10px 12px", borderTop: `1px solid ${colors.border}`, background: "#fff" }}>
                          {step.studentText && (
                            <div style={{ marginBottom: "0.5rem" }}>
                              <p style={{ fontSize: "0.625rem", fontWeight: 700, color: colors.textMuted, textTransform: "uppercase", marginBottom: 2 }}>Student text</p>
                              <p style={{ fontSize: "0.8125rem", color: colors.text }}>{step.studentText}</p>
                            </div>
                          )}
                          {step.owlText && (
                            <div style={{ marginBottom: "0.5rem" }}>
                              <p style={{ fontSize: "0.625rem", fontWeight: 700, color: colors.textMuted, textTransform: "uppercase", marginBottom: 2 }}>Owl Teacher</p>
                              <p style={{ fontSize: "0.8125rem", color: colors.text, fontStyle: "italic" }}>{step.owlText}</p>
                            </div>
                          )}
                          {step.interaction?.type && step.interaction.type !== "none" && (
                            <div style={{ marginBottom: "0.5rem" }}>
                              <p style={{ fontSize: "0.625rem", fontWeight: 700, color: colors.textMuted, textTransform: "uppercase", marginBottom: 2 }}>Interaction</p>
                              <span style={{ fontSize: "0.75rem", fontWeight: 600, color: colors.primary, background: `${colors.primary}10`, padding: "2px 8px", borderRadius: 4 }}>
                                {step.interaction.type}
                              </span>
                              {step.interaction.question && (
                                <p style={{ fontSize: "0.75rem", color: colors.textMuted, marginTop: 4 }}>{step.interaction.question}</p>
                              )}
                            </div>
                          )}
                          {step.illustrationPrompt && (
                            <div style={{ marginBottom: "0.5rem" }}>
                              <p style={{ fontSize: "0.625rem", fontWeight: 700, color: colors.textMuted, textTransform: "uppercase", marginBottom: 2 }}>Illustration</p>
                              <p style={{ fontSize: "0.75rem", color: colors.textMuted, fontStyle: "italic" }}>{step.illustrationPrompt}</p>
                            </div>
                          )}
                          {step.video?.required && (
                            <div>
                              <p style={{ fontSize: "0.625rem", fontWeight: 700, color: colors.textMuted, textTransform: "uppercase", marginBottom: 2 }}>Video</p>
                              <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: step.video.approvedByAdmin ? colors.success : "#D97706", background: step.video.approvedByAdmin ? `${colors.success}10` : "#FEF3C7", padding: "2px 8px", borderRadius: 4 }}>
                                {step.video.approvedByAdmin ? "✓ Approved" : "⚠ Not approved"}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* Student Journey Preview — renders the actual student experience */}
          {showJourneyPreview && (hasApprovedJourney || (aiDraft && aiDraft.length > 0)) && (() => {
            const previewJourney = hasApprovedJourney
              ? (() => {
                  try {
                    const cb = typeof lesson?.contentBlocks === "string"
                      ? JSON.parse(lesson.contentBlocks)
                      : lesson?.contentBlocks;
                    return cb?.studentJourney || [];
                  } catch { return []; }
                })()
              : (aiDraft || []);
            return (
              <div style={{ marginTop: "1rem", border: `2px solid ${colors.primary}`, borderRadius: 12, overflow: "hidden" }}>
                <div style={{ padding: "10px 16px", background: colors.primary, color: "#fff", fontWeight: 700, fontSize: "0.8125rem", display: "flex", alignItems: "center", gap: 8 }}>
                  <Eye style={{ width: 14, height: 14 }} />
                  Student Preview — {previewJourney.length} steps
                </div>
                <div style={{ padding: "12px 16px", background: "#fff" }}>
                  {previewJourney.map((step: any, i: number) => {
                    const stepIcons: Record<string, string> = {
                      welcome: "🦉", mission: "🎯", think_first: "💭", learn: "📖",
                      connect: "🔗", example: "💡", practice: "✏️", quick_check: "✅",
                      reflect: "🪞", complete: "🏆",
                    };
                    return (
                      <div key={i} style={{ marginBottom: 8, padding: "8px 10px", borderRadius: 8, background: colors.bgSoft, border: `1px solid ${colors.border}` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                          <span style={{ fontSize: "1rem" }}>{stepIcons[step.stepType] || "📌"}</span>
                          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: colors.text }}>
                            Step {i + 1}: {step.title || step.stepType}
                          </span>
                          {step.interaction?.type && step.interaction.type !== "none" && (
                            <span style={{ fontSize: "0.625rem", fontWeight: 600, color: colors.primary, background: `${colors.primary}15`, padding: "1px 6px", borderRadius: 4 }}>
                              ✋ {step.interaction.type.replace(/_/g, " ")}
                            </span>
                          )}
                        </div>
                        {step.studentText && (
                          <p style={{ fontSize: "0.75rem", color: colors.text, lineHeight: 1.4, margin: "4px 0 0 22px" }}>
                            {step.studentText.length > 150 ? step.studentText.slice(0, 150) + "…" : step.studentText}
                          </p>
                        )}
                        {step.owlText && (
                          <p style={{ fontSize: "0.6875rem", color: colors.textMuted, fontStyle: "italic", margin: "2px 0 0 22px" }}>
                            🦉 {step.owlText.length > 100 ? step.owlText.slice(0, 100) + "…" : step.owlText}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
          {aiDraft && aiDraft.length > 0 && aiMetadata?.reviewStatus === "NEEDS_REVIEW" && (
            <div style={{ display: "flex", gap: 8, marginTop: "1rem", paddingTop: "1rem", borderTop: `1px solid ${colors.border}` }}>
              <button
                onClick={handleApproveJourney}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "0.5rem",
                  padding: "8px 16px", borderRadius: 8, border: "none",
                  background: colors.success, color: "#fff",
                  fontWeight: 700, fontSize: "0.8125rem", cursor: "pointer",
                }}
              >
                <ThumbsUp style={{ width: 14, height: 14 }} />
                Approve Journey
              </button>
              <button
                onClick={handleRejectJourney}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "0.5rem",
                  padding: "8px 16px", borderRadius: 8, border: `1.5px solid ${colors.border}`,
                  background: "#fff", color: colors.textMuted,
                  fontWeight: 700, fontSize: "0.8125rem", cursor: "pointer",
                }}
              >
                <ThumbsDown style={{ width: 14, height: 14 }} />
                Reject Draft
              </button>
            </div>
          )}

          {/* AI metadata */}
          {aiMetadata && (
            <div style={{ marginTop: "0.75rem", padding: "0.5rem 0.75rem", borderRadius: 6, background: colors.bgSoft, fontSize: "0.6875rem", color: colors.textMuted }}>
              {aiMetadata.model && <span>Model: {aiMetadata.model} · </span>}
              {aiMetadata.generatedAt && <span>Generated: {new Date(aiMetadata.generatedAt).toLocaleString()} · </span>}
              <span>Status: {aiMetadata.reviewStatus}</span>
            </div>
          )}
        </div>

        {/* ── Illustrations Section ── */}
        {(() => {
          const journeyForIllustrations = (() => {
            try {
              const cb = typeof lesson?.contentBlocks === "string" ? JSON.parse(lesson.contentBlocks) : lesson?.contentBlocks;
              return (cb?.studentJourney || cb?.studentJourneyDraft || []).filter((s: any) => s.illustrationPrompt);
            } catch { return []; }
          })();

          if (journeyForIllustrations.length === 0) return null;

          const stepIcons: Record<string, string> = {
            welcome: "🦉", mission: "🎯", think_first: "💭", learn: "📖",
            connect: "🔗", example: "💡", practice: "✏️", quick_check: "✅",
            reflect: "🪞", complete: "🏆",
          };

          return (
            <div style={{ ...ds.card, padding: "1.25rem 1.5rem", marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "0.9375rem", fontWeight: 800, color: colors.text, display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <Sparkles style={{ width: 16, height: 16, color: colors.primary }} />
                Illustrations
                <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: colors.textMuted, background: colors.bgSoft, padding: "0.15rem 0.5rem", borderRadius: 6 }}>
                  {journeyForIllustrations.length} steps
                </span>
              </h3>
              <p style={{ fontSize: "0.75rem", color: colors.textMuted, marginBottom: "1rem" }}>
                Generate or upload images for each lesson step. Students will see these illustrations during their journey.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {journeyForIllustrations.map((step: any, i: number) => (
                  <div key={i} style={{ border: `1px solid ${colors.border}`, borderRadius: 10, padding: "12px 14px", background: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                      <span style={{ fontSize: "1.1rem" }}>{stepIcons[step.stepType] || "📌"}</span>
                      <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: colors.text }}>
                        Step {i + 1}: {step.title || step.stepType}
                      </span>
                      <span style={{ fontSize: "0.625rem", fontWeight: 600, color: colors.textMuted, background: colors.bgSoft, padding: "1px 6px", borderRadius: 4, textTransform: "uppercase" }}>
                        {step.stepType}
                      </span>
                    </div>
                    <div style={{ background: colors.bgSoft, borderRadius: 8, padding: "8px 10px", marginBottom: "8px" }}>
                      <p style={{ fontSize: "0.625rem", fontWeight: 700, color: colors.textMuted, textTransform: "uppercase", marginBottom: "2px" }}>Illustration Prompt</p>
                      <p style={{ fontSize: "0.75rem", color: colors.text, fontStyle: "italic" }}>{step.illustrationPrompt}</p>
                    </div>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      <button
                        disabled
                        style={{
                          display: "inline-flex", alignItems: "center", gap: "0.35rem",
                          padding: "5px 12px", borderRadius: 6, border: "none",
                          background: colors.primary, color: "#fff",
                          fontWeight: 700, fontSize: "0.6875rem",
                          cursor: "not-allowed", opacity: 0.5,
                        }}
                      >
                        <Sparkles style={{ width: 12, height: 12 }} />
                        Generate with AI
                      </button>
                      <button
                        disabled
                        style={{
                          display: "inline-flex", alignItems: "center", gap: "0.35rem",
                          padding: "5px 12px", borderRadius: 6, border: `1.5px solid ${colors.border}`,
                          background: "#fff", color: colors.textMuted,
                          fontWeight: 700, fontSize: "0.6875rem",
                          cursor: "not-allowed", opacity: 0.5,
                        }}
                      >
                        Upload Image
                      </button>
                    </div>
                    <p style={{ fontSize: "0.625rem", color: colors.textMuted, marginTop: "6px", fontStyle: "italic" }}>
                      💡 AI image generation coming soon. For now, illustrations will use placeholder graphics.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Edit form */}
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {/* Basic Info */}
          <div style={{ ...ds.card, padding: "1.5rem" }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: colors.text, marginBottom: "1rem" }}>Basic Information</h2>
            <div style={{ display: "grid", gap: "1rem" }}>
              <div>
                <label style={labelStyle}>Lesson Title *</label>
                <input style={inputStyle} value={form.title} onChange={e => updateField("title", e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={form.description} onChange={e => updateField("description", e.target.value)} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={labelStyle}>Status</label>
                  <select style={inputStyle} value={form.status} onChange={e => updateField("status", e.target.value)}>
                    {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>XP Reward</label>
                  <input type="number" style={inputStyle} value={form.xpReward} onChange={e => updateField("xpReward", Number(e.target.value))} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={labelStyle}>Difficulty</label>
                  <select style={inputStyle} value={form.difficulty} onChange={e => updateField("difficulty", e.target.value)}>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Estimated Duration (min)</label>
                  <input type="number" style={inputStyle} value={form.estimatedDurationMinutes} onChange={e => updateField("estimatedDurationMinutes", Number(e.target.value))} />
                </div>
                <div style={{ display: "none" }} />
              </div>
            </div>
          </div>

          {/* Curriculum Details */}
          <div style={{ ...ds.card, padding: "1.5rem" }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: colors.text, marginBottom: "1rem" }}>Curriculum Details</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={labelStyle}>Strand</label>
                <input style={inputStyle} value={form.strand} onChange={e => updateField("strand", e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Sub-Strand</label>
                <input style={inputStyle} value={form.subStrand} onChange={e => updateField("subStrand", e.target.value)} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Learning Outcome</label>
                <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={form.learningOutcome} onChange={e => updateField("learningOutcome", e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Term</label>
                <input style={inputStyle} value={form.term} onChange={e => updateField("term", e.target.value)} placeholder="Term 1" />
              </div>
              <div>
                <label style={labelStyle}>Week</label>
                <input style={inputStyle} value={form.week} onChange={e => updateField("week", e.target.value)} placeholder="Week 1" />
              </div>
            </div>
          </div>

          {/* Activity */}
          <div style={{ ...ds.card, padding: "1.5rem" }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: colors.text, marginBottom: "1rem" }}>Activity</h2>
            <div style={{ display: "grid", gap: "1rem" }}>
              <div>
                <label style={labelStyle}>Activity Title</label>
                <input style={inputStyle} value={form.activityTitle} onChange={e => updateField("activityTitle", e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Activity Instructions</label>
                <textarea style={{ ...inputStyle, minHeight: 100, resize: "vertical" }} value={form.activityInstructions} onChange={e => updateField("activityInstructions", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Quest */}
          <div style={{ ...ds.card, padding: "1.5rem" }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: colors.text, marginBottom: "1rem" }}>Quest</h2>
            <div style={{ display: "grid", gap: "1rem" }}>
              <div>
                <label style={labelStyle}>Quest Title</label>
                <input style={inputStyle} value={form.questTitle} onChange={e => updateField("questTitle", e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Quest Instructions</label>
                <textarea style={{ ...inputStyle, minHeight: 100, resize: "vertical" }} value={form.questInstructions} onChange={e => updateField("questInstructions", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Reflection & Rewards */}
          <div style={{ ...ds.card, padding: "1.5rem" }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: colors.text, marginBottom: "1rem" }}>Reflection & Rewards</h2>
            <div style={{ display: "grid", gap: "1rem" }}>
              <div>
                <label style={labelStyle}>Reflection Prompt</label>
                <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={form.reflectionPrompt} onChange={e => updateField("reflectionPrompt", e.target.value)} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={labelStyle}>Reward Coins</label>
                  <input type="number" style={inputStyle} value={form.rewardCoins} onChange={e => updateField("rewardCoins", Number(e.target.value))} />
                </div>
                <div>
                  <label style={labelStyle}>Reward Stars</label>
                  <input type="number" style={inputStyle} value={form.rewardStars} onChange={e => updateField("rewardStars", Number(e.target.value))} />
                </div>
              </div>
            </div>
          </div>

          {/* Save button at bottom too */}
          <div style={{ display: "flex", justifyContent: "flex-end", paddingBottom: "2rem" }}>
            <button onClick={handleSave} disabled={saving} style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              padding: "12px 28px", borderRadius: 12, border: "none",
              background: saveSuccess ? "#22C55E" : colors.primary,
              color: "#fff", fontWeight: 700, fontSize: "0.9375rem",
              cursor: "pointer",
            }}>
              <Save style={{ width: 18, height: 18 }} />
              {saving ? "Saving..." : saveSuccess ? "Saved ✓" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
