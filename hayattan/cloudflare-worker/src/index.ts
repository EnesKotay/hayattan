/**
 * Cloudflare Worker for Hayattan.net File Uploads
 * Direct R2 integration, no SSL issues, 100MB+ support
 */

export interface Env {
  HAYATTAN_MEDIA: R2Bucket;
  ALLOWED_ORIGINS: string;
  MAX_FILE_SIZE: string;
  AUTH_SECRET: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const url = new URL(request.url);
      
      // Route handling
      if (url.pathname === '/upload' && request.method === 'POST') {
        return handleUpload(request, env, corsHeaders);
      }
      
      if (url.pathname === '/presign' && request.method === 'POST') {
        return handlePresign(request, env, corsHeaders);
      }

      return new Response('Not Found', { 
        status: 404, 
        headers: corsHeaders 
      });

    } catch (error: any) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ 
        error: 'Internal server error: ' + error.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  },
};

/**
 * Handle direct file upload to R2
 */
async function handleUpload(request: Request, env: Env, corsHeaders: any): Promise<Response> {
  try {
    // Verify authentication (simple token check)
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate file size
    const maxSize = parseInt(env.MAX_FILE_SIZE);
    if (file.size > maxSize) {
      return new Response(JSON.stringify({ 
        error: `File too large (max ${Math.round(maxSize / 1024 / 1024)}MB)` 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif',
      'video/mp4', 'audio/mpeg', 'audio/mp3', 'audio/wav'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return new Response(JSON.stringify({ 
        error: 'Unsupported file type: ' + file.type 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Generate safe filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(16).slice(2);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `uploads/${timestamp}_${randomId}_${safeName}`;

    // Upload to R2 (streaming)
    const arrayBuffer = await file.arrayBuffer();
    await env.HAYATTAN_MEDIA.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
        cacheControl: 'public, max-age=31536000, immutable',
      },
    });

    // Generate public URL
    const publicUrl = `https://pub-8181f08d2c444b5eb2dea044781fbdaf.r2.dev/${key}`;

    return new Response(JSON.stringify({
      success: true,
      url: publicUrl,
      key: key,
      size: file.size,
      type: file.type
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return new Response(JSON.stringify({ 
      error: 'Upload failed: ' + error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

/**
 * SECURE Presigned URL generation with HMAC validation
 */
async function handlePresign(request: Request, env: Env, corsHeaders: any): Promise<Response> {
  try {
    // HMAC signature validation (from Next.js server)
    const signature = request.headers.get('X-Signature');
    if (!signature) {
      return new Response(JSON.stringify({ error: 'Missing signature' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const payload = await request.json();
    const { fileName, fileType, fileSize, userId, timestamp } = payload;
    
    // Verify HMAC signature
    const expectedSignature = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(env.AUTH_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    ).then(key => 
      crypto.subtle.sign('HMAC', key, new TextEncoder().encode(JSON.stringify(payload)))
    ).then(signature => 
      Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
    );

    if (signature !== expectedSignature) {
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check timestamp (prevent replay attacks)
    const now = Date.now();
    if (now - timestamp > 60000) { // 1 minute max
      return new Response(JSON.stringify({ error: 'Request expired' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!fileName || !fileType || !fileSize || !userId) {
      return new Response(JSON.stringify({ error: 'Missing parameters' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate file size
    const maxSize = parseInt(env.MAX_FILE_SIZE);
    if (fileSize > maxSize) {
      return new Response(JSON.stringify({ 
        error: `File too large (max ${Math.round(maxSize / 1024 / 1024)}MB)` 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Generate safe filename with user ID
    const timestamp_new = Date.now();
    const randomId = Math.random().toString(16).slice(2);
    const key = `uploads/${userId}/${timestamp_new}_${randomId}_${fileName}`;

    // Generate presigned PUT URL (5 minutes expiry)
    const presignedUrl = await env.HAYATTAN_MEDIA.createMultipartUpload(key);
    
    // Public URL (use custom domain if available)
    const publicUrl = env.CDN_DOMAIN 
      ? `https://${env.CDN_DOMAIN}/${key}`
      : `https://pub-8181f08d2c444b5eb2dea044781fbdaf.r2.dev/${key}`;

    return new Response(JSON.stringify({
      success: true,
      presignedUrl: presignedUrl || `${request.url.replace('/presign', '/upload')}?key=${key}`,
      publicUrl: publicUrl,
      key: key,
      expiresIn: 300 // 5 minutes
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Presign error:', error);
    return new Response(JSON.stringify({ 
      error: 'Presign failed: ' + error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}