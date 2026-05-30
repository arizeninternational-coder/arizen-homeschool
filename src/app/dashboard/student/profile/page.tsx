"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Coins, Flame, Trophy, Heart, Target, Star,
  BookOpen, Beaker, Globe, BookMarked,
  Clock, Gift, CheckCircle2, ShieldCheck, UsersRound, Settings, LogOut
} from "lucide-react";

const C = {
  page: "#F7FBF7", teal: "#047A70", tealD: "#005B50",
  tealSoft: "#E6F5F1", mint: "#ECFDF5", cream: "#FFFBEB",
  dark: "#0F172A", body: "#64748B", muted: "#94A3B8",
  white: "#FFFFFF", border: "#E2E8F0",
  lavender: "#EDE9FE", yellow: "#FFF4D8", blue: "#EFF6FF",
  rose: "#FFF1F2",
};

const NAV = [
  { icon: Star,       label: "Dashboard",    href: "/dashboard/student" },
  { icon: BookOpen,   label: "My Subjects",  href: "/dashboard/student/subjects" },
  { icon: BookMarked, label: "Lessons",      href: "/dashboard/student/lessons" },
  { icon: Target,     label: "Assignments",  href: "/dashboard/student/assignments" },
  { icon: Gift,       label: "Quizzes",      href: "/dashboard/student/quizzes" },
  { icon: Trophy,     label: "Progress",     href: "/dashboard/student/progress" },
  { icon: Calendar,   label: "Calendar",     href: "/dashboard/student/calendar" },
  { icon: Heart,      label: "EQ Check-In",  href: "/dashboard/student/eq" },
  { icon: UsersRound, label: "Profile",      href: "/dashboard/student/profile" },
];

const HAIRSTYLES = [
  { id: "short-curls",  name: "Short Curls" },
  { id: "afro",         name: "Rounded Afro" },
  { id: "hightop-fade", name: "High-Top Fade" },
  { id: "cornrows",     name: "Cornrows" },
  { id: "twists",       name: "Twists" },
  { id: "locs",         name: "Locs" },
  { id: "braids",       name: "Braids" },
  { id: "puff-buns",    name: "Puff Buns" },
  { id: "coily-short",  name: "Coily Short" },
  { id: "side-fade",    name: "Side Fade+Curls" },
];

const HAIR_COLORS = [
  { id: "black",        hex: "#1a1a1a" },
  { id: "dark-brown",   hex: "#3B2314" },
  { id: "medium-brown", hex: "#6B3A2A" },
  { id: "warm-brown",   hex: "#8B5E3C" },
  { id: "light-brown",  hex: "#A0724A" },
  { id: "teal",         hex: "#047A70" },
];

const SKIN_TONES = [
  { id: "deep-brown",   name: "Deep",   hex: "#4A2C17" },
  { id: "dark-brown",   name: "Dark",   hex: "#6B3A2A" },
  { id: "medium-brown", name: "Medium", hex: "#8B5E3C" },
  { id: "warm-brown",   name: "Warm",   hex: "#A0724A" },
  { id: "golden-brown", name: "Golden", hex: "#C49A6C" },
  { id: "light-brown",  name: "Light",  hex: "#D4A574" },
];

const BADGES = [
  { name: "Math Whiz",        icon: BookOpen,  requirement: "Complete 5 math lessons" },
  { name: "Reader",           icon: BookMarked, requirement: "Complete 5 reading lessons" },
  { name: "Science Explorer", icon: Beaker,    requirement: "Complete 5 science lessons" },
  { name: "Kind Heart",       icon: Heart,     requirement: "Complete 3 EQ check-ins" },
  { name: "Quiz Master",      icon: Gift,      requirement: "Score 80%+ on 3 quizzes" },
  { name: "Goal Getter",      icon: Trophy,    requirement: "Complete daily goal 3 days" },
  { name: "Team Player",      icon: UsersRound, requirement: "Complete 10 quests" },
  { name: "Early Bird",       icon: Star,      requirement: "7-day learning streak" },
];

const RARITY_COLORS = {
  common:    { color: "#22C55E", bg: "#DCFCE7" },
  rare:      { color: "#3B82F6", bg: "#DBEAFE" },
  epic:      { color: "#7C3AED", bg: "#EDE9FE" },
  legendary: { color: "#F59E0B", bg: "#FEF3C7" },
};

const SHOP_ITEMS = [
  { name: "Soccer Boots",     icon: "⚽", rarity: "common",    cost: 30,  req: null },
  { name: "Math Wizard Hat",  icon: "🎓", rarity: "rare",      cost: 50,  req: "Complete 5 math lessons" },
  { name: "Storyteller Cape", icon: "📖", rarity: "epic",      cost: 70,  req: "Complete 5 reading lessons" },
  { name: "Creative Crown",   icon: "👑", rarity: "legendary", cost: 200, req: "Complete 50 lessons" },
];

export default function StudentProfilePage() {
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("Student");
  const [grade, setGrade] = useState(null);
  const [sparkCoins, setSparkCoins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [avatarLevel, setAvatarLevel] = useState(1);
  const [currentXp, setCurrentXp] = useState(0);
  const [nextLevelXp, setNextLevelXp] = useState(1000);
  const [badgesEarned, setBadgesEarned] = useState([]);
  const [lessonsCompleted, setLessonsCompleted] = useState(0);
  const [quizzesCompleted, setQuizzesCompleted] = useState(0);
  const [reflectionsCompleted, setReflectionsCompleted] = useState(0);
  const [questCompleted, setQuestCompleted] = useState(0);
  const [questTotal, setQuestTotal] = useState(10);
  const [subjects, setSubjects] = useState([]);
  const [parentLinked, setParentLinked] = useState(false);
  const [parentName, setParentName] = useState("");

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
          fetch("/api/learner/subjects", { credentials: "include" }).then(r => r.json()),
          fetch("/api/learner/badges", { credentials: "include" }).then(r => r.json()),
          fetch("/api/avatar", { credentials: "include" }).then(r => r.json()),
        ]);
        const profile = results[0].status === "fulfilled" ? results[0].value?.profile || results[0].value : {};
        const wallet = results[1].status === "fulfilled" ? results[1].value?.wallet || results[1].value : {};
        const progress = results[2].status === "fulfilled" ? results[2].value?.progress || results[2].value : {};
        const subjectsRes = results[3].status === "fulfilled" ? results[3].value : {};
        const badgesRes = results[4].status === "fulfilled" ? results[4].value : {};
        const avatarRes = results[5].status === "fulfilled" ? results[5].value : {};

        setName(profile?.name || profile?.displayName || "Student");
        setGrade(profile?.grade || null);
        setSparkCoins(wallet?.balance ?? 0);
        setStreak(profile?.currentStreak ?? 0);
        setAvatarLevel(profile?.avatarLevel ?? 1);
        setCurrentXp(profile?.totalXp ?? 0);
        setNextLevelXp(profile?.nextLevelXp ?? 1000);
        setLessonsCompleted(progress?.lessonsCompleted ?? 0);
        setQuizzesCompleted(progress?.quizzesCompleted ?? 0);
        setReflectionsCompleted(progress?.reflectionsCompleted ?? 0);
        setQuestCompleted(progress?.questsCompleted ?? progress?.questCompleted ?? 0);
        setQuestTotal(progress?.questsTotal ?? 10);
        setSubjects(subjectsRes.subjects || [
          { name: "Mathematics", level: 1, progress: 0, color: "#EDE9FE" },
          { name: "English", level: 1, progress: 0, color: "#FFF4D8" },
          { name: "Science", level: 1, progress: 0, color: "#ECFDF5" },
          { name: "Social Studies", level: 1, progress: 0, color: "#EFF6FF" },
        ]);
        const earned = (badgesRes.badges || []).filter(b => b.earned).map(b => b.name || b.title);
        setBadgesEarned(earned);
        if (avatarRes.avatar) {
          setSelectedHair(avatarRes.avatar.hairStyle || "short-curls");
          setSelectedHairColor(avatarRes.avatar.hairColor || "black");
          setSelectedSkin(avatarRes.avatar.skinTone || "medium-brown");
        }
      } catch (e) { console.error("[PROFILE] Load error:", e); }
      setLoading(false);
    };
    load();
  }, []);

  const handleSaveAvatar = async () => {
    setSaving(true);
    try {
      await fetch("/api/avatar", {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ hairStyle: selectedHair, hairColor: selectedHairColor, skinTone: selectedSkin }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) { console.error("[AVATAR] Save error:", e); }
    setSaving(false);
  };

  const handleRandomize = () => {
    setSelectedHair(HAIRSTYLES[Math.floor(Math.random() * HAIRSTYLES.length)].id);
    setSelectedHairColor(HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)].id);
    setSelectedSkin(SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)].id);
  };

  if (loading) return null;

  const xpPct = nextLevelXp > 0 ? Math.min(100, (currentXp / nextLevelXp) * 100) : 0;

  return (
    <div style={{ display: "flex" }}>
      {/* SIDEBAR */}
      <aside className="sp-sidebar" style={{ width: 260, minWidth: 260, height: "100vh", position: "sticky", top: 0, background: C.white, borderRight: "1px solid " + C.border, display: "flex", flexDirection: "column", zIndex: 20, overflowY: "auto" }}>
        <div style={{ padding: "20px 16px 14px", borderBottom: "1px solid " + C.border }}>
          <Link href="/dashboard/student" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: C.teal, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: "1rem" }}>A</div>
            <span style={{ fontWeight: 900, fontSize: "1rem", color: C.teal }}>Arizen School</span>
          </Link>
        </div>
        <nav style={{ padding: "10px", flex: 1 }}>
          {NAV.map(item => {
            const Icon = item.icon;
            const isActive = item.label === "Profile";
            return (
              <Link key={item.label} href={item.href} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, textDecoration: "none", marginBottom: 2, background: isActive ? C.teal : "transparent", color: isActive ? "#fff" : C.dark, fontWeight: isActive ? 700 : 500, fontSize: "0.875rem" }}>
                <Icon size={16} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.6 }} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div style={{ padding: "10px" }}>
          <div style={{ padding: "14px", borderRadius: 14, background: C.mint, border: "1px solid " + C.border, marginBottom: 8 }}>
            <div style={{ fontSize: "1.25rem", marginBottom: 4 }}>🎁</div>
            <h4 style={{ fontSize: "0.8125rem", fontWeight: 800, color: C.dark, margin: "0 0 2px 0" }}>Invite friends</h4>
            <p style={{ fontSize: "0.6875rem", color: C.body, margin: "0 0 8px 0" }}>Learn together and earn rewards!</p>
            <button style={{ width: "100%", padding: "7px", borderRadius: 10, background: C.teal, color: "#fff", border: "none", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer" }}>Invite Now</button>
          </div>
          <div style={{ padding: "12px 14px", borderRadius: 14, background: C.cream, border: "1px solid " + C.border, display: "flex", alignItems: "center", gap: 10 }}>
            <ShieldCheck size={18} style={{ color: "#D97706" }} />
            <div><p style={{ fontSize: "0.75rem", fontWeight: 700, color: C.dark, margin: 0 }}>Need help?</p><p style={{ fontSize: "0.6875rem", color: C.body, margin: 0 }}>Contact Support</p></div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="sp-main" style={{ flex: 1, minWidth: 0, padding: "28px 32px 40px" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: C.dark, margin: "0 0 4px 0" }}>My Profile</h1>
          <p style={{ color: C.body, fontSize: "0.9375rem" }}>Manage your learning identity, avatar, and progress.</p>
        </div>

        {/* Profile Hero */}
        <div style={{ background: "linear-gradient(135deg, #ECFDF5 0%, #E6F5F1 60%, #EFF6FF 100%)", borderRadius: 24, padding: "28px 32px", marginBottom: 24, border: "1px solid " + C.border, display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>
          <div style={{ width: 120, height: 120, borderRadius: "50%", background: "linear-gradient(135deg, #A7F3D0, #6EE7B7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3.5rem", flexShrink: 0, border: "3px solid #6EE7B7", position: "relative" }}>
            🧒🏽
            <span style={{ position: "absolute", bottom: 2, right: 2, background: C.white, borderRadius: "50%", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6875rem", fontWeight: 800, color: C.teal, border: "2px solid " + C.teal }}>{avatarLevel}</span>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 900, color: C.dark, margin: "0 0 2px 0" }}>{name}</h2>
            <p style={{ fontSize: "0.875rem", color: C.body, margin: "0 0 10px 0" }}>{grade ? "Grade " + grade : "Grade not set"} · Level {avatarLevel} · {sparkCoins} Spark Coins</p>
            <div style={{ marginBottom: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: C.muted }}>XP Progress</span>
                <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: C.teal }}>{currentXp} / {nextLevelXp} XP</span>
              </div>
              <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.7)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: xpPct + "%", borderRadius: 4, background: "linear-gradient(90deg, #047A70, #34D399)" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Link href="/dashboard/student/profile?tab=avatar" style={{ padding: "7px 16px", borderRadius: 10, background: C.teal, color: "#fff", fontWeight: 700, fontSize: "0.8125rem", textDecoration: "none" }}>🎨 Customize Avatar</Link>
              <Link href="/dashboard/student/shop" style={{ padding: "7px 16px", borderRadius: 10, background: "rgba(255,255,255,0.8)", color: C.teal, fontWeight: 700, fontSize: "0.8125rem", textDecoration: "none", border: "1.5px solid " + C.teal }}>🛍️ Visit Shop</Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
          <StatCard2 icon={<Coins size={18} style={{ color: "#D97706" }} />} value={String(sparkCoins)} label="Spark Coins" note={sparkCoins > 0 ? "Keep learning!" : "Complete your first lesson to earn coins."} bg={C.cream} accent="#D97706" />
          <StatCard2 icon={<Flame size={18} style={{ color: "#E11D48" }} />} value={streak + " " + (streak === 1 ? "day" : "days")} label="Streak" note={streak > 0 ? "You're on fire! 🔥" : "Start today to build your learning streak."} bg={C.rose} accent="#E11D48" />
          <StatCard2 icon={<Trophy size={18} style={{ color: "#6D28D9" }} />} value={String(badgesEarned.length)} label="Badges" note={badgesEarned.length > 0 ? badgesEarned.length + " unlocked" : "Complete lessons to unlock badges."} bg={C.lavender} accent="#6D28D9" />
        </div>

        {/* Two columns */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Left: Avatar + Subjects */}
          <div>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: C.dark, margin: "0 0 14px 0" }}>🎨 Customize Avatar</h3>
            <div style={{ background: C.white, borderRadius: 20, border: "1px solid " + C.border, padding: 20, marginBottom: 24 }}>
              <div style={{ display: "flex", gap: 2, marginBottom: 16, borderBottom: "1px solid " + C.border, paddingBottom: 10, overflowX: "auto" }}>
                {["hair", "face", "outfit", "accessories", "shoes", "pet"].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: activeTab === tab ? C.mint : "transparent", color: activeTab === tab ? C.tealD : C.body, fontWeight: activeTab === tab ? 700 : 500, fontSize: "0.75rem", cursor: "pointer", whiteSpace: "nowrap", textTransform: "capitalize" }}>{tab}</button>
                ))}
              </div>
              {activeTab === "hair" && (
                <div>
                  <h4 style={{ fontSize: "0.875rem", fontWeight: 800, color: C.dark, margin: "0 0 10px 0" }}>Choose a hairstyle</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 14 }}>
                    {HAIRSTYLES.map(h => {
                      const isSel = selectedHair === h.id;
                      return (
                        <button key={h.id} onClick={() => setSelectedHair(h.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 6px", borderRadius: 12, border: isSel ? "2px solid " + C.teal : "1px solid " + C.border, background: isSel ? C.mint : C.white, cursor: "pointer", position: "relative" }}>
                          {isSel && <span style={{ position: "absolute", top: 2, right: 2, width: 16, height: 16, borderRadius: "50%", background: C.teal, color: "#fff", fontSize: "0.5625rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>✓</span>}
                          <div style={{ width: 40, height: 40, borderRadius: "50%", background: isSel ? "#A7F3D0" : "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem" }}>🧑🏽</div>
                          <span style={{ fontSize: "0.625rem", fontWeight: 700, color: isSel ? C.tealD : C.body, textAlign: "center" }}>{h.name}</span>
                        </button>
                      );
                    })}
                  </div>
                  <h4 style={{ fontSize: "0.8125rem", fontWeight: 800, color: C.dark, margin: "0 0 8px 0" }}>Hair Color</h4>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                    {HAIR_COLORS.map(c => {
                      const isSel = selectedHairColor === c.id;
                      return <button key={c.id} onClick={() => setSelectedHairColor(c.id)} style={{ width: 32, height: 32, borderRadius: "50%", background: c.hex, border: isSel ? "3px solid " + C.teal : "2px solid #E5E7EB", cursor: "pointer", position: "relative" }}>{isSel && <span style={{ color: "#fff", fontSize: "0.625rem", fontWeight: 800 }}>✓</span>}</button>;
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
                    <button onClick={handleSaveAvatar} disabled={saving} style={{ flex: 2, padding: "10px", borderRadius: 10, border: "none", background: saved ? "#22C55E" : C.teal, color: "#fff", fontWeight: 700, fontSize: "0.8125rem", cursor: "pointer" }}>{saving ? "Saving..." : saved ? "✓ Saved" : "Save Avatar"}</button>
                  </div>
                </div>
              )}
              {activeTab !== "hair" && (
                <div style={{ textAlign: "center", padding: "30px 20px" }}>
                  <p style={{ fontSize: "0.8125rem", color: C.body, fontWeight: 600 }}>More {activeTab} options coming soon!</p>
                </div>
              )}
            </div>

            {/* Subjects */}
            <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: C.dark, margin: "0 0 14px 0" }}>📈 Subject Progress</h3>
            <div style={{ display: "grid", gap: 10 }}>
              {subjects.map(s => (
                <div key={s.name} style={{ padding: "14px 16px", borderRadius: 14, background: s.color, border: "1px solid " + C.border, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: "0.8125rem", fontWeight: 800, color: C.dark }}>{s.name}</span>
                      <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: C.muted }}>Lvl {s.level}</span>
                    </div>
                    <div style={{ height: 5, borderRadius: 3, background: "rgba(0,0,0,0.06)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: s.progress + "%", borderRadius: 3, background: C.teal }} />
                    </div>
                    <span style={{ fontSize: "0.625rem", fontWeight: 700, color: C.muted }}>{s.progress > 0 ? s.progress + "% complete" : "Start learning"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Badges + Shop + Account */}
          <div>
            {/* Badges */}
            <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: C.dark, margin: "0 0 14px 0" }}>🏆 Badges</h3>
            <div style={{ background: C.white, borderRadius: 20, border: "1px solid " + C.border, padding: 20, marginBottom: 20 }}>
              {badgesEarned.length === 0 ? (
                <div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                    {BADGES.map((b, i) => {
                      const Icon = b.icon;
                      return (
                        <div key={i} style={{ width: 48, height: 48, borderRadius: 12, background: "#F8FAFC", border: "1px solid " + C.border, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                          <Icon size={18} style={{ opacity: 0.4 }} />
                          <span style={{ position: "absolute", bottom: -3, right: -3, fontSize: "0.625rem" }}>🔒</span>
                        </div>
                      );
                    })}
                  </div>
                  <p style={{ fontSize: "0.75rem", color: C.body }}>Complete lessons, quests, and check-ins to unlock badges.</p>
                </div>
              ) : (
                <p style={{ fontSize: "0.75rem", color: C.body }}>{badgesEarned.length} badge{badgesEarned.length !== 1 ? "s" : ""} unlocked</p>
              )}
            </div>

            {/* Shop Summary */}
            <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: C.dark, margin: "0 0 14px 0" }}>🛍️ Avatar Shop</h3>
            <div style={{ background: C.white, borderRadius: 20, border: "1px solid " + C.border, padding: 20, marginBottom: 20 }}>
              <p style={{ fontSize: "0.75rem", color: C.body, margin: "0 0 10px 0" }}>Use Spark Coins to unlock outfits, tools, pets, and accessories.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                {SHOP_ITEMS.map((item, i) => {
                  const r = RARITY_COLORS[item.rarity];
                  return (
                    <div key={i} style={{ padding: "10px", borderRadius: 12, background: "#FAFAFA", border: "1px solid " + C.border, textAlign: "center", position: "relative" }}>
                      <span style={{ position: "absolute", top: 4, right: 6, fontSize: "0.5625rem", fontWeight: 800, color: r.color, textTransform: "uppercase" }}>{item.rarity}</span>
                      <div style={{ fontSize: "1.5rem", marginBottom: 4, opacity: 0.6 }}>{item.icon}</div>
                      <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: C.dark, margin: "0 0 2px 0" }}>{item.name}</p>
                      <p style={{ fontSize: "0.625rem", color: C.muted }}>🪙 {item.cost} · {item.req ? "Locked" : sparkCoins >= item.cost ? "Buy" : "Need more"}</p>
                    </div>
                  );
                })}
              </div>
              <Link href="/dashboard/student/shop" style={{ display: "block", width: "100%", padding: "10px", borderRadius: 10, background: C.teal, color: "#fff", fontWeight: 700, fontSize: "0.8125rem", textDecoration: "none", textAlign: "center" }}>Visit Shop →</Link>
            </div>

            {/* Account */}
            <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: C.dark, margin: "0 0 14px 0" }}>👤 Account</h3>
            <div style={{ background: C.white, borderRadius: 20, border: "1px solid " + C.border, padding: 20, marginBottom: 20 }}>
              <div style={{ marginBottom: 12 }}><span style={{ fontSize: "0.6875rem", fontWeight: 700, color: C.muted, textTransform: "uppercase" }}>Name</span><p style={{ fontSize: "0.875rem", fontWeight: 700, color: C.dark, margin: "2px 0 0 0" }}>{name}</p></div>
              <div style={{ marginBottom: 12 }}><span style={{ fontSize: "0.6875rem", fontWeight: 700, color: C.muted, textTransform: "uppercase" }}>Grade</span><p style={{ fontSize: "0.875rem", fontWeight: 700, color: C.dark, margin: "2px 0 0 0" }}>{grade ? "Grade " + grade : "Not set"}</p></div>
              <div><span style={{ fontSize: "0.6875rem", fontWeight: 700, color: C.muted, textTransform: "uppercase" }}>Parent</span><p style={{ fontSize: "0.875rem", fontWeight: 700, color: C.dark, margin: "2px 0 0 0" }}>{parentLinked ? parentName : "Not linked"}</p></div>
            </div>

            {/* Quest */}
            <div style={{ background: C.white, borderRadius: 20, border: "1px solid " + C.border, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Target size={16} style={{ color: "#E11D48" }} />
                <h4 style={{ fontSize: "0.875rem", fontWeight: 800, color: C.dark, margin: 0 }}>Quest Progress</h4>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: "#F1F5F9", overflow: "hidden", marginBottom: 4 }}>
                <div style={{ height: "100%", width: (questTotal > 0 ? (questCompleted / questTotal) * 100 : 0) + "%", borderRadius: 3, background: "#E11D48" }} />
              </div>
              <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: C.muted }}>{questCompleted} / {questTotal}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard2({ icon, value, label, note, bg, accent }) {
  return (
    <div style={{ padding: "16px", borderRadius: 16, border: "1px solid #E2E8F0", background: bg }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        {icon}
        <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>{label}</span>
      </div>
      <div style={{ fontSize: "1.5rem", fontWeight: 900, color: accent }}>{value}</div>
      <div style={{ fontSize: "0.6875rem", color: "#64748B", lineHeight: 1.4 }}>{note}</div>
    </div>
  );
}
