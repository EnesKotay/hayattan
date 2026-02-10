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

async function checkFeaturedImages() {
  try {
    console.log('🔍 YAZI FOTOĞRAFLARINI KONTROL EDİYORUZ...\n');
    
    // 1. Mevcut yazıların fotoğraf durumunu kontrol et
    console.log('📊 VERİTABANINDAKİ DURUM:');
    const totalPosts = await prisma.yazi.count();
    const postsWithImages = await prisma.yazi.count({
      where: {
        featuredImage: {
          not: null
        }
      }
    });
    
    console.log(`   Toplam yazı: ${totalPosts}`);
    console.log(`   Fotoğraflı yazı: ${postsWithImages}`);
    console.log(`   Fotoğrafsız yazı: ${totalPosts - postsWithImages}`);
    
    // 2. XML'deki fotoğraf bilgilerini kontrol et
    console.log('\n🔍 XML\'DEKİ FOTOĞRAF BİLGİLERİNİ KONTROL EDİYORUZ...');
    
    const xmlPath = 'C:\\Users\\Enes Can Kotay\\Downloads\\hayattannet.WordPress.2026-02-10.xml';
    const xmlContent = readFileSync(xmlPath, 'utf-8');
    
    const result = await parseXML(xmlContent) as any;
    const channel = result.rss.channel[0];
    const items = channel.item || [];
    
    let xmlPostsWithImages = 0;
    let xmlTotalPosts = 0;
    const imageExamples: string[] = [];
    
    console.log('   İlk 20 yazının fotoğraf durumu:');
    
    for (const item of items.slice(0, 20)) {
      const title = extractText(item.title);
      const postType = extractText(item['wp:post_type']);
      const postStatus = extractText(item['wp:status']);
      
      if (postStatus === 'publish' && postType === 'post' && title) {
        xmlTotalPosts++;
        
        // WordPress'te featured image genellikle wp:postmeta içinde _thumbnail_id olarak saklanır
        const postMeta = item['wp:postmeta'] || [];
        let featuredImageId = null;
        let featuredImageUrl = null;
        
        // _thumbnail_id'yi bul
        for (const meta of postMeta) {
          const metaKey = extractText(meta['wp:meta_key']);
          const metaValue = extractText(meta['wp:meta_value']);
          
          if (metaKey === '_thumbnail_id' && metaValue && metaValue !== '0') {
            featuredImageId = metaValue;
            break;
          }
        }
        
        // Eğer content içinde resim varsa onu da kontrol et
        const content = extractText(item['content:encoded']);
        const imgMatches = content.match(/<img[^>]+src="([^"]+)"/gi);
        
        if (featuredImageId || imgMatches) {
          xmlPostsWithImages++;
          
          if (imgMatches && imageExamples.length < 5) {
            const imgSrc = imgMatches[0].match(/src="([^"]+)"/);
            if (imgSrc) {
              imageExamples.push(imgSrc[1]);
            }
          }
        }
        
        console.log(`   ${xmlTotalPosts}. "${title.substring(0, 40)}..." → ${featuredImageId ? 'Featured ID: ' + featuredImageId : (imgMatches ? 'Content img: ' + imgMatches.length : 'Fotoğrafsız')}`);
      }
    }
    
    console.log(`\n📊 XML ANALİZ SONUCU:`);
    console.log(`   XML'de kontrol edilen yazı: ${xmlTotalPosts}`);
    console.log(`   Fotoğraflı yazı (XML): ${xmlPostsWithImages}`);
    console.log(`   Fotoğrafsız yazı (XML): ${xmlTotalPosts - xmlPostsWithImages}`);
    
    console.log('\n🖼️ ÖRNEK FOTOĞRAF URL\'LERİ:');
    imageExamples.forEach((url, index) => {
      console.log(`   ${index + 1}. ${url}`);
    });
    
    // 3. WordPress attachment'ları kontrol et
    console.log('\n📎 WORDPRESS ATTACHMENT\'LARI:');
    let attachmentCount = 0;
    const attachmentExamples: any[] = [];
    
    for (const item of items) {
      const postType = extractText(item['wp:post_type']);
      const postStatus = extractText(item['wp:status']);
      
      if (postType === 'attachment' && attachmentCount < 10) {
        const title = extractText(item.title);
        const guid = extractText(item.guid);
        const attachmentUrl = extractText(item['wp:attachment_url']);
        
        attachmentCount++;
        attachmentExamples.push({
          title,
          guid,
          attachmentUrl
        });
        
        console.log(`   ${attachmentCount}. ${title} → ${attachmentUrl || guid}`);
      }
    }
    
    console.log(`\n📊 ATTACHMENT SONUCU:`);
    console.log(`   Toplam attachment: ${attachmentCount}+ (ilk 10'u gösterildi)`);
    
    console.log('\n🔧 SORUN TESPİTİ VE ÇÖZÜM:');
    if (postsWithImages === 0) {
      console.log('❌ Veritabanında hiç yazı fotoğrafı yok!');
      console.log('✅ Çözüm: XML\'den featured image\'ları çekip yazılara atamak gerekiyor');
      console.log('✅ Yöntem 1: wp:postmeta\'dan _thumbnail_id ile attachment\'ları eşleştir');
      console.log('✅ Yöntem 2: Content\'ten ilk resmi featured image yap');
    } else {
      console.log('✅ Bazı yazılarda fotoğraf var, sistem çalışıyor');
    }
    
  } catch (error) {
    console.error('❌ Kontrol hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkFeaturedImages();