// POST /api/learner/lessons/[lessonSlug]/complete — Mark lesson as complete, award XP and coins
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { withAuth } from "@/lib/api-guard";
export const dynamic = "force-dynamic";

export const POST = withAuth(async (req, user, { params }: { params: { lessonSlug: string } }) => {
  try {
    if (!user.learnerProfileId) {
      return NextResponse.json({ error: "Learner profile not found" }, { status: 400 });
    }

    // Get lesson
    const { data: lesson, error: lessonErr } = await supabase
      .from("Lesson")
      .select("id, title, xpReward, questId")
      .eq("slug", params.lessonSlug)
      .single();

    if (lessonErr || !lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Check if already completed using Progress table
    const { data: existing } = await supabase
      .from("Progress")
      .select("id")
      .eq("learnerId", user.learnerProfileId)
      .eq("lessonId", lesson.id)
      .not("completedAt", "is", null)
      .single();

    if (existing) {
      return NextResponse.json({ success: true, alreadyCompleted: true, xpEarned: 0, coinsEarned: 0, message: "Lesson already completed" });
    }

    const xpAmount = typeof lesson.xpReward === "number" ? lesson.xpReward : JSON.parse(lesson.xpReward || '{"base":10}').base || 10;

    // Record completion in Progress table
    const { error: progressErr } = await supabase
      .from("Progress")
      .upsert({
        learnerId: user.learnerProfileId,
        lessonId: lesson.id,
        completedAt: new Date().toISOString(),
        masteryPercent: 100,
        lastAccessed: new Date().toISOString(),
      }, { onConflict: "learnerId,lessonId" });

    if (progressErr) throw progressErr;

    // Update learner XP
    const { data: profile } = await supabase
      .from("LearnerProfile")
      .select("totalXp")
      .eq("id", user.learnerProfileId)
      .single();

    if (profile) {
      await supabase
        .from("LearnerProfile")
        .update({
          totalXp: (profile.totalXp || 0) + xpAmount,
          lastActivityDate: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .eq("id", user.learnerProfileId);
    }

    // Record XP
    await supabase.from("XpRecord").insert({
      learnerId: user.learnerProfileId,
      sourceType: "LESSON",
      sourceId: lesson.id,
      amount: xpAmount,
      description: `Completed lesson: ${lesson.title}`,
    });

    // Award Spark Coins (10 coins per lesson)
    const coinAmount = 10;
    const { data: wallet } = await supabase
      .from("StudentWallet")
      .select("id, balance, lifetimeEarned")
      .eq("studentId", user.learnerProfileId)
      .single();

    if (wallet) {
      await supabase.from("StudentWallet").update({
        balance: (wallet.balance || 0) + coinAmount,
        lifetimeEarned: (wallet.lifetimeEarned || 0) + coinAmount,
        updatedAt: new Date().toISOString(),
      }).eq("id", wallet.id);
    } else {
      await supabase.from("StudentWallet").insert({
        studentId: user.learnerProfileId,
        balance: coinAmount,
        lifetimeEarned: coinAmount,
      });
    }

    // Record coin transaction
    await supabase.from("CoinTransaction").insert({
      studentId: user.learnerProfileId,
      amount: coinAmount,
      type: "EARNED",
      source: "LESSON",
      sourceId: lesson.id,
      description: `Completed lesson: ${lesson.title}`,
    });

    console.log(`[LESSON_COMPLETE] ${user.learnerProfileId} completed "${lesson.title}", +${xpAmount} XP +${coinAmount} coins`);

    return NextResponse.json({
      success: true, xpEarned: xpAmount, coinsEarned: coinAmount,
      message: `Lesson complete! You earned ${xpAmount} XP and ${coinAmount} Spark Coins.`,
    });
  } catch (err: any) {
    console.error("[LESSON_COMPLETE] Error:", err);
    return NextResponse.json({ error: err.message || "Failed to complete lesson" }, { status: 500 });
  }
});
