import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    // Cron secret doğrulaması
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    try {
        const now = new Date();

        // Zamanlanmış ve yayınlanma zamanı geçmiş yazıları bul
        // publishedAt set edilmiş ama henüz "yayında" olarak değerlendirilmemiş olanlar
        // Aslında publishedAt zaten var ve tarih geçmişse sitede görünmeli,
        // ama cache'i temizleyip yeni içerik gösterilmesini sağlıyoruz
        const scheduledPosts = await prisma.yazi.findMany({
            where: {
                publishedAt: {
                    lte: now,
                    not: null,
                },
                // Son 24 saatte yayına giren yazıları bul (her çalıştığında tüm DB'yi taramasın)
                createdAt: {
                    gte: new Date(now.getTime() - 24 * 60 * 60 * 1000),
                },
            },
            select: {
                id: true,
                title: true,
                slug: true,
                publishedAt: true,
            },
        });

        if (scheduledPosts.length > 0) {
            // İlgili sayfaları yeniden oluştur
            revalidatePath("/");
            revalidatePath("/yazilar");
            revalidatePath("/kategoriler");

            // Her yazının kendi sayfasını da revalidate et
            for (const post of scheduledPosts) {
                revalidatePath(`/yazilar/${post.slug}`);
            }
        }

        return NextResponse.json({
            success: true,
            message: `${scheduledPosts.length} yazı kontrol edildi`,
            publishedCount: scheduledPosts.length,
            posts: scheduledPosts.map((p) => ({
                id: p.id,
                title: p.title,
                publishedAt: p.publishedAt,
            })),
        });
    } catch (error) {
        console.error("Cron zamanlama hatası:", error);
        return NextResponse.json(
            { error: "Zamanlama işlemi başarısız" },
            { status: 500 }
        );
    }
}
