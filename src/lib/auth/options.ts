// NextAuth config — uses Supabase REST API for auth (bypasses Prisma TCP issues on Vercel)
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db/prisma";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log("[AUTH] Missing credentials");
            throw new Error("Invalid email or password");
          }

          const email = credentials.email.toLowerCase().trim();
          console.log(`[AUTH] Login attempt: ${email}`);

          // Use Supabase REST API to query user (HTTPS, not TCP)
          const { data: users, error: dbError } = await supabase
            .from("User")
            .select("id, name, email, image, role, passwordHash, guildId")
            .eq("email", email)
            .limit(1);

          if (dbError) {
            console.error("[AUTH] Supabase query error:", dbError.message);
            throw new Error("Invalid email or password");
          }

          const user = users?.[0];
          if (!user) {
            console.log(`[AUTH] User not found: ${email}`);
            throw new Error("Invalid email or password");
          }

          if (!user.passwordHash) {
            console.log(`[AUTH] No password set: ${email}`);
            throw new Error("Invalid email or password");
          }

          const isRealHash = /^\$2[aby]\$\d+\$/.test(user.passwordHash);
          if (!isRealHash) {
            console.log(`[AUTH] Invalid hash format for: ${email}`);
            throw new Error("Invalid email or password");
          }

          const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
          if (!isValid) {
            console.log(`[AUTH] Wrong password for: ${email}`);
            throw new Error("Invalid email or password");
          }

          // Fetch guild and learner profile via Supabase
          let guildSlug = null;
          let learnerProfileId = null;
          let grade = null;
          let displayName = null;
          let totalXp = 0;
          let currentStreak = 0;
          let avatarUrl = null;

          if (user.guildId) {
            const { data: guild } = await supabase
              .from("Guild")
              .select("slug")
              .eq("id", user.guildId)
              .single();
            guildSlug = guild?.slug || null;
          }

          const { data: profile } = await supabase
            .from("LearnerProfile")
            .select("id, grade, displayName, totalXp, currentStreak, avatarUrl")
            .eq("userId", user.id)
            .single();

          if (profile) {
            learnerProfileId = profile.id;
            grade = profile.grade;
            displayName = profile.displayName;
            totalXp = profile.totalXp;
            currentStreak = profile.currentStreak;
            avatarUrl = profile.avatarUrl;
          }

          console.log(`[AUTH] Login success: ${email} (${user.role})`);

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
            guildId: user.guildId,
            guildSlug,
            learnerProfileId,
            grade,
            displayName,
            totalXp,
            currentStreak,
            avatarUrl,
          } as any;
        } catch (error: any) {
          console.error("[AUTH] authorize() error:", error?.message || error);
          throw new Error("Invalid email or password");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.guildId = (user as any).guildId;
        token.guildSlug = (user as any).guildSlug;
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
        (session.user as any).role = token.role;
        (session.user as any).guildId = token.guildId;
        (session.user as any).guildSlug = token.guildSlug;
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
  debug: true,
};

export default NextAuth(authOptions);
