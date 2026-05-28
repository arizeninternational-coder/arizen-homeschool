"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  ShoppingBag, Sparkles, Lock, Check, Coins, Star,
  ChevronRight, Filter, Search
} from "lucide-react";
import { ds, colors, gradients } from "@/lib/design-system";

interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  rarity: string;
  emoji: string;
  isOwned: boolean;
  canAfford: boolean;
  requirementProgress: number;
  requirementTotal: number;
  requirementMet: boolean;
  canBuy: boolean;
  unlockDescription?: string;
}

const CATEGORIES = [
  { value: "all", label: "All", emoji: "🛍️" },
  { value: "HATS", label: "Hats", emoji: "🎩" },
  { value: "CLOTHING", label: "Clothing", emoji: "👕" },
  { value: "ACCESSORIES", label: "Accessories", emoji: "🎒" },
  { value: "LEARNING_TOOLS", label: "Tools", emoji: "🔧" },
  { value: "GLASSES", label: "Glasses", emoji: "👓" },
  { value: "SHOES", label: "Shoes", emoji: "👟" },
  { value: "BACKGROUNDS", label: "Backgrounds", emoji: "🖼️" },
  { value: "PETS", label: "Pets", emoji: "🐾" },
];

const RARITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  COMMON: { bg: "#F0FDF4", text: "#166534", border: "#86EFAC" },
  RARE: { bg: "#EFF6FF", text: "#1E40AF", border: "#93C5FD" },
  EPIC: { bg: "#FAF5FF", text: "#6B21A8", border: "#C4B5FD" },
  LEGENDARY: { bg: "#FFFBEB", text: "#92400E", border: "#FCD34D" },
};

export default function StudentShopPage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<ShopItem[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.set("category", selectedCategory);
      const res = await fetch(`/api/shop/items?${params}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
        setWalletBalance(data.walletBalance || 0);
      }
    } catch (err) {
      console.error("[SHOP] Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleBuy = async (item: ShopItem) => {
    if (buyingId) return;
    setBuyingId(item.id);
    setFeedback(null);

    try {
      const res = await fetch("/api/shop/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarItemId: item.id }),
      });
      const data = await res.json();

      if (data.success) {
        setFeedback({ type: "success", message: data.message });
        setWalletBalance(data.newBalance);
        // Update item in list
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, isOwned: true, canBuy: false } : i))
        );
      } else {
        setFeedback({ type: "error", message: data.error || "Purchase failed" });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: "Network error. Please try again." });
    } finally {
      setBuyingId(null);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const filteredItems = items.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
  });

  const availableItems = filteredItems.filter((i) => !i.isOwned);
  const ownedItems = filteredItems.filter((i) => i.isOwned);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem", marginBottom: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ShoppingBag style={{ width: 24, height: 24, color: colors.primary }} />
            <h1 style={{ fontSize: "1.375rem", fontWeight: 800, color: colors.text }}>Avatar Shop</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.375rem 0.875rem", borderRadius: 20, background: "linear-gradient(135deg, #FEF3C7, #FDE68A)", color: "#92400E", fontWeight: 800, fontSize: "0.875rem" }}>
            <Coins style={{ width: 16, height: 16 }} />
            {walletBalance} Spark Coins
          </div>
        </div>
        <p style={{ color: colors.textMuted, fontSize: "0.875rem" }}>
          Earn Spark Coins by completing lessons and quests, then spend them here to customize your avatar!
        </p>
      </div>

      {/* Feedback */}
      {feedback && (
        <div style={{
          padding: "0.75rem 1rem", borderRadius: 10, marginBottom: "1rem",
          background: feedback.type === "success" ? "#ECFDF5" : "#FEF2F2",
          border: `1.5px solid ${feedback.type === "success" ? "#6EE7B7" : "#FCA5A5"}`,
          color: feedback.type === "success" ? "#065F46" : "#991B1B",
          fontSize: "0.875rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem",
        }}>
          {feedback.type === "success" ? <Check style={{ width: 16, height: 16 }} /> : <Lock style={{ width: 16, height: 16 }} />}
          {feedback.message}
        </div>
      )}

      {/* Search */}
      <div style={{ position: "relative", marginBottom: "1rem" }}>
        <Search style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: colors.textMuted }} />
        <input
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...ds.input, paddingLeft: "2.5rem", fontSize: "0.875rem" }}
        />
      </div>

      {/* Category filters */}
      <div style={{ display: "flex", gap: "0.375rem", overflowX: "auto", paddingBottom: "0.5rem", marginBottom: "1.5rem", WebkitOverflowScrolling: "touch" }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            style={{
              display: "flex", alignItems: "center", gap: "0.375rem",
              padding: "0.375rem 0.75rem", borderRadius: 20, border: "none",
              background: selectedCategory === cat.value ? colors.primary : colors.bgSoft,
              color: selectedCategory === cat.value ? "white" : colors.textMuted,
              fontWeight: 700, fontSize: "0.75rem", cursor: "pointer",
              whiteSpace: "nowrap", flexShrink: 0,
              transition: "all 0.15s",
            }}
          >
            <span>{cat.emoji}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "1rem" }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} style={{ borderRadius: 16, background: colors.bgSoft, height: 220 }} />
          ))}
        </div>
      ) : (
        <>
          {/* Available items */}
          {availableItems.length > 0 && (
            <>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: colors.text, marginBottom: "0.75rem" }}>
                Available ({availableItems.length})
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
                {availableItems.map((item) => {
                  const rarity = RARITY_COLORS[item.rarity] || RARITY_COLORS.COMMON;
                  return (
                    <div
                      key={item.id}
                      style={{
                        borderRadius: 16, padding: "1rem", textAlign: "center",
                        background: "white", border: `1.5px solid ${rarity.border}`,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.04)", position: "relative", overflow: "hidden",
                      }}
                    >
                      {/* Rarity badge */}
                      <div style={{
                        position: "absolute", top: "0.5rem", right: "0.5rem",
                        fontSize: "0.625rem", fontWeight: 800, padding: "0.125rem 0.375rem",
                        borderRadius: 6, background: rarity.bg, color: rarity.text,
                      }}>
                        {item.rarity}
                      </div>

                      {/* Emoji */}
                      <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem", filter: item.requirementMet && item.canAfford ? "none" : "grayscale(0.5)", opacity: item.requirementMet ? 1 : 0.6 }}>
                        {item.emoji}
                      </div>

                      {/* Name */}
                      <div style={{ fontWeight: 700, color: colors.text, fontSize: "0.8125rem", marginBottom: "0.25rem", lineHeight: 1.3 }}>
                        {item.name}
                      </div>

                      {/* Price */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem", marginBottom: "0.5rem" }}>
                        <Coins style={{ width: 12, height: 12, color: "#D97706" }} />
                        <span style={{ fontWeight: 800, fontSize: "0.8125rem", color: item.canAfford ? "#92400E" : colors.danger }}>
                          {item.price}
                        </span>
                      </div>

                      {/* Lock status */}
                      {!item.requirementMet && item.unlockDescription && (
                        <div style={{ fontSize: "0.625rem", color: colors.textMuted, marginBottom: "0.5rem", lineHeight: 1.3 }}>
                          🔒 {item.unlockDescription}
                          {item.requirementTotal > 0 && (
                            <div style={{ marginTop: "0.25rem", height: 4, borderRadius: 2, background: colors.border }}>
                              <div style={{ height: "100%", borderRadius: 2, background: colors.primary, width: `${Math.min(100, (item.requirementProgress / item.requirementTotal) * 100)}%`, transition: "width 0.3s" }} />
                            </div>
                          )}
                          <div style={{ fontSize: "0.5625rem", marginTop: "0.125rem" }}>
                            {item.requirementProgress}/{item.requirementTotal}
                          </div>
                        </div>
                      )}

                      {/* Buy button */}
                      <button
                        onClick={() => handleBuy(item)}
                        disabled={!item.canBuy || buyingId === item.id}
                        style={{
                          width: "100%", padding: "0.5rem", borderRadius: 10, border: "none",
                          background: item.canBuy ? gradients.primary : colors.bgSoft,
                          color: item.canBuy ? "white" : colors.textMuted,
                          fontWeight: 700, fontSize: "0.75rem", cursor: item.canBuy && buyingId !== item.id ? "pointer" : "default",
                          opacity: buyingId === item.id ? 0.7 : 1,
                          transition: "all 0.15s",
                        }}
                      >
                        {buyingId === item.id ? "Buying..." : item.isOwned ? "✓ Owned" : !item.requirementMet ? "🔒 Locked" : !item.canAfford ? "Not enough coins" : "Buy"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Owned items */}
          {ownedItems.length > 0 && (
            <>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: colors.text, marginBottom: "0.75rem" }}>
                ✓ Owned ({ownedItems.length})
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "1rem" }}>
                {ownedItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      borderRadius: 16, padding: "1rem", textAlign: "center",
                      background: "#F0FDF4", border: "1.5px solid #86EFAC",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)", opacity: 0.85,
                    }}
                  >
                    <div style={{ fontSize: "2rem", marginBottom: "0.375rem" }}>{item.emoji}</div>
                    <div style={{ fontWeight: 700, color: "#166534", fontSize: "0.8125rem" }}>{item.name}</div>
                    <div style={{ fontSize: "0.6875rem", color: "#16A34A", fontWeight: 600, marginTop: "0.25rem" }}>
                      ✓ Owned — Go to Profile to equip
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {!loading && filteredItems.length === 0 && (
            <div style={{ textAlign: "center", padding: "3rem 1rem", color: colors.textMuted }}>
              <ShoppingBag style={{ width: 48, height: 48, margin: "0 auto 1rem", opacity: 0.3 }} />
              <p style={{ fontWeight: 600 }}>No items found</p>
              <p style={{ fontSize: "0.875rem" }}>Try a different category or search term.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
