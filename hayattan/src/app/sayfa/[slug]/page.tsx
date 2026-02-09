import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPageBySlug } from "@/app/admin/actions";
import { sanitizeHtml } from "@/lib/sanitize";
import { isExternalImageUrl } from "@/lib/image";
import { isFotoğrafhanePageSlug, FOTOGRAFHANE_CATEGORY_WHERE } from "@/lib/site-categories";
import { prisma } from "@/lib/db";

const YAZILAR_PER_PAGE = 12;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sayfa?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) return { title: "Sayfa bulunamadı | Hayattan.Net" };
  return {
    title: `${page.title} | Hayattan.Net`,
    description: page.title,
  };
}

export default async function SayfaPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { sayfa: sayfaParam = "1" } = await searchParams;
  const page = await getPageBySlug(slug);
  if (!page) notFound();

  const safeContent = sanitizeHtml(page.content);
  const isFotoğrafhane = isFotoğrafhanePageSlug(slug);

  let fotoğrafhaneYazilar: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    featuredImage: string | null;
    publishedAt: Date | null;
    author: { name: string; slug: string };
    kategoriler: { name: string; slug: string }[];
  }[] = [];
  let fotoğrafhaneTotalCount = 0;
  let fotoğrafhaneTotalPages = 0;
  let fotoğrafhanePage = 1;

  if (isFotoğrafhane) {
    const kategori = await prisma.kategori.findFirst({
      where: FOTOGRAFHANE_CATEGORY_WHERE,
    });
    fotoğrafhanePage = Math.max(1, parseInt(sayfaParam, 10) || 1);
    const skip = (fotoğrafhanePage - 1) * YAZILAR_PER_PAGE;

    if (kategori) {
      const [yazilar, totalCount] = await Promise.all([
        prisma.yazi.findMany({
          where: {
            kategoriler: { some: { id: kategori.id } },
            publishedAt: { not: null },
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
            publishedAt: { not: null },
          },
        }),
      ]);
      fotoğrafhaneYazilar = yazilar;
      fotoğrafhaneTotalCount = totalCount;
      fotoğrafhaneTotalPages = Math.ceil(totalCount / YAZILAR_PER_PAGE);
    }
  }

  return (
    <article className={`container mx-auto px-4 py-12 ${isFotoğrafhane ? "max-w-6xl" : "max-w-3xl"}`}>
      <h1 className="mb-8 font-serif text-3xl font-bold text-foreground md:text-4xl">
        {page.title}
      </h1>
      {page.featuredImage && (
        <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-lg bg-muted-bg">
          <Image
            src={page.featuredImage}
            alt={page.title}
            fill
            className="object-cover"
            unoptimized={isExternalImageUrl(page.featuredImage)}
          />
        </div>
      )}
      <div
        className="prose prose-lg max-w-none text-foreground/90 prose-headings:font-serif prose-headings:text-primary"
        dangerouslySetInnerHTML={{ __html: safeContent }}
      />

      {/* Fotoğrafhane sayfası: bu kategorideki yazılar */}
      {isFotoğrafhane && (
        <section className="mt-16 border-t border-border pt-12">
          <h2 className="mb-8 font-serif text-2xl font-bold text-foreground">
            Fotoğrafhane yazıları
          </h2>
          {fotoğrafhaneYazilar.length === 0 ? (
            <div className="rounded-lg border border-border bg-muted-bg/30 p-12 text-center">
              <p className="text-muted">Bu kategoride henüz yazı bulunmuyor. Yazı eklerken &quot;Fotoğrafhane&quot; kategorisini seçin.</p>
            </div>
          ) : (
            <>
              <p className="mb-6 text-sm text-muted">
                Toplam {fotoğrafhaneTotalCount} yazı
              </p>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {fotoğrafhaneYazilar.map((yazi) => (
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
                          <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary/50">
                            <span className="font-serif text-5xl">Y</span>
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="flex flex-1 flex-col p-4">
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
              {fotoğrafhaneTotalPages > 1 && (
                <nav
                  className="mt-12 flex justify-center gap-2"
                  aria-label="Sayfa navigasyonu"
                >
                  {fotoğrafhanePage > 1 && (
                    <Link
                      href={`/sayfa/${slug}?sayfa=${fotoğrafhanePage - 1}`}
                      className="rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted-bg"
                    >
                      ← Önceki
                    </Link>
                  )}
                  <span className="flex items-center px-4 py-2 text-sm text-muted">
                    Sayfa {fotoğrafhanePage} / {fotoğrafhaneTotalPages}
                  </span>
                  {fotoğrafhanePage < fotoğrafhaneTotalPages && (
                    <Link
                      href={`/sayfa/${slug}?sayfa=${fotoğrafhanePage + 1}`}
                      className="rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted-bg"
                    >
                      Sonraki →
                    </Link>
                  )}
                </nav>
              )}
            </>
          )}
        </section>
      )}

      <p className="mt-12">
        <Link href="/" className="text-primary hover:underline">
          ← Ana sayfaya dön
        </Link>
      </p>
    </article>
  );
}
