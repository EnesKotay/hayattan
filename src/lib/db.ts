import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient();
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Supabase'in pgbouncer (transaction mode) havuzu DATABASE_URL'de
 * connection_limit ile sınırlı sayıda bağlantı veriyor. Çok sayıda
 * prisma sorgusunu tek bir Promise.all ile aynı anda ateşlemek, havuzda
 * "Timed out fetching a new connection from the pool" hatasına ve
 * sayfanın 500 dönmesine yol açabiliyor. Bu yardımcı, sorguları küçük
 * gruplar halinde sırayla çalıştırarak aynı sonucu üretir.
 */
export async function runInBatches<T extends readonly unknown[]>(
  tasks: { [K in keyof T]: () => Promise<T[K]> },
  batchSize = 1
): Promise<T> {
  const results: unknown[] = [];
  const list = tasks as unknown as Array<() => Promise<unknown>>;
  for (let i = 0; i < list.length; i += batchSize) {
    const batch = list.slice(i, i + batchSize).map((task) => task());
    results.push(...(await Promise.all(batch)));
  }
  return results as unknown as T;
}
