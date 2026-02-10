async function testProductionImages() {
  console.log('🌐 PRODUCTION SITE IMAGE TEST\n');
  
  const productionUrl = 'https://hayattan-enes-can-kotays-projects.vercel.app';
  
  console.log('🔍 ANA SAYFA KONTROLÜ:');
  
  try {
    const response = await fetch(productionUrl);
    const html = await response.text();
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      console.log('❌ Site erişilemez');
      return;
    }
    
    console.log('✅ Site erişilebilir');
    
    // HTML'de image tag'lerini ara
    const imageMatches = html.match(/<img[^>]*src="[^"]*"[^>]*>/g) || [];
    console.log(`\n📊 Bulunan img tag sayısı: ${imageMatches.length}`);
    
    if (imageMatches.length > 0) {
      console.log('\n🖼️ ÖRNEK IMG TAG\'LERİ:');
      imageMatches.slice(0, 3).forEach((img: any, index: number) => {
        console.log(`${index + 1}. ${img}`);
      });
    }
    
    // Next.js image URL'lerini ara
    const nextImageMatches = html.match(/_next\/image\?url=[^"&]*/g) || [];
    console.log(`\n🔧 Next.js image URL sayısı: ${nextImageMatches.length}`);
    
    if (nextImageMatches.length > 0) {
      console.log('\n⚙️ ÖRNEK NEXT.JS IMAGE URL\'LERİ:');
      nextImageMatches.slice(0, 3).forEach((url: any, index: number) => {
        const fullUrl = `${productionUrl}/${url}`;
        console.log(`${index + 1}. ${fullUrl}`);
      });
    }
    
    // hayattan.net URL'lerini ara
    const hayattanMatches = html.match(/https:\/\/hayattan\.net\/[^"']*/g) || [];
    console.log(`\n🌐 hayattan.net URL sayısı: ${hayattanMatches.length}`);
    
    if (hayattanMatches.length > 0) {
      console.log('\n📸 ÖRNEK HAYATTAN.NET URL\'LERİ:');
      hayattanMatches.slice(0, 3).forEach((url: any, index: number) => {
        console.log(`${index + 1}. ${url}`);
      });
    }
    
    // Son Yazılar bölümünü ara
    const sonYazilarMatch = html.match(/<section[^>]*>[\s\S]*?Son Yazılar[\s\S]*?<\/section>/);
    if (sonYazilarMatch) {
      console.log('\n✅ "Son Yazılar" bölümü bulundu');
      
      // Bu bölümde image tag'leri var mı?
      const sectionImages = sonYazilarMatch[0].match(/<img[^>]*>/g) || [];
      console.log(`   📊 Bu bölümde ${sectionImages.length} img tag var`);
      
      if (sectionImages.length === 0) {
        console.log('   ❌ Son Yazılar bölümünde hiç resim yok!');
        console.log('   🔍 Bu sorunun kaynağı olabilir');
      }
    } else {
      console.log('\n❌ "Son Yazılar" bölümü bulunamadı');
    }
    
  } catch (error: any) {
    console.log(`❌ Production test hatası: ${error.message}`);
  }
  
  console.log('\n💡 SONRAKİ ADIMLAR:');
  console.log('1. 🌐 Production site\'ı tarayıcıda açın');
  console.log('2. 🔧 Developer Tools > Console\'da error kontrol edin');
  console.log('3. 🖼️ Network tab\'da image request\'leri kontrol edin');
  console.log('4. 📱 Mobil ve desktop\'da test edin');
  console.log('5. 🔄 Hard refresh (Ctrl+F5) deneyin');
}

testProductionImages();