async function dnsCnameSetupGuide() {
  console.log('🌐 DNS CNAME RECORD SETUP GUIDE\n');
  
  console.log('📋 CLOUDFLARE DNS RECORD AYARLARI:\n');
  
  console.log('🔧 ADD RECORD FORM:');
  console.log('┌─────────────────────────────────────────────────────┐');
  console.log('│ Type: CNAME                                         │');
  console.log('│ Name: cdn                                           │');
  console.log('│ Target: hayattan-media.b64dbc7490223c5a031edd426ddc8bc.r2.cloudflarestorage.com │');
  console.log('│ Proxy status: 🟠 Proxied (Orange Cloud)            │');
  console.log('│ TTL: Auto                                           │');
  console.log('└─────────────────────────────────────────────────────┘');
  
  console.log('\n📝 DETAYLI AÇIKLAMA:\n');
  
  console.log('1️⃣ TYPE (Tür):');
  console.log('   Dropdown\'dan "CNAME" seç');
  
  console.log('\n2️⃣ NAME (İsim):');
  console.log('   Sadece "cdn" yaz');
  console.log('   (hayattan.net otomatik eklenir)');
  console.log('   Sonuç: cdn.hayattan.net');
  
  console.log('\n3️⃣ TARGET (Hedef):');
  console.log('   Bu uzun adresi tam olarak kopyala:');
  console.log('   hayattan-media.b64dbc7490223c5a031edd426ddc8bc.r2.cloudflarestorage.com');
  
  console.log('\n4️⃣ PROXY STATUS:');
  console.log('   🟠 Orange Cloud (Proxied) - AÇIK');
  console.log('   ⚠️  Gri bulut DEĞİL, turuncu bulut!');
  
  console.log('\n5️⃣ TTL:');
  console.log('   "Auto" bırak');
  
  console.log('\n✅ SAVE:');
  console.log('   "Save" butonuna bas');
  
  console.log('\n🎯 SONUÇ:');
  console.log('cdn.hayattan.net → R2 bucket');
  console.log('SSL certificate otomatik oluşur (5-10 dk)');
  
  console.log('\n📋 KONTROL:');
  console.log('DNS record eklendikten sonra:');
  console.log('□ Record listesinde görünüyor');
  console.log('□ Status: Active');
  console.log('□ Proxy: 🟠 Proxied');
  
  console.log('\n⏱️  BEKLEME SÜRESİ:');
  console.log('DNS propagation: 1-5 dakika');
  console.log('SSL certificate: 5-10 dakika');
  
  console.log('\n🧪 TEST:');
  console.log('https://cdn.hayattan.net → çalışacak');
  console.log('(SSL certificate hazır olduktan sonra)');
}

dnsCnameSetupGuide();