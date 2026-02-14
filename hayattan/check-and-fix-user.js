import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function checkAndFixUser() {
  try {
    const email = 'omerfarukkotay@gmail.com';
    
    console.log('🔍 Kullanıcı kontrol ediliyor:', email);
    
    let user = await prisma.yazar.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        password: true
      }
    });

    if (!user) {
      console.log('\n❌ Kullanıcı bulunamadı!');
      console.log('\n📝 Yeni kullanıcı oluşturuluyor...');
      
      const defaultPassword = await hash('12345678', 10); // Geçici şifre
      
      user = await prisma.yazar.create({
        data: {
          name: 'Ömer Faruk Kotay',
          slug: 'omer-faruk-kotay',
          email: email,
          password: defaultPassword,
          role: 'ADMIN',
          biyografi: 'Site yöneticisi'
        }
      });
      
      console.log('✅ Kullanıcı oluşturuldu!');
      console.log('⚠️  GEÇİCİ ŞİFRE: 12345678');
      console.log('⚠️  Lütfen giriş yaptıktan sonra şifrenizi değiştirin!');
    } else {
      console.log('\n✅ Kullanıcı bulundu:');
      console.log('- ID:', user.id);
      console.log('- İsim:', user.name);
      console.log('- E-posta:', user.email);
      console.log('- Rol:', user.role);
      
      if (!user.password) {
        console.log('\n⚠️  Şifre bulunamadı! Varsayılan şifre ekleniyor...');
        
        const defaultPassword = await hash('12345678', 10);
        
        await prisma.yazar.update({
          where: { email },
          data: { password: defaultPassword }
        });
        
        console.log('✅ Şifre eklendi!');
        console.log('⚠️  GEÇİCİ ŞİFRE: 12345678');
        console.log('⚠️  Lütfen giriş yaptıktan sonra şifrenizi değiştirin!');
      } else {
        console.log('- Şifre: ✅ Mevcut (hash uzunluğu:', user.password.length, ')');
        
        if (user.password.length !== 60) {
          console.log('\n⚠️  Şifre hash\'i bcrypt formatında değil! Düzeltiliyor...');
          
          const defaultPassword = await hash('12345678', 10);
          
          await prisma.yazar.update({
            where: { email },
            data: { password: defaultPassword }
          });
          
          console.log('✅ Şifre düzeltildi!');
          console.log('⚠️  YENİ GEÇİCİ ŞİFRE: 12345678');
        }
      }
      
      // Rol kontrolü
      if (user.role !== 'ADMIN') {
        console.log('\n⚠️  Rol ADMIN değil! Düzeltiliyor...');
        
        await prisma.yazar.update({
          where: { email },
          data: { role: 'ADMIN' }
        });
        
        console.log('✅ Rol ADMIN olarak güncellendi!');
      }
    }

    console.log('\n✅ Kontrol tamamlandı! Artık giriş yapabilirsiniz.');
    console.log('\n📌 Giriş bilgileri:');
    console.log('   E-posta:', email);
    console.log('   Şifre: (yukarıda belirtilen geçici şifre)');
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('\n❌ Hata:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkAndFixUser();
