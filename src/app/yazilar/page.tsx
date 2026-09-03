import { ArticleImage } from "@/components/ArticleImage";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getAdSlots } from "@/app/admin/actions";
import { AdSlot } from "@/components/AdSlot";
import { YazilarFiltre } from "@/components/YazilarFiltre";
import { generateBreadcrumbSchema, serializeJsonLd } from "@/lib/seo";
import {
  FOTOGRAFHANE_CATEGORY_WHERE,
  BAKIS_CATEGORY_WHERE,
  MISAFIR_YAZARLAR_CATEGORY_WHERE,
  isFotoğrafhanePageSlug,
  isBakisCategorySlug,
  isMisafirYazarlarCategorySlug,
} from "@/lib/site-categories";

const YAZILAR_PER_PAGE = 12;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://hayattan.net";

export const revalidate = 60;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string; yazar?: string; ara?: string; sayfa?: string }>;
}) {
  const { kategori, yazar, ara, sayfa } = await searchParams;
  const parts = [];
  if (kategori) parts.push(kategori);
  if (yazar) parts.push(yazar);
  if (ara) parts.push(`"${ara}"`);
  const page = Math.max(1, parseInt(sayfa ?? "1", 10) || 1);
  if (page > 1) parts.push(`Sayfa ${page}`);
  const suffix = parts.length ? ` - ${parts.join(" / ")}` : "";

  // Filtreli görünümler (kategori/yazar/arama) filtresiz listeye toplanır; sayfalama
  // ise kendi kendine canonical olur, aksi halde 2+. sayfalardaki yazılar indexten düşer.
  const isFiltered = Boolean(kategori || yazar || ara);
  const canonical = !isFiltered && page > 1 ? `/yazilar?sayfa=${page}` : "/yazilar";
  const description = ara
    ? `"${ara}" araması - Hayattan.Net`
    : "Hayattan.Net - Tüm yazılar";

  return {
    title: `Yazılar${suffix}`,
    description,
    alternates: {
      canonical,
    },
    // Arama filtreli liste görünümleri indexlenmemeli — sonsuz URL varyasyonu üretir
    ...(ara ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      title: `Yazılar${suffix}`,
      description: ara ? description : "Hayattan.Net yazı arşivi",
      url: canonical,
      type: "website",
    },
  };
}

export default async function YazilarPage({
  searchParams,
}: {
  searchParams: Promise<{ sayfa?: string; kategori?: string; yazar?: string; ara?: string; siralama?: string }>;
}) {
  const { sayfa = "1", kategori, yazar, ara, siralama = "son" } = await searchParams;
  const page = Math.max(1, parseInt(sayfa, 10) || 1);
  const skip = (page - 1) * YAZILAR_PER_PAGE;

  // Filtre koşulları (Fotoğrafhane, Bakış, Misafir yazarlar kategorilerindeki yazılar sadece kendi sayfalarında listelenir)
  const whereConditions: Prisma.YaziWhereInput = {
    publishedAt: { lte: new Date() },
    AND: [
      { NOT: { kategoriler: { some: FOTOGRAFHANE_CATEGORY_WHERE } } },
      { NOT: { kategoriler: { some: BAKIS_CATEGORY_WHERE } } },
      { NOT: { kategoriler: { some: MISAFIR_YAZARLAR_CATEGORY_WHERE } } },
      ...(kategori ? [{ kategoriler: { some: { slug: kategori } } }] : []),
    ],
  };
  if (yazar) {
    whereConditions.author = { slug: yazar };
  } else {
    whereConditions.author = { ayrilmis: false } as any;
  }
  if (ara?.trim()) {
    const searchTerm = ara.trim();
    whereConditions.OR = [
      { title: { contains: searchTerm, mode: "insensitive" } },
      { excerpt: { contains: searchTerm, mode: "insensitive" } },
    ];
  }

  // Sıralama
  const orderBy =
    siralama === "eski"
      ? { publishedAt: "asc" as const }
      : siralama === "okunan"
        ? { viewCount: "desc" as const }
        : { publishedAt: "desc" as const };

  const [yazilar, totalCount, kategoriler, yazarlar, adSlots] = await Promise.all([
    prisma.yazi.findMany({
      where: whereConditions,
      orderBy,
      skip,
      take: YAZILAR_PER_PAGE,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featuredImage: true,
        publishedAt: true,
        readingMinutes: true,
        author: { select: { name: true, slug: true } },
        kategoriler: { select: { name: true, slug: true } },
        etiketler: { select: { name: true, slug: true } },
      },
    }),
    prisma.yazi.count({ where: whereConditions }),
    prisma.kategori.findMany({
      where: { yazilar: { some: { publishedAt: { lte: new Date() } } } },
      orderBy: { name: "asc" },
      select: { name: true, slug: true },
    }),
    prisma.yazar.findMany({
      where: { ayrilmis: false, yazilar: { some: { publishedAt: { lte: new Date() } } } } as any,
      orderBy: [
        { sortOrder: "asc" },
        { yazilar: { _count: "desc" } },
        { name: "asc" }
      ] as any,
      select: { name: true, slug: true },
    }),
    getAdSlots(),
  ]);

  const totalPages = Math.ceil(totalCount / YAZILAR_PER_PAGE);
  const aktifKategoriAdi = kategori
    ? kategoriler.find((k) => k.slug === kategori)?.name
    : undefined;
  const aktifYazarAdi = yazar
    ? yazarlar.find((item) => item.slug === yazar)?.name
    : undefined;
  const aktifFiltreler = [
    aktifKategoriAdi,
    aktifYazarAdi,
    ara?.trim() ? `"${ara.trim()}"` : undefined,
  ].filter(Boolean);
  const kategoriKisayollari = kategoriler
    .filter(
      (item) =>
        !isFotoğrafhanePageSlug(item.slug) &&
        !isBakisCategorySlug(item.slug) &&
        !isMisafirYazarlarCategorySlug(item.slug)
    )
    .slice(0, 6);
  const paginationPages = Array.from(
    new Set(
      [1, page - 1, page, page + 1, totalPages].filter(
        (item) => item >= 1 && item <= totalPages
      )
    )
  ).sort((a, b) => a - b);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { label: "Ana Sayfa", href: SITE_URL },
    { label: "Yazılar", href: `${SITE_URL}/yazilar` },
  ]);

  function paginationUrl(p: number) {
    const params = new URLSearchParams();
    if (p > 1) params.set("sayfa", String(p));
    if (kategori) params.set("kategori", kategori);
    if (yazar) params.set("yazar", yazar);
    if (ara?.trim()) params.set("ara", ara.trim());
    if (siralama && siralama !== "son") params.set("siralama", siralama);
    const q = params.toString();
    return q ? `/yazilar?${q}` : "/yazilar";
  }

  return (
    <div className="min-h-screen bg-muted-bg/30 pb-20 pt-8 md:pt-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }}
      />
      <div className="container mx-auto px-4">
        <section className="mb-8 rounded-2xl border border-border/50 bg-background px-5 py-8 shadow-sm md:px-8 md:py-10">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-primary">
              Hayattan.Net arşivi
            </p>
            <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Son Yazılar
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
              Güncel yazıları, yazarları ve konuları tek yerden keşfedin.
              {aktifFiltreler.length > 0
                ? ` Şu an ${aktifFiltreler.join(" / ")} filtresi uygulanıyor.`
                : " Kategori, yazar veya arama ile arşivi hızla daraltın."}
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                {totalCount} yazı
              </span>
              {totalPages > 1 && (
                <span className="rounded-full bg-muted-bg px-3 py-1 text-sm font-medium text-muted">
                  {totalPages} sayfa
                </span>
              )}
            </div>
          </div>

          <nav
            className="mt-7 flex flex-wrap justify-center gap-2"
            aria-label="Yazılar kategori kısayolları"
          >
            <Link
              href="/yazilar"
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                !kategori && !yazar && !ara && siralama === "son"
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-background text-foreground hover:bg-muted-bg"
              }`}
            >
              Tümü
            </Link>
            <Link
              href="/yazilar?siralama=okunan"
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                siralama === "okunan"
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-background text-foreground hover:bg-muted-bg"
              }`}
            >
              Çok okunanlar
            </Link>
            {kategoriKisayollari.map((item) => (
              <Link
                key={item.slug}
                href={`/yazilar?kategori=${item.slug}`}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  kategori === item.slug
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-background text-foreground hover:bg-muted-bg"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </section>

        {/* Filtreler */}
        <div className="mb-8">
          <YazilarFiltre
            kategoriler={kategoriler}
            yazarlar={yazarlar}
            aktifKategori={kategori}
            aktifYazar={yazar}
            arama={ara}
            siralama={siralama}
          />
        </div>

        {/* Reklam - Sayfa üstü */}
        <div className="my-8 flex justify-center">
          <AdSlot slotId="yazilar-top" size="leaderboard" content={adSlots["yazilar-top"]} />
        </div>

        {yazilar.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-background px-6 py-14 text-center shadow-sm md:p-16">
            {kategori && isFotoğrafhanePageSlug(kategori) ? (
              <>
                <h3 className="text-xl font-semibold text-foreground">Fotoğrafhane yazıları</h3>
                <p className="mt-2 text-muted">Bu kategorideki yazılar sadece Fotoğrafhane sayfasında listelenir.</p>
                <Link href="/fotografhane" className="mt-6 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover">
                  Fotoğrafhane sayfasına git →
                </Link>
              </>
            ) : kategori && isBakisCategorySlug(kategori) ? (
              <>
                <h3 className="text-xl font-semibold text-foreground">Bakış Dergisi yazıları</h3>
                <p className="mt-2 text-muted">Bu kategorideki yazılar sadece Bakış Dergisi sayfasında listelenir.</p>
                <Link href="/bakis-dergisi" className="mt-6 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover">
                  Bakış Dergisi sayfasına git →
                </Link>
              </>
            ) : kategori && isMisafirYazarlarCategorySlug(kategori) ? (
              <>
                <h3 className="text-xl font-semibold text-foreground">Misafir yazıları</h3>
                <p className="mt-2 text-muted">Bu kategorideki yazılar sadece Misafir Yazıları sayfasında listelenir.</p>
                <Link href="/misafir-yazarlar" className="mt-6 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover">
                  Misafir Yazıları sayfasına git →
                </Link>
              </>
            ) : (
              <>
                <div className="mb-4 rounded-full bg-primary/10 p-4">
                  <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="font-serif text-2xl font-bold text-foreground">Sonuç bulunamadı</h3>
                <p className="mt-3 max-w-xl text-muted">
                  Bu arama ve filtre kombinasyonuna uygun yazı bulamadık. Daha genel bir kelime deneyebilir veya filtreleri temizleyebilirsiniz.
                </p>
                {(kategori || yazar || ara || siralama !== "son") && (
                  <Link href="/yazilar" className="mt-6 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover">
                    Filtreleri Temizle
                  </Link>
                )}
              </>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8">
              {yazilar.map((yazi) => (
                <article
                  key={yazi.id}
                  className="group relative flex min-h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-background shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl"
                >
                  <Link
                    href={`/yazilar/${yazi.slug}`}
                    className="relative block aspect-[16/10] overflow-hidden bg-muted-bg"
                    aria-label={`${yazi.title} yazısını oku`}
                  >
                    <ArticleImage
                      src={yazi.featuredImage}
                      alt={yazi.title}
                      className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                      {yazi.kategoriler.slice(0, 1).map((k) => (
                        <span key={k.slug} className="rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-gray-900 shadow-sm backdrop-blur-md">
                          {k.name}
                        </span>
                      ))}
                    </div>
                  </Link>

                  <div className="flex flex-1 flex-col p-5 md:p-6">
                    <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted">
                      {yazi.publishedAt && (
                        <time dateTime={new Date(yazi.publishedAt).toISOString()}>
                          {new Date(yazi.publishedAt).toLocaleDateString("tr-TR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </time>
                      )}
                      {yazi.readingMinutes && yazi.readingMinutes > 0 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{yazi.readingMinutes} dk okuma</span>
                        </>
                      )}
                    </div>

                    <Link href={`/yazilar/${yazi.slug}`} className="group-hover:text-primary">
                      <h2 className="line-clamp-2 font-serif text-xl font-bold leading-tight text-foreground transition-colors">
                        {yazi.title}
                      </h2>
                    </Link>

                    {yazi.excerpt && (
                      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">
                        {yazi.excerpt}
                      </p>
                    )}

                    {yazi.etiketler.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {yazi.etiketler.slice(0, 3).map((e) => (
                          <Link
                            key={e.slug}
                            href={`/etiketler/${e.slug}`}
                            onClick={(ev) => ev.stopPropagation()}
                            className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-white"
                          >
                            #{e.name}
                          </Link>
                        ))}
                      </div>
                    )}

                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4 text-xs text-muted">
                      <Link
                        href={`/yazarlar/${yazi.author.slug}`}
                        className="flex min-w-0 items-center gap-2 transition-colors hover:text-primary"
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                          {yazi.author.name.charAt(0)}
                        </div>
                        <span className="truncate font-semibold">{yazi.author.name}</span>
                      </Link>

                      <Link
                        href={`/yazilar/${yazi.slug}`}
                        className="shrink-0 font-semibold text-primary hover:underline"
                      >
                        Oku
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Reklam - Yazılar arası */}
            <div className="my-12 flex justify-center">
              <AdSlot slotId="yazilar-mid" size="rectangle" content={adSlots["yazilar-mid"]} />
            </div>

            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <nav className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-border bg-background p-2 shadow-sm" aria-label="Yazılar sayfaları">
                  {page > 1 ? (
                    <Link
                      href={paginationUrl(page - 1)}
                      className="flex h-10 items-center justify-center rounded-lg border border-border px-3 text-sm font-semibold text-foreground transition-colors hover:bg-primary hover:text-white"
                      aria-label="Önceki sayfa"
                    >
                      Önceki
                    </Link>
                  ) : (
                    <span className="flex h-10 items-center justify-center rounded-lg border border-border/50 px-3 text-sm font-semibold text-muted/50">
                      Önceki
                    </span>
                  )}

                  <div className="flex items-center gap-1">
                    {paginationPages.map((pageNumber, index) => (
                      <div key={pageNumber} className="flex items-center gap-1">
                        {index > 0 && pageNumber - paginationPages[index - 1] > 1 && (
                          <span className="px-1 text-sm text-muted">...</span>
                        )}
                        <Link
                          href={paginationUrl(pageNumber)}
                          aria-current={pageNumber === page ? "page" : undefined}
                          className={`flex h-10 min-w-10 items-center justify-center rounded-lg px-3 text-sm font-semibold transition-colors ${
                            pageNumber === page
                              ? "bg-primary text-white"
                              : "text-foreground hover:bg-muted-bg"
                          }`}
                        >
                          {pageNumber}
                        </Link>
                      </div>
                    ))}
                  </div>

                  {page < totalPages ? (
                    <Link
                      href={paginationUrl(page + 1)}
                      className="flex h-10 items-center justify-center rounded-lg border border-border px-3 text-sm font-semibold text-foreground transition-colors hover:bg-primary hover:text-white"
                      aria-label="Sonraki sayfa"
                    >
                      Sonraki
                    </Link>
                  ) : (
                    <span className="flex h-10 items-center justify-center rounded-lg border border-border/50 px-3 text-sm font-semibold text-muted/50">
                      Sonraki
                    </span>
                  )}
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
