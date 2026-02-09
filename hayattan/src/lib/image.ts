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
