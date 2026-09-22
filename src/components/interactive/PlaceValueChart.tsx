/**
 * Place Value Chart — SVG visual for Grade 4 math journeys.
 *
 * Displays a number's digits in place-value columns:
 *   Ten Thousands | Thousands | Hundreds | Tens | Ones
 *
 * Shows the place value beneath each digit when showValues is true.
 * Can highlight a single column to draw attention to a specific place.
 */

"use client";

import React from "react";

interface PlaceValueChartProps {
  /** Digit strings, e.g. ["4","7","2","9"] — empty strings for blank columns */
  digits: string[];
  /** Column labels, most-significant first */
  columns?: string[];
  /** Index of column to highlight (0 = rightmost / ones place) */
  highlightColumn?: number | null;
  /** Show the place value (e.g. "700") beneath each digit */
  showValues?: boolean;
  /** Overall width in px */
  width?: number;
  /** Height in px */
  height?: number;
  /** Whether to render in 'interactive' mode (reserved for future tap-to-reveal) */
  interactive?: boolean;
}

const DEFAULT_COLUMNS = ["Ten Thousands", "Thousands", "Hundreds", "Tens", "Ones"];
const PLACE_VALUES = [10000, 1000, 100, 10, 1];

function digitValue(digit: string, colIndex: number): string {
  const d = parseInt(digit, 10);
  if (isNaN(d) || d === 0) return "0";
  const pv = PLACE_VALUES[colIndex];
  if (!pv) return String(d);
  const val = d * pv;
  return val.toLocaleString("en-US");
}

function columnWidth(totalWidth: number, colCount: number): number {
  return Math.floor((totalWidth - 24) / colCount);
}

function columnLabel(label: string, width: number): string {
  if (label.length * 7.5 > width) {
    // abbreviate
    if (label === "Ten Thousands") return "Ten\nThou.";
    if (label === "Thousands") return "Thou.";
    if (label === "Hundreds") return "Hund.";
    if (label === "Tens") return "Tens";
    if (label === "Ones") return "Ones";
  }
  return label;
}

export function PlaceValueChart({
  digits,
  columns = DEFAULT_COLUMNS,
  highlightColumn = null,
  showValues = false,
  width = 520,
  height = 160,
  interactive = false,
}: PlaceValueChartProps) {
  const colCount = columns.length;
  const cw = columnWidth(width, colCount);
  const gap = 8;
  const innerWidth = cw * colCount + gap * (colCount - 1);
  const leftOffset = (width - innerWidth) / 2;

  const isHighlighted = (idx: number) => idx === highlightColumn;

  return (
    <div className="flex justify-center">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="drop-shadow-sm"
      >
        {/* Column backgrounds and borders */}
        {columns.map((label, ci) => {
          const cx = leftOffset + ci * (cw + gap);
          const isHighlight = isHighlighted(ci);
          const isZero = digits[ci] === "" || digits[ci] === "0";

          return (
            <g key={ci}>
              {/* Column body */}
              <rect
                x={cx}
                y={24}
                width={cw}
                height={height - 52}
                rx={6}
                fill={
                  isHighlight
                    ? "#EEF2FF"
                    : isZero
                    ? "#F8FAFC"
                    : "#FAF5FF"
                }
                stroke={
                  isHighlight
                    ? "#6366F1"
                    : isZero
                    ? "#E2E8F0"
                    : "#C7D2FE"
                }
                strokeWidth={isHighlight ? 2.5 : 1.5}
              />

              {/* Column header */}
              <text
                x={cx + cw / 2}
                y={18}
                textAnchor="middle"
                dominantBaseline="alphabetic"
                fill={isHighlight ? "#4338CA" : "#64748B"}
                fontSize="9"
                fontWeight={isHighlight ? "700" : "600"}
                letterSpacing="0.5"
              >
                {columnLabel(label, cw)}
              </text>

              {/* Digit */}
              <text
                x={cx + cw / 2}
                y={height / 2 + 4}
                textAnchor="middle"
                dominantBaseline="central"
                fill={isHighlight ? "#312E81" : "#1E293B"}
                fontSize="32"
                fontWeight="800"
                fontFamily="'Segoe UI', system-ui, sans-serif"
              >
                {digits[ci] !== "" && digits[ci] !== undefined
                  ? digits[ci]
                  : "—"}
              </text>

              {/* Place value below digit */}
              {showValues && (
                <text
                  x={cx + cw / 2}
                  y={height - 18}
                  textAnchor="middle"
                  dominantBaseline="alphabetic"
                  fill={isHighlight ? "#4338CA" : "#94A3B8"}
                  fontSize="11"
                  fontWeight="700"
                  fontFamily="'Segoe UI', system-ui, sans-serif"
                >
                  {digitValue(digits[ci], ci)}
                </text>
              )}
            </g>
          );
        })}

        {/* Equal sign and expanded form (shown when showValues and all columns filled) */}
        {showValues &&
          digits.every((d) => d !== "" && d !== undefined) && (
            <g>
              <text
                x={leftOffset + innerWidth + 16}
                y={height / 2 - 8}
                dominantBaseline="central"
                fill="#64748B"
                fontSize="13"
                fontWeight="600"
              >
                =
              </text>
              <text
                x={leftOffset + innerWidth + 28}
                y={height / 2 - 8}
                dominantBaseline="central"
                fill="#4338CA"
                fontSize="13"
                fontWeight="700"
              >
                {digits
                  .map((d, ci) => {
                    const v = digitValue(d, ci);
                    return v !== "0" ? v : null;
                  })
                  .filter(Boolean)
                  .join(" + ")}
              </text>
              <text
                x={leftOffset + innerWidth + 28}
                y={height / 2 + 14}
                dominantBaseline="alphabetic"
                fill="#94A3B8"
                fontSize="10"
                fontWeight="500"
              >
                {digits
                  .map((d, ci) => {
                    const v = digitValue(d, ci);
                    return v !== "0" ? `${d} × ${PLACE_VALUES[ci].toLocaleString()}` : null;
                  })
                  .filter(Boolean)
                  .join(" + ")}
              </text>
            </g>
          )}
      </svg>
    </div>
  );
}
