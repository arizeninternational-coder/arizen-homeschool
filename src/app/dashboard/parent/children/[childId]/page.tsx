"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Flame, Trophy, Star, Heart, BookOpen, Target,
  Calendar, Award, Clock, Sparkles, Users, MessageCircle
} from "lucide-react";

const C = {
  page: "#F7FBF7", teal: "#047A70", dark: "#0F172A", body: "#64748B",
  white: "#FFFFFF", border: "#E2E8F0", cream: "#FFFBEB", mint: "#ECFDF5",
  lavender: "#EDE9FE", rose: "#FFF1F2", blue: "#EFF6FF",
};

const eqColors: Record<string, { bg: string; border: string; emoji: string }> = {
  happy: { bg: "#FEF9C3", border: "#FDE047", emoji: "😊" },
  calm: { bg: "#D1FAE5", border: "#6EE7B7", emoji: "😌" },
  curious: { bg: "#E0E7FF", border: "#A5B4FC", emoji: "🤔" },
  okay: { bg: "#E0F2FE", border: "#7DD3FC", emoji: "😐" },
  worried: { bg: "#EDE9FE", border: "#C4B5FD", emoji: "😟" },
  tired: { bg: "#DDD6FE", border: "#A78BFA", emoji: "😴" },
  frustrated: { bg: "#FFE4E6", border: "#FDA4AF", emoji: "😤" },
  sad: { bg: "#E0E7FF", border: "#A5B4FC", emoji: "😢" },
};

export default function ChildJourneyPage() {
  const params = useParams();
  const childId = params.childId as string;
  const [loading, setLoading] = useState(true);
  const [child, setChild] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [recentCheckins, setRecentCheckins] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [childRes, checkinsRes, badgesRes, activityRes] = await Promise.allSettled([
          fetch(`/api/parent/children/${childId}`, { credentials: "include" }).then(r => r.json()),
          fetch(`/api/parent/children/${childId}/checkins`, { credentials: "include" }).then(r => r.json()),
          fetch(`/api/parent/children/${childId}/badges`, { credentials: "include" }).then(r => r.json()),
          fetch(`/api/parent/children/${childId}/activity`, { credentials: "include" }).then(r => r.json()),
        ]);

        if (childRes.status === "fulfilled") {
          const d = childRes.value;
          setChild(d.child || d);
          setSubjects(d.subjects || d.child?.subjects || []);
        }
        if (checkinsRes.status === "fulfilled") setRecentCheckins(checkinsRes.value?.checkins || []);
        if (badgesRes.status === "fulfilled") setBadges(badgesRes.value?.badges || []);
        if (activityRes.status === "fulfilled") setRecentActivity(activityRes.value?.activity || []);
      } catch (e) { console.error("[CHILD_JOURNEY] Load error:", e); }
      setLoading(false);
    };
    load();
  }, [childId]);

  if (loading) return null;

  const displayName = child?.name || child?.displayName || "Your Child";
  const grade = child?.grade || child?.child?.grade;
  const streak = child?.currentStreak || child?.streak || 0;
  const totalXp = child?.totalXp || child?.xp || 0;
  const sparkCoins = child?.sparkCoins || child?.wallet?.balance || 0;
  const lessonsCompleted = child?.lessonsCompleted || 0;
  const questsCompleted = child?.questsCompleted || 0;

  return (
    <div style={{ padding: "28px 32px 40px", maxWidth: 1100, margin: "0 auto" }}>
      <Link href="/dashboard/parent" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: C.body, fontSize: "0.875rem", fontWeight: 600, textDecoration: "none", marginBottom: "1.5rem" }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      {/* Child header */}
      <div style={{
        background: "linear-gradient(135deg, #ECFDF5, #E6F5F1, #EFF6FF)",
        borderRadius: 24, padding: "28px 32px", marginBottom: 24,
        border: "1px solid " + C.border, display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap",
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, #A7F3D0, #6EE7B7)",
          border: "3px solid #6EE7B7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36,
        }}>🧒🏽</div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: C.dark, margin: "0 0 4px" }}>{displayName}</h1>
          <p style={{ fontSize: "0.875rem", color: C.body, margin: "0 0 10px" }}>
            {grade ? `Grade ${grade}` : "Grade not set"} · Level {child?.avatarLevel || 1} · {sparkCoins} Spark Coins
          </p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.8125rem", display: "flex", alignItems: "center", gap: 4 }}><Flame size={14} style={{ color: "#E11D48" }} /> {streak} day streak</span>
            <span style={{ fontSize: "0.8125rem", display: "flex", alignItems: "center", gap: 4 }}><Star size={14} style={{ color: "#D97706" }} /> {totalXp} XP</span>
            <span style={{ fontSize: "0.8125rem", display: "flex", alignItems: "center", gap: 4 }}><BookOpen size={14} style={{ color: C.teal }} /> {lessonsCompleted} lessons</span>
            <span style={{ fontSize: "0.8125rem", display: "flex", alignItems: "center", gap: 4 }}><Target size={14} style={{ color: "#6D28D9" }} /> {questsCompleted} quests</span>
          </div>
        </div>
        <Link href={`/dashboard/parent/messages?childId=${childId}`} style={{
          padding: "10px 20px", borderRadius: 12, border: "none", background: C.teal, color: "#fff",
          fontWeight: 700, fontSize: "0.8125rem", textDecoration: "none", display: "flex", alignItems: "center", gap: 6,
        }}>
          <MessageCircle size={14} /> Message
        </Link>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { icon: <Flame size={18} style={{ color: "#E11D48" }} />, value: `${streak} days`, label: "Streak", bg: C.rose },
          { icon: <Star size={18} style={{ color: "#D97706" }} />, value: String(totalXp), label: "Total XP", bg: C.cream },
          { icon: <Trophy size={18} style={{ color: "#6D28D9" }} />, value: String(badges.filter((b: any) => b.earned).length), label: "Badges", bg: C.lavender },
          { icon: <BookOpen size={18} style={{ color: C.teal }} />, value: String(lessonsCompleted), label: "Lessons Done", bg: C.mint },
        ].map((s, i) => (
          <div key={i} style={{ padding: "16px", borderRadius: 16, border: "1px solid " + C.border, background: s.bg }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>{s.icon}<span style={{ fontSize: "0.6875rem", fontWeight: 700, color: C.body, textTransform: "uppercase" }}>{s.label}</span></div>
            <div style={{ fontSize: "1.5rem", fontWeight: 900, color: C.dark }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Subjects */}
        <div>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: C.dark, margin: "0 0 14px" }}>📚 Current Subjects</h3>
          {subjects.length === 0 ? (
            <div style={{ padding: "20px", borderRadius: 14, background: C.white, border: "1px solid " + C.border, textAlign: "center" }}>
              <p style={{ fontSize: "0.8125rem", color: C.body }}>No subjects yet.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {subjects.map((s: any, i: number) => (
                <div key={i} style={{ padding: "14px 16px", borderRadius: 14, background: C.white, border: "1px solid " + C.border, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: "0.8125rem", fontWeight: 800, color: C.dark }}>{s.name}</span>
                      <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: C.body }}>{s.progress || 0}%</span>
                    </div>
                    <div style={{ height: 5, borderRadius: 3, background: "#F1F5F9", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${s.progress || 0}%`, borderRadius: 3, background: C.teal }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* EQ Check-in History */}
        <div>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: C.dark, margin: "0 0 14px" }}>💜 EQ Check-ins</h3>
          {recentCheckins.length === 0 ? (
            <div style={{ padding: "20px", borderRadius: 14, background: C.white, border: "1px solid " + C.border, textAlign: "center" }}>
              <p style={{ fontSize: "0.8125rem", color: C.body }}>No check-ins yet today.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {recentCheckins.slice(0, 7).map((c: any, i: number) => {
                const eq = eqColors[c.emotion] || eqColors.okay;
                return (
                  <div key={i} style={{ padding: "10px 14px", borderRadius: 12, background: eq.bg, border: `1px solid ${eq.border}`, display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: "1.25rem" }}>{eq.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: C.dark }}>{c.emotionLabel || c.emotion}</span>
                      <span style={{ fontSize: "0.6875rem", color: C.body, marginLeft: 8 }}>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ""}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Badges */}
      <div style={{ marginTop: 24 }}>
        <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: C.dark, margin: "0 0 14px" }}>🏆 Badges</h3>
        {badges.length === 0 ? (
          <div style={{ padding: "20px", borderRadius: 14, background: C.white, border: "1px solid " + C.border, textAlign: "center" }}>
            <p style={{ fontSize: "0.8125rem", color: C.body }}>No badges earned yet. Keep learning!</p>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {badges.map((b: any, i: number) => (
              <div key={i} style={{
                padding: "8px 14px", borderRadius: 12, background: b.earned ? "#ECFDF5" : "#F8FAFC",
                border: `1px solid ${b.earned ? "#A7F3D0" : C.border}`, display: "flex", alignItems: "center", gap: 6,
              }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: b.earned ? "#065F46" : C.body }}>{b.name || b.title}</span>
                {b.earned ? <span style={{ fontSize: "0.625rem" }}>✓</span> : <span style={{ fontSize: "0.625rem" }}>🔒</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
