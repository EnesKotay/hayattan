import Link from "next/link";
import { prisma } from "@/lib/db";

export const metadata = {
  title: "Arşiv | Hayattan.Net",
  description: "Hayattan.Net - Yazı arşivi",
};

export default async function ArsivPage() {
  const yazilar = await prisma.yazi.findMany({
    where: { publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      publishedAt: true,
    },
  });

  // Tarihe göre grupla (yıl-ay)
  const gruplar = yazilar.reduce<
    Record<string, { title: string; slug: string; publishedAt: Date }[]>
  >((acc, yazi) => {
    if (!yazi.publishedAt) return acc;
    const key = new Date(yazi.publishedAt).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
    });
    if (!acc[key]) acc[key] = [];
    acc[key].push({
      title: yazi.title,
      slug: yazi.slug,
      publishedAt: yazi.publishedAt,
    });
    return acc;
  }, {});

  const sortedKeys = Object.keys(gruplar).sort((a, b) => {
    const dateA = new Date(
      gruplar[a][0].publishedAt.toISOString().slice(0, 7)
    ).getTime();
    const dateB = new Date(
      gruplar[b][0].publishedAt.toISOString().slice(0, 7)
    ).getTime();
    return dateB - dateA;
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-serif text-3xl font-bold text-foreground">
        Arşiv
      </h1>
      <p className="mt-2 text-muted">
        Yazılar tarih sırasına göre listelenmiştir.
      </p>

      {yazilar.length === 0 ? (
        <div className="mt-12 rounded-lg border border-border bg-muted-bg/30 p-12 text-center">
          <p className="text-muted">Henüz arşivde yazı bulunmuyor.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {sortedKeys.map((ay) => (
            <section key={ay}>
              <h2 className="font-serif text-xl font-bold text-foreground">
                {ay}
              </h2>
              <ul className="mt-4 space-y-2 border-l-2 border-primary-light pl-4">
                {gruplar[ay].map((yazi) => (
                  <li key={yazi.slug}>
                    <Link
                      href={`/yazilar/${yazi.slug}`}
                      className="text-foreground hover:text-primary hover:underline"
                    >
                      {yazi.title}
                    </Link>
                    <span className="ml-2 text-sm text-muted">
                      {new Date(yazi.publishedAt).toLocaleDateString("tr-TR")}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
