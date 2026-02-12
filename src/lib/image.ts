/** Harici (http/https) URL'ler Next.js image proxy'sinden geçince timeout olabiliyor; unoptimized ile tarayıcı doğrudan yükler. */
export function isExternalImageUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") return false;
  return url.startsWith("http://") || url.startsWith("https://");
}

/** next/image için geçerli src: mutlak URL veya / ile başlayan yol. Geçersiz (örn. "Talas") için false. */
export function isValidImageSrc(src: string | null | undefined): boolean {
  if (!src || typeof src !== "string" || !src.trim()) return false;
  return src.startsWith("/") || src.startsWith("http://") || src.startsWith("https://");
}

/**
 * Eğer URL 'hayattan.net' domain'ini içeriyorsa (örn: https://hayattan.net/wp-content/...),
 * bunu relative path'e (/wp-content/...) çevirir.
 * Bu, Next.js'in kendi kendine (loopback) istek atıp 502 hatası vermesini engeller.
 */
export function normalizeImageUrl(url: string | null | undefined): string | null | undefined {
  if (!url || typeof url !== "string") return url;

  // Zaten relative ise dokunma
  if (url.startsWith("/")) return url;

  // Kendi domainimiz ise relative yap
  if (url.includes("hayattan.net")) {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname + urlObj.search;
    } catch (e) {
      // URL bozuksa olduğu gibi döndür
      return url;
    }
  }

  return url;
}
