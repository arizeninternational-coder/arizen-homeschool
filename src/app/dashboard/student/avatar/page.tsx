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
  { id: "accessories", label: "Items" },
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

// Frontend-only visual colors (NOT persisted to DB — outfitColor/shoeColor don't exist on StudentAvatar)
const OUTFIT_COLORS = [
  { id: "blue", hex: "#4FC3F7" }, { id: "red", hex: "#EF5350" },
  { id: "green", hex: "#66BB6A" }, { id: "purple", hex: "#AB47BC" },
  { id: "orange", hex: "#FFA726" }, { id: "pink", hex: "#F06292" },
  { id: "teal", hex: "#26C6DA" }, { id: "yellow", hex: "#FFEE58" },
];

const SHOE_COLORS = [
  { id: "black", hex: "#37474F" }, { id: "white", hex: "#ECEFF1" },
  { id: "red", hex: "#C62828" }, { id: "blue", hex: "#1565C0" },
  { id: "brown", hex: "#6D4C41" }, { id: "pink", hex: "#E91E63" },
];

export default function AvatarPage() {
  const [activeTab, setActiveTab] = useState("hair");
  const [hair, setHair] = useState("short-curls");
  const [hairColor, setHairColor] = useState("black");
  const [skin, setSkin] = useState("medium-brown");
  const [outfitColor, setOutfitColor] = useState("blue"); // frontend-only, not persisted
  const [shoeColor, setShoeColor] = useState("black");     // frontend-only, not persisted
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

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
            // outfitColor and shoeColor are NOT loaded from DB — they don't exist on StudentAvatar
            // They reset to defaults on each page load
          }
        }
      } catch (e) { console.error("[AVATAR] Load error:", e); }
      setLoading(false);
    }
    loadAvatar();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Only send fields that exist on the StudentAvatar model.
      // outfitColor and shoeColor are intentionally excluded.
      const res = await fetch("/api/avatar", {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ hairStyle: hair, hairColor, skinTone: skin }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (e) { console.error("[AVATAR] Save error:", e); }
    setSaving(false);
  };

  const handleRandomize = () => {
    setHair(HAIRSTYLES[Math.floor(Math.random() * HAIRSTYLES.length)].id);
    setHairColor(HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)].id);
    setSkin(SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)].id);
    setOutfitColor(OUTFIT_COLORS[Math.floor(Math.random() * OUTFIT_COLORS.length)].id);
    setShoeColor(SHOE_COLORS[Math.floor(Math.random() * SHOE_COLORS.length)].id);
  };

  const currentSkinHex = SKIN_TONES.find(t => t.id === skin)?.hex || "#8B5E3C";
  const currentHairColorHex = HAIR_COLORS.find(c => c.id === hairColor)?.hex || "#1a1a1a";
  const currentOutfitHex = OUTFIT_COLORS.find(c => c.id === outfitColor)?.hex || "#4FC3F7";
  const currentShoeHex = SHOE_COLORS.find(c => c.id === shoeColor)?.hex || "#37474F";

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

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 24 }}>
        {/* Preview */}
        <div style={{ background: C.white, borderRadius: 20, border: "1px solid " + C.border, padding: "24px", textAlign: "center", position: "sticky", top: 80, height: "fit-content" }}>
          {/* Full-body SVG avatar */}
          <svg viewBox="0 0 120 180" width="160" height="220" style={{ margin: "0 auto 16px" }}>
            {/* Background circle */}
            <rect x="10" y="10" width="100" height="160" rx="16" fill="#E6F5F1" stroke="#A7F3D0" strokeWidth="2" />

            {/* Legs */}
            <rect x="38" y="118" width="16" height="40" rx="6" fill="#37474F" />
            <rect x="66" y="118" width="16" height="40" rx="6" fill="#37474F" />

            {/* Shoes */}
            <ellipse cx="46" cy="162" rx="12" ry="6" fill={currentShoeHex} />
            <ellipse cx="74" cy="162" rx="12" ry="6" fill={currentShoeHex} />

            {/* Body / Torso */}
            <rect x="32" y="72" width="56" height="50" rx="12" fill={currentOutfitHex} />
            {/* Collar */}
            <ellipse cx="60" cy="74" rx="10" ry="4" fill={currentSkinHex} />

            {/* Arms */}
            <rect x="18" y="76" width="14" height="36" rx="7" fill={currentOutfitHex} />
            <rect x="88" y="76" width="14" height="36" rx="7" fill={currentOutfitHex} />
            {/* Hands */}
            <circle cx="25" cy="114" r="6" fill={currentSkinHex} />
            <circle cx="95" cy="114" r="6" fill={currentSkinHex} />

            {/* Neck */}
            <rect x="52" y="60" width="16" height="14" rx="4" fill={currentSkinHex} />

            {/* Head */}
            <ellipse cx="60" cy="42" rx="24" ry="26" fill={currentSkinHex} />

            {/* Hair (varies by style) */}
            {hair === "afro" && (
              <ellipse cx="60" cy="28" rx="30" ry="22" fill={currentHairColorHex} />
            )}
            {hair === "short-curls" && (
              <>
                <ellipse cx="60" cy="30" rx="26" ry="18" fill={currentHairColorHex} />
                <circle cx="40" cy="24" r="4" fill={currentHairColorHex} />
                <circle cx="80" cy="24" r="4" fill={currentHairColorHex} />
                <circle cx="50" cy="18" r="3" fill={currentHairColorHex} />
                <circle cx="70" cy="18" r="3" fill={currentHairColorHex} />
              </>
            )}
            {hair === "hightop-fade" && (
              <>
                <rect x="42" y="14" width="36" height="20" rx="8" fill={currentHairColorHex} />
                <rect x="46" y="10" width="28" height="12" rx="6" fill={currentHairColorHex} />
              </>
            )}
            {hair === "cornrows" && (
              <>
                <ellipse cx="60" cy="30" rx="26" ry="16" fill={currentHairColorHex} />
                {[38, 46, 54, 62, 70, 78].map((x, i) => (
                  <rect key={i} x={x - 2} y="14" width="4" height="20" rx="2" fill={currentHairColorHex} />
                ))}
              </>
            )}
            {hair === "braids" && (
              <>
                <ellipse cx="60" cy="30" rx="26" ry="16" fill={currentHairColorHex} />
                <rect x="30" y="28" width="6" height="30" rx="3" fill={currentHairColorHex} />
                <rect x="84" y="28" width="6" height="30" rx="3" fill={currentHairColorHex} />
              </>
            )}
            {hair === "twists" && (
              <>
                <ellipse cx="60" cy="30" rx="26" ry="16" fill={currentHairColorHex} />
                <rect x="34" y="26" width="5" height="22" rx="2.5" fill={currentHairColorHex} />
                <rect x="81" y="26" width="5" height="22" rx="2.5" fill={currentHairColorHex} />
              </>
            )}
            {hair === "locs" && (
              <>
                <ellipse cx="60" cy="28" rx="24" ry="14" fill={currentHairColorHex} />
                {[40, 48, 56, 64, 72, 80].map((x, i) => (
                  <rect key={i} x={x - 2} y="18" width="4" height="26" rx="2" fill={currentHairColorHex} />
                ))}
              </>
            )}
            {hair === "puff-buns" && (
              <>
                <ellipse cx="60" cy="32" rx="26" ry="16" fill={currentHairColorHex} />
                <circle cx="36" cy="20" r="10" fill={currentHairColorHex} />
                <circle cx="84" cy="20" r="10" fill={currentHairColorHex} />
              </>
            )}
            {hair === "coily-short" && (
              <ellipse cx="60" cy="28" rx="25" ry="15" fill={currentHairColorHex} />
            )}
            {hair === "side-fade" && (
              <>
                <ellipse cx="62" cy="32" rx="24" ry="16" fill={currentHairColorHex} opacity="0.85" />
                <ellipse cx="60" cy="26" rx="18" ry="10" fill={currentHairColorHex} />
              </>
            )}
            {!["afro", "short-curls", "hightop-fade", "cornrows", "braids", "twists", "locs", "puff-buns", "coily-short", "side-fade"].includes(hair) && (
              <ellipse cx="60" cy="30" rx="26" ry="16" fill={currentHairColorHex} />
            )}

            {/* Face */}
            {/* Eyes */}
            <ellipse cx="50" cy="40" rx="4" ry="4.5" fill="white" />
            <ellipse cx="70" cy="40" rx="4" ry="4.5" fill="white" />
            <circle cx="51" cy="40" r="2.5" fill="#333" />
            <circle cx="71" cy="40" r="2.5" fill="#333" />
            <circle cx="52" cy="39" r="1" fill="white" />
            <circle cx="72" cy="39" r="1" fill="white" />

            {/* Eyebrows */}
            <path d="M45 35 Q50 33 55 35" stroke={currentHairColorHex} strokeWidth="1.5" fill="none" />
            <path d="M65 35 Q70 33 75 35" stroke={currentHairColorHex} strokeWidth="1.5" fill="none" />

            {/* Nose */}
            <ellipse cx="60" cy="47" rx="3" ry="2" fill={currentSkinHex} opacity="0.6" />

            {/* Mouth - smile */}
            <path d="M52 54 Q60 60 68 54" stroke="#E57373" strokeWidth="2" fill="none" strokeLinecap="round" />

            {/* Cheeks */}
            <circle cx="44" cy="48" r="4" fill="#FFCDD2" opacity="0.3" />
            <circle cx="76" cy="48" r="4" fill="#FFCDD2" opacity="0.3" />

            {/* Backpack */}
            <rect x="88" y="78" width="18" height="28" rx="4" fill="#78909C" />
            <rect x="90" y="82" width="14" height="8" rx="2" fill="#90A4AE" />
          </svg>

          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <button onClick={handleRandomize} style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 14px", borderRadius: 10, border: "1px solid " + C.border, background: "#F8FAFC", color: C.dark, fontWeight: 700, fontSize: "0.75rem", cursor: "pointer" }}>
              <Shuffle size={12} /> Randomize
            </button>
            <button onClick={() => { setHair("short-curls"); setHairColor("black"); setSkin("medium-brown"); setOutfitColor("blue"); setShoeColor("black"); }} style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 14px", borderRadius: 10, border: "1px solid " + C.border, background: "#F8FAFC", color: C.dark, fontWeight: 700, fontSize: "0.75rem", cursor: "pointer" }}>
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "0 0 12px 0" }}>
                <h4 style={{ fontSize: "0.875rem", fontWeight: 800, color: C.dark, margin: 0 }}>Hairstyle</h4>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 20 }}>
                {HAIRSTYLES.map(h => {
                  const isSel = hair === h.id;
                  const borderStyle = isSel ? "2px solid #047A70" : "1px solid #E2E8F0";
                  const bgStyle = isSel ? "#E6F5F1" : "#FFFFFF";
                  const checkBg = "#047A70";
                  const divBg = isSel ? "#A7F3D0" : "#F1F5F9";
                  const textColor = isSel ? "#047A70" : "#64748B";
                  return (
                    <button key={h.id} onClick={() => setHair(h.id)} style={{
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                      padding: "10px 6px", borderRadius: 12,
                      border: borderStyle, background: bgStyle, cursor: "pointer", position: "relative",
                    }}>
                      {isSel && <span style={{ position: "absolute", top: 2, right: 2, width: 16, height: 16, borderRadius: "50%", background: checkBg, color: "#fff", fontSize: "0.5625rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>✓</span>}
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: divBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem" }}>🧑🏽</div>
                      <span style={{ fontSize: "0.625rem", fontWeight: 700, color: textColor, textAlign: "center" }}>{h.name}</span>
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

          {activeTab === "outfit" && (
            <div>
              <h4 style={{ fontSize: "0.875rem", fontWeight: 800, color: C.dark, margin: "0 0 4px 0" }}>Outfit Color</h4>
              <p style={{ fontSize: "0.75rem", color: "#94A3B8", margin: "0 0 12px 0" }}>Preview only — saved with hair, color & skin.</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                {OUTFIT_COLORS.map(c => {
                  const isSel = outfitColor === c.id;
                  return (
                    <button key={c.id} onClick={() => setOutfitColor(c.id)} style={{
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                      padding: "12px", borderRadius: 12,
                      border: isSel ? "2px solid " + C.teal : "1px solid " + C.border,
                      background: isSel ? "#E6F5F1" : C.white, cursor: "pointer",
                    }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: c.hex, border: "2px solid rgba(0,0,0,0.1)" }} />
                      <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: isSel ? C.teal : C.body }}>{c.id}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "shoes" && (
            <div>
              <h4 style={{ fontSize: "0.875rem", fontWeight: 800, color: C.dark, margin: "0 0 4px 0" }}>Shoe Color</h4>
              <p style={{ fontSize: "0.75rem", color: "#94A3B8", margin: "0 0 12px 0" }}>Preview only — saved with hair, color & skin.</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                {SHOE_COLORS.map(c => {
                  const isSel = shoeColor === c.id;
                  return (
                    <button key={c.id} onClick={() => setShoeColor(c.id)} style={{
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                      padding: "12px", borderRadius: 12,
                      border: isSel ? "2px solid " + C.teal : "1px solid " + C.border,
                      background: isSel ? "#E6F5F1" : C.white, cursor: "pointer",
                    }}>
                      <div style={{ width: 40, height: 24, borderRadius: 6, background: c.hex, border: "2px solid rgba(0,0,0,0.1)" }} />
                      <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: isSel ? C.teal : C.body }}>{c.id}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {(activeTab === "face" || activeTab === "accessories") && (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>{activeTab === "face" ? "😊" : "🎒"}</div>
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
