import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { isValidImageSrc } from "@/lib/image";
import { SITE_URL, toAbsoluteUrl } from "@/lib/seo";
import { isFotoğrafhanePageSlug } from "@/lib/site-categories";

const DUPLICATE_PAGE_SLUGS = new Set(["eski-yazar", "eski-yazarlar", "eski-yazilar"]);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = prisma as any;
  const [yazilar, yazarlar, kategoriler, etiketler, sayfalar] = await Promise.all([
    prisma.yazi.findMany({
      where: { publishedAt: { lte: new Date() } },
      select: { slug: true, updatedAt: true, featuredImage: true },
    }),
    prisma.yazar.findMany({
      select: { slug: true, updatedAt: true },
    }),
    prisma.kategori.findMany({
      select: { slug: true, updatedAt: true },
    }),
    db.etiket.findMany({
      select: { slug: true, createdAt: true },
    }),
    prisma.page.findMany({
      where: { publishedAt: { lte: new Date() } },
      select: { slug: true, updatedAt: true, featuredImage: true },
    }),
  ]);

  // Statik sayfalara her build'de `new Date()` vermek "her gün değişti" sinyali
  // üretiyor ve lastModified'ı güvenilmez kılıyordu. En son güncellenen yazının
  // tarihini gerçek güncellik göstergesi olarak kullanıyoruz.
  const sonGuncelleme = yazilar.reduce<Date | undefined>(
    (latest, yazi) => (!latest || yazi.updatedAt > latest ? yazi.updatedAt : latest),
    undefined
  );

  // /arama listede yok: arama sonuç sayfaları noindex.
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: sonGuncelleme, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/yazilar`, lastModified: sonGuncelleme, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/yazarlar`, lastModified: sonGuncelleme, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/kategoriler`, lastModified: sonGuncelleme, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/etiketler`, lastModified: sonGuncelleme, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/fotografhane`, lastModified: sonGuncelleme, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/misafir-yazarlar`, lastModified: sonGuncelleme, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/arsiv`, lastModified: sonGuncelleme, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/eski-yazilar`, lastModified: sonGuncelleme, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/bakis-dergisi`, lastModified: sonGuncelleme, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/iletisim`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/hakkimizda`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${SITE_URL}/erisilebilirlik`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/gizlilik`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/kullanim-sartlari`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const yaziPages: MetadataRoute.Sitemap = yazilar.map((yazi) => ({
    url: `${SITE_URL}/yazilar/${yazi.slug}`,
    lastModified: yazi.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
    ...(isValidImageSrc(yazi.featuredImage)
      ? { images: [toAbsoluteUrl(yazi.featuredImage!)] }
      : {}),
  }));

  const yazarPages: MetadataRoute.Sitemap = yazarlar.map((yazar) => ({
    url: `${SITE_URL}/yazarlar/${yazar.slug}`,
    lastModified: yazar.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const kategoriPages: MetadataRoute.Sitemap = kategoriler.map((kategori) => ({
    url: `${SITE_URL}/kategoriler/${kategori.slug}`,
    lastModified: kategori.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const etiketPages: MetadataRoute.Sitemap = etiketler.map((etiket: { slug: string; createdAt: Date }) => ({
    url: `${SITE_URL}/etiketler/${etiket.slug}`,
    lastModified: etiket.createdAt,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  const sayfaPages: MetadataRoute.Sitemap = sayfalar
    .filter((sayfa) => !DUPLICATE_PAGE_SLUGS.has(sayfa.slug) && !isFotoğrafhanePageSlug(sayfa.slug))
    .map((sayfa) => ({
      url: `${SITE_URL}/sayfa/${sayfa.slug}`,
      lastModified: sayfa.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      ...(isValidImageSrc(sayfa.featuredImage)
        ? { images: [toAbsoluteUrl(sayfa.featuredImage!)] }
        : {}),
    }));

  return [...staticPages, ...yaziPages, ...yazarPages, ...kategoriPages, ...etiketPages, ...sayfaPages];
}
