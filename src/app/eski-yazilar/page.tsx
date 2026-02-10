import Link from "next/link";
import { prisma } from "@/lib/db";

export const metadata = {
  title: "Eski Yazılar | Hayattan.Net",
  description: "Hayattan.Net - Şirketten ayrılmış yazarlarımızın arşivi",
};

type EskiYaziRow = {
  id: string;
  title: string;
  slug: string;
  publishedAt: Date;
  authorName: string;
  authorSlug: string;
};

export default async function EskiYazilarPage() {
  // Şirketten ayrılmış (ayrilmis) yazarların yayındaki yazıları – ham SQL ile (Prisma client cache sorununa karşı)
  const yazilar = await prisma.$queryRaw<EskiYaziRow[]>`
    SELECT y.id, y.title, y.slug, y."publishedAt", a.name as "authorName", a.slug as "authorSlug"
    FROM "Yazi" y
    INNER JOIN "Yazar" a ON y."authorId" = a.id
    WHERE y."publishedAt" <= now() AND a.ayrilmis = true
    ORDER BY y."publishedAt" DESC
  `;

  type YaziGruplu = { title: string; slug: string; publishedAt: Date; authorName: string; authorSlug: string };
  const gruplar = yazilar.reduce<Record<string, YaziGruplu[]>>((acc, yazi) => {
    if (!yazi.publishedAt) return acc;
    const key = new Date(yazi.publishedAt).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
    });
    if (!acc[key]) acc[key] = [];
    acc[key].push({
      title: yazi.title,
      slug: yazi.slug,
      publishedAt: yazi.publishedAt,
      authorName: yazi.authorName,
      authorSlug: yazi.authorSlug,
    });
    return acc;
  }, {});

  const sortedKeys = Object.keys(gruplar).sort((a, b) => {
    const dateA = new Date(
      gruplar[a][0].publishedAt.toISOString().slice(0, 7)
    ).getTime();
    const dateB = new Date(
      gruplar[b][0].publishedAt.toISOString().slice(0, 7)
    ).getTime();
    return dateB - dateA;
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-serif text-3xl font-bold text-foreground">
        Eski Yazılar
      </h1>
      <p className="mt-2 text-muted">
        Şirketimizden ayrılmış yazarlarımızın yazıları bu sayfada tarih sırasına göre listelenmektedir.
      </p>

      {yazilar.length === 0 ? (
        <div className="mt-12 rounded-lg border border-border bg-muted-bg/30 p-12 text-center">
          <p className="text-muted">Henüz &quot;şirketten ayrılmış&quot; olarak işaretlenmiş bir yazar veya yazı bulunmuyor. Admin panelinden Yazarlar bölümünde ilgili yazarı düzenleyip &quot;Eski yazar (şirketten ayrılmış)&quot; işaretleyebilirsiniz.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {sortedKeys.map((ay) => (
            <section key={ay}>
              <h2 className="font-serif text-xl font-bold text-foreground">
                {ay}
              </h2>
              <ul className="mt-4 space-y-2 border-l-2 border-primary-light pl-4">
                {gruplar[ay].map((yazi) => (
                  <li key={yazi.slug} className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <Link
                      href={`/yazilar/${yazi.slug}`}
                      className="text-foreground hover:text-primary hover:underline"
                    >
                      {yazi.title}
                    </Link>
                    <span className="text-sm text-muted">
                      <Link href={`/yazarlar/${yazi.authorSlug}`} className="hover:text-primary hover:underline">
                        {yazi.authorName}
                      </Link>
                      {" · "}
                      {new Date(yazi.publishedAt).toLocaleDateString("tr-TR")}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
