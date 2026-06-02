"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import {
  Coins, Flame, Trophy, Heart, Star,
  BookOpen, ShieldCheck, Settings, LogOut, Check, Save
} from "lucide-react";

const C = {
  page: "#F7FBF7", teal: "#047A70", tealD: "#005B50",
  tealSoft: "#E6F5F1", mint: "#ECFDF5", cream: "#FFFBEB",
  dark: "#0F172A", body: "#64748B", muted: "#94A3B8",
  white: "#FFFFFF", border: "#E2E8F0",
  lavender: "#EDE9FE", yellow: "#FFF4D8", blue: "#EFF6FF",
  rose: "#FFF1F2",
};

const HAIRSTYLES = [
  { id: "short-curls", name: "Short Curls" }, { id: "afro", name: "Rounded Afro" },
  { id: "hightop-fade", name: "High-Top Fade" }, { id: "cornrows", name: "Cornrows" },
  { id: "twists", name: "Twists" }, { id: "locs", name: "Locs" },
  { id: "braids", name: "Braids" }, { id: "puff-buns", name: "Puff Buns" },
  { id: "coily-short", name: "Coily Short" }, { id: "side-fade", name: "Side Fade+Curls" },
];

const HAIR_COLORS = [
  { id: "black", hex: "#1a1a1a" }, { id: "dark-brown", hex: "#3B2314" },
  { id: "medium-brown", hex: "#6B3A2A" }, { id: "warm-brown", hex: "#8B5E3C" },
  { id: "teal", hex: "#047A70" },
];

const SKIN_TONES = [
  { id: "deep-brown", name: "Deep", hex: "#4A2C17" },
  { id: "dark-brown", name: "Dark", hex: "#6B3A2A" },
  { id: "medium-brown", name: "Medium", hex: "#8B5E3C" },
  { id: "warm-brown", name: "Warm", hex: "#A0724A" },
  { id: "golden-brown", name: "Golden", hex: "#C49A6C" },
  { id: "light-brown", name: "Light", hex: "#D4A574" },
];

export default function StudentProfilePage() {
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("Student");
  const [grade, setGrade] = useState<number | null>(null);
  const [sparkCoins, setSparkCoins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [currentXp, setCurrentXp] = useState(0);
  const [nextLevelXp, setNextLevelXp] = useState(100);
  const [badgesEarned, setBadgesEarned] = useState(0);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("hair");
  const [selectedHair, setSelectedHair] = useState("short-curls");
  const [selectedHairColor, setSelectedHairColor] = useState("black");
  const [selectedSkin, setSelectedSkin] = useState("medium-brown");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const results = await Promise.allSettled([
          fetch("/api/learner/profile", { credentials: "include" }).then(r => r.json()),
          fetch("/api/coins/wallet", { credentials: "include" }).then(r => r.json()),
          fetch("/api/learner/progress", { credentials: "include" }).then(r => r.json()),
          fetch("/api/themes", { credentials: "include" }).then(r => r.json()),
          fetch("/api/learner/badges", { credentials: "include" }).then(r => r.json()),
          fetch("/api/avatar", { credentials: "include" }).then(r => r.json()),
        ]);

        const profile = results[0].status === "fulfilled" ? (results[0].value?.profile || results[0].value || {}) : {};
        const wallet = results[1].status === "fulfilled" ? (results[1].value?.wallet || results[1].value || {}) : {};
        const progress = results[2].status === "fulfilled" ? (results[2].value?.progress || results[2].value || {}) : {};
        const themesRes = results[3].status === "fulfilled" ? (results[3].value || {}) : {};
        const badgesRes = results[4].status === "fulfilled" ? (results[4].value || {}) : {};
        const avatarRes = results[5].status === "fulfilled" ? (results[5].value || {}) : {};

        setName(profile?.displayName || profile?.name || "Student");
        setGrade(profile?.grade ?? null);
        setSparkCoins(wallet?.balance ?? 0);
        setStreak(profile?.currentStreak ?? 0);
        setCurrentXp(profile?.totalXp ?? 0);
        setNextLevelXp(profile?.nextLevelXp ?? 100);

        // Extract subjects from themes (same logic as subjects page)
        const themes = themesRes.themes || [];
        const subjectMap = new Map();
        const colors = ["#0D9488", "#059669", "#7C3AED", "#2563EB", "#D97706"];
        for (const theme of themes) {
          const themeSubjects = theme.themeSubjects || [];
          const themeTitle = theme.title || "";
          let subjectName = themeSubjects[0]?.subject || "";
          if (!subjectName) {
            const parts = themeTitle.split(" ");
            if (parts.length >= 3) subjectName = parts.slice(2).join(" ");
          }
          if (!subjectName) continue;
          const lessonCount = (theme.quests || []).reduce(
            (sum: number, q: any) => sum + (q.lessons?.length || 0), 0
          );
          if (!subjectMap.has(subjectName)) {
            subjectMap.set(subjectName, {
              name: subjectName, level: 1, progress: 0,
              color: colors[subjectMap.size % colors.length] + "22",
            });
          }
        }
        setSubjects(Array.from(subjectMap.values()));

        const earned = (badgesRes.badges || []).filter((b: any) => b.earned);
        setBadgesEarned(earned.length);

        if (avatarRes?.avatar) {
          setSelectedHair(avatarRes.avatar.hairStyle || "short-curls");
          setSelectedHairColor(avatarRes.avatar.hairColor || "black");
          setSelectedSkin(avatarRes.avatar.skinTone || "medium-brown");
        }
      } catch (e) {
        console.error("[PROFILE] Load error:", e);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleSaveAvatar = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          hairStyle: selectedHair,
          hairColor: selectedHairColor,
          skinTone: selectedSkin,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (e) { console.error("[AVATAR] Save error:", e); }
    setSaving(false);
  };

  const handleRandomize = () => {
    setSelectedHair(HAIRSTYLES[Math.floor(Math.random() * HAIRSTYLES.length)].id);
    setSelectedHairColor(HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)].id);
    setSelectedSkin(SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)].id);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <p style={{ color: C.body, fontWeight: 600 }}>Loading profile...</p>
      </div>
    );
  }

  const xpPct = nextLevelXp > 0 ? Math.min(100, (currentXp / nextLevelXp) * 100) : 0;
  const currentSkinHex = SKIN_TONES.find(t => t.id === selectedSkin)?.hex || "#8B5E3C";

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: C.dark, margin: "0 0 4px 0" }}>My Profile</h1>
        <p style={{ color: C.body, fontSize: "0.9375rem" }}>Manage your learning identity, avatar, and progress.</p>
      </div>

      {/* Profile Hero */}
      <div style={{
        background: "linear-gradient(135deg, #ECFDF5 0%, #E6F5F1 60%, #EFF6FF 100%)",
        borderRadius: 24, padding: "28px", marginBottom: 24, border: "1px solid " + C.border,
        display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap",
      }}>
        {/* Avatar preview */}
        <div style={{
          width: 90, height: 110, borderRadius: 16, flexShrink: 0,
          background: "linear-gradient(180deg, #E6F5F1 0%, #D1FAE5 100%)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end",
          paddingBottom: 8, border: "2px solid #A7F3D0", position: "relative", overflow: "hidden",
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%", background: currentSkinHex,
            border: "2px solid rgba(255,255,255,0.4)", marginBottom: 2,
          }} />
          <div style={{ width: 44, height: 50, borderRadius: "16px 16px 8px 8px", background: "#4FC3F7", border: "2px solid rgba(255,255,255,0.2)" }} />
          <div style={{ display: "flex", gap: 3, marginTop: 4 }}>
            <div style={{ width: 14, height: 20, borderRadius: 4, background: "#37474F" }} />
            <div style={{ width: 14, height: 20, borderRadius: 4, background: "#37474F" }} />
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h2 style={{ fontSize: "1.375rem", fontWeight: 900, color: C.dark, margin: "0 0 2px 0" }}>{name}</h2>
          <p style={{ fontSize: "0.875rem", color: C.body, margin: "0 0 10px 0" }}>
            {grade ? `Grade ${grade}` : "Grade not set"} · {sparkCoins} Spark Coins
          </p>
          <div style={{ marginBottom: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: C.muted }}>XP Progress</span>
              <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: C.teal }}>{currentXp} / {nextLevelXp} XP</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.7)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${xpPct}%`, borderRadius: 4, background: "linear-gradient(90deg, #047A70, #34D399)" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
        <div style={{ padding: "16px", borderRadius: 16, border: "1px solid #E2E8F0", background: C.cream }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <Coins size={18} style={{ color: "#D97706" }} />
            <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#64748B" }}>Coins</span>
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#92400E" }}>{sparkCoins}</div>
        </div>
        <div style={{ padding: "16px", borderRadius: 16, border: "1px solid #E2E8F0", background: C.rose }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <Flame size={18} style={{ color: "#E11D48" }} />
            <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#64748B" }}>Streak</span>
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#BE123C" }}>{streak}d</div>
        </div>
        <div style={{ padding: "16px", borderRadius: 16, border: "1px solid #E2E8F0", background: C.lavender }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <Trophy size={18} style={{ color: "#6D28D9" }} />
            <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#64748B" }}>Badges</span>
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#4C1D95" }}>{badgesEarned}</div>
        </div>
      </div>

      {/* Two columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Left: Avatar + Subjects */}
        <div>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: C.dark, margin: "0 0 14px 0" }}>🎨 Customize Avatar</h3>
          <div style={{ background: C.white, borderRadius: 20, border: "1px solid " + C.border, padding: 20, marginBottom: 24 }}>
            <div style={{ display: "flex", gap: 2, marginBottom: 16, borderBottom: "1px solid " + C.border, paddingBottom: 10, overflowX: "auto" }}>
              {["hair", "face", "outfit", "accessories"].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  padding: "6px 12px", borderRadius: 8, border: "none",
                  background: activeTab === tab ? C.mint : "transparent",
                  color: activeTab === tab ? C.tealD : C.body,
                  fontWeight: activeTab === tab ? 700 : 500, fontSize: "0.75rem",
                  cursor: "pointer", whiteSpace: "nowrap", textTransform: "capitalize",
                }}>{tab}</button>
              ))}
            </div>
            {activeTab === "hair" && (
              <div>
                <h4 style={{ fontSize: "0.875rem", fontWeight: 800, color: C.dark, margin: "0 0 10px 0" }}>Hairstyle</h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 14 }}>
                  {HAIRSTYLES.map(h => {
                    const isSel = selectedHair === h.id;
                    return (
                      <button key={h.id} onClick={() => setSelectedHair(h.id)} style={{
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                        padding: "10px 6px", borderRadius: 12,
                        border: isSel ? "2px solid " + C.teal : "1px solid " + C.border,
                        background: isSel ? C.mint : C.white, cursor: "pointer", position: "relative",
                      }}>
                        {isSel && <span style={{ position: "absolute", top: 2, right: 2, width: 16, height: 16, borderRadius: "50%", background: C.teal, color: "#fff", fontSize: "0.5625rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>✓</span>}
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: isSel ? "#A7F3D0" : "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem" }}>🧑🏽</div>
                        <span style={{ fontSize: "0.625rem", fontWeight: 700, color: isSel ? C.tealD : C.body, textAlign: "center" }}>{h.name}</span>
                      </button>
                    );
                  })}
                </div>
                <h4 style={{ fontSize: "0.8125rem", fontWeight: 800, color: C.dark, margin: "0 0 8px 0" }}>Hair Color</h4>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                  {HAIR_COLORS.map(c => {
                    const isSel = selectedHairColor === c.id;
                    return <button key={c.id} onClick={() => setSelectedHairColor(c.id)} style={{ width: 32, height: 32, borderRadius: "50%", background: c.hex, border: isSel ? "3px solid " + C.teal : "2px solid #E5E7EB", cursor: "pointer" }}>{isSel && <span style={{ color: "#fff", fontSize: "0.625rem", fontWeight: 800 }}>✓</span>}</button>;
                  })}
                </div>
                <h4 style={{ fontSize: "0.8125rem", fontWeight: 800, color: C.dark, margin: "0 0 8px 0" }}>Skin Tone</h4>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                  {SKIN_TONES.map(t => {
                    const isSel = selectedSkin === t.id;
                    return <button key={t.id} onClick={() => setSelectedSkin(t.id)} style={{ width: 36, height: 36, borderRadius: "50%", background: t.hex, border: isSel ? "3px solid " + C.teal : "2px solid #E5E7EB", cursor: "pointer", position: "relative" }}>{isSel && <span style={{ color: "#fff", fontSize: "0.625rem", fontWeight: 800, textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>✓</span>}</button>;
                  })}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={handleRandomize} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1px solid " + C.border, background: C.white, color: C.dark, fontWeight: 700, fontSize: "0.8125rem", cursor: "pointer" }}>🎲 Randomize</button>
                  <button onClick={handleSaveAvatar} disabled={saving} style={{ flex: 2, padding: "10px", borderRadius: 10, border: "none", background: saved ? "#22C55E" : C.teal, color: "#fff", fontWeight: 700, fontSize: "0.8125rem", cursor: "pointer" }}>
                    {saving ? "Saving..." : saved ? <><Check size={14} style={{ display: "inline" }} /> Saved</> : <><Save size={14} style={{ display: "inline" }} /> Save Avatar</>}
                  </button>
                </div>
              </div>
            )}
            {activeTab !== "hair" && (
              <div style={{ textAlign: "center", padding: "30px 20px" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>
                  {activeTab === "face" ? "😊" : activeTab === "outfit" ? "👕" : "🎒"}
                </div>
                <p style={{ fontSize: "0.8125rem", color: C.body, fontWeight: 600 }}>More {activeTab} options coming soon!</p>
              </div>
            )}
          </div>

          {/* Subjects */}
          <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: C.dark, margin: "0 0 14px 0" }}>📈 Subject Progress</h3>
          <div style={{ display: "grid", gap: 10 }}>
            {subjects.length === 0 ? (
              <div style={{ padding: "16px", borderRadius: 14, background: "#F8FAFC", border: "1px solid " + C.border, textAlign: "center" }}>
                <p style={{ fontSize: "0.8125rem", color: C.body }}>No subjects yet. Ask your admin to publish curriculum.</p>
              </div>
            ) : subjects.map(s => (
              <div key={s.name} style={{ padding: "14px 16px", borderRadius: 14, background: s.color, border: "1px solid " + C.border, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: "0.8125rem", fontWeight: 800, color: C.dark }}>{s.name}</span>
                    <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: C.muted }}>Lvl {s.level}</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 3, background: "rgba(0,0,0,0.06)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${s.progress}%`, borderRadius: 3, background: C.teal }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Badges + Account */}
        <div>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: C.dark, margin: "0 0 14px 0" }}>🏆 Badges</h3>
          <div style={{ background: C.white, borderRadius: 20, border: "1px solid " + C.border, padding: 20, marginBottom: 20 }}>
            {badgesEarned === 0 ? (
              <div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                  {["📚", "🔬", "🔢", "🏃", "🎨", "🏆"].map((emoji, i) => (
                    <div key={i} style={{ width: 44, height: 44, borderRadius: 12, background: "#F8FAFC", border: "1px solid " + C.border, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", fontSize: "1.25rem" }}>
                      {emoji}
                      <span style={{ position: "absolute", bottom: -2, right: -2, fontSize: "0.625rem" }}>🔒</span>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: "0.75rem", color: C.body }}>Complete lessons, quests, and check-ins to unlock badges.</p>
              </div>
            ) : (
              <p style={{ fontSize: "0.75rem", color: C.body }}>{badgesEarned} badge{badgesEarned !== 1 ? "s" : ""} unlocked</p>
            )}
          </div>

          {/* Account */}
          <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: C.dark, margin: "0 0 14px 0" }}>👤 Account</h3>
          <div style={{ background: C.white, borderRadius: 20, border: "1px solid " + C.border, padding: 20 }}>
            <div style={{ marginBottom: 12 }}>
              <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: C.muted, textTransform: "uppercase" }}>Name</span>
              <p style={{ fontSize: "0.875rem", fontWeight: 700, color: C.dark, margin: "2px 0 0 0" }}>{name}</p>
            </div>
            <div>
              <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: C.muted, textTransform: "uppercase" }}>Grade</span>
              <p style={{ fontSize: "0.875rem", fontWeight: 700, color: C.dark, margin: "2px 0 0 0" }}>{grade ? `Grade ${grade}` : "Not set"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
