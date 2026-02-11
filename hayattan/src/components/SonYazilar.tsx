import { isExternalImageUrl, normalizeImageUrl } from "@/lib/image";
import Image from "next/image";
import Link from "next/link";
import { StaggerContainer, StaggerItem } from "@/components/Animations/Reveal";

type SonYazilarYazi = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  publishedAt: Date | null;
  author: {
    name: string;
    slug: string;
  };
  kategoriler: {
    name: string;
    slug: string;
  }[];
};

type SonYazilarProps = {
  yazilar: SonYazilarYazi[];
};

function KategoriBadge({ name, slug }: { name: string; slug: string }) {
  return (
    <Link
      href={`/kategoriler/${slug}`}
      className="inline-block rounded bg-primary/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-primary transition-colors hover:bg-primary hover:text-white"
    >
      {name}
    </Link>
  );
}

function YaziMeta({ author, publishedAt }: { author: { name: string; slug: string }; publishedAt: Date | null }) {
  return (
    <div className="mt-2 flex items-center gap-2 text-xs text-muted">
      <Link href={`/yazarlar/${author.slug}`} className="font-medium hover:text-primary">
        {author.name}
      </Link>
      {publishedAt && (
        <>
          <span className="text-border">•</span>
          <time dateTime={publishedAt.toISOString()}>
            {new Date(publishedAt).toLocaleDateString("tr-TR", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </time>
        </>
      )}
    </div>
  );
}

export function SonYazilar({ yazilar }: SonYazilarProps) {
  if (yazilar.length === 0) {
    return (
      <section className="border-t border-border bg-muted-bg/30 py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-primary" />
            <h2 className="font-serif text-2xl font-bold text-foreground">Son Yazılar</h2>
          </div>
          <div className="mt-8 rounded-lg border border-border bg-background p-16 text-center">
            <p className="text-muted">Henüz yazı bulunmuyor.</p>
          </div>
        </div>
      </section>
    );
  }

  const [featured, ...rest] = yazilar;
  const sideYazilar = rest.slice(0, 5);
  const hasSidebar = sideYazilar.length > 0;

  return (
    <section className="border-t border-border bg-muted-bg/30 py-12 md:py-16">
      <div className="container mx-auto px-4">
        {/* Bölüm başlığı - haber sitesi tarzı */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-1 shrink-0 bg-primary" aria-hidden />
            <h2 className="font-serif text-2xl font-bold text-foreground md:text-3xl">Son Yazılar</h2>
          </div>
          <Link
            href="/yazilar"
            className="hidden text-sm font-semibold text-primary transition-colors hover:text-primary-hover md:inline-flex"
          >
            Tümünü Gör →
          </Link>
        </div>

        {/* Öne çıkan + yan sütun layout */}
        <div className={`grid gap-6 ${hasSidebar ? "lg:grid-cols-3" : ""}`}>
          {/* Öne çıkan yazı - büyük kart (rozetler link dışında, iç içe <a> önlenir) */}
          <article className={`group relative ${hasSidebar ? "lg:col-span-2" : ""}`}>
            <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
              {featured.kategoriler.slice(0, 2).map((k) => (
                <KategoriBadge key={k.slug} name={k.name} slug={k.slug} />
              ))}
            </div>
            <Link href={`/yazilar/${featured.slug}`} className="block overflow-hidden rounded-lg border border-border bg-background shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary/30">
              <div className="relative aspect-[16/9] overflow-hidden bg-muted-bg">
                {featured.featuredImage ? (
                  <Image
                    src={normalizeImageUrl(featured.featuredImage)!}
                    alt={featured.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary-light text-primary/40">
                    <span className="font-serif text-6xl">Y</span>
                  </div>
                )}
              </div>
              <div className="p-5 md:p-6">
                <h3 className="font-serif text-xl font-bold leading-tight text-foreground transition-colors group-hover:text-primary md:text-2xl lg:text-3xl">
                  {featured.title}
                </h3>
                {featured.excerpt && (
                  <p className="mt-3 line-clamp-2 text-muted">{featured.excerpt}</p>
                )}
              </div>
            </Link>
            <div className="px-5 pb-5 md:px-6 md:pb-6 pt-0 -mt-2">
              <YaziMeta author={featured.author} publishedAt={featured.publishedAt} />
            </div>
          </article>

          {/* Yan sütun - küçük kartlar */}
          {hasSidebar && (
            <StaggerContainer className="flex flex-col gap-4 lg:gap-6">
              {sideYazilar.map((yazi) => (
                <StaggerItem key={yazi.id}>
                  <article className="group flex gap-4 overflow-hidden rounded-lg border border-border bg-background transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/20">
                    <Link href={`/yazilar/${yazi.slug}`} className="relative h-24 w-28 shrink-0 overflow-hidden bg-muted-bg md:h-28 md:w-36">
                      {yazi.featuredImage ? (
                        <Image
                          src={normalizeImageUrl(yazi.featuredImage)!}
                          alt={yazi.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="150px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-primary-light text-primary/40">
                          <span className="font-serif text-2xl">Y</span>
                        </div>
                      )}
                    </Link>
                    <div className="min-w-0 flex-1 py-3 pr-4">
                      <div className="mb-1 flex flex-wrap gap-1">
                        {yazi.kategoriler.slice(0, 1).map((k) => (
                          <KategoriBadge key={k.slug} name={k.name} slug={k.slug} />
                        ))}
                      </div>
                      <Link href={`/yazilar/${yazi.slug}`}>
                        <h4 className="font-serif line-clamp-2 text-sm font-bold text-foreground transition-colors group-hover:text-primary md:text-base">
                          {yazi.title}
                        </h4>
                      </Link>
                      <YaziMeta author={yazi.author} publishedAt={yazi.publishedAt} />
                    </div>
                  </article>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </div>

        {/* Mobil Tüm Yazılar butonu */}
        <div className="mt-8 flex justify-center md:hidden">
          <Link
            href="/yazilar"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover"
          >
            Tüm Yazıları Gör
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
