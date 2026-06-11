/**
 * Tek seferlik: Admin kullanıcı oluşturur.
 * Seed kaldırıldığı için admin girişi için bu script'i bir kere çalıştırın:
 *   npx tsx prisma/create-admin.ts
 *
 * Giriş: admin@hayattan.net / admin123
 */

import "dotenv/config";
import { hash } from "bcryptjs";
import { prisma } from "../src/lib/db";

async function main() {
  const email = "admin@hayattan.net";
  const password = "admin123";
  const passwordHash = await hash(password, 12);

  const user = await (prisma as unknown as { user: { upsert: (arg: unknown) => Promise<{ email: string }> } }).user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
      name: "Admin",
      role: "ADMIN",
    },
  });

  console.log("✅ Admin kullanıcı hazır:", user.email);
  console.log("   Giriş: admin@hayattan.net / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
