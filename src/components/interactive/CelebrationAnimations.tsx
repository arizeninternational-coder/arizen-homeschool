"use client";

import React from "react";

// -- Celebration & Confetti Components -----------------------------------------

interface CelebrationProps {
  type?: "correct" | "complete" | "badge";
  active?: boolean;
}

export function CelebrationBurst({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-white/20 animate-[fadeOut_0.8s_ease-out_forwards]" />
      {Array.from({ length: 20 }).map((_, i) => {
        const angle = (i * 360) / 20;
        const distance = 80 + Math.random() * 60;
        const dx = Math.cos((angle * Math.PI) / 180) * distance;
        const dy = Math.sin((angle * Math.PI) / 180) * distance;
        const colors = ["#6366F1", "#EC4899", "#F59E0B", "#10B981", "#3B82F6"];
        const color = colors[i % colors.length];
        return (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full animate-[burst_0.6s_ease-out_forwards]"
            style={{
              backgroundColor: color,
              left: "50%",
              top: "50%",
              ["--dx" as string]: `${dx}px`,
              ["--dy" as string]: `${dy}px`,
            }}
          />
        );
      })}
      <div className="relative animate-[scaleIn_0.3s_ease-out]">
        <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-200">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

export function ConfettiCelebration({ active }: { active: boolean }) {
  if (!active) return null;
  const confettiColors = ["#6366F1", "#EC4899", "#F59E0B", "#10B981", "#3B82F6", "#EF4444"];
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {Array.from({ length: 50 }).map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.5;
        const duration = 1.5 + Math.random() * 1;
        const color = confettiColors[i % confettiColors.length];
        const rotation = Math.random() * 360;
        const size = 6 + Math.random() * 6;
        return (
          <div
            key={i}
            className="absolute top-0 animate-[confettiFall_2s_ease-in_forwards]"
            style={{
              left: `${left}%`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              width: `${size}px`,
              height: `${size * 1.5}px`,
              backgroundColor: color,
              borderRadius: size > 8 ? "2px" : "50%",
              transform: `rotate(${rotation}deg)`,
            }}
          />
        );
      })}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center animate-[scaleIn_0.5s_ease-out]">
          <div className="text-6xl mb-4">🎉</div>
          <p className="text-xl font-extrabold text-emerald-600">Amazing work!</p>
        </div>
      </div>
    </div>
  );
}

export function SparkleGlow({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * 360) / 8;
        const x = 50 + 35 * Math.cos((angle * Math.PI) / 180);
        const y = 50 + 35 * Math.sin((angle * Math.PI) / 180);
        return (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 bg-amber-400 rounded-full animate-[sparkle_0.6s_ease-out_forwards]"
            style={{ left: `${x}%`, top: `${y}%` }}
          />
        );
      })}
      <div className="absolute inset-0 rounded-2xl ring-4 ring-amber-300/50 animate-[glowFade_0.8s_ease-out_forwards]" />
    </div>
  );
}
