async function debugFailedFetch() {
  console.log('🔍 "FAILED TO FETCH" HATASI DEBUGGING\n');
  
  console.log('❌ HATA: Failed to fetch');
  console.log('📍 KONUM: Admin panel resim yükleme');
  
  console.log('\n🔍 MUHTEMEL SEBEPLER:');
  console.log('1. 🌐 /api/r2/presign endpoint\'i çalışmıyor');
  console.log('2. 🔐 Authentication sorunu');
  console.log('3. 🚫 CORS policy sorunu');
  console.log('4. ⏱️ Request timeout');
  console.log('5. 🔧 Environment variables eksik');
  
  console.log('\n🛠️ HEMEN KONTROL EDİLECEKLER:');
  
  // 1. API endpoint kontrolü
  console.log('\n1️⃣ API ENDPOINT KONTROLÜ:');
  console.log('   📂 /src/app/api/r2/presign/route.ts dosyası var mı?');
  console.log('   🔧 Export edilen POST function var mı?');
  console.log('   🔐 Auth kontrolü doğru mu?');
  
  // 2. Environment variables
  console.log('\n2️⃣ VERCEL ENVIRONMENT VARIABLES:');
  console.log('   ✅ R2_ACCOUNT_ID');
  console.log('   ✅ R2_ACCESS_KEY_ID');
  console.log('   ✅ R2_SECRET_ACCESS_KEY');
  console.log('   ✅ R2_BUCKET_NAME');
  console.log('   ✅ R2_ENDPOINT');
  console.log('   🆕 R2_PUBLIC_BASE_URL (yeni eklendi)');
  
  // 3. Browser developer tools
  console.log('\n3️⃣ BROWSER DEVELOPER TOOLS KONTROLÜ:');
  console.log('   🌐 Network tab\'ı açın');
  console.log('   📸 Resim yükleme butonuna tıklayın');
  console.log('   🔍 /api/r2/presign request\'ini bulun');
  console.log('   📊 Status code\'u kontrol edin:');
  console.log('      - 200: Başarılı');
  console.log('      - 401: Authentication hatası');
  console.log('      - 404: Endpoint bulunamadı');
  console.log('      - 500: Server hatası');
  console.log('      - (failed): Network/CORS sorunu');
  
  console.log('\n🔧 HIZLI ÇÖZÜMLER:');
  
  console.log('\n🔄 ÇÖZÜM 1: VERCEL DEPLOYMENT YENİLE');
  console.log('   1. Vercel Dashboard → Deployments');
  console.log('   2. Son deployment → ... → Redeploy');
  console.log('   3. Environment variables yeniden yüklenecek');
  
  console.log('\n🔐 ÇÖZÜM 2: AUTHENTICATION KONTROL');
  console.log('   1. Admin panelinden çıkış yapın');
  console.log('   2. Tekrar giriş yapın');
  console.log('   3. Session yenilenecek');
  
  console.log('\n🌐 ÇÖZÜM 3: BROWSER CACHE TEMİZLE');
  console.log('   1. Hard refresh: Ctrl+F5');
  console.log('   2. Veya incognito/private mode deneyin');
  
  console.log('\n📋 ÇÖZÜM 4: ENVIRONMENT VARIABLES TEKRAR KONTROL');
  console.log('   Vercel\'de şu variable\'lar var mı:');
  console.log('   - R2_PUBLIC_BASE_URL=https://pub-8181f08d2c444b5eb2dea044781fbdaf.r2.dev');
  console.log('   - Diğer R2 credentials');
  
  console.log('\n🚨 ACİL ÇÖZÜM: API ENDPOINT TEST');
  console.log('   Browser\'da direkt şu URL\'yi açın:');
  console.log('   https://hayattan-enes-can-kotays-projects.vercel.app/api/r2/presign');
  console.log('   Sonuç:');
  console.log('   - "Method Not Allowed" → Endpoint çalışıyor');
  console.log('   - "404" → Endpoint bulunamıyor');
  console.log('   - "500" → Server hatası');
  
  console.log('\n🎯 SONRAKI ADIM:');
  console.log('1. 🌐 Browser Developer Tools açın');
  console.log('2. 📸 Resim yükleme deneyin');
  console.log('3. 🔍 Network tab\'da hatayı görün');
  console.log('4. 📋 Hata detaylarını bana söyleyin');
}

debugFailedFetch();