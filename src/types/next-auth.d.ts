// NextAuth type augmentations
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      guildId: string;
      guildSlug: string;
      role: string;
      learnerProfileId: string | null;
      grade: number | null;
      displayName: string | null;
      totalXp: number;
      currentStreak: number;
    };
  }

  interface User {
    guildId: string;
    guildSlug: string;
    role: string;
    learnerProfileId: string | null;
    grade: number | null;
    displayName: string | null;
    totalXp: number;
    currentStreak: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    guildId: string;
    guildSlug: string;
    role: string;
    learnerProfileId: string | null;
    grade: number | null;
    displayName: string | null;
    totalXp: number;
    currentStreak: number;
  }
}
