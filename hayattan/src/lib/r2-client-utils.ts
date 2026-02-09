/**
 * Cloudflare R2'ye dosyayı direkt (client-side) yükleyen yardımcı fonksiyon.
 * Presigned URL yaklaşımını kullanır.
 */
export async function uploadToR2(file: File) {
    // 1. Presigned URL al
    const res = await fetch("/api/r2/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            size: file.size
        }),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data?.error || "Yükleme izni (Presign) alınamadı.");
    }

    const { uploadUrl, publicUrl } = data;

    // 2. Dosyayı direkt R2'ye (S3) yükle
    const putRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
            "Content-Type": file.type,
            // Not: Cache-Control gibi headerlar presign aşamasında command'e eklendiği için burada gerek yok, 
            // ama bazı S3 implementasyonları Content-Type'ın eşleşmesini bekler.
        },
        body: file,
    });

    if (!putRes.ok) {
        throw new Error("Dosya R2 sunucusuna iletilemedi. (Bağlantı hatası)");
    }

    // Sitenin geri kalanında kullanılacak URL (publicUrl)
    return {
        url: publicUrl,
        key: data.key
    };
}
