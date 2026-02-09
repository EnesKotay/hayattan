# API Documentation

Hayattan.Net API dokümantasyonu. Tüm admin işlemleri **Server Actions** ile yapılır.

## 📋 İçindekiler

- [Server Actions](#server-actions)
- [API Routes](#api-routes)
- [Authentication](#authentication)
- [Error Handling](#error-handling)

## 🔧 Server Actions

Tüm server actions `src/app/admin/actions.ts` dosyasında tanımlıdır.

### Yazı İşlemleri

#### `createYazi(formData: FormData)`

Yeni yazı oluşturur.

**Form Fields:**
```typescript
{
  title: string;          // (required)
  slug: string;           // (required, unique)
  excerpt?: string;       // Özet
  content: string;        // HTML content (required)
  featuredImage?: string; // URL
  imageAlt?: string;      // Alt text
  showInSlider: boolean;  // Ana sayfa slider
  authorId: string;       // (required)
  kategoriIds: string[];  // Array of category IDs
  publishedAt?: string;   // ISO date or null
  // SEO fields
  metaDescription?: string;  // Max 160 chars
  metaKeywords?: string;     // Comma-separated
  ogImage?: string;          // Custom OG image URL
}
```

**Returns:**
```typescript
void // Redirects to /admin/yazilar
```

**Example Usage:**
```tsx
<form action={createYazi}>
  <input name="title" required />
  <input name="slug" required />
  <textarea name="content" required />
  {/* ... */}
  <button type="submit">Kaydet</button>
</form>
```

---

#### `updateYazi(formData: FormData)`

Mevcut yazıyı günceller.

**Form Fields:**
Aynı `createYazi` ile artı:
```typescript
{
  id: string; // (required) Güncellenecek yazının ID'si
}
```

**Returns:**
```typescript
void // Redirects to /admin/yazilar
```

---

#### `deleteYazi(id: string)`

Yazıyı siler.

**Parameters:**
- `id` (string): Silinecek yazının ID'si

**Returns:**
```typescript
void // Revalidates /admin/yazilar
```

**Example:**
```tsx
<form action={() => deleteYazi(yazi.id)}>
  <button type="submit">Sil</button>
</form>
```

---

### Kategori İşlemleri

#### `createKategori(formData: FormData)`

Yeni kategori oluşturur.

**Form Fields:**
```typescript
{
  name: string;         // (required)
  slug: string;         // (required, unique)
  description?: string; // Açıklama
}
```

---

#### `updateKategori(formData: FormData)`

Kategori günceller.

**Form Fields:**
```typescript
{
  id: string;           // (required)
  name: string;
  slug: string;
  description?: string;
}
```

---

#### `deleteKategori(id: string)`

Kategori siler.

---

### Yazar İşlemleri

#### `createYazar(formData: FormData)`

Yeni yazar oluşturur.

**Form Fields:**
```typescript
{
  name: string;       // (required)
  slug: string;       // (required, unique)
  email?: string;
  photo?: string;     // URL
  biyografi?: string; // HTML
  misafir: boolean;   // Default: false
}
```

---

#### `updateYazar(formData: FormData)`

Yazar günceller.

---

#### `deleteYazar(id: string)`

Yazar siler.

---

### Haber İşlemleri (Slider)

#### `createHaber(formData: FormData)`

Slider haberi oluşturur.

**Form Fields:**
```typescript
{
  title: string;    // (required)
  slug: string;     // (required)
  excerpt?: string;
  image?: string;   // URL
  order: number;    // Sıralama (default: 0)
  active: boolean;  // Aktif/pasif
}
```

---

#### `updateHaber(formData: FormData)`

Slider haberini günceller.

---

#### `deleteHaber(id: string)`

Slider haberini siler.

---

### Diğer İşlemler

#### `getAdSlots()`

Reklam slot'larını getirir.

**Returns:**
```typescript
Record<string, string | null>
// Example: { "home-top": "Ad HTML", "yazi-bottom": null }
```

---

#### `updateAdSlot(formData: FormData)`

Reklam slot'unu günceller.

**Form Fields:**
```typescript
{
  slotId: string;  // (required) Slot identifier
  content: string; // HTML content
}
```

---

## 🌐 API Routes

### `/api/uploadthing`

File upload endpoint (Uploadthing).

**Method:** `POST`

**Authentication:** Required (NextAuth session)

**Request:**
```typescript
FormData {
  file: File // Image file (max 4MB)
}
```

**Response:**
```typescript
{
  url: string; // Uploaded file URL (CDN)
}
```

**Error Responses:**
```typescript
401: { error: "Yetkisiz erişim" }
400: { error: "Invalid file type" }
413: { error: "File too large (max 4MB)" }
500: { error: "Upload failed" }
```

---

## 🔐 Authentication

### NextAuth Session

Her server action ve protected route NextAuth session kontrolü yapar.

**Session Check:**
```typescript
import { auth } from "@/lib/auth";

const session = await auth();
if (!session?.user) {
  redirect("/admin/login");
}
```

**Session Object:**
```typescript
{
  user: {
    id: string;
    email: string;
    name: string;
  };
  expires: string; // ISO date
}
```

---

## ⚠️ Error Handling

### Server Actions

Server actions hata durumunda redirect yapar:

```typescript
try {
  await prisma.yazi.create({ ... });
} catch (error) {
  console.error("Error:", error);
  redirect("/admin/yazilar?error=true");
}
```

### Error Query Parameters

URL'de hata durumu:
```
/admin/yazilar?error=true
/admin/yazilar?success=true
```

Client-side bu parametreleri okuyarak toast gösterebilir.

---

## 🛡️ Security

### Input Validation

Her server action **Zod** ile validate edilir:

```typescript
const schema = z.object({
  title: z.string().min(1, "Başlık gerekli"),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Geçersiz slug"),
});

const validated = schema.parse(data);
```

### Sanitization

HTML content **DOMPurify** ile sanitize edilir:

```typescript
import { sanitizeHtml } from "@/lib/sanitize";

const safeContent = sanitizeHtml(rawContent);
```

### Rate Limiting

Admin actions rate limit kontrolü yapar:

```typescript
import { checkRateLimit } from "@/lib/rate-limit";

const rateLimitResult = await checkRateLimit(userIp, "admin");
if (!rateLimitResult.success) {
  throw new Error("Too many requests");
}
```

---

## 📊 Response Revalidation

Server actions başarılı olunca ilgili path'leri revalidate eder:

```typescript
import { revalidatePath } from "next/cache";

await prisma.yazi.create({ ... });

// Revalidate affected pages
revalidatePath("/");
revalidatePath("/yazilar");
revalidatePath("/admin/yazilar");
```

---

## 🧪 Testing API

### Using curl

```bash
# Not recommended - use browser forms instead
# Server actions are CSRF-protected
```

### Using Browser

1. Login to admin panel
2. Use the forms (automatic CSRF protection)
3. Check Network tab for responses

---

## 📚 Type Definitions

Tüm types `src/types/index.ts` dosyasında:

```typescript
import type { Yazi, YaziFormData, ApiResponse } from "@/types";
```

---

## 🔗 Kaynaklar

- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [NextAuth.js](https://next-auth.js.org/)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [Uploadthing](https://docs.uploadthing.com/)

---

**Last Updated:** 2026-02-03
