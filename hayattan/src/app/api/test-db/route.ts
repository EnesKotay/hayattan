import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Basit database bağlantı testi
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    
    // Kategori sayısını kontrol et
    const kategoriCount = await prisma.kategori.count();
    
    // Yazar sayısını kontrol et
    const yazarCount = await prisma.yazar.count();
    
    // Yazı sayısını kontrol et
    const yaziCount = await prisma.yazi.count();
    
    return NextResponse.json({
      success: true,
      message: "Database bağlantısı başarılı",
      data: {
        connectionTest: result,
        counts: {
          kategoriler: kategoriCount,
          yazarlar: yazarCount,
          yazilar: yaziCount
        }
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