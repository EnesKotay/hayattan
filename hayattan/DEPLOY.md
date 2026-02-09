# Hayattan.net — Canlı Site (Deploy) Rehberi

Bu proje Next.js + Node.js + PostgreSQL kullandığı için **Natro WordPress hostingte çalışmaz**. Projeyi gerçek sitede yayınlamak için aşağıdaki adımları izleyin.

---

## Genel akış

1. **Projeyi Vercel’e deploy edin** (Next.js için en kolay yol)
2. **PostgreSQL veritabanını bulutta açın** (Neon, Supabase veya Vercel Postgres)
3. **Vercel’de ortam değişkenlerini tanımlayın**
4. **hayattan.net domain’ini Vercel’e yönlendirin** (Natro’da DNS ayarı)

---

## Adım 1: Kodu GitHub’a atın (önerilir)

1. [GitHub](https://github.com) hesabı açın (yoksa).
2. Yeni bir repo oluşturun (örn. `hayattan-net`).
3. Proje klasöründe terminalde:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADINIZ/hayattan-net.git
git push -u origin main
```

(Git yüklemediyseniz [git-scm.com](https://git-scm.com) indirip kurun.)

---

## Adım 2: PostgreSQL’i bulutta açın

Proje PostgreSQL kullanıyor; canlıda da bir PostgreSQL veritabanı gerekir.

### Seçenek A: Neon (ücretsiz katman)

1. [neon.tech](https://neon.tech) → Sign up (GitHub ile giriş yapabilirsiniz).
2. Yeni proje oluşturun, **Connection string**’i kopyalayın (PostgreSQL URL).
3. Bu URL’yi hem `DATABASE_URL` hem `DIRECT_DATABASE_URL` için kullanacaksınız (Vercel’de aynı değeri iki kez gireceksiniz).

### Seçenek B: Supabase

1. [supabase.com](https://supabase.com) → Create project.
2. Project Settings → Database → **Connection string** (URI) kopyalayın.
3. Yine `DATABASE_URL` ve `DIRECT_DATABASE_URL` olarak aynı URL’yi kullanın.

### Seçenek C: Vercel Postgres

1. Vercel’e projeyi ekledikten sonra Dashboard → Storage → Create Database → Postgres.
2. Projeye bağlayın; Vercel otomatik `POSTGRES_URL` vb. ekler. Projemiz `DATABASE_URL` / `DIRECT_DATABASE_URL` bekliyor; eklenen değişken adını buna çevirin veya env’de `DATABASE_URL` = `POSTGRES_URL` yapın.

---

## Adım 3: Vercel’e deploy edin

1. [vercel.com](https://vercel.com) → Sign up (GitHub ile giriş önerilir).
2. **Add New** → **Project**.
3. **Import** ile GitHub repo’nuzu seçin (veya “Import third-party Git” ile başka Git).
4. Framework: **Next.js** (otomatik algılanır).
5. **Environment Variables** bölümüne geçin; aşağıdakileri ekleyin:

| Değişken | Açıklama | Örnek |
|----------|----------|--------|
| `DATABASE_URL` | PostgreSQL bağlantı URL’si | `postgresql://user:pass@host/db?sslmode=require` |
| `DIRECT_DATABASE_URL` | Aynı PostgreSQL URL (Prisma için) | Aynı değer |
| `AUTH_SECRET` | Gizli anahtar (32+ karakter) | `openssl rand -base64 32` ile üretin |
| `AUTH_URL` | Canlı site adresi | `https://hayattan.net` |
| `NEXT_PUBLIC_SITE_URL` | Site adresi (tarayıcıda) | `https://hayattan.net` |

6. **Deploy**’a tıklayın. İlk deploy birkaç dakika sürebilir.

Deploy bittikten sonra `https://PROJE_ADI.vercel.app` adresinde site çalışır.

---

## Adım 4: Veritabanı tablolarını oluşturun

Vercel deploy’u başarılı olduktan sonra, bir kez veritabanı şemasını canlı DB’ye uygulamanız gerekir.

**Yerel bilgisayarınızda** `.env` dosyasını **canlı veritabanı URL’si** ile güncelleyin (sadece bu komutlar için), sonra:

```bash
npm run db:push
```

veya migration kullanıyorsanız:

```bash
npx prisma migrate deploy
```

Bittikten sonra yerel `.env`’i tekrar kendi yerel DB’nize çevirebilirsiniz. Artık canlı sitede veritabanı kullanılır.

---

## Adım 5: hayattan.net’i Vercel’e bağlayın

1. Vercel Dashboard → projeniz → **Settings** → **Domains**.
2. **Add** → `hayattan.net` ve `www.hayattan.net` yazın, kaydedin.
3. Vercel size hangi kayıtları eklemeniz gerektiğini gösterecek (genelde şunlar):
   - **A record:** `76.76.21.21` (Vercel’in IP’si; Vercel’de yazan güncel değeri kullanın)
   - veya **CNAME:** `cname.vercel-dns.com` (www için)

4. **Natro**’da:
   - Müşteri girişi → Alan adları → **hayattan.net** → **DNS / Yönetim** (veya “DNS Düzenle”).
   - Vercel’in verdiği A veya CNAME kayıtlarını buraya ekleyin. Mevcut “A” veya “www” kayıtlarını Vercel’e yönlenecek şekilde değiştirin.
5. 5–60 dakika içinde DNS yayılır; Vercel otomatik SSL (HTTPS) verir.

---

## Opsiyonel: Rate limit (KV)

Rate limiting için Vercel KV kullanıyorsanız:

1. Vercel → Storage → **KV** → Create.
2. Projeye bağlayın; `KV_REST_API_URL` ve `KV_REST_API_TOKEN` otomatik eklenir.
3. Proje bu değişkenleri kullanır. Ekstra bir şey yapmanız gerekmez.

---

## Özet kontrol listesi

- [ ] Kod GitHub’da
- [ ] Neon / Supabase / Vercel Postgres’te PostgreSQL oluşturuldu
- [ ] Vercel’de proje oluşturuldu, env değişkenleri eklendi
- [ ] `DATABASE_URL`, `DIRECT_DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `NEXT_PUBLIC_SITE_URL` canlı değerlerle dolu
- [ ] `db:push` veya `migrate deploy` ile canlı veritabanı şeması uygulandı
- [ ] Vercel’de Domain olarak `hayattan.net` (ve isterseniz `www.hayattan.net`) eklendi
- [ ] Natro’da DNS, Vercel’e yönlendirildi

Bu adımlar tamamlandığında **bu dosya (projeniz) gerçek site olur**: hayattan.net adresi Vercel’deki Next.js sitenize gider.
