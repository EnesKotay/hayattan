# Deployment Guide

Hayattan.Net'i production'a deploy etmek için detaylı rehber.

## 🎯 Deployment Seçenekleri

### 1. Vercel (Önerilen) ⭐

**장점:**
- En kolay setup
- Otomatik CI/CD
- Integrated PostgreSQL (Vercel Postgres)
- Integrated Redis (Vercel KV)
- Global CDN
- Automatic HTTPS

---

## 🚀 Vercel Deployment

### Adım 1: Repository Hazırlama

```bash
# GitHub'a push edin
git add .
git commit -m "feat: ready for deployment"
git push origin main
```

### Adım 2: Vercel Import

1. https://vercel.com adresine gidin
2. "Add New Project" tıklayın
3. GitHub repository'nizi seçin
4. "Import" tıklayın

### Adım 3: Environment Variables

Vercel dashboard'da "Environment Variables" bölümüne gidin:

**Database:**
```env
DATABASE_URL=postgresql://...
```

> 💡 **Tip:** Vercel Postgres kullanıyorsanız, Storage → Postgres → Create Store → Connect

**Authentication:**
```env
AUTH_SECRET=your-super-secret-key-32-chars-min
NEXTAUTH_URL=https://yourdomain.vercel.app
```

> 🔑 Generate secret: `openssl rand -base64 32`

**Uploadthing:**
```env
UPLOADTHING_SECRET=sk_live_...
UPLOADTHING_APP_ID=...
```

**Vercel KV (Rate Limiting):**
```env
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...
```

> 💡 Storage → KV → Create Store → Copy credentials

**Site Config:**
```env
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_SITE_NAME=Hayattan.Net
```

### Adım 4: Deploy

"Deploy" butonuna tıklayın. Vercel otomatik olarak:
- Dependencies yükler
- TypeScript compile eder
- Next.js build yapar
- Deploy eder

**Build time:** ~3-5 dakika

### Adım 5: Database Setup

Vercel Dashboard → Storage → Postgres → SQL Editor:

```bash
# Prisma migration'ı çalıştırın
npx prisma migrate deploy

# Veya Vercel CLI ile:
vercel env pull .env
npx prisma db push
```

### Adım 6: Seed (Opsiyonel)

İlk admin kullanıcısı için:

```bash
npx prisma studio
```

veya SQL Editor'de:

```sql
INSERT INTO "User" (id, email, name, password)
VALUES (
  gen_random_uuid(),
  'admin@yourdomain.com',
  'Admin',
  -- bcrypt hash for "YourStrongPassword123!"
  '$2b$12$...'
);
```

---

## 🔧 Custom Domain

### Vercel'de Domain Ekleme

1. Vercel Dashboard → Settings → Domains
2. "Add Domain" tıklayın
3. Domain girin (örn: `hayattan.net`)
4. DNS kayıtlarını güncelleyin:

**A Record:**
```
Type: A
Name: @
Value: 76.76.21.21
```

**CNAME Record:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

5. SSL otomatik sağlanır (Let's Encrypt)

---

## 📊 Production Checklist

### Pre-deployment

- [ ] `package.json` dependencies güncellenmiş
- [ ] `npm run build` başarılı
- [ ] `npm run type-check` hatasız
- [ ] `.env` dosyası `.gitignore`'da
- [ ] Güvenlik headers ayarlanmış
- [ ] SEO metadata tamamlanmış

### Post-deployment

- [ ] Domain DNS propagate olmuş
- [ ] SSL certificate aktif
- [ ] Database migration başarılı
- [ ] Admin login çalışıyor
- [ ] File upload test edilmiş
- [ ] Rate limiting aktif
- [ ] Security headers test edilmiş

**Test Tools:**
- https://www.ssllabs.com/ssltest/
- https://securityheaders.com/
- https://observatory.mozilla.org/

---

## 🗄️ Database Options

### Vercel Postgres (Önerilen)

**장점:**
- Vercel entegrasyonu
- Auto-scaling
- Free tier: 256 MB storage

**Setup:**
```bash
# Vercel Dashboard
Storage → Postgres → Create Store

# Environment Variables otomatik eklenir:
# - DATABASE_URL
# - POSTGRES_URL
# - ...
```

### Supabase

**장점:**
- Generous free tier (500 MB)
- Built-in auth (optional)
- Real-time features

**Setup:**
```bash
# supabase.com → New project
# Database Settings → Connection String → Copy

# .env
DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"
```

### Railway

**장점:**
- PostgreSQL + Redis bundle
- Simple pricing

**Setup:**
```bash
# railway.app → New Project → Provision PostgreSQL
# Copy connection string to DATABASE_URL
```

---

## 🔴 Redis Setup (Rate Limiting)

### Vercel KV (Önerilen)

```bash
# Vercel Dashboard
Storage → KV → Create Store

# Environment Variables:
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...
```

### Upstash (Alternative)

```bash
# upstash.com → Create Database
# Copy REST API credentials

KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...
```

---

## 📁 File Storage

### Uploadthing (Mevcut)

Free tier:
- 2 GB storage
- 1 GB bandwidth/month

**Upgrade için:**
- https://uploadthing.com/dashboard
- Pro plan: $10/month (50 GB + 100 GB bandwidth)

### Alternative: Cloudinary

```env
# cloudinary.com account
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

Kod değişikliği gerekir.

---

## 🔍 Monitoring & Analytics

### Vercel Analytics

```bash
# package.json
npm install @vercel/analytics

# app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Google Analytics

```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

```tsx
// components/GoogleAnalytics.tsx
import Script from 'next/script';

export function GoogleAnalytics() {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
        `}
      </Script>
    </>
  );
}
```

---

## 🐛 Debugging Production

### Vercel Logs

```bash
# Vercel CLI install
npm install -g vercel

# Login
vercel login

# View logs
vercel logs
```

### Prisma Studio (Production)

```bash
# Local'de production DB'ye bağlan
# .env
DATABASE_URL="production-db-connection-string"

# Studio aç
npx prisma studio
```

⚠️ **Dikkat:** Production database'e dikkatli erişin!

---

## 🔄 CI/CD Pipeline

Vercel otomatik CI/CD sağlar:

```
Git Push → Vercel Detect → Build → Deploy
   ↓           ↓            ↓        ↓
 main      Preview URL   Success  Production
```

**Branch Deployments:**
- `main` → Production
- `dev` → Staging (preview)
- PRs → Preview URLs

---

## 💰 Cost Estimation

### Free Tier (Hobby)
- Vercel: Free
- Vercel Postgres: Free (256 MB)
- Vercel KV: Free (256 MB)
- Uploadthing: Free (2 GB)

**Total:** $0/month

### Production (Small Site)
- Vercel Pro: $20/month
- Vercel Postgres: Included
- Vercel KV: Included
- Uploadthing Pro: $10/month

**Total:** ~$30/month

---

## 📞 Support

Deployment sorunları için:
- Vercel Docs: https://vercel.com/docs
- Vercel Discord: https://vercel.com/discord
- GitHub Issues: https://github.com/your-repo/issues

---

**Good luck with your deployment! 🚀**
