# Veritabanı Yedekleme Stratejisi

Bu dok human, Hayattan.Net projesinin veritabanı yedekleme ve recovery stratejisini açıklar.

---

## 🎯 Yedekleme Stratejisi

### Vercel Postgres (Önerilen)

**Otomatik Yedeklemeler:**
- **Hobby Plan:** 7 günlük otomatik yedekleme
- **Pro Plan:** 30 günlük otomatik yedekleme
- Point-in-time recovery (PITR)

**Manuel Yedekleme:**
```bash
# Vercel Postgres SQL dump (pg_dump via Vercel CLI)
vercel postgres dump <database-name> > backup-$(date +%Y%m%d).sql
```

**Restore:**
```bash
# Vercel Dashboard → Storage → Postgres → Backups → Restore
```

---

### Supabase

**Otomatik Yedeklemeler:**
- **Free Plan:** 7 günlük yedekleme
- **Pro Plan:** 30 günlük yedekleme
- Daily automatic backups

**Manuel Yedekleme:**
```bash
# pg_dump ile
pg_dump -h db.xxx.supabase.co -U postgres -W -F c > backup.dump

# Veya Supabase Dashboard:
# Database → Backups → Download
```

**Restore:**
```bash
pg_restore -h db.xxx.supabase.co -U postgres -d postgres -W backup.dump
```

---

## 📦 Manual Backup Script

### 1. Backup Script Oluştur

```bash
# scripts/backup-db.sh
#!/bin/bash

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
BACKUP_FILE="$BACKUP_DIR/hayattan_$DATE.sql"

# Backup directory oluştur
mkdir -p $BACKUP_DIR

# pg_dump çalıştır
pg_dump $DATABASE_URL > $BACKUP_FILE

# Gzip ile sıkıştır
gzip $BACKUP_FILE

echo "Backup created: $BACKUP_FILE.gz"

# 30 günden eski backup'ları sil
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

### 2. Çalıştır

```bash
chmod +x scripts/backup-db.sh
./scripts/backup-db.sh
```

### 3. Cron Job (Opsiyonel - Günlük Backup)

```cron
# crontab -e
0 2 * * * /path/to/hayattan/scripts/backup-db.sh
```

---

## 🔄 Recovery Prosedürü

### Scenario 1: Yanlış Data Deletion

**Adımlar:**
1. Acil: Database write erişimini kapat (bakım modu)
2. Son backup'ı bul (Vercel/Supabase Dashboard)
3. Backup'ı yeni database'e restore et
4. Data'yı karşılaştır ve missing data'yı export et
5. Production database'e import et
6. Bakım modunu kaldır

**Örnek:**
```sql
-- Yanlışlıkla silinen yazıları backup'tan çek
SELECT * FROM "Yazi" WHERE "deletedAt" > '2024-01-01';

-- Production'a insert et
INSERT INTO "Yazi" SELECT * FROM backup."Yazi" WHERE id IN (...);
```

---

### Scenario 2: Database Corruption

**Adımlar:**
1. Yeni database oluştur (Vercel → Create New Postgres)
2. En son backup'ı restore et
3. Environment variables'ı yeni database'e yönlendir
4. Prisma migration çalıştır
5. Test edin
6. DNS/connection string'i güncelle
7. Eski database'i sil (7 gün sonra)

---

### Scenario 3: Catastrophic Failure

**Adımlar:**
1. Panic etmeyin 😅
2. En son backup'ı indirin
3. Yeni Vercel Postgres/Supabase oluşturun
4. Backup'ı restore edin
5. Environment variables güncelleyin
6. Deploy edin
7. İşlemler devam edebilir

---

## 💾 Backup Storage

### Cloud Storage (Öneril)

**AWS S3:**
```bash
# AWS CLI ile upload
aws s3 cp backup.sql.gz s3://hayattan-backups/$(date +%Y%m%d).sql.gz
```

**Google Cloud Storage:**
```bash
gsutil cp backup.sql.gz gs://hayattan-backups/$(date +%Y%m%d).sql.gz
```

---

## 🔐 Best Practices

### 1. Encryption

```bash
# Backup'ı şifrele (GPG)
gpg --symmetric --cipher-algo AES256 backup.sql

# Deşifrele
gpg --decrypt backup.sql.gpg > backup.sql
```

### 2. Retention Policy

- **Daily:** 7 gün sakla
- **Weekly:** 4 hafta sakla
- **Monthly:** 12 ay sakla

### 3. Test Recovery

```bash
# Her ay 1 kez restore test edin
# 1. Test database oluştur
# 2. Backup'ı restore et
# 3. Basic queries test et
# 4. Test DB'yi sil
```

---

## 📊 Monitoring

### Database Size

```sql
-- Database boyutu
SELECT pg_size_pretty(pg_database_size('verceldb'));

-- Tablo boyutları
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## ⚠️ Disaster Recovery Checklist

- [ ] Backup'lar düzenli alınıyor mu?
- [ ] Backup'lar test edildi mi?
- [ ] Backup'lar off-site storage'da mı?
- [ ] Backup encryption aktif mi?
- [ ] Recovery prosedürü dokümante edildi mi?
- [ ] Ekip recovery prosedürünü biliyor mu?

---

## 📞 Destek

**Vercel:** https://vercel.com/support  
**Supabase:** https://supabase.com/support  
**PostgreSQL:** https://www.postgresql.org/support/

---

**Remember:** Backup almayan pişman olur! 💪
