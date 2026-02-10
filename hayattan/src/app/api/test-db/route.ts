import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Basit database bağlantı testi
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    
    // Tüm tablo sayılarını kontrol et
    const [kategoriCount, yazarCount, yaziCount, pageCount, haberCount] = await Promise.all([
      prisma.kategori.count(),
      prisma.yazar.count(), 
      prisma.yazi.count(),
      prisma.page.count(),
      prisma.haber.count()
    ]);
    
    // Son yazıları kontrol et
    const sonYazilar = await prisma.yazi.findMany({
      take: 3,
      orderBy: { publishedAt: 'desc' },
      select: {
        title: true,
        slug: true,
        publishedAt: true,
        author: { select: { name: true } }
      }
    });
    
    // Admin kullanıcıları kontrol et
    const adminCount = await prisma.yazar.count({
      where: { role: 'ADMIN' }
    });
    
    return NextResponse.json({
      success: true,
      message: "Database bağlantısı başarılı",
      data: {
        connectionTest: result,
        counts: {
          kategoriler: kategoriCount,
          yazarlar: yazarCount,
          yazilar: yaziCount,
          sayfalar: pageCount,
          haberler: haberCount,
          adminler: adminCount
        },
        sonYazilar,
        status: yaziCount > 0 ? 'ready' : 'needs_seed'
      }
    });
    
  } catch (error) {
    console.error("Database test hatası:", error);
    
    return NextResponse.json({
      success: false,
      message: "Database bağlantısı başarısız",
      error: error instanceof Error ? error.message : "Bilinmeyen hata"
    }, { status: 500 });
  }
}