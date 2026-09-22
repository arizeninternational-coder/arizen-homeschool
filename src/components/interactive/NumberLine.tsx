/**
 * Number Line — SVG visual for Grade 4 math journeys.
 *
 * Displays a horizontal number line with configurable range,
 * tick marks, labeled benchmarks, and an optional highlighted marker.
 *
 * Useful for ordering, rounding, and number-sense activities.
 */

"use client";

import React from "react";

interface NumberLineProps {
  /** Minimum value of the number line */
  rangeMin: number;
  /** Maximum value of the number line */
  rangeMax: number;
  /** Distance between tick marks */
  tickInterval: number;
  /** Benchmark values to label on the line */
  markers?: number[];
  /** A value to highlight with a marker dot + label */
  markerValue?: number;
  /** Custom label for the marker (e.g. the number being rounded) */
  markerLabel?: string;
  /** Overall width in px */
  width?: number;
  /** Height in px */
  height?: number;
}

export function NumberLine({
  rangeMin,
  rangeMax,
  tickInterval,
  markers = [],
  markerValue,
  markerLabel,
  width = 520,
  height = 120,
}: NumberLineProps) {
  const padding = 40;
  const left = padding;
  const right = width - padding;
  const top = 36;
  const lineY = top + 20;
  const range = rangeMax - rangeMin;
  const pxPerUnit = (right - left) / range;

  const xFor = (value: number) => left + (value - rangeMin) * pxPerUnit;

  // Generate tick marks at tickInterval
  const ticks: number[] = [];
  for (let v = Math.ceil(rangeMin / tickInterval) * tickInterval; v <= rangeMax; v += tickInterval) {
    ticks.push(v);
  }

  // Which ticks are "big" (have labels)
  const bigTickValues = markers.length > 0 ? markers : ticks.filter((t) => t === Math.round(t));

  return (
    <div className="flex justify-center">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="drop-shadow-sm"
      >
        {/* Background track */}
        <line
          x1={left}
          y1={lineY}
          x2={right}
          y2={lineY}
          stroke="#CBD5E1"
          strokeWidth={2}
          strokeLinecap="round"
        />

        {/* Tick marks and labels */}
        {ticks.map((tick) => {
          const x = xFor(tick);
          const isBig = bigTickValues.includes(tick);
          const tickLen = isBig ? 10 : 5;
          const isMarker = markerValue !== undefined && Math.abs(tick - markerValue) < 0.001;

          return (
            <g key={tick}>
              {/* Tick line */}
              <line
                x1={x}
                y1={lineY - tickLen}
                x2={x}
                y2={lineY + tickLen}
                stroke={isMarker ? "#6366F1" : isBig ? "#64748B" : "#CBD5E1"}
                strokeWidth={isMarker ? 3 : isBig ? 2 : 1}
              />

              {/* Label below */}
              {isBig && (
                <text
                  x={x}
                  y={lineY + tickLen + 16}
                  textAnchor="middle"
                  dominantBaseline="alphabetic"
                  fill={isMarker ? "#4338CA" : "#64748B"}
                  fontSize={isMarker ? "12" : "10"}
                  fontWeight={isMarker ? "700" : "500"}
                  fontFamily="'Segoe UI', system-ui, sans-serif"
                >
                  {typeof tick === "number" && Number.isInteger(tick) ? tick.toLocaleString("en-US") : tick.toFixed(1)}
                </text>
              )}

              {/* Highlighted marker */}
              {isMarker && (
                <>
                  {/* Marker dot */}
                  <circle
                    cx={x}
                    cy={lineY}
                    r={7}
                    fill="#6366F1"
                    stroke="#fff"
                    strokeWidth={2}
                  />
                  {/* Marker label above */}
                  <rect
                    x={x - 28}
                    y={lineY - 32}
                    width={56}
                    height={20}
                    rx={10}
                    fill="#EEF2FF"
                    stroke="#6366F1"
                    strokeWidth={1}
                  />
                  <text
                    x={x}
                    y={lineY - 18}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#4338CA"
                    fontSize="11"
                    fontWeight="700"
                    fontFamily="'Segoe UI', system-ui, sans-serif"
                  >
                    {markerLabel || tick.toLocaleString("en-US")}
                  </text>
                  {/* Dashed line from marker to axis */}
                  <line
                    x1={x}
                    y1={lineY - 7}
                    x2={x}
                    y2={lineY - 22}
                    stroke="#A5B4FC"
                    strokeWidth={1.5}
                    strokeDasharray="3,3"
                  />
                </>
              )}
            </g>
          );
        })}

        {/* Range labels at ends */}
        <text
          x={left}
          y={lineY + 38}
          textAnchor="start"
          dominantBaseline="alphabetic"
          fill="#94A3B8"
          fontSize="9"
          fontWeight="500"
        >
          {rangeMin.toLocaleString("en-US")}
        </text>
        <text
          x={right}
          y={lineY + 38}
          textAnchor="end"
          dominantBaseline="alphabetic"
          fill="#94A3B8"
          fontSize="9"
          fontWeight="500"
        >
          {rangeMax.toLocaleString("en-US")}
        </text>
      </svg>
    </div>
  );
}
