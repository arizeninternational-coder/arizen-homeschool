"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const login = useCallback(
    async (email: string, password: string, callbackUrl = "/") => {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });
      return result;
    },
    []
  );

  const logout = useCallback(async () => {
    await signOut({ redirect: true, callbackUrl: "/auth/login" });
  }, []);

  const register = useCallback(
    async (data: {
      name: string;
      email: string;
      password: string;
      displayName?: string;
      grade?: number;
    }) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, role: "LEARNER" }),
      });
      return res.json();
    },
    []
  );

  return {
    user: session?.user ?? null,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    isAdmin: session?.user?.role === "ADMIN",
    isTeacher: session?.user?.role === "TEACHER" || session?.user?.role === "ADMIN",
    isLearner: session?.user?.role === "LEARNER",
    login,
    logout,
    register,
  };
}

export function useLearner() {
  const { user, isAuthenticated } = useAuth();

  return {
    profile: user?.learnerProfileId ? {
      id: user.learnerProfileId,
      displayName: user.displayName,
      grade: user.grade,
      totalXp: user.totalXp,
      currentStreak: user.currentStreak,
    } : null,
    isAuthenticated,
  };
}
