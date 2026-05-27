"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Target, CheckCircle2, Zap
} from "lucide-react";
import { ds, colors } from "@/lib/design-system";

interface Quest {
  id: string;
  title: string;
  slug: string;
  description: string;
  questType?: string;
  xpReward?: { base: number } | number;
  progress: number;
  isCompleted: boolean;
  themeSlug?: string;
  themeTitle?: string;
}

export default function StudentQuestsPage() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/themes")
      .then(r => r.json())
      .then(async (data) => {
        const themes = data.themes || [];
        const allQuests: Quest[] = [];
        for (const theme of themes) {
          try {
            const res = await fetch(`/api/themes?slug=${theme.slug}`);
            const detail = await res.json();
            if (detail.theme?.quests) {
              for (const q of detail.theme.quests) {
                allQuests.push({ ...q, themeSlug: theme.slug, themeTitle: theme.title });
              }
            }
          } catch { /* skip */ }
        }
        setQuests(allQuests);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <h1 style={{ fontSize: "1.375rem", fontWeight: 800, color: colors.text, marginBottom: "0.25rem" }}>Quests</h1>
      <p style={{ color: colors.textMuted, fontSize: "0.875rem", marginBottom: "1.25rem" }}>Choose a quest and start your learning adventure!</p>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "0.75rem" }}>
          {[1,2,3].map(i => <div key={i} style={{ ...ds.card, padding: "1.25rem", height: 120, background: colors.bgAlt }} />)}
        </div>
      ) : quests.length === 0 ? (
        <div style={{ ...ds.card, textAlign: "center", padding: "2.5rem 1.5rem" }}>
          <Target style={{ width: 36, height: 36, color: colors.textMuted, margin: "0 auto 0.75rem", opacity: 0.3 }} />
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: colors.text, marginBottom: "0.375rem" }}>No quests available</h3>
          <p style={{ color: colors.textMuted, fontSize: "0.875rem" }}>Explore themes to find quests, or check back later!</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "0.75rem" }}>
          {quests.map((quest, i) => (
            <QuestCard key={quest.id} quest={quest} index={i} />
          ))}
        </div>
      )}
    </>
  );
}

function QuestCard({ quest, index }: { quest: Quest; index: number }) {
  const typeColors: Record<string, string> = { MAIN: colors.primary, SIDE: colors.warm, CHALLENGE: colors.accent };
  const typeColor = typeColors[quest.questType || "MAIN"] || colors.primary;
  const xp = typeof quest.xpReward === "object" ? (quest.xpReward as any)?.base : quest.xpReward;

  return (
    <Link href={`/dashboard/student/lessons/${quest.themeSlug || ""}/${quest.slug}`} style={{ ...ds.card, padding: "1rem", textDecoration: "none", display: "block" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: quest.isCompleted ? `${colors.success}15` : `${typeColor}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {quest.isCompleted ? <CheckCircle2 style={{ width: 18, height: 18, color: colors.success }} /> : <span style={{ fontWeight: 800, color: typeColor, fontSize: "0.75rem" }}>{index + 1}</span>}
        </div>
        {quest.questType && <span style={{ fontSize: "0.625rem", fontWeight: 700, color: typeColor, background: `${typeColor}15`, padding: "0.1rem 0.375rem", borderRadius: 5 }}>{quest.questType}</span>}
      </div>
      <h3 style={{ fontWeight: 700, color: colors.text, fontSize: "0.9375rem", marginBottom: "0.25rem" }}>{quest.title}</h3>
      <p style={{ fontSize: "0.75rem", color: colors.textMuted, marginBottom: "0.5rem", lineHeight: 1.4 }}>{quest.description}</p>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.6875rem", flexWrap: "wrap" }}>
        {quest.progress > 0 && (
          <span style={{ fontWeight: 600, color: colors.primary, background: colors.primarySoft, padding: "0.1rem 0.375rem", borderRadius: 5 }}>{quest.progress}%</span>
        )}
        {xp && (
          <span style={{ display: "flex", alignItems: "center", gap: "0.125rem", fontWeight: 700, color: colors.warm }}>
            <Zap style={{ width: 10, height: 10 }} /> +{xp}
          </span>
        )}
        {quest.isCompleted && <span style={{ fontWeight: 700, color: colors.success }}>✓ Done</span>}
      </div>
    </Link>
  );
}
