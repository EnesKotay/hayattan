/**
 * Uploadthing ile dosya yükleme - SSL sorunları yok!
 * Geçici çözüm olarak Uploadthing kullanıyoruz.
 */
export async function uploadToR2(file: File) {
    // Uploadthing client kullan
    const { uploadFiles } = await import("uploadthing/client");
    
    try {
        const response = await uploadFiles("articleImage", {
            files: [file]
        });

        if (!response || response.length === 0) {
            throw new Error("Upload başarısız - response boş");
        }

        const uploadedFile = response[0];
        
        if (uploadedFile.error) {
            throw new Error(uploadedFile.error.message);
        }

        // Uploadthing URL formatı
        return {
            url: uploadedFile.url,
            key: uploadedFile.key
        };
        
    } catch (error: any) {
        throw new Error("Uploadthing hatası: " + error.message);
    }
}
