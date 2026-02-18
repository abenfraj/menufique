import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { loginSchema } from "@/lib/validators";
import { sendWelcomeEmail } from "@/lib/email";

const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 jours en secondes
const TOKEN_REFRESH_INTERVAL = 24 * 60 * 60; // Rafraîchir les données DB toutes les 24h

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE,
    updateAge: 24 * 60 * 60, // Prolonger la session glissante toutes les 24h d'activité
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.passwordHash) return null;

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  events: {
    async createUser({ user }) {
      // Send welcome email on first sign-up (works for both credentials & OAuth)
      if (user.email) {
        sendWelcomeEmail(user.email, user.name).catch(() => {});
      }
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      // Première connexion : on initialise le token
      if (user) {
        token.id = user.id;
        token.lastDbRefresh = 0; // Force un refresh immédiat
      }

      // Rafraîchir les données DB seulement toutes les 24h (pas à chaque requête)
      const now = Math.floor(Date.now() / 1000);
      const lastRefresh = (token.lastDbRefresh as number) ?? 0;
      if (token.id && now - lastRefresh > TOKEN_REFRESH_INTERVAL) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { plan: true, name: true, image: true },
        });
        if (dbUser) {
          token.plan = dbUser.plan;
          token.name = dbUser.name;
          token.picture = dbUser.image;
          token.lastDbRefresh = now;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.plan = token.plan as string;
      }
      return session;
    },
  },
});
