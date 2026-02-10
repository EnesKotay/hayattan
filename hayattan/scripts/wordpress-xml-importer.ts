import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { hash } from 'bcryptjs';
import { parseString } from 'xml2js';
import { promisify } from 'util';

const prisma = new PrismaClient();
const parseXML = promisify(parseString);

function slugify(text: string): string {
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
  
  // WordPress block comments'lerini temizle
  content = content.replace(/<!-- wp:[^>]*-->/g, '');
  content = content.replace(/<!-- \/wp:[^>]*-->/g, '');
  
  // Fazla boşlukları temizle
  content = content.replace(/\n\s*\n/g, '\n\n');
  content = content.trim();
  
  return content;
}

function convertMediaUrls(content: string, oldDomain: string, newDomain: string): string {
  // Eski wp-content/uploads URL'lerini yeni R2 URL'lerine çevir
  const oldMediaRegex = new RegExp(`${oldDomain}/wp-content/uploads/([^"'\\s]+)`, 'g');
  return content.replace(oldMediaRegex, `${newDomain}/media/$1`);
}

async function importWordPressXML() {
  try {
    console.log('📥 WordPress XML import başlıyor...');
    
    // XML dosyasının yolunu belirtin
    console.log('\n📋 XML dosyası için talimatlar:');
    console.log('1. WordPress admin paneline gidin');
    console.log('2. Araçlar > Dışa Aktar (Export) menüsüne gidin');
    console.log('3. "Tüm içerik" seçeneğini seçin');
    console.log('4. "Export dosyasını indir" butonuna tıklayın');
    console.log('5. İndirilen XML dosyasını bu klasöre koyun');
    
    // XML dosyası var mı kontrol et
    const possiblePaths = [
      'wordpress-export.xml',
      'hayattan.wordpress.xml',
      'export.xml'
    ];
    
    let xmlPath = '';
    for (const path of possiblePaths) {
      try {
        readFileSync(path);
        xmlPath = path;
        break;
      } catch (error) {
        // Dosya yok, devam et
      }
    }
    
    if (!xmlPath) {
      console.log('\n❌ XML dosyası bulunamadı!');
      console.log('Lütfen WordPress export XML dosyasını şu isimlerden biriyle kaydedin:');
      possiblePaths.forEach(path => console.log(`   - ${path}`));
      return;
    }
    
    console.log(`\n📄 XML dosyası bulundu: ${xmlPath}`);
    
    // XML'i oku ve parse et
    const xmlContent = readFileSync(xmlPath, 'utf-8');
    const result = await parseXML(xmlContent) as any;
    
    const channel = result.rss.channel[0];
    const items = channel.item || [];
    
    console.log(`\n📊 Bulunan öğeler: ${items.length}`);
    
    // Site bilgilerini al
    const siteTitle = channel.title?.[0] || 'Hayattan.Net';
    const siteUrl = channel.link?.[0] || 'http://hayattan.net';
    const description = channel.description?.[0] || '';
    
    console.log(`\n🌐 Site: ${siteTitle}`);
    console.log(`🔗 URL: ${siteUrl}`);
    
    // Kategorileri import et
    console.log('\n📂 Kategoriler import ediliyor...');
    const categories = channel['wp:category'] || [];
    
    for (const category of categories) {
      try {
        const catName = category['wp:cat_name']?.[0];
        const catSlug = category['wp:category_nicename']?.[0];
        const catDescription = category['wp:category_description']?.[0] || null;
        
        if (catName && catSlug) {
          await prisma.kategori.upsert({
            where: { slug: catSlug },
            update: {
              name: catName,
              description: catDescription
            },
            create: {
              name: catName,
              slug: catSlug,
              description: catDescription
            }
          });
          console.log(`   ✅ Kategori: ${catName}`);
        }
      } catch (error) {
        console.log(`   ❌ Kategori hatası:`, error);
      }
    }
    
    // Yazarları import et
    console.log('\n👤 Yazarlar import ediliyor...');
    const authors = channel['wp:author'] || [];
    
    for (const author of authors) {
      try {
        const authorLogin = author['wp:author_login']?.[0];
        const authorEmail = author['wp:author_email']?.[0];
        const authorDisplayName = author['wp:author_display_name']?.[0];
        
        if (authorEmail && authorDisplayName) {
          const hashedPassword = await hash('admin123456', 12);
          
          await prisma.yazar.upsert({
            where: { email: authorEmail },
            update: {
              name: authorDisplayName,
              slug: slugify(authorDisplayName)
            },
            create: {
              name: authorDisplayName,
              slug: slugify(authorDisplayName),
              email: authorEmail,
              password: hashedPassword,
              role: 'AUTHOR',
              biyografi: null,
              misafir: false,
              ayrilmis: false
            }
          });
          console.log(`   ✅ Yazar: ${authorDisplayName} (${authorEmail})`);
        }
      } catch (error) {
        console.log(`   ❌ Yazar hatası:`, error);
      }
    }
    
    // Yazıları ve sayfaları import et
    console.log('\n📝 İçerikler import ediliyor...');
    
    const posts = items.filter(item => 
      item['wp:post_type']?.[0] === 'post' && 
      item['wp:status']?.[0] === 'publish'
    );
    
    const pages = items.filter(item => 
      item['wp:post_type']?.[0] === 'page' && 
      item['wp:status']?.[0] === 'publish'
    );
    
    console.log(`   📝 Yazılar: ${posts.length}`);
    console.log(`   📄 Sayfalar: ${pages.length}`);
    
    // Yazarları al
    const dbAuthors = await prisma.yazar.findMany();
    const defaultAuthor = dbAuthors.find(a => a.role === 'ADMIN') || dbAuthors[0];
    
    // Yazıları import et
    for (const post of posts) {
      try {
        const title = post.title?.[0];
        const content = cleanContent(post['content:encoded']?.[0] || '');
        const excerpt = post['excerpt:encoded']?.[0] || null;
        const postName = post['wp:post_name']?.[0];
        const postDate = post['wp:post_date']?.[0];
        const authorLogin = post['dc:creator']?.[0];
        
        if (!title || !content) continue;
        
        // Yazarı bul
        const author = dbAuthors.find(a => 
          a.name.toLowerCase().includes(authorLogin?.toLowerCase() || '')
        ) || defaultAuthor;
        
        const slug = postName || slugify(title);
        
        // Media URL'lerini dönüştür
        const processedContent = convertMediaUrls(
          content, 
          siteUrl, 
          'https://your-r2-domain.com' // R2 domain'inizi buraya yazın
        );
        
        await prisma.yazi.upsert({
          where: { slug: slug },
          update: {
            title: title,
            content: processedContent,
            excerpt: excerpt,
            publishedAt: postDate ? new Date(postDate) : new Date()
          },
          create: {
            title: title,
            slug: slug,
            content: processedContent,
            excerpt: excerpt,
            authorId: author.id,
            publishedAt: postDate ? new Date(postDate) : new Date(),
            featuredImage: null,
            showInSlider: false
          }
        });
        
        console.log(`   ✅ Yazı: ${title.substring(0, 50)}...`);
      } catch (error) {
        console.log(`   ❌ Yazı hatası:`, error);
      }
    }
    
    // Sayfaları import et
    for (const page of pages) {
      try {
        const title = page.title?.[0];
        const content = cleanContent(page['content:encoded']?.[0] || '');
        const postName = page['wp:post_name']?.[0];
        const postDate = page['wp:post_date']?.[0];
        
        if (!title || !content) continue;
        
        const slug = postName || slugify(title);
        
        // Media URL'lerini dönüştür
        const processedContent = convertMediaUrls(
          content, 
          siteUrl, 
          'https://your-r2-domain.com'
        );
        
        await prisma.page.upsert({
          where: { slug: slug },
          update: {
            title: title,
            content: processedContent,
            publishedAt: postDate ? new Date(postDate) : new Date()
          },
          create: {
            title: title,
            slug: slug,
            content: processedContent,
            featuredImage: null,
            showInMenu: true,
            menuOrder: 0,
            publishedAt: postDate ? new Date(postDate) : new Date()
          }
        });
        
        console.log(`   ✅ Sayfa: ${title}`);
      } catch (error) {
        console.log(`   ❌ Sayfa hatası:`, error);
      }
    }
    
    // Final istatistikler
    const finalStats = await Promise.all([
      prisma.kategori.count(),
      prisma.yazar.count(),
      prisma.yazi.count(),
      prisma.page.count()
    ]);
    
    console.log('\n🎉 WordPress XML import tamamlandı!');
    console.log('\n📊 Final durum:');
    console.log(`   📂 Kategoriler: ${finalStats[0]}`);
    console.log(`   👤 Yazarlar: ${finalStats[1]}`);
    console.log(`   📝 Yazılar: ${finalStats[2]}`);
    console.log(`   📄 Sayfalar: ${finalStats[3]}`);
    
  } catch (error) {
    console.error('❌ Import hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importWordPressXML();