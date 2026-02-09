import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";
import { isExternalImageUrl, isValidImageSrc } from "@/lib/image";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const yazi = await prisma.yazi.findUnique({
    where: { id },
    select: { title: true },
  });
  return {
    title: yazi ? `Önizleme: ${yazi.title} | Hayattan.Net` : "Önizleme | Hayattan.Net",
  };
}

export default async function YazıOnizlemePage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.role || !["ADMIN", "AUTHOR"].includes(session.user.role)) {
    redirect("/admin/giris");
  }

  const { id } = await params;
  if (!id) notFound();

  const yazi = await prisma.yazi.findUnique({
    where: { id },
    include: {
      author: { select: { name: true, slug: true, photo: true } },
      kategoriler: { select: { name: true, slug: true } },
    },
  });

  if (!yazi) notFound();

  const duzenleUrl = `/admin/yazilar/${id}`;
  const yayindaMi = !!yazi.publishedAt;

  return (
    <div className="min-h-screen bg-background">
      {/* Önizleme bandı - her zaman görünür */}
      <div className="sticky top-0 z-50 border-b-2 border-amber-400 bg-amber-50 px-4 py-3 shadow-sm">
        <div className="container mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-amber-900">
            <span className="text-lg" aria-hidden>👁️</span>
            <span className="text-sm font-semibold">ÖNİZLEME</span>
            <span className="text-sm text-amber-800">
              — Veritabanındaki son kayıt. Kaydedilmemiş değişiklikler görünmez.
            </span>
          </div>
          <Link
            href={duzenleUrl}
            className="shrink-0 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
          >
            ← Düzenlemeye dön
          </Link>
        </div>
      </div>

      {/* Yazı içeriği - sitedeki görünüme yakın */}
      <article className="container mx-auto max-w-3xl px-4 py-10">
        <header className="mb-8">
          <div className="mb-4 flex flex-wrap gap-2">
            {yazi.kategoriler.map((k) => (
              <span key={k.slug} className="text-sm font-medium text-primary">
                {k.name}
              </span>
            ))}
          </div>
          <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
            {yazi.title}
          </h1>
          {yazi.excerpt && (
            <p className="mt-4 text-lg text-muted">{yazi.excerpt}</p>
          )}
          <div className="mt-4 flex items-center gap-4 text-sm text-muted">
            <div className="flex items-center gap-2">
              {yazi.author.photo && isValidImageSrc(yazi.author.photo) ? (
                <Image
                  src={yazi.author.photo}
                  alt={yazi.author.name}
                  width={32}
                  height={32}
                  className="rounded-full object-cover"
                  unoptimized={isExternalImageUrl(yazi.author.photo)}
                />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {yazi.author.name.charAt(0)}
                </span>
              )}
              <span>{yazi.author.name}</span>
            </div>
            <time dateTime={yazi.createdAt.toISOString()}>
              {new Date(yazi.createdAt).toLocaleDateString("tr-TR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </time>
            {!yayindaMi && (
              <span className="rounded bg-amber-200 px-2 py-0.5 text-xs font-medium text-amber-900">
                Taslak
              </span>
            )}
          </div>
        </header>

        {yazi.featuredImage && (
          <div className="relative mb-8 aspect-video overflow-hidden rounded-lg bg-muted-bg">
            <Image
              src={yazi.featuredImage}
              alt={yazi.imageAlt || yazi.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 672px"
              priority
              unoptimized={isExternalImageUrl(yazi.featuredImage)}
            />
          </div>
        )}

        <div
          className="yazi-icerik prose prose-neutral max-w-none space-y-4 text-foreground [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:font-serif [&_h3]:text-xl [&_h3]:font-bold [&_p]:leading-relaxed [&_a]:text-primary [&_a]:underline [&_ul]:list-inside [&_ul]:list-disc [&_ol]:list-inside [&_ol]:list-decimal [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted"
          dangerouslySetInnerHTML={{ __html: yazi.content }}
        />

        <footer className="mt-12 border-t border-border pt-6">
          <Link
            href={duzenleUrl}
            className="text-primary hover:underline"
          >
            ← Düzenlemeye dön
          </Link>
        </footer>
      </article>
    </div>
  );
}
