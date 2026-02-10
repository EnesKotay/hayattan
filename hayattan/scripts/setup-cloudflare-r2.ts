import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

async function setupCloudflareR2() {
  console.log('🔧 CLOUDFLARE R2 KURULUM REHBERİ\n');
  
  console.log('📋 MEVCUT AYARLAR:');
  console.log(`   Account ID: ${process.env.R2_ACCOUNT_ID}`);
  console.log(`   Bucket Name: ${process.env.R2_BUCKET_NAME}`);
  console.log(`   Endpoint: ${process.env.R2_ENDPOINT}`);
  console.log(`   Public URL: ${process.env.R2_PUBLIC_BASE_URL || 'YOK!'}`);
  
  console.log('\n🚀 CLOUDFLARE R2 KURULUM ADIMLARı:\n');
  
  console.log('1️⃣ CLOUDFLARE DASHBOARD\'A GİRİN:');
  console.log('   🌐 https://dash.cloudflare.com/');
  console.log('   📂 R2 Object Storage sekmesine gidin\n');
  
  console.log('2️⃣ BUCKET\'I KONTROL EDİN:');
  console.log('   📁 "hayattan-media" bucket\'ını bulun');
  console.log('   ⚙️ Bucket Settings\'e tıklayın\n');
  
  console.log('3️⃣ PUBLIC ACCESS AÇIN:');
  console.log('   🔓 "Public access" bölümünde "Allow Access" seçin');
  console.log('   🌐 "Connect a custom domain" veya "r2.dev subdomain" seçin\n');
  
  console.log('4️⃣ PUBLIC URL ALIN:');
  console.log('   📋 Public URL\'yi kopyalayın (örnek: https://pub-abc123.r2.dev)');
  console.log('   💾 Bu URL\'yi kaydedin\n');
  
  console.log('5️⃣ VERCEL\'E ENVIRONMENT VARIABLE EKLEYİN:');
  console.log('   🌐 https://vercel.com/dashboard');
  console.log('   📂 Hayattan projesini açın');
  console.log('   ⚙️ Settings > Environment Variables');
  console.log('   ➕ Add New Variable:');
  console.log('      Name: R2_PUBLIC_BASE_URL');
  console.log('      Value: [Cloudflare\'den aldığınız public URL]');
  console.log('      Environment: Production, Preview, Development (hepsini seçin)');
  console.log('   💾 Save\n');
  
  console.log('6️⃣ DEPLOYMENT\'I YENİLEYİN:');
  console.log('   🔄 Vercel\'de "Redeploy" butonuna tıklayın');
  console.log('   ⏱️ Deployment tamamlanana kadar bekleyin\n');
  
  console.log('7️⃣ TEST EDİN:');
  console.log('   🔐 Admin paneline gidin: https://hayattan-enes-can-kotays-projects.vercel.app/admin/giris');
  console.log('   📝 Yeni yazı oluşturun');
  console.log('   📸 Resim yüklemeyi deneyin\n');
  
  console.log('🔧 ALTERNATIF: LOCAL\'DE TEST İÇİN:');
  console.log('   📝 .env.local dosyasına ekleyin:');
  console.log('   R2_PUBLIC_BASE_URL="https://pub-[your-id].r2.dev"');
  console.log('   🔄 Local dev server\'ı yeniden başlatın: npm run dev\n');
  
  console.log('❓ SORUN ÇÖZME:');
  console.log('   🔍 R2 bucket public değilse → Settings > Public access > Allow');
  console.log('   🔍 URL çalışmıyorsa → Custom domain yerine r2.dev kullanın');
  console.log('   🔍 Vercel\'de görünmüyorsa → Environment variable\'ı tekrar ekleyin');
  console.log('   🔍 Hala çalışmıyorsa → Vercel deployment\'ını yenileyin\n');
  
  console.log('✅ BAŞARILI KURULUM SONRASI:');
  console.log('   📸 Admin panelinde resim yükleme çalışacak');
  console.log('   🖼️ Yüklenen resimler Cloudflare R2\'de saklanacak');
  console.log('   ⚡ Resimler CDN ile hızlı yüklenecek');
  console.log('   💰 Maliyet: Ücretsiz (10GB\'a kadar)');
  
  console.log('\n🎯 SONRAKİ ADIM: Cloudflare Dashboard\'a gidip public URL\'yi alın!');
}

setupCloudflareR2();