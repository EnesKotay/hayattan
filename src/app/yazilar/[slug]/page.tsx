import { isExternalImageUrl, isValidImageSrc, normalizeImageUrl } from "@/lib/image";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getAdSlots } from "@/app/admin/actions";
import { AdSlot } from "@/components/AdSlot";
import { SesliOkuButton } from "@/components/SesliOkuButton";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ShareButtons } from "@/components/ShareButtons";
import { ReadingProgressBar } from "@/components/ReadingProgressBar";
import { SiteBreadcrumb } from "@/components/SiteBreadcrumb";
import { YaziViewTracker } from "@/components/YaziViewTracker";
import { generateYaziMetadata, generateArticleSchema } from "@/lib/seo";

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 60;

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const yazi = await prisma.yazi.findFirst({
    where: { slug, publishedAt: { lte: new Date() } },
    select: {
      title: true,
      excerpt: true,
      featuredImage: true,
      slug: true,
      publishedAt: true,
      updatedAt: true,
      metaDescription: true,
      metaKeywords: true,
      ogImage: true,
      imageAlt: true,
      author: { select: { name: true } },
    },
  });

  if (!yazi) return { title: "Yazı Bulunamadı | Hayattan.Net" };

  return generateYaziMetadata(yazi);
}

export default async function YaziDetayPage({ params }: Props) {
  const { slug } = await params;

  const [yaziData, adSlots] = await Promise.all([
    prisma.yazi.findFirst({
      where: { slug, publishedAt: { lte: new Date() } },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        featuredImage: true,
        imageAlt: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        metaDescription: true,
        metaKeywords: true,
        ogImage: true,
        authorId: true,
        author: { select: { name: true, slug: true, photo: true } },
        kategoriler: { select: { id: true, name: true, slug: true } },
      },
    }),
    getAdSlots(),
  ]);

  if (!yaziData) notFound();

  // Type assertion to ensure TypeScript knows the structure
  const yazi = yaziData as NonNullable<typeof yaziData>;

  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hayattan.net").replace(/\/$/, "");
  const articleUrl = `${baseUrl}/yazilar/${yazi.slug}`;

  // İlgili yazılar: aynı kategorideki veya aynı yazardaki son yazılar (mevcut hariç)
  const kategoriIds = yazi.kategoriler.map((k) => k.id);
  const ilgiliYazilar = await prisma.yazi.findMany({
    where: {
      id: { not: yazi.id },
      publishedAt: { lte: new Date() },
      OR: [
        ...(kategoriIds.length > 0 ? [{ kategoriler: { some: { id: { in: kategoriIds } } } }] : []),
        { authorId: yazi.authorId } as { authorId: string },
      ],
    },
    orderBy: { publishedAt: "desc" },
    take: 4,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      featuredImage: true,
      publishedAt: true,
      author: { select: { name: true, slug: true } },
    },
  });

  // Generate Schema.org Article structured data
  const articleSchema = generateArticleSchema(yazi);

  const firstKategori = yazi.kategoriler[0];
  const breadcrumbItems = [
    { href: "/", label: "Ana Sayfa" },
    { href: "/yazilar", label: "Yazılar" },
    ...(firstKategori ? [{ href: `/kategoriler/${firstKategori.slug}`, label: firstKategori.name }] : []),
    { href: `/yazilar/${yazi.slug}`, label: yazi.title },
  ];

  return (
    <article className="container mx-auto max-w-3xl px-4 py-12">
      <YaziViewTracker slug={yazi.slug} />
      {/* Schema.org JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <ReadingProgressBar />

      <SiteBreadcrumb items={breadcrumbItems} />

      <header className="mb-8">
        <div className="mb-4 flex flex-wrap gap-2">
          {yazi.kategoriler.map((k) => (
            <Link
              key={k.slug}
              href={`/kategoriler/${k.slug}`}
              className="text-sm font-medium text-primary hover:underline"
            >
              {k.name}
            </Link>
          ))}
        </div>
        <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
          {yazi.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6 text-sm text-muted">
          <div className="flex items-center gap-4">
            <Link
              href={`/yazarlar/${yazi.author.slug}`}
              className="flex items-center gap-2 hover:text-primary"
            >
              {yazi.author.photo && isValidImageSrc(yazi.author.photo) ? (
                <Image
                  src={normalizeImageUrl(yazi.author.photo)!}
                  alt={yazi.author.name}
                  width={32}
                  height={32}
                  className="rounded-full object-cover"
                />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-sm font-bold text-primary">
                  {yazi.author.name.charAt(0)}
                </span>
              )}
              {yazi.author.name}
            </Link>
            {yazi.publishedAt && (
              <>
                <span className="text-border">•</span>
                <time dateTime={yazi.publishedAt.toISOString()}>
                  {new Date(yazi.publishedAt).toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </time>
              </>
            )}

          </div>

          <div className="flex items-center gap-3">
            <FavoriteButton id={yazi.id} className="h-10 w-10 flex items-center justify-center rounded-full bg-muted-bg hover:bg-muted-bg/80" />
            <ShareButtons url={articleUrl} title={yazi.title} className="hidden sm:flex" />
          </div>
        </div>
      </header>

      <SesliOkuButton
        title={yazi.title}
        htmlContent={yazi.content}
        articleId={yazi.id}
        className="mb-6"
        ariaLabel="Görme engelliler için sesli okuma: yazıyı dinle, duraklat veya durdur"
      />

      <div className="relative mb-8 aspect-video overflow-hidden rounded-lg bg-muted-bg">
        {yazi.featuredImage ? (
          <Image
            src={normalizeImageUrl(yazi.featuredImage)!}
            alt={yazi.imageAlt || yazi.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 672px"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary-light text-primary/40">
            <span className="font-serif text-6xl">Y</span>
          </div>
        )}
      </div>

      <div className="sm:hidden mb-6 flex justify-center">
        <ShareButtons url={articleUrl} title={yazi.title} />
      </div>

      {/* Reklam - Görsel altı, içerik üstü */}
      <div className="mb-8">
        <AdSlot slotId="yazi-top" size="leaderboard" content={adSlots["yazi-top"]} />
      </div>

      <div
        className="yazi-icerik prose-reading space-y-4 text-foreground [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:font-serif [&_h3]:text-xl [&_h3]:font-bold [&_p]:leading-relaxed [&_a]:text-primary [&_a]:underline [&_a:hover]:no-underline [&_ul]:list-inside [&_ul]:list-disc [&_ol]:list-inside [&_ol]:list-decimal [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted"
        dangerouslySetInnerHTML={{ __html: yazi.content }}
      />

      {/* Reklam - Yazı altı */}
      <div className="mt-8 flex justify-center">
        <AdSlot slotId="yazi-bottom" size="rectangle" content={adSlots["yazi-bottom"]} />
      </div>

      {ilgiliYazilar.length > 0 && (
        <section className="mt-12 border-t border-border pt-10" aria-label="İlgili yazılar">
          <h2 className="mb-6 font-serif text-xl font-bold text-foreground">Bunu da oku</h2>
          <ul className="grid gap-6 sm:grid-cols-2">
            {ilgiliYazilar.map((iy) => (
              <li key={iy.id}>
                <Link
                  href={`/yazilar/${iy.slug}`}
                  className="group flex gap-4 rounded-lg border border-border bg-background p-4 transition-shadow hover:shadow-md"
                >
                  <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded bg-muted-bg">
                    {iy.featuredImage ? (
                      <Image
                        src={normalizeImageUrl(iy.featuredImage)!}
                        alt={iy.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="96px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl font-serif text-primary/40">Y</div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif font-bold leading-tight text-foreground line-clamp-2 group-hover:text-primary">
                      {iy.title}
                    </h3>
                    {iy.excerpt && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted">{iy.excerpt}</p>
                    )}
                    <p className="mt-2 text-xs text-muted">
                      {iy.author.name}
                      {iy.publishedAt && (
                        <> · {new Date(iy.publishedAt).toLocaleDateString("tr-TR")}</>
                      )}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className="mt-12 border-t border-border pt-8">
        <Link
          href={`/yazarlar/${yazi.author.slug}`}
          className="inline-flex items-center gap-2 text-primary hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          ← {yazi.author.name} tüm yazıları
        </Link>
      </footer>
    </article>
  );
}
