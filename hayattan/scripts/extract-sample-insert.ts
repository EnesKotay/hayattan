import { readFileSync, writeFileSync } from 'fs';

async function extractSampleInsert() {
  try {
    console.log('🔍 SQL\'den örnek INSERT çıkarıyoruz...\n');
    
    const sqlPath = 'C:\\Users\\Enes Can Kotay\\Downloads\\94_73_148_159.sql';
    const sqlContent = readFileSync(sqlPath, 'utf-8');
    
    // wp_posts INSERT'lerini bul
    const postsInsertRegex = /INSERT INTO `wp_posts`[^;]+;/gs;
    const postsMatches = sqlContent.match(postsInsertRegex);
    
    if (postsMatches && postsMatches.length > 0) {
      console.log(`✅ ${postsMatches.length} INSERT bulundu`);
      
      // İlk birkaç INSERT'i dosyaya kaydet
      let sampleContent = '-- ÖRNEK wp_posts INSERT\'leri\n\n';
      
      for (let i = 0; i < Math.min(5, postsMatches.length); i++) {
        sampleContent += `-- INSERT ${i + 1}\n`;
        sampleContent += postsMatches[i];
        sampleContent += '\n\n';
      }
      
      const outputPath = 'C:\\Users\\Enes Can Kotay\\Documents\\GitHub\\Hayattan\\Hayatta-net\\hayattan\\sample-wp-posts.sql';
      writeFileSync(outputPath, sampleContent, 'utf-8');
      
      console.log(`📄 Örnek INSERT'ler kaydedildi: ${outputPath}`);
      
      // İlk INSERT'in detaylarını göster
      const firstInsert = postsMatches[0];
      console.log('\n📋 İLK INSERT DETAYI:');
      console.log(`   Uzunluk: ${firstInsert.length} karakter`);
      console.log(`   İlk 200 karakter: ${firstInsert.substring(0, 200)}...`);
      
      // VALUES kısmını bul
      const valuesMatch = firstInsert.match(/VALUES\s*(.+)$/s);
      if (valuesMatch) {
        console.log('\n📋 VALUES KISMI BULUNDU:');
        const valuesContent = valuesMatch[1];
        console.log(`   VALUES uzunluğu: ${valuesContent.length} karakter`);
        console.log(`   VALUES başlangıcı: ${valuesContent.substring(0, 300)}...`);
        
        // İlk satırı manuel parse et
        console.log('\n🔧 MANUEL PARSE DENEMESİ:');
        
        // İlk parantezi bul
        const firstParen = valuesContent.indexOf('(');
        if (firstParen !== -1) {
          console.log(`   İlk '(' pozisyonu: ${firstParen}`);
          
          // Basit şekilde ilk satırı çıkar (virgülle ayrılmış)
          let pos = firstParen + 1;
          let fieldCount = 0;
          let currentField = '';
          let inString = false;
          let stringChar = '';
          
          const fields: string[] = [];
          
          while (pos < valuesContent.length && fieldCount < 25) {
            const char = valuesContent[pos];
            
            if (!inString) {
              if (char === "'" || char === '"') {
                inString = true;
                stringChar = char;
                currentField += char;
              } else if (char === ',' && !inString) {
                fields.push(currentField.trim());
                currentField = '';
                fieldCount++;
              } else if (char === ')' && !inString) {
                fields.push(currentField.trim());
                break;
              } else {
                currentField += char;
              }
            } else {
              currentField += char;
              if (char === stringChar && valuesContent[pos - 1] !== '\\') {
                inString = false;
              }
            }
            pos++;
          }
          
          console.log(`   Parse edilen field sayısı: ${fields.length}`);
          
          if (fields.length >= 20) {
            console.log('\n📊 İLK SATIRDAN ÇIKARILAN ALANLAR:');
            console.log(`   ID: ${fields[0]}`);
            console.log(`   Author: ${fields[1]}`);
            console.log(`   Date: ${fields[2]}`);
            console.log(`   Title: ${fields[5]?.substring(0, 50)}...`);
            console.log(`   Status: ${fields[7]}`);
            console.log(`   Post Name: ${fields[11]}`);
            console.log(`   Post Type: ${fields[20]}`);
          }
        }
      } else {
        console.log('❌ VALUES kısmı bulunamadı');
      }
      
      // Tüm INSERT'lerdeki status ve type'ları say
      console.log('\n📊 TÜM INSERT\'LERDE HIZLI ARAMA:');
      let publishCount = 0;
      let draftCount = 0;
      let postCount = 0;
      let pageCount = 0;
      
      postsMatches.forEach((insert: any) => {
        if (insert.includes("'publish'")) publishCount++;
        if (insert.includes("'draft'")) draftCount++;
        if (insert.includes("'post'")) postCount++;
        if (insert.includes("'page'")) pageCount++;
      });
      
      console.log(`   'publish' içeren INSERT: ${publishCount}`);
      console.log(`   'draft' içeren INSERT: ${draftCount}`);
      console.log(`   'post' içeren INSERT: ${postCount}`);
      console.log(`   'page' içeren INSERT: ${pageCount}`);
      
    } else {
      console.log('❌ Hiç wp_posts INSERT bulunamadı');
    }
    
  } catch (error) {
    console.error('❌ Çıkarma hatası:', error);
  }
}

extractSampleInsert();