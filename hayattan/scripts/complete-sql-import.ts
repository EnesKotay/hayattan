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
  
  // WordPress block comments'lerini temizle
  content = content.replace(/<!-- wp:[^>]*-->/g, '');
  content = content.replace(/<!-- \/wp:[^>]*-->/g, '');
  
  // HTML entities'leri decode et
  content = content.replace(/&lt;/g, '<');
  content = content.replace(/&gt;/g, '>');
  content = content.replace(/&quot;/g, '"');
  content = content.replace(/&amp;/g, '&');
  
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
      
      while (pos < valuesString.length) {
        const char = valuesString[pos];
        
        if (!inString) {
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
          if (char === stringChar && valuesString[pos - 1] !== '\\') {
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
  
  while (pos < rowString.length) {
    const char = rowString[pos];
    
    if (!inString) {
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
      if (char === stringChar && rowString[pos - 1] !== '\\') {
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

async function completeSQLImport() {
  try {
    console.log('🚀 KAPSAMLI SQL IMPORT BAŞLIYOR...\n');
    
    const sqlPath = 'C:\\Users\\Enes Can Kotay\\Downloads\\94_73_148_159.sql';
    const sqlContent = readFileSync(sqlPath, 'utf-8');
    
    console.log(`📄 SQL dosyası okundu: ${(sqlContent.length / 1024 / 1024).toFixed(2)} MB`);
    
    // 1. KULLANICILARI İMPORT ET
    console.log('\n👤 KULLANICILAR İMPORT EDİLİYOR...');
    const usersInsertRegex = /INSERT INTO `wp_users`[^;]+;/gs;
    const usersMatches = sqlContent.match(usersInsertRegex);
    
    let totalUsers = 0;
    if (usersMatches) {
      for (const insertStatement of usersMatches) {
        const usersData = parseInsertValues(insertStatement);
        
        for (const userData of usersData) {
          try {
            const [id, login, pass, nicename, email, url, registered, activation_key, status, display_name] = userData;
            
            if (email && display_name) {
              const hashedPassword = await hash('admin123456', 12);
              
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
              
              totalUsers++;
              console.log(`   ✅ ${totalUsers}. Kullanıcı: ${display_name} (${email})`);
            }
          } catch (error) {
            console.log(`   ❌ Kullanıcı hatası:`, error);
          }
        }
      }
    }
    console.log(`📊 Toplam ${totalUsers} kullanıcı import edildi\n`);
    
    // 2. KATEGORİLERİ İMPORT ET
    console.log('📂 KATEGORİLER İMPORT EDİLİYOR...');
    
    // wp_terms tablosunu al
    const termsInsertRegex = /INSERT INTO `wp_terms`[^;]+;/gs;
    const termsMatches = sqlContent.match(termsInsertRegex);
    
    const allTerms = new Map();
    if (termsMatches) {
      for (const insertStatement of termsMatches) {
        const termsData = parseInsertValues(insertStatement);
        for (const termData of termsData) {
          const [term_id, name, slug, term_group] = termData;
          if (term_id && name) {
            allTerms.set(term_id, { name, slug });
          }
        }
      }
    }
    
    // wp_term_taxonomy tablosunu al
    const taxonomyInsertRegex = /INSERT INTO `wp_term_taxonomy`[^;]+;/gs;
    const taxonomyMatches = sqlContent.match(taxonomyInsertRegex);
    
    let totalCategories = 0;
    if (taxonomyMatches) {
      for (const insertStatement of taxonomyMatches) {
        const taxonomyData = parseInsertValues(insertStatement);
        
        for (const taxData of taxonomyData) {
          try {
            const [term_taxonomy_id, term_id, taxonomy, description, parent, count] = taxData;
            
            if (taxonomy === 'category' && allTerms.has(term_id)) {
              const term = allTerms.get(term_id);
              
              await prisma.kategori.upsert({
                where: { slug: term.slug || slugify(term.name) },
                update: {
                  name: term.name,
                  description: description || null
                },
                create: {
                  name: term.name,
                  slug: term.slug || slugify(term.name),
                  description: description || null
                }
              });
              
              totalCategories++;
              console.log(`   ✅ ${totalCategories}. Kategori: ${term.name}`);
            }
          } catch (error) {
            console.log(`   ❌ Kategori hatası:`, error);
          }
        }
      }
    }
    console.log(`📊 Toplam ${totalCategories} kategori import edildi\n`);
    
    // 3. YAZILARI İMPORT ET
    console.log('📝 YAZILAR İMPORT EDİLİYOR...');
    const postsInsertRegex = /INSERT INTO `wp_posts`[^;]+;/gs;
    const postsMatches = sqlContent.match(postsInsertRegex);
    
    // Yazarları al
    const dbAuthors = await prisma.yazar.findMany();
    const defaultAuthor = dbAuthors.find(a => a.role === 'ADMIN') || dbAuthors[0];
    
    let totalPosts = 0;
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
            
            // Sadece yayınlanmış yazıları al
            if (post_status === 'publish' && post_type === 'post' && post_title && post_content) {
              
              // Yazarı bul
              const author = dbAuthors.find(a => a.id === post_author?.toString()) || defaultAuthor;
              
              const slug = post_name || slugify(post_title);
              const cleanedContent = cleanContent(post_content);
              const cleanedExcerpt = post_excerpt ? cleanContent(post_excerpt) : null;
              
              if (slug && cleanedContent) {
                await prisma.yazi.upsert({
                  where: { slug: slug },
                  update: {
                    title: post_title,
                    content: cleanedContent,
                    excerpt: cleanedExcerpt,
                    publishedAt: post_date ? new Date(post_date) : new Date()
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
                console.log(`   ✅ ${totalPosts}. Yazı: ${post_title.substring(0, 60)}...`);
              }
            }
          } catch (error) {
            console.log(`   ❌ Yazı hatası:`, error);
          }
        }
      }
    }
    console.log(`📊 Toplam ${totalPosts} yazı import edildi\n`);
    
    // 4. SAYFALARI İMPORT ET
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
            if (post_status === 'publish' && post_type === 'page' && post_title && post_content) {
              
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
    console.log(`   👤 Yazarlar: ${finalStats[1]}`);
    console.log(`   📝 Yazılar: ${finalStats[2]}`);
    console.log(`   📄 Sayfalar: ${finalStats[3]}`);
    console.log('\n✨ Tüm WordPress içeriğiniz başarıyla aktarıldı!');
    
  } catch (error) {
    console.error('❌ Import hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

completeSQLImport();