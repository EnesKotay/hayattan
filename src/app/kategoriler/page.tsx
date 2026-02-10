import Link from "next/link";
import { prisma } from "@/lib/db";
import { isFotoğrafhanePageSlug, isBakisCategorySlug } from "@/lib/site-categories";

export const revalidate = 60;

export const metadata = {
  title: "Kategoriler | Hayattan.Net",
  description: "Hayattan.Net - Tüm kategoriler. Yazıları konuya göre keşfedin.",
};

function getCategoryHref(slug: string): string {
  if (isFotoğrafhanePageSlug(slug)) return "/sayfa/fotografhane";
  if (isBakisCategorySlug(slug)) return "/bakis-dergisi";
  return `/kategoriler/${slug}`;
}

export default async function KategorilerPage() {
  const kategoriler = await prisma.kategori.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      _count: { select: { yazilar: true } },
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted-bg/50 to-background pb-16 pt-10">
      <div className="container mx-auto px-4">
        {/* Başlık alanı */}
        <header className="mb-12 text-center">
          <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Kategoriler
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-lg text-muted">
            Yazıları konuya göre keşfedin. İlgilendiğiniz kategorinin üzerine tıklayın.
          </p>
        </header>

        {kategoriler.length === 0 ? (
          <div className="mx-auto max-w-md rounded-2xl border border-border bg-background p-12 text-center shadow-sm">
            <p className="text-muted">Henüz kategori bulunmuyor.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* İçerik olan kategoriler */}
            <section>
              <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-muted">
                Tüm kategoriler
              </h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {kategoriler.map((kategori) => {
                  const href = getCategoryHref(kategori.slug);
                  const isEmpty = kategori._count.yazilar === 0;
                  return (
                    <Link
                      key={kategori.id}
                      href={href}
                      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-background transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                        isEmpty
                          ? "border-dashed border-border/80 opacity-75 hover:opacity-90"
                          : "border-border shadow-sm"
                      }`}
                    >
                      <div className="flex flex-1 flex-col p-6">
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <h2 className="font-serif text-xl font-bold text-foreground group-hover:text-primary md:text-2xl">
                            {kategori.name}
                          </h2>
                          <span
                            className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${
                              isEmpty
                                ? "bg-muted-bg text-muted"
                                : "bg-primary/10 text-primary"
                            }`}
                          >
                            {kategori._count.yazilar} yazı
                          </span>
                        </div>
                        {kategori.description ? (
                          <p className="line-clamp-2 text-sm leading-relaxed text-muted">
                            {kategori.description}
                          </p>
                        ) : (
                          <p className="text-sm text-muted">
                            {isEmpty
                              ? "Yakında burada içerik olacak."
                              : "Bu kategorideki yazıları keşfedin."}
                          </p>
                        )}
                        <span
                          className={`mt-4 inline-flex items-center gap-1.5 text-sm font-medium ${
                            isEmpty ? "text-muted" : "text-primary group-hover:underline"
                          }`}
                        >
                          {isEmpty ? "Yakında" : "Kategoriye git"}
                          {!isEmpty && (
                            <svg
                              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          )}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
