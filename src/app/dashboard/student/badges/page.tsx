"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import {
  Award, Lock, Zap, Sparkles
} from "lucide-react";
import { ds, colors } from "@/lib/design-system";

interface Badge {
  id: string;
  badgeType: string;
  name: string;
  description: string;
  awardedAt: string;
}

const badgeIcons: Record<string, string> = {
  first_lesson: "🎯", ten_lessons: "📚", first_quest: "⚔️", five_quests: "🏆",
  streak_3: "🔥", streak_7: "🌟", xp_1000: "💎", xp_5000: "👑",
  level_5: "⭐", level_10: "🏅",
};

const allBadgeTypes = [
  { type: "first_lesson", name: "First Step", description: "Complete your first lesson" },
  { type: "ten_lessons", name: "Quick Learner", description: "Complete 10 lessons" },
  { type: "first_quest", name: "Quest Complete!", description: "Complete your first quest" },
  { type: "five_quests", name: "Quest Master", description: "Complete 5 quests" },
  { type: "streak_3", name: "Streak Starter", description: "3-day learning streak" },
  { type: "streak_7", name: "Week Warrior", description: "7-day learning streak" },
  { type: "xp_1000", name: "XP Champion", description: "Earn 1,000 XP" },
  { type: "xp_5000", name: "XP Legend", description: "Earn 5,000 XP" },
  { type: "level_5", name: "Rising Star", description: "Reach level 5" },
  { type: "level_10", name: "Mastermind", description: "Reach level 10" },
];

export default function StudentBadgesPage() {
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/learner/badges")
      .then(r => r.json())
      .then(data => setEarnedBadges(data.badges || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const earnedTypes = new Set(earnedBadges.map(b => b.badgeType));
  const earnedCount = earnedBadges.length;
  const totalCount = allBadgeTypes.length;

  return (
    <>
      <div style={{ marginBottom: "1.25rem" }}>
        <h1 style={{ fontSize: "1.375rem", fontWeight: 800, color: colors.text, marginBottom: "0.25rem" }}>Badges</h1>
        <p style={{ color: colors.textMuted, fontSize: "0.875rem" }}>
          {earnedCount}/{totalCount} badges earned
        </p>
        <div style={{ marginTop: "0.5rem", height: 8, borderRadius: 4, background: colors.border, maxWidth: 280 }}>
          <div style={{ height: "100%", borderRadius: 4, background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`, width: `${totalCount > 0 ? (earnedCount / totalCount) * 100 : 0}%`, transition: "width 0.3s" }} />
        </div>
      </div>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "0.75rem" }}>
          {[1,2,3,4,5,6].map(i => <div key={i} style={{ ...ds.card, padding: "1rem", height: 140, background: colors.bgAlt }} />)}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "0.75rem" }}>
          {allBadgeTypes.map((badgeDef) => {
            const earned = earnedBadges.find(b => b.badgeType === badgeDef.type);
            const isEarned = !!earned;
            return (
              <div key={badgeDef.type} style={{ ...ds.card, padding: "1rem 0.75rem", textAlign: "center", opacity: isEarned ? 1 : 0.5, position: "relative" }}>
                {!isEarned && (
                  <div style={{ position: "absolute", top: "0.375rem", right: "0.375rem" }}>
                    <Lock style={{ width: 12, height: 12, color: colors.textMuted }} />
                  </div>
                )}
                <div style={{ fontSize: "2rem", marginBottom: "0.375rem", filter: isEarned ? "none" : "grayscale(1)" }}>
                  {badgeIcons[badgeDef.type] || "🏅"}
                </div>
                <div style={{ fontWeight: 700, color: isEarned ? colors.text : colors.textMuted, fontSize: "0.75rem", marginBottom: "0.125rem" }}>
                  {badgeDef.name}
                </div>
                <div style={{ fontSize: "0.625rem", color: colors.textMuted, lineHeight: 1.3 }}>
                  {badgeDef.description}
                </div>
                {earned?.awardedAt && (
                  <div style={{ fontSize: "0.5625rem", color: colors.success, fontWeight: 600, marginTop: "0.375rem" }}>
                    ✓ {new Date(earned.awardedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
