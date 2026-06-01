"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, Star, Zap, BookOpen } from "lucide-react";

const C = {
  page: "#F7FBF7", teal: "#047A70", dark: "#0F172A", body: "#64748B",
  white: "#FFFFFF", border: "#E2E8F0", cream: "#FFFBEB",
};

export default function StudentLessonPage() {
  const params = useParams();
  const router = useRouter();
  const lessonSlug = params.lessonSlug as string;
  const [loading, setLoading] = useState(true);
  const [lesson, setLesson] = useState<any>(null);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [earnedXp, setEarnedXp] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/learner/lessons/${lessonSlug}`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setLesson(data.lesson || data);
          setCompleted(data.lesson?.completed || data.completed || false);
        }
      } catch (e) { console.error("[LESSON] Load error:", e); }
      setLoading(false);
    };
    load();
  }, [lessonSlug]);

  const handleComplete = async () => {
    setCompleting(true);
    try {
      const res = await fetch(`/api/learner/lessons/${lessonSlug}/complete`, {
        method: "POST", credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setCompleted(true);
        setEarnedXp(data.xpEarned || lesson?.xpReward || 10);
      }
    } catch (e) { console.error("[LESSON] Complete error:", e); }
    setCompleting(false);
  };

  if (loading) return null;
  if (!lesson) return (
    <div style={{ padding: "28px 32px", textAlign: "center" }}>
      <p style={{ color: C.body }}>Lesson not found.</p>
      <Link href="/dashboard/student/subjects" style={{ color: C.teal }}>← Back to Subjects</Link>
    </div>
  );

  let contentData: any = {};
  try { contentData = JSON.parse(lesson.contentBlocks || "{}"); } catch (e) { contentData = {}; }
  const xpReward = typeof lesson.xpReward === "number" ? lesson.xpReward : (JSON.parse(lesson.xpReward || '{"base":10}').base || 10);

  return (
    <div style={{ padding: "28px 32px 40px", maxWidth: 900, margin: "0 auto" }}>
      {/* Back link */}
      <Link href="/dashboard/student/subjects" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: C.body, fontSize: "0.875rem", fontWeight: 600, textDecoration: "none", marginBottom: "1.5rem" }}>
        <ArrowLeft size={16} /> Back to Subjects
      </Link>

      {/* Success banner */}
      {earnedXp !== null && (
        <div style={{
          padding: "16px 20px", borderRadius: 16, marginBottom: 24,
          background: "linear-gradient(135deg, #ECFDF5, #D1FAE5)",
          border: "1px solid #A7F3D0", display: "flex", alignItems: "center", gap: 12,
        }}>
          <CheckCircle2 size={24} style={{ color: "#059669" }} />
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#065F46", margin: "0 0 2px" }}>Lesson Complete! 🎉</h3>
            <p style={{ fontSize: "0.875rem", color: "#065F46", margin: 0 }}>You earned <strong>{earnedXp} XP</strong>!</p>
          </div>
        </div>
      )}

      {/* Lesson header */}
      <div style={{
        background: C.white, borderRadius: 20, border: "1px solid " + C.border,
        padding: "28px 32px", marginBottom: 24, boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          {contentData.subject && (
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: C.teal, background: "#E6F5F1", padding: "3px 10px", borderRadius: 6, textTransform: "uppercase" }}>
              {contentData.subject}
            </span>
          )}
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#D97706", background: C.cream, padding: "3px 10px", borderRadius: 6 }}>
            +{xpReward} XP
          </span>
          {completed && (
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#059669", background: "#ECFDF5", padding: "3px 10px", borderRadius: 6, display: "flex", alignItems: "center", gap: 4 }}>
              <CheckCircle2 size={12} /> Completed
            </span>
          )}
        </div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: C.dark, margin: "0 0 8px" }}>{lesson.title}</h1>
        {lesson.description && (
          <p style={{ fontSize: "0.9375rem", color: C.body, margin: "0 0 16px" }}>{lesson.description}</p>
        )}
        {contentData.strand && (
          <div style={{ display: "flex", gap: 16, fontSize: "0.8125rem", color: C.body }}>
            {contentData.strand && <span>Strand: <strong style={{ color: C.dark }}>{contentData.strand}</strong></span>}
            {contentData.subStrand && <span>Sub-Strand: <strong style={{ color: C.dark }}>{contentData.subStrand}</strong></span>}
          </div>
        )}
      </div>

      {/* Lesson content */}
      <div style={{
        background: C.white, borderRadius: 20, border: "1px solid " + C.border,
        padding: "28px 32px", marginBottom: 24, boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
      }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: C.dark, margin: "0 0 16px" }}>Lesson Content</h2>
        {contentData.content ? (
          <div style={{ fontSize: "0.9375rem", color: C.dark, lineHeight: 1.7 }}>{contentData.content}</div>
        ) : lesson.contentBlocks ? (
          <div style={{ fontSize: "0.9375rem", color: C.body, lineHeight: 1.7 }}>
            <p>This lesson is part of the {contentData.strand || "curriculum"} strand.
            Complete the activities below to progress.</p>
          </div>
        ) : (
          <p style={{ color: C.body, fontSize: "0.875rem" }}>Lesson content will be displayed here.</p>
        )}

        {contentData.activity && (
          <div style={{ marginTop: 20, padding: "16px 20px", borderRadius: 14, background: "#EFF6FF", border: "1px solid #DBEAFE" }}>
            <h3 style={{ fontSize: "0.9375rem", fontWeight: 800, color: "#1E40AF", margin: "0 0 6px" }}>Activity</h3>
            <p style={{ fontSize: "0.875rem", color: "#1E40AF", margin: 0 }}>{contentData.activity}</p>
          </div>
        )}

        {contentData.questions && (
          <div style={{ marginTop: 20, padding: "16px 20px", borderRadius: 14, background: "#FEF3C7", border: "1px solid #FDE68A" }}>
            <h3 style={{ fontSize: "0.9375rem", fontWeight: 800, color: "#92400E", margin: "0 0 6px" }}>Questions</h3>
            <p style={{ fontSize: "0.875rem", color: "#92400E", margin: 0 }}>{contentData.questions}</p>
          </div>
        )}
      </div>

      {/* Complete button */}
      {!completed && !earnedXp && (
        <button onClick={handleComplete} disabled={completing} style={{
          width: "100%", padding: "16px", borderRadius: 16, border: "none",
          background: "linear-gradient(135deg, #047A70, #005B50)", color: "#fff",
          fontWeight: 800, fontSize: "1rem", cursor: completing ? "default" : "pointer",
          boxShadow: "0 4px 16px rgba(4,122,112,0.25)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          opacity: completing ? 0.7 : 1,
        }}>
          {completing ? "Completing..." : <><CheckCircle2 size={18} /> Mark as Complete</>}
        </button>
      )}
    </div>
  );
}
