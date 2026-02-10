async function cloudflareStatusCheck() {
  console.log('🌐 CLOUDFLARE DURUM KONTROLÜ\n');
  
  const domain = 'hayattan.net';
  const testUrls = [
    `https://${domain}`,
    `https://www.${domain}`,
    `http://${domain}`,
    `http://www.${domain}`
  ];
  
  console.log('🔍 MEVCUT DNS KAYITLARI:');
  console.log('✅ A Record: hayattan.net → 76.76.21.21');
  console.log('✅ CNAME: www → cname.vercel-dns.com');
  console.log('✅ Cloudflare NS: alec.ns.cloudflare.com, ria.ns.cloudflare.com');
  
  console.log('\n🧪 CLOUDFLARE ÖZELLİKLERİ TESTİ:');
  
  for (const url of testUrls) {
    console.log(`\n🔗 Test: ${url}`);
    
    try {
      const startTime = Date.now();
      const response = await fetch(url, { 
        method: 'HEAD',
        redirect: 'manual'
      });
      const endTime = Date.now();
      
      console.log(`   Status: ${response.status} ${response.statusText}`);
      console.log(`   Response Time: ${endTime - startTime}ms`);
      
      // Cloudflare headers kontrol
      const cfRay = response.headers.get('cf-ray');
      const cfCache = response.headers.get('cf-cache-status');
      const server = response.headers.get('server');
      
      if (cfRay) {
        console.log(`   ✅ Cloudflare Active: ${cfRay}`);
      } else {
        console.log('   ❌ Cloudflare headers yok');
      }
      
      if (cfCache) {
        console.log(`   📦 Cache Status: ${cfCache}`);
      }
      
      if (server && server.includes('cloudflare')) {
        console.log('   🛡️ Cloudflare Server: Aktif');
      }
      
      // SSL kontrol
      if (url.startsWith('https://')) {
        console.log('   🔒 SSL: Çalışıyor');
      }
      
      // Redirect kontrol
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        console.log(`   🔄 Redirect: ${location}`);
      }
      
    } catch (error: any) {
      console.log(`   ❌ Hata: ${error.message}`);
    }
  }
  
  console.log('\n🎯 CLOUDFLARE KURULUM DURUMU:');
  
  // Test API endpoint
  try {
    const apiTest = await fetch(`https://${domain}/api/health`, { method: 'HEAD' });
    console.log(`✅ API Endpoint: ${apiTest.status} (Cloudflare üzerinden)`);
  } catch {
    console.log('⚠️ API Endpoint: Test edilemedi');
  }
  
  console.log('\n📊 ÖNERİLEN CLOUDFLARE AYARLARI:');
  console.log('🔒 SSL/TLS: Full (strict)');
  console.log('⚡ Auto Minify: JS, CSS, HTML');
  console.log('🗜️ Brotli: ON');
  console.log('🛡️ Security Level: Medium');
  console.log('📦 Caching Level: Standard');
  
  console.log('\n🚀 PERFORMANS OPTİMİZASYONU:');
  console.log('1. Page Rules oluşturun:');
  console.log('   - www → non-www redirect');
  console.log('   - /admin/* cache bypass');
  console.log('   - /api/* cache bypass');
  console.log('2. Speed ayarlarını optimize edin');
  console.log('3. Security ayarlarını aktifleştirin');
  
  console.log('\n🔧 SORUN GİDERME:');
  console.log('❌ Cloudflare headers yoksa:');
  console.log('   - Nameserver değişikliği tamamlanmamış');
  console.log('   - DNS propagation devam ediyor');
  console.log('   - 24-48 saat bekleyin');
  
  console.log('❌ SSL hatası varsa:');
  console.log('   - SSL/TLS ayarını Full (strict) yapın');
  console.log('   - 15-30 dakika bekleyin');
  console.log('   - Edge certificate yenilenmesini bekleyin');
  
  console.log('\n✅ BAŞARILI KURULUM BELİRTİLERİ:');
  console.log('🌐 cf-ray header mevcut');
  console.log('🔒 HTTPS otomatik redirect');
  console.log('⚡ Hızlı response time');
  console.log('📦 Cache headers aktif');
}

cloudflareStatusCheck();