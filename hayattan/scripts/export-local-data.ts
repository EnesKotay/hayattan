import { PrismaClient } from '@prisma/client';
import { writeFileSync } from 'fs';
import { join } from 'path';

// Local database connection
const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/hayattan_net?schema=public"
    }
  }
});

async function exportLocalData() {
  try {
    console.log('🔍 Local database\'den veri export ediliyor...');

    // Test connection
    await localPrisma.$connect();
    console.log('✅ Local database bağlantısı başarılı');

    // Export all data
    const [kategoriler, yazarlar, yazilar, pages, haberler] = await Promise.all([
      localPrisma.kategori.findMany({
        orderBy: { id: 'asc' }
      }),
      localPrisma.yazar.findMany({
        orderBy: { id: 'asc' }
      }),
      localPrisma.yazi.findMany({
        include: {
          author: true,
          kategoriler: true
        },
        orderBy: { id: 'asc' }
      }),
      localPrisma.page.findMany({
        orderBy: { id: 'asc' }
      }),
      localPrisma.haber.findMany({
        orderBy: { id: 'asc' }
      })
    ]);

    const exportData = {
      kategoriler,
      yazarlar,
      yazilar,
      pages,
      haberler,
      exportDate: new Date().toISOString(),
      counts: {
        kategoriler: kategoriler.length,
        yazarlar: yazarlar.length,
        yazilar: yazilar.length,
        pages: pages.length,
        haberler: haberler.length
      }
    };

    // Save to file
    const exportPath = join(process.cwd(), 'data-export.json');
    writeFileSync(exportPath, JSON.stringify(exportData, null, 2));

    console.log('📊 Export edildi:');
    console.log(`   Kategoriler: ${exportData.counts.kategoriler}`);
    console.log(`   Yazarlar: ${exportData.counts.yazarlar}`);
    console.log(`   Yazılar: ${exportData.counts.yazilar}`);
    console.log(`   Sayfalar: ${exportData.counts.pages}`);
    console.log(`   Haberler: ${exportData.counts.haberler}`);
    console.log(`📁 Dosya: ${exportPath}`);

  } catch (error) {
    console.error('❌ Export hatası:', error);
  } finally {
    await localPrisma.$disconnect();
  }
}

exportLocalData();