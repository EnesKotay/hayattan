// WordPress wp-config.php dosyasından MySQL bilgilerini çıkarma rehberi

console.log('🔍 MySQL Kullanıcı Bilgilerini Bulma Rehberi\n');

console.log('📁 Yöntem 1: WordPress wp-config.php dosyasını kontrol edin');
console.log('   1. FTP/cPanel File Manager ile sitenize bağlanın');
console.log('   2. Ana dizinde wp-config.php dosyasını bulun');
console.log('   3. Dosyayı açın ve şu satırları arayın:\n');

console.log('   define(\'DB_NAME\', \'veritabani_adi\');');
console.log('   define(\'DB_USER\', \'kullanici_adi\');    ← Bu sizin kullanıcı adınız');
console.log('   define(\'DB_PASSWORD\', \'sifre\');');
console.log('   define(\'DB_HOST\', \'localhost\');\n');

console.log('📧 Yöntem 2: Hosting sağlayıcınıza sorun');
console.log('   - Hosting firmanızın destek ekibine yazın');
console.log('   - MySQL kullanıcı adınızı sorun\n');

console.log('🖥️ Yöntem 3: Hosting paneli kontrol edin');
console.log('   - cPanel → MySQL Databases');
console.log('   - DirectAdmin → MySQL Management');
console.log('   - Plesk → Databases\n');

console.log('🔧 Yöntem 4: Yaygın kullanıcı adı formatları:');
console.log('   - hosting_kullanici_adi_veritabani_adi');
console.log('   - site_adi_db');
console.log('   - hayattan_net');
console.log('   - hayattan_db');
console.log('   - root (yerel sunucular için)\n');

console.log('💡 İpucu: Genellikle kullanıcı adı şu formatta olur:');
console.log('   [hosting_hesap_adi]_[veritabani_adi]');
console.log('   Örnek: john_hayattan veya hayattan_user\n');

// Yaygın kombinasyonları test etmek için
const commonUsernames = [
  'hayattan_net',
  'hayattan_user', 
  'hayattan_db',
  'hayattan',
  'root',
  'db_hayattan_net',
  'hayattan_admin'
];

console.log('🎯 Test edilebilecek yaygın kullanıcı adları:');
commonUsernames.forEach((username, index) => {
  console.log(`   ${index + 1}. ${username}`);
});

console.log('\n📝 Sonraki adım:');
console.log('   Kullanıcı adını bulduğunuzda direct-mysql-import.ts dosyasında');
console.log('   MYSQL_CONFIG.user değerini güncelleyin.');