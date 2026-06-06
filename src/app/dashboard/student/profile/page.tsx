"use client";

import { Sparkles } from "lucide-react";
import { PageHeader } from "@/components/ui/Pill";

export default function StudentProfile() {
  return (
    <div className="space-y-6">
      <PageHeader title="My Profile" subtitle="Your learning stats and settings" />
      <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-[0_4px_15px_rgba(245,158,11,0.3)]">
          <Sparkles size={28} className="text-white" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-extrabold uppercase tracking-wider mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          Coming Soon
        </div>
        <h2 className="text-xl font-extrabold text-text mb-2">We're Preparing This Feature</h2>
        <p className="text-text-muted text-sm max-w-md mx-auto">Your profile page is being enhanced. Check back soon for more stats and customization!</p>
      </div>
    </div>
  );
}
