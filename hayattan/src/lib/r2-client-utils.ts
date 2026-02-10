/**
 * Cloudflare R2 ile dosya yükleme - Server-side proxy ile SSL bypass
 * Client → Vercel → R2 (SSL sorunları server tarafında çözülür)
 */
export async function uploadToR2(file: File) {
    // FormData ile R2 server-side endpoint'ine gönder
    const formData = new FormData();
    formData.append("file", file);
    
    try {
        const response = await fetch("/api/r2/upload", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`R2 Upload hatası: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || "R2 upload başarısız");
        }

        // Cloudflare R2 URL formatı
        return {
            url: data.url,
            key: data.key
        };
        
    } catch (error: any) {
        throw new Error("Cloudflare R2 hatası: " + error.message);
    }
}
