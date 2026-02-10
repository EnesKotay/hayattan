import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

interface WordPressPost {
  ID: number;
  post_title: string;
  post_name: string;
  post_content: string;
  post_excerpt: string;
  post_status: string;
  post_date: string;
  post_author: number;
  comment_count: number;
}

interface WordPressUser {
  ID: number;
  user_login: string;
  user_nicename: string;
  user_email: string;
  display_name: string;
}

interface WordPressTerm {
  term_id: number;
  name: string;
  slug: string;
  term_group: number;
}

async function importWordPressData() {
  try {
    console.log('🚀 WordPress verilerini import ediliyor...');

    // SQL dosyasını oku
    const sqlPath = 'c:\\Users\\Enes Can Kotay\\Downloads\\94_73_148_159.sql';
    const sqlContent = readFileSync(sqlPath, 'utf-8');

    console.log('📁 SQL dosyası okundu');

    // WordPress posts tablosundan INSERT verilerini çıkar
    const postInserts = extractInsertData(sqlContent, 'wp_posts');
    const userInserts = extractInsertData(sqlContent, 'wp_users');
    const termInserts = extractInsertData(sqlContent, 'wp_terms');

    console.log(`📊 Bulunan veriler:`);
    console.log(`   Posts: ${postInserts.length}`);
    console.log(`   Users: ${userInserts.length}`);
    console.log(`   Terms: ${termInserts.length}`);

    // Kategorileri import et
    if (termInserts.length > 0) {
      console.log('📂 Kategoriler import ediliyor...');
      for (const term of termInserts.slice(0, 10)) { // İlk 10 kategori
        try {
          await prisma.kategori.upsert({
            where: { slug: term.slug || `kategori-${term.term_id}` },
            update: {},
            create: {
              name: term.name || `Kategori ${term.term_id}`,
              slug: term.slug || `kategori-${term.term_id}`,
              description: `WordPress'den import edilen kategori`
            }
          });
        } catch (error) {
          console.log(`   ⚠️ Kategori hatası: ${term.name}`);
        }
      }
    }

    // Yazarları import et
    if (userInserts.length > 0) {
      console.log('👥 Yazarlar import ediliyor...');
      for (const user of userInserts.slice(0, 5)) { // İlk 5 yazar
        try {
          await prisma.yazar.upsert({
            where: { slug: user.user_nicename || `yazar-${user.ID}` },
            update: {},
            create: {
              name: user.display_name || user.user_login || `Yazar ${user.ID}`,
              slug: user.user_nicename || `yazar-${user.ID}`,
              email: user.user_email || `user${user.ID}@hayattan.net`,
              biyografi: `WordPress'den import edilen yazar`,
              misafir: false,
              ayrilmis: false,
              role: 'AUTHOR'
            }
          });
        } catch (error) {
          console.log(`   ⚠️ Yazar hatası: ${user.display_name}`);
        }
      }
    }

    // Yazıları import et
    if (postInserts.length > 0) {
      console.log('📝 Yazılar import ediliyor...');
      
      // İlk yazarı al
      const firstAuthor = await prisma.yazar.findFirst();
      if (!firstAuthor) {
        throw new Error('Hiç yazar bulunamadı');
      }

      for (const post of postInserts.slice(0, 20)) { // İlk 20 yazı
        if (post.post_status === 'publish' && post.post_title) {
          try {
            await prisma.yazi.upsert({
              where: { slug: post.post_name || `yazi-${post.ID}` },
              update: {},
              create: {
                title: post.post_title,
                slug: post.post_name || `yazi-${post.ID}`,
                content: post.post_content || 'İçerik yükleniyor...',
                excerpt: post.post_excerpt || post.post_title.substring(0, 150),
                authorId: firstAuthor.id,
                publishedAt: new Date(post.post_date),
                viewCount: parseInt(post.comment_count?.toString() || '0'),
                showInSlider: false
              }
            });
          } catch (error) {
            console.log(`   ⚠️ Yazı hatası: ${post.post_title}`);
          }
        }
      }
    }

    // Sonuçları göster
    const [kategoriCount, yazarCount, yaziCount] = await Promise.all([
      prisma.kategori.count(),
      prisma.yazar.count(),
      prisma.yazi.count()
    ]);

    console.log('✅ Import tamamlandı!');
    console.log(`📊 Toplam veriler:`);
    console.log(`   Kategoriler: ${kategoriCount}`);
    console.log(`   Yazarlar: ${yazarCount}`);
    console.log(`   Yazılar: ${yaziCount}`);

  } catch (error) {
    console.error('❌ Import hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function extractInsertData(sqlContent: string, tableName: string): any[] {
  const results: any[] = [];
  
  try {
    // INSERT INTO tablosu için regex
    const insertRegex = new RegExp(`INSERT INTO \`${tableName}\`[^;]+;`, 'gi');
    const matches = sqlContent.match(insertRegex);
    
    if (matches) {
      for (const match of matches.slice(0, 1)) { // Sadece ilk INSERT'i al
        // VALUES kısmını çıkar
        const valuesMatch = match.match(/VALUES\s*\((.+)\);?$/i);
        if (valuesMatch) {
          const valuesStr = valuesMatch[1];
          // Basit parsing - gerçek projede daha gelişmiş parser kullanın
          const values = valuesStr.split('),').map(v => v.replace(/^\(|\)$/g, ''));
          
          for (const value of values.slice(0, 50)) { // İlk 50 kayıt
            const fields = parseValueString(value);
            if (fields.length > 0) {
              results.push(createObjectFromFields(fields, tableName));
            }
          }
        }
      }
    }
  } catch (error) {
    console.log(`⚠️ ${tableName} parsing hatası:`, error);
  }
  
  return results;
}

function parseValueString(valueStr: string): string[] {
  // Basit parsing - tırnak içindeki değerleri çıkar
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;
  let escapeNext = false;
  
  for (let i = 0; i < valueStr.length; i++) {
    const char = valueStr[i];
    
    if (escapeNext) {
      current += char;
      escapeNext = false;
      continue;
    }
    
    if (char === '\\') {
      escapeNext = true;
      continue;
    }
    
    if (char === "'" && !escapeNext) {
      inQuotes = !inQuotes;
      continue;
    }
    
    if (char === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
      continue;
    }
    
    current += char;
  }
  
  if (current.trim()) {
    fields.push(current.trim());
  }
  
  return fields;
}

function createObjectFromFields(fields: string[], tableName: string): any {
  const obj: any = {};
  
  if (tableName === 'wp_posts') {
    obj.ID = parseInt(fields[0] || '0');
    obj.post_author = parseInt(fields[1] || '0');
    obj.post_date = fields[2] || '';
    obj.post_content = fields[4] || '';
    obj.post_title = fields[5] || '';
    obj.post_excerpt = fields[6] || '';
    obj.post_status = fields[7] || '';
    obj.post_name = fields[17] || '';
    obj.comment_count = parseInt(fields[23] || '0');
  } else if (tableName === 'wp_users') {
    obj.ID = parseInt(fields[0] || '0');
    obj.user_login = fields[1] || '';
    obj.user_nicename = fields[3] || '';
    obj.user_email = fields[4] || '';
    obj.display_name = fields[9] || '';
  } else if (tableName === 'wp_terms') {
    obj.term_id = parseInt(fields[0] || '0');
    obj.name = fields[1] || '';
    obj.slug = fields[2] || '';
    obj.term_group = parseInt(fields[3] || '0');
  }
  
  return obj;
}

importWordPressData();