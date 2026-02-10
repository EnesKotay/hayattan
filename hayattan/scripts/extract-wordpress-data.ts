import { readFileSync, writeFileSync } from 'fs';

async function extractWordPressData() {
  try {
    console.log('🔍 WordPress verilerini çıkarıyoruz...');
    
    const sqlPath = 'C:\\Users\\Enes Can Kotay\\Downloads\\94_73_148_159.sql';
    const sqlContent = readFileSync(sqlPath, 'utf-8');
    
    // wp_posts tablosunu bul ve çıkar
    console.log('\n📝 wp_posts tablosu aranıyor...');
    
    // wp_posts INSERT statement'larını bul
    const postsInsertRegex = /INSERT INTO `wp_posts` VALUES[^;]+;/g;
    const postsMatches = sqlContent.match(postsInsertRegex);
    
    console.log(`   Bulunan wp_posts INSERT: ${postsMatches?.length || 0}`);
    
    if (postsMatches) {
      // İlk birkaç INSERT'i analiz et
      console.log('\n📋 wp_posts örnek veriler:');
      
      postsMatches.slice(0, 3).forEach((insert: any, index: number) => {
        console.log(`\n--- INSERT ${index + 1} ---`);
        console.log(insert.substring(0, 500) + '...');
      });
      
      // wp_posts yapısını çıkar
      const createPostsRegex = /CREATE TABLE[^`]*`wp_posts`[^;]+;/i;
      const createPostsMatch = sqlContent.match(createPostsRegex);
      
      if (createPostsMatch) {
        console.log('\n🏗️ wp_posts tablo yapısı:');
        console.log(createPostsMatch[0]);
      }
    }
    
    // wp_users tablosunu bul
    console.log('\n👤 wp_users tablosu aranıyor...');
    const usersInsertRegex = /INSERT INTO `wp_users` VALUES[^;]+;/g;
    const usersMatches = sqlContent.match(usersInsertRegex);
    
    console.log(`   Bulunan wp_users INSERT: ${usersMatches?.length || 0}`);
    
    if (usersMatches) {
      console.log('\n📋 wp_users örnek veriler:');
      usersMatches.slice(0, 2).forEach((insert: any, index: number) => {
        console.log(`\n--- USER ${index + 1} ---`);
        console.log(insert.substring(0, 300) + '...');
      });
    }
    
    // wp_terms tablosunu bul
    console.log('\n📂 wp_terms tablosu aranıyor...');
    const termsInsertRegex = /INSERT INTO `wp_terms` VALUES[^;]+;/g;
    const termsMatches = sqlContent.match(termsInsertRegex);
    
    console.log(`   Bulunan wp_terms INSERT: ${termsMatches?.length || 0}`);
    
    if (termsMatches) {
      console.log('\n📋 wp_terms örnek veriler:');
      termsMatches.slice(0, 2).forEach((insert: any, index: number) => {
        console.log(`\n--- TERM ${index + 1} ---`);
        console.log(insert.substring(0, 200) + '...');
      });
    }
    
    // Tüm tablo isimlerini listele
    console.log('\n📊 Tüm tablolar:');
    const createTableRegex = /CREATE TABLE[^`]*`([^`]+)`/gi;
    const tableMatches = [...sqlContent.matchAll(createTableRegex)];
    
    const tables = tableMatches.map(match => match[1]).filter(Boolean);
    tables.forEach((table: any, index: number) => {
      console.log(`   ${index + 1}. ${table}`);
    });
    
    // Sadece önemli tabloların verilerini çıkar
    const importantTables = ['wp_posts', 'wp_users', 'wp_terms', 'wp_term_taxonomy', 'wp_term_relationships'];
    
    let extractedData = '-- WordPress Önemli Veriler\n\n';
    
    for (const tableName of importantTables) {
      console.log(`\n🔍 ${tableName} tablosu çıkarılıyor...`);
      
      // CREATE TABLE
      const createRegex = new RegExp(`CREATE TABLE[^;]*\`${tableName}\`[^;]*;`, 'i');
      const createMatch = sqlContent.match(createRegex);
      
      if (createMatch) {
        extractedData += `-- ${tableName} tablo yapısı\n`;
        extractedData += createMatch[0] + '\n\n';
      }
      
      // INSERT INTO
      const insertRegex = new RegExp(`INSERT INTO \`${tableName}\`[^;]*;`, 'g');
      const insertMatches = sqlContent.match(insertRegex);
      
      if (insertMatches) {
        extractedData += `-- ${tableName} verileri (${insertMatches.length} kayıt)\n`;
        insertMatches.forEach(insert => {
          extractedData += insert + '\n';
        });
        extractedData += '\n';
        console.log(`   ✅ ${insertMatches.length} kayıt bulundu`);
      } else {
        console.log(`   ❌ Veri bulunamadı`);
      }
    }
    
    // Çıkarılan veriyi kaydet
    const outputPath = 'wordpress-extracted.sql';
    writeFileSync(outputPath, extractedData);
    
    console.log(`\n✅ Veriler çıkarıldı: ${outputPath}`);
    console.log(`   Dosya boyutu: ${(extractedData.length / 1024 / 1024).toFixed(2)} MB`);
    
  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

extractWordPressData();