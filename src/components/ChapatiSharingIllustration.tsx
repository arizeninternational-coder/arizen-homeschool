"use client";

/**
 * HTML/CSS illustration for the "Introduction to Halves" Welcome step.
 * Shows Amina, her brother, and one round chapati.
 * Arizen-style purple/pink/warm palette.
 */
export default function ChapatiSharingIllustration() {
  return (
    <div
      style={{
        width: "100%",
        aspectRatio: "16 / 10",
        borderRadius: 16,
        background: "linear-gradient(160deg, #EDE9FE 0%, #F5F3FF 30%, #FDF2F8 70%, #FCE7F3 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Soft glow behind chapati */}
      <div style={{
        position: "absolute", top: "40%", left: "50%", transform: "translate(-50%, -50%)",
        width: 160, height: 160, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(167,139,250,0.25) 0%, transparent 70%)",
      }} />

      {/* Ground */}
      <div style={{
        position: "absolute", bottom: 28, left: 20, right: 20, height: 2,
        background: "rgba(139,92,246,0.08)", borderRadius: 2,
      }} />

      {/* ===== AMINA (left) ===== */}
      <div style={{ position: "absolute", bottom: 30, left: 50, width: 80, height: 155 }}>
        {/* Hair */}
        <div style={{ position: "absolute", top: 0, left: 14, width: 52, height: 38, borderRadius: "50% 50% 40% 40%", background: "#4C1D95" }} />
        {/* Head */}
        <div style={{ position: "absolute", top: 10, left: 17, width: 46, height: 46, borderRadius: "50%", background: "#D4A574", border: "2px solid rgba(139,92,246,0.15)" }}>
          <div style={{ position: "absolute", top: 17, left: 11, width: 5, height: 5, borderRadius: "50%", background: "#1E1B4B" }} />
          <div style={{ position: "absolute", top: 17, right: 11, width: 5, height: 5, borderRadius: "50%", background: "#1E1B4B" }} />
          <div style={{ position: "absolute", top: 30, left: 14, width: 18, height: 8, borderBottom: "2.5px solid #1E1B4B", borderRadius: "0 0 50% 50%" }} />
          <div style={{ position: "absolute", top: 25, left: 7, width: 8, height: 5, borderRadius: "50%", background: "#F9A8D4", opacity: 0.4 }} />
          <div style={{ position: "absolute", top: 25, right: 7, width: 8, height: 5, borderRadius: "50%", background: "#F9A8D4", opacity: 0.4 }} />
        </div>
        {/* Dress */}
        <div style={{ position: "absolute", top: 52, left: 8, width: 64, height: 72, borderRadius: "14px 14px 18px 18px", background: "linear-gradient(180deg, #A78BFA, #7C3AED)" }} />
        {/* Arms */}
        <div style={{ position: "absolute", top: 64, left: 56, width: 32, height: 9, borderRadius: 5, background: "#C4956A", transform: "rotate(-8deg)" }} />
        <div style={{ position: "absolute", top: 78, left: 52, width: 34, height: 9, borderRadius: 5, background: "#C4956A", transform: "rotate(8deg)" }} />
        {/* Legs */}
        <div style={{ position: "absolute", bottom: 0, left: 22, width: 13, height: 28, borderRadius: 6, background: "#C4956A" }} />
        <div style={{ position: "absolute", bottom: 0, left: 50, width: 13, height: 28, borderRadius: 6, background: "#C4956A" }} />
        <div style={{ position: "absolute", bottom: -2, left: 18, width: 22, height: 9, borderRadius: "50%", background: "#6D28D9" }} />
        <div style={{ position: "absolute", bottom: -2, left: 46, width: 22, height: 9, borderRadius: "50%", background: "#6D28D9" }} />
      </div>

      {/* ===== CHAPATI (center) ===== */}
      <div style={{ position: "absolute", top: 75, left: "50%", transform: "translateX(-50%)", width: 80, height: 80 }}>
        <div style={{ position: "absolute", bottom: -6, left: 10, width: 60, height: 12, borderRadius: "50%", background: "rgba(139,92,246,0.08)" }} />
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          background: "radial-gradient(circle at 38% 32%, #F59E0B, #D97706 50%, #B45309 100%)",
          boxShadow: "inset 0 -4px 8px rgba(0,0,0,0.15), 0 3px 10px rgba(139,92,246,0.12)",
          position: "relative",
        }}>
          <div style={{ position: "absolute", top: 18, left: 22, width: 9, height: 9, borderRadius: "50%", background: "rgba(180,83,9,0.2)" }} />
          <div style={{ position: "absolute", top: 32, left: 46, width: 7, height: 7, borderRadius: "50%", background: "rgba(180,83,9,0.18)" }} />
          <div style={{ position: "absolute", top: 50, left: 28, width: 8, height: 8, borderRadius: "50%", background: "rgba(180,83,9,0.15)" }} />
          <div style={{ position: "absolute", top: 12, left: 16, width: 22, height: 14, borderRadius: "50%", background: "rgba(255,255,255,0.15)" }} />
        </div>
      </div>

      {/* ===== BROTHER (right) ===== */}
      <div style={{ position: "absolute", bottom: 30, right: 45, width: 80, height: 155 }}>
        <div style={{ position: "absolute", top: 0, left: 14, width: 52, height: 30, borderRadius: "50% 50% 30% 30%", background: "#1E1B4B" }} />
        <div style={{ position: "absolute", top: 8, left: 17, width: 46, height: 46, borderRadius: "50%", background: "#D4A574", border: "2px solid rgba(139,92,246,0.15)" }}>
          <div style={{ position: "absolute", top: 17, left: 11, width: 5, height: 5, borderRadius: "50%", background: "#1E1B4B" }} />
          <div style={{ position: "absolute", top: 17, right: 11, width: 5, height: 5, borderRadius: "50%", background: "#1E1B4B" }} />
          <div style={{ position: "absolute", top: 30, left: 14, width: 18, height: 8, borderBottom: "2.5px solid #1E1B4B", borderRadius: "0 0 50% 50%" }} />
          <div style={{ position: "absolute", top: 25, left: 7, width: 8, height: 5, borderRadius: "50%", background: "#F9A8D4", opacity: 0.4 }} />
          <div style={{ position: "absolute", top: 25, right: 7, width: 8, height: 5, borderRadius: "50%", background: "#F9A8D4", opacity: 0.4 }} />
        </div>
        <div style={{ position: "absolute", top: 52, left: 10, width: 60, height: 70, borderRadius: "14px 14px 18px 18px", background: "linear-gradient(180deg, #FB7185, #E11D48)" }} />
        <div style={{ position: "absolute", top: 64, left: -6, width: 32, height: 9, borderRadius: 5, background: "#C4956A", transform: "rotate(8deg)" }} />
        <div style={{ position: "absolute", top: 78, left: -2, width: 34, height: 9, borderRadius: 5, background: "#C4956A", transform: "rotate(-8deg)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 22, width: 13, height: 28, borderRadius: 6, background: "#C4956A" }} />
        <div style={{ position: "absolute", bottom: 0, left: 50, width: 13, height: 28, borderRadius: 6, background: "#C4956A" }} />
        <div style={{ position: "absolute", bottom: -2, left: 18, width: 22, height: 9, borderRadius: "50%", background: "#BE123C" }} />
        <div style={{ position: "absolute", bottom: -2, left: 46, width: 22, height: 9, borderRadius: "50%", background: "#BE123C" }} />
      </div>

      {/* Decorative circles */}
      <div style={{ position: "absolute", top: 18, left: 25, width: 35, height: 35, borderRadius: "50%", background: "rgba(167,139,250,0.15)" }} />
      <div style={{ position: "absolute", top: 12, right: 35, width: 28, height: 28, borderRadius: "50%", background: "rgba(244,114,182,0.15)" }} />
      <div style={{ position: "absolute", bottom: 12, left: "45%", width: 22, height: 22, borderRadius: "50%", background: "rgba(167,139,250,0.12)" }} />
    </div>
  );
}
