"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { ShoppingBag, ArrowLeft, Plus, Search, AlertCircle, Coins, Star, Crown, Gem, RefreshCw } from "lucide-react";
import { ds, colors } from "@/lib/design-system";

interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  rarity: string;
  isActive: boolean;
  unlockRequirementType: string | null;
  unlockRequirementValue: number | null;
  createdAt: string;
}

interface RewardRule {
  id: string;
  action: string;
  coins: number;
  xp: number;
  dailyLimit: number;
  isActive: boolean;
}

export default function AdminShopPage() {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [rules, setRules] = useState<RewardRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"items" | "rules">("items");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [seedFeedback, setSeedFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [itemsRes, rulesRes] = await Promise.all([
          fetch("/api/admin/shop-items", { credentials: "include" }),
          fetch("/api/admin/reward-rules", { credentials: "include" }),
        ]);
        if (itemsRes.ok) {
          const data = await itemsRes.json();
          setItems(data.items || []);
        }
        if (rulesRes.ok) {
          const data = await rulesRes.json();
          setRules(data.rules || []);
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load shop data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const categories = [...new Set(items.map(i => i.category).filter(Boolean))];

  const filteredItems = items.filter(item => {
    if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return item.name.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q);
  });

  const rarityColors: Record<string, string> = {
    common: "#9CA3AF",
    rare: "#3B82F6",
    epic: "#8B5CF6",
    legendary: "#F59E0B",
  };

  const rarityIcons: Record<string, any> = {
    common: Star,
    rare: Star,
    epic: Crown,
    legendary: Gem,
  };

  async function handleSeed() {
    setSeeding(true);
    setSeedFeedback(null);
    try {
      const res = await fetch("/api/admin/shop-seed", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) {
        setSeedFeedback({ type: "success", text: data.message || "Shop items seeded successfully!" });
        // Reload items
        const itemsRes = await fetch("/api/admin/shop-items", { credentials: "include" });
        if (itemsRes.ok) {
          const d = await itemsRes.json();
          setItems(d.items || []);
        }
      } else {
        setSeedFeedback({ type: "error", text: data.error || "Failed to seed shop items" });
      }
    } catch (err: any) {
      setSeedFeedback({ type: "error", text: err?.message || "Network error" });
    } finally {
      setSeeding(false);
      setTimeout(() => setSeedFeedback(null), 8000);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: colors.bg }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <Link href="/dashboard/admin" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: colors.textMuted, textDecoration: "none", fontSize: "0.875rem", fontWeight: 600 }}>
            <ArrowLeft style={{ width: 16, height: 16 }} /> Back to Admin Dashboard
          </Link>
          <button onClick={() => signOut({ callbackUrl: "/" })} style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.375rem 0.75rem", borderRadius: 8, border: `1px solid ${colors.border}`, background: "none", color: colors.textMuted, cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600 }}>
            Sign Out
          </button>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: colors.text, marginBottom: "0.25rem" }}>Shop & Rewards</h1>
            <p style={{ color: colors.textMuted }}>Manage avatar shop items and coin reward rules</p>
          </div>
          <button onClick={handleSeed} disabled={seeding} style={{ ...ds.btnPrimary, fontSize: "0.875rem", padding: "0.625rem 1.25rem", opacity: seeding ? 0.6 : 1 }}>
            <RefreshCw style={{ width: 14, height: 14 }} /> {seeding ? "Seeding..." : "Seed Shop Items"}
          </button>
        </div>

        {seedFeedback && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1rem", borderRadius: 10, marginBottom: "1.5rem", background: seedFeedback.type === "success" ? `${colors.success}10` : `${colors.warning || "#EF4444"}10`, color: seedFeedback.type === "success" ? colors.success : "#DC2626", fontSize: "0.875rem", fontWeight: 600 }}>
            {seedFeedback.type === "success" ? <Star style={{ width: 16, height: 16 }} /> : <AlertCircle style={{ width: 16, height: 16 }} />}
            {seedFeedback.text}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
          <button onClick={() => setTab("items")} style={{ padding: "0.5rem 1rem", borderRadius: 10, border: "none", background: tab === "items" ? colors.primary : colors.bgSoft, color: tab === "items" ? "white" : colors.textMuted, fontWeight: 700, fontSize: "0.875rem", cursor: "pointer" }}>
            Shop Items ({items.length})
          </button>
          <button onClick={() => setTab("rules")} style={{ padding: "0.5rem 1rem", borderRadius: 10, border: "none", background: tab === "rules" ? colors.primary : colors.bgSoft, color: tab === "rules" ? "white" : colors.textMuted, fontWeight: 700, fontSize: "0.875rem", cursor: "pointer" }}>
            Reward Rules ({rules.length})
          </button>
        </div>

        {tab === "items" && (
          <>
            {/* Filters */}
            <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
              <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
                <Search style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: colors.textMuted }} />
                <input placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...ds.input, paddingLeft: "2.5rem", fontSize: "0.875rem" }} />
              </div>
              {categories.length > 0 && (
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ ...ds.input, fontSize: "0.875rem", minWidth: 140 }}>
                  <option value="all">All Categories</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              )}
            </div>

            {loading ? (
              <div style={{ ...ds.card, textAlign: "center", padding: "3rem 2rem", color: colors.textMuted }}>Loading shop items...</div>
            ) : filteredItems.length === 0 ? (
              <div style={{ ...ds.card, textAlign: "center", padding: "3rem 2rem" }}>
                <ShoppingBag style={{ width: 48, height: 48, color: colors.textMuted, margin: "0 auto 1rem", opacity: 0.4 }} />
                <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: colors.text, marginBottom: "0.5rem" }}>No shop items yet</h3>
                <p style={{ color: colors.textMuted, fontSize: "0.9375rem" }}>Click "Seed Shop Items" to create default items, or add them manually.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
                {filteredItems.map((item) => {
                  const RarityIcon = rarityIcons[item.rarity] || Star;
                  return (
                    <div key={item.id} style={{ ...ds.card, padding: "1.25rem", border: `1.5px solid ${rarityColors[item.rarity] || colors.border}20` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: `${rarityColors[item.rarity] || colors.primary}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <RarityIcon style={{ width: 22, height: 22, color: rarityColors[item.rarity] || colors.primary }} />
                        </div>
                        <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: rarityColors[item.rarity] || colors.textMuted, background: `${rarityColors[item.rarity] || colors.textMuted}15`, padding: "0.2rem 0.5rem", borderRadius: 6, textTransform: "uppercase" }}>
                          {item.rarity}
                        </span>
                      </div>
                      <h3 style={{ fontWeight: 700, color: colors.text, fontSize: "0.9375rem", marginBottom: "0.25rem" }}>{item.name}</h3>
                      <p style={{ fontSize: "0.75rem", color: colors.textMuted, marginBottom: "0.75rem", lineHeight: 1.5 }}>{item.description}</p>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                          <Coins style={{ width: 14, height: 14, color: "#EAB308" }} />
                          <span style={{ fontWeight: 700, color: colors.text, fontSize: "0.875rem" }}>{item.price}</span>
                        </div>
                        <span style={{ fontSize: "0.6875rem", color: colors.textMuted, background: colors.bgSoft, padding: "0.15rem 0.5rem", borderRadius: 4 }}>{item.category}</span>
                      </div>
                      {!item.isActive && (
                        <span style={{ fontSize: "0.625rem", fontWeight: 700, color: colors.warning, marginTop: "0.5rem", display: "block" }}>INACTIVE</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {tab === "rules" && (
          <>
            {rules.length === 0 ? (
              <div style={{ ...ds.card, textAlign: "center", padding: "3rem 2rem" }}>
                <AlertCircle style={{ width: 48, height: 48, color: colors.textMuted, margin: "0 auto 1rem", opacity: 0.4 }} />
                <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: colors.text, marginBottom: "0.5rem" }}>No reward rules yet</h3>
                <p style={{ color: colors.textMuted, fontSize: "0.9375rem" }}>Seed shop items to also create default reward rules.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "0.5rem" }}>
                {rules.map((rule) => (
                  <div key={rule.id} style={{ ...ds.card, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: colors.primarySoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Coins style={{ width: 18, height: 18, color: colors.primary }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: colors.text, fontSize: "0.9375rem" }}>{rule.action.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</div>
                      <div style={{ fontSize: "0.75rem", color: colors.textMuted }}>
                        {rule.coins} coins · {rule.xp} XP {rule.dailyLimit > 0 ? `· Max ${rule.dailyLimit}/day` : ""}
                      </div>
                    </div>
                    <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: rule.isActive ? colors.success : colors.textMuted, background: rule.isActive ? `${colors.success}15` : colors.bgSoft, padding: "0.2rem 0.5rem", borderRadius: 6 }}>
                      {rule.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
