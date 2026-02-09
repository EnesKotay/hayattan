import { isExternalImageUrl } from "@/lib/image";
import Image from "next/image";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getAdSlots } from "@/app/admin/actions";
import { AdSlot } from "@/components/AdSlot";

const YAZILAR_PER_PAGE = 12;

export const dynamic = 'force-dynamic';

export const metadata = {
    title: "Fotoğrafhane | Hayattan.Net",
    description: "Hayattan kareler, görsel hikayeler ve fotoğraf galerisi.",
};

export default async function FotografhanePage({
    searchParams,
}: {
    searchParams: Promise<{ sayfa?: string }>;
}) {
    const { sayfa = "1" } = await searchParams;
    const page = Math.max(1, parseInt(sayfa, 10) || 1);
    const skip = (page - 1) * YAZILAR_PER_PAGE;

    // Sadece 'fotografhane' kategorisindeki yazıları filtrele

    const whereConditions: Prisma.YaziWhereInput = {
        publishedAt: { lte: new Date() },
        kategoriler: {
            some: {
                slug: "fotografhane"
            }
        }
    };

    const [yazilar, totalCount, adSlots] = await Promise.all([
        prisma.yazi.findMany({
            where: whereConditions,
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
                author: { select: { name: true, slug: true } },
                kategoriler: { select: { name: true, slug: true } },
            },
        }),
        prisma.yazi.count({ where: whereConditions }),
        getAdSlots(),
    ]);

    const totalPages = Math.ceil(totalCount / YAZILAR_PER_PAGE);

    function paginationUrl(p: number) {
        return p > 1 ? `/fotografhane?sayfa=${p}` : "/fotografhane";
    }

    return (
        <div className="min-h-screen bg-muted-bg/30 pb-20 pt-10">
            <div className="container mx-auto px-4">
                {/* Header Section */}
                <div className="mb-10 text-center">
                    <h1 className="mb-4 font-serif text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                        Fotoğrafhane
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg text-muted">
                        Hayata dair görsel notlar, anlar ve hikayeler.
                        {totalCount > 0 && (
                            <span className="ml-1 inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                                {totalCount} Yazı
                            </span>
                        )}
                    </p>
                </div>

                {/* Reklam - Sayfa üstü */}
                <div className="my-8 flex justify-center">
                    <AdSlot slotId="fotografhane-top" size="leaderboard" content={adSlots["yazilar-top"]} />
                </div>

                {yazilar.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-background p-16 text-center shadow-sm">
                        <div className="mb-4 rounded-full bg-muted-bg p-4">
                            <svg className="h-8 w-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-foreground">Henüz İçerik Yok</h3>
                        <p className="mt-2 text-muted">Bu kategoride henüz yayınlanmış bir yazı bulunmuyor.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {yazilar.map((yazi) => (
                                <article
                                    key={yazi.id}
                                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-background shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                                >
                                    <Link href={`/yazilar/${yazi.slug}`} className="relative block aspect-[16/10] overflow-hidden">
                                        {yazi.featuredImage ? (
                                            <Image
                                                src={yazi.featuredImage}
                                                alt={yazi.title}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                unoptimized={isExternalImageUrl(yazi.featuredImage)}
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 text-indigo-200">
                                                <svg className="h-16 w-16" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
                                                    <path d="M14 17H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                                                </svg>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                                        {/* Kategori Badge - Fotoğrafhane için özel renk olabilir ama şimdilik standart */}
                                        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                                            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-gray-900 shadow-sm backdrop-blur-md">
                                                Fotoğrafhane
                                            </span>
                                        </div>
                                    </Link>

                                    <div className="flex flex-1 flex-col p-6">
                                        <Link href={`/yazilar/${yazi.slug}`} className="group-hover:text-primary">
                                            <h2 className="mb-3 font-serif text-xl font-bold leading-tight text-foreground transition-colors line-clamp-2">
                                                {yazi.title}
                                            </h2>
                                        </Link>

                                        {yazi.excerpt && (
                                            <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-muted">
                                                {yazi.excerpt}
                                            </p>
                                        )}

                                        <div className="mt-auto flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                                            <Link
                                                href={`/yazarlar/${yazi.author.slug}`}
                                                className="flex items-center gap-2 transition-colors hover:text-primary"
                                            >
                                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                                                    {yazi.author.name.charAt(0)}
                                                </div>
                                                <span className="font-medium">{yazi.author.name}</span>
                                            </Link>

                                            {yazi.publishedAt && (
                                                <div className="flex items-center gap-1.5" title={new Date(yazi.publishedAt).toLocaleDateString("tr-TR")}>
                                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <span>{new Date(yazi.publishedAt).toLocaleDateString("tr-TR", { day: 'numeric', month: 'long' })}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {/* Reklam - Yazılar arası */}
                        <div className="my-12 flex justify-center">
                            <AdSlot slotId="fotografhane-mid" size="rectangle" content={adSlots["yazilar-mid"]} />
                        </div>

                        {totalPages > 1 && (
                            <div className="mt-12 flex justify-center">
                                <nav className="flex items-center gap-2 rounded-full border border-border bg-white p-2 shadow-sm" aria-label="Pagination">
                                    {page > 1 ? (
                                        <Link
                                            href={paginationUrl(page - 1)}
                                            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-primary hover:text-white"
                                            aria-label="Önceki Sayfa"
                                        >
                                            ←
                                        </Link>
                                    ) : (
                                        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed">
                                            ←
                                        </span>
                                    )}

                                    <div className="hidden px-4 text-sm font-medium text-muted md:block">
                                        Sayfa <span className="text-foreground">{page}</span> / {totalPages}
                                    </div>

                                    {page < totalPages ? (
                                        <Link
                                            href={paginationUrl(page + 1)}
                                            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-primary hover:text-white"
                                            aria-label="Sonraki Sayfa"
                                        >
                                            →
                                        </Link>
                                    ) : (
                                        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed">
                                            →
                                        </span>
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
