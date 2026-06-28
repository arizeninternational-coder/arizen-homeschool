"use client";

/**
 * HTML/CSS illustration for the "Introduction to Halves" Welcome step.
 * Shows Amina, her brother, and one round chapati.
 * No text, no fractions, no cutting — pure visual storytelling.
 */
export default function ChapatiSharingIllustration() {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 420,
        aspectRatio: "4 / 3",
        borderRadius: 16,
        background: "linear-gradient(160deg, #FEF3C7 0%, #FDE68A 50%, #FCD34D 100%)",
        position: "relative",
        overflow: "hidden",
        margin: "0 auto",
      }}
    >
      {/* Warm glow behind chapati */}
      <div
        style={{
          position: "absolute",
          top: "45%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 180,
          height: 180,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%)",
        }}
      />

      {/* Ground line */}
      <div
        style={{
          position: "absolute",
          bottom: 30,
          left: 0,
          right: 0,
          height: 3,
          background: "rgba(0,0,0,0.06)",
        }}
      />

      {/* ===== AMINA (left) ===== */}
      <div style={{ position: "absolute", bottom: 33, left: 55, width: 80, height: 150 }}>
        {/* Hair */}
        <div style={{ position: "absolute", top: 0, left: 15, width: 50, height: 35, borderRadius: "50% 50% 40% 40%", background: "#2D1B0E" }} />
        {/* Head */}
        <div style={{ position: "absolute", top: 8, left: 18, width: 44, height: 44, borderRadius: "50%", background: "#D4A574" }}>
          {/* Eyes */}
          <div style={{ position: "absolute", top: 16, left: 10, width: 5, height: 5, borderRadius: "50%", background: "#2D1B0E" }} />
          <div style={{ position: "absolute", top: 16, right: 10, width: 5, height: 5, borderRadius: "50%", background: "#2D1B0E" }} />
          {/* Smile */}
          <div style={{ position: "absolute", top: 28, left: 13, width: 18, height: 8, borderBottom: "2px solid #2D1B0E", borderRadius: "0 0 50% 50%" }} />
          {/* Cheeks */}
          <div style={{ position: "absolute", top: 24, left: 6, width: 7, height: 4, borderRadius: "50%", background: "#F472B6", opacity: 0.3 }} />
          <div style={{ position: "absolute", top: 24, right: 6, width: 7, height: 4, borderRadius: "50%", background: "#F472B6", opacity: 0.3 }} />
        </div>
        {/* Body (dress) */}
        <div style={{ position: "absolute", top: 48, left: 10, width: 60, height: 70, borderRadius: "12px 12px 16px 16px", background: "linear-gradient(180deg, #818CF8, #6366F1)" }} />
        {/* Arms reaching right toward chapati */}
        <div style={{ position: "absolute", top: 62, left: 55, width: 30, height: 8, borderRadius: 4, background: "#C4956A", transform: "rotate(-10deg)" }} />
        <div style={{ position: "absolute", top: 76, left: 50, width: 32, height: 8, borderRadius: 4, background: "#C4956A", transform: "rotate(10deg)" }} />
        {/* Legs */}
        <div style={{ position: "absolute", bottom: 0, left: 20, width: 12, height: 28, borderRadius: 6, background: "#C4956A" }} />
        <div style={{ position: "absolute", bottom: 0, left: 48, width: 12, height: 28, borderRadius: 6, background: "#C4956A" }} />
        {/* Shoes */}
        <div style={{ position: "absolute", bottom: -2, left: 16, width: 20, height: 8, borderRadius: "50%", background: "#4F46E5" }} />
        <div style={{ position: "absolute", bottom: -2, left: 44, width: 20, height: 8, borderRadius: "50%", background: "#4F46E5" }} />
      </div>

      {/* ===== CHAPATI (center) ===== */}
      <div style={{ position: "absolute", top: 85, left: "50%", transform: "translateX(-50%)", width: 75, height: 75 }}>
        {/* Shadow */}
        <div style={{ position: "absolute", bottom: -8, left: 8, width: 60, height: 12, borderRadius: "50%", background: "rgba(0,0,0,0.08)" }} />
        {/* Main chapati disc */}
        <div style={{
          width: 75, height: 75, borderRadius: "50%",
          background: "radial-gradient(circle at 40% 35%, #E8B060, #D4953A 60%, #C4852A 100%)",
          boxShadow: "inset 0 -3px 6px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.1)",
          position: "relative",
        }}>
          {/* Texture spots */}
          <div style={{ position: "absolute", top: 18, left: 20, width: 8, height: 8, borderRadius: "50%", background: "rgba(139,90,43,0.25)" }} />
          <div style={{ position: "absolute", top: 30, left: 42, width: 6, height: 6, borderRadius: "50%", background: "rgba(139,90,43,0.2)" }} />
          <div style={{ position: "absolute", top: 48, left: 25, width: 7, height: 7, borderRadius: "50%", background: "rgba(139,90,43,0.18)" }} />
          <div style={{ position: "absolute", top: 22, left: 48, width: 5, height: 5, borderRadius: "50%", background: "rgba(139,90,43,0.22)" }} />
          {/* Highlight */}
          <div style={{ position: "absolute", top: 10, left: 14, width: 20, height: 12, borderRadius: "50%", background: "rgba(255,255,255,0.18)" }} />
        </div>
      </div>

      {/* ===== BROTHER (right) ===== */}
      <div style={{ position: "absolute", bottom: 33, right: 50, width: 80, height: 150 }}>
        {/* Hair */}
        <div style={{ position: "absolute", top: 0, left: 15, width: 50, height: 28, borderRadius: "50% 50% 30% 30%", background: "#1a1a1a" }} />
        {/* Head */}
        <div style={{ position: "absolute", top: 6, left: 18, width: 44, height: 44, borderRadius: "50%", background: "#D4A574" }}>
          {/* Eyes */}
          <div style={{ position: "absolute", top: 16, left: 10, width: 4.5, height: 4.5, borderRadius: "50%", background: "#2D1B0E" }} />
          <div style={{ position: "absolute", top: 16, right: 10, width: 4.5, height: 4.5, borderRadius: "50%", background: "#2D1B0E" }} />
          {/* Smile */}
          <div style={{ position: "absolute", top: 28, left: 13, width: 18, height: 8, borderBottom: "2px solid #2D1B0E", borderRadius: "0 0 50% 50%" }} />
          {/* Cheeks */}
          <div style={{ position: "absolute", top: 24, left: 6, width: 7, height: 4, borderRadius: "50%", background: "#F472B6", opacity: 0.3 }} />
          <div style={{ position: "absolute", top: 24, right: 6, width: 7, height: 4, borderRadius: "50%", background: "#F472B6", opacity: 0.3 }} />
        </div>
        {/* Body (shirt) */}
        <div style={{ position: "absolute", top: 48, left: 12, width: 56, height: 68, borderRadius: "12px 12px 16px 16px", background: "linear-gradient(180deg, #34D399, #10B981)" }} />
        {/* Arms reaching left toward chapati */}
        <div style={{ position: "absolute", top: 62, left: -5, width: 30, height: 8, borderRadius: 4, background: "#C4956A", transform: "rotate(10deg)" }} />
        <div style={{ position: "absolute", top: 76, left: -2, width: 32, height: 8, borderRadius: 4, background: "#C4956A", transform: "rotate(-10deg)" }} />
        {/* Legs */}
        <div style={{ position: "absolute", bottom: 0, left: 20, width: 12, height: 28, borderRadius: 6, background: "#C4956A" }} />
        <div style={{ position: "absolute", bottom: 0, left: 48, width: 12, height: 28, borderRadius: 6, background: "#C4956A" }} />
        {/* Shoes */}
        <div style={{ position: "absolute", bottom: -2, left: 16, width: 20, height: 8, borderRadius: "50%", background: "#059669" }} />
        <div style={{ position: "absolute", bottom: -2, left: 44, width: 20, height: 8, borderRadius: "50%", background: "#059669" }} />
      </div>

      {/* Decorative background circles */}
      <div style={{ position: "absolute", top: 20, left: 20, width: 40, height: 40, borderRadius: "50%", background: "rgba(253,230,138,0.4)" }} />
      <div style={{ position: "absolute", top: 15, right: 30, width: 30, height: 30, borderRadius: "50%", background: "rgba(253,230,138,0.3)" }} />
      <div style={{ position: "absolute", bottom: 15, left: 170, width: 25, height: 25, borderRadius: "50%", background: "rgba(253,230,138,0.35)" }} />
    </div>
  );
}
