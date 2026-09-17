"use server";

import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { db, requireAdmin } from "@/backend/modules/admin/context";
import { sanitizeAdHtml, sanitizeText, sanitizeUrl } from "@/backend/security/sanitize";
import {
  AD_SLOT_KEYS,
  adMetricKey,
  adSlotIdFromKey,
  adSlotKey,
  parseAdSlotValue,
  serializeAdSlotContent,
  type AdSlotContent,
  type AdSlotCreative,
} from "@/shared/advertising/ad-slots";

export const getAdSlots = unstable_cache(
  async () => {
    try {
      const slots = await db.siteSetting.findMany({
        where: { key: { in: AD_SLOT_KEYS.map((k) => adSlotKey(k)) } },
      });

      const result: Record<string, AdSlotContent | null> = {};

      // Tüm slotları null olarak başlat
      for (const key of AD_SLOT_KEYS) {
        result[key] = null;
      }

      // DB'den gelenleri doldur
      for (const slot of slots) {
        const slotId = adSlotIdFromKey(slot.key);
        if (slotId) result[slotId] = parseAdSlotValue(slot.value);
      }

      return result;
    } catch (error) {
      console.error("Ad slots fetch error:", error);
      return {};
    }
  },
  ["ad-slots"],
  {
    tags: ["ad-slots"],
    revalidate: 3600,
  }
);

export async function getAdMetrics() {
  await requireAdmin();
  const rows = await db.siteSetting.findMany({
    where: {
      key: {
        in: AD_SLOT_KEYS.flatMap((slotId) => [
          adMetricKey(slotId, "impression"),
          adMetricKey(slotId, "click"),
        ]),
      },
    },
    select: { key: true, value: true },
  });

  const values = new Map<string, number>(
    rows.map((row: { key: string; value: string }) => [row.key, Math.max(0, Number.parseInt(row.value, 10) || 0)])
  );

  return Object.fromEntries(
    AD_SLOT_KEYS.map((slotId) => [slotId, {
      impressions: values.get(adMetricKey(slotId, "impression")) ?? 0,
      clicks: values.get(adMetricKey(slotId, "click")) ?? 0,
    }])
  ) as Record<(typeof AD_SLOT_KEYS)[number], { impressions: number; clicks: number }>;
}

export async function getAdPreviewPostPath() {
  await requireAdmin();
  const post = await db.yazi.findFirst({
    where: { publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: "desc" },
    select: { slug: true },
  });
  return post?.slug ? `/yazilar/${post.slug}` : "/yazilar";
}
function parseAdDimension(value: FormDataEntryValue | null, label: string) {
  const dimension = sanitizeText(String(value ?? "").trim());
  if (!dimension) return "";
  if (!/^(?:auto|0|\d+(?:\.\d+)?(?:px|%|rem|em|vw|vh))$/i.test(dimension)) {
    throw new Error(`${label} geçersiz. Örnek: 728px veya 100%`);
  }
  return dimension;
}

function parseAdDate(value: FormDataEntryValue | null, label: string) {
  const rawValue = String(value ?? "").trim();
  if (!rawValue) return undefined;
  const date = new Date(rawValue);
  if (Number.isNaN(date.getTime())) throw new Error(`${label} geçersiz.`);
  return date.toISOString();
}

function parseAdCreative(formData: FormData, prefix: string): AdSlotCreative | null {
    const rawHtml = String(formData.get(`${prefix}_html`) ?? "").trim();
    const html = rawHtml ? sanitizeAdHtml(rawHtml) : "";
    const text = sanitizeText(String(formData.get(`${prefix}_text`) ?? "").trim());
    const rawImage = String(formData.get(`${prefix}_image`) ?? "").trim();
    const image = rawImage ? (sanitizeUrl(rawImage) ?? (rawImage.startsWith("/") ? rawImage : "")) : "";
    const rawHref = String(formData.get(`${prefix}_href`) ?? "").trim();
    const href = rawHref ? sanitizeUrl(rawHref) : null;
    const width = parseAdDimension(formData.get(`${prefix}_width`), "Reklam genişliği");
    const height = parseAdDimension(formData.get(`${prefix}_height`), "Reklam yüksekliği");

    if (rawHtml && !/<[a-z][\s\S]*>/i.test(rawHtml)) {
      throw new Error("Reklam kodu geçerli bir HTML etiketi içermiyor.");
    }
    if (rawImage && !image) throw new Error("Reklam görseli için geçerli bir URL girin.");
    if (rawHref && !href) throw new Error("Hedef bağlantı için geçerli bir http veya https adresi girin.");

    if (html) return { type: "html", content: html, width, height, href: href ?? undefined };
    if (image) return { type: "image", content: image, width, height, href: href ?? undefined };
    if (text) return { type: "text", content: text, width, height, href: href ?? undefined };
    return null;
}

function parseAdSlotFormData(slotId: (typeof AD_SLOT_KEYS)[number], formData: FormData): AdSlotContent | null {
    const prefix = `slot_${slotId}`;
    const creative = parseAdCreative(formData, prefix);
    if (!creative) return null;

    const mobile = parseAdCreative(formData, `${prefix}_mobile`);
    const isActive = formData.get(`${prefix}_active`) === "on";
    const rawAlign = ((formData.get(`slot_${slotId}_align`) as string) ?? "").trim().toLowerCase();
    const align = rawAlign === "left" || rawAlign === "right" ? rawAlign : "center";
    const startAt = parseAdDate(formData.get(`${prefix}_start_at`), "Başlangıç tarihi");
    const endAt = parseAdDate(formData.get(`${prefix}_end_at`), "Bitiş tarihi");

    if (startAt && endAt && new Date(endAt) <= new Date(startAt)) {
      throw new Error("Bitiş tarihi başlangıç tarihinden sonra olmalıdır.");
    }

    return { ...creative, isActive, align, startAt, endAt, mobile };
}

async function persistAdSlot(slotId: (typeof AD_SLOT_KEYS)[number], formData: FormData) {
    const content = parseAdSlotFormData(slotId, formData);
    const value = serializeAdSlotContent(content);
    const key = adSlotKey(slotId);
    await db.siteSetting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
}

function revalidateAdPages() {
  revalidateTag("ad-slots", { expire: 0 });
  revalidatePath("/");
  revalidatePath("/yazilar");
  revalidatePath("/yazilar/[slug]", "page");
  revalidatePath("/misafir-yazarlar");
  revalidatePath("/fotografhane");
  revalidatePath("/admin/reklam");
}

export async function saveAdSlot(slotId: string, formData: FormData) {
  await requireAdmin();
  if (!AD_SLOT_KEYS.includes(slotId as (typeof AD_SLOT_KEYS)[number])) {
    throw new Error("Geçersiz reklam alanı.");
  }

  await persistAdSlot(slotId as (typeof AD_SLOT_KEYS)[number], formData);
  revalidateAdPages();
  return { success: true };
}

export async function saveAllAdSlots(formData: FormData) {
  await requireAdmin();
  for (const slotId of AD_SLOT_KEYS) {
    await persistAdSlot(slotId, formData);
  }
  revalidateAdPages();
  return { success: true };
}
