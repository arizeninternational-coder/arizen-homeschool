"use client";

import React from "react";

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
}: FractionCircleProps) {
  const center = size / 2;
  const radius = size / 2 - 8;
  const cx = center;
  const cy = center;

  const isShaded = (i: number) => i < shadedParts;

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
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#CBD5E1" strokeWidth="1.5" />
        {sectors.map((s) => (
          <path
            key={s.i}
            d={s.d}
            fill={isShaded(s.i) ? "#6366F1" : "#F1F5F9"}
            stroke="#fff"
            strokeWidth="2.5"
            style={interactive && onClickPart ? { cursor: "pointer" } : undefined}
            onClick={() => interactive && onClickPart?.(s.i)}
            className={interactive ? "hover:opacity-80 transition-opacity" : ""}
          />
        ))}
        {parts === 2 && equalParts && (
          <line x1={cx} y1={cy - radius} x2={cx} y2={cy + radius} stroke="#fff" strokeWidth="2" />
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
              fill={isShaded(s.i) ? "#fff" : "#475569"}
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
