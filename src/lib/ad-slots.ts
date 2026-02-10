/** Reklam slot içeriği: HTML (AdSense vb.), metin veya görsel URL – üçü isteğe bağlı, öncelik sırasıyla kullanılır */
/** Reklam hizalaması: sayfada sol, orta veya sağ */
export type AdSlotAlign = "left" | "center" | "right";

/** Reklam slot içeriği: HTML, metin veya görsel. Genişlik/Yükseklik ve hizalama opsiyonel. */
export type AdSlotContent = {
  type: "html" | "text" | "image";
  content: string;
  width?: string;
  height?: string;
  isActive?: boolean;
  /** Reklamın sayfada hizalanması (varsayılan: center) */
  align?: AdSlotAlign;
};

export function parseAdSlotValue(value: string | null): AdSlotContent | null {
  const v = value?.trim();
  if (!v) return null;
  try {
    const o = JSON.parse(v) as { t?: string; c?: string; w?: string; h?: string; a?: boolean; x?: string };
    if (o.t === "html" || o.t === "text" || o.t === "image") {
      const align = o.x === "left" || o.x === "right" ? o.x : "center";
      return {
        type: o.t,
        content: String(o.c ?? ""),
        width: o.w,
        height: o.h,
        isActive: o.a ?? true,
        align,
      };
    }
  } catch {
    // Eski format: ham string = HTML
    return { type: "html", content: v, isActive: true, align: "center" };
  }
  return null;
}

export function serializeAdSlotContent(content: AdSlotContent | null): string {
  if (!content?.content?.trim()) return "";
  const align = content.align === "left" || content.align === "right" ? content.align : "center";
  return JSON.stringify({
    t: content.type,
    c: content.content.trim(),
    w: content.width,
    h: content.height,
    a: content.isActive ?? true,
    x: align,
  });
}

/** Reklam slot kimlikleri - admin reklam sayfası ve sitede kullanılır */
export const AD_SLOT_KEYS = [
  "top-banner",
  "mid-banner",
  "rectangle-ad",
  "bottom-banner",
  "yazi-top",
  "yazi-bottom",
  "yazilar-top",
  "yazilar-mid",
] as const;

export function adSlotKey(slotId: string): string {
  return `ad_slot_${slotId.replace(/-/g, "_")}`;
}
