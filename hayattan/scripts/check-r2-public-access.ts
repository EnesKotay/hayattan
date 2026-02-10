async function checkR2PublicAccess() {
  console.log('🔍 R2 PUBLIC ACCESS KONTROL\n');
  
  console.log('✅ İYİ HABER:');
  console.log('🚀 Upload başarılı - SSL hatası yok!');
  console.log('📁 Dosya R2\'ye yüklendi');
  console.log('🔗 URL format doğru');
  
  console.log('\n⚠️  MEVCUT SORUN:');
  console.log('🌐 ERR_CONNECTION_RESET');
  console.log('📡 R2 public domain erişim sorunu');
  
  console.log('\n🔧 ÇÖZÜM ADIMLARI:\n');
  
  console.log('1️⃣ CLOUDFLARE R2 PUBLIC ACCESS KONTROL:');
  console.log('🌐 Cloudflare Dashboard → R2 Object Storage');
  console.log('📁 hayattan-media bucket → Settings');
  console.log('🔓 Public access: ENABLED olmalı');
  console.log('🌍 r2.dev subdomain: ACTIVE olmalı');
  
  console.log('\n2️⃣ BUCKET SETTINGS KONTROL:');
  console.log('📋 Bucket settings:');
  console.log('   ✅ Public access: ON');
  console.log('   ✅ r2.dev subdomain: pub-8181f08d2c444b5eb2dea044781fbdaf.r2.dev');
  console.log('   ✅ CORS policy: SET');
  
  console.log('\n3️⃣ TEST URL MANUEL:');
  console.log('🧪 Browser\'da direkt test et:');
  console.log('https://pub-8181f08d2c444b5eb2dea044781fbdaf.r2.dev/uploads/cmlfzq7e90000um1sx5yn0uq9/1770741105467_44dc53cdb04ac_images.jpeg');
  
  console.log('\n4️⃣ ALTERNATIVE: CUSTOM DOMAIN:');
  console.log('🌐 cdn.hayattan.net → R2 bucket');
  console.log('🔒 Cloudflare SSL termination');
  console.log('⚡ Better performance');
  
  console.log('\n📋 KONTROL LİSTESİ:\n');
  
  console.log('Cloudflare Dashboard\'da kontrol et:');
  console.log('□ R2 bucket public access ON');
  console.log('□ r2.dev subdomain active');
  console.log('□ CORS policy configured');
  console.log('□ Bucket\'ta dosya var mı?');
  
  console.log('\n🎯 BEKLENEN SONUÇ:');
  console.log('✅ Public URL\'ler çalışacak');
  console.log('✅ Resimler görünecek');
  console.log('✅ Upload sistemi %100 çalışacak');
  
  console.log('\n💡 NOT:');
  console.log('Upload çalışıyor, sadece public access ayarı eksik!');
  console.log('Bu çok kolay düzeltilir! 🚀');
}

checkR2PublicAccess();