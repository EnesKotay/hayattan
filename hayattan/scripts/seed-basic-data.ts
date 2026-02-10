/**
 * Basit test verileri ekler
 * Çalıştırma: npx tsx scripts/seed-basic-data.ts
 */

import "dotenv/config";
import { prisma } from "../src/lib/db";

async function main() {
  console.log("🌱 Temel veriler ekleniyor...");

  try {
    // 1. Test kategorileri
    const kategori1 = await prisma.kategori.upsert({
      where: { slug: "teknoloji" },
      update: {},
      create: {
        name: "Teknoloji",
        slug: "teknoloji",
        description: "Teknoloji ile ilgili yazılar"
      }
    });

    const kategori2 = await prisma.kategori.upsert({
      where: { slug: "yasam" },
      update: {},
      create: {
        name: "Yaşam",
        slug: "yasam", 
        description: "Yaşam ile ilgili yazılar"
      }
    });

    const kategori3 = await prisma.kategori.upsert({
      where: { slug: "misafir-yazarlar" },
      update: {},
      create: {
        name: "Misafir Yazarlar",
        slug: "misafir-yazarlar",
        description: "Misafir yazarların yazıları"
      }
    });

    console.log("✅ Kategoriler eklendi");

    // 2. Test yazarları
    const yazar1 = await prisma.yazar.upsert({
      where: { slug: "admin" },
      update: {},
      create: {
        name: "Admin",
        slug: "admin",
        email: "admin@hayattan.net",
        biyografi: "Site yöneticisi",
        misafir: false,
        ayrilmis: false
      }
    });

    const yazar2 = await prisma.yazar.upsert({
      where: { slug: "test-yazar" },
      update: {},
      create: {
        name: "Test Yazar",
        slug: "test-yazar",
        email: "test@hayattan.net",
        biyografi: "Test yazarı",
        misafir: false,
        ayrilmis: false
      }
    });

    const misafirYazar = await prisma.yazar.upsert({
      where: { slug: "misafir-yazar" },
      update: {},
      create: {
        name: "Misafir Yazar",
        slug: "misafir-yazar",
        email: "misafir@hayattan.net",
        biyografi: "Misafir yazar",
        misafir: true,
        ayrilmis: false
      }
    });

    console.log("✅ Yazarlar eklendi");

    // 3. Test yazıları
    const yazi1 = await prisma.yazi.upsert({
      where: { slug: "test-teknoloji-yazisi" },
      update: {},
      create: {
        title: "Test Teknoloji Yazısı",
        slug: "test-teknoloji-yazisi",
        excerpt: "Bu bir test teknoloji yazısıdır.",
        content: "<p>Bu bir test teknoloji yazısının içeriğidir. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>",
        authorId: yazar1.id,
        publishedAt: new Date(),
        viewCount: 0,
        kategoriler: {
          connect: { id: kategori1.id }
        }
      }
    });

    const yazi2 = await prisma.yazi.upsert({
      where: { slug: "test-yasam-yazisi" },
      update: {},
      create: {
        title: "Test Yaşam Yazısı",
        slug: "test-yasam-yazisi",
        excerpt: "Bu bir test yaşam yazısıdır.",
        content: "<p>Bu bir test yaşam yazısının içeriğidir. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>",
        authorId: yazar2.id,
        publishedAt: new Date(),
        viewCount: 0,
        kategoriler: {
          connect: { id: kategori2.id }
        }
      }
    });

    const misafirYazi = await prisma.yazi.upsert({
      where: { slug: "test-misafir-yazisi" },
      update: {},
      create: {
        title: "Test Misafir Yazısı",
        slug: "test-misafir-yazisi",
        excerpt: "Bu bir test misafir yazısıdır.",
        content: "<p>Bu bir test misafir yazısının içeriğidir. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>",
        authorId: misafirYazar.id,
        publishedAt: new Date(),
        viewCount: 0,
        kategoriler: {
          connect: { id: kategori3.id }
        }
      }
    });

    console.log("✅ Yazılar eklendi");

    // 4. Test sayfaları
    const sayfa1 = await prisma.page.upsert({
      where: { slug: "hakkimizda" },
      update: {},
      create: {
        title: "Hakkımızda",
        slug: "hakkimizda",
        content: "<p>Hayattan.Net hakkında bilgiler...</p>",
        publishedAt: new Date(),
        menuOrder: 1
      }
    });

    console.log("✅ Sayfalar eklendi");

    console.log("🎉 Temel veriler başarıyla eklendi!");
    console.log(`
📊 Eklenen veriler:
- ${await prisma.kategori.count()} kategori
- ${await prisma.yazar.count()} yazar  
- ${await prisma.yazi.count()} yazı
- ${await prisma.page.count()} sayfa
    `);

  } catch (error) {
    console.error("❌ Hata:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();