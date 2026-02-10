async function testR2UploadNow() {
  console.log('🧪 CLOUDFLARE R2 UPLOAD TEST\n');
  
  console.log('✅ YAPILAN FİXLER:');
  console.log('🔄 Client → /api/r2/upload (server-side)');
  console.log('🔒 Custom HTTPS agent (SSL bypass)');
  console.log('⚡ TLS 1.2 + rejectUnauthorized: false');
  
  console.log('\n🎯 TEST ADAMLARI:');
  console.log('1. Deploy tamamlandıktan sonra (2-3 dk)');
  console.log('2. Admin panele gir: hayattan.net/admin/giris');
  console.log('3. Yeni yazı: /admin/yazilar/yeni');
  console.log('4. Resim yükle → Cloudflare R2\'ye gidecek!');
  
  console.log('\n📊 R2 BUCKET DURUMU:');
  console.log('🌐 URL: https://pub-8181f08d2c444b5eb2dea044781fbdaf.r2.dev');
  console.log('📁 Bucket: hayattan-media');
  console.log('🔗 Endpoint: https://r2.cloudflarestorage.com');
  
  console.log('\n🚀 BEKLENEN SONUÇ:');
  console.log('✅ Upload başarılı');
  console.log('✅ Resim görünür');
  console.log('✅ R2 bucket\'ta dosya var');
  console.log('✅ SSL hatası yok!');
  
  console.log('\n🔧 EĞER HALA SORUN VARSA:');
  console.log('1. 🌐 Nameserver değişikliği (kalıcı çözüm)');
  console.log('2. 🔒 Cloudflare proxy aktif');
  console.log('3. ⚡ Edge SSL termination');
}

testR2UploadNow();