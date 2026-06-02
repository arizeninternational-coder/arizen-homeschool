// Reusable game-style icon component for shop items, badges, etc.
// Renders a styled card with rarity color, SVG placeholder, and status indicators

const C = {
  white: "#FFFFFF", border: "#E2E8F0", dark: "#0F172A", body: "#64748B",
};

const RARITY: Record<string, { color: string; bg: string; label: string }> = {
  common:    { color: "#22C55E", bg: "#DCFCE7", label: "Common" },
  rare:      { color: "#3B82F6", bg: "#DBEAFE", label: "Rare" },
  epic:      { color: "#7C3AED", bg: "#EDE9FE", label: "Epic" },
  legendary: { color: "#F59E0B", bg: "#FEF3C7", label: "Legendary" },
};

// Map item categories to visual styles (SVG placeholder colors)
const CATEGORY_STYLE: Record<string, { bg: string; accent: string; icon: string }> = {
  hats:        { bg: "#FEF3C7", accent: "#D97706", icon: "🎩" },
  clothing:    { bg: "#DBEAFE", accent: "#2563EB", icon: "👕" },
  accessories: { bg: "#EDE9FE", accent: "#7C3AED", icon: "🎒" },
  shoes:       { bg: "#DCFCE7", accent: "#16A34A", icon: "👟" },
  tools:       { bg: "#FEE2E2", accent: "#DC2626", icon: "🔧" },
  pets:        { bg: "#F0FDF4", accent: "#16A34A", icon: "🐾" },
  backgrounds: { bg: "#EFF6FF", accent: "#3B82F6", icon: "🖼️" },
  default:     { bg: "#F8FAFC", accent: "#64748B", icon: "✨" },
};

export function ShopItemCard({ item, owned, locked, canBuy, buying, onBuy }: {
  item: any;
  owned?: boolean;
  locked?: boolean;
  canBuy?: boolean;
  buying?: boolean;
  onBuy?: () => void;
}) {
  const r = RARITY[item.rarity] || RARITY.common;
  const cat = CATEGORY_STYLE[item.category] || CATEGORY_STYLE.default;

  return (
    <div style={{
      borderRadius: 16,
      border: owned ? "1px solid #A7F3D0" : locked ? `1px solid ${C.border}` : `1px solid ${r.color}40`,
      background: owned ? "#ECFDF5" : locked ? "#FAFAFA" : C.white,
      padding: 16, display: "flex", flexDirection: "column", gap: 8,
      opacity: locked ? 0.7 : 1, transition: "transform 0.15s, box-shadow 0.15s",
    }}>
      {/* Rarity + status */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{
          fontSize: "0.625rem", fontWeight: 800, color: r.color,
          textTransform: "uppercase", letterSpacing: "0.04em",
          background: r.bg, padding: "2px 8px", borderRadius: 6,
        }}>{r.label}</span>
        {owned && <span style={{ fontSize: "0.625rem", fontWeight: 700, color: "#059669" }}>✓ Owned</span>}
        {locked && !owned && <span style={{ fontSize: "0.75rem", color: "#94A3B8" }}>🔒</span>}
      </div>

      {/* Visual thumbnail */}
      <div style={{
        width: 64, height: 64, borderRadius: 14, background: cat.bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        alignSelf: "center", border: `2px solid ${cat.accent}30`,
      }}>
        <svg viewBox="0 0 48 48" width="36" height="36">
          {item.category === "hats" && (
            <>
              <ellipse cx="24" cy="30" rx="18" ry="10" fill={cat.accent} opacity="0.8" />
              <rect x="14" y="16" width="20" height="14" rx="4" fill={cat.accent} />
              <rect x="18" y="28" width="12" height="4" rx="2" fill={cat.accent} opacity="0.5" />
            </>
          )}
          {item.category === "clothing" && (
            <>
              <rect x="12" y="14" width="24" height="22" rx="6" fill={cat.accent} />
              <rect x="8" y="16" width="6" height="14" rx="3" fill={cat.accent} opacity="0.8" />
              <rect x="34" y="16" width="6" height="14" rx="3" fill={cat.accent} opacity="0.8" />
              <rect x="20" y="10" width="8" height="6" rx="3" fill={cat.accent} opacity="0.6" />
              <line x1="20" y1="24" x2="28" y2="24" stroke={C.white} strokeWidth="1.5" opacity="0.5" />
            </>
          )}
          {item.category === "shoes" && (
            <>
              <ellipse cx="18" cy="32" rx="12" ry="8" fill={cat.accent} />
              <ellipse cx="34" cy="32" rx="12" ry="8" fill={cat.accent} />
              <rect x="10" y="26" width="16" height="4" rx="2" fill={C.white} opacity="0.4" />
              <rect x="26" y="26" width="16" height="4" rx="2" fill={C.white} opacity="0.4" />
            </>
          )}
          {item.category === "accessories" && (
            <>
              <rect x="10" y="18" width="28" height="18" rx="4" fill={cat.accent} />
              <rect x="8" y="22" width="4" height="10" rx="2" fill={cat.accent} opacity="0.7" />
              <rect x="36" y="22" width="4" height="10" rx="2" fill={cat.accent} opacity="0.7" />
              <circle cx="24" cy="27" r="4" fill={C.white} opacity="0.4" />
            </>
          )}
          {item.category === "tools" && (
            <>
              <rect x="20" y="8" width="8" height="32" rx="4" fill={cat.accent} />
              <circle cx="24" cy="14" r="6" fill={C.white} opacity="0.3" />
            </>
          )}
          {item.category === "pets" && (
            <>
              <ellipse cx="24" cy="30" rx="14" ry="10" fill={cat.accent} />
              <circle cx="24" cy="18" r="8" fill={cat.accent} opacity="0.8" />
              <circle cx="18" cy="16" r="3" fill={cat.accent} opacity="0.6" />
              <circle cx="30" cy="16" r="3" fill={cat.accent} opacity="0.6" />
              <circle cx="21" cy="19" r="1.5" fill={C.white} />
              <circle cx="27" cy="19" r="1.5" fill={C.white} />
            </>
          )}
          {item.category === "backgrounds" && (
            <>
              <rect x="6" y="8" width="36" height="32" rx="4" fill={cat.accent} opacity="0.3" />
              <circle cx="36" cy="12" r="5" fill={cat.accent} opacity="0.4" />
              <rect x="12" y="28" width="8" height="8" rx="1" fill={cat.accent} opacity="0.5" />
              <rect x="24" y="24" width="10" height="12" rx="2" fill={cat.accent} opacity="0.4" />
              <rect x="14" y="20" width="6" height="6" rx="1" fill={cat.accent} opacity="0.3" />
            </>
          )}
          {!["hats","clothing","shoes","accessories","tools","pets","backgrounds"].includes(item.category) && (
            <>
              <circle cx="24" cy="24" r="16" fill={cat.accent} opacity="0.2" />
              <circle cx="24" cy="24" r="10" fill={cat.accent} opacity="0.4" />
              <circle cx="24" cy="24" r="4" fill={cat.accent} opacity="0.6" />
            </>
          )}
        </svg>
      </div>

      {/* Name */}
      <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: C.dark, margin: 0, textAlign: "center" }}>{item.name}</p>

      {/* Cost */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
        <span style={{ fontSize: "0.875rem", fontWeight: 800, color: canBuy ? "#92400E" : "#EF4444" }}>🪙 {item.cost}</span>
      </div>

      {/* Requirement */}
      {locked && item.req && <p style={{ fontSize: "0.625rem", color: C.body, margin: 0, textAlign: "center" }}>{item.req}</p>}

      {/* Action button */}
      {owned ? (
        <button style={{ width: "100%", padding: "8px", borderRadius: 10, border: "1px solid #A7F3D0", background: "#ECFDF5", color: "#059669", fontWeight: 700, fontSize: "0.75rem", cursor: "default" }}>Owned</button>
      ) : locked ? (
        <button style={{ width: "100%", padding: "8px", borderRadius: 10, border: `1px solid ${C.border}`, background: "#F8FAFC", color: "#94A3B8", fontWeight: 700, fontSize: "0.75rem", cursor: "default" }}>🔒 Locked</button>
      ) : (
        <button onClick={onBuy} disabled={buying || !canBuy} style={{
          width: "100%", padding: "8px", borderRadius: 10, border: "none",
          background: canBuy ? "#047A70" : "#E2E8F0",
          color: canBuy ? "#fff" : "#94A3B8", fontWeight: 700, fontSize: "0.75rem",
          cursor: canBuy ? "pointer" : "default",
        }}>{buying ? "Buying..." : canBuy ? "Buy Now" : "Not enough coins"}</button>
      )}
    </div>
  );
}

export function BadgeCard({ name, earned, description }: { name: string; earned: boolean; description?: string }) {
  return (
    <div style={{
      padding: "14px", borderRadius: 14, background: earned ? "#FEF3C7" : "#F8FAFC",
      border: earned ? "1px solid #FDE68A" : `1px solid ${C.border}`,
      textAlign: "center", opacity: earned ? 1 : 0.6,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: "50%", margin: "0 auto 8px",
        background: earned ? "linear-gradient(135deg, #FDE68A, #F59E0B)" : "#E2E8F0",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "1.25rem",
      }}>
        {earned ? "🏅" : "🔒"}
      </div>
      <div style={{ fontSize: "0.75rem", fontWeight: 700, color: earned ? "#92400E" : C.body }}>{name}</div>
      {description && <div style={{ fontSize: "0.625rem", color: C.body, marginTop: 2 }}>{description}</div>}
      {earned && <div style={{ fontSize: "0.5625rem", fontWeight: 800, color: "#16A34A", marginTop: 4 }}>✨ Earned</div>}
      {!earned && <div style={{ fontSize: "0.5625rem", fontWeight: 800, color: "#94A3B8", marginTop: 4 }}>🔒 Locked</div>}
    </div>
  );
}

export function RewardIcon({ value, size = 14 }: { value: any; size?: number }) {
  const num = typeof value === "number" ? value : (value?.base || value?.amount || 0);
  return (
    <span style={{ fontSize: `${size}px`, fontWeight: 700, color: num > 0 ? "#D97706" : "#94A3B8" }}>
      {num > 0 ? `🪙 ${num}` : "🪙 0"}
    </span>
  );
}

export { RARITY, CATEGORY_STYLE };
