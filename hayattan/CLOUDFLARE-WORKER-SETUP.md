# 🚀 Cloudflare Worker Upload System Setup

## 🎯 Overview
Cloudflare Workers + R2 = Perfect file upload solution!
- ✅ No SSL issues
- ✅ 100MB+ file support
- ✅ Edge performance
- ✅ Native R2 integration

## 📋 Prerequisites
1. Cloudflare account
2. R2 bucket: `hayattan-media` (already created)
3. Wrangler CLI installed

## 🔧 Installation Steps

### 1. Install Wrangler CLI
```bash
npm install -g wrangler
```

### 2. Login to Cloudflare
```bash
wrangler login
```

### 3. Navigate to Worker Directory
```bash
cd cloudflare-worker
npm install
```

### 4. Configure R2 Binding
```bash
# Link R2 bucket to worker
wrangler r2 bucket create hayattan-media # (if not exists)
```

### 5. Deploy Worker
```bash
# Development
npm run dev

# Production
npm run deploy
```

## 🌐 Worker Endpoints

### Upload Endpoint
```
POST https://hayattan-upload-worker.your-subdomain.workers.dev/upload
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body:**
```
FormData with 'file' field
```

**Response:**
```json
{
  "success": true,
  "url": "https://pub-xxx.r2.dev/uploads/...",
  "key": "uploads/timestamp_random_filename",
  "size": 1234567,
  "type": "image/jpeg"
}
```

### Presign Endpoint (for very large files)
```
POST https://hayattan-upload-worker.your-subdomain.workers.dev/presign
```

## 🔒 Authentication
Worker uses Bearer token authentication:
- Token contains user ID, role, timestamp
- Validates ADMIN/AUTHOR roles
- Simple base64 encoding (upgrade to JWT in production)

## 🌍 Custom Domain Setup (Optional)

### 1. Add Route in Cloudflare Dashboard
```
Route: hayattan.net/api/upload/*
Worker: hayattan-upload-worker
```

### 2. Update Frontend Config
```typescript
const WORKER_BASE_URL = 'https://hayattan.net/api/upload';
```

## 🧪 Testing

### 1. Local Development
```bash
cd cloudflare-worker
npm run dev
# Worker runs on http://localhost:8787
```

### 2. Test Upload
```bash
curl -X POST http://localhost:8787/upload \
  -H "Authorization: Bearer test-token" \
  -F "file=@test-image.jpg"
```

## 🔄 Frontend Integration

### Option 1: Direct Worker Usage
```typescript
import { uploadToCloudflareWorker } from '@/lib/cloudflare-upload';

const result = await uploadToCloudflareWorker(file);
```

### Option 2: Fallback System
```typescript
import { uploadWithFallback } from '@/lib/cloudflare-upload';

const result = await uploadWithFallback(file);
// Tries Worker first, falls back to Vercel API
```

## 📊 Performance Comparison

| Feature | Vercel Serverless | Cloudflare Workers |
|---------|------------------|-------------------|
| File Size Limit | 4.5MB | 100MB+ |
| Timeout | 10s-60s | 30s-15min |
| Cold Start | 100-500ms | 1-5ms |
| SSL Issues | Yes (R2) | No |
| Pricing | Function calls | Requests |
| R2 Integration | SDK (complex) | Native binding |

## 🚀 Deployment Checklist

- [ ] Wrangler CLI installed
- [ ] Cloudflare login completed
- [ ] R2 bucket linked
- [ ] Worker deployed
- [ ] Authentication tested
- [ ] Frontend integration
- [ ] Custom domain (optional)
- [ ] Production testing

## 🔧 Environment Variables

Update `wrangler.toml`:
```toml
[vars]
ALLOWED_ORIGINS = "https://hayattan.net,https://www.hayattan.net"
MAX_FILE_SIZE = "104857600" # 100MB
AUTH_SECRET = "your-secret-key"
```

## 🎯 Next Steps

1. Deploy worker: `npm run deploy`
2. Test upload functionality
3. Update frontend to use Worker
4. Monitor performance
5. Setup custom domain (optional)

**Cloudflare Workers = Ultimate upload solution!** 🔥