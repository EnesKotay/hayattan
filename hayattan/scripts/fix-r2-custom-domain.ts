async function fixR2CustomDomain() {
  console.log('🔧 R2 CUSTOM DOMAIN FIX\n');
  
  console.log('❌ MEVCUT SORUN:');
  console.log('🚨 ERR_CONNECTION_RESET devam ediyor');
  console.log('🌐 DNS record var ama R2 bucket\'ta custom domain yok');
  
  console.log('\n✅ ÇÖZÜM: R2 BUCKET CUSTOM DOMAIN KURULUMU\n');
  
  console.log('📋 ADIMLAR:\n');
  
  console.log('1️⃣ CLOUDFLARE R2 BUCKET SETTINGS:');
  console.log('🌐 Cloudflare Dashboard → R2 Object Storage');
  console.log('📁 hayattan-media bucket → Settings');
  console.log('🔗 Custom Domains section');
  
  console.log('\n2️⃣ ADD CUSTOM DOMAIN:');
  console.log('➕ "Add Custom Domain" button');
  console.log('📝 Domain: cdn.hayattan.net');
  console.log('💾 Save');
  
  console.log('\n3️⃣ VERIFY CONNECTION:');
  console.log('⏱️  5-10 dakika bekle');
  console.log('🧪 Test: https://cdn.hayattan.net');
  
  console.log('\n🔧 ALTERNATIVE ÇÖZÜMLER:\n');
  
  console.log('ÇÖZÜM A - BUCKET YENİDEN OLUŞTUR:');
  console.log('🗑️  hayattan-media bucket\'ı sil');
  console.log('➕ Yeni bucket oluştur: hayattan-media-v2');
  console.log('🔄 Environment variables güncelle');
  console.log('⚡ Yeni pub-xxx.r2.dev URL al');
  
  console.log('\nÇÖZÜM B - UPLOADTHING\'E GERİ DÖN:');
  console.log('📝 Frontend\'i tekrar uploadthing\'e çevir');
  console.log('💰 Uploadthing free tier kullan');
  console.log('✅ %100 çalışır');
  
  console.log('\nÇÖZÜM C - VERCEL BLOB:');
  console.log('📦 Vercel Blob storage kullan');
  console.log('🔗 Native Vercel integration');
  console.log('✅ SSL sorun yok');
  
  console.log('\n🎯 ÖNERİ SIRASI:');
  console.log('1. R2 custom domain kurulumu dene');
  console.log('2. Çalışmazsa → Bucket yeniden oluştur');
  console.log('3. Hâlâ sorun varsa → Uploadthing\'e dön');
  
  console.log('\n💡 SONUÇ:');
  console.log('R2 bazen sorunlu, alternatif çözümler var! 🚀');
}

fixR2CustomDomain();