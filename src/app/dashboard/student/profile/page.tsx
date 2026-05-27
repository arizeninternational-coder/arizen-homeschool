"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { User, Zap, Flame, Award, Target } from "lucide-react";
import { ds, colors, gradients } from "@/lib/design-system";

export default function StudentProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/learner/profile")
      .then(r => r.json())
      .then(data => { if (data.profile) setProfile(data.profile); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const user = session?.user as any;
  const displayName = profile?.displayName || user?.name || "Learner";
  const totalXp = profile?.totalXp || 0;
  const streak = profile?.currentStreak || 0;
  const badgesCount = profile?.badgesCount || 0;
  const completedItems = profile?.completedItems || 0;
  const level = Math.floor(totalXp / 500) + 1;

  return (
    <>
      <h1 style={{ fontSize: "1.375rem", fontWeight: 800, color: colors.text, marginBottom: "1.25rem" }}>My Profile</h1>

      {/* Profile card */}
      <div style={{ padding: "1.5rem", borderRadius: 16, background: gradients.primary, color: "white", marginBottom: "1.5rem", textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(255,255,255,0.2)", margin: "0 auto 0.75rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <User style={{ width: 32, height: 32 }} />
        </div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "0.25rem" }}>{displayName}</h2>
        <p style={{ opacity: 0.8, fontSize: "0.875rem" }}>Level {level} Learner</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "0.75rem" }}>
        {[
          { label: "Total XP", value: totalXp.toLocaleString(), icon: Zap, color: colors.primary },
          { label: "Streak", value: `${streak}d`, icon: Flame, color: colors.warm },
          { label: "Badges", value: String(badgesCount), icon: Award, color: colors.accent },
          { label: "Completed", value: String(completedItems), icon: Target, color: colors.success || colors.primary },
        ].map((stat) => (
          <div key={stat.label} style={{ ...ds.card, padding: "1rem", textAlign: "center" }}>
            <stat.icon style={{ width: 24, height: 24, color: stat.color, margin: "0 auto 0.375rem" }} />
            <div style={{ fontSize: "1.125rem", fontWeight: 800, color: colors.text }}>{stat.value}</div>
            <div style={{ fontSize: "0.6875rem", color: colors.textMuted, fontWeight: 600 }}>{stat.label}</div>
          </div>
        ))}
      </div>
    </>
  );
}
