import { PrismaClient } from '@prisma/client';
import { compare } from 'bcryptjs';

const prisma = new PrismaClient();

async function testAdminLogin() {
  try {
    console.log('🔍 Admin giriş testi yapılıyor...');
    
    const email = 'admin@hayattan.net';
    const password = 'admin123456';
    
    // Kullanıcıyı bul
    const user = await prisma.yazar.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true
      }
    });
    
    if (!user) {
      console.log('❌ Kullanıcı bulunamadı:', email);
      return;
    }
    
    console.log('✅ Kullanıcı bulundu:', user.name);
    console.log('📧 Email:', user.email);
    console.log('👤 Rol:', user.role);
    console.log('🔑 Şifre hash var mı:', !!user.password);
    
    if (!user.password) {
      console.log('❌ Kullanıcının şifresi yok!');
      return;
    }
    
    // Şifreyi test et
    const isValid = await compare(password, user.password);
    
    if (isValid) {
      console.log('✅ Şifre doğru! Giriş başarılı olmalı.');
    } else {
      console.log('❌ Şifre yanlış!');
      console.log('🔧 Şifre hash:', user.password.substring(0, 20) + '...');
    }
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminLogin();