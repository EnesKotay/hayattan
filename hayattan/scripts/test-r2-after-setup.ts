import { config } from 'dotenv';

config({ path: '.env.local' });

async function testR2AfterSetup() {
  console.log('🧪 CLOUDFLARE R2 KURULUM SONRASI TEST\n');
  
  // Environment variables kontrolü
  const r2PublicUrl = process.env.R2_PUBLIC_BASE_URL;
  
  console.log('📋 ENVIRONMENT VARIABLES:');
  console.log(`   R2_PUBLIC_BASE_URL: ${r2PublicUrl || '❌ YOK!'}`);
  
  if (!r2PublicUrl) {
    console.log('\n❌ R2_PUBLIC_BASE_URL henüz ayarlanmamış!');
    console.log('🔧 Cloudflare Dashboard\'dan public URL\'yi alıp .env.local\'e ekleyin:');
    console.log('   R2_PUBLIC_BASE_URL="https://pub-your-id.r2.dev"');
    return;
  }
  
  console.log('\n✅ R2_PUBLIC_BASE_URL ayarlandı!');
  
  // Test URL oluştur
  const testImageKey = 'uploads/test-image.jpg';
  const fullTestUrl = `${r2PublicUrl}/${testImageKey}`;
  
  console.log('\n🔗 TEST URL\'LERİ:');
  console.log(`   Base URL: ${r2PublicUrl}`);
  console.log(`   Test Image: ${fullTestUrl}`);
  
  // URL format kontrolü
  console.log('\n🌐 URL FORMAT KONTROLÜ:');
  
  if (r2PublicUrl.startsWith('https://')) {
    console.log('   ✅ HTTPS protokolü');
  } else {
    console.log('   ❌ HTTPS protokolü eksik');
  }
  
  if (r2PublicUrl.includes('r2.dev')) {
    console.log('   ✅ Cloudflare R2.dev domain');
  } else if (r2PublicUrl.includes('cloudflare')) {
    console.log('   ✅ Custom Cloudflare domain');
  } else {
    console.log('   ⚠️ Bilinmeyen domain format');
  }
  
  if (r2PublicUrl.endsWith('/')) {
    console.log('   ⚠️ URL sonda "/" var - bu sorun çıkarabilir');
    console.log('   💡 "/" olmadan kullanın: ' + r2PublicUrl.slice(0, -1));
  } else {
    console.log('   ✅ URL format doğru');
  }
  
  console.log('\n🎯 SONRAKİ ADIMLAR:');
  console.log('1. 🌐 Vercel\'e R2_PUBLIC_BASE_URL environment variable\'ını ekleyin');
  console.log('2. 🔄 Vercel deployment\'ını yenileyin');
  console.log('3. 📸 Admin panelinde resim yükleme test edin');
  console.log('4. 🖼️ Yüklenen resmin görüntülendiğini kontrol edin');
  
  console.log('\n✅ KURULUM TAMAMLANINCA:');
  console.log('📸 Admin panelinden yeni resimler yükleyebilirsiniz');
  console.log('🚀 Resimler Cloudflare CDN ile hızlı servis edilecek');
  console.log('💰 10GB\'a kadar ücretsiz kullanım');
  console.log('🌍 Global CDN ile dünya çapında hızlı erişim');
}

testR2AfterSetup();