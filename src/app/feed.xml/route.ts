import { prisma } from "@/lib/db";
import { createExcerptFromHtml } from "@/lib/article-utils";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** CDATA bloğunu erken kapatan diziyi bölerek güvenli hale getirir */
const cdata = (value: string) => `<![CDATA[${value.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;

export async function GET() {
  const yazilar = await prisma.yazi.findMany({
    where: {
      publishedAt: { lte: new Date() },
      author: { ayrilmis: false },
    } as any,
    orderBy: { publishedAt: "desc" },
    take: 30,
    select: {
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      featuredImage: true,
      metaDescription: true,
      publishedAt: true,
      author: { select: { name: true } },
      kategoriler: { select: { name: true } },
    },
  });

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Hayattan.Net</title>
    <link>${SITE_URL}</link>
    <description>Hayatın Engelsiz Tarafı - Güncel yazılar, kültür, sanat ve yaşam</description>
    <language>tr</language>
    <lastBuildDate>${(yazilar[0]?.publishedAt ?? new Date()).toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    ${yazilar
      .map((yazi) => {
        const url = `${SITE_URL}/yazilar/${yazi.slug}`;
        const pubDate = yazi.publishedAt
          ? new Date(yazi.publishedAt).toUTCString()
          : new Date().toUTCString();
        const desc =
          yazi.metaDescription?.trim() ||
          yazi.excerpt?.trim() ||
          createExcerptFromHtml(yazi.content, 200);
        const image = yazi.featuredImage
          ? yazi.featuredImage.startsWith("http")
            ? yazi.featuredImage
            : `${SITE_URL}${yazi.featuredImage}`
          : null;
        return `
    <item>
      <title>${escapeXml(yazi.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(desc)}</description>
      <content:encoded>${cdata(yazi.content)}</content:encoded>
      <pubDate>${pubDate}</pubDate>
      <dc:creator>${escapeXml(yazi.author.name)}</dc:creator>
      ${yazi.kategoriler.map((k) => `<category>${escapeXml(k.name)}</category>`).join("\n      ")}
      ${image ? `<enclosure url="${escapeXml(image)}" type="image/jpeg"/>` : ""}
    </item>`;
      })
      .join("")}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
