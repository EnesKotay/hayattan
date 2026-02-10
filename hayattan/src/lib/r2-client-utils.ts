/**
 * Uploadthing ile dosya yükleme - SSL sorunları yok!
 * R2 SSL sorunları nedeniyle Uploadthing kullanıyoruz.
 */
export async function uploadToR2(file: File) {
    // FormData ile uploadthing endpoint'ine gönder
    const formData = new FormData();
    formData.append("files", file);
    
    try {
        const response = await fetch("/api/uploadthing", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Upload hatası: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        
        if (!data || !data[0]) {
            throw new Error("Upload response boş");
        }

        const uploadedFile = data[0];
        
        // Uploadthing URL formatı
        return {
            url: uploadedFile.url,
            key: uploadedFile.key || uploadedFile.name
        };
        
    } catch (error: any) {
        throw new Error("Upload hatası: " + error.message);
    }
}
