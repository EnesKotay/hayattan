import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { parseSearchFilters, searchWhere, searchHref, type SearchParams } from "@/backend/modules/search/filters";
import { getHomeCategories } from "@/backend/modules/categories/home-categories";
import type { Prisma } from "@prisma/client";
import { repository } from "@/backend/modules/data/repository";
import { createExcerptFromHtml } from "@/backend/modules/articles/utils";
import { normalizeImageUrl } from "@/shared/media/image";

type SearchPageProps = {
  searchParams: Promise<SearchParams>;
};

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q: query } = parseSearchFilters(await searchParams);

  return {
    title: query ? `"${query}" araması` : "Arama",
    description: query
      ? `Hayattan.Net içinde "${query}" araması için yazı, yazar ve kategori sonuçları.`
      : "Hayattan.Net yazı, yazar ve kategori araması.",
    alternates: {
      canonical: "/arama",
    },
    // Arama sonuç sayfaları indexlenmemeli: sonsuz sayıda düşük kaliteli URL üretir
    // ve Google'ın site içi arama sonucu yönergesine aykırı. Linkler yine izlensin.
    robots: { index: false, follow: true },
  };
}

export const revalidate = 60;

export default async function AramaPage({ searchParams }: SearchPageProps) {
  const filters = parseSearchFilters(await searchParams);
  const { q: query } = filters;
  const canSearch = query.length === 0 || query.length >= 2;
  const filtered = Boolean(filters.category || filters.author || filters.period);
  const where = searchWhere(filters);
  const orderBy: Prisma.YaziOrderByWithRelationInput[] = filters.sort === "popular"
    ? [{ viewCount: "desc" }, { publishedAt: "desc" }, { id: "asc" }]
    : [{ publishedAt: filters.sort === "oldest" ? "asc" : "desc" }, { id: "asc" }];
  const allCategories = await repository.kategori.findMany({ orderBy: { name: "asc" }, select: { name: true, slug: true } });
  const allAuthors = await repository.yazar.findMany({ where: { ayrilmis: false }, orderBy: { name: "asc" }, select: { name: true, slug: true } });
  const articleCount = canSearch ? await repository.yazi.count({ where }) : 0;
  const pageCount = Math.max(1, Math.ceil(articleCount / 18));
  const currentPage = Math.min(filters.page, pageCount);
  const yazilar = canSearch ? await repository.yazi.findMany({
    where, orderBy, take: 18, skip: (currentPage - 1) * 18,
    select: { id: true, title: true, slug: true, excerpt: true, content: true, featuredImage: true,
      publishedAt: true, author: { select: { name: true, slug: true } }, kategoriler: { select: { name: true, slug: true } } },
  }) : [];
  const yazarlar = canSearch && query && !filtered && currentPage === 1 ? await repository.yazar.findMany({
    where: { ayrilmis: false, name: { contains: query, mode: "insensitive" } },
    orderBy: { name: "asc" }, take: 8, select: { id: true, name: true, slug: true, biyografi: true, photo: true },
  }) : [];
  const kategoriler = canSearch && query && !filtered && currentPage === 1 ? await repository.kategori.findMany({
    where: { name: { contains: query, mode: "insensitive" } }, orderBy: { name: "asc" }, take: 8,
    select: { id: true, name: true, slug: true, description: true },
  }) : [];
  const suggestedCategories = articleCount === 0 ? await getHomeCategories() : [];

  return (
    <div className="min-h-screen bg-muted-bg/30 py-10">
      <div className="container mx-auto px-4">
        <section className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Arama</p>
          <h1 className="mt-3 font-serif text-4xl font-bold text-foreground md:text-5xl">
            Site içinde ara
          </h1>
          <form action="/arama" className="mt-8 grid gap-3 rounded-2xl border border-border bg-background p-4 text-left shadow-sm sm:grid-cols-2">
            <input
              type="search"
              name="q"
              maxLength={120}
              defaultValue={query}
              placeholder="Yazı, yazar veya kategori ara"
              className="min-h-12 flex-1 rounded-xl border border-border bg-background px-4 text-base text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              aria-label="Aranacak kelime"
            />
            <label className="text-sm font-semibold">Konu
              <select name="kategori" defaultValue={filters.category} className="mt-1 min-h-12 w-full rounded-xl border border-border bg-background px-3">
                <option value="">Tüm konular</option>
                {allCategories.map(category => <option key={category.slug} value={category.slug}>{category.name}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold">Yazar
              <select name="yazar" defaultValue={filters.author} className="mt-1 min-h-12 w-full rounded-xl border border-border bg-background px-3">
                <option value="">Tüm yazarlar</option>
                {allAuthors.map(author => <option key={author.slug} value={author.slug}>{author.name}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold">Tarih
              <select name="donem" defaultValue={filters.period} className="mt-1 min-h-12 w-full rounded-xl border border-border bg-background px-3">
                <option value="">Tüm zamanlar</option><option value="30">Son 30 gün</option><option value="365">Son bir yıl</option>
              </select>
            </label>
            <label className="text-sm font-semibold">Sıralama
              <select name="sirala" defaultValue={filters.sort} className="mt-1 min-h-12 w-full rounded-xl border border-border bg-background px-3">
                <option value="newest">En yeni</option><option value="oldest">En eski</option><option value="popular">En çok görüntülenen</option>
              </select>
            </label>
            <button
              type="submit"
              className="min-h-12 rounded-xl bg-primary px-6 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
            >
              Ara
            </button>
          </form>
          <Link href="/arama" className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-primary">Aramayı temizle</Link>
          <p className="mt-2 text-sm text-muted" role="status">
            {canSearch ? `${articleCount} yazı bulundu. ${articleCount > 0 ? `${currentPage}. sayfa / ${pageCount}` : ""}` : "Arama için en az 2 karakter yazın veya yalnızca filtreleri kullanın."}
          </p>
        </section>

        {canSearch && articleCount === 0 && (
          <section className="mx-auto mt-10 max-w-2xl rounded-2xl border border-dashed border-border bg-background p-6 text-center">
            <h2 className="font-serif text-2xl font-bold text-foreground">Yazı bulunamadı</h2>
            <p className="mt-3 text-muted">Daha kısa bir kelime deneyin veya aşağıdaki konuları keşfedin.</p>
            {filtered && <Link className="mt-3 inline-flex min-h-11 items-center font-semibold text-primary" href={`/arama?q=${encodeURIComponent(query)}`}>Filtreleri kaldır, kelimeyle ara</Link>}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {suggestedCategories.map(category => <Link key={category.id} href={`/arama?kategori=${encodeURIComponent(category.slug)}`} className="inline-flex min-h-11 items-center rounded-full border border-border px-4 text-sm">{category.name}</Link>)}
              <Link href="/kategoriler" className="inline-flex min-h-11 items-center px-4 font-semibold text-primary">Tüm konular</Link>
            </div>
          </section>
        )}

        {yazilar.length > 0 && (
          <section className="mt-12">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="font-serif text-2xl font-bold text-foreground">Yazılar</h2>

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

        {pageCount > 1 && (
          <nav className="mt-8 flex items-center justify-center gap-6" aria-label="Arama sonuç sayfaları">
            {currentPage > 1 && <Link className="min-h-11 rounded-xl border border-border px-4 py-3" href={searchHref(filters, currentPage - 1)}>Önceki sayfa</Link>}
            <span>{currentPage} / {pageCount}</span>
            {currentPage < pageCount && <Link className="min-h-11 rounded-xl border border-border px-4 py-3" href={searchHref(filters, currentPage + 1)}>Sonraki sayfa</Link>}
          </nav>
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
    </div>
  );
}
