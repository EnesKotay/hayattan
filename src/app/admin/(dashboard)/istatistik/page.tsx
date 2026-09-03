import Link from "next/link";
import { prisma, runInBatches } from "@/lib/db";
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

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
    map.set(day.toISOString().slice(0, 10), 0);
  }
  for (const createdAt of dates) {
    const key = new Date(createdAt).toISOString().slice(0, 10);
    if (map.has(key)) map.set(key, (map.get(key) ?? 0) + 1);
  }
  return Array.from(map.entries()).map(([key, value]) => {
    const date = new Date(`${key}T00:00:00`);
    const label = date.toLocaleDateString("tr-TR", { day: "2-digit", month: "short" });
    return { key, label, value };
  });
}

export default async function IstatistikPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/admin");

  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const prevThirtyStart = new Date(thirtyDaysAgo);
  prevThirtyStart.setDate(prevThirtyStart.getDate() - 30);

  const [
    totalPosts,
    _totalNews,
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
    postsLast7,
    viewsLast30,
    newsletterCount,
  ] = await runInBatches([
    () => prisma.yazi.count(),
    () => prisma.haber.count(),
    () => prisma.yazar.count({ where: { ayrilmis: false } }),
    () => prisma.kategori.count(),
    () => prisma.page.count(),
    () => prisma.yazi.count({ where: { publishedAt: { lte: now } } }),
    () => prisma.yazi.count({ where: { publishedAt: null } }),
    () => prisma.yazi.count({ where: { publishedAt: { gt: now } } }),
    () => prisma.haber.count({ where: { publishedAt: { lte: now } } }),
    () => prisma.haber.count({ where: { publishedAt: null } }),
    () => prisma.yazi.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    () => prisma.yazi.count({ where: { publishedAt: { gte: thirtyDaysAgo, lte: now } } }),
    () => prisma.haber.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    () => prisma.yazi.count({ where: { kategoriler: { none: {} } } }),
    () => prisma.yazi.aggregate({ _sum: { viewCount: true } }),
    () =>
      prisma.yazi.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true },
      }),
    () =>
      prisma.yazi.findMany({
        where: { publishedAt: { lte: now } },
        take: 10,
        orderBy: [{ viewCount: "desc" }, { publishedAt: "desc" }],
        select: {
          id: true, title: true, slug: true, viewCount: true,
          publishedAt: true,
          author: { select: { name: true } },
        },
      }),
    () =>
      prisma.yazar.findMany({
        where: { ayrilmis: false },
        select: {
          id: true, name: true, slug: true,
          yazilar: {
            where: { publishedAt: { lte: now } },
            select: { viewCount: true },
          },
        },
      }),
    () =>
      prisma.kategori.findMany({
        select: { id: true, name: true, _count: { select: { yazilar: true } } },
        orderBy: { yazilar: { _count: "desc" } },
        take: 10,
      }),
    () => prisma.yazi.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    () => prisma.yazi.aggregate({
      where: { publishedAt: { gte: thirtyDaysAgo, lte: now } },
      _sum: { viewCount: true },
    }),
    () => prisma.newsletterSubscriber.count({ where: { active: true } }),
  ]);

  const totalViews = viewsAggregate._sum.viewCount ?? 0;
  const avgViewsPerPublishedPost = publishedPosts > 0 ? Math.round(totalViews / publishedPosts) : 0;
  const publishRate = totalPosts > 0 ? Math.round((publishedPosts / totalPosts) * 100) : 0;
  const viewsLast30Val = viewsLast30._sum.viewCount ?? 0;

  const activity = buildLast30DaysActivity(latestPostsForActivity.map((item) => item.createdAt));
  const maxActivity = Math.max(1, ...activity.map((item) => item.value));
  const weeklyActivity = activity.slice(-7);
  const monthlyActivity = activity;

  const topAuthors = topAuthorsRaw
    .map((author) => ({
      id: author.id,
      name: author.name,
      slug: author.slug,
      postCount: author.yazilar.length,
      viewCount: author.yazilar.reduce((total, post) => total + post.viewCount, 0),
    }))
    .sort((a, b) => b.viewCount - a.viewCount || b.postCount - a.postCount)
    .slice(0, 8);

  const maxAuthorViews = Math.max(1, ...topAuthors.map((a) => a.viewCount));
  const maxCategoryCount = Math.max(1, ...categoryDistributionRaw.map((c) => c._count.yazilar));

  // Renk paleti için kategori renkleri
  const COLORS = ["#8b1538", "#c9335c", "#1a56db", "#059669", "#d97706", "#7c3aed", "#0284c7", "#be185d", "#16a34a", "#dc2626"];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <AdminBreadcrumbs />
        <div className="mt-2 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold text-gray-900">İstatistik Merkezi</h1>
            <p className="mt-1 text-gray-500">
              Son güncelleme:{" "}
              {new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>
      </div>

      {/* Ana Metrik Kartları */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Toplam Yazı",
            value: formatNumber(totalPosts),
            sub: `${formatNumber(publishedPosts)} yayın · ${formatNumber(draftPosts)} taslak${scheduledPosts > 0 ? ` · ${scheduledPosts} planlandı` : ""}`,
            icon: "📝",
            color: "from-blue-500 to-blue-600",
            lightBg: "bg-blue-50",
            textColor: "text-blue-600",
            badge: postsLast7 > 0 ? `+${postsLast7} bu hafta` : null,
          },
          {
            label: "Toplam Görüntülenme",
            value: formatNumber(totalViews),
            sub: `Yazı başına ort. ${formatNumber(avgViewsPerPublishedPost)}`,
            icon: "👁️",
            color: "from-emerald-500 to-emerald-600",
            lightBg: "bg-emerald-50",
            textColor: "text-emerald-600",
            badge: viewsLast30Val > 0 ? `${formatNumber(viewsLast30Val)} son 30 gün` : null,
          },
          {
            label: "Aktif Yazar",
            value: formatNumber(totalAuthors),
            sub: `${formatNumber(totalCategories)} kategori · ${formatNumber(totalPages)} özel sayfa`,
            icon: "✍️",
            color: "from-violet-500 to-violet-600",
            lightBg: "bg-violet-50",
            textColor: "text-violet-600",
            badge: null,
          },
          {
            label: "Yayınlanma Oranı",
            value: `%${publishRate}`,
            sub: `Bülten: ${formatNumber(newsletterCount)} abone`,
            icon: "📊",
            color: "from-amber-500 to-amber-600",
            lightBg: "bg-amber-50",
            textColor: "text-amber-600",
            badge: scheduledPosts > 0 ? `${scheduledPosts} planlandı` : null,
          },
        ].map((card) => (
          <article
            key={card.label}
            className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.color}`} />
            <div className="flex items-start justify-between gap-3">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-2xl ${card.lightBg}`}>
                {card.icon}
              </div>
              {card.badge && (
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${card.lightBg} ${card.textColor}`}>
                  {card.badge}
                </span>
              )}
            </div>
            <p className="mt-4 text-3xl font-extrabold text-gray-900 tabular-nums">{card.value}</p>
            <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-gray-500">{card.label}</p>
            <p className="mt-2 text-sm text-gray-500">{card.sub}</p>
          </article>
        ))}
      </div>

      {/* Son 30 Gün Özeti */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        {[
          { label: "Eklenen Yazı", value: postsLast30, icon: "📄", color: "text-blue-600 bg-blue-50" },
          { label: "Yayına Alınan", value: publishedLast30, icon: "✅", color: "text-green-600 bg-green-50" },
          { label: "Eklenen Haber", value: newsLast30, icon: "📰", color: "text-orange-600 bg-orange-50" },
          { label: "Yayındaki Haber", value: publishedNews, icon: "📡", color: "text-teal-600 bg-teal-50" },
          { label: "Taslak Haber", value: draftNews, icon: "📋", color: "text-gray-600 bg-gray-50" },
          { label: "Kategorisiz Yazı", value: uncategorizedPosts, icon: "⚠️", color: "text-red-600 bg-red-50" },
        ].map((item) => (
          <article
            key={item.label}
            className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
          >
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xl ${item.color.split(" ")[1]}`}>
              {item.icon}
            </div>
            <div>
              <p className="text-xs text-gray-500">{item.label}</p>
              <p className={`text-xl font-bold tabular-nums ${item.color.split(" ")[0]}`}>
                {formatNumber(item.value)}
              </p>
            </div>
          </article>
        ))}
      </div>

      {/* Grafikler */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Son 7 Gün Aktivite */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl font-semibold text-gray-900">Son 7 Günlük Aktivite</h2>
              <p className="mt-0.5 text-xs text-gray-500">Günlük yeni yazı sayısı</p>
            </div>
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
              Son 30 günden
            </span>
          </div>
          <div className="space-y-3">
            {weeklyActivity.map((day) => (
              <div key={day.key} className="flex items-center gap-3">
                <span className="w-16 shrink-0 text-xs text-gray-500">{day.label}</span>
                <div className="flex-1 overflow-hidden rounded-full bg-gray-100 h-3">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500"
                    style={{ width: `${Math.max(4, Math.round((day.value / maxActivity) * 100))}%` }}
                  />
                </div>
                <span className="w-6 shrink-0 text-right text-sm font-bold tabular-nums text-gray-900">
                  {day.value}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Kategori Dağılımı */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl font-semibold text-gray-900">Kategori Dağılımı</h2>
              <p className="mt-0.5 text-xs text-gray-500">Yazı sayısına göre sıralı</p>
            </div>
            <Link href="/admin/kategoriler" className="text-xs font-semibold text-primary hover:underline">
              Yönet →
            </Link>
          </div>
          {categoryDistributionRaw.length === 0 ? (
            <p className="text-sm text-gray-500">Kategori verisi bulunamadı.</p>
          ) : (
            <div className="space-y-3">
              {categoryDistributionRaw.map((category, index) => (
                <div key={category.id} className="flex items-center gap-3">
                  <div
                    className="w-2.5 h-2.5 shrink-0 rounded-sm"
                    style={{ background: COLORS[index % COLORS.length] }}
                  />
                  <span className="w-28 shrink-0 truncate text-xs text-gray-600">{category.name}</span>
                  <div className="flex-1 overflow-hidden rounded-full bg-gray-100 h-3">
                    <div
                      className="h-3 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(4, Math.round((category._count.yazilar / maxCategoryCount) * 100))}%`,
                        background: COLORS[index % COLORS.length],
                      }}
                    />
                  </div>
                  <span className="w-8 shrink-0 text-right text-sm font-bold tabular-nums text-gray-900">
                    {formatNumber(category._count.yazilar)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Son 30 Gün Aylık Aktivite Mini Grafiği */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-gray-900">30 Günlük Yazı Hareketi</h2>
          <span className="text-xs text-gray-500">Her sütun = 1 gün</span>
        </div>
        <div className="flex items-end gap-0.5 h-16">
          {monthlyActivity.map((day) => {
            const heightPct = maxActivity > 0 ? Math.max(4, Math.round((day.value / maxActivity) * 100)) : 4;
            return (
              <div key={day.key} className="group relative flex-1 flex flex-col items-center justify-end">
                <div
                  className="w-full rounded-t-sm bg-primary/70 hover:bg-primary transition-all cursor-pointer"
                  style={{ height: `${heightPct}%` }}
                  title={`${day.label}: ${day.value} yazı`}
                />
                {/* Tooltip */}
                {day.value > 0 && (
                  <div className="absolute bottom-full mb-1 hidden group-hover:block whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white shadow-lg z-10">
                    {day.label}: {day.value} yazı
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex justify-between text-xs text-gray-400">
          <span>30 gün önce</span>
          <span>Bugün</span>
        </div>
      </section>

      {/* En Çok Görüntülenen Yazılar */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-semibold text-gray-900">En Çok Görüntülenen Yazılar</h2>
            <p className="mt-0.5 text-xs text-gray-500">Tüm zamanların en popüler içerikleri</p>
          </div>
          <Link href="/admin/yazilar" className="text-xs font-semibold text-primary hover:underline">
            Tüm yazılar →
          </Link>
        </div>
        {topViewedPosts.length === 0 ? (
          <p className="text-sm text-gray-500">Yayınlanmış yazı bulunamadı.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-gray-400">
                  <th className="pb-3 pr-3">#</th>
                  <th className="pb-3 pr-3">Yazı</th>
                  <th className="pb-3 pr-3">Yazar</th>
                  <th className="pb-3 pr-3">Yayın Tarihi</th>
                  <th className="pb-3 text-right">Görüntülenme</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {topViewedPosts.map((post, index) => {
                  const maxViews = topViewedPosts[0].viewCount;
                  const pct = maxViews > 0 ? Math.round((post.viewCount / maxViews) * 100) : 0;
                  return (
                    <tr key={post.id} className="group hover:bg-gray-50 transition-colors">
                      <td className="py-3 pr-3">
                        <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${index < 3 ? "bg-primary text-white" : "bg-gray-100 text-gray-600"}`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-3 pr-3">
                        <Link
                          href={`/admin/yazilar/${post.id}`}
                          className="font-medium text-gray-900 hover:text-primary line-clamp-1"
                        >
                          {post.title}
                        </Link>
                        {/* Mini progress bar */}
                        <div className="mt-1.5 h-1 w-full max-w-xs overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-1 rounded-full bg-primary/40"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3 pr-3 text-gray-600 text-xs">{post.author.name}</td>
                      <td className="py-3 pr-3 text-gray-500 text-xs">{formatDate(post.publishedAt)}</td>
                      <td className="py-3 text-right">
                        <span className="font-bold tabular-nums text-gray-900">{formatNumber(post.viewCount)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* En Aktif Yazarlar */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-semibold text-gray-900">Yazar Performansı</h2>
            <p className="mt-0.5 text-xs text-gray-500">Toplam görüntülenmeye göre sıralı</p>
          </div>
          <Link href="/admin/yazarlar" className="text-xs font-semibold text-primary hover:underline">
            Yazarları yönet →
          </Link>
        </div>
        {topAuthors.length === 0 ? (
          <p className="text-sm text-gray-500">Yazar aktivite verisi bulunamadı.</p>
        ) : (
          <div className="space-y-3">
            {topAuthors.map((author, index) => (
              <div key={author.id} className="flex items-center gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {author.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-900 truncate">{author.name}</span>
                    <span className="shrink-0 text-xs text-gray-500">{formatNumber(author.postCount)} yazı</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(4, Math.round((author.viewCount / maxAuthorViews) * 100))}%`,
                        background: COLORS[index % COLORS.length],
                      }}
                    />
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <span className="text-sm font-bold tabular-nums text-gray-900">{formatNumber(author.viewCount)}</span>
                  <p className="text-xs text-gray-500">okunma</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
