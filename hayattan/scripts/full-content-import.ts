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

function parseInsertValues(insertStatement: string): any[] {
  try {
    // VALUES kısmını bul
    const valuesMatch = insertStatement.match(/VALUES\s*(.+)$/s);
    if (!valuesMatch) return [];
    
    let valuesString = valuesMatch[1];
    valuesString = valuesString.replace(/;$/, '');
    
    const rows: any[] = [];
    let currentPos = 0;
    
    while (currentPos < valuesString.length) {
      const openParen = valuesString.indexOf('(', currentPos);
      if (openParen === -1) break;
      
      let parenCount = 0;
      let inString = false;
      let stringChar = '';
      let pos = openParen;
      let escapeNext = false;
      
      while (pos < valuesString.length) {
        const char = valuesString[pos];
        
        if (escapeNext) {
          escapeNext = false;
        } else if (char === '\\') {
          escapeNext = true;
        } else if (!inString) {
          if (char === "'" || char === '"') {
            inString = true;
            stringChar = char;
          } else if (char === '(') {
            parenCount++;
          } else if (char === ')') {
            parenCount--;
            if (parenCount === 0) break;
          }
        } else {
          if (char === stringChar) {
            inString = false;
          }
        }
        pos++;
      }
      
      if (parenCount === 0) {
        const rowString = valuesString.substring(openParen + 1, pos);
        const values = parseRowValues(rowString);
        rows.push(values);
        currentPos = pos + 1;
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

function parseRowValues(rowString: string): any[] {
  const values: any[] = [];
  let currentValue = '';
  let inString = false;
  let stringChar = '';
  let pos = 0;
  let escapeNext = false;
  
  while (pos < rowString.length) {
    const char = rowString[pos];
    
    if (escapeNext) {
      currentValue += char;
      escapeNext = false;
    } else if (char === '\\') {
      currentValue += char;
      escapeNext = true;
    } else if (!inString) {
      if (char === "'" || char === '"') {
        inString = true;
        stringChar = char;
        currentValue += char;
      } else if (char === ',') {
        values.push(processValue(currentValue.trim()));
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
  
  if (currentValue.trim()) {
    values.push(processValue(currentValue.trim()));
  }
  
  return values;
}

function processValue(value: string): any {
  if (value.toUpperCase() === 'NULL') {
    return null;
  }
  
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
  
  if (/^\d+$/.test(value)) {
    return parseInt(value);
  }
  
  return value;
}

async function fullContentImport() {
  try {
    console.log('🚀 TÜM İÇERİK İMPORT BAŞLIYOR...\n');
    
    const sqlPath = 'C:\\Users\\Enes Can Kotay\\Downloads\\94_73_148_159.sql';
    const sqlContent = readFileSync(sqlPath, 'utf-8');
    
    console.log(`📄 SQL dosyası okundu: ${(sqlContent.length / 1024 / 1024).toFixed(2)} MB`);
    
    // Önce sahte editörü sil
    console.log('\n🗑️ Sahte editörü siliyoruz...');
    try {
      await prisma.yazi.deleteMany({
        where: { 
          author: { 
            email: 'editor@hayattan.net' 
          }
        }
      });
      
      await prisma.yazar.deleteMany({
        where: { email: 'editor@hayattan.net' }
      });
      
      console.log('✅ Sahte editör silindi');
    } catch (error) {
      console.log('❌ Editör silinemedi:', error);
    }
    
    // 1. TÜM KULLANICILARI İMPORT ET
    console.log('\n👤 TÜM KULLANICILAR İMPORT EDİLİYOR...');
    const usersInsertRegex = /INSERT INTO `wp_users`[^;]+;/gs;
    const usersMatches = sqlContent.match(usersInsertRegex);
    
    const userMap = new Map(); // WordPress user ID -> Prisma user ID mapping
    let totalUsers = 0;
    
    if (usersMatches) {
      for (const insertStatement of usersMatches) {
        const usersData = parseInsertValues(insertStatement);
        
        for (const userData of usersData) {
          try {
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
          } catch (error) {
            console.log(`   ❌ Kullanıcı hatası:`, error);
          }
        }
      }
    }
    console.log(`📊 Toplam ${totalUsers} gerçek kullanıcı import edildi\n`);
    
    // 2. TÜM YAZILARI İMPORT ET (REVISION'LAR HARİÇ)
    console.log('📝 TÜM YAZILAR İMPORT EDİLİYOR...');
    const postsInsertRegex = /INSERT INTO `wp_posts`[^;]+;/gs;
    const postsMatches = sqlContent.match(postsInsertRegex);
    
    const dbAuthors = await prisma.yazar.findMany();
    const defaultAuthor = dbAuthors[0]; // İlk gerçek yazarı varsayılan yap
    
    let totalPosts = 0;
    let skippedPosts = 0;
    
    if (postsMatches) {
      for (const insertStatement of postsMatches) {
        const postsData = parseInsertValues(insertStatement);
        
        for (const postData of postsData) {
          try {
            const [
              id, post_author, post_date, post_date_gmt, post_content, post_title,
              post_excerpt, post_status, comment_status, ping_status, post_password,
              post_name, to_ping, pinged, post_modified, post_modified_gmt,
              post_content_filtered, post_parent, guid, menu_order, post_type,
              post_mime_type, comment_count
            ] = postData;
            
            // Sadece gerçek yazıları al (revision, auto-draft, inherit değil)
            if (post_status === 'publish' && 
                post_type === 'post' && 
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
              
              if (slug && cleanedContent && cleanedContent.length > 50) { // En az 50 karakter içerik
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
                console.log(`   ✅ ${totalPosts}. Yazı: ${post_title.substring(0, 60)}... (${author.name})`);
              } else {
                skippedPosts++;
              }
            } else {
              skippedPosts++;
            }
          } catch (error) {
            console.log(`   ❌ Yazı hatası:`, error);
            skippedPosts++;
          }
        }
      }
    }
    
    console.log(`📊 Toplam ${totalPosts} yazı import edildi`);
    console.log(`📊 ${skippedPosts} yazı atlandı (revision, draft, boş içerik)\n`);
    
    // 3. SAYFALARI İMPORT ET
    console.log('📄 SAYFALAR İMPORT EDİLİYOR...');
    let totalPages = 0;
    
    if (postsMatches) {
      for (const insertStatement of postsMatches) {
        const postsData = parseInsertValues(insertStatement);
        
        for (const postData of postsData) {
          try {
            const [
              id, post_author, post_date, post_date_gmt, post_content, post_title,
              post_excerpt, post_status, comment_status, ping_status, post_password,
              post_name, to_ping, pinged, post_modified, post_modified_gmt,
              post_content_filtered, post_parent, guid, menu_order, post_type,
              post_mime_type, comment_count
            ] = postData;
            
            // Sadece yayınlanmış sayfaları al
            if (post_status === 'publish' && 
                post_type === 'page' && 
                post_title && 
                post_content &&
                post_title.trim() !== '') {
              
              const slug = post_name || slugify(post_title);
              const cleanedContent = cleanContent(post_content);
              
              if (slug && cleanedContent) {
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
                console.log(`   ✅ ${totalPages}. Sayfa: ${post_title}`);
              }
            }
          } catch (error) {
            console.log(`   ❌ Sayfa hatası:`, error);
          }
        }
      }
    }
    console.log(`📊 Toplam ${totalPages} sayfa import edildi\n`);
    
    // FINAL İSTATİSTİKLER
    const finalStats = await Promise.all([
      prisma.kategori.count(),
      prisma.yazar.count(),
      prisma.yazi.count(),
      prisma.page.count()
    ]);
    
    console.log('🎉 KAPSAMLI IMPORT TAMAMLANDI!\n');
    console.log('📊 FINAL DURUM:');
    console.log(`   📂 Kategoriler: ${finalStats[0]}`);
    console.log(`   👤 Yazarlar: ${finalStats[1]} (gerçek yazarlar)`);
    console.log(`   📝 Yazılar: ${finalStats[2]} (sahte editör yazıları silindi)`);
    console.log(`   📄 Sayfalar: ${finalStats[3]}`);
    console.log('\n✨ Tüm gerçek WordPress içeriğiniz doğru yazarlarıyla aktarıldı!');
    
    // Yazar başına yazı sayısını göster
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
    
  } catch (error) {
    console.error('❌ Import hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fullContentImport();