import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

function slugify(text: string): string {
  if (!text) return '';
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
  content = content.replace(/\[caption[^\]]*\]/g, '');
  content = content.replace(/\[\/caption\]/g, '');
  content = content.replace(/\[embed[^\]]*\]/g, '');
  content = content.replace(/\[\/embed\]/g, '');
  
  // WordPress block comments'lerini temizle
  content = content.replace(/<!-- wp:[^>]*-->/g, '');
  content = content.replace(/<!-- \/wp:[^>]*-->/g, '');
  
  // HTML entities'leri decode et
  content = content.replace(/&lt;/g, '<');
  content = content.replace(/&gt;/g, '>');
  content = content.replace(/&quot;/g, '"');
  content = content.replace(/&amp;/g, '&');
  content = content.replace(/&#8217;/g, "'");
  content = content.replace(/&#8220;/g, '"');
  content = content.replace(/&#8221;/g, '"');
  content = content.replace(/&#8230;/g, '...');
  
  // Fazla boşlukları temizle
  content = content.replace(/\n\s*\n/g, '\n\n');
  content = content.trim();
  
  return content;
}

// Gelişmiş SQL parsing fonksiyonu
function parseComplexInsert(insertStatement: string): any[] {
  try {
    // VALUES kısmını bul
    const valuesMatch = insertStatement.match(/VALUES\s*(.+)$/s);
    if (!valuesMatch) return [];
    
    let valuesString = valuesMatch[1].replace(/;$/, '').trim();
    const rows: any[] = [];
    
    let pos = 0;
    
    while (pos < valuesString.length) {
      // Bir sonraki '(' karakterini bul
      const openParen = valuesString.indexOf('(', pos);
      if (openParen === -1) break;
      
      // Bu row'un sonunu bul
      let currentPos = openParen + 1;
      let parenCount = 1;
      let inString = false;
      let stringChar = '';
      let escaped = false;
      
      while (currentPos < valuesString.length && parenCount > 0) {
        const char = valuesString[currentPos];
        
        if (escaped) {
          escaped = false;
        } else if (char === '\\') {
          escaped = true;
        } else if (!inString) {
          if (char === "'" || char === '"') {
            inString = true;
            stringChar = char;
          } else if (char === '(') {
            parenCount++;
          } else if (char === ')') {
            parenCount--;
          }
        } else {
          if (char === stringChar) {
            inString = false;
          }
        }
        currentPos++;
      }
      
      if (parenCount === 0) {
        // Row'u parse et
        const rowContent = valuesString.substring(openParen + 1, currentPos - 1);
        const parsedRow = parseRowContent(rowContent);
        if (parsedRow.length > 0) {
          rows.push(parsedRow);
        }
        pos = currentPos;
        
        // Virgülü atla
        while (pos < valuesString.length && (valuesString[pos] === ',' || valuesString[pos] === ' ' || valuesString[pos] === '\n')) {
          pos++;
        }
      } else {
        break;
      }
    }
    
    return rows;
  } catch (error) {
    console.error('Parse error:', error);
    return [];
  }
}

function parseRowContent(rowContent: string): any[] {
  const values: any[] = [];
  let currentValue = '';
  let inString = false;
  let stringChar = '';
  let escaped = false;
  let pos = 0;
  
  while (pos < rowContent.length) {
    const char = rowContent[pos];
    
    if (escaped) {
      currentValue += char;
      escaped = false;
    } else if (char === '\\') {
      currentValue += char;
      escaped = true;
    } else if (!inString) {
      if (char === "'" || char === '"') {
        inString = true;
        stringChar = char;
        currentValue += char;
      } else if (char === ',') {
        values.push(processFieldValue(currentValue.trim()));
        currentValue = '';
      } else {
        currentValue += char;
      }
    } else {
      currentValue += char;
      if (char === stringChar) {
        inString = false;
      }
    }
    pos++;
  }
  
  // Son değeri ekle
  if (currentValue.trim()) {
    values.push(processFieldValue(currentValue.trim()));
  }
  
  return values;
}

function processFieldValue(value: string): any {
  if (value.toUpperCase() === 'NULL') {
    return null;
  }
  
  // String değerleri temizle
  if ((value.startsWith("'") && value.endsWith("'")) || 
      (value.startsWith('"') && value.endsWith('"'))) {
    return value.slice(1, -1)
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\')
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t');
  }
  
  // Sayı kontrolü
  if (/^\d+$/.test(value)) {
    return parseInt(value);
  }
  
  return value;
}

async function importAllContent() {
  try {
    console.log('🚀 TÜM İÇERİK KAPSAMLI İMPORT BAŞLIYOR...\n');
    
    const sqlPath = 'C:\\Users\\Enes Can Kotay\\Downloads\\94_73_148_159.sql';
    const sqlContent = readFileSync(sqlPath, 'utf-8');
    
    console.log(`📄 SQL dosyası okundu: ${(sqlContent.length / 1024 / 1024).toFixed(2)} MB`);
    
    // 1. KULLANICILARI İMPORT ET
    console.log('\n👤 KULLANICILAR İMPORT EDİLİYOR...');
    const usersInsertRegex = /INSERT INTO `wp_users`[^;]+;/gs;
    const usersMatches = sqlContent.match(usersInsertRegex);
    
    const userMap = new Map();
    let totalUsers = 0;
    
    if (usersMatches) {
      for (const insertStatement of usersMatches) {
        const usersData = parseComplexInsert(insertStatement);
        
        for (const userData of usersData) {
          try {
            if (userData.length >= 10) {
              const [id, login, pass, nicename, email, url, registered, activation_key, status, display_name] = userData;
              
              if (email && display_name && email !== 'editor@hayattan.net') {
                const hashedPassword = await hash('admin123456', 12);
                
                const user = await prisma.yazar.upsert({
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
                
                userMap.set(id, user.id);
                totalUsers++;
                console.log(`   ✅ ${totalUsers}. Kullanıcı: ${display_name} (${email})`);
              }
            }
          } catch (error) {
            console.log(`   ❌ Kullanıcı hatası:`, error);
          }
        }
      }
    }
    console.log(`📊 Toplam ${totalUsers} kullanıcı import edildi\n`);
    
    // 2. TÜM YAZILARI İMPORT ET
    console.log('📝 TÜM YAZILAR İMPORT EDİLİYOR...');
    const postsInsertRegex = /INSERT INTO `wp_posts`[^;]+;/gs;
    const postsMatches = sqlContent.match(postsInsertRegex);
    
    const dbAuthors = await prisma.yazar.findMany();
    const defaultAuthor = dbAuthors[0];
    
    let totalPosts = 0;
    let totalPages = 0;
    let skippedItems = 0;
    
    if (postsMatches) {
      console.log(`📊 ${postsMatches.length} wp_posts INSERT bulundu`);
      
      for (const insertStatement of postsMatches) {
        const postsData = parseComplexInsert(insertStatement);
        
        for (const postData of postsData) {
          try {
            if (postData.length >= 23) {
              const [
                id, post_author, post_date, post_date_gmt, post_content, post_title,
                post_excerpt, post_status, comment_status, ping_status, post_password,
                post_name, to_ping, pinged, post_modified, post_modified_gmt,
                post_content_filtered, post_parent, guid, menu_order, post_type,
                post_mime_type, comment_count
              ] = postData;
              
              // Yayınlanmış içerikleri al (publish, draft, private dahil)
              if ((post_status === 'publish' || post_status === 'draft' || post_status === 'private') && 
                  (post_type === 'post' || post_type === 'page') && 
                  post_title && 
                  post_content &&
                  post_title.trim() !== '' &&
                  !post_title.includes('revision') &&
                  !post_title.includes('auto-draft')) {
                
                // Yazarı bul
                let author = defaultAuthor;
                if (post_author && userMap.has(post_author)) {
                  const authorId = userMap.get(post_author);
                  author = dbAuthors.find(a => a.id === authorId) || defaultAuthor;
                }
                
                const slug = post_name || slugify(post_title);
                const cleanedContent = cleanContent(post_content);
                const cleanedExcerpt = post_excerpt ? cleanContent(post_excerpt) : null;
                
                if (slug && cleanedContent && cleanedContent.length > 20) {
                  
                  if (post_type === 'post') {
                    // YAZI OLARAK KAYDET
                    await prisma.yazi.upsert({
                      where: { slug: slug },
                      update: {
                        title: post_title,
                        content: cleanedContent,
                        excerpt: cleanedExcerpt,
                        publishedAt: post_date ? new Date(post_date) : new Date(),
                        authorId: author.id
                      },
                      create: {
                        title: post_title,
                        slug: slug,
                        content: cleanedContent,
                        excerpt: cleanedExcerpt,
                        authorId: author.id,
                        publishedAt: post_date ? new Date(post_date) : new Date(),
                        featuredImage: null,
                        showInSlider: false
                      }
                    });
                    
                    totalPosts++;
                    console.log(`   ✅ ${totalPosts}. Yazı: ${post_title.substring(0, 50)}... (${author.name}) [${post_status}]`);
                    
                  } else if (post_type === 'page') {
                    // SAYFA OLARAK KAYDET
                    await prisma.page.upsert({
                      where: { slug: slug },
                      update: {
                        title: post_title,
                        content: cleanedContent,
                        publishedAt: post_date ? new Date(post_date) : new Date()
                      },
                      create: {
                        title: post_title,
                        slug: slug,
                        content: cleanedContent,
                        featuredImage: null,
                        showInMenu: true,
                        menuOrder: menu_order || 0,
                        publishedAt: post_date ? new Date(post_date) : new Date()
                      }
                    });
                    
                    totalPages++;
                    console.log(`   ✅ ${totalPages}. Sayfa: ${post_title} [${post_status}]`);
                  }
                } else {
                  skippedItems++;
                }
              } else {
                skippedItems++;
              }
            }
          } catch (error) {
            console.log(`   ❌ İçerik hatası:`, error);
            skippedItems++;
          }
        }
      }
    }
    
    console.log(`\n📊 IMPORT SONUÇLARI:`);
    console.log(`   ✅ ${totalPosts} yazı import edildi`);
    console.log(`   ✅ ${totalPages} sayfa import edildi`);
    console.log(`   ⚠️ ${skippedItems} öğe atlandı (revision, attachment, boş içerik)`);
    
    // FINAL İSTATİSTİKLER
    const finalStats = await Promise.all([
      prisma.kategori.count(),
      prisma.yazar.count(),
      prisma.yazi.count(),
      prisma.page.count()
    ]);
    
    console.log('\n🎉 KAPSAMLI IMPORT TAMAMLANDI!\n');
    console.log('📊 FINAL DURUM:');
    console.log(`   📂 Kategoriler: ${finalStats[0]}`);
    console.log(`   👤 Yazarlar: ${finalStats[1]}`);
    console.log(`   📝 Yazılar: ${finalStats[2]}`);
    console.log(`   📄 Sayfalar: ${finalStats[3]}`);
    
    // Yazar başına yazı dağılımı
    console.log('\n📊 Yazar başına yazı dağılımı:');
    const authorStats = await prisma.yazar.findMany({
      include: {
        _count: {
          select: { yazilar: true }
        }
      }
    });
    
    authorStats.forEach((author: any, index: number) => {
      console.log(`   ${index + 1}. ${author.name}: ${author._count.yazilar} yazı`);
    });
    
    console.log('\n✨ Tüm WordPress içeriğiniz başarıyla aktarıldı!');
    console.log('🌐 Şimdi sitenizi kontrol edebilirsiniz:');
    console.log('   🏠 Ana sayfa: https://hayattan-enes-can-kotays-projects.vercel.app/');
    console.log('   🔐 Admin: https://hayattan-enes-can-kotays-projects.vercel.app/admin/giris');
    
  } catch (error) {
    console.error('❌ Import hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importAllContent();