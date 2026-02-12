/**
 * Cloudflare Worker Upload Client
 * Direct R2 integration via Workers - No SSL issues, 100MB+ support
 */

// Worker endpoints
const WORKER_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://hayattan-upload-worker.your-subdomain.workers.dev'
  : 'http://localhost:8787'; // Local dev

/**
 * Upload file to Cloudflare R2 via Worker
 */
export async function uploadToCloudflareWorker(file: File): Promise<{ url: string; key: string }> {
  try {
    // Get auth token (from session or API)
    const authToken = await getAuthToken();
    
    if (!authToken) {
      throw new Error('Authentication required');
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('file', file);

    // Upload to Cloudflare Worker
    const response = await fetch(`${WORKER_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(errorData.error || `Upload failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Upload failed');
    }

    return {
      url: data.url,
      key: data.key
    };

  } catch (error: any) {
    console.error('Cloudflare Worker upload error:', error);
    throw new Error('Upload failed: ' + error.message);
  }
}

/**
 * Get authentication token for Worker
 */
async function getAuthToken(): Promise<string | null> {
  try {
    // Get session from Next.js auth
    const response = await fetch('/api/auth/session');
    
    if (!response.ok) {
      return null;
    }

    const session = await response.json();
    
    if (!session?.user?.role || !['ADMIN', 'AUTHOR'].includes(session.user.role)) {
      return null;
    }

    // Generate simple token (in production, use JWT)
    const token = btoa(JSON.stringify({
      userId: session.user.id,
      role: session.user.role,
      timestamp: Date.now()
    }));

    return token;

  } catch (error) {
    console.error('Auth token error:', error);
    return null;
  }
}

/**
 * Fallback to Vercel API if Worker fails
 */
export async function uploadWithFallback(file: File): Promise<{ url: string; key: string }> {
  try {
    // Try Cloudflare Worker first
    return await uploadToCloudflareWorker(file);
  } catch (workerError) {
    console.warn('Cloudflare Worker failed, falling back to Vercel:', workerError);
    
    // Fallback to existing Vercel API
    const { uploadToR2 } = await import('./r2-client-utils');
    return await uploadToR2(file);
  }
}