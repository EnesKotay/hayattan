import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCategories() {
  try {
    console.log('🔍 KATEGORİ VE YAZI İLİŞKİLERİNİ KONTROL EDİYORUZ...\n');
    
    // 1. Kategorileri kontrol et
    console.log('📂 KATEGORİLER:');
    const kategoriler = await prisma.kategori.findMany({
      orderBy: { name: 'asc' }
    });
    
    console.log(`   Toplam ${kategoriler.length} kategori bulundu:`);
    kategoriler.forEach((kat, index) => {
      console.log(`   ${index + 1}. ${kat.name} (${kat.slug})`);
    });
    
    // 2. Yazı-kategori ilişkilerini kontrol et
    console.log('\n🔗 YAZI-KATEGORİ İLİŞKİLERİ:');
    const yaziKategoriIliskileri = await prisma.yazi.findMany({
      select: {
        id: true,
        title: true,
        kategoriler: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      take: 10 // İlk 10 yazıyı kontrol et
    });
    
    console.log(`   İlk 10 yazının kategori durumu:`);
    yaziKategoriIliskileri.forEach((yazi, index) => {
      console.log(`   ${index + 1}. "${yazi.title.substring(0, 50)}..."`);
      if (yazi.kategoriler.length > 0) {
        yazi.kategoriler.forEach(kat => {
          console.log(`      → ${kat.name}`);
        });
      } else {
        console.log(`      → KATEGORİSİZ!`);
      }
    });
    
    // 3. Kategorisiz yazıları say
    console.log('\n📊 İSTATİSTİKLER:');
    const toplamYazi = await prisma.yazi.count();
    const kategorisizYazi = await prisma.yazi.count({
      where: {
        kategoriler: {
          none: {}
        }
      }
    });
    
    console.log(`   Toplam yazı: ${toplamYazi}`);
    console.log(`   Kategorisiz yazı: ${kategorisizYazi}`);
    console.log(`   Kategorili yazı: ${toplamYazi - kategorisizYazi}`);
    
    // 4. Her kategoride kaç yazı var
    console.log('\n📋 KATEGORİ BAŞINA YAZI SAYISI:');
    for (const kategori of kategoriler) {
      const yaziSayisi = await prisma.yazi.count({
        where: {
          kategoriler: {
            some: {
              id: kategori.id
            }
          }
        }
      });
      console.log(`   ${kategori.name}: ${yaziSayisi} yazı`);
    }
    
    // 5. Prisma schema'yı kontrol et
    console.log('\n🔧 SORUN TESPİTİ:');
    if (kategorisizYazi === toplamYazi) {
      console.log('❌ TÜM YAZILAR KATEGORİSİZ!');
      console.log('   Sebep: XML import sırasında kategori eşleştirmesi çalışmamış');
      console.log('   Çözüm: Kategorileri yeniden eşleştirmek gerekiyor');
    } else {
      console.log('✅ Bazı yazılar kategorili, sistem çalışıyor');
    }
    
  } catch (error) {
    console.error('❌ Kontrol hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCategories();