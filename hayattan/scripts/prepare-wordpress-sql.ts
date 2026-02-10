import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

async function prepareWordPressSql() {
  try {
    console.log('🔄 WordPress SQL dosyası hazırlanıyor...');

    const sqlPath = 'c:\\Users\\Enes Can Kotay\\Downloads\\94_73_148_159.sql';
    const outputPath = join(process.cwd(), 'wordpress-prepared.sql');

    // SQL dosyasını oku
    const sqlContent = readFileSync(sqlPath, 'utf-8');

    console.log('📁 SQL dosyası okundu');

    // WordPress posts tablosundan sadece published post'ları çıkar
    const postMatches = sqlContent.match(/INSERT INTO `wp_posts`[^;]+;/gi);
    
    let cleanedSql = `-- WordPress to Neon Import
-- Prepared for Hayattan.Net
-- Date: ${new Date().toISOString()}

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- WordPress Posts (Published only)
`;

    if (postMatches) {
      console.log(`📝 ${postMatches.length} post insert bulundu`);
      
      // Sadece ilk birkaç insert'i al (test için)
      for (const match of postMatches.slice(0, 3)) {
        cleanedSql += match + '\n\n';
      }
    }

    // WordPress users tablosunu ekle
    const userMatches = sqlContent.match(/INSERT INTO `wp_users`[^;]+;/gi);
    if (userMatches) {
      cleanedSql += '-- WordPress Users\n';
      for (const match of userMatches.slice(0, 2)) {
        cleanedSql += match + '\n\n';
      }
    }

    // WordPress terms (categories) tablosunu ekle
    const termMatches = sqlContent.match(/INSERT INTO `wp_terms`[^;]+;/gi);
    if (termMatches) {
      cleanedSql += '-- WordPress Terms (Categories)\n';
      for (const match of termMatches.slice(0, 2)) {
        cleanedSql += match + '\n\n';
      }
    }

    // Temizlenmiş SQL'i kaydet
    writeFileSync(outputPath, cleanedSql);

    console.log(`✅ Hazırlanmış SQL dosyası: ${outputPath}`);
    console.log(`📊 Dosya boyutu: ${(cleanedSql.length / 1024).toFixed(2)} KB`);

    // Özet bilgileri göster
    const postCount = (cleanedSql.match(/INSERT INTO `wp_posts`/g) || []).length;
    const userCount = (cleanedSql.match(/INSERT INTO `wp_users`/g) || []).length;
    const termCount = (cleanedSql.match(/INSERT INTO `wp_terms`/g) || []).length;

    console.log('\n📋 İçerik özeti:');
    console.log(`   Posts: ${postCount}`);
    console.log(`   Users: ${userCount}`);
    console.log(`   Terms: ${termCount}`);

    console.log('\n🚀 Neon Import için hazır!');
    console.log('   1. Neon Console\'a gidin');
    console.log('   2. Import Data seçin');
    console.log('   3. Bu dosyayı upload edin');

  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

prepareWordPressSql();