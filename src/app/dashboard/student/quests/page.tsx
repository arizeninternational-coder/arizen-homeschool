"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Target, ChevronRight, Lock, Trophy, Loader2 } from "lucide-react";

const C = { page: "#F7FBF7", teal: "#047A70", dark: "#0F172A", body: "#64748B", white: "#FFFFFF", border: "#E2E8F0" };

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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <Loader2 size={32} style={{ color: C.teal, margin: "0 auto 1rem" }} />
          <p style={{ color: C.body, fontWeight: 600 }}>Loading quests...</p>
        </div>
      </div>
    );
  }

  const allQuests = themes.flatMap((theme: any) =>
    (theme.quests || []).map((q: any) => ({ ...q, themeSlug: theme.slug, themeTitle: theme.title }))
  );

  if (allQuests.length === 0) {
    return (
      <div>
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: C.dark, margin: "0 0 0.25rem 0" }}>
            <Target size={22} style={{ display: "inline", verticalAlign: "middle", marginRight: 8 }} /> Quests
          </h1>
          <p style={{ color: C.body, fontSize: "0.875rem" }}>Complete quests to earn rewards and level up your avatar.</p>
        </div>
        <div style={{ textAlign: "center", padding: "3rem 1rem", background: C.white, borderRadius: 20, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚔️</div>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: C.dark, marginBottom: "0.5rem" }}>No quests yet</h3>
          <p style={{ color: C.body, fontSize: "0.875rem", maxWidth: 400, margin: "0 auto" }}>
            Quests will appear here when your admin publishes lessons. Check back soon or ask your admin to publish curriculum.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: C.dark, margin: "0 0 0.25rem 0" }}>
          <Target size={22} style={{ display: "inline", verticalAlign: "middle", marginRight: 8 }} /> Quests
        </h1>
        <p style={{ color: C.body, fontSize: "0.875rem" }}>{allQuests.length} quest{allQuests.length !== 1 ? "s" : ""} available. Complete quests to earn rewards!</p>
      </div>

      {themes.map((theme: any) => (
        <div key={theme.id} style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.0625rem", fontWeight: 800, color: C.dark, marginBottom: "0.75rem" }}>{theme.title}</h2>
          <div style={{ display: "grid", gap: "0.5rem" }}>
            {theme.quests.map((quest: any, i: number) => {
              const typeColor = quest.questType === "MAIN" ? C.teal : quest.questType === "SIDE" ? "#D97706" : "#7C3AED";
              const lessonCount = quest.lessons?.length || 0;
              const xpReward = quest.xpReward
                ? (typeof quest.xpReward === "object" ? (quest.xpReward?.base || 0) : (quest.xpReward || 0))
                : 0;
              return (
                <Link
                  key={quest.id}
                  href={`/dashboard/student/lessons/${theme.slug}/${quest.slug}`}
                  style={{
                    background: C.white, borderRadius: 14, border: `1px solid ${C.border}`,
                    padding: "14px 18px", textDecoration: "none", color: "inherit", display: "flex",
                    alignItems: "center", gap: 14, cursor: "pointer",
                  }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, background: `${typeColor}15`,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    fontWeight: 800, color: typeColor, fontSize: "0.875rem",
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: C.dark, fontSize: "0.875rem" }}>{quest.title}</div>
                    {quest.description && (
                      <div style={{ fontSize: "0.75rem", color: C.body, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {quest.description}
                      </div>
                    )}
                    <div style={{ fontSize: "0.6875rem", color: C.body, marginTop: 4, display: "flex", gap: 8 }}>
                      <span>{lessonCount} lesson{lessonCount !== 1 ? "s" : ""}</span>
                      {xpReward > 0 && <span>🪙 {xpReward} XP</span>}
                    </div>
                  </div>
                  <span style={{ fontSize: "0.625rem", fontWeight: 700, color: typeColor, background: `${typeColor}15`, padding: "2px 8px", borderRadius: 6, flexShrink: 0 }}>
                    {quest.questType || "MAIN"}
                  </span>
                  <ChevronRight size={16} style={{ color: C.body, flexShrink: 0 }} />
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
