// GET /api/learner/dashboard — Single consolidated endpoint for student dashboard data
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { withAuth } from "@/lib/api-guard";
export const dynamic = "force-dynamic";

export const GET = withAuth(async (req, user) => {
  try {
    const learnerId = user.learnerProfileId;

    // Run all queries in parallel for speed
    const [profileRes, walletRes, progressRes, badgesRes, lessonsRes, checkinRes] = await Promise.allSettled([
      // Profile
      supabase.from("LearnerProfile").select("id, name, displayName, grade, totalXp, currentStreak, avatarLevel").eq("id", learnerId).single(),
      // Wallet
      supabase.from("StudentWallet").select("balance, lifetimeEarned").eq("studentId", learnerId).single(),
      // Progress summary (aggregate)
      supabase.from("Progress").select("lessonId, questId, completedAt").eq("learnerId", learnerId).not("completedAt", "is", null),
      // Badges
      supabase.from("Badge").select("id, name, badgeType, earnedAt").eq("learnerId", learnerId),
      // Latest lesson
      supabase.from("Lesson").select("id, title, slug, description, orderIndex").eq("status", "PUBLISHED").order("orderIndex", { ascending: true}).limit(1).single(),
      // Today's check-in
      supabase.from("EmotionalCheckin").select("id, emotion").eq("learnerId", learnerId).gte("createdAt", new Date(new Date().setHours(0,0,0,0)).toISOString()).limit(1).single(),
    ]);

    const profile = profileRes.status === "fulfilled" && !profileRes.value.error ? profileRes.value.data : null;
    const wallet = walletRes.status === "fulfilled" && !walletRes.value.error ? walletRes.value.data : null;
    const progressItems = progressRes.status === "fulfilled" && !progressRes.value.error ? (progressRes.value.data || []) : [];
    const badges = badgesRes.status === "fulfilled" && !badgesRes.value.error ? (badgesRes.value.data || []) : [];
    const latestLesson = lessonsRes.status === "fulfilled" && !lessonsRes.value.error ? lessonsRes.value.data : null;
    const checkin = checkinRes.status === "fulfilled" && !checkinRes.value.error && checkinRes.value.data ? checkinRes.value.data : null;

    const lessonsCompleted = progressItems.filter((p: any) => p.lessonId).length;
    const questsCompleted = progressItems.filter((p: any) => p.questId).length;
    const earnedBadges = badges.map((b: any) => b.name);

    // Build subjects from progress data
    const subjects = [
      { name: "Mathematics", level: 1, progress: 0, color: "#EDE9FE", icon: "BookOpen" },
      { name: "English", level: 1, progress: 0, color: "#FFF4D8", icon: "BookMarked" },
      { name: "Science", level: 1, progress: 0, color: "#ECFDF5", icon: "Beaker" },
      { name: "Social Studies", level: 1, progress: 0, color: "#EFF6FF", icon: "Globe" },
    ];

    return NextResponse.json({
      profile: {
        name: profile?.displayName || profile?.name || user.name || "Learner",
        grade: profile?.grade || null,
        totalXp: profile?.totalXp || 0,
        currentStreak: profile?.currentStreak || 0,
        avatarLevel: profile?.avatarLevel || 1,
      },
      wallet: {
        balance: wallet?.balance || 0,
        lifetimeEarned: wallet?.lifetimeEarned || 0,
      },
      progress: {
        lessonsCompleted,
        questsCompleted,
        dailyGoalCompleted: 0,
        dailyGoalTarget: 3,
      },
      badges: earnedBadges,
      latestLesson: latestLesson ? {
        title: latestLesson.title,
        slug: latestLesson.slug,
        description: latestLesson.description || "",
        subject: "Mathematics",
        duration: 12,
      } : {
        title: "Counting by Ones",
        slug: "counting-by-ones",
        description: "Count from 1 to 100 by ones using simple patterns.",
        subject: "Mathematics",
        duration: 12,
      },
      eqCheckedIn: !!checkin,
      subjects,
    });
  } catch (err: any) {
    console.error("[DASHBOARD] Error:", err);
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
});
