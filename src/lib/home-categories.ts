import { prisma } from "@/lib/db";

export const HOME_CATEGORIES_KEY = "home-category-ids";

export function parseHomeCategoryIds(value?: string | null): string[] {
  try {
    const ids: unknown = JSON.parse(value ?? "[]");
    return Array.isArray(ids) ? [...new Set(ids.filter((id): id is string => typeof id === "string"))].slice(0, 6) : [];
  } catch {
    return [];
  }
}

export async function getHomeCategories() {
  const setting = await prisma.siteSetting.findUnique({ where: { key: HOME_CATEGORIES_KEY } });
  const ids = parseHomeCategoryIds(setting?.value);
  const categories = await prisma.kategori.findMany({
    where: setting ? { id: { in: ids } } : undefined,
    orderBy: [{ name: "asc" }, { id: "asc" }],
    take: 6,
    select: { id: true, name: true, slug: true },
  });
  return setting ? categories.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id)) : categories;
}
