import { PrismaClient } from '@prisma/client';
import * as mysql from 'mysql2/promise';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

// MySQL bağlantı bilgileri
const MYSQL_CONFIG = {
  host: '94.73.148.159',
  user: 'hayattan_net', // MySQL kullanıcı adınız
  password: 'YOUR_MYSQL_PASSWORD_HERE', // MySQL şifrenizi buraya girin
  database: 'db_hayattan_net',
  port: 3306
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function cleanContent(content: string): string {
  if (!content) return '';
  
  // WordPress shortcode'larını temizle
  content = content.replace(/\[contact-form-7[^\]]*\]/g, '');
  content = content.replace(/\[gallery[^\]]*\]/g, '');
  
  // WordPress block comments'lerini temizle
  content = content.replace(/<!-- wp:[^>]*-->/g, '');
  content = content.replace(/<!-- \/wp:[^>]*-->/g, '');
  
  // Fazla boşlukları temizle
  content = content.replace(/\n\s*\n/g, '\n\n');
  content = content.trim();
  
  return content;
}

async function directMySQLImport() {
  let connection: mysql.Connection | null = null;
  
  try {
    console.log('🔗 MySQL veritabanına bağlanıyor...');
    
    // MySQL bağlantısı kur
    connection = await mysql.createConnection(MYSQL_CONFIG);
    console.log('✅ MySQL bağlantısı başarılı!');
    
    // 1. Kategorileri import et
    console.log('\n📂 Kategoriler import ediliyor...');
    
    const [categoryRows] = await connection.execute(`
      SELECT t.term_id, t.name, t.slug, tt.description 
      FROM wp_terms t
      JOIN wp_term_taxonomy tt ON t.term_id = tt.term_id
      WHERE tt.taxonomy = 'category'
    `);
    
    const categories = categoryRows as any[];
    console.log(`   Bulunan kategori: ${categories.length}`);
    
    for (const category of categories) {
      try {
        await prisma.kategori.upsert({
          where: { slug: category.slug },
          update: {
            name: category.name,
            description: category.description || null
          },
          create: {
            name: category.name,
            slug: category.slug,
            description: category.description || null
          }
        });
        console.log(`   ✅ Kategori: ${category.name}`);
      } catch (error) {
        console.log(`   ❌ Kategori hatası: ${category.name}`, error);
      }
    }
    
    // 2. Yazarları import et
    console.log('\n👤 Yazarlar import ediliyor...');
    
    const [userRows] = await connection.execute(`
      SELECT ID, user_login, user_email, display_name, user_registered
      FROM wp_users
      WHERE user_email IS NOT NULL AND user_email != ''
    `);
    
    const users = userRows as any[];
    console.log(`   Bulunan kullanıcı: ${users.length}`);
    
    for (const user of users) {
      try {
        const hashedPassword = await hash('admin123456', 12);
        
        await prisma.yazar.upsert({
          where: { email: user.user_email },
          update: {
            name: user.display_name,
            slug: slugify(user.display_name)
          },
          create: {
            name: user.display_name,
            slug: slugify(user.display_name),
            email: user.user_email,
            password: hashedPassword,
            role: 'AUTHOR',
            biyografi: null,
            misafir: false,
            ayrilmis: false
          }
        });
        console.log(`   ✅ Yazar: ${user.display_name} (${user.user_email})`);
      } catch (error) {
        console.log(`   ❌ Yazar hatası: ${user.display_name}`, error);
      }
    }
    
    // 3. Yazıları import et
    console.log('\n📝 Yazılar import ediliyor...');
    
    const [postRows] = await connection.execute(`
      SELECT 
        p.ID, p.post_title, p.post_content, p.post_excerpt, 
        p.post_name, p.post_date, p.post_author, p.post_status,
        u.display_name as author_name, u.user_email as author_email
      FROM wp_posts p
      LEFT JOIN wp_users u ON p.post_author = u.ID
      WHERE p.post_type = 'post' 
      AND p.post_status = 'publish'
      AND p.post_title IS NOT NULL 
      AND p.post_title != ''
      ORDER BY p.post_date DESC
    `);
    
    const posts = postRows as any[];
    console.log(`   Bulunan yazı: ${posts.length}`);
    
    // Yazarları al
    const dbAuthors = await prisma.yazar.findMany();
    const defaultAuthor = dbAuthors.find(a => a.role === 'ADMIN') || dbAuthors[0];
    
    for (const post of posts) {
      try {
        if (!post.post_title || !post.post_content) continue;
        
        // Yazarı bul
        const author = dbAuthors.find(a => 
          a.email === post.author_email
        ) || defaultAuthor;
        
        const slug = post.post_name || slugify(post.post_title);
        const cleanedContent = cleanContent(post.post_content);
        
        await prisma.yazi.upsert({
          where: { slug: slug },
          update: {
            title: post.post_title,
            content: cleanedContent,
            excerpt: post.post_excerpt || null,
            publishedAt: new Date(post.post_date)
          },
          create: {
            title: post.post_title,
            slug: slug,
            content: cleanedContent,
            excerpt: post.post_excerpt || null,
            authorId: author.id,
            publishedAt: new Date(post.post_date),
            featuredImage: null,
            showInSlider: false
          }
        });
        
        console.log(`   ✅ Yazı: ${post.post_title.substring(0, 50)}...`);
      } catch (error) {
        console.log(`   ❌ Yazı hatası:`, error);
      }
    }
    
    // 4. Sayfaları import et
    console.log('\n📄 Sayfalar import ediliyor...');
    
    const [pageRows] = await connection.execute(`
      SELECT 
        p.ID, p.post_title, p.post_content, p.post_name, p.post_date
      FROM wp_posts p
      WHERE p.post_type = 'page' 
      AND p.post_status = 'publish'
      AND p.post_title IS NOT NULL 
      AND p.post_title != ''
      ORDER BY p.post_date DESC
    `);
    
    const pages = pageRows as any[];
    console.log(`   Bulunan sayfa: ${pages.length}`);
    
    for (const page of pages) {
      try {
        if (!page.post_title || !page.post_content) continue;
        
        const slug = page.post_name || slugify(page.post_title);
        const cleanedContent = cleanContent(page.post_content);
        
        await prisma.page.upsert({
          where: { slug: slug },
          update: {
            title: page.post_title,
            content: cleanedContent,
            publishedAt: new Date(page.post_date)
          },
          create: {
            title: page.post_title,
            slug: slug,
            content: cleanedContent,
            featuredImage: null,
            showInMenu: true,
            menuOrder: 0,
            publishedAt: new Date(page.post_date)
          }
        });
        
        console.log(`   ✅ Sayfa: ${page.post_title}`);
      } catch (error) {
        console.log(`   ❌ Sayfa hatası:`, error);
      }
    }
    
    // Final istatistikler
    const finalStats = await Promise.all([
      prisma.kategori.count(),
      prisma.yazar.count(),
      prisma.yazi.count(),
      prisma.page.count()
    ]);
    
    console.log('\n🎉 MySQL direkt import tamamlandı!');
    console.log('\n📊 Final durum:');
    console.log(`   📂 Kategoriler: ${finalStats[0]}`);
    console.log(`   👤 Yazarlar: ${finalStats[1]}`);
    console.log(`   📝 Yazılar: ${finalStats[2]}`);
    console.log(`   📄 Sayfalar: ${finalStats[3]}`);
    
  } catch (error) {
    console.error('❌ Import hatası:', error);
    
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('\n💡 Bağlantı Çözümleri:');
        console.log('1. MySQL server çalışıyor mu kontrol edin');
        console.log('2. Host adresini kontrol edin: 94.73.148.159');
        console.log('3. Port açık mı kontrol edin: 3306');
        console.log('4. Firewall ayarlarını kontrol edin');
      } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
        console.log('\n💡 Kimlik Doğrulama Çözümleri:');
        console.log('1. Kullanıcı adını kontrol edin');
        console.log('2. Şifreyi kontrol edin');
        console.log('3. Uzaktan erişim izni var mı kontrol edin');
      }
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 MySQL bağlantısı kapatıldı');
    }
    await prisma.$disconnect();
  }
}

// Bağlantı bilgilerini kontrol et
console.log('🔧 MySQL Bağlantı Konfigürasyonu:');
console.log(`Host: ${MYSQL_CONFIG.host}`);
console.log(`Database: ${MYSQL_CONFIG.database}`);
console.log(`User: ${MYSQL_CONFIG.user}`);
console.log(`Password: ${MYSQL_CONFIG.password ? '***' : 'BOŞ - LÜTFEN GİRİN!'}`);

if (!MYSQL_CONFIG.password) {
  console.log('\n❌ Lütfen script içinde MySQL şifresini girin!');
  console.log('MYSQL_CONFIG.password = "your_password_here"');
} else {
  directMySQLImport();
}