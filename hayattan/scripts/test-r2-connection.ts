import { config } from 'dotenv';
import { S3Client, PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

// Load environment variables
config({ path: '.env.local' });

// Create R2 client
const r2 = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
});

async function testR2Connection() {
  try {
    console.log('🔍 CLOUDFLARE R2 BAĞLANTISINI TEST EDİYORUZ...\n');
    
    // Environment variables'ları kontrol et
    console.log('📋 ENVIRONMENT VARIABLES:');
    console.log(`   R2_ACCOUNT_ID: ${process.env.R2_ACCOUNT_ID ? '✅ Var' : '❌ Yok'}`);
    console.log(`   R2_ACCESS_KEY_ID: ${process.env.R2_ACCESS_KEY_ID ? '✅ Var' : '❌ Yok'}`);
    console.log(`   R2_SECRET_ACCESS_KEY: ${process.env.R2_SECRET_ACCESS_KEY ? '✅ Var' : '❌ Yok'}`);
    console.log(`   R2_BUCKET_NAME: ${process.env.R2_BUCKET_NAME || '❌ Yok'}`);
    console.log(`   R2_ENDPOINT: ${process.env.R2_ENDPOINT || '❌ Yok'}`);
    console.log(`   R2_PUBLIC_BASE_URL: ${process.env.R2_PUBLIC_BASE_URL || '❌ BOŞ!'}`);
    
    if (!process.env.R2_PUBLIC_BASE_URL) {
      console.log('\n⚠️ R2_PUBLIC_BASE_URL eksik! Bu olmadan yüklenen dosyalar görüntülenemez.');
      console.log('   Cloudflare Dashboard\'dan public URL\'yi alıp Vercel\'e eklememiz gerekiyor.');
    }
    
    // R2 bağlantısını test et
    console.log('\n🔗 R2 BAĞLANTISI TEST EDİLİYOR...');
    
    try {
      const listCommand = new ListObjectsV2Command({
        Bucket: process.env.R2_BUCKET_NAME!,
        MaxKeys: 5
      });
      
      const response = await r2.send(listCommand);
      
      console.log('✅ R2 bağlantısı başarılı!');
      console.log(`📊 Bucket'ta ${response.KeyCount || 0} dosya bulundu`);
      
      if (response.Contents && response.Contents.length > 0) {
        console.log('\n📁 ÖRNEK DOSYALAR:');
        response.Contents.slice(0, 3).forEach((obj, index) => {
          console.log(`   ${index + 1}. ${obj.Key} (${Math.round((obj.Size || 0) / 1024)} KB)`);
        });
      }
      
    } catch (error: any) {
      console.log('❌ R2 bağlantı hatası:', error.message);
      return;
    }
    
    // Test dosyası yüklemeyi dene
    console.log('\n🧪 TEST DOSYASI YÜKLEME...');
    
    try {
      const testContent = `Test dosyası - ${new Date().toISOString()}`;
      const testKey = `test/connection-test-${Date.now()}.txt`;
      
      const putCommand = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: testKey,
        Body: testContent,
        ContentType: 'text/plain',
        CacheControl: 'public, max-age=31536000'
      });
      
      await r2.send(putCommand);
      
      console.log('✅ Test dosyası başarıyla yüklendi!');
      console.log(`📄 Dosya: ${testKey}`);
      
      if (process.env.R2_PUBLIC_BASE_URL) {
        const publicUrl = `${process.env.R2_PUBLIC_BASE_URL}/${testKey}`;
        console.log(`🌐 Public URL: ${publicUrl}`);
        console.log('   Bu URL\'yi tarayıcıda açarak test edebilirsiniz.');
      } else {
        console.log('⚠️ Public URL oluşturulamadı (R2_PUBLIC_BASE_URL eksik)');
      }
      
    } catch (error: any) {
      console.log('❌ Test dosyası yükleme hatası:', error.message);
    }
    
    // Cloudflare R2 kurulum adımlarını göster
    console.log('\n🔧 CLOUDFLARE R2 KURULUM ADIMLARı:');
    console.log('1. Cloudflare Dashboard\'a gidin: https://dash.cloudflare.com/');
    console.log('2. R2 Object Storage > Manage R2 API tokens');
    console.log('3. "hayattan-media" bucket\'ını bulun');
    console.log('4. Settings > Public access > Allow Access seçin');
    console.log('5. Custom domain ekleyin veya r2.dev domain\'ini kullanın');
    console.log('6. Public URL\'yi kopyalayın (örn: https://pub-xxx.r2.dev)');
    console.log('7. Vercel\'de R2_PUBLIC_BASE_URL environment variable\'ını ekleyin');
    
    console.log('\n💡 SONRAKI ADIMLAR:');
    console.log('1. R2_PUBLIC_BASE_URL\'yi Vercel\'e ekleyin');
    console.log('2. Vercel deployment\'ını yeniden başlatın');
    console.log('3. Admin panelinde resim yüklemeyi test edin');
    
  } catch (error) {
    console.error('❌ Test hatası:', error);
  }
}

testR2Connection();