async function checkDeployment() {
  console.log('🔍 VERCEL DEPLOYMENT DURUMU KONTROL\n');
  
  console.log('❌ SORUN: Eski kod hala çalışıyor');
  console.log('🔗 Görülen URL: hayattan-media.b64dbc7490223c5a031edd426ddc8bc.r2.cloudflarestorage.com');
  console.log('📋 Bu: Eski presigned URL sistemi (SSL sorunu)');
  
  console.log('\n✅ BEKLENEN: Yeni server-side upload');
  console.log('🆕 Yeni endpoint: /api/r2/upload');
  console.log('📤 FormData ile upload');
  console.log('🔒 SSL sorunu yok');
  
  console.log('\n🕐 DEPLOYMENT ZAMANLAMA:');
  console.log('📤 Push time: ~5 dakika önce');
  console.log('⏱️ Vercel build time: 2-3 dakika');
  console.log('🌐 Cache clear time: 1-2 dakika');
  console.log('🎯 Toplam bekleme: 3-5 dakika');
  
  console.log('\n🔍 HEMEN KONTROL EDİN:');
  console.log('1. 🌐 Vercel Dashboard açın: https://vercel.com/dashboard');
  console.log('2. 📂 Hayattan projesi → Deployments');
  console.log('3. 🔍 En son deployment durumu:');
  console.log('   ✅ Ready → Deployment tamamlandı');
  console.log('   🔄 Building → Hala build ediliyor');
  console.log('   ❌ Error → Build hatası var');
  
  console.log('\n🚨 HIZLI ÇÖZÜM:');
  console.log('Eğer deployment tamamlandıysa:');
  console.log('1. 🔄 Hard refresh (Ctrl+Shift+F5)');
  console.log('2. 🌐 Incognito window deneyin');
  console.log('3. 🍪 Browser cache temizleyin');
  console.log('4. ⏱️ 2-3 dakika daha bekleyin');
  
  console.log('\n🧪 TEST URL:');
  console.log('Yeni API endpoint test:');
  console.log('https://hayattan-enes-can-kotays-projects.vercel.app/api/r2/upload');
  console.log('Sonuç:');
  console.log('✅ "Method Not Allowed" → Yeni kod aktif');
  console.log('❌ "404" → Henüz deploy olmamış');
  
  console.log('\n🎯 SONRAKI ADIM:');
  console.log('1. Vercel deployment durumunu kontrol edin');
  console.log('2. Ready ise hard refresh yapın');
  console.log('3. Resim yükleme tekrar deneyin');
  console.log('4. Sonucu bana söyleyin');
}

checkDeployment();