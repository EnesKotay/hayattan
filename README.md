<div align="center">
  <img src="public/og-image.jpg" alt="Hayattan.Net — Hayatın Engelsiz Tarafı" width="760" />

  # Hayattan.Net

  **Kültür, sanat, edebiyat ve engelsiz yaşama odaklanan modern yayın platformu.**

  [![Next.js](https://img.shields.io/badge/Next.js_16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React_19-61DAFB?logo=react&logoColor=111)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
  [![Prisma](https://img.shields.io/badge/Prisma_6-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
</div>

## Proje hakkında

Hayattan.Net, “Hayatın Engelsiz Tarafı” yaklaşımıyla yazıları, haberleri, yazarları ve görsel içerikleri tek bir yayın deneyiminde buluşturur. Okuyucu tarafındaki hızlı ve erişilebilir arayüz; içerik yönetimi, yazar rolleri, SEO araçları ve medya yükleme özelliklerine sahip yönetim paneliyle desteklenir.

## Öne çıkan özellikler

- Yazı, kategori, etiket, yazar, haber ve bağımsız sayfa yönetimi
- Ana sayfa manşeti, son yazılar, konu keşfi ve yazar vitrinleri
- Zengin metin editörü, görsel yükleme ve PDF desteği
- Admin ve yazar rolleriyle kimlik doğrulama
- Arama, arşiv, eski yazılar, Fotoğrafhane ve Bakış Dergisi bölümleri
- Koyu tema, klavye komut menüsü ve erişilebilirlik tercihleri
- RSS, sitemap, Open Graph ve yapılandırılmış veri desteği
- PWA kurulumu, okuma ilerlemesi ve duyarlı mobil tasarım
- WordPress içerik aktarımı ve yinelenen yazarları birleştirme araçları
- E-posta bülteni ve Resend entegrasyonu

## Teknoloji yığını

| Alan | Teknolojiler |
| --- | --- |
| Uygulama | Next.js 16 App Router, React 19, TypeScript 5 |
| Arayüz | Tailwind CSS 4, Framer Motion, Heroicons, Lucide |
| İçerik editörü | Tiptap 3 |
| Veri | PostgreSQL, Prisma 6, TanStack Query |
| Kimlik doğrulama | NextAuth 5, bcryptjs |
| Medya | Vercel Blob, UploadThing, S3 uyumlu depolama, Sharp |
| Test | Playwright, ESLint |

## Proje yapısı

```text
hayattan/
├── src/
│   ├── app/              # App Router sayfaları, API ve admin alanı
│   ├── components/       # Arayüz ve içerik bileşenleri
│   ├── hooks/            # İstemci hook'ları
│   └── lib/              # Veri, kimlik doğrulama ve yardımcı servisler
├── prisma/               # Şema, migrasyonlar ve yönetici oluşturma aracı
├── public/               # Logo, sosyal paylaşım ve PWA varlıkları
├── scripts/              # İçerik aktarımı ve bakım komutları
└── e2e/                  # Playwright uçtan uca testleri
```

## Hızlı başlangıç

### Gereksinimler

- Node.js 20 veya üzeri
- npm
- PostgreSQL

```bash
git clone https://github.com/EnesKotay/hayattan.git
cd hayattan
npm ci
cp .env.example .env
```

`.env` içinde en az aşağıdaki değerleri ayarlayın:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
DIRECT_DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
AUTH_SECRET="en-az-32-karakterlik-guclu-bir-anahtar"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

Veritabanını hazırlayıp geliştirme sunucusunu başlatın:

```bash
npm run db:generate
npm run db:migrate
npm run dev
```

Uygulama `http://localhost:3000` adresinde açılır.

### İlk yönetici hesabı

`.env` dosyasına `ADMIN_EMAIL`, `ADMIN_PASSWORD` ve isteğe bağlı `ADMIN_NAME` değerlerini ekledikten sonra:

```bash
npx tsx prisma/create-admin.ts
```

## Komutlar

| Komut | Açıklama |
| --- | --- |
| `npm run dev` | Geliştirme sunucusunu başlatır |
| `npm run build` | Prisma istemcisini üretir ve production build alır |
| `npm run lint` | ESLint kontrollerini çalıştırır |
| `npm run test:e2e` | Playwright testlerini çalıştırır |
| `npm run db:migrate` | Geliştirme migrasyonu oluşturur ve uygular |
| `npm run db:studio` | Prisma Studio’yu açar |
| `npm run import:wordpress` | WordPress içeriğini içe aktarır |

## Dağıtım

Proje Vercel dağıtımına hazırdır. Production ortamında PostgreSQL bağlantılarını, `AUTH_SECRET`, gerçek site adreslerini ve kullanılan medya/e-posta servislerinin anahtarlarını platformun Environment Variables bölümünde tanımlayın. Ardından veritabanı migrasyonlarını kontrollü biçimde uygulayın.

## Güvenlik

`.env` dosyasını, veritabanı bağlantılarını ve servis anahtarlarını Git’e eklemeyin. İlk yönetici parolasını üretim kullanımı öncesinde değiştirin. Kullanıcı tarafından girilen HTML, medya ve dış bağlantıları yayınlamadan önce mevcut doğrulama ve temizleme katmanlarından geçirin.

---

<div align="center">Hayattan.Net — Hayatın Engelsiz Tarafı</div>
