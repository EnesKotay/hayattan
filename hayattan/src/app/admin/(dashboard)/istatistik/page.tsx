import Link from "next/link";
import { prisma } from "@/lib/db";
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";

type MetricCard = {
  label: string;
  value: string;
  description: string;
};

const numberFormatter = new Intl.NumberFormat("tr-TR");
const dateFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatNumber(value: number) {
  return numberFormatter.format(value);
}

function formatDate(value: Date | null) {
  if (!value) return "-";
  return dateFormatter.format(value);
}

function buildLast30DaysActivity(dates: Date[]) {
  const map = new Map<string, number>();

  for (let i = 29; i >= 0; i--) {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - i);
    const key = day.toISOString().slice(0, 10);
    map.set(key, 0);
  }

  for (const createdAt of dates) {
    const key = new Date(createdAt).toISOString().slice(0, 10);
    if (map.has(key)) {
      map.set(key, (map.get(key) ?? 0) + 1);
    }
  }

  return Array.from(map.entries()).map(([key, value]) => {
    const date = new Date(`${key}T00:00:00`);
    const label = date.toLocaleDateString("tr-TR", { day: "2-digit", month: "short" });
    return { key, label, value };
  });
}

export default async function IstatistikPage() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalPosts,
    totalNews,
    totalAuthors,
    totalCategories,
    totalPages,
    publishedPosts,
    draftPosts,
    scheduledPosts,
    publishedNews,
    draftNews,
    postsLast30,
    publishedLast30,
    newsLast30,
    uncategorizedPosts,
    viewsAggregate,
    latestPostsForActivity,
    topViewedPosts,
    topAuthorsRaw,
    categoryDistributionRaw,
  ] = await Promise.all([
    prisma.yazi.count(),
    prisma.haber.count(),
    prisma.yazar.count({ where: { ayrilmis: false } }),
    prisma.kategori.count(),
    prisma.page.count(),
    prisma.yazi.count({ where: { publishedAt: { lte: now } } }),
    prisma.yazi.count({ where: { publishedAt: null } }),
    prisma.yazi.count({ where: { publishedAt: { gt: now } } }),
    prisma.haber.count({ where: { publishedAt: { lte: now } } }),
    prisma.haber.count({ where: { publishedAt: null } }),
    prisma.yazi.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.yazi.count({ where: { publishedAt: { gte: thirtyDaysAgo, lte: now } } }),
    prisma.haber.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.yazi.count({ where: { kategoriler: { none: {} } } }),
    prisma.yazi.aggregate({ _sum: { viewCount: true } }),
    prisma.yazi.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
    }),
    prisma.yazi.findMany({
      where: { publishedAt: { lte: now } },
      take: 8,
      orderBy: [{ viewCount: "desc" }, { publishedAt: "desc" }],
      select: {
        id: true,
        title: true,
        slug: true,
        viewCount: true,
        publishedAt: true,
        author: { select: { name: true } },
      },
    }),
    prisma.yazar.findMany({
      where: { ayrilmis: false },
      select: {
        id: true,
        name: true,
        yazilar: {
          where: { publishedAt: { lte: now } },
          select: { viewCount: true },
        },
      },
    }),
    prisma.kategori.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: { yazilar: true },
        },
      },
    }),
  ]);

  const totalViews = viewsAggregate._sum.viewCount ?? 0;
  const avgViewsPerPublishedPost = publishedPosts > 0 ? Math.round(totalViews / publishedPosts) : 0;
  const publishRate = totalPosts > 0 ? Math.round((publishedPosts / totalPosts) * 100) : 0;

  const mainCards: MetricCard[] = [
    {
      label: "Toplam yazi",
      value: formatNumber(totalPosts),
      description: `${formatNumber(publishedPosts)} yayin, ${formatNumber(draftPosts)} taslak`,
    },
    {
      label: "Toplam goruntulenme",
      value: formatNumber(totalViews),
      description: `Yayin basina ortalama ${formatNumber(avgViewsPerPublishedPost)} goruntulenme`,
    },
    {
      label: "Aktif yazar",
      value: formatNumber(totalAuthors),
      description: `${formatNumber(totalCategories)} kategori, ${formatNumber(totalPages)} ozel sayfa`,
    },
    {
      label: "Yayinlanma orani",
      value: `%${publishRate}`,
      description: `Planli: ${formatNumber(scheduledPosts)} yazi`,
    },
  ];

  const last30Days = [
    { label: "Eklenen yazi", value: postsLast30 },
    { label: "Yayina alinan yazi", value: publishedLast30 },
    { label: "Eklenen manset haber", value: newsLast30 },
    { label: "Yayindaki haber", value: publishedNews },
    { label: "Taslak haber", value: draftNews },
    { label: "Kategorisiz yazi", value: uncategorizedPosts },
  ];

  const activity = buildLast30DaysActivity(latestPostsForActivity.map((item) => item.createdAt));
  const maxActivity = Math.max(1, ...activity.map((item) => item.value));
  const weeklyActivity = activity.slice(-7);

  const topAuthors = topAuthorsRaw
    .map((author) => {
      const postCount = author.yazilar.length;
      const viewCount = author.yazilar.reduce((total, post) => total + post.viewCount, 0);
      return {
        id: author.id,
        name: author.name,
        postCount,
        viewCount,
      };
    })
    .sort((a, b) => {
      if (b.postCount !== a.postCount) return b.postCount - a.postCount;
      return b.viewCount - a.viewCount;
    })
    .slice(0, 8);

  const categoryDistribution = [...categoryDistributionRaw]
    .sort((a, b) => b._count.yazilar - a._count.yazilar)
    .slice(0, 8);

  const maxCategoryCount = Math.max(1, ...categoryDistribution.map((item) => item._count.yazilar));

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <AdminBreadcrumbs />
        <h1 className="mt-2 font-serif text-3xl font-bold text-gray-900">Istatistik Merkezi</h1>
        <p className="text-gray-500">Icerik ekibinin yukunu azaltacak metrikler ve hizli aksiyon alani. Son guncelleme: Vercel deploy tetigi.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {mainCards.map((card) => (
          <article key={card.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{card.value}</p>
            <p className="mt-1 text-sm text-gray-500">{card.description}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {last30Days.map((item) => (
          <article key={item.label} className="rounded-xl border border-gray-100 bg-white p-4">
            <p className="text-sm text-gray-500">{item.label}</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{formatNumber(item.value)}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-xl font-semibold text-gray-900">Son 7 gunluk yazi hareketi</h2>
            <span className="text-xs font-medium text-gray-500">Son 30 gun bazindan</span>
          </div>
          <div className="space-y-3">
            {weeklyActivity.map((day) => (
              <div key={day.key}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-gray-600">{day.label}</span>
                  <span className="font-semibold text-gray-900">{day.value}</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full bg-blue-500"
                    style={{ width: `${Math.max(8, Math.round((day.value / maxActivity) * 100))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-xl font-semibold text-gray-900">Kategori dagilimi</h2>
            <Link href="/admin/kategoriler" className="text-sm font-medium text-primary hover:underline">
              Kategorileri yonet
            </Link>
          </div>

          {categoryDistribution.length === 0 ? (
            <p className="text-sm text-gray-500">Kategori verisi bulunamadi.</p>
          ) : (
            <div className="space-y-3">
              {categoryDistribution.map((category) => (
                <div key={category.id}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-gray-700">{category.name}</span>
                    <span className="font-medium text-gray-900">{formatNumber(category._count.yazilar)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-emerald-500"
                      style={{
                        width: `${Math.max(8, Math.round((category._count.yazilar / maxCategoryCount) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-gray-900">En cok goruntulenen yazilar</h2>
          <Link href="/admin/yazilar" className="text-sm font-medium text-primary hover:underline">
            Tum yazilar
          </Link>
        </div>

        {topViewedPosts.length === 0 ? (
          <p className="text-sm text-gray-500">Yayinlanmis yazi bulunamadi.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="pb-3 pr-3">Yazi</th>
                  <th className="pb-3 pr-3">Yazar</th>
                  <th className="pb-3 pr-3">Yayin tarihi</th>
                  <th className="pb-3 text-right">Goruntulenme</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topViewedPosts.map((post) => (
                  <tr key={post.id}>
                    <td className="py-3 pr-3">
                      <Link href={`/admin/yazilar/${post.id}`} className="font-medium text-gray-900 hover:text-primary">
                        {post.title}
                      </Link>
                      <div className="text-xs text-gray-500">/{post.slug}</div>
                    </td>
                    <td className="py-3 pr-3 text-gray-700">{post.author.name}</td>
                    <td className="py-3 pr-3 text-gray-700">{formatDate(post.publishedAt)}</td>
                    <td className="py-3 text-right font-semibold text-gray-900">{formatNumber(post.viewCount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-gray-900">En aktif yazarlar</h2>
          <Link href="/admin/yazarlar" className="text-sm font-medium text-primary hover:underline">
            Yazarlari yonet
          </Link>
        </div>

        {topAuthors.length === 0 ? (
          <p className="text-sm text-gray-500">Yazar aktivite verisi bulunamadi.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="pb-3 pr-3">Yazar</th>
                  <th className="pb-3 pr-3">Yayindaki yazi</th>
                  <th className="pb-3 text-right">Toplam goruntulenme</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topAuthors.map((author) => (
                  <tr key={author.id}>
                    <td className="py-3 pr-3 font-medium text-gray-900">{author.name}</td>
                    <td className="py-3 pr-3 text-gray-700">{formatNumber(author.postCount)}</td>
                    <td className="py-3 text-right font-semibold text-gray-900">{formatNumber(author.viewCount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

