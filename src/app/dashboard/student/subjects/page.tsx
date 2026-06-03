"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen, Calculator, Globe, FlaskConical, Languages, Palette,
  Music, Loader2, GraduationCap, Microscope, Cpu, PenTool,
  Map, Drama, Layers
} from "lucide-react";
import { PageHeader } from "@/components/ui/Pill";
import { FloatingCard, BrowseGrid, CompactEmpty, CARD_COLORS } from "@/components/ui/FloatingCard";
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
};

interface SubjectData {
  id: string;
  name: string;
  grade: number;
  themeSlug: string;
  themeId: string;
  lessonCount: number;
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
          setLearnerGrade(profileData?.profile?.grade ?? profileData?.grade ?? null);
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
      } catch {
        setError("Unable to load subjects. Please try again.");
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
          <p className="text-sm font-bold text-text-muted">Loading your subjects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <CompactEmpty icon={<BookOpen size={28} />} title={error} />;
  }

  if (subjects.length === 0) {
    return (
      <div>
        <PageHeader title="My Subjects" subtitle="Explore your learning journey" />
        <CompactEmpty
          icon={<BookOpen size={28} />}
          title="No subjects yet"
          description={learnerGrade
            ? `No subjects found for Grade ${learnerGrade}. Ask your admin to add curriculum for your grade.`
            : "Your subjects will appear here once your grade is set and curriculum is added by your admin."
          }
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="My Subjects"
        subtitle={`${subjects.length} subject${subjects.length !== 1 ? "s" : ""} available`}
      />

      <BrowseGrid cols={4}>
        {subjects.map((subject, idx) => {
          const Icon = getSubjectIcon(subject.name);
          const color = CARD_COLORS[idx % CARD_COLORS.length];
          const hasLessons = subject.lessonCount > 0;

          return (
            <div key={subject.id} className="group">
              {hasLessons ? (
                <Link href={`/dashboard/student/lessons/${subject.themeSlug}`} className="block">
                  <FloatingCard className={cn("text-center", color.border)}>
                    <div className={cn("w-11 h-11 rounded-xl mx-auto mb-2.5 flex items-center justify-center", color.iconBg)}>
                      <Icon size={22} className={color.textColor} />
                    </div>
                    <h3 className="text-sm font-extrabold text-text leading-tight mb-0.5">{subject.name}</h3>
                    <p className="text-[10px] text-text-muted font-semibold">
                      {hasLessons ? `${subject.lessonCount} lesson${subject.lessonCount !== 1 ? "s" : ""}` : "Coming soon"}
                    </p>
                  </FloatingCard>
                </Link>
              ) : (
                <FloatingCard className={cn("text-center opacity-60", color.border)}>
                  <div className={cn("w-11 h-11 rounded-xl mx-auto mb-2.5 flex items-center justify-center", color.iconBg)}>
                    <Icon size={22} className={color.textColor} />
                  </div>
                  <h3 className="text-sm font-extrabold text-text leading-tight mb-0.5">{subject.name}</h3>
                  <p className="text-[10px] text-text-muted font-semibold">Coming soon</p>
                </FloatingCard>
              )}
            </div>
          );
        })}
      </BrowseGrid>
    </div>
  );
}
