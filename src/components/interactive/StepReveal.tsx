"use client";

import React, { useState } from "react";

interface RevealStep {
  title: string;
  description?: string;
  visual?: React.ReactNode;
}

interface StepRevealProps {
  steps: RevealStep[];
  onComplete?: () => void;
  mode?: "carousel" | "all";
}

export function StepReveal({ steps, onComplete, mode = "carousel" }: StepRevealProps) {
  const [current, setCurrent] = useState(0);
  const isLast = current >= steps.length - 1;
  const step = steps[current];

  // "all" mode: show all steps without carousel navigation
  if (mode === "all") {
    if (!steps || steps.length === 0) return null;
    return (
      <div className="rounded-2xl border border-slate-200/60 bg-gradient-to-br from-slate-50 to-white p-5 space-y-5">
        {steps.map((s, i) => (
          <div key={i} className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold">
              {i + 1}
            </div>
            <h4 className="font-bold text-slate-800 text-base">{s.title}</h4>
            {s.description && (
              <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">{s.description}</p>
            )}
            {s.visual && (
              <div className="flex justify-center py-2">{s.visual}</div>
            )}
            {i < steps.length - 1 && (
              <div className="flex justify-center">
                <div className="w-0.5 h-4 bg-indigo-200" />
              </div>
            )}
          </div>
        ))}
        {onComplete && (
          <div className="flex justify-center pt-3">
            <button
              onClick={onComplete}
              className="px-5 py-2 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-colors"
            >
              Got it! ✓
            </button>
          </div>
        )}
      </div>
    );
  }

  if (!step) return null;

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-gradient-to-br from-slate-50 to-white p-5 space-y-4">
      <div className="flex items-center gap-2 justify-center">
        {steps.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2.5 rounded-full transition-all ${
              i === current
                ? "bg-indigo-500 w-6"
                : i < current
                ? "bg-indigo-300"
                : "bg-slate-200"
            }`}
          />
        ))}
      </div>

      <div className="text-center space-y-2">
        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
          Step {current + 1} of {steps.length}
        </p>
        <h4 className="font-bold text-slate-800 text-base">{step.title}</h4>
        {step.description && (
          <p className="text-sm text-slate-600 leading-relaxed">{step.description}</p>
        )}
      </div>

      {step.visual && (
        <div className="flex justify-center">{step.visual}</div>
      )}

      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
          className="px-4 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-all"
        >
          ← Back
        </button>
        {isLast ? (
          <button
            onClick={onComplete}
            className="px-5 py-2 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-colors"
          >
            Got it! ✓
          </button>
        ) : (
          <button
            onClick={() => setCurrent((c) => Math.min(steps.length - 1, c + 1))}
            className="px-5 py-2 rounded-xl bg-indigo-500 text-white text-sm font-bold hover:bg-indigo-600 transition-colors"
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
}
