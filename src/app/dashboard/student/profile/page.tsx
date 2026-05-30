"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════════════════
   ARIZEN SCHOOL — Student Profile & Avatar Customization
   Three-column layout: Sidebar | Main Content | Shop Panel
   ═══════════════════════════════════════════════════════════════════ */

// ── Color Palette (matches homepage) ──
const C = {
  teal:      "#047A70",
  tealDark:  "#005B50",
  tealSoft:  "#E6F5F1",
  mint:      "#EAF7F1",
  mint2:     "#DFF4E8",
  cream:     "#FFFDF7",
  yellow:    "#FFF4D8",
  gold:      "#F5B942",
  dark:      "#0F172A",
  body:      "#64748B",
  border:    "#E2E8F0",
  white:     "#FFFFFF",
  purple:    "#8B5CF6",
  blue:      "#3B82F6",
  epic:      "#7C3AED",
  legendary:"#F59E0B",
  red:       "#EF4444",
  green:     "#22C55E",
};

// ── Data: Navigation ──
const NAV_ITEMS = [
  { icon: "\uD83D\uDCCD", label: "Dashboard",    href: "/dashboard/student",        id: "dashboard" },
  { icon: "\uD83D\uDCD6", label: "My Subjects",  href: "/dashboard/student/subjects", id: "subjects" },
  { icon: "\uD83D\uDCDD", label: "Lessons",      href: "/dashboard/student/lessons",  id: "lessons" },
  { icon: "\u2696\uFE0F", label: "Assignments",  href: "/dashboard/student/quests",   id: "quests" },
  { icon: "\uD83D\uDCA1", label: "Quizzes",      href: "/dashboard/student/quests",   id: "quizzes" },
  { icon: "\uD83D\uDCC8", label: "Progress",     href: "/dashboard/student/subjects", id: "progress" },
  { icon: "\uD83D\uDCC5", label: "Calendar",     href: "/dashboard/student",          id: "calendar" },
  { icon: "\uD83D\uDC9A", label: "EQ Check-In",  href: "/dashboard/student",          id: "eq" },
  { icon: "\uD83D\uDC64", label: "Profile",      href: "/dashboard/student/profile",  id: "profile" },
];

// ── Data: Hairstyles (African hairstyles) ──
const HAIRSTYLES = [
  { id: "short-curls",    name: "Short Curls",     emoji: "\uD83E\uDDD1\uD83C\uDFFD\u200D\uD83E\uDDB0" },
  { id: "afro",           name: "Rounded Afro",    emoji: "\uD83E\uDDD1\uD83C\uDFFD\u200D\uD83E\uDDB0" },
  { id: "hightop-fade",   name: "High-Top Fade",   emoji: "\uD83E\uDDD1\uD83C\uDFFD\u200D\uD83E\uDDB0" },
  { id: "cornrows",       name: "Cornrows",         emoji: "\uD83E\uDDD1\uD83C\uDFFD\u200D\uD83E\uDDB0" },
  { id: "twists",         name: "Twists",           emoji: "\uD83E\uDDD1\uD83C\uDFFD\u200D\uD83E\uDDB0" },
  { id: "locs",           name: "Locs",             emoji: "\uD83E\uDDD1\uD83C\uDFFD\u200D\uD83E\uDDB0" },
  { id: "braids",         name: "Braids",           emoji: "\uD83E\uDDD1\uD83C\uDFFD\u200D\uD83E\uDDB0" },
  { id: "puff-buns",      name: "Puff Buns",        emoji: "\uD83E\uDDD1\uD83C\uDFFD\u200D\uD83E\uDDB0" },
  { id: "coily-short",    name: "Coily Short",      emoji: "\uD83E\uDDD1\uD83C\uDFFD\u200D\uD83E\uDDB0" },
  { id: "side-fade",      name: "Side Fade+Curls",  emoji: "\uD83E\uDDD1\uD83C\uDFFD\u200D\uD83E\uDDB0" },
];

// ── Data: Hair Colors ──
const HAIR_COLORS = [
  { id: "black",        name: "Black",        hex: "#1a1a1a" },
  { id: "dark-brown",   name: "Dark Brown",   hex: "#3B2314" },
  { id: "medium-brown", name: "Medium Brown", hex: "#6B3A2A" },
  { id: "warm-brown",   name: "Warm Brown",   hex: "#8B5E3C" },
  { id: "light-brown",  name: "Light Brown",  hex: "#A0724A" },
  { id: "teal",         name: "Teal Fun",     hex: "#047A70" },
  { id: "grey",         name: "Grey",         hex: "#9CA3AF" },
  { id: "rainbow",      name: "Rainbow",      hex: "linear-gradient(90deg,#EF4444,#F59E0B,#22C55E,#3B82F6," + C.purple + ")" },
];

// ── Data: Skin Tones (all brown shades) ──
const SKIN_TONES = [
  { id: "deep-brown",   name: "Deep Brown",   hex: "#4A2C17" },
  { id: "dark-brown",   name: "Dark Brown",   hex: "#6B3A2A" },
  { id: "medium-brown", name: "Medium Brown", hex: "#8B5E3C" },
  { id: "warm-brown",   name: "Warm Brown",   hex: "#A0724A" },
  { id: "golden-brown", name: "Golden Brown", hex: "#C49A6C" },
  { id: "light-brown",  name: "Light Brown",  hex: "#D4A574" },
];

// ── Data: Shop Items ──
type ItemStatus = "available" | "locked" | "purchased" | "equipped";
type Rarity = "common" | "rare" | "epic" | "legendary";

interface ShopItem {
  id: string;
  name: string;
  rarity: Rarity;
  category: string;
  cost: number;
  icon: string;
  status: ItemStatus;
  requirement: string | null;
  progress: { current: number; target: number } | null;
}

const SHOP_ITEMS: ShopItem[] = [
  // COMMON
  { id: "soccer-boots",          name: "Soccer Boots",           rarity: "common", category: "shoes",       cost: 30,  icon: "\uD83E\uDD7E", status: "available", requirement: null, progress: null },
  { id: "safari-hat",            name: "Safari Explorer Hat",    rarity: "common", category: "hats",        cost: 35,  icon: "\uD83E\uDEA3", status: "available", requirement: null, progress: null },
  { id: "artist-brush",          name: "Artist Brush",           rarity: "common", category: "accessories", cost: 40,  icon: "\uD83C\uDFA8", status: "available", requirement: null, progress: null },
  { id: "kindness-hoodie",       name: "Kindness Hoodie",        rarity: "common", category: "clothing",    cost: 45,  icon: "\uD83D\uDC55", status: "available", requirement: null, progress: null },
  { id: "reading-glasses",       name: "Reading Champion Glasses",rarity: "common",category: "glasses",   cost: 45,  icon: "\uD83D\uDC53", status: "locked", requirement: "Complete 3 reading lessons",  progress: { current: 0, target: 3 } },
  // RARE
  { id: "math-wizard-hat",       name: "Math Wizard Hat",        rarity: "rare",   category: "hats",        cost: 50,  icon: "\uD83C\uDF93", status: "locked", requirement: "Complete 5 math lessons",  progress: { current: 0, target: 5 } },
  { id: "star-backpack",         name: "Star Backpack",          rarity: "rare",   category: "accessories", cost: 50,  icon: "\uD83C\uDF1F", status: "locked", requirement: "Complete 5 quests",  progress: { current: 0, target: 5 } },
  { id: "music-headphones",      name: "Music Maker Headphones",  rarity: "rare",   category: "accessories", cost: 55,  icon: "\uD83C\uDFB5", status: "locked", requirement: "Complete 5 creative arts lessons",  progress: { current: 0, target: 5 } },
  { id: "nature-backpack",       name: "Nature Guardian Backpack",rarity: "rare",   category: "accessories", cost: 55,  icon: "\uD83C\uDF3F", status: "locked", requirement: "Complete 3 environmental lessons",  progress: { current: 0, target: 3 } },
  { id: "scientist-goggles",     name: "Scientist Goggles",      rarity: "rare",   category: "glasses",     cost: 60,  icon: "\uD83D\uDD2C", status: "locked", requirement: "Complete 3 science lessons",  progress: { current: 0, target: 3 } },
  { id: "globe-explorer",        name: "Globe Explorer Tool",    rarity: "rare",   category: "tools",       cost: 65,  icon: "\uD83C\uDF0D", status: "locked", requirement: "Complete 5 geography lessons",  progress: { current: 0, target: 5 } },
  { id: "library-bg",            name: "Library Background",     rarity: "rare",   category: "backgrounds", cost: 80,  icon: "\uD83D\uDCDA", status: "locked", requirement: "Complete 10 reading lessons",  progress: { current: 0, target: 10 } },
  { id: "forest-bg",             name: "Forest Background",      rarity: "rare",   category: "backgrounds", cost: 80,  icon: "\uD83C\uDF32", status: "locked", requirement: "Complete 5 environmental lessons",  progress: { current: 0, target: 5 } },
  { id: "explorer-telescope",    name: "Explorer Telescope",     rarity: "rare",   category: "tools",       cost: 80,  icon: "\uD83D\uDD2D", status: "locked", requirement: "Complete 3 science lessons",  progress: { current: 0, target: 3 } },
  { id: "rabbit-pet",            name: "Rabbit Companion",       rarity: "rare",   category: "pets",        cost: 90,  icon: "\uD83D\uDC30", status: "locked", requirement: "Complete 10 lessons",  progress: { current: 0, target: 10 } },
  // EPIC
  { id: "storyteller-cape",      name: "Storyteller Cape",       rarity: "epic",   category: "clothing",    cost: 70,  icon: "\uD83D\uDC5E", status: "locked", requirement: "Complete 5 reading lessons",  progress: { current: 0, target: 5 } },
  { id: "space-bg",              name: "Space Background",       rarity: "epic",   category: "backgrounds", cost: 100, icon: "\uD83C\uDF0C", status: "locked", requirement: "Earn 500 XP",  progress: { current: 0, target: 500 } },
  { id: "science-lab-bg",        name: "Science Lab Background",  rarity: "epic",   category: "backgrounds", cost: 120, icon: "\uD83D\uDD2C", status: "locked", requirement: "Complete 10 science lessons",  progress: { current: 0, target: 10 } },
  // LEGENDARY
  { id: "robot-pet",             name: "Robot Companion",        rarity: "legendary", category: "pets",     cost: 150, icon: "\uD83E\uDD16", status: "locked", requirement: "Complete 20 lessons",  progress: { current: 0, target: 20 } },
  { id: "creative-crown",        name: "Creative Crown",         rarity: "legendary", category: "hats",     cost: 200, icon: "\uD83D\uDC51", status: "locked", requirement: "Complete 50 lessons",  progress: { current: 0, target: 50 } },
];

// ── Data: Achievements ──
const ACHIEVEMENTS = [
  { icon: "\uD83D\uDC9A", title: "EQ Champion",    desc: "Completed 5 EQ check-ins",  bg: C.mint },
  { icon: "\uD83D\uDCDD", title: "Lesson Master",  desc: "Completed 20 lessons",      bg: C.yellow },
  { icon: "\u2694\uFE0F",  title: "Quest Explorer", desc: "Completed 15 quests",       bg: "#FFF7ED" },
  { icon: "\uD83D\uDD25", title: "Streak Keeper",  desc: "7 day learning streak",     bg: "#FEF3C7" },
];

// ── Data: Activity ──
const ACTIVITIES = [
  { icon: "\u2705", title: "Completed a lesson",     detail: "\"Understanding Feelings\"", time: "2h ago" },
  { icon: "\uD83E\uDEE1", title: "Earned 25 Spark Coins", detail: "Daily quest reward",   time: "4h ago" },
  { icon: "\uD83D\uDC9A", title: "EQ Check-In",           detail: "Feeling happy and ready", time: "Yesterday" },
];

// ── Rarity Config ──
const RARITY_CFG: Record<Rarity, { color: string; bg: string; label: string }> = {
  common:    { color: "#22C55E", bg: "#DCFCE7", label: "Common" },
  rare:      { color: "#3B82F6", bg: "#DBEAFE", label: "Rare" },
  epic:      { color: "#7C3AED", bg: "#EDE9FE", label: "Epic" },
  legendary: { color: "#F59E0B", bg: "#FEF3C7", label: "Legendary" },
};

// ── Customization Tabs ──
const CUSTOM_TABS = [
  { id: "hair",         label: "Hair",         icon: "\uD83E\uDDB0" },
  { id: "face",         label: "Face",         icon: "\uD83D\uDE0A" },
  { id: "outfit",       label: "Outfit",       icon: "\uD83D\uDC55" },
  { id: "accessories",  label: "Accessories",  icon: "\uD83D\uDC5C" },
  { id: "pet",          label: "Pet",          icon: "\uD83D\uDC3E" },
  { id: "background",   label: "Background",   icon: "\uD83C\uDF1F" },
];

// ═══════════════════════════════════════════════════════════════════
// PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════
export default function StudentProfilePage() {
  const [activeTab, setActiveTab] = useState("hair");
  const [selectedHair, setSelectedHair] = useState("short-curls");
  const [selectedHairColor, setSelectedHairColor] = useState("black");
  const [selectedSkin, setSelectedSkin] = useState("medium-brown");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleRandomize = () => {
    const hair = HAIRSTYLES[Math.floor(Math.random() * HAIRSTYLES.length)];
    const color = HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)];
    const skin = SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)];
    setSelectedHair(hair.id);
    setSelectedHairColor(color.id);
    setSelectedSkin(skin.id);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F7FBF7", fontFamily: "'Nunito', system-ui, sans-serif" }}>

      {/* ═══ TOP BAR (mobile-only brand + logout) ═══ */}
      <div style={{ display: "none" }} className="profile-mobile-topbar" />

      <div style={{ display: "flex", position: "relative" }}>

        {/* ═══════════════════════════════════════════════════════
            LEFT SIDEBAR
            ═══════════════════════════════════════════════════════ */}
        <aside className="profile-sidebar" style={{
          width: 240,
          minWidth: 240,
          height: "100vh",
          position: "sticky",
          top: 0,
          background: C.white,
          borderRight: `1px solid ${C.border}`,
          display: "flex",
          flexDirection: "column",
          zIndex: 20,
          overflowY: "auto",
        }}>
          {/* Logo */}
          <div style={{ padding: "20px 20px 16px", borderBottom: `1px solid ${C.border}` }}>
            <Link href="/dashboard/student" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: C.teal, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: "1.125rem" }}>A</div>
              <span style={{ fontWeight: 800, fontSize: "1rem", color: C.teal, letterSpacing: "-0.02em" }}>Arizen School</span>
            </Link>
          </div>

          {/* Nav Items */}
          <div style={{ padding: "12px 12px 8px", flex: 1 }}>
            {NAV_ITEMS.map((item) => {
              const isActive = item.id === "profile";
              return (
                <Link key={item.id} href={item.href} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 12,
                  textDecoration: "none",
                  background: isActive ? C.teal : "transparent",
                  color: isActive ? "#fff" : C.dark,
                  fontWeight: isActive ? 700 : 500,
                  fontSize: "0.875rem",
                  marginBottom: 2,
                }}>
                  <span style={{ fontSize: "1rem", width: 20, textAlign: "center", opacity: isActive ? 1 : 0.7 }}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Invite Friends Card */}
          <div style={{ margin: "0 12px 12px", padding: "16px", borderRadius: 16, background: C.mint, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: "1.5rem", marginBottom: 6 }}>{"\uD83C\uDF81"}</div>
            <h4 style={{ fontSize: "0.875rem", fontWeight: 800, color: C.dark, margin: "0 0 4px 0" }}>Invite friends</h4>
            <p style={{ fontSize: "0.75rem", color: C.body, margin: "0 0 12px 0", lineHeight: 1.5 }}>Learn together and earn rewards!</p>
            <button style={{ width: "100%", padding: "8px", borderRadius: 10, background: C.teal, color: "#fff", border: "none", fontWeight: 700, fontSize: "0.8125rem", cursor: "pointer" }}>Invite Now</button>
          </div>

          {/* Help Card */}
          <div style={{ margin: "0 12px 16px", padding: "12px 16px", borderRadius: 16, background: C.cream, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: "1.25rem" }}>{"\uD83C\uDFA7"}</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: C.dark, margin: 0 }}>Need help?</p>
              <p style={{ fontSize: "0.6875rem", color: C.body, margin: 0 }}>Contact Support</p>
            </div>
          </div>
        </aside>

        {/* ═══════════════════════════════════════════════════════
            MAIN CONTENT
            ═══════════════════════════════════════════════════════ */}
        <main className="profile-main" style={{ flex: 1, minWidth: 0, padding: "24px 24px 32px", maxWidth: "100%" }}>

          {/* Header: Greeting + Stat Pills */}
          <div className="profile-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
            <div>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: C.dark, margin: "0 0 4px 0" }}>Good morning, Alex! {"\uD83D\uDC4B"}</h1>
              <p style={{ fontSize: "0.9375rem", color: C.body, margin: 0 }}>Ready to learn something amazing today?</p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <StatPill icon="\uD83D\uDD25" value="7" label="Streak" bg="#FEF3C7" color="#D97706" />
              <StatPill icon="\uD83E\uDEE1" value="450" label="Coins" bg="#FEF9C3" color="#B45309" />
              <div style={{ width: 40, height: 40, borderRadius: 12, background: C.white, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.125rem", position: "relative", cursor: "pointer" }}>
                {"\uD83D\uDD14"}
                <span style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: "50%", background: C.red }} />
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="profile-stats-row" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
            <StatCard icon="\uD83E\uDEE1" title="Spark Coins" value="450" note="Keep learning to earn more!" bg="#FFFDF7" borderColor="#FDE68A" />
            <StatCard icon="\uD83C\uDFC6" title="Avatar Level" value="7" note="680 / 1,000 XP" bg={C.mint} borderColor="#A7F3D0" progress={68} />
            <StatCard icon="\uD83C\uDFC5" title="Badges Earned" value="12" note="View all badges" bg="#FFF7ED" borderColor="#FED7AA" />
          </div>

          {/* ═══════════════════════════════════════════════════
              AVATAR CUSTOMIZATION SECTION
              ═══════════════════════════════════════════════════ */}
          <div className="profile-avatar-section" style={{ display: "flex", gap: 20, marginBottom: 24 }}>

            {/* Avatar Preview Card */}
            <div className="profile-avatar-preview" style={{
              width: "35%",
              minWidth: 220,
              borderRadius: 20,
              border: `1px solid ${C.border}`,
              background: C.white,
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, color: C.dark, margin: "0 0 4px 0", alignSelf: "flex-start" }}>Your Avatar</h3>
              <p style={{ fontSize: "0.75rem", color: C.body, margin: "0 0 16px 0", alignSelf: "flex-start" }}>This is how you look in the game!</p>

              {/* Avatar Visual */}
              <div style={{
                width: 140,
                height: 140,
                borderRadius: "50%",
                background: `radial-gradient(circle at 50% 40%, #D1FAE5, #A7F3D0)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "5rem",
                marginBottom: 16,
                position: "relative",
                border: "3px solid #A7F3D0",
              }}>
                {"\uD83E\uDDD2\uD83C\uDFFD"}
                {/* Sparkle decorations */}
                <span style={{ position: "absolute", top: 8, right: 12, fontSize: "0.875rem" }}>{"\u2728"}</span>
                <span style={{ position: "absolute", bottom: 12, left: 8, fontSize: "0.75rem" }}>{"\uD83C\uDF1F"}</span>
              </div>

              {/* Action Buttons */}
              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
                <button onClick={handleRandomize} style={{ width: "100%", padding: "10px", borderRadius: 12, border: `1px solid ${C.border}`, background: C.white, color: C.dark, fontWeight: 700, fontSize: "0.8125rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  {"\uD83C\uDFB2"} Randomize
                </button>
                <button onClick={handleSave} style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", background: saved ? "#22C55E" : C.teal, color: "#fff", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer", transition: "background 0.2s" }}>
                  {saved ? "Saved! \u2705" : "Save Avatar"}
                </button>
                <button style={{ width: "100%", padding: "6px", background: "none", border: "none", color: C.body, fontWeight: 600, fontSize: "0.75rem", cursor: "pointer" }}>
                  Reset to Default
                </button>
              </div>
            </div>

            {/* Customization Controls Card */}
            <div className="profile-customizer" style={{
              flex: 1,
              minWidth: 0,
              borderRadius: 20,
              border: `1px solid ${C.border}`,
              background: C.white,
              padding: "20px",
            }}>
              {/* Tabs */}
              <div className="profile-custom-tabs" style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: `1px solid ${C.border}`, paddingBottom: 12, overflowX: "auto" }}>
                {CUSTOM_TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 14px",
                      borderRadius: 10,
                      border: "none",
                      background: isActive ? C.mint : "transparent",
                      color: isActive ? C.tealDark : C.body,
                      fontWeight: isActive ? 700 : 500,
                      fontSize: "0.8125rem",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      borderBottom: isActive ? `2px solid ${C.teal}` : "2px solid transparent",
                    }}>
                      <span>{tab.icon}</span> {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Hair Content (default tab) */}
              {activeTab === "hair" && (
                <div>
                  <h4 style={{ fontSize: "0.9375rem", fontWeight: 800, color: C.dark, margin: "0 0 12px 0" }}>Choose a hairstyle</h4>
                  <div className="profile-hair-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 20 }}>
                    {HAIRSTYLES.map((hair) => {
                      const isSelected = selectedHair === hair.id;
                      return (
                        <button key={hair.id} onClick={() => setSelectedHair(hair.id)} style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 6,
                          padding: "12px 8px",
                          borderRadius: 14,
                          border: isSelected ? `2px solid ${C.teal}` : `1px solid ${C.border}`,
                          background: isSelected ? C.mint : C.white,
                          cursor: "pointer",
                          position: "relative",
                          transition: "all 0.15s",
                        }}>
                          {isSelected && (
                            <span style={{ position: "absolute", top: 4, right: 4, width: 18, height: 18, borderRadius: "50%", background: C.teal, color: "#fff", fontSize: "0.625rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>{"\u2713"}</span>
                          )}
                          <div style={{ width: 48, height: 48, borderRadius: "50%", background: isSelected ? "#A7F3D0" : "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.75rem" }}>
                            {hair.emoji}
                          </div>
                          <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: isSelected ? C.tealDark : C.body, textAlign: "center", lineHeight: 1.2 }}>{hair.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Hair Color */}
                  <h4 style={{ fontSize: "0.875rem", fontWeight: 800, color: C.dark, margin: "0 0 10px 0" }}>Hair Color</h4>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
                    {HAIR_COLORS.map((c) => {
                      const isSelected = selectedHairColor === c.id;
                      return (
                        <button key={c.id} onClick={() => setSelectedHairColor(c.id)} style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          background: c.hex,
                          border: isSelected ? `3px solid ${C.teal}` : "2px solid #E5E7EB",
                          cursor: "pointer",
                          position: "relative",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}>
                          {isSelected && <span style={{ color: "#fff", fontSize: "0.75rem", fontWeight: 800 }}>{"\u2713"}</span>}
                        </button>
                      );
                    })}
                  </div>

                  {/* Skin Tone */}
                  <h4 style={{ fontSize: "0.875rem", fontWeight: 800, color: C.dark, margin: "0 0 10px 0" }}>Skin Tone</h4>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                    {SKIN_TONES.map((t) => {
                      const isSelected = selectedSkin === t.id;
                      return (
                        <button key={t.id} onClick={() => setSelectedSkin(t.id)} style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          background: t.hex,
                          border: isSelected ? `3px solid ${C.teal}` : "2px solid #E5E7EB",
                          cursor: "pointer",
                          position: "relative",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}>
                          {isSelected && <span style={{ color: "#fff", fontSize: "0.75rem", fontWeight: 800, textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>{"\u2713"}</span>}
                        </button>
                      );
                    })}
                  </div>

                  {/* Tip Banner */}
                  <div style={{ padding: "12px 16px", borderRadius: 14, background: C.mint, display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: "1.25rem" }}>{"\uD83D\uDCA1"}</span>
                    <p style={{ fontSize: "0.8125rem", color: C.tealDark, fontWeight: 600, margin: 0, flex: 1 }}>Complete lessons and quests to unlock more awesome items!</p>
                    <span style={{ fontSize: "1.5rem" }}>{"\uD83C\uDF31"}</span>
                  </div>
                </div>
              )}

              {/* Other tabs placeholder */}
              {activeTab !== "hair" && (
                <div style={{ textAlign: "center", padding: "40px 20px" }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>
                    {CUSTOM_TABS.find(t => t.id === activeTab)?.icon}
                  </div>
                  <p style={{ fontSize: "0.875rem", color: C.body, fontWeight: 600 }}>More customization options coming soon!</p>
                  <p style={{ fontSize: "0.75rem", color: C.body, marginTop: 4 }}>Complete lessons to unlock new items.</p>
                </div>
              )}
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════
              BOTTOM: Achievements + Activity
              ═══════════════════════════════════════════════════ */}
          <div className="profile-bottom-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

            {/* Recent Achievements */}
            <div style={{ borderRadius: 20, border: `1px solid ${C.border}`, background: C.white, padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 800, color: C.dark, margin: 0 }}>Recent Achievements</h3>
                <Link href="/dashboard/student/badges" style={{ fontSize: "0.75rem", fontWeight: 700, color: C.teal, textDecoration: "none" }}>View All</Link>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {ACHIEVEMENTS.map((a) => (
                  <div key={a.title} style={{ padding: "12px", borderRadius: 14, background: a.bg, display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.125rem", flexShrink: 0 }}>{a.icon}</div>
                    <div>
                      <p style={{ fontSize: "0.75rem", fontWeight: 800, color: C.dark, margin: "0 0 2px 0" }}>{a.title}</p>
                      <p style={{ fontSize: "0.625rem", color: C.body, margin: 0 }}>{a.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div style={{ borderRadius: 20, border: `1px solid ${C.border}`, background: C.white, padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 800, color: C.dark, margin: 0 }}>Recent Activity</h3>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: C.teal, cursor: "pointer" }}>View All</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {ACTIVITIES.map((a, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: C.mint, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.875rem", flexShrink: 0 }}>{a.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: C.dark, margin: "0 0 2px 0" }}>{a.title}</p>
                      <p style={{ fontSize: "0.6875rem", color: C.body, margin: 0 }}>{a.detail}</p>
                    </div>
                    <span style={{ fontSize: "0.6875rem", color: C.body, flexShrink: 0 }}>{a.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* ═══════════════════════════════════════════════════════
            RIGHT SHOP PANEL
            ═══════════════════════════════════════════════════════ */}
        <aside className="profile-shop-panel" style={{
          width: 420,
          minWidth: 420,
          height: "100vh",
          position: "sticky",
          top: 0,
          background: C.white,
          borderLeft: `1px solid ${C.border}`,
          display: "flex",
          flexDirection: "column",
          zIndex: 20,
          overflowY: "auto",
        }}>
          {/* Shop Header */}
          <div style={{ padding: "20px 20px 12px", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: C.dark, margin: 0 }}>Shop</h2>
              <select style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: "0.75rem", fontWeight: 600, color: C.body, background: C.white, cursor: "pointer" }}>
                <option>All Items</option>
                <option>Common</option>
                <option>Rare</option>
                <option>Epic</option>
                <option>Legendary</option>
              </select>
            </div>
            <p style={{ fontSize: "0.75rem", color: C.body, margin: "0 0 10px 0" }}>Available ({SHOP_ITEMS.length})</p>

            {/* Rarity Legend */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {(Object.entries(RARITY_CFG) as [Rarity, typeof RARITY_CFG[Rarity]][]).map(([key, cfg]) => (
                <span key={key} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.6875rem", fontWeight: 700, color: cfg.color }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.color, display: "inline-block" }} />
                  {cfg.label}
                </span>
              ))}
            </div>
          </div>

          {/* Shop Grid */}
          <div style={{ flex: 1, padding: "12px 16px", overflowY: "auto" }}>
            <div className="profile-shop-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
              {SHOP_ITEMS.map((item) => {
                const rarity = RARITY_CFG[item.rarity];
                const isLocked = item.status === "locked";
                const isAvailable = item.status === "available";
                const canAfford = item.cost <= 450;

                return (
                  <div key={item.id} style={{
                    borderRadius: 14,
                    border: `1px solid ${isLocked ? C.border : rarity.color + "40"}`,
                    background: isLocked ? "#FAFAFA" : C.white,
                    padding: "12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    opacity: isLocked ? 0.85 : 1,
                    position: "relative",
                    overflow: "hidden",
                  }}>
                    {/* Rarity label */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.625rem", fontWeight: 800, color: rarity.color, textTransform: "uppercase", letterSpacing: "0.04em" }}>{rarity.label}</span>
                      {isLocked && <span style={{ fontSize: "0.75rem" }}>{"\uD83D\uDD12"}</span>}
                    </div>

                    {/* Item icon */}
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: isLocked ? "#F1F5F9" : rarity.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.5rem",
                      alignSelf: "center",
                    }}>
                      {item.icon}
                    </div>

                    {/* Item name */}
                    <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: C.dark, margin: 0, textAlign: "center" }}>{item.name}</p>

                    {/* Cost */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                      <span style={{ fontSize: "0.875rem" }}>{"\uD83E\uDEE1"}</span>
                      <span style={{ fontSize: "0.875rem", fontWeight: 800, color: canAfford ? C.gold : C.red }}>{item.cost}</span>
                    </div>

                    {/* Status / Requirement */}
                    {isLocked && item.requirement && (
                      <div>
                        <p style={{ fontSize: "0.625rem", color: C.body, margin: "0 0 4px 0", textAlign: "center" }}>{item.requirement}</p>
                        {item.progress && (
                          <>
                            <div style={{ height: 4, borderRadius: 2, background: "#F1F5F9", overflow: "hidden" }}>
                              <div style={{ height: "100%", width: (item.progress.current / item.progress.target * 100) + "%", borderRadius: 2, background: rarity.color }} />
                            </div>
                            <p style={{ fontSize: "0.625rem", fontWeight: 700, color: C.body, margin: "2px 0 0 0", textAlign: "center" }}>{item.progress.current}/{item.progress.target}</p>
                          </>
                        )}
                      </div>
                    )}

                    {/* Status Badge */}
                    {isAvailable && (
                      <div style={{
                        padding: "4px 8px",
                        borderRadius: 8,
                        background: canAfford ? C.mint : "#FEF3C7",
                        color: canAfford ? C.tealDark : "#92400E",
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        textAlign: "center",
                      }}>
                        {canAfford ? "Buy" : "Not enough coins"}
                      </div>
                    )}
                    {isLocked && (
                      <div style={{
                        padding: "4px 8px",
                        borderRadius: 8,
                        background: "#F1F5F9",
                        color: C.body,
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        textAlign: "center",
                      }}>
                        Locked
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Shop Footer */}
            <div style={{ padding: "12px 0", textAlign: "center", borderTop: `1px solid ${C.border}`, marginTop: 12 }}>
              <p style={{ fontSize: "0.75rem", color: C.body, fontWeight: 600, margin: 0 }}>New items and exclusives coming soon!</p>
            </div>
          </div>
        </aside>
      </div>

    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// SMALL COMPONENTS
// ═══════════════════════════════════════════════════════════════════

function StatPill({ icon, value, label, bg, color }: { icon: string; value: string; label: string; bg: string; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 12, background: bg, color, fontWeight: 700, fontSize: "0.8125rem", whiteSpace: "nowrap" }}>
      <span style={{ fontSize: "0.875rem" }}>{icon}</span>
      <span>{value}</span>
      <span style={{ fontWeight: 500, opacity: 0.8 }}>{label}</span>
    </div>
  );
}

function StatCard({ icon, title, value, note, bg, borderColor, progress }: {
  icon: string; title: string; value: string; note: string; bg: string; borderColor: string; progress?: number;
}) {
  return (
    <div style={{ padding: "16px", borderRadius: 16, border: `1px solid ${borderColor}`, background: bg }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: "1.25rem" }}>{icon}</span>
        <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: C.body }}>{title}</span>
      </div>
      <div style={{ fontSize: "1.75rem", fontWeight: 900, color: C.dark, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: "0.75rem", color: C.body, fontWeight: 600 }}>{note}</div>
      {progress !== undefined && (
        <div style={{ marginTop: 8, height: 6, borderRadius: 3, background: "#E5E7EB", overflow: "hidden" }}>
          <div style={{ height: "100%", width: progress + "%", borderRadius: 3, background: C.teal }} />
        </div>
      )}
    </div>
  );
}
