import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testNeonConnection() {
  try {
    console.log('🔍 Neon database bağlantısı test ediliyor...');
    
    // Database bağlantısını test et
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database bağlantısı başarılı:', result);

    // Tablo sayılarını kontrol et
    const [kategoriCount, yazarCount, yaziCount, pageCount, haberCount] = await Promise.all([
      prisma.kategori.count(),
      prisma.yazar.count(),
      prisma.yazi.count(),
      prisma.page.count(),
      prisma.haber.count()
    ]);

    console.log('📊 Tablo sayıları:');
    console.log(`   Kategoriler: ${kategoriCount}`);
    console.log(`   Yazarlar: ${yazarCount}`);
    console.log(`   Yazılar: ${yaziCount}`);
    console.log(`   Sayfalar: ${pageCount}`);
    console.log(`   Haberler: ${haberCount}`);

    // Son yazıları getir
    const sonYazilar = await prisma.yazi.findMany({
      take: 3,
      orderBy: { publishedAt: 'desc' },
      select: {
        title: true,
        slug: true,
        publishedAt: true,
        author: {
          select: { name: true }
        }
      }
    });

    console.log('📝 Son yazılar:');
    sonYazilar.forEach(yazi => {
      console.log(`   - ${yazi.title} (${yazi.author.name})`);
    });

    // Admin kullanıcılarını kontrol et
    const adminCount = await prisma.yazar.count({ where: { role: 'ADMIN' } });
    console.log(`🔑 Admin kullanıcı sayısı: ${adminCount}`);

    if (adminCount > 0) {
      const admin = await prisma.yazar.findFirst({ 
        where: { role: 'ADMIN' },
        select: { name: true, email: true, slug: true }
      });
      console.log(`👤 Admin: ${admin?.name} (${admin?.email})`);
    }

    console.log('\n🎉 Database tamamen çalışıyor!');

  } catch (error) {
    console.error('❌ Database bağlantı hatası:', error);
    
    if (error instanceof Error) {
      console.error('Hata detayı:', error.message);
      if (error.message.includes('authentication')) {
        console.log('💡 Çözüm: DATABASE_URL ve DIRECT_DATABASE_URL kontrol edin');
      }
    }
  } finally {
    await prisma.$disconnect();
  }
}

testNeonConnection();