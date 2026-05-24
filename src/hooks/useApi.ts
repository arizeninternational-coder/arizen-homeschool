"use client";

import { useState, useEffect, useCallback } from "react";

interface ApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useApi<T>(url: string | null): ApiResponse<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!url) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

interface Theme {
  id: string; title: string; slug: string; description: string | null;
  drivingQuestion: string | null; durationWeeks: number; grade: number;
  subjects: string[]; questsCount: number; progress: number;
}

export function useThemes(grade?: number) {
  const url = `/api/themes${grade ? `?grade=${grade}` : ""}`;
  return useApi<{ themes: Theme[] }>(url);
}

export function useTheme(slug: string | null) {
  return useApi<{ theme: any }>(slug ? `/api/themes?slug=${slug}` : null);
}

export function useQuest(slug: string | null) {
  return useApi<{ quest: any }>(slug ? `/api/quests?slug=${slug}` : null);
}

export function useLesson(slug: string | null) {
  return useApi<{ lesson: any }>(slug ? `/api/lessons/${slug}` : null);
}

export function useLearnerProfile() {
  return useApi<{ profile: any }>("/api/learner/profile");
}

export function useXpHistory() {
  return useApi<{ xpRecords: any[] }>("/api/learner/xp");
}

export function useBadges() {
  return useApi<{ badges: any[] }>("/api/learner/badges");
}

export function useProgress() {
  return useApi<{ progress: any[] }>("/api/learner/progress");
}
