// Complete Site Testing Script
// Tests all pages and API endpoints

const BASE_URL = "https://hayattan.vercel.app";

const testEndpoints = [
  // API Endpoints
  { url: `${BASE_URL}/api/health`, name: "Health Check", type: "api" },
  { url: `${BASE_URL}/api/test-db`, name: "Database Test", type: "api" },
  
  // Public Pages
  { url: `${BASE_URL}/`, name: "Ana Sayfa", type: "page" },
  { url: `${BASE_URL}/yazilar`, name: "Yazılar Sayfası", type: "page" },
  { url: `${BASE_URL}/yazarlar`, name: "Yazarlar Sayfası", type: "page" },
  { url: `${BASE_URL}/hakkimizda`, name: "Hakkımızda Sayfası", type: "page" },
  { url: `${BASE_URL}/iletisim`, name: "İletişim Sayfası", type: "page" },
  
  // Admin Pages
  { url: `${BASE_URL}/admin/giris`, name: "Admin Giriş", type: "admin" },
  { url: `${BASE_URL}/admin`, name: "Admin Dashboard", type: "admin" },
];

async function testSite() {
  console.log('🧪 SİTE TEST RAPORU');
  console.log('==================');
  console.log(`📅 Test Zamanı: ${new Date().toLocaleString('tr-TR')}`);
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log('');

  const results = {
    success: 0,
    failed: 0,
    total: testEndpoints.length
  };

  for (const endpoint of testEndpoints) {
    try {
      console.log(`🔍 Test: ${endpoint.name}`);
      console.log(`   URL: ${endpoint.url}`);
      
      const response = await fetch(endpoint.url);
      const status = response.status;
      
      if (status === 200) {
        console.log(`   ✅ BAŞARILI (${status})`);
        results.success++;
      } else if (status === 401 && endpoint.type === 'admin') {
        console.log(`   ⚠️  YETKİSİZ ERİŞİM (${status}) - Normal (admin sayfası)`);
        results.success++;
      } else if (status === 302 || status === 307) {
        console.log(`   🔄 YÖNLENDİRME (${status}) - Normal`);
        results.success++;
      } else {
        console.log(`   ❌ HATA (${status})`);
        results.failed++;
        
        // Hata detayını göster
        try {
          const text = await response.text();
          console.log(`   📄 Hata detayı: ${text.substring(0, 200)}...`);
        } catch (e) {
          console.log(`   📄 Hata detayı alınamadı`);
        }
      }
      
    } catch (error) {
      console.log(`   💥 BAĞLANTI HATASI: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
      results.failed++;
    }
    
    console.log('');
  }

  // Özet rapor
  console.log('📊 TEST ÖZETİ');
  console.log('=============');
  console.log(`✅ Başarılı: ${results.success}/${results.total}`);
  console.log(`❌ Başarısız: ${results.failed}/${results.total}`);
  console.log(`📈 Başarı Oranı: %${Math.round((results.success / results.total) * 100)}`);
  
  if (results.failed === 0) {
    console.log('');
    console.log('🎉 TÜM TESTLER BAŞARILI!');
    console.log('✨ Site tamamen çalışıyor!');
  } else {
    console.log('');
    console.log('⚠️  Bazı testler başarısız. Yukarıdaki hataları kontrol edin.');
  }

  // Admin giriş bilgileri
  console.log('');
  console.log('🔑 ADMİN GİRİŞ BİLGİLERİ:');
  console.log('Email: editor@hayattan.net');
  console.log('Şifre: admin123');
  console.log(`Admin Panel: ${BASE_URL}/admin/giris`);
}

// Test'i çalıştır
testSite().catch(console.error);