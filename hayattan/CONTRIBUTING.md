# Contributing to Hayattan.Net

Hayattan.Net'e katkıda bulunduğunuz için teşekkürler! 🎉

## 📋 İçindekiler

- [Kod Standartları](#kod-standartları)
- [Git Workflow](#git-workflow)
- [Development Setup](#development-setup)
- [Coding Guidelines](#coding-guidelines)
- [Testing](#testing)
- [Pull Request Süreci](#pull-request-süreci)

## 🎨 Kod Standartları

### TypeScript

- **Strict mode** kullanın
- Tüm fonksiyonlara **tip tanımlamaları** ekleyin
- `any` kullanmaktan kaçının, `unknown` tercih edin
- Interface yerine `type` kullanın (consistency için)

**İyi örnek:**
```typescript
type UserData = {
  id: string;
  name: string;
  email: string;
};

function getUserById(id: string): Promise<UserData | null> {
  // ...
}
```

**Kötü örnek:**
```typescript
function getUserById(id: any) {  // ❌ any kullanımı
  // ...
}
```

### React Components

- **Functional components** kullanın
- Mümkün olduğunca **Server Components** tercih edin
- Client components için `"use client"` directive ekleyin
- Props için **type definitions** yazın

**Component örneği:**
```typescript
"use client";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
};

export function Button({ children, onClick, variant = "primary" }: ButtonProps) {
  // ...
}
```

### File & Folder Naming

- **Components**: PascalCase (`UserCard.tsx`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Page routes**: kebab-case klasörler
- **Constants**: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)

**Klasör yapısı:**
```
src/
├── components/
│   ├── admin/          # Admin-specific components
│   │   ├── YaziForm.tsx
│   │   └── ImageUpload.tsx
│   └── ui/             # Reusable UI components
│       ├── Button.tsx
│       └── Card.tsx
├── lib/                # Utilities & helpers
│   ├── auth.ts
│   ├── seo.ts
│   └── utils.ts
└── types/              # Shared type definitions
    └── index.ts
```

## 🌿 Git Workflow

### Branch Naming

- `feature/` - Yeni özellikler (`feature/user-profile`)
- `fix/` - Bug düzeltmeleri (`fix/login-error`)
- `refactor/` - Kod iyileştirmeler (`refactor/api-structure`)
- `docs/` - Dokümantasyon (`docs/api-guide`)

### Commit Messages

[Conventional Commits](https://www.conventionalcommits.org/) standardını kullanın:

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Types:**
- `feat:` - Yeni özellik
- `fix:` - Bug düzeltmesi
- `docs:` - Dokümantasyon
- `style:` - Kod formatı (işlevsellik değişikliği yok)
- `refactor:` - Kod iyileştirme
- `test:` - Test ekleme/düzeltme
- `chore:` - Build, dependency güncellemeleri

**Örnekler:**
```bash
feat(admin): add bulk delete for articles
fix(auth): resolve session timeout issue
docs(readme): update installation instructions
refactor(seo): extract metadata generation to utility
```

## 💻 Development Setup

### 1. Fork & Clone

```bash
# Fork repo on GitHub, then:
git clone https://github.com/YOUR_USERNAME/hayattan.git
cd hayattan
git remote add upstream https://github.com/ORIGINAL_OWNER/hayattan.git
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

```bash
cp .env.example .env
# Edit .env with your credentials
```

### 4. Database Setup

```bash
npx prisma db push
npx prisma db seed  # Optional
```

### 5. Start Development

```bash
npm run dev
```

## 📝 Coding Guidelines

### 1. Component Structure

```typescript
// Imports (external first, then internal)
import { useState } from "react";
import { prisma } from "@/lib/db";

// Type definitions
type Props = {
  // ...
};

// Component
export function ComponentName({ prop1, prop2 }: Props) {
  // 1. Hooks
  const [state, setState] = useState();
  
  // 2. Event handlers
  const handleClick = () => {
    // ...
  };
  
  // 3. JSX
  return (
    <div>
      {/* ... */}
    </div>
  );
}
```

### 2. Server Actions

- `src/app/admin/actions.ts` dosyasında tanımlayın
- `"use server"` directive ekleyin
- Input validation yapın (Zod kullanın)
- Sanitize edin (DOMPurify/sanitize.ts)

```typescript
"use server";

import { z } from "zod";
import { sanitizeText } from "@/lib/sanitize";

const schema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
});

export async function createArticle(formData: FormData) {
  // Validate
  const data = schema.parse({
    title: formData.get("title"),
    content: formData.get("content"),
  });
  
  // Sanitize
  const sanitized = {
    title: sanitizeText(data.title),
    content: sanitizeHtml(data.content),
  };
  
  // Process
  // ...
}
```

### 3. Error Handling

```typescript
try {
  await riskyOperation();
} catch (error) {
  // Type-safe error handling
  if (error instanceof PrismaClientKnownRequestError) {
    // Handle Prisma errors
  } else if (error instanceof Error) {
    console.error("Error:", error.message);
  } else {
    console.error("Unknown error:", error);
  }
}
```

### 4. Async/Await

- Promise.all kullanarak paralel işlemleri optimize edin
- Error handling yapmayı unutmayın

```typescript
// ✅ Good - Parallel
const [users, posts] = await Promise.all([
  getUsers(),
  getPosts(),
]);

// ❌ Bad - Sequential
const users = await getUsers();
const posts = await getPosts();
```

## 🧪 Testing

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
npm run lint:fix  # Auto-fix
```

### Build

```bash
npm run build
```

## 🔄 Pull Request Süreci

### 1. Hazırlık

```bash
# Upstream'den güncel kodu çekin
git fetch upstream
git checkout main
git merge upstream/main

# Feature branch oluşturun
git checkout -b feature/my-feature
```

### 2. Değişiklikler

- Kod yazın
- Commit'leyin (Conventional Commits)
- Test edin

```bash
git add .
git commit -m "feat(component): add new feature"
```

### 3. Push & PR

```bash
git push origin feature/my-feature
```

GitHub'da Pull Request açın:

**PR Template:**
```markdown
## Değişiklikler

- [ ] Özellik X eklendi
- [ ] Bug Y düzeltildi

## Test

- [ ] Type check passed
- [ ] Build successful
- [ ] Manually tested

## Screenshots (varsa)

...

## İlgili Issue

Closes #123
```

### 4. Code Review

- Maintainer'ların geri bildirimini bekleyin
- Gerekirse değişiklik yapın
- Merge onayı gelince merge edilir

## ⚠️ Önemli Notlar

### Security

- Asla sensitive data commit'lemeyin (`.env`, API keys)
- Password'ları hash'leyin
- Input'ları her zaman sanitize edin
- SQL injection'a karşı Prisma kullanın

### Performance

- N+1 query'lerden kaçının (Prisma `include` kullanın)
- Gereksiz re-render'lardan kaçının
- Image'leri optimize edin (Next.js Image)
- Database index'leri kontrol edin

### Accessibility

- Semantic HTML kullanın
- ARIA labels ekleyin
- Keyboard navigation destekleyin
- Alt text ekleyin (görsellere)

## 📚 Kaynaklar

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Docs](https://react.dev/)

## 💬 Sorular?

- GitHub Issues açın
- Discussions kullanın
- Email: [email@example.com](mailto:email@example.com)

---

**Teşekkürler! Happy coding! 🚀**
