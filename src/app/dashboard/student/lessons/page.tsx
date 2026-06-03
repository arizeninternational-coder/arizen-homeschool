"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen, Loader2, CheckCircle2, Circle, Sparkles,
  Clock, GraduationCap, Trophy, ChevronRight, Zap
} from "lucide-react";
import { PageHeader, XpPill } from "@/components/ui/Pill";
import { FloatingCard, SectionTitle, BrowseGrid, CompactEmpty, getRewardValue, CARD_COLORS, RewardBadge } from "@/components/ui/FloatingCard";
import { cn } from "@/lib/utils/cn";

interface LessonData {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  xpReward: number;
  estimatedDurationMinutes?: number;
  quest?: { id: string; title: string; theme?: { id: string; title: string; slug?: string; grade?: number } };
  subjects?: string[];
  subject?: string | null;
  progress?: { completedAt?: string | null; masteryPercent?: number } | null;
}

interface SubjectData {
  id: string;
  name: string;
  grade: number;
  themeSlug: string;
  themeId: string;
  lessonCount: number;
}

const SUBJECT_ICONS: Record<string, React.ElementType> = {
  Mathematics: BookOpen, Math: BookOpen,
  English: BookOpen, Language: BookOpen, Languages: BookOpen,
  Science: BookOpen, Chemistry: BookOpen, Physics: BookOpen, Biology: BookOpen,
  Geography: BookOpen, "Social Studies": BookOpen, History: BookOpen,
  Art: BookOpen, Arts: BookOpen, "Creative Arts": BookOpen, Drama: BookOpen,
  Music: BookOpen,
  Computer: BookOpen, Computing: BookOpen, ICT: BookOpen,
  General: BookOpen, Reading: BookOpen, Writing: BookOpen,
  Kiswahili: BookOpen, CRE: BookOpen, "Physical Education": BookOpen,
};

function getSubjectIcon(name: string): React.ElementType {
  for (const [key, icon] of Object.entries(SUBJECT_ICONS)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return icon;
  }
  return BookOpen;
}

export default function StudentLessonsPage() {
  const [lessons, setLessons] = useState<LessonData[]>([]);
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [lessonsRes, subjectsRes] = await Promise.all([
          fetch("/api/learner/lessons", { credentials: "include" }),
          fetch("/api/learner/subjects", { credentials: "include" }),
        ]);

        if (lessonsRes.status === 401 || subjectsRes.status === 401) {
          setError("Please log in to view your lessons.");
          setLoading(false);
          return;
        }

        const lessonsData = await lessonsRes.json();
        const subjectsData = await subjectsRes.json();

        setLessons(lessonsData.lessons || []);
        setSubjects(subjectsData.subjects || []);
      } catch (e: any) {
        console.error("[STUDENT_LESSONS] Load error:", e);
        setError("Unable to load your lessons. Please try again.");
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-[3px] border-primary/15" />
            <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-primary animate-spin" />
          </div>
          <p className="text-sm font-bold text-text-muted">Loading your lessons...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <CompactEmpty icon={<BookOpen size={28} />} title={error} description="Go back to your dashboard and try again." />
      </div>
    );
  }

  const totalLessons = lessons.length;
  const completedLessons = lessons.filter(l => l.progress?.completedAt).length;
  const pctComplete = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const nextLesson = lessons.find(l => !l.progress?.completedAt);

  if (totalLessons === 0 && subjects.length === 0) {
    return (
      <div>
        <PageHeader title="My Lessons" subtitle="Your published lessons will appear here" />
        <CompactEmpty icon={<BookOpen size={28} />} title="No lessons yet" description="Your admin hasn't published any lessons for your grade yet. Check back soon!" />
      </div>
    );
  }

  function getLessonLink(lesson: LessonData): string | null {
    const quest = lesson.quest;
    const theme = quest?.theme;
    if (theme?.slug && quest) {
      return `/dashboard/student/lessons/${theme.slug}/${quest.id}/${lesson.slug}`;
    }
    return null;
  }

  return (
    <div className="space-y-6">
      {/* ── Top Summary ── */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-primary/8 text-primary border border-primary/15">
          <BookOpen size={14} /> {totalLessons} lesson{totalLessons !== 1 ? "s" : ""}
        </div>
        {completedLessons > 0 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-secondary/8 text-secondary border border-secondary/15">
            <CheckCircle2 size={14} /> {completedLessons} done
          </div>
        )}
        {totalLessons > 0 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gold/8 text-amber-700 border border-gold/15">
            <Trophy size={14} /> {pctComplete}% complete
          </div>
        )}
        {subjects.length > 0 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-accent-purple/8 text-accent-purple border border-accent-purple/15">
            <GraduationCap size={14} /> {subjects.length} subject{subjects.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* ── Continue Learning / Recommended Lesson ── */}
      {nextLesson && (
        <Link
          href={getLessonLink(nextLesson) || "#"}
          className="block rounded-[1.5rem] border border-primary/15 p-5 bg-gradient-to-br from-primary/[0.04] to-accent-purple/[0.03] hover:shadow-[0_8px_25px_rgba(79,70,229,0.1)] hover:-translate-y-0.5 transition-all duration-200"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-primary bg-primary/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles size={10} /> Continue Learning
            </span>
          </div>
          <h3 className="text-lg font-extrabold text-text mb-1">{nextLesson.title}</h3>
          <div className="flex items-center gap-3 text-xs text-text-muted">
            {nextLesson.subject && <span className="font-semibold">{nextLesson.subject}</span>}
            {nextLesson.estimatedDurationMinutes && (
              <span className="flex items-center gap-1"><Clock size={12} /> {nextLesson.estimatedDurationMinutes} min</span>
            )}
            <RewardBadge xp={nextLesson.xpReward} />
          </div>
        </Link>
      )}

      {/* ── All Lessons ── */}
      {totalLessons > 0 && (
        <div>
          <SectionTitle title="All Lessons" subtitle={`${totalLessons} published lesson${totalLessons !== 1 ? "s" : ""}`} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lessons.map((lesson) => {
              const completed = !!lesson.progress?.completedAt;
              const lessonLink = getLessonLink(lesson);

              return (
                <div key={lesson.id} className="group">
                  {lessonLink ? (
                    <Link href={lessonLink} className="block">
                      <LessonCard lesson={lesson} completed={completed} />
                    </Link>
                  ) : (
                    <LessonCard lesson={lesson} completed={completed} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Browse by Subject ── */}
      {subjects.filter(s => s.lessonCount > 0).length > 0 && (
        <div>
          <SectionTitle title="Browse by Subject" subtitle="Explore lessons by subject" />
          <BrowseGrid cols={4}>
            {subjects.filter(s => s.lessonCount > 0).map((subject, idx) => {
              const color = CARD_COLORS[idx % CARD_COLORS.length];
              const Icon = getSubjectIcon(subject.name);
              return (
                <Link key={subject.id} href={`/dashboard/student/lessons/${subject.themeSlug}`} className="group">
                  <FloatingCard className={cn("text-center", color.border)}>
                    <div className={cn("w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center", color.iconBg)}>
                      <Icon size={20} className={color.textColor} />
                    </div>
                    <h4 className="text-xs font-extrabold text-text leading-tight mb-0.5">{subject.name}</h4>
                    <p className="text-[10px] text-text-muted font-semibold">{subject.lessonCount} lesson{subject.lessonCount !== 1 ? "s" : ""}</p>
                  </FloatingCard>
                </Link>
              );
            })}
          </BrowseGrid>
        </div>
      )}
    </div>
  );
}

function LessonCard({ lesson, completed }: { lesson: LessonData; completed: boolean }) {
  return (
    <FloatingCard className="flex items-center gap-3 !p-3">
      <div className="flex-shrink-0">
        {completed ? (
          <div className="w-9 h-9 rounded-xl bg-secondary/15 flex items-center justify-center">
            <CheckCircle2 size={18} className="text-secondary" />
          </div>
        ) : (
          <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center">
            <Circle size={18} className="text-primary/40" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className={cn("text-sm font-extrabold leading-tight truncate", completed ? "text-secondary" : "text-text")}>
          {lesson.title}
        </h4>
        <div className="flex items-center gap-2 mt-0.5">
          {lesson.subject && <span className="text-[10px] text-text-muted font-semibold truncate">{lesson.subject}</span>}
          <RewardBadge xp={lesson.xpReward} />
        </div>
      </div>
      <ChevronRight size={16} className="text-text-muted/30 flex-shrink-0 group-hover:text-primary transition-colors" />
    </FloatingCard>
  );
}
