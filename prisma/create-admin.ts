/**
 * Creates or promotes the administrator used by the credentials provider.
 * Usage: ADMIN_EMAIL=... ADMIN_PASSWORD=... npx tsx prisma/create-admin.ts
 */

import "dotenv/config";
import { hash } from "bcryptjs";
import { prisma } from "../src/lib/db";
import { validatePassword } from "../src/lib/password-validator";

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";
  const name = process.env.ADMIN_NAME?.trim() || "Yönetici";

  if (!email) throw new Error("ADMIN_EMAIL zorunludur.");

  const validation = validatePassword(password);
  if (!validation.valid) {
    throw new Error(`ADMIN_PASSWORD güvenli değil: ${validation.errors.join(" ")}`);
  }

  const passwordHash = await hash(password, 12);
  const existing = await prisma.yazar.findUnique({ where: { email } });

  const user = existing
    ? await prisma.yazar.update({
        where: { id: existing.id },
        data: { password: passwordHash, role: "ADMIN", ayrilmis: false },
      })
    : await prisma.yazar.create({
        data: {
          email,
          password: passwordHash,
          name,
          slug: `yonetici-${Date.now().toString(36)}`,
          role: "ADMIN",
        },
      });

  console.log(`Yönetici hesabı hazır: ${user.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
