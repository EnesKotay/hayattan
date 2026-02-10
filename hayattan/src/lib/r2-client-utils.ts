/**
 * SMART Cloudflare R2 Upload System
 * - Küçük dosyalar (≤4MB): Server proxy (hızlı)
 * - Büyük dosyalar (>4MB): Presigned URL (Vercel limit bypass)
 */
export async function uploadToR2(file: File) {
    const fileSize = file.size;
    const maxServerSize = 4 * 1024 * 1024; // 4MB - Vercel limit
    
    try {
        if (fileSize <= maxServerSize) {
            // KÜÇÜK DOSYA: Server proxy kullan
            return await uploadViaServer(file);
        } else {
            // BÜYÜK DOSYA: Presigned URL kullan
            return await uploadViaPresigned(file);
        }
    } catch (error: any) {
        throw new Error("Cloudflare R2 hatası: " + error.message);
    }
}

/**
 * Küçük dosyalar için server proxy upload
 */
async function uploadViaServer(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await fetch("/api/r2/upload", {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server upload hatası: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
        throw new Error(data.error || "Server upload başarısız");
    }

    return {
        url: data.url,
        key: data.key
    };
}

/**
 * Büyük dosyalar için presigned URL upload
 */
async function uploadViaPresigned(file: File) {
    // 1. Presigned URL al
    const presignResponse = await fetch("/api/r2/presign-large", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size
        })
    });

    if (!presignResponse.ok) {
        const errorText = await presignResponse.text();
        throw new Error(`Presign hatası: ${presignResponse.status} - ${errorText}`);
    }

    const presignData = await presignResponse.json();
    
    if (!presignData.success) {
        throw new Error(presignData.error || "Presign başarısız");
    }

    // 2. Dosyayı direkt R2'ye yükle
    const uploadResponse = await fetch(presignData.presignedUrl, {
        method: "PUT",
        body: file,
        headers: {
            "Content-Type": file.type,
        }
    });

    if (!uploadResponse.ok) {
        throw new Error(`R2 direct upload hatası: ${uploadResponse.status}`);
    }

    return {
        url: presignData.publicUrl,
        key: presignData.key
    };
}
