import { createHash, randomBytes } from "crypto";
import { prisma } from "./db";

type SiteSettingModel = {
  findUnique: (args: { where: { key: string } }) => Promise<{ value: string } | null>;
  upsert: (args: {
    where: { key: string };
    create: { key: string; value: string };
    update: { value: string };
  }) => Promise<unknown>;
  update: (args: { where: { key: string }; data: { value: string } }) => Promise<unknown>;
  delete: (args: { where: { key: string } }) => Promise<unknown>;
};

const db = prisma as typeof prisma & { siteSetting: SiteSettingModel };

const ENABLED_KEY_PREFIX = "two_factor:enabled:";
const CHALLENGE_KEY_PREFIX = "two_factor:challenge:";
const CHALLENGE_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

type TwoFactorChallengePayload = {
  userId: string;
  email: string;
  codeHash: string;
  createdAt: number;
  expiresAt: number;
  attempts: number;
};

function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

export async function isTwoFactorEnabled(userId: string): Promise<boolean> {
  const setting = await db.siteSetting.findUnique({
    where: { key: `${ENABLED_KEY_PREFIX}${userId}` },
  });
  return setting?.value === "1";
}

export async function setTwoFactorEnabled(userId: string, enabled: boolean): Promise<void> {
  await db.siteSetting.upsert({
    where: { key: `${ENABLED_KEY_PREFIX}${userId}` },
    create: { key: `${ENABLED_KEY_PREFIX}${userId}`, value: enabled ? "1" : "0" },
    update: { value: enabled ? "1" : "0" },
  });
}

export async function createTwoFactorChallenge(userId: string, email: string) {
  const token = randomBytes(24).toString("hex");
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const now = Date.now();

  const payload: TwoFactorChallengePayload = {
    userId,
    email,
    codeHash: hashCode(code),
    createdAt: now,
    expiresAt: now + CHALLENGE_TTL_MS,
    attempts: 0,
  };

  await db.siteSetting.upsert({
    where: { key: `${CHALLENGE_KEY_PREFIX}${token}` },
    create: { key: `${CHALLENGE_KEY_PREFIX}${token}`, value: JSON.stringify(payload) },
    update: { value: JSON.stringify(payload) },
  });

  return {
    token,
    code,
    expiresAt: new Date(payload.expiresAt),
  };
}

export async function verifyTwoFactorChallenge(
  token: string,
  userId: string,
  code: string
): Promise<{ ok: boolean; reason?: "expired" | "invalid" | "too_many_attempts" }> {
  const key = `${CHALLENGE_KEY_PREFIX}${token}`;
  const row = await db.siteSetting.findUnique({ where: { key } });
  if (!row?.value) {
    return { ok: false, reason: "invalid" };
  }

  let payload: TwoFactorChallengePayload;
  try {
    payload = JSON.parse(row.value) as TwoFactorChallengePayload;
  } catch {
    await db.siteSetting.delete({ where: { key } }).catch(() => undefined);
    return { ok: false, reason: "invalid" };
  }

  if (payload.userId !== userId) {
    return { ok: false, reason: "invalid" };
  }

  if (Date.now() > payload.expiresAt) {
    await db.siteSetting.delete({ where: { key } }).catch(() => undefined);
    return { ok: false, reason: "expired" };
  }

  if (payload.attempts >= MAX_ATTEMPTS) {
    await db.siteSetting.delete({ where: { key } }).catch(() => undefined);
    return { ok: false, reason: "too_many_attempts" };
  }

  if (payload.codeHash !== hashCode(code.trim())) {
    payload.attempts += 1;
    await db.siteSetting.update({
      where: { key },
      data: { value: JSON.stringify(payload) },
    });
    return { ok: false, reason: payload.attempts >= MAX_ATTEMPTS ? "too_many_attempts" : "invalid" };
  }

  await db.siteSetting.delete({ where: { key } }).catch(() => undefined);
  return { ok: true };
}
