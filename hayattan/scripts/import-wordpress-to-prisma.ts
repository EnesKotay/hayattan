import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

// WordPress SQL'den veri çıkarma fonksiyonları
function extractInsertData(sql: string, tableName: string) {
  const insertRegex = new RegExp(`INSERT INTO \`${tableName}\`[^;]*;`, 'gi');
  const matches = sql.match(insertRegex);
  
  if (!matches) return [];
  
  const allData: any[] = [];
  
  matches.forEach((insertStatement: any) => {
    // VALUES kısmını çıkar
    const valuesMatch = insertStatement.match(/VALUES\s*(.+);$/i);
    if (!valuesMatch) return;
    
    const valuesString = valuesMatch[1];
    
    // Her satırı parse et (basit regex ile)
    const rowMatches = valuesString.match(/\([^)]+\)/g);
    if (!rowMatches) return;
    
    rowMatches.forEach((row: any) => {
      // Parantezleri kaldır ve değerleri ayır
      const cleanRow = row.slice(1, -1);
      const values = cleanRow.split(',').map((val: any) => {
        val = val.trim();
        // String değerleri temizle
        if (val.startsWith("'") && val.endsWith("'")) {
          return val.slice(1, -1).replace(/\\'/g, "'").replace(/\\"/g, '"');
        }
        // NULL değerleri
        if (val.toUpperCase() === 'NULL') {
          return null;
        }
        // Sayısal değerler
        if (/^\d+$/.test(val)) {
          return parseInt(val);
        }
        return val;
      });
      
      allData.push(values);
    });
  });
  
  return allData;
}

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

async function importWordPressToPrisma() {
  try {
    console.log('🔄 WordPress verilerini Prisma schema\'ya aktarıyoruz...');
    
    // SQL dosyasını oku
    const sqlPath = 'C:\\Users\\Enes Can Kotay\\Downloads\\94_73_148_159.sql';
    const sqlContent = readFileSync(sqlPath, 'utf-8');
    
    console.log('📄 SQL dosyası okundu');
    
    // 1. Kategorileri import et (wp_terms + wp_term_taxonomy)
    console.log('\n📂 Kategoriler import ediliyor...');
    const wpTerms = extractInsertData(sqlContent, 'wp_terms');
    const wpTermTaxonomy = extractInsertData(sqlContent, 'wp_term_taxonomy');
    
    console.log(`   Bulunan terimler: ${wpTerms.length}`);
    console.log(`   Bulunan taksonomi: ${wpTermTaxonomy.length}`);
    
    // Kategorileri (taxonomy = 'category' olanları) filtrele
    const categories = wpTermTaxonomy
      .filter((tax: any) => tax[2] === 'category') // taxonomy column
      .map((tax: any) => {
        const term = wpTerms.find(t => t[0] === tax[0]); // term_id eşleştir
        return term ? {
          id: tax[0],
          name: term[1], // name
          slug: term[2], // slug
          description: tax[3] || null // description
        } : null;
      })
      .filter(Boolean);
    
    console.log(`   Kategori sayısı: ${categories.length}`);
    
    // Kategorileri Prisma'ya ekle
    for (const category of categories) {
      try {
        await prisma.kategori.upsert({
          where: { slug: category.slug },
          update: {
            name: category.name,
            description: category.description
          },
          create: {
            name: category.name,
            slug: category.slug,
            description: category.description
          }
        });
        console.log(`   ✅ Kategori eklendi: ${category.name}`);
      } catch (error) {
        console.log(`   ❌ Kategori eklenemedi: ${category.name}`, error);
      }
    }
    
    // 2. Yazarları import et (wp_users)
    console.log('\n👤 Yazarlar import ediliyor...');
    const wpUsers = extractInsertData(sqlContent, 'wp_users');
    console.log(`   Bulunan kullanıcılar: ${wpUsers.length}`);
    
    for (const user of wpUsers) {
      try {
        const [id, login, pass, nicename, email, url, registered, activation_key, status, display_name] = user;
        
        if (!email || !display_name) continue;
        
        const hashedPassword = await hash('temp123456', 12); // Geçici şifre
        
        await prisma.yazar.upsert({
          where: { email: email },
          update: {
            name: display_name,
            slug: slugify(display_name)
          },
          create: {
            name: display_name,
            slug: slugify(display_name),
            email: email,
            password: hashedPassword,
            role: 'AUTHOR',
            biyografi: null,
            misafir: false,
            ayrilmis: false
          }
        });
        console.log(`   ✅ Yazar eklendi: ${display_name}`);
      } catch (error) {
        console.log(`   ❌ Yazar eklenemedi:`, error);
      }
    }
    
    // 3. Yazıları import et (wp_posts)
    console.log('\n📝 Yazılar import ediliyor...');
    const wpPosts = extractInsertData(sqlContent, 'wp_posts');
    console.log(`   Bulunan gönderiler: ${wpPosts.length}`);
    
    // Sadece yayınlanmış yazıları al
    const publishedPosts = wpPosts.filter((post: any) => post[7] === 'publish' && post[1] === 'post'); // post_status, post_type
    console.log(`   Yayınlanmış yazılar: ${publishedPosts.length}`);
    
    // Yazarları al
    const authors = await prisma.yazar.findMany();
    const defaultAuthor = authors.find(a => a.role === 'ADMIN') || authors[0];
    
    for (const post of publishedPosts.slice(0, 20)) { // İlk 20 yazı
      try {
        const [
          id, post_author, post_date, post_date_gmt, post_content, post_title,
          post_excerpt, post_status, comment_status, ping_status, post_password,
          post_name, to_ping, pinged, post_modified, post_modified_gmt,
          post_content_filtered, post_parent, guid, menu_order, post_type,
          post_mime_type, comment_count
        ] = post;
        
        if (!post_title || !post_content) continue;
        
        // Yazarı bul
        const author = authors.find(a => a.id === post_author.toString()) || defaultAuthor;
        
        await prisma.yazi.upsert({
          where: { slug: post_name || slugify(post_title) },
          update: {
            title: post_title,
            content: post_content,
            excerpt: post_excerpt || null,
            publishedAt: new Date(post_date)
          },
          create: {
            title: post_title,
            slug: post_name || slugify(post_title),
            content: post_content,
            excerpt: post_excerpt || null,
            authorId: author.id,
            publishedAt: new Date(post_date),
            featuredImage: null,
            showInSlider: false
          }
        });
        console.log(`   ✅ Yazı eklendi: ${post_title}`);
      } catch (error) {
        console.log(`   ❌ Yazı eklenemedi:`, error);
      }
    }
    
    console.log('\n🎉 WordPress import tamamlandı!');
    
    // Özet bilgi
    const stats = await Promise.all([
      prisma.kategori.count(),
      prisma.yazar.count(),
      prisma.yazi.count()
    ]);
    
    console.log('\n📊 Import sonrası durum:');
    console.log(`   Kategoriler: ${stats[0]}`);
    console.log(`   Yazarlar: ${stats[1]}`);
    console.log(`   Yazılar: ${stats[2]}`);
    
  } catch (error) {
    console.error('❌ Import hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importWordPressToPrisma();