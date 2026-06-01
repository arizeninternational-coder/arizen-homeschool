"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { UserRound, Shuffle, RotateCcw, Save, Check } from "lucide-react";

const C = { page: "#F7FBF7", teal: "#047A70", dark: "#0F172A", body: "#64748B", white: "#FFFFFF", border: "#E2E8F0" };

const TABS = [
  { id: "hair", label: "Hair" },
  { id: "face", label: "Face" },
  { id: "outfit", label: "Outfit" },
  { id: "shoes", label: "Shoes" },
  { id: "pet", label: "Pet" },
  { id: "bg", label: "Background" },
];

const HAIRSTYLES = [
  { id: "short-curls", name: "Short Curls" }, { id: "afro", name: "Rounded Afro" },
  { id: "hightop-fade", name: "High-Top Fade" }, { id: "cornrows", name: "Cornrows" },
  { id: "twists", name: "Twists" }, { id: "locs", name: "Locs" },
  { id: "braids", name: "Braids" }, { id: "puff-buns", name: "Puff Buns" },
  { id: "coily-short", name: "Coily Short" }, { id: "side-fade", name: "Side Fade+Curls" },
];

const SKIN_TONES = [
  { id: "deep-brown", hex: "#4A2C17" }, { id: "dark-brown", hex: "#6B3A2A" },
  { id: "medium-brown", hex: "#8B5E3C" }, { id: "warm-brown", hex: "#A0724A" },
  { id: "golden-brown", hex: "#C49A6C" }, { id: "light-brown", hex: "#D4A574" },
];

const HAIR_COLORS = [
  { id: "black", hex: "#1a1a1a" }, { id: "dark-brown", hex: "#3B2314" },
  { id: "medium-brown", hex: "#6B3A2A" }, { id: "warm-brown", hex: "#8B5E3C" },
  { id: "teal", hex: "#047A70" },
];

export default function AvatarPage() {
  const [activeTab, setActiveTab] = useState("hair");
  const [hair, setHair] = useState("short-curls");
  const [hairColor, setHairColor] = useState("black");
  const [skin, setSkin] = useState("medium-brown");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load current avatar from API
  useEffect(() => {
    async function loadAvatar() {
      try {
        const res = await fetch("/api/avatar", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data.avatar) {
            setHair(data.avatar.hairStyle || "short-curls");
            setHairColor(data.avatar.hairColor || "black");
            setSkin(data.avatar.skinTone || "medium-brown");
          }
        }
      } catch (e) {
        console.error("[AVATAR] Load error:", e);
      }
      setLoading(false);
    }
    loadAvatar();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ hairStyle: hair, hairColor, skinTone: skin }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        const data = await res.json().catch(() => ({}));
        console.error("[AVATAR] Save failed:", data.error);
      }
    } catch (e) {
      console.error("[AVATAR] Save error:", e);
    }
    setSaving(false);
  };

  const handleRandomize = () => {
    setHair(HAIRSTYLES[Math.floor(Math.random() * HAIRSTYLES.length)].id);
    setHairColor(HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)].id);
    setSkin(SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)].id);
  };

  const currentSkinHex = SKIN_TONES.find(t => t.id === skin)?.hex || "#8B5E3C";
  const currentHairColorHex = HAIR_COLORS.find(c => c.id === hairColor)?.hex || "#1a1a1a";

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <p style={{ color: C.body, fontWeight: 600 }}>Loading avatar...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: C.dark, margin: "0 0 0.5rem 0" }}>
        <UserRound size={22} style={{ display: "inline", verticalAlign: "middle", marginRight: 8 }} /> Customize Avatar
      </h1>
      <p style={{ color: C.body, fontSize: "0.875rem", margin: "0 0 24px 0" }}>Personalize your learning identity.</p>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 24 }}>
        {/* Preview */}
        <div style={{ background: C.white, borderRadius: 20, border: "1px solid " + C.border, padding: "24px", textAlign: "center", position: "sticky", top: 80, height: "fit-content" }}>
          {/* Full body avatar preview */}
          <div style={{
            width: 180, height: 220, borderRadius: 20, margin: "0 auto 16px",
            background: "linear-gradient(180deg, #E6F5F1 0%, #D1FAE5 100%)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end",
            paddingBottom: 16, border: "2px solid #A7F3D0", overflow: "hidden", position: "relative",
          }}>
            {/* Background */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 80,
              background: "linear-gradient(180deg, #87CEEB 0%, #B0E0B0 100%)",
            }} />
            {/* Ground */}
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0, height: 40,
              background: "linear-gradient(180deg, #8FBC8F 0%, #6B8E23 100%)",
            }} />
            {/* Head */}
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: currentSkinHex,
              border: "3px solid rgba(255,255,255,0.3)",
              zIndex: 1, marginBottom: 2,
              position: "relative",
            }}>
              {/* Hair */}
              <div style={{
                position: "absolute", top: -8, left: -6, right: -6, height: 36,
                background: currentHairColorHex,
                borderRadius: "50% 50% 30% 30%",
                zIndex: 2,
              }} />
              {/* Face */}
              <div style={{ position: "absolute", top: 22, left: 14, width: 6, height: 6, borderRadius: "50%", background: "#333" }} />
              <div style={{ position: "absolute", top: 22, right: 14, width: 6, height: 6, borderRadius: "50%", background: "#333" }} />
              <div style={{ position: "absolute", top: 34, left: "50%", transform: "translateX(-50%)", width: 12, height: 4, borderRadius: 2, background: "#E57373" }} />
            </div>
            {/* Body */}
            <div style={{
              width: 60, height: 70, borderRadius: "20px 20px 10px 10px",
              background: "#4FC3F7", zIndex: 1, marginBottom: 8,
              border: "2px solid rgba(255,255,255,0.2)",
            }} />
            {/* Legs */}
            <div style={{ display: "flex", gap: 4, zIndex: 1 }}>
              <div style={{ width: 20, height: 30, borderRadius: 6, background: "#37474F" }} />
              <div style={{ width: 20, height: 30, borderRadius: 6, background: "#37474F" }} />
            </div>
          </div>
          <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: C.dark, marginBottom: 12 }}>
            {HAIRSTYLES.find(h => h.id === hair)?.name || "Custom"} · {SKIN_TONES.find(t => t.id === skin)?.id.replace("-", " ") || "medium brown"}
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <button onClick={handleRandomize} style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 14px", borderRadius: 10, border: "1px solid " + C.border, background: "#F8FAFC", color: C.dark, fontWeight: 700, fontSize: "0.75rem", cursor: "pointer" }}>
              <Shuffle size={12} /> Randomize
            </button>
            <button onClick={() => { setHair("short-curls"); setHairColor("black"); setSkin("medium-brown"); }} style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 14px", borderRadius: 10, border: "1px solid " + C.border, background: "#F8FAFC", color: C.dark, fontWeight: 700, fontSize: "0.75rem", cursor: "pointer" }}>
              <RotateCcw size={12} /> Reset
            </button>
          </div>
        </div>

        {/* Controls */}
        <div style={{ background: C.white, borderRadius: 20, border: "1px solid " + C.border, padding: "24px" }}>
          <div style={{ display: "flex", gap: 2, marginBottom: 20, borderBottom: "1px solid " + C.border, paddingBottom: 10, overflowX: "auto" }}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                padding: "8px 16px", borderRadius: 8, border: "none",
                background: activeTab === tab.id ? "#E6F5F1" : "transparent",
                color: activeTab === tab.id ? C.teal : C.body,
                fontWeight: activeTab === tab.id ? 700 : 500, fontSize: "0.8125rem",
                cursor: "pointer", whiteSpace: "nowrap",
              }}>{tab.label}</button>
            ))}
          </div>

          {activeTab === "hair" && (
            <div>
              <h4 style={{ fontSize: "0.875rem", fontWeight: 800, color: C.dark, margin: "0 0 12px 0" }}>Hairstyle</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 20 }}>
                {HAIRSTYLES.map(h => {
                  const isSel = hair === h.id;
                  return (
                    <button key={h.id} onClick={() => setHair(h.id)} style={{
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                      padding: "10px 6px", borderRadius: 12,
                      border: isSel ? "2px solid " + C.teal : "1px solid " + C.border,
                      background: isSel ? "#E6F5F1" : C.white, cursor: "pointer", position: "relative",
                    }}>
                      {isSel && <span style={{ position: "absolute", top: 2, right: 2, width: 16, height: 16, borderRadius: "50%", background: C.teal, color: "#fff", fontSize: "0.5625rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, zIndex: 1 }}>✓</span>}
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: isSel ? "#A7F3D0" : "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem" }}>🧑🏽</div>
                      <span style={{ fontSize: "0.625rem", fontWeight: 700, color: isSel ? C.teal : C.body, textAlign: "center" }}>{h.name}</span>
                    </button>
                  );
                })}
              </div>
              <h4 style={{ fontSize: "0.8125rem", fontWeight: 800, color: C.dark, margin: "0 0 8px 0" }}>Hair Color</h4>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
                {HAIR_COLORS.map(c => {
                  const isSel = hairColor === c.id;
                  return <button key={c.id} onClick={() => setHairColor(c.id)} style={{ width: 32, height: 32, borderRadius: "50%", background: c.hex, border: isSel ? "3px solid " + C.teal : "2px solid #E5E7EB", cursor: "pointer", position: "relative" }}>{isSel && <span style={{ color: "#fff", fontSize: "0.625rem", fontWeight: 800 }}>✓</span>}</button>;
                })}
              </div>
              <h4 style={{ fontSize: "0.8125rem", fontWeight: 800, color: C.dark, margin: "0 0 8px 0" }}>Skin Tone</h4>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {SKIN_TONES.map(t => {
                  const isSel = skin === t.id;
                  return <button key={t.id} onClick={() => setSkin(t.id)} style={{ width: 36, height: 36, borderRadius: "50%", background: t.hex, border: isSel ? "3px solid " + C.teal : "2px solid #E5E7EB", cursor: "pointer", position: "relative" }}>{isSel && <span style={{ color: "#fff", fontSize: "0.625rem", fontWeight: 800, textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>✓</span>}</button>;
                })}
              </div>
            </div>
          )}

          {activeTab !== "hair" && (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>{TABS.find(t => t.id === activeTab)?.label === "Face" ? "😊" : TABS.find(t => t.id === activeTab)?.label === "Outfit" ? "👕" : TABS.find(t => t.id === activeTab)?.label === "Shoes" ? "👟" : TABS.find(t => t.id === activeTab)?.label === "Pet" ? "🐾" : "🖼️"}</div>
              <p style={{ fontSize: "0.875rem", color: C.body, fontWeight: 600 }}>More {activeTab} options coming soon!</p>
              <p style={{ fontSize: "0.75rem", color: C.body, marginTop: 4 }}>Complete lessons to unlock new items.</p>
            </div>
          )}

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid " + C.border }}>
            <button onClick={handleSave} disabled={saving} style={{
              width: "100%", padding: "12px", borderRadius: 12, border: "none",
              background: saved ? "#22C55E" : C.teal, color: "#fff",
              fontWeight: 700, fontSize: "0.875rem", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}>
              {saving ? "Saving..." : saved ? <><Check size={16} /> Saved!</> : <><Save size={16} /> Save Avatar</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
