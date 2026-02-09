# Test Dokümantasyonu

Bu doküman, Hayattan.Net projesinde testlerin nasıl yazılacağı ve çalıştırılacağını açıklar.

## 📋 Test Altyapısı

> **Not:** Test alt yapısı hazır değil. Gelecekte eklenecek.

### Planlanan Test Stack

- **Framework:** Jest veya Vitest
- **React Testing:** @testing-library/react
- **Mock:** Prisma mock, NextAuth mock

---

## 🧪 Gelecekte Eklenecek Testler

### 1. Unit Testler

**Öncelik: Yüksek**

#### Sanitization Testleri
```javascript
// __tests__/lib/sanitize.test.ts
describe('sanitizeHtml', () => {
  it('should remove script tags', () => {
    const dirty = '<p>Hello</p><script>alert("xss")</script>';
    const clean = sanitizeHtml(dirty);
    expect(clean).not.toContain('<script>');
  });
});
```

#### Password Validator Testleri
```javascript
// __tests__/lib/password-validator.test.ts
describe('validatePassword', () => {
  it('should reject weak passwords', () => {
    const result = validatePassword('12345');
    expect(result.valid).toBe(false);
  });
  
  it('should accept strong passwords', () => {
    const result = validatePassword('MyStr0ng!Pass');
    expect(result.valid).toBe(true);
  });
});
```

---

### 2. Integration Testler

**Öncelik: Orta**

#### Server Actions Testleri
```javascript
// __tests__/app/admin/actions/yazi.test.ts
import { createYazi, updateYazi } from '@/app/admin/actions';

describe('Yazı CRUD', () => {
  beforeEach(() => {
    // Mock Prisma
    // Mock auth session
  });
  
  it('should create a new yazı', async () => {
    const formData = new FormData();
    formData.append('title', 'Test Yazı');
    formData.append('content', '<p>Content</p>');
    // ...
    
    await createYazi(formData);
    
    // Assertions
    expect(prisma.yazi.create).toHaveBeenCalled();
  });
});
```

---

### 3. API Tests

**Öncelik: Düşük**

#### Uploadthing API
```javascript
// __tests__/api/uploadthing.test.ts
describe('Upload API', () => {
  it('should accept valid image uploads', async () => {
    // Test file upload
  });
  
  it('should reject files > 4MB', async () => {
    // Test file size limit
  });
});
```

---

## 📦 Kurulum (Gelecekte)

### 1. Dependencies Ekle

```bash
npm install --save-dev \
  jest \
  @testing-library/react \
  @testing-library/jest-dom \
  jest-environment-jsdom \
  @types/jest
```

veya Vitest için:

```bash
npm install --save-dev \
  vitest \
  @testing-library/react \
  @testing-library/jest-dom \
  @vitest/ui
```

### 2. Jest Config

```javascript
// jest.config.js
module.exports = {
  preset: 'next/jest',
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

### 3. Test Scripts

```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

## 🎯 Coverage Hedefi

| Kategori | Hedef Coverage |
|----------|----------------|
| **Sanitization** | 100% |
| **Password Validation** | 100% |
| **Auth Logic** | 90% |
| **Server Actions** | 80% |
| **Utility Functions** | 70% |

---

## 🔄 CI/CD Entegrasyonu

### GitHub Actions (Gelecekte)

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npm run build
```

---

## 📝 Best Practices

### 1. Test İsimlendirme

```javascript
// ✅ İyi
it('should reject passwords shorter than 8 characters', () => {});

// ❌ Kötü
it('test password', () => {});
```

### 2. AAA Pattern

```javascript
it('should create yazı with sanitized content', () => {
  // Arrange
  const dirtyContent = '<p>Hello</p><script>bad</script>';
  
  // Act
  const result = sanitizeHtml(dirtyContent);
  
  // Assert
  expect(result).not.toContain('<script>');
});
```

### 3. Mock Prisma

```javascript
// __mocks__/prisma.ts
export const prisma = {
  yazi: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};
```

---

## 🚀 Testleri Çalıştırma (Gelecekte)

### Tüm Testler
```bash
npm test
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage

# Coverage raporu: coverage/lcov-report/index.html
```

### Tek Test Dosyası
```bash
npm test -- sanitize.test.ts
```

---

## 🎓 Kayıtlar

- **Jest Docs:** https://jestjs.io/
- **Testing Library:** https://testing-library.com/
- **Vitest:** https://vitest.dev/
- **Next.js Testing:** https://nextjs.org/docs/app/building-your-application/testing

---

## 📌 Notlar

> ⚠️ **Şu Anda Test Yok**  
> Bu döküman gelecekteki test implementasyonu için hazırlanmıştır.  
> Production'da kritik özellikler manuel olarak test edilmelidir.

**Manual Test Checklist:**
- [ ] Admin giriş/çıkış
- [ ] Yazı oluşturma/düzenleme/silme
- [ ] Görsel yükleme
- [ ] Kategori ve yazar yönetimi
- [ ] Public sayfalar (yazı detay, liste, kategori)
- [ ] SEO metadata (Open Graph, Twitter Cards)
- [ ] Rate limiting
- [ ] Security headers

---

**Test yazmaya başlamak istiyorsanız:** `/docs/CONTRIBUTING.md` → "Adding Tests" bölümüne bakın.
