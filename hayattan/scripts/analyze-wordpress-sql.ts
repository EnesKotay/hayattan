import { readFileSync } from 'fs';

async function analyzeWordPressSQL() {
  try {
    console.log('🔍 WordPress SQL dosyası analiz ediliyor...');
    
    const sqlPath = 'C:\\Users\\Enes Can Kotay\\Downloads\\94_73_148_159.sql';
    const sqlContent = readFileSync(sqlPath, 'utf-8');
    
    console.log('📄 Dosya boyutu:', (sqlContent.length / 1024 / 1024).toFixed(2), 'MB');
    console.log('📄 Satır sayısı:', sqlContent.split('\n').length);
    
    // İlk 50 satırı göster
    const lines = sqlContent.split('\n');
    console.log('\n📋 İlk 50 satır:');
    lines.slice(0, 50).forEach((line: any, index: number) => {
      if (line.trim()) {
        console.log(`${(index + 1).toString().padStart(3, ' ')}: ${line.substring(0, 100)}${line.length > 100 ? '...' : ''}`);
      }
    });
    
    // CREATE TABLE pattern'larını ara
    const createTableMatches = sqlContent.match(/CREATE TABLE[^;]*;/gi);
    console.log('\n🏗️ CREATE TABLE statements:', createTableMatches?.length || 0);
    
    if (createTableMatches) {
      createTableMatches.slice(0, 10).forEach((match: any, index: number) => {
        const tableName = match.match(/CREATE TABLE\s+`?([^`\s]+)`?/i)?.[1];
        console.log(`   ${index + 1}. ${tableName}`);
      });
    }
    
    // INSERT INTO pattern'larını ara
    const insertMatches = sqlContent.match(/INSERT INTO[^;]*;/gi);
    console.log('\n📝 INSERT INTO statements:', insertMatches?.length || 0);
    
    if (insertMatches) {
      insertMatches.slice(0, 10).forEach((match: any, index: number) => {
        const tableName = match.match(/INSERT INTO\s+`?([^`\s]+)`?/i)?.[1];
        console.log(`   ${index + 1}. ${tableName}`);
      });
    }
    
    // WordPress karakteristik pattern'larını ara
    const wpPatterns = [
      { name: 'wp_ tablolar', pattern: /wp_\w+/g },
      { name: 'WordPress version', pattern: /wordpress.*version/gi },
      { name: 'wp_posts', pattern: /wp_posts/gi },
      { name: 'wp_users', pattern: /wp_users/gi }
    ];
    
    console.log('\n🔍 WordPress pattern analizi:');
    wpPatterns.forEach(({ name, pattern }) => {
      const matches = sqlContent.match(pattern);
      console.log(`   ${name}: ${matches?.length || 0} eşleşme`);
    });
    
  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

analyzeWordPressSQL();