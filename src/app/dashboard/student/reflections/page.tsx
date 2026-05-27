"use client";

export const dynamic = "force-dynamic";

import { Heart, BookOpen } from "lucide-react";
import { ds, colors } from "@/lib/design-system";

export default function StudentReflectionsPage() {
  return (
    <>
      <h1 style={{ fontSize: "1.375rem", fontWeight: 800, color: colors.text, marginBottom: "0.25rem" }}>Reflections</h1>
      <p style={{ color: colors.textMuted, fontSize: "0.875rem", marginBottom: "1.25rem" }}>Think about what you've learned and how you've grown.</p>

      <div style={{ ...ds.card, textAlign: "center", padding: "2.5rem 1.5rem" }}>
        <Heart style={{ width: 36, height: 36, color: colors.textMuted, margin: "0 auto 0.75rem", opacity: 0.3 }} />
        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: colors.text, marginBottom: "0.375rem" }}>Reflections coming soon</h3>
        <p style={{ color: colors.textMuted, fontSize: "0.875rem" }}>After completing lessons, you'll be able to reflect on what you learned here.</p>
      </div>
    </>
  );
}
