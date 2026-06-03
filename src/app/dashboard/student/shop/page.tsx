"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import {
  Coins, ShoppingBag, Lock, Check, Loader2, Sparkles
} from "lucide-react";
import { PageHeader, CoinPill, GradientButton, EmptyStateCard } from "@/components/ui/Pill";
import { cn } from "@/lib/utils/cn";

const ITEMS = [
  { id: "soccer-boots",       name: "Soccer Boots",             rarity: "common",    category: "shoes",       cost: 30,  req: null },
  { id: "safari-hat",         name: "Safari Explorer Hat",      rarity: "common",    category: "hats",        cost: 35,  req: null },
  { id: "artist-brush",       name: "Artist Brush",             rarity: "common",    category: "accessories", cost: 40,  req: null },
  { id: "kindness-hoodie",    name: "Kindness Hoodie",          rarity: "common",    category: "clothing",    cost: 45,  req: null },
  { id: "reading-glasses",    name: "Reading Champion Glasses", rarity: "common",    category: "accessories", cost: 45,  req: "Complete 3 reading lessons" },
  { id: "math-wizard-hat",    name: "Math Wizard Hat",          rarity: "rare",      category: "hats",        cost: 50,  req: "Complete 5 math lessons" },
  { id: "star-backpack",      name: "Star Backpack",            rarity: "rare",      category: "accessories", cost: 50,  req: "Complete 5 quests" },
  { id: "music-headphones",   name: "Music Maker Headphones",   rarity: "rare",      category: "accessories", cost: 55,  req: "Complete 5 creative arts lessons" },
  { id: "nature-backpack",    name: "Nature Guardian Backpack",  rarity: "rare",      category: "accessories", cost: 55,  req: "Complete 3 environmental lessons" },
  { id: "scientist-goggles",  name: "Scientist Goggles",        rarity: "rare",      category: "accessories", cost: 60,  req: "Complete 3 science lessons" },
  { id: "globe-explorer",     name: "Globe Explorer Tool",      rarity: "rare",      category: "tools",       cost: 65,  req: "Complete 5 geography lessons" },
  { id: "library-bg",         name: "Library Background",       rarity: "rare",      category: "backgrounds", cost: 80,  req: "Complete 10 reading lessons" },
  { id: "forest-bg",          name: "Forest Background",        rarity: "rare",      category: "backgrounds", cost: 80,  req: "Complete 5 environmental lessons" },
  { id: "explorer-telescope", name: "Explorer Telescope",       rarity: "rare",      category: "tools",       cost: 80,  req: "Complete 3 science lessons" },
  { id: "rabbit-pet",         name: "Rabbit Companion",         rarity: "rare",      category: "pets",        cost: 90,  req: "Complete 10 lessons" },
  { id: "storyteller-cape",   name: "Storyteller Cape",         rarity: "epic",      category: "clothing",    cost: 70,  req: "Complete 5 reading lessons" },
  { id: "space-bg",           name: "Space Background",         rarity: "epic",      category: "backgrounds", cost: 100, req: "Earn 500 XP" },
  { id: "science-lab-bg",     name: "Science Lab Background",   rarity: "epic",      category: "backgrounds", cost: 120, req: "Complete 10 science lessons" },
  { id: "robot-pet",          name: "Robot Companion",          rarity: "legendary", category: "pets",        cost: 150, req: "Complete 20 lessons" },
  { id: "creative-crown",     name: "Creative Crown",           rarity: "legendary", category: "hats",        cost: 200, req: "Complete 50 lessons" },
];

const CATEGORIES = ["all", "hats", "clothing", "accessories", "shoes", "tools", "pets", "backgrounds"];

const RARITY_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; glow: string }> = {
  common:    { label: "COMMON",    color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", glow: "" },
  rare:      { label: "RARE",      color: "text-blue-700",    bg: "bg-blue-50",    border: "border-blue-200",    glow: "" },
  epic:      { label: "EPIC",      color: "text-purple-700",  bg: "bg-purple-50",  border: "border-purple-200",  glow: "shadow-[0_0_15px_rgba(139,92,246,0.15)]" },
  legendary: { label: "LEGENDARY", color: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-300",   glow: "shadow-[0_0_20px_rgba(245,165,36,0.2)]" },
};

const ITEM_ICONS: Record<string, string> = {
  shoes: "👟", hats: "🎩", accessories: "🎒", clothing: "👕",
  tools: "🔧", pets: "🐾", backgrounds: "🖼️",
};

export default function ShopPage() {
  const [coins, setCoins] = useState(0);
  const [category, setCategory] = useState("all");
  const [filter, setFilter] = useState("all");
  const [inventory, setInventory] = useState<any[]>([]);
  const [buying, setBuying] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/coins/wallet", { credentials: "include" })
      .then(r => r.json())
      .then(d => { setCoins(d.wallet?.balance || d.balance || 0); })
      .catch(() => {});
    fetch("/api/shop/inventory", { credentials: "include" })
      .then(r => r.json())
      .then(d => { setInventory(d.inventory || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const ownedIds = inventory.map(i => i.avatarItem?.id || i.avatar_item?.id).filter(Boolean);
  const filtered = ITEMS.filter(item => {
    if (category !== "all" && item.category !== category) return false;
    if (filter === "owned" && !ownedIds.includes(item.id)) return false;
    if (filter === "locked" && (!item.req || ownedIds.includes(item.id))) return false;
    if (filter === "available" && (item.req || ownedIds.includes(item.id))) return false;
    return true;
  });

  const handleBuy = async (item: any) => {
    if (ownedIds.includes(item.id)) return;
    if (coins < item.cost) { setMessage({ type: "error", text: "Not enough coins!" }); return; }
    if (item.req) { setMessage({ type: "error", text: `Requirement: ${item.req}` }); return; }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-primary mx-auto mb-4" />
          <p className="text-text-muted font-bold text-lg">Loading shop...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Avatar Shop"
        subtitle="Use Spark Coins to unlock outfits, tools, pets, and accessories."
      >
        <div className="mt-3 flex items-center gap-3">
          <CoinPill coins={coins} size="md" />
        </div>
      </PageHeader>

      {/* Message */}
      {message && (
        <div className={cn(
          "px-5 py-3 rounded-2xl mb-5 font-bold text-sm border",
          message.type === "success"
            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
            : "bg-red-50 border-red-200 text-red-800"
        )}>
          {message.text}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <div className="flex gap-1.5 flex-1 min-w-0">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all cursor-pointer border",
                category === cat
                  ? "bg-primary text-white border-primary shadow-[0_4px_15px_rgba(79,70,229,0.2)]"
                  : "bg-white text-text-muted border-border-soft hover:border-primary/30 hover:text-text"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {["all", "available", "locked", "owned"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all cursor-pointer border",
                filter === f
                  ? "bg-secondary text-white border-secondary shadow-[0_4px_15px_rgba(0,168,132,0.2)]"
                  : "bg-white text-text-muted border-border-soft hover:border-secondary/30 hover:text-text"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map(item => {
          const owned = ownedIds.includes(item.id);
          const locked = !!item.req && !owned;
          const canBuy = !owned && !locked && coins >= item.cost;
          const rarity = RARITY_CONFIG[item.rarity] || RARITY_CONFIG.common;

          return (
            <div
              key={item.id}
              className={cn(
                "rounded-[1.5rem] border-2 bg-white overflow-hidden transition-all duration-200 hover:-translate-y-1",
                rarity.border,
                rarity.glow,
                locked ? "opacity-60" : "hover:shadow-[0_12px_35px_rgba(0,0,0,0.08)]"
              )}
            >
              {/* Illustration area */}
              <div className={cn(
                "relative h-32 flex items-center justify-center",
                locked ? "bg-gray-50" : rarity.bg
              )}>
                {/* Rarity badge */}
                <span className={cn(
                  "absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider",
                  rarity.bg, rarity.color, "border", rarity.border
                )}>
                  {rarity.label}
                </span>

                {/* Lock / Owned badge */}
                {owned && (
                  <span className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                    <Check size={14} strokeWidth={3} />
                  </span>
                )}
                {locked && (
                  <span className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">
                    <Lock size={12} />
                  </span>
                )}

                {/* Item icon placeholder */}
                <span className="text-5xl select-none" style={{ filter: locked ? "grayscale(1)" : "none" }}>
                  {ITEM_ICONS[item.category] || "🎁"}
                </span>
              </div>

              {/* Card body */}
              <div className="p-4">
                <h4 className="text-sm font-extrabold text-text mb-1 leading-tight">{item.name}</h4>

                {locked && item.req && (
                  <p className="text-[11px] text-text-muted mb-2 italic">
                    🔒 {item.req}
                  </p>
                )}

                {/* Price / Action */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1">
                    <Coins size={14} className="text-gold" />
                    <span className="text-sm font-extrabold text-amber-700">{item.cost}</span>
                  </div>

                  {owned ? (
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                      Owned ✓
                    </span>
                  ) : (
                    <GradientButton
                      variant={canBuy ? "primary" : "ghost"}
                      size="sm"
                      disabled={!canBuy || buying === item.id}
                      onClick={() => handleBuy(item)}
                      className="!px-3 !py-1.5 !text-xs !rounded-xl"
                    >
                      {buying === item.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        "Buy"
                      )}
                    </GradientButton>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <EmptyStateCard
          icon={<ShoppingBag size={36} />}
          title="No items match your filters"
          description="Try changing the category or filter to see more items."
        />
      )}
    </div>
  );
}
