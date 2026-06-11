import { prisma } from "@/lib/db";

export const revalidate = 3600;

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hayattan.net";

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
      publishedAt: true,
      author: { select: { name: true } },
      kategoriler: { select: { name: true } },
    },
  });

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Hayattan.Net</title>
    <link>${siteUrl}</link>
    <description>Hayatın Engelsiz Tarafı - Güncel yazılar, kültür, sanat ve yaşam</description>
    <language>tr</language>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${yazilar
      .map((yazi) => {
        const url = `${siteUrl}/yazilar/${yazi.slug}`;
        const pubDate = yazi.publishedAt
          ? new Date(yazi.publishedAt).toUTCString()
          : new Date().toUTCString();
        const category = yazi.kategoriler[0]?.name ?? "";
        const desc = yazi.excerpt?.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") ?? "";
        const title = yazi.title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        return `
    <item>
      <title>${title}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${desc}</description>
      <pubDate>${pubDate}</pubDate>
      <author>${yazi.author.name}</author>
      ${category ? `<category>${category}</category>` : ""}
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
