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
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("[AUTH] Missing credentials");
          throw new Error("Email and password are required");
        }

        const email = credentials.email.toLowerCase().trim();
        console.log(`[AUTH] Login attempt: ${email}`);

        const user = await prisma.user.findUnique({
          where: { email },
          include: { guild: true, learnerProfile: true },
        });

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
          console.log(`[AUTH] Invalid hash format for: ${email} (hash prefix: ${user.passwordHash.substring(0, 10)}...)`);
          throw new Error("Invalid email or password");
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) {
          console.log(`[AUTH] Wrong password for: ${email}`);
          throw new Error("Invalid email or password");
        }

        console.log(`[AUTH] Login success: ${email} (${user.role})`);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          guildId: user.guildId,
          guildSlug: user.guild.slug,
          learnerProfileId: user.learnerProfile?.id || null,
          grade: user.learnerProfile?.grade || null,
          displayName: user.learnerProfile?.displayName || null,
          totalXp: user.learnerProfile?.totalXp || 0,
          currentStreak: user.learnerProfile?.currentStreak || 0,
          avatarUrl: user.learnerProfile?.avatarUrl || null,
        } as any;
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
};

export default NextAuth(authOptions);
