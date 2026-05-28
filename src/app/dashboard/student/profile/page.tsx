"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Sparkles, Coins, Crown, PawPrint, Image, Wrench,
  Check, ShoppingBag, Award, Zap, Flame, Shirt, Glasses, Backpack
} from "lucide-react";
import { ds, colors, gradients } from "@/lib/design-system";

const CAT_CFG: Record<string, { label: string; icon: any; color: string }> = {
  HATS: { label: "Hat", icon: Crown, color: "#8B5CF6" },
  CLOTHING: { label: "Outfit", icon: Shirt, color: "#EC4899" },
  ACCESSORIES: { label: "Accessory", icon: Backpack, color: "#F59E0B" },
  LEARNING_TOOLS: { label: "Tool", icon: Wrench, color: "#3B82F6" },
  GLASSES: { label: "Glasses", icon: Glasses, color: "#6366F1" },
  SHOES: { label: "Shoes", icon: Sparkles, color: "#14B8A6" },
  BACKGROUNDS: { label: "Background", icon: Image, color: "#22C55E" },
  PETS: { label: "Pet", icon: PawPrint, color: "#F97316" },
};

export default function StudentProfilePage() {
  const { data: session } = useSession();
  const [avatar, setAvatar] = useState<any>(null);
  const [inventory, setInventory] = useState<any[]>([]);
  const [wallet, setWallet] = useState({ balance: 0 });
  const [stats, setStats] = useState({ xp: 0, streak: 0, badges: 0 });
  const [loading, setLoading] = useState(true);
  const [equippingId, setEquippingId] = useState<string | null>(null);

  const user = session?.user as any;
  const displayName = user?.displayName || user?.name?.split(" ")[0] || "Learner";

  useEffect(() => {
    async function load() {
      try {
        const results = await Promise.allSettled([
          fetch("/api/avatar").then(r => r.json()),
          fetch("/api/shop/inventory").then(r => r.json()),
          fetch("/api/coins/wallet").then(r => r.json()),
          fetch("/api/learner/profile").then(r => r.json()),
        ]);
        if (results[0].status === "fulfilled") setAvatar(results[0].value.avatar || results[0].value);
        if (results[1].status === "fulfilled") setInventory(results[1].value.inventory || []);
        if (results[2].status === "fulfilled") setWallet(results[2].value.wallet || results[2].value);
        if (results[3].status === "fulfilled" && results[3].value.profile) {
          const p = results[3].value.profile;
          setStats({ xp: p.totalXp || 0, streak: p.currentStreak || 0, badges: p.badgesCount || 0 });
        }
      } catch (err) { console.error("[PROFILE] Load error:", err); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const getItem = (inv: any) => inv.avatarItem || inv.avatar_item || {};
  const getId = (inv: any) => getItem(inv)?.id;

  const handleEquip = async (itemId: string, category: string) => {
    if (equippingId) return;
    setEquippingId(itemId);
    try {
      const res = await fetch("/api/avatar/equip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarItemId: itemId, category }),
      });
      const data = await res.json();
      if (data.avatar) {
        setAvatar(data.avatar);
        setInventory((prev: any[]) => prev.map((inv: any) => ({
          ...inv,
          equipped: getId(inv) === itemId ? true : (getItem(inv)?.category === category && getId(inv) !== itemId ? false : inv.equipped),
        })));
      }
    } catch (err) { console.error("[PROFILE] Equip error:", err); }
    finally { setEquippingId(null); }
  };

  const handleUnequip = async (category: string) => {
    if (equippingId) return;
    setEquippingId("unequip-" + category);
    try {
      const res = await fetch("/api/avatar/unequip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category }),
      });
      const data = await res.json();
      if (data.avatar) {
        setAvatar(data.avatar);
        setInventory((prev: any[]) => prev.map((inv: any) => getItem(inv)?.category === category ? { ...inv, equipped: false } : inv));
      }
    } catch (err) { console.error("[PROFILE] Unequip error:", err); }
    finally { setEquippingId(null); }
  };

  const byCat: Record<string, any[]> = {};
  inventory.forEach((inv: any) => {
    const cat = getItem(inv)?.category;
    if (cat) { if (!byCat[cat]) byCat[cat] = []; byCat[cat].push(inv); }
  });

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <Sparkles style={{ width: 32, height: 32, color: colors.primary }} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Sparkles style={{ width: 24, height: 24, color: colors.primary }} />
          <h1 style={{ fontSize: "1.375rem", fontWeight: 800, color: colors.text }}>My Profile</h1>
        </div>
      </div>

      <div style={{ ...ds.card, padding: "1.5rem", marginBottom: "1.5rem", background: gradients.primary, color: "white", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", position: "relative", zIndex: 1 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", border: "3px solid rgba(255,255,255,0.4)", position: "relative" }}>
            <span>🧑</span>
            {avatar?.equippedHat && <span style={{ position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)", fontSize: "1.25rem" }}>{avatar.equippedHat.emoji || "🎩"}</span>}
            {avatar?.equippedPet && <span style={{ position: "absolute", bottom: -4, right: -4, fontSize: "1.25rem" }}>{avatar.equippedPet.emoji || "🐾"}</span>}
          </div>
          <div>
            <div style={{ fontSize: "1.25rem", fontWeight: 800 }}>{displayName}</div>
            <div style={{ opacity: 0.9, fontSize: "0.8125rem" }}>Customize your avatar with items from the shop!</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", flexWrap: "wrap", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.625rem", borderRadius: 16, background: "rgba(255,255,255,0.2)", fontSize: "0.75rem", fontWeight: 700 }}><Zap style={{ width: 12, height: 12 }} /> {stats.xp.toLocaleString()} XP</div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.625rem", borderRadius: 16, background: "rgba(255,255,255,0.2)", fontSize: "0.75rem", fontWeight: 700 }}><Flame style={{ width: 12, height: 12 }} /> {stats.streak}d streak</div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.625rem", borderRadius: 16, background: "rgba(255,255,255,0.2)", fontSize: "0.75rem", fontWeight: 700 }}><Coins style={{ width: 12, height: 12 }} /> {wallet.balance} coins</div>
        </div>
        <Link href="/dashboard/student/shop" style={{ position: "absolute", top: "1rem", right: "1rem", display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.5rem 1rem", borderRadius: 10, background: "white", color: colors.primary, fontWeight: 700, fontSize: "0.8125rem", textDecoration: "none" }}>
          <ShoppingBag style={{ width: 14, height: 14 }} /> Shop
        </Link>
      </div>

      <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: colors.text, marginBottom: "1rem" }}>Customize Avatar</h2>

      {Object.entries(CAT_CFG).map(([cat, cfg]) => {
        const items = byCat[cat] || [];
        const equipped = items.find((i: any) => i.equipped);
        const Icon = cfg.icon;
        return (
          <div key={cat} style={{ ...ds.card, padding: "1rem", marginBottom: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: cfg.color + "15", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon style={{ width: 16, height: 16, color: cfg.color }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: colors.text, fontSize: "0.875rem" }}>{cfg.label}</div>
                  {equipped ? (
                    <div style={{ fontSize: "0.75rem", color: colors.success, fontWeight: 600 }}>✓ {getItem(equipped)?.emoji} {getItem(equipped)?.name}</div>
                  ) : (
                    <div style={{ fontSize: "0.75rem", color: colors.textMuted }}>Nothing equipped</div>
                  )}
                </div>
              </div>
              {equipped && (
                <button onClick={() => handleUnequip(cat)} style={{ padding: "0.375rem 0.75rem", borderRadius: 8, border: "1px solid " + colors.border, background: "white", color: colors.textMuted, fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>Unequip</button>
              )}
            </div>
            {items.length > 0 ? (
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {items.map((inv: any) => {
                  const item = getItem(inv);
                  return (
                    <button key={inv.id} onClick={() => !inv.equipped && handleEquip(item.id, cat)} disabled={equippingId === item.id}
                      style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.375rem 0.75rem", borderRadius: 10, border: inv.equipped ? "2px solid " + cfg.color : "1.5px solid #E5E7EB", background: inv.equipped ? cfg.color + "10" : "white", color: inv.equipped ? cfg.color : colors.text, fontWeight: inv.equipped ? 700 : 500, fontSize: "0.75rem", cursor: inv.equipped ? "default" : "pointer" }}>
                      <span>{item.emoji}</span><span>{item.name}</span>{inv.equipped && <Check style={{ width: 12, height: 12 }} />}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: "0.75rem", borderRadius: 8, background: colors.bgSoft, textAlign: "center", color: colors.textMuted, fontSize: "0.8125rem" }}>
                No {cfg.label.toLowerCase()} items yet. <Link href="/dashboard/student/shop" style={{ color: colors.primary, fontWeight: 600 }}>Visit the shop!</Link>
              </div>
            )}
          </div>
        );
      })}

      <div style={{ ...ds.card, padding: "1.25rem", marginTop: "1rem", textAlign: "center", background: "linear-gradient(135deg, #FFFBEB, #FEF3C7)", border: "1.5px solid #FCD34D" }}>
        <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>💡</div>
        <div style={{ fontWeight: 700, color: "#92400E", fontSize: "0.875rem", marginBottom: "0.375rem" }}>How to earn Spark Coins</div>
        <div style={{ fontSize: "0.8125rem", color: "#78350F", lineHeight: 1.6 }}>
          Complete lessons (+10 coins) · Finish quests (+30 coins) · Write reflections (+5 coins)<br />Keep your streak (+15 for 3 days, +40 for 7 days)
        </div>
      </div>
    </div>
  );
}
