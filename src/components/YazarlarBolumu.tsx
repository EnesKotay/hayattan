import Image from "next/image";
import Link from "next/link";
import { isValidImageSrc, normalizeImageUrl } from "@/lib/image";

type Yazar = {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  photo: string | null;
};

type YazarlarBolumuProps = {
  yazarlar: Yazar[];
  title?: string;
  allLinkLabel?: string;
  allLinkHref?: string;
};

export function YazarlarBolumu({
  yazarlar,
  title = "Köşe Yazarlarımız",
  allLinkLabel = "Tüm yazarları gör",
  allLinkHref = "/yazarlar",
}: YazarlarBolumuProps) {
  if (!yazarlar?.length) return null;

  return (
    <section className="py-14 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-7 flex items-end justify-between gap-4 md:mb-9">
          <div>
            <p className="text-sm font-semibold text-primary">Farklı sesler, ortak hayat</p>
            <h2 className="mt-1 font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {title}
            </h2>
          </div>
          <Link href={allLinkHref} className="inline-flex min-h-11 items-center text-sm font-semibold text-primary hover:text-primary-hover">
            {allLinkLabel} <span className="ml-2" aria-hidden>→</span>
          </Link>
        </div>

        <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4 xl:grid-cols-5">
          {yazarlar.slice(0, 5).map((yazar) => (
            <Link
              key={yazar.id}
              href={`/yazarlar/${yazar.slug}`}
              className="card group flex w-[220px] shrink-0 snap-start flex-col items-center p-5 text-center sm:w-auto md:p-6"
            >
              <div className="image-container relative h-24 w-24 overflow-hidden rounded-full border-2 border-background bg-primary-light shadow-sm md:h-28 md:w-28">
                {yazar.photo && isValidImageSrc(yazar.photo) ? (
                  <Image
                    src={normalizeImageUrl(yazar.photo)!}
                    alt={yazar.name}
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-serif text-3xl font-bold text-primary">
                    {yazar.name.charAt(0)}
                  </div>
                )}
              </div>
              <h3 className="mt-5 font-serif text-xl font-bold leading-snug text-foreground group-hover:text-primary">
                {yazar.name}
              </h3>
              <span className="mt-2 text-sm text-muted">Hayattan.Net yazarı</span>
              <span className="mt-5 inline-flex items-center text-sm font-semibold text-primary">
                Yazılarını oku <span className="ml-1.5" aria-hidden>→</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
