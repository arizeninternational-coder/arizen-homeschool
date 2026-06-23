"use client";

import React from "react";

interface MediaSpecVideoProps {
  mediaSpec?: {
    type?: string;
    provider?: string;
    url?: string;
    title?: string;
    purpose?: string;
    placement?: string;
    startTime?: number;
    endTime?: number;
    reviewStatus?: string;
    suggestedVideoSearch?: string;
  };
  fallbackVideo?: {
    approvedUrl?: string | null;
    suggestedUrl?: string | null;
    searchKeywords?: string | string[];
    approvedByAdmin?: boolean;
  };
}

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export function MediaSpecVideo({ mediaSpec, fallbackVideo }: MediaSpecVideoProps) {
  const ms = mediaSpec || {};
  const approvedUrl = ms.reviewStatus === "approved" ? ms.url : undefined;
  const suggestedUrl = ms.url || fallbackVideo?.suggestedUrl;
  const searchKeywords = ms.suggestedVideoSearch ||
    (fallbackVideo?.searchKeywords
      ? Array.isArray(fallbackVideo.searchKeywords)
        ? fallbackVideo.searchKeywords.join(", ")
        : fallbackVideo.searchKeywords
      : "");

  if (approvedUrl) {
    const videoId = extractYouTubeId(approvedUrl);
    const embedUrl = videoId
      ? `https://www.youtube.com/embed/${videoId}${ms.startTime ? "?start=" + ms.startTime : ""}`
      : null;

    return (
      <div className="rounded-2xl border border-blue-200/50 overflow-hidden bg-gradient-to-br from-blue-50/80 to-cyan-50/60 shadow-sm mt-4">
        <div className="px-4 py-2.5 flex items-center gap-2 border-b border-blue-200/40">
          <span className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 1L8 5L2 9V1Z" fill="white"/>
            </svg>
          </span>
          <span className="text-xs font-bold text-blue-700">
            {ms.title || "Watch"}
          </span>
        </div>
        {embedUrl ? (
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <iframe
              src={embedUrl}
              title={ms.title || "Lesson video"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        ) : (
          <div className="p-4 text-center">
            <a
              href={approvedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-blue-600 underline hover:text-blue-800"
            >
              Watch video →
            </a>
          </div>
        )}
        {ms.purpose && (
          <div className="px-4 py-2 border-t border-blue-200/40">
            <p className="text-[10px] text-blue-600">{ms.purpose}</p>
          </div>
        )}
      </div>
    );
  }

  if (suggestedUrl) {
    return (
      <div className="rounded-2xl border border-amber-200/50 overflow-hidden bg-gradient-to-br from-amber-50/80 to-yellow-50/60 shadow-sm mt-4">
        <div className="px-4 py-2.5 flex items-center gap-2 border-b border-amber-200/40">
          <span className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 1L8 5L2 9V1Z" fill="white"/>
            </svg>
          </span>
          <span className="text-xs font-bold text-amber-700">Suggested (pending review)</span>
        </div>
        <div className="p-4 text-center">
          <a
            href={suggestedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-bold text-amber-600 underline hover:text-amber-800"
          >
            Preview on YouTube →
          </a>
        </div>
      </div>
    );
  }

  if (searchKeywords) {
    return (
      <div className="rounded-2xl border border-slate-200/50 bg-slate-50/60 p-4 flex items-center gap-3 mt-4">
        <span className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 1L11 7L3 13V1Z" fill="#94A3B8"/>
          </svg>
        </span>
        <div>
          <p className="text-xs font-bold text-slate-500">Video coming soon</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Search: {searchKeywords}</p>
        </div>
      </div>
    );
  }

  return null;
}
