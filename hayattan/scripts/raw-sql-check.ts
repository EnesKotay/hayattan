import { readFileSync } from 'fs';

async function rawSqlCheck() {
  try {
    console.log('🔍 SQL DOSYASI HAM İÇERİK KONTROLÜ...\n');
    
    const sqlPath = 'C:\\Users\\Enes Can Kotay\\Downloads\\94_73_148_159.sql';
    const sqlContent = readFileSync(sqlPath, 'utf-8');
    
    console.log(`📄 Dosya boyutu: ${(sqlContent.length / 1024 / 1024).toFixed(2)} MB`);
    console.log(`📄 Satır sayısı: ${sqlContent.split('\n').length}`);
    
    // wp_posts ile ilgili tüm satırları bul
    console.log('\n🔍 wp_posts ile ilgili satırları arıyoruz...');
    
    const lines = sqlContent.split('\n');
    let wpPostsLines: string[] = [];
    let createTableFound = false;
    let insertCount = 0;
    
    lines.forEach((line: any, index: number) => {
      if (line.includes('wp_posts')) {
        wpPostsLines.push(`Satır ${index + 1}: ${line.substring(0, 100)}...`);
        
        if (line.includes('CREATE TABLE')) {
          createTableFound = true;
        }
        
        if (line.includes('INSERT INTO')) {
          insertCount++;
        }
      }
    });
    
    console.log(`✅ wp_posts içeren ${wpPostsLines.length} satır bulundu`);
    console.log(`✅ CREATE TABLE bulundu: ${createTableFound}`);
    console.log(`✅ INSERT INTO sayısı: ${insertCount}`);
    
    console.log('\n📋 İlk 10 wp_posts satırı:');
    wpPostsLines.slice(0, 10).forEach((line: any) => {
      console.log(`   ${line}`);
    });
    
    // wp_posts CREATE TABLE'ı bul
    console.log('\n🏗️ wp_posts CREATE TABLE arıyoruz...');
    const createTableMatch = sqlContent.match(/CREATE TABLE.*?`wp_posts`.*?;/s);
    if (createTableMatch) {
      console.log('✅ CREATE TABLE wp_posts bulundu:');
      console.log(createTableMatch[0].substring(0, 500) + '...');
    } else {
      console.log('❌ CREATE TABLE wp_posts bulunamadı');
    }
    
    // wp_posts INSERT'leri bul
    console.log('\n📝 wp_posts INSERT\'leri arıyoruz...');
    
    // Farklı INSERT pattern'leri dene
    const patterns = [
      /INSERT INTO `wp_posts`/g,
      /INSERT INTO wp_posts/g,
      /INSERT.*wp_posts/g,
    ];
    
    patterns.forEach((pattern: any, index: number) => {
      const matches = sqlContent.match(pattern);
      console.log(`   Pattern ${index + 1}: ${matches?.length || 0} sonuç`);
    });
    
    // Gerçek INSERT'leri bul ve örnekle
    const insertMatches = sqlContent.match(/INSERT INTO `wp_posts`[^;]*;/gs);
    if (insertMatches) {
      console.log(`\n✅ ${insertMatches.length} INSERT INTO wp_posts bulundu`);
      
      console.log('\n📋 İlk INSERT örneği:');
      console.log(insertMatches[0].substring(0, 500) + '...');
      
      // VALUES kısmını kontrol et
      const firstInsert = insertMatches[0];
      const valuesMatch = firstInsert.match(/VALUES\s*(.+)$/s);
      if (valuesMatch) {
        console.log('\n📋 VALUES kısmı bulundu:');
        console.log(valuesMatch[1].substring(0, 300) + '...');
      } else {
        console.log('\n❌ VALUES kısmı bulunamadı');
      }
    } else {
      console.log('\n❌ Hiç INSERT INTO wp_posts bulunamadı');
      
      // Alternatif arama
      console.log('\n🔍 Alternatif INSERT araması...');
      const altInserts = sqlContent.match(/INSERT.*posts.*VALUES/gi);
      console.log(`   Alternatif sonuç: ${altInserts?.length || 0}`);
      
      if (altInserts) {
        console.log('   İlk alternatif:');
        console.log(`   ${altInserts[0]}`);
      }
    }
    
    // Genel istatistikler
    console.log('\n📊 GENEL İSTATİSTİKLER:');
    console.log(`   'INSERT' kelimesi: ${(sqlContent.match(/INSERT/g) || []).length} kez geçiyor`);
    console.log(`   'wp_posts' kelimesi: ${(sqlContent.match(/wp_posts/g) || []).length} kez geçiyor`);
    console.log(`   'VALUES' kelimesi: ${(sqlContent.match(/VALUES/g) || []).length} kez geçiyor`);
    
  } catch (error) {
    console.error('❌ Kontrol hatası:', error);
  }
}

rawSqlCheck();