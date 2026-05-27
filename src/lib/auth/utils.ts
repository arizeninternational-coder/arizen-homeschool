import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export async function createUser(data: {
  email: string;
  password: string;
  name: string;
  guildId: string;
  role?: string;
  grade?: number;
  displayName?: string;
}) {
  const passwordHash = await bcrypt.hash(data.password, 12);
  const userRole = data.role || "LEARNER";

  const { data: user, error } = await supabase
    .from("User")
    .insert({
      guildId: data.guildId,
      email: data.email,
      name: data.name,
      passwordHash,
      role: userRole,
    })
    .select("id, name, email, role")
    .single();

  if (error) throw error;

  // Create learner profile if LEARNER
  if (userRole === "LEARNER") {
    await supabase.from("LearnerProfile").insert({
      userId: user.id,
      guildId: data.guildId,
      displayName: data.displayName || data.name,
      grade: data.grade || 5,
    });
  }

  return user;
}

export async function updateStreak(learnerId: string) {
  const { data: profile } = await supabase
    .from("LearnerProfile")
    .select("currentStreak, bestStreak, lastActivityDate")
    .eq("id", learnerId)
    .single();

  if (!profile) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastActivity = profile.lastActivityDate ? new Date(profile.lastActivityDate) : null;

  if (lastActivity) {
    lastActivity.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      const newStreak = profile.currentStreak + 1;
      await supabase.from("LearnerProfile").update({
        currentStreak: newStreak,
        bestStreak: Math.max(newStreak, profile.bestStreak),
        lastActivityDate: new Date().toISOString(),
      }).eq("id", learnerId);
    } else if (diffDays > 1) {
      await supabase.from("LearnerProfile").update({
        currentStreak: 1,
        lastActivityDate: new Date().toISOString(),
      }).eq("id", learnerId);
    }
    // diffDays === 0: same day, no change
  } else {
    await supabase.from("LearnerProfile").update({
      currentStreak: 1,
      bestStreak: Math.max(1, profile.bestStreak),
      lastActivityDate: new Date().toISOString(),
    }).eq("id", learnerId);
  }
}

export async function awardXp(
  learnerId: string,
  amount: number,
  sourceType: string,
  sourceId: string,
  description?: string
) {
  await supabase.from("XpRecord").insert({
    learnerId,
    sourceType,
    sourceId,
    amount,
    description,
  });

  // Increment totalXp on profile
  const { data: profile } = await supabase
    .from("LearnerProfile")
    .select("totalXp")
    .eq("id", learnerId)
    .single();

  if (profile) {
    await supabase.from("LearnerProfile").update({
      totalXp: profile.totalXp + amount,
    }).eq("id", learnerId);
  }
}
