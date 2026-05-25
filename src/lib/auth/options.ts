// NextAuth config — updated for multi-learner support
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        learnerId: { label: "Learner ID", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email && !credentials?.learnerId) {
          throw new Error("Email or learner ID required");
        }

        // Learner quick-switch (demo mode — no password needed)
        if (credentials.learnerId) {
          const profile = await prisma.learnerProfile.findUnique({
            where: { id: credentials.learnerId },
            include: { user: { include: { guild: true } }, guild: true },
          });
          if (!profile) throw new Error("Learner not found");
          return {
            id: profile.userId,
            name: profile.displayName,
            email: profile.user.email,
            image: profile.avatarUrl,
            guildId: profile.guildId,
            guildSlug: profile.user.guild.slug,
            role: "LEARNER",
            learnerProfileId: profile.id,
            grade: profile.grade,
            displayName: profile.displayName,
            totalXp: profile.totalXp,
            currentStreak: profile.currentStreak,
            avatarUrl: profile.avatarUrl,
          } as any;
        }

        // Normal email/password login
        if (!credentials?.password) throw new Error("Password required");

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { guild: true, learnerProfile: true },
        });

        if (!user || !user.passwordHash) throw new Error("Invalid credentials");

        // For demo accounts, allow simple password
        const isDemo = credentials.password === "demo123" && user.passwordHash.includes("$2a$10$jKHICZgTmooKWGzNy73");
        const isValid = isDemo || await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) throw new Error("Invalid credentials");

        // If user has a learner profile, use it
        if (user.learnerProfile) {
          return {
            id: user.id, name: user.name, email: user.email, image: user.image,
            guildId: user.guildId, guildSlug: user.guild.slug, role: user.role,
            learnerProfileId: user.learnerProfile.id, grade: user.learnerProfile.grade,
            displayName: user.learnerProfile.displayName, totalXp: user.learnerProfile.totalXp,
            currentStreak: user.learnerProfile.currentStreak, avatarUrl: user.learnerProfile.avatarUrl,
          } as any;
        }

        return {
          id: user.id, name: user.name, email: user.email, image: user.image,
          guildId: user.guildId, guildSlug: user.guild.slug, role: user.role,
          learnerProfileId: null, grade: null, displayName: null, totalXp: 0, currentStreak: 0,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.guildId = (user as any).guildId;
        token.guildSlug = (user as any).guildSlug;
        token.role = (user as any).role;
        token.learnerProfileId = (user as any).learnerProfileId;
        token.grade = (user as any).grade;
        token.displayName = (user as any).displayName;
        token.totalXp = (user as any).totalXp;
        token.currentStreak = (user as any).currentStreak;
        token.avatarUrl = (user as any).avatarUrl;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).guildId = token.guildId;
        (session.user as any).guildSlug = token.guildSlug;
        (session.user as any).role = token.role;
        (session.user as any).learnerProfileId = token.learnerProfileId;
        (session.user as any).grade = token.grade;
        (session.user as any).displayName = token.displayName;
        (session.user as any).totalXp = token.totalXp;
        (session.user as any).currentStreak = token.currentStreak;
        (session.user as any).avatarUrl = token.avatarUrl;
      }
      return session;
    },
  },
  pages: { signIn: "/auth/login", error: "/auth/login" },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET || "arizen-dev-secret-change-in-production",
};

export default NextAuth(authOptions);
