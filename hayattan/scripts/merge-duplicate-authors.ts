/**
 * Aynı isim veya aynı e-posta ile kayıtlı yazarları tek kayıtta birleştirir.
 * Çalıştırma: npm run merge:authors
 */

import "dotenv/config";
import { prisma } from "../src/lib/db";

type YazarWithCount = Awaited<ReturnType<typeof prisma.yazar.findMany>>[number] & {
  _count: { yazilar: number };
};

function mergeGroup(primary: YazarWithCount, duplicates: YazarWithCount[]): Promise<number> {
  let merged = 0;
  return (async () => {
    for (const dup of duplicates) {
      await prisma.yazi.updateMany({
        where: { authorId: dup.id },
        data: { authorId: primary.id },
      });
      await prisma.yazar.delete({ where: { id: dup.id } });
      merged++;
      console.log(`  Birleştirildi: "${dup.name}" (${dup.slug}) → "${primary.name}" (${primary.slug})`);
    }
    return merged;
  })();
}

async function main() {
  const yazarlar = await prisma.yazar.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { yazilar: true } } },
  }) as YazarWithCount[];

  let totalMerged = 0;

  // 1) Aynı isim (tam eşleşme)
  const nameToAuthors = new Map<string, YazarWithCount[]>();
  for (const y of yazarlar) {
    const key = y.name.trim();
    if (!nameToAuthors.has(key)) nameToAuthors.set(key, []);
    nameToAuthors.get(key)!.push(y);
  }
  for (const [, group] of nameToAuthors) {
    if (group.length <= 1) continue;
    const [primary, ...duplicates] = group;
    totalMerged += await mergeGroup(primary, duplicates);
  }

  // 2) Aynı e-posta (isim farklı olsa bile – aynı kişi sayılır)
  const remaining = await prisma.yazar.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { yazilar: true } } },
  }) as YazarWithCount[];
  const emailToAuthors = new Map<string, YazarWithCount[]>();
  for (const y of remaining) {
    const email = (y.email ?? "").trim().toLowerCase();
    if (!email) continue;
    if (!emailToAuthors.has(email)) emailToAuthors.set(email, []);
    emailToAuthors.get(email)!.push(y);
  }
  for (const [, group] of emailToAuthors) {
    if (group.length <= 1) continue;
    // Ana yazar: en çok yazısı olan (veya ilk oluşturulan)
    const primary = group.sort((a, b) => b._count.yazilar - a._count.yazilar)[0];
    const duplicates = group.filter((y: any) => y.id !== primary.id);
    totalMerged += await mergeGroup(primary, duplicates);
  }

  if (totalMerged === 0) {
    console.log("Birleştirilecek tekrar eden yazar bulunamadı.");
  } else {
    console.log(`\n✅ Toplam ${totalMerged} yazar kaydı birleştirildi.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
