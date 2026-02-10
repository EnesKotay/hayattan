import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config({ path: '.env.local' });

const prisma = new PrismaClient();

async function checkBrokenImages() {
  console.log('🔍 BROKEN IMAGE KONTROLÜ\n');
  
  try {
    // Fotoğraflı yazıları getir
    const yazilarWithImages = await prisma.yazi.findMany({
      where: {
        featuredImage: {
          not: null
        }
      },
      select: {
        id: true,
        title: true,
        slug: true,
        featuredImage: true
      },
      take: 10
    });
    
    console.log(`📊 Fotoğraflı yazı sayısı: ${yazilarWithImages.length}`);
    
    if (yazilarWithImages.length === 0) {
      console.log('❌ Hiç fotoğraflı yazı bulunamadı!');
      return;
    }
    
    console.log('\n🖼️ ÖRNEK FEATURED IMAGE URL\'LERİ:');
    
    const urlPatterns = new Map();
    
    yazilarWithImages.slice(0, 5).forEach((yazi: any, index: number) => {
      console.log(`\n${index + 1}. ${yazi.title}`);
      console.log(`   URL: ${yazi.featuredImage}`);
      
      // URL pattern analizi
      if (yazi.featuredImage) {
        const url = new URL(yazi.featuredImage);
        const domain = url.hostname;
        const pattern = `${domain}${url.pathname.split('/').slice(0, -1).join('/')}`;
        
        if (urlPatterns.has(pattern)) {
          urlPatterns.set(pattern, urlPatterns.get(pattern) + 1);
        } else {
          urlPatterns.set(pattern, 1);
        }
      }
    });
    
    console.log('\n📈 URL PATTERN ANALİZİ:');
    for (const [pattern, count] of urlPatterns.entries()) {
      console.log(`   ${pattern}: ${count} adet`);
    }
    
    // Test: İlk URL'ye erişim dene
    console.log('\n🧪 URL ERİŞİM TESTİ:');
    
    const firstImage = yazilarWithImages[0];
    if (firstImage.featuredImage) {
      try {
        const response = await fetch(firstImage.featuredImage, { method: 'HEAD' });
        console.log(`   ${firstImage.featuredImage}`);
        console.log(`   Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          console.log('   ✅ URL erişilebilir');
        } else {
          console.log('   ❌ URL erişilemez - Bu yüzden resimler görünmüyor!');
        }
      } catch (error) {
        console.log(`   ❌ Bağlantı hatası: ${error}`);
        console.log('   🔍 Bu URL\'ler artık çalışmıyor');
      }
    }
    
    console.log('\n💡 ÇÖZÜMLERİ:');
    console.log('1. 🔄 Eski URL\'leri temizle ve placeholder image kullan');
    console.log('2. 🌐 Cloudflare R2 public URL\'sini ayarla');  
    console.log('3. 📸 Admin panelinden yeni resimler yükle');
    console.log('4. 🎨 Default placeholder image sistemi kur');
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBrokenImages();