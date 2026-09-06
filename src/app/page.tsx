import { Reveal } from "@/components/Animations/Reveal";
import { prisma, runInBatches } from "@/lib/db";
import { getAdSlots } from "@/app/admin/actions";
import { AdSlot } from "@/components/AdSlot";
import { Slider, type SliderItem } from "@/components/Slider";
import { SonYazilar } from "@/components/SonYazilar";
import { YazarlarBolumu } from "@/components/YazarlarBolumu";
import type { Metadata } from "next";
import { generateWebSiteSchema, serializeJsonLd } from "@/lib/seo";
import Link from "next/link";
import { getHomeCategories } from "@/lib/home-categories";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": "/feed.xml" },
  },
};

type HaberRow = {
  id: string;
  title: string;
  excerpt: string | null;
  imageUrl: string | null;
  link: string | null;
  authorName: string | null;
  publishedAt: Date | null;
};

type YazarRow = {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  photo: string | null;
};

async function getHaberler(): Promise<HaberRow[]> {
  const rows = await prisma.haber.findMany({
    where: { publishedAt: { lte: new Date() } },
    orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
    take: 10,
    select: {
      id: true,
      title: true,
      excerpt: true,
      imageUrl: true,
      link: true,
      authorName: true,
      publishedAt: true,
    },
  });
  return rows;
}
/** Ana sayfa yazarları: misafir değil, ayrılmamış. */
async function getYazarlar(): Promise<YazarRow[]> {
  const rows = await prisma.yazar.findMany({
    where: {
      misafir: false,
      ayrilmis: false,
    },
    orderBy: [
      { sortOrder: "asc" },
      { yazilar: { _count: "desc" } },
      { name: "asc" }
    ],
    select: {
      id: true,
      name: true,
      slug: true,
      email: true,
      photo: true,
    },
  });

  return rows;
}



// Helper to fetch featured articles
async function getFeaturedYazilar(): Promise<HaberRow[]> {
  const yazilar = await prisma.yazi.findMany({
    where: {
      publishedAt: { lte: new Date() },
      showInSlider: true,
      author: { ayrilmis: false },
    },
    orderBy: { publishedAt: "desc" },
    take: 5,
    select: {
      id: true,
      title: true,
      excerpt: true,
      featuredImage: true,
      slug: true,
      publishedAt: true,
      author: { select: { name: true } },
    },
  });

  return yazilar.map((y) => ({
    id: y.id,
    title: y.title,
    excerpt: y.excerpt,
    imageUrl: y.featuredImage,
    link: `/yazilar/${y.slug}`,
    authorName: y.author.name,
    publishedAt: y.publishedAt,
  }));
}

// ISR - 60 saniyede bir yenile
export const revalidate = 60;

export default async function HomePage() {
  const [haberler, featuredYazilar, sonYazilar, yazarlar, adSlots, categoryLinks] = await runInBatches([
    () => getHaberler(),
    () => getFeaturedYazilar(),
    () =>
      prisma.yazi.findMany({
        where: { publishedAt: { lte: new Date() }, author: { ayrilmis: false } },
        orderBy: { publishedAt: "desc" },
        take: 6,
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
    () => getYazarlar(),
    () => getAdSlots(),
    () => getHomeCategories(),
  ]);

  const allSliderItemsRaw = [...haberler, ...featuredYazilar];

  const sliderItems: SliderItem[] = allSliderItemsRaw.map((h: HaberRow) => ({
    id: h.id,
    title: h.title,
    excerpt: h.excerpt,
    imageUrl: h.imageUrl,
    link: h.link?.trim() || "#",
    authorName: h.authorName ?? "",
    publishedAt: h.publishedAt,
  }));


  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(generateWebSiteSchema()) }}
      />

      {/* Sayfanın tek h1'i. Görsel tasarımda başlığı Logo bileşeni taşıdığı için
          ekran okuyucu / arama motoru tarafında gizli bir h1 ile karşılığını veriyoruz. */}
      <h1 className="sr-only">Hayattan.Net — Hayatın Engelsiz Tarafı</h1>

      <Reveal width="100%" delay={0.15}>
        <Slider items={sliderItems} emptyMessage="Henüz haber yok. Admin panelinden haber ekleyebilirsiniz." />
      </Reveal>

      {/* Manşetin ardından gelen sakin reklam alanı */}
      <div className="container mx-auto px-4 py-5 md:py-7">
        <AdSlot slotId="top-banner" size="leaderboard" content={adSlots["top-banner"]} />
      </div>

      <SonYazilar yazilar={sonYazilar} />

      {categoryLinks.length > 0 && (
        <section className="border-b border-border/70 bg-surface py-8 md:py-10" aria-labelledby="konular-baslik">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="shrink-0">
                <p className="text-sm font-semibold text-primary">Konular</p>
                <h2 id="konular-baslik" className="mt-1 font-serif text-2xl font-bold text-foreground">
                  İlgi alanına göre keşfet
                </h2>
              </div>
              {/* Mobile: horizontal scroll chip strip */}
              <div className="flex flex-wrap gap-2">
                {categoryLinks.map((kategori) => (
                  <Link
                    key={kategori.slug}
                    href={`/kategoriler/${kategori.slug}`}
                    className="inline-flex min-h-11 shrink-0 snap-start items-center rounded-full border border-border bg-background px-4 text-sm font-semibold text-foreground/80 hover:border-primary/30 hover:bg-primary-light hover:text-primary active:scale-95"
                  >
                    {kategori.name}
                  </Link>
                ))}
                <Link
                  href="/kategoriler"
                  className="inline-flex min-h-11 shrink-0 snap-start items-center rounded-full bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover active:scale-95"
                >
                  Tüm kategoriler
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex justify-center">
          <AdSlot slotId="mid-banner" size="banner" content={adSlots["mid-banner"]} />
        </div>
      </div>

      <YazarlarBolumu yazarlar={yazarlar} />



      {/* Reklam - Sayfa altı */}
      <div className="border-t border-border bg-muted-bg/30 py-6 md:py-8">
        <div className="container mx-auto px-4">
          <AdSlot slotId="bottom-banner" size="leaderboard" content={adSlots["bottom-banner"]} />
        </div>
      </div>
    </div>
  );
}
