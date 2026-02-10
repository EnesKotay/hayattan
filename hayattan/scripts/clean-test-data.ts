import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanTestData() {
  try {
    console.log('🧹 Test verilerini temizliyoruz...');
    
    // Önce mevcut durumu göster
    const beforeStats = await Promise.all([
      prisma.kategori.count(),
      prisma.yazar.count(),
      prisma.yazi.count(),
      prisma.page.count(),
      prisma.haber.count()
    ]);
    
    console.log('\n📊 Temizlik öncesi durum:');
    console.log(`   📂 Kategoriler: ${beforeStats[0]}`);
    console.log(`   👤 Yazarlar: ${beforeStats[1]}`);
    console.log(`   📝 Yazılar: ${beforeStats[2]}`);
    console.log(`   📄 Sayfalar: ${beforeStats[3]}`);
    console.log(`   📰 Haberler: ${beforeStats[4]}`);
    
    // Test kategorilerini sil (WordPress'ten gelmeyen)
    console.log('\n🗑️ Test kategorilerini siliyoruz...');
    const testCategories = [
      'teknoloji',
      'saglik',
      'yasam',
      'kultur',
      'spor'
    ];
    
    for (const slug of testCategories) {
      try {
        const deleted = await prisma.kategori.deleteMany({
          where: { slug: slug }
        });
        if (deleted.count > 0) {
          console.log(`   ✅ Silindi: ${slug}`);
        }
      } catch (error) {
        console.log(`   ❌ Silinemedi: ${slug}`, error);
      }
    }
    
    // Test yazarlarını sil (WordPress'ten gelmeyen)
    console.log('\n🗑️ Test yazarlarını siliyoruz...');
    const testAuthors = [
      'admin',
      'test-yazar',
      'misafir-yazar',
      'hayattan-net-editoru'
    ];
    
    for (const slug of testAuthors) {
      try {
        // Önce bu yazara ait yazıları sil
        await prisma.yazi.deleteMany({
          where: { 
            author: { slug: slug }
          }
        });
        
        // Sonra yazarı sil
        const deleted = await prisma.yazar.deleteMany({
          where: { slug: slug }
        });
        if (deleted.count > 0) {
          console.log(`   ✅ Silindi: ${slug}`);
        }
      } catch (error) {
        console.log(`   ❌ Silinemedi: ${slug}`, error);
      }
    }
    
    // Test yazılarını sil
    console.log('\n🗑️ Test yazılarını siliyoruz...');
    const testPosts = [
      'hosgeldiniz-hayattan-net',
      'test-yasam-yazisi',
      'test-misafir-yazisi',
      'saglikli-yasam-icin-pratik-oneriler',
      'teknolojinin-gunluk-yasamdaki-rolu'
    ];
    
    for (const slug of testPosts) {
      try {
        const deleted = await prisma.yazi.deleteMany({
          where: { slug: slug }
        });
        if (deleted.count > 0) {
          console.log(`   ✅ Yazı silindi: ${slug}`);
        }
      } catch (error) {
        console.log(`   ❌ Yazı silinemedi: ${slug}`, error);
      }
    }
    
    // Test sayfalarını sil
    console.log('\n🗑️ Test sayfalarını siliyoruz...');
    const testPages = [
      'hakkimizda',
      'iletisim'
    ];
    
    for (const slug of testPages) {
      try {
        const deleted = await prisma.page.deleteMany({
          where: { slug: slug }
        });
        if (deleted.count > 0) {
          console.log(`   ✅ Sayfa silindi: ${slug}`);
        }
      } catch (error) {
        console.log(`   ❌ Sayfa silinemedi: ${slug}`, error);
      }
    }
    
    // Tüm haberleri sil (test verileri)
    console.log('\n🗑️ Test haberlerini siliyoruz...');
    try {
      const deletedNews = await prisma.haber.deleteMany({});
      console.log(`   ✅ ${deletedNews.count} haber silindi`);
    } catch (error) {
      console.log(`   ❌ Haberler silinemedi:`, error);
    }
    
    // Temizlik sonrası durumu göster
    const afterStats = await Promise.all([
      prisma.kategori.count(),
      prisma.yazar.count(),
      prisma.yazi.count(),
      prisma.page.count(),
      prisma.haber.count()
    ]);
    
    console.log('\n✅ Temizlik tamamlandı!');
    console.log('\n📊 Temizlik sonrası durum:');
    console.log(`   📂 Kategoriler: ${afterStats[0]} (${beforeStats[0] - afterStats[0]} silindi)`);
    console.log(`   👤 Yazarlar: ${afterStats[1]} (${beforeStats[1] - afterStats[1]} silindi)`);
    console.log(`   📝 Yazılar: ${afterStats[2]} (${beforeStats[2] - afterStats[2]} silindi)`);
    console.log(`   📄 Sayfalar: ${afterStats[3]} (${beforeStats[3] - afterStats[3]} silindi)`);
    console.log(`   📰 Haberler: ${afterStats[4]} (${beforeStats[4] - afterStats[4]} silindi)`);
    
    // Kalan verileri listele
    console.log('\n📋 Kalan WordPress verileri:');
    
    const categories = await prisma.kategori.findMany({
      select: { name: true, slug: true }
    });
    console.log('\n📂 Kategoriler:');
    categories.forEach((cat, index) => {
      console.log(`   ${index + 1}. ${cat.name} (${cat.slug})`);
    });
    
    const authors = await prisma.yazar.findMany({
      select: { name: true, email: true, role: true }
    });
    console.log('\n👤 Yazarlar:');
    authors.forEach((author, index) => {
      console.log(`   ${index + 1}. ${author.name} (${author.email}) - ${author.role}`);
    });
    
    const posts = await prisma.yazi.findMany({
      select: { title: true, slug: true, author: { select: { name: true } } }
    });
    console.log('\n📝 Yazılar:');
    posts.forEach((post, index) => {
      console.log(`   ${index + 1}. ${post.title} - ${post.author.name}`);
    });
    
  } catch (error) {
    console.error('❌ Temizlik hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanTestData();