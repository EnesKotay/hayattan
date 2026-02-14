import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser() {
  try {
    const user = await prisma.yazar.findUnique({
      where: { email: 'omerfarukkotay@gmail.com' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        password: true
      }
    });

    if (!user) {
      console.log('❌ Kullanıcı bulunamadı!');
      console.log('Kullanıcı oluşturmanız gerekiyor.');
    } else {
      console.log('✅ Kullanıcı bulundu:');
      console.log('- ID:', user.id);
      console.log('- İsim:', user.name);
      console.log('- E-posta:', user.email);
      console.log('- Rol:', user.role);
      console.log('- Şifre hash\'i var mı?', user.password ? 'Evet' : '❌ HAYIR - Şifre yok!');
      
      if (user.password) {
        console.log('- Hash uzunluğu:', user.password.length, '(bcrypt hash\'i 60 karakter olmalı)');
      }
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('Hata:', error);
    await prisma.$disconnect();
  }
}

checkUser();
