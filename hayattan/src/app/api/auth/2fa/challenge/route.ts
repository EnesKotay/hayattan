import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/db";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";
import { createTwoFactorChallenge, isTwoFactorEnabled } from "@/lib/two-factor";
import { sendTwoFactorCodeEmail } from "@/lib/mail";
import { logFailedLogin, logRateLimitExceeded, logTwoFactorChallenge } from "@/lib/security-logger";

const ALLOWED_EMAILS = ["omerfarukkotay@gmail.com"];

export async function POST(request: NextRequest) {
  const identifier = getClientIdentifier(request);
  const rate = await checkRateLimit(identifier, "login");
  if (!rate.success) {
    await logRateLimitExceeded(identifier, "login", identifier);
    return NextResponse.json(
      { error: "Cok fazla giris denemesi. Lutfen daha sonra tekrar deneyin." },
      { status: 429 }
    );
  }

  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Gecersiz istek" }, { status: 400 });
  }

  const email = (body.email || "").toLowerCase().trim();
  const password = (body.password || "").trim();
  if (!email || !password) {
    return NextResponse.json({ error: "E-posta ve sifre zorunlu" }, { status: 400 });
  }

  if (!ALLOWED_EMAILS.includes(email)) {
    await logFailedLogin(email, identifier, request.headers.get("user-agent") || undefined);
    return NextResponse.json({ error: "Kimlik dogrulanamadi" }, { status: 401 });
  }

  const user = await prisma.yazar.findUnique({ where: { email } });
  if (!user) {
    await logFailedLogin(email, identifier, request.headers.get("user-agent") || undefined);
    return NextResponse.json({ error: "Kimlik dogrulanamadi" }, { status: 401 });
  }

  const validPassword = await compare(password, user.password || "");
  if (!validPassword) {
    await logFailedLogin(email, identifier, request.headers.get("user-agent") || undefined);
    return NextResponse.json({ error: "Kimlik dogrulanamadi" }, { status: 401 });
  }

  const twoFactorEnabled = await isTwoFactorEnabled(user.id);
  if (!twoFactorEnabled) {
    return NextResponse.json({ requiresTwoFactor: false });
  }

  const challenge = await createTwoFactorChallenge(user.id, email);
  await sendTwoFactorCodeEmail(email, challenge.code);
  await logTwoFactorChallenge(user.id, email, identifier, request.headers.get("user-agent") || undefined);

  return NextResponse.json({
    requiresTwoFactor: true,
    challengeToken: challenge.token,
    expiresAt: challenge.expiresAt.toISOString(),
  });
}
