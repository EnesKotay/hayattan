/**
 * Cloudflare R2'ye dosyayı server-side yükleyen yardımcı fonksiyon.
 * SSL sorunlarını önlemek için presigned URL yerine server upload kullanır.
 */
export async function uploadToR2(file: File) {
    // FormData oluştur
    const formData = new FormData();
    formData.append('file', file);

    // Server-side upload endpoint'ine gönder
    const res = await fetch("/api/r2/upload", {
        method: "POST",
        body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data?.error || "Dosya yüklenemedi.");
    }

    if (!data.success) {
        throw new Error(data?.error || "Upload başarısız.");
    }

    // Sitenin geri kalanında kullanılacak URL
    return {
        url: data.url,
        key: data.key
    };
}
