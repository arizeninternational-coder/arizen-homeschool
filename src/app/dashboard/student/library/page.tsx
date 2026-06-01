"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { Library, FileText, BookOpen, ClipboardList, Heart, Users, Download, Search } from "lucide-react";

const C = {
  page: "#F7FBF7", teal: "#047A70", dark: "#0F172A", body: "#64748B",
  white: "#FFFFFF", border: "#E2E8F0",
};

const CATEGORIES = [
  { key: "learning", label: "Learning Materials", icon: BookOpen, color: "#EFF6FF", accent: "#2563EB", desc: "Lesson materials and curriculum resources" },
  { key: "reports", label: "Reports", icon: FileText, color: "#ECFDF5", accent: "#059669", desc: "Progress reports and assessments" },
  { key: "assignments", label: "Assignments", icon: ClipboardList, color: "#FFFBEB", accent: "#D97706", desc: "Homework and assigned work" },
  { key: "reflections", label: "Reflections", icon: Heart, color: "#FFF1F2", accent: "#E11D48", desc: "Personal reflections and journal entries" },
  { key: "parent", label: "Parent Notes", icon: Users, color: "#EDE9FE", accent: "#6D28D9", desc: "Notes and communications from parents" },
];

export default function LibraryPage() {
  const [activeCategory, setActiveCategory] = useState("learning");
  const [searchQuery, setSearchQuery] = useState("");

  const activeCat = CATEGORIES.find(c => c.key === activeCategory) || CATEGORIES[0];
  const ActiveIcon = activeCat.icon;

  return (
    <div style={{ padding: "28px 32px 40px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: C.dark, margin: "0 0 4px" }}>
          <Library size={28} style={{ display: "inline", verticalAlign: "middle", marginRight: 10, color: C.teal }} />
          Library
        </h1>
        <p style={{ color: C.body, fontSize: "0.9375rem", margin: 0 }}>Access learning materials, reports, and resources.</p>
      </div>

      {/* Category tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.key;
          return (
            <button key={cat.key} onClick={() => setActiveCategory(cat.key)} style={{
              padding: "10px 18px", borderRadius: 12, border: isActive ? "2px solid " + cat.accent : "1px solid " + C.border,
              background: isActive ? cat.color : C.white, color: isActive ? cat.accent : C.dark,
              fontWeight: 700, fontSize: "0.8125rem", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <Icon size={16} /> {cat.label}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 16px", borderRadius: 14, background: C.white, border: "1px solid " + C.border,
        }}>
          <Search size={18} style={{ color: C.muted }} />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={`Search in ${activeCat.label.toLowerCase()}...`}
            style={{ flex: 1, border: "none", outline: "none", fontSize: "0.875rem", color: C.dark }}
          />
        </div>
      </div>

      {/* Category content */}
      <div style={{
        padding: "32px", borderRadius: 20, background: activeCat.color,
        border: `1.5px solid ${activeCat.accent}30`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, background: activeCat.accent + "15",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <ActiveIcon size={24} style={{ color: activeCat.accent }} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: C.dark, margin: "0 0 2px" }}>{activeCat.label}</h2>
            <p style={{ fontSize: "0.8125rem", color: C.body, margin: 0 }}>{activeCat.desc}</p>
          </div>
        </div>

        {/* Empty state */}
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <FileText size={36} style={{ color: activeCat.accent, margin: "0 auto 12px", opacity: 0.4 }} />
          <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: C.dark, marginBottom: "0.25rem" }}>No {activeCat.label.toLowerCase()} yet</h3>
          <p style={{ fontSize: "0.8125rem", color: C.body, margin: 0 }}>
            {activeCategory === "learning" && "Learning materials will appear here once curriculum is imported by your admin."}
            {activeCategory === "reports" && "Progress reports will be generated as you complete lessons and assessments."}
            {activeCategory === "assignments" && "Assignments from your parent or teacher will appear here."}
            {activeCategory === "reflections" && "Your reflections will be saved here after you complete them."}
            {activeCategory === "parent" && "Notes and communications from your parent will appear here."}
          </p>
        </div>
      </div>
    </div>
  );
}
