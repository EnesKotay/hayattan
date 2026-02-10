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

async function fixCategoryMapping() {
  try {
    console.log('🔧 KATEGORİ EŞLEŞTİRMESİNİ DÜZELTİYORUZ...\n');
    
    const xmlPath = 'C:\\Users\\Enes Can Kotay\\Downloads\\hayattannet.WordPress.2026-02-10.xml';
    const xmlContent = readFileSync(xmlPath, 'utf-8');
    
    console.log('🔍 XML parse ediliyor...');
    const result = await parseXML(xmlContent) as any;
    const channel = result.rss.channel[0];
    
    // Mevcut kategorileri al
    const dbKategoriler = await prisma.kategori.findMany();
    console.log(`📂 Veritabanında ${dbKategoriler.length} kategori bulundu`);
    
    // Kategori slug mapping'i oluştur
    const kategoriMap = new Map();
    dbKategoriler.forEach((kat: any) => {
      kategoriMap.set(kat.slug, kat.id);
      console.log(`   ${kat.name} → ${kat.slug}`);
    });
    
    console.log('\n📝 YAZILARIN KATEGORİLERİNİ EŞLEŞTİRİYORUZ...');
    
    const items = channel.item || [];
    let processedCount = 0;
    let categoryAssignments = 0;
    
    for (const item of items) {
      try {
        const title = extractText(item.title);
        const postName = extractText(item['wp:post_name']);
        const postType = extractText(item['wp:post_type']);
        const postStatus = extractText(item['wp:status']);
        
        // Sadece yayınlanmış yazıları işle
        if (postStatus === 'publish' && postType === 'post' && title) {
          
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
          
          const yaziSlug = postName || slugify(title);
          
          // Bu yazıyı veritabanında bul
          const existingYazi = await prisma.yazi.findUnique({
            where: { slug: yaziSlug }
          });
          
          if (existingYazi) {
            // XML'deki kategorileri bul
            const categories = item.category || [];
            const categoryIds: string[] = [];
            
            for (const cat of categories) {
              if (cat.$ && cat.$.domain === 'category') {
                const catSlug = cat.$.nicename;
                if (catSlug && kategoriMap.has(catSlug)) {
                  categoryIds.push(kategoriMap.get(catSlug));
                }
              }
            }
            
            // Kategorileri yazıya bağla
            if (categoryIds.length > 0) {
              await prisma.yazi.update({
                where: { id: existingYazi.id },
                data: {
                  kategoriler: {
                    connect: categoryIds.map((id: any) => ({ id }))
                  }
                }
              });
              
              categoryAssignments++;
              
              if (categoryAssignments % 50 === 0) {
                console.log(`   ✅ ${categoryAssignments} yazıya kategori atandı...`);
              }
            }
          }
          
          processedCount++;
        }
      } catch (error) {
        console.log(`   ❌ Yazı işleme hatası: ${error}`);
      }
    }
    
    console.log(`\n📊 KATEGORİ EŞLEŞTİRME SONUÇLARI:`);
    console.log(`   🔍 ${processedCount} yazı işlendi`);
    console.log(`   ✅ ${categoryAssignments} yazıya kategori atandı`);
    
    // Sonuçları kontrol et
    console.log('\n📋 GÜNCEL KATEGORİ DAĞILIMI:');
    for (const kategori of dbKategoriler) {
      const yaziSayisi = await prisma.yazi.count({
        where: {
          kategoriler: {
            some: {
              id: kategori.id
            }
          }
        }
      });
      if (yaziSayisi > 0) {
        console.log(`   ${kategori.name}: ${yaziSayisi} yazı`);
      }
    }
    
    // Hala kategorisiz olanları say
    const kategorisizYazi = await prisma.yazi.count({
      where: {
        kategoriler: {
          none: {}
        }
      }
    });
    
    console.log(`\n📊 FINAL DURUM:`);
    console.log(`   📝 Toplam yazı: ${await prisma.yazi.count()}`);
    console.log(`   ✅ Kategorili yazı: ${await prisma.yazi.count()} - ${kategorisizYazi} = ${await prisma.yazi.count() - kategorisizYazi}`);
    console.log(`   ❌ Kategorisiz yazı: ${kategorisizYazi}`);
    
    if (kategorisizYazi === 0) {
      console.log('\n🎉 TÜM YAZILAR KATEGORİLENDİRİLDİ!');
    } else if (categoryAssignments > 0) {
      console.log('\n✅ Kategori eşleştirmesi kısmen başarılı!');
    } else {
      console.log('\n❌ Kategori eşleştirmesi başarısız!');
    }
    
    console.log('\n🌐 Sitenizi kontrol edin: https://hayattan-enes-can-kotays-projects.vercel.app/');
    
  } catch (error) {
    console.error('❌ Düzeltme hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixCategoryMapping();