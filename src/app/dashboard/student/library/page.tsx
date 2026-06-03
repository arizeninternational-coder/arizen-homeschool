"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Loader2, GraduationCap, ChevronRight, ExternalLink, Sparkles } from "lucide-react";
import { PageHeader, SectionHeader, EmptyStateCard } from "@/components/ui/Pill";

export default function LibraryPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [subjectsRes, lessonsRes] = await Promise.all([
          fetch("/api/learner/subjects", { credentials: "include" }),
          fetch("/api/learner/lessons", { credentials: "include" }),
        ]);
        const sData = subjectsRes.ok ? await subjectsRes.json() : { subjects: [] };
        const lData = lessonsRes.ok ? await lessonsRes.json() : { lessons: [] };
        setSubjects(sData.subjects || []);
        setLessons(lData.lessons || []);
      } catch (e: any) {
        setError("Unable to load library resources.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Group lessons by subject/theme
  const lessonsBySubject = new Map<string, { name: string; grade: number; lessons: any[] }>();
  for (const lesson of lessons) {
    const subjectName = lesson.quest?.theme?.title || "General";
    const grade = lesson.quest?.theme?.grade || 0;
    const key = `${grade}-${subjectName}`;
    if (!lessonsBySubject.has(key)) {
      lessonsBySubject.set(key, { name: subjectName, grade, lessons: [] });
    }
    lessonsBySubject.get(key)!.lessons.push(lesson);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-[3px] border-primary/15" />
            <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-primary animate-spin" />
          </div>
          <p className="text-text-muted font-bold text-sm">Loading your library...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <EmptyStateCard icon={<BookOpen className="w-8 h-8" />} title="Error" description={error} />;
  }

  const hasContent = lessonsBySubject.size > 0;

  return (
    <div className="space-y-8 fade-in">
      <PageHeader title="Library" subtitle="Learning resources for your grade" />

      {!hasContent ? (
        <EmptyStateCard
          icon={<BookOpen className="w-8 h-8" />}
          title="No resources published yet"
          description="Lesson resources will appear here once your teacher publishes them."
        />
      ) : (
        <div className="space-y-6">
          {Array.from(lessonsBySubject.entries()).map(([key, subj]) => (
            <div key={key} className="rounded-[1.75rem] border border-border-soft bg-white overflow-hidden">
              <div className="px-5 py-4 border-b border-border-soft flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-text">{subj.name}</h3>
                  <p className="text-xs text-text-muted">Grade {subj.grade || "—"} • {subj.lessons.length} resource{subj.lessons.length !== 1 ? "s" : ""}</p>
                </div>
                <Link href="/dashboard/student/subjects" className="text-xs font-bold text-primary hover:text-primary-dark flex items-center gap-1 transition-colors">
                  View Subject <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="divide-y divide-border-soft/50">
                {subj.lessons.map((lesson: any) => {
                  const xp = lesson.xpReward?.base || lesson.xpReward?.amount || (typeof lesson.xpReward === "number" ? lesson.xpReward : 0);
                  return (
                    <div key={lesson.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-bg-main/50 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-text truncate">{lesson.title}</p>
                        <p className="text-xs text-text-muted truncate">{lesson.description || "Learning resource"}</p>
                      </div>
                      {xp > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-gold-soft/50 border border-gold/15 text-[10px] font-extrabold text-amber-800 flex-shrink-0">
                          +{xp} XP
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {subjects.length > 0 && !hasContent && (
        <div className="rounded-[1.75rem] border border-border-soft bg-white p-5">
          <h3 className="font-extrabold text-text mb-3">Your Subjects</h3>
          <p className="text-xs text-text-muted mb-4">These subjects don't have published lessons yet. Check back soon!</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {subjects.map((s: any) => (
              <Link
                key={s.id}
                href="/dashboard/student/subjects"
                className="flex items-center gap-2.5 p-3 rounded-xl border border-border-soft hover:border-primary/20 hover:bg-primary-soft/30 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-secondary-soft flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-4 h-4 text-secondary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-text truncate">{s.name}</p>
                  <p className="text-[10px] text-text-muted">Grade {s.grade}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
