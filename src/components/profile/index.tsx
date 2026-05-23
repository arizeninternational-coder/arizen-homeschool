"use client";

import { cn } from "@/lib/utils/cn";
import { Avatar } from "@/components/ui";
import { Trophy, Flame, Star, TrendingUp, Award, Clock, Zap } from "lucide-react";

interface ProfileCardProps {
  displayName: string;
  grade: number;
  totalXp: number;
  currentStreak: number;
  bestStreak: number;
  completedItems: number;
  badgesCount: number;
  avatarUrl?: string | null;
  className?: string;
}

export function ProfileCard({
  displayName,
  grade,
  totalXp,
  currentStreak,
  bestStreak,
  completedItems,
  badgesCount,
  avatarUrl,
  className,
}: ProfileCardProps) {
  const level = Math.floor(totalXp / 500) + 1;
  const xpInLevel = totalXp % 500;
  const xpProgress = Math.round((xpInLevel / 500) * 100);

  return (
    <div className={cn("bg-surface-raised rounded-2xl border border-border overflow-hidden", className)}>
      {/* Header with gradient */}
      <div className="bg-gradient-to-br from-primary to-primary-dark p-6 text-white">
        <div className="flex items-center gap-4">
          <Avatar src={avatarUrl} name={displayName} size="xl" />
          <div>
            <h2 className="text-xl font-bold">{displayName}</h2>
            <p className="text-white/80 text-sm">Grade {grade} • Level {level}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-white/20 rounded-full px-2 py-0.5">
                <Zap className="w-3 h-3" />
                {totalXp.toLocaleString()} XP
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-white/20 rounded-full px-2 py-0.5">
                <Flame className="w-3 h-3" />
                {currentStreak} day streak
              </span>
            </div>
          </div>
        </div>

        {/* XP progress to next level */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-white/70 mb-1">
            <span>Level {level}</span>
            <span>{xpInLevel}/500 XP to Level {level + 1}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-white transition-all duration-500"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 divide-x divide-border">
        {[
          { label: "Streak", value: `${currentStreak} days`, sub: `Best: ${bestStreak}`, icon: Flame, color: "text-orange-500" },
          { label: "Badges", value: badgesCount.toString(), sub: "Earned", icon: Award, color: "text-purple-500" },
          { label: "Completed", value: completedItems.toString(), sub: "Lessons & quests", icon: Trophy, color: "text-amber-500" },
          { label: "Level", value: level.toString(), sub: `${xpProgress}% to next`, icon: Star, color: "text-primary" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="p-4 text-center">
              <Icon className={cn("w-5 h-5 mx-auto mb-1", stat.color)} />
              <p className="text-lg font-bold text-text">{stat.value}</p>
              <p className="text-xs text-text-muted">{stat.label}</p>
              <p className="text-[10px] text-text-muted">{stat.sub}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── XP History ───────────────────────────────────────────────

interface XpHistoryEntry {
  id: string;
  amount: number;
  description: string | null;
  sourceType: string;
  awardedAt: string;
}

interface XpHistoryProps {
  entries: XpHistoryEntry[];
  className?: string;
}

export function XpHistory({ entries, className }: XpHistoryProps) {
  if (entries.length === 0) {
    return (
      <div className={cn("bg-surface-raised rounded-2xl border border-border p-8 text-center", className)}>
        <TrendingUp className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-40" />
        <p className="text-sm text-text-muted">No XP history yet. Start learning!</p>
      </div>
    );
  }

  // Group by date
  const grouped: Record<string, XpHistoryEntry[]> = {};
  for (const entry of entries) {
    const date = new Date(entry.awardedAt).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(entry);
  }

  return (
    <div className={cn("space-y-4", className)}>
      {Object.entries(grouped).map(([date, items]) => (
        <div key={date}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-text-muted">{date}</p>
            <span className="text-xs font-bold text-amber-600">
              +{items.reduce((sum, i) => sum + i.amount, 0)} XP
            </span>
          </div>
          <div className="bg-surface-raised rounded-2xl border border-border divide-y divide-border">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text">
                      {item.description || item.sourceType}
                    </p>
                    <p className="text-xs text-text-muted">{item.sourceType}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-amber-600">+{item.amount}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Badge Grid ───────────────────────────────────────────────

interface BadgeItem {
  id: string;
  badgeType: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  awardedAt: string;
}

interface BadgeGridProps {
  badges: BadgeItem[];
  className?: string;
}

const badgeGradients: Record<string, string> = {
  water_explorer: "from-cyan-400 to-blue-500",
  young_scientist: "from-amber-400 to-orange-500",
  streak_starter: "from-orange-400 to-red-500",
  first_quest: "from-green-400 to-emerald-500",
};

export function BadgeGrid({ badges, className }: BadgeGridProps) {
  if (badges.length === 0) {
    return (
      <div className={cn("bg-surface-raised rounded-2xl border border-border p-8 text-center", className)}>
        <Award className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-40" />
        <p className="text-sm text-text-muted">No badges earned yet. Keep learning!</p>
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3", className)}>
      {badges.map((badge) => {
        const gradient = badgeGradients[badge.badgeType] || "from-purple-400 to-violet-500";
        const date = new Date(badge.awardedAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });

        return (
          <div
            key={badge.id}
            className="bg-surface-raised rounded-2xl border border-border p-4 text-center hover:shadow-card-hover hover:border-border-strong transition-all group"
          >
            <div className={cn(
              "w-14 h-14 rounded-full bg-gradient-to-br mx-auto mb-3 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform",
              gradient
            )}>
              <Trophy className="w-7 h-7 text-white" />
            </div>
            <h4 className="text-sm font-bold text-text mb-0.5">{badge.name}</h4>
            {badge.description && (
              <p className="text-xs text-text-muted line-clamp-2">{badge.description}</p>
            )}
            <p className="text-[10px] text-text-muted mt-2">{date}</p>
          </div>
        );
      })}
    </div>
  );
}

// ── Streak Calendar (simple week view) ───────────────────────

interface StreakCalendarProps {
  currentStreak: number;
  bestStreak: number;
  className?: string;
}

export function StreakCalendar({ currentStreak, bestStreak, className }: StreakCalendarProps) {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  return (
    <div className={cn("bg-surface-raised rounded-2xl border border-border p-4", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text">This Week</h3>
        <span className="text-xs text-text-muted">Best: {bestStreak} days</span>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day, i) => {
          const isToday = day.toDateString() === today.toDateString();
          const isPast = day < today;
          // Simulate activity for demo
          const hasActivity = isPast || isToday;

          return (
            <div key={i} className="text-center">
              <p className="text-[10px] text-text-muted mb-1">
                {day.toLocaleDateString("en-US", { weekday: "short" }).charAt(0)}
              </p>
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center mx-auto text-xs font-medium transition-colors",
                  hasActivity
                    ? "bg-orange-500 text-white"
                    : "bg-surface-sunken text-text-muted",
                  isToday && "ring-2 ring-orange-300 ring-offset-1"
                )}
              >
                {hasActivity ? "🔥" : "·"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
