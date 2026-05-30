"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════════════════
   ARIZEN SCHOOL — Student Profile
   Identity hub: avatar, stats, progress, badges, account
   Real data from API, honest zero states, no fake values
   ═══════════════════════════════════════════════════════════════════ */

const C = {
  page: "#F7FBF7", teal: "#047A70", tealD: "#005B50",
  tealSoft: "#E6F5F1", mint: "#ECFDF5", cream: "#FFFBEB",
  dark: "#0F172A", body: "#64748B", muted: "#94A3B8",
  white: "#FFFFFF", border: "#E2E8F0",
  lavender: "#EDE9FE", yellow: "#FFF4D8", blue: "#EFF6FF",
  rose: "#FFF1F2",
};

/* ── Navigation ── */
const NAV = [
  { icon: "\uD83C\uDFE0", label: "Dashboard",    href: "/dashboard/student",        id: "dashboard" },
  { icon: "\uD83D\uDCD6", label: "My Subjects",  href: "/dashboard/student/subjects", id: "subjects" },
  { icon: "\uD83D\uDCDD", label: "Lessons",      href: "/dashboard/student/lessons",  id: "lessons" },
  { icon: "\u2696\uFE0F", label: "Assignments",  href: "/dashboard/student/quests",   id: "assignments" },
  { icon: "\uD83D\uDCA1", label: "Quizzes",      href: "/dashboard/student/quests",   id: "quizzes" },
  { icon: "\uD83D\uDCC8", label: "Progress",     href: "/dashboard/student/subjects", id: "progress" },
  { icon: "\uD83D\uDCC5", label: "Calendar",     href: "/dashboard/student",          id: "calendar" },
  { icon: "\uD83D\uDC9A", label: "EQ Check-In",  href: "/dashboard/student",          id: "eq" },
  { icon: "\uD83D\uDC64", label: "Profile",      href: "/dashboard/student/profile",  id: "profile" },
];

/* ── Hairstyles ── */
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

const CUSTOM_TABS = [
  { id: "hair",        label: "Hair",        icon: "\uD83E\uDDB0" },
  { id: "face",        label: "Face",        icon: "\uD83D\uDE0A" },
  { id: "outfit",      label: "Outfit",      icon: "\uD83D\uDC55" },
  { id: "accessories", label: "Accessories", icon: "\uD83D\uDC5C" },
  { id: "shoes",       label: "Shoes",       icon: "\uD83E\uDD7E" },
  { id: "pet",         label: "Pet",         icon: "\uD83D\uDC3E" },
];

const ALL_BADGES = [
  { name: "Math Whiz",        icon: "\uD83D\uDCCA", requirement: "Complete 5 math lessons" },
  { name: "Reader",           icon: "\uD83D\uDCD6", requirement: "Complete 5 reading lessons" },
  { name: "Science Explorer", icon: "\uD83D\uDD2C", requirement: "Complete 5 science lessons" },
  { name: "Kind Heart",       icon: "\uD83D\uDC9A", requirement: "Complete 3 EQ check-ins" },
  { name: "Quiz Master",      icon: "\uD83C\uDFAF", requirement: "Score 80%+ on 3 quizzes" },
  { name: "Goal Getter",      icon: "\uD83C\uDFC6", requirement: "Complete daily goal 3 days" },
  { name: "Team Player",      icon: "\uD83D\uDC65", requirement: "Complete 10 quests" },
  { name: "Early Bird",       icon: "\uD83D\uDC24", requirement: "7-day learning streak" },
];

const RARITY: Record<string, { color: string; bg: string }> = {
  common:    { color: "#22C55E", bg: "#DCFCE7" },
  rare:      { color: "#3B82F6", bg: "#DBEAFE" },
  epic:      { color: "#7C3AED", bg: "#EDE9FE" },
  legendary: { color: "#F59E0B", bg: "#FEF3C7" },
};

const SHOP_PREVIEW = [
  { name: "Soccer Boots",        icon: "\uD83E\uDD7E", rarity: "common", cost: 30,  requirement: null },
  { name: "Math Wizard Hat",     icon: "\uD83C\uDF93", rarity: "rare",   cost: 50,  requirement: "Complete 5 math lessons" },
  { name: "Storyteller Cape",    icon: "\uD83D\uDC5E", rarity: "epic",   cost: 70,  requirement: "Complete 5 reading lessons" },
  { name: "Creative Crown",      icon: "\uD83D\uDC51", rarity: "legendary", cost: 200, requirement: "Complete 50 lessons" },
];

export default function StudentProfilePage() {
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("Student");
  const [grade, setGrade] = useState<number | null>(null);
  const [sparkCoins, setSparkCoins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [avatarLevel, setAvatarLevel] = useState(1);
  const [currentXp, setCurrentXp] = useState(0);
  const [nextLevelXp, setNextLevelXp] = useState(1000);
  const [badgesEarned, setBadgesEarned] = useState<string[]>([]);
  const [lessonsCompleted, setLessonsCompleted] = useState(0);
  const [quizzesCompleted, setQuizzesCompleted] = useState(0);
  const [reflectionsCompleted, setReflectionsCompleted] = useState(0);
  const [questCompleted, setQuestCompleted] = useState(0);
  const [questTotal, setQuestTotal] = useState(10);
  const [subjects, setSubjects] = useState<{ name: string; progress: number; level: number; color: string; icon: string }[]>([]);
  const [parentLinked, setParentLinked] = useState(false);
  const [parentName, setParentName] = useState("");

  // Avatar customization state
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
          fetch("/api/parent/children", { credentials: "include" }).then(r => r.json()),
        ]);

        const profile = results[0].status === "fulfilled" ? results[0].value?.profile || results[0].value : {};
        const wallet = results[1].status === "fulfilled" ? results[1].value?.wallet || results[1].value : {};
        const progress = results[2].status === "fulfilled" ? results[2].value?.progress || results[2].value : {};
        const subjectsRes = results[3].status === "fulfilled" ? results[3].value : {};
        const badgesRes = results[4].status === "fulfilled" ? results[4].value : {};
        const avatarRes = results[5].status === "fulfilled" ? results[5].value : {};
        const parentRes = results[6].status === "fulfilled" ? results[6].value : {};

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

        const earned = (badgesRes.badges || []).filter((b: any) => b.earned).map((b: any) => b.name || b.title);
        setBadgesEarned(earned);

        const subjList = (subjectsRes.subjects || [
          { name: "Mathematics", level: 1, progress: 0, color: "#EDE9FE", icon: "\uD83D\uDCCA" },
          { name: "English", level: 1, progress: 0, color: "#FFF4D8", icon: "\uD83D\uDCD6" },
          { name: "Science", level: 1, progress: 0, color: "#ECFDF5", icon: "\uD83D\uDD2C" },
          { name: "Social Studies", level: 1, progress: 0, color: "#EFF6FF", icon: "\uD83C\uDF0D" },
        ]);
        setSubjects(subjList);

        if (avatarRes.avatar) {
          setSelectedHair(avatarRes.avatar.hairStyle || "short-curls");
          setSelectedHairColor(avatarRes.avatar.hairColor || "black");
          setSelectedSkin(avatarRes.avatar.skinTone || "medium-brown");
        }

        const children = parentRes.children || parentRes || [];
        if (children.length > 0) {
          setParentLinked(true);
          setParentName(children[0]?.name || "Linked");
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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: C.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}><div style={{ fontSize: "2rem", marginBottom: "1rem" }}>{"\u2728"}</div><p style={{ color: C.body, fontWeight: 600 }}>Loading your profile...</p></div>
      </div>
    );
  }

  const xpPercent = nextLevelXp > 0 ? Math.min(100, (currentXp / nextLevelXp) * 100) : 0;

  return (
    <div style={{ minHeight: "100vh", background: C.page, fontFamily: "'Nunito', system-ui, sans-serif" }}>
      <div style={{ display: "flex" }}>

        {/* ═══════════════════════════════════════════════════
            SIDEBAR
            ═══════════════════════════════════════════════════ */}
        <aside className="sp-sidebar" style={{
          width: 260, minWidth: 260, height: "100vh", position: "sticky", top: 0,
          background: C.white, borderRight: `1px solid ${C.border}`,
          display: "flex", flexDirection: "column", zIndex: 20, overflowY: "auto",
        }}>
          <div style={{ padding: "20px 16px 14px", borderBottom: `1px solid ${C.border}` }}>
            <Link href="/dashboard/student" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: C.teal, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: "1rem" }}>A</div>
              <span style={{ fontWeight: 900, fontSize: "1rem", color: C.teal, letterSpacing: "-0.02em" }}>Arizen School</span>
            </Link>
          </div>
          <nav style={{ padding: "10px", flex: 1 }}>
            {NAV.map(item => {
              const isActive = item.id === "profile";
              return (
                <Link key={item.id} href={item.href} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                  borderRadius: 12, textDecoration: "none", marginBottom: 2,
                  background: isActive ? C.teal : "transparent",
                  color: isActive ? "#fff" : C.dark,
                  fontWeight: isActive ? 700 : 500, fontSize: "0.875rem",
                }}>
                  <span style={{ fontSize: "1rem", width: 20, textAlign: "center", opacity: isActive ? 1 : 0.6 }}>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div style={{ padding: "10px" }}>
            <div style={{ padding: "14px", borderRadius: 14, background: C.mint, border: `1px solid ${C.border}`, marginBottom: 8 }}>
              <div style={{ fontSize: "1.375rem", marginBottom: 4 }}>{"\uD83C\uDF81"}</div>
              <h4 style={{ fontSize: "0.8125rem", fontWeight: 800, color: C.dark, margin: "0 0 2px 0" }}>Invite friends</h4>
              <p style={{ fontSize: "0.6875rem", color: C.body, margin: "0 0 8px 0", lineHeight: 1.4 }}>Learn together and earn rewards!</p>
              <button style={{ width: "100%", padding: "7px", borderRadius: 10, background: C.teal, color: "#fff", border: "none", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer" }}>Invite Now</button>
            </div>
            <div style={{ padding: "12px 14px", borderRadius: 14, background: C.cream, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: "1.125rem" }}>{"\uD83C\uDFA7"}</span>
              <div><p style={{ fontSize: "0.75rem", fontWeight: 700, color: C.dark, margin: 0 }}>Need help?</p><p style={{ fontSize: "0.6875rem", color: C.body, margin: 0 }}>Contact Support</p></div>
            </div>
          </div>
        </aside>

        {/* ═══════════════════════════════════════════════════
            MAIN CONTENT
            ═══════════════════════════════════════════════════ */}
        <main className="sp-main" style={{ flex: 1, minWidth: 0, padding: "28px 32px 40px" }}>

          {/* Page Header */}
          <div style={{ marginBottom: "24px" }}>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: C.dark, margin: "0 0 4px 0" }}>My Profile</h1>
            <p style={{ color: C.body, fontSize: "0.9375rem", margin: 0 }}>Manage your learning identity, avatar, and progress.</p>
          </div>

          {/* ═══════════════════════════════════════════════════
              PROFILE HERO CARD
              ═══════════════════════════════════════════════════ */}
          <div style={{
            background: "linear-gradient(135deg, #ECFDF5 0%, #E6F5F1 60%, #EFF6FF 100%)",
            borderRadius: 24, padding: "28px 32px", marginBottom: 24,
            border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap",
          }}>
            {/* Avatar circle */}
            <div style={{
              width: 120, height: 120, borderRadius: "50%", background: "linear-gradient(135deg, #A7F3D0, #6EE7B7)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem", flexShrink: 0,
              border: "3px solid #6EE7B7", position: "relative",
            }}>
              {"\uD83E\uDDD2\uD83C\uDFFD"}
              <span style={{ position: "absolute", bottom: 2, right: 2, background: C.white, borderRadius: "50%", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", border: `2px solid ${C.teal}` }}>{avatarLevel}</span>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 900, color: C.dark, margin: "0 0 2px 0" }}>{name}</h2>
              <p style={{ fontSize: "0.875rem", color: C.body, margin: "0 0 10px 0" }}>
                {grade ? `Grade ${grade}` : "Grade not set"} {"\u00B7"} Level {avatarLevel} {"\u00B7"} {sparkCoins} {"\uD83E\uDEE1"} Spark Coins
              </p>
              {/* XP bar */}
              <div style={{ marginBottom: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: C.muted }}>XP Progress</span>
                  <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: C.teal }}>{currentXp} / {nextLevelXp} XP</span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.7)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${xpPercent}%`, borderRadius: 4, background: "linear-gradient(90deg, #047A70, #34D399)" }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Link href="/dashboard/student/profile?tab=avatar" style={{
                  padding: "7px 16px", borderRadius: 10, background: C.teal, color: "#fff",
                  fontWeight: 700, fontSize: "0.8125rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4,
                }}>{"\uD83C\uDFA8"} Customize Avatar</Link>
                <Link href="/dashboard/student/shop" style={{
                  padding: "7px 16px", borderRadius: 10, background: "rgba(255,255,255,0.8)", color: C.teal,
                  fontWeight: 700, fontSize: "0.8125rem", textDecoration: "none", border: `1.5px solid ${C.teal}`, display: "inline-flex", alignItems: "center", gap: 4,
                }}>{"\uD83D\uDED2"} Visit Shop</Link>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════
              STATS ROW
              ═══════════════════════════════════════════════════ */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
            <StatCard icon={"$\uD83E\uDEE1"} value={String(sparkCoins)} label="Spark Coins"
              note={sparkCoins > 0 ? "Keep learning to unlock more rewards!" : "Complete your first lesson to earn coins."}
              bg={C.cream} accent="#D97706" />
            <StatCard icon={"$\uD83D\uDD25"} value={`${streak} ${streak === 1 ? "day" : "days"}`} label="Streak"
              note={streak > 0 ? "You're on fire! \uD83D\uDD25" : "Start today to build your learning streak."}
              bg={C.rose} accent="#E11D48" />
            <StatCard icon={"$\uD83C\uDFC6"} value={String(badgesEarned.length)} label="Badges Earned"
              note={badgesEarned.length > 0 ? `${badgesEarned.length} badge${badgesEarned.length !== 1 ? "s" : ""} unlocked` : "Complete lessons and quests to unlock badges."}
              bg={C.lavender} accent="#6D28D9" />
            <StatCard icon={"$\uD83D\uDCDD"} value={String(lessonsCompleted)} label="Lessons Completed"
              note={lessonsCompleted > 0 ? "Great progress!" : "Start your first lesson today."}
              bg={C.blue} accent="#2563EB" />
            <StatCard icon={"$\uD83C\uDFAF"} value={String(quizzesCompleted)} label="Quizzes Completed"
              note={quizzesCompleted > 0 ? "Keep it up!" : "Complete your first quiz."}
              bg={C.yellow} accent="#D97706" />
            <StatCard icon={"$\uD83D\uDC9A"} value={String(reflectionsCompleted)} label="Reflections"
              note={reflectionsCompleted > 0 ? "Thoughtful learner!" : "Complete your first reflection."}
              bg={C.mint} accent="#059669" />
          </div>

          {/* ═══════════════════════════════════════════════════
              TWO COLUMNS: Avatar Customization + Right Panel
              ═══════════════════════════════════════════════════ */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

            {/* ── LEFT: Avatar Customization ── */}
            <div>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: C.dark, margin: "0 0 14px 0" }}>
                {"\uD83C\uDFA8"} Customize Avatar
              </h3>
              <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, padding: "20px" }}>
                {/* Tabs */}
                <div style={{ display: "flex", gap: 2, marginBottom: 16, borderBottom: `1px solid ${C.border}`, paddingBottom: 10, overflowX: "auto" }}>
                  {CUSTOM_TABS.map(tab => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                        display: "flex", alignItems: "center", gap: 4, padding: "6px 12px",
                        borderRadius: 8, border: "none", background: isActive ? C.mint : "transparent",
                        color: isActive ? C.tealD : C.body, fontWeight: isActive ? 700 : 500,
                        fontSize: "0.75rem", cursor: "pointer", whiteSpace: "nowrap",
                      }}>
                        <span>{tab.icon}</span> {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Hair tab */}
                {activeTab === "hair" && (
                  <div>
                    <h4 style={{ fontSize: "0.875rem", fontWeight: 800, color: C.dark, margin: "0 0 10px 0" }}>Choose a hairstyle</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 14 }}>
                      {HAIRSTYLES.map(hair => {
                        const isSel = selectedHair === hair.id;
                        return (
                          <button key={hair.id} onClick={() => setSelectedHair(hair.id)} style={{
                            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                            padding: "10px 6px", borderRadius: 12,
                            border: isSel ? `2px solid ${C.teal}` : `1px solid ${C.border}`,
                            background: isSel ? C.mint : C.white, cursor: "pointer", position: "relative",
                          }}>
                            {isSel && <span style={{ position: "absolute", top: 2, right: 2, width: 16, height: 16, borderRadius: "50%", background: C.teal, color: "#fff", fontSize: "0.5625rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>{"\u2713"}</span>}
                            <div style={{ width: 40, height: 40, borderRadius: "50%", background: isSel ? "#A7F3D0" : "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>{"\uD83E\uDDD1\uD83C\uDFFD"}</div>
                            <span style={{ fontSize: "0.625rem", fontWeight: 700, color: isSel ? C.tealD : C.body, textAlign: "center", lineHeight: 1.2 }}>{hair.name}</span>
                          </button>
                        );
                      })}
                    </div>
                    <h4 style={{ fontSize: "0.8125rem", fontWeight: 800, color: C.dark, margin: "0 0 8px 0" }}>Hair Color</h4>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                      {HAIR_COLORS.map(c => {
                        const isSel = selectedHairColor === c.id;
                        return (
                          <button key={c.id} onClick={() => setSelectedHairColor(c.id)} style={{
                            width: 32, height: 32, borderRadius: "50%", background: c.hex,
                            border: isSel ? `3px solid ${C.teal}` : "2px solid #E5E7EB", cursor: "pointer",
                            position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            {isSel && <span style={{ color: "#fff", fontSize: "0.625rem", fontWeight: 800 }}>{"\u2713"}</span>}
                          </button>
                        );
                      })}
                    </div>
                    <h4 style={{ fontSize: "0.8125rem", fontWeight: 800, color: C.dark, margin: "0 0 8px 0" }}>Skin Tone</h4>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                      {SKIN_TONES.map(t => {
                        const isSel = selectedSkin === t.id;
                        return (
                          <button key={t.id} onClick={() => setSelectedSkin(t.id)} style={{
                            width: 36, height: 36, borderRadius: "50%", background: t.hex,
                            border: isSel ? `3px solid ${C.teal}` : "2px solid #E5E7EB", cursor: "pointer",
                            position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            {isSel && <span style={{ color: "#fff", fontSize: "0.625rem", fontWeight: 800, textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>{"\u2713"}</span>}
                          </button>
                        );
                      })}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={handleRandomize} style={{
                        flex: 1, padding: "10px", borderRadius: 10, border: `1px solid ${C.border}`,
                        background: C.white, color: C.dark, fontWeight: 700, fontSize: "0.8125rem", cursor: "pointer",
                      }}>{"\uD83C\uDFB2"} Randomize</button>
                      <button onClick={handleSaveAvatar} disabled={saving} style={{
                        flex: 2, padding: "10px", borderRadius: 10, border: "none",
                        background: saved ? "#22C55E" : C.teal, color: "#fff",
                        fontWeight: 700, fontSize: "0.8125rem", cursor: "pointer",
                      }}>{saving ? "Saving..." : saved ? "Saved! \u2705" : "Save Avatar"}</button>
                    </div>
                  </div>
                )}

                {/* Other tabs placeholder */}
                {activeTab !== "hair" && (
                  <div style={{ textAlign: "center", padding: "30px 20px" }}>
                    <div style={{ fontSize: "2rem", marginBottom: 10 }}>{CUSTOM_TABS.find(t => t.id === activeTab)?.icon}</div>
                    <p style={{ fontSize: "0.8125rem", color: C.body, fontWeight: 600 }}>More {activeTab} options coming soon!</p>
                    <p style={{ fontSize: "0.6875rem", color: C.body, marginTop: 4 }}>Complete lessons to unlock new items.</p>
                  </div>
                )}
              </div>

              {/* Subject Progress */}
              <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: C.dark, margin: "24px 0 14px 0" }}>
                {"\uD83D\uDCC8"} Subject Progress
              </h3>
              <div style={{ display: "grid", gap: 10 }}>
                {subjects.map(s => (
                  <div key={s.name} style={{
                    padding: "14px 16px", borderRadius: 14, background: s.color,
                    border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12,
                  }}>
                    <span style={{ fontSize: "1.25rem" }}>{s.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: "0.8125rem", fontWeight: 800, color: C.dark }}>{s.name}</span>
                        <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: C.muted }}>Level {s.level}</span>
                      </div>
                      <div style={{ height: 5, borderRadius: 3, background: "rgba(0,0,0,0.06)", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${s.progress}%`, borderRadius: 3, background: C.teal }} />
                      </div>
                      <span style={{ fontSize: "0.625rem", fontWeight: 700, color: C.muted, marginTop: 2, display: "inline-block" }}>
                        {s.progress > 0 ? `${s.progress}% complete` : "Start learning"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT COLUMN ── */}
            <div>

              {/* Badges */}
              <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: C.dark, margin: "0 0 14px 0" }}>
                {"\uD83C\uDFC6"} Badges
              </h3>
              <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, padding: "20px", marginBottom: 20 }}>
                {badgesEarned.length === 0 ? (
                  <>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                      {ALL_BADGES.map((b, i) => (
                        <div key={i} style={{
                          width: 48, height: 48, borderRadius: 12, background: "#F8FAFC",
                          border: `1px solid ${C.border}`, display: "flex", alignItems: "center",
                          justifyContent: "center", fontSize: "1.25rem", position: "relative",
                        }}>
                          {b.icon}
                          <span style={{ position: "absolute", bottom: -3, right: -3, fontSize: "0.625rem" }}>{"\uD83D\uDD12"}</span>
                        </div>
                      ))}
                    </div>
                    <p style={{ fontSize: "0.75rem", color: C.body, margin: 0 }}>
                      Complete lessons, quests, and check-ins to unlock badges.
                    </p>
                  </>
                ) : (
                  <>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                      {ALL_BADGES.filter(b => badgesEarned.includes(b.name)).map((b, i) => (
                        <div key={i} style={{
                          width: 48, height: 48, borderRadius: 12, background: C.mint,
                          border: "1px solid #A7F3D0", display: "flex", alignItems: "center",
                          justifyContent: "center", fontSize: "1.25rem", position: "relative",
                        }} title={b.name}>
                          {b.icon}
                          <span style={{ position: "absolute", top: -2, right: -2, width: 16, height: 16, borderRadius: "50%", background: C.teal, color: "#fff", fontSize: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>{"\u2713"}</span>
                        </div>
                      ))}
                    </div>
                    <p style={{ fontSize: "0.75rem", color: C.body, margin: 0 }}>{badgesEarned.length} badge{badgesEarned.length !== 1 ? "s" : ""} unlocked</p>
                  </>
                )}
                <Link href="/dashboard/student/badges" style={{ fontSize: "0.75rem", fontWeight: 700, color: C.teal, textDecoration: "none", display: "inline-block", marginTop: 10 }}>
                  View All Badges {"\u2192"}
                </Link>
              </div>

              {/* Avatar Shop Summary */}
              <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: C.dark, margin: "0 0 14px 0" }}>
                {"\uD83D\uDED2"} Avatar Shop
              </h3>
              <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, padding: "20px", marginBottom: 20 }}>
                <p style={{ fontSize: "0.75rem", color: C.body, margin: "0 0 10px 0" }}>
                  Use Spark Coins to unlock outfits, tools, pets, and accessories.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                  {SHOP_PREVIEW.map((item, i) => {
                    const r = RARITY[item.rarity];
                    return (
                      <div key={i} style={{
                        padding: "10px", borderRadius: 12, background: "#FAFAFA",
                        border: `1px solid ${C.border}`, textAlign: "center", position: "relative",
                      }}>
                        <span style={{ position: "absolute", top: 4, right: 4, fontSize: "0.5625rem", fontWeight: 800, color: r.color, textTransform: "uppercase" }}>{item.rarity}</span>
                        <div style={{ fontSize: "1.5rem", marginBottom: 4, opacity: 0.6 }}>{item.icon}</div>
                        <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: C.dark, margin: "0 0 2px 0" }}>{item.name}</p>
                        <p style={{ fontSize: "0.625rem", color: C.muted, margin: 0 }}>
                          {"\uD83E\uDEE1"} {item.cost} {"\u00B7"} {item.requirement ? "Locked" : sparkCoins >= item.cost ? "Buy" : "Need more"}
                        </p>
                      </div>
                    );
                  })}
                </div>
                <Link href="/dashboard/student/shop" style={{
                  display: "block", width: "100%", padding: "10px", borderRadius: 10,
                  background: C.teal, color: "#fff", fontWeight: 700, fontSize: "0.8125rem",
                  textDecoration: "none", textAlign: "center",
                }}>Visit Shop {"\u2192"}</Link>
              </div>

              {/* Account Details */}
              <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: C.dark, margin: "0 0 14px 0" }}>
                {"\uD83D\uDC64"} Account
              </h3>
              <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, padding: "20px", marginBottom: 20 }}>
                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.04em" }}>Student Name</span>
                  <p style={{ fontSize: "0.875rem", fontWeight: 700, color: C.dark, margin: "2px 0 0 0" }}>{name}</p>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.04em" }}>Grade</span>
                  <p style={{ fontSize: "0.875rem", fontWeight: 700, color: C.dark, margin: "2px 0 0 0" }}>{grade ? `Grade ${grade}` : "Not set"}</p>
                </div>
                <div>
                  <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.04em" }}>Parent / Guardian</span>
                  <p style={{ fontSize: "0.875rem", fontWeight: 700, color: C.dark, margin: "2px 0 0 0" }}>
                    {parentLinked ? parentName : "Not linked"}
                  </p>
                  {!parentLinked && (
                    <span style={{ fontSize: "0.6875rem", color: C.body }}>Link a parent account to track progress.</span>
                  )}
                </div>
              </div>

              {/* Quest Progress */}
              <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <h4 style={{ fontSize: "0.875rem", fontWeight: 800, color: C.dark, margin: 0 }}>Quest Progress</h4>
                  <Link href="/dashboard/student/quests" style={{ fontSize: "0.6875rem", fontWeight: 700, color: C.teal, textDecoration: "none" }}>View Quests</Link>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: "#F1F5F9", overflow: "hidden", marginBottom: 4 }}>
                  <div style={{ height: "100%", width: `${questTotal > 0 ? (questCompleted / questTotal) * 100 : 0}%`, borderRadius: 3, background: "#E11D48" }} />
                </div>
                <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: C.muted }}>{questCompleted} / {questTotal} quests</span>
              </div>
            </div>
          </div>
        </main>
      </div>

    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SMALL COMPONENTS
   ═══════════════════════════════════════════════════════════════════ */

function StatCard({ icon, value, label, note, bg, accent }: {
  icon: string; value: string; label: string; note: string; bg: string; accent: string;
}) {
  return (
    <div style={{ padding: "16px", borderRadius: 16, border: "1px solid " + C.border, background: bg }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <span style={{ fontSize: "1rem" }}>{icon}</span>
        <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: C.body, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</span>
      </div>
      <div style={{ fontSize: "1.5rem", fontWeight: 900, color: accent, marginBottom: 2 }}>{value}</div>
      <div style={{ fontSize: "0.6875rem", color: C.body, lineHeight: 1.4 }}>{note}</div>
    </div>
  );
}
