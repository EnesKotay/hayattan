import Link from "next/link";

import { prisma } from "@/lib/db";

type EskiYaziRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  publishedAt: Date;
  authorName: string;
  authorSlug: string;
};

type EskiYazarOzetRow = {
  authorName: string;
  authorSlug: string;
  count: number;
};

type GrupluYazi = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  publishedAt: Date;
  authorName: string;
  authorSlug: string;
};

const PAGE_SIZE = 36;

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatMonth(date: Date) {
  return new Date(date).toLocaleDateString("tr-TR", {
    month: "long",
    year: "numeric",
  });
}

function pageHref(basePath: string, page: number) {
  return page <= 1 ? basePath : `${basePath}?sayfa=${page}`;
}

export async function EskiYazilarArsivi({
  currentPage = 1,
  basePath = "/eski-yazilar",
}: {
  currentPage?: number;
  basePath?: string;
}) {
  const requestedPage = Math.max(1, currentPage || 1);

  const [countRows, yazarOzetleri] = await Promise.all([
    prisma.$queryRaw<{ count: number }[]>`
      SELECT COUNT(y.id)::int as count
      FROM "Yazi" y
      INNER JOIN "Yazar" a ON y."authorId" = a.id
      WHERE y."publishedAt" <= now() AND a.ayrilmis = true
    `,
    prisma.$queryRaw<EskiYazarOzetRow[]>`
      SELECT
        a.name as "authorName",
        a.slug as "authorSlug",
        COUNT(y.id)::int as count
      FROM "Yazi" y
      INNER JOIN "Yazar" a ON y."authorId" = a.id
      WHERE y."publishedAt" <= now() AND a.ayrilmis = true
      GROUP BY a.name, a.slug
      ORDER BY count DESC, a.name ASC
    `,
  ]);

  const totalCount = countRows[0]?.count ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const safePage =
    totalPages > 0 ? Math.min(requestedPage, totalPages) : requestedPage;
  const skip = (safePage - 1) * PAGE_SIZE;

  const yazilar = await prisma.$queryRaw<EskiYaziRow[]>`
    SELECT
      y.id,
      y.title,
      y.slug,
      y.excerpt,
      y."publishedAt",
      a.name as "authorName",
      a.slug as "authorSlug"
    FROM "Yazi" y
    INNER JOIN "Yazar" a ON y."authorId" = a.id
    WHERE y."publishedAt" <= now() AND a.ayrilmis = true
    ORDER BY y."publishedAt" DESC
    LIMIT ${PAGE_SIZE} OFFSET ${skip}
  `;

  const gruplar = yazilar.reduce<
    Record<string, { label: string; sortDate: Date; items: GrupluYazi[] }>
  >((acc, yazi) => {
    if (!yazi.publishedAt) return acc;
    const date = new Date(yazi.publishedAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (!acc[key]) {
      acc[key] = {
        label: formatMonth(date),
        sortDate: new Date(date.getFullYear(), date.getMonth(), 1),
        items: [],
      };
    }
    acc[key].items.push({
      id: yazi.id,
      title: yazi.title,
      slug: yazi.slug,
      excerpt: yazi.excerpt,
      publishedAt: yazi.publishedAt,
      authorName: yazi.authorName,
      authorSlug: yazi.authorSlug,
    });
    return acc;
  }, {});

  const ayGruplari = Object.values(gruplar).sort(
    (a, b) => b.sortDate.getTime() - a.sortDate.getTime()
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <section className="rounded-2xl border border-border bg-background p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-primary">
              Arşiv
            </p>
            <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
              Eski Yazılar
            </h1>
            <p className="mt-3 max-w-2xl text-muted">
              Yayın ekibimizden ayrılmış yazarlarımızın yayındaki yazıları bu
              sayfada tarih sırasına göre listelenir.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border border-border bg-muted-bg/30 px-4 py-3">
              <span className="block text-2xl font-bold text-foreground">
                {totalCount}
              </span>
              <span className="text-muted">yazı</span>
            </div>
            <div className="rounded-lg border border-border bg-muted-bg/30 px-4 py-3">
              <span className="block text-2xl font-bold text-foreground">
                {yazarOzetleri.length}
              </span>
              <span className="text-muted">yazar</span>
            </div>
          </div>
        </div>
      </section>

      {totalCount === 0 ? (
        <div className="mt-8 rounded-lg border border-border bg-muted-bg/30 p-8 text-center md:p-12">
          <h2 className="font-serif text-xl font-bold text-foreground">
            Henüz eski yazar yazısı bulunmuyor
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted">
            Admin panelindeki Yazarlar bölümünden ilgili yazarı düzenleyip
            &quot;Eski yazar&quot; olarak işaretlediğinizde, o yazarın yayındaki
            yazıları burada otomatik listelenir.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="h-fit rounded-lg border border-border bg-background p-5">
            <h2 className="font-serif text-lg font-bold text-foreground">
              Yazarlar
            </h2>
            <div className="mt-4 space-y-2">
              {yazarOzetleri.map((yazar) => (
                <Link
                  key={yazar.authorSlug}
                  href={`/yazarlar/${yazar.authorSlug}`}
                  className="flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted-bg"
                >
                  <span className="font-medium text-foreground">
                    {yazar.authorName}
                  </span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    {yazar.count}
                  </span>
                </Link>
              ))}
            </div>
          </aside>

          <div className="space-y-8">
            {ayGruplari.map((grup) => (
              <section key={grup.label}>
                <h2 className="font-serif text-xl font-bold text-foreground">
                  {grup.label}
                </h2>
                <div className="mt-4 space-y-3 border-l-2 border-primary-light pl-4">
                  {grup.items.map((yazi) => (
                    <article
                      key={yazi.id}
                      className="rounded-lg border border-border bg-background p-4 transition-shadow hover:shadow-sm"
                    >
                      <Link
                        href={`/yazilar/${yazi.slug}`}
                        className="font-serif text-lg font-bold text-foreground hover:text-primary"
                      >
                        {yazi.title}
                      </Link>
                      {yazi.excerpt && (
                        <p className="mt-2 line-clamp-2 text-sm text-muted">
                          {yazi.excerpt}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
                        <Link
                          href={`/yazarlar/${yazi.authorSlug}`}
                          className="font-medium hover:text-primary hover:underline"
                        >
                          {yazi.authorName}
                        </Link>
                        <span aria-hidden="true">·</span>
                        <time dateTime={new Date(yazi.publishedAt).toISOString()}>
                          {formatDate(yazi.publishedAt)}
                        </time>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}

            {totalPages > 1 && (
              <nav
                className="flex flex-wrap items-center justify-center gap-2 pt-2"
                aria-label="Eski yazılar sayfaları"
              >
                {safePage > 1 && (
                  <Link
                    href={pageHref(basePath, safePage - 1)}
                    className="rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted-bg"
                  >
                    Önceki
                  </Link>
                )}
                <span className="px-3 py-2 text-sm text-muted">
                  Sayfa {safePage} / {totalPages}
                </span>
                {safePage < totalPages && (
                  <Link
                    href={pageHref(basePath, safePage + 1)}
                    className="rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted-bg"
                  >
                    Sonraki
                  </Link>
                )}
              </nav>
            )}
          </div>
        </div>
      )}

      <p className="mt-12">
        <Link href="/" className="text-primary hover:underline">
          Ana sayfaya dön
        </Link>
      </p>
    </div>
  );
}
