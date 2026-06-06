"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, AlertCircle, Save, BookOpen, CheckCircle2, AlertTriangle, Info } from "lucide-react";
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
            {lesson.readiness.missingSteps.length > 0 && (
              <div style={{ marginBottom: "0.5rem" }}>
                <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.35rem" }}>
                  Missing steps
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {lesson.readiness.missingSteps.map((step, i) => (
                    <span key={i} style={{
                      fontSize: "0.6875rem", fontWeight: 600,
                      color: colors.textMuted,
                      background: colors.bgSoft,
                      padding: "0.15rem 0.4rem", borderRadius: 4,
                    }}>
                      {step.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {lesson.readiness.recommendations.length > 0 && (
              <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: "0.5rem", marginTop: "0.25rem" }}>
                {lesson.readiness.recommendations.slice(0, 3).map((rec, i) => (
                  <p key={i} style={{ fontSize: "0.75rem", color: colors.textMuted, marginBottom: "0.2rem", display: "flex", alignItems: "flex-start", gap: "0.35rem" }}>
                    <span style={{ color: colors.warning, flexShrink: 0 }}>•</span>
                    {rec}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

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
