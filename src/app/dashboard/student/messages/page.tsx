"use client";

export const dynamic = "force-dynamic";

import { MessageCircle } from "lucide-react";

const C = { page: "#F7FBF7", teal: "#047A70", dark: "#0F172A", body: "#64748B", white: "#FFFFFF", border: "#E2E8F0" };

export default function MessagesPage() {
  return (
    <div>
      <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>💬</div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: C.dark, margin: "0 0 0.5rem 0" }}>Messages</h1>
        <p style={{ color: C.body, fontSize: "0.9375rem", maxWidth: 400, margin: "0 auto" }}>
          Messages between parent, teacher, and learner will appear here.
        </p>
      </div>
    </div>
  );
}
