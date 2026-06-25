"use client";

import React from "react";

interface MissionCardMockProps {
  title: string;
  items: string[];
}

export function MissionCardMock({ title, items }: MissionCardMockProps) {
  return (
    <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 border-2 border-violet-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-sm">
          <span className="text-xl">⭐</span>
        </div>
        <div>
          <h4 className="text-base font-bold text-slate-900">{title}</h4>
          <p className="text-sm text-slate-600">Tap each item as you complete it</p>
        </div>
      </div>

      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i}>
            <div className="flex items-center gap-3 bg-white rounded-xl p-4 border-2 border-slate-100">
              <div className="w-6 h-6 rounded-full border-2 border-slate-300 flex items-center justify-center flex-shrink-0">
                {/* Empty circle — not checked */}
              </div>
              <p className="text-base text-slate-700">{item}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
