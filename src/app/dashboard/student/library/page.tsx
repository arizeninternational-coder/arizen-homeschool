"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Loader2, GraduationCap, ChevronRight, ExternalLink, Sparkles, Video, FileText, Image, Download, Search } from "lucide-react";
import { PageHeader, SectionHeader, EmptyStateCard } from "@/components/ui/Pill";

export default function LibraryPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "lessons" | "videos" | "documents">("all");

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

  // Filter by search
  const filteredLessons = searchQuery
    ? lessons.filter(l =>
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (l.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (l.quest?.theme?.title || "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    : lessons;

  // Categorize resources
  const lessonsWithVideos = filteredLessons.filter(l => {
    const v = l.media?.video || l.video;
    return v?.approvedUrl && v?.approvedByAdmin;
  });
  const lessonsWithDocs = filteredLessons.filter(l => l.contentBlocks); // has content = has documents/resources

  const hasContent = lessons.length > 0;
  const hasVideos = lessonsWithVideos.length > 0;
  const hasDocs = lessonsWithDocs.length > 0;

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

  const tabs = [
    { key: "all" as const, label: "All Resources", count: lessons.length, icon: BookOpen },
    { key: "lessons" as const, label: "Lessons", count: filteredLessons.length, icon: GraduationCap },
    { key: "videos" as const, label: "Videos", count: lessonsWithVideos.length, icon: Video },
    { key: "documents" as const, label: "Documents", count: lessonsWithDocs.length, icon: FileText },
  ];

  return (
    <div className="space-y-6 fade-in">
      <PageHeader title="Library" subtitle="Learning resources for your grade" />

      {/* Search + Tabs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm font-medium text-text bg-white border border-border-soft placeholder:text-text-muted/60 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
          />
        </div>
      </div>

      {/* Resource type tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? "bg-indigo-500 text-white shadow-md"
                : "bg-white text-text-muted border border-border-soft hover:bg-slate-50"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.count > 0 && (
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
                activeTab === tab.key ? "bg-white/20" : "bg-slate-100 text-slate-500"
              }`}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {!hasContent ? (
        <EmptyStateCard
          icon={<BookOpen className="w-8 h-8" />}
          title="No resources published yet"
          description="Lesson resources will appear here once your teacher publishes them. Check back soon!"
        />
      ) : (
        <div className="space-y-6">
          {/* Lessons section */}
          {(activeTab === "all" || activeTab === "lessons") && (
            <div>
              <SectionHeader title="Lessons" subtitle={`${filteredLessons.length} lesson${filteredLessons.length !== 1 ? "s" : ""} available`} />
              {filteredLessons.length === 0 ? (
                <div className="rounded-2xl bg-white border border-border-soft p-8 text-center">
                  <BookOpen className="w-8 h-8 text-text-muted mx-auto mb-3" />
                  <p className="text-sm font-bold text-text-muted">No lessons match your search</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredLessons.map(lesson => {
                    const xp = lesson.xpReward?.base || lesson.xpReward?.amount || (typeof lesson.xpReward === "number" ? lesson.xpReward : 0);
                    const themeSlug = lesson.quest?.theme?.slug || "";
                    const questSlug = lesson.quest?.slug || "";
                    const lessonSlug = lesson.slug || lesson.id;
                    return (
                      <Link
                        key={lesson.id}
                        href={`/dashboard/student/lessons/${themeSlug}/${questSlug}/${lessonSlug}`}
                        className="rounded-2xl bg-white border border-border-soft p-4 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all group"
                      >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-text truncate group-hover:text-indigo-600 transition-colors">{lesson.title}</p>
                          <p className="text-xs text-text-muted truncate">{lesson.quest?.theme?.title || "General"}</p>
                        </div>
                        {xp > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200/50 text-[10px] font-extrabold text-amber-700 flex-shrink-0">
                            +{xp} XP
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0 group-hover:text-indigo-500 transition-colors" />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Videos section */}
          {(activeTab === "all" || activeTab === "videos") && (
            <div>
              <SectionHeader title="Videos" subtitle={`${lessonsWithVideos.length} video${lessonsWithVideos.length !== 1 ? "s" : ""} available`} />
              {!hasVideos ? (
                <div className="rounded-2xl bg-white border border-border-soft p-8 text-center">
                  <Video className="w-8 h-8 text-text-muted mx-auto mb-3" />
                  <p className="text-sm font-bold text-text-muted mb-1">No videos yet</p>
                  <p className="text-xs text-text-muted">Video resources will appear here when added by your teacher.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {lessonsWithVideos.map(lesson => (
                    <div key={lesson.id} className="rounded-2xl bg-white border border-border-soft p-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center flex-shrink-0">
                        <Video className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-text truncate">{lesson.title}</p>
                        <p className="text-xs text-text-muted truncate">{lesson.quest?.theme?.title || "General"}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200/50 text-[10px] font-extrabold text-blue-700 flex-shrink-0">Video</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Documents section */}
          {(activeTab === "all" || activeTab === "documents") && (
            <div>
              <SectionHeader title="Documents & Resources" subtitle={`${lessonsWithDocs.length} resource${lessonsWithDocs.length !== 1 ? "s" : ""} available`} />
              {!hasDocs ? (
                <div className="rounded-2xl bg-white border border-border-soft p-8 text-center">
                  <FileText className="w-8 h-8 text-text-muted mx-auto mb-3" />
                  <p className="text-sm font-bold text-text-muted mb-1">No documents yet</p>
                  <p className="text-xs text-text-muted">Documents and worksheets will appear here when published.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {lessonsWithDocs.slice(0, 6).map(lesson => (
                    <div key={lesson.id} className="rounded-2xl bg-white border border-border-soft p-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-text truncate">{lesson.title}</p>
                        <p className="text-xs text-text-muted truncate">{lesson.quest?.theme?.title || "General"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Subjects section */}
      {subjects.length > 0 && (
        <div>
          <SectionHeader title="Your Subjects" subtitle={`${subjects.length} subject${subjects.length !== 1 ? "s" : ""}`} />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {subjects.map((s: any) => (
              <Link
                key={s.id}
                href="/dashboard/student/subjects"
                className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-border-soft hover:shadow-md hover:-translate-y-0.5 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-text truncate group-hover:text-indigo-600 transition-colors">{s.name}</p>
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
