"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Users, ArrowLeft, Plus, Search, Shield, UserCheck, GraduationCap, Mail, Calendar } from "lucide-react";
import { ds, colors } from "@/lib/design-system";

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

const roleColors: Record<string, string> = {
  ADMIN: colors.warning || "#F59E0B",
  PARENT: colors.accent,
  LEARNER: colors.success,
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/users");
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

  return (
    <div style={{ minHeight: "100vh", background: colors.bg }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem 1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <Link href="/dashboard/admin" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: colors.textMuted, textDecoration: "none", fontSize: "0.875rem", fontWeight: 600 }}>
            <ArrowLeft style={{ width: 16, height: 16 }} /> Back to Admin Dashboard
          </Link>
          <button onClick={() => signOut()} style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.375rem 0.75rem", borderRadius: 8, border: `1px solid ${colors.border}`, background: "none", color: colors.textMuted, cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600 }}>
            Sign Out
          </button>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: colors.text, marginBottom: "0.25rem" }}>Users</h1>
            <p style={{ color: colors.textMuted }}>{users.length} total users in the system</p>
          </div>
          <button style={{ ...ds.btnPrimary, fontSize: "0.875rem", padding: "0.625rem 1.25rem", cursor: "default" }}>
            <Plus style={{ width: 14, height: 14 }} /> Add User
          </button>
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: "1.5rem" }}>
          <Search style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: colors.textMuted }} />
          <input
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...ds.input, paddingLeft: "2.5rem", fontSize: "0.875rem" }}
          />
        </div>

        {error && (
          <div style={{ padding: "0.75rem 1rem", borderRadius: 10, marginBottom: "1rem", background: `${colors.warning || "#F59E0B"}15`, border: `1px solid ${colors.warning || "#F59E0B"}30`, color: colors.warning || "#B45309", fontSize: "0.875rem", fontWeight: 600 }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ ...ds.card, textAlign: "center", padding: "3rem 2rem", color: colors.textMuted }}>Loading users...</div>
        ) : filtered.length === 0 ? (
          <div style={{ ...ds.card, textAlign: "center", padding: "3rem 2rem" }}>
            <Users style={{ width: 48, height: 48, color: colors.textMuted, margin: "0 auto 1rem", opacity: 0.4 }} />
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: colors.text, marginBottom: "0.5rem" }}>
              {search ? "No users match your search" : "No users found"}
            </h3>
            <p style={{ color: colors.textMuted, fontSize: "0.9375rem" }}>
              {search ? "Try a different search term." : "Users will appear here once they register."}
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {filtered.map((u) => {
              const RoleIcon = roleIcons[u.role] || Users;
              const roleColor = roleColors[u.role] || colors.textMuted;
              return (
                <div key={u.id} style={{ ...ds.card, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: `${roleColor}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <RoleIcon style={{ width: 20, height: 20, color: roleColor }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: colors.text, fontSize: "0.9375rem" }}>{u.name || "Unnamed User"}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8125rem", color: colors.textMuted, marginTop: "0.125rem" }}>
                      <Mail style={{ width: 12, height: 12 }} /> {u.email || "No email"}
                    </div>
                    {u.learnerProfile && (
                      <div style={{ fontSize: "0.75rem", color: colors.textMuted, marginTop: "0.25rem" }}>
                        Grade {u.learnerProfile.grade} · {u.learnerProfile.totalXp} XP
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
                    <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: roleColor, background: `${roleColor}15`, padding: "0.2rem 0.5rem", borderRadius: 6 }}>
                      {u.role}
                    </span>
                  </div>
                  {u.createdAt && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.6875rem", color: colors.textMuted, flexShrink: 0 }}>
                      <Calendar style={{ width: 10, height: 10 }} />
                      {new Date(u.createdAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: "1.5rem", padding: "1rem", borderRadius: 10, background: colors.bgAlt, fontSize: "0.8125rem", color: colors.textMuted }}>
          <strong>Note:</strong> New users can be created via the <Link href="/auth/register" style={{ color: colors.primary, fontWeight: 600 }}>registration page</Link>. User management CRUD (edit, delete, role changes) is coming soon.
        </div>
      </div>
    </div>
  );
}
