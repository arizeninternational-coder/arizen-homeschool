"use client";

import { useState, useEffect } from "react";
import {
  Coins, ShoppingBag, Lock, Check, Loader2, Shirt, Sparkles
} from "lucide-react";
import { PageHeader, CoinPill, GradientButton } from "@/components/ui/Pill";
import { FloatingCard, CompactEmpty, CARD_COLORS } from "@/components/ui/FloatingCard";
import { cn } from "@/lib/utils/cn";

// ─── Types ───────────────────────────────────────────────────
interface ShopItem {
  id: string;
  name: string;
  rarity: string;
  category: string;
  cost: number;
  requirement?: string | null;
}

interface InventoryItem {
  avatarItem?: { id: string; name: string; rarity: string; category: string; cost: number; requirement?: string | null };
  avatar_item?: { id: string; name: string; rarity: string; category: string; cost: number; requirement?: string | null };
  equipped?: boolean;
}

// ─── SVG Item Illustrations (polished, semi-3D game style) ──
function ItemIllustration({ name, category, locked, className }: { name: string; category: string; locked?: boolean; className?: string }) {
  const n = name.toLowerCase();

  if (n.includes("soccer") || n.includes("boots")) {
    return (
      <svg viewBox="0 0 100 70" className={className} xmlns="http://www.w3.org/2000/svg">
        <defs><linearGradient id="bootGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#334155"/><stop offset="100%" stopColor="#1E293B"/></linearGradient></defs>
        <path d="M15 22 L42 22 L42 48 Q42 53 37 53 L15 53 Q12 53 12 50 Z" fill="url(#bootGrad)" stroke="#0F172A" strokeWidth="1.5"/>
        <path d="M55 22 L82 22 L82 48 Q82 53 77 53 L55 53 Q52 53 52 50 Z" fill="url(#bootGrad)" stroke="#0F172A" strokeWidth="1.5"/>
        <rect x="13" y="50" width="28" height="8" rx="3" fill="#1E293B"/><rect x="53" y="50" width="28" height="8" rx="3" fill="#1E293B"/>
        <line x1="18" y1="30" x2="36" y2="30" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="18" y1="36" x2="36" y2="36" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="58" y1="30" x2="76" y2="30" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="58" y1="36" x2="76" y2="36" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="36" cy="55" r="2" fill="#94A3B8"/><circle cx="28" cy="55" r="2" fill="#94A3B8"/><circle cx="20" cy="55" r="2" fill="#94A3B8"/>
        <circle cx="76" cy="55" r="2" fill="#94A3B8"/><circle cx="68" cy="55" r="2" fill="#94A3B8"/><circle cx="60" cy="55" r="2" fill="#94A3B8"/>
      </svg>
    );
  }

  if (n.includes("safari") || n.includes("explorer hat")) {
    return (
      <svg viewBox="0 0 100 70" className={className} xmlns="http://www.w3.org/2000/svg">
        <defs><linearGradient id="safariGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#D4A574"/><stop offset="100%" stopColor="#A67C52"/></linearGradient></defs>
        <ellipse cx="50" cy="40" rx="40" ry="10" fill="url(#safariGrad)" stroke="#8B6914" strokeWidth="1.5"/>
        <path d="M25 40 Q25 18 50 14 Q75 18 75 40" fill="#C4956A" stroke="#8B6914" strokeWidth="1.5"/>
        <rect x="23" y="36" width="54" height="6" rx="3" fill="#8B6914"/>
        <ellipse cx="50" cy="22" rx="20" ry="8" fill="#D4A574" opacity="0.4"/>
        <circle cx="50" cy="28" r="3" fill="#A67C52"/>
      </svg>
    );
  }

  if (n.includes("kindness") || n.includes("hoodie")) {
    return (
      <svg viewBox="0 0 100 70" className={className} xmlns="http://www.w3.org/2000/svg">
        <defs><linearGradient id="hoodieGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8B5CF6"/><stop offset="100%" stopColor="#6D28D9"/></linearGradient></defs>
        <rect x="28" y="12" width="44" height="48" rx="10" fill="url(#hoodieGrad)" stroke="#5B21B6" strokeWidth="1.5"/>
        <path d="M36 12 Q40 5 50 3 Q60 5 64 12" fill="url(#hoodieGrad)" stroke="#5B21B6" strokeWidth="1.5"/>
        <line x1="45" y1="9" x2="45" y2="26" stroke="#A78BFA" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="55" y1="9" x2="55" y2="26" stroke="#A78BFA" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M36 38 Q50 34 64 38 L64 50 Q50 46 36 50 Z" fill="#7C3AED" opacity="0.5"/>
        <circle cx="50" cy="24" r="4" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1"/>
        <path d="M48 23 L50 21 L52 23 L50 26 Z" fill="#F59E0B" opacity="0.6"/>
      </svg>
    );
  }

  if (n.includes("reading") || n.includes("glasses")) {
    return (
      <svg viewBox="0 0 100 70" className={className} xmlns="http://www.w3.org/2000/svg">
        <circle cx="36" cy="35" r="13" fill="none" stroke="#37474F" strokeWidth="2.5"/>
        <circle cx="64" cy="35" r="13" fill="none" stroke="#37474F" strokeWidth="2.5"/>
        <circle cx="36" cy="35" r="10" fill="#E0F2FE" opacity="0.3"/>
        <circle cx="64" cy="35" r="10" fill="#E0F2FE" opacity="0.3"/>
        <line x1="49" y1="35" x2="51" y2="35" stroke="#37474F" strokeWidth="2.5"/>
        <line x1="23" y1="33" x2="14" y2="30" stroke="#37474F" strokeWidth="2.5"/>
        <line x1="77" y1="33" x2="86" y2="30" stroke="#37474F" strokeWidth="2.5"/>
        <circle cx="40" cy="30" r="1.5" fill="white" opacity="0.7"/>
        <circle cx="68" cy="30" r="1.5" fill="white" opacity="0.7"/>
      </svg>
    );
  }

  if (n.includes("wizard") || n.includes("math hat")) {
    return (
      <svg viewBox="0 0 100 70" className={className} xmlns="http://www.w3.org/2000/svg">
        <defs><linearGradient id="wizardGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366F1"/><stop offset="100%" stopColor="#4F46E5"/></linearGradient></defs>
        <polygon points="50,3 26,48 74,48" fill="url(#wizardGrad)" stroke="#3730A3" strokeWidth="1.5"/>
        <polygon points="50,3 34,40 66,40" fill="#818CF8" opacity="0.3"/>
        <rect x="24" y="46" width="52" height="6" rx="3" stroke="#3730A3" strokeWidth="1.5" fill="none"/>
        <polygon points="50,5 51.5,11 57,11 53,15 54.5,21 50,17 45.5,21 47,15 43,11 48.5,11" fill="#FBBF24"/>
        <circle cx="42" cy="32" r="1.5" fill="#A78BFA"/><circle cx="58" cy="28" r="1.5" fill="#A78BFA"/>
      </svg>
    );
  }

  if (n.includes("star") && n.includes("backpack")) {
    return (
      <svg viewBox="0 0 100 70" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect x="30" y="10" width="40" height="48" rx="10" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5"/>
        <rect x="34" y="14" width="32" height="28" rx="6" fill="#FBBF24" opacity="0.4"/>
        <polygon points="50,20 53,28 61,28 55,33 57,41 50,37 43,41 45,33 39,28 47,28" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="0.8"/>
        <path d="M36 14 Q28 14 26 30 L26 48" stroke="#D97706" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M64 14 Q72 14 74 30 L74 48" stroke="#D97706" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <rect x="36" y="42" width="28" height="10" rx="4" fill="#FBBF24" opacity="0.6"/>
      </svg>
    );
  }

  if (n.includes("music") || n.includes("headphones")) {
    return (
      <svg viewBox="0 0 100 70" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M22 36 Q22 16 50 12 Q78 16 78 36" stroke="#1E293B" strokeWidth="5" fill="none" strokeLinecap="round"/>
        <rect x="14" y="32" width="12" height="18" rx="6" fill="#1E293B" stroke="#0F172A" strokeWidth="1.5"/>
        <rect x="17" y="35" width="6" height="12" rx="3" fill="#37474F" opacity="0.6"/>
        <circle cx="20" cy="38" r="1.5" fill="#EF4444"/>
        <rect x="74" y="32" width="12" height="18" rx="6" fill="#1E293B" stroke="#0F172A" strokeWidth="1.5"/>
        <rect x="77" y="35" width="6" height="12" rx="3" fill="#37474F" opacity="0.6"/>
        <circle cx="80" cy="38" r="1.5" fill="#EF4444"/>
        <path d="M48 5 Q52 1 56 5" stroke="#EF4444" strokeWidth="1.5" fill="none" opacity="0.6"/>
      </svg>
    );
  }

  if (n.includes("nature") || n.includes("guardian")) {
    return (
      <svg viewBox="0 0 100 70" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect x="30" y="12" width="40" height="46" rx="10" fill="#10B981" stroke="#059669" strokeWidth="1.5"/>
        <rect x="34" y="16" width="32" height="26" rx="6" fill="#34D399" opacity="0.4"/>
        <path d="M50 20 Q60 28 50 42 Q40 28 50 20" fill="#059669"/>
        <path d="M50 24 Q56 30 50 38" stroke="#A7F3D0" strokeWidth="1" fill="none"/>
        <path d="M36 16 Q30 16 28 30 L28 46" stroke="#059669" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M64 16 Q70 16 72 30 L72 46" stroke="#059669" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M30 14 Q26 8 32 10 Q30 12 30 14" fill="#34D399"/>
        <path d="M70 14 Q74 8 68 10 Q70 12 70 14" fill="#34D399"/>
      </svg>
    );
  }

  if (n.includes("scientist") || n.includes("goggles")) {
    return (
      <svg viewBox="0 0 100 70" className={className} xmlns="http://www.w3.org/2000/svg">
        <circle cx="36" cy="35" r="15" fill="none" stroke="#37474F" strokeWidth="3"/>
        <circle cx="64" cy="35" r="15" fill="none" stroke="#37474F" strokeWidth="3"/>
        <circle cx="36" cy="35" r="11" fill="#81D4FA" opacity="0.25"/>
        <circle cx="64" cy="35" r="11" fill="#81D4FA" opacity="0.25"/>
        <line x1="51" y1="33" x2="49" y2="33" stroke="#37474F" strokeWidth="3"/>
        <line x1="21" y1="32" x2="10" y2="28" stroke="#37474F" strokeWidth="3" strokeLinecap="round"/>
        <line x1="79" y1="32" x2="90" y2="28" stroke="#37474F" strokeWidth="3" strokeLinecap="round"/>
        <ellipse cx="32" cy="30" rx="3" ry="2" fill="white" opacity="0.5" transform="rotate(-20 32 30)"/>
        <ellipse cx="60" cy="30" rx="3" ry="2" fill="white" opacity="0.5" transform="rotate(-20 60 30)"/>
      </svg>
    );
  }

  if (n.includes("rabbit") || n.includes("bunny")) {
    return (
      <svg viewBox="0 0 100 70" className={className} xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="50" cy="48" rx="20" ry="16" fill="#F5F5F5" stroke="#E5E7EB" strokeWidth="1.5"/>
        <ellipse cx="50" cy="28" rx="14" ry="12" fill="#F5F5F5" stroke="#E5E7EB" strokeWidth="1.5"/>
        <ellipse cx="40" cy="12" rx="4" ry="12" fill="#F5F5F5" stroke="#E5E7EB" strokeWidth="1" transform="rotate(-10 40 12)"/>
        <ellipse cx="60" cy="12" rx="4" ry="12" fill="#F5F5F5" stroke="#E5E7EB" strokeWidth="1" transform="rotate(10 60 12)"/>
        <ellipse cx="40" cy="12" rx="2" ry="9" fill="#FFB6C1" opacity="0.5" transform="rotate(-10 40 12)"/>
        <ellipse cx="60" cy="12" rx="2" ry="9" fill="#FFB6C1" opacity="0.5" transform="rotate(10 60 12)"/>
        <circle cx="44" cy="26" r="2" fill="#1F2937"/><circle cx="56" cy="26" r="2" fill="#1F2937"/>
        <circle cx="44.8" cy="25.2" r="0.8" fill="white"/><circle cx="56.8" cy="25.2" r="0.8" fill="white"/>
        <ellipse cx="50" cy="32" rx="2.5" ry="1.5" fill="#FFB6C1"/>
        <line x1="36" y1="30" x2="26" y2="28" stroke="#D1D5DB" strokeWidth="0.7"/>
        <line x1="36" y1="33" x2="26" y2="34" stroke="#D1D5DB" strokeWidth="0.7"/>
        <line x1="64" y1="30" x2="74" y2="28" stroke="#D1D5DB" strokeWidth="0.7"/>
        <line x1="64" y1="33" x2="74" y2="34" stroke="#D1D5DB" strokeWidth="0.7"/>
        <circle cx="68" cy="48" r="4" fill="#F5F5F5" stroke="#E5E7EB" strokeWidth="1"/>
      </svg>
    );
  }

  if (n.includes("robot")) {
    return (
      <svg viewBox="0 0 100 70" className={className} xmlns="http://www.w3.org/2000/svg">
        <line x1="50" y1="8" x2="50" y2="18" stroke="#64748B" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="50" cy="6" r="2.5" fill="#EF4444"/>
        <rect x="32" y="18" width="36" height="20" rx="5" fill="#94A3B8" stroke="#64748B" strokeWidth="1.5"/>
        <rect x="37" y="22" width="8" height="6" rx="3" fill="#22D3EE"/>
        <rect x="55" y="22" width="8" height="6" rx="3" fill="#22D3EE"/>
        <circle cx="41" cy="25" r="2" fill="#0F172A"/><circle cx="59" cy="25" r="2" fill="#0F172A"/>
        <rect x="34" y="40" width="32" height="22" rx="4" fill="#94A3B8" stroke="#64748B" strokeWidth="1.5"/>
        <rect x="40" y="44" width="20" height="10" rx="2" fill="#64748B"/>
        <circle cx="44" cy="48" r="1.5" fill="#10B981"/><circle cx="50" cy="48" r="1.5" fill="#EF4444"/><circle cx="56" cy="48" r="1.5" fill="#FBBF24"/>
        <rect x="24" y="42" width="8" height="14" rx="4" fill="#94A3B8" stroke="#64748B" strokeWidth="1"/>
        <rect x="68" y="42" width="8" height="14" rx="4" fill="#94A3B8" stroke="#64748B" strokeWidth="1"/>
      </svg>
    );
  }

  if (n.includes("crown") || n.includes("creative")) {
    return (
      <svg viewBox="0 0 100 70" className={className} xmlns="http://www.w3.org/2000/svg">
        <polygon points="18,44 25,17 38,29 50,8 62,29 75,17 82,44" fill="#F5A524" stroke="#D97706" strokeWidth="1.5"/>
        <rect x="18" y="42" width="64" height="7" rx="3.5" fill="#E5A520" stroke="#D97706" strokeWidth="1.5"/>
        <circle cx="25" cy="21" r="3" fill="#EF4444"/><circle cx="50" cy="10" r="4" fill="#3B82F6"/><circle cx="75" cy="21" r="3" fill="#10B981"/>
        <circle cx="38" cy="31" r="2" fill="#8B5CF6"/><circle cx="62" cy="31" r="2" fill="#F472B6"/>
        <polygon points="50,3 51.5,8 56,8 52.5,11 53.5,15 50,12 46.5,15 47.5,11 44,8 48.5,8" fill="#FEF3C7" opacity="0.8"/>
      </svg>
    );
  }

  if (n.includes("storyteller") || n.includes("cape")) {
    return (
      <svg viewBox="0 0 100 70" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M30 14 Q35 14 38 18 L38 52 Q30 56 20 50 Q22 24 30 14" fill="#7C3AED" stroke="#5B21B6" strokeWidth="1.5"/>
        <path d="M70 14 Q65 14 62 18 L62 52 Q70 56 80 50 Q78 24 70 14" fill="#7C3AED" stroke="#5B21B6" strokeWidth="1.5"/>
        <path d="M30 10 Q50 6 70 10 Q60 14 50 12 Q40 14 30 10" fill="#8B5CF6" stroke="#6D28D9" strokeWidth="1"/>
        <circle cx="35" cy="32" r="1.5" fill="#FBBF24" opacity="0.7"/><circle cx="65" cy="35" r="1.5" fill="#FBBF24" opacity="0.5"/>
        <rect x="44" y="28" width="12" height="9" rx="1" fill="#FBBF24" stroke="#F59E0B" strokeWidth="0.7"/>
      </svg>
    );
  }

  if (n.includes("artist") || n.includes("brush")) {
    return (
      <svg viewBox="0 0 100 70" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect x="46" y="22" width="8" height="38" rx="3" fill="#B45309" stroke="#92400E" strokeWidth="1"/>
        <rect x="44" y="18" width="12" height="7" rx="2" fill="#94A3B8" stroke="#64748B" strokeWidth="1"/>
        <path d="M44 18 Q40 8 42 3 Q48 -2 50 8 Q52 -2 58 3 Q60 8 56 18" fill="#EF4444" stroke="#DC2626" strokeWidth="1"/>
        <circle cx="36" cy="32" r="2.5" fill="#3B82F6" opacity="0.4"/><circle cx="64" cy="40" r="2" fill="#22C55E" opacity="0.4"/><circle cx="34" cy="46" r="1.8" fill="#F59E0B" opacity="0.4"/>
      </svg>
    );
  }

  if (n.includes("telescope") || n.includes("globe")) {
    return (
      <svg viewBox="0 0 100 70" className={className} xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="28" r="18" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="1.5"/>
        <ellipse cx="50" cy="28" rx="18" ry="6" fill="none" stroke="#1D4ED8" strokeWidth="0.8" opacity="0.5"/>
        <ellipse cx="50" cy="28" rx="6" ry="18" fill="none" stroke="#1D4ED8" strokeWidth="0.8" opacity="0.5"/>
        <path d="M38 23 Q42 18 48 22 Q50 26 46 30 Q42 28 38 23" fill="#22C55E"/>
        <path d="M52 30 Q56 26 60 30 Q58 36 54 34 Q52 32 52 30" fill="#22C55E"/>
        <rect x="47" y="44" width="6" height="14" rx="3" fill="#92400E" stroke="#78350F" strokeWidth="1"/>
        <ellipse cx="50" cy="58" rx="12" ry="3" fill="#B45309" stroke="#92400E" strokeWidth="1"/>
      </svg>
    );
  }

  // Default
  return (
    <svg viewBox="0 0 100 70" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="25" y="15" width="50" height="40" rx="8" fill="#E0E7FF" stroke="#A5B4FC" strokeWidth="1.5"/>
      <polygon points="50,25 53,33 61,33 55,38 57,46 50,42 43,46 45,38 39,33 47,33" fill="#6366F1" opacity="0.7"/>
    </svg>
  );
}

// ─── Main Shop Page ──────────────────────────────────────────
const CATEGORIES = ["all", "hats", "clothing", "accessories", "shoes", "tools", "pets", "backgrounds"];
const RARITY_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; glow: string }> = {
  common:    { label: "COMMON",    color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", glow: "" },
  rare:      { label: "RARE",      color: "text-blue-700",    bg: "bg-blue-50",    border: "border-blue-200",    glow: "" },
  epic:      { label: "EPIC",      color: "text-purple-700",  bg: "bg-purple-50",  border: "border-purple-200",  glow: "shadow-[0_0_12px_rgba(139,92,246,0.15)]" },
  legendary: { label: "LEGENDARY", color: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-200",   glow: "shadow-[0_0_15px_rgba(245,165,36,0.2)]" },
};

export default function ShopPage() {
  const [coins, setCoins] = useState(0);
  const [category, setCategory] = useState("all");
  const [filter, setFilter] = useState("all");
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [items, setItems] = useState<ShopItem[]>([]);
  const [buying, setBuying] = useState<string | null>(null);
  const [equipping, setEquipping] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [itemsRes, walletRes, invRes] = await Promise.all([
          fetch("/api/shop/items", { credentials: "include" }),
          fetch("/api/coins/wallet", { credentials: "include" }),
          fetch("/api/shop/inventory", { credentials: "include" }),
        ]);
        if (itemsRes.ok) setItems((await itemsRes.json()).items || []);
        else setLoadError("Failed to load shop items.");
        if (walletRes.ok) setCoins((await walletRes.json()).wallet?.balance || walletRes.json().then(d => d.balance) || 0);
        if (invRes.ok) setInventory((await invRes.json()).inventory || []);
        setLoading(false);
      } catch { setLoadError("Failed to load shop."); setLoading(false); }
    }
    loadData();
  }, []);

  const ownedItems = inventory.map(i => i.avatarItem?.id || i.avatar_item?.id).filter(Boolean) as string[];
  const equippedItems = inventory.filter(i => i.equipped).map(i => i.avatarItem?.id || i.avatar_item?.id).filter(Boolean) as string[];

  const filtered = items.filter(item => {
    if (category !== "all" && item.category !== category) return false;
    if (filter === "owned" && !ownedItems.includes(item.id)) return false;
    if (filter === "locked" && (!item.requirement || ownedItems.includes(item.id))) return false;
    if (filter === "available" && (item.requirement || ownedItems.includes(item.id))) return false;
    return true;
  });

  const handleBuy = async (item: ShopItem) => {
    if (ownedItems.includes(item.id)) return;
    if (coins < item.cost) { setMessage({ type: "error", text: "Not enough coins!" }); return; }
    if (item.requirement) { setMessage({ type: "error", text: `Requirement: ${item.requirement}` }); return; }
    setBuying(item.id);
    try {
      const res = await fetch("/api/shop/buy", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ itemId: item.id }) });
      const data = await res.json();
      if (data.success) {
        setCoins(prev => prev - item.cost);
        setInventory(prev => prev.concat({ avatarItem: item, equipped: false }));
        setMessage({ type: "success", text: `Purchased ${item.name}!` });
      } else { setMessage({ type: "error", text: data.error || "Purchase failed." }); }
    } catch { setMessage({ type: "error", text: "Purchase failed." }); }
    setBuying(null);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleEquip = async (item: ShopItem) => {
    setEquipping(item.id);
    try {
      const res = await fetch("/api/avatar/equip", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ itemId: item.id }) });
      const data = await res.json();
      if (data.success) {
        setInventory(prev => prev.map(inv => {
          const invId = inv.avatarItem?.id || inv.avatar_item?.id;
          if (invId === item.id) return { ...inv, equipped: true };
          const invItem = inv.avatarItem || inv.avatar_item;
          if (invItem?.category === item.category) return { ...inv, equipped: false };
          return inv;
        }));
        setMessage({ type: "success", text: `Equipped ${item.name}!` });
      } else { setMessage({ type: "error", text: data.error || "Failed to equip." }); }
    } catch { setMessage({ type: "error", text: "Failed to equip." }); }
    setEquipping(null);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleUnequip = async (item: ShopItem) => {
    setEquipping(item.id);
    try {
      const res = await fetch("/api/avatar/unequip", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ itemId: item.id }) });
      const data = await res.json();
      if (data.success) {
        setInventory(prev => prev.map(inv => {
          const invId = inv.avatarItem?.id || inv.avatar_item?.id;
          if (invId === item.id) return { ...inv, equipped: false };
          return inv;
        }));
        setMessage({ type: "success", text: `Unequipped ${item.name}.` });
      } else { setMessage({ type: "error", text: data.error || "Failed to unequip." }); }
    } catch { setMessage({ type: "error", text: "Failed to unequip." }); }
    setEquipping(null);
    setTimeout(() => setMessage(null), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-[3px] border-primary/15" />
            <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-primary animate-spin" />
          </div>
          <p className="text-sm font-bold text-text-muted">Loading shop...</p>
        </div>
      </div>
    );
  }

  if (loadError) return <CompactEmpty icon={<ShoppingBag size={28} />} title={loadError} />;

  return (
    <div>
      <PageHeader title="Avatar Shop" subtitle="Use Spark Coins to unlock outfits, tools, pets, and accessories." />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <CoinPill coins={coins} />
        <div className="flex gap-1 ml-auto">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} className={cn("px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize transition-all cursor-pointer border", category === cat ? "bg-primary text-white border-primary" : "bg-white text-text-muted border-border-soft hover:border-primary/20")}>{cat}</button>
          ))}
        </div>
      </div>

      {message && (
        <div className={cn("px-4 py-2.5 rounded-2xl mb-4 text-sm font-bold border", message.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800")}>{message.text}</div>
      )}

      {/* Items Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map(item => {
          const owned = ownedItems.includes(item.id);
          const equipped = equippedItems.includes(item.id);
          const locked = !!item.requirement && !owned;
          const rarity = RARITY_CONFIG[item.rarity] || RARITY_CONFIG.common;
          const canBuy = !owned && !locked && coins >= item.cost;

          return (
            <FloatingCard key={item.id} className={cn("!p-3", rarity.glow)}>
              {/* Illustration */}
              <div className={cn("h-20 flex items-center justify-center rounded-xl mb-2", rarity.bg)}>
                <ItemIllustration name={item.name} category={item.category} locked={locked} className="w-20 h-14" />
              </div>

              {/* Info */}
              <h4 className="text-xs font-extrabold text-text leading-tight mb-0.5 truncate">{item.name}</h4>
              <span className={cn("inline-block px-1.5 py-0.5 rounded text-[8px] font-extrabold tracking-wider mb-1.5", rarity.bg, rarity.color)}>{rarity.label}</span>

              {/* Action */}
              {equipped ? (
                <button onClick={() => handleUnequip(item)} disabled={equipping === item.id} className="w-full py-1.5 rounded-xl text-[10px] font-bold border border-secondary/20 bg-secondary/5 text-secondary hover:bg-secondary/10 transition-all cursor-pointer disabled:opacity-50">
                  {equipping === item.id ? "..." : "✓ Equipped"}
                </button>
              ) : owned ? (
                <button onClick={() => handleEquip(item)} disabled={equipping === item.id} className="w-full py-1.5 rounded-xl text-[10px] font-bold bg-primary text-white hover:brightness-110 transition-all cursor-pointer disabled:opacity-50">
                  {equipping === item.id ? "..." : "Equip"}
                </button>
              ) : locked ? (
                <div className="flex items-center gap-1 justify-center py-1.5 text-[10px] font-bold text-text-muted">
                  <Lock size={10} /> <span>{item.requirement}</span>
                </div>
              ) : (
                <button onClick={() => handleBuy(item)} disabled={!canBuy || buying === item.id} className="w-full py-1.5 rounded-xl text-[10px] font-bold bg-gold-soft text-amber-800 border border-gold/20 hover:bg-gold-soft/80 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1">
                  {buying === item.id ? "..." : <><span>🪙</span> {item.cost}</>}
                </button>
              )}
            </FloatingCard>
          );
        })}
      </div>

      {filtered.length === 0 && <CompactEmpty icon={<ShoppingBag size={28} />} title="No items match your filters" description="Try changing the category or filter." />}
    </div>
  );
}
