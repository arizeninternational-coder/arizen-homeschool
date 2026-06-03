"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen, Loader2, GraduationCap, Clock, CheckCircle2,
  Circle, Sparkles, ChevronRight, Layers
} from "lucide-react";
import { PageHeader, EmptyStateCard, SectionHeader, XpPill } from "@/components/ui/Pill";
import { BookIcon } from "@/components/ui/Illustrations";

/* ── Types ── */

interface SubjectData {
  id: string;
  name: string;
  grade: number;
  themeSlug: string;
  themeId: string;
  lessonCount: number;
  color: string;
}

interface LessonProgress {
  lessonId: string;
  status: string;
  completedAt: string | null;
}

interface LessonData {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: string;
  orderIndex: number;
  xpReward: number;
  createdAt: string;
  quest?: {
    id: string;
    title: string;
    theme?: {
      id: string;
      title: string;
      grade: number;
      slug?: string;
    };
  };
  progress: LessonProgress | null;
}

/* ── Color palette for subject cards (same scheme as subjects page) ── */

const CARD_COLORS = [
  { bg: "bg-accent-blue/10", border: "border-accent-blue/25", iconBg: "bg-accent-blue/20", iconColor: "text-accent-blue", accent: "#3BA7FF" },
  { bg: "bg-primary/10", border: "border-primary/25", iconBg: "bg-primary/20", iconColor: "text-primary", accent: "#4F46E5" },
  { bg: "bg-secondary/10", border: "border-secondary/25", iconBg: "bg-secondary/20", iconColor: "text-secondary", accent: "#00A884" },
  { bg: "bg-accent-purple/10", border: "border-accent-purple/25", iconBg: "bg-accent-purple/20", iconColor: "text-accent-purple", accent: "#8B5CF6" },
  { bg: "bg-gold/10", border: "border-gold/25", iconBg: "bg-gold/20", iconColor: "text-gold", accent: "#F5A524" },
  { bg: "bg-pink/10", border: "border-pink/25", iconBg: "bg-pink/20", iconColor: "text-pink", accent: "#FF5C8A" },
];

const SUBJECT_ICONS: Record<string, React.ElementType> = {
  "Mathematics": BookOpen, "Math": BookOpen,
  "English": BookOpen, "Language": BookOpen, "Languages": BookOpen,
  "Science": BookOpen, "Chemistry": BookOpen, "Physics": BookOpen, "Biology": BookOpen,
  "Geography": BookOpen, "Social Studies": BookOpen, "History": BookOpen,
  "Art": BookOpen, "Arts": BookOpen, "Creative Arts": BookOpen, "Drama": BookOpen,
  "Music": BookOpen,
  "Computer": BookOpen, "Computing": BookOpen, "ICT": BookOpen,
  "General": BookOpen, "Reading": BookOpen, "Writing": BookOpen,
};

function getSubjectIcon(name: string): React.ElementType {
  for (const [key, icon] of Object.entries(SUBJECT_ICONS)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return icon;
  }
  return Layers;
}

/* ── Component ── */

export default function StudentLessonsPage() {
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [lessons, setLessons] = useState<LessonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        // Fetch subjects and lessons in parallel
        const [subjectsRes, lessonsRes] = await Promise.all([
          fetch("/api/learner/subjects", { credentials: "include" }),
          fetch("/api/learner/lessons", { credentials: "include" }),
        ]);

        if (subjectsRes.status === 401 || lessonsRes.status === 401) {
          setError("Please log in to view your lessons.");
          setLoading(false);
          return;
        }

        if (!subjectsRes.ok) {
          setError("Unable to load subjects. Please try again.");
          setLoading(false);
          return;
        }

        if (!lessonsRes.ok) {
          setError("Unable to load lessons. Please try again.");
          setLoading(false);
          return;
        }

        const subjectsData = await subjectsRes.json();
        const lessonsData = await lessonsRes.json();

        setSubjects(subjectsData.subjects || []);
        setLessons(lessonsData.lessons || []);
      } catch (e: any) {
        console.error("[STUDENT_LESSONS] Load error:", e);
        setError("Unable to load your lessons. Please try again.");
      }
      setLoading(false);
    }
    load();
  }, []);

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-primary mx-auto mb-4" />
          <p className="text-text-muted font-bold text-lg">Loading your lessons...</p>
        </div>
      </div>
    );
  }

  /* ── Error state ── */
  if (error) {
    return (
      <div className="text-center py-12 px-4 animate-fade-in">
        <div className="w-20 h-20 rounded-3xl bg-bg-main flex items-center justify-center mx-auto mb-5">
          <BookOpen size={40} className="text-text-muted" />
        </div>
        <h3 className="text-xl font-extrabold text-text mb-2">{error}</h3>
        <Link href="/dashboard/student" className="text-primary font-bold text-sm hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  /* ── Empty state ── */
  const totalLessons = lessons.length;
  const completedLessons = lessons.filter(
    (l) => l.progress && (l.progress.status === "COMPLETED" || l.progress.status === "completed")
  ).length;

  if (totalLessons === 0 && subjects.length === 0) {
    return (
      <div className="animate-fade-in">
        <PageHeader
          title="My Lessons"
          subtitle="Your published lessons will appear here"
        >
          <div className="mt-3">
            <BookIcon size={32} className="text-primary opacity-60" />
          </div>
        </PageHeader>
        <EmptyStateCard
          icon={<BookOpen size={36} />}
          title="No lessons yet"
          description="Your admin hasn't published any lessons for your grade yet. Check back soon or explore your subjects!"
        />
      </div>
    );
  }

  /* ── Build lesson link helper ── */
  function getLessonLink(lesson: LessonData): string | null {
    const quest = lesson.quest;
    const theme = quest?.theme;
    if (theme?.slug && quest) {
      return `/dashboard/student/lessons/${theme.slug}/${quest.id}/${lesson.slug}`;
    }
    // Fallback: try to navigate with theme title as slug
    if (theme && quest) {
      const themeSlug = theme.title.toLowerCase().replace(/\s+/g, "-");
      return `/dashboard/student/lessons/${themeSlug}/${quest.id}/${lesson.slug}`;
    }
    return null;
  }

  function isCompleted(lesson: LessonData): boolean {
    return lesson.progress?.status === "COMPLETED" || lesson.progress?.status === "completed";
  }

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <PageHeader
        title="My Lessons"
        subtitle={
          totalLessons > 0
            ? `${totalLessons} lesson${totalLessons !== 1 ? "s" : ""} · ${completedLessons} completed`
            : "Your learning journey starts here"
        }
      >
        <div className="flex items-center gap-2 mt-3">
          <BookOpen size={18} className="text-primary" />
          <span className="text-sm font-bold text-text-muted">
            {subjects.length} subject{subjects.length !== 1 ? "s" : ""}
          </span>
          {totalLessons > 0 && (
            <>
              <span className="text-text-muted/40">·</span>
              <span className="text-sm font-bold text-secondary">
                {Math.round((completedLessons / totalLessons) * 100)}% done
              </span>
            </>
          )}
        </div>
      </PageHeader>

      {/* ── Subject cards section ── */}
      {subjects.length > 0 && (
        <div className="mb-10">
          <SectionHeader
            title="Your Subjects"
            subtitle="Tap a subject to explore its lessons"
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {subjects.map((subject, idx) => {
              const color = CARD_COLORS[idx % CARD_COLORS.length];
              const hasLessons = subject.lessonCount > 0;

              const cardContent = (
                <>
                  <div
                    className="h-2 rounded-t-[1.4rem] -mx-5 -mt-5 mb-4"
                    style={{ background: `linear-gradient(135deg, ${color.accent}, ${color.accent}aa)` }}
                  />
                  <div className={`w-14 h-14 rounded-2xl ${color.iconBg} flex items-center justify-center mb-4`}>
                    {(() => { const Icon = getSubjectIcon(subject.name); return <Icon size={28} className={color.iconColor} strokeWidth={2} />; })()}
                  </div>
                  <h3 className="text-base font-extrabold text-text mb-1 leading-tight">{subject.name}</h3>
                  <p className="text-xs text-text-muted font-semibold mb-3">
                    {hasLessons
                      ? `${subject.lessonCount} lesson${subject.lessonCount !== 1 ? "s" : ""}`
                      : "No published lessons yet"}
                  </p>
                  {hasLessons ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: color.accent }}>
                      <GraduationCap size={14} />
                      Open subject →
                    </div>
                  ) : (
                    <span className="text-[11px] text-text-muted italic">Ask your admin to publish</span>
                  )}
                </>
              );

              return (
                <div key={subject.id} className="group">
                  {hasLessons ? (
                    <Link
                      href="/dashboard/student/subjects"
                      className={`block rounded-[1.5rem] border ${color.border} bg-white p-5
                        transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_35px_rgba(0,0,0,0.08)]
                        cursor-pointer no-underline group-hover:border-opacity-50`}
                    >
                      {cardContent}
                    </Link>
                  ) : (
                    <div className={`rounded-[1.5rem] border ${color.border} bg-white p-5 opacity-70`}>
                      {cardContent}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── All lessons list ── */}
      <div>
        <SectionHeader
          title="All Lessons"
          subtitle={
            totalLessons > 0
              ? `${totalLessons} published lesson${totalLessons !== 1 ? "s" : ""} ready to learn`
              : "No published lessons available yet"
          }
        />

        {totalLessons === 0 ? (
          <EmptyStateCard
            icon={<Sparkles size={36} />}
            title="No lessons published yet"
            description="Your admin is working on creating awesome lessons. Check back soon!"
          />
        ) : (
          <div className="space-y-3">
            {lessons.map((lesson, idx) => {
              const completed = isCompleted(lesson);
              const lessonLink = getLessonLink(lesson);
              const themeTitle = lesson.quest?.theme?.title || "General";

              const inner = (
                <>
                  {/* Left: status icon + info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      {completed ? (
                        <div className="w-10 h-10 rounded-2xl bg-secondary/15 flex items-center justify-center">
                          <CheckCircle2 size={22} className="text-secondary" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-2xl bg-bg-main flex items-center justify-center">
                          <Circle size={22} className="text-text-muted/40" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className={`text-sm font-extrabold leading-tight truncate ${completed ? "text-secondary" : "text-text"}`}>
                        {lesson.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-text-muted font-semibold truncate">{themeTitle}</span>
                        {lesson.xpReward != null && (
                          <>
                            <span className="text-text-muted/30">·</span>
                            <XpPill amount={lesson.xpReward} size="sm" />
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: status badge + chevron */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {completed ? (
                      <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-secondary/10 text-secondary border border-secondary/20">
                        <CheckCircle2 size={12} />
                        Done
                      </span>
                    ) : (
                      <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-primary/8 text-primary border border-primary/15">
                        <Sparkles size={12} />
                        Start
                      </span>
                    )}
                    <ChevronRight size={18} className="text-text-muted/40 group-hover:text-primary transition-colors" />
                  </div>
                </>
              );

              const wrapperClass =
                "flex items-center justify-between gap-2 p-4 rounded-[1.25rem] border border-border-soft bg-white " +
                "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)] cursor-pointer no-underline";

              return (
                <div key={lesson.id} className="group">
                  {lessonLink ? (
                    <Link href={lessonLink} className={wrapperClass}>
                      {inner}
                    </Link>
                  ) : (
                    <div className={wrapperClass}>
                      {inner}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
