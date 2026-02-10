import { config } from 'dotenv';
import { S3Client, ListObjectsV2Command, PutObjectCommand } from "@aws-sdk/client-s3";

// Load environment variables
config({ path: '.env.local' });

// Create R2 client with generic endpoint
const r2 = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
});

async function testGenericEndpoint() {
  console.log('🧪 GENERIC ENDPOINT TEST\n');
  
  console.log('🔗 ENDPOINT DEĞIŞIKLIĞI:');
  console.log(`   Yeni: ${process.env.R2_ENDPOINT}`);
  console.log('   Beklenen: https://r2.cloudflarestorage.com');
  
  try {
    console.log('\n📂 BUCKET LİSTELEME TESTİ...');
    
    const listCommand = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME!,
      MaxKeys: 3
    });
    
    const response = await r2.send(listCommand);
    
    console.log('✅ Generic endpoint çalışıyor!');
    console.log(`📊 Dosya sayısı: ${response.KeyCount || 0}`);
    
    if (response.Contents && response.Contents.length > 0) {
      console.log('\n📁 MEVCUT DOSYALAR:');
      response.Contents.forEach((obj, index) => {
        console.log(`   ${index + 1}. ${obj.Key} (${Math.round((obj.Size || 0) / 1024)} KB)`);
      });
    }
    
    // Test upload
    console.log('\n📤 TEST UPLOAD...');
    
    const testContent = `Generic endpoint test - ${new Date().toISOString()}`;
    const testKey = `test/generic-endpoint-${Date.now()}.txt`;
    
    const putCommand = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: testKey,
      Body: testContent,
      ContentType: 'text/plain'
    });
    
    await r2.send(putCommand);
    
    console.log('✅ Upload başarılı!');
    console.log(`📄 Test dosyası: ${testKey}`);
    
    const publicUrl = `${process.env.R2_PUBLIC_BASE_URL}/${testKey}`;
    console.log(`🌐 Public URL: ${publicUrl}`);
    
    console.log('\n🎉 SONUÇ: GENERIC ENDPOINT ÇALIŞIYOR!');
    console.log('✅ SSL handshake sorunu çözüldü');
    console.log('✅ R2 bağlantısı stabil');
    console.log('✅ Upload işlemi başarılı');
    
    console.log('\n🚀 SONRAKİ ADIM:');
    console.log('Vercel Environment Variables\'da R2_ENDPOINT güncellenmeli:');
    console.log('https://r2.cloudflarestorage.com');
    
  } catch (error: any) {
    console.error('❌ Generic endpoint hatası:', error.message);
    
    if (error.message.includes('SSL') || error.message.includes('TLS')) {
      console.log('🔧 Hala SSL sorunu var - alternatif çözüm gerekli');
    } else if (error.message.includes('credentials')) {
      console.log('🔧 Credential sorunu - R2 API keys kontrol edin');
    } else {
      console.log('🔧 Bilinmeyen hata - Cloudflare R2 durumu kontrol edin');
    }
  }
}

testGenericEndpoint();