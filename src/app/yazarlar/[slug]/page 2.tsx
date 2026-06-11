import { isExternalImageUrl, isValidImageSrc, normalizeImageUrl } from "@/lib/image";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sayfa?: string }>;
};

const YAZILAR_PER_PAGE = 12;

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const yazar = await prisma.yazar.findUnique({
    where: { slug },
    select: { name: true, biyografi: true },
  });

  if (!yazar) return { title: "Yazar Bulunamadı" };

  return {
    title: `${yazar.name} | Hayattan.Net`,
    description: yazar.biyografi ?? `${yazar.name} - Hayattan.Net yazarı`,
  };
}

export default async function YazarDetayPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { sayfa = "1" } = await searchParams;
  const page = Math.max(1, parseInt(sayfa, 10) || 1);
  const skip = (page - 1) * YAZILAR_PER_PAGE;

  const [yazar, yazilar, totalCount] = await Promise.all([
    prisma.yazar.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        email: true,
        photo: true,
        biyografi: true,
      },
    }),
    prisma.yazi.findMany({
      where: {
        author: { slug },
        publishedAt: { lte: new Date() },
      },
      orderBy: { publishedAt: "desc" },
      skip,
      take: YAZILAR_PER_PAGE,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featuredImage: true,
        publishedAt: true,
        kategoriler: { select: { name: true, slug: true } },
      },
    }),
    prisma.yazi.count({
      where: {
        author: { slug },
        publishedAt: { lte: new Date() },
      },
    }),
  ]);

  if (!yazar) notFound();

  const totalPages = Math.ceil(totalCount / YAZILAR_PER_PAGE);

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="mb-12 flex flex-col items-center border-b border-border pb-12 md:flex-row md:items-start md:gap-8">
        <div className="relative h-40 w-40 flex-shrink-0 overflow-hidden rounded-full border-2 border-primary-light">
          {yazar.photo && isValidImageSrc(yazar.photo) ? (
            <Image
              src={normalizeImageUrl(yazar.photo)!}
              alt={yazar.name}
              fill
              className="object-cover"
              sizes="160px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary-light text-primary">
              <span className="text-6xl font-bold">{yazar.name.charAt(0)}</span>
            </div>
          )}
        </div>
        <div className="mt-6 flex-1 text-center md:mt-0 md:text-left">
          <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
            {yazar.name}
          </h1>
          {yazar.email && (
            <a
              href={`mailto:${yazar.email}`}
              className="mt-2 inline-block text-primary hover:underline"
            >
              {yazar.email}
            </a>
          )}
          {yazar.biyografi && (
            <p className="mt-4 max-w-2xl leading-relaxed text-muted">
              {yazar.biyografi}
            </p>
          )}
          <p className="mt-4 text-sm text-muted">
            Toplam {totalCount} yazı
          </p>
        </div>
      </header>

      <h2 className="font-serif text-2xl font-bold text-foreground">
        Yazılar
      </h2>

      {yazilar.length === 0 ? (
        <div className="mt-8 rounded-lg border border-border bg-muted-bg/30 p-12 text-center">
          <p className="text-muted">Bu yazara ait henüz yazı bulunmuyor.</p>
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {yazilar.map((yazi) => (
              <article
                key={yazi.id}
                className="group flex flex-col overflow-hidden rounded-lg border border-border bg-background transition-shadow hover:shadow-md"
              >
                <Link href={`/yazilar/${yazi.slug}`} className="block">
                  <div className="relative aspect-[16/10] overflow-hidden bg-muted-bg">
                    {yazi.featuredImage ? (
                      <Image
                        src={normalizeImageUrl(yazi.featuredImage)!}
                        alt={yazi.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary-light text-primary/50">
                        <span className="font-serif text-5xl">Y</span>
                      </div>
                    )}
                  </div>
                </Link>
                <div className="flex flex-1 flex-col p-4">
                  <div className="mb-2 flex flex-wrap gap-2">
                    {yazi.kategoriler.slice(0, 2).map((k) => (
                      <Link
                        key={k.slug}
                        href={`/kategoriler/${k.slug}`}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        {k.name}
                      </Link>
                    ))}
                  </div>
                  <Link href={`/yazilar/${yazi.slug}`}>
                    <h3 className="font-serif line-clamp-2 text-lg font-bold text-foreground group-hover:text-primary">
                      {yazi.title}
                    </h3>
                  </Link>
                  {yazi.excerpt && (
                    <p className="mt-2 line-clamp-2 text-sm text-muted">
                      {yazi.excerpt}
                    </p>
                  )}
                  {yazi.publishedAt && (
                    <p className="mt-auto pt-3 text-xs text-muted">
                      {new Date(yazi.publishedAt).toLocaleDateString("tr-TR")}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>

          {totalPages > 1 && (
            <nav
              className="mt-12 flex items-center justify-center gap-2"
              aria-label="Sayfa navigasyonu"
            >
              {page > 1 && (
                <Link
                  href={`/yazarlar/${yazar.slug}?sayfa=${page - 1}`}
                  className="rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted-bg"
                >
                  ← Önceki
                </Link>
              )}
              <span className="px-4 py-2 text-sm text-muted">
                Sayfa {page} / {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={`/yazarlar/${yazar.slug}?sayfa=${page + 1}`}
                  className="rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted-bg"
                >
                  Sonraki →
                </Link>
              )}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
