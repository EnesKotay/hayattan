# İzleme ve Error Tracking

Bu döküman Hayattan.Net projesinin production izleme stratejisini açıklar.

---

## 🔍 İzleme Stratejisi

### 1. Sentry (Error Tracking) - Önerilir

**Kurulum:**

```bash
npm install @sentry/nextjs
```

**Config:**

```javascript
// sentry.client.config.js
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
});
```

```javascript
// sentry.server.config.js
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
});
```

**Environment Variables:**

```env
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ORG=your-org
SENTRY_PROJECT=hayattan
```

**Hata Yakalama Örneği:**

```typescript
try {
  await riskyOperation();
} catch (error) {
  Sentry.captureException(error, {
    tags: { component: "admin-panel" },
    extra: { userId: session.user.id },
  });
  throw error;
}
```

---

### 2. Vercel Analytics

**Kurulum:**

```bash
npm install @vercel/analytics
```

**Usage:**

```tsx
// app/layout.tsx
import { Analytics } from "@vercel/analytics/react";

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

**Özellikler:**
- Page views
- User sessions
- Geographic data
- Device/browser stats

---

### 3. Vercel Speed Insights

```bash
npm install @vercel/speed-insights
```

```tsx
// app/layout.tsx
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

**Metrikler:**
- Core Web Vitals (LCP, FID, CLS)
- Time to First Byte (TTFB)
- First Contentful Paint (FCP)

---

## 📊 Ne İzlenmeli?

### 1. Error Tracking (Sentry)

**Kritik Hatalar:**
- [ ] Authentication failures
- [ ] Database connection errors
- [ ] File upload failures
- [ ] Admin action errors (createYazi, updateYazi, etc.)
- [ ] Rate limit violations

**Alert Kuralları:**
```javascript
// Sentry Dashboard → Alerts → New Alert Rule
// Type: Issues
// Conditions:
//   - Error count > 10 in 1 hour
//   - Environment: production
// Actions:
//   - Send email notification
```

---

### 2. Performance (Vercel Speed Insights)

**Metrikler:**
| Metric | Target | Alert |
|--------|--------|-------|
| **LCP** | < 2.5s | > 4s |
| **FID** | < 100ms | > 300ms |
| **CLS** | < 0.1 | > 0.25 |
| **TTFB** | < 600ms | > 1.8s |

---

### 3. Database (Prisma Logs)

**Query Performance:**

```typescript
// src/lib/db.ts
const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
  ],
});

prisma.$on('query', (e) => {
  if (e.duration > 1000) { // 1 saniyeden uzun query'ler
    console.warn('Slow query detected', {
      query: e.query,
      duration: e.duration,
    });
    
    // Sentry'ye gönder
    Sentry.captureMessage('Slow database query', {
      level: 'warning',
      extra: { query: e.query, duration: e.duration },
    });
  }
});
```

---

### 4. Security Events (Custom Logs)

```typescript
// src/lib/security-logger.ts
// Zaten mevcut - SecurityLog model'i kullanır

// İzlenecekler:
// - failed_login: Başarısız giriş denemeleri
// - rate_limit_exceeded: Rate limit aşımları
// - suspicious_activity: Şüpheli aktiviteler
```

**Prisma Studio ile izleme:**
```bash
npx prisma studio
# SecurityLog tablosuna bakın
# Son 24 saatteki failed_login sayısı > 50 ise alert
```

---

## 📈 Dashboard ve Raporlama

### Sentry Dashboard

**Sayfalar:**
1. **Issues:** Hata listesi, frekans, etkilenen kullanıcılar
2. **Performance:** Transaction'lar, slow queries
3. **Releases:** Deploy bazlı hata oranları

**Haftalık Rapor:**
- Top 10 errors
- Error rate trend
- Affected users
- Performance degradation

---

### Vercel Dashboard

**Metrikler:**
- Function invocations
- Function duration
- Edge requests
- Bandwidth usage

**Alerts:**
- Function errors > 5%
- Function timeout > 10s
- Out of memory errors

---

## 🚨 Alert Stratejisi

### Critical Alerts (Immediate Action)

```
🔴 CRITICAL: Database connection failed
🔴 CRITICAL: Authentication system down
🔴 CRITICAL: File upload completely broken
```

**Action:** Hemen düzelt veya rollback yap

---

### Warning Alerts (Monitor)

```
⚠️ WARNING: Error rate increased by 50%
⚠️ WARNING: Slow database queries detected
⚠️ WARNING: High memory usage
```

**Action:** Investigate, plan fix

---

### Info Alerts (Track)

```
ℹ️ INFO: Rate limit exceeded (user: xxx)
ℹ️ INFO: Failed login attempt
```

**Action:** Log, potentially ban if repeated

---

## 📞 On-Call Rotation (Opsiyonel)

### PagerDuty Entegrasyonu

```javascript
// Sentry → Settings → Integrations → PagerDuty
// Critical errors → PagerDuty → SMS/Phone call
```

---

## 🧪 Testing Monitoring

### Sentry Test

```typescript
// Test error
Sentry.captureMessage('Test error from production', {
  level: 'info',
  tags: { test: true },
});
```

### Vercel Analytics Test

```bash
# Deploy ve sayfaları ziyaret et
# Vercel Dashboard → Analytics → Real-time visitors
```

---

## 📝 Logging Best Practices

### 1. Structured Logging

```typescript
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  level: 'error',
  message: 'Database query failed',
  context: {
    userId: user.id,
    query: 'SELECT ...',
  },
}));
```

### 2. Log Levels

| Level | Use Case |
|-------|----------|
| **ERROR** | Kritik hatalar, database failure |
| **WARN** | Slow queries, rate limit |
| **INFO** | Önemli olaylar (login, yazı oluşturma) |
| **DEBUG** | Development bilgisi |

### 3. PII (Personal Identifiable Information)

```typescript
// ❌ KÖTÜ: Email loglama
console.log('Failed login:', user.email);

// ✅ İYİ: Sadece ID
console.log('Failed login:', { userId: user.id });
```

---

## 🎯 İzleme Checklist

**Production'a almadan önce:**
- [ ] Sentry kuruldu ve test edildi
- [ ] Vercel Analytics aktif
- [ ] Error alerts yapılandırıldı
- [ ] Security logs monitör ediliyor
- [ ] Performance thresholds tanımlandı
- [ ] Alert notification (email/slack) kuruldu

---

## 📞 Kaynaklar

- **Sentry Docs:** https://docs.sentry.io/platforms/javascript/nextjs/
- **Vercel Analytics:** https://vercel.com/docs/analytics
- **Next.js Monitoring:** https://nextjs.org/docs/app/building-your-application/optimizing/analytics

---

**İzleme = Proaktif Geliştirme 🚀**
