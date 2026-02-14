import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";
import { User, Session } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./db";
import {
  logFailedLogin,
  logSuccessfulLogin,
  logTwoFactorFailure,
  logTwoFactorSuccess,
} from "./security-logger";
import { getClientIdentifier, resetRateLimit } from "./rate-limit";
import { isTwoFactorEnabled, verifyTwoFactorChallenge } from "./two-factor";

export const authConfig = {
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "E-posta", type: "email" },
        password: { label: "Sifre", type: "password" },
        twoFactorCode: { label: "2FA", type: "text" },
        challengeToken: { label: "Challenge", type: "text" },
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const ALLOWED_EMAILS = ["omerfarukkotay@gmail.com"];
        const email = (credentials.email as string).toLowerCase().trim();
        if (!ALLOWED_EMAILS.includes(email)) {
          return null;
        }

        const user = await prisma.yazar.findUnique({
          where: { email: credentials.email as string },
        });

        const ipAddress = request?.headers?.get("x-forwarded-for")?.split(",")[0] ||
          request?.headers?.get("x-real-ip") ||
          undefined;
        const userAgent = request?.headers?.get("user-agent") || undefined;

        if (!user) {
          await logFailedLogin(credentials.email as string, ipAddress, userAgent);
          return null;
        }

        const isValid = await compare(credentials.password as string, user.password || "");
        if (!isValid) {
          await logFailedLogin(credentials.email as string, ipAddress, userAgent);
          return null;
        }

        const twoFactorEnabled = await isTwoFactorEnabled(user.id);
        if (twoFactorEnabled) {
          const twoFactorCode = (credentials.twoFactorCode as string | undefined)?.trim() || "";
          const challengeToken = (credentials.challengeToken as string | undefined)?.trim() || "";

          if (!twoFactorCode || !challengeToken) {
            await logTwoFactorFailure(user.id, "missing_code_or_token", ipAddress, userAgent);
            return null;
          }

          const verifyResult = await verifyTwoFactorChallenge(challengeToken, user.id, twoFactorCode);
          if (!verifyResult.ok) {
            await logTwoFactorFailure(user.id, verifyResult.reason || "invalid", ipAddress, userAgent);
            return null;
          }

          await logTwoFactorSuccess(user.id, ipAddress, userAgent);
        }

        await logSuccessfulLogin(user.id, user.email || "", ipAddress, userAgent);

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
    maxAge: 30 * 24 * 60 * 60,
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);
