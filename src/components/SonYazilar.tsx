import Image from "next/image";
import Link from "next/link";
import { normalizeImageUrl } from "@/lib/image";

type SonYazilarYazi = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  publishedAt: Date | null;
  author: { name: string; slug: string };
  kategoriler: { name: string; slug: string }[];
};

type SonYazilarProps = { yazilar: SonYazilarYazi[] };

function KategoriBadge({ name, slug }: { name: string; slug: string }) {
  return (
    <Link
      href={`/kategoriler/${slug}`}
      className="inline-flex rounded-full bg-primary-light px-3 py-1 text-[13px] font-semibold text-primary hover:bg-primary hover:text-white"
    >
      {name}
    </Link>
  );
}

function YaziMeta({ author, publishedAt }: {
  author: { name: string; slug: string };
  publishedAt: Date | null;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
      <Link href={`/yazarlar/${author.slug}`} className="font-semibold text-foreground/80 hover:text-primary">
        {author.name}
      </Link>
      {publishedAt && (
        <>
          <span aria-hidden>•</span>
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

function EmptyState() {
  return (
    <section className="py-14 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="rounded-[18px] border border-dashed border-border bg-muted-bg/55 p-12 text-center">
          <h2 className="font-serif text-2xl font-bold text-foreground">Son Yazılar</h2>
          <p className="mt-3 text-base text-muted">Henüz yayımlanmış bir yazı bulunmuyor.</p>
        </div>
      </div>
    </section>
  );
}

export function SonYazilar({ yazilar }: SonYazilarProps) {
  if (yazilar.length === 0) return <EmptyState />;

  const [featured, ...rest] = yazilar;
  const supporting = rest.slice(0, 4);

  return (
    <section className="border-y border-border/70 bg-surface py-14 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-7 flex items-end justify-between gap-4 md:mb-9">
          <div>
            <p className="text-sm font-semibold text-primary">Yeni eklenenler</p>
            <h2 className="mt-1 font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Son Yazılar
            </h2>
          </div>
          <Link href="/yazilar" className="inline-flex min-h-11 items-center text-sm font-semibold text-primary hover:text-primary-hover">
            Tüm yazılar <span className="ml-2" aria-hidden>→</span>
          </Link>
        </div>

        {/* Featured article — always full width */}
        <article className="card group mb-5 sm:hidden">
          <Link href={`/yazilar/${featured.slug}`} className="image-container relative block aspect-[16/9] bg-muted-bg">
            {featured.featuredImage ? (
              <Image
                src={normalizeImageUrl(featured.featuredImage)!}
                alt={featured.title}
                fill
                priority
                className="object-cover"
                sizes="100vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary-light font-serif text-5xl text-primary/35">H</div>
            )}
          </Link>
          <div className="p-5">
            <div className="flex flex-wrap gap-2">
              {featured.kategoriler.slice(0, 2).map((kategori) => (
                <KategoriBadge key={kategori.slug} {...kategori} />
              ))}
            </div>
            <Link href={`/yazilar/${featured.slug}`}>
              <h3 className="mt-4 font-serif text-2xl font-bold leading-tight tracking-tight text-foreground group-hover:text-primary">
                {featured.title}
              </h3>
            </Link>
            {featured.excerpt && (
              <p className="mt-4 line-clamp-3 text-base leading-relaxed text-muted">
                {featured.excerpt}
              </p>
            )}
            <div className="mt-6 border-t border-border/70 pt-5">
              <YaziMeta author={featured.author} publishedAt={featured.publishedAt} />
            </div>
          </div>
        </article>

        {/* Mobile: horizontal scroll strip for supporting articles */}
        <div className="sm:hidden">
          <div
            className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4"
            role="list"
            aria-label="Son yazılar"
          >
            {supporting.map((yazi) => (
              <article
                key={yazi.id}
                role="listitem"
                className="card group w-[72vw] min-w-[72vw] flex-shrink-0 snap-start"
              >
                <Link href={`/yazilar/${yazi.slug}`} className="image-container relative block aspect-[4/3] bg-muted-bg">
                  {yazi.featuredImage ? (
                    <Image
                      src={normalizeImageUrl(yazi.featuredImage)!}
                      alt={yazi.title}
                      fill
                      className="object-cover"
                      sizes="72vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary-light font-serif text-3xl text-primary/35">H</div>
                  )}
                </Link>
                <div className="flex flex-1 flex-col p-4">
                  {yazi.kategoriler[0] && <KategoriBadge {...yazi.kategoriler[0]} />}
                  <Link href={`/yazilar/${yazi.slug}`}>
                    <h3 className="mt-3 line-clamp-3 font-serif text-lg font-bold leading-snug text-foreground group-hover:text-primary">
                      {yazi.title}
                    </h3>
                  </Link>
                  <div className="mt-auto pt-4">
                    <YaziMeta author={yazi.author} publishedAt={yazi.publishedAt} />
                  </div>
                </div>
              </article>
            ))}
          </div>
          {/* Scroll hint fade */}
          <p className="mt-1 text-center text-xs text-muted">← kaydır →</p>
        </div>

        {/* Tablet + Desktop: original grid layout */}
        <div className="hidden grid-cols-2 gap-5 sm:grid lg:grid-cols-4">
          <article className="card group sm:col-span-2 lg:row-span-2">
            <Link href={`/yazilar/${featured.slug}`} className="image-container relative block aspect-[16/9] bg-muted-bg">
              {featured.featuredImage ? (
                <Image
                  src={normalizeImageUrl(featured.featuredImage)!}
                  alt={featured.title}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary-light font-serif text-5xl text-primary/35">H</div>
              )}
            </Link>
            <div className="p-5 md:p-7 lg:p-8">
              <div className="flex flex-wrap gap-2">
                {featured.kategoriler.slice(0, 2).map((kategori) => (
                  <KategoriBadge key={kategori.slug} {...kategori} />
                ))}
              </div>
              <Link href={`/yazilar/${featured.slug}`}>
                <h3 className="mt-4 font-serif text-2xl font-bold leading-tight tracking-tight text-foreground group-hover:text-primary md:text-3xl">
                  {featured.title}
                </h3>
              </Link>
              {featured.excerpt && (
                <p className="mt-4 line-clamp-3 text-base leading-relaxed text-muted">
                  {featured.excerpt}
                </p>
              )}
              <div className="mt-6 border-t border-border/70 pt-5">
                <YaziMeta author={featured.author} publishedAt={featured.publishedAt} />
              </div>
            </div>
          </article>

          {supporting.map((yazi) => (
            <article key={yazi.id} className="card group flex min-h-full flex-col">
              <Link href={`/yazilar/${yazi.slug}`} className="image-container relative block aspect-[16/10] bg-muted-bg">
                {yazi.featuredImage ? (
                  <Image
                    src={normalizeImageUrl(yazi.featuredImage)!}
                    alt={yazi.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary-light font-serif text-3xl text-primary/35">H</div>
                )}
              </Link>
              <div className="flex flex-1 flex-col p-4 md:p-5">
                {yazi.kategoriler[0] && <KategoriBadge {...yazi.kategoriler[0]} />}
                <Link href={`/yazilar/${yazi.slug}`}>
                  <h3 className="mt-3 line-clamp-3 font-serif text-lg font-bold leading-snug text-foreground group-hover:text-primary md:text-xl">
                    {yazi.title}
                  </h3>
                </Link>
                <div className="mt-auto pt-5">
                  <YaziMeta author={yazi.author} publishedAt={yazi.publishedAt} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
