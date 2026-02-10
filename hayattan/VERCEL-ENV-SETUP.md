# 🚀 Vercel Environment Variables Kurulum Rehberi

## 📋 Gerekli Environment Variables

Vercel Dashboard'da aşağıdaki environment variables'ları ekleyin:

### 🗄️ Database (Neon PostgreSQL)
```
DATABASE_URL=postgresql://neondb_owner:npg_YMrE0JX7KGuw@ep-restless-dream-agchhfhf-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
DIRECT_DATABASE_URL=postgresql://neondb_owner:npg_YMrE0JX7KGuw@ep-restless-dream-agchhfhf.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### 🔐 Authentication
```
AUTH_SECRET=hayattan-net-super-secret-auth-key-2024
NEXT_PUBLIC_SITE_URL=https://hayattan-enes-can-kotays-projects.vercel.app
```

### ☁️ Cloudflare R2 Storage
```
R2_ACCOUNT_ID=b64dbc7490223c5a031edd426ddc8bc
R2_ACCESS_KEY_ID=ae25266769e4cc8dbe2532cf80ea3cb7
R2_SECRET_ACCESS_KEY=895ccaaf92417eb54b3e215e72837dd777457e1377e81cadd298df85b89d9d2a
R2_BUCKET_NAME=hayattan-media
R2_ENDPOINT=https://b64dbc7490223c5a031edd426ddc8bc.r2.cloudflarestorage.com
R2_PUBLIC_BASE_URL=[CLOUDFLARE'DEN ALINACAK - ÖRN: https://pub-abc123.r2.dev]
```

## 🔧 Vercel'de Environment Variables Ekleme Adımları

### 1️⃣ Vercel Dashboard'a Gidin
- 🌐 https://vercel.com/dashboard
- 📂 "Hayattan" projesini açın

### 2️⃣ Settings Sekmesine Gidin
- ⚙️ Sol menüden "Settings" tıklayın
- 🔧 "Environment Variables" seçin

### 3️⃣ Her Bir Variable'ı Ekleyin
- ➕ "Add New" butonuna tıklayın
- 📝 Name: Variable adını yazın (örn: `DATABASE_URL`)
- 💾 Value: Variable değerini yapıştırın
- 🌍 Environment: **Production**, **Preview**, **Development** (hepsini seçin)
- ✅ "Save" tıklayın

### 4️⃣ R2_PUBLIC_BASE_URL İçin Özel Adım
Bu değeri Cloudflare Dashboard'dan almalısınız:

1. 🌐 https://dash.cloudflare.com/ → R2 Object Storage
2. 📁 "hayattan-media" bucket'ını açın
3. ⚙️ Settings → Public access → "Allow Access"
4. 🔗 "r2.dev subdomain" seçin
5. 📋 Public URL'yi kopyalayın (örn: `https://pub-abc123.r2.dev`)
6. 🔧 Vercel'de `R2_PUBLIC_BASE_URL` variable'ına yapıştırın

## 🔄 Deployment'ı Yenileme

Environment variables eklendikten sonra:

1. 🔄 Vercel Dashboard'da "Deployments" sekmesine gidin
2. 🔴 En son deployment'ın yanındaki "..." menüsüne tıklayın
3. 🔄 "Redeploy" seçin
4. ⏱️ Deployment tamamlanana kadar bekleyin

## ✅ Doğrulama

Kurulum tamamlandıktan sonra:

1. 🌐 https://hayattan-enes-can-kotays-projects.vercel.app/admin/giris
2. 🔐 Admin girişi yapın
3. 📝 Yeni yazı oluşturun
4. 📸 Resim yüklemeyi test edin
5. 🖼️ Yüklenen resmin görüntülendiğini kontrol edin

## 🆘 Sorun Giderme

### ❌ R2 bağlantı hatası
- Cloudflare R2 credentials'ları kontrol edin
- R2_PUBLIC_BASE_URL'nin doğru olduğundan emin olun

### ❌ Database bağlantı hatası  
- Neon database URL'lerini kontrol edin
- Database'in aktif olduğundan emin olun

### ❌ Auth hatası
- AUTH_SECRET'ın ayarlandığından emin olun
- NEXT_PUBLIC_SITE_URL'nin doğru domain'i gösterdiğini kontrol edin

## 📞 Destek

Sorun yaşarsanız:
1. Vercel deployment logs'ları kontrol edin
2. Environment variables'ların doğru yazıldığından emin olun
3. Cloudflare R2 bucket'ının public access'e açık olduğunu kontrol edin