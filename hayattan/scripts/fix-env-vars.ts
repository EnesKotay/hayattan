// Environment Variables Fix Script
// Run this to check and fix environment variables

const correctEnvVars = {
  DATABASE_URL: "postgresql://neondb_owner:npg_YMrE0JX7KGuw@ep-restless-dream-agchhfhf-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  DIRECT_DATABASE_URL: "postgresql://neondb_owner:npg_YMrE0JX7KGuw@ep-restless-dream-agchhfhf.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  AUTH_SECRET: "hayattan-net-super-secret-auth-key-2024-production-safe",
  AUTH_URL: "https://hayattan.vercel.app",
  NEXT_PUBLIC_SITE_URL: "https://hayattan.vercel.app",
  R2_ACCOUNT_ID: "b64dbc7490223c5a031edd426ddc8bc",
  R2_ACCESS_KEY_ID: "ae25266769e4cc8dbe2532cf80ea3cb7",
  R2_SECRET_ACCESS_KEY: "895ccaaf92417eb54b3e215e72837dd777457e1377e81cadd298df85b89d9d2a",
  R2_BUCKET_NAME: "hayattan-media",
  R2_ENDPOINT: "https://b64dbc7490223c5a031edd426ddc8bc.r2.cloudflarestorage.com",
  R2_PUBLIC_BASE_URL: "https://pub-8181f08d2c444b5eb2dea044781fbdaf.r2.dev"
};

console.log("🔧 Environment Variables Fix Guide");
console.log("==================================");
console.log("");
console.log("Vercel Dashboard'da şu environment variables'ları ekleyin/düzeltin:");
console.log("");

Object.entries(correctEnvVars).forEach(([key, value]) => {
  console.log(`${key}:`);
  console.log(`${value}`);
  console.log("");
});

console.log("🚨 ÖNEMLİ NOTLAR:");
console.log("1. DATABASE_URL'de newline karakteri olmamalı");
console.log("2. AUTH_SECRET en az 32 karakter olmalı");
console.log("3. Tüm URL'ler https:// ile başlamalı");
console.log("4. R2 credentials doğru olmalı");
console.log("");
console.log("✅ Bu değerleri Vercel Dashboard > Settings > Environment Variables'dan ekleyin");
console.log("🔄 Sonra yeni deployment tetikleyin: git commit --allow-empty && git push");