// NextAuth config — uses Supabase REST API for auth (bypasses Prisma TCP issues on Vercel)
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
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
        const logs: string[] = [];
        try {
          logs.push("authorize() called");
          
          if (!credentials?.email || !credentials?.password) {
            logs.push("ERROR: Missing credentials");
            console.log("[AUTH]", logs.join(" | "));
            throw new Error("Invalid email or password");
          }

          const email = credentials.email.toLowerCase().trim();
          logs.push(`email=${email}`);

          // Use Supabase REST API to query user
          const { data: users, error: dbError } = await supabase
            .from("User")
            .select("id, name, email, image, role, passwordHash, guildId")
            .eq("email", email)
            .limit(1);

          logs.push(`dbError=${dbError ? dbError.message : 'null'}`);
          logs.push(`usersCount=${users?.length || 0}`);
          
          if (dbError) {
            logs.push(`ERROR: Supabase query failed: ${dbError.message}`);
            console.log("[AUTH]", logs.join(" | "));
            throw new Error("Invalid email or password");
          }

          const user = users?.[0];
          logs.push(`userFound=${!!user}`);
          
          if (!user) {
            logs.push("ERROR: User not found in database");
            console.log("[AUTH]", logs.join(" | "));
            throw new Error("Invalid email or password");
          }

          logs.push(`userId=${user.id}, role=${user.role}`);
          logs.push(`hasPasswordHash=${!!user.passwordHash}`);
          
          if (!user.passwordHash) {
            logs.push("ERROR: User has no passwordHash");
            console.log("[AUTH]", logs.join(" | "));
            throw new Error("Invalid email or password");
          }

          logs.push(`hashPrefix=${user.passwordHash.substring(0, 7)}`);
          
          const isRealHash = /^\$2[aby]\$\d+\$/.test(user.passwordHash);
          logs.push(`isRealHash=${isRealHash}`);
          
          if (!isRealHash) {
            logs.push("ERROR: passwordHash is not a valid bcrypt hash");
            console.log("[AUTH]", logs.join(" | "));
            throw new Error("Invalid email or password");
          }

          const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
          logs.push(`bcryptCompareResult=${isValid}`);
          
          if (!isValid) {
            logs.push("ERROR: bcrypt.compare returned false");
            console.log("[AUTH]", logs.join(" | "));
            throw new Error("Invalid email or password");
          }

          logs.push("SUCCESS: Login authorized");
          console.log("[AUTH]", logs.join(" | "));

          // Fetch guild
          let guildSlug = null;
          if (user.guildId) {
            const { data: guild } = await supabase
              .from("Guild")
              .select("slug")
              .eq("id", user.guildId)
              .single();
            guildSlug = guild?.slug || null;
          }

          // Fetch learner profile
          const { data: profile } = await supabase
            .from("LearnerProfile")
            .select("id, grade, displayName, totalXp, currentStreak, avatarUrl")
            .eq("userId", user.id)
            .single();

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
            guildId: user.guildId,
            guildSlug,
            learnerProfileId: profile?.id || null,
            grade: profile?.grade || null,
            displayName: profile?.displayName || null,
            totalXp: profile?.totalXp || 0,
            currentStreak: profile?.currentStreak || 0,
            avatarUrl: profile?.avatarUrl || null,
          } as any;
        } catch (error: any) {
          logs.push(`CATCH ERROR: ${error?.message || error}`);
          console.log("[AUTH]", logs.join(" | "));
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
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: process.env.NODE_ENV === "production" ? ".vercel.app" : undefined,
      },
    },
  },
};

export default NextAuth(authOptions);
