import { Reveal } from "@/components/Animations/Reveal";
import { prisma } from "@/lib/db";
import { getAdSlots } from "@/app/admin/actions";
import { AdSlot } from "@/components/AdSlot";
import { Logo } from "@/components/Logo";
import { Slider, type SliderItem } from "@/components/Slider";
import { SonYazilar } from "@/components/SonYazilar";
import { YazarlarBolumu } from "@/components/YazarlarBolumu";
import Image from "next/image";

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
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      email: true,
      photo: true,
    },
  });

  // Ömer Faruk Kotay'ı en başa taşı
  return rows.sort((a, b) => {
    if (a.name === "Ömer Faruk Kotay") return -1;
    if (b.name === "Ömer Faruk Kotay") return 1;
    return a.name.localeCompare(b.name, "tr");
  });
}



// Helper to fetch featured articles
async function getFeaturedYazilar(): Promise<HaberRow[]> {
  const yazilar = await prisma.yazi.findMany({
    where: {
      publishedAt: { lte: new Date() },
      showInSlider: true,
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
  const [haberler, featuredYazilar, sonYazilar, yazarlar, adSlots] = await Promise.all([
    getHaberler(),
    getFeaturedYazilar(),
    prisma.yazi.findMany({
      where: { publishedAt: { lte: new Date() } },
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
    getYazarlar(),

    getAdSlots(),
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




      <section className="py-12 md:py-16">
        <Reveal width="100%" direction="up" delay={0.2}>
          <div className="container mx-auto flex justify-center px-4">
            <Logo size="lg" showTagline={true} centered={true} />
          </div>
        </Reveal>
      </section>

      {/* Reklam - Logo altı */}
      <div className="container mx-auto px-4 py-2">
        <AdSlot slotId="top-banner" size="leaderboard" content={adSlots["top-banner"]} />
      </div>

      <Reveal width="100%" delay={0.3}>
        <Slider items={sliderItems} emptyMessage="Henüz haber yok. Admin panelinden haber ekleyebilirsiniz." />
      </Reveal>

      {/* Reklam - Slider altı */}
      <div className="container mx-auto px-4 py-4">
        <AdSlot slotId="mid-banner" size="banner" content={adSlots["mid-banner"]} />
      </div>

      <SonYazilar yazilar={sonYazilar} />

      {/* Reklam - Son Yazılar altı */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center">
          <AdSlot slotId="rectangle-ad" size="rectangle" content={adSlots["rectangle-ad"]} />
        </div>
      </div>

      <YazarlarBolumu yazarlar={yazarlar} />



      {/* Reklam - Sayfa altı */}
      <div className="border-t border-border bg-muted-bg/30 py-6">
        <div className="container mx-auto px-4">
          <AdSlot slotId="bottom-banner" size="leaderboard" content={adSlots["bottom-banner"]} />
        </div>
      </div>
    </div>
  );
}
