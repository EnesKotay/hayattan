import { readFileSync } from 'fs';

async function extractDbInfoFromSQL() {
  try {
    console.log('🔍 SQL dump dosyasından veritabanı bilgilerini çıkarıyoruz...\n');
    
    const sqlPath = 'C:\\Users\\Enes Can Kotay\\Downloads\\94_73_148_159.sql';
    const sqlContent = readFileSync(sqlPath, 'utf-8');
    
    // İlk 100 satırı kontrol et
    const lines = sqlContent.split('\n').slice(0, 100);
    
    console.log('📄 SQL dosyasının başlangıcı:');
    lines.slice(0, 20).forEach((line: any, index: number) => {
      if (line.trim() && !line.startsWith('--') && !line.startsWith('/*!')) {
        console.log(`${(index + 1).toString().padStart(3, ' ')}: ${line}`);
      }
    });
    
    // Veritabanı adını bul
    const dbNameMatch = sqlContent.match(/-- Veritabanı: `([^`]+)`/);
    if (dbNameMatch) {
      console.log(`\n🗃️ Veritabanı adı: ${dbNameMatch[1]}`);
    }
    
    // Host bilgisini bul
    const hostMatch = sqlContent.match(/-- Anamakine: ([^\n]+)/);
    if (hostMatch) {
      console.log(`🌐 Host: ${hostMatch[1]}`);
    }
    
    // Server bilgisini bul
    const serverMatch = sqlContent.match(/-- Sunucu sürümü: ([^\n]+)/);
    if (serverMatch) {
      console.log(`⚙️ Server: ${serverMatch[1]}`);
    }
    
    console.log('\n💡 Tahmini MySQL bağlantı bilgileri:');
    console.log('   Host: 94.73.148.159');
    console.log('   Database: db_hayattan_net');
    console.log('   User: ? (wp-config.php\'den bulmanız gerekiyor)');
    console.log('   Password: ? (wp-config.php\'den bulmanız gerekiyor)');
    
    console.log('\n🔧 Alternatif çözüm:');
    console.log('   Eğer MySQL\'e uzaktan erişim yoksa,');
    console.log('   mevcut SQL dump\'ı parse ederek import edebiliriz.');
    
  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

extractDbInfoFromSQL();