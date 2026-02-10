import { readFileSync } from 'fs';

async function deepPostAnalysis() {
  try {
    console.log('🔍 DETAYLI YAZI ANALİZİ...\n');
    
    const sqlPath = 'C:\\Users\\Enes Can Kotay\\Downloads\\94_73_148_159.sql';
    const sqlContent = readFileSync(sqlPath, 'utf-8');
    
    // wp_posts tablosunun tüm INSERT'lerini bul
    console.log('📄 wp_posts INSERT statement\'larını arıyoruz...');
    
    // Daha spesifik regex
    const insertMatches = sqlContent.match(/INSERT INTO `wp_posts` \([^)]+\) VALUES[^;]+;/gs);
    
    if (!insertMatches) {
      console.log('❌ wp_posts INSERT bulunamadı!');
      
      // Alternatif arama
      const alternativeMatches = sqlContent.match(/INSERT INTO `wp_posts`[^;]+;/gs);
      console.log(`🔍 Alternatif arama: ${alternativeMatches?.length || 0} sonuç`);
      
      if (alternativeMatches) {
        console.log('\n📋 İlk birkaç INSERT örneği:');
        alternativeMatches.slice(0, 3).forEach((match: any, index: number) => {
          console.log(`\n--- INSERT ${index + 1} ---`);
          console.log(match.substring(0, 300) + '...');
        });
      }
      return;
    }
    
    console.log(`✅ ${insertMatches.length} wp_posts INSERT bulundu\n`);
    
    // Her INSERT'i detaylı analiz et
    let totalPosts = 0;
    const statusCounts = new Map();
    const typeCounts = new Map();
    const samplePosts: any[] = [];
    
    for (const insertStatement of insertMatches) {
      try {
        // VALUES kısmını çıkar
        const valuesMatch = insertStatement.match(/VALUES\s*(.+)$/s);
        if (!valuesMatch) continue;
        
        let valuesString = valuesMatch[1].replace(/;$/, '');
        
        // Basit row parsing
        let currentPos = 0;
        let rowCount = 0;
        
        while (currentPos < valuesString.length && rowCount < 10) { // İlk 10 row'u analiz et
          const openParen = valuesString.indexOf('(', currentPos);
          if (openParen === -1) break;
          
          // Kapanış parantezini bul (basit yöntem)
          let parenCount = 0;
          let pos = openParen;
          let inString = false;
          let stringChar = '';
          
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
            const rowData = valuesString.substring(openParen + 1, pos);
            
            // Basit field extraction
            const fields = rowData.split("','");
            
            if (fields.length >= 21) {
              totalPosts++;
              rowCount++;
              
              // Field'ları temizle
              const cleanFields = fields.map(f => f.replace(/^'|'$/g, ''));
              
              const post_id = cleanFields[0];
              const post_title = cleanFields[5];
              const post_status = cleanFields[7];
              const post_type = cleanFields[20];
              
              // Sayımları güncelle
              statusCounts.set(post_status, (statusCounts.get(post_status) || 0) + 1);
              typeCounts.set(post_type, (typeCounts.get(post_type) || 0) + 1);
              
              // Örnek post'ları sakla
              if (samplePosts.length < 20) {
                samplePosts.push({
                  id: post_id,
                  title: post_title?.substring(0, 50) + '...',
                  status: post_status,
                  type: post_type
                });
              }
            }
            
            currentPos = pos + 1;
          } else {
            break;
          }
        }
      } catch (error) {
        console.log('Parse hatası:', error);
      }
    }
    
    console.log('📊 ANALİZ SONUÇLARI:');
    console.log(`   Toplam analiz edilen post: ${totalPosts}`);
    
    console.log('\n📋 POST STATUS DAĞILIMI:');
    Array.from(statusCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([status, count]: [string, any]) => {
        console.log(`   ${status}: ${count} adet`);
      });
    
    console.log('\n📋 POST TYPE DAĞILIMI:');
    Array.from(typeCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]: [string, any]) => {
        console.log(`   ${type}: ${count} adet`);
      });
    
    console.log('\n📝 ÖRNEK POSTLAR:');
    samplePosts.forEach((post: any, index: number) => {
      console.log(`   ${index + 1}. [${post.status}] ${post.title} (${post.type})`);
    });
    
    // Publish durumundaki post sayısını kontrol et
    const publishedCount = statusCounts.get('publish') || 0;
    console.log(`\n🎯 SONUÇ: ${publishedCount} adet 'publish' durumunda yazı bulundu`);
    
    if (publishedCount < 100) {
      console.log('\n💡 ÖNERİLER:');
      console.log('1. Draft durumundaki yazıları da import edebiliriz');
      console.log('2. Private yazıları dahil edebiliriz');
      console.log('3. Inherit durumundaki yazıları kontrol edebiliriz');
      console.log('4. SQL dump\'ın tam olup olmadığını kontrol edin');
    }
    
  } catch (error) {
    console.error('❌ Analiz hatası:', error);
  }
}

deepPostAnalysis();