import { ArticleImage } from "@/components/ArticleImage";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { SiteBreadcrumb } from "@/components/SiteBreadcrumb";

export const revalidate = 60;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sayfa?: string }>;
};

const YAZILAR_PER_PAGE = 12;

/** Bu sayının altındaki etiket sayfaları "thin content" sayılıp indexlenmiyor */
const MIN_INDEXABLE_YAZI = 3;

export async function generateMetadata({ params, searchParams }: Props) {
  const { slug } = await params;
  const { sayfa } = await searchParams;
  const etiket = await (prisma as any).etiket.findUnique({
    where: { slug },
    select: { name: true },
  });
  if (!etiket) return { title: "Etiket Bulunamadı" };

  const yaziSayisi = await prisma.yazi.count({
    where: {
      etiketler: { some: { slug } },
      publishedAt: { lte: new Date() },
    } as any,
  });

  const page = Math.max(1, parseInt(sayfa ?? "1", 10) || 1);
  const canonical = page > 1 ? `/etiketler/${slug}?sayfa=${page}` : `/etiketler/${slug}`;
  const pageSuffix = page > 1 ? ` — Sayfa ${page}` : "";
  const description = `"${etiket.name}" etiketiyle yazılmış ${yaziSayisi} içerik — Hayattan.Net`;

  return {
    title: `${etiket.name} Etiketi${pageSuffix}`,
    description,
    alternates: { canonical },
    robots: {
      index: yaziSayisi >= MIN_INDEXABLE_YAZI,
      follow: true,
    },
    openGraph: { type: "website", url: canonical, title: `${etiket.name} Etiketi${pageSuffix}`, description },
  };
}

export default async function EtiketDetayPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { sayfa = "1" } = await searchParams;
  const page = Math.max(1, parseInt(sayfa, 10) || 1);
  const skip = (page - 1) * YAZILAR_PER_PAGE;

  const db = prisma as any;

  const [etiket, yazilar, totalCount] = await Promise.all([
    db.etiket.findUnique({
      where: { slug },
      select: { id: true, name: true, slug: true },
    }),
    db.yazi.findMany({
      where: {
        etiketler: { some: { slug } },
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
        readingMinutes: true,
        author: { select: { name: true, slug: true } },
        kategoriler: { select: { name: true, slug: true } },
        etiketler: { select: { name: true, slug: true } },
      },
    }),
    db.yazi.count({
      where: {
        etiketler: { some: { slug } },
        publishedAt: { lte: new Date() },
      },
    }),
  ]);

  if (!etiket) notFound();

  const totalPages = Math.ceil(totalCount / YAZILAR_PER_PAGE);

  const breadcrumbItems = [
    { href: "/", label: "Ana Sayfa" },
    { href: "/etiketler", label: "Etiketler" },
    { href: `/etiketler/${etiket.slug}`, label: etiket.name },
  ];

  return (
    <div className="min-h-screen bg-muted-bg/30 pb-20 pt-10">
      <div className="container mx-auto px-4">
        <SiteBreadcrumb items={breadcrumbItems} />

        <div className="mb-10 mt-4 text-center">
          <span className="inline-block rounded-full bg-primary/10 px-4 py-1 text-sm font-semibold text-primary">
            Etiket
          </span>
          <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            {etiket.name}
          </h1>
          {totalCount > 0 && (
            <p className="mt-3 text-muted">
              <span className="font-medium text-foreground">{totalCount}</span> yazı bulundu
            </p>
          )}
        </div>

        {yazilar.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-background p-16 text-center">
            <p className="text-muted">Bu etiketle ilişkili yayımlanmış yazı bulunamadı.</p>
            <Link href="/etiketler" className="mt-4 text-sm text-primary hover:underline">
              Tüm etiketlere dön
            </Link>
          </div>
        ) : (
          <>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {yazilar.map((yazi: {
                id: string; title: string; slug: string; excerpt?: string;
                featuredImage?: string; publishedAt?: Date; readingMinutes: number;
                author: { name: string; slug: string };
                kategoriler: { name: string; slug: string }[];
                etiketler: { name: string; slug: string }[];
              }) => (
                <article
                  key={yazi.id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-background shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <Link href={`/yazilar/${yazi.slug}`} className="relative block aspect-[16/10] overflow-hidden">
                    <ArticleImage
                      src={yazi.featuredImage}
                      alt={yazi.title}
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    {yazi.kategoriler[0] && (
                      <div className="absolute left-4 top-4">
                        <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-gray-900 shadow-sm backdrop-blur-md">
                          {yazi.kategoriler[0].name}
                        </span>
                      </div>
                    )}
                  </Link>

                  <div className="flex flex-1 flex-col p-6">
                    <Link href={`/yazilar/${yazi.slug}`}>
                      <h2 className="mb-3 font-serif text-xl font-bold leading-tight text-foreground transition-colors line-clamp-2 group-hover:text-primary">
                        {yazi.title}
                      </h2>
                    </Link>
                    {yazi.excerpt && (
                      <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-muted">{yazi.excerpt}</p>
                    )}

                    {/* Etiketler */}
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {yazi.etiketler.map((e) => (
                        <Link
                          key={e.slug}
                          href={`/etiketler/${e.slug}`}
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${e.slug === slug ? "bg-primary text-white" : "bg-primary/10 text-primary hover:bg-primary hover:text-white"}`}
                        >
                          #{e.name}
                        </Link>
                      ))}
                    </div>

                    <div className="mt-auto flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                      <Link href={`/yazarlar/${yazi.author.slug}`} className="flex items-center gap-2 hover:text-primary">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                          {yazi.author.name.charAt(0)}
                        </div>
                        <span className="font-medium">{yazi.author.name}</span>
                      </Link>
                      <div className="flex items-center gap-3">
                        {yazi.readingMinutes > 0 && (
                          <span>{yazi.readingMinutes} dk</span>
                        )}
                        {yazi.publishedAt && (
                          <span>{new Date(yazi.publishedAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long" })}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <nav className="flex items-center gap-2 rounded-full border border-border bg-white p-2 shadow-sm">
                  {page > 1 ? (
                    <Link href={`/etiketler/${slug}?sayfa=${page - 1}`} className="flex h-10 w-10 items-center justify-center rounded-full border border-border transition-colors hover:bg-primary hover:text-white">←</Link>
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed">←</span>
                  )}
                  <span className="px-4 text-sm font-medium text-muted">
                    Sayfa <span className="text-foreground">{page}</span> / {totalPages}
                  </span>
                  {page < totalPages ? (
                    <Link href={`/etiketler/${slug}?sayfa=${page + 1}`} className="flex h-10 w-10 items-center justify-center rounded-full border border-border transition-colors hover:bg-primary hover:text-white">→</Link>
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed">→</span>
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
