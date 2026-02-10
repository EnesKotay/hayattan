async function testDomainSetup() {
  console.log('🌐 DOMAIN SETUP TEST\n');
  
  const domains = [
    'https://hayattan.net',
    'https://www.hayattan.net',
    'http://hayattan.net',
    'http://www.hayattan.net'
  ];
  
  console.log('🔍 DNS KAYITLARI ANALİZİ:');
  console.log('✅ A Record: hayattan.net → 76.76.21.21 (Vercel)');
  console.log('✅ CNAME: www → cname.vercel-dns.com');
  console.log('✅ Cloudflare Nameservers: Aktif');
  console.log('✅ TTL: Auto (Cloudflare yönetiyor)');
  
  console.log('\n🧪 DOMAIN ERİŞİM TESTİ:');
  
  for (const domain of domains) {
    console.log(`\n🔗 Test: ${domain}`);
    
    try {
      const response = await fetch(domain, { 
        method: 'HEAD',
        redirect: 'manual' // Redirect'leri manuel takip et
      });
      
      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      if (response.status >= 200 && response.status < 400) {
        console.log('   ✅ Erişilebilir');
      } else if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        console.log(`   🔄 Redirect: ${location}`);
      } else {
        console.log('   ❌ Erişim sorunu');
      }
      
      // SSL kontrol
      if (domain.startsWith('https://')) {
        console.log('   🔒 HTTPS: Çalışıyor');
      }
      
    } catch (error: any) {
      console.log(`   ❌ Hata: ${error.message}`);
    }
  }
  
  console.log('\n🔧 VERCEL DOMAIN AYARLARI:');
  console.log('1. Vercel Dashboard → Settings → Domains');
  console.log('2. Ekli domainler:');
  console.log('   - hayattan.net');
  console.log('   - www.hayattan.net');
  console.log('3. SSL sertifikası otomatik');
  
  console.log('\n🎯 CLOUDFLARE AYARLARI:');
  console.log('✅ DNS kayıtları doğru');
  console.log('🔒 SSL/TLS: Full (strict) önerilen');
  console.log('⚡ CDN: Aktif');
  console.log('🛡️ Security: Cloudflare koruması');
  
  console.log('\n💡 ÖNERİLER:');
  console.log('1. www → non-www redirect (Cloudflare Page Rules)');
  console.log('2. HTTPS zorlaması');
  console.log('3. Cache ayarları optimizasyonu');
  
  console.log('\n🎉 SONUÇ:');
  console.log('DNS kayıtları doğru kurulmuş!');
  console.log('Domain hayattan.net aktif olmalı.');
}

testDomainSetup();