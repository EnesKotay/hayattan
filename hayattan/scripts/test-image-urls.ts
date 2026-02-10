import { config } from 'dotenv';

config({ path: '.env.local' });

async function testImageUrls() {
  console.log('🖼️ IMAGE URL TEST\n');
  
  // Test edilecek URL'ler (gerçek featured image'lardan)
  const testUrls = [
    'https://hayattan.net/wp-content/uploads/pexels-rfstudio-3817676-scaled.jpg',
    'https://hayattan.net/wp-content/uploads/pexels-photo-4100670.jpeg',
    'https://hayattan.net/wp-content/uploads/2020/07/1-2.jpg',
    'https://hayattan.net/wp-content/uploads/2020/05/2-1-scaled.jpg',
    'https://hayattan.net/wp-content/uploads/2020/06/Furkan-3-1-1.jpg'
  ];
  
  console.log('🧪 URL ERİŞİM TESTLERİ:');
  
  for (let i = 0; i < testUrls.length; i++) {
    const url = testUrls[i];
    console.log(`\n${i + 1}. ${url}`);
    
    try {
      const startTime = Date.now();
      const response = await fetch(url, { 
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      const endTime = Date.now();
      
      console.log(`   Status: ${response.status} ${response.statusText}`);
      console.log(`   Content-Type: ${response.headers.get('content-type') || 'N/A'}`);
      console.log(`   Content-Length: ${response.headers.get('content-length') || 'N/A'} bytes`);
      console.log(`   Response Time: ${endTime - startTime}ms`);
      
      if (response.ok) {
        console.log('   ✅ URL erişilebilir');
      } else {
        console.log('   ❌ URL erişilemez');
      }
      
      // CORS headers kontrol et
      const corsHeaders = [
        'access-control-allow-origin',
        'access-control-allow-methods',
        'access-control-allow-headers'
      ];
      
      const hasCors = corsHeaders.some(header => response.headers.has(header));
      if (hasCors) {
        console.log('   🌐 CORS headers mevcut');
      } else {
        console.log('   ⚠️ CORS headers yok (bu sorun olabilir)');
      }
      
    } catch (error: any) {
      console.log(`   ❌ Bağlantı hatası: ${error.message}`);
    }
  }
  
  console.log('\n🔍 NEXT.JS IMAGE OPTIMIZATION TEST:');
  
  // Next.js'in image optimization endpoint'ini test et
  const nextImageUrl = `http://localhost:3000/_next/image?url=${encodeURIComponent(testUrls[0])}&w=640&q=75`;
  console.log(`\nNext.js Image URL: ${nextImageUrl}`);
  
  try {
    const response = await fetch(nextImageUrl, { method: 'HEAD' });
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      console.log('✅ Next.js image optimization çalışıyor');
    } else {
      console.log('❌ Next.js image optimization sorunu');
    }
  } catch (error: any) {
    console.log(`❌ Next.js image test hatası: ${error.message}`);
    console.log('💡 Local dev server çalışmıyor olabilir');
  }
  
  console.log('\n💡 SORUN GİDERME ÖNERİLERİ:');
  console.log('1. 🌐 Tarayıcı Developer Tools > Console\'da error var mı kontrol edin');
  console.log('2. 🖼️ Network tab\'da image request\'leri kontrol edin');
  console.log('3. 🔧 next.config.ts\'deki remotePatterns ayarını kontrol edin');
  console.log('4. 🚀 Production\'da farklı davranış gösterebilir');
  console.log('5. 📱 Mobil cihazlarda farklı olabilir');
}

testImageUrls();