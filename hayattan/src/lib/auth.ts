import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";
import { User, Session } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./db";
import {
  logFailedLogin,
  logSuccessfulLogin,
} from "./security-logger";
import { getClientIdentifier, resetRateLimit } from "./rate-limit";

export const authConfig = {
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "E-posta", type: "email" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) {
          // Log failed login attempt (user not found)
          const ipAddress = request?.headers?.get("x-forwarded-for")?.split(",")[0] ||
            request?.headers?.get("x-real-ip") ||
            undefined;
          const userAgent = request?.headers?.get("user-agent") || undefined;

          await logFailedLogin(
            credentials.email as string,
            ipAddress,
            userAgent
          );
          return null;
        }

        const isValid = await compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValid) {
          // Log failed login attempt (wrong password)
          const ipAddress = request?.headers?.get("x-forwarded-for")?.split(",")[0] ||
            request?.headers?.get("x-real-ip") ||
            undefined;
          const userAgent = request?.headers?.get("user-agent") || undefined;

          await logFailedLogin(
            credentials.email as string,
            ipAddress,
            userAgent
          );
          return null;
        }

        // Log successful login
        const ipAddress = request?.headers?.get("x-forwarded-for")?.split(",")[0] ||
          request?.headers?.get("x-real-ip") ||
          undefined;
        const userAgent = request?.headers?.get("user-agent") || undefined;

        await logSuccessfulLogin(
          user.id,
          user.email,
          ipAddress,
          userAgent
        );

        // Reset login rate limit on success so valid users aren't blocked
        if (request) {
          const clientId = getClientIdentifier(request as Request);
          await resetRateLimit(clientId, "login");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/giris",
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 gün
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);

