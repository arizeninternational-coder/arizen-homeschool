"use client";

import React from "react";

// -- Themed circle rendering ---------------------------------------------------

export type CircleTheme = "plain" | "chapati" | "biscuit" | "pizza" | "paper_cutout" | "orange" | "moon";

const THEME_CONFIG: Record<CircleTheme, {
  baseFill: string;
  shadedFill: string;
  strokeColor: string;
  strokeWidth: string;
  patternId?: string;
  labelColor?: string;
  accent?: string;
}> = {
  plain: { baseFill: "#F1F5F9", shadedFill: "#6366F1", strokeColor: "#fff", strokeWidth: "2.5" },
  chapati: { baseFill: "#FDE8CC", shadedFill: "#D4953A", strokeColor: "#C4852A", strokeWidth: "3", accent: "#E8B060" },
  biscuit: { baseFill: "#F5E6D3", shadedFill: "#C8956C", strokeColor: "#A87A55", strokeWidth: "3", accent: "#D4A574" },
  pizza: { baseFill: "#FEF3C7", shadedFill: "#DC2626", strokeColor: "#FDE68A", strokeWidth: "2.5", accent: "#F59E0B" },
  paper_cutout: { baseFill: "#F8FAFC", shadedFill: "#6366F1", strokeColor: "#CBD5E1", strokeWidth: "2", accent: "#94A3B8" },
  orange: { baseFill: "#FFF7ED", shadedFill: "#FB923C", strokeColor: "#FED7AA", strokeWidth: "2.5", accent: "#FDBA74" },
  moon: { baseFill: "#F0F0FF", shadedFill: "#A5B4FC", strokeColor: "#C7D2FE", strokeWidth: "2.5", accent: "#818CF8" },
};

function renderThemeDecorations(theme: CircleTheme, cx: number, cy: number, r: number) {
  if (theme === "plain") return null;
  if (theme === "chapati") {
    return (
      <g opacity="0.4">
        <circle cx={cx - r * 0.25} cy={cy - r * 0.1} r={r * 0.06} fill="#C4852A" />
        <circle cx={cx + r * 0.3} cy={cy + r * 0.15} r={r * 0.04} fill="#C4852A" />
        <circle cx={cx + r * 0.1} cy={cy - r * 0.35} r={r * 0.05} fill="#C4852A" />
        <circle cx={cx - r * 0.15} cy={cy + r * 0.3} r={r * 0.035} fill="#C4852A" />
      </g>
    );
  }
  if (theme === "biscuit") {
    return (
      <g opacity="0.35">
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const a = (i * Math.PI) / 3;
          return <circle key={i} cx={cx + r * 0.55 * Math.cos(a)} cy={cy + r * 0.55 * Math.sin(a)} r={r * 0.05} fill="#8B5E3C" />;
        })}
      </g>
    );
  }
  if (theme === "pizza") {
    return (
      <g opacity="0.5">
        <circle cx={cx - r * 0.2} cy={cy - r * 0.15} r={r * 0.07} fill="#16A34A" />
        <circle cx={cx + r * 0.25} cy={cy + r * 0.1} r={r * 0.06} fill="#16A34A" />
        <circle cx={cx + r * 0.05} cy={cy + r * 0.35} r={r * 0.05} fill="#16A34A" />
      </g>
    );
  }
  if (theme === "paper_cutout") {
    return (
      <g opacity="0.6" stroke="#94A3B8" strokeWidth="1" strokeDasharray="3 2" fill="none">
        <circle cx={cx} cy={cy} r={r * 0.85} />
      </g>
    );
  }
  if (theme === "orange") {
    return (
      <g opacity="0.4">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const a = (i * Math.PI) / 4;
          return <circle key={i} cx={cx + r * 0.6 * Math.cos(a)} cy={cy + r * 0.6 * Math.sin(a)} r={r * 0.03} fill="#9A3412" />;
        })}
      </g>
    );
  }
  if (theme === "moon") {
    return (
      <g opacity="0.3">
        <circle cx={cx - r * 0.3} cy={cy - r * 0.2} r={r * 0.04} fill="#6366F1" />
        <circle cx={cx + r * 0.2} cy={cy + r * 0.3} r={r * 0.03} fill="#6366F1" />
        <circle cx={cx + r * 0.35} cy={cy - r * 0.15} r={r * 0.025} fill="#6366F1" />
      </g>
    );
  }
  return null;
}

// -- Fraction Circle ----------------------------------------------------------

interface FractionCircleProps {
  parts: number;
  shadedParts: number;
  equalParts?: boolean;
  showLabels?: boolean;
  labels?: string[];
  size?: number;
  onClickPart?: (partIndex: number) => void;
  interactive?: boolean;
  theme?: CircleTheme;
}

export function FractionCircle({
  parts,
  shadedParts,
  equalParts = true,
  showLabels = true,
  labels,
  size = 180,
  onClickPart,
  interactive = false,
  theme = "plain",
}: FractionCircleProps) {
  const center = size / 2;
  const radius = size / 2 - 8;
  const cx = center;
  const cy = center;

  const isShaded = (i: number) => i < shadedParts;
  const tc = THEME_CONFIG[theme];

  const angles = equalParts
    ? Array.from({ length: parts }, (_, i) => (2 * Math.PI) / parts)
    : parts === 2
    ? [Math.PI * 1.3, Math.PI * 0.7]
    : Array.from({ length: parts }, (_, i) => (2 * Math.PI) / parts);

  let currentAngle = -Math.PI / 2;

  const sectors = angles.map((angle, i) => {
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    const largeArc = angle > Math.PI ? 1 : 0;
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    const midAngle = startAngle + angle / 2;
    const labelR = radius * 0.65;
    const lx = cx + labelR * Math.cos(midAngle);
    const ly = cy + labelR * Math.sin(midAngle);

    return { d, lx, ly, i };
  });

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke={tc.strokeColor} strokeWidth="1.5" />
        {renderThemeDecorations(theme, cx, cy, radius)}
        {sectors.map((s) => (
          <path
            key={s.i}
            d={s.d}
            fill={isShaded(s.i) ? tc.shadedFill : tc.baseFill}
            stroke={tc.strokeColor}
            strokeWidth={tc.strokeWidth}
            style={interactive && onClickPart ? { cursor: "pointer" } : undefined}
            onClick={() => interactive && onClickPart?.(s.i)}
            className={interactive ? "hover:opacity-80 transition-opacity" : ""}
          />
        ))}
        {parts === 2 && equalParts && (
          <line x1={cx} y1={cy - radius} x2={cx} y2={cy + radius} stroke={tc.strokeColor} strokeWidth="2" />
        )}
        {sectors.map((s) => {
          const label = showLabels && labels && labels[s.i] ? labels[s.i] : showLabels ? (parts === 2 && equalParts ? "1/2" : `${s.i + 1}/${parts}`) : null;
          if (!label) return null;
          return (
            <text
              key={`label-${s.i}`}
              x={s.lx}
              y={s.ly}
              textAnchor="middle"
              dominantBaseline="central"
              fill={isShaded(s.i) ? "#fff" : (tc.labelColor || "#475569")}
              fontSize="13"
              fontWeight="700"
            >
              {label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

// -- Fraction Semicircle (half chapati) -------------------------------------

interface FractionSemicircleProps {
  theme?: CircleTheme;
  size?: number;
  shaded?: boolean;
}

export function FractionSemicircle({ theme = "plain", size = 80, shaded = true }: FractionSemicircleProps) {
  const tc = THEME_CONFIG[theme];
  const center = size / 2;
  const radius = size / 2 - 4;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Semicircle: right half (upright, flat edge on left) */}
      <path
        d={`M ${center} ${center - radius} A ${radius} ${radius} 0 0 1 ${center} ${center + radius} Z`}
        fill={shaded ? tc.shadedFill : tc.baseFill}
        stroke={tc.strokeColor}
        strokeWidth={tc.strokeWidth}
      />
      {/* Flat left edge (vertical line) */}
      <line
        x1={center}
        y1={center - radius}
        x2={center}
        y2={center + radius}
        stroke={tc.strokeColor}
        strokeWidth={tc.strokeWidth}
      />
      {/* Decorations */}
      {theme === "chapati" && (
        <g opacity="0.3">
          <circle cx={center + radius * 0.3} cy={center - radius * 0.3} r={radius * 0.08} fill="#C4852A" />
          <circle cx={center + radius * 0.2} cy={center + radius * 0.2} r={radius * 0.06} fill="#C4852A" />
        </g>
      )}
    </svg>
  );
}

// -- Fraction Circle with Dotted Split Line ---------------------------------

interface FractionCircleWithDottedLineProps {
  theme?: CircleTheme;
  size?: number;
}

export function FractionCircleWithDottedLine({ theme = "plain", size = 80 }: FractionCircleWithDottedLineProps) {
  const tc = THEME_CONFIG[theme];
  const center = size / 2;
  const radius = size / 2 - 4;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Full circle outline */}
      <circle cx={center} cy={center} r={radius} fill={tc.baseFill} stroke={tc.strokeColor} strokeWidth={tc.strokeWidth} />
      {/* Dotted vertical split line */}
      <line
        x1={center}
        y1={center - radius + 3}
        x2={center}
        y2={center + radius - 3}
        stroke={tc.accent || tc.strokeColor}
        strokeWidth="2"
        strokeDasharray="4 3"
        strokeLinecap="round"
      />
      {/* Decorations */}
      {renderThemeDecorations(theme, center, center, radius)}
    </svg>
  );
}

// -- Fraction Rectangle -------------------------------------------------------

interface FractionRectangleProps {
  parts: number;
  shadedParts: number;
  equalParts?: boolean;
  orientation?: "horizontal" | "vertical";
  showLabels?: boolean;
  labels?: string[];
  width?: number;
  height?: number;
  onClickPart?: (partIndex: number) => void;
  interactive?: boolean;
}

export function FractionRectangle({
  parts,
  shadedParts,
  equalParts = true,
  orientation = "vertical",
  showLabels = true,
  labels,
  width = 200,
  height = 140,
  onClickPart,
  interactive = false,
}: FractionRectangleProps) {
  const isShaded = (i: number) => i < shadedParts;
  const gap = 3;
  const isVertical = orientation === "vertical";
  const totalGap = gap * (parts - 1);
  const partSize = isVertical ? (height - totalGap) / parts : (width - totalGap) / parts;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={width + 8} height={height + 8} viewBox={`0 0 ${width + 8} ${height + 8}`}>
        <rect x="2" y="2" width={width + 4} height={height + 4} rx={10} fill="none" stroke="#CBD5E1" strokeWidth="1.5" />
        {Array.from({ length: parts }, (_, i) => {
          const pos = i * (partSize + gap);
          const rx = isVertical ? 0 : pos;
          const ry = isVertical ? pos : 0;
          const rw = isVertical ? width : partSize;
          const rh = isVertical ? partSize : height;
          const label = showLabels && labels && labels[i] ? labels[i] : showLabels ? `${i + 1}/${parts}` : "";

          return (
            <g key={i}>
              <rect
                x={rx + 4}
                y={ry + 4}
                width={rw}
                height={rh}
                rx={6}
                fill={isShaded(i) ? "#6366F1" : "#F1F5F9"}
                stroke="#fff"
                strokeWidth="2"
                style={interactive && onClickPart ? { cursor: "pointer" } : undefined}
                onClick={() => interactive && onClickPart?.(i)}
                className={interactive ? "hover:opacity-80 transition-opacity" : ""}
              />
              {label && (
                <text
                  x={rx + rw / 2 + 4}
                  y={ry + rh / 2 + 4}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={isShaded(i) ? "#fff" : "#475569"}
                  fontSize="12"
                  fontWeight="700"
                >
                  {label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
