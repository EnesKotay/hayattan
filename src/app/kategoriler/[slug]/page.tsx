import { isExternalImageUrl, normalizeImageUrl } from "@/lib/image";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { SiteBreadcrumb } from "@/components/SiteBreadcrumb";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sayfa?: string }>;
};

const YAZILAR_PER_PAGE = 12;

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const kategori = await prisma.kategori.findUnique({
    where: { slug },
    select: { name: true, description: true },
  });

  if (!kategori) return { title: "Kategori Bulunamadı" };

  return {
    title: `${kategori.name} | Hayattan.Net`,
    description: kategori.description ?? `${kategori.name} kategorisindeki yazılar`,
  };
}

export default async function KategoriDetayPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { sayfa = "1" } = await searchParams;
  const page = Math.max(1, parseInt(sayfa, 10) || 1);
  const skip = (page - 1) * YAZILAR_PER_PAGE;

  const [kategori, yazilar, totalCount] = await Promise.all([
    prisma.kategori.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
      },
    }),
    prisma.yazi.findMany({
      where: {
        kategoriler: { some: { slug } },
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
        author: { select: { name: true, slug: true } },
        kategoriler: { select: { name: true, slug: true } },
      },
    }),
    prisma.yazi.count({
      where: {
        kategoriler: { some: { slug } },
        publishedAt: { lte: new Date() },
      },
    }),
  ]);

  if (!kategori) notFound();

  const totalPages = Math.ceil(totalCount / YAZILAR_PER_PAGE);

  const breadcrumbItems = [
    { href: "/", label: "Ana Sayfa" },
    { href: "/kategoriler", label: "Kategoriler" },
    { href: `/kategoriler/${kategori.slug}`, label: kategori.name },
  ];

  return (
    <div className="container mx-auto max-w-[var(--content-max-width)] px-4 py-12">
      <SiteBreadcrumb items={breadcrumbItems} />
      <header className="mb-12 border-b border-border pb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
          {kategori.name}
        </h1>
        {kategori.description && (
          <div className="mt-4 max-w-2xl text-muted">
            {kategori.description}
          </div>
        )}
        <p className="mt-4 text-sm text-muted">
          Toplam {totalCount} yazı
        </p>
      </header>

      {yazilar.length === 0 ? (
        <div className="rounded-lg border border-border bg-muted-bg/30 p-12 text-center">
          <p className="text-muted">Bu kategoride henüz yazı bulunmuyor.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                    <div className="mt-2 line-clamp-2 text-sm text-muted">
                      {yazi.excerpt}
                    </div>
                  )}
                  <div className="mt-auto pt-3 text-xs text-muted">
                    <Link
                      href={`/yazarlar/${yazi.author.slug}`}
                      className="hover:text-primary"
                    >
                      {yazi.author.name}
                    </Link>
                    {yazi.publishedAt && (
                      <span className="ml-2">
                        {new Date(yazi.publishedAt).toLocaleDateString("tr-TR")}
                      </span>
                    )}
                  </div>
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
                  href={`/kategoriler/${kategori.slug}?sayfa=${page - 1}`}
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
                  href={`/kategoriler/${kategori.slug}?sayfa=${page + 1}`}
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
