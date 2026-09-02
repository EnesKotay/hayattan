/** Reklam slot içeriği: HTML (AdSense vb.), metin veya görsel URL – üçü isteğe bağlı, öncelik sırasıyla kullanılır */
/** Reklam hizalaması: sayfada sol, orta veya sağ */
export type AdSlotAlign = "left" | "center" | "right";
export type AdSlotType = "html" | "text" | "image";
export type AdMetricType = "impression" | "click";

export type AdSlotCreative = {
  type: AdSlotType;
  content: string;
  width?: string;
  height?: string;
  href?: string;
};

/** Reklam slot içeriği: HTML, metin veya görsel. Genişlik/Yükseklik ve hizalama opsiyonel. */
export type AdSlotContent = AdSlotCreative & {
  isActive?: boolean;
  align?: AdSlotAlign;
  startAt?: string;
  endAt?: string;
  mobile?: AdSlotCreative | null;
};

export function parseAdSlotValue(value: string | null): AdSlotContent | null {
  const v = value?.trim();
  if (!v) return null;
  try {
    const o = JSON.parse(v) as {
      t?: string;
      c?: string;
      w?: string;
      h?: string;
      l?: string;
      a?: boolean;
      x?: string;
      s?: string;
      e?: string;
      m?: { t?: string; c?: string; w?: string; h?: string; l?: string } | null;
    };
    if (o.t === "html" || o.t === "text" || o.t === "image") {
      const align = o.x === "left" || o.x === "right" ? o.x : "center";
      const mobile: AdSlotCreative | null = o.m && (o.m.t === "html" || o.m.t === "text" || o.m.t === "image")
        ? {
            type: o.m.t,
            content: String(o.m.c ?? ""),
            width: o.m.w,
            height: o.m.h,
            href: o.m.l,
          }
        : null;
      return {
        type: o.t,
        content: String(o.c ?? ""),
        width: o.w,
        height: o.h,
        href: o.l,
        isActive: o.a ?? true,
        align,
        startAt: o.s,
        endAt: o.e,
        mobile,
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
    l: content.href,
    a: content.isActive ?? true,
    x: align,
    s: content.startAt,
    e: content.endAt,
    m: content.mobile?.content?.trim()
      ? {
          t: content.mobile.type,
          c: content.mobile.content.trim(),
          w: content.mobile.width,
          h: content.mobile.height,
          l: content.mobile.href,
        }
      : undefined,
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

export function adSlotIdFromKey(key: string): (typeof AD_SLOT_KEYS)[number] | null {
  return AD_SLOT_KEYS.find((slotId) => adSlotKey(slotId) === key) ?? null;
}

export function adMetricKey(slotId: string, metric: AdMetricType): string {
  return `ad_metric_${slotId.replace(/-/g, "_")}_${metric}`;
}

export function isAdSlotLive(content: AdSlotContent | null | undefined, now = new Date()): boolean {
  if (!content?.content?.trim() || content.isActive === false) return false;
  if (content.startAt && new Date(content.startAt) > now) return false;
  if (content.endAt && new Date(content.endAt) <= now) return false;
  return true;
}
