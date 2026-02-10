/**
 * Bu kategorilerdeki yazılar sadece kendi sayfalarında listelenir,
 * ana Yazılar listesinde (/yazilar) görünmez.
 */

/** Fotoğrafhane: sadece /sayfa/fotoğrafhane sayfasında */
export const FOTOGRAFHANE_PAGE_SLUGS = ["fotografhane", "fotoğrafhane"] as const;

export function isFotoğrafhanePageSlug(slug: string): boolean {
  const normalized = slug.toLowerCase().replace(/ğ/g, "g").trim();
  return normalized === "fotografhane";
}

export const FOTOGRAFHANE_CATEGORY_WHERE = {
  OR: [
    { slug: "fotografhane" },
    { slug: "fotoğrafhane" },
    { name: "Fotoğrafhane" },
    { name: "fotoğrafhane" },
  ],
};

/** Bakış Dergisi: sadece /bakis-dergisi sayfasında */
export function isBakisCategorySlug(slug: string): boolean {
  const n = slug?.toLowerCase().trim() ?? "";
  return n === "bakis" || n === "bakis-dergisi";
}

export const BAKIS_CATEGORY_WHERE = {
  OR: [
    { slug: "bakis" },
    { slug: "bakis-dergisi" },
    { name: "Bakış" },
    { name: "Bakış Dergisi" },
  ],
};

/** Misafir Yazıları: sadece /misafir-yazarlar sayfasında */
export function isMisafirYazarlarCategorySlug(slug: string): boolean {
  const n = slug?.toLowerCase().trim() ?? "";
  return n === "misafir-yazarlar" || n === "misafir-yazar";
}

export const MISAFIR_YAZARLAR_CATEGORY_WHERE = {
  OR: [
    { slug: "misafir-yazarlar" },
    { slug: "misafir-yazar" },
    { name: "Misafir Yazarlar" },
    { name: "Misafir yazarlar" },
  ],
};
