"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, Lock, Trophy, Loader2 } from "lucide-react";
import { PageHeader, SectionHeader, GradientButton, ProgressBar, EmptyStateCard } from "@/components/ui/Pill";
import { QuestIcon } from "@/components/ui/Illustrations";
import { cn } from "@/lib/utils/cn";

export default function QuestsPage() {
  const [themes, setThemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/themes", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          const themesWithQuests = (data.themes || []).filter((t: any) => t.quests && t.quests.length > 0);
          setThemes(themesWithQuests);
        }
      } catch (e) {
        console.error("[QUESTS] Load error:", e);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-4 border-accent-purple/20 border-t-accent-purple spinner" />
      </div>
    );
  }

  const allQuests = themes.flatMap((theme: any) =>
    (theme.quests || []).map((q: any) => ({ ...q, themeSlug: theme.slug, themeTitle: theme.title }))
  );

  const activeQuests = allQuests.filter((q: any) => !q.isCompleted);
  const completedQuests = allQuests.filter((q: any) => q.isCompleted);

  if (allQuests.length === 0) {
    return (
      <div className="fade-in">
        <PageHeader
          title="My Quests"
          subtitle="Complete quests to earn rewards and level up your avatar."
        >
          <div className="flex items-center gap-2 mt-3">
            <div className="w-9 h-9 rounded-2xl bg-accent-purple-soft flex items-center justify-center">
              <SwordsIcon size={18} />
            </div>
          </div>
        </PageHeader>
        <EmptyStateCard
          icon={<div className="text-3xl">⚔️</div>}
          title="No quests yet"
          description="Quests will appear here when your admin publishes lessons. Check back soon or ask your admin to publish curriculum."
        />
      </div>
    );
  }

  return (
    <div className="fade-in">
      <PageHeader
        title="My Quests"
        subtitle={`${allQuests.length} quest${allQuests.length !== 1 ? "s" : ""} available. Complete quests to earn rewards!`}
      >
        <div className="flex items-center gap-3 mt-4 flex-wrap">
          <div className="w-9 h-9 rounded-2xl bg-accent-purple-soft flex items-center justify-center">
            <SwordsIcon size={18} />
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-text-muted">
            <span className="px-3 py-1.5 rounded-full bg-accent-purple-soft text-accent-purple">
              {activeQuests.length} Active
            </span>
            <span className="px-3 py-1.5 rounded-full bg-secondary-soft text-secondary">
              {completedQuests.length} Done
            </span>
          </div>
        </div>
      </PageHeader>

      {/* ── Active Quests ── */}
      {activeQuests.length > 0 && (
        <SectionHeader
          title="Active Quests"
          subtitle="Keep going — you're doing great!"
        />
      )}
      {activeQuests.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
          {activeQuests.map((quest: any, i: number) => {
            const lessonCount = quest.lessons?.length || 0;
            const xpReward = quest.xpReward
              ? (typeof quest.xpReward === "object" ? (quest.xpReward?.base || 0) : (quest.xpReward || 0))
              : 0;
            const questType = quest.questType || "MAIN";
            const progress = quest.progress || 0;

            const typeStyles: Record<string, { bg: string; text: string; border: string; pillBg: string }> = {
              MAIN: { bg: "bg-gradient-to-br from-primary-soft/60 to-accent-purple-soft/40", text: "text-primary", border: "border-primary/20", pillBg: "bg-primary-soft text-primary" },
              SIDE: { bg: "bg-gradient-to-br from-gold-soft/60 to-amber-50", text: "text-gold", border: "border-gold/20", pillBg: "bg-gold-soft text-gold" },
              BONUS: { bg: "bg-gradient-to-br from-accent-purple-soft/60 to-pink-soft/40", text: "text-accent-purple", border: "border-accent-purple/20", pillBg: "bg-accent-purple-soft text-accent-purple" },
            };
            const styles = typeStyles[questType] || typeStyles.MAIN;

            return (
              <Link
                key={quest.id}
                href={`/dashboard/student/lessons/${quest.themeSlug}/${quest.slug}`}
                className={cn(
                  "group rounded-[1.5rem] border p-5 transition-all duration-200",
                  "hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)]",
                  styles.bg, styles.border
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/70 flex items-center justify-center shadow-sm">
                    <QuestIcon size={24} />
                  </div>
                  <span className={cn("text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full", styles.pillBg)}>
                    {questType}
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-text mb-1 group-hover:text-primary transition-colors">
                  {quest.title}
                </h3>
                {quest.description && (
                  <p className="text-sm text-text-muted leading-relaxed mb-3 line-clamp-2">
                    {quest.description}
                  </p>
                )}
                <div className="flex items-center gap-3 text-xs font-semibold text-text-muted mb-3">
                  <span>{lessonCount} lesson{lessonCount !== 1 ? "s" : ""}</span>
                  {xpReward > 0 && <span className="flex items-center gap-1">🪙 {xpReward} XP</span>}
                </div>
                {progress > 0 && (
                  <ProgressBar value={progress} max={100} color="bg-primary" height="h-2" />
                )}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs font-bold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                    Continue <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* ── Completed Quests ── */}
      {completedQuests.length > 0 && (
        <SectionHeader
          title="Completed"
          subtitle="You've conquered these quests! 🎉"
        />
      )}
      {completedQuests.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {completedQuests.map((quest: any) => {
            const lessonCount = quest.lessons?.length || 0;
            const xpReward = quest.xpReward
              ? (typeof quest.xpReward === "object" ? (quest.xpReward?.base || 0) : (quest.xpReward || 0))
              : 0;

            return (
              <Link
                key={quest.id}
                href={`/dashboard/student/lessons/${quest.themeSlug}/${quest.slug}`}
                className={cn(
                  "group rounded-[1.5rem] border border-secondary/20 p-5 transition-all duration-200",
                  "bg-gradient-to-br from-secondary-soft/40 to-emerald-50",
                  "hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/70 flex items-center justify-center shadow-sm">
                    <Trophy className="w-6 h-6 text-secondary" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-secondary-soft text-secondary">
                    COMPLETED
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-text mb-1">{quest.title}</h3>
                {quest.description && (
                  <p className="text-sm text-text-muted leading-relaxed mb-3 line-clamp-2">
                    {quest.description}
                  </p>
                )}
                <div className="flex items-center gap-3 text-xs font-semibold text-text-muted">
                  <span>{lessonCount} lesson{lessonCount !== 1 ? "s" : ""}</span>
                  {xpReward > 0 && <span>🪙 {xpReward} XP earned</span>}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs font-bold text-secondary flex items-center gap-1">
                    Review <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* ── Legacy grouped-by-themes view ── */}
      {themes.length > 0 && themes.some((t: any) => t.quests.length > 0) && (
        <SectionHeader title="All Themes" subtitle="Browse quests by theme" />
      )}
      {themes.map((theme: any) => (
        <div key={theme.id} className="mb-8">
          <h3 className="text-lg font-extrabold text-text mb-4">{theme.title}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {theme.quests.map((quest: any, i: number) => {
              const typeColor = quest.questType === "MAIN" ? "text-primary" : quest.questType === "SIDE" ? "text-gold" : "text-accent-purple";
              const lessonCount = quest.lessons?.length || 0;
              const xpReward = quest.xpReward
                ? (typeof quest.xpReward === "object" ? (quest.xpReward?.base || 0) : (quest.xpReward || 0))
                : 0;

              return (
                <Link
                  key={quest.id}
                  href={`/dashboard/student/lessons/${theme.slug}/${quest.slug}`}
                  className={cn(
                    "group flex items-center gap-4 rounded-2xl border border-border-soft bg-white p-4",
                    "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(15,23,42,0.06)]"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-extrabold text-sm",
                    quest.isCompleted ? "bg-secondary-soft text-secondary" : "bg-primary-soft text-primary"
                  )}>
                    {quest.isCompleted ? "✓" : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-text text-sm truncate">{quest.title}</div>
                    {quest.description && (
                      <div className="text-xs text-text-muted truncate mt-0.5">{quest.description}</div>
                    )}
                    <div className="text-[11px] font-semibold text-text-muted mt-1 flex gap-2">
                      <span>{lessonCount} lesson{lessonCount !== 1 ? "s" : ""}</span>
                      {xpReward > 0 && <span>🪙 {xpReward} XP</span>}
                    </div>
                  </div>
                  <span className={cn("text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full flex-shrink-0", typeColor, "bg-bg-main")}>
                    {quest.questType || "MAIN"}
                  </span>
                  <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
