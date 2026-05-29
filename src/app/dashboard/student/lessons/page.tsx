"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen, ChevronRight, Sparkles, Clock, CheckCircle, Play, Award, Filter, Search
} from "lucide-react";
import { ds, colors } from "@/lib/design-system";

interface LessonItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: string;
  orderIndex: number;
  xpReward: any;
  createdAt: string;
  quest?: {
    id: string;
    title: string;
    theme?: {
      id: string;
      title: string;
      grade: number;
    };
  };
  progress?: {
    status: string;
    completedAt: string | null;
  };
}

export default function StudentLessonsPage() {
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "available" | "completed">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/learner/lessons", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setLessons(data.lessons || []);
        } else {
          const errBody = await res.json().catch(() => ({}));
          setError(errBody.error || "Failed to load lessons");
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load lessons");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = lessons.filter(l => {
    if (filter === "completed" && l.progress?.status !== "COMPLETED") return false;
    if (filter === "available" && l.progress?.status === "COMPLETED") return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return l.title.toLowerCase().includes(q) || l.quest?.theme?.title?.toLowerCase().includes(q) || l.quest?.title?.toLowerCase().includes(q);
  });

  const completedCount = lessons.filter(l => l.progress?.status === "COMPLETED").length;

  return (
    <div style={{ minHeight: "100vh", background: colors.bg }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "1.25rem" }}>
        {/* Header */}
        <div style={{ marginBottom: "1.25rem" }}>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 800, color: colors.text, marginBottom: "0.25rem" }}>My Lessons</h1>
          <p style={{ color: colors.textMuted, fontSize: "0.875rem" }}>
            {completedCount}/{lessons.length} completed
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
          {([
            { key: "all", label: `All (${lessons.length})` },
            { key: "available", label: `To Do (${lessons.length - completedCount})` },
            { key: "completed", label: `Done (${completedCount})` },
          ] as const).map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: "0.375rem 0.875rem",
                borderRadius: 8,
                border: "none",
                background: filter === f.key ? colors.primary : colors.bgSoft,
                color: filter === f.key ? "white" : colors.textMuted,
                fontWeight: 700,
                fontSize: "0.75rem",
                cursor: "pointer",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ ...ds.card, textAlign: "center", padding: "2.5rem 1.5rem", color: colors.textMuted }}>
            Loading lessons...
          </div>
        ) : error ? (
          <div style={{ ...ds.alertError }}>
            <span>{error}</span>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ ...ds.card, textAlign: "center", padding: "2.5rem 1.5rem" }}>
            <BookOpen style={{ width: 40, height: 40, color: colors.textMuted, margin: "0 auto 0.75rem", opacity: 0.4 }} />
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: colors.text, marginBottom: "0.375rem" }}>
              {search ? "No lessons match your search" : filter === "completed" ? "No completed lessons yet" : "No lessons available yet"}
            </h3>
            <p style={{ color: colors.textMuted, fontSize: "0.875rem" }}>
              {search ? "Try a different search term." : filter === "completed" ? "Complete your first lesson to see it here." : "Lessons will appear here when your curriculum is published."}
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "0.5rem" }}>
            {filtered.map((lesson) => {
              const isCompleted = lesson.progress?.status === "COMPLETED";
              const xpVal = typeof lesson.xpReward === "object" ? (lesson.xpReward?.base || lesson.xpReward?.amount || 0) : (lesson.xpReward || 0);
              return (
                <Link
                  key={lesson.id}
                  href={`/dashboard/student/lessons/${lesson.id}`}
                  style={{
                    ...ds.card,
                    padding: "1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    textDecoration: "none",
                    border: isCompleted ? `1.5px solid ${colors.success}30` : undefined,
                  }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: isCompleted ? `${colors.success}15` : colors.primarySoft,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    {isCompleted
                      ? <CheckCircle style={{ width: 20, height: 20, color: colors.success }} />
                      : <BookOpen style={{ width: 20, height: 20, color: colors.primary }} />
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: colors.text, fontSize: "0.875rem", marginBottom: "0.125rem" }}>
                      {lesson.title}
                    </div>
                    <div style={{ fontSize: "0.6875rem", color: colors.textMuted }}>
                      {lesson.quest?.theme && <span>{lesson.quest.theme.title}</span>}
                      {lesson.quest && lesson.quest.theme && " · "}
                      {lesson.quest?.title}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
                    {xpVal > 0 && (
                      <span style={{ fontSize: "0.6875rem", color: "#B45309", fontWeight: 700, background: "#FEF3C7", padding: "0.15rem 0.4rem", borderRadius: 4 }}>
                        {xpVal} XP
                      </span>
                    )}
                    {isCompleted && (
                      <span style={{ fontSize: "0.625rem", color: colors.success, fontWeight: 700, background: `${colors.success}15`, padding: "0.15rem 0.4rem", borderRadius: 4 }}>
                        DONE
                      </span>
                    )}
                    <ChevronRight style={{ width: 16, height: 16, color: colors.textMuted }} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
