import { isValidImageSrc, normalizeImageUrl } from "@/lib/image";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { NewsletterForm } from "@/components/NewsletterForm";
import { AuthorFollowButton } from "@/components/AuthorFollowButton";
import { SiteBreadcrumb } from "@/components/SiteBreadcrumb";
import { auth } from "@/lib/auth";
import { createExcerptFromHtml } from "@/lib/article-utils";
import { generateAuthorSchema, serializeJsonLd } from "@/lib/seo";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sayfa?: string }>;
};

const YAZILAR_PER_PAGE = 12;

export async function generateMetadata({ params, searchParams }: Props) {
  const { slug } = await params;
  const { sayfa } = await searchParams;
  const yazar = await prisma.yazar.findUnique({
    where: { slug },
    select: { name: true, biyografi: true, photo: true },
  });

  if (!yazar) return { title: "Yazar Bulunamadı" };

  const page = Math.max(1, parseInt(sayfa ?? "1", 10) || 1);
  const canonical = page > 1 ? `/yazarlar/${slug}?sayfa=${page}` : `/yazarlar/${slug}`;
  const pageSuffix = page > 1 ? ` — Sayfa ${page}` : "";
  const description = yazar.biyografi
    ? createExcerptFromHtml(yazar.biyografi, 160)
    : `${yazar.name} - Hayattan.Net yazarı. Tüm yazıları ve profili.`;

  return {
    title: `${yazar.name}${pageSuffix}`,
    description,
    alternates: { canonical },
    openGraph: {
      type: "profile",
      url: canonical,
      title: `${yazar.name}${pageSuffix}`,
      description,
      ...(yazar.photo ? { images: [yazar.photo] } : {}),
    },
  };
}

export default async function YazarDetayPage({ params, searchParams }: Props) {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";
  const { slug } = await params;
  const { sayfa = "1" } = await searchParams;
  const page = Math.max(1, parseInt(sayfa, 10) || 1);
  const skip = (page - 1) * YAZILAR_PER_PAGE;

  const [yazar, yazilar, allAuthorPosts] = await Promise.all([
    prisma.yazar.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        email: true,
        photo: true,
        biyografi: true,
        misafir: true,
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
    prisma.yazi.findMany({
      where: {
        author: { slug },
        publishedAt: { lte: new Date() },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featuredImage: true,
        publishedAt: true,
        viewCount: true,
        kategoriler: { select: { name: true, slug: true } },
      },
    }),
  ]);

  if (!yazar) notFound();

  const totalCount = allAuthorPosts.length;
  const totalPages = Math.ceil(totalCount / YAZILAR_PER_PAGE);
  const totalViews = allAuthorPosts.reduce((sum, post) => sum + post.viewCount, 0);

  const featuredYazi = [...allAuthorPosts].sort((a, b) => {
    const viewDiff = b.viewCount - a.viewCount;
    if (viewDiff !== 0) return viewDiff;
    return (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0);
  })[0];

  const recentYazilar = [...allAuthorPosts]
    .sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0))
    .filter((post) => post.id !== featuredYazi?.id)
    .slice(0, 3);

  const temaMap = new Map<string, { name: string; slug: string; count: number }>();
  for (const post of allAuthorPosts) {
    for (const kategori of post.kategoriler) {
      const existing = temaMap.get(kategori.slug);
      if (existing) existing.count += 1;
      else temaMap.set(kategori.slug, { ...kategori, count: 1 });
    }
  }

  const topTemalar = [...temaMap.values()].sort((a, b) => b.count - a.count).slice(0, 6);
  const lastPublishedAt = [...allAuthorPosts]
    .map((post) => post.publishedAt)
    .filter(Boolean)
    .sort((a, b) => (b?.getTime() ?? 0) - (a?.getTime() ?? 0))[0];

  const breadcrumbItems = [
    { href: "/", label: "Ana Sayfa" },
    { href: "/yazarlar", label: "Yazarlar" },
    { href: `/yazarlar/${yazar.slug}`, label: yazar.name },
  ];

  const authorSchema = generateAuthorSchema({
    name: yazar.name,
    slug: yazar.slug,
    bio: yazar.biyografi,
    photo: yazar.photo,
    yaziSayisi: totalCount,
  });

  return (
    <div className="bg-muted-bg/20 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(authorSchema) }}
      />
      <div className="container mx-auto px-4">
        <SiteBreadcrumb items={breadcrumbItems} />

        <header className="mt-4 overflow-hidden rounded-[32px] border border-border bg-background shadow-sm">
          <div className="bg-gradient-to-r from-primary/12 via-primary/5 to-transparent px-6 py-8 sm:px-8 lg:px-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-full border-4 border-background shadow-md sm:h-40 sm:w-40">
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

                <div className="max-w-3xl">
                  <div className="flex flex-wrap items-center gap-3">
                    {yazar.misafir && (
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                        Misafir Yazar
                      </span>
                    )}
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {totalCount} yazı
                    </span>
                    {isAdmin && (
                      <span className="rounded-full bg-muted-bg px-3 py-1 text-xs font-semibold text-muted">
                        {totalViews} okunma
                      </span>
                    )}
                  </div>

                  <h1 className="mt-4 font-serif text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                    {yazar.name}
                  </h1>

                  {yazar.biyografi && (
                    <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
                      {yazar.biyografi}
                    </p>
                  )}

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <AuthorFollowButton authorId={yazar.id} authorName={yazar.name} />
                    {yazar.email && (
                      <a
                        href={`mailto:${yazar.email}`}
                        className="inline-flex items-center justify-center rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
                      >
                        Yazara Ulaş
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:w-[360px] lg:grid-cols-1">
                <div className="rounded-2xl border border-border bg-muted-bg/40 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Toplam Yazı</p>
                  <p className="mt-2 font-serif text-3xl font-bold text-foreground">{totalCount}</p>
                </div>
                <div className="rounded-2xl border border-border bg-muted-bg/40 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Öne Çıkan Tema</p>
                  <p className="mt-2 font-serif text-2xl font-bold text-foreground">
                    {topTemalar[0]?.name ?? "Yakında"}
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-muted-bg/40 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Son Yayın</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {lastPublishedAt
                      ? new Date(lastPublishedAt).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "Henüz yayın yok"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {featuredYazi && (
          <section className="mt-10 grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
            <article className="overflow-hidden rounded-[28px] border border-border bg-background shadow-sm">
              <div className="border-b border-border px-6 py-5 sm:px-8">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Öne Çıkan Yazı</p>
                <h2 className="mt-2 font-serif text-3xl font-bold text-foreground">
                  {featuredYazi.title}
                </h2>
              </div>
              <Link href={`/yazilar/${featuredYazi.slug}`} className="block">
                <div className="relative aspect-[16/9] overflow-hidden bg-muted-bg">
                  {featuredYazi.featuredImage ? (
                    <Image
                      src={normalizeImageUrl(featuredYazi.featuredImage)!}
                      alt={featuredYazi.title}
                      fill
                      className="object-cover transition-transform hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 66vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary-light text-primary/50">
                      <span className="font-serif text-7xl">Y</span>
                    </div>
                  )}
                </div>
              </Link>
              <div className="space-y-4 px-6 py-6 sm:px-8">
                {featuredYazi.excerpt && (
                  <p className="text-base leading-relaxed text-muted">{featuredYazi.excerpt}</p>
                )}
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
                  {isAdmin && <span>{featuredYazi.viewCount} okunma</span>}
                  {featuredYazi.publishedAt && (
                    <>
                      <span>•</span>
                      <time dateTime={featuredYazi.publishedAt.toISOString()}>
                        {new Date(featuredYazi.publishedAt).toLocaleDateString("tr-TR")}
                      </time>
                    </>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {featuredYazi.kategoriler.slice(0, 3).map((kategori) => (
                    <Link
                      key={kategori.slug}
                      href={`/kategoriler/${kategori.slug}`}
                      className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary hover:text-white"
                    >
                      {kategori.name}
                    </Link>
                  ))}
                </div>
              </div>
            </article>

            <div className="space-y-6">
              <section className="rounded-[28px] border border-border bg-background p-6 shadow-sm sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Yazarın Temaları</p>
                <h2 className="mt-2 font-serif text-2xl font-bold text-foreground">Sık Yazdığı Alanlar</h2>
                <div className="mt-5 flex flex-wrap gap-3">
                  {topTemalar.length > 0 ? (
                    topTemalar.map((tema) => (
                      <Link
                        key={tema.slug}
                        href={`/kategoriler/${tema.slug}`}
                        className="inline-flex items-center gap-2 rounded-full border border-border bg-muted-bg/40 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                      >
                        {tema.name}
                        <span className="rounded-full bg-background px-2 py-0.5 text-xs text-muted">
                          {tema.count}
                        </span>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-muted">Tema verisi henüz oluşmadı.</p>
                  )}
                </div>
              </section>

              <NewsletterForm />
            </div>
          </section>
        )}

        {recentYazilar.length > 0 && (
          <section className="mt-10">
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Güncel Akış</p>
              <h2 className="mt-2 font-serif text-2xl font-bold text-foreground">Son Yazıları</h2>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {recentYazilar.map((yazi) => (
                <article
                  key={yazi.id}
                  className="group overflow-hidden rounded-[24px] border border-border bg-background shadow-sm"
                >
                  <Link href={`/yazilar/${yazi.slug}`} className="block">
                    <div className="relative aspect-[16/10] overflow-hidden bg-muted-bg">
                      {yazi.featuredImage ? (
                        <Image
                          src={normalizeImageUrl(yazi.featuredImage)!}
                          alt={yazi.title}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                          sizes="(max-width: 1024px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-primary-light text-primary/50">
                          <span className="font-serif text-5xl">Y</span>
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="space-y-3 p-5">
                    <Link href={`/yazilar/${yazi.slug}`}>
                      <h3 className="font-serif text-xl font-bold text-foreground group-hover:text-primary">
                        {yazi.title}
                      </h3>
                    </Link>
                    {yazi.excerpt && <p className="line-clamp-3 text-sm text-muted">{yazi.excerpt}</p>}
                    <div className="flex flex-wrap gap-2">
                      {yazi.kategoriler.slice(0, 2).map((kategori) => (
                        <Link
                          key={kategori.slug}
                          href={`/kategoriler/${kategori.slug}`}
                          className="text-xs font-semibold text-primary hover:underline"
                        >
                          {kategori.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <div className="mt-12">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Arşiv</p>
          <h2 className="mt-2 font-serif text-2xl font-bold text-foreground">Tüm Yazılar</h2>
        </div>

        {yazilar.length === 0 ? (
          <div className="mt-8 rounded-[24px] border border-border bg-background p-12 text-center">
            <p className="text-muted">Bu yazara ait henüz yazı bulunmuyor.</p>
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {yazilar.map((yazi) => (
                <article
                  key={yazi.id}
                  className="group flex flex-col overflow-hidden rounded-[24px] border border-border bg-background transition-shadow hover:shadow-md"
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
                    className="rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted-bg"
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
                    className="rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted-bg"
                  >
                    Sonraki →
                  </Link>
                )}
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}
