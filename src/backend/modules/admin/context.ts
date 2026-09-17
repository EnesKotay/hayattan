import "server-only";

import { prisma } from "@/backend/infrastructure/database/db";
import { auth } from "@/backend/modules/auth/auth";

// Bazı kurulumlarda oluşturulan Prisma istemcisi yeni modelleri hemen
// yansıtmayabiliyor. Bu uyumluluk katmanı yalnızca backend içinde tutulur.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db = prisma as any;

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export type AuthenticatedAdminUser = {
  id: string;
  role: "ADMIN" | "AUTHOR";
};

export async function requireAuth(
  allowedRoles: Array<AuthenticatedAdminUser["role"]> = ["ADMIN", "AUTHOR"],
): Promise<AuthenticatedAdminUser> {
  const session = await auth();
  const role = session?.user?.role;
  const id = session?.user?.id;

  if (!id || (role !== "ADMIN" && role !== "AUTHOR") || !allowedRoles.includes(role)) {
    throw new Error("Yetkisiz erişim");
  }

  return { id, role };
}

export async function requireAdmin() {
  return requireAuth(["ADMIN"]);
}

export async function getSetting(key: string): Promise<string> {
  try {
    const row = await db.siteSetting.findUnique({ where: { key } });
    return row?.value ?? "";
  } catch {
    return "";
  }
}
