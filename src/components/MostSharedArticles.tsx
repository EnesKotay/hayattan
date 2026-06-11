import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import {
  extractIdFromCounterKey,
  parseCounter,
  SHARE_COUNT_PREFIX,
} from "@/lib/engagement";
import { normalizeImageUrl } from "@/lib/image";

type MostSharedArticlesProps = {
  excludeId?: string;
  limit?: number;
};

export async function MostSharedArticles({
  excludeId,
  limit = 4,
}: MostSharedArticlesProps) {
  const shareRows = await prisma.siteSetting.findMany({
    where: { key: { startsWith: SHARE_COUNT_PREFIX } },
    select: { key: true, value: true },
  });

  const rankedByShares = shareRows
    .map((row) => ({
      id: extractIdFromCounterKey(row.key, SHARE_COUNT_PREFIX),
      count: parseCounter(row.value),
    }))
    .filter((row): row is { id: string; count: number } => Boolean(row.id) && row.count > 0)
    .filter((row) => row.id !== excludeId)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  const hasShareData = rankedByShares.length > 0;
  const articleIds = rankedByShares.map((row) => row.id);

  const articles = hasShareData
    ? await prisma.yazi.findMany({
        where: {
          id: { in: articleIds },
          publishedAt: { lte: new Date() },
        },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          featuredImage: true,
          author: { select: { name: true } },
        },
      })
    : await prisma.yazi.findMany({
        where: {
          publishedAt: { lte: new Date() },
          ...(excludeId ? { id: { not: excludeId } } : {}),
        },
        orderBy: [{ viewCount: "desc" }, { publishedAt: "desc" }],
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          featuredImage: true,
          author: { select: { name: true } },
        },
      });

  if (articles.length === 0) return null;

  const articlesById = new Map(articles.map((article) => [article.id, article]));
  const orderedArticles = hasShareData
    ? articleIds
        .map((id) => articlesById.get(id))
        .filter((article): article is NonNullable<typeof article> => Boolean(article))
    : articles;

  return (
    <section className="rounded-[28px] border border-border bg-background p-6 shadow-sm sm:p-8" aria-label="En çok paylaşılan yazılar">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Okur Hareketi</p>
          <h2 className="mt-2 font-serif text-2xl font-bold text-foreground">En Çok Paylaşılanlar</h2>
          <p className="mt-2 text-sm text-muted">
            {hasShareData
              ? "Okurların en çok dağıttığı yazılar."
              : "Paylaşım verileri toplanırken öne çıkan yazılar gösteriliyor."}
          </p>
        </div>
        <Link href="/yazilar" className="text-sm font-semibold text-primary hover:underline">
          Tüm yazılar
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {orderedArticles.map((article) => (
          <Link
            key={article.id}
            href={`/yazilar/${article.slug}`}
            className="group flex gap-4 rounded-2xl border border-border bg-muted-bg/30 p-4 transition-shadow hover:shadow-md"
          >
            <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-muted-bg">
              {article.featuredImage ? (
                <Image
                  src={normalizeImageUrl(article.featuredImage)!}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="96px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-serif text-2xl text-primary/40">
                  Y
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-serif text-lg font-bold leading-tight text-foreground group-hover:text-primary">
                {article.title}
              </h3>
              {article.excerpt && (
                <p className="mt-1 line-clamp-2 text-sm text-muted">{article.excerpt}</p>
              )}
              <p className="mt-2 text-xs font-medium text-muted">{article.author.name}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
