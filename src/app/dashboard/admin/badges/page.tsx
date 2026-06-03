"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Award, ArrowLeft, Plus, Search, AlertCircle, Edit, Trash2, X, Check, Star, Zap, Target, BookOpen, Heart, Shield, Loader2 } from "lucide-react";
import { PageHeader, GradientButton, EmptyStateCard } from "@/components/ui/Pill";
import { StarIcon } from "@/components/ui/Illustrations";

const BADGE_ICONS = [
  { value: "star", label: "Star", Icon: Star },
  { value: "zap", label: "Zap", Icon: Zap },
  { value: "target", label: "Target", Icon: Target },
  { value: "book", label: "Book", Icon: BookOpen },
  { value: "heart", label: "Heart", Icon: Heart },
  { value: "shield", label: "Shield", Icon: Shield },
  { value: "award", label: "Award", Icon: Award },
];

interface BadgeRecord {
  id: string;
  name?: string;
  badgeType?: string;
  description: string | null;
  imageUrl?: string;
  icon?: string;
  xpReward?: number;
  unlockCondition?: string;
  status?: string;
  awardedAt?: string;
  createdAt?: string;
  learner?: {
    displayName: string;
    grade: number;
  } | null;
}

export default function AdminBadgesPage() {
  const [badges, setBadges] = useState<BadgeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [createIcon, setCreateIcon] = useState("star");
  const [createXp, setCreateXp] = useState("50");
  const [createCondition, setCreateCondition] = useState("");
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [templates, setTemplates] = useState<BadgeRecord[]>([]);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/badges", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setBadges(data.badges || []);
      } else {
        const errBody = await res.json().catch(() => ({}));
        setError(errBody.error || "Failed to load badges");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load badges");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!createName.trim()) return;
    setCreating(true);
    setCreateMsg(null);
    try {
      const res = await fetch("/api/admin/badges", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createName.trim(),
          description: createDesc.trim(),
          icon: createIcon,
          xpReward: parseInt(createXp) || 50,
          unlockCondition: createCondition.trim() || "Complete assigned tasks",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateMsg({ type: "error", text: data.error || "Failed to create badge" });
      } else {
        const newBadge: BadgeRecord = {
          id: data.badge.id,
          name: data.badge.name,
          description: data.badge.description,
          icon: data.badge.badgeType,
          status: "active",
          createdAt: new Date().toISOString(),
        };
        setTemplates(prev => [newBadge, ...prev]);
        setCreateMsg({ type: "success", text: `Badge "${data.badge.name}" created!` });
        setCreateName("");
        setCreateDesc("");
        setCreateXp("50");
        setCreateCondition("");
        setShowCreate(false);
      }
    } catch (err: any) {
      setCreateMsg({ type: "error", text: err.message || "Failed to create badge" });
    } finally {
      setCreating(false);
    }
  }

  function handleDeleteTemplate(id: string) {
    if (!confirm("Delete this badge template?")) return;
    setTemplates(prev => prev.filter(b => b.id !== id));
  }

  const allBadges = [...templates, ...badges];
  const filtered = allBadges.filter(b => {
    if (filterStatus !== "all" && b.status !== filterStatus && b.status !== filterStatus?.toLowerCase()) return false;
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (b.name || b.badgeType || "").toLowerCase().includes(s) || (b.description || "").toLowerCase().includes(s);
  });

  return (
    <div className="min-h-screen bg-bg-main">
      <div className="max-w-[1100px] mx-auto py-8 px-6">
        {/* Top bar */}
        <div className="flex justify-between items-center mb-6">
          <Link href="/dashboard/admin" className="inline-flex items-center gap-2 text-text-muted hover:text-text text-sm font-semibold transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Admin Dashboard
          </Link>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border-soft text-text-muted hover:bg-white hover:border-primary/30 cursor-pointer text-xs font-semibold transition-all">
            Sign Out
          </button>
        </div>

        {/* Header */}
        <PageHeader title="Badges" subtitle={`${allBadges.length} badges — ${templates.length} templates, ${badges.length} awarded`}>
          <div className="mt-4">
            <GradientButton variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setShowCreate(!showCreate)}>
              Create Badge
            </GradientButton>
          </div>
        </PageHeader>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-2xl mb-6 bg-amber-50 border border-amber-200 text-amber-800 text-sm font-semibold">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        {/* Create Form */}
        {showCreate && (
          <div className="rounded-[1.75rem] border border-border-soft bg-white p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-text">Create Badge Template</h2>
              <button onClick={() => { setShowCreate(false); setCreateMsg(null); }} className="text-text-muted hover:text-text transition-colors cursor-pointer p-1 rounded-lg hover:bg-bg-main"><X className="w-5 h-5" /></button>
            </div>
            {createMsg && (
              <div className={`flex items-center gap-2 p-3 rounded-2xl mb-4 text-sm font-semibold ${createMsg.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                {createMsg.type === "success" ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                {createMsg.text}
              </div>
            )}
            <form onSubmit={handleCreate} className="flex flex-col gap-3">
              <input type="text" value={createName} onChange={e => setCreateName(e.target.value)} placeholder="Badge name * (e.g. 'Math Whiz', 'Reading Star')" required className="w-full px-4 py-2.5 rounded-2xl text-sm font-medium text-text bg-bg-main border border-border-soft placeholder:text-text-muted/60 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all" />
              <textarea value={createDesc} onChange={e => setCreateDesc(e.target.value)} placeholder="Description — what does this badge represent?" rows={2} className="w-full px-4 py-2.5 rounded-2xl text-sm font-medium text-text bg-bg-main border border-border-soft placeholder:text-text-muted/60 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all resize-y" />
              <div className="flex gap-3 flex-wrap">
                <select value={createIcon} onChange={e => setCreateIcon(e.target.value)} className="px-4 py-2.5 rounded-2xl text-sm font-medium text-text bg-bg-main border border-border-soft focus:outline-none focus:border-primary/40 transition-all min-w-[140px]">
                  {BADGE_ICONS.map(({ value, label }) => <option key={value} value={value}>Icon: {label}</option>)}
                </select>
                <input type="number" value={createXp} onChange={e => setCreateXp(e.target.value)} placeholder="XP Reward" min="0" className="px-4 py-2.5 rounded-2xl text-sm font-medium text-text bg-bg-main border border-border-soft placeholder:text-text-muted/60 focus:outline-none focus:border-primary/40 transition-all w-[120px]" />
                <input type="text" value={createCondition} onChange={e => setCreateCondition(e.target.value)} placeholder="Unlock condition (e.g. 'Complete 5 math lessons')" className="px-4 py-2.5 rounded-2xl text-sm font-medium text-text bg-bg-main border border-border-soft placeholder:text-text-muted/60 focus:outline-none focus:border-primary/40 transition-all flex-1 min-w-[200px]" />
              </div>
              <button type="submit" disabled={creating} className="self-start">
                <GradientButton variant="primary" size="sm" disabled={creating}>
                  {creating ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : "Create Badge"}
                </GradientButton>
              </button>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input placeholder="Search badges..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm font-medium text-text bg-white border border-border-soft placeholder:text-text-muted/60 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-4 py-2.5 rounded-2xl text-sm font-medium text-text bg-white border border-border-soft focus:outline-none focus:border-primary/40 transition-all min-w-[120px]">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {/* Content */}
        {loading ? (
          <div className="rounded-[1.75rem] border border-border-soft bg-white p-12 text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
            <p className="text-text-muted text-sm font-medium">Loading badges...</p>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyStateCard
            icon={<StarIcon size={48} />}
            title={search ? "No badges match your search" : "No badges yet"}
            description={search ? "Try a different search term." : "Create your first badge template using the button above."}
          />
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map(badge => {
              const iconData = BADGE_ICONS.find(i => i.value === (badge.icon || "star")) || BADGE_ICONS[0];
              const IconComp = iconData.Icon;
              return (
                <div key={badge.id} className="rounded-[1.75rem] border border-border-soft bg-white p-4 flex items-center gap-4 hover:shadow-[0_4px_20px_rgba(15,23,42,0.06)] transition-all">
                  <div className="w-11 h-11 rounded-2xl bg-primary-soft flex items-center justify-center flex-shrink-0">
                    <IconComp className="w-[22px] h-[22px] text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-text text-sm">{badge.name || badge.badgeType || "Unnamed Badge"}</div>
                    <div className="text-xs text-text-muted mt-0.5">
                      {badge.description || "No description"}
                    </div>
                  </div>
                  {badge.learner && (
                    <span className="text-[0.6875rem] text-text-muted flex-shrink-0">
                      Awarded to: {badge.learner.displayName} (Gr.{badge.learner.grade})
                    </span>
                  )}
                  <span className={`text-[0.6875rem] font-bold px-2 py-1 rounded-lg flex-shrink-0 uppercase ${
                    (badge.status === "active" || !badge.status) ? "text-emerald-700 bg-emerald-50" : "text-text-muted bg-bg-main"
                  }`}>{badge.status || "active"}</span>
                  {templates.includes(badge) && (
                    <button onClick={() => handleDeleteTemplate(badge.id)} className="text-text-muted hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-all flex-shrink-0 cursor-pointer" title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
