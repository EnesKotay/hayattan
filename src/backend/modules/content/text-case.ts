/**
 * Türkçe büyük/küçük harf düzeltmeleri.
 * Örn: "ahmet yılmaz" → "Ahmet Yılmaz", "JOHN" → "John"
 */
const LOCALE_TR = "tr-TR";

/**
 * Metni Türkçe kurallarına göre "Başlık Düzeni"ne çevirir:
 * Her kelimenin ilk harfi büyük, diğerleri küçük (İ/i, I/ı ayrımı doğru).
 */
export function titleCase(str: string): string {
  if (!str || typeof str !== "string") return str;
  const trimmed = str.trim();
  if (!trimmed) return trimmed;
  return trimmed
    .split(/\s+/)
    .map((word) => {
      if (!word) return word;
      const lower = word.toLocaleLowerCase(LOCALE_TR);
      const first = lower.charAt(0).toLocaleUpperCase(LOCALE_TR);
      const rest = lower.slice(1);
      return first + rest;
    })
    .join(" ");
}

/**
 * Cümle düzeni: Sadece ilk harf büyük, diğerleri küçük.
 */
export function sentenceCase(str: string): string {
  if (!str || typeof str !== "string") return str;
  const trimmed = str.trim();
  if (!trimmed) return trimmed;
  const lower = trimmed.toLocaleLowerCase(LOCALE_TR);
  return lower.charAt(0).toLocaleUpperCase(LOCALE_TR) + lower.slice(1);
}
