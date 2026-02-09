# Sorun Giderme Kılavuzu

Bu dokümanda Hayattan.Net projesi ile ilgili sık karşılaşılan sorunlar ve çözümleri bulabilirsiniz.

---

## 🔴 Build ve Deploy Hataları

### Prisma Generate Hatası

**Semptom:**
```
Error: @prisma/client did not initialize yet
```

**Çözüm:**
```bash
# Prisma client'ı yeniden oluşturun
npx prisma generate

# Build tekrar deneyin
npm run build
```

---

### TypeScript Derleme Hatası

**Semptom:**
```
Type error: Property 'X' does not exist on type 'Y'
```

**Çözüm 1:** Prisma client güncel değil
```bash
npx prisma generate
npm run build
```

**Çözüm 2:** Type definitions eksik
```bash
npm install --save-dev @types/node @types/react @types/react-dom
```

---

### Next.js Build Timeout

**Semptom:**
```
Error: The build timed out (exceeded 45 minutes)
```

**Çözüm:**
- Vercel'de Pro plan'a upgrade edin (build limit: 45 dk → unlimited)
- Veya build optimize edin: `next.config.ts` → `swcMinify: true`

---

## 🔐 Environment Variable Hataları

### AUTH_SECRET Eksik

**Semptom:**
```
Error: AUTH_SECRET environment variable is not set
```

**Çözüm:**
```bash
# Lokal: .env dosyasına ekleyin
echo "AUTH_SECRET=$(openssl rand -base64 32)" >> .env

# Vercel: Dashboard → Settings → Environment Variables
# AUTH_SECRET = [generated value]
```

---

### DATABASE_URL Geçersiz

**Semptom:**
```
Error: Can't reach database server at localhost:5432
```

**Çözüm:**
```bash
# .env dosyasını kontrol edin
cat .env | grep DATABASE_URL

# Format: postgresql://user:password@host:5432/database
# Örnekler:
# Vercel Postgres: postgres://default:...@...us-east-1.postgres.vercel-storage.com:5432/verceldb
# Supabase: postgresql://postgres:...@db....supabase.co:5432/postgres
```

**Vercel'de:**
1. Storage → Postgres → Settings → .env.local
2. Copy → Paste to Vercel Environment Variables

---

### KV (Redis) Bağlantı Hatası

**Semptom:**
```
Warning: Rate limiting disabled (KV not available)
```

**Çözüm (Opsiyonel - Rate limiting için):**
```bash
# Vercel KV oluşturun
# Storage → KV → Create Store

# Variables otomatik eklenir:
# KV_REST_API_URL
# KV_REST_API_TOKEN
```

**Not:** KV yoksa rate limiting devre dışı kalır ama site çalışır.

---

##  🗄️ Database Hataları

### Prisma Migration Hatası

**Semptom:**
```
Error: Migration failed with exit code 1
```

**Çözüm:**
```bash
# Reset database (DİKKAT: Tüm data silinir!)
npx prisma migrate reset

# Veya sadece push (schema'yı zorla):
npx prisma db push --force-reset
```

**Production'da:**
```bash
# Sadece migrate deploy kullanın
npx prisma migrate deploy
```

---

### Tablo Bulunamadı Hatası

**Semptom:**
```
Error: Table "User" does not exist
```

**Çözüm:**
```bash
# Prisma migration çalıştırın
npx prisma db push

# Veya:
npx prisma migrate deploy
```

---

## 📸 File Upload Hataları

### Uploadthing Yükleme Başarısız

**Semptom:**
```
Error: Failed to upload file
```

**Çözüm 1:** API keys kontrol edin
```bash
# .env dosyasını kontrol edin
cat .env | grep UPLOADTHING

# UPLOADTHING_SECRET=sk_live_...
# UPLOADTHING_APP_ID=...
```

**Çözüm 2:** Uploadthing quota aşıldı
- https://uploadthing.com/dashboard → Usage
- Free tier: 2GB storage, 1GB bandwidth/month
- Upgrade gerekirse: Pro ($10/month)

---

### Görsel Yüklenmiyor (4MB Limit)

**Semptom:**
```
File size exceeds 4MB limit
```

**Çözüm:**
- Görseli compress edin: https://tinypng.com/
- Veya `src/lib/uploadthing.ts` → maxFileSize değiştirin (Uploadthing plan limitine dikkat)

---

## 🚫 Rate Limiting (429) Hataları

### Çok Fazla İstek

**Semptom:**
```
429 Too Many Requests
```

**Çözüm:**
```bash
# Vercel KV kuruluysa:
# → Rate limit ayarlarını düşürün: src/lib/rate-limit.ts

# KV kurulu değilse:
# → KV kurun (Storage → KV) veya rate limiting'i kaldırın
```

**Development'ta bypass:**
```env
# .env.local
NODE_ENV=development
```

---

## 🔒 Admin Panel Erişim Sorunları

### Admin Girişi Çalışmıyor

**Semptom:**
```
Invalid credentials
```

**Çözüm:**
```bash
# Kullanıcı var mı kontrol edin
npx prisma studio
# → User tablosuna bakın

# Yeni admin ekle (SQL):
INSERT INTO "User" (id, email, name, "passwordHash", role)
VALUES (
  gen_random_uuid(),
  'admin@example.com',
  'Admin',
  '$2b$12$...',  -- bcrypt hash
  'ADMIN'
);
```

**Bcrypt hash oluştur:**
- https://bcrypt-generator.com/
- Rounds: 12
- Password: İstediğiniz şifre

---

### Session Hatası

**Semptom:**
```
Error: No session found
```

**Çözüm:**
```bash
# AUTH_SECRET tekrar generate edin
openssl rand -base64 32

# .env ve Vercel'de güncelleyin
# Redeploy edin
```

---

## 🌐 Production Runtime Hataları

### 500 Internal Server Error

**Çözüm 1:** Vercel logs kontrol edin
```bash
# Vercel CLI
vercel logs

# Veya Vercel Dashboard:
# Project → Deployments → [Latest] → View Function Logs
```

**Çözüm 2:** Environment variables eksik
- Vercel Dashboard → Settings → Environment Variables
- Tüm zorunlu variables ekli mi?

---

### Memory Limit Aşıldı

**Semptom:**
```
Error: Function exceeded memory limit
```

**Çözüm:**
```javascript
// vercel.json
{
  "functions": {
    "api/**/*.ts": {
      "memory": 3008
    }
  }
}
```

**Not:** Vercel Pro gerektirir (Hobby: 1024MB, Pro: 3008MB)

---

## 🔍 SEO Sorunları

### Sitemap Görünmüyor

**URL:** `https://your-domain.com/sitemap.xml`

**Çözüm:**
```bash
# Lokal test
npm run dev
# → http://localhost:3000/sitemap.xml

# Production'da cache temizle
# Vercel Dashboard → Deployments → [Latest] → Redeploy
```

---

### Open Graph Tags Eksik

**Semptom:** Facebook/LinkedIn paylaşımlarında görsel veya açıklama yok

**Çözüm:**
1. Yazı düzenle → SEO alanlarını doldurun
2. OG validator test edin: https://www.opengraph.xyz/
3. Facebook debugger: https://developers.facebook.com/tools/debug/

---

## 📱 Performance Sorunları

### Sayfa Yavaş Yükleniyor

**Çözüm 1:** Images optimize edilmemiş
- Next.js Image component kullanın (`next/image`)
- Uploadthing otomatik optimize eder

**Çözüm 2:** Database slow query
```bash
# Prisma logs aktif edin
# src/lib/db.ts → log: ['query']

# Slow queries için index ekleyin (schema.prisma)
@@index([publishedAt])
@@index([slug])
```

**Çözüm 3:** Vercel Edge Cache
- ISR kullanın: `export const revalidate = 60` (60 saniye cache)

---

## 🆘 Hala Çözemediyseniz

1. **GitHub Issues:** https://github.com/yourusername/hayattan/issues
2. **Vercel Discord:** https://vercel.com/discord
3. **Prisma Discord:** https://pris.ly/discord

**Issue açarken ekleyin:**
- Hata mesajı (full stack trace)
- Environment (local/vercel/production)
- Steps to reproduce
- `package.json` versions
- Vercel logs (varsa)

---

**Sorun çözüldü mü? Bu dokümanı güncelleyin! 🎉**
