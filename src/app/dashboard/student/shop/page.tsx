"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Coins, Trophy, Lock, ShoppingBag, Star,
  Filter, Search
} from "lucide-react";

const C = {
  page: "#F7FBF7", teal: "#047A70", dark: "#0F172A",
  body: "#64748B", white: "#FFFFFF", border: "#E2E8F0",
};

const RARITY = {
  common:    { color: "#22C55E", bg: "#DCFCE7", label: "Common" },
  rare:      { color: "#3B82F6", bg: "#DBEAFE", label: "Rare" },
  epic:      { color: "#7C3AED", bg: "#EDE9FE", label: "Epic" },
  legendary: { color: "#F59E0B", bg: "#FEF3C7", label: "Legendary" },
};

const ITEMS = [
  { id: "soccer-boots",       name: "Soccer Boots",           rarity: "common",    category: "shoes",       cost: 30,  icon: "⚽", req: null },
  { id: "safari-hat",         name: "Safari Explorer Hat",    rarity: "common",    category: "hats",        cost: 35,  icon: "🧢", req: null },
  { id: "artist-brush",       name: "Artist Brush",           rarity: "common",    category: "accessories", cost: 40,  icon: "🖌️", req: null },
  { id: "kindness-hoodie",    name: "Kindness Hoodie",        rarity: "common",    category: "clothing",    cost: 45,  icon: "👕", req: null },
  { id: "reading-glasses",    name: "Reading Champion Glasses",rarity: "common",   category: "accessories", cost: 45,  icon: "👓", req: "Complete 3 reading lessons" },
  { id: "math-wizard-hat",    name: "Math Wizard Hat",        rarity: "rare",      category: "hats",        cost: 50,  icon: "🎓", req: "Complete 5 math lessons" },
  { id: "star-backpack",      name: "Star Backpack",          rarity: "rare",      category: "accessories", cost: 50,  icon: "🎒", req: "Complete 5 quests" },
  { id: "music-headphones",   name: "Music Maker Headphones", rarity: "rare",      category: "accessories", cost: 55,  icon: "🎧", req: "Complete 5 creative arts lessons" },
  { id: "nature-backpack",    name: "Nature Guardian Backpack",rarity: "rare",      category: "accessories", cost: 55,  icon: "🌿", req: "Complete 3 environmental lessons" },
  { id: "scientist-goggles",  name: "Scientist Goggles",      rarity: "rare",      category: "accessories", cost: 60,  icon: "🥽", req: "Complete 3 science lessons" },
  { id: "globe-explorer",     name: "Globe Explorer Tool",    rarity: "rare",      category: "tools",       cost: 65,  icon: "🌍", req: "Complete 5 geography lessons" },
  { id: "library-bg",         name: "Library Background",     rarity: "rare",      category: "backgrounds", cost: 80,  icon: "📚", req: "Complete 10 reading lessons" },
  { id: "forest-bg",          name: "Forest Background",      rarity: "rare",      category: "backgrounds", cost: 80,  icon: "🌲", req: "Complete 5 environmental lessons" },
  { id: "explorer-telescope", name: "Explorer Telescope",     rarity: "rare",      category: "tools",       cost: 80,  icon: "🔭", req: "Complete 3 science lessons" },
  { id: "rabbit-pet",         name: "Rabbit Companion",       rarity: "rare",      category: "pets",        cost: 90,  icon: "🐰", req: "Complete 10 lessons" },
  { id: "storyteller-cape",   name: "Storyteller Cape",       rarity: "epic",      category: "clothing",    cost: 70,  icon: "📖", req: "Complete 5 reading lessons" },
  { id: "space-bg",           name: "Space Background",       rarity: "epic",      category: "backgrounds", cost: 100, icon: "🌌", req: "Earn 500 XP" },
  { id: "science-lab-bg",     name: "Science Lab Background", rarity: "epic",      category: "backgrounds", cost: 120, icon: "🔬", req: "Complete 10 science lessons" },
  { id: "robot-pet",          name: "Robot Companion",        rarity: "legendary", category: "pets",        cost: 150, icon: "🤖", req: "Complete 20 lessons" },
  { id: "creative-crown",     name: "Creative Crown",         rarity: "legendary", category: "hats",        cost: 200, icon: "👑", req: "Complete 50 lessons" },
];

const CATEGORIES = ["all", "hats", "clothing", "accessories", "shoes", "tools", "pets", "backgrounds"];

export default function ShopPage() {
  const [coins, setCoins] = useState(0);
  const [category, setCategory] = useState("all");
  const [filter, setFilter] = useState("all");
  const [inventory, setInventory] = useState([]);
  const [buying, setBuying] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetch("/api/coins/wallet", { credentials: "include" }).then(r => r.json()).then(d => setCoins(d.wallet?.balance || d.balance || 0)).catch(() => {});
    fetch("/api/shop/inventory", { credentials: "include" }).then(r => r.json()).then(d => setInventory(d.inventory || [])).catch(() => {});
  }, []);

  const ownedIds = inventory.map(i => i.avatarItem?.id || i.avatar_item?.id).filter(Boolean);
  const filtered = ITEMS.filter(item => {
    if (category !== "all" && item.category !== category) return false;
    if (filter === "owned" && !ownedIds.includes(item.id)) return false;
    if (filter === "locked" && (!item.req || ownedIds.includes(item.id))) return false;
    if (filter === "available" && (item.req || ownedIds.includes(item.id))) return false;
    return true;
  });

  const handleBuy = async (item) => {
    if (ownedIds.includes(item.id)) return;
    if (coins < item.cost) { setMessage({ type: "error", text: "Not enough coins!" }); return; }
    if (item.req) { setMessage({ type: "error", text: item.req }); return; }
    setBuying(item.id);
    try {
      const res = await fetch("/api/shop/buy", {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify({ itemId: item.id }),
      });
      const data = await res.json();
      if (data.success) {
        setCoins(prev => prev - item.cost);
        setInventory(prev => prev.concat({ avatarItem: item, equipped: false }));
        setMessage({ type: "success", text: `Purchased ${item.name}!` });
      } else {
        setMessage({ type: "error", text: data.error || "Purchase failed." });
      }
    } catch { setMessage({ type: "error", text: "Purchase failed." }); }
    setBuying(null);
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: C.dark, margin: "0 0 2px 0" }}><ShoppingBag size={24} style={{ display: "inline", verticalAlign: "middle", marginRight: 8 }} /> Avatar Shop</h1>
          <p style={{ color: C.body, fontSize: "0.875rem", margin: 0 }}>Use Spark Coins to unlock outfits, tools, pets, and accessories.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 12, background: "#FFFBEB", border: "1px solid #FDE68A" }}>
          <Coins size={18} style={{ color: "#D97706" }} />
          <span style={{ fontWeight: 800, color: "#92400E", fontSize: "1rem" }}>{coins}</span>
        </div>
      </div>

      {message && (
        <div style={{
          padding: "12px 16px", borderRadius: 12, marginBottom: 16,
          background: message.type === "success" ? "#ECFDF5" : "#FEF2F2",
          border: `1px solid ${message.type === "success" ? "#A7F3D0" : "#FECACA"}`,
          color: message.type === "success" ? "#065F46" : "#991B1B",
          fontSize: "0.875rem", fontWeight: 600,
        }}>{message.text}</div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 4, flex: "1 1 auto", overflowX: "auto" }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} style={{
              padding: "6px 12px", borderRadius: 8, border: "1px solid " + (category === cat ? C.teal : C.border),
              background: category === cat ? C.teal : C.white, color: category === cat ? "#fff" : C.body,
              fontWeight: 700, fontSize: "0.75rem", cursor: "pointer", whiteSpace: "nowrap", textTransform: "capitalize",
            }}>{cat}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {["all", "available", "locked", "owned"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "6px 12px", borderRadius: 8, border: "1px solid " + (filter === f ? C.teal : C.border),
              background: filter === f ? C.teal : C.white, color: filter === f ? "#fff" : C.body,
              fontWeight: 700, fontSize: "0.75rem", cursor: "pointer", whiteSpace: "nowrap", textTransform: "capitalize",
            }}>{f}</button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
        {filtered.map(item => {
          const r = RARITY[item.rarity];
          const owned = ownedIds.includes(item.id);
          const locked = !!item.req;
          const canBuy = !owned && !locked && coins >= item.cost;

          return (
            <div key={item.id} style={{
              borderRadius: 16, border: `1px solid ${owned ? "#A7F3D0" : locked ? C.border : r.color + "40"}`,
              background: owned ? "#ECFDF5" : locked ? "#FAFAFA" : C.white,
              padding: 16, display: "flex", flexDirection: "column", gap: 8, opacity: locked ? 0.85 : 1,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.625rem", fontWeight: 800, color: r.color, textTransform: "uppercase", letterSpacing: "0.04em" }}>{r.label}</span>
                {owned && <span style={{ fontSize: "0.625rem", fontWeight: 700, color: "#059669" }}>✓ Owned</span>}
                {locked && <Lock size={12} style={{ color: C.muted }} />}
              </div>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: locked ? "#F1F5F9" : r.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", alignSelf: "center" }}>{item.icon}</div>
              <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: C.dark, margin: 0, textAlign: "center" }}>{item.name}</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                <Coins size={14} style={{ color: "#D97706" }} />
                <span style={{ fontSize: "0.875rem", fontWeight: 800, color: coins >= item.cost ? "#92400E" : "#EF4444" }}>{item.cost}</span>
              </div>
              {locked && item.req && <p style={{ fontSize: "0.625rem", color: C.body, margin: 0, textAlign: "center" }}>{item.req}</p>}
              {owned ? (
                <button style={{ width: "100%", padding: "8px", borderRadius: 10, border: "1px solid #A7F3D0", background: "#ECFDF5", color: "#059669", fontWeight: 700, fontSize: "0.75rem", cursor: "default" }}>Owned</button>
              ) : locked ? (
                <button style={{ width: "100%", padding: "8px", borderRadius: 10, border: "1px solid #E2E8F0", background: "#F8FAFC", color: C.muted, fontWeight: 700, fontSize: "0.75rem", cursor: "default" }}>Locked</button>
              ) : (
                <button onClick={() => handleBuy(item)} disabled={buying === item.id || !canBuy} style={{
                  width: "100%", padding: "8px", borderRadius: 10, border: "none", background: canBuy ? C.teal : "#E2E8F0",
                  color: canBuy ? "#fff" : C.muted, fontWeight: 700, fontSize: "0.75rem", cursor: canBuy ? "pointer" : "default",
                }}>{buying === item.id ? "Buying..." : canBuy ? "Buy" : "Not enough coins"}</button>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "3rem", background: C.white, borderRadius: 16, border: `1px solid ${C.border}` }}>
          <Filter size={32} style={{ color: C.muted, margin: "0 auto 1rem" }} />
          <p style={{ color: C.body, fontWeight: 600 }}>No items match your filters.</p>
        </div>
      )}
    </div>
  );
}
