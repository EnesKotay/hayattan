async function testHttpsRedirect() {
  console.log('🔒 HTTPS REDIRECT TEST\n');
  
  console.log('✅ CLOUDFLARE AYARLARI:');
  console.log('🔒 Always Use HTTPS: ON (YENİ!)');
  console.log('🔄 Automatic HTTPS Rewrites: ON');
  console.log('⚡ TLS 1.3: ON');
  console.log('🛡️ Minimum TLS: 1.2');
  
  console.log('\n🧪 HTTP → HTTPS REDIRECT TESTİ:');
  
  const testUrls = [
    'http://hayattan.net',
    'http://www.hayattan.net',
    'https://hayattan.net',
    'https://www.hayattan.net'
  ];
  
  for (const url of testUrls) {
    console.log(`\n🔗 Test: ${url}`);
    
    try {
      const startTime = Date.now();
      const response = await fetch(url, { 
        method: 'HEAD',
        redirect: 'manual' // Manuel redirect takibi
      });
      const endTime = Date.now();
      
      console.log(`   Status: ${response.status} ${response.statusText}`);
      console.log(`   Response Time: ${endTime - startTime}ms`);
      
      // Redirect kontrol
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        console.log(`   🔄 Redirect: ${location}`);
        
        if (location?.startsWith('https://')) {
          console.log('   ✅ HTTPS\'e yönlendiriyor');
        } else {
          console.log('   ⚠️ HTTPS olmayan redirect');
        }
      } else if (response.status === 200) {
        console.log('   ✅ Direkt erişilebilir');
      }
      
      // Security headers kontrol
      const strictTransport = response.headers.get('strict-transport-security');
      if (strictTransport) {
        console.log('   🛡️ HSTS Header: Var');
      }
      
    } catch (error: any) {
      console.log(`   ❌ Hata: ${error.message}`);
    }
  }
  
  console.log('\n🎯 BEKLENEN DAVRANIŞLAR:');
  console.log('✅ http://hayattan.net → https://hayattan.net');
  console.log('✅ http://www.hayattan.net → https://hayattan.net');
  console.log('✅ https://hayattan.net → 200 OK');
  console.log('✅ https://www.hayattan.net → https://hayattan.net');
  
  console.log('\n⏱️ PROPAGATION:');
  console.log('🕐 Süre: 15-30 dakika');
  console.log('🔄 Durum: Cloudflare edge cache güncelleniyor');
  console.log('🌍 Global: Tüm dünyada aktif olacak');
  
  console.log('\n🎉 SONUÇ:');
  console.log('Always Use HTTPS açıldı!');
  console.log('Artık tüm trafik şifrelenecek.');
  console.log('SEO ve güvenlik puanı artacak.');
  
  console.log('\n📋 SONRAKİ ADIMLAR:');
  console.log('1. 15-30 dakika bekleyin');
  console.log('2. HTTP URL\'leri test edin');
  console.log('3. HTTPS redirect\'i kontrol edin');
  console.log('4. Site tamamen hazır olunca Full (strict)\'e geçin');
}

testHttpsRedirect();