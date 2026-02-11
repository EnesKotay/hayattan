import { isExternalImageUrl, isValidImageSrc } from "@/lib/image";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export const revalidate = 60;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ misafir?: string }>;
}) {
  const { misafir } = await searchParams;
  if (misafir === "1") {
    return { title: "Misafir Yazıları | Hayattan.Net", description: "Misafir yazarların yazıları." };
  }
  return {
    title: "Yazarlar | Hayattan.Net",
    description: "Hayattan.Net - Yazarlarımız",
  };
}

export default async function YazarlarPage({
  searchParams,
}: {
  searchParams: Promise<{ misafir?: string }>;
}) {
  const { misafir } = await searchParams;
  if (misafir === "1") {
    redirect("/misafir-yazarlar");
  }

  const [yazarlar, misafirYazarlar] = await Promise.all([
    prisma.yazar.findMany({
      where: { misafir: false },
      orderBy: [
        { sortOrder: "asc" },
        { yazilar: { _count: "desc" } },
        { name: "asc" }
      ] as any,
      select: {
        id: true,
        name: true,
        slug: true,
        email: true,
        photo: true,
        biyografi: true,
        ayrilmis: true,
        _count: { select: { yazilar: true } },
      },
    }),
    prisma.yazar.findMany({
      where: { misafir: true },
      orderBy: [
        { sortOrder: "asc" },
        { yazilar: { _count: "desc" } },
        { name: "asc" }
      ] as any,
      select: {
        id: true,
        name: true,
        slug: true,
        photo: true,
        _count: { select: { yazilar: true } },
      },
    }),
  ]);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-serif text-3xl font-bold text-foreground">
        Yazarlarımız
      </h1>
      <p className="mt-2 text-muted">
        Hayattan.Net ailesinin yazarları
      </p>

      {yazarlar.length === 0 ? (
        <div className="mt-12 rounded-lg border border-border bg-muted-bg/30 p-12 text-center">
          <p className="text-muted">Henüz yazar bulunmuyor.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {yazarlar.map((yazar) => (
            <Link
              key={yazar.id}
              href={`/yazarlar/${yazar.slug}`}
              className="group flex flex-col items-center rounded-lg border border-border bg-background p-6 text-center transition-shadow hover:shadow-md"
            >
              <div className="relative h-32 w-32 overflow-hidden rounded-full border-2 border-primary-light">
                {yazar.photo && isValidImageSrc(yazar.photo) ? (
                  <Image
                    src={yazar.photo}
                    alt={yazar.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="128px"
                    unoptimized={isExternalImageUrl(yazar.photo)}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary-light text-primary">
                    <span className="text-4xl font-bold">
                      {yazar.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <h2 className="mt-4 font-serif text-xl font-bold text-foreground group-hover:text-primary">
                {yazar.name}
              </h2>
              {yazar.email && (
                <p className="mt-1 truncate text-sm text-muted">
                  {yazar.email}
                </p>
              )}
              {yazar.biyografi && (
                <p className="mt-2 line-clamp-3 text-sm text-muted">
                  {yazar.biyografi}
                </p>
              )}
              <p className="mt-3 text-sm font-medium text-primary">
                {yazar._count.yazilar} yazı
              </p>
            </Link>
          ))}
        </div>
      )}

      {/* Misafir Yazarlarımız: yazarlarımızdaki gibi kartlarla */}
      <section className="mt-20 overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-muted-bg/60 to-muted-bg/30 px-6 py-10 shadow-sm sm:px-8 sm:py-12">
        <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left">
          <div className="mb-6 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-2xl text-primary sm:mb-0 sm:mr-6" aria-hidden>
            ✍️
          </div>
          <div className="flex-1">
            <h2 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">
              Misafir Yazarlarımız
            </h2>
            <p className="mt-2 max-w-xl text-muted leading-relaxed">
              Misafir yazarlarımızın katkıda bulunduğu yazılar ayrı bir sayfada listelenir.
            </p>
          </div>
        </div>
        {misafirYazarlar.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {misafirYazarlar.map((yazar) => (
              <Link
                key={yazar.id}
                href={`/yazarlar/${yazar.slug}`}
                className="group flex flex-col items-center rounded-lg border border-border bg-background p-6 text-center transition-shadow hover:shadow-md"
              >
                <div className="relative h-32 w-32 overflow-hidden rounded-full border-2 border-primary-light">
                  {yazar.photo && isValidImageSrc(yazar.photo) ? (
                    <Image
                      src={yazar.photo}
                      alt={yazar.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="128px"
                      unoptimized={isExternalImageUrl(yazar.photo)}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary-light text-primary">
                      <span className="text-4xl font-bold">
                        {yazar.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <h3 className="mt-4 font-serif text-xl font-bold text-foreground group-hover:text-primary">
                  {yazar.name}
                </h3>
                <p className="mt-3 text-sm font-medium text-primary">
                  {yazar._count.yazilar} yazı
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-6 text-center text-sm text-muted">Henüz misafir yazar bulunmuyor.</p>
        )}
        <div className="mt-8 flex justify-center">
          <Link
            href="/misafir-yazarlar"
            className="group inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 font-semibold text-white shadow-md transition-all hover:bg-primary-hover hover:shadow-lg"
          >
            Misafir yazarlar sayfasına git
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
