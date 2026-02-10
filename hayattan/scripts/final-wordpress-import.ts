import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

function parseWordPressInsert(insertStatement: string) {
  try {
    // VALUES kısmını bul
    const valuesMatch = insertStatement.match(/VALUES\s*(.+)$/s);
    if (!valuesMatch) return [];
    
    let valuesString = valuesMatch[1];
    
    // Son noktalı virgülü kaldır
    valuesString = valuesString.replace(/;$/, '');
    
    const rows: any[] = [];
    let currentPos = 0;
    
    while (currentPos < valuesString.length) {
      // Bir satırın başlangıcını bul
      const openParen = valuesString.indexOf('(', currentPos);
      if (openParen === -1) break;
      
      // Eşleşen kapanış parantezini bul
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
            if (parenCount === 0) {
              break;
            }
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
  
  // Son değeri ekle
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
    return value.slice(1, -1).replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  }
  
  if (/^\d+$/.test(value)) {
    return parseInt(value);
  }
  
  return value;
}

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

async function finalWordPressImport() {
  try {
    console.log('🚀 WordPress verilerini Neon\'a aktarıyoruz...');
    
    const sqlContent = readFileSync('wordpress-extracted.sql', 'utf-8');
    
    // 1. wp_users verilerini import et
    console.log('\n👤 Kullanıcıları import ediyoruz...');
    const usersInsertMatch = sqlContent.match(/INSERT INTO `wp_users`[^;]+;/s);
    
    if (usersInsertMatch) {
      const usersData = parseWordPressInsert(usersInsertMatch[0]);
      console.log(`   Bulunan kullanıcı: ${usersData.length}`);
      
      for (const userData of usersData) {
        const [id, login, pass, nicename, email, url, registered, activation_key, status, display_name] = userData;
        
        if (email && display_name) {
          try {
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
                role: 'ADMIN',
                biyografi: 'WordPress\'ten aktarılan kullanıcı',
                misafir: false,
                ayrilmis: false
              }
            });
            console.log(`   ✅ Kullanıcı eklendi: ${display_name} (${email})`);
          } catch (error) {
            console.log(`   ❌ Kullanıcı eklenemedi: ${display_name}`, error);
          }
        }
      }
    }
    
    // 2. wp_terms ve wp_term_taxonomy verilerini import et (kategoriler)
    console.log('\n📂 Kategorileri import ediyoruz...');
    const termsInsertMatch = sqlContent.match(/INSERT INTO `wp_terms`[^;]+;/s);
    const termTaxonomyInsertMatch = sqlContent.match(/INSERT INTO `wp_term_taxonomy`[^;]+;/s);
    
    if (termsInsertMatch && termTaxonomyInsertMatch) {
      const termsData = parseWordPressInsert(termsInsertMatch[0]);
      const taxonomyData = parseWordPressInsert(termTaxonomyInsertMatch[0]);
      
      console.log(`   Bulunan terim: ${termsData.length}`);
      console.log(`   Bulunan taksonomi: ${taxonomyData.length}`);
      
      // Kategorileri filtrele (taxonomy = 'category')
      const categories = taxonomyData
        .filter(tax => tax[2] === 'category')
        .map(tax => {
          const term = termsData.find(t => t[0] === tax[0]);
          return term ? {
            id: tax[0],
            name: term[1],
            slug: term[2],
            description: tax[3] || null
          } : null;
        })
        .filter(Boolean);
      
      console.log(`   Kategori sayısı: ${categories.length}`);
      
      for (const category of categories) {
        try {
          await prisma.kategori.upsert({
            where: { slug: category.slug },
            update: {
              name: category.name,
              description: category.description
            },
            create: {
              name: category.name,
              slug: category.slug,
              description: category.description
            }
          });
          console.log(`   ✅ Kategori eklendi: ${category.name}`);
        } catch (error) {
          console.log(`   ❌ Kategori eklenemedi: ${category.name}`, error);
        }
      }
    }
    
    // 3. wp_posts verilerini import et
    console.log('\n📝 Yazıları import ediyoruz...');
    const postsInsertMatch = sqlContent.match(/INSERT INTO `wp_posts`[^;]+;/s);
    
    if (postsInsertMatch) {
      const postsData = parseWordPressInsert(postsInsertMatch[0]);
      console.log(`   Bulunan gönderi: ${postsData.length}`);
      
      // Sadece yayınlanmış yazıları filtrele
      const publishedPosts = postsData.filter(post => 
        post[7] === 'publish' && post[20] === 'post' // post_status, post_type
      );
      
      console.log(`   Yayınlanmış yazı: ${publishedPosts.length}`);
      
      // Yazarları al
      const authors = await prisma.yazar.findMany();
      const defaultAuthor = authors.find(a => a.role === 'ADMIN') || authors[0];
      
      // İlk 50 yazıyı import et
      for (const postData of publishedPosts.slice(0, 50)) {
        try {
          const [
            id, post_author, post_date, post_date_gmt, post_content, post_title,
            post_excerpt, post_status, comment_status, ping_status, post_password,
            post_name, to_ping, pinged, post_modified, post_modified_gmt,
            post_content_filtered, post_parent, guid, menu_order, post_type,
            post_mime_type, comment_count
          ] = postData;
          
          if (!post_title || !post_content) continue;
          
          const slug = post_name || slugify(post_title);
          
          await prisma.yazi.upsert({
            where: { slug: slug },
            update: {
              title: post_title,
              content: post_content,
              excerpt: post_excerpt || null,
              publishedAt: new Date(post_date)
            },
            create: {
              title: post_title,
              slug: slug,
              content: post_content,
              excerpt: post_excerpt || null,
              authorId: defaultAuthor.id,
              publishedAt: new Date(post_date),
              featuredImage: null,
              showInSlider: false
            }
          });
          
          console.log(`   ✅ Yazı eklendi: ${post_title.substring(0, 50)}...`);
        } catch (error) {
          console.log(`   ❌ Yazı eklenemedi:`, error);
        }
      }
    }
    
    console.log('\n🎉 WordPress import tamamlandı!');
    
    // Son durum
    const [kategoriCount, yazarCount, yaziCount] = await Promise.all([
      prisma.kategori.count(),
      prisma.yazar.count(),
      prisma.yazi.count()
    ]);
    
    console.log('\n📊 Final durum:');
    console.log(`   📂 Kategoriler: ${kategoriCount}`);
    console.log(`   👤 Yazarlar: ${yazarCount}`);
    console.log(`   📝 Yazılar: ${yaziCount}`);
    
  } catch (error) {
    console.error('❌ Import hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

finalWordPressImport();