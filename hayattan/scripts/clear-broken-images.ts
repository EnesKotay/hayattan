import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config({ path: '.env.local' });

const prisma = new PrismaClient();

async function clearBrokenImages() {
  console.log('🔄 ESKİ IMAGE URL\'LERİNİ TEMİZLEME\n');
  
  try {
    // Eski hayattan.net URL'lerini null yap
    const result = await prisma.yazi.updateMany({
      where: {
        featuredImage: {
          contains: 'hayattan.net'
        }
      },
      data: {
        featuredImage: null
      }
    });
    
    console.log(`✅ ${result.count} yazının featured image URL'si temizlendi`);
    console.log('🎨 Artık placeholder image sistemi kullanılacak');
    console.log('📸 Yeni resimler Cloudflare R2\'den yüklenebilir');
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Onay için comment'i kaldırın:
// clearBrokenImages();