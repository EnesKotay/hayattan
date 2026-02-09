# Security Policy

## 🔒 Güvenlik Politikası

Hayattan.Net projesinin güvenliğini ciddiye alıyoruz. Bu belgede güvenlik açıklarını nasıl bildireceğiniz ve mevcut güvenlik önlemlerimiz açıklanmaktadır.

## 🐛 Güvenlik Açığı Bildirme

### Lütfen güvenlik açıklarını **PUBLIC olarak** GitHub Issues'da AÇMAYIN!

Güvenlik açığı keşfettiyseniz:

1. **Email gönderin**: [security@yourdomain.com](mailto:security@yourdomain.com)
2. Aşağıdaki bilgileri ekleyin:
   - Açığın detaylı açıklaması
   - Reproduce etme adımları
   - Potansiyel etki
   - Önerilen çözüm (varsa)

### Cevap Süresi

- **24 saat içinde** ilk yanıt
- **7 gün içinde** açığın değerlendirilmesi
- **30 gün içinde** patch release (severity'ye göre)

## 🛡️ Güvenlik Özellikleri

### Authentication & Authorization

- ✅ NextAuth v5 ile güvenli session management
- ✅ bcrypt ile password hashing (cost factor: 12)
- ✅ HttpOnly, Secure cookies
- ✅ CSRF protection (NextAuth built-in)
- ✅ Session timeout (30 days idle)

### Rate Limiting

- ✅ Redis (Vercel KV) tabanlı dağıtık rate limiting
- ✅ IP-based throttling
- ✅ Endpoint-specific limits:
  - Login: 5 attempts / 15 min
  - API: 100 requests / min
  - Admin: 200 requests / min

### Input Validation & Sanitization

- ✅ Zod schema validation
- ✅ DOMPurify HTML sanitization
- ✅ SQL injection koruması (Prisma ORM)
- ✅ XSS koruması
- ✅ CSRF tokens

### Security Headers

```typescript
Content-Security-Policy (CSP)
Strict-Transport-Security (HSTS)
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy
```

### Password Policies

- ✅ Minimum 8 karakter
- ✅ En az 1 uppercase
- ✅ En az 1 lowercase
- ✅ En az 1 sayı
- ✅ En az 1 özel karakter
- ✅ Yaygın şifreler yasaklı

### Security Logging

- ✅ Tüm login attemptleri loglanır
- ✅ Rate limit violations
- ✅ Unauthorized access attempts
- ✅ Suspicious activities
- ✅ Admin actions

## 🔍 Bilinen Güvenlik Önlemleri

### Environment Variables

`.env` dosyası **asla** commit edilmez:
- `.gitignore` ile korunur
- `.env.example` template sağlanır
- Sensitive data production'da environment variables olarak

### File Uploads

- ✅ Uploadthing CDN kullanımı
- ✅ 4MB dosya boyutu limiti
- ✅ Sadece image/* MIME types
- ✅ Authenticated upload yalnızca
- ✅ Automatic WebP conversion

### Database Security

- ✅ Prisma ORM (SQL injection koruması)
- ✅ Prepared statements
- ✅ Connection pooling
- ✅ SSL/TLS connections (production)
- ✅ Database indexes (DoS prevention)

### API Security

- ✅ CORS configuration
- ✅ Rate limiting
- ✅ Input validation
- ✅ Authentication middleware
- ✅ Error handling (no sensitive info leak)

## 🚨 Güvenlik Checklist (Deployment)

### Pre-deployment

- [ ] `AUTH_SECRET` güçlü random string (32+ chars)
- [ ] Database credentials güvenli
- [ ] HTTPS enabled (production)
- [ ] Environment variables set
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Logging configured

### Post-deployment

- [ ] Security headers test (securityheaders.com)
- [ ] SSL/TLS test (ssllabs.com)
- [ ] Penetration testing
- [ ] Dependency audit (`npm audit`)
- [ ] OWASP ZAP scan

## 🔄 Güvenlik Güncellemeleri

### Dependency Updates

```bash
# Security patches için dependencies'i kontrol et
npm audit

# Automatic fix (çoğu zaman safe)
npm audit fix

# Break changes ile fix
npm audit fix --force
```

### Prisma Security

```bash
# Prisma güvenlik güncellemeleri
npx prisma migrate dev
npx prisma generate
```

## 📊 Güvenlik Best Practices

### Admin Kullanıcıları

1. Güçlü şifreler kullanın
2. 2FA aktifleştirin (gelecek feature)
3. Login attempts'i monitor edin
4. Düzenli olarak şifre değiştirin
5. Şüpheli activity'leri bildirin

### Geliştiriciler

1. Asla sensitive data commit etmeyin
2. `.env` dosyasını `.gitignore`'a ekleyin
3. Dependencies'i güncel tutun
4. Code review yapın
5. Input validation yazmayı unutmayın

### Production

1. HTTPS kullanın (Let's Encrypt)
2. Database backups alın
3. Security logs monitör edin
4. Rate limiting aktif tutun
5. Düzenli security audits

## 🛠️ Security Tools

### Recommended

- **Snyk** - Dependency vulnerability scanning
- **OWASP ZAP** - Web app security testing
- **Dependabot** - GitHub automated security updates
- **npm audit** - Built-in dependency auditing

## 📚 Kaynaklar

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [Prisma Security](https://www.prisma.io/docs/guides/security)
- [NextAuth Security](https://next-auth.js.org/getting-started/introduction#security)

## 🏆 Hall of Fame

Güvenlik açığı bildiren ve project'e katkıda bulunan kişiler:

- *İlk katkıcı olmak için bildirin!* 🎉

---

**Son Güncelleme:** 2026-02-03  
**Contact:** [security@yourdomain.com](mailto:security@yourdomain.com)
