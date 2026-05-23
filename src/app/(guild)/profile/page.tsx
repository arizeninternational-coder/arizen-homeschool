"use client";
import { GuildLayout } from "@/components/layout";
import { useLearnerProfile, useXpHistory, useBadges } from "@/hooks/useApi";
import { useAuth } from "@/hooks";
import { ProfileCard, XpHistory, BadgeGrid } from "@/components/profile";
import { Tabs } from "@/components/ui";
import { EmptyState, SkeletonCard } from "@/components/ui";

export default function ProfilePage() {
  const { user } = useAuth();
  const { data: profileData, loading: profileLoading } = useLearnerProfile();
  const { data: xpData, loading: xpLoading } = useXpHistory();
  const { data: badgesData, loading: badgesLoading } = useBadges();
  const [activeTab, setActiveTab] = useState("overview");

  const profile = profileData?.profile;
  const xpRecords = xpData?.xpRecords || [];
  const badges = badgesData?.badges || [];

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "xp", label: "XP History", count: xpRecords.length },
    { id: "badges", label: "Badges", count: badges.length },
  ];

  return (
    <GuildLayout title="My Profile" guildName="Arizen Homeschool" grade={user?.grade || 5} totalXp={user?.totalXp || 0} streak={user?.currentStreak || 0}>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {profileLoading ? (
          <SkeletonCard />
        ) : profile ? (
          <ProfileCard
            displayName={profile.displayName}
            grade={profile.grade}
            totalXp={profile.totalXp}
            currentStreak={profile.currentStreak}
            bestStreak={profile.bestStreak}
            completedItems={profile.completedItems}
            badgesCount={profile.badgesCount}
          />
        ) : (
          <EmptyState icon="user" title="No Profile" description="Start learning to build your profile!" />
        )}

        <Tabs tabs={tabs} onChange={setActiveTab} />

        {activeTab === "overview" && (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-surface-raised rounded-2xl border border-border p-4">
              <h3 className="text-sm font-semibold text-text mb-3">🏆 Recent Badges</h3>
              {badgesLoading ? <p className="text-xs text-text-muted">Loading...</p> : badges.length === 0 ? <p className="text-xs text-text-muted">No badges yet. Keep learning!</p> : (
                <div className="space-y-2">
                  {badges.slice(0, 3).map((b: any) => (
                    <div key={b.id} className="flex items-center gap-2">
                      <span className="text-lg">🏅</span>
                      <div><p className="text-sm font-medium text-text">{b.name}</p><p className="text-xs text-text-muted">{b.badgeType}</p></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-surface-raised rounded-2xl border border-border p-4">
              <h3 className="text-sm font-semibold text-text mb-3">⚡ Recent XP</h3>
              {xpLoading ? <p className="text-xs text-text-muted">Loading...</p> : xpRecords.length === 0 ? <p className="text-xs text-text-muted">No XP yet. Start a lesson!</p> : (
                <div className="space-y-2">
                  {xpRecords.slice(0, 3).map((x: any) => (
                    <div key={x.id} className="flex items-center justify-between">
                      <p className="text-sm text-text truncate">{x.description || x.sourceType}</p>
                      <span className="text-sm font-bold text-amber-600 ml-2">+{x.amount}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "xp" && (
          xpLoading ? <SkeletonCard /> : <XpHistory entries={xpRecords} />
        )}

        {activeTab === "badges" && (
          badgesLoading ? <SkeletonCard /> : <BadgeGrid badges={badges} />
        )}
      </div>
    </GuildLayout>
  );
}

import { useState } from "react";
