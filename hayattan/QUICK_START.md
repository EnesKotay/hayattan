# Hayattan.Net - Hızlı Başlangıç Kılavuzu

Bu kılavuz, Hayattan.Net projesini sıfırdan production'a deploy etmek için gerekli tüm adımları içerir.

## 📋 Ön Gereksinimler

- GitHub hesabı
- Vercel hesabı (ücretsiz)
- Vercel Postgres database (veya Supabase/Railway)
- Uploadthing hesabı (görsel yükleme için)

---

## 🚀 1. Vercel'e Deploy

### 1.1 Repository'yi Vercel'e Bağla

1. https://vercel.com/new adresine git
2. GitHub repository'nizi seçin
3. "Import" butonuna tıklayın

### 1.2 Environment Variables

Vercel dashboard'da aşağıdaki environment variables'ları ekleyin:

#### **Database (Zorunlu)**
```env
DATABASE_URL=postgresql://user:password@host:5432/database
```

> 💡 **Vercel Postgres kullanıyorsanız:** Storage → Postgres → Create Store → Otomatik olarak eklenir

#### **Authentication (Zorunlu)**
```env
AUTH_SECRET=your-super-secret-key-minimum-32-characters
NEXTAUTH_URL=https://your-domain.vercel.app
```

> 🔑 **AUTH_SECRET oluştur:** `openssl rand -base64 32` komutu ile

#### **File Upload - Uploadthing (Zorunlu)**
```env
UPLOADTHING_SECRET=sk_live_...
UPLOADTHING_APP_ID=...
```

> 📸 **Uploadthing setup:** https://uploadthing.com/ → Create App → Copy credentials

#### **Rate Limiting - Vercel KV (Opsiyonel)**
```env
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...
```

> 💡 **Vercel KV:** Storage → KV → Create Store → Otomatik olarak eklenir

#### **Site Config (Opsiyonel)**
```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SITE_NAME=Hayattan.Net
```

### 1.3 Deploy

"Deploy" butonuna tıklayın. İlk deploy **~3-5 dakika** sürer.

---

## 🗄️ 2. Database Setup

Deploy tamamlandıktan sonra:

### 2.1 Prisma Migration

Vercel Dashboard → Storage → Postgres → Data → Import:

```bash
# Lokal olarak .env dosyasını pull edin
npx vercel env pull .env

# Prisma migration çalıştırın
npx prisma db push

# Veya:
npx prisma migrate deploy
```

### 2.2 İlk Admin Kullanıcısı

Prisma Studio ile:

```bash
npx prisma studio
```

Veya Vercel Postgres SQL Editor'de:

```sql
INSERT INTO "User" (id, email, name, "passwordHash", role)
VALUES (
  gen_random_uuid(),
  'admin@yourdomain.com',
  'Admin',
  -- bcrypt hash for "YourPassword123!" (hash oluştur: https://bcrypt-generator.com)
  '$2b$12$...',
  'ADMIN'
);
```

---

## 🌐 3. Domain Bağlama (Opsiyonel)

### 3.1 Custom Domain Ekleme

Vercel Dashboard → Settings → Domains → Add Domain:

1. Domain adınızı girin (örn: `hayattan.net`)
2. DNS kayıtlarınızı güncelleyin:

**A Record:**
```
Type: A
Name: @
Value: 76.76.21.21
```

**CNAME Record (www):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

3. SSL sertifikası otomatik olarak oluşturulur (Let's Encrypt)

### 3.2 Environment Variables Güncelle

Domain ekledikten sonra:

```env
NEXTAUTH_URL=https://your-domain.com
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

Vercel'de bu değişkenleri güncelleyin ve **redeploy** edin.

---

## ✅ 4. Post-Deployment Kontroller

### 4.1 Fonksiyonellik Testleri

- [ ] Ana sayfa yükleniyor mu?
- [ ] Admin girişi çalışıyor mu? (`/admin/giris`)
- [ ] Yazı oluşturabiliyormusunuz?
- [ ] Görsel yükleyebiliyor musunuz?
- [ ] Public sayfalar (yazı detay, kategori, yazar) çalışıyor mu?

### 4.2 Güvenlik Testleri

- [ ] SSL çalışıyor mu? (https://)
- [ ] Rate limiting aktif mi? (çok fazla login denemesi yapın)
- [ ] Security headers: https://securityheaders.com/

### 4.3 SEO Kontrolü

- [ ] Sitemap eriş test edilebilir mi? (`/sitemap.xml`)
- [ ] Robots.txt test edilebilir mi? (`/robots.txt`)
- [ ] Open Graph tags doğru mu? (Facebook/LinkedIn'de link paylaş)

---

## 🐛 Sorun Giderme

### Build Hatası

**Hata:** `Type error: ...`
```bash
# Lokal olarak test edin
npm run build

# Prisma client'ı yenileyin
npx prisma generate
```

###Environment Variable Eksik

**Hata:** `Invalid AUTH_SECRET`
```bash
# .env dosyasını kontrol edin
cat .env

# Vercel'de kontrol edin
vercel env ls
```

### Database Bağlantı Hatası

**Hata:** `Can't reach database server`
```bash
# DATABASE_URL doğru mu?
# Vercel Postgres kullanıyorsanız:
# Storage → Postgres → .env.local tab → Copy to Vercel
```

Daha fazla sorun için: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

## 📚 Ek Kaynaklar

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Detaylı deployment seçenekleri
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Yaygın sorunlar ve çözümler
- [TESTING.md](./TESTING.md) - Test yazma ve çalıştırma
- [SECURITY.md](./SECURITY.md) - Güvenlik best practices

---

## 🎉 Tebrikler!

Siteniz artık canlıda! İyi çalışmalar! 🚀

**Sonraki adımlar:**
1. İçerik ekleyin (yazı, yazar, kategori)
2. Reklam slotlarını yapılandırın (`/admin/reklam`)
3. Site ayarlarını özelleştirin

**Destek için:**
- GitHub Issues: https://github.com/yourusername/hayattan/issues
- Email: support@hayattan.net
