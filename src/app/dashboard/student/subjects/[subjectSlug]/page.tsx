"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen, Calculator, Globe, FlaskConical, Languages, Palette,
  Music, Loader2, GraduationCap, Microscope, Cpu, PenTool,
  Map, Drama, Layers, ArrowLeft, CheckCircle2, Circle, Clock,
  Sparkles, Target
} from "lucide-react";
import { PageHeader, SectionHeader, ProgressBar, EmptyStateCard } from "@/components/ui/Pill";
import { FloatingCard, CompactEmpty, RewardBadge } from "@/components/ui/FloatingCard";
import { cn } from "@/lib/utils/cn";

const SUBJECT_ICONS: Record<string, React.ElementType> = {
  Mathematics: Calculator, Math: Calculator,
  English: BookOpen, Language: Languages, Languages: Languages,
  Science: FlaskConical, Chemistry: FlaskConical, Physics: FlaskConical, Biology: Microscope,
  Geography: Globe, "Social Studies": Globe, History: Map,
  Art: Palette, Arts: Palette, "Creative Arts": Drama, Drama: Drama,
  Music: Music,
  Computer: Cpu, Computing: Cpu, ICT: Cpu,
  Kiswahili: Languages, CRE: BookOpen, "Physical Education": GraduationCap,
  General: BookOpen, Reading: PenTool, Writing: PenTool,
  "Environmental Activities": Globe, Environmental: Globe,
  "Hygiene and Nutrition": GraduationCap, Hygiene: GraduationCap,
  "Movement and Creative Activities": Drama, Movement: Drama,
  "English Language Activities": BookOpen,
  "Kiswahili Language Activities": Languages,
};

const SUBJECT_COLORS: Record<string, { bg: string; text: string; bar: string; light: string }> = {
  Mathematics: { bg: "bg-indigo-50", text: "text-indigo-700", bar: "from-indigo-500 to-blue-500", light: "bg-indigo-500/10" },
  English: { bg: "bg-emerald-50", text: "text-emerald-700", bar: "from-emerald-500 to-teal-500", light: "bg-emerald-500/10" },
  Kiswahili: { bg: "bg-amber-50", text: "text-amber-700", bar: "from-amber-500 to-orange-500", light: "bg-amber-500/10" },
  "Environmental Activities": { bg: "bg-green-50", text: "text-green-700", bar: "from-green-500 to-emerald-500", light: "bg-green-500/10" },
  "Hygiene and Nutrition": { bg: "bg-teal-50", text: "text-teal-700", bar: "from-teal-500 to-cyan-500", light: "bg-teal-500/10" },
  "Movement and Creative Activities": { bg: "bg-rose-50", text: "text-rose-700", bar: "from-rose-500 to-pink-500", light: "bg-rose-500/10" },
};

function getSubjectIcon(name: string): React.ElementType {
  for (const [key, icon] of Object.entries(SUBJECT_ICONS)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return icon;
  }
  return Layers;
}

function getSubjectColor(name: string) {
  for (const [key, color] of Object.entries(SUBJECT_COLORS)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return color;
  }
  return { bg: "bg-gray-50", text: "text-gray-700", bar: "from-gray-400 to-gray-500", light: "bg-gray-500/10" };
}

interface LessonData {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  xpReward: number;
  estimatedDurationMinutes?: number;
  quest?: { id: string; title: string; theme?: { id: string; title: string; slug?: string; grade?: number } };
  subject?: string | null;
  subjects?: string[];
  progress?: { completedAt?: string | null; masteryPercent?: number } | null;
}

export default function SubjectDetailPage({ params }: { params: Promise<{ subjectSlug: string }> }) {
  const [subjectSlug, setSubjectSlug] = useState<string | null>(null);
  const [subjectName, setSubjectName] = useState<string>("");
  const [lessons, setLessons] = useState<LessonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then(p => {
      setSubjectSlug(p.subjectSlug);
      // Decode subject slug back to name (e.g., "mathematics" -> "Mathematics")
      const name = p.subjectSlug
        .split("-")
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      setSubjectName(name);
      loadSubjectLessons(p.subjectSlug);
    });
  }, [params]);

  async function loadSubjectLessons(slug: string) {
    try {
      // Load all lessons and filter by subject
      const [lessonsRes, subjectsRes] = await Promise.all([
        fetch("/api/learner/lessons", { credentials: "include" }),
        fetch("/api/learner/subjects", { credentials: "include" }),
      ]);

      if (!lessonsRes.ok) {
        setError("Unable to load lessons.");
        setLoading(false);
        return;
      }

      const lessonsData = await lessonsRes.json();
      const subjectsData = await subjectsRes.json();

      // Find the subject by slug
      const subjectInfo = (subjectsData.subjects || []).find((s: any) => {
        const sSlug = s.name.toLowerCase().replace(/\s+/g, "-");
        return sSlug === slug || s.name.toLowerCase().includes(slug.replace(/-/g, " "));
      });

      const targetSubjectName = subjectInfo?.name || subjectName;

      // Filter lessons for this subject
      const allLessons: LessonData[] = lessonsData.lessons || [];
      const subjectLessons = allLessons.filter((l: any) => {
        const lessonSubject = l.subject || "";
        const lessonSubjects = l.subjects || [];
        return lessonSubject.toLowerCase().includes(targetSubjectName.toLowerCase()) ||
          lessonSubjects.some((s: string) => s.toLowerCase().includes(targetSubjectName.toLowerCase())) ||
          targetSubjectName.toLowerCase().includes(lessonSubject.toLowerCase());
      });

      setLessons(subjectLessons);
    } catch {
      setError("Unable to load lessons. Please try again.");
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-sm font-bold text-text-muted">Loading {subjectName} lessons...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <CompactEmpty icon={<BookOpen size={28} />} title={error} />;
  }

  const Icon = getSubjectIcon(subjectName);
  const colors = getSubjectColor(subjectName);

  const completedLessons = lessons.filter(l => l.progress?.completedAt);
  const inProgressLessons = lessons.filter(l => !l.progress?.completedAt && l.progress?.masteryPercent);
  const notStartedLessons = lessons.filter(l => !l.progress?.completedAt && !l.progress?.masteryPercent);
  const totalXp = completedLessons.reduce((sum, l) => sum + (l.xpReward || 0), 0);

  function getLessonLink(lesson: LessonData): string {
    const quest = lesson.quest;
    const theme = quest?.theme;
    if (theme?.slug && quest) {
      return `/dashboard/student/lessons/${theme.slug}/${quest.id}/${lesson.slug}`;
    }
    return "#";
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Back link */}
      <Link
        href="/dashboard/student/subjects"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-muted hover:text-text transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Subjects
      </Link>

      {/* Subject Header */}
      <div className={cn("rounded-[1.75rem] p-6 lg:p-8 relative overflow-hidden", colors.bg)}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/20" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/10" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", colors.light)}>
              <Icon size={28} className={colors.text} />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-text tracking-tight">{subjectName}</h1>
              <p className="text-sm text-text-muted mt-0.5">
                {lessons.length} lesson{lessons.length !== 1 ? "s" : ""} · {completedLessons.length} completed
              </p>
            </div>
          </div>

          {/* Progress bar */}
          {lessons.length > 0 && (
            <div className="max-w-md">
              <div className="flex items-center justify-between text-xs font-bold text-text-muted mb-1.5">
                <span>Progress</span>
                <span>{completedLessons.length}/{lessons.length} lessons</span>
              </div>
              <ProgressBar
                value={completedLessons.length}
                max={lessons.length}
                color={cn("bg-gradient-to-r", colors.bar)}
                height="h-2.5"
              />
            </div>
          )}

          {/* Quick stats */}
          <div className="flex gap-3 mt-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/60 text-text">
              <Sparkles size={12} /> {totalXp} XP earned
            </div>
            {inProgressLessons.length > 0 && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/60 text-text">
                <Target size={12} /> {inProgressLessons.length} in progress
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weekly Quest Placeholder */}
      <div className="rounded-[1.5rem] border-2 border-dashed border-amber-200 bg-amber-50/50 p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <Target size={20} className="text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-extrabold text-amber-800">Weekly Quest</h3>
            <p className="text-xs text-amber-600 mt-0.5">
              Real-world quests coming soon! Apply what you learn in {subjectName} to the world around you.
            </p>
          </div>
        </div>
      </div>

      {/* In Progress */}
      {inProgressLessons.length > 0 && (
        <div>
          <SectionHeader title="In Progress" subtitle={`${inProgressLessons.length} lesson${inProgressLessons.length !== 1 ? "s" : ""} started`} />
          <div className="space-y-2">
            {inProgressLessons.map((lesson) => (
              <LessonRow key={lesson.id} lesson={lesson} link={getLessonLink(lesson)} status="in_progress" />
            ))}
          </div>
        </div>
      )}

      {/* Completed */}
      {completedLessons.length > 0 && (
        <div>
          <SectionHeader title="Completed" subtitle={`${completedLessons.length} lesson${completedLessons.length !== 1 ? "s" : ""} done`} />
          <div className="space-y-2">
            {completedLessons.map((lesson) => (
              <LessonRow key={lesson.id} lesson={lesson} link={getLessonLink(lesson)} status="completed" />
            ))}
          </div>
        </div>
      )}

      {/* Not Started */}
      {notStartedLessons.length > 0 && (
        <div>
          <SectionHeader title="All Lessons" subtitle={`${notStartedLessons.length} lesson${notStartedLessons.length !== 1 ? "s" : ""} available`} />
          <div className="space-y-2">
            {notStartedLessons.map((lesson) => (
              <LessonRow key={lesson.id} lesson={lesson} link={getLessonLink(lesson)} status="not_started" />
            ))}
          </div>
        </div>
      )}

      {lessons.length === 0 && (
        <EmptyStateCard
          icon={<BookOpen className="w-8 h-8" />}
          title={`No ${subjectName} lessons yet`}
          description="Lessons for this subject will appear here when your admin publishes them."
        />
      )}
    </div>
  );
}

function LessonRow({ lesson, link, status }: { lesson: LessonData; link: string; status: "completed" | "in_progress" | "not_started" }) {
  const isCompleted = status === "completed";
  const isInProgress = status === "in_progress";

  return (
    <Link
      href={link}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl border transition-all hover:-translate-y-0.5 hover:shadow-sm",
        isCompleted ? "bg-emerald-50/50 border-emerald-100" :
        isInProgress ? "bg-indigo-50/50 border-indigo-100" :
        "bg-white border-gray-100"
      )}
    >
      <div className="flex-shrink-0">
        {isCompleted ? (
          <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 size={18} className="text-emerald-600" />
          </div>
        ) : isInProgress ? (
          <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
            <Clock size={18} className="text-indigo-500" />
          </div>
        ) : (
          <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center">
            <Circle size={18} className="text-gray-300" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-bold truncate", isCompleted ? "text-emerald-700" : "text-text")}>
          {lesson.title}
        </p>
        {lesson.estimatedDurationMinutes && (
          <p className="text-[10px] text-text-muted">{lesson.estimatedDurationMinutes} min</p>
        )}
      </div>
      <RewardBadge xp={lesson.xpReward} />
    </Link>
  );
}
