import { readFileSync } from 'fs';

async function analyzeAllPosts() {
  try {
    console.log('🔍 TÜM YAZILARI ANALİZ EDİYORUZ...\n');
    
    const sqlPath = 'C:\\Users\\Enes Can Kotay\\Downloads\\94_73_148_159.sql';
    const sqlContent = readFileSync(sqlPath, 'utf-8');
    
    // wp_posts INSERT'lerini bul
    const postsInsertRegex = /INSERT INTO `wp_posts`[^;]+;/g;
    const postsMatches = sqlContent.match(postsInsertRegex);
    
    console.log(`📊 Bulunan wp_posts INSERT statement'ı: ${postsMatches?.length || 0}`);
    
    if (!postsMatches) {
      console.log('❌ Hiç wp_posts verisi bulunamadı!');
      return;
    }
    
    let totalRows = 0;
    let publishedPosts = 0;
    let draftPosts = 0;
    let revisionPosts = 0;
    let inheritPosts = 0;
    let trashPosts = 0;
    let privatePosts = 0;
    let autoDraftPosts = 0;
    let pages = 0;
    let attachments = 0;
    let otherTypes = 0;
    
    const postTypes = new Map();
    const postStatuses = new Map();
    
    // Her INSERT statement'ını parse et
    for (const insertStatement of postsMatches) {
      try {
        // VALUES kısmını bul
        const valuesMatch = insertStatement.match(/VALUES\s*(.+)$/s);
        if (!valuesMatch) continue;
        
        let valuesString = valuesMatch[1];
        valuesString = valuesString.replace(/;$/, '');
        
        // Basit parsing - her satırı say
        const rows = valuesString.split('),(');
        
        for (const row of rows) {
          totalRows++;
          
          // Basit field extraction (çok basit, tam parsing değil)
          const fields = row.split("','");
          
          if (fields.length >= 21) {
            const post_status = fields[7]?.replace(/'/g, '');
            const post_type = fields[20]?.replace(/'/g, '');
            
            // Post status sayımı
            if (post_status) {
              postStatuses.set(post_status, (postStatuses.get(post_status) || 0) + 1);
              
              switch (post_status) {
                case 'publish': publishedPosts++; break;
                case 'draft': draftPosts++; break;
                case 'revision': revisionPosts++; break;
                case 'inherit': inheritPosts++; break;
                case 'trash': trashPosts++; break;
                case 'private': privatePosts++; break;
                case 'auto-draft': autoDraftPosts++; break;
              }
            }
            
            // Post type sayımı
            if (post_type) {
              postTypes.set(post_type, (postTypes.get(post_type) || 0) + 1);
              
              switch (post_type) {
                case 'post': break; // Normal yazı
                case 'page': pages++; break;
                case 'attachment': attachments++; break;
                default: otherTypes++; break;
              }
            }
          }
        }
      } catch (error) {
        console.log('Parse hatası:', error);
      }
    }
    
    console.log('📊 GENEL İSTATİSTİKLER:');
    console.log(`   Toplam kayıt: ${totalRows}`);
    console.log(`   Yayınlanmış yazılar: ${publishedPosts}`);
    console.log(`   Taslak yazılar: ${draftPosts}`);
    console.log(`   Revision'lar: ${revisionPosts}`);
    console.log(`   Inherit durumu: ${inheritPosts}`);
    console.log(`   Çöp kutusu: ${trashPosts}`);
    console.log(`   Özel yazılar: ${privatePosts}`);
    console.log(`   Otomatik taslaklar: ${autoDraftPosts}`);
    console.log(`   Sayfalar: ${pages}`);
    console.log(`   Ekler (medya): ${attachments}`);
    console.log(`   Diğer tipler: ${otherTypes}`);
    
    console.log('\n📋 POST STATUS DAĞILIMI:');
    Array.from(postStatuses.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([status, count]) => {
        console.log(`   ${status}: ${count} adet`);
      });
    
    console.log('\n📋 POST TYPE DAĞILIMI:');
    Array.from(postTypes.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        console.log(`   ${type}: ${count} adet`);
      });
    
    console.log('\n💡 ANALİZ SONUCU:');
    if (publishedPosts < 100) {
      console.log('⚠️  Az sayıda yayınlanmış yazı var. Muhtemelen:');
      console.log('   - Çoğu yazı taslak durumunda');
      console.log('   - Veya revision/inherit durumunda');
      console.log('   - Veya başka bir post_status\'ta');
    } else {
      console.log('✅ Yeterli sayıda yayınlanmış yazı var');
    }
    
    if (revisionPosts > publishedPosts * 2) {
      console.log('⚠️  Çok fazla revision var, bunlar gerçek yazı değil');
    }
    
    console.log('\n🔧 ÖNERİ:');
    console.log('Eğer daha fazla yazı import etmek istiyorsanız:');
    console.log('1. Draft yazıları da import edebiliriz');
    console.log('2. Private yazıları da dahil edebiliriz');
    console.log('3. Inherit durumundaki yazıları kontrol edebiliriz');
    
  } catch (error) {
    console.error('❌ Analiz hatası:', error);
  }
}

analyzeAllPosts();