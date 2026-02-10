import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { parseString } from 'xml2js';
import { hash } from 'bcryptjs';
import { promisify } from 'util';

const prisma = new PrismaClient();
const parseXML = promisify(parseString);

function extractText(item: any): string {
  if (!item) return '';
  if (typeof item === 'string') return item;
  if (Array.isArray(item) && item.length > 0) return extractText(item[0]);
  if (item._) return item._;
  return '';
}

async function fixAuthorMapping() {
  try {
    console.log('🔧 YAZAR EŞLEŞTİRMESİNİ DÜZELTİYORUZ...\n');
    
    const xmlPath = 'C:\\Users\\Enes Can Kotay\\Downloads\\hayattannet.WordPress.2026-02-10.xml';
    const xmlContent = readFileSync(xmlPath, 'utf-8');
    
    console.log('🔍 XML parse ediliyor...');
    const result = await parseXML(xmlContent);
    const channel = result.rss.channel[0];
    
    // Önce tüm mevcut yazıları sil
    console.log('🗑️ Mevcut yazıları temizliyoruz...');
    await prisma.yazi.deleteMany({});
    console.log('✅ Yazılar temizlendi');
    
    // Yazar mapping'ini oluştur (login -> display name)
    const authorMapping = new Map();
    const authors = channel['wp:author'] || [];
    
    console.log('\n👤 YAZAR MAPPING\'İ OLUŞTURULUYOR:');
    for (const author of authors) {
      const login = extractText(author['wp:author_login']);
      const displayName = extractText(author['wp:author_display_name']);
      const email = extractText(author['wp:author_email']);
      
      if (login && displayName && email) {
        authorMapping.set(login, { displayName, email });
        console.log(`   "${login}" → "${displayName}" (${email})`);
      }
    }
    
    // Mevcut yazarları al
    const dbAuthors = await prisma.yazar.findMany();
    console.log(`\n📊 Veritabanında ${dbAuthors.length} yazar bulundu`);
    
    // Yazıları yeniden import et - doğru eşleştirme ile
    console.log('\n📝 YAZILARI DOĞRU YAZARLARLA YENİDEN İMPORT EDİYORUZ...');
    const items = channel.item || [];
    
    let totalPosts = 0;
    let skippedItems = 0;
    const authorStats = new Map();
    
    for (const item of items) {
      try {
        const title = extractText(item.title);
        const content = extractText(item['content:encoded']);
        const excerpt = extractText(item['excerpt:encoded']);
        const postDate = extractText(item.pubDate);
        const postName = extractText(item['wp:post_name']);
        const postType = extractText(item['wp:post_type']);
        const postStatus = extractText(item['wp:status']);
        const creatorLogin = extractText(item['dc:creator']); // Bu login ismi
        
        // Sadece yayınlanmış yazıları al
        if (postStatus === 'publish' && postType === 'post' && title && content) {
          
          // Yazarı doğru şekilde bul
          let author = dbAuthors[0]; // Default
          
          if (creatorLogin && authorMapping.has(creatorLogin)) {
            const authorInfo = authorMapping.get(creatorLogin);
            const foundAuthor = dbAuthors.find(a => 
              a.email === authorInfo.email || 
              a.name === authorInfo.displayName
            );
            if (foundAuthor) {
              author = foundAuthor;
            }
          }
          
          // Slug oluştur
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
          
          // İçeriği temizle
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
          
          const slug = postName || slugify(title);
          const cleanedContent = cleanContent(content);
          const cleanedExcerpt = excerpt ? cleanContent(excerpt) : null;
          
          if (slug && cleanedContent && cleanedContent.length > 20) {
            try {
              await prisma.yazi.create({
                data: {
                  title: title,
                  slug: slug,
                  content: cleanedContent,
                  excerpt: cleanedExcerpt,
                  authorId: author.id,
                  publishedAt: postDate ? new Date(postDate) : new Date(),
                  featuredImage: null,
                  showInSlider: false
                }
              });
              
              totalPosts++;
              authorStats.set(author.name, (authorStats.get(author.name) || 0) + 1);
              
              if (totalPosts % 50 === 0) {
                console.log(`   ✅ ${totalPosts} yazı import edildi...`);
              }
            } catch (error) {
              console.log(`   ❌ Yazı kayıt hatası: ${title.substring(0, 30)}...`);
              skippedItems++;
            }
          } else {
            skippedItems++;
          }
        } else {
          skippedItems++;
        }
      } catch (error) {
        console.log(`   ❌ Parse hatası:`, error);
        skippedItems++;
      }
    }
    
    console.log(`\n📊 DÜZELTME SONUÇLARI:`);
    console.log(`   ✅ ${totalPosts} yazı doğru yazarlarla import edildi`);
    console.log(`   ⚠️ ${skippedItems} öğe atlandı`);
    
    console.log('\n📊 DOĞRU YAZAR DAĞILIMI:');
    Array.from(authorStats.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([authorName, count]) => {
        console.log(`   ${authorName}: ${count} yazı`);
      });
    
    // Final istatistikler
    const finalStats = await Promise.all([
      prisma.kategori.count(),
      prisma.yazar.count(),
      prisma.yazi.count(),
      prisma.page.count()
    ]);
    
    console.log('\n🎉 YAZAR EŞLEŞTİRMESİ DÜZELTİLDİ!\n');
    console.log('📊 FINAL DURUM:');
    console.log(`   📂 Kategoriler: ${finalStats[0]}`);
    console.log(`   👤 Yazarlar: ${finalStats[1]}`);
    console.log(`   📝 Yazılar: ${finalStats[2]} (doğru yazarlarla)`);
    console.log(`   📄 Sayfalar: ${finalStats[3]}`);
    
    console.log('\n✨ Artık tüm yazılar doğru yazarlarla eşleştirildi!');
    console.log('🌐 Sitenizi kontrol edin: https://hayattan-enes-can-kotays-projects.vercel.app/');
    
  } catch (error) {
    console.error('❌ Düzeltme hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAuthorMapping();