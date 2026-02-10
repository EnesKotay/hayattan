import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { parseString } from 'xml2js';
import { hash } from 'bcryptjs';
import { promisify } from 'util';

const prisma = new PrismaClient();
const parseXML = promisify(parseString);

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

function extractText(item: any): string {
  if (!item) return '';
  if (typeof item === 'string') return item;
  if (Array.isArray(item) && item.length > 0) return extractText(item[0]);
  if (item._) return item._;
  return '';
}

async function importWordPressXML() {
  try {
    console.log('🚀 WORDPRESS XML İMPORT BAŞLIYOR...\n');
    
    const xmlPath = 'C:\\Users\\Enes Can Kotay\\Downloads\\hayattannet.WordPress.2026-02-10.xml';
    const xmlContent = readFileSync(xmlPath, 'utf-8');
    
    console.log(`📄 XML dosyası okundu: ${(xmlContent.length / 1024 / 1024).toFixed(2)} MB`);
    
    // XML'i parse et
    console.log('🔍 XML parse ediliyor...');
    const result = await parseXML(xmlContent) as any;
    const channel = result.rss.channel[0];
    
    console.log(`✅ XML başarıyla parse edildi`);
    console.log(`📊 Site: ${extractText(channel.title)}`);
    console.log(`📊 Açıklama: ${extractText(channel.description)}`);
    
    // 1. YAZARLARI İMPORT ET
    console.log('\n👤 YAZARLAR İMPORT EDİLİYOR...');
    const authors = channel['wp:author'] || [];
    const authorMap = new Map(); // WordPress ID -> Prisma ID
    
    for (const author of authors) {
      try {
        const authorId = extractText(author['wp:author_id']);
        const email = extractText(author['wp:author_email']);
        const displayName = extractText(author['wp:author_display_name']);
        const firstName = extractText(author['wp:author_first_name']);
        const lastName = extractText(author['wp:author_last_name']);
        
        if (email && displayName) {
          const hashedPassword = await hash('admin123456', 12);
          
          const user = await prisma.yazar.upsert({
            where: { email: email },
            update: {
              name: displayName,
              slug: slugify(displayName)
            },
            create: {
              name: displayName,
              slug: slugify(displayName),
              email: email,
              password: hashedPassword,
              role: 'AUTHOR',
              biyografi: null,
              misafir: false,
              ayrilmis: false
            }
          });
          
          authorMap.set(authorId, user.id);
          console.log(`   ✅ Yazar: ${displayName} (${email})`);
        }
      } catch (error) {
        console.log(`   ❌ Yazar hatası:`, error);
      }
    }
    console.log(`📊 Toplam ${authorMap.size} yazar import edildi\n`);
    
    // 2. KATEGORİLERİ İMPORT ET
    console.log('📂 KATEGORİLER İMPORT EDİLİYOR...');
    const categories = channel['wp:category'] || [];
    const categoryMap = new Map(); // WordPress slug -> Prisma ID
    
    for (const category of categories) {
      try {
        const catName = extractText(category['wp:cat_name']);
        const catSlug = extractText(category['wp:category_nicename']);
        
        if (catName && catSlug) {
          const cat = await prisma.kategori.upsert({
            where: { slug: catSlug },
            update: { name: catName },
            create: {
              name: catName,
              slug: catSlug,
              description: null
            }
          });
          
          categoryMap.set(catSlug, cat.id);
          console.log(`   ✅ Kategori: ${catName} (${catSlug})`);
        }
      } catch (error) {
        console.log(`   ❌ Kategori hatası:`, error);
      }
    }
    console.log(`📊 Toplam ${categoryMap.size} kategori import edildi\n`);
    
    // 3. YAZILARI VE SAYFALARI İMPORT ET
    console.log('📝 YAZILAR VE SAYFALAR İMPORT EDİLİYOR...');
    const items = channel.item || [];
    
    let totalPosts = 0;
    let totalPages = 0;
    let skippedItems = 0;
    
    const dbAuthors = await prisma.yazar.findMany();
    const defaultAuthor = dbAuthors[0];
    
    for (const item of items) {
      try {
        const title = extractText(item.title);
        const content = extractText(item['content:encoded']);
        const excerpt = extractText(item['excerpt:encoded']);
        const postDate = extractText(item.pubDate);
        const postName = extractText(item['wp:post_name']);
        const postType = extractText(item['wp:post_type']);
        const postStatus = extractText(item['wp:status']);
        const authorName = extractText(item['dc:creator']);
        
        // Sadece yayınlanmış içerikleri al
        if (postStatus === 'publish' && title && content && (postType === 'post' || postType === 'page')) {
          
          // Yazarı bul (isim ile eşleştir)
          let author = defaultAuthor;
          if (authorName) {
            const foundAuthor = dbAuthors.find(a => 
              a.name.toLowerCase().includes(authorName.toLowerCase()) ||
              authorName.toLowerCase().includes(a.name.toLowerCase())
            );
            if (foundAuthor) {
              author = foundAuthor;
            }
          }
          
          const slug = postName || slugify(title);
          const cleanedContent = cleanContent(content);
          const cleanedExcerpt = excerpt ? cleanContent(excerpt) : null;
          
          if (slug && cleanedContent && cleanedContent.length > 20) {
            
            if (postType === 'post') {
              // YAZI OLARAK KAYDET
              
              // Kategorileri bul
              const postCategories = item.category || [];
              const categoryIds: string[] = [];
              
              for (const cat of postCategories) {
                if (cat.$ && cat.$.domain === 'category') {
                  const catSlug = cat.$.nicename;
                  if (categoryMap.has(catSlug)) {
                    categoryIds.push(categoryMap.get(catSlug));
                  }
                }
              }
              
              await prisma.yazi.upsert({
                where: { slug: slug },
                update: {
                  title: title,
                  content: cleanedContent,
                  excerpt: cleanedExcerpt,
                  publishedAt: postDate ? new Date(postDate) : new Date(),
                  authorId: author.id,
                  kategoriler: {
                    set: categoryIds.map((id: any) => ({ id }))
                  }
                },
                create: {
                  title: title,
                  slug: slug,
                  content: cleanedContent,
                  excerpt: cleanedExcerpt,
                  authorId: author.id,
                  publishedAt: postDate ? new Date(postDate) : new Date(),
                  featuredImage: null,
                  showInSlider: false,
                  kategoriler: {
                    connect: categoryIds.map((id: any) => ({ id }))
                  }
                }
              });
              
              totalPosts++;
              console.log(`   ✅ ${totalPosts}. Yazı: ${title.substring(0, 50)}... (${author.name})`);
              
            } else if (postType === 'page') {
              // SAYFA OLARAK KAYDET
              await prisma.page.upsert({
                where: { slug: slug },
                update: {
                  title: title,
                  content: cleanedContent,
                  publishedAt: postDate ? new Date(postDate) : new Date()
                },
                create: {
                  title: title,
                  slug: slug,
                  content: cleanedContent,
                  featuredImage: null,
                  showInMenu: true,
                  menuOrder: 0,
                  publishedAt: postDate ? new Date(postDate) : new Date()
                }
              });
              
              totalPages++;
              console.log(`   ✅ ${totalPages}. Sayfa: ${title}`);
            }
          } else {
            skippedItems++;
          }
        } else {
          skippedItems++;
        }
      } catch (error) {
        console.log(`   ❌ İçerik hatası:`, error);
        skippedItems++;
      }
    }
    
    console.log(`\n📊 XML IMPORT SONUÇLARI:`);
    console.log(`   ✅ ${totalPosts} yazı import edildi`);
    console.log(`   ✅ ${totalPages} sayfa import edildi`);
    console.log(`   ⚠️ ${skippedItems} öğe atlandı`);
    
    // FINAL İSTATİSTİKLER
    const finalStats = await Promise.all([
      prisma.kategori.count(),
      prisma.yazar.count(),
      prisma.yazi.count(),
      prisma.page.count()
    ]);
    
    console.log('\n🎉 WORDPRESS XML İMPORT TAMAMLANDI!\n');
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
    
    console.log('\n✨ WordPress XML export\'unuz başarıyla aktarıldı!');
    console.log('🌐 Şimdi sitenizi kontrol edebilirsiniz:');
    console.log('   🏠 Ana sayfa: https://hayattan-enes-can-kotays-projects.vercel.app/');
    console.log('   🔐 Admin: https://hayattan-enes-can-kotays-projects.vercel.app/admin/giris');
    
  } catch (error) {
    console.error('❌ XML Import hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importWordPressXML();