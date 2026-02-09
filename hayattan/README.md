# Hayattan.Net

Modern, güvenli ve SEO-friendly haber ve içerik yönetim platformu. Next.js 15, React 19, TypeScript ve PostgreSQL ile geliştirilmiştir.

## 🚀 Özellikler

### İçerik Yönetimi (CMS)
- ✅ **WYSIWYG Rich Text Editor** - Tiptap tabanlı, Word/Google Docs uyumlu
- ✅ **Görsel Yökleme Sistemi** - Drag & drop, Uploadthing entegrasyonu, 4MB limit
- ✅ **Önizleme Modu** - Yayınlamadan önce içeriği görüntüleme
- ✅ **Kategori & Yazar Yönetimi** - Esnek içerik organizasyonu
- ✅ **Slider Yönetimi** - Ana sayfa karouseli

### SEO & Sosyal Medya
- ✅ **Open Graph Tags** - Facebook, LinkedIn paylaşımları için optimize
- ✅ **Twitter Cards** - Twitter paylaşım kartları
- ✅ **Schema.org Article Markup** - Google Rich Results desteği
- ✅ **Custom Meta Tags** - Yazı bazında SEO optimizasyonu
- ✅ **Sitemap & Robots.txt** - Arama motoru optimizasyonu

### Güvenlik
- ✅ **Rate Limiting** - Redis (Vercel KV) tabanlı dağıtık rate limiting
- ✅ **Input Sanitization** - DOMPurify & Zod ile XSS koruması
- ✅ **Password Policies** - Güçlü şifre gereksinimleri
- ✅ **Security Headers** - CSP, HSTS, Permissions-Policy
- ✅ **Security Event Logging** - Şüpheli aktivite takibi
- ✅ **Authentication** - NextAuth v5 ile güvenli oturum yönetimi

### Performans
- ✅ **Server-Side Rendering (SSR)** - Next.js App Router
- ✅ **Image Optimization** - Next.js Image + Uploadthing
- ✅ **Database Indexing** - Optimize edilmiş Prisma sorguları
- ✅ **Caching** - ISR (Incremental Static Regeneration)

## 📋 Teknoloji Stack

| Kategori | Teknoloji |
|----------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript 5.x |
| **UI Library** | React 19 |
| **Styling** | Tailwind CSS |
| **Database** | PostgreSQL |
| **ORM** | Prisma 7.x |
| **Authentication** | NextAuth v5 |
| **File Upload** | Uploadthing |
| **Rate Limiting** | Vercel KV (Upstash Redis) |
| **Rich Text Editor** | Tiptap |
| **Sanitization** | DOMPurify, Zod |

## 🛠️ Kurulum

### Gereksinimler

- Node.js 18.x veya üzeri
- PostgreSQL 14 veya üzeri
- npm veya yarn

### 1. Repository'yi Klonlayın

```bash
git clone https://github.com/yourusername/hayattan.git
cd hayattan
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Environment Variables

`.env.example` dosyasını `.env` olarak kopyalayın ve gerekli değerleri doldurun:

```bash
cp .env.example .env
```

**Zorunlu Environment Variables:**

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/hayattan"

# NextAuth
AUTH_SECRET="your-secret-key-min-32-characters"
NEXTAUTH_URL="http://localhost:3000"

# Uploadthing (Görsel Yükleme)
UPLOADTHING_SECRET="sk_live_..."
UPLOADTHING_APP_ID="..."

# Vercel KV (Rate Limiting - Opsiyonel Development'ta)
KV_REST_API_URL="https://..."
KV_REST_API_TOKEN="..."
```

### 4. Database Setup

```bash
# Prisma migration
npx prisma db push

# Seed database (opsiyonel)
npx prisma db seed
```

### 5. Development Server'ı Başlatın

```bash
npm run dev
```

Tarayıcıda http://localhost:3000 adresini açın.

### 6. Admin Paneli

İlk admin kullanıcısını oluşturmak için:

```bash
npx prisma studio
```

Prisma Studio'da `User` tablosuna manuel olarak admin kullanıcı ekleyin veya seed script'ini kullanın.

Admin paneli: http://localhost:3000/admin

## 📁 Proje Yapısı

```
hayattan/
├── prisma/
│   ├── schema.prisma          # Database şeması
│   └── seed.ts                # Seed data
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── admin/             # Admin panel routes
│   │   │   ├── (dashboard)/   # Dashboard layout
│   │   │   ├── actions.ts     # Server actions
│   │   │   └── login/         # Admin giriş
│   │   ├── api/               # API routes
│   │   │   └── uploadthing/   # File upload API
│   │   ├── yazilar/           # Public article pages
│   │   ├── yazarlar/          # Author pages
│   │   ├── kategoriler/       # Category pages
│   │   └── layout.tsx         # Root layout
│   ├── components/
│   │   ├── admin/             # Admin-specific components
│   │   └── ...                # Public components
│   ├── lib/
│   │   ├── auth.ts            # Authentication config
│   │   ├── db.ts              # Prisma client
│   │   ├── seo.ts             # SEO utilities
│   │   ├── sanitize.ts        # Input sanitization
│   │   ├── rate-limit.ts      # Rate limiting
│   │   ├── password-validator.ts
│   │   ├── security-logger.ts
│   │   └── uploadthing.ts     # Upload helpers
│   └── middleware.ts          # Next.js middleware
├── public/                    # Static assets
├── .env.example               # Environment template
├── next.config.ts             # Next.js config
├── tailwind.config.ts         # Tailwind config
├── tsconfig.json              # TypeScript config
└── package.json
```

## 🔐 Güvenlik

Detaylı güvenlik dokümantasyonu için: [SECURITY.md](./SECURITY.md)

### Öne Çıkan Güvenlik Özellikleri

1. **Rate Limiting** - Brute force koruması
2. **Input Sanitization** - XSS ve injection saldırılarına karşı
3. **Security Headers** - CSP, HSTS, Permissions-Policy
4. **Password Policies** - Güçlü şifre zorunluluğu
5. **Security Logging** - Tüm güvenlik olayları loglanır

## 🚀 Production Deployment

### Hızlı Başlangıç

**Sıfırdan production'a:** [QUICK_START.md](./QUICK_START.md)

### Detaylı Deployment Guide

[DEPLOYMENT.md](./DEPLOYMENT.md) dosyasında:
- Vercel deployment
- Database seçenekleri (Vercel Postgres, Supabase, Railway)
- Redis setup (Vercel KV)
- Custom domain
- Monitoring & Analytics

**Önemli Environment Variables (Production):**

```env
AUTH_SECRET=          # Güçlü random string
DATABASE_URL=         # Production database URL
UPLOADTHING_SECRET=   # Uploadthing API key
UPLOADTHING_APP_ID=   # Uploadthing App ID
KV_REST_API_URL=      # Vercel KV URL
KV_REST_API_TOKEN=    # Vercel KV token
NEXT_PUBLIC_SITE_URL= # https://hayattan.net
```

## 🧪 Testing

**Test durumu:** Test altyapısı hazır değil (gelecekte eklenecek)

**Manuel test checklist:**
- Admin giriş/çıkış
- Yazı oluşturma/düzenleme/silme
- Görsel yükleme
- Public sayfalar

Detaylar: [TESTING.md](./TESTING.md)

## 🐛 Sorun Giderme

Yaygın sorunlar ve çözümleri: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

**Sık hatalar:**
- Prisma generate hataları
- Environment variable eksiklikleri
- Database bağlantı sorunları
- Rate limiting (429) hataları

## 📊 Yedekleme & İzleme

- **Yedekleme stratejisi:** [docs/BACKUP.md](./docs/BACKUP.md)
- **Error tracking & monitoring:** [docs/MONITORING.md](./docs/MONITORING.md)

## 📖 API Dokümantasyonu

### Server Actions

Admin panel'de kullanılan tüm server actions `src/app/admin/actions.ts` dosyasında tanımlıdır:

- `createYazi()` - Yeni yazı oluşturma
- `updateYazi()` - Yazı güncelleme
- `deleteYazi()` - Yazı silme
- `createKategori()` - Kategori oluşturma
- `createYazar()` - Yazar oluşturma
- ve daha fazlası...

## 🤝 Katkıda Bulunma

Detaylı bilgi için: [CONTRIBUTING.md](./CONTRIBUTING.md)

1. Fork'layın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit'leyin (`git commit -m 'feat: add amazing feature'`)
4. Push'layın (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 👥 Ekip

- **Lead Developer** - [Enes Can Kotay](https://github.com/yourusername)

## 🙏 Teşekkürler

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [Uploadthing](https://uploadthing.com/)
- [Tiptap](https://tiptap.dev/)

## 📮 İletişim

Sorularınız için: [email@example.com](mailto:email@example.com)

---

**Made with ❤️ for the Turkish journalism community**
