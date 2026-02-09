# Hayattan.net — Yayınlama Planı (Baştan Sona)

Bu dosya, projeyi **hiç yayınlamamış** biri için yazıldı. Neden bu adımları yaptığımızı ve nasıl yapacağımızı adım adım anlatıyor.

---

## 1. Neden böyle yayınlıyoruz?

**Şu an durum:** Kodunuz bilgisayarınızda. Sadece siz `npm run dev` ile görüyorsunuz. İnternetteki herkes **hayattan.net** yazınca sitenizi göremiyor.

**İstediğimiz:** hayattan.net adresine giren herkes sizin Next.js sitenizi görsün.

**Neden Natro’daki mevcut hosting yetmiyor?** Natro’da **WordPress Hosting** var. O sunucuda sadece **PHP + MySQL** çalışıyor. Sizin projeniz ise **Node.js + PostgreSQL** istiyor. Yani projenizi o sunucuya atsanız bile çalışmaz; farklı bir “motor” gerekiyor.

**Çözüm:** Projeyi **Node.js destekleyen** bir yere (Vercel) koyacağız, veritabanını da **bulutta** (Neon veya Supabase) açacağız. Alan adı (hayattan.net) Natro’da kalacak; sadece “bu adres şu sunucuya gitsin” diye yönlendireceğiz. Böylece hem kod doğru yerde çalışır hem de adres hayattan.net olur.

---

## 2. Yayınlama ne demek, kısaca?

- **Kod** = Sizin yazdığınız dosyalar (bilgisayarınızda).
- **Yayınlamak** = Bu kodu, 7/24 açık bir sunucuda çalıştırıp internete açmak.
- **Veritabanı** = Yazılar, yazarlar, kategoriler gibi veriler. Şu an bilgisayarınızda (PostgreSQL). Yayında da bu verilerin **bulutta** bir veritabanında durması lazım.
- **Alan adı (domain)** = hayattan.net. Zaten Natro’da; sadece “bu adres Vercel’deki siteye gitsin” diye ayar yapacağız.

**Özet:** Kod → Vercel’de çalışacak. Veritabanı → Neon/Supabase’te duracak. hayattan.net → Vercel’e yönlendirilecek. Böylece herkes hayattan.net’e girince sizin sitenizi görecek.

---

## 3. Büyük resim: Hangi sırayla ne yapıyoruz?

| Sıra | Ne yapıyoruz? | Neden? |
|------|----------------|--------|
| 1 | **GitHub hesabı açıp kodu oraya atıyoruz** | Vercel, kodu GitHub’dan alıp otomatik derleyecek. Kod GitHub’da olmazsa Vercel’e elle yükleme yapılır, güncellemek zorlaşır. |
| 2 | **Neon veya Supabase’te ücretsiz PostgreSQL açıyoruz** | Veritabanı bilgisayarınızda değil, bulutta olmalı ki canlı site veriyi oradan okusun. |
| 3 | **Vercel hesabı açıp projeyi GitHub’dan bağlıyoruz** | Vercel, Next.js’i alıp derleyip yayınlayacak. Her “push”ta otomatik yeni sürüm çıkar. |
| 4 | **Vercel’e şifreler / bağlantı bilgilerini (env) veriyoruz** | Veritabanı adresi, giriş secret’ı vb. Vercel’in bilmesi lazım; yoksa site veritabanına bağlanamaz. |
| 5 | **Canlı veritabanında tabloları oluşturuyoruz** | Bir kez `db:push` (veya migrate) ile Prisma şemasını buluttaki DB’ye uyguluyoruz. |
| 6 | **hayattan.net’i Vercel’e yönlendiriyoruz** | Natro’da DNS ayarı: “hayattan.net ve www → Vercel’in adresi.” Böylece adres aynı kalır, site Vercel’den servis edilir. |

Bu sırayı takip ettiğinizde projeniz canlıda çalışır.

---

## 4. Adım adım ne yapacaksınız? (Basit anlatım)

### Adım 1: GitHub hesabı ve repo

- **Ne:** Ücretsiz GitHub hesabı + projeniz için bir “repo” (depo).
- **Neden:** Kodu internet üzerinde güvenli tutmak ve Vercel’in “bu repodan al” demesini sağlamak.
- **Nasıl:**
  1. https://github.com → Sign up (e-posta veya Google ile).
  2. Sağ üst “+” → “New repository”.
  3. İsim: örn. `hayattan-net`. Public. “Create repository” deyin.
  4. Bilgisayarınızda proje klasöründe (Cursor/VS Code terminal veya CMD):
     - Git yoksa: https://git-scm.com indirip kurun.
     - Sonra:
       ```bash
       git init
       git add .
       git commit -m "İlk yükleme"
       git branch -M main
       git remote add origin https://github.com/KULLANICI_ADINIZ/hayattan-net.git
       git push -u origin main
       ```
     - `KULLANICI_ADINIZ` yerine kendi GitHub kullanıcı adınızı yazın.
- **Bitti mi?** GitHub’da reponun içinde dosyalarınız görünüyorsa evet.

---

### Adım 2: Bulutta PostgreSQL (Neon veya Supabase)

- **Ne:** Ücretsiz bir PostgreSQL veritabanı.
- **Neden:** Canlı sitede yazılar, yazarlar, kategoriler burada duracak; bilgisayarınızdaki DB sadece sizin için.
- **Nasıl (Neon):**
  1. https://neon.tech → Sign up (GitHub ile kolay).
  2. “New Project” → isim verin (örn. hayattan).
  3. Proje açılınca **Connection string** (PostgreSQL URL) gösterilir. “Copy” deyin. Örnek: `postgresql://kullanici:sifre@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`
- **Nasıl (Supabase):**
  1. https://supabase.com → Create account → New project.
  2. Project Settings → Database → “Connection string” → URI kopyalayın.
- **Önemli:** Bu URL’yi bir yere kaydedin; bir sonraki adımda Vercel’e gireceksiniz. Hem `DATABASE_URL` hem `DIRECT_DATABASE_URL` için **aynı** URL’yi kullanacaksınız.

---

### Adım 3: Vercel hesabı ve proje

- **Ne:** Vercel’e giriş, GitHub’daki repoyu “Import” etmek.
- **Neden:** Vercel Next.js’i derleyip dünyaya açar; ücretsiz plan yeterli.
- **Nasıl:**
  1. https://vercel.com → Sign up with GitHub.
  2. “Add New…” → “Project”.
  3. “Import” ile GitHub’daki `hayattan-net` (veya verdiğiniz isim) repoyu seçin.
  4. Framework: Next.js (genelde otomatik seçili).
  5. **Deploy’a basmadan önce** “Environment Variables” kısmına gidin (bir sonraki adımda dolduracağız).

---

### Adım 4: Vercel’e ortam değişkenleri (env)

- **Ne:** Veritabanı adresi, giriş secret’ı, site URL’si gibi bilgileri Vercel’e yazmak.
- **Neden:** Uygulama canlıda bu değerleri okuyacak; yoksa veritabanına bağlanamaz, giriş çalışmaz.
- **Nasıl:** Vercel proje sayfasında Settings → Environment Variables. Şunları ekleyin (hepsi için “Production” seçin):

| Name | Value | Not |
|------|--------|-----|
| `DATABASE_URL` | Neon/Supabase’ten kopyaladığınız URL | Aynı URL |
| `DIRECT_DATABASE_URL` | Aynı URL | Aynı URL |
| `AUTH_SECRET` | Uzun rastgele metin | Bilgisayarınızda terminal: `openssl rand -base64 32` yazıp çıkanı yapıştırın |
| `AUTH_URL` | `https://hayattan.net` | Canlı adres |
| `NEXT_PUBLIC_SITE_URL` | `https://hayattan.net` | Canlı adres |

Kaydedin. Sonra “Deploy” (veya ilk deploy’u tetikleyin). Deploy bitsin; hata alırsanız log’a bakın (çoğu zaman eksik env’den kaynaklanır).

---

### Adım 5: Canlı veritabanında tabloları oluşturmak

- **Ne:** Prisma şemasındaki tabloları (User, Yazar, Yazi, Kategori vb.) buluttaki PostgreSQL’de oluşturmak.
- **Neden:** Veritabanı boş; uygulama “yazılar nerede?” dediğinde tabloların orada olması lazım.
- **Nasıl:** Bir kez, bilgisayarınızda `.env` dosyasını **canlı veritabanı URL’si** ile geçici değiştirin (sadece bu komutlar için):

- `DATABASE_URL` ve `DIRECT_DATABASE_URL` = Neon/Supabase’ten aldığınız URL.

Sonra proje klasöründe:

```bash
npm run db:push
```

Bittikten sonra `.env`’i tekrar yerel veritabanınıza çevirebilirsiniz. Artık canlı sitede veritabanı hazır.

---

### Adım 6: hayattan.net’i Vercel’e yönlendirmek

- **Ne:** Natro’da “hayattan.net ve www hangi sunucuya gidecek?” sorusuna “Vercel’e” cevabını vermek.
- **Neden:** Böylece kullanıcı hayattan.net yazınca Vercel’deki sitenize gider; adres değişmez.
- **Nasıl:**
  1. Vercel → Projeniz → Settings → Domains → “Add” → `hayattan.net` ve `www.hayattan.net` yazın. Kaydedin.
  2. Vercel size hangi kayıtları eklemeniz gerektiğini söyler (A veya CNAME; bazen otomatik önerir).
  3. Natro’da giriş yapın → Alan adları → hayattan.net → DNS / Alan adı yönetimi.
  4. Vercel’in söylediği A veya CNAME kayıtlarını buraya ekleyin (veya mevcut A/www kayıtlarını Vercel’e yönlendirin).
  5. Bir süre bekleyin (5–60 dakika). Sonra https://hayattan.net açılmalı; Vercel SSL’i kendisi verir.

---

## 5. Özet: Sırayla yapılacaklar listesi

1. GitHub hesabı aç → repo oluştur → projeyi push et.
2. Neon veya Supabase’te PostgreSQL aç → connection string’i kopyala.
3. Vercel hesabı aç → projeyi GitHub’dan import et.
4. Vercel’de env’leri gir (DATABASE_URL, DIRECT_DATABASE_URL, AUTH_SECRET, AUTH_URL, NEXT_PUBLIC_SITE_URL) → Deploy.
5. Yerelde .env’i canlı DB URL yap → `npm run db:push` → .env’i yerel DB’ye geri al.
6. Vercel’de Domain olarak hayattan.net (ve www) ekle → Natro’da DNS’i Vercel’e yönlendir.

Bu planı takip ettiğinizde siteniz canlıda çalışır. Takıldığınız adımı not alıp “X. adımda şu hata çıkıyor” derseniz, oradan devam edebiliriz.
