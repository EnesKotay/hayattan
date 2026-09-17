import type { Prisma } from "@prisma/client";
export type SearchParams = Record<string, string | string[] | undefined>;
const single = (value: string | string[] | undefined) => typeof value === "string" ? value : "";
export function parseSearchFilters(params: SearchParams) {
  const q = single(params.q).trim().slice(0, 120);
  const category = single(params.kategori).slice(0, 100);
  const author = single(params.yazar).slice(0, 100);
  const period = ["30", "365"].includes(single(params.donem)) ? single(params.donem) : "";
  const sort = ["oldest", "popular"].includes(single(params.sirala)) ? single(params.sirala) : "newest";
  const rawPage = Number(single(params.sayfa));
  const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? Math.min(rawPage, 10000) : 1;
  return { q, category, author, period, sort, page };
}
export function searchWhere(filters: ReturnType<typeof parseSearchFilters>, now = new Date()): Prisma.YaziWhereInput {
  return {
    publishedAt: { lte: now, ...(filters.period ? { gte: new Date(now.getTime() - Number(filters.period) * 86400000) } : {}) },
    author: { ayrilmis: false, ...(filters.author ? { slug: filters.author } : {}) },
    ...(filters.category ? { kategoriler: { some: { slug: filters.category } } } : {}),
    ...(filters.q.length >= 2 ? { OR: [
      { title: { contains: filters.q, mode: "insensitive" } },
      { excerpt: { contains: filters.q, mode: "insensitive" } },
      { content: { contains: filters.q, mode: "insensitive" } },
    ] } : {}),
  };
}
export function searchHref(filters: ReturnType<typeof parseSearchFilters>, page: number) {
  const params = new URLSearchParams({ q: filters.q, kategori: filters.category, yazar: filters.author, donem: filters.period, sirala: filters.sort, sayfa: String(page) });
  return `/arama?${params}`;
}
