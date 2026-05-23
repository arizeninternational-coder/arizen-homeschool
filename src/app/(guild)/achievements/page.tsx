"use client";
import { GuildLayout } from "@/components/layout";
import { useXpHistory, useBadges, useLearnerProfile } from "@/hooks/useApi";
import { useAuth } from "@/hooks";
import { ProfileCard, XpHistory, BadgeGrid, StreakCalendar } from "@/components/profile";
import { Trophy, Flame, Star } from "lucide-react";
import { SkeletonCard } from "@/components/ui";

export default function AchievementsPage() {
  const { user } = useAuth();
  const { data: profileData } = useLearnerProfile();
  const { data: xpData, loading: xpLoading } = useXpHistory();
  const { data: badgesData, loading: badgesLoading } = useBadges();
  const profile = profileData?.profile;
  const xpRecords = xpData?.xpRecords || [];
  const badges = badgesData?.badges || [];
  const totalXpEarned = xpRecords.reduce((sum: number, x: any) => sum + x.amount, 0);

  return (
    <GuildLayout title="Achievements" guildName="Arizen Homeschool" grade={user?.grade || 5} totalXp={user?.totalXp || 0} streak={user?.currentStreak || 0}>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Stats header */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-surface-raised rounded-2xl border border-border p-4 text-center">
            <Trophy className="w-6 h-6 text-amber-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-text">{totalXpEarned.toLocaleString()}</p>
            <p className="text-xs text-text-muted">Total XP Earned</p>
          </div>
          <div className="bg-surface-raised rounded-2xl border border-border p-4 text-center">
            <Flame className="w-6 h-6 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-text">{profile?.currentStreak || 0}</p>
            <p className="text-xs text-text-muted">Current Streak</p>
          </div>
          <div className="bg-surface-raised rounded-2xl border border-border p-4 text-center">
            <Star className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-text">{badges.length}</p>
            <p className="text-xs text-text-muted">Badges Earned</p>
          </div>
        </div>

        {/* Streak calendar */}
        {profile && (
          <StreakCalendar currentStreak={profile.currentStreak} bestStreak={profile.bestStreak} />
        )}

        {/* Badges */}
        <div>
          <h3 className="heading-md mb-4">Badges</h3>
          {badgesLoading ? <SkeletonCard /> : <BadgeGrid badges={badges} />}
        </div>

        {/* XP History */}
        <div>
          <h3 className="heading-md mb-4">XP History</h3>
          {xpLoading ? <SkeletonCard /> : <XpHistory entries={xpRecords} />}
        </div>
      </div>
    </GuildLayout>
  );
}
