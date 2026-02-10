async function diagnoseUploadIssue() {
  console.log('🔍 UPLOAD SORUNU TESPİTİ\n');
  
  console.log('📋 UPLOAD ENDPOINT\'LERİ KONTROLÜ:');
  
  const baseUrl = 'https://hayattan-enes-can-kotays-projects.vercel.app';
  const endpoints = [
    '/api/uploadthing',
    '/api/r2/upload',
    '/api/r2/presign'
  ];
  
  for (const endpoint of endpoints) {
    const url = `${baseUrl}${endpoint}`;
    console.log(`\n🧪 ${endpoint}:`);
    
    try {
      // GET request (should be 405 Method Not Allowed)
      const getResponse = await fetch(url, { method: 'GET' });
      console.log(`   GET: ${getResponse.status} ${getResponse.statusText}`);
      
      // POST request (should be 401 Unauthorized or work)
      const postResponse = await fetch(url, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      console.log(`   POST: ${postResponse.status} ${postResponse.statusText}`);
      
      if (postResponse.status === 401) {
        console.log('   ✅ Endpoint çalışıyor (auth gerekiyor)');
      } else if (postResponse.status === 405) {
        console.log('   ✅ Endpoint mevcut (method not allowed)');
      } else if (postResponse.status === 500) {
        console.log('   ⚠️ Server error (konfigürasyon sorunu)');
      } else {
        console.log(`   ℹ️ Beklenmeyen response: ${postResponse.status}`);
      }
      
    } catch (error: any) {
      console.log(`   ❌ Bağlantı hatası: ${error.message}`);
    }
  }
  
  console.log('\n🔧 CLIENT-SIDE UPLOAD UTILITY:');
  
  // r2-client-utils.ts dosyasını kontrol et
  console.log('📁 /src/lib/r2-client-utils.ts:');
  console.log('   🔍 Hangi endpoint kullanılıyor?');
  console.log('   🔍 FormData doğru oluşturuluyor mu?');
  console.log('   🔍 Error handling var mı?');
  
  console.log('\n🎯 MUHTEMEL SORUNLAR:');
  
  console.log('\n1️⃣ UPLOADTHING API SORUNU:');
  console.log('   ❌ uploadFiles function bulunamadı (önceki hata)');
  console.log('   ❌ FormData field name yanlış');
  console.log('   ❌ Authentication token eksik');
  console.log('   ❌ File type validation hatası');
  
  console.log('\n2️⃣ CLOUDFLARE R2 SORUNU:');
  console.log('   ❌ SSL/TLS handshake failure (bilinen sorun)');
  console.log('   ❌ Environment variables eksik');
  console.log('   ❌ Credentials yanlış');
  
  console.log('\n3️⃣ FRONTEND SORUNU:');
  console.log('   ❌ File input çalışmıyor');
  console.log('   ❌ FormData oluşturma hatası');
  console.log('   ❌ Progress handling sorunu');
  console.log('   ❌ Error display sorunu');
  
  console.log('\n🧪 HEMEN TEST EDİLMESİ GEREKENLER:');
  
  console.log('\n📸 ADMIN PANEL TEST:');
  console.log('1. Admin paneli aç: /admin/giris');
  console.log('2. Yeni yazı oluştur: /admin/yazilar/yeni');
  console.log('3. Featured Image bölümüne tıkla');
  console.log('4. Dosya seç ve yükleme dene');
  console.log('5. Browser Developer Tools > Console\'da error var mı?');
  console.log('6. Network tab\'da hangi request gidiyor?');
  
  console.log('\n🔍 BROWSER CONSOLE HATALARI:');
  console.log('Şu hatalardan biri görünüyor mu?');
  console.log('❌ "uploadFiles is not a function"');
  console.log('❌ "Failed to fetch"');
  console.log('❌ "SSL handshake failure"');
  console.log('❌ "401 Unauthorized"');
  console.log('❌ "Network error"');
  
  console.log('\n📋 NETWORK TAB KONTROLÜ:');
  console.log('Hangi endpoint\'e request gidiyor?');
  console.log('✅ /api/uploadthing → Uploadthing kullanılıyor');
  console.log('❌ /api/r2/upload → R2 kullanılıyor (SSL sorunu)');
  console.log('❌ /api/r2/presign → Presigned URL (SSL sorunu)');
  
  console.log('\n🎯 SONUÇ:');
  console.log('Yukarıdaki testleri yapın ve sonuçları söyleyin!');
  console.log('Hangi hatayı alıyorsunuz?');
  console.log('Hangi endpoint\'e request gidiyor?');
}

diagnoseUploadIssue();