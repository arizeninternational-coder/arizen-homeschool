"use client";

import React from "react";

interface TeachingStep {
  label: string;
  visual: React.ReactNode;
}

interface TeachingPanelMockProps {
  title: string;
  steps: TeachingStep[];
}

export function TeachingPanelMock({ title, steps }: TeachingPanelMockProps) {
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 border-2 border-indigo-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-sm">
          <span className="text-xl">💡</span>
        </div>
        <h4 className="text-base font-bold text-slate-900">{title}</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map((step, i) => (
          <div key={i} className="relative">
            <div className="bg-white rounded-xl p-4 border-2 border-slate-100 flex flex-col items-center gap-3">
              {/* Step number badge */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">{i + 1}</span>
              </div>

              {/* Visual */}
              <div className="flex justify-center">{step.visual}</div>

              {/* Label */}
              <p className="text-sm text-slate-700 font-medium text-center">
                {step.label}
              </p>
            </div>

            {/* Arrow connector (except last) */}
            {i < steps.length - 1 && (
              <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-indigo-400">
                  <path d="M5 12h14m-4-4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
