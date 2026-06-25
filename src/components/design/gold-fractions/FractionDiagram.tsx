"use client";

import React from "react";

/**
 * Gold Fractions — SVG Fraction Diagram
 * 
 * Crisp, mathematically precise fraction circles/rectangles
 * with chapati-inspired warm styling.
 */

interface FractionCircleProps {
  parts: number;
  shadedParts: number;
  size?: number;
  theme?: "chapati" | "paper" | "plain";
  showLabels?: boolean;
  interactive?: boolean;
  selectedPart?: number | null;
  onSelectPart?: (index: number) => void;
  label?: string;
}

const THEMES = {
  chapati: {
    fill: "#FFE5D9",
    shaded: "#FF6B35",
    stroke: "#D4A574",
    selected: "#FFB347",
    gradient: ["#FFF0E5", "#FFD4B8"],
    labelBg: "#FF6B35",
    labelText: "#ffffff",
  },
  paper: {
    fill: "#F0F4FF",
    shaded: "#4FC3F7",
    stroke: "#90A4AE",
    selected: "#81D4FA",
    gradient: ["#F5F8FF", "#E3ECFF"],
    labelBg: "#004E89",
    labelText: "#ffffff",
  },
  plain: {
    fill: "#FFF8F0",
    shaded: "#FF6B35",
    stroke: "#E0D5C8",
    selected: "#FFB347",
    gradient: ["#FFF8F0", "#FFF0E0"],
    labelBg: "#FF6B35",
    labelText: "#ffffff",
  },
};

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M", cx, cy,
    "L", start.x, start.y,
    "A", r, r, 0, largeArcFlag, 0, end.x, end.y,
    "Z",
  ].join(" ");
}

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number
) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

export function FractionCircle({
  parts,
  shadedParts,
  size = 200,
  theme = "chapati",
  showLabels = false,
  interactive = false,
  selectedPart = null,
  onSelectPart,
  label,
}: FractionCircleProps) {
  const t = THEMES[theme];
  const cx = size / 2;
  const cy = size / 2;
  const r = (size / 2) - 8;
  const svgSize = size + 16;

  const handlePartClick = (index: number) => {
    if (interactive && onSelectPart) {
      onSelectPart(index);
    }
  };

  return (
    <div className="inline-flex flex-col items-center gap-2">
      <svg
        width={svgSize}
        height={svgSize}
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        className="drop-shadow-lg"
      >
        <defs>
          <radialGradient id={`bg-${theme}-${size}`}>
            <stop offset="0%" stopColor={t.gradient[0]} />
            <stop offset="100%" stopColor={t.gradient[1]} />
          </radialGradient>
          <filter id={`shadow-${theme}-${size}`}>
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Background circle */}
        <circle
          cx={cx + 8}
          cy={cy + 8}
          r={r}
          fill={`url(#bg-${theme}-${size})`}
          stroke={t.stroke}
          strokeWidth="2.5"
        />

        {/* Part segments */}
        {parts > 0 && Array.from({ length: parts }).map((_, i) => {
          const anglePerPart = 360 / parts;
          const startAngle = i * anglePerPart;
          const endAngle = (i + 1) * anglePerPart;
          const isShaded = i < shadedParts;
          const isSelected = selectedPart === i;
          const fillColor = isSelected ? t.selected : isShaded ? t.shaded : "transparent";

          if (parts === 1) {
            return (
              <circle
                key={i}
                cx={cx + 8}
                cy={cy + 8}
                r={r - 1}
                fill={fillColor}
                className={interactive ? "cursor-pointer transition-all duration-200" : ""}
                onClick={() => handlePartClick(i)}
                opacity={isShaded || isSelected ? 0.85 : 0}
              />
            );
          }

          const d = describeArc(
            cx + 8,
            cy + 8,
            r - 1,
            startAngle,
            endAngle
          );

          return (
            <path
              key={i}
              d={d}
              fill={fillColor}
              className={`${interactive ? "cursor-pointer" : ""} transition-all duration-200 hover:opacity-90`}
              onClick={() => handlePartClick(i)}
              opacity={isShaded || isSelected ? 0.85 : 0}
            />
          );
        })}

        {/* Dividing lines */}
        {parts > 1 &&
          Array.from({ length: parts }).map((_, i) => {
            const angle = (i * 360) / parts;
            const end = polarToCartesian(cx + 8, cy + 8, r - 1, angle);
            return (
              <line
                key={`line-${i}`}
                x1={cx + 8}
                y1={cy + 8}
                x2={end.x}
                y2={end.y}
                stroke={t.stroke}
                strokeWidth="2"
                strokeLinecap="round"
              />
            );
          })}

        {/* Interactive hover pulse for each part */}
        {interactive &&
          parts > 1 &&
          Array.from({ length: parts }).map((_, i) => {
            const anglePerPart = 360 / parts;
            const midAngle = (i + 0.5) * anglePerPart;
            const labelPos = polarToCartesian(cx + 8, cy + 8, r * 0.55, midAngle);
            return (
              <circle
                key={`hit-${i}`}
                cx={labelPos.x}
                cy={labelPos.y}
                r={r * 0.35}
                fill="transparent"
                className="cursor-pointer"
                onClick={() => handlePartClick(i)}
              />
            );
          })}

        {/* Fraction label */}
        {showLabels && label && (
          <g>
            <rect
              x={cx + 8 - 24}
              y={cy + 8 + r + 4}
              width={48}
              height={22}
              rx={11}
              fill={t.labelBg}
            />
            <text
              x={cx + 8}
              y={cy + 8 + r + 19}
              textAnchor="middle"
              fill={t.labelText}
              fontSize="12"
              fontWeight="700"
              fontFamily="Inter, sans-serif"
            >
              {label}
            </text>
          </g>
        )}

        {/* Center dot for single-part */}
        {parts === 1 && (
          <circle cx={cx + 8} cy={cy + 8} r={3} fill={t.stroke} opacity={0.3} />
        )}
      </svg>
    </div>
  );
}

/**
 * A fraction rectangle (bar model)
 */
interface FractionRectProps {
  parts: number;
  shadedParts: number;
  width?: number;
  height?: number;
  theme?: "chapati" | "paper" | "plain";
  showLabels?: boolean;
}

export function FractionRect({
  parts,
  shadedParts,
  width = 280,
  height = 60,
  theme = "chapati",
  showLabels = false,
}: FractionRectProps) {
  const t = THEMES[theme];
  const padding = 12;
  const totalW = width + padding * 2;
  const totalH = height + padding * 2;
  const partWidth = width / parts;

  return (
    <div className="inline-flex flex-col items-center gap-2">
      <svg
        width={totalW}
        height={totalH}
        viewBox={`0 0 ${totalW} ${totalH}`}
        className="drop-shadow-lg"
      >
        <defs>
          <linearGradient id={`rect-bg-${theme}-${width}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={t.gradient[0]} />
            <stop offset="100%" stopColor={t.gradient[1]} />
          </linearGradient>
        </defs>

        {/* Background */}
        <rect
          x={padding}
          y={padding}
          width={width}
          height={height}
          rx={8}
          fill={`url(#rect-bg-${theme}-${width})`}
          stroke={t.stroke}
          strokeWidth="2"
        />

        {/* Shaded segments */}
        {Array.from({ length: shadedParts }).map((_, i) => (
          <rect
            key={i}
            x={padding + i * partWidth}
            y={padding}
            width={partWidth}
            height={height}
            rx={i === 0 ? 8 : 0}
            fill={t.shaded}
            opacity={0.7}
          />
        ))}

        {/* Division lines */}
        {parts > 1 &&
          Array.from({ length: parts - 1 }).map((_, i) => (
            <line
              key={`div-${i}`}
              x1={padding + (i + 1) * partWidth}
              y1={padding}
              x2={padding + (i + 1) * partWidth}
              y2={padding + height}
              stroke={t.stroke}
              strokeWidth="2"
              strokeDasharray="4 2"
            />
          ))}

        {/* Label */}
        {showLabels && (
          <text
            x={padding + width / 2}
            y={padding + height + 18}
            textAnchor="middle"
            fill={t.stroke}
            fontSize="13"
            fontWeight="700"
            fontFamily="Inter, sans-serif"
          >
            {shadedParts}/{parts}
          </text>
        )}
      </svg>
    </div>
  );
}
