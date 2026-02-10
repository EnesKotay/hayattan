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

// Doğru parsing fonksiyonu
function parseWordPressInsert(insertStatement: string): any[] {
  try {
    // VALUES kısmını bul
    const valuesMatch = insertStatement.match(/VALUES\s*(.+)$/s);
    if (!valuesMatch) return [];
    
    let valuesString = valuesMatch[1].replace(/;$/, '').trim();
    const rows: any[] = [];
    
    // Her row'u ), ile ayır ama string içindeki ), leri ignore et
    const rowStrings: string[] = [];
    let currentRow = '';
    let parenDepth = 0;
    let inString = false;
    let stringChar = '';
    let i = 0;
    
    while (i < valuesString.length) {
      const char = valuesString[i];
      const prevChar = i > 0 ? valuesString[i - 1] : '';
      
      if (!inString) {
        if (char === "'" || char === '"') {
          inString = true;
          stringChar = char;
        } else if (char === '(') {
          parenDepth++;
        } else if (char === ')') {
          parenDepth--;
          if (parenDepth === 0) {
            // Row tamamlandı
            rowStrings.push(currentRow);
            currentRow = '';
            
            // Virgülü ve boşlukları atla
            i++;
            while (i < valuesString.length && (valuesString[i] === ',' || valuesString[i] === ' ' || valuesString[i] === '\n')) {
              i++;
            }
            continue;
          }
        }
      } else {
        if (char === stringChar && prevChar !== '\\') {
          inString = false;
        }
      }
      
      if (parenDepth > 0) {
        currentRow += char;
      }
      
      i++;
    }
    
    // Her row string'ini parse et
    for (const rowString of rowStrings) {
      const fields = parseRowFields(rowString);
      if (fields.length >= 20) {
        rows.push(fields);
      }
    }
    
    return rows;
  } catch (error) {
    console.error('Parse error:', error);
    return [];
  }
}

function parseRowFields(rowString: string): any[] {
  const fields: any[] = [];
  let currentField = '';
  let inString = false;
  let stringChar = '';
  let i = 0;
  
  while (i < rowString.length) {
    const char = rowString[i];
    const prevChar = i > 0 ? rowString[i - 1] : '';
    
    if (!inString) {
      if (char === "'" || char === '"') {
        inString = true;
        stringChar = char;
        currentField += char;
      } else if (char === ',') {
        // Field tamamlandı
        fields.push(processField(currentField.trim()));
        currentField = '';
      } else {
        currentField += char;
      }
    } else {
      currentField += char;
      if (char === stringChar && prevChar !== '\\') {
        inString = false;
      }
    }
    
    i++;
  }
  
  // Son field'ı ekle
  if (currentField.trim()) {
    fields.push(processField(currentField.trim()));
  }
  
  return fields;
}

function processField(field: string): any {
  if (field.toUpperCase() === 'NULL') {
    return null;
  }
  
  // String field'ları temizle
  if ((field.startsWith("'") && field.endsWith("'")) || 
      (field.startsWith('"') && field.endsWith('"'))) {
    return field.slice(1, -1)
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\')
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t');
  }
  
  // Sayı kontrolü
  if (/^\d+$/.test(field)) {
    return parseInt(field);
  }
  
  return field;
}

async function finalCorrectImport() {
  try {
    console.log('🚀 DOĞRU PARSING İLE FINAL İMPORT BAŞLIYOR...\n');
    
    const sqlPath = 'C:\\Users\\Enes Can Kotay\\Downloads\\94_73_148_159.sql';
    const sqlContent = readFileSync(sqlPath, 'utf-8');
    
    console.log(`📄 SQL dosyası okundu: ${(sqlContent.length / 1024 / 1024).toFixed(2)} MB`);
    
    // Kullanıcıları al
    const dbAuthors = await prisma.yazar.findMany();
    const defaultAuthor = dbAuthors[0];
    console.log(`👤 Mevcut ${dbAuthors.length} yazar bulundu`);
    
    // wp_posts'ları import et
    console.log('\n📝 DOĞRU PARSING İLE YAZILAR İMPORT EDİLİYOR...');
    const postsInsertRegex = /INSERT INTO `wp_posts`[^;]+;/gs;
    const postsMatches = sqlContent.match(postsInsertRegex);
    
    let totalPosts = 0;
    let totalPages = 0;
    let skippedItems = 0;
    let totalProcessed = 0;
    
    const statusCounts = new Map();
    const typeCounts = new Map();
    
    if (postsMatches) {
      console.log(`📊 ${postsMatches.length} wp_posts INSERT bulundu`);
      
      for (const insertStatement of postsMatches) {
        const postsData = parseWordPressInsert(insertStatement);
        
        for (const postData of postsData) {
          totalProcessed++;
          
          try {
            if (postData.length >= 23) {
              const post_id = postData[0];
              const post_author = postData[1];
              const post_date = postData[2];
              const post_date_gmt = postData[3];
              const post_content = postData[4];
              const post_title = postData[5];
              const post_excerpt = postData[6];
              const post_status = postData[7];
              const post_name = postData[11];
              const post_type = postData[20];
              
              // İstatistik tut
              statusCounts.set(post_status, (statusCounts.get(post_status) || 0) + 1);
              typeCounts.set(post_type, (typeCounts.get(post_type) || 0) + 1);
              
              // Sadece gerçek içerikleri al
              if ((post_status === 'publish' || post_status === 'draft' || post_status === 'private') && 
                  (post_type === 'post' || post_type === 'page') && 
                  post_title && 
                  post_content &&
                  post_title.trim() !== '' &&
                  post_status !== 'revision' &&
                  post_status !== 'inherit' &&
                  !post_title.includes('revision') &&
                  !post_title.includes('auto-draft')) {
                
                const slug = post_name || slugify(post_title);
                const cleanedContent = cleanContent(post_content);
                const cleanedExcerpt = post_excerpt ? cleanContent(post_excerpt) : null;
                
                if (slug && cleanedContent && cleanedContent.length > 10) {
                  
                  if (post_type === 'post') {
                    // YAZI OLARAK KAYDET
                    try {
                      await prisma.yazi.upsert({
                        where: { slug: slug },
                        update: {
                          title: post_title,
                          content: cleanedContent,
                          excerpt: cleanedExcerpt,
                          publishedAt: post_date ? new Date(post_date) : new Date(),
                          authorId: defaultAuthor.id
                        },
                        create: {
                          title: post_title,
                          slug: slug,
                          content: cleanedContent,
                          excerpt: cleanedExcerpt,
                          authorId: defaultAuthor.id,
                          publishedAt: post_date ? new Date(post_date) : new Date(),
                          featuredImage: null,
                          showInSlider: false
                        }
                      });
                      
                      totalPosts++;
                      console.log(`   ✅ ${totalPosts}. Yazı: ${post_title.substring(0, 50)}... [${post_status}]`);
                    } catch (error) {
                      console.log(`   ❌ Yazı kayıt hatası: ${post_title.substring(0, 30)}...`);
                      skippedItems++;
                    }
                    
                  } else if (post_type === 'page') {
                    // SAYFA OLARAK KAYDET
                    try {
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
                          menuOrder: 0,
                          publishedAt: post_date ? new Date(post_date) : new Date()
                        }
                      });
                      
                      totalPages++;
                      console.log(`   ✅ ${totalPages}. Sayfa: ${post_title} [${post_status}]`);
                    } catch (error) {
                      console.log(`   ❌ Sayfa kayıt hatası: ${post_title.substring(0, 30)}...`);
                      skippedItems++;
                    }
                  }
                } else {
                  skippedItems++;
                }
              } else {
                skippedItems++;
              }
            }
          } catch (error) {
            console.log(`   ❌ Parse hatası:`, error);
            skippedItems++;
          }
        }
      }
    }
    
    console.log(`\n📊 IMPORT SONUÇLARI:`);
    console.log(`   🔍 Toplam işlenen kayıt: ${totalProcessed}`);
    console.log(`   ✅ ${totalPosts} yazı import edildi`);
    console.log(`   ✅ ${totalPages} sayfa import edildi`);
    console.log(`   ⚠️ ${skippedItems} öğe atlandı`);
    
    console.log('\n📋 BULUNAN POST STATUS DAĞILIMI:');
    Array.from(statusCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([status, count]: [string, any]) => {
        console.log(`   ${status}: ${count} adet`);
      });
    
    console.log('\n📋 BULUNAN POST TYPE DAĞILIMI:');
    Array.from(typeCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]: [string, any]) => {
        console.log(`   ${type}: ${count} adet`);
      });
    
    // FINAL İSTATİSTİKLER
    const finalStats = await Promise.all([
      prisma.kategori.count(),
      prisma.yazar.count(),
      prisma.yazi.count(),
      prisma.page.count()
    ]);
    
    console.log('\n🎉 DOĞRU PARSING İLE IMPORT TAMAMLANDI!\n');
    console.log('📊 FINAL DURUM:');
    console.log(`   📂 Kategoriler: ${finalStats[0]}`);
    console.log(`   👤 Yazarlar: ${finalStats[1]}`);
    console.log(`   📝 Yazılar: ${finalStats[2]}`);
    console.log(`   📄 Sayfalar: ${finalStats[3]}`);
    
    console.log('\n✨ WordPress içeriğiniz doğru parsing ile aktarıldı!');
    console.log('🌐 Şimdi sitenizi kontrol edebilirsiniz:');
    console.log('   🏠 Ana sayfa: https://hayattan-enes-can-kotays-projects.vercel.app/');
    console.log('   🔐 Admin: https://hayattan-enes-can-kotays-projects.vercel.app/admin/giris');
    
    if (totalPosts < 50) {
      console.log('\n💡 NOT: Eğer daha fazla yazı bekliyordunuz:');
      console.log('   - SQL dump\'ınızda sadece bu kadar yayınlanmış içerik var');
      console.log('   - Çoğu içerik revision, inherit veya attachment olabilir');
      console.log('   - WordPress\'te taslak halinde kalmış yazılar olabilir');
    }
    
  } catch (error) {
    console.error('❌ Import hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

finalCorrectImport();