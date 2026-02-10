async function setupCustomCdnDomain() {
  console.log('🌐 CUSTOM CDN DOMAIN KURULUMU\n');
  
  console.log('❌ MEVCUT SORUN:');
  console.log('🚨 pub-xxx.r2.dev → ERR_CONNECTION_RESET');
  console.log('🚨 Public R2 domain güvenilmez');
  console.log('🚨 Production için uygun değil');
  
  console.log('\n✅ ÇÖZÜM: CUSTOM DOMAIN');
  console.log('🌐 cdn.hayattan.net → R2 bucket');
  console.log('🔒 Cloudflare SSL termination');
  console.log('⚡ Better performance & reliability');
  
  console.log('\n📋 KURULUM ADIMLARI:\n');
  
  console.log('1️⃣ CLOUDFLARE DASHBOARD - R2 CUSTOM DOMAIN:');
  console.log('🌐 Cloudflare Dashboard → R2 Object Storage');
  console.log('📁 hayattan-media bucket → Settings');
  console.log('🔗 Custom Domains → Add domain');
  console.log('📝 Domain: cdn.hayattan.net');
  console.log('💾 Save');
  
  console.log('\n2️⃣ DNS RECORD EKLEME:');
  console.log('🌐 Cloudflare Dashboard → DNS → Records');
  console.log('➕ Add record:');
  console.log('   Type: CNAME');
  console.log('   Name: cdn');
  console.log('   Target: hayattan-media.b64dbc7490223c5a031edd426ddc8bc.r2.cloudflarestorage.com');
  console.log('   Proxy: 🟠 Proxied (orange cloud)');
  
  console.log('\n3️⃣ SSL CERTIFICATE:');
  console.log('🔒 Cloudflare otomatik SSL certificate üretir');
  console.log('⏱️  5-10 dakika bekle');
  
  console.log('\n4️⃣ CODE UPDATE:');
  console.log('📝 Environment variables güncelle:');
  console.log('   R2_PUBLIC_BASE_URL="https://cdn.hayattan.net"');
  
  console.log('\n5️⃣ VERCEL ENV UPDATE:');
  console.log('🌐 Vercel Dashboard → Settings → Environment Variables');
  console.log('✏️  R2_PUBLIC_BASE_URL değerini güncelle:');
  console.log('   Eski: https://pub-8181f08d2c444b5eb2dea044781fbdaf.r2.dev');
  console.log('   Yeni: https://cdn.hayattan.net');
  console.log('🔄 Redeploy');
  
  console.log('\n🧪 TEST:');
  console.log('📸 Yeni upload yap');
  console.log('🌐 URL format: https://cdn.hayattan.net/uploads/...');
  console.log('✅ Çalışacak!');
  
  console.log('\n🎯 AVANTAJLAR:');
  console.log('✅ Güvenilir erişim');
  console.log('✅ Cloudflare SSL');
  console.log('✅ Edge caching');
  console.log('✅ Professional URL');
  console.log('✅ Production ready');
  
  console.log('\n⚡ HIZLI ALTERNATIVE:');
  console.log('Eğer custom domain kurmak istemezsen:');
  console.log('🔄 R2 bucket\'ı sil ve yeniden oluştur');
  console.log('🎲 Yeni pub-xxx.r2.dev URL al');
  console.log('⚠️  Ama custom domain daha iyi!');
  
  console.log('\n🚀 ÖNERİ:');
  console.log('Custom domain kur - production için şart! 🔥');
}

setupCustomCdnDomain();