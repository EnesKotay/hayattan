import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { withAccelerate } from "@prisma/extension-accelerate";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const databaseUrl =
  process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL ?? "";

// Prisma 7: adapter veya accelerateUrl gerekli
const isDirectPostgres =
  databaseUrl.startsWith("postgresql://") ||
  databaseUrl.startsWith("postgres://");

function createPrismaClient() {
  if (isDirectPostgres) {
    const adapter = new PrismaPg({ connectionString: databaseUrl });
    return new PrismaClient({
      adapter,
      log:
        process.env.NODE_ENV === "development"
          ? ["error", "warn"]
          : ["error"],
    });
  }
  // prisma+postgres veya prisma:// URL'leri için Accelerate
  return new PrismaClient({
    accelerateUrl: databaseUrl,
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  }).$extends(withAccelerate());
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
