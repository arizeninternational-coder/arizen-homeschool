"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen, Calculator, Globe, FlaskConical, Languages, Palette,
  Music, Loader2, GraduationCap, Microscope, Cpu, PenTool,
  Map, Drama, Layers
} from "lucide-react";
import { PageHeader, EmptyStateCard, GradientButton } from "@/components/ui/Pill";

const SUBJECT_ICONS: Record<string, React.ElementType> = {
  "Mathematics": Calculator, "Math": Calculator,
  "English": BookOpen, "Language": Languages, "Languages": Languages,
  "Science": FlaskConical, "Chemistry": FlaskConical, "Physics": FlaskConical, "Biology": Microscope,
  "Geography": Globe, "Social Studies": Globe, "History": Map,
  "Art": Palette, "Arts": Palette, "Creative Arts": Drama, "Drama": Drama,
  "Music": Music,
  "Computer": Cpu, "Computing": Cpu, "ICT": Cpu,
  "General": BookOpen, "Reading": PenTool, "Writing": PenTool,
};

const CARD_COLORS = [
  { bg: "bg-accent-blue/10", border: "border-accent-blue/25", iconBg: "bg-accent-blue/20", iconColor: "text-accent-blue", accent: "#3BA7FF" },
  { bg: "bg-primary/10", border: "border-primary/25", iconBg: "bg-primary/20", iconColor: "text-primary", accent: "#4F46E5" },
  { bg: "bg-secondary/10", border: "border-secondary/25", iconBg: "bg-secondary/20", iconColor: "text-secondary", accent: "#00A884" },
  { bg: "bg-accent-purple/10", border: "border-accent-purple/25", iconBg: "bg-accent-purple/20", iconColor: "text-accent-purple", accent: "#8B5CF6" },
  { bg: "bg-gold/10", border: "border-gold/25", iconBg: "bg-gold/20", iconColor: "text-gold", accent: "#F5A524" },
  { bg: "bg-pink/10", border: "border-pink/25", iconBg: "bg-pink/20", iconColor: "text-pink", accent: "#FF5C8A" },
];

interface SubjectData {
  id: string;
  name: string;
  grade: number;
  themeSlug: string;
  themeId: string;
  lessonCount: number;
  color: string;
}

function getSubjectIcon(name: string): React.ElementType {
  for (const [key, icon] of Object.entries(SUBJECT_ICONS)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return icon;
  }
  return Layers;
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [learnerGrade, setLearnerGrade] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const profileRes = await fetch("/api/learner/profile", { credentials: "include" });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          const grade = profileData?.profile?.grade ?? profileData?.grade ?? null;
          setLearnerGrade(grade);
        }

        const res = await fetch("/api/learner/subjects", { credentials: "include" });
        if (!res.ok) {
          if (res.status === 401) { setError("Please log in to view subjects."); setLoading(false); return; }
          setError("Unable to load subjects. Please try again.");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setSubjects(data.subjects || []);
      } catch (e: any) {
        console.error("[SUBJECTS] Load error:", e);
        setError("Unable to load subjects. Please try again.");
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-primary mx-auto mb-4" />
          <p className="text-text-muted font-bold text-lg">Loading your subjects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 px-4 animate-fade-in">
        <div className="w-20 h-20 rounded-3xl bg-bg-main flex items-center justify-center mx-auto mb-5">
          <BookOpen size={40} className="text-text-muted" />
        </div>
        <h3 className="text-xl font-extrabold text-text mb-2">{error}</h3>
        <Link href="/dashboard/student" className="text-primary font-bold text-sm hover:underline">← Back to Dashboard</Link>
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <div className="animate-fade-in">
        <PageHeader
          title="My Subjects"
          subtitle="Explore your learning journey"
        />
        <EmptyStateCard
          icon={<BookOpen size={36} />}
          title="No subjects yet"
          description={
            learnerGrade
              ? `No subjects found for Grade ${learnerGrade}. Ask your admin to add curriculum for your grade.`
              : "Your subjects will appear here once your grade is set and curriculum is added by your admin."
          }
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="My Subjects"
        subtitle={`Explore your learning journey · ${subjects.length} subject${subjects.length !== 1 ? "s" : ""}`}
      >
        {learnerGrade && (
          <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
            Grade {learnerGrade}
          </span>
        )}
      </PageHeader>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {subjects.map((subject, idx) => {
          const Icon = getSubjectIcon(subject.name);
          const color = CARD_COLORS[idx % CARD_COLORS.length];
          const hasLessons = subject.lessonCount > 0;

          const cardContent = (
            <>
              {/* Color banner at top */}
              <div
                className="h-2 rounded-t-[1.4rem] -mx-5 -mt-5 mb-4"
                style={{ background: `linear-gradient(135deg, ${color.accent}, ${color.accent}aa)` }}
              />

              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl ${color.iconBg} flex items-center justify-center mb-4`}>
                <Icon size={28} className={color.iconColor} strokeWidth={2} />
              </div>

              {/* Subject name */}
              <h3 className="text-base font-extrabold text-text mb-1 leading-tight">{subject.name}</h3>

              {/* Lesson count */}
              <p className="text-xs text-text-muted font-semibold mb-3">
                {hasLessons
                  ? `${subject.lessonCount} lesson${subject.lessonCount !== 1 ? "s" : ""}`
                  : "No published lessons yet"}
              </p>

              {/* Action */}
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
                  href={`/dashboard/student/lessons/${subject.themeSlug}`}
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
  );
}
