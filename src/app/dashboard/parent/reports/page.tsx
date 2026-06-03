"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ClipboardList, ArrowLeft } from "lucide-react";
import { EmptyStateCard } from "@/components/ui/Pill";

export default function ParentReportsPage() {
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetch("/api/auth/session").then(r=>r.json()).catch(()=>{}).finally(()=>setLoading(false)); }, []);
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
      <div className="max-w-[900px] mx-auto px-4 lg:px-8 py-8">
        <Link href="/dashboard/parent" className="inline-flex items-center gap-2 text-text-muted text-sm font-semibold mb-6 hover:text-text transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <h1 className="text-2xl font-extrabold text-text mb-2">Reports</h1>
        <p className="text-text-muted mb-8">Learning reports and activity summaries.</p>
        <EmptyStateCard
          icon={<ClipboardList className="w-8 h-8" />}
          title="No reports yet"
          description="Reports will be generated as your children complete learning activities."
        />
      </div>
    </div>
  );
}
