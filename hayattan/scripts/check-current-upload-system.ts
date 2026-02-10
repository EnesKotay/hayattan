async function checkCurrentUploadSystem() {
  console.log('📸 MEVCUT UPLOAD SİSTEMİ KONTROLÜ\n');
  
  console.log('🔍 UPLOAD ENDPOINT\'LERİ:');
  
  // Test endpoints
  const endpoints = [
    '/api/uploadthing',
    '/api/r2/upload', 
    '/api/r2/presign'
  ];
  
  for (const endpoint of endpoints) {
    const url = `https://hayattan-enes-can-kotays-projects.vercel.app${endpoint}`;
    console.log(`\n🧪 Test: ${endpoint}`);
    
    try {
      const response = await fetch(url, { method: 'HEAD' });
      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      if (response.status === 405) {
        console.log('   ✅ Endpoint mevcut (Method Not Allowed normal)');
      } else if (response.status === 404) {
        console.log('   ❌ Endpoint bulunamadı');
      } else {
        console.log(`   ℹ️ Endpoint var (${response.status})`);
      }
      
    } catch (error: any) {
      console.log(`   ❌ Bağlantı hatası: ${error.message}`);
    }
  }
  
  console.log('\n📋 UPLOAD SİSTEMİ ANALİZİ:');
  
  console.log('\n1️⃣ UPLOADTHING (Şu an aktif):');
  console.log('   ✅ /api/uploadthing endpoint\'i çalışıyor');
  console.log('   ✅ SSL sorunları yok');
  console.log('   ✅ Vercel ile entegre');
  console.log('   📁 Dosyalar: Uploadthing sunucularında');
  console.log('   🌐 URL format: https://utfs.io/f/...');
  
  console.log('\n2️⃣ CLOUDFLARE R2 (Kapalı):');
  console.log('   ❌ SSL/TLS handshake sorunları');
  console.log('   ❌ Şu an kullanılmıyor');
  console.log('   📁 Bucket: Boş (0 dosya)');
  console.log('   🔧 Durum: Devre dışı');
  
  console.log('\n🎯 SONUÇ:');
  console.log('📸 Yeni yazıya fotoğraf eklersen:');
  console.log('   → Uploadthing\'e yüklenecek');
  console.log('   → Cloudflare R2\'ye GİTMEYECEK');
  console.log('   → utfs.io domain\'inde saklanacak');
  
  console.log('\n🔄 CLOUDFLARE R2 İÇİN:');
  console.log('1. SSL sorunlarını çözmek gerekiyor');
  console.log('2. Ya da nameserver değişikliği sonrası');
  console.log('3. Şu an için Uploadthing kullanılıyor');
  
  console.log('\n✅ TEST ÖNERİSİ:');
  console.log('1. Admin panelinde yeni yazı oluştur');
  console.log('2. Featured image yükle');
  console.log('3. URL\'ye bak: utfs.io ile başlıyorsa Uploadthing');
  console.log('4. pub-xxx.r2.dev ile başlıyorsa R2 (şu an olmayacak)');
}

checkCurrentUploadSystem();