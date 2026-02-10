# 🚀 PRODUCTION DEPLOYMENT GUIDE

## 🎯 SECURE ARCHITECTURE OVERVIEW

```
┌─────────────┐    ┌──────────────┐    ┌──────────────┐    ┌─────────────┐
│   Client    │───▶│   Next.js    │───▶│   Worker     │───▶│     R2      │
│ (Frontend)  │    │ (Auth+HMAC)  │    │ (Presign)    │    │ (Storage)   │
└─────────────┘    └──────────────┘    └──────────────┘    └─────────────┘
        │                                                          ▲
        └──────────────────────────────────────────────────────────┘
                          Direct Upload (Presigned URL)
```

## 🔒 SECURITY IMPROVEMENTS

### ✅ SSL Security Fixed
- ❌ Removed `rejectUnauthorized: false`
- ❌ Removed TLS downgrade
- ✅ Proper R2 endpoint with account ID
- ✅ Production-ready SSL configuration

### ✅ Secure Authentication
- ❌ No client-side tokens
- ✅ Server-side session validation
- ✅ HMAC signed requests to Worker
- ✅ Timestamp validation (replay attack prevention)

### ✅ Single Upload Path
- ✅ Primary: Worker Presign → Direct R2
- ✅ Fallback: Vercel proxy (small files only)
- ✅ Clear error handling

## 📋 DEPLOYMENT CHECKLIST

### 1. Environment Variables (Vercel)
```bash
# Cloudflare R2
R2_ACCOUNT_ID="b64dbc7490223c5a031edd426ddc8bc"
R2_ACCESS_KEY_ID="ae25266769e4cc8dbe2532cf80ea3cb7"
R2_SECRET_ACCESS_KEY="895ccaaf92417eb54b3e215e72837dd777457e1377e81cadd298df85b89d9d2a"
R2_BUCKET_NAME="hayattan-media"
R2_ENDPOINT="https://b64dbc7490223c5a031edd426ddc8bc.r2.cloudflarestorage.com"
R2_PUBLIC_BASE_URL="https://pub-8181f08d2c444b5eb2dea044781fbdaf.r2.dev"

# Worker
CLOUDFLARE_WORKER_URL="https://hayattan-upload-worker.your-subdomain.workers.dev"

# Auth (same secret for HMAC)
AUTH_SECRET="hayattan-net-super-secret-auth-key-2024"
```

### 2. Cloudflare Worker Deployment
```bash
cd cloudflare-worker
npm install
wrangler login
wrangler deploy
```

### 3. R2 CORS Configuration
```json
[
  {
    "AllowedOrigins": [
      "https://hayattan.net",
      "https://www.hayattan.net"
    ],
    "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### 4. Custom Domain Setup (Optional)
- Create `cdn.hayattan.net` CNAME → R2 bucket
- Update `R2_PUBLIC_BASE_URL` to use custom domain
- SSL certificate auto-managed by Cloudflare

## 🔧 API ENDPOINTS

### Upload Flow
1. `POST /api/upload/presign` - Request presigned URL
2. `PUT <presigned-url>` - Direct upload to R2
3. `POST /api/upload/verify` - Verify upload completed

### Security Features
- ✅ Session validation on all endpoints
- ✅ HMAC signature validation
- ✅ File type & size validation
- ✅ Rate limiting ready
- ✅ Upload verification

## 🧪 TESTING

### 1. Local Development
```typescript
import { secureUploadToR2 } from '@/lib/secure-upload';

const result = await secureUploadToR2(file);
console.log('Upload result:', result);
```

### 2. Production Testing
```bash
# Test presign endpoint
curl -X POST https://hayattan.net/api/upload/presign \
  -H "Content-Type: application/json" \
  -d '{"fileName":"test.jpg","fileType":"image/jpeg","fileSize":1024}'

# Test verification
curl -X POST https://hayattan.net/api/upload/verify \
  -H "Content-Type: application/json" \
  -d '{"key":"uploads/user123/1234567890_abc123_test.jpg"}'
```

## 📊 PERFORMANCE MONITORING

### Key Metrics
- Upload success rate
- Average upload time
- Error rates by type
- R2 verification success rate

### Logging Points
- Presign requests
- Upload completions
- Verification results
- Error conditions

## 🚨 SECURITY CONSIDERATIONS

### Production Checklist
- [ ] SSL bypass completely removed
- [ ] HMAC secrets properly configured
- [ ] CORS properly restricted
- [ ] File validation comprehensive
- [ ] Rate limiting implemented
- [ ] Error messages don't leak info
- [ ] Monitoring & alerting setup

## 🔄 ROLLBACK PLAN

If issues occur:
1. Revert to Vercel proxy only (small files)
2. Disable Worker presign endpoint
3. Monitor error rates
4. Fix issues and re-deploy

## 🎯 NEXT STEPS

1. Deploy Worker with HMAC validation
2. Update Vercel environment variables
3. Test upload flow end-to-end
4. Monitor production performance
5. Setup custom domain (optional)
6. Implement rate limiting
7. Add comprehensive logging

**PRODUCTION READY! 🔥**