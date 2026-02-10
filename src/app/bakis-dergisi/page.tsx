import { isExternalImageUrl } from "@/lib/image";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";

type Props = {
  searchParams: Promise<{ sayfa?: string }>;
};

const YAZILAR_PER_PAGE = 12;

// Sabit kategori slug'ı
const CATEGORY_SLUG = "bakis";

export const metadata: Metadata = {
  title: "Bakış Dergisi | Hayattan.Net",
  description: "Hayattan.Net - Bakış Dergisi",
};

export default async function BakisDergisiPage({ searchParams }: Props) {
  const { sayfa = "1" } = await searchParams;
  const page = Math.max(1, parseInt(sayfa, 10) || 1);
  const skip = (page - 1) * YAZILAR_PER_PAGE;

  // Önce kategori var mı diye kontrol et, yoksa uyar
  const kategori = await prisma.kategori.findFirst({
    where: {
      OR: [
        { slug: CATEGORY_SLUG },
        { slug: "bakis-dergisi" },
        { name: "Bakış" },
        { name: "Bakış Dergisi" },
      ],
    },
  });

  if (!kategori) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="font-serif text-3xl font-bold text-foreground">Bakış Dergisi</h1>
        <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
          <p className="font-bold">Kategori Bulunamadı!</p>
          <p className="mt-2 text-sm">
            Bu sayfanın çalışması için Admin panelinden <strong>"Bakış"</strong> veya <strong>"Bakış Dergisi"</strong> adında bir kategori oluşturmalısınız.
          </p>
        </div>
      </div>
    );
  }

  const [yazilar, totalCount] = await Promise.all([
    prisma.yazi.findMany({
      where: {
        kategoriler: { some: { id: kategori.id } },
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
        kategoriler: { some: { id: kategori.id } },
        publishedAt: { lte: new Date() },
      },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / YAZILAR_PER_PAGE);

  return (
    <div className="container mx-auto px-4 py-12">
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
                        src={yazi.featuredImage}
                        alt={yazi.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        unoptimized={isExternalImageUrl(yazi.featuredImage)}
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
                  href={`/bakis-dergisi?sayfa=${page - 1}`}
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
                  href={`/bakis-dergisi?sayfa=${page + 1}`}
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
