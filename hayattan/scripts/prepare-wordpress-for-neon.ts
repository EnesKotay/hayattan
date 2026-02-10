import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

async function prepareWordPressForNeon() {
  try {
    console.log('🔧 WordPress SQL dosyası Neon için hazırlanıyor...');
    
    // SQL dosyasını oku
    const sqlPath = 'C:\\Users\\Enes Can Kotay\\Downloads\\94_73_148_159.sql';
    const sqlContent = readFileSync(sqlPath, 'utf-8');
    
    console.log('📄 SQL dosyası okundu, boyut:', (sqlContent.length / 1024 / 1024).toFixed(2), 'MB');
    
    // WordPress tablolarını tespit et
    const tableMatches = sqlContent.match(/CREATE TABLE `([^`]+)`/g);
    const tables = tableMatches ? tableMatches.map((match: any) => match.match(/`([^`]+)`/)?.[1]).filter(Boolean) : [];
    
    console.log('📋 Bulunan tablolar:');
    tables.forEach((table: any, index: number) => {
      console.log(`   ${index + 1}. ${table}`);
    });
    
    // Önemli WordPress tablolarını filtrele
    const importantTables = [
      'wp_posts',
      'wp_postmeta', 
      'wp_users',
      'wp_usermeta',
      'wp_terms',
      'wp_term_taxonomy',
      'wp_term_relationships',
      'wp_categories',
      'wp_comments',
      'wp_commentmeta'
    ];
    
    console.log('\n🎯 İçe aktarılacak önemli tablolar:');
    const foundImportantTables = tables.filter((table: any) => 
      importantTables.some(important => table?.includes(important.replace('wp_', '')))
    );
    
    foundImportantTables.forEach((table: any, index: number) => {
      console.log(`   ${index + 1}. ${table}`);
    });
    
    // Sadece önemli tabloların INSERT'lerini çıkar
    let filteredSQL = '';
    
    // Her önemli tablo için CREATE ve INSERT statement'larını bul
    for (const table of foundImportantTables) {
      console.log(`\n🔍 ${table} tablosu işleniyor...`);
      
      // CREATE TABLE statement'ını bul
      const createRegex = new RegExp(`CREATE TABLE \`${table}\`[^;]*;`, 'gs');
      const createMatch = sqlContent.match(createRegex);
      if (createMatch) {
        filteredSQL += createMatch[0] + '\n\n';
        console.log(`   ✅ CREATE TABLE eklendi`);
      }
      
      // INSERT statement'larını bul
      const insertRegex = new RegExp(`INSERT INTO \`${table}\`[^;]*;`, 'gs');
      const insertMatches = sqlContent.match(insertRegex);
      if (insertMatches) {
        insertMatches.forEach((insert: any) => {
          filteredSQL += insert + '\n';
        });
        console.log(`   ✅ ${insertMatches.length} INSERT statement eklendi`);
      }
      
      filteredSQL += '\n';
    }
    
    // Filtrelenmiş SQL'i kaydet
    const outputPath = join(process.cwd(), 'wordpress-filtered.sql');
    writeFileSync(outputPath, filteredSQL);
    
    console.log(`\n✅ Filtrelenmiş SQL dosyası hazırlandı:`);
    console.log(`   📁 Konum: ${outputPath}`);
    console.log(`   📏 Boyut: ${(filteredSQL.length / 1024 / 1024).toFixed(2)} MB`);
    
    // Neon import talimatları
    console.log('\n📋 Neon Import Talimatları:');
    console.log('1. Neon Console\'a gidin: https://console.neon.tech');
    console.log('2. Projenizi seçin');
    console.log('3. "Import data" butonuna tıklayın');
    console.log('4. "Upload SQL file" seçeneğini seçin');
    console.log(`5. ${outputPath} dosyasını yükleyin`);
    console.log('6. Import işlemini başlatın');
    
  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

prepareWordPressForNeon();