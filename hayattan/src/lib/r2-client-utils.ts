/**
 * Cloudflare R2'ye dosyayı server-side yükleyen yardımcı fonksiyon.
 * SSL sorunlarını önlemek için server üzerinden upload yapar.
 */
export async function uploadToR2(file: File) {
    // FormData oluştur
    const formData = new FormData();
    formData.append("file", file);

    // Server-side upload endpoint'ine gönder
    const response = await fetch("/api/r2/upload", {
        method: "POST",
        body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data?.error || "Dosya yükleme hatası.");
    }

    if (!data.success) {
        throw new Error(data?.error || "Upload başarısız.");
    }

    // Başarılı response
    return {
        url: data.url,
        key: data.key
    };
}
