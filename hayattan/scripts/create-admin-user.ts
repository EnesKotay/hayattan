import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('🔧 Admin kullanıcı oluşturuluyor...');
    
    // Şifreyi hash'le
    const password = 'admin123456';
    const hashedPassword = await hash(password, 12);
    
    // Admin kullanıcıyı oluştur veya güncelle
    const admin = await prisma.yazar.upsert({
      where: { email: 'admin@hayattan.net' },
      update: {
        password: hashedPassword,
        role: 'ADMIN'
      },
      create: {
        name: 'Admin',
        slug: 'admin',
        email: 'admin@hayattan.net',
        password: hashedPassword,
        role: 'ADMIN',
        biyografi: 'Site yöneticisi',
        misafir: false,
        ayrilmis: false
      }
    });
    
    console.log('✅ Admin kullanıcı başarıyla oluşturuldu:');
    console.log(`   📧 Email: ${admin.email}`);
    console.log(`   🔑 Şifre: ${password}`);
    console.log(`   👤 Rol: ${admin.role}`);
    
    // Mevcut admin kullanıcıları listele
    const admins = await prisma.yazar.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
    
    console.log('\n📋 Tüm admin kullanıcıları:');
    admins.forEach((admin, index) => {
      console.log(`   ${index + 1}. ${admin.name} (${admin.email}) - ${admin.role}`);
    });
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();