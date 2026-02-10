async function setupR2Cors() {
  console.log('🔒 CLOUDFLARE R2 CORS SETUP\n');
  
  console.log('⚠️  PRESIGNED URL İÇİN CORS GEREKEBİLİR!');
  console.log('Büyük dosyalar direkt R2\'ye gidecek → CORS ayarı lazım\n');
  
  console.log('🌐 CLOUDFLARE DASHBOARD\'DA YAPILACAKLAR:');
  console.log('1. Cloudflare Dashboard → R2 Object Storage');
  console.log('2. "hayattan-media" bucket\'ına tıkla');
  console.log('3. Settings → CORS policy');
  console.log('4. Şu CORS config\'i ekle:\n');
  
  const corsConfig = `[
  {
    "AllowedOrigins": [
      "https://hayattan.net",
      "https://www.hayattan.net",
      "http://localhost:3000"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "DELETE",
      "HEAD"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag"
    ],
    "MaxAgeSeconds": 3000
  }
]`;
  
  console.log('📋 CORS CONFIG:');
  console.log(corsConfig);
  
  console.log('\n🎯 BU CORS AYARI:');
  console.log('✅ hayattan.net domain\'den erişim');
  console.log('✅ localhost:3000 (development)');
  console.log('✅ PUT method (presigned upload)');
  console.log('✅ Tüm headers');
  console.log('✅ ETag expose (upload verification)');
  
  console.log('\n🚀 SMART UPLOAD SİSTEMİ:');
  console.log('📁 ≤4MB: Server proxy (CORS gereksiz)');
  console.log('📁 >4MB: Presigned URL (CORS gerekli)');
  console.log('⚡ Otomatik seçim file size\'a göre');
  
  console.log('\n🧪 TEST SONRASI:');
  console.log('1. Küçük resim (1-3MB) → Server proxy');
  console.log('2. Büyük resim (5-10MB) → Presigned URL');
  console.log('3. Video (20-50MB) → Presigned URL');
  console.log('4. CORS hatası varsa → Dashboard\'da ayarla');
}

setupR2Cors();