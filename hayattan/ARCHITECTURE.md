# Hayattan.Net - Architecture Documentation

Bu doküman, Hayattan.Net projesinin mimari yapısını, veri akışını ve tasarım kararlarını açıklar.

## 📐 Mimari Genel Bakış

Hayattan.Net, **Server-Side Rendering (SSR)** ve **Server Actions** ile modern bir **monolithic architecture** kullanır.

```
┌─────────────────────────────────────────────────┐
│              Browser (Client)                    │
│  ┌──────────────┐        ┌──────────────────┐   │
│  │ Public Pages │        │  Admin Dashboard │   │
│  └──────┬───────┘        └────────┬─────────┘   │
│         │                         │             │
└─────────┼─────────────────────────┼─────────────┘
          │                         │
          ▼                         ▼
┌─────────────────────────────────────────────────┐
│           Next.js 15 (App Router)                │
│  ┌──────────────┐        ┌──────────────────┐   │
│  │ Server Pages │◄──────►│ Server Actions   │   │
│  └──────┬───────┘        └────────┬─────────┘   │
│         │                         │             │
│         ▼                         ▼             │
│  ┌──────────────────────────────────────────┐   │
│  │         Middleware Layer                 │   │
│  │  • Rate Limiting                         │   │
│  │  • Authentication                        │   │
│  │  • Security Logging                      │   │
│  └──────────────┬───────────────────────────┘   │
└─────────────────┼───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│              Business Logic                      │
│  ┌───────────┐  ┌──────────┐  ┌────────────┐    │
│  │ Prisma    │  │ Auth     │  │ SEO Utils  │    │
│  │ Client    │  │ (NextAuth│  │ Sanitize   │    │
│  └─────┬─────┘  └────┬─────┘  └────┬───────┘    │
└────────┼─────────────┼─────────────┼────────────┘
         │             │             │
         ▼             ▼             ▼
┌─────────────────────────────────────────────────┐
│           External Services                      │
│  ┌─────────────┐  ┌──────────────┐              │
│  │ PostgreSQL  │  │ Vercel KV    │              │
│  │  (Database) │  │ (Redis cache)│              │
│  └─────────────┘  └──────────────┘              │
│  ┌─────────────┐  ┌──────────────┐              │
│  │ Uploadthing │  │ NextAuth     │              │
│  │ (File CDN)  │  │ (Auth)       │              │
│  └─────────────┘  └──────────────┘              │
└─────────────────────────────────────────────────┘
```

## 🗂️ Folder Structure (Detaylı)

```
hayattan/
├── prisma/
│   ├── schema.prisma              # Database schema
│   ├── migrations/                # Database migrations
│   └── seed.ts                    # Seed script
│
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── admin/                 # Admin panel
│   │   │   ├── (dashboard)/       # Dashboard layout group
│   │   │   │   ├── yazilar/       # Articles management
│   │   │   │   ├── yazarlar/      # Authors management
│   │   │   │   ├── kategoriler/   # Categories management
│   │   │   │   └── haberler/      # News management
│   │   │   ├── login/             # Admin login page
│   │   │   └── actions.ts         # Server actions (CRUD)
│   │   │
│   │   ├── api/                   # API routes
│   │   │   └── uploadthing/       # File upload endpoints
│   │   │       ├── core.ts        # Upload configuration
│   │   │       └── route.ts       # Route handlers
│   │   │
│   │   ├── yazilar/               # Public article pages
│   │   │   ├── [slug]/            # Article detail
│   │   │   └── page.tsx           # Articles list
│   │   │
│   │   ├── yazarlar/              # Author pages
│   │   │   └── [slug]/            # Author profile
│   │   │
│   │   ├── kategoriler/           # Category pages
│   │   │   └── [slug]/            # Category articles
│   │   │
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Homepage
│   │   └── globals.css            # Global styles
│   │
│   ├── components/
│   │   ├── admin/                 # Admin-specific components
│   │   │   ├── YaziForm.tsx       # Article form (reusable)
│   │   │   ├── ImageUpload.tsx    # Image upload widget
│   │   │   ├── RichTextEditor.tsx # WYSIWYG editor
│   │   │   ├── FormField.tsx      # Form utilities
│   │   │   └── YayimlaSection.tsx # Publishing controls
│   │   │
│   │   ├── Header.tsx             # Site header
│   │   ├── Footer.tsx             # Site footer
│   │   ├── AdSlot.tsx             # Ad placement component
│   │   └── ...                    # Other components
│   │
│   ├── lib/                       # Utilities & configurations
│   │   ├── auth.ts                # NextAuth configuration
│   │   ├── db.ts                  # Prisma client instance
│   │   ├── seo.ts                 # SEO utilities (metadata, schema.org)
│   │   ├── sanitize.ts            # Input sanitization (DOMPurify, Zod)
│   │   ├── rate-limit.ts          # Rate limiting logic
│   │   ├── password-validator.ts  # Password validation
│   │   ├── security-logger.ts     # Security event logging
│   │   ├── uploadthing.ts         # Upload helpers
│   │   ├── env-validator.ts       # Environment validation
│   │   └── utils.ts               # General utilities
│   │
│   └── middleware.ts              # Next.js middleware (auth, rate limit)
│
├── public/                        # Static assets
│   ├── images/
│   └── ...
│
├── .env.example                   # Environment template
├── next.config.ts                 # Next.js config (headers, redirects)
├── tailwind.config.ts             # Tailwind configuration
├── tsconfig.json                  # TypeScript config
├── package.json                   # Dependencies
├── README.md                      # Project overview
├── CONTRIBUTING.md                # Contribution guide
└── ARCHITECTURE.md                # This file
```

## 🔄 Veri Akışı

### 1. Public Page Request (SSR)

```
User Request → Next.js Server → Prisma Query → PostgreSQL
                     ↓
              Generate HTML with data
                     ↓
              Send to browser (SSR)
```

**Örnek:** Yazı detay sayfası (`/yazilar/[slug]`)

1. User `/yazilar/ekonomi-gundem` ziyaret eder
2. Next.js Server `generateMetadata()` çalıştırır (SEO)
3. Prisma ile database'den yazı çekilir
4. HTML render edilir (Server-side)
5. Browser'a gönderilir

### 2. Admin Action (Server Actions)

```
User Action (Form Submit) → Server Action → Validation (Zod)
                                   ↓
                            Sanitization (DOMPurify)
                                   ↓
                            Prisma Mutation → PostgreSQL
                                   ↓
                            Revalidate Paths
                                   ↓
                            Redirect to list page
```

**Örnek:** Yeni yazı oluşturma

1. Admin formu doldurur ve submit eder
2. `createYazi()` server action çağrılır
3. Form data validate edilir (Zod schemas)
4. HTML sanitize edilir (DOMPurify)
5. Prisma ile database'e insert
6. İlgili path'ler revalidate edilir (`/`, `/yazilar`, etc.)
7. Admin `/admin/yazilar` sayfasına redirect

### 3. File Upload (Uploadthing)

```
User selects file → Client-side validation (size, type)
                          ↓
                   Upload to Uploadthing CDN
                          ↓
                   Middleware: Auth check
                          ↓
                   Return URL to client
                          ↓
                   Store URL in form state
```

## 🔐 Security Architecture

### Authentication Flow

```
Login Request → NextAuth → Credentials Provider
                    ↓
            Database User Lookup (Prisma)
                    ↓
            bcrypt Password Verify
                    ↓
            Generate Session Token
                    ↓
            Store in Cookie (httpOnly, secure)
```

### Rate Limiting

```
Request → Middleware → checkRateLimit(IP, type)
                            ↓
                    Vercel KV (Redis)
                     ┌──────┴──────┐
                     │             │
               Rate exceeded?   Allowed
                     │             │
                     ▼             ▼
              Block (429)    Continue to handler
```

**Rate Limit Tiers:**
- Login: 5 attempts / 15 min
- API: 100 requests / min
- Admin: 200 requests / min

### Input Sanitization

```
User Input → Zod Schema Validation
                  ↓
          DOMPurify HTML Sanitization
                  ↓
          Safe to store in DB
```

## 📊 Database Schema (Özet)

```sql
┌─────────┐       ┌─────────┐       ┌──────────┐
│  User   │       │  Yazar  │───┐   │ Kategori │
└────┬────┘       └────┬────┘   │   └────┬─────┘
     │                 │        │        │
     │                 │        │        │
     │            ┌────▼────┐   │   ┌────▼─────┐
     │            │  Yazi   │◄──┴───│ _Yazi    │
     │            │         │       │ Kategori │
     │            └─────────┘       └──────────┘
     │
┌────▼────────┐
│ SecurityLog │
└─────────────┘
```

**Ana Tablolar:**
- `User` - Admin kullanıcıları
- `Yazar` - Yazarlar (içerik oluşturucuları)
- `Kategori` - İçerik kategorileri
- `Yazi` - Makaleler/yazılar (SEO fields ile)
- `Haber` - Slider haberleri
- `SecurityLog` - Güvenlik olayları

## 🎨 Component Architecture

### Component Hierarchy

```
RootLayout
  ├── Header
  │   ├── Navigation
  │   └── Logo
  ├── Page Content
  │   ├── ServerComponent (default)
  │   └── ClientComponent ("use client")
  └── Footer

Admin Layout
  ├── AdminHeader
  ├── Sidebar
  ├── Dashboard Content
  │   └── YaziForm (Client)
  │       ├── RichTextEditor (Client)
  │       ├── ImageUpload (Client)
  │       └── YayimlaSection (Client)
  └── AdminFooter
```

### Server vs Client Components

**Server Components (default):**
- Database queries
- SEO metadata generation
- Layout components
- Static content

**Client Components (`"use client"`):**
- Interactive forms
- WYSIWYG editor
- Image upload
- State management

## 🚀 Performance Optimizations

### 1. ISR (Incremental Static Regeneration)

```typescript
export const revalidate = 60; // Revalidate every 60 seconds
```

Ana sayfa ve yazı listeleri 60 saniyede bir yenilenir.

### 2. Database Indexing

```prisma
model Yazi {
  // ...
  @@index([slug])
  @@index([publishedAt])
  @@index([authorId])
}
```

Sık sorgulanan alanlar index'lenir.

### 3. Parallel Queries

```typescript
const [users, posts, categories] = await Promise.all([
  prisma.user.findMany(),
  prisma.post.findMany(),
  prisma.category.findMany(),
]);
```

### 4. Image Optimization

- Next.js Image component
- Uploadthing automatic WebP conversion
- Lazy loading

## 📱 Responsive Design

Mobile-first approach:
- Tailwind CSS breakpoints
- Flexible grid system
- Touch-friendly UI

## 🧪 Testing Strategy

### Type Safety
- TypeScript strict mode
- Prisma generated types
- Zod runtime validation

### Development Testing
- `npm run type-check`
- `npm run lint`
- `npm run build`

## 🚢 Deployment Architecture

### Vercel (Production)

```
GitHub Push → Vercel Build
                   ↓
              Next.js Build
                   ↓
         ┌─────────┴─────────┐
         │                   │
    Edge Functions    Serverless Functions
         │                   │
         └─────────┬─────────┘
                   ↓
           Vercel Edge Network (CDN)
                   ↓
           End Users
```

**External Services:**
- Database: Vercel Postgres / Supabase
- KV Store: Vercel KV (Redis)
- File Storage: Uploadthing CDN
- Auth: NextAuth.js

## 📚 Key Design Decisions

### 1. Neden Server Actions?

- Type-safe RPC
- Otomatik form handling
- Revalidation kolaylığı
- Client-side JS minimize

### 2. Neden Prisma?

- Type-safe queries
- Migration management
- Great DX
- PostgreSQL optimization

### 3. Neden Uploadthing?

- Next.js integration
- Otomatik optimization
- Free tier (2GB)
- Simple API

### 4. Neden Vercel KV?

- Edge-compatible
- Dağıtık rate limiting
- Low latency
- Vercel entegrasyonu

## 🔮 Future Improvements

- [ ] E2E testing (Playwright)
- [ ] Analytics dashboard
- [ ] Comment system
- [ ] Multi-language support
- [ ] PWA support

---

**Last Updated:** 2026-02-03  
**Maintainer:** Enes Can Kotay
