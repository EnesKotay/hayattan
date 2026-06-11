import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { createExcerptFromHtml } from "@/lib/article-utils";
import { normalizeImageUrl } from "@/lib/image";

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const query = q?.trim();

  return {
    title: query ? `"${query}" araması | Hayattan.Net` : "Arama | Hayattan.Net",
    description: query
      ? `Hayattan.Net içinde "${query}" araması için yazı, yazar ve kategori sonuçları.`
      : "Hayattan.Net yazı, yazar ve kategori araması.",
    alternates: {
      canonical: query ? `/arama?q=${encodeURIComponent(query)}` : "/arama",
    },
  };
}

export const revalidate = 60;

export default async function AramaPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const canSearch = query.length >= 2;

  const [yazilar, yazarlar, kategoriler] = canSearch
    ? await Promise.all([
        prisma.yazi.findMany({
          where: {
            publishedAt: { lte: new Date() },
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { excerpt: { contains: query, mode: "insensitive" } },
              { content: { contains: query, mode: "insensitive" } },
            ],
          },
          orderBy: [{ viewCount: "desc" }, { publishedAt: "desc" }],
          take: 18,
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            content: true,
            featuredImage: true,
            publishedAt: true,
            author: { select: { name: true, slug: true } },
            kategoriler: { select: { name: true, slug: true } },
          },
        }),
        prisma.yazar.findMany({
          where: {
            ayrilmis: false,
            name: { contains: query, mode: "insensitive" },
          } as any,
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }] as any,
          take: 8,
          select: { id: true, name: true, slug: true, biyografi: true, photo: true },
        }),
        prisma.kategori.findMany({
          where: { name: { contains: query, mode: "insensitive" } },
          orderBy: { name: "asc" },
          take: 8,
          select: { id: true, name: true, slug: true, description: true },
        }),
      ])
    : [[], [], []] as const;

  const totalCount = yazilar.length + yazarlar.length + kategoriler.length;

  return (
    <main className="min-h-screen bg-muted-bg/30 py-10">
      <div className="container mx-auto px-4">
        <section className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Arama</p>
          <h1 className="mt-3 font-serif text-4xl font-bold text-foreground md:text-5xl">
            Site içinde ara
          </h1>
          <form action="/arama" className="mt-8 flex flex-col gap-3 rounded-2xl border border-border bg-background p-3 shadow-sm sm:flex-row">
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Yazı, yazar veya kategori ara"
              className="min-h-12 flex-1 rounded-xl border border-border bg-background px-4 text-base text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              aria-label="Aranacak kelime"
            />
            <button
              type="submit"
              className="min-h-12 rounded-xl bg-primary px-6 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
            >
              Ara
            </button>
          </form>
          {query && (
            <p className="mt-4 text-sm text-muted">
              {canSearch
                ? `"${query}" için ${totalCount} sonuç gösteriliyor.`
                : "Arama için en az 2 karakter yazın."}
            </p>
          )}
        </section>

        {canSearch && totalCount === 0 && (
          <section className="mx-auto mt-10 max-w-2xl rounded-2xl border border-dashed border-border bg-background p-10 text-center">
            <h2 className="font-serif text-2xl font-bold text-foreground">Sonuç bulunamadı</h2>
            <p className="mt-3 text-muted">Daha kısa veya farklı bir kelimeyle tekrar aramayı deneyin.</p>
          </section>
        )}

        {yazilar.length > 0 && (
          <section className="mt-12">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="font-serif text-2xl font-bold text-foreground">Yazılar</h2>
              <Link href={`/yazilar?ara=${encodeURIComponent(query)}`} className="text-sm font-semibold text-primary hover:underline">
                Gelişmiş filtrele
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {yazilar.map((yazi) => (
                <article key={yazi.id} className="group overflow-hidden rounded-2xl border border-border bg-background shadow-sm transition-shadow hover:shadow-md">
                  <Link href={`/yazilar/${yazi.slug}`} className="relative block aspect-[16/10] bg-muted-bg">
                    {yazi.featuredImage ? (
                      <Image
                        src={normalizeImageUrl(yazi.featuredImage)!}
                        alt={yazi.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-serif text-5xl text-primary/30">Y</div>
                    )}
                  </Link>
                  <div className="p-5">
                    <div className="mb-3 flex flex-wrap gap-2">
                      {yazi.kategoriler.slice(0, 2).map((kategori) => (
                        <Link key={kategori.slug} href={`/kategoriler/${kategori.slug}`} className="rounded bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                          {kategori.name}
                        </Link>
                      ))}
                    </div>
                    <Link href={`/yazilar/${yazi.slug}`}>
                      <h3 className="font-serif text-xl font-bold leading-tight text-foreground group-hover:text-primary">
                        {yazi.title}
                      </h3>
                    </Link>
                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">
                      {yazi.excerpt || createExcerptFromHtml(yazi.content)}
                    </p>
                    <p className="mt-4 text-xs font-medium text-muted">
                      <Link href={`/yazarlar/${yazi.author.slug}`} className="hover:text-primary">{yazi.author.name}</Link>
                      {yazi.publishedAt && <> · {new Date(yazi.publishedAt).toLocaleDateString("tr-TR")}</>}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {(yazarlar.length > 0 || kategoriler.length > 0) && (
          <section className="mt-12 grid gap-8 lg:grid-cols-2">
            {yazarlar.length > 0 && (
              <div>
                <h2 className="mb-6 font-serif text-2xl font-bold text-foreground">Yazarlar</h2>
                <div className="grid gap-4">
                  {yazarlar.map((yazar) => (
                    <Link key={yazar.id} href={`/yazarlar/${yazar.slug}`} className="flex items-center gap-4 rounded-2xl border border-border bg-background p-4 transition-shadow hover:shadow-md">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-primary/10">
                        {yazar.photo ? (
                          <Image src={normalizeImageUrl(yazar.photo)!} alt={yazar.name} fill className="object-cover" sizes="56px" />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center font-serif text-xl font-bold text-primary">{yazar.name.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{yazar.name}</h3>
                        {yazar.biyografi && <p className="mt-1 line-clamp-2 text-sm text-muted">{createExcerptFromHtml(yazar.biyografi, 120)}</p>}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {kategoriler.length > 0 && (
              <div>
                <h2 className="mb-6 font-serif text-2xl font-bold text-foreground">Kategoriler</h2>
                <div className="grid gap-4">
                  {kategoriler.map((kategori) => (
                    <Link key={kategori.id} href={`/kategoriler/${kategori.slug}`} className="rounded-2xl border border-border bg-background p-5 transition-shadow hover:shadow-md">
                      <h3 className="font-serif text-xl font-bold text-foreground">{kategori.name}</h3>
                      {kategori.description && <p className="mt-2 line-clamp-2 text-sm text-muted">{kategori.description}</p>}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
