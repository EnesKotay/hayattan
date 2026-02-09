# 🚀 Hayattan.net — Sunucuya Yükleme Rehberi (Çok Ayrıntılı)

Bu rehber, projeyi canlı sunucuya yüklemek için **tüm adımları** detaylıca anlatır. İki yöntem var: **Vercel (Kolay)** ve **VPS/Ubuntu (Gelişmiş)**.

---

## 📋 İçindekiler

1. [Hazırlık](#hazırlık)
2. [Yöntem 1: Vercel ile Deploy (Önerilen - Kolay)](#yöntem-1-vercel-ile-deploy)
3. [Yöntem 2: VPS/Ubuntu Sunucuya Yükleme](#yöntem-2-vpsubuntu-sunucuya-yükleme)
4. [Domain Bağlama](#domain-bağlama)
5. [Sorun Giderme](#sorun-giderme)

---

## 🔧 Hazırlık

### 1.1. Gerekli Hesaplar

- ✅ **GitHub hesabı** (kodları saklamak için) → [github.com](https://github.com)
- ✅ **Vercel hesabı** (Vercel yöntemi için) → [vercel.com](https://vercel.com)
- ✅ **PostgreSQL veritabanı** (Neon, Supabase veya Vercel Postgres)
- ✅ **Domain** (hayattan.net) — DNS ayarları için erişim gerekli

### 1.2. Yerel Bilgisayarda Hazırlık

**Terminalde şunları kontrol et:**

```bash
# Node.js versiyonu (18+ olmalı)
node --version

# npm versiyonu
npm --version

# Git kurulu mu?
git --version
```

**Git kurulu değilse:** [git-scm.com/download](https://git-scm.com/download) → Windows için indirip kur.

---

## 🌐 Yöntem 1: Vercel ile Deploy (Önerilen - Kolay)

Vercel, Next.js için en kolay ve hızlı yöntemdir. Ücretsiz plan yeterlidir.

### Adım 1: Kodu GitHub'a Yükle

**1.1. GitHub'da Repo Oluştur**

1. [github.com](https://github.com) → Giriş yap
2. Sağ üstte **"+"** → **"New repository"**
3. Repository name: `hayattan-net` (veya istediğin isim)
4. **Public** veya **Private** seç (Private önerilir)
5. **"Create repository"** tıkla

**1.2. Projeyi GitHub'a Gönder**

**Proje klasöründe** (C:\Users\Enes Can Kotay\Desktop\hayattan) terminal aç:

```bash
# Git başlat (eğer daha önce yapmadıysan)
git init

# Tüm dosyaları ekle
git add .

# İlk commit
git commit -m "Initial commit - Hayattan.net projesi"

# Ana branch'i main yap
git branch -M main

# GitHub repo'yu ekle (KULLANICI_ADINIZ yerine GitHub kullanıcı adını yaz)
git remote add origin https://github.com/KULLANICI_ADINIZ/hayattan-net.git

# GitHub'a gönder
git push -u origin main
```

**İlk kez GitHub'a gönderiyorsan:**
- GitHub kullanıcı adı ve şifre isteyebilir
- Şifre yerine **Personal Access Token** kullanman gerekebilir
- Token oluştur: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token
- Scopes: `repo` işaretle
- Token'ı kopyala, şifre yerine kullan

**Başarılı olursa:** GitHub'da repo'nu görebilirsin.

---

### Adım 2: PostgreSQL Veritabanı Oluştur

**Seçenek A: Neon (Ücretsiz, Önerilen)**

1. [neon.tech](https://neon.tech) → **Sign up** (GitHub ile giriş yapabilirsin)
2. **Create a project** → İsim: `hayattan-net`
3. **Create project** tıkla
4. **Connection string** bölümünde **"Copy connection string"** tıkla
5. URL şöyle görünür: `postgresql://user:password@host.neon.tech/dbname?sslmode=require`
6. Bu URL'yi **not al** — Vercel'de kullanacaksın

**Seçenek B: Supabase**

1. [supabase.com](https://supabase.com) → **Start your project**
2. Yeni proje oluştur → İsim: `hayattan-net`
3. Database password belirle (not al)
4. Proje oluşturulduktan sonra: **Settings** → **Database** → **Connection string** → **URI** kopyala
5. URL şöyle görünür: `postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres`
6. `[PASSWORD]` yerine gerçek şifreyi yaz

**Seçenek C: Vercel Postgres (Vercel'de proje oluşturduktan sonra)**

1. Vercel Dashboard → Projen → **Storage** → **Create Database** → **Postgres**
2. Plan seç (Hobby ücretsiz)
3. **Create** → Vercel otomatik `POSTGRES_URL` ekler
4. Ama projemiz `DATABASE_URL` bekliyor → Vercel'de Environment Variables'a `DATABASE_URL` = `POSTGRES_URL` değerini kopyala

---

### Adım 3: Vercel'de Proje Oluştur

**3.1. Vercel Hesabı**

1. [vercel.com](https://vercel.com) → **Sign up** (GitHub ile giriş önerilir)
2. Hesabı doğrula

**3.2. Projeyi İçe Aktar**

1. Vercel Dashboard → **Add New** → **Project**
2. **Import Git Repository** → GitHub repo'nu seç (`hayattan-net`)
3. **Import** tıkla

**3.3. Proje Ayarları**

- **Framework Preset:** Next.js (otomatik algılanır)
- **Root Directory:** `./` (değiştirme)
- **Build Command:** `npm run build` (varsayılan)
- **Output Directory:** `.next` (varsayılan)
- **Install Command:** `npm install` (varsayılan)

**3.4. Environment Variables (Çok Önemli!)**

**"Environment Variables"** bölümüne tıkla, şunları ekle:

| Değişken Adı | Değer | Açıklama |
|--------------|-------|----------|
| `DATABASE_URL` | `postgresql://user:pass@host/db?sslmode=require` | Neon/Supabase'den kopyaladığın PostgreSQL URL |
| `DIRECT_DATABASE_URL` | Aynı değer | `DATABASE_URL` ile aynı (Prisma için) |
| `AUTH_SECRET` | `openssl rand -base64 32` çıktısı | Gizli anahtar (32+ karakter) |
| `AUTH_URL` | `https://hayattan.net` | Canlı site adresi |
| `NEXT_PUBLIC_SITE_URL` | `https://hayattan.net` | Site adresi (tarayıcıda) |
| `RESEND_API_KEY` | `re_...` | Resend API key (e-posta için, varsa) |

**AUTH_SECRET oluşturma:**

Windows PowerShell'de:
```powershell
# OpenSSL yoksa, Node.js ile:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Çıkan değeri kopyala, `AUTH_SECRET` olarak ekle.

**3.5. Deploy**

1. **Deploy** butonuna tıkla
2. İlk deploy 3-5 dakika sürebilir
3. Başarılı olursa: `https://hayattan-net.vercel.app` adresinde site çalışır

---

### Adım 4: Veritabanı Şemasını Uygula

**4.1. Yerel Bilgisayarda**

`.env` dosyasını **geçici olarak** canlı veritabanı URL'si ile güncelle:

```env
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
DIRECT_DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
```

**4.2. Şemayı Uygula**

Terminalde:
```bash
# Prisma client oluştur
npm run db:generate

# Şemayı canlı DB'ye uygula
npm run db:push
```

Başarılı olursa: "Your database is now in sync" mesajı görünür.

**4.3. Yerel .env'i Geri Al**

`.env` dosyasını tekrar yerel veritabanına çevir (localhost).

**4.4. İlk Admin Kullanıcı Oluştur**

Yerel bilgisayarda (canlı DB URL'i ile .env'de):
```bash
npx tsx prisma/create-admin.ts
```

Kullanıcı adı ve şifre sorar → Admin hesabı oluşturulur.

---

### Adım 5: Domain Bağlama

**5.1. Vercel'de Domain Ekle**

1. Vercel Dashboard → Projen → **Settings** → **Domains**
2. **Add** → `hayattan.net` yaz → **Add**
3. `www.hayattan.net` için de tekrar **Add** → `www.hayattan.net` → **Add**

**5.2. DNS Kayıtlarını Al**

Vercel, şu kayıtları eklemen gerektiğini gösterir:

- **A Record:** `76.76.21.21` (Vercel'in IP'si — Vercel'de yazan güncel değeri kullan)
- **CNAME (www için):** `cname.vercel-dns.com`

**5.3. Natro'da DNS Ayarları**

1. Natro müşteri paneli → **Alan Adları** → **hayattan.net** → **DNS Yönetimi** (veya "DNS Düzenle")
2. Mevcut kayıtları kontrol et:
   - **A Record** (`@` veya boş) → Vercel'in IP'sine yönlendir: `76.76.21.21`
   - **CNAME** (`www`) → `cname.vercel-dns.com` (veya Vercel'in verdiği CNAME)
3. Kaydet
4. 5-60 dakika içinde DNS yayılır
5. Vercel otomatik SSL (HTTPS) verir

**5.4. Kontrol**

Tarayıcıda `https://hayattan.net` aç → Site çalışıyor olmalı.

---

## 🖥️ Yöntem 2: VPS/Ubuntu Sunucuya Yükleme

Eğer kendi sunucun varsa (DigitalOcean, AWS EC2, Hetzner vb.) bu yöntemi kullan.

### Adım 1: Sunucu Hazırlığı

**1.1. Ubuntu 22.04 LTS Kurulu Olmalı**

**1.2. SSH ile Bağlan**

```bash
ssh root@SUNUCU_IP
# veya
ssh kullanici@SUNUCU_IP
```

**1.3. Sistem Güncelle**

```bash
apt update && apt upgrade -y
```

**1.4. Node.js 20 Kur**

```bash
# NodeSource repository ekle
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

# Node.js kur
apt install -y nodejs

# Kontrol
node --version  # v20.x.x görmeli
npm --version
```

**1.5. PostgreSQL Kur**

```bash
# PostgreSQL kur
apt install -y postgresql postgresql-contrib

# PostgreSQL servisini başlat
systemctl start postgresql
systemctl enable postgresql

# PostgreSQL kullanıcı oluştur
sudo -u postgres psql
```

PostgreSQL shell'de:
```sql
-- Veritabanı oluştur
CREATE DATABASE hayattan;

-- Kullanıcı oluştur
CREATE USER hayattan_user WITH PASSWORD 'GÜÇLÜ_ŞİFRE_BURAYA';

-- Yetkileri ver
GRANT ALL PRIVILEGES ON DATABASE hayattan TO hayattan_user;

-- Çık
\q
```

**1.6. PM2 Kur (Node.js Process Manager)**

```bash
npm install -g pm2
```

**1.7. Nginx Kur (Reverse Proxy)**

```bash
apt install -y nginx
systemctl start nginx
systemctl enable nginx
```

---

### Adım 2: Projeyi Sunucuya Yükle

**2.1. Git ile Çek**

```bash
# Proje klasörü oluştur
mkdir -p /var/www/hayattan
cd /var/www/hayattan

# GitHub'dan çek
git clone https://github.com/KULLANICI_ADINIZ/hayattan-net.git .

# Bağımlılıkları kur
npm install --production
```

**2.2. .env Dosyası Oluştur**

```bash
nano .env
```

İçeriği:
```env
# Veritabanı (sunucudaki PostgreSQL)
DATABASE_URL="postgresql://hayattan_user:GÜÇLÜ_ŞİFRE_BURAYA@localhost:5432/hayattan"
DIRECT_DATABASE_URL="postgresql://hayattan_user:GÜÇLÜ_ŞİFRE_BURAYA@localhost:5432/hayattan"

# NextAuth
AUTH_SECRET="openssl rand -base64 32 çıktısı"
AUTH_URL="https://hayattan.net"
NEXT_PUBLIC_SITE_URL="https://hayattan.net"

# Diğer
RESEND_API_KEY="re_..."
NODE_ENV="production"
```

Kaydet: `Ctrl+O`, `Enter`, `Ctrl+X`

**2.3. Prisma Şemasını Uygula**

```bash
# Prisma client oluştur
npm run db:generate

# Şemayı uygula
npm run db:push
```

**2.4. Build Al**

```bash
npm run build
```

---

### Adım 3: PM2 ile Çalıştır

**3.1. PM2 Config Oluştur**

```bash
nano ecosystem.config.js
```

İçeriği:
```javascript
module.exports = {
  apps: [{
    name: 'hayattan',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/var/www/hayattan',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

**3.2. PM2 ile Başlat**

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Sunucu yeniden başladığında otomatik başlat
```

**3.3. Kontrol**

```bash
pm2 status
pm2 logs hayattan
```

---

### Adım 4: Nginx Yapılandırması

**4.1. Nginx Config**

```bash
nano /etc/nginx/sites-available/hayattan
```

İçeriği:
```nginx
server {
    listen 80;
    server_name hayattan.net www.hayattan.net;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**4.2. Symlink Oluştur**

```bash
ln -s /etc/nginx/sites-available/hayattan /etc/nginx/sites-enabled/
```

**4.3. Nginx Test ve Yeniden Başlat**

```bash
nginx -t
systemctl reload nginx
```

---

### Adım 5: SSL (Let's Encrypt)

**5.1. Certbot Kur**

```bash
apt install -y certbot python3-certbot-nginx
```

**5.2. SSL Sertifikası Al**

```bash
certbot --nginx -d hayattan.net -d www.hayattan.net
```

E-posta gir, şartları kabul et → SSL otomatik kurulur.

**5.3. Otomatik Yenileme**

```bash
certbot renew --dry-run
```

---

### Adım 6: Domain DNS Ayarları

**Natro'da:**

- **A Record** (`@`): Sunucunun IP adresi
- **A Record** (`www`): Sunucunun IP adresi (veya CNAME ile `@`)

---

## 🔄 Güncelleme (Her İki Yöntem)

### Vercel'de Güncelleme

1. Yerel bilgisayarda değişiklik yap
2. GitHub'a gönder:
   ```bash
   git add .
   git commit -m "Güncelleme açıklaması"
   git push
   ```
3. Vercel otomatik deploy eder (1-2 dakika)

### VPS'te Güncelleme

```bash
cd /var/www/hayattan
git pull
npm install --production
npm run build
pm2 restart hayattan
```

---

## 🐛 Sorun Giderme

### Vercel'de Build Hatası

- **Hata:** "Module not found" → `package.json`'da eksik paket var
- **Çözüm:** Yerel bilgisayarda `npm install` yap, `package-lock.json`'ı GitHub'a gönder

### Veritabanı Bağlantı Hatası

- **Hata:** "Connection refused" veya "SSL required"
- **Çözüm:** `DATABASE_URL`'de `?sslmode=require` var mı kontrol et

### Domain Çalışmıyor

- **DNS yayılımı:** 24-48 saat sürebilir
- **Kontrol:** [whatsmydns.net](https://www.whatsmydns.net) → `hayattan.net` → A Record kontrol et

### PM2 Çalışmıyor

```bash
pm2 logs hayattan  # Hata loglarını gör
pm2 restart hayattan  # Yeniden başlat
pm2 delete hayattan && pm2 start ecosystem.config.js  # Sıfırdan başlat
```

---

## ✅ Kontrol Listesi

### Vercel Yöntemi

- [ ] GitHub'da repo var
- [ ] Neon/Supabase'de PostgreSQL oluşturuldu
- [ ] Vercel'de proje oluşturuldu
- [ ] Environment Variables eklendi (`DATABASE_URL`, `DIRECT_DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `NEXT_PUBLIC_SITE_URL`)
- [ ] İlk deploy başarılı
- [ ] `db:push` ile şema uygulandı
- [ ] Admin kullanıcı oluşturuldu
- [ ] Domain Vercel'e eklendi
- [ ] DNS kayıtları Natro'da güncellendi
- [ ] Site `https://hayattan.net` adresinde çalışıyor

### VPS Yöntemi

- [ ] Ubuntu 22.04 kurulu
- [ ] Node.js 20 kurulu
- [ ] PostgreSQL kurulu ve veritabanı oluşturuldu
- [ ] PM2 kurulu
- [ ] Nginx kurulu ve yapılandırıldı
- [ ] Proje `/var/www/hayattan` klasöründe
- [ ] `.env` dosyası doğru değerlerle dolu
- [ ] `db:push` ile şema uygulandı
- [ ] `npm run build` başarılı
- [ ] PM2 çalışıyor (`pm2 status`)
- [ ] Nginx çalışıyor (`systemctl status nginx`)
- [ ] SSL sertifikası kurulu (`certbot`)
- [ ] DNS kayıtları sunucu IP'sine yönlendirildi
- [ ] Site `https://hayattan.net` adresinde çalışıyor

---

## 📞 Yardım

Sorun yaşarsan:
1. Vercel Dashboard → Deployments → Logs'a bak
2. PM2 logs: `pm2 logs hayattan`
3. Nginx logs: `/var/log/nginx/error.log`
4. PostgreSQL logs: `/var/log/postgresql/postgresql-*.log`

---

**Başarılar! 🎉**
