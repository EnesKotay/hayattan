async function checkDeploymentStatus() {
  console.log('🔍 VERCEL DEPLOYMENT STATUS KONTROL\n');
  
  console.log('❌ SORUN: Hala eski presigned URL kullanılıyor');
  console.log('🔍 SEBEP: Deployment tamamlanmamış veya cache sorunu');
  
  console.log('\n🚨 HEMEN YAPILACAKLAR:');
  
  console.log('\n1️⃣ VERCEL DEPLOYMENT KONTROL:');
  console.log('   🌐 https://vercel.com/dashboard');
  console.log('   📂 Hayattan projesi → Deployments');
  console.log('   🔍 Son deployment durumu:');
  console.log('      ✅ Building → Devam ediyor');
  console.log('      ✅ Ready → Tamamlandı');
  console.log('      ❌ Error → Hata var');
  
  console.log('\n2️⃣ BROWSER CACHE TEMİZLE:');
  console.log('   🔄 Hard refresh: Ctrl+F5');
  console.log('   🗑️ Cache temizle: Ctrl+Shift+Del');
  console.log('   🌐 Incognito window deneyin');
  
  console.log('\n3️⃣ API ENDPOINT TEST:');
  console.log('   🧪 Yeni endpoint test:');
  console.log('   https://hayattan-enes-can-kotays-projects.vercel.app/api/r2/upload');
  console.log('   Beklenen: "Method Not Allowed" (POST gerekiyor)');
  
  console.log('\n4️⃣ MANUEL DEPLOYMENT RESTART:');
  console.log('   🔄 Vercel → Deployments → ... → Redeploy');
  console.log('   ⏱️ 2-3 dakika bekleyin');
  
  console.log('\n🎯 KONTROL LİSTESİ:');
  console.log('   [ ] Vercel deployment tamamlandı mı?');
  console.log('   [ ] Browser cache temizlendi mi?');
  console.log('   [ ] /api/r2/upload endpoint çalışıyor mu?');
  console.log('   [ ] Incognito mode\'da test edildi mi?');
  
  console.log('\n✅ BAŞARILI OLUNCA:');
  console.log('   🔄 Eski presigned URL kaybolacak');
  console.log('   📤 Yeni server-side upload çalışacak');
  console.log('   🖼️ Resim yükleme başarılı olacak');
  
  console.log('\n⚠️ HALA ÇALIŞMAZSA:');
  console.log('   1. 🔄 Vercel deployment\'ı force restart');
  console.log('   2. ⏱️ 5-10 dakika bekleyin');
  console.log('   3. 🌐 Tamamen yeni browser session açın');
  console.log('   4. 📋 Hata detaylarını tekrar kontrol edin');
}

checkDeploymentStatus();