"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Settings, ArrowLeft, Bell, Shield, User, Mail, Eye } from "lucide-react";

export default function ParentSettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetch("/api/auth/session").then(r=>r.json()).then(d=>{if(d?.user)setUser(d.user);}).catch(()=>{}).finally(()=>setLoading(false)); }, []);
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-bg-main">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-[3px] border-secondary/15" />
          <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-secondary animate-spin" />
        </div>
        <p className="text-sm font-bold text-text-muted">Loading...</p>
      </div>
    </div>
  );
  return (
    <div className="min-h-screen bg-bg-main">
      <div className="max-w-[600px] mx-auto px-4 lg:px-8 py-8">
        <Link href="/dashboard/parent" className="inline-flex items-center gap-2 text-text-muted text-sm font-semibold mb-6 hover:text-text transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <h1 className="text-2xl font-extrabold text-text mb-8">Settings</h1>
        <div className="rounded-2xl border border-white/60 bg-white p-6 lg:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_4px_12px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/60">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary to-secondary-dark flex items-center justify-center text-white text-xl font-extrabold shadow-[0_4px_15px_rgba(0,168,132,0.2)]">
              {(user?.name || "P").charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-text">{user?.name || "Parent"}</div>
              <div className="text-sm text-text-muted">{user?.email}</div>
            </div>
          </div>
          <div className="space-y-0">
            <div className="flex justify-between items-center py-4 border-b border-white/60/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-accent-blue-soft flex items-center justify-center">
                  <Mail className="w-4 h-4 text-accent-blue" />
                </div>
                <div>
                  <div className="font-semibold text-text text-sm">Email Notifications</div>
                  <div className="text-xs text-text-muted">Receive updates about your children&apos;s progress</div>
                </div>
              </div>
              <div className="w-11 h-6 rounded-full bg-border-soft relative cursor-default">
                <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm" />
              </div>
            </div>
            <div className="flex justify-between items-center py-4 border-b border-white/60/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gold-soft/50 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-gold" />
                </div>
                <div>
                  <div className="font-semibold text-text text-sm">Weekly Summary</div>
                  <div className="text-xs text-text-muted">Get a weekly activity report</div>
                </div>
              </div>
              <div className="w-11 h-6 rounded-full bg-secondary relative cursor-default">
                <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white shadow-sm" />
              </div>
            </div>
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-accent-purple-soft flex items-center justify-center">
                  <Eye className="w-4 h-4 text-accent-purple" />
                </div>
                <div>
                  <div className="font-semibold text-text text-sm">Profile Visibility</div>
                  <div className="text-xs text-text-muted">Visible to your guild</div>
                </div>
              </div>
              <div className="w-11 h-6 rounded-full bg-secondary relative cursor-default">
                <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white shadow-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
