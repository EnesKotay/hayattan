import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hayattan.net";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [yazilar, yazarlar, kategoriler] = await Promise.all([
    prisma.yazi.findMany({
      where: { publishedAt: { lte: new Date() } },
      select: { slug: true, updatedAt: true },
    }),
    prisma.yazar.findMany({
      select: { slug: true, updatedAt: true },
    }),
    prisma.kategori.findMany({
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/yazilar`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/yazarlar`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/kategoriler`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/fotografhane`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/iletisim`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/hakkimizda`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/arsiv`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${siteUrl}/eski-yazilar`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${siteUrl}/bakis-dergisi`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];

  const yaziPages: MetadataRoute.Sitemap = yazilar.map((yazi) => ({
    url: `${siteUrl}/yazilar/${yazi.slug}`,
    lastModified: yazi.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const yazarPages: MetadataRoute.Sitemap = yazarlar.map((yazar) => ({
    url: `${siteUrl}/yazarlar/${yazar.slug}`,
    lastModified: yazar.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const kategoriPages: MetadataRoute.Sitemap = kategoriler.map((kategori) => ({
    url: `${siteUrl}/kategoriler/${kategori.slug}`,
    lastModified: kategori.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...yaziPages, ...yazarPages, ...kategoriPages];
}
