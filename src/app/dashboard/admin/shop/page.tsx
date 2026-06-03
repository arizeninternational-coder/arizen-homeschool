"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { ShoppingBag, ArrowLeft, Plus, Search, AlertCircle, Coins, Star, Crown, Gem, RefreshCw, Loader2 } from "lucide-react";
import { PageHeader, GradientButton, EmptyStateCard, SectionHeader } from "@/components/ui/Pill";

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
    <div className="min-h-screen bg-bg-main">
      <div className="max-w-[1100px] mx-auto py-8 px-6">
        {/* Top bar */}
        <div className="flex justify-between items-center mb-6">
          <Link href="/dashboard/admin" className="inline-flex items-center gap-2 text-text-muted hover:text-text text-sm font-semibold transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Admin Dashboard
          </Link>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/60 text-text-muted hover:bg-white hover:border-primary/30 cursor-pointer text-xs font-semibold transition-all">
            Sign Out
          </button>
        </div>

        {/* Header */}
        <PageHeader title="Shop & Rewards" subtitle="Manage avatar shop items and coin reward rules">
          <div className="mt-4">
            <GradientButton variant="primary" size="sm" icon={seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} onClick={handleSeed} disabled={seeding}>
              {seeding ? "Seeding..." : "Seed Shop Items"}
            </GradientButton>
          </div>
        </PageHeader>

        {/* Seed feedback */}
        {seedFeedback && (
          <div className={`flex items-center gap-2 p-3 rounded-2xl mb-6 text-sm font-semibold ${seedFeedback.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {seedFeedback.type === "success" ? <Star className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            {seedFeedback.text}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab("items")} className={`px-4 py-2 rounded-2xl font-bold text-sm cursor-pointer transition-all ${tab === "items" ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-[0_4px_15px_rgba(79,70,229,0.2)]" : "bg-white border border-white/60 text-text-muted hover:bg-bg-main"}`}>
            Shop Items ({items.length})
          </button>
          <button onClick={() => setTab("rules")} className={`px-4 py-2 rounded-2xl font-bold text-sm cursor-pointer transition-all ${tab === "rules" ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-[0_4px_15px_rgba(79,70,229,0.2)]" : "bg-white border border-white/60 text-text-muted hover:bg-bg-main"}`}>
            Reward Rules ({rules.length})
          </button>
        </div>

        {tab === "items" && (
          <>
            {/* Filters */}
            <div className="flex gap-3 mb-6 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm font-medium text-text bg-white border border-white/60 placeholder:text-text-muted/60 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all" />
              </div>
              {categories.length > 0 && (
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-4 py-2.5 rounded-2xl text-sm font-medium text-text bg-white border border-white/60 focus:outline-none focus:border-primary/40 transition-all min-w-[140px]">
                  <option value="all">All Categories</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              )}
            </div>

            {loading ? (
              <div className="rounded-[1.75rem] border border-white/60 bg-white p-12 text-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
                <p className="text-text-muted text-sm font-medium">Loading shop items...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <EmptyStateCard
                icon={<ShoppingBag size={48} />}
                title="No shop items yet"
                description='Click "Seed Shop Items" to create default items, or add them manually.'
              />
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
                {filteredItems.map((item) => {
                  const RarityIcon = rarityIcons[item.rarity] || Star;
                  const rarityColor = rarityColors[item.rarity] || "#9CA3AF";
                  return (
                    <div key={item.id} className="rounded-[1.75rem] border border-white/60 bg-white p-5 hover:shadow-[0_8px_30px_rgba(15,23,42,0.08)] transition-all duration-200 hover:-translate-y-1" style={{ borderColor: `${rarityColor}30` }}>
                      <div className="flex justify-between items-start mb-3">
                        <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: `${rarityColor}18` }}>
                          <RarityIcon className="w-[22px] h-[22px]" style={{ color: rarityColor }} />
                        </div>
                        <span className="text-[0.6875rem] font-bold px-2 py-1 rounded-lg uppercase" style={{ color: rarityColor, background: `${rarityColor}15` }}>
                          {item.rarity}
                        </span>
                      </div>
                      <h3 className="font-bold text-text text-sm mb-1">{item.name}</h3>
                      <p className="text-xs text-text-muted mb-3 leading-relaxed">{item.description}</p>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5">
                          <Coins className="w-3.5 h-3.5 text-gold" />
                          <span className="font-bold text-text text-sm">{item.price}</span>
                        </div>
                        <span className="text-[0.6875rem] text-text-muted bg-bg-main px-2 py-0.5 rounded-md">{item.category}</span>
                      </div>
                      {!item.isActive && (
                        <span className="text-[0.625rem] font-bold text-amber-600 mt-2 block">INACTIVE</span>
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
            {loading ? (
              <div className="rounded-[1.75rem] border border-white/60 bg-white p-12 text-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
                <p className="text-text-muted text-sm font-medium">Loading reward rules...</p>
              </div>
            ) : rules.length === 0 ? (
              <EmptyStateCard
                icon={<AlertCircle size={48} />}
                title="No reward rules yet"
                description="Seed shop items to also create default reward rules."
              />
            ) : (
              <div className="flex flex-col gap-2">
                {rules.map((rule) => (
                  <div key={rule.id} className="rounded-[1.75rem] border border-white/60 bg-white p-4 flex items-center gap-4 hover:shadow-[0_4px_20px_rgba(15,23,42,0.06)] transition-all">
                    <div className="w-10 h-10 rounded-2xl bg-primary-soft flex items-center justify-center flex-shrink-0">
                      <Coins className="w-[18px] h-[18px] text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-text text-sm">{rule.action.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</div>
                      <div className="text-xs text-text-muted">
                        {rule.coins} coins · {rule.xp} XP {rule.dailyLimit > 0 ? `· Max ${rule.dailyLimit}/day` : ""}
                      </div>
                    </div>
                    <span className={`text-[0.6875rem] font-bold px-2 py-1 rounded-lg ${
                      rule.isActive ? "text-emerald-700 bg-emerald-50" : "text-text-muted bg-bg-main"
                    }`}>
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
