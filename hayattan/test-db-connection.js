
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Veritabanı bağlantısı test ediliyor...');
    try {
        const count = await prisma.yazi.count();
        console.log(`Toplam yazı sayısı: ${count}`);

        const yazilar = await prisma.yazi.findMany({
            take: 5,
            select: { id: true, title: true, slug: true, publishedAt: true }
        });
        console.log('Son 5 yazı:', JSON.stringify(yazilar, null, 2));

        console.log('Bağlantı başarılı ✅');
    } catch (error) {
        console.error('HATA OLUŞTU ❌:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
