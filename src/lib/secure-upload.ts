/**
 * PRODUCTION-READY SECURE UPLOAD SYSTEM
 * Single path: Next.js → Worker → R2 (presigned)
 * No client-side tokens, proper validation, upload verification
 */

interface UploadResult {
  url: string;
  key: string;
  verified: boolean;
}

/**
 * Secure upload with verification
 */
export async function secureUploadToR2(file: File): Promise<UploadResult> {
  try {
    // 1. VALIDATE FILE CLIENT-SIDE (early check)
    validateFile(file);

    // 2. REQUEST PRESIGNED URL (server validates session)
    const presignData = await requestPresignedUrl(file);

    // 3. UPLOAD TO R2 (direct, no tokens)
    await uploadToR2Direct(file, presignData.presignedUrl);

    // 4. VERIFY UPLOAD COMPLETED
    const verified = await verifyUpload(presignData.key);

    return {
      url: presignData.publicUrl,
      key: presignData.key,
      verified
    };

  } catch (error: any) {
    console.error('Secure upload error:', error);
    throw new Error('Upload failed: ' + error.message);
  }
}

/**
 * Client-side file validation (early check)
 */
function validateFile(file: File): void {
  // File size check
  const maxSize = 100 * 1024 * 1024; // 100MB
  if (file.size > maxSize) {
    throw new Error(`File too large (max 100MB)`);
  }

  // File type check
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif',
    'video/mp4', 'audio/mpeg', 'audio/mp3', 'audio/wav'
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Unsupported file type: ${file.type}`);
  }

  // File name check
  if (file.name.length > 255) {
    throw new Error('File name too long');
  }
}

/**
 * Request presigned URL from secure Next.js API
 */
async function requestPresignedUrl(file: File): Promise<{
  presignedUrl: string;
  publicUrl: string;
  key: string;
  expiresIn: number;
}> {
  const response = await fetch('/api/upload/presign', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Presign failed' }));
    throw new Error(errorData.error || `Presign failed: ${response.status}`);
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Presign failed');
  }

  return {
    presignedUrl: data.presignedUrl,
    publicUrl: data.publicUrl,
    key: data.key,
    expiresIn: data.expiresIn
  };
}

/**
 * Upload file directly to R2 using presigned URL
 */
async function uploadToR2Direct(file: File, presignedUrl: string): Promise<void> {
  const response = await fetch(presignedUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    }
  });

  if (!response.ok) {
    throw new Error(`R2 upload failed: ${response.status}`);
  }
}

/**
 * Verify upload completed successfully
 */
async function verifyUpload(key: string): Promise<boolean> {
  try {
    const response = await fetch('/api/upload/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key })
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.verified === true;

  } catch (error) {
    console.error('Upload verification error:', error);
    return false;
  }
}

/**
 * Fallback to Vercel API if Worker fails
 */
export async function uploadWithSecureFallback(file: File): Promise<UploadResult> {
  try {
    // Try secure Worker presign first
    return await secureUploadToR2(file);
  } catch (workerError) {
    console.warn('Secure upload failed, falling back to Vercel:', workerError);
    
    // Fallback to Vercel server proxy (for small files only)
    if (file.size <= 4 * 1024 * 1024) { // 4MB limit
      const { uploadToR2 } = await import('./r2-client-utils');
      const result = await uploadToR2(file);
      return {
        ...result,
        verified: false // Vercel fallback doesn't verify
      };
    } else {
      throw new Error('File too large for fallback method');
    }
  }
}