"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Users, ArrowLeft, Plus, Search, Shield, UserCheck, GraduationCap, Mail, Calendar, Loader2 } from "lucide-react";
import { PageHeader, StatCard, EmptyStateCard } from "@/components/ui/Pill";
import { GradientButton } from "@/components/ui/Pill";

interface UserRecord {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  createdAt: string;
  learnerProfile?: {
    grade: number;
    displayName: string;
    totalXp: number;
  } | null;
}

const roleIcons: Record<string, any> = {
  ADMIN: Shield,
  PARENT: UserCheck,
  LEARNER: GraduationCap,
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/users", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users || []);
        } else {
          const errBody = await res.json().catch(() => ({}));
          setError(errBody.error || "Failed to load users");
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = users.filter(u => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (u.name || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q);
  });

  const adminCount = users.filter(u => u.role === "ADMIN").length;
  const parentCount = users.filter(u => u.role === "PARENT").length;
  const learnerCount = users.filter(u => u.role === "LEARNER").length;

  return (
    <div className="min-h-screen bg-bg-main">
      <div className="max-w-[1000px] mx-auto py-8 px-6">
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
        <PageHeader title="Users" subtitle={`${users.length} total users in the system`}>
          <div className="mt-4">
            <GradientButton variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} disabled>
              Add User
            </GradientButton>
          </div>
        </PageHeader>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard label="Admins" value={adminCount} gradient="bg-card-gradient-gold" borderColor="border-gold/20" textColor="text-amber-700" icon={<Shield className="w-5 h-5 text-gold" />} />
          <StatCard label="Parents" value={parentCount} gradient="bg-card-gradient-purple" borderColor="border-accent-purple/20" textColor="text-primary-dark" icon={<UserCheck className="w-5 h-5 text-accent-purple" />} />
          <StatCard label="Learners" value={learnerCount} gradient="bg-card-gradient-green" borderColor="border-secondary/20" textColor="text-emerald-700" icon={<GraduationCap className="w-5 h-5 text-emerald-600" />} />
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm font-medium text-text bg-white border border-border-soft placeholder:text-text-muted/60 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-2xl mb-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm font-semibold">
            {error}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="rounded-[1.75rem] border border-border-soft bg-white p-12 text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
            <p className="text-text-muted text-sm font-medium">Loading users...</p>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyStateCard
            icon={<Users size={48} />}
            title={search ? "No users match your search" : "No users found"}
            description={search ? "Try a different search term." : "Users will appear here once they register."}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((u) => {
              const RoleIcon = roleIcons[u.role] || Users;
              const roleColor = u.role === "ADMIN" ? "text-gold" : u.role === "PARENT" ? "text-accent-purple" : "text-emerald-600";
              const roleBg = u.role === "ADMIN" ? "bg-amber-50" : u.role === "PARENT" ? "bg-primary-soft" : "bg-emerald-50";
              return (
                <div key={u.id} className="rounded-[1.75rem] border border-border-soft bg-white p-4 flex items-center gap-4 hover:shadow-[0_4px_20px_rgba(15,23,42,0.06)] transition-all">
                  <div className={`w-11 h-11 rounded-full ${roleBg} flex items-center justify-center flex-shrink-0`}>
                    <RoleIcon className={`w-5 h-5 ${roleColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-text text-sm">{u.name || "Unnamed User"}</div>
                    <div className="flex items-center gap-1.5 text-xs text-text-muted mt-0.5">
                      <Mail className="w-3 h-3" /> {u.email || "No email"}
                    </div>
                    {u.learnerProfile && (
                      <div className="text-xs text-text-muted mt-1">
                        Grade {u.learnerProfile.grade} · {u.learnerProfile.totalXp} XP
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[0.6875rem] font-bold px-2 py-1 rounded-lg ${
                      u.role === "ADMIN" ? "text-amber-700 bg-amber-50" :
                      u.role === "PARENT" ? "text-accent-purple bg-primary-soft" :
                      "text-emerald-700 bg-emerald-50"
                    }`}>
                      {u.role}
                    </span>
                  </div>
                  {u.createdAt && (
                    <div className="flex items-center gap-1 text-[0.6875rem] text-text-muted flex-shrink-0">
                      <Calendar className="w-3 h-3" />
                      {new Date(u.createdAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 p-4 rounded-2xl bg-bg-main text-xs text-text-muted">
          <strong>Note:</strong> New users can be created via the <Link href="/auth/register" className="text-primary font-semibold hover:underline">registration page</Link>. User management CRUD (edit, delete, role changes) is coming soon.
        </div>
      </div>
    </div>
  );
}
