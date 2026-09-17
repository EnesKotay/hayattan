"use server";

import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { db, getSetting, requireAdmin } from "@/backend/modules/admin/context";

const STATIC_MENU_ENTRIES: Record<string, { label: string; href: string }> = {
  ana_sayfa: { label: "Ana Sayfa", href: "/" },
  yazarlar: { label: "Yazarlar", href: "/yazarlar" },
  misafir_yazarlar: { label: "Misafir Yazıları", href: "/misafir-yazarlar" },
  yazilar: { label: "Yazılar", href: "/yazilar" },
  kategoriler: { label: "Kategoriler", href: "/kategoriler" },
  fotografhane: { label: "Fotoğrafhane", href: "/fotografhane" },
  iletisim: { label: "İletişim", href: "/iletisim" },
  hakkimizda: { label: "Hakkımızda", href: "/hakkimizda" },
  arsiv: { label: "Arşiv", href: "/arsiv" },
  eski_yazilar: { label: "Eski Yazılar", href: "/eski-yazilar" },
  bakis_dergisi: { label: "Bakış Dergisi", href: "/bakis-dergisi" },
};

const STATIC_MENU_KEYS = Object.keys(STATIC_MENU_ENTRIES);
const MENU_ORDER_KEY = "menu_order";

// ==========================================
// CACHED DATA FETCHING
// ==========================================

export const getMenuItems = unstable_cache(
  async () => {
    try {
      // 1. Kayıtlı sırayı al
      const orderJson = await db.siteSetting.findUnique({
        where: { key: "menu_order" },
      });
      const order = orderJson?.value ? (JSON.parse(orderJson.value) as string[]) : [];

      // 2. Tüm yayınlanmış sayfaları al (ID ve Slug eşleşmesi için)
      const pages = await db.page.findMany({
        where: { showInMenu: true, publishedAt: { lte: new Date() } },
        select: { id: true, title: true, slug: true },
      });
      const pagesById = new Map<string, { id: string; title: string; slug: string }>(
        (pages as any[]).map((p) => [p.id, p])
      );

      // 3. Sıraya göre listeyi oluştur
      const result: { href: string; label: string }[] = [];
      const seen = new Set<string>();

      // Önce kayıtlı sırayı işle
      for (const id of order) {
        if (seen.has(id)) continue;
        seen.add(id);

        if (id.startsWith("static:")) {
          const key = id.slice(7);
          // Statik menü elemanları (Ana Sayfa vb.)
          const entry = STATIC_MENU_ENTRIES[key];
          if (entry) result.push(entry);
        } else if (id.startsWith("page:")) {
          const pageId = id.slice(5);
          const p = pagesById.get(pageId);
          if (p) result.push({ href: `/sayfa/${p.slug}`, label: p.title });
        }
      }

      // Kayıtlı olmayan ama "menüde göster" denilen yeni sayfaları sona ekle
      for (const [pageId, p] of pagesById) {
        if (!seen.has(`page:${pageId}`)) {
          result.push({ href: `/sayfa/${p.slug}`, label: p.title });
        }
      }

      // Varsayılan (Eğer hiç sıra yoksa)
      if (result.length === 0) {
        return Object.values(STATIC_MENU_ENTRIES);
      }

      return result;
    } catch (error) {
      console.error("Menu fetch error:", error);
      return Object.values(STATIC_MENU_ENTRIES);
    }
  },
  ["menu-items"], // Cache Key
  {
    tags: ["menu-items"], // Revalidation Tag
    revalidate: 3600, // 1 saat (ne olur ne olmaz)
  }
);

export async function setMenuOrder(order: string[]) {
  await requireAdmin();
  await db.siteSetting.upsert({
    where: { key: "menu_order" },
    update: { value: JSON.stringify(order) },
    create: { key: "menu_order", value: JSON.stringify(order) },
  });
  revalidateTag("menu-items", { expire: 0 }); // Cache'i temizle
  revalidatePath("/");
}
// Menü sırası – SiteSetting "menu_order" = JSON string[] (öğe id'leri: "static:ana_sayfa" vb. veya "page:uuid")

/** Menüde gösterilecek öğe: id (static:key veya page:uuid) ve görünen adı */
export type MenuEntryForAdmin = { id: string; label: string; type: "static" | "page" };

/** Kayıtlı menü sırasını döndürür; yoksa varsayılan (sabitler + sayfalar). */
export async function getMenuOrder(): Promise<string[]> {
  try {
    const raw = await getSetting(MENU_ORDER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as string[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  const defaultOrder = [...STATIC_MENU_KEYS.map((k) => `static:${k}`)];
  try {
    const pages = await db.$queryRaw<{ id: string }[]>`
      SELECT id FROM "Page"
      WHERE "showInMenu" = true AND "publishedAt" IS NOT NULL
      ORDER BY "menuOrder" ASC, title ASC
    `;
    pages.forEach((p: { id: string }) => defaultOrder.push(`page:${p.id}`));
  } catch {
    // ignore
  }
  return defaultOrder;
}



/** Admin için menü öğelerini sırayla döndürür (label ile). */
export async function getMenuEntriesForAdmin(): Promise<MenuEntryForAdmin[]> {
  await requireAdmin();
  const order = await getMenuOrder();
  const pagesById = new Map<string, { title: string }>();
  try {
    const rows = await db.$queryRaw<{ id: string; title: string }[]>`
      SELECT id, title FROM "Page" WHERE "showInMenu" = true AND "publishedAt" IS NOT NULL
    `;
    rows.forEach((r: { id: string; title: string }) => pagesById.set(r.id, { title: r.title }));
  } catch {
    // ignore
  }
  const result: MenuEntryForAdmin[] = [];
  const seen = new Set<string>();
  for (const id of order) {
    if (seen.has(id)) continue;
    seen.add(id);
    if (id.startsWith("static:")) {
      const key = id.slice(7);
      if (STATIC_MENU_ENTRIES[key]) result.push({ id, label: STATIC_MENU_ENTRIES[key].label, type: "static" });
    } else if (id.startsWith("page:")) {
      const pageId = id.slice(5);
      const p = pagesById.get(pageId);
      if (p) result.push({ id, label: p.title, type: "page" });
    }
  }
  for (const [pageId, p] of pagesById) {
    const id = `page:${pageId}`;
    if (!seen.has(id)) result.push({ id, label: p.title, type: "page" });
  }
  return result;
}
