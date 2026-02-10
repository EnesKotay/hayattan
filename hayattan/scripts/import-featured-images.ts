import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { parseString } from 'xml2js';
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

async function importFeaturedImages() {
  try {
    console.log('🖼️ YAZI FOTOĞRAFLARINI İMPORT EDİYORUZ...\n');
    
    const xmlPath = 'C:\\Users\\Enes Can Kotay\\Downloads\\hayattannet.WordPress.2026-02-10.xml';
    const xmlContent = readFileSync(xmlPath, 'utf-8');
    
    console.log('🔍 XML parse ediliyor...');
    const result = await parseXML(xmlContent);
    const channel = result.rss.channel[0];
    const items = channel.item || [];
    
    // 1. Önce attachment'ları topla (ID -> URL mapping)
    console.log('📎 ATTACHMENT\'LARI TOPLUYORUZ...');
    const attachmentMap = new Map(); // attachment ID -> URL
    
    for (const item of items) {
      const postType = extractText(item['wp:post_type']);
      const postId = extractText(item['wp:post_id']);
      
      if (postType === 'attachment' && postId) {
        const attachmentUrl = extractText(item['wp:attachment_url']);
        const guid = extractText(item.guid);
        const finalUrl = attachmentUrl || guid;
        
        if (finalUrl) {
          attachmentMap.set(postId, finalUrl);
        }
      }
    }
    
    console.log(`✅ ${attachmentMap.size} attachment bulundu`);
    
    // 2. Yazıları işle ve featured image ata
    console.log('\n📝 YAZILARA FEATURED IMAGE ATIYORUZ...');
    
    let processedCount = 0;
    let imageAssignments = 0;
    let contentImageAssignments = 0;
    
    for (const item of items) {
      try {
        const title = extractText(item.title);
        const postName = extractText(item['wp:post_name']);
        const postType = extractText(item['wp:post_type']);
        const postStatus = extractText(item['wp:status']);
        const content = extractText(item['content:encoded']);
        
        if (postStatus === 'publish' && postType === 'post' && title) {
          processedCount++;
          
          const yaziSlug = postName || slugify(title);
          
          // Veritabanında bu yazıyı bul
          const existingYazi = await prisma.yazi.findUnique({
            where: { slug: yaziSlug }
          });
          
          if (existingYazi) {
            let featuredImageUrl = null;
            
            // Yöntem 1: wp:postmeta'dan _thumbnail_id bul
            const postMeta = item['wp:postmeta'] || [];
            for (const meta of postMeta) {
              const metaKey = extractText(meta['wp:meta_key']);
              const metaValue = extractText(meta['wp:meta_value']);
              
              if (metaKey === '_thumbnail_id' && metaValue && metaValue !== '0') {
                if (attachmentMap.has(metaValue)) {
                  featuredImageUrl = attachmentMap.get(metaValue);
                  break;
                }
              }
            }
            
            // Yöntem 2: Content'ten ilk resmi al (eğer featured image yoksa)
            if (!featuredImageUrl && content) {
              const imgMatches = content.match(/<img[^>]+src="([^"]+)"/i);
              if (imgMatches && imgMatches[1]) {
                featuredImageUrl = imgMatches[1];
                contentImageAssignments++;
              }
            }
            
            // Featured image'ı yazıya ata
            if (featuredImageUrl) {
              await prisma.yazi.update({
                where: { id: existingYazi.id },
                data: {
                  featuredImage: featuredImageUrl
                }
              });
              
              imageAssignments++;
              
              if (imageAssignments % 50 === 0) {
                console.log(`   ✅ ${imageAssignments} yazıya fotoğraf atandı...`);
              }
            }
          }
        }
      } catch (error) {
        console.log(`   ❌ Yazı işleme hatası: ${error}`);
      }
    }
    
    console.log(`\n📊 FOTOĞRAF İMPORT SONUÇLARI:`);
    console.log(`   🔍 ${processedCount} yazı işlendi`);
    console.log(`   ✅ ${imageAssignments} yazıya fotoğraf atandı`);
    console.log(`   📎 ${imageAssignments - contentImageAssignments} featured image (thumbnail)`);
    console.log(`   📄 ${contentImageAssignments} content'ten çekilen resim`);
    
    // Final durum kontrolü
    const finalStats = await Promise.all([
      prisma.yazi.count(),
      prisma.yazi.count({
        where: {
          featuredImage: {
            not: null
          }
        }
      })
    ]);
    
    console.log(`\n📊 FINAL DURUM:`);
    console.log(`   📝 Toplam yazı: ${finalStats[0]}`);
    console.log(`   🖼️ Fotoğraflı yazı: ${finalStats[1]}`);
    console.log(`   📷 Fotoğrafsız yazı: ${finalStats[0] - finalStats[1]}`);
    
    // Örnek fotoğrafları göster
    console.log('\n🖼️ ÖRNEK ATANAN FOTOĞRAFLAR:');
    const samplePosts = await prisma.yazi.findMany({
      where: {
        featuredImage: {
          not: null
        }
      },
      select: {
        title: true,
        featuredImage: true
      },
      take: 5
    });
    
    samplePosts.forEach((post, index) => {
      console.log(`   ${index + 1}. "${post.title.substring(0, 40)}..." → ${post.featuredImage}`);
    });
    
    if (imageAssignments > 0) {
      console.log('\n🎉 FOTOĞRAF İMPORT BAŞARILI!');
    } else {
      console.log('\n❌ Hiç fotoğraf atanamadı!');
    }
    
    console.log('\n🌐 Sitenizi kontrol edin: https://hayattan-enes-can-kotays-projects.vercel.app/');
    
  } catch (error) {
    console.error('❌ Import hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importFeaturedImages();