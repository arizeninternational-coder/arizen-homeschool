"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { BookOpen, ArrowLeft, Plus, Search, AlertCircle, CheckCircle, Eye, Edit, Layers, GraduationCap, Loader2 } from "lucide-react";
import { PageHeader, SectionHeader, GradientButton, StatCard, EmptyStateCard } from "@/components/ui/Pill";
import { BookIcon } from "@/components/ui/Illustrations";

interface LessonRecord {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: string;
  orderIndex: number;
  createdAt: string;
  quest?: {
    id: string;
    title: string;
    theme?: { id: string; title: string; grade: number; status: string };
  };
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Content Missing",
  REVIEW: "In Review",
  PUBLISHED: "Published",
};

export default function AdminLessonsPage() {
  const [lessons, setLessons] = useState<LessonRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterGrade, setFilterGrade] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [publishing, setPublishing] = useState<string | null>(null);

  const loadLessons = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/lessons", { credentials: "include" });
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
  }, []);

  useEffect(() => { loadLessons(); }, [loadLessons]);

  const handlePublish = async (lesson: LessonRecord) => {
    if (publishing) return;
    setPublishing(lesson.id);
    try {
      const res = await fetch(`/api/admin/lessons/${lesson.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: "PUBLISHED" }),
      });
      if (res.ok) {
        if (lesson.quest?.id) {
          await fetch(`/api/admin/quests/${lesson.quest.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ status: "PUBLISHED" }),
          }).catch(() => {});
        }
        if (lesson.quest?.theme?.id) {
          await fetch(`/api/admin/themes/${lesson.quest.theme.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ status: "PUBLISHED" }),
          }).catch(() => {});
        }
        setLessons(prev => prev.map(l => l.id === lesson.id ? { ...l, status: "PUBLISHED" } : l));
      }
    } catch (e) {
      console.error("[PUBLISH] Error:", e);
    }
    setPublishing(null);
  };

  const handleUnpublish = async (lesson: LessonRecord) => {
    if (publishing) return;
    setPublishing(lesson.id);
    try {
      const res = await fetch(`/api/admin/lessons/${lesson.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: "DRAFT" }),
      });
      if (res.ok) {
        setLessons(prev => prev.map(l => l.id === lesson.id ? { ...l, status: "DRAFT" } : l));
      }
    } catch (e) {
      console.error("[UNPUBLISH] Error:", e);
    }
    setPublishing(null);
  };

  const grades = [...new Set(lessons.map(l => l.quest?.theme?.grade).filter(Boolean))].sort();

  const filtered = lessons.filter(l => {
    if (filterGrade !== "all" && l.quest?.theme?.grade !== parseInt(filterGrade)) return false;
    if (filterStatus !== "all" && l.status !== filterStatus) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (l.title || "").toLowerCase().includes(q) || (l.quest?.title || "").toLowerCase().includes(q);
  });

  const publishedCount = lessons.filter(l => l.status === "PUBLISHED").length;
  const draftCount = lessons.filter(l => l.status === "DRAFT").length;

  return (
    <div className="min-h-screen bg-bg-main">
      <div className="max-w-[1100px] mx-auto py-8 px-6">
        {/* Top bar */}
        <div className="flex justify-between items-center mb-6">
          <Link href="/dashboard/admin" className="inline-flex items-center gap-2 text-text-muted hover:text-text text-sm font-semibold transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Admin Dashboard
          </Link>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border-soft text-text-muted hover:bg-white hover:border-primary/30 cursor-pointer text-xs font-semibold transition-all">
            Sign Out
          </button>
        </div>

        {/* Header */}
        <PageHeader title="Lessons" subtitle={`${lessons.length} lessons · ${publishedCount} published · ${draftCount} draft`}>
          <div className="flex gap-2 mt-4">
            <Link href="/dashboard/admin/curriculum/import">
              <GradientButton variant="secondary" size="sm">📥 Import</GradientButton>
            </Link>
            <Link href="/dashboard/admin/lessons/new">
              <GradientButton variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>Create</GradientButton>
            </Link>
          </div>
        </PageHeader>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard label="Total Lessons" value={lessons.length} gradient="bg-card-gradient-purple" borderColor="border-accent-purple/20" textColor="text-primary-dark" icon={<BookOpen className="w-5 h-5 text-accent-purple" />} />
          <StatCard label="Published" value={publishedCount} gradient="bg-card-gradient-green" borderColor="border-secondary/20" textColor="text-emerald-700" icon={<CheckCircle className="w-5 h-5 text-emerald-600" />} />
          <StatCard label="Drafts" value={draftCount} gradient="bg-card-gradient-gold" borderColor="border-gold/20" textColor="text-amber-700" icon={<Edit className="w-5 h-5 text-gold" />} />
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-2xl mb-6 bg-amber-50 border border-amber-200 text-amber-800 text-sm font-semibold">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input placeholder="Search lessons..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm font-medium text-text bg-white border border-border-soft placeholder:text-text-muted/60 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all" />
          </div>
          {grades.length > 0 && (
            <select value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)} className="px-4 py-2.5 rounded-2xl text-sm font-medium text-text bg-white border border-border-soft focus:outline-none focus:border-primary/40 transition-all min-w-[140px]">
              <option value="all">All Grades</option>
              {grades.map(g => <option key={g} value={g}>Grade {g}</option>)}
            </select>
          )}
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2.5 rounded-2xl text-sm font-medium text-text bg-white border border-border-soft focus:outline-none focus:border-primary/40 transition-all min-w-[150px]">
            <option value="all">All Status</option>
            <option value="DRAFT">Content Missing</option>
            <option value="REVIEW">In Review</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </div>

        {/* Content */}
        {loading ? (
          <div className="rounded-[1.75rem] border border-border-soft bg-white p-12 text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
            <p className="text-text-muted text-sm font-medium">Loading lessons...</p>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyStateCard
            icon={<BookIcon size={48} />}
            title={search || filterGrade !== "all" || filterStatus !== "all" ? "No lessons match your filters" : "No lessons found"}
            description={search || filterGrade !== "all" || filterStatus !== "all" ? "Try adjusting your search or filters." : "Import a CSV or create lessons to get started."}
          />
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((lesson) => {
              const isPublished = lesson.status === "PUBLISHED";
              const isReview = lesson.status === "REVIEW";
              return (
                <div key={lesson.id} className="rounded-[1.75rem] border border-border-soft bg-white p-4 flex items-center gap-4 hover:shadow-[0_4px_20px_rgba(15,23,42,0.06)] transition-all">
                  <div className="w-10 h-10 rounded-2xl bg-primary-soft flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-[18px] h-[18px] text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-text text-sm">{lesson.title}</div>
                    <div className="text-xs text-text-muted mt-0.5 flex items-center gap-3">
                      {lesson.quest?.theme && (
                        <span className="inline-flex items-center gap-1">
                          <GraduationCap className="w-3 h-3" />
                          Grade {lesson.quest.theme.grade} · {lesson.quest.theme.title}
                        </span>
                      )}
                      {lesson.quest && (
                        <span className="inline-flex items-center gap-1">
                          <Layers className="w-3 h-3" />
                          {lesson.quest.title}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`text-[0.6875rem] font-bold px-2 py-1 rounded-lg flex-shrink-0 ${
                    isPublished ? "text-emerald-700 bg-emerald-50" :
                    isReview ? "text-blue-700 bg-blue-50" :
                    "text-amber-700 bg-amber-50"
                  }`}>
                    {STATUS_LABELS[lesson.status] || lesson.status}
                  </span>
                  <div className="flex gap-1.5 flex-shrink-0">
                    {lesson.status !== "PUBLISHED" ? (
                      <button
                        onClick={(e) => { e.preventDefault(); handlePublish(lesson); }}
                        disabled={publishing === lesson.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-[0.6875rem] font-bold cursor-pointer hover:bg-emerald-100 transition-all disabled:opacity-50"
                      >
                        {publishing === lesson.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <><CheckCircle className="w-3 h-3" /> Publish</>}
                      </button>
                    ) : (
                      <button
                        onClick={(e) => { e.preventDefault(); handleUnpublish(lesson); }}
                        disabled={publishing === lesson.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-red-200 bg-red-50 text-red-700 text-[0.6875rem] font-bold cursor-pointer hover:bg-red-100 transition-all disabled:opacity-50"
                      >
                        {publishing === lesson.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Unpublish"}
                      </button>
                    )}
                    <Link href={`/dashboard/admin/lessons/${lesson.id}`} className="px-2.5 py-1 rounded-lg border border-border-soft bg-white text-text-muted text-[0.6875rem] font-semibold hover:bg-bg-main transition-all inline-flex items-center gap-1">
                      <Edit className="w-3 h-3" /> Edit
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
